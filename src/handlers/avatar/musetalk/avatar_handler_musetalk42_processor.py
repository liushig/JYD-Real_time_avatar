import os
import time
import pickle
from typing import Dict, Optional, cast
import numpy as np
from loguru import logger
import threading
import queue
import hashlib

from chat_engine.data_models.chat_data_type import ChatDataType, EngineChannelType
from chat_engine.common.handler_base import HandlerBase, HandlerBaseInfo, HandlerDataInfo, HandlerDetail, \
    ChatDataConsumeMode
from chat_engine.contexts.handler_context import HandlerContext
from chat_engine.contexts.session_context import SessionContext
from chat_engine.data_models.chat_data.chat_data_model import ChatData
from chat_engine.data_models.chat_engine_config_data import ChatEngineConfigModel
from chat_engine.data_models.runtime_data.data_bundle import DataBundleDefinition, DataBundleEntry, DataBundle, VariableSize
from handlers.avatar.liteavatar.model.audio_input import SpeechAudio
from handlers.avatar.liteavatar.liteavatar_worker import Tts2FaceEvent
from handlers.avatar.musetalk.avatar_musetalk_processor42 import AvatarMuseTalkProcessor
from handlers.avatar.musetalk.avatar_musetalk_algo import MuseAvatarV15
from handlers.avatar.musetalk.avatar_musetalk_config import AvatarMuseTalkConfig
from engine_utils.general_slicer import slice_data, SliceContext


# Context class for MuseTalk avatar handler - 每个会话独立的上下文
class AvatarMuseTalkContextMultiSession(HandlerContext):
    """
    Multi-session context class for MuseTalk avatar handler.
    Each session has its own processor and queues.
    """
    def __init__(self, session_id: str, processor: AvatarMuseTalkProcessor,
                 event_in_queue: queue.Queue, event_out_queue: queue.Queue,
                 audio_out_queue: queue.Queue, video_out_queue: queue.Queue,
                 shared_status, interrupt_callback=None, global_shared_states=None):
        super().__init__(session_id)
        self.processor = processor  # 每个会话独立的 processor
        self.config: Optional[AvatarMuseTalkConfig] = None
        self.event_in_queue: queue.Queue = event_in_queue
        self.audio_out_queue: queue.Queue = audio_out_queue
        self.video_out_queue: queue.Queue = video_out_queue
        self.event_out_queue: queue.Queue = event_out_queue
        self.shared_state = shared_status  # 会话级别的 shared_state
        self.global_shared_states = global_shared_states  # 全局的 shared_states
        self.input_slice_context = None
        self.output_data_definitions: Dict[ChatDataType, DataBundleDefinition] = {}
        self.media_out_thread: threading.Thread = None
        self.event_out_thread: threading.Thread = None
        self.interrupt_monitor_thread: threading.Thread = None
        self.loop_running = True
        self.interrupt_callback = interrupt_callback
        self.last_interrupt_check_time = time.time()
        self._avatar_mode_lock = threading.Lock()
        self._recently_interrupted = False

        self._init_avatar_mode()

        # Start threads
        try:
            self.media_out_thread = threading.Thread(target=self._media_out_loop, daemon=True)
            self.media_out_thread.start()
        except Exception as e:
            logger.opt(exception=True).error(f"[{session_id}] Failed to start media_out_thread: {e}")

        try:
            self.event_out_thread = threading.Thread(target=self._event_out_loop, daemon=True)
            self.event_out_thread.start()
        except Exception as e:
            logger.opt(exception=True).error(f"[{session_id}] Failed to start event_out_thread: {e}")

        try:
            self.interrupt_monitor_thread = threading.Thread(target=self._interrupt_monitor_loop, daemon=True)
            self.interrupt_monitor_thread.start()
            logger.info(f"[{session_id}] Interrupt monitor thread started")
        except Exception as e:
            logger.opt(exception=True).error(f"[{session_id}] Failed to start interrupt_monitor_thread: {e}")

    def _init_avatar_mode(self):
        """初始化avatar_mode状态"""
        try:
            if not hasattr(self.shared_state, 'avatar_mode'):
                self.shared_state.avatar_mode = "ending"
                logger.info(f"[{self.session_id}] Initialized avatar_mode to 'ending'")
            if not hasattr(self.shared_state, 'enable_vad'):
                self.shared_state.enable_vad = True
            logger.info(f"[{self.session_id}] Current avatar_mode: {self.shared_state.avatar_mode}")
        except Exception as e:
            logger.opt(exception=True).error(f"[{self.session_id}] Failed to initialize avatar_mode: {e}")

    def _set_avatar_mode(self, mode: str):
        """安全设置avatar_mode"""
        with self._avatar_mode_lock:
            try:
                old_mode = getattr(self.shared_state, 'avatar_mode', 'unknown')
                self.shared_state.avatar_mode = mode
                logger.info(f"[{self.session_id}] Set avatar_mode: {old_mode} -> {mode}")
            except Exception as e:
                logger.opt(exception=True).error(f"[{self.session_id}] Failed to set avatar_mode to {mode}: {e}")

    def _interrupt_monitor_loop(self):
        """监控打断标志（同时检查全局和会话级别）"""
        logger.info(f"[{self.session_id}] Interrupt monitor loop started")
        check_interval = 0.05  # Check every 50ms for real-time responsiveness

        while self.loop_running:
            try:
                time.sleep(check_interval)

                current_flag = False

                # 检查会话级别的 avatar_interrupt_flag
                if hasattr(self.shared_state, 'avatar_interrupt_flag'):
                    current_flag = self.shared_state.avatar_interrupt_flag

                # 同时检查全局级别的 avatar_interrupt_flag（RTC 服务设置的）
                if not current_flag and self.global_shared_states and hasattr(self.global_shared_states, 'avatar_interrupt_flag'):
                    current_flag = self.global_shared_states.avatar_interrupt_flag

                # If flag is True and we have a callback, trigger interrupt
                if current_flag and self.interrupt_callback:
                    logger.info(f"[{self.session_id}] [INTERRUPT] Interrupt flag detected, triggering interrupt callback")

                    # 设置最近打断标记
                    self._recently_interrupted = True

                    # Call the interrupt callback
                    self.interrupt_callback()

                    # 设置avatar_mode为"ending"
                    self._set_avatar_mode("ending")

                    # Reset the flag after handling (both local and global)
                    if hasattr(self.shared_state, 'avatar_interrupt_flag'):
                        self.shared_state.avatar_interrupt_flag = False
                    if self.global_shared_states and hasattr(self.global_shared_states, 'avatar_interrupt_flag'):
                        self.global_shared_states.avatar_interrupt_flag = False
                    logger.info(f"[{self.session_id}] [INTERRUPT] Interrupt flags reset to False")

                    # 延迟清除最近打断标记
                    def _clear_recent_interrupt():
                        time.sleep(0.3)  # 300ms后清除
                        self._recently_interrupted = False

                    threading.Thread(target=_clear_recent_interrupt, daemon=True).start()

            except Exception as e:
                logger.opt(exception=True).error(f"[{self.session_id}] Error in interrupt monitor: {e}")

        logger.info(f"[{self.session_id}] Interrupt monitor loop stopped")

    def return_data(self, data: np.ndarray, chat_data_type: ChatDataType) -> None:
        """打包并提交输出数据"""
        if not self.loop_running:
            logger.debug(f"[{self.session_id}] Context loop not running, skipping return_data")
            return

        definition = self.output_data_definitions.get(chat_data_type)
        if definition is None:
            logger.error(f"[{self.session_id}] Definition is None, chat_data_type={chat_data_type}")
            return

        data_bundle = DataBundle(definition)
        if chat_data_type.channel_type == EngineChannelType.AUDIO:
            # 确保音频数据是 float32 且有正确的形状
            if data is not None:
                if data.dtype != np.float32:
                    data = data.astype(np.float32)
                if data.ndim == 1:
                    data = data[np.newaxis, ...]
                elif data.ndim == 2 and data.shape[0] != 1:
                    data = data[:1, ...]
            else:
                logger.error(f"[{self.session_id}] Audio data is None")
                data = np.zeros([1, 0], dtype=np.float32)
            data_bundle.set_main_data(data)
        elif chat_data_type.channel_type == EngineChannelType.VIDEO:
            # 确保视频数据有 batch 维度
            data_bundle.set_main_data(data[np.newaxis, ...])
        else:
            return

        chat_data = ChatData(type=chat_data_type, data=data_bundle)
        self.submit_data(chat_data)

    def _media_out_loop(self):
        """输出音视频数据"""
        logger.info(f"[{self.session_id}] Media output loop started")
        while self.loop_running:
            no_output = True
            if self.audio_out_queue.qsize() > 0:
                try:
                    audio_data = self.audio_out_queue.get_nowait()
                    self.return_data(audio_data, ChatDataType.AVATAR_AUDIO)
                    no_output = False
                except queue.Empty:
                    pass
                except Exception as e:
                    logger.opt(exception=True).error(f"[{self.session_id}] Error in audio output: {e}")

            if self.video_out_queue.qsize() > 0:
                try:
                    video_data = self.video_out_queue.get_nowait()
                    if not isinstance(video_data, np.ndarray):
                        logger.error(f"[{self.session_id}] video_out_queue got non-ndarray: {type(video_data)}")
                        continue
                    self.return_data(video_data, ChatDataType.AVATAR_VIDEO)
                    no_output = False
                except queue.Empty:
                    pass
                except Exception as e:
                    logger.opt(exception=True).error(f"[{self.session_id}] Error in video output: {e}")

            if no_output:
                time.sleep(0.01)
        logger.info(f"[{self.session_id}] Media output loop stopped")

    def _event_out_loop(self):
        """输出事件数据"""
        logger.info(f"[{self.session_id}] Event output loop started")
        while self.loop_running:
            try:
                event = self.event_out_queue.get(timeout=0.1)
                if isinstance(event, Tts2FaceEvent):
                    if event == Tts2FaceEvent.SPEAKING_TO_LISTENING:
                        self.shared_state.enable_vad = True
                        self._set_avatar_mode("ending")
                        if self.config and getattr(self.config, 'debug', False):
                            logger.info(f"[{self.session_id}] shared_state.enable_vad = True, avatar_mode = 'ending'")

                        # 发送 avatar_end 标志
                        text_def = self.output_data_definitions.get(ChatDataType.AVATAR_TEXT)
                        if text_def and self.data_submitter:
                            end_bundle = DataBundle(text_def)
                            # end_bundle.set_main_data("__AVATAR_END__")
                            end_data = ChatData(type=ChatDataType.AVATAR_TEXT, data=end_bundle)
                            self.data_submitter.submit(end_data)
                            # logger.info(f"[{self.session_id}] 发送 __AVATAR_END__ 标志")

                    elif hasattr(Tts2FaceEvent, 'SPEAKING') and event == Tts2FaceEvent.SPEAKING:
                        if not self._recently_interrupted:
                            self.shared_state.enable_vad = False
                            self._set_avatar_mode("running")
                            if self.config and getattr(self.config, 'debug', False):
                                logger.info(f"[{self.session_id}] shared_state.enable_vad = False, avatar_mode = 'running'")
                        else:
                            logger.info(f"[{self.session_id}] Ignoring SPEAKING event due to recent interrupt")
            except queue.Empty:
                pass
            except Exception as e:
                logger.opt(exception=True).error(f"[{self.session_id}] Error in event output: {e}")
        logger.info(f"[{self.session_id}] Event output loop stopped")

    def clear(self):
        """清理上下文"""
        logger.info(f"[{self.session_id}] Clearing context")
        self.loop_running = False

        # 清空队列
        for q in [self.audio_out_queue, self.video_out_queue, self.event_in_queue, self.event_out_queue]:
            while not q.empty():
                try:
                    q.get_nowait()
                except:
                    pass

        # 设置avatar_mode为ending
        try:
            if hasattr(self.shared_state, 'avatar_mode'):
                self.shared_state.avatar_mode = "ending"
                logger.info(f"[{self.session_id}] Reset avatar_mode to 'ending' during context clear")
        except Exception as e:
            logger.opt(exception=True).error(f"[{self.session_id}] Failed to reset avatar_mode: {e}")

        # 等待线程结束
        for thread in [self.interrupt_monitor_thread, self.media_out_thread, self.event_out_thread]:
            try:
                if thread and thread.is_alive():
                    thread.join(timeout=3)
            except Exception as e:
                logger.opt(exception=True).error(f"[{self.session_id}] Failed to join thread: {e}")


class HandlerAvatarMusetalkMultiSession(HandlerBase):
    """
    Multi-session MuseTalk handler.
    Each session gets its own processor instance for independent processing.
    """
    def __init__(self) -> None:
        super().__init__()
        # 共享的 avatar 模型（只加载一次）
        self.avatar: Optional[MuseAvatarV15] = None
        # 每个会话独立的 processor 和队列
        self.session_processors: Dict[str, AvatarMuseTalkProcessor] = {}
        self.session_queues: Dict[str, dict] = {}
        self.session_states: Dict[str, dict] = {}
        self.session_contexts: Dict[str, AvatarMuseTalkContextMultiSession] = {}  # 保存会话上下文
        self.output_data_definitions: Dict[ChatDataType, DataBundleDefinition] = {}
        self._debug_cache = {}
        self._session_lock = threading.Lock()  # 保护会话字典的锁

        logger.info("HandlerAvatarMusetalkMultiSession initialized")

    def _get_or_create_session_resources(self, session_id: str) -> dict:
        """为会话创建或获取独立的资源（processor和队列）"""
        with self._session_lock:
            if session_id not in self.session_processors:
                logger.info(f"[{session_id}] Creating new processor and queues for session")

                # 创建独立的队列
                queues = {
                    'event_in': queue.Queue(),
                    'event_out': queue.Queue(),
                    'audio_out': queue.Queue(),
                    'video_out': queue.Queue()
                }
                self.session_queues[session_id] = queues

                # 创建独立的状态（包括独立的 shared_state）
                class SessionSharedState:
                    """每个会话独立的共享状态"""
                    def __init__(self):
                        self.avatar_interrupt_flag = False
                        self.avatar_mode = "ending"
                        self.enable_vad = True

                self.session_states[session_id] = {
                    'current_speech_id': None,
                    'is_interrupted': False,
                    'is_speaking': False,
                    'interrupt_lock': threading.Lock(),
                    'data_submitter': None,
                    'shared_state': SessionSharedState()  # 每个会话独立的 shared_state
                }

                # 创建独立的 processor（共享 avatar 模型）
                if self.avatar is None:
                    logger.error(f"[{session_id}] Avatar model not loaded yet!")
                    raise RuntimeError("Avatar model must be loaded before creating session")

                # 从配置中获取参数（假设已经在 load 中保存）
                config = getattr(self, '_handler_config', AvatarMuseTalkConfig())
                processor = AvatarMuseTalkProcessor(self.avatar, config)
                self.session_processors[session_id] = processor

                logger.info(f"[{session_id}] Session resources created successfully")

            return {
                'processor': self.session_processors[session_id],
                'queues': self.session_queues[session_id],
                'state': self.session_states[session_id]
            }

    def _cleanup_session_resources(self, session_id: str):
        """清理会话资源"""
        with self._session_lock:
            if session_id in self.session_processors:
                logger.info(f"[{session_id}] Cleaning up session resources")

                # 停止 processor
                try:
                    processor = self.session_processors[session_id]
                    if processor:
                        processor.stop()
                except Exception as e:
                    logger.opt(exception=True).error(f"[{session_id}] Error stopping processor: {e}")

                # 清空队列
                if session_id in self.session_queues:
                    queues = self.session_queues[session_id]
                    for q in queues.values():
                        while not q.empty():
                            try:
                                q.get_nowait()
                            except:
                                pass

                # 删除资源
                del self.session_processors[session_id]
                if session_id in self.session_queues:
                    del self.session_queues[session_id]
                if session_id in self.session_states:
                    del self.session_states[session_id]
                if session_id in self.session_contexts:
                    del self.session_contexts[session_id]

                logger.info(f"[{session_id}] Session resources cleaned up")

    def get_handler_info(self) -> HandlerBaseInfo:
        return HandlerBaseInfo(
            name="AvatarMusetalkMultiSession",
            config_model=AvatarMuseTalkConfig,
            load_priority=-999,
        )

    def load(self, engine_config: ChatEngineConfigModel, handler_config: Optional[AvatarMuseTalkConfig] = None):
        """加载模型（只加载一次，所有会话共享）"""
        if not isinstance(handler_config, AvatarMuseTalkConfig):
            handler_config = AvatarMuseTalkConfig()

        # 保存配置供后续使用
        self._handler_config = handler_config

        # 设置输出数据定义
        audio_output_definition = DataBundleDefinition()
        audio_output_definition.add_entry(DataBundleEntry.create_audio_entry(
            "avatar_muse_audio", 1, handler_config.output_audio_sample_rate,
        ))
        audio_output_definition.lockdown()
        self.output_data_definitions[ChatDataType.AVATAR_AUDIO] = audio_output_definition

        video_output_definition = DataBundleDefinition()
        video_output_definition.add_entry(DataBundleEntry.create_framed_entry(
            "avatar_muse_video", [VariableSize(), VariableSize(), VariableSize(), 3], 0, handler_config.fps
        ))
        video_output_definition.lockdown()
        self.output_data_definitions[ChatDataType.AVATAR_VIDEO] = video_output_definition

        text_output_definition = DataBundleDefinition()
        text_output_definition.add_entry(DataBundleEntry.create_text_entry("avatar_text"))
        text_output_definition.lockdown()
        self.output_data_definitions[ChatDataType.AVATAR_TEXT] = text_output_definition

        # 加载共享的 avatar 模型
        project_root = os.getcwd()
        model_dir = os.path.join(project_root, handler_config.model_dir)
        vae_type = "sd-vae"
        unet_model_path = os.path.join(model_dir, "musetalkV15", "unet.pth")
        unet_config = os.path.join(model_dir, "musetalkV15", "musetalk.json")
        whisper_dir = os.path.join(model_dir, "whisper")
        result_dir = os.path.join(project_root, handler_config.avatar_model_dir)

        video_path = handler_config.avatar_video_path
        video_basename = os.path.splitext(os.path.basename(video_path))[0]
        video_hash = hashlib.md5(video_path.encode()).hexdigest()[:8]
        auto_avatar_id = f"avatar_{video_basename}_{video_hash}"
        logger.info(f"Auto generated avatar_id: {auto_avatar_id}")

        logger.info("Loading shared MuseAvatarV15 model (will be shared across all sessions)...")
        self.avatar = MuseAvatarV15(
            avatar_id=auto_avatar_id,
            video_path=handler_config.avatar_video_path,
            bbox_shift=0,
            batch_size=handler_config.batch_size,
            force_preparation=handler_config.force_create_avatar,
            parsing_mode="jaw",
            left_cheek_width=90,
            right_cheek_width=90,
            audio_padding_length_left=2,
            audio_padding_length_right=2,
            fps=handler_config.fps,
            version="v15",
            result_dir=result_dir,
            extra_margin=10,
            vae_type=vae_type,
            unet_model_path=unet_model_path,
            unet_config=unet_config,
            whisper_dir=whisper_dir,
            gpu_id=0,
            debug=handler_config.debug
        )
        logger.info("HandlerAvatarMusetalkMultiSession loaded successfully (model shared, processors per-session)")

    def create_context(self, session_context: SessionContext,
                      handler_config: Optional[AvatarMuseTalkConfig] = None) -> HandlerContext:
        """为每个会话创建独立的上下文和 processor"""
        session_id = session_context.session_info.session_id
        logger.info(f"[{session_id}] Creating context for new session")

        if not isinstance(handler_config, AvatarMuseTalkConfig):
            handler_config = AvatarMuseTalkConfig()

        # 获取或创建会话资源
        resources = self._get_or_create_session_resources(session_id)
        processor = resources['processor']
        queues = resources['queues']
        state = resources['state']

        # 设置 processor 的输出队列
        processor.audio_output_queue = queues['audio_out']
        processor.video_output_queue = queues['video_out']
        processor.event_out_queue = queues['event_out']

        # 创建打断回调
        def interrupt_callback():
            self._handle_interrupt(session_id)

        # 创建会话上下文 - 使用会话独立的 shared_state，同时传入全局 shared_states
        context = AvatarMuseTalkContextMultiSession(
            session_id,
            processor,
            queues['event_in'],
            queues['event_out'],
            queues['audio_out'],
            queues['video_out'],
            state['shared_state'],  # 使用会话独立的 shared_state
            interrupt_callback=interrupt_callback,
            global_shared_states=session_context.shared_states  # 传入全局 shared_states
        )
        context.output_data_definitions = self.output_data_definitions
        context.config = handler_config

        # 设置音频切片上下文
        output_audio_sample_rate = handler_config.output_audio_sample_rate
        fps = handler_config.fps
        frame_audio_len_float = output_audio_sample_rate / fps
        if not frame_audio_len_float.is_integer():
            logger.warning(f"[{session_id}] output_audio_sample_rate / fps = {output_audio_sample_rate} / {fps} = {frame_audio_len_float}, not an integer!")

        context.input_slice_context = SliceContext.create_numpy_slice_context(
            slice_size=output_audio_sample_rate,
            slice_axis=0,
        )

        # 保存 context 到字典
        self.session_contexts[session_id] = context

        logger.info(f"[{session_id}] Context created successfully")
        return context

    def start_context(self, session_context: SessionContext, handler_context: HandlerContext):
        """启动会话上下文"""
        session_id = session_context.session_info.session_id
        handler_context = cast(AvatarMuseTalkContextMultiSession, handler_context)

        # 保存 data_submitter
        state = self.session_states.get(session_id)
        if state:
            state['data_submitter'] = handler_context.data_submitter

        # 启动 processor
        handler_context.processor.start()
        logger.info(f"[{session_id}] Context started and processor started")

    def _handle_interrupt(self, session_id: str):
        """处理会话的打断"""
        state = self.session_states.get(session_id)
        if not state:
            logger.warning(f"[{session_id}] No state found for interrupt handling")
            return

        with state['interrupt_lock']:
            if state['is_interrupted']:
                logger.info(f"[{session_id}] Already in interrupted state, ensuring reset timer")
                # 即使已经在打断状态，也要确保重置定时器被触发
                threading.Timer(0.1, lambda: self._reset_interrupt_flag(session_id)).start()
                return

            state['is_interrupted'] = True
            state['is_speaking'] = False
            logger.info(f"[{session_id}] Handling interrupt")

            # 通知 processor 打断
            processor = self.session_processors.get(session_id)
            if processor and hasattr(processor, 'interrupt'):
                try:
                    processor.interrupt()
                    logger.info(f"[{session_id}] Processor interrupt called")
                except Exception as e:
                    logger.opt(exception=True).error(f"[{session_id}] Failed to call processor interrupt: {e}")

            # 清空队列
            queues = self.session_queues.get(session_id)
            if queues:
                for q in queues.values():
                    while not q.empty():
                        try:
                            q.get_nowait()
                        except:
                            pass

            state['current_speech_id'] = None
            logger.info(f"[{session_id}] Interrupt handling completed")

            # 发送 avatar_end 信号
            self._send_avatar_end(session_id)

            # 重置打断标志
            threading.Timer(0.1, lambda: self._reset_interrupt_flag(session_id)).start()

    def _reset_interrupt_flag(self, session_id: str):
        """重置打断标志"""
        state = self.session_states.get(session_id)
        if state:
            with state['interrupt_lock']:
                state['is_interrupted'] = False
                logger.info(f"[{session_id}] Interrupt flag reset")

    def _send_avatar_end(self, session_id: str):
        """发送 avatar_end 信号"""
        context = self.session_contexts.get(session_id)
        if not context:
            logger.warning(f"[{session_id}] No context found for sending avatar_end")
            return

        try:
            text_def = context.output_data_definitions.get(ChatDataType.AVATAR_TEXT)
            if text_def and context.data_submitter:
                end_bundle = DataBundle(text_def)
                # end_bundle.set_main_data("__AVATAR_END__")
                end_data = ChatData(type=ChatDataType.AVATAR_TEXT, data=end_bundle)
                context.data_submitter.submit(end_data)
                # logger.info(f"[{session_id}] Sent __AVATAR_END__ signal after interrupt")
            else:
                logger.warning(f"[{session_id}] No AVATAR_TEXT definition or data_submitter found")
        except Exception as e:
            logger.opt(exception=True).error(f"[{session_id}] Failed to send avatar_end: {e}")

    def get_handler_detail(self, session_context: SessionContext, context: HandlerContext) -> HandlerDetail:
        context = cast(AvatarMuseTalkContextMultiSession, context)
        inputs = {
            ChatDataType.AVATAR_AUDIO: HandlerDataInfo(
                type=ChatDataType.AVATAR_AUDIO,
                input_consume_mode=ChatDataConsumeMode.ONCE,
            )
        }
        outputs = {
            ChatDataType.AVATAR_AUDIO: HandlerDataInfo(
                type=ChatDataType.AVATAR_AUDIO,
                definition=context.output_data_definitions[ChatDataType.AVATAR_AUDIO],
            ),
            ChatDataType.AVATAR_VIDEO: HandlerDataInfo(
                type=ChatDataType.AVATAR_VIDEO,
                definition=context.output_data_definitions[ChatDataType.AVATAR_VIDEO],
            ),
            ChatDataType.AVATAR_TEXT: HandlerDataInfo(
                type=ChatDataType.AVATAR_TEXT,
                definition=context.output_data_definitions[ChatDataType.AVATAR_TEXT],
            ),
        }
        return HandlerDetail(inputs=inputs, outputs=outputs)

    def handle(self, context: HandlerContext, inputs: ChatData, output_definitions: Dict[ChatDataType, HandlerDataInfo]):
        """处理输入数据"""
        session_id = context.session_id
        context = cast(AvatarMuseTalkContextMultiSession, context)

        # Debug 保存
        if hasattr(context, 'config') and getattr(context.config, 'debug_save_handler_audio', False):
            self._save_debug_data(session_id, inputs, output_definitions)

        if inputs.type != ChatDataType.AVATAR_AUDIO:
            return

        state = self.session_states.get(session_id)
        if not state:
            logger.error(f"[{session_id}] No state found for handling")
            return

        speech_id = inputs.data.get_meta("speech_id")
        speech_end = inputs.data.get_meta("avatar_speech_end", False)

        # 判断是否是新的语音任务
        is_new_speech = (speech_id != state['current_speech_id'])
        state['current_speech_id'] = speech_id

        if is_new_speech and speech_id is not None:
            state['is_speaking'] = True
            logger.info(f"[{session_id}] New speech task started: {speech_id}")

        # 检查打断
        with state['interrupt_lock']:
            if state['is_interrupted']:
                logger.info(f"[{session_id}] Interrupted, dropping audio for speech_id={speech_id}")
                return

        # 处理音频数据
        audio_entry = inputs.data.get_main_definition_entry()
        audio_array = inputs.data.get_main_data()
        input_sample_rate = audio_entry.sample_rate

        if audio_array is not None and audio_array.dtype != np.float32:
            audio_array = audio_array.astype(np.float32)
        if audio_array is None:
            audio_array = np.zeros([input_sample_rate], dtype=np.float32)
            logger.error(f"[{session_id}] Audio data is None, filling with silence")

        # 切片并发送到 processor
        for audio_segment in slice_data(context.input_slice_context, audio_array.squeeze()):
            with state['interrupt_lock']:
                if state['is_interrupted']:
                    logger.info(f"[{session_id}] Interrupted during segment processing")
                    return

            speech_audio = SpeechAudio(
                speech_id=speech_id,
                end_of_speech=False,
                audio_data=audio_segment.tobytes(),
                sample_rate=input_sample_rate
            )
            context.processor.add_audio(speech_audio)

        if speech_end:
            with state['interrupt_lock']:
                if state['is_interrupted']:
                    logger.info(f"[{session_id}] Interrupted, not sending speech_end")
                    return

            # Flush remaining audio from slice context
            end_segment = context.input_slice_context.flush()
            if end_segment is None:
                logger.warning(f"[{session_id}] Last segment is empty: speech_id={speech_id}, filling with silence")
                fps = context.config.fps if hasattr(context.config, "fps") else 25
                frame_len = input_sample_rate // fps
                # 2 frames audio for silence
                zero_frames = np.zeros([4 * frame_len], dtype=np.float32)
                audio_data = zero_frames.tobytes()
            else:
                audio_data = end_segment.tobytes()

            speech_audio = SpeechAudio(
                speech_id=speech_id,
                end_of_speech=True,
                audio_data=audio_data,
                sample_rate=input_sample_rate
            )
            context.processor.add_audio(speech_audio)
            logger.info(f"[{session_id}] Speech end sent for speech_id={speech_id}")

    def _save_debug_data(self, session_id: str, inputs: ChatData, output_definitions: Dict[ChatDataType, HandlerDataInfo]):
        """保存调试数据"""
        debug_root = "logs/audio_segments/"
        speech_id = inputs.data.get_meta("speech_id") or "unknown"
        os.makedirs(debug_root, exist_ok=True)

        cache_key = f"{session_id}_{speech_id}"
        if cache_key not in self._debug_cache:
            self._debug_cache[cache_key] = []

        record = {
            "timestamp": time.time(),
            "session_id": session_id,
            "speech_id": speech_id,
            "speech_end": inputs.data.get_meta("avatar_speech_end", False),
        }
        self._debug_cache[cache_key].append(record)

        if record["speech_end"]:
            debug_file = os.path.join(debug_root, f"{session_id}_{speech_id}_debug.pkl")
            with open(debug_file, 'wb') as f:
                pickle.dump(self._debug_cache[cache_key], f)
            logger.info(f"[{session_id}] Debug data saved to {debug_file}")
            del self._debug_cache[cache_key]

    def destroy_context(self, context: HandlerContext):
        """销毁会话上下文"""
        session_id = context.session_id
        logger.info(f"[{session_id}] Destroying context")

        if isinstance(context, AvatarMuseTalkContextMultiSession):
            context.clear()

        # 清理会话资源
        self._cleanup_session_resources(session_id)
        logger.info(f"[{session_id}] Context destroyed")

