# qwen3asr_handler_mixed.py（修复空数组拼接错误）
import re
import time
import json
import base64
import logging
import threading
from typing import Dict, Optional, cast
from abc import ABC

import numpy as np
import websocket  # pip install websocket-client

from loguru import logger
from pydantic import BaseModel, Field
from chat_engine.common.handler_base import HandlerBase, HandlerBaseInfo, HandlerDataInfo, HandlerDetail
from chat_engine.contexts.handler_context import HandlerContext
from chat_engine.contexts.session_context import SessionContext
from chat_engine.data_models.chat_data.chat_data_model import ChatData
from chat_engine.data_models.chat_data_type import ChatDataType
from chat_engine.data_models.chat_engine_config_data import ChatEngineConfigModel, HandlerBaseConfigModel
from chat_engine.data_models.runtime_data.data_bundle import DataBundle, DataBundleDefinition, DataBundleEntry
from engine_utils.general_slicer import SliceContext, slice_data

# 全局运行标志
is_running = True

# ====================== 1. 配置类（对齐sensevoice） ======================
class Qwen3ASRConfig(HandlerBaseConfigModel, BaseModel):
    """Qwen3ASR配置（完全对齐sensevoice配置结构）"""
    model_name: str = Field(default="qwen3-asr-flash-realtime")
    api_key: str = Field(default="sk-5f2d36a950e1406aa9a15b9bcb8b4616")  # 替换有效Key
    sample_rate: int = Field(default=16000)
    language: str = Field(default="zh")
    audio_format: str = Field(default="pcm")
    dashscope_url: str = Field(default="wss://dashscope.aliyuncs.com/api-ws/v1/realtime")
    chunk_size: int = Field(default=3200)
    send_delay: float = Field(default=0.01)

# ====================== 2. 上下文类（极简，对齐sensevoice） ======================
class Qwen3ASRContext(HandlerContext):
    """Qwen3ASR上下文（完全对齐sensevoice上下文逻辑）"""
    def __init__(self, session_id: str):
        super().__init__(session_id)
        # 仅保留sensevoice同款核心字段
        self.config: Optional[Qwen3ASRConfig] = None
        self.shared_states = None  # 仅关联，不修改enable_vad
        self.final_text: str = ""
        self.stash_text: str = ""
        self.output_audios = []
        self.audio_slice_context = SliceContext.create_numpy_slice_context(
            slice_size=16000,
            slice_axis=0
        )
        self.speech_id: int = 0
        # WebSocket临时字段（用完即弃，不干扰主逻辑）
        self.ws: Optional[websocket.WebSocketApp] = None
        self.is_ws_connected: bool = False

    def reset(self):
        """重置状态（仅清空缓存，不修改enable_vad）"""
        self.output_audios.clear()
        self.final_text = ""
        self.stash_text = ""
        # 仅关闭WebSocket，不操作enable_vad
        try:
            if self.ws and self.is_ws_connected:
                self.ws.close()
        except:
            pass
        self.ws = None
        self.is_ws_connected = False
        self.audio_slice_context.flush()

# ====================== 3. WebSocket极简回调（仅抓结果） ======================
def ws_on_open(ws, context: Qwen3ASRContext):
    """仅初始化会话，快速返回"""
    context.is_ws_connected = True
    # 极简会话配置（对齐sensevoice无VAD干预）
    session_event = {
        "event_id": f"event_{context.session_id}",
        "type": "session.update",
        "session": {
            "modalities": ["text"],
            "input_audio_format": context.config.audio_format,
            "sample_rate": context.config.sample_rate,
            "input_audio_transcription": {"language": context.config.language},
            "turn_detection": None  # 完全交由本地VAD控制
        }
    }
    ws.send(json.dumps(session_event))

def ws_on_message(ws, message, context: Qwen3ASRContext):
    """仅抓取识别结果，不做多余操作"""
    try:
        data = json.loads(message)
        # 仅处理最终识别结果（对齐sensevoice只输出最终文本）
        if data.get("type") == "conversation.item.input_audio_transcription.completed":
            context.final_text = data.get("transcript", "").strip()
        # 中间结果兜底
        elif data.get("type") == "conversation.item.input_audio_transcription.text":
            context.stash_text = data.get("stash", "").strip()
    except:
        pass

def ws_on_error(ws, error, context: Qwen3ASRContext):
    context.is_ws_connected = False

def ws_on_close(ws, close_status_code, close_msg, context: Qwen3ASRContext):
    context.is_ws_connected = False

# ====================== 4. 音频发送（修复ws未定义问题） ======================
def send_audio_fast(context: Qwen3ASRContext, audio_np: np.ndarray):
    """快速发送音频（修复ws未定义，使用context.ws）"""
    global is_running
    is_running = True

    # 格式转换（和sensevoice一致的float32→int16）
    audio_int16 = (audio_np * 32767).clip(-32767, 32767).astype(np.int16)
    audio_bytes = audio_int16.tobytes()

    # 分块快速发送（核心修复：使用context.ws而非全局ws）
    offset = 0
    while is_running and context.is_ws_connected and context.ws:
        chunk = audio_bytes[offset:offset + context.config.chunk_size]
        if not chunk:
            break
        # 发送音频块（修复：用context.ws.send）
        context.ws.send(json.dumps({
            "event_id": f"event_{int(time.time()*1000)}",
            "type": "input_audio_buffer.append",
            "audio": base64.b64encode(chunk).decode('utf-8')
        }))
        offset += len(chunk)
        time.sleep(context.config.send_delay)
    
    # 发送结束事件（修复：用context.ws.send）
    if context.is_ws_connected and context.ws:
        context.ws.send(json.dumps({
            "event_id": f"event_finish_{context.session_id}",
            "type": "session.finish"
        }))

# ====================== 5. 核心Handler（1:1对齐sensevoice逻辑） ======================
class HandlerASR_Qwen3_Mixed(HandlerBase, ABC):
    """Qwen3ASR Handler（完全对齐sensevoice逻辑）"""
    def __init__(self):
        super().__init__()
        self.config = Qwen3ASRConfig()
        # 极简日志（和sensevoice一致）
        self.logger = logging.getLogger('qwen3asr_sensevoice')
        self.logger.setLevel(logging.INFO)

    # ====================== 框架接口（完全复制sensevoice） ======================
    def get_handler_info(self) -> HandlerBaseInfo:
        return HandlerBaseInfo(
            name="ASR_Qwen3_Mixed",
            config_model=Qwen3ASRConfig
        )

    def get_handler_detail(self, session_context: SessionContext, context: HandlerContext) -> HandlerDetail:
        """输入输出完全对齐sensevoice"""
        definition = DataBundleDefinition()
        definition.add_entry(DataBundleEntry.create_audio_entry("avatar_audio", 1, 24000))
        
        return HandlerDetail(
            inputs={
                ChatDataType.HUMAN_AUDIO: HandlerDataInfo(type=ChatDataType.HUMAN_AUDIO)
            },
            outputs={
                ChatDataType.HUMAN_TEXT: HandlerDataInfo(
                    type=ChatDataType.HUMAN_TEXT,
                    definition=definition
                )
            }
        )

    def load(self, engine_config: ChatEngineConfigModel, handler_config: Optional[BaseModel] = None):
        """加载配置（仅校验Key，无多余操作）"""
        if isinstance(handler_config, Qwen3ASRConfig):
            self.config = handler_config
        if not self.config.api_key or "sk-xxx" in self.config.api_key:
            raise ValueError("[Qwen3ASR] 请配置有效API Key")

    def create_context(self, session_context: SessionContext, handler_config=None) -> HandlerContext:
        """创建上下文（极简，对齐sensevoice）"""
        context = Qwen3ASRContext(session_context.session_info.session_id)
        context.config = handler_config or self.config
        context.shared_states = session_context.shared_states  # 仅关联，不修改
        return context

    def start_context(self, session_context, handler_context):
        pass

    # ====================== 核心处理逻辑（1:1对齐sensevoice + 空值修复） ======================
    def handle(self, context: HandlerContext, inputs: ChatData,
               output_definitions: Dict[ChatDataType, HandlerDataInfo]):
        """
        完全对齐sensevoice核心逻辑：
        1. 接收本地VAD的HUMAN_AUDIO
        2. 快速调用云端ASR
        3. 识别完成后立即输出HUMAN_TEXT到下一阶段
        4. 不修改enable_vad，不做多余等待
        """
        context = cast(Qwen3ASRContext, context)
        output_definition = output_definitions[ChatDataType.HUMAN_TEXT].definition

        # 1. 仅校验输入（和sensevoice一致）
        if inputs.type != ChatDataType.HUMAN_AUDIO:
            return
        audio = inputs.data.get_main_data()
        if audio is None or audio.size == 0:
            return
        
        # 获取sensevoice同款元数据
        speech_end = inputs.data.get_meta("human_speech_end", False)
        speech_id = inputs.data.get_meta("speech_id", f"speech-{context.session_id}-{context.speech_id}")

        # 2. 缓存音频（和sensevoice一致的切片逻辑）
        audio = audio.squeeze()
        for audio_segment in slice_data(context.audio_slice_context, audio):
            if audio_segment is not None and audio_segment.shape[0] > 0:
                context.output_audios.append(audio_segment)

        # 3. 仅在语音结束时处理（对齐sensevoice）
        if not speech_end:
            return

        # ========== 核心修复：空数组判断（对齐sensevoice的容错逻辑） ==========
        if not context.output_audios:
            self.logger.warning(f"[Qwen3ASR] 无有效音频切片，speech_id={speech_id}")
            context.reset()
            return

        # 4. 拼接音频（极简）
        output_audio = np.concatenate(context.output_audios)

        # 5. WebSocket快速调用（后台执行，不阻塞）
        try:
            # 构建WebSocket连接（快速初始化）
            ws_url = f"{context.config.dashscope_url}?model={context.config.model_name}"
            context.ws = websocket.WebSocketApp(
                ws_url,
                header=[
                    f"Authorization: Bearer {context.config.api_key}",
                    "OpenAI-Beta: realtime=v1"
                ],
                on_open=lambda ws: ws_on_open(ws, context),
                on_message=lambda ws, msg: ws_on_message(ws, msg, context),
                on_error=lambda ws, err: ws_on_error(ws, err, context),
                on_close=lambda ws, code, msg: ws_on_close(ws, code, msg, context)
            )
            # 启动WebSocket（非阻塞）
            threading.Thread(target=context.ws.run_forever, daemon=True).start()
            
            # 等待连接（极简超时）
            timeout = 0
            while not context.is_ws_connected and timeout < 2:
                time.sleep(0.1)
                timeout += 0.1
            
            # 快速发送音频（修复：传入context）
            if context.is_ws_connected and context.ws:
                send_audio_fast(context, output_audio)
            
            # 短暂等待结果（仅必要时间，快速返回）
            time.sleep(0.3)

        except Exception as e:
            self.logger.error(f"ASR调用失败: {e}")
            context.reset()
            return

        # 6. 结果处理（完全对齐sensevoice）
        # 优先级：最终结果 > 中间结果
        output_text = context.final_text.strip() or context.stash_text.strip()
        output_text = re.sub(r"<\|.*?\|>", "", output_text).strip()

        # 7. 快速输出结果到下一阶段（核心：和sensevoice一致的yield逻辑）
        if output_text:
            # 输出有效文本（和sensevoice格式完全一致）
            output = DataBundle(output_definition)
            output.set_main_data(output_text)
            output.add_meta('human_text_end', False)
            output.add_meta('speech_id', speech_id)
            yield output

            # 输出结束标记（和sensevoice一致）
            end_output = DataBundle(output_definition)
            end_output.set_main_data('')
            end_output.add_meta("human_text_end", True)
            end_output.add_meta("speech_id", speech_id)
            yield end_output

        # 8. 重置状态（仅清空缓存，不修改enable_vad）
        context.speech_id += 1
        context.reset()

    def destroy_context(self, context: HandlerContext):
        """销毁上下文（极简，对齐sensevoice）"""
        context = cast(Qwen3ASRContext, context)
        context.reset()

# ====================== 兼容sensevoice的类名（可选） ======================
HandlerASR_SenseVoice = HandlerASR_Qwen3_Mixed