import enum
import math
import os
from typing import cast, Dict, Optional, Tuple

import numpy as np
from loguru import logger
from pydantic import BaseModel, Field

from chat_engine.common.handler_base import HandlerBase, HandlerDetail, HandlerDataInfo, HandlerBaseInfo
from chat_engine.data_models.chat_data_type import ChatDataType
from chat_engine.contexts.handler_context import HandlerContext
from chat_engine.contexts.session_context import SessionContext
from chat_engine.data_models.chat_data.chat_data_model import ChatData
from chat_engine.data_models.chat_engine_config_data import ChatEngineConfigModel, HandlerBaseConfigModel
from chat_engine.data_models.runtime_data.data_bundle import DataBundle, DataBundleDefinition, DataBundleEntry
from engine_utils.general_slicer import SliceContext, slice_data
import asyncio
import threading

class SileroVADConfigModel(HandlerBaseConfigModel, BaseModel):
    speaking_threshold: float = Field(default=0.6)
    start_delay: int = Field(default=512)
    end_delay: int = Field(default=3060)
    buffer_look_back: int = Field(default=1024)
    speech_padding: int = Field(default=512)


class SpeakingStatus(enum.Enum):
    PRE_START = enum.auto()
    START = enum.auto()
    END = enum.auto()


class HumanAudioVADContext(HandlerContext):
    def __init__(self, session_id: str):
        super().__init__(session_id)
        self.config: SileroVADConfigModel = SileroVADConfigModel()
        self.speaking_status = SpeakingStatus.END

        self.clip_size = 512
        self.audio_history = []
        self.history_length_limit = 0

        self.speech_length: int = 0
        self.silence_length = 0

        self.shared_states = None  # 保留但不修改打断相关状态

        self.model_state: Optional[np.ndarray] = None
        self.slice_context: Optional[SliceContext] = None

        # 恢复speech_id自增的基础值（正常流程下自增）
        self.speech_id: int = 0

    def reset(self):
        self.audio_history.clear()
        self.speech_length = 0
        self.silence_length = 0
        if self.slice_context:  # 增加空值判断，提升健壮性
            self.slice_context.flush()

    def _update_status_on_pre_start(self, clip: np.ndarray, _timestamp: Optional[int] = None):
        if self.speech_length >= self.config.start_delay:
            head_sample_id = None
            self.speaking_status = SpeakingStatus.START

            sample_num_to_fetch = self.config.buffer_look_back + self.config.start_delay
            slice_num_to_fetch = math.ceil(sample_num_to_fetch / self.clip_size)

            audio_clips = []
            for history_entry in self.audio_history[-slice_num_to_fetch:]:
                history_clip, history_timestamp = history_entry
                if head_sample_id is None:
                    head_sample_id = history_timestamp
                audio_clips.append(history_clip)

            output_audio = np.concatenate(audio_clips, axis=0)
            output_audio = np.concatenate(
                [np.zeros(self.config.speech_padding, dtype=clip.dtype), output_audio], axis=0
            )

            # ========== 恢复：正常流程下speech_id自增（仅自增，不处理打断） ==========
            self.speech_id += 1
            speech_id = f"speech-{self.session_id}-{self.speech_id}"
            # ========== 移除：所有和打断相关的状态修改（interrupt_flag/current_speech_id） ==========

            logger.info(f"Start of human speech (正常流程) | speech_id={speech_id} | session_id={self.session_id}")

            extra_args = {
                "human_speech_start": True,
                "pre_padding": self.config.speech_padding,
            }
            if head_sample_id is not None:
                extra_args["head_sample_id"] = head_sample_id
                logger.info(f"VAD pre_start to start got timestamp {head_sample_id}")

            return output_audio, extra_args

        else:
            if self.silence_length > 0:
                logger.info("Back to not started status")
                self.speaking_status = SpeakingStatus.END
            return None, {}

    def _update_status_on_start(self, clip: np.ndarray, timestamp: Optional[int] = None):
        if self.silence_length >= self.config.end_delay:
            self.speaking_status = SpeakingStatus.END
            output_audio = np.concatenate(
                [clip, np.zeros(self.config.speech_padding, dtype=clip.dtype)], axis=0
            )
            logger.info(f"End of human speech | speech_id=speech-{self.session_id}-{self.speech_id}")
            extra_args = {
                "human_speech_end": True,
                "post_padding": self.config.speech_padding,
            }
            if timestamp is not None:
                extra_args["head_sample_id"] = timestamp
                logger.info(f"VAD start to end got timestamp {timestamp}")
            return output_audio, extra_args
        else:
            return clip, {"head_sample_id": timestamp}

    def _update_status_on_end(self, _clip: np.ndarray, _timestamp: Optional[int] = None):
        if self.speech_length > 0:
            logger.info("Pre start of new human speech (正常流程)")
            self.speaking_status = SpeakingStatus.PRE_START
        return None, {}

    def _append_to_history(self, clip: np.ndarray, timestamp: Optional[int] = None):
        self.audio_history.append((clip, timestamp))
        while 0 < self.history_length_limit < len(self.audio_history):
            self.audio_history.pop(0)

    def update_status(
        self,
        speech_prob: float,
        clip: np.ndarray,
        timestamp: Optional[int] = None
    ) -> Tuple[Optional[np.ndarray], Dict]:
        self._append_to_history(clip, timestamp)

        if speech_prob > self.config.speaking_threshold:
            self.speech_length += self.clip_size
            self.silence_length = 0
        else:
            self.silence_length += self.clip_size
            self.speech_length = 0

        if self.speaking_status == SpeakingStatus.PRE_START:
            return self._update_status_on_pre_start(clip, timestamp)
        elif self.speaking_status == SpeakingStatus.START:
            return self._update_status_on_start(clip, timestamp)
        elif self.speaking_status == SpeakingStatus.END:
            return self._update_status_on_end(clip, timestamp)


# ==========================================================
# 关键：Handler 类名必须叫 Handler
# ==========================================================
class Handler(HandlerBase):
    def __init__(self):
        super().__init__()
        self.model = None

    def get_handler_info(self):
        return HandlerBaseInfo(
            config_model=SileroVADConfigModel
        )

    def load(self, engine_config: ChatEngineConfigModel, handler_config=None):
        import onnxruntime
        model_name = "silero_vad.onnx"
        model_path = os.path.join(
            self.handler_root, "silero_vad",
            "src", "silero_vad", "data", model_name
        )
        options = onnxruntime.SessionOptions()
        options.inter_op_num_threads = 1
        options.intra_op_num_threads = 1
        options.log_severity_level = 4
        self.model = onnxruntime.InferenceSession(
            model_path,
            providers=["CPUExecutionProvider"],
            sess_options=options
        )

    def create_context(self, session_context: SessionContext, handler_config=None) -> HandlerContext:
        context = HumanAudioVADContext(session_context.session_info.session_id)
        context.shared_states = session_context.shared_states  # 保留引用但不修改打断状态
        if isinstance(handler_config, SileroVADConfigModel):
            context.config = handler_config

        context.model_state = np.zeros((2, 1, 128), dtype=np.float32)
        context.slice_context = SliceContext.create_numpy_slice_context(
            slice_size=context.clip_size,
            slice_axis=0,
        )
        context.history_length_limit = math.ceil(
            (context.config.start_delay + context.config.buffer_look_back) / context.clip_size
        )
        return context

    def start_context(self, session_context, handler_context):
        pass

    def get_handler_detail(self, session_context: SessionContext,
                           context: HandlerContext) -> HandlerDetail:
        definition = DataBundleDefinition()
        definition.add_entry(DataBundleEntry.create_audio_entry("human_audio", 1, 16000))

        inputs = {
            ChatDataType.MIC_AUDIO: HandlerDataInfo(type=ChatDataType.MIC_AUDIO)
        }
        outputs = {
            ChatDataType.HUMAN_AUDIO: HandlerDataInfo(
                type=ChatDataType.HUMAN_AUDIO,
                definition=definition
            )
        }
        return HandlerDetail(inputs=inputs, outputs=outputs)

    def _inference(self, context: HumanAudioVADContext, clip: np.ndarray, sr: int = 16000):
        clip = clip.squeeze()
        if clip.ndim != 1:
            logger.warning("Input audio should be 1-dim array")
            return 0
        clip = np.expand_dims(clip, axis=0)
        inputs = {
            "input": clip,
            "sr": np.array([sr], dtype=np.int64),
            "state": context.model_state
        }
        prob, state = self.model.run(None, inputs)
        context.model_state = state
        return prob[0][0]

    def handle(self, context: HandlerContext, inputs: ChatData,
            output_definitions: Dict[ChatDataType, HandlerDataInfo]):
        context = cast(HumanAudioVADContext, context)
        output_definition = output_definitions[ChatDataType.HUMAN_AUDIO].definition

        if not context.shared_states.enable_vad:
            return
        if inputs.type != ChatDataType.MIC_AUDIO:
            return

        audio = inputs.data.get_main_data()
        if audio is None:
            return

        audio_entry = inputs.data.get_main_definition_entry()
        sample_rate = audio_entry.sample_rate
        audio = audio.squeeze()

        timestamp = None
        if inputs.is_timestamp_valid():
            timestamp = inputs.timestamp

        if audio.dtype != np.float32:
            audio = audio.astype(np.float32) / 32767

        context.slice_context.update_start_id(timestamp[0] if timestamp else None, force_update=False)

        # ========== 移除：所有和打断相关的延迟重置逻辑 ==========

        for clip in slice_data(context.slice_context, audio):
            head_sample_id = context.slice_context.get_last_slice_start_index()
            speech_prob = self._inference(context, clip)
            audio_clip, extra_args = context.update_status(
                speech_prob, clip, timestamp=head_sample_id
            )

            human_speech_end = extra_args.get("human_speech_end", False)
            # 恢复：使用VAD自增的speech_id（正常流程），而非临时标识
            speech_id = f"speech-{context.session_id}-{context.speech_id}"

            if human_speech_end:
                context.reset()
                # ========== 移除：语音结束时修改打断状态的逻辑 ==========

            if audio_clip is not None:
                output = DataBundle(output_definition)
                # 保留音频打包核心逻辑，仅传递数据给ARS
                output.set_main_data(np.expand_dims(audio_clip, axis=0))
                for k, v in extra_args.items():
                    output.add_meta(k, v)
                # 恢复：传递自增的speech_id给ARS
                output.add_meta("speech_id", speech_id)

                chat_data = ChatData(
                    type=ChatDataType.HUMAN_AUDIO,
                    data=output
                )
                if head_sample_id is not None and head_sample_id >= 0:
                    chat_data.timestamp = head_sample_id, sample_rate
                yield chat_data

    def destroy_context(self, context: HandlerContext):
        pass