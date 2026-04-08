import asyncio
import time
from pathlib import Path
from typing import Dict, Optional, cast, Union, Tuple
from uuid import uuid4

from loguru import logger

from engine_utils.directory_info import DirectoryInfo
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import gradio
import numpy as np
from fastapi import FastAPI
# noinspection PyPackageRequirements
from fastrtc import Stream

from pydantic import BaseModel, Field

from chat_engine.common.client_handler_base import ClientHandlerBase, ClientSessionDelegate
from chat_engine.common.engine_channel_type import EngineChannelType
from chat_engine.common.handler_base import HandlerDataInfo, HandlerDetail, HandlerBaseInfo
from chat_engine.contexts.handler_context import HandlerContext
from chat_engine.contexts.session_context import SessionContext
from chat_engine.data_models.chat_data.chat_data_model import ChatData
from chat_engine.data_models.chat_data_type import ChatDataType
from chat_engine.data_models.chat_engine_config_data import HandlerBaseConfigModel, ChatEngineConfigModel
from chat_engine.data_models.chat_signal import ChatSignal
from chat_engine.data_models.runtime_data.data_bundle import DataBundleDefinition, DataBundleEntry, VariableSize, \
    DataBundle
from service.rtc_service.rtc_provider import RTCProvider
from service.rtc_service.rtc_stream_xiaoyu import RtcStream


class RtcClientSessionDelegate(ClientSessionDelegate):
    def __init__(self):
        self.timestamp_generator = None
        self.data_submitter = None
        self.shared_states = None
        self.output_queues = {
            EngineChannelType.AUDIO: asyncio.Queue(),
            EngineChannelType.VIDEO: asyncio.Queue(),
            EngineChannelType.TEXT: asyncio.Queue(),
        }
        self.input_data_definitions: Dict[EngineChannelType, DataBundleDefinition] = {}
        self.modality_mapping = {
            EngineChannelType.AUDIO: ChatDataType.MIC_AUDIO,
            EngineChannelType.VIDEO: ChatDataType.CAMERA_VIDEO,
            EngineChannelType.TEXT: ChatDataType.HUMAN_TEXT,
        }
        self.human_text_delay: float = 0.0
        self.avatar_text_delay: float = 0.0
        self.tracking_speech_id: str | None = None

    def _is_business_data(self, modality: EngineChannelType, data: Union[np.ndarray, str, DataBundle]) -> bool:
        if modality == EngineChannelType.TEXT:
            if isinstance(data, str):
                return len(data.strip()) > 0
            elif isinstance(data, DataBundle):
                text = data.get_main_data()
                return isinstance(text, str) and len(text.strip()) > 0
            return False
        elif modality == EngineChannelType.AUDIO:
            if isinstance(data, np.ndarray):
                return np.any(data != 0)
            return False
        elif modality == EngineChannelType.VIDEO:
            if isinstance(data, np.ndarray):
                return data.size > 0 and np.any(data != 0)
            return False
        return False

    def _is_interrupted(self, speech_id: str = None) -> bool:
        shared = self.shared_states
        if shared is None:
            logger.warning("[RTC中断判断] shared_states为空，无法判断中断")
            return False
        interrupt_flag = getattr(shared, 'interrupt_flag', False)
        if interrupt_flag:
            logger.warning(f"[RTC中断触发] 唤醒词触发interrupt_flag=True（唯一打断条件）")
            self.last_avatar_text_push_time = 0 if hasattr(self, 'last_avatar_text_push_time') else 0
            return True
        return False

    def _handle_interrupt(self):
        if not self.shared_states:
            return
        logger.warning("[RTC中断处理] 唤醒词触发全局打断，清空旧推流队列")
        self.clear_data()
        new_speech_id = getattr(self.shared_states, 'current_speech_id', None)
        if new_speech_id:
            self.tracking_speech_id = new_speech_id
            logger.info(f"[RTC中断处理] 更新tracking_speech_id为：{new_speech_id}")
        if hasattr(self.shared_states, 'interrupt_flag'):
            self.shared_states.interrupt_flag = False
            logger.info("[RTC中断处理] 重置interrupt_flag=False")

    def clear_data(self):
        for queue in self.output_queues.values():
            while not queue.empty():
                try:
                    queue.get_nowait()
                except asyncio.QueueEmpty:
                    break

    async def get_data(self, modality: EngineChannelType, timeout: Optional[float] = 0.1) -> Optional[ChatData]:
        if self._is_interrupted():
            self._handle_interrupt()
            return None

        data_queue = self.output_queues.get(modality)
        if data_queue is None:
            return None

        try:
            if timeout is not None and timeout > 0:
                data = await asyncio.wait_for(data_queue.get(), timeout)
            else:
                data = await data_queue.get()
        except asyncio.TimeoutError:
            return None

        if data and data.data and data.data.get_meta("speech_id"):
            speech_id = data.data.get_meta("speech_id")
            if self._is_interrupted(speech_id):
                self._handle_interrupt()
                return None

        if modality == EngineChannelType.TEXT and data is not None:
            if data.type == ChatDataType.HUMAN_TEXT:
                await asyncio.sleep(self.human_text_delay)
            elif data.type == ChatDataType.AVATAR_TEXT:
                await asyncio.sleep(self.avatar_text_delay)

        return data

    def put_data(self, modality: EngineChannelType, data: Union[np.ndarray, str],
                 timestamp: Optional[Tuple[int, int]] = None, samplerate: Optional[int] = None,
                 loopback: bool = False):
        speech_id = None
        if isinstance(data, DataBundle):
            speech_id = data.get_meta("speech_id")
        elif modality == EngineChannelType.TEXT:
            speech_id = str(uuid4())

        if self._is_interrupted(speech_id):
            logger.info(f"[RTC数据过滤] 唤醒词触发打断，拒绝所有数据入队：{speech_id}")
            return

        if timestamp is None:
            timestamp = self.get_timestamp()
        if self.data_submitter is None:
            return
        definition = self.input_data_definitions.get(modality)
        chat_data_type = self.modality_mapping.get(modality)
        if chat_data_type is None or definition is None:
            return
        data_bundle = DataBundle(definition)
        if modality == EngineChannelType.AUDIO:
            data_bundle.set_main_data(data.squeeze()[np.newaxis, ...])
        elif modality == EngineChannelType.VIDEO:
            data_bundle.set_main_data(data[np.newaxis, ...])
        elif modality == EngineChannelType.TEXT:
            data_bundle.add_meta('human_text_end', True)
            data_bundle.add_meta('speech_id', speech_id or str(uuid4()))
            data_bundle.set_main_data(data)
        else:
            return
        chat_data = ChatData(
            source="client",
            type=chat_data_type,
            data=data_bundle,
            timestamp=timestamp,
        )
        self.data_submitter.submit(chat_data)
        if loopback:
            self.output_queues[modality].put_nowait(chat_data)

    def get_timestamp(self):
        return self.timestamp_generator()

    def emit_signal(self, signal: ChatSignal):
        pass


class ClientRtcConfigModel(HandlerBaseConfigModel):
    concurrent_limit: int = Field(default=1)
    connection_ttl: int = Field(default=600)
    turn_config: Optional[Dict] = Field(default=None)
    human_text_delay: float = Field(default=0.1, description="用户输入文字呈现延迟（秒）")
    avatar_text_delay: float = Field(default=0, description="LLM生成文字呈现延迟（秒）")


class ClientRtcContext(HandlerContext):
    def __init__(self, session_id: str):
        super().__init__(session_id)
        self.config: ClientRtcConfigModel = ClientRtcConfigModel()
        self.client_session_delegate: Optional[RtcClientSessionDelegate] = None
        self.data_submitter = None


class ClientHandlerRtc(ClientHandlerBase):
    def __init__(self):
        super().__init__()
        self.handler_config: Optional[ClientRtcConfigModel] = None
        self.engine_config: Optional[ChatEngineConfigModel] = None
        self.rtc_streamer_factory: Optional[RtcStream] = None
        self.output_bundle_definitions: Dict[EngineChannelType, DataBundleDefinition] = {}

    def get_handler_info(self) -> HandlerBaseInfo:
        return HandlerBaseInfo(
            config_model=ClientRtcConfigModel,
            client_session_delegate_class=RtcClientSessionDelegate,
        )

    def prepare_rtc_definitions(self):
        self.rtc_streamer_factory = RtcStream(
            session_id=None,
            expected_layout="mono",
            input_sample_rate=16000,
            output_sample_rate=24000,
            output_frame_size=480,
            fps=30,
            stream_start_delay=0.5,
        )
        self.rtc_streamer_factory.client_handler_delegate = self.handler_delegate

        audio_output_definition = DataBundleDefinition()
        audio_output_definition.add_entry(DataBundleEntry.create_audio_entry(
            "mic_audio",
            channel_num=1,
            sample_rate=16000
        ))
        audio_output_definition.lockdown()
        self.output_bundle_definitions[EngineChannelType.AUDIO] = audio_output_definition

        video_output_definition = DataBundleDefinition()
        video_output_definition.add_entry(DataBundleEntry.create_framed_entry(
            "camera_video",
            [VariableSize(), VariableSize(), VariableSize(), 3],
            0,
            30
        ))
        video_output_definition.lockdown()
        self.output_bundle_definitions[EngineChannelType.VIDEO] = video_output_definition

        text_output_definition = DataBundleDefinition()
        text_output_definition.add_entry(DataBundleEntry.create_text_entry(
            "human_text",
        ))
        text_output_definition.lockdown()
        self.output_bundle_definitions[EngineChannelType.TEXT] = text_output_definition

    def load(self, engine_config: ChatEngineConfigModel, handler_config: Optional[HandlerBaseConfigModel] = None):
        self.engine_config = engine_config
        self.handler_config = cast(ClientRtcConfigModel, handler_config)
        self.prepare_rtc_definitions()

    def setup_rtc_ui(self, ui, parent_block, fastapi: FastAPI, avatar_config):
        turn_entity = RTCProvider().prepare_rtc_configuration(self.handler_config.turn_config)
        if turn_entity is None:
            turn_entity = RTCProvider().prepare_rtc_configuration(self.engine_config.turn_config)

        webrtc = Stream(
            modality="audio-video",
            mode="send-receive",
            time_limit=self.handler_config.connection_ttl,
            rtc_configuration=turn_entity.rtc_configuration if turn_entity is not None else None,
            handler=self.rtc_streamer_factory,
            concurrency_limit=self.handler_config.concurrent_limit,
        )
        webrtc.mount(fastapi)

        @fastapi.get('/openavatarchat/initconfig')
        async def init_config():
            config = {
                "avatar_config": avatar_config,
                "rtc_configuration": turn_entity.rtc_configuration if turn_entity is not None else None,
            }
            return JSONResponse(status_code=200, content=config)

        # ===== 移除前端静态文件挂载，实现前后端分离 =====
        # 原代码中的 fastapi.mount('/ui', ...) 已删除
        # 前端应独立部署或通过其他Web服务器提供
        logger.info("[前后端分离] 后端不再挂载前端静态文件，前端需独立部署")

        if parent_block is None:
            parent_block = ui
        with ui:
            with parent_block:
                gradio.components.HTML(
                    """
                    <h1 id="JYD-数字老师">
                       后端API服务已启动，前端请独立部署访问
                    </h1>
                    """,
                    visible=True
                )

    def on_setup_app(self, app: FastAPI, ui: gradio.blocks.Block, parent_block: Optional[gradio.blocks.Block] = None):
        # ===== 添加 CORS 中间件支持前后端分离（必须在最开始）=====
        app.add_middleware(
            CORSMiddleware,
            allow_origins=["*"],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )
        logger.info("[CORS] 已启用跨域支持，允许前后端分离部署")

        avatar_config = {}
        self.setup_rtc_ui(ui, parent_block, app, avatar_config)

    def create_context(self, session_context: SessionContext,
                       handler_config: Optional[HandlerBaseConfigModel] = None) -> HandlerContext:
        if not isinstance(handler_config, ClientRtcConfigModel):
            handler_config = ClientRtcConfigModel()
        context = ClientRtcContext(session_context.session_info.session_id)
        context.config = handler_config
        return context

    def start_context(self, session_context: SessionContext, handler_context: HandlerContext):
        pass

    def on_setup_session_delegate(self, session_context: SessionContext, handler_context: HandlerContext,
                                  session_delegate: ClientSessionDelegate):
        handler_context = cast(ClientRtcContext, handler_context)
        session_delegate = cast(RtcClientSessionDelegate, session_delegate)

        session_delegate.timestamp_generator = session_context.get_timestamp
        session_delegate.data_submitter = handler_context.data_submitter
        session_delegate.input_data_definitions = self.output_bundle_definitions
        session_delegate.shared_states = session_context.shared_states
        if session_delegate.shared_states:
            session_delegate.tracking_speech_id = getattr(session_delegate.shared_states, 'current_speech_id', None)
            logger.info(f"[RTC初始化] 绑定初始speech_id：{session_delegate.tracking_speech_id}（仅日志）")

        session_delegate.human_text_delay = handler_context.config.human_text_delay
        session_delegate.avatar_text_delay = handler_context.config.avatar_text_delay

        handler_context.client_session_delegate = session_delegate

    def create_handler_detail(self, _session_context, _handler_context):
        inputs = {
            ChatDataType.AVATAR_AUDIO: HandlerDataInfo(
                type=ChatDataType.AVATAR_AUDIO
            ),
            ChatDataType.AVATAR_VIDEO: HandlerDataInfo(
                type=ChatDataType.AVATAR_VIDEO
            ),
            ChatDataType.AVATAR_TEXT: HandlerDataInfo(
                type=ChatDataType.AVATAR_TEXT
            ),
            ChatDataType.HUMAN_TEXT: HandlerDataInfo(
                type=ChatDataType.HUMAN_TEXT
            ),
        }
        outputs = {
            ChatDataType.MIC_AUDIO: HandlerDataInfo(
                type=ChatDataType.MIC_AUDIO,
                definition=self.output_bundle_definitions[EngineChannelType.AUDIO]
            ),
            ChatDataType.CAMERA_VIDEO: HandlerDataInfo(
                type=ChatDataType.CAMERA_VIDEO,
                definition=self.output_bundle_definitions[EngineChannelType.VIDEO]
            ),
            ChatDataType.HUMAN_TEXT: HandlerDataInfo(
                type=ChatDataType.HUMAN_TEXT,
                definition=self.output_bundle_definitions[EngineChannelType.TEXT]
            ),
        }
        return HandlerDetail(
            inputs=inputs,
            outputs=outputs
        )

    def get_handler_detail(self, session_context: SessionContext, context: HandlerContext) -> HandlerDetail:
        return self.create_handler_detail(session_context, context)

    def handle(self, context: HandlerContext, inputs: ChatData,
               output_definitions: Dict[ChatDataType, HandlerDataInfo]):
        context = cast(ClientRtcContext, context)
        if context.client_session_delegate is None:
            return

        if inputs.type == ChatDataType.AVATAR_TEXT and inputs.data:
            avatar_text = inputs.data.get_main_data() if inputs.data else ""

        delegate = context.client_session_delegate
        speech_id = inputs.data.get_meta("speech_id") if inputs.data else None
        if delegate._is_interrupted(speech_id):
            logger.info(f"[RTC入队过滤] 唤醒词触发打断，拒绝数据入队：{speech_id}")
            return

        data_queue = delegate.output_queues.get(inputs.type.channel_type)
        if data_queue is not None:
            data_queue.put_nowait(inputs)

    def destroy_context(self, context: HandlerContext):
        pass
