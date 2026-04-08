import io
import os
import re
import time
import requests
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


class GPTSoVITSConfig(HandlerBaseConfigModel, BaseModel):
    """GPT-SoVITS TTS 配置"""
    server_url: str = Field(default="http://localhost:9001")
    ref_audio_path: str = Field(default=None)
    ref_text: str = Field(default=None)
    ref_language: str = Field(default="中文")
    target_language: str = Field(default="中文")
    sample_rate: int = Field(default=24000)  # 修改默认采样率为24000以适配MuseTalk
    timeout: int = Field(default=60)


class GPTSoVITSContext(HandlerContext):
    """GPT-SoVITS TTS 上下文"""
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


class HandlerGPTSoVITS(HandlerBase, ABC):
    """GPT-SoVITS TTS Handler"""
    
    def __init__(self):
        super().__init__()
        self.server_url = None
        self.ref_audio_path = None
        self.ref_text = None
        self.ref_language = None
        self.target_language = None
        self.sample_rate = 24000  # 默认采样率设置为24000Hz以适配MuseTalk
        self.timeout = None
      
    def get_handler_info(self) -> HandlerBaseInfo:
        return HandlerBaseInfo(
            config_model=GPTSoVITSConfig,
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
        """加载配置"""
        config = cast(GPTSoVITSConfig, handler_config)
        self.server_url = config.server_url
        self.ref_audio_path = config.ref_audio_path
        self.ref_text = config.ref_text
        self.ref_language = config.ref_language
        self.target_language = config.target_language
        self.sample_rate = config.sample_rate
        self.timeout = config.timeout
        
        logger.info(f"GPT-SoVITS Handler loaded with server: {self.server_url}, output sample_rate: {self.sample_rate}Hz")

    def create_context(self, session_context, handler_config=None):
        """创建上下文"""
        if not isinstance(handler_config, GPTSoVITSConfig):
            handler_config = GPTSoVITSConfig()
        context = GPTSoVITSContext(session_context.session_info.session_id)
        context.input_text = ''
        context.shared_states = session_context.shared_states
        if context.dump_audio:
            dump_file_path = os.path.join(DirectoryInfo.get_project_dir(), 'temp',
                                            f"dump_avatar_audio_{context.session_id}_{time.localtime().tm_hour}_{time.localtime().tm_min}.pcm")
            context.audio_dump_file = open(dump_file_path, "wb")
        return context
    
    def start_context(self, session_context, context: HandlerContext):
        """启动上下文 - 测试连接"""
        try:
            response = requests.get(f"{self.server_url}/health", timeout=5)
            if response.status_code == 200:
                logger.info("GPT-SoVITS server health check passed")
            else:
                logger.warning(f"GPT-SoVITS server health check failed: {response.status_code}")
        except Exception as e:
            logger.error(f"GPT-SoVITS server connection failed: {e}")

    def filter_text(self, text):
        """过滤文本，保留有效字符"""
        pattern = r"[^a-zA-Z0-9\u4e00-\u9fff,\~!?，。！？、（）. ]"
        filtered_text = re.sub(pattern, "", text)
        return filtered_text

    def handle(self, context: HandlerContext, inputs: ChatData,
               output_definitions: Dict[ChatDataType, HandlerDataInfo]):
        """处理输入数据"""
        output_definition = output_definitions.get(ChatDataType.AVATAR_AUDIO).definition
        context = cast(GPTSoVITSContext, context)
        
        if inputs.type == ChatDataType.AVATAR_TEXT:
            text = inputs.data.get_main_data()
        else:
            return
            
        speech_id = inputs.data.get_meta("speech_id")
        if (speech_id is None):
            speech_id = context.session_id

        # 检查是否有新的speech_id
        if context.current_speech_id is not None and context.current_speech_id != speech_id:
            logger.info(f'检测到新的speech_id: {speech_id}（旧={context.current_speech_id}），重置当前TTS状态')
            old_speech_id = context.current_speech_id
            context.interrupted_speech_id = old_speech_id
            context.current_speech_id = None
            context.input_text = ''
            self._interrupt_server()

        # 更新当前speech_id
        if context.current_speech_id != speech_id:
            if context.shared_states is not None:
                context.shared_states.tts_interrupt_flag = False
                logger.info(f'新的speech_id开始，重置tts_interrupt_flag为False | speech_id: {speech_id}')
            context.current_speech_id = speech_id
            if speech_id not in context.speech_first_sentence_processed:
                context.speech_first_sentence_processed[speech_id] = False
                context.speech_first_sentence_cached[speech_id] = ''

        # 检查tts_interrupt_flag
        if context.shared_states is not None and context.shared_states.tts_interrupt_flag:
            logger.info(f'检测到tts_interrupt_flag=True，立即停止TTS并清空数据 | speech_id: {speech_id}')
            if context.current_speech_id is not None:
                context.interrupted_speech_id = context.current_speech_id
                logger.info(f'标记speech_id={context.current_speech_id}为已中断状态')
            context.current_speech_id = None
            context.input_text = ''
            context.shared_states.tts_interrupt_flag = False
            logger.info(f'重置tts_interrupt_flag=False，准备接受新数据 | speech_id: {speech_id}')
            self._interrupt_server()
            return

        def should_interrupt(check_speech_id: str) -> bool:
            if context.interrupted_speech_id == check_speech_id:
                return True
            if context.shared_states is not None and context.shared_states.tts_interrupt_flag:
                logger.info(f'should_interrupt: 检测到tts_interrupt_flag=True，标记speech_id={check_speech_id}为中断')
                context.interrupted_speech_id = check_speech_id
                context.shared_states.tts_interrupt_flag = False
                self._interrupt_server()
                return True
            if context.current_speech_id != check_speech_id:
                logger.info(f'should_interrupt: speech_id不匹配（当前={context.current_speech_id}, 检查={check_speech_id}）')
                return True
            return False

        if text is not None:
            text = re.sub(r"<\|*.?\|>", "", text)
            context.input_text += self.filter_text(text)
            
            if should_interrupt(speech_id):
                return

        text_end = inputs.data.get_meta("avatar_text_end", False)
        if should_interrupt(speech_id):
            logger.info(f'处理开始前检测到中断信号，立即停止处理')
            return
            
        if not text_end:
            sentences = re.split(r'(?<=[,~!?，。！？（）])', context.input_text)
            if len(sentences) > 1:
                complete_sentences = sentences[:-1]
                context.input_text = sentences[-1]

                for i, sentence in enumerate(complete_sentences):
                    if should_interrupt(speech_id):
                        logger.info(f'检测到中断信号，停止处理句子: {sentence[:20]}...')
                        return
                    
                    if len(sentence.strip()) < 1:
                        continue
                    
                    cached_first_sentence = context.speech_first_sentence_cached.get(speech_id, '')
                    
                    if cached_first_sentence:
                        combined_sentence = cached_first_sentence + sentence
                        logger.info(f'合并缓存的未发送首句和当前句子推送 | 合并后句子: {combined_sentence[:50]}...')
                        
                        context.speech_first_sentence_cached[speech_id] = ''
                        context.speech_first_sentence_processed[speech_id] = True
                        
                        self._process_and_send_sentence(
                            combined_sentence, speech_id, context, output_definition, should_interrupt
                        )
                    else:
                        is_first_sentence = not context.speech_first_sentence_processed.get(speech_id, False)
                        
                        if is_first_sentence:
                            clean_sentence = re.sub(r'[^\u4e00-\u9fa5a-zA-Z0-9]', '', sentence)
                            char_count = len(clean_sentence)
                            
                            if char_count < 5:
                                logger.info(f'首句字数不足5字({char_count})，缓存等待下一句合并推送 | sentence: {sentence}')
                                context.speech_first_sentence_cached[speech_id] = sentence
                                context.speech_first_sentence_processed[speech_id] = True
                            else:
                                logger.info(f'首句字数足够({char_count})，正常推送 | sentence: {sentence}')
                                context.speech_first_sentence_processed[speech_id] = True
                                self._process_and_send_sentence(
                                    sentence, speech_id, context, output_definition, should_interrupt
                                )
                        else:
                            logger.info(f'正常推送句子 | sentence: {sentence}')
                            self._process_and_send_sentence(
                                sentence, speech_id, context, output_definition, should_interrupt
                            )
        else:
            logger.info('处理最后句子' + context.input_text)
            
            if should_interrupt(speech_id):
                logger.info('检测到中断信号，停止处理最后一句')
                context.input_text = ''
                output = DataBundle(output_definition)
                output.set_main_data(np.zeros(shape=(1, 240), dtype=np.float32))
                output.add_meta("avatar_speech_end", True)
                output.add_meta("speech_id", speech_id)
                context.submit_data(output)
                context.current_speech_id = None
                if context.interrupted_speech_id == speech_id:
                    context.interrupted_speech_id = None
                logger.info(f"speech end (interrupted)")
                return
            
            cached_first_sentence = context.speech_first_sentence_cached.get(speech_id, '')
            final_text_to_process = ''
            
            if cached_first_sentence:
                combined_sentence = cached_first_sentence + context.input_text
                logger.info(f'最后处理：合并缓存的未发送首句和剩余文本 | 合并后句子: {combined_sentence}')
                final_text_to_process = combined_sentence
            elif context.input_text is not None and len(context.input_text.strip()) > 0:
                final_text_to_process = context.input_text
                logger.info(f'最后处理：正常处理剩余文本 | 句子: {final_text_to_process}')
            
            if final_text_to_process and len(final_text_to_process.strip()) > 0:
                self._process_and_send_sentence(
                    final_text_to_process, speech_id, context, output_definition, should_interrupt
                )
            
            context.input_text = ''
            if speech_id in context.speech_first_sentence_processed:
                del context.speech_first_sentence_processed[speech_id]
            if speech_id in context.speech_first_sentence_cached:
                del context.speech_first_sentence_cached[speech_id]
            
            output = DataBundle(output_definition)
            output.set_main_data(np.zeros(shape=(1, 240), dtype=np.float32))
            output.add_meta("avatar_speech_end", True)
            output.add_meta("speech_id", speech_id)
            context.submit_data(output)
            context.current_speech_id = None
            
            if context.interrupted_speech_id == speech_id:
                context.interrupted_speech_id = None
                logger.info(f'清除speech_id={speech_id}的中断标记')
            logger.info(f"speech end")

    def _process_and_send_sentence(self, sentence: str, speech_id: str, context: GPTSoVITSContext, 
                                   output_definition: DataBundleDefinition, 
                                   should_interrupt_func):
        """处理并发送单个句子"""
        if len(sentence.strip()) < 1:
            return
        
        logger.info(f'处理句子: {sentence[:50]}...')
        
        payload = {
            "ref_audio": self.ref_audio_path,
            "ref_text": self.ref_text,
            "ref_language": self.ref_language,
            "text": sentence,
            "target_language": self.target_language
        }
        
        try:
            response = requests.post(
                f"{self.server_url}/tts/stream",
                json=payload,
                stream=True,
                timeout=self.timeout
            )
            
            if response.status_code != 200:
                logger.error(f"GPT-SoVITS server error: {response.status_code}")
                return
            
            audio_data = b''
            
            for chunk in response.iter_content(chunk_size=4096):
                if should_interrupt_func(speech_id):
                    logger.info(f'在流式处理中检测到中断信号，停止处理当前句子')
                    audio_data = b''
                    break
                
                if chunk:
                    audio_data += chunk
            
            if len(audio_data) == 0:
                return
            
            if should_interrupt_func(speech_id):
                logger.info(f'在提交前检测到中断信号，跳过数据提交')
                return
            
            # 将音频数据转换为numpy数组
            audio_array = np.frombuffer(audio_data, dtype=np.int16)
            output_audio = audio_array.astype(np.float32) / 32768.0

            # 记录重采样前的音频信息
            orig_audio_len = len(output_audio)
            orig_audio_duration = librosa.get_duration(y=output_audio, sr=32000)
            logger.info(f'重采样前音频信息: 长度={orig_audio_len} samples, 持续时间={orig_audio_duration:.2f}s, 采样率=32000Hz')

            # GPT-SoVITS输出为32000Hz，使用高质量重采样降采样到目标采样率（通常为24000Hz以适配MuseTalk）
            if self.sample_rate != 32000:
                logger.info(f'重采样音频: 32000Hz -> {self.sample_rate}Hz (使用kaiser_best算法保证质量)')
                output_audio = librosa.resample(
                    output_audio,
                    orig_sr=32000,
                    target_sr=self.sample_rate,
                    res_type='kaiser_best'  # 使用最高质量的重采样算法，保证音频质量
                )
            
            # 记录重采样后的音频信息
            resampled_audio_len = len(output_audio)
            resampled_audio_duration = librosa.get_duration(y=output_audio, sr=self.sample_rate)
            logger.info(f'重采样后音频信息: 长度={resampled_audio_len} samples, 持续时间={resampled_audio_duration:.2f}s, 采样率={self.sample_rate}Hz')
            
            output_audio = output_audio[np.newaxis, ...]
            
            output = DataBundle(output_definition)
            output.set_main_data(output_audio)
            output.add_meta("avatar_speech_end", False)
            output.add_meta("speech_id", speech_id)
            context.submit_data(output)
            
            logger.info(f'成功发送音频数据，长度: {len(output_audio[0])} samples, 采样率: {self.sample_rate}Hz')
            
        except requests.exceptions.Timeout:
            logger.error(f"GPT-SoVITS request timeout for sentence: {sentence[:30]}...")
        except Exception as e:
            logger.error(f"Error processing sentence with GPT-SoVITS: {e}")

    def _interrupt_server(self):
        """调用服务器打断接口"""
        try:
            requests.post(f"{self.server_url}/tts/interrupt", timeout=2)
            logger.info("发送打断信号到 GPT-SoVITS 服务器")
        except Exception as e:
            logger.warning(f"发送打断信号失败: {e}")

    def destroy_context(self, context: HandlerContext):
        """销毁上下文"""
        context = cast(GPTSoVITSContext, context)
        if context.audio_dump_file:
            context.audio_dump_file.close()
        logger.info('destroy context')
