import re
import time
from typing import Optional, Tuple
from loguru import logger
import numpy as np
from pydantic import BaseModel, Field
import requests
import uuid

from chat_engine.contexts.handler_context import HandlerContext
from chat_engine.data_models.chat_engine_config_data import ChatEngineConfigModel, HandlerBaseConfigModel
from chat_engine.common.handler_base import HandlerBase, HandlerBaseInfo, HandlerDataInfo, HandlerDetail
from chat_engine.data_models.chat_data.chat_data_model import ChatData
from chat_engine.data_models.chat_data_type import ChatDataType
from chat_engine.data_models.runtime_data.data_bundle import DataBundle, DataBundleDefinition, DataBundleEntry
from chat_engine.contexts.session_context import SessionContext
from engine_utils.general_slicer import SliceContext, slice_data


class Qwen3ASRConfig(HandlerBaseConfigModel, BaseModel):
    server_url: str = Field(default="http://localhost:9008")
    wakeup_words_pattern: str = Field(
        default=r"^((你)?好\s*[，,]?\s*(小达|小的|小德|小岛|小当|小唐|小打)|(等一下|停一下|暂停|别说了|打住|一下|等一下|停一下|闭嘴|stop|shut up))"
    )


class Qwen3ASRContext(HandlerContext):
    def __init__(self, session_id: str):
        super().__init__(session_id)
        self.config = None
        self.local_session_id = 0
        self.audio_slice_context = SliceContext.create_numpy_slice_context(
            slice_size=16000,
            slice_axis=0,
        )
        self.shared_states = None
        self.qwen_session_id = None
        self.output_audios = []
        self.asr_start_time = None


class Handler(HandlerBase):
    def __init__(self):
        super().__init__()
        self.server_url = "http://localhost:9008"
        self.wakeup_pattern = None

    def get_handler_info(self) -> HandlerBaseInfo:
        return HandlerBaseInfo(
            name="Qwen3ASR",
            config_model=Qwen3ASRConfig,
        )

    def get_handler_detail(self, session_context: SessionContext,
                           context: HandlerContext) -> HandlerDetail:
        definition = DataBundleDefinition()
        definition.add_entry(
            DataBundleEntry.create_text_entry("human_text")
        )

        inputs = {
            ChatDataType.HUMAN_AUDIO: HandlerDataInfo(
                type=ChatDataType.HUMAN_AUDIO,
            )
        }
        outputs = {
            ChatDataType.HUMAN_TEXT: HandlerDataInfo(
                type=ChatDataType.HUMAN_TEXT,
                definition=definition,
            )
        }
        return HandlerDetail(inputs=inputs, outputs=outputs)

    def load(self, engine_config: ChatEngineConfigModel,
             handler_config: Optional[BaseModel] = None):
        if isinstance(handler_config, Qwen3ASRConfig):
            self.server_url = handler_config.server_url
            self.wakeup_pattern = re.compile(handler_config.wakeup_words_pattern, re.IGNORECASE)

        if self.wakeup_pattern is None:
            self.wakeup_pattern = re.compile(r"^(你)?好\s*[，,]?\s*(|小达|小的|小德)", re.IGNORECASE)

        logger.info(f"[Qwen3ASR] Handler loaded, server: {self.server_url}")

    def create_context(self, session_context, handler_config=None):
        if not isinstance(handler_config, Qwen3ASRConfig):
            handler_config = Qwen3ASRConfig()
        context = Qwen3ASRContext(session_context.session_info.session_id)
        context.shared_states = session_context.shared_states
        logger.info(f"[Qwen3ASR] Context created | Session: {context.session_id}")
        return context

    def start_context(self, session_context, handler_context):
        pass

    def _replace_human_text(self, text: str) -> str:
        if not isinstance(text, str) or not text:
            return text
        replace_mapping = {
            "小德": "小达",
            "小岛": "小达",
            "小当": "小达",
            "小唐": "小达",
            "小打": "小达",
            "敬业达": "竞业达"
        }
        for old, new in replace_mapping.items():
            if old in text:
                text = text.replace(old, new)
                logger.info(f"[Qwen3ASR] Text replaced: {old} → {new}")
        return text

    def _is_wakeup_word(self, text: str) -> Tuple[bool, str]:
        if not text:
            return False, ""
        match = self.wakeup_pattern.search(text)
        if match:
            matched_text = match.group(0)
            logger.info(f"[Qwen3ASR] Wakeup word detected: {matched_text}")
            return True, matched_text
        return False, ""

    def _update_interrupt_state(self, context: Qwen3ASRContext, speech_id: str):
        if context.shared_states is None:
            return
        context.shared_states.interrupt_flag = True
        context.shared_states.tts_interrupt_flag = True
        context.shared_states.avatar_interrupt_flag = True
        context.shared_states.llm_interrupt_flag = True
        context.shared_states.current_speech_id = speech_id
        logger.info(f"[Qwen3ASR] Interrupt triggered | Speech: {speech_id}")

    def _update_normal_state(self, context: Qwen3ASRContext, speech_id: str):
        if context.shared_states is None:
            return
        context.shared_states.interrupt_flag = False
        context.shared_states.tts_interrupt_flag = False
        context.shared_states.avatar_interrupt_flag = False
        context.shared_states.llm_interrupt_flag = False
        context.shared_states.current_speech_id = speech_id

    def _start_session(self) -> str:
        try:
            resp = requests.post(f"{self.server_url}/api/start", timeout=5)
            resp.raise_for_status()
            return resp.json()["session_id"]
        except Exception as e:
            logger.error(f"[Qwen3ASR] Failed to start session: {e}")
            raise

    def _send_chunk(self, session_id: str, audio_chunk: np.ndarray) -> dict:
        try:
            resp = requests.post(
                f"{self.server_url}/api/chunk?session_id={session_id}",
                data=audio_chunk.tobytes(),
                headers={"Content-Type": "application/octet-stream"},
                timeout=5
            )
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            logger.error(f"[Qwen3ASR] Failed to send chunk: {e}")
            return {"text": "", "language": ""}

    def _finish_session(self, session_id: str) -> dict:
        try:
            resp = requests.post(f"{self.server_url}/api/finish?session_id={session_id}", timeout=5)
            resp.raise_for_status()
            return resp.json()
        except Exception as e:
            logger.error(f"[Qwen3ASR] Failed to finish session: {e}")
            return {"text": "", "language": ""}

    def _is_interrupted(self, context: Qwen3ASRContext, speech_id: str) -> bool:
        """检查是否被中断（仅avatar_mode=running+interrupt_flag=True时返回True）"""
        if context.shared_states is None:
            return False
        avatar_mode = getattr(context.shared_states, 'avatar_mode', 'ending')
        interrupt_flag = getattr(context.shared_states, 'interrupt_flag', False)
        current_speech_id = getattr(context.shared_states, 'current_speech_id', None)

        # 仅当avatar_mode=running且interrupt_flag=True且speech_id不匹配时才中断
        is_interrupted = (avatar_mode == "running" and interrupt_flag and current_speech_id != speech_id)
        if is_interrupted:
            logger.info(f"[Qwen3ASR] 检测到中断 | avatar_mode={avatar_mode}, interrupt_flag={interrupt_flag}, current_speech_id={current_speech_id}, speech_id={speech_id}")
        return is_interrupted

    def handle(self, context: HandlerContext, inputs: ChatData,
               output_definitions: dict):
        if inputs.type != ChatDataType.HUMAN_AUDIO:
            return

        context = context if isinstance(context, Qwen3ASRContext) else context
        audio_bundle = inputs.data
        audio_data = audio_bundle.get_main_data()
        speech_id = audio_bundle.get_meta("speech_id") or f"speech-{context.session_id}-temp"
        speech_end = audio_bundle.get_meta("human_speech_end", False)

        if audio_data is not None:
            audio_data = audio_data.squeeze()

        # 第一次收到音频，创建新会话并记录开始时间
        if context.qwen_session_id is None:
            context.qwen_session_id = self._start_session()
            context.asr_start_time = time.time()
            logger.info(f"[Qwen3ASR] Started new session: {context.qwen_session_id}")

        # 持续发送音频片段（不获取中间结果）
        for audio_chunk in slice_data(context.audio_slice_context, audio_data):
            if self._is_interrupted(context, speech_id):
                logger.info(f"[Qwen3ASR] 音频收集阶段触发中断 | speech_id: {speech_id}")
                if context.qwen_session_id:
                    self._finish_session(context.qwen_session_id)
                    context.qwen_session_id = None
                    context.asr_start_time = None
                context.audio_slice_context.flush()
                return

            if audio_chunk is None or audio_chunk.shape[0] == 0:
                continue
            # 只发送音频，不处理返回结果
            self._send_chunk(context.qwen_session_id, audio_chunk)

        # 只有在语音结束时才获取完整文本
        if not speech_end:
            return

        if self._is_interrupted(context, speech_id):
            logger.info(f"[Qwen3ASR] 语音结束后触发中断 | speech_id: {speech_id}")
            if context.qwen_session_id:
                self._finish_session(context.qwen_session_id)
                context.qwen_session_id = None
                context.asr_start_time = None
            context.audio_slice_context.flush()
            return

        # 语音结束，获取最终完整文本
        logger.info(f"[Qwen3ASR] Speech ended, finishing session {context.qwen_session_id}")
        result = self._finish_session(context.qwen_session_id)
        text = result.get("text", "").strip()

        # 立即清理会话，确保下一轮对话创建新会话
        context.qwen_session_id = None
        context.audio_slice_context.flush()

        # 空文本直接返回，不输出
        if not text:
            if context.asr_start_time is not None:
                asr_duration = time.time() - context.asr_start_time
                logger.warning(f"[Qwen3ASR] ⚠️  空文本 | 耗时: {asr_duration:.3f}秒")
                context.asr_start_time = None
            else:
                logger.warning(f"[Qwen3ASR] Empty text, skipping output")
            return

        # 计算并打印ASR耗时（仅有效文本）
        if context.asr_start_time is not None:
            asr_duration = time.time() - context.asr_start_time
            logger.info(f"[Qwen3ASR] ⏱️  ASR合成耗时: {asr_duration:.3f}秒 | 文本: '{text}'")
            context.asr_start_time = None
        else:
            logger.info(f"[Qwen3ASR] Final complete text: '{text}'")

        output_definition = DataBundleDefinition()
        output_definition.add_entry(DataBundleEntry.create_text_entry("human_text"))

        new_speech_id = f"speech-{uuid.uuid4().hex[:16]}"
        output_text = self._replace_human_text(text)
        is_wakeup, wakeup_text = self._is_wakeup_word(output_text)

        avatar_mode = getattr(context.shared_states, 'avatar_mode', 'ending') if context.shared_states else 'ending'

        # avatar_mode=running → 检测唤醒词触发中断，拦截文本
        if avatar_mode == "running":
            logger.info(f"[Qwen3ASR] avatar_mode=running，拦截文本 | 文本：{output_text}")
            if is_wakeup:
                logger.info(f"[Qwen3ASR] 唤醒词触发中断 | 唤醒词：{wakeup_text}")
                self._update_interrupt_state(context, new_speech_id)
            else:
                self._update_normal_state(context, new_speech_id)
            return

        # avatar_mode=ending → 正常传递完整文本
        logger.info(f"[Qwen3ASR] avatar_mode=ending，正常传递文本 | 文本：{output_text}")
        self._update_normal_state(context, new_speech_id)

        output = DataBundle(output_definition)
        output.set_main_data(output_text)
        output.add_meta("human_text_end", False)
        output.add_meta("speech_id", new_speech_id)
        yield ChatData(type=ChatDataType.HUMAN_TEXT, data=output)

        end_output = DataBundle(output_definition)
        end_output.set_main_data("")
        end_output.add_meta("human_text_end", True)
        end_output.add_meta("speech_id", new_speech_id)
        yield ChatData(type=ChatDataType.HUMAN_TEXT, data=end_output)

    def destroy_context(self, context: HandlerContext):
        context = context if isinstance(context, Qwen3ASRContext) else context
        if context.qwen_session_id:
            self._finish_session(context.qwen_session_id)
        if context.shared_states is not None:
            context.shared_states.interrupt_flag = False
            context.shared_states.tts_interrupt_flag = False
            context.shared_states.avatar_interrupt_flag = False
            context.shared_states.llm_interrupt_flag = False
            context.shared_states.current_speech_id = None
        logger.info(f"[Qwen3ASR] Context destroyed | Session: {context.session_id}")
