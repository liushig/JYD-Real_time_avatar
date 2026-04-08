import io
import edge_tts
import os
import re
import time
import threading  # 线程安全依赖
from typing import Dict, Optional, cast
import librosa
import numpy as np
from loguru import logger
from pydantic import BaseModel, Field
from abc import ABC
from chat_engine.contexts.handler_context import HandlerContext
from chat_engine.data_models.chat_engine_config_data import ChatEngineConfigModel, HandlerBaseConfigModel
from chat_engine.common.handler_base import HandlerBase, HandlerBaseInfo, HandlerDataInfo, HandlerDetail
from chat_engine.data_models.chat_data.chat_data_model import ChatData
from chat_engine.data_models.chat_data_type import ChatDataType
from chat_engine.contexts.session_context import SessionContext
from chat_engine.data_models.runtime_data.data_bundle import DataBundle, DataBundleDefinition, DataBundleEntry
from engine_utils.directory_info import DirectoryInfo

# 全局锁（确保ASR/TTS操作interrupt_flag时互斥）
INTERRUPT_LOCK = threading.Lock()

class TTSConfig(HandlerBaseConfigModel, BaseModel):
    ref_audio_path: str = Field(default=None)
    ref_audio_text: str = Field(default=None)
    voice: str = Field(default=None)
    sample_rate: int = Field(default=24000)

class TTSContext(HandlerContext):
    def __init__(self, session_id: str):
        super().__init__(session_id)
        self.config = None
        self.local_session_id = 0
        self.input_text = ''
        self.dump_audio = False
        self.audio_dump_file = None
        self.session_context: Optional[SessionContext] = None

class HandlerTTS(HandlerBase, ABC):
    def __init__(self):
        super().__init__()
        self.ref_audio_path = None
        self.ref_audio_text = None
        self.voice = None
        self.ref_audio_buffer = None
        self.sample_rate = None

    def get_handler_info(self) -> HandlerBaseInfo:
        return HandlerBaseInfo(
            config_model=TTSConfig,
        )

    def get_handler_detail(self, session_context: SessionContext,
                           context: HandlerContext) -> HandlerDetail:
        definition = DataBundleDefinition()
        definition.add_entry(DataBundleEntry.create_audio_entry("avatar_audio", 1, self.sample_rate))
        inputs = {
            ChatDataType.AVATAR_TEXT: HandlerDataInfo(
                type=ChatDataType.AVATAR_TEXT,
            )
        }
        outputs = {
            ChatDataType.AVATAR_AUDIO: HandlerDataInfo(
                type=ChatDataType.AVATAR_AUDIO,
                definition=definition,
            )
        }
        return HandlerDetail(
            inputs=inputs, outputs=outputs,
        )

    def load(self, engine_config: ChatEngineConfigModel, handler_config: Optional[BaseModel] = None):
       config = cast(TTSConfig, handler_config)
       self.voice = config.voice
       self.sample_rate = config.sample_rate
       self.ref_audio_path = config.ref_audio_path
       self.ref_audio_text = config.ref_audio_text

    def create_context(self, session_context, handler_config=None):
        if not isinstance(handler_config, TTSConfig):
            handler_config = TTSConfig()
        context = TTSContext(session_context.session_info.session_id)
        context.session_context = session_context
        context.input_text = ''
        if context.dump_audio:
            dump_file_path = os.path.join(DirectoryInfo.get_project_dir(), 'temp',
                                            f"dump_avatar_audio_{context.session_id}_{time.localtime().tm_hour}_{time.localtime().tm_min}.pcm")
            context.audio_dump_file = open(dump_file_path, "wb")
        return context
    
    def start_context(self, session_context, context: HandlerContext):
        context = cast(TTSContext, context)
        edge_tts.Communicate(text="测试音频启动", voice=self.voice)

    def filter_text(self, text):
        pattern = r"[^a-zA-Z0-9\u4e00-\u9fff,.\~!?，。！？ ]"
        filtered_text = re.sub(pattern, "", text)
        return filtered_text

    def handle(self, context: HandlerContext, inputs: ChatData,
               output_definitions: Dict[ChatDataType, HandlerDataInfo]):
        context = cast(TTSContext, context)
        session_context = context.session_context
        if not session_context:
            logger.error("TTSContext未关联SessionContext，无法处理中断逻辑")
            return

        output_definition = output_definitions.get(ChatDataType.AVATAR_AUDIO).definition
        
        if inputs.type == ChatDataType.AVATAR_TEXT:
            text = inputs.data.get_main_data()
        else:
            return
        
        speech_id = inputs.data.get_meta("speech_id")
        if speech_id is None:
            speech_id = context.session_id
        
        # ========== 仅同步speech_id到全局（不做中断判定） ==========
        with INTERRUPT_LOCK:
            session_context.shared_states.current_speech_id = speech_id
            logger.info(f"[TTS任务同步] 当前speech_id={speech_id}已同步到全局")

        # ========== 检查点1：处理开始前（仅判断interrupt_flag） ==========
        with INTERRUPT_LOCK:
            global_interrupt_flag = session_context.shared_states.interrupt_flag
        logger.info(f"[TTS中断检查-处理开始前] speech_id={speech_id}, interrupt_flag={global_interrupt_flag}")
        
        if global_interrupt_flag:
            logger.warning(f"[关键字打断触发] speech_id={speech_id}，清空缓存并重置状态")
            context.input_text = ''
            # 重置中断标志和任务ID（恢复可接收新任务状态）
            with INTERRUPT_LOCK:
                session_context.shared_states.current_speech_id = None
                session_context.shared_states.interrupt_flag = False
            # 提交结束包
            output = DataBundle(output_definition)
            output.set_main_data(np.zeros(shape=(1, 240), dtype=np.float32))
            output.add_meta("avatar_speech_end", True)
            output.add_meta("speech_id", None)
            context.submit_data(output)
            return

        if text is not None:
            text = re.sub(r"<\|.*?\|>", "", text)
            context.input_text += self.filter_text(text)

        text_end = inputs.data.get_meta("avatar_text_end", False)
        if not text_end:
            sentences = re.split(r'(?<=[,.~!?，。！？])', context.input_text)
            if len(sentences) > 1:
                complete_sentences = sentences[:-1]
                context.input_text = sentences[-1]

                for sentence in complete_sentences:
                    # ========== 检查点2：句子处理前（仅判断interrupt_flag） ==========
                    with INTERRUPT_LOCK:
                        global_interrupt_flag = session_context.shared_states.interrupt_flag
                    # logger.info(f"[TTS中断检查-句子处理前] sentence='{sentence}', interrupt_flag={global_interrupt_flag}")
                    
                    if global_interrupt_flag:
                        logger.warning(f"[关键字打断触发] 退出句子处理循环，当前句子：{sentence}")
                        context.input_text = ''
                        with INTERRUPT_LOCK:
                            session_context.shared_states.current_speech_id = None
                            session_context.shared_states.interrupt_flag = False
                        output = DataBundle(output_definition)
                        output.set_main_data(np.zeros(shape=(1, 240), dtype=np.float32))
                        output.add_meta("avatar_speech_end", True)
                        output.add_meta("speech_id", None)
                        context.submit_data(output)
                        return
                    
                    if len(sentence.strip()) < 1:
                        continue
                    logger.info('current sentence' + sentence)
                    
                    communicate = edge_tts.Communicate(sentence, self.voice)
                    data = b''

                    for chunk in communicate.stream_sync():
                        # ========== 检查点3：合成过程中（仅判断interrupt_flag） ==========
                        with INTERRUPT_LOCK:
                            global_interrupt_flag = session_context.shared_states.interrupt_flag
                        # logger.info(f"[TTS中断检查-合成过程中] sentence='{sentence}', interrupt_flag={global_interrupt_flag}")
                        
                        if global_interrupt_flag:
                            logger.warning(f"[关键字打断触发] 停止当前句子合成: {sentence}")
                            data = b''
                            context.input_text = ''
                            with INTERRUPT_LOCK:
                                session_context.shared_states.current_speech_id = None
                                session_context.shared_states.interrupt_flag = False
                            output = DataBundle(output_definition)
                            output.set_main_data(np.zeros(shape=(1, 240), dtype=np.float32))
                            output.add_meta("avatar_speech_end", True)
                            output.add_meta("speech_id", None)
                            context.submit_data(output)
                            return
                        
                        if chunk['type'] == 'audio':
                            data += chunk['data']
                    
                    output_audio = librosa.load(io.BytesIO(data), sr=None)[0]
                    output_audio = output_audio[np.newaxis, ...]
                    output = DataBundle(output_definition)
                    output.set_main_data(output_audio)
                    output.add_meta("avatar_speech_end", False)
                    output.add_meta("speech_id", speech_id)
                    context.submit_data(output)
        else:
            # ========== 检查点4：最后句子合成前（仅判断interrupt_flag） ==========
            with INTERRUPT_LOCK:
                global_interrupt_flag = session_context.shared_states.interrupt_flag
            logger.info(f"[TTS中断检查-最后句子合成前] input_text='{context.input_text}', interrupt_flag={global_interrupt_flag}")
            
            if global_interrupt_flag:
                logger.warning(f"[关键字打断触发] 跳过最后句子的合成")
                context.input_text = ''
                with INTERRUPT_LOCK:
                    session_context.shared_states.current_speech_id = None
                    session_context.shared_states.interrupt_flag = False
                output = DataBundle(output_definition)
                output.set_main_data(np.zeros(shape=(1, 240), dtype=np.float32))
                output.add_meta("avatar_speech_end", True)
                output.add_meta("speech_id", None)
                context.submit_data(output)
                return
            
            logger.info('last sentence' + context.input_text)
            if context.input_text is not None and len(context.input_text.strip()) > 0:
                    communicate = edge_tts.Communicate(context.input_text, self.voice)
                    data = b''

                    for chunk in communicate.stream_sync():
                        # ========== 检查点5：最后句子合成中（仅判断interrupt_flag） ==========
                        with INTERRUPT_LOCK:
                            global_interrupt_flag = session_context.shared_states.interrupt_flag
                        # logger.info(f"[TTS中断检查-最后句子合成中] input_text='{context.input_text}', interrupt_flag={global_interrupt_flag}")
                        
                        if global_interrupt_flag:
                            logger.warning(f"[关键字打断触发] 最后句子合成中停止: {context.input_text}")
                            data = b''
                            context.input_text = ''
                            with INTERRUPT_LOCK:
                                session_context.shared_states.current_speech_id = None
                                session_context.shared_states.interrupt_flag = False
                            output = DataBundle(output_definition)
                            output.set_main_data(np.zeros(shape=(1, 240), dtype=np.float32))
                            output.add_meta("avatar_speech_end", True)
                            output.add_meta("speech_id", None)
                            context.submit_data(output)
                            return
                        
                        if chunk['type'] == 'audio':
                            data += chunk['data']
                    
                    output_audio = librosa.load(io.BytesIO(data), sr=None)[0]
                    output_audio = output_audio[np.newaxis, ...]
                    output = DataBundle(output_definition)
                    output.set_main_data(output_audio)
                    output.add_meta("avatar_speech_end", False)
                    output.add_meta("speech_id", speech_id)
                    context.submit_data(output)
            
            context.input_text = ''
            output = DataBundle(output_definition)
            output.set_main_data(np.zeros(shape=(1, 240), dtype=np.float32))
            output.add_meta("avatar_speech_end", True)
            output.add_meta("speech_id", speech_id)
            context.submit_data(output)
            logger.info(f"speech end")

    def destroy_context(self, context: HandlerContext):
        context = cast(TTSContext, context)
        logger.info('destroy context')
        if hasattr(context, 'audio_dump_file') and context.audio_dump_file:
            context.audio_dump_file.close()
        context.input_text = ''
        if context.session_context:
            with INTERRUPT_LOCK:
                context.session_context.shared_states.current_speech_id = None