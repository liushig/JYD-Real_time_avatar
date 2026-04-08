# 301：tts阶段可延时中断，avatar阶段不可中断
import re
from typing import Dict, Optional, cast, Tuple
from loguru import logger
import numpy as np
from pydantic import BaseModel, Field
import os
import torch

from chat_engine.contexts.handler_context import HandlerContext
from chat_engine.data_models.chat_engine_config_data import ChatEngineConfigModel, HandlerBaseConfigModel
from chat_engine.common.handler_base import HandlerBase, HandlerBaseInfo, HandlerDataInfo, HandlerDetail
from chat_engine.data_models.chat_data.chat_data_model import ChatData
from chat_engine.data_models.chat_data_type import ChatDataType
from chat_engine.data_models.runtime_data.data_bundle import DataBundle, DataBundleDefinition, DataBundleEntry
from chat_engine.contexts.session_context import SessionContext

from funasr import AutoModel
from engine_utils.directory_info import DirectoryInfo
from engine_utils.general_slicer import SliceContext, slice_data


class ASRConfig(HandlerBaseConfigModel, BaseModel):
    model_name: str = Field(default="iic/SenseVoiceSmall")
    # 最终版唤醒词正则：仅匹配开头+支持小达/小的/小德+兼容标点/空格+支持漏掉"你"的情况（如"好小达"）
    # 匹配：你好小达、好小达、你好小达、你好小的、好小的 等变体
    wakeup_words_pattern: str = Field(
        default=r"^((你)?好\s*[，,]?\s*(小达|小的|小德|小岛|小当|小唐|小打)|(等一下|停一下|暂停|别说了|打住|一下|等一下|停一下|闭嘴|stop|shut up))"
    )


class ASRContext(HandlerContext):
    def __init__(self, session_id: str):
        super().__init__(session_id)
        self.config = None
        self.local_session_id = 0
        self.output_audios = []
        self.audio_slice_context = SliceContext.create_numpy_slice_context(
            slice_size=16000,
            slice_axis=0,
        )

        self.cache = {}

        self.dump_audio = True
        self.audio_dump_file = None
        if self.dump_audio:
            dump_file_path = os.path.join(
                DirectoryInfo.get_project_dir(), "dump_talk_audio.pcm"
            )
            self.audio_dump_file = open(dump_file_path, "wb")

        self.shared_states = None


# ==========================================================
# 核心 Handler 类（按avatar_mode控制文本拦截+interrupt_flag）
# ==========================================================
class Handler(HandlerBase):
    def __init__(self):
        super().__init__()

        self.model_name = 'iic/SenseVoiceSmall'
        self.wakeup_pattern = None

        # 仅记录设备信息
        if torch.cuda.is_available():
            self.device = torch.device("cuda:0")
        elif torch.backends.mps.is_available():
            self.device = torch.device("mps")
        else:
            self.device = torch.device("cpu")
        logger.info(f"[ASR] 检测到可用计算设备：{self.device}")

    def get_handler_info(self) -> HandlerBaseInfo:
        return HandlerBaseInfo(
            name="ASR_Funasr",
            config_model=ASRConfig,
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
        if isinstance(handler_config, ASRConfig):
            self.model_name = handler_config.model_name
            # 编译正则：忽略大小写+仅匹配唤醒词开头
            self.wakeup_pattern = re.compile(handler_config.wakeup_words_pattern, re.IGNORECASE)

        # 兜底正则：同步支持小达/小的/小德+支持漏掉"你"的情况（关键修复）
        if self.wakeup_pattern is None:
            self.wakeup_pattern = re.compile(r"^(你)?好\s*[，,]?\s*(|小达|小的|小德)", re.IGNORECASE)

        # 加载ASR模型（无device参数）
        self.model = AutoModel(
            model=self.model_name,
            disable_update=True
        )
        logger.info(f"[ASR] 模型加载完成：{self.model_name}（自动使用设备：{self.device}）")

    def create_context(self, session_context, handler_config=None):
        if not isinstance(handler_config, ASRConfig):
            handler_config = ASRConfig()
        context = ASRContext(session_context.session_info.session_id)
        context.shared_states = session_context.shared_states
        logger.info(f"[ASR] 创建上下文 | 会话ID：{context.session_id}")
        return context

    def start_context(self, session_context, handler_context):
        pass

    # ==============================
    # 1. 严格唤醒词检测（仅开头匹配）
    # ==============================
    def _check_wakeup_words(self, text: str) -> Tuple[bool, Optional[str]]:
        """
        严格检测：仅文本开头包含「你好小达/小的/小德」或「好小达/小的/小德」（支持漏掉"你"）才触发
        返回：(是否检测到, 匹配到的具体关键字/None)
        """
        if not text or self.wakeup_pattern is None:
            return False, None
        
        # 仅匹配开头（避免中间出现唤醒词误触发）
        match = self.wakeup_pattern.match(text.strip())
        if match:
            # 提取匹配的关键字：优先取第二个分组（名字部分），如果没有则取第一个分组或整个匹配
            groups = match.groups()
            if len(groups) >= 2 and groups[1]:
                keyword = groups[1]  # 名字部分（小达/小的/小德等）
            elif len(groups) >= 1 and groups[0]:
                keyword = groups[0]  # "你"或"好"
            else:
                keyword = match.group(0)  # 整个匹配
            # 如果没有提取到具体名字，使用默认值
            if not keyword:
                keyword = "小达"
            return True, keyword  # 仅返回结果，不在此打印日志（统一在handle中控制）
        return False, None

    # ==============================
    # 2. 解析speech_id中的session_id
    # ==============================
    def _parse_session_id_from_speech_id(self, speech_id: str) -> Optional[str]:
        """从speech_id（格式：speech-{session_id}-{num}）中解析出session_id"""
        try:
            parts = speech_id.split("-")
            if len(parts) >= 3 and parts[0] == "speech":
                return parts[1]
        except Exception as e:
            logger.warning(f"[ASR] 解析speech_id中的session_id失败 | speech_id: {speech_id} | 错误：{e}")
        return None

    # ==============================
    # 3. 中断判断：仅interrupt_flag=True（唤醒词+avatar_mode=running）才中断
    # ==============================
    def _is_interrupted(self, context: ASRContext, speech_id: str) -> bool:
        shared = context.shared_states
        if shared is None:
            logger.warning(f"[ASR] shared_states 为空，跳过中断判断 | speech_id: {speech_id}")
            return False

        # 新增：获取avatar_mode，仅当avatar_mode=running且interrupt_flag=True时才判定为中断
        avatar_mode = getattr(shared, 'avatar_mode', 'ending')
        interrupt_flag = getattr(shared, 'interrupt_flag', False)
        
        if interrupt_flag and avatar_mode == "running":
            logger.info(f"[ASR] 中断判断 | avatar_mode={avatar_mode} + 唤醒词触发interrupt_flag=True，判定为中断 | speech_id：{speech_id}")
            return True
        else:
            logger.info(f"[ASR] 中断判断 | avatar_mode={avatar_mode} + interrupt_flag={interrupt_flag}，不判定为中断 | speech_id：{speech_id}")
            return False

    # ==============================
    # 4. 状态更新：仅同步current_speech_id，不主动修改interrupt_flag
    # ==============================
    def _update_normal_state(self, context: ASRContext, speech_id: str, force_update: bool = False):
        """
        状态更新规则：
        1. 强制更新：仅同步current_speech_id，不修改interrupt_flag
        2. 普通更新：仅同步current_speech_id，interrupt_flag不主动修改（保持原有值）
        """
        shared = context.shared_states
        if shared is None:
            logger.warning(f"[ASR] shared_states 为空，无法更新状态 | speech_id: {speech_id}")
            return
        
        # 仅同步current_speech_id（保证会话内ID一致）
        if force_update or shared.current_speech_id != speech_id:
            shared.current_speech_id = speech_id

    # ==============================
    # 5. 核心处理逻辑（按avatar_mode控制文本拦截+interrupt_flag）
    # ==============================
    def handle(self, context: HandlerContext, inputs: ChatData,
               output_definitions: Dict[ChatDataType, HandlerDataInfo]):

        output_definition = output_definitions[ChatDataType.HUMAN_TEXT].definition
        context = cast(ASRContext, context)

        if inputs.type != ChatDataType.HUMAN_AUDIO:
            return

        audio = inputs.data.get_main_data()
        speech_id = inputs.data.get_meta("speech_id") or f"speech-{context.session_id}-temp"
        shared = context.shared_states

        # 第一步：仅同步current_speech_id，不触发中断
        self._update_normal_state(context, speech_id, force_update=True)

        # 收集音频（仅avatar_mode=running+interrupt_flag=True时才中断收集）
        if audio is not None:
            audio = audio.squeeze()
            for audio_segment in slice_data(context.audio_slice_context, audio):
                if self._is_interrupted(context, speech_id):
                    logger.info(f"[ASR] 音频收集阶段触发中断（avatar_mode=running+唤醒词） | speech_id：{speech_id}")
                    context.output_audios.clear()
                    context.audio_slice_context.flush()
                    return

                if audio_segment is None or audio_segment.shape[0] == 0:
                    continue
                context.output_audios.append(audio_segment)

        speech_end = inputs.data.get_meta("human_speech_end", False)
        if not speech_end:
            return

        # 语音结束后检查（仅avatar_mode=running+interrupt_flag=True时才中断）
        if self._is_interrupted(context, speech_id):
            logger.info(f"[ASR] 语音结束后触发中断（avatar_mode=running+唤醒词） | speech_id：{speech_id}")
            context.output_audios.clear()
            context.audio_slice_context.flush()
            return

        # 音频拼接
        remainder_audio = context.audio_slice_context.flush()
        if remainder_audio is not None:
            if remainder_audio.shape[0] < context.audio_slice_context.slice_size:
                remainder_audio = np.concatenate(
                    [remainder_audio,
                     np.zeros(
                         shape=(context.audio_slice_context.slice_size - remainder_audio.shape[0])
                     )]
                )
            context.output_audios.append(remainder_audio)

        output_audio = np.concatenate(context.output_audios)
        if context.audio_dump_file is not None:
            context.audio_dump_file.write(output_audio.tobytes())

        # ASR推理
        res = self.model.generate(input=output_audio, batch_size_s=10)
        context.output_audios.clear()

        # 推理后检查（仅avatar_mode=running+interrupt_flag=True时才中断）
        if self._is_interrupted(context, speech_id):
            logger.info(f"[ASR] 推理结果无效（avatar_mode=running+唤醒词中断），丢弃 | speech_id：{speech_id}")
            return

        # 提取文本（清理无用标记）
        output_text = re.sub(r"<\|.*?\|>", "", res[0]['text']).strip()
        if len(output_text) == 0:
            self._update_normal_state(context, speech_id)
            if shared is not None:
                shared.enable_vad = True
            return

        # ======================
        # 核心逻辑：按avatar_mode分支处理
        # ======================
        avatar_mode = getattr(shared, 'avatar_mode', 'ending') if shared else 'ending'
        wakeup_detected, wakeup_keyword = self._check_wakeup_words(output_text)

        # 分支1：avatar_mode=running → 拦截文本+按唤醒词修改interrupt_flag
        if avatar_mode == "running":
            logger.info(f"[ASR] avatar_mode=running，拦截文本向下流转 | 识别文本：{output_text} | speech_id：{speech_id}")
            
            # 子逻辑：唤醒词文本 → 置interrupt_flag=True（给RTC用）和tts_interrupt_flag=True（给TTS用）；非唤醒词 → 保持False
            if wakeup_detected:
                if shared is not None:
                    shared.interrupt_flag = True  # RTC 使用的打断信号
                    shared.tts_interrupt_flag = True  # TTS 专用的打断信号（与 interrupt_flag 分离）
                    shared.avatar_interrupt_flag = True  # 数字人专用的打断信号（与 interrupt_flag 分离）
                    shared.llm_interrupt_flag = True  # LLM 专用的打断信号（与 interrupt_flag 分离）
                    logger.info(f"[ASR] avatar_mode=running且检测到唤醒词，置interrupt_flag=True（RTC）和tts_interrupt_flag、avatar_interrupt_flag、llm_interrupt_flag=True（TTS、数字人、LLM） | 唤醒词：{wakeup_keyword} | speech_id：{speech_id}")  
            # 非唤醒词不修改interrupt_flag，保持原有False
            
            self._update_normal_state(context, speech_id)
            return  # 直接返回，不传递文本

        # 分支2：avatar_mode=ending → 正常执行所有流程（包括唤醒词文本也传递）
        else:
            logger.info(f"[ASR] 文字生成完成 | 文本：{output_text} | avatar_mode：{avatar_mode}")
            
            # 唤醒词检测仅打印日志，不修改interrupt_flag
            # if wakeup_detected:
            #     logger.info(f"[ASR] 检测到唤醒词但avatar_mode=ending，不修改interrupt_flag | 唤醒词：{wakeup_keyword} | 文本：{output_text}")
            
            # 正常发送文字数据（无论是否是唤醒词）
            self._update_normal_state(context, speech_id)
            output = DataBundle(output_definition)
            output.set_main_data(output_text)
            output.add_meta("human_text_end", False)
            output.add_meta("speech_id", speech_id)
            yield ChatData(type=ChatDataType.HUMAN_TEXT, data=output)

            end_output = DataBundle(output_definition)
            end_output.set_main_data("")
            end_output.add_meta("human_text_end", True)
            end_output.add_meta("speech_id", speech_id)
            yield ChatData(type=ChatDataType.HUMAN_TEXT, data=end_output)

    # ==============================
    # 6. 销毁上下文（清理状态）
    # ==============================
    def destroy_context(self, context: HandlerContext):
        if context.shared_states is not None:
            logger.info(f"[ASR] 销毁上下文，重置状态 | 会话ID：{context.session_id}")
            # 重置interrupt_flag和tts_interrupt_flag，保留avatar_mode
            context.shared_states.interrupt_flag = False
            context.shared_states.tts_interrupt_flag = False
            context.shared_states.avatar_interrupt_flag = False
            context.shared_states.llm_interrupt_flag = False
            
            context.shared_states.current_speech_id = None
        if context.audio_dump_file is not None:
            context.audio_dump_file.close()
            context.audio_dump_file = None
        logger.info(f"[ASR] 上下文销毁完成 | 会话ID：{context.session_id}")