import asyncio
import time
from pathlib import Path
from typing import Dict, Optional, cast, Union, Tuple
from uuid import uuid4

from loguru import logger

from engine_utils.directory_info import DirectoryInfo
from fastapi.responses import JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
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
from service.rtc_service.rtc_stream import RtcStream


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
        # 文字延迟配置
        self.human_text_delay: float = 0.75  # 用户输入文字延迟
        self.avatar_text_delay: float = 2.0 # LLM生成文字延迟
        self.tracking_speech_id: str | None = None  # 当前推流的speech_id（仅用于日志）

    # ===== 辅助方法：判断数据是否为有效业务数据 =====
    def _is_business_data(self, modality: EngineChannelType, data: Union[np.ndarray, str, DataBundle]) -> bool:
        """
        判断是否为有效业务数据（过滤心跳/空数据）
        :param modality: 数据通道类型
        :param data: 数据内容
        :return: True=有效业务数据，False=心跳/空数据
        """
        # 1. 文本数据：非空字符串才是有效数据
        if modality == EngineChannelType.TEXT:
            if isinstance(data, str):
                return len(data.strip()) > 0
            elif isinstance(data, DataBundle):
                text = data.get_main_data()
                return isinstance(text, str) and len(text.strip()) > 0
            return False
        
        # 2. 音频数据：非全零数组才是有效数据
        elif modality == EngineChannelType.AUDIO:
            if isinstance(data, np.ndarray):
                return np.any(data != 0)  # 不是全零音频帧
            return False
        
        # 3. 视频数据：简单判断
        elif modality == EngineChannelType.VIDEO:
            if isinstance(data, np.ndarray):
                return data.size > 0 and np.any(data != 0)  # 非空且非全零视频帧
            return False
        
        # 其他类型默认视为无效数据
        return False

    # ===== 核心打断逻辑：仅基于interrupt_flag=True触发打断 =====
    def _is_interrupted(self, speech_id: str = None) -> bool:
        """
        中断判断逻辑：
        1. shared_states为空 → 不中断
        2. 仅当interrupt_flag=True（ASR检测到唤醒词）→ 中断
        3. 所有speech_id变化均不触发中断
        """
        # 1. 读取SharedStates
        shared = self.shared_states
        if shared is None:
            logger.warning("[RTC中断判断] shared_states为空，无法判断中断")
            return False
        
        # 2. 仅读取interrupt_flag，忽略所有speech_id相关判断
        interrupt_flag = getattr(shared, 'interrupt_flag', False)
        
        # 3. 唯一中断条件：interrupt_flag=True（唤醒词触发）
        if interrupt_flag:
            logger.warning(f"[RTC中断触发] 唤醒词触发interrupt_flag=True（唯一打断条件）")
            return True
        
        return False

    # ===== 核心打断处理：清空数据队列并重置状态 =====
    def _handle_interrupt(self):
        """清空旧数据队列，更新跟踪的speech_id，重置中断标志"""
        if not self.shared_states:
            return
        
        # 唤醒词触发中断时执行清空逻辑
        logger.warning("[RTC中断处理] 唤醒词触发全局打断，清空旧推流队列")
        self.clear_data()
        
        # 更新跟踪的speech_id为最新值
        new_speech_id = getattr(self.shared_states, 'current_speech_id', None)
        self.tracking_speech_id = new_speech_id
        
        # 重置全局中断标志（避免重复触发）
        if hasattr(self.shared_states, 'interrupt_flag'):
            self.shared_states.interrupt_flag = False
        
        logger.info(f"[RTC中断处理] 已切换到新speech_id：{new_speech_id}")

    # ===== 核心方法：获取数据 =====
    async def get_data(self, modality: EngineChannelType, timeout: Optional[float] = 0.1) -> Optional[ChatData]:
        # 检查是否被唤醒词打断
        if self._is_interrupted():
            self._handle_interrupt()
            return None  # 返回None，停止向客户端推送旧数据
        
        # 从队列获取数据
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
        
        # 检查数据是否被唤醒词打断
        if data and data.data and data.data.get_meta("speech_id"):
            speech_id = data.data.get_meta("speech_id")
            if self._is_interrupted(speech_id):
                self._handle_interrupt()
                return None
        
        # 应用文字延迟
        if modality == EngineChannelType.TEXT and data is not None:
            if data.type == ChatDataType.HUMAN_TEXT:
                await asyncio.sleep(self.human_text_delay)
            elif data.type == ChatDataType.AVATAR_TEXT:
                await asyncio.sleep(self.avatar_text_delay)
        
        return data

    # ===== 核心方法：提交数据 =====
    def put_data(self, modality: EngineChannelType, data: Union[np.ndarray, str],
                 timestamp: Optional[Tuple[int, int]] = None, samplerate: Optional[int] = None, loopback: bool = False):
        # 检查是否被唤醒词打断
        speech_id = None
        if isinstance(data, DataBundle):
            speech_id = data.get_meta("speech_id")
        elif modality == EngineChannelType.TEXT:
            # 文本数据临时生成speech_id
            speech_id = str(uuid4())
        
        # 仅唤醒词触发中断时才拒绝数据入队
        if self._is_interrupted(speech_id):
            logger.info(f"[RTC数据过滤] 唤醒词触发打断，拒绝所有数据入队：{speech_id}")
            return
        
        # 数据处理逻辑
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

    # ===== 清空数据队列 =====
    def clear_data(self):
        logger.info(f"[RTC清空数据] 开始清空队列：AUDIO={self.output_queues[EngineChannelType.AUDIO].qsize()}, VIDEO={self.output_queues[EngineChannelType.VIDEO].qsize()}, TEXT={self.output_queues[EngineChannelType.TEXT].qsize()}")
        for data_queue in self.output_queues.values():
            while not data_queue.empty():
                data_queue.get_nowait()
        logger.info("[RTC清空数据] 队列已清空完成")


class ClientRtcConfigModel(HandlerBaseConfigModel, BaseModel):
    connection_ttl: int = Field(default=900)
    turn_config: Optional[Dict] = Field(default=None)
    # 文字延迟配置
    human_text_delay: float = Field(default=0.5, description="用户输入文字呈现延迟（秒）")
    avatar_text_delay: float = Field(default=0.5, description="LLM生成文字呈现延迟（秒）")


class ClientRtcContext(HandlerContext):
    def __init__(self, session_id: str):
        super().__init__(session_id)
        self.config: Optional[ClientRtcConfigModel] = None
        self.client_session_delegate: Optional[RtcClientSessionDelegate] = None


class ClientHandlerRtc(ClientHandlerBase):
    def __init__(self):
        super().__init__()
        self.engine_config = None
        self.handler_config = None
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
            1,
            16000,
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

        frontend_path = Path(DirectoryInfo.get_src_dir() + '/handlers/client/rtc_client/frontend/dist')
        if frontend_path.exists():
            logger.info(f"Serving frontend from {frontend_path}")
            fastapi.mount('/ui', StaticFiles(directory=frontend_path), name="static")
            fastapi.add_route('/', RedirectResponse(url='/ui/index.html'))
        else:
            logger.warning(f"Frontend directory {frontend_path} does not exist")
            fastapi.add_route('/', RedirectResponse(url='/gradio'))

        if parent_block is None:
            parent_block = ui
        with ui:
            with parent_block:
                gradio.components.HTML(
                    """
                    <h1 id="JYD-数字老师">
                       The Gradio page is no longer available. Please use the openavatarchat-webui submodule instead.
                    </h1>
                    """,
                    visible=True
                )

    def on_setup_app(self, app: FastAPI, ui: gradio.blocks.Block, parent_block: Optional[gradio.blocks.Block] = None):
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
        
        # 注入SharedStates（用于读取interrupt_flag）
        session_delegate.shared_states = session_context.shared_states
        
        # 初始化tracking_speech_id（仅用于日志）
        if session_delegate.shared_states:
            session_delegate.tracking_speech_id = getattr(session_delegate.shared_states, 'current_speech_id', None)
            logger.info(f"[RTC初始化] 绑定初始speech_id：{session_delegate.tracking_speech_id}")
        
        # 注入文字延迟配置
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

    # ===== 核心处理：数据入队 =====
    def handle(self, context: HandlerContext, inputs: ChatData,
               output_definitions: Dict[ChatDataType, HandlerDataInfo]):
        context = cast(ClientRtcContext, context)
        if context.client_session_delegate is None:
            return
        
        # 检查是否被唤醒词打断
        delegate = context.client_session_delegate
        speech_id = inputs.data.get_meta("speech_id") if inputs.data else None
        
        # 仅唤醒词触发中断时才拒绝数据入队
        if delegate._is_interrupted(speech_id):
            logger.info(f"[RTC入队过滤] 唤醒词触发打断，拒绝数据入队：{speech_id}")
            return

        # 数据入队逻辑
        data_queue = delegate.output_queues.get(inputs.type.channel_type)
        if data_queue is not None:
            data_queue.put_nowait(inputs)

    def destroy_context(self, context: HandlerContext):
        # 销毁上下文时清空数据
        if context.client_session_delegate:
            context.client_session_delegate.clear_data()