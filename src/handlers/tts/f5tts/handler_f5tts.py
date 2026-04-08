import re
import time  # 仅保留计时必要模块
from typing import Dict, Optional, cast

import numpy as np
import torch
import soundfile as sf
import librosa
from loguru import logger
from pydantic import BaseModel, Field

from importlib.resources import files
from hydra.utils import get_class
from omegaconf import OmegaConf

from chat_engine.contexts.handler_context import HandlerContext
from chat_engine.contexts.session_context import SessionContext
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
from chat_engine.data_models.chat_engine_config_data import HandlerBaseConfigModel

from f5_tts.infer.utils_infer import (
    chunk_text,
    infer_batch_process,
    load_model,
    load_vocoder,
    preprocess_ref_audio_text,
)

# =========================================================
# Config
# =========================================================

class TTSConfig(HandlerBaseConfigModel, BaseModel):
    model: str = Field(default="F5TTS_v1_Base")
    ckpt_file: Optional[str] = None
    tokenizer_path: Optional[str] = None
    ref_audio_path: Optional[str] = None
    ref_audio_text: Optional[str] = None
    device: Optional[str] = None

    # 保留配置但不再使用字符数阈值，仅保留句子结束符配置
    # min_trigger_chars: int = Field(default=20)  # 仅保留配置兼容性，逻辑中不再使用
    # max_trigger_chars: int = Field(default=30)  # 仅保留配置兼容性，逻辑中不再使用
    sentence_endings: str = Field(default="，。！？；：\n")  # 核心判断依据
    speed_rate: float = Field(
        default=1.10,
        description="语速倍数，1.0为原速，>1.0加速，<1.0减速"
    )

# =========================================================
# Context
# =========================================================

class TTSContext(HandlerContext):
    def __init__(self, session_id: str):
        super().__init__(session_id)
        self.buffer_text: str = ""
        self.last_speech_id: Optional[str] = None
        self.end_sent: bool = False
        # 移除首块标记（已无字符数低门槛逻辑）
        # self.first_synth: bool = False  # 已删除

# =========================================================
# Handler
# =========================================================

class HandlerTTS_F5(HandlerBase):

    def get_handler_info(self) -> HandlerBaseInfo:
        return HandlerBaseInfo(config_model=TTSConfig)

    def get_handler_detail(self, session_context, context) -> HandlerDetail:
        self.sample_rate = 24000
        definition = DataBundleDefinition()
        definition.add_entry(
            DataBundleEntry.create_audio_entry(
                name="avatar_audio",
                channel_num=1,
                sample_rate=self.sample_rate,
            )
        )
        return HandlerDetail(
            inputs={ChatDataType.AVATAR_TEXT: HandlerDataInfo(type=ChatDataType.AVATAR_TEXT)},
            outputs={ChatDataType.AVATAR_AUDIO: HandlerDataInfo(
                type=ChatDataType.AVATAR_AUDIO,
                definition=definition,
            )},
        )

    # -----------------------------------------------------
    # Load
    # -----------------------------------------------------

    def load(self, engine_config, handler_config=None):
        cfg = cast(TTSConfig, handler_config)
        self.cfg = cfg
        self.device = cfg.device or ("cuda" if torch.cuda.is_available() else "cpu")

        model_cfg = OmegaConf.load(
            str(files("f5_tts").joinpath(f"configs/{cfg.model}.yaml"))
        )
        model_cls = get_class(f"f5_tts.model.{model_cfg.model.backbone}")
        ckpt = cfg.ckpt_file or model_cfg.model.ckpt

        self.model = load_model(
            model_cls=model_cls,
            model_cfg=model_cfg.model.arch,
            ckpt_path=ckpt,
            mel_spec_type=model_cfg.model.mel_spec.mel_spec_type,
            vocab_file=cfg.tokenizer_path,
            device=self.device,
        )
        self.vocoder = load_vocoder(
            vocoder_name=model_cfg.model.mel_spec.mel_spec_type,
            device=self.device,
        )
        self._load_reference(cfg.ref_audio_path, cfg.ref_audio_text)

        # warmup
        for _ in infer_batch_process(
            (self.ref_audio, self.ref_sr),
            self.ref_text,
            ["你好"],
            self.model,
            self.vocoder,
            streaming=True,
            device=self.device,
        ):
            pass

    def _load_reference(self, path, text):
        path, text = preprocess_ref_audio_text(path, text)
        wav, sr = sf.read(path, dtype="float32")
        if wav.ndim == 2:
            wav = wav.mean(axis=1)
        
        if self.cfg.speed_rate != 1.0:
            wav = librosa.effects.time_stretch(wav, rate=self.cfg.speed_rate)
        
        self.ref_audio = torch.from_numpy(wav).unsqueeze(0)
        self.ref_sr = sr
        self.ref_text = text
        dur = wav.shape[0] / sr
        self.max_chars = max(50, int(len(text) / dur * (25 - dur)))

    # -----------------------------------------------------
    # Handle（仅保留标点符号和文本结束作为触发条件）
    # -----------------------------------------------------

    def handle(self, context, inputs, output_defs):
        context = cast(TTSContext, context)

        if inputs.type != ChatDataType.AVATAR_TEXT:
            return

        text = inputs.data.get_main_data() or ""
        is_end = inputs.data.get_meta("avatar_text_end", False)
        speech_id = inputs.data.get_meta("speech_id", context.session_id)

        if context.last_speech_id != speech_id:
            context.buffer_text = ""
            context.end_sent = False
            # 移除首块标记重置（已删除该字段）
            # context.first_synth = False
            context.last_speech_id = speech_id

        context.buffer_text += text
        buffer = context.buffer_text

        # ===== 核心修改：仅以标点符号/文本结束为触发条件 =====
        should_synth = False
        
        # 1. 唯一触发条件1：文本中包含任意句子结束符（完全以标点为准）
        for ch in buffer:  # 检查整个缓冲文本是否有结束符
            if ch in self.cfg.sentence_endings:
                should_synth = True
                break
        
        # 2. 唯一触发条件2：收到文本结束标记且缓冲有内容
        if is_end and buffer.strip():
            should_synth = True

        # ===== synth 核心逻辑（仅计算RTF）=====
        if should_synth:
            context.buffer_text = ""  # 触发后清空缓冲
            clean_text = re.sub(r"<\|.*?\|>", "", buffer).strip()
            if clean_text:
                sentences = chunk_text(clean_text, self.max_chars)
                output_def = output_defs[ChatDataType.AVATAR_AUDIO].definition
                
                total_synth_time = 0.0  # 总合成耗时
                total_audio_dur = 0.0   # 总音频时长
                chunk_idx = 0           # 音频块索引

                for audio_chunk, _ in infer_batch_process(
                    (self.ref_audio, self.ref_sr),
                    self.ref_text,
                    sentences,
                    self.model,
                    self.vocoder,
                    streaming=True,
                    device=self.device,
                ):
                    if audio_chunk is None:
                        continue
                    
                    # 计时：单块合成耗时
                    chunk_start = time.time()

                    # 音频格式转换
                    if isinstance(audio_chunk, torch.Tensor):
                        audio_chunk = audio_chunk.cpu().numpy()
                    if audio_chunk.ndim == 1:
                        audio_chunk = audio_chunk[np.newaxis, :]
                    
                    # 计算单块耗时和时长
                    chunk_synth_time = time.time() - chunk_start
                    chunk_audio_dur = audio_chunk.shape[1] / self.sample_rate

                    # 累计总耗时和总时长
                    total_synth_time += chunk_synth_time
                    total_audio_dur += chunk_audio_dur

                    # 计算并打印单块RTF
                    chunk_rtf = chunk_synth_time / chunk_audio_dur if chunk_audio_dur > 0 else 0.0
                    logger.info(f"[F5-TTS RTF] speech_id={speech_id} | chunk={chunk_idx} | RTF={chunk_rtf:.6f}")

                    # 提交音频数据
                    bundle = DataBundle(output_def)
                    bundle.set_main_data(audio_chunk)
                    bundle.add_meta("avatar_speech_end", False)
                    bundle.add_meta("speech_id", speech_id)
                    context.submit_data(bundle)

                    chunk_idx += 1

                # 计算并打印整体RTF
                total_rtf = total_synth_time / total_audio_dur if total_audio_dur > 0 else 0.0
                logger.info(f"[F5-TTS RTF SUMMARY] speech_id={speech_id} | total_chunks={chunk_idx} | total_RTF={total_rtf:.6f}")

        # ===== speech end =====
        if is_end and not context.end_sent:
            output_def = output_defs[ChatDataType.AVATAR_AUDIO].definition
            frame_len = self.sample_rate // 25
            silence = np.zeros((1, frame_len * 3), np.float32)
            end_bundle = DataBundle(output_def)
            end_bundle.set_main_data(silence)
            end_bundle.add_meta("avatar_speech_end", True)
            end_bundle.add_meta("speech_id", speech_id)
            context.submit_data(end_bundle)
            context.end_sent = True
            logger.info(f"[F5-TTS] speech end: {speech_id}")

    def create_context(self, session_context, handler_config=None):
        return TTSContext(session_context.session_info.session_id)

    def start_context(self, session_context, handler_context):
        pass

    def destroy_context(self, context):
        pass