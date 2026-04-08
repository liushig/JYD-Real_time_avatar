import io
import edge_tts
import os
import re
import time
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
        self.shared_states = None  # 用于访问interrupt_flag
        self.current_speech_id = None  # 当前处理的speech_id
        self.interrupted_speech_id = None  # 被中断的speech_id，用于标记已中断的请求
        # 新增：首句缓存相关状态
        self.is_first_sentence = True  # 标记是否为当前对话轮次的首句
        self.first_sentence_cache = ''  # 缓存首句内容
        self.first_sentence_speech_id = None  # 缓存首句对应的speech_id
        self.prev_speech_id = None  # 上一轮的speech_id，用于检测对话轮次变化


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
        context.input_text = ''
        # 注入 shared_states 用于访问 interrupt_flag
        context.shared_states = session_context.shared_states
        if context.dump_audio:
            dump_file_path = os.path.join(DirectoryInfo.get_project_dir(), 'temp',
                                          f"dump_avatar_audio_{context.session_id}_{time.localtime().tm_hour}_{time.localtime().tm_min}.pcm")
            context.audio_dump_file = open(dump_file_path, "wb")
        return context

    def start_context(self, session_context, context: HandlerContext):
        context = cast(TTSContext, context)
        edge_tts.Communicate(text="测试音频启动", voice=self.voice)

    def filter_text(self, text):
        pattern = r"[^a-zA-Z0-9\u4e00-\u9fff,\~!?，。. ！？（） ]"  # 匹配不在范围内的字符
        filtered_text = re.sub(pattern, "", text)
        return filtered_text

    # 新增：判断是否为有效的中文字符
    def count_chinese_chars(self, text: str) -> int:
        """统计中文字符数量"""
        chinese_chars = re.findall(r'[\u4e00-\u9fff]', text)
        return len(chinese_chars)

    # 新增：处理缓存的首句（当需要合并到下一句时调用）
    def _process_cached_first_sentence(self, context: TTSContext, current_sentence: str, speech_id: str):
        """处理缓存的短首句，合并到当前句子"""
        if context.first_sentence_cache and context.first_sentence_speech_id == speech_id:
            combined_text = context.first_sentence_cache + current_sentence
            logger.info(f'[首句合并] 将缓存的短首句合并到当前句子 | 原首句: {context.first_sentence_cache} | 当前句: {current_sentence[:30]}... | 合并后: {combined_text[:50]}...')
            return combined_text
        return current_sentence

    # 新增：清空首句缓存
    def _clear_first_sentence_cache(self, context: TTSContext):
        """清空首句缓存"""
        context.first_sentence_cache = ''
        context.first_sentence_speech_id = None
        context.is_first_sentence = False

    # 新增：判断是否需要缓存首句
    def _should_cache_first_sentence(self, context: TTSContext, sentence: str, speech_id: str) -> bool:
        """判断是否需要缓存首句（字数少于10个字）"""
        if not context.is_first_sentence:
            return False
        
        # 检查句子长度（中文字符数量）
        chinese_char_count = self.count_chinese_chars(sentence)
        logger.info(f'[首句检测] 句子: "{sentence}" | 中文字数: {chinese_char_count} | speech_id: {speech_id}')
        
        return chinese_char_count < 10

    # 新增：缓存首句
    def _cache_first_sentence(self, context: TTSContext, sentence: str, speech_id: str):
        """缓存首句"""
        context.first_sentence_cache = sentence
        context.first_sentence_speech_id = speech_id
        logger.info(f'[首句缓存] 缓存短首句: "{sentence}" | speech_id: {speech_id}')

    # 新增：更新对话轮次状态
    def _update_conversation_round(self, context: TTSContext, speech_id: str):
        """更新对话轮次状态，检测到新的speech_id时重置首句状态"""
        if context.prev_speech_id != speech_id:
            # 新的对话轮次开始
            context.is_first_sentence = True
            context.first_sentence_cache = ''
            context.first_sentence_speech_id = None
            context.prev_speech_id = speech_id
            logger.info(f'[对话轮次] 检测到新对话轮次 | speech_id: {speech_id} | 重置首句状态')

    def handle(self, context: HandlerContext, inputs: ChatData,
               output_definitions: Dict[ChatDataType, HandlerDataInfo]):
        output_definition = output_definitions.get(ChatDataType.AVATAR_AUDIO).definition
        context = cast(TTSContext, context)
        if inputs.type == ChatDataType.AVATAR_TEXT:
            text = inputs.data.get_main_data()
        else:
            return
        speech_id = inputs.data.get_meta("speech_id")
        if (speech_id is None):
            speech_id = context.session_id

        # 更新对话轮次状态
        self._update_conversation_round(context, speech_id)

        # 检查是否有新的speech_id，如果有则重置状态
        if context.current_speech_id is not None and context.current_speech_id != speech_id:
            logger.info(f'检测到新的speech_id: {speech_id}（旧={context.current_speech_id}），重置当前TTS状态')
            # 标记旧的speech_id为已中断
            old_speech_id = context.current_speech_id
            context.interrupted_speech_id = old_speech_id
            context.current_speech_id = None
            context.input_text = ''

        # 更新当前speech_id
        if context.current_speech_id != speech_id:
            # 重置tts_interrupt_flag为False，确保新speech_id开始时为干净状态
            if context.shared_states is not None:
                context.shared_states.tts_interrupt_flag = False
                logger.info(f'新的speech_id开始，重置tts_interrupt_flag为False | speech_id: {speech_id}')
            context.current_speech_id = speech_id
            # 注意：不要清除interrupted_speech_id，如果当前speech_id已被中断，应该停止处理

        # 检查tts_interrupt_flag（TTS专用打断信号），如果为True则立即停止并清空
        # 注意：使用tts_interrupt_flag而不是interrupt_flag，避免被RTC重置影响
        if context.shared_states is not None and context.shared_states.tts_interrupt_flag:
            logger.info(f'检测到tts_interrupt_flag=True，立即停止TTS并清空数据 | speech_id: {speech_id}')
            # 标记当前speech_id为已中断
            if context.current_speech_id is not None:
                context.interrupted_speech_id = context.current_speech_id
                logger.info(f'标记speech_id={context.current_speech_id}为已中断状态')
            context.current_speech_id = None
            context.input_text = ''
            # 清空首句缓存
            self._clear_first_sentence_cache(context)
            # 重置tts_interrupt_flag，避免重复触发
            context.shared_states.tts_interrupt_flag = False
            logger.info(f'重置tts_interrupt_flag=False，准备接受新数据 | speech_id: {speech_id}')
            return

        # 辅助函数：检查是否应该中断处理
        def should_interrupt(check_speech_id: str) -> bool:
            # 优先检查当前speech_id是否已被标记为中断
            if context.interrupted_speech_id == check_speech_id:
                # logger.info(f'should_interrupt: speech_id={check_speech_id}已被标记为中断')
                return True
            # 检查tts_interrupt_flag（TTS专用打断信号）- 最高优先级
            if context.shared_states is not None and context.shared_states.tts_interrupt_flag:
                logger.info(f'should_interrupt: 检测到tts_interrupt_flag=True，标记speech_id={check_speech_id}为中断')
                # 标记当前speech_id为已中断
                context.interrupted_speech_id = check_speech_id
                # 重置tts_interrupt_flag，避免重复触发
                context.shared_states.tts_interrupt_flag = False
                return True
            # 检查speech_id是否仍然匹配
            if context.current_speech_id != check_speech_id:
                logger.info(f'should_interrupt: speech_id不匹配（当前={context.current_speech_id}, 检查={check_speech_id}）')
                return True
            return False

        if text is not None:
            text = re.sub(r"<\|.*?\|>", "", text)
            context.input_text += self.filter_text(text)

            # 添加文本后立即检查中断（防止在添加文本时标志被设置）
            if should_interrupt(speech_id):
                # logger.info(f'添加文本后检测到中断信号，立即停止处理')
                return

        text_end = inputs.data.get_meta("avatar_text_end", False)
        # 在处理前再次检查中断（双重检查）
        if should_interrupt(speech_id):
            logger.info(f'处理开始前检测到中断信号，立即停止处理')
            return

        if not text_end:
            sentences = re.split(r'(?<=[,~!?，. 。！？（）])', context.input_text)
            if len(sentences) > 1:  # 至少有一个完整句子
                complete_sentences = sentences[:-1]  # 完整句子
                context.input_text = sentences[-1]  # 剩余的未完成部分

                # 对完整句子进行处理
                for sentence in complete_sentences:
                    # 每次循环开始前都检查中断（确保实时性）
                    if should_interrupt(speech_id):
                        logger.info(f'检测到中断信号，停止处理句子: {sentence[:20]}...')
                        return

                    if len(sentence.strip()) < 1:
                        continue

                    # 首句处理逻辑
                    if context.is_first_sentence:
                        # 判断是否需要缓存首句（字数少于10个中文字符）
                        if self._should_cache_first_sentence(context, sentence, speech_id):
                            self._cache_first_sentence(context, sentence, speech_id)
                            logger.info(f'[首句处理] 缓存短首句，等待下一句合并 | 句子: "{sentence}"')
                            continue  # 跳过当前句子的TTS处理
                        else:
                            # 首句字数足够，正常处理
                            logger.info(f'[首句处理] 首句字数足够，正常处理 | 句子: "{sentence}"')
                            self._clear_first_sentence_cache(context)  # 清空缓存状态
                    else:
                        # 非首句：检查是否有缓存的短首句需要合并
                        if context.first_sentence_cache and context.first_sentence_speech_id == speech_id:
                            sentence = self._process_cached_first_sentence(context, sentence, speech_id)
                            self._clear_first_sentence_cache(context)  # 合并后清空缓存

                    logger.info('current sentence' + sentence)

                    communicate = edge_tts.Communicate(sentence, self.voice)
                    data = b''

                    # 在流式处理音频数据时检查中断标志
                    for chunk in communicate.stream_sync():
                        # 在每次迭代中检查中断标志
                        if should_interrupt(speech_id):
                            logger.info(f'在流式处理中检测到中断信号，停止处理当前句子')
                            data = b''  # 清空已接收的数据
                            break

                        if chunk['type'] == 'audio':
                            # tts_audio = chunk['data']
                            data += chunk['data']

                    # 如果数据被清空（中断），跳过提交
                    if len(data) == 0:
                        continue

                    # 再次检查是否应该中断（双重检查，确保实时性）
                    if should_interrupt(speech_id):
                        logger.info(f'在提交前检测到中断信号，跳过数据提交')
                        continue

                    output_audio = librosa.load(io.BytesIO(data), sr=None)[0]
                    output_audio = output_audio[np.newaxis, ...]
                    output = DataBundle(output_definition)
                    output.set_main_data(output_audio)
                    output.add_meta("avatar_speech_end", False)
                    output.add_meta("speech_id", speech_id)
                    context.submit_data(output)

                    # 处理完一个完整句子后，如果不是首句，重置首句标志
                    if context.is_first_sentence:
                        context.is_first_sentence = False
        else:
            logger.info('last sentence' + context.input_text)

            # 检查是否应该中断
            if should_interrupt(speech_id):
                logger.info('检测到中断信号，停止处理最后一句')
                context.input_text = ''
                # 清空首句缓存
                self._clear_first_sentence_cache(context)
                # 即使中断，也要发送speech_end信号
                output = DataBundle(output_definition)
                output.set_main_data(np.zeros(shape=(1, 240), dtype=np.float32))
                output.add_meta("avatar_speech_end", True)
                output.add_meta("speech_id", speech_id)
                context.submit_data(output)
                context.current_speech_id = None
                # 完成时清除中断标记
                if context.interrupted_speech_id == speech_id:
                    context.interrupted_speech_id = None
                logger.info(f"speech end (interrupted)")
                return

            # 处理最后一句：检查是否有缓存的短首句需要处理
            final_sentence = context.input_text
            if context.first_sentence_cache and context.first_sentence_speech_id == speech_id:
                if len(final_sentence.strip()) > 0:
                    # 如果有缓存的短首句且当前句子不为空，合并处理
                    final_sentence = self._process_cached_first_sentence(context, final_sentence, speech_id)
                else:
                    # 如果当前句子为空，只处理缓存的短首句
                    final_sentence = context.first_sentence_cache
                self._clear_first_sentence_cache(context)

            if final_sentence is not None and len(final_sentence.strip()) > 0:
                communicate = edge_tts.Communicate(final_sentence, self.voice)
                data = b''

                # 在流式处理音频数据时检查中断标志
                for chunk in communicate.stream_sync():
                    # 在每次迭代中检查中断标志
                    if should_interrupt(speech_id):
                        logger.info(f'在流式处理最后一句时检测到中断信号，停止处理')
                        data = b''  # 清空已接收的数据
                        break

                    if chunk['type'] == 'audio':
                        # tts_audio = chunk['data']
                        data += chunk['data']

                # 只有在数据存在且未被中断时才提交
                if len(data) > 0 and not should_interrupt(speech_id):
                    output_audio = librosa.load(io.BytesIO(data), sr=None)[0]
                    output_audio = output_audio[np.newaxis, ...]
                    output = DataBundle(output_definition)
                    output.set_main_data(output_audio)
                    output.add_meta("avatar_speech_end", False)
                    output.add_meta("speech_id", speech_id)
                    context.submit_data(output)

            context.input_text = ''
            # 清空首句缓存
            self._clear_first_sentence_cache(context)
            output = DataBundle(output_definition)
            output.set_main_data(np.zeros(shape=(1, 240), dtype=np.float32))
            output.add_meta("avatar_speech_end", True)
            output.add_meta("speech_id", speech_id)
            context.submit_data(output)
            context.current_speech_id = None
            # 完成时清除中断标记（只有当前speech_id完成时才清除）
            if context.interrupted_speech_id == speech_id:
                context.interrupted_speech_id = None
                logger.info(f'清除speech_id={speech_id}的中断标记')
            logger.info(f"speech end")

    def destroy_context(self, context: HandlerContext):
        context = cast(TTSContext, context)
        logger.info('destroy context')