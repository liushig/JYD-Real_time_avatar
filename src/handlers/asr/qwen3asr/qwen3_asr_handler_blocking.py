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


class Qwen3ASRBlockingConfig(HandlerBaseConfigModel, BaseModel):
    server_url: str = Field(default="http://localhost:9009")
    wakeup_words_pattern: str = Field(
        default=r"^((你)?好\s*[，,]?\s*(小达|小的|小德|小岛|小当|小唐|小打)|(等一下|停一下|暂停|别说了|打住|一下|等一下|停一下|闭嘴|stop|shut up))"
    )


class Qwen3ASRBlockingContext(HandlerContext):
    def __init__(self, session_id: str):
        super().__init__(session_id)
        self.config = None
        self.audio_buffer = []
        self.shared_states = None


class Handler(HandlerBase):
    def __init__(self):
        super().__init__()
        self.server_url = "http://localhost:9009"
        self.wakeup_pattern = None

    def get_handler_info(self) -> HandlerBaseInfo:
        return HandlerBaseInfo(
            name="Qwen3ASRBlocking",
            config_model=Qwen3ASRBlockingConfig,
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
        if isinstance(handler_config, Qwen3ASRBlockingConfig):
            self.server_url = handler_config.server_url
            self.wakeup_pattern = re.compile(handler_config.wakeup_words_pattern, re.IGNORECASE)

        if self.wakeup_pattern is None:
            self.wakeup_pattern = re.compile(r"^(你)?好\s*[，,]?\s*(|小达|小的|小德)", re.IGNORECASE)

        logger.info(f"[Qwen3ASRBlocking] Handler loaded, server: {self.server_url}")

    def create_context(self, session_context, handler_config=None):
        if not isinstance(handler_config, Qwen3ASRBlockingConfig):
            handler_config = Qwen3ASRBlockingConfig()
        context = Qwen3ASRBlockingContext(session_context.session_info.session_id)
        context.shared_states = session_context.shared_states
        logger.info(f"[Qwen3ASRBlocking] Context created | Session: {context.session_id}")
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
                logger.info(f"[Qwen3ASRBlocking] Text replaced: {old} → {new}")
        return text

    def _is_wakeup_word(self, text: str) -> Tuple[bool, str]:
        if not text:
            return False, ""
        match = self.wakeup_pattern.search(text)
        if match:
            matched_text = match.group(0)
            logger.info(f"[Qwen3ASRBlocking] Wakeup word detected: {matched_text}")
            return True, matched_text
        return False, ""

    def _update_interrupt_state(self, context: Qwen3ASRBlockingContext, speech_id: str):
        if context.shared_states is None:
            return
        context.shared_states.interrupt_flag = True
        context.shared_states.tts_interrupt_flag = True
        context.shared_states.avatar_interrupt_flag = True
        context.shared_states.llm_interrupt_flag = True
        context.shared_states.current_speech_id = speech_id
        logger.info(f"[Qwen3ASRBlocking] Interrupt triggered | Speech: {speech_id}")

    def _update_normal_state(self, context: Qwen3ASRBlockingContext, speech_id: str):
        if context.shared_states is None:
            return
        context.shared_states.interrupt_flag = False
        context.shared_states.tts_interrupt_flag = False
        context.shared_states.avatar_interrupt_flag = False
        context.shared_states.llm_interrupt_flag = False
        context.shared_states.current_speech_id = speech_id

    def _transcribe_audio(self, audio_data: np.ndarray) -> str:
        try:
            resp = requests.post(
                f"{self.server_url}/api/transcribe",
                data=audio_data.tobytes(),
                headers={"Content-Type": "application/octet-stream"},
                timeout=10
            )
            resp.raise_for_status()
            return resp.json().get("text", "")
        except Exception as e:
            logger.error(f"[Qwen3ASRBlocking] Failed to transcribe: {e}")
            return ""

    def handle(self, context: HandlerContext, inputs: ChatData,
               output_definitions: dict):
        if inputs.type != ChatDataType.HUMAN_AUDIO:
            return

        context = context if isinstance(context, Qwen3ASRBlockingContext) else context
        audio_bundle = inputs.data
        audio_data = audio_bundle.get_main_data()
        speech_end = audio_bundle.get_meta("human_speech_end", False)

        if audio_data is not None:
            audio_data = audio_data.squeeze()
            context.audio_buffer.append(audio_data)

        # 只有在语音结束时才处理
        if not speech_end:
            return

        # 合并所有音频
        if not context.audio_buffer:
            logger.warning(f"[Qwen3ASRBlocking] Empty audio buffer")
            context.audio_buffer.clear()
            return

        full_audio = np.concatenate(context.audio_buffer)
        context.audio_buffer.clear()

        logger.info(f"[Qwen3ASRBlocking] Processing audio: {len(full_audio)} samples ({len(full_audio)/16000:.2f}s)")

        # 调用API识别
        start_time = time.time()
        text = self._transcribe_audio(full_audio).strip()
        asr_duration = time.time() - start_time

        if not text:
            logger.warning(f"[Qwen3ASRBlocking] ⚠️  空文本 | 耗时: {asr_duration:.3f}秒")
            return

        logger.info(f"[Qwen3ASRBlocking] ⏱️  ASR合成耗时: {asr_duration:.3f}秒 | 文本: '{text}'")

        output_definition = DataBundleDefinition()
        output_definition.add_entry(DataBundleEntry.create_text_entry("human_text"))

        new_speech_id = f"speech-{uuid.uuid4().hex[:16]}"
        output_text = self._replace_human_text(text)
        is_wakeup, wakeup_text = self._is_wakeup_word(output_text)

        avatar_mode = getattr(context.shared_states, 'avatar_mode', 'ending') if context.shared_states else 'ending'

        # avatar_mode=running → 检测唤醒词触发中断，拦截文本
        if avatar_mode == "running":
            logger.info(f"[Qwen3ASRBlocking] avatar_mode=running，拦截文本 | 文本：{output_text}")
            if is_wakeup:
                logger.info(f"[Qwen3ASRBlocking] 唤醒词触发中断 | 唤醒词：{wakeup_text}")
                self._update_interrupt_state(context, new_speech_id)
            else:
                self._update_normal_state(context, new_speech_id)
            return

        # avatar_mode=ending → 正常传递完整文本
        logger.info(f"[Qwen3ASRBlocking] avatar_mode=ending，正常传递文本 | 文本：{output_text}")
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
        context = context if isinstance(context, Qwen3ASRBlockingContext) else context
        context.audio_buffer.clear()
        if context.shared_states is not None:
            context.shared_states.interrupt_flag = False
            context.shared_states.tts_interrupt_flag = False
            context.shared_states.avatar_interrupt_flag = False
            context.shared_states.llm_interrupt_flag = False
            context.shared_states.current_speech_id = None
        logger.info(f"[Qwen3ASRBlocking] Context destroyed | Session: {context.session_id}")
