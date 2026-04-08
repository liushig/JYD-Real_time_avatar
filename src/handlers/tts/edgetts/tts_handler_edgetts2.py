import io
import edge_tts
import os
import re
import time
import threading
from typing import Dict, Optional, cast

import librosa
import numpy as np
from loguru import logger
from pydantic import BaseModel, Field
from abc import ABC

from chat_engine.contexts.handler_context import HandlerContext
from chat_engine.data_models.chat_engine_config_data import (
    ChatEngineConfigModel,
    HandlerBaseConfigModel,
)
from chat_engine.common.handler_base import (
    HandlerBase,
    HandlerBaseInfo,
    HandlerDataInfo,
    HandlerDetail,
)
from chat_engine.data_models.chat_data.chat_data_model import ChatData
from chat_engine.data_models.chat_data_type import ChatDataType
from chat_engine.contexts.session_context import SessionContext
from chat_engine.data_models.runtime_data.data_bundle import (
    DataBundle,
    DataBundleDefinition,
    DataBundleEntry,
)
from engine_utils.directory_info import DirectoryInfo


# =========================
# Config
# =========================
class TTSConfig(HandlerBaseConfigModel, BaseModel):
    voice: str = Field(default=None)
    sample_rate: int = Field(default=24000)


# =========================
# Context
# =========================
class TTSContext(HandlerContext):
    def __init__(self, session_id: str):
        super().__init__(session_id)
        self.input_text: str = ""
        self.dump_audio = False
        self.audio_dump_file = None
        # 新增：线程安全的中断事件（替代纯布尔值）
        self.stop_event = threading.Event()
        # 新增：当前合成线程（用于中断时终止）
        self.synthesis_thread: Optional[threading.Thread] = None

    def reset_interrupt(self):
        """重置中断状态"""
        self.stop_event.clear()

    def trigger_interrupt(self):
        """触发中断"""
        self.stop_event.set()
        # 等待合成线程终止（可选，根据业务调整超时时间）
        if self.synthesis_thread and self.synthesis_thread.is_alive():
            self.synthesis_thread.join(timeout=0.5)


# =========================
# Handler
# =========================
class HandlerTTS(HandlerBase, ABC):
    def __init__(self):
        super().__init__()
        self.voice = None
        self.sample_rate = None

    # -------- basic info --------
    def get_handler_info(self) -> HandlerBaseInfo:
        return HandlerBaseInfo(
            config_model=TTSConfig,
        )

    def get_handler_detail(
        self, session_context: SessionContext, context: HandlerContext
    ) -> HandlerDetail:
        definition = DataBundleDefinition()
        definition.add_entry(
            DataBundleEntry.create_audio_entry(
                "avatar_audio", 1, self.sample_rate
            )
        )

        inputs = {
            ChatDataType.AVATAR_TEXT: HandlerDataInfo(
                type=ChatDataType.AVATAR_TEXT
            )
        }
        outputs = {
            ChatDataType.AVATAR_AUDIO: HandlerDataInfo(
                type=ChatDataType.AVATAR_AUDIO,
                definition=definition,
            )
        }
        return HandlerDetail(inputs=inputs, outputs=outputs)

    # -------- lifecycle --------
    def load(
        self,
        engine_config: ChatEngineConfigModel,
        handler_config: Optional[BaseModel] = None,
    ):
        config = cast(TTSConfig, handler_config)
        self.voice = config.voice
        self.sample_rate = config.sample_rate

    def create_context(self, session_context, handler_config=None):
        context = TTSContext(session_context.session_info.session_id)
        context.session_context = session_context
        context.reset_interrupt()  # 初始化中断状态
        if context.dump_audio:
            dump_file_path = os.path.join(
                DirectoryInfo.get_project_dir(),
                "temp",
                f"dump_avatar_audio_{context.session_id}_{int(time.time())}.pcm",
            )
            context.audio_dump_file = open(dump_file_path, "wb")
        return context

    def start_context(self, session_context, context: HandlerContext):
        logger.info("[TTS] start context")
        cast(TTSContext, context).reset_interrupt()  # 启动时重置中断

    # -------- utils --------
    def filter_text(self, text: str) -> str:
        pattern = r"[^a-zA-Z0-9\u4e00-\u9fff,.\~!?，。！？ ]"
        return re.sub(pattern, "", text)

    # -------- 新增：核心合成函数（可中断） --------
    def _synthesize_sentence(
        self,
        context: TTSContext,
        sentence: str,
        speech_id: str,
        output_definition: DataBundleDefinition
    ):
        """合成单句语音，支持即时中断"""
        # 前置检查：中断/会话过期
        if context.stop_event.is_set() or speech_id != context.session_context.shared_states.current_speech_id:
            logger.info(f"[TTS] 中断触发/会话过期，停止合成 speech_id={speech_id}")
            return False

        try:
            communicate = edge_tts.Communicate(sentence, self.voice)
            data = b""
            # 迭代生成音频chunk，每一步都检查中断
            for chunk in communicate.stream_sync():
                # 即时中断检查（最高优先级）
                if context.stop_event.is_set() or speech_id != context.session_context.shared_states.current_speech_id:
                    logger.info(f"[TTS] 合成中触发中断，终止 speech_id={speech_id}")
                    return False

                if chunk["type"] == "audio":
                    data += chunk["data"]

            # 合成完成且未中断，提交音频数据
            if not context.stop_event.is_set():
                audio = librosa.load(io.BytesIO(data), sr=None)[0]
                audio = audio[np.newaxis, ...]
                bundle = DataBundle(output_definition)
                bundle.set_main_data(audio)
                bundle.add_meta("avatar_speech_end", False)
                bundle.add_meta("speech_id", speech_id)
                context.submit_data(bundle)
            return True
        except Exception as e:
            logger.error(f"[TTS] 合成失败：{e}")
            return False

    # =========================
    # Core Handle (Interrupt-safe)
    # =========================
    def handle(
        self,
        context: HandlerContext,
        inputs: ChatData,
        output_definitions: Dict[ChatDataType, HandlerDataInfo],
    ):
        context = cast(TTSContext, context)

        # 1. 最高优先级：外部中断触发（重置+标记停止）
        if context.session_context.shared_states.interrupt_flag:
            logger.info("[TTS] 全局中断触发，标记停止")
            context.stop_event.set()
            context.input_text = ""
            return

        # 2. 输入类型校验
        if inputs.type != ChatDataType.AVATAR_TEXT:
            return

        output_definition = output_definitions.get(ChatDataType.AVATAR_AUDIO).definition
        text = inputs.data.get_main_data()
        speech_id = inputs.data.get_meta("speech_id") or context.session_id
        text_end = inputs.data.get_meta("avatar_text_end", False)

        # 3. 文本预处理
        if text:
            text = re.sub(r"<\|.*?\|>", "", text)
            context.input_text += self.filter_text(text)

        # 4. 流式分句合成
        if not text_end:
            sentences = re.split(r"(?<=[,.~!?，。！？])", context.input_text)
            if len(sentences) > 1:
                context.input_text = sentences[-1]
                for sentence in sentences[:-1]:
                    sentence = sentence.strip()
                    if not sentence:
                        continue

                    # 合成单句（可中断）
                    if not self._synthesize_sentence(context, sentence, speech_id, output_definition):
                        context.input_text = ""
                        return

        # 5. 最终句子合成
        else:
            # 前置中断检查
            if context.stop_event.is_set() or speech_id != context.session_context.shared_states.current_speech_id:
                logger.info("[TTS] 最终句合成前触发中断")
                context.input_text = ""
                return

            if context.input_text.strip():
                # 合成最终句（可中断）
                self._synthesize_sentence(context, context.input_text.strip(), speech_id, output_definition)

            # 6. 正常结束（未中断）
            if not context.stop_event.is_set():
                context.input_text = ""
                end_bundle = DataBundle(output_definition)
                end_bundle.set_main_data(np.zeros((1, 240), dtype=np.float32))
                end_bundle.add_meta("avatar_speech_end", True)
                end_bundle.add_meta("speech_id", speech_id)
                context.submit_data(end_bundle)
                logger.info("[TTS] speech end")
            else:
                logger.info("[TTS] 合成终止，跳过结束包提交")

    def destroy_context(self, context: HandlerContext):
        """销毁上下文时清理中断状态和资源"""
        context = cast(TTSContext, context)
        context.stop_event.set()  # 确保合成线程终止
        if context.audio_dump_file:
            context.audio_dump_file.close()
            context.audio_dump_file = None
        logger.info("[TTS] destroy context")