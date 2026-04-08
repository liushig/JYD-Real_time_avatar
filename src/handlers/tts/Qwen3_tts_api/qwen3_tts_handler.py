import io
import os
import re
import time
import json
import base64
import requests
from typing import Dict, Optional, cast
import librosa
import numpy as np
from loguru import logger
from pydantic import BaseModel, Field
from abc import ABC

# 保留项目原有核心依赖
from chat_engine.contexts.handler_context import HandlerContext
from chat_engine.data_models.chat_engine_config_data import ChatEngineConfigModel, HandlerBaseConfigModel
from chat_engine.common.handler_base import HandlerBase, HandlerBaseInfo, HandlerDataInfo, HandlerDetail
from chat_engine.data_models.chat_data.chat_data_model import ChatData
from chat_engine.data_models.chat_data_type import ChatDataType
from chat_engine.contexts.session_context import SessionContext
from chat_engine.data_models.runtime_data.data_bundle import DataBundle, DataBundleDefinition, DataBundleEntry
from engine_utils.directory_info import DirectoryInfo

# ===================== 通义千问API 常量配置 =====================
# TTS合成API（实时）
QWEN3_TTS_API_URL = "https://dashscope.aliyuncs.com/api/v1/services/audio/tts/speech-synthesis"
# 音色复刻API（创建自定义voice）
QWEN3_VC_API_URL = "https://dashscope.aliyuncs.com/api/v1/services/audio/tts/customization"
# 复刻目标模型（官方指定，适配Qwen3 TTS）
QWEN3_VC_TARGET_MODEL = "qwen3-tts-vc-realtime-2026-01-15"
# 默认配置（与原EdgeTTS/CosyVoice对齐）
DEFAULT_SAMPLE_RATE = 24000
DEFAULT_AUDIO_FORMAT = "wav"
# 音色复刻结果缓存文件（避免重复复刻）
VC_CACHE_FILE = os.path.join(DirectoryInfo.get_project_dir(), "temp", "qwen3_vc_voice_cache.json")

# ===================== 配置类（强化音色复刻配置） =====================
class TTSConfig(HandlerBaseConfigModel, BaseModel):
    enabled: bool = Field(default=True)
    # Qwen3 TTS 基础配置
    voice: str = Field(default="longyingling_v3")  # 兜底默认音色（未复刻时使用）
    model_name: str = Field(default="qwen3-tts-v3-flash")  # 实时合成模型
    api_key: str = Field(default=None)  # 通义千问API Key（必填，合成+复刻共用）
    sample_rate: int = Field(default=DEFAULT_SAMPLE_RATE)
    # 音色复刻核心配置（重点！）
    ref_audio_path: str = Field(default=None)  # 参考音频文件路径（mp3/wav，必填才会触发复刻）
    ref_audio_text: str = Field(default=None)  # 参考音频对应文本（可选，提升复刻效果）
    vc_preferred_name: str = Field(default="custom_voice")  # 自定义音色名称（缓存标识用）

# ===================== 上下文类（完全复用，无修改） =====================
class TTSContext(HandlerContext):
    def __init__(self, session_id: str):
        super().__init__(session_id)
        self.config = None
        self.local_session_id = 0
        self.input_text = ''
        self.dump_audio = False
        self.audio_dump_file = None
        self.shared_states = None
        self.current_speech_id = None
        self.interrupted_speech_id = None
        self.speech_first_sentence_cached = {}
        self.speech_first_sentence_processed = {}

# ===================== 核心Handler类（集成音色复刻+合成） =====================
class HandlerTTS(HandlerBase, ABC):
    def __init__(self):
        super().__init__()
        # 基础配置
        self.voice = None  # 最终使用的voice（复刻生成/默认配置）
        self.model_name = None
        self.api_key = None
        self.sample_rate = None
        # 音色复刻配置
        self.ref_audio_path = None
        self.ref_audio_text = None
        self.vc_preferred_name = None
        # 缓存标识（模型+音频文件，避免缓存冲突）
        self._vc_cache_key = None

    def get_handler_info(self) -> HandlerBaseInfo:
        return HandlerBaseInfo(config_model=TTSConfig)

    def get_handler_detail(self, session_context: SessionContext, context: HandlerContext) -> HandlerDetail:
        # 输出格式与原EdgeTTS/CosyVoice完全一致，项目无需修改
        definition = DataBundleDefinition()
        definition.add_entry(DataBundleEntry.create_audio_entry("avatar_audio", 1, self.sample_rate))
        inputs = {ChatDataType.AVATAR_TEXT: HandlerDataInfo(type=ChatDataType.AVATAR_TEXT)}
        outputs = {ChatDataType.AVATAR_AUDIO: HandlerDataInfo(type=ChatDataType.AVATAR_AUDIO, definition=definition)}
        return HandlerDetail(inputs=inputs, outputs=outputs)

    def load(self, engine_config: ChatEngineConfigModel, handler_config: Optional[BaseModel] = None):
        """加载配置 + 核心：执行音色复刻（首次）/加载缓存"""
        config = cast(TTSConfig, handler_config)
        # 1. 加载基础配置并校验
        self.api_key = config.api_key or os.getenv("DASHSCOPE_API_KEY")
        self.model_name = config.model_name or "qwen3-tts-v3-flash"
        self.sample_rate = config.sample_rate or DEFAULT_SAMPLE_RATE
        self.voice = config.voice or "longyingling_v3"  # 兜底默认音色
        if not self.api_key or not self.api_key.strip():
            raise RuntimeError("Qwen3 TTS 配置错误：api_key不能为空（配置文件/DASHSCOPE_API_KEY环境变量）")

        # 2. 加载音色复刻配置
        self.ref_audio_path = config.ref_audio_path
        self.ref_audio_text = config.ref_audio_text
        self.vc_preferred_name = config.vc_preferred_name or "custom_voice"

        # 3. 核心：执行音色复刻（仅当配置了有效参考音频时）
        if self.ref_audio_path and os.path.exists(self.ref_audio_path) and os.path.isfile(self.ref_audio_path):
            logger.info(f"检测到有效参考音频，启动音色复刻流程 | 音频路径：{self.ref_audio_path}")
            # 生成唯一缓存键（模型名+音频文件名，避免不同模型/音频缓存冲突）
            audio_filename = os.path.basename(self.ref_audio_path)
            self._vc_cache_key = f"{QWEN3_VC_TARGET_MODEL}_{self.model_name}_{audio_filename}_{self.vc_preferred_name}"
            # 加载缓存/执行复刻
            self._load_vc_cache() or self._do_voice_cloning()
        else:
            if self.ref_audio_path:
                logger.warning(f"参考音频路径无效（不存在/非文件），使用默认音色 | 配置路径：{self.ref_audio_path}")
            logger.info(f"Qwen3 TTS 基础配置加载完成 | 模型：{self.model_name} | 使用默认音色：{self.voice}")

    def _load_vc_cache(self) -> bool:
        """加载复刻结果缓存，返回：是否加载成功"""
        if not os.path.exists(VC_CACHE_FILE):
            logger.info(f"音色复刻缓存文件不存在 | 路径：{VC_CACHE_FILE}")
            return False
        try:
            with open(VC_CACHE_FILE, "r", encoding="utf-8") as f:
                cache_data = json.load(f)
            # 校验缓存有效性
            if self._vc_cache_key in cache_data and cache_data[self._vc_cache_key].strip():
                self.voice = cache_data[self._vc_cache_key]
                logger.info(f"✅ 加载音色复刻缓存成功 | 缓存键：{self._vc_cache_key} | 专属voice：{self.voice[:10]}***")
                return True
            else:
                logger.info(f"音色复刻缓存无有效数据，准备首次复刻")
                return False
        except (json.JSONDecodeError, KeyError, Exception) as e:
            logger.warning(f"加载音色复刻缓存失败（缓存损坏/格式错误），准备首次复刻 | 错误：{e}")
            return False

    def _save_vc_cache(self):
        """保存复刻生成的voice到本地缓存"""
        # 确保缓存目录存在
        cache_dir = os.path.dirname(VC_CACHE_FILE)
        if not os.path.exists(cache_dir):
            os.makedirs(cache_dir, exist_ok=True)
        # 读取原有缓存/新建
        cache_data = {}
        if os.path.exists(VC_CACHE_FILE):
            with open(VC_CACHE_FILE, "r", encoding="utf-8") as f:
                cache_data = json.load(f)
        # 写入新缓存
        cache_data[self._vc_cache_key] = self.voice
        with open(VC_CACHE_FILE, "w", encoding="utf-8") as f:
            json.dump(cache_data, f, ensure_ascii=False, indent=2)
        logger.info(f"✅ 音色复刻结果已缓存 | 缓存文件：{VC_CACHE_FILE} | 缓存键：{self._vc_cache_key}")

    def _do_voice_cloning(self):
        """执行核心：调用通义千问音色复刻API，生成专属voice"""
        logger.info(f"开始首次音色复刻 | 目标模型：{QWEN3_VC_TARGET_MODEL} | 音频：{os.path.basename(self.ref_audio_path)}")
        # 1. 读取参考音频并转Base64（API要求）
        try:
            with open(self.ref_audio_path, "rb") as f:
                audio_bytes = f.read()
            audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")
            audio_mime = "audio/mpeg" if self.ref_audio_path.endswith(".mp3") else "audio/wav"
            data_uri = f"data:{audio_mime};base64,{audio_base64}"
        except Exception as e:
            raise RuntimeError(f"读取/编码参考音频失败 | 错误：{e}")

        # 2. 构造复刻API请求
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "qwen-voice-enrollment",  # 复刻固定模型
            "input": {
                "action": "create",
                "target_model": QWEN3_VC_TARGET_MODEL,  # 适配Qwen3 TTS的复刻目标
                "preferred_name": self.vc_preferred_name,
                "audio": {"data": data_uri}
            }
        }
        # 可选：添加参考音频文本，提升复刻效果
        if self.ref_audio_text and self.ref_audio_text.strip():
            payload["input"]["text"] = self.ref_audio_text.strip()

        # 3. 调用复刻API
        try:
            response = requests.post(QWEN3_VC_API_URL, json=payload, headers=headers, timeout=30)
            response.raise_for_status()
            resp_json = response.json()
            self.voice = resp_json["output"]["voice"]  # 获取复刻生成的专属voice
            if not self.voice:
                raise RuntimeError("复刻API返回空voice")
        except requests.exceptions.RequestException as e:
            raise RuntimeError(f"音色复刻API调用失败 | 错误：{e} | 响应：{response.text if 'response' in locals() else '无'}")
        except (KeyError, ValueError) as e:
            raise RuntimeError(f"解析复刻API响应失败 | 错误：{e} | 响应：{resp_json if 'resp_json' in locals() else '无'}")

        # 4. 保存复刻结果到缓存
        self._save_vc_cache()
        logger.info(f"✅ 音色复刻完成 | 专属voice：{self.voice[:10]}*** | 后续将直接使用该音色")

    def create_context(self, session_context, handler_config=None):
        """创建上下文（完全复用原逻辑）"""
        if not isinstance(handler_config, TTSConfig):
            handler_config = TTSConfig()
        context = TTSContext(session_context.session_info.session_id)
        context.input_text = ''
        context.shared_states = session_context.shared_states
        # 音频dump（保存合成后的音频文件，方便调试）
        if context.dump_audio:
            dump_dir = os.path.join(DirectoryInfo.get_project_dir(), 'temp')
            os.makedirs(dump_dir, exist_ok=True)
            dump_file_path = os.path.join(dump_dir, f"dump_avatar_audio_{context.session_id}_{int(time.time())}.wav")
            context.audio_dump_file = open(dump_file_path, "wb")
        return context

    def start_context(self, session_context, context: HandlerContext):
        """启动上下文 + TTS连通性测试（使用复刻/默认voice）"""
        context = cast(TTSContext, context)
        # 测试合成（验证voice/API有效性）
        try:
            test_audio = self._call_qwen3_tts_api("音色加载成功，准备合成")
            logger.info(f"✅ Qwen3 TTS 上下文启动成功 | session_id：{context.session_id} | 使用音色：{self.voice[:10]}***")
        except Exception as e:
            logger.error(f"Qwen3 TTS 启动测试失败 | 错误：{e}")
            raise RuntimeError(f"Qwen3 TTS 合成测试失败，请检查API/voice有效性")

    def filter_text(self, text):
        """文本过滤逻辑（与原EdgeTTS完全一致，避免特殊字符导致合成失败）"""
        pattern = r"[^a-zA-Z0-9\u4e00-\u9fff,\~!?，。. ！？、（） ]"
        filtered_text = re.sub(pattern, "", text)
        return filtered_text

    def handle(self, context: HandlerContext, inputs: ChatData, output_definitions: Dict[ChatDataType, HandlerDataInfo]):
        """核心业务逻辑（完全复用，无任何修改）：speech_id管理/中断/首句缓存/句子拆分"""
        output_definition = output_definitions.get(ChatDataType.AVATAR_AUDIO).definition
        context = cast(TTSContext, context)
        if inputs.type != ChatDataType.AVATAR_TEXT:
            return
        text = inputs.data.get_main_data()
        speech_id = inputs.data.get_meta("speech_id") or context.session_id

        # 1. 新speech_id重置状态
        if context.current_speech_id is not None and context.current_speech_id != speech_id:
            logger.info(f'检测到新speech_id: {speech_id}，重置TTS状态')
            context.interrupted_speech_id = context.current_speech_id
            context.current_speech_id = None
            context.input_text = ''

        # 2. 更新当前speech_id并重置中断标志
        if context.current_speech_id != speech_id:
            if context.shared_states is not None:
                context.shared_states.tts_interrupt_flag = False
            context.current_speech_id = speech_id
            if speech_id not in context.speech_first_sentence_processed:
                context.speech_first_sentence_processed[speech_id] = False
                context.speech_first_sentence_cached[speech_id] = ''

        # 3. 检查TTS专用中断信号
        if context.shared_states is not None and context.shared_states.tts_interrupt_flag:
            logger.info(f'检测到中断信号，停止TTS | speech_id: {speech_id}')
            context.interrupted_speech_id = context.current_speech_id
            context.current_speech_id = None
            context.input_text = ''
            context.shared_states.tts_interrupt_flag = False
            return

        # 中断检查辅助函数
        def should_interrupt(check_speech_id: str) -> bool:
            if context.interrupted_speech_id == check_speech_id:
                return True
            if context.shared_states is not None and context.shared_states.tts_interrupt_flag:
                context.interrupted_speech_id = check_speech_id
                context.shared_states.tts_interrupt_flag = False
                return True
            if context.current_speech_id != check_speech_id:
                return True
            return False

        # 4. 文本处理
        if text is not None:
            text = re.sub(r"<\|.*?\|>", "", text)
            context.input_text += self.filter_text(text)
            if should_interrupt(speech_id):
                return

        text_end = inputs.data.get_meta("avatar_text_end", False)
        if should_interrupt(speech_id):
            logger.info(f'处理前检测到中断 | speech_id: {speech_id}')
            return

        # 5. 非结束态：按句子拆分处理（含首句缓存逻辑）
        if not text_end:
            sentences = re.split(r'(?<=[,~!?，. 。！？、（）])', context.input_text)
            if len(sentences) > 1:
                complete_sentences = sentences[:-1]
                context.input_text = sentences[-1]
                for sentence in complete_sentences:
                    if should_interrupt(speech_id) or len(sentence.strip()) < 1:
                        return
                    # 首句缓存（少于10字合并，提升合成体验）
                    cached_first_sentence = context.speech_first_sentence_cached.get(speech_id, '')
                    if cached_first_sentence:
                        combined_sentence = cached_first_sentence + sentence
                        context.speech_first_sentence_cached[speech_id] = ''
                        context.speech_first_sentence_processed[speech_id] = True
                        self._process_and_send_sentence(combined_sentence, speech_id, context, output_definition, should_interrupt)
                    else:
                        is_first_sentence = not context.speech_first_sentence_processed.get(speech_id, False)
                        if is_first_sentence:
                            clean_sentence = re.sub(r'[^\u4e00-\u9fa5a-zA-Z0-9]', '', sentence)
                            char_count = len(clean_sentence)
                            if char_count < 10:
                                context.speech_first_sentence_cached[speech_id] = sentence
                                context.speech_first_sentence_processed[speech_id] = True
                                logger.info(f'首句不足10字，缓存等待合并 | speech_id: {speech_id} | 字符数：{char_count}')
                            else:
                                context.speech_first_sentence_processed[speech_id] = True
                                self._process_and_send_sentence(sentence, speech_id, context, output_definition, should_interrupt)
                        else:
                            self._process_and_send_sentence(sentence, speech_id, context, output_definition, should_interrupt)
        # 6. 结束态：处理剩余文本并发送结束信号
        else:
            logger.info(f'处理最后文本 | speech_id: {speech_id} | 内容：{context.input_text[:50]}...')
            if should_interrupt(speech_id):
                context.input_text = ''
                self._send_speech_end_signal(speech_id, context, output_definition)
                return
            # 合并缓存首句
            cached_first_sentence = context.speech_first_sentence_cached.get(speech_id, '')
            final_text = cached_first_sentence + context.input_text if cached_first_sentence else context.input_text
            if final_text and len(final_text.strip()) > 0:
                self._process_and_send_sentence(final_text, speech_id, context, output_definition, should_interrupt)
            # 清理状态+发送结束信号
            context.input_text = ''
            self._clean_speech_state(speech_id, context)
            self._send_speech_end_signal(speech_id, context, output_definition)
            context.current_speech_id = None
            if context.interrupted_speech_id == speech_id:
                context.interrupted_speech_id = None
            logger.info(f'Qwen3 TTS 合成完成 | speech_id: {speech_id}')

    def _call_qwen3_tts_api(self, text: str) -> bytes:
        """核心：调用Qwen3 TTS合成API（使用复刻/默认voice），返回音频二进制（wav）"""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model_name,
            "input": {"text": text.strip()},
            "parameters": {
                "voice": self.voice,  # 关键：使用复刻生成/默认配置的voice
                "sample_rate": self.sample_rate,
                "format": DEFAULT_AUDIO_FORMAT
            }
        }
        try:
            response = requests.post(QWEN3_TTS_API_URL, json=payload, headers=headers, timeout=10)
            response.raise_for_status()
            return response.content  # 返回wav格式音频二进制
        except requests.exceptions.RequestException as e:
            logger.error(f"Qwen3 TTS 合成API调用失败 | 文本：{text[:20]} | 错误：{e}")
            raise RuntimeError(f"TTS合成失败：{e}")

    def _process_and_send_sentence(self, sentence: str, speech_id: str, context: TTSContext,
                                   output_definition: DataBundleDefinition, should_interrupt_func):
        """处理单句合成（替换原EdgeTTS，输出格式完全兼容）"""
        if len(sentence.strip()) < 1 or should_interrupt_func(speech_id):
            return
        logger.info(f'Qwen3 TTS 合成句子 | speech_id: {speech_id} | 内容：{sentence[:50]}...')

        # 1. 调用合成API获取音频二进制
        try:
            audio_bytes = self._call_qwen3_tts_api(sentence)
        except Exception as e:
            logger.error(f'句子合成失败 | 错误：{e}')
            return

        # 2. 中断二次检查
        if should_interrupt_func(speech_id):
            logger.info(f'合成后检测到中断，丢弃音频 | speech_id: {speech_id}')
            return

        # 3. 音频格式转换：与原EdgeTTS完全一致（float32 numpy数组，形状[1, N]，归一化到[-1,1]）
        output_audio = librosa.load(io.BytesIO(audio_bytes), sr=self.sample_rate)[0]
        output_audio = output_audio[np.newaxis, ...]  # 适配项目原有音频播放逻辑

        # 4. 音频dump（可选，保存合成文件）
        if context.audio_dump_file:
            context.audio_dump_file.write(audio_bytes)

        # 5. 构造输出DataBundle：与原项目完全兼容，无需修改
        output = DataBundle(output_definition)
        output.set_main_data(output_audio)
        output.add_meta("avatar_speech_end", False)
        output.add_meta("speech_id", speech_id)
        context.submit_data(output)

    def _send_speech_end_signal(self, speech_id: str, context: TTSContext, output_definition: DataBundleDefinition):
        """发送合成结束信号（与原逻辑一致）"""
        output = DataBundle(output_definition)
        output.set_main_data(np.zeros(shape=(1, 240), dtype=np.float32))
        output.add_meta("avatar_speech_end", True)
        output.add_meta("speech_id", speech_id)
        context.submit_data(output)
        logger.info(f'发送合成结束信号 | speech_id: {speech_id}')

    def _clean_speech_state(self, speech_id: str, context: TTSContext):
        """清理speech_id相关状态"""
        if speech_id in context.speech_first_sentence_processed:
            del context.speech_first_sentence_processed[speech_id]
        if speech_id in context.speech_first_sentence_cached:
            del context.speech_first_sentence_cached[speech_id]

    def destroy_context(self, context: HandlerContext):
        """销毁上下文（关闭文件句柄）"""
        context = cast(TTSContext, context)
        if context.audio_dump_file:
            context.audio_dump_file.close()
        logger.info(f'Qwen3 TTS 上下文销毁 | session_id：{context.session_id}')