import re
import json
import requests
from typing import Dict, Optional, cast
from abc import ABC
import urllib3

from loguru import logger
from pydantic import BaseModel, Field

# 禁用SSL警告
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

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

    max_buffer_chars: int = Field(default=20)
    min_buffer_chars: int = Field(default=10)
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

        self.max_buffer_chars: int = 20
        self.min_buffer_chars: int = 10
        self.enable_sentence_segmentation: bool = True
        self.sentence_endings: str = "，。！？；：\n"
        self.first_chunk_sent: bool = False

        # 🔥 shared_states（用于中断）
        self.shared_states = None

        # 当前任务ID（用于停止请求）
        self.current_task_id: Optional[str] = None


# ============================================================
# Handler
# ============================================================
class HandlerLLMXingkong3ImgStreaming(HandlerBase, ABC):

    # --------------------------------------------------------
    # 辅助方法：移除 HTML 图片标签
    # --------------------------------------------------------
    @staticmethod
    def _remove_img_tags(text: str) -> str:
        """
        移除文本中的所有 <img ...> 标签，只保留纯文字部分
        """
        if not text:
            return text
        # 匹配 <img ...> 或 <img ... /> 格式
        img_pattern = r'<img[^>]*>'
        cleaned = re.sub(img_pattern, '', text)
        return cleaned

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
        # 初始化中断标志（确保默认值为False）
        if not hasattr(context.shared_states, "llm_interrupt_flag"):
            context.shared_states.llm_interrupt_flag = False
        return context

    def start_context(self, session_context, handler_context):
        pass

    # ========================================================
    # 新增：停止大模型任务
    # ========================================================
    def _stop_llm_task(self, context: LLMContext, task_id: str):
        """发送停止请求到大模型"""
        try:
            stop_url = f"{context.api_url.rsplit('/', 1)[0]}/chat-messages/{task_id}/stop"
            headers = {
                "Authorization": f"Bearer {context.api_key}",
                "Content-Type": "application/json",
            }
            payload = {"user": context.user_id}
            resp = requests.post(stop_url, headers=headers, json=payload, timeout=5, verify=False)
            if resp.status_code == 200:
                logger.info(f"[LLM停止] 成功停止task_id={task_id}")
            else:
                logger.warning(f"[LLM停止] 停止失败 task_id={task_id} status={resp.status_code}")
        except Exception as e:
            logger.warning(f"[LLM停止] 停止请求异常 task_id={task_id}: {e}")

    # ========================================================
    # 新增：重新获取新speech_id并执行新任务的核心方法
    # ========================================================
    def _execute_new_task(self, context: LLMContext, inputs: ChatData, output_definition):
        """中断后重新获取新speech_id并执行新任务"""
        # 重置中断标志（执行新任务前恢复为False）
        context.shared_states.llm_interrupt_flag = False
        # 重新获取新的speech_id
        new_speech_id = inputs.data.get_meta("speech_id") or context.session_id
        logger.info(f"[LLM RESTART] 中断后获取新speech_id: {new_speech_id}")

        # 重置上下文状态
        context.first_chunk_sent = False
        buffer_text = ""  # 原始文本（含图片标签）
        context.output_texts = ""

        chat_text = re.sub(r"<\|.*?\|>", "", context.input_texts).strip()
        context.input_texts = ""
        if not chat_text:
            return

        # 解析前端数据
        try:
            outer = json.loads(chat_text)
            # 检查是否有双重嵌套
            if outer.get('type') == 'chat' and isinstance(outer.get('data'), str):
                # data是字符串，需要再解析一次
                inner = json.loads(outer['data'])
                if inner.get('type') == 'chat' and 'data' in inner:
                    actual_data = inner['data']
                else:
                    actual_data = inner
            elif outer.get('type') == 'chat' and isinstance(outer.get('data'), dict):
                # data已经是对象
                actual_data = outer['data']
            else:
                actual_data = None

            if actual_data:
                payload = {
                    "inputs": actual_data.get('inputs', {}),
                    "query": actual_data.get('query', chat_text),
                    "response_mode": "streaming",
                    "conversation_id": actual_data.get('conversation_id', ''),
                    "user": actual_data.get('user', context.user_id)
                }
                logger.info(f"[WorkflowLLM RESTART] 构造payload成功")
            else:
                payload = {
                    "inputs": {},
                    "query": chat_text,
                    "response_mode": "streaming",
                    "conversation_id": "",
                    "user": context.user_id
                }
        except:
            payload = {
                "inputs": {},
                "query": chat_text,
                "response_mode": "streaming",
                "conversation_id": "",
                "user": context.user_id
            }

        headers = {
            "Authorization": f"Bearer {context.api_key}",
            "Content-Type": "application/json",
        }

        conversation_id = ""
        diagnosis_progress = None

        try:
            with requests.post(
                context.api_url,
                headers=headers,
                json=payload,
                stream=True,
                timeout=context.timeout,
                verify=False,
            ) as resp:
                resp.raise_for_status()

                for line in resp.iter_lines():
                    # 实时检测中断标志
                    if context.shared_states.llm_interrupt_flag:
                        logger.info(f"[LLM INTERRUPTED] 新任务speech_id={new_speech_id} 被中断")
                        # 发送停止请求
                        if context.current_task_id:
                            self._stop_llm_task(context, context.current_task_id)
                        return

                    if not line:
                        continue

                    raw = line.decode("utf-8").strip()

                    if raw.startswith("data:"):
                        raw = raw[5:].strip()

                    try:
                        data = json.loads(raw)
                    except Exception as e:
                        logger.warning(f"[DEBUG JSON PARSE ERROR] {e}")
                        continue

                    # 提取conversation_id
                    if "conversation_id" in data:
                        conversation_id = data["conversation_id"]

                    # 处理message事件（大模型输出）
                    if data.get("event") == "message":
                        text_piece = data.get("answer", "")
                        if not text_piece:
                            continue

                        # 累积原始文本（含图片标签）
                        context.output_texts += text_piece
                        buffer_text += text_piece

                        should_send = False

                        if context.enable_sentence_segmentation:
                            for char in text_piece:
                                if char in context.sentence_endings:
                                    should_send = True
                                    break

                        if not context.first_chunk_sent:
                            if len(buffer_text) >= max(1, context.min_buffer_chars // 1):
                                context.first_chunk_sent = True
                                should_send = True
                        else:
                            should_send = (
                                (should_send and len(buffer_text) >= context.min_buffer_chars)
                                or len(buffer_text) >= context.max_buffer_chars
                            )

                        if should_send and buffer_text.strip():
                            output = DataBundle(output_definition)
                            # 原始文本（含图片标签）给前端
                            output.set_main_data(buffer_text)
                            # 过滤后的纯文本给 TTS
                            output.add_meta("tts_text", self._remove_img_tags(buffer_text))
                            output.add_meta("avatar_text_end", False)
                            output.add_meta("speech_id", new_speech_id)
                            output.add_meta("conversation_id", conversation_id)
                            yield output
                            buffer_text = ""

                    # 处理node_finished事件（问诊进度）
                    elif data.get("event") == "node_finished":
                        node_data = data.get("data", {})
                        if node_data.get("title") == "问诊进度":
                            diagnosis_progress = node_data.get("outputs", {}).get("result", {})
                            logger.info(f"[WorkflowLLM RESTART] 问诊进度: {diagnosis_progress}")

                # flush前检测中断标志
                if context.shared_states.llm_interrupt_flag:
                    return

                if buffer_text.strip():
                    output = DataBundle(output_definition)
                    output.set_main_data(buffer_text)
                    output.add_meta("tts_text", self._remove_img_tags(buffer_text))
                    output.add_meta("avatar_text_end", False)
                    output.add_meta("speech_id", new_speech_id)
                    output.add_meta("conversation_id", conversation_id)
                    if diagnosis_progress:
                        output.add_meta("diagnosis_progress", diagnosis_progress)
                    yield output

            # 历史记录（仅在未被打断时）
            if not context.shared_states.llm_interrupt_flag:
                context.history.add_message(
                    HistoryMessage(role="human", content=chat_text)
                )
                context.history.add_message(
                    HistoryMessage(role="avatar", content=context.output_texts)
                )

            # 结束信号（仅在未被打断时）
            if not context.shared_states.llm_interrupt_flag:
                end_output = DataBundle(output_definition)
                end_output.set_main_data("")
                end_output.add_meta("tts_text", "")  # 结束信号无需TTS
                end_output.add_meta("avatar_text_end", True)
                end_output.add_meta("speech_id", new_speech_id)
                end_output.add_meta("conversation_id", conversation_id)
                if diagnosis_progress:
                    end_output.add_meta("diagnosis_progress", diagnosis_progress)
                yield end_output

        except Exception:
            logger.exception("[WorkflowLLM] 新任务执行出错")
            return

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
                f"[LLM llm_interrupt_flag ]={context.shared_states.llm_interrupt_flag}"
            )

        # ----------------------------------------------------
        # 累积 ASR
        # ----------------------------------------------------
        if text:
            context.input_texts += text

        if not text_end:
            return

        # 🔥 修改1：中断标志检测（替代原speech_id判断）
        if context.shared_states.llm_interrupt_flag:
            logger.info(
                f"[LLM DROP BEFORE START] speech_id={speech_id} "
                f"llm_interrupt_flag={context.shared_states.llm_interrupt_flag}"
            )
            # 直接执行新任务
            yield from self._execute_new_task(context, inputs, output_definition)
            return

        chat_text = re.sub(r"<\|.*?\|>", "", context.input_texts).strip()
        context.input_texts = ""

        if not chat_text:
            return

        logger.info(f"[WorkflowLLM] input: {chat_text}")

        # 解析前端数据
        has_record = False
        try:
            outer = json.loads(chat_text)
            # 检查是否有双重嵌套
            if outer.get('type') == 'chat' and isinstance(outer.get('data'), str):
                # data是字符串，需要再解析一次
                inner = json.loads(outer['data'])
                if inner.get('type') == 'chat' and 'data' in inner:
                    actual_data = inner['data']
                else:
                    actual_data = inner
            elif outer.get('type') == 'chat' and isinstance(outer.get('data'), dict):
                # data已经是对象
                actual_data = outer['data']
            else:
                actual_data = None

            if actual_data:
                # 检查inputs中是否有record字段且不为空
                inputs_data = actual_data.get('inputs', {})
                record_value = inputs_data.get('record', '')
                if record_value and record_value.strip():
                    has_record = True
                    logger.info(f"[WorkflowLLM] 检测到record字段，跳过TTS流程")

                payload = {
                    "inputs": inputs_data,
                    "query": actual_data.get('query', chat_text),
                    "response_mode": "streaming",
                    "conversation_id": actual_data.get('conversation_id', ''),
                    "user": actual_data.get('user', context.user_id)
                }
                logger.info(f"[WorkflowLLM] 构造payload成功")
            else:
                payload = {
                    "inputs": {},
                    "query": chat_text,
                    "response_mode": "streaming",
                    "conversation_id": "",
                    "user": context.user_id
                }
        except:
            payload = {
                "inputs": {},
                "query": chat_text,
                "response_mode": "streaming",
                "conversation_id": "",
                "user": context.user_id
            }

        headers = {
            "Authorization": f"Bearer {context.api_key}",
            "Content-Type": "application/json",
        }

        context.output_texts = ""
        buffer_text = ""  # 原始文本（含图片标签）
        conversation_id = ""
        diagnosis_progress = None

        try:
            with requests.post(
                context.api_url,
                headers=headers,
                json=payload,
                stream=True,
                timeout=context.timeout,
                verify=False,
            ) as resp:
                resp.raise_for_status()

                for line in resp.iter_lines():
                    # 🔥 修改2：实时检测中断标志（核心中断点）
                    if context.shared_states.llm_interrupt_flag:
                        logger.info(
                            f"[LLM INTERRUPTED] speech_id={speech_id} "
                            f"llm_interrupt_flag={context.shared_states.llm_interrupt_flag}"
                        )
                        # 发送停止请求到大模型
                        if context.current_task_id:
                            self._stop_llm_task(context, context.current_task_id)
                        # 中断当前任务，执行新任务
                        yield from self._execute_new_task(context, inputs, output_definition)
                        return

                    if not line:
                        continue

                    raw = line.decode("utf-8").strip()

                    if raw.startswith("data:"):
                        raw = raw[5:].strip()

                    try:
                        data = json.loads(raw)
                    except Exception as e:
                        logger.warning(f"[DEBUG JSON PARSE ERROR] {e}")
                        continue

                    # 提取task_id
                    if "task_id" in data and not context.current_task_id:
                        context.current_task_id = data["task_id"]
                        logger.info(f"[WorkflowLLM] 获取task_id: {context.current_task_id}")

                    # 提取conversation_id
                    if "conversation_id" in data:
                        conversation_id = data["conversation_id"]

                    # 处理message事件（大模型输出）
                    if data.get("event") == "message":
                        text_piece = data.get("answer", "")
                        if not text_piece:
                            continue

                        # 累积原始文本（含图片标签）
                        context.output_texts += text_piece

                        # 如果有record字段，流式发送给前端但标记skip_tts（不过滤，因为不进入TTS）
                        if has_record:
                            output = DataBundle(output_definition)
                            output.set_main_data(text_piece)
                            output.add_meta("avatar_text_end", False)
                            output.add_meta("speech_id", speech_id)
                            output.add_meta("conversation_id", conversation_id)
                            output.add_meta("skip_tts", True)
                            yield output
                            continue

                        buffer_text += text_piece

                        should_send = False

                        if context.enable_sentence_segmentation:
                            for char in text_piece:
                                if char in context.sentence_endings:
                                    should_send = True
                                    break

                        if not context.first_chunk_sent:
                            if len(buffer_text) >= max(1, context.min_buffer_chars // 1):
                                context.first_chunk_sent = True
                                should_send = True
                        else:
                            should_send = (
                                (should_send and len(buffer_text) >= context.min_buffer_chars)
                                or len(buffer_text) >= context.max_buffer_chars
                            )

                        if should_send and buffer_text.strip():
                            output = DataBundle(output_definition)
                            # 原始文本（含图片标签）给前端
                            output.set_main_data(buffer_text)
                            # 过滤后的纯文本给 TTS
                            output.add_meta("tts_text", self._remove_img_tags(buffer_text))
                            output.add_meta("avatar_text_end", False)
                            output.add_meta("speech_id", speech_id)
                            output.add_meta("conversation_id", conversation_id)
                            yield output
                            buffer_text = ""

                    # 处理node_finished事件（问诊进度）
                    elif data.get("event") == "node_finished":
                        node_data = data.get("data", {})
                        if node_data.get("title") == "问诊进度":
                            diagnosis_progress = node_data.get("outputs", {}).get("result", {})
                            logger.info(f"[WorkflowLLM] 问诊进度: {diagnosis_progress}")

                # 🔥 修改3：flush前检测中断标志
                if context.shared_states.llm_interrupt_flag:
                    yield from self._execute_new_task(context, inputs, output_definition)
                    return

                # 如果有record字段，跳过buffer发送
                if not has_record and buffer_text.strip():
                    output = DataBundle(output_definition)
                    output.set_main_data(buffer_text)
                    output.add_meta("tts_text", self._remove_img_tags(buffer_text))
                    output.add_meta("avatar_text_end", False)
                    output.add_meta("speech_id", speech_id)
                    output.add_meta("conversation_id", conversation_id)
                    if diagnosis_progress:
                        output.add_meta("diagnosis_progress", diagnosis_progress)
                    yield output

            # ------------------------------------------------
            # 历史记录（仅在未被打断时）
            # ------------------------------------------------
            # 🔥 修改4：中断标志判断
            if not context.shared_states.llm_interrupt_flag:
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
        # 🔥 修改5：中断标志判断
        if context.shared_states.llm_interrupt_flag:
            yield from self._execute_new_task(context, inputs, output_definition)
            return

        # 如果有record字段，发送avatar_end信号
        if has_record:
            logger.info(f"[WorkflowLLM] record模式：发送avatar_end信号")
            end_signal = DataBundle(output_definition)
            end_signal.add_meta("avatar_text_end", True)
            end_signal.add_meta("speech_id", speech_id)
            end_signal.add_meta("conversation_id", conversation_id)
            end_signal.add_meta("skip_tts", True)
            if diagnosis_progress:
                end_signal.add_meta("diagnosis_progress", diagnosis_progress)
                logger.info(f"[WorkflowLLM] record模式：附加问诊进度 {diagnosis_progress}")
            end_signal.set_main_data("__AVATAR_END__")
            yield end_signal
            return

        # 正常流程：发送结束信号
        end_output = DataBundle(output_definition)
        end_output.set_main_data("")
        end_output.add_meta("tts_text", "")  # 结束信号无需TTS
        end_output.add_meta("avatar_text_end", True)
        end_output.add_meta("speech_id", speech_id)
        end_output.add_meta("conversation_id", conversation_id)
        if diagnosis_progress:
            end_output.add_meta("diagnosis_progress", diagnosis_progress)
        yield end_output

    def destroy_context(self, context: HandlerContext):
        pass