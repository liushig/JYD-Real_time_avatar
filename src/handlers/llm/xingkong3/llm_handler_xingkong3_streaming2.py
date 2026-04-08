import re
import json
import requests
from typing import Dict, Optional, cast
from abc import ABC

from loguru import logger
from pydantic import BaseModel, Field

from chat_engine.contexts.handler_context import HandlerContext
from chat_engine.contexts.session_context import SessionContext
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
from chat_engine.data_models.runtime_data.data_bundle import (
    DataBundle,
    DataBundleDefinition,
    DataBundleEntry,
)
from handlers.llm.openai_compatible.chat_history_manager import (
    ChatHistory,
    HistoryMessage,
)

# ============================================================
# Config
# ============================================================
class LLMConfig(HandlerBaseConfigModel, BaseModel):
    api_url: str = Field(...)
    api_key: str = Field(...)
    user_id: str = Field(default="user-001")
    history_length: int = Field(default=20)
    timeout: int = Field(default=30)

    max_buffer_chars: int = Field(default=4)
    min_buffer_chars: int = Field(default=2)
    enable_sentence_segmentation: bool = Field(default=True)
    sentence_endings: str = Field(default="，。！？；：\n")


# ============================================================
# Context
# ============================================================
class LLMContext(HandlerContext):
    def __init__(self, session_id: str):
        super().__init__(session_id)

        self.api_url: Optional[str] = None
        self.api_key: Optional[str] = None
        self.user_id: Optional[str] = None
        self.timeout: int = 30

        self.input_texts: str = ""
        self.output_texts: str = ""

        self.history: Optional[ChatHistory] = None

        self.max_buffer_chars: int = 4
        self.min_buffer_chars: int = 2
        self.enable_sentence_segmentation: bool = True
        self.sentence_endings: str = "，。！？；：\n"
        self.first_chunk_sent: bool = False

        # 🔥 shared_states（用于中断）
        self.shared_states = None


# ============================================================
# Handler
# ============================================================
class HandlerLLMXingkong3Streaming(HandlerBase, ABC):

    # --------------------------------------------------------
    # Meta
    # --------------------------------------------------------
    def get_handler_info(self) -> HandlerBaseInfo:
        return HandlerBaseInfo(config_model=LLMConfig)

    def get_handler_detail(
        self,
        session_context: SessionContext,
        context: HandlerContext,
    ) -> HandlerDetail:
        definition = DataBundleDefinition()
        definition.add_entry(DataBundleEntry.create_text_entry("avatar_text"))

        inputs = {
            ChatDataType.HUMAN_TEXT: HandlerDataInfo(
                type=ChatDataType.HUMAN_TEXT
            ),
        }
        outputs = {
            ChatDataType.AVATAR_TEXT: HandlerDataInfo(
                type=ChatDataType.AVATAR_TEXT,
                definition=definition,
            )
        }
        return HandlerDetail(inputs=inputs, outputs=outputs)

    # --------------------------------------------------------
    # Lifecycle
    # --------------------------------------------------------
    def load(
        self,
        engine_config: ChatEngineConfigModel,
        handler_config: Optional[BaseModel] = None,
    ):
        if not isinstance(handler_config, LLMConfig):
            raise ValueError("LLMConfig required")

        if not handler_config.api_url:
            raise ValueError("api_url is required")

        if not handler_config.api_key:
            raise ValueError("api_key is required")

    def create_context(self, session_context, handler_config=None):
        if not isinstance(handler_config, LLMConfig):
            handler_config = LLMConfig()

        context = LLMContext(session_context.session_info.session_id)
        context.api_url = handler_config.api_url
        context.api_key = handler_config.api_key
        context.user_id = handler_config.user_id
        context.timeout = handler_config.timeout
        context.max_buffer_chars = handler_config.max_buffer_chars
        context.min_buffer_chars = handler_config.min_buffer_chars
        context.enable_sentence_segmentation = handler_config.enable_sentence_segmentation
        context.sentence_endings = handler_config.sentence_endings
        context.first_chunk_sent = False
        context.history = ChatHistory(
            history_length=handler_config.history_length
        )

        # 🔥 注入 shared_states
        context.shared_states = session_context.shared_states
        return context

    def start_context(self, session_context, handler_context):
        pass

    # ========================================================
    # Core Logic
    # ========================================================
    def handle(
        self,
        context: HandlerContext,
        inputs: ChatData,
        output_definitions: Dict[ChatDataType, HandlerDataInfo],
    ):
        context = cast(LLMContext, context)
        output_definition = output_definitions[
            ChatDataType.AVATAR_TEXT
        ].definition

        if inputs.type != ChatDataType.HUMAN_TEXT:
            return

        text = inputs.data.get_main_data()
        text_end = inputs.data.get_meta("human_text_end", False)
        speech_id = inputs.data.get_meta("speech_id") or context.session_id
        logger.info(
                f"[LLM speech_id ]={speech_id} "
                f"[LLM current_speech_id ]={context.shared_states.current_speech_id}"
            )

        # ----------------------------------------------------
        # 累积 ASR
        # ----------------------------------------------------
        if text:
            context.input_texts += text

        if not text_end:
            return

        # 🔥 如果当前 speech_id 已不是 active，直接丢弃
        if context.shared_states.current_speech_id != speech_id:
            logger.info(
                f"[LLM DROP BEFORE START] speech_id={speech_id} "
                f"active={context.shared_states.current_speech_id}"
            )
            return

        chat_text = re.sub(r"<\|.*?\|>", "", context.input_texts).strip()
        context.input_texts = ""

        if not chat_text:
            return

        logger.info(f"[WorkflowLLM] input: {chat_text}")

        payload = {
            "inputs": {"query": chat_text},
            "response_mode": "streaming",
            "user": context.user_id,
        }

        headers = {
            "Authorization": f"Bearer {context.api_key}",
            "Content-Type": "application/json",
        }

        context.output_texts = ""
        buffer_text = ""

        try:
            with requests.post(
                context.api_url,
                headers=headers,
                json=payload,
                stream=True,
                timeout=context.timeout,
            ) as resp:
                resp.raise_for_status()

                for line in resp.iter_lines():
                    # 🔥 核心中断点（最重要）
                    if context.shared_states.current_speech_id != speech_id:
                        logger.info(
                            f"[LLM INTERRUPTED] speech_id={speech_id} "
                            f"→ active={context.shared_states.current_speech_id}"
                        )
                        return

                    if not line:
                        continue

                    raw = line.decode("utf-8").strip()
                    if raw.startswith("data:"):
                        raw = raw[5:].strip()

                    try:
                        data = json.loads(raw)
                    except Exception:
                        continue

                    if data.get("event") != "text_chunk":
                        continue

                    chunk = data.get("data", {})
                    text_piece = chunk.get("text", "")
                    if not text_piece:
                        continue

                    context.output_texts += text_piece
                    buffer_text += text_piece

                    should_send = False

                    if context.enable_sentence_segmentation:
                        for char in text_piece:
                            if char in context.sentence_endings:
                                should_send = True
                                break

                    if not context.first_chunk_sent:
                        if len(buffer_text) >= max(1, context.min_buffer_chars // 2):
                            context.first_chunk_sent = True
                            should_send = True
                    else:
                        should_send = (
                            (should_send and len(buffer_text) >= context.min_buffer_chars)
                            or len(buffer_text) >= context.max_buffer_chars
                        )

                    if should_send and buffer_text.strip():
                        output = DataBundle(output_definition)
                        output.set_main_data(buffer_text)
                        output.add_meta("avatar_text_end", False)
                        output.add_meta("speech_id", speech_id)
                        yield output
                        buffer_text = ""

                # 🔥 flush 前再次防守
                if context.shared_states.current_speech_id != speech_id:
                    return

                if buffer_text.strip():
                    output = DataBundle(output_definition)
                    output.set_main_data(buffer_text)
                    output.add_meta("avatar_text_end", False)
                    output.add_meta("speech_id", speech_id)
                    yield output

            # ------------------------------------------------
            # 历史记录（仅在未被打断时）
            # ------------------------------------------------
            if context.shared_states.current_speech_id == speech_id:
                context.history.add_message(
                    HistoryMessage(role="human", content=chat_text)
                )
                context.history.add_message(
                    HistoryMessage(role="avatar", content=context.output_texts)
                )

        except Exception:
            logger.exception("[WorkflowLLM] error")
            return

        # ----------------------------------------------------
        # 结束信号（必须，但也要可中断）
        # ----------------------------------------------------
        if context.shared_states.current_speech_id != speech_id:
            return

        end_output = DataBundle(output_definition)
        end_output.set_main_data("")
        end_output.add_meta("avatar_text_end", True)
        end_output.add_meta("speech_id", speech_id)
        yield end_output

    def destroy_context(self, context: HandlerContext):
        pass
