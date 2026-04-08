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

    # ===== 分句参数（关键）=====
    max_buffer_chars: int = Field(default=30)  # buffer 超过多少字强制送 TTS，减小以提高响应速度
    min_buffer_chars: int = Field(default=20)   # buffer 至少多少字才考虑发送，避免过于频繁
    enable_sentence_segmentation: bool = Field(default=True)  # 是否启用智能句子分割
    sentence_endings: str = Field(default="，。！？；：\n")  # 句子结束符


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

        # ASR 累积文本
        self.input_texts: str = ""

        # LLM 完整输出
        self.output_texts: str = ""

        # 对话历史
        self.history: Optional[ChatHistory] = None

        # 分句参数
        self.max_buffer_chars: int = 30
        self.min_buffer_chars: int = 20
        self.enable_sentence_segmentation: bool = True
        self.sentence_endings: str = "，。！？；：\n"
        self.first_chunk_sent: bool = False  # 标记是否已发送第一个数据块


# ============================================================
# Handler
# ============================================================
class HandlerLLMXingkong3Streaming(HandlerBase, ABC):
    """
    稳定版 Streaming LLM Handler（已解决长句跳帧问题）

    核心特性：
    - 严格一句话一轮（human_text_end 才触发 LLM）
    - LLM streaming 接收
    - 语义分句后再送 TTS（防跳帧）
    - 最后 반드시 avatar_text_end
    """

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

        # ----------------------------------------------------
        # 累积 ASR
        # ----------------------------------------------------
        if text:
            context.input_texts += text

        if not text_end:
            return

        # ----------------------------------------------------
        # 清洗输入
        # ----------------------------------------------------
        chat_text = re.sub(r"<\|.*?\|>", "", context.input_texts).strip()
        context.input_texts = ""

        if not chat_text:
            return

        logger.info(f"[WorkflowLLM] input: {chat_text}")
        print(f"\n[LLM INPUT]\n{chat_text}\n")

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
        buffer_text = ""  # ⭐ 分句 buffer
        
        # 设置更合适的请求参数以优化初始连接
        request_kwargs = {
            "headers": headers,
            "json": payload,
            "stream": True,
            "timeout": (context.timeout/2, context.timeout)  # 连接超时和读取超时分开设置
        }
        
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

                    # ===== 累积 =====
                    context.output_texts += text_piece
                    buffer_text += text_piece

                    # ===== 检查是否到安全播报点 =====
                    should_send = False
                    
                    if context.enable_sentence_segmentation:
                        # 检查是否有句子结束符
                        for char in text_piece:  # 只检查新增的字符
                            if char in context.sentence_endings:
                                should_send = True
                                break
                    
                    # 对于第一个数据块，降低发送门槛以减少初始延迟
                    if not context.first_chunk_sent:
                        # 第一次发送可以更灵活：只要有内容就发送（最小字符数的一半）或达到最大缓冲的一半
                        if len(buffer_text) >= max(1, context.min_buffer_chars // 1):
                            context.first_chunk_sent = True
                            should_send = True
                            print(f"[LLM → TTS S11111111111111111] {buffer_text}")
                    else:
                        # 后续发送遵循正常规则：有标点符且达到最小长度，或达到最大长度
                        should_send = (should_send and len(buffer_text) >= context.min_buffer_chars) or len(buffer_text) >= context.max_buffer_chars
                    
                    # 检查长度条件
                    if should_send and buffer_text.strip():  # 确保有内容才发送
                        print(f"[LLM → TTS SAFE] {buffer_text}")

                        output = DataBundle(output_definition)
                        output.set_main_data(buffer_text)
                        output.add_meta("avatar_text_end", False)
                        output.add_meta("speech_id", speech_id)
                        yield output

                        buffer_text = ""

                # ===== flush 剩余 =====
                if buffer_text.strip():
                    print(f"[LLM → TTS FLUSH] {buffer_text}")

                    output = DataBundle(output_definition)
                    output.set_main_data(buffer_text)
                    output.add_meta("avatar_text_end", False)
                    output.add_meta("speech_id", speech_id)
                    yield output

            # ------------------------------------------------
            # 历史记录
            # ------------------------------------------------
            context.history.add_message(
                HistoryMessage(role="human", content=chat_text)
            )
            context.history.add_message(
                HistoryMessage(role="avatar", content=context.output_texts)
            )

        except Exception:
            logger.exception("[WorkflowLLM] error")

            fallback = "抱歉，我刚才没有听清楚，可以再说一遍吗？"
            context.output_texts = fallback

            output = DataBundle(output_definition)
            output.set_main_data(fallback)
            output.add_meta("avatar_text_end", False)
            output.add_meta("speech_id", speech_id)
            yield output

        # ----------------------------------------------------
        # DEBUG
        # ----------------------------------------------------
        print("\n================= LLM FINAL RESPONSE =================")
        print(context.output_texts)
        print("=====================================================\n")

        logger.info("[LLM FINAL RESPONSE]")
        logger.info(context.output_texts)

        # ----------------------------------------------------
        # 结束信号（必须）
        # ----------------------------------------------------
        logger.info("avatar text end")
        end_output = DataBundle(output_definition)
        end_output.set_main_data("")
        end_output.add_meta("avatar_text_end", True)
        end_output.add_meta("speech_id", speech_id)
        yield end_output

    def destroy_context(self, context: HandlerContext):
        pass
