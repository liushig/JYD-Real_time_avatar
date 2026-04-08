import os
import queue
import threading
import time
from queue import Queue
from threading import Thread
from typing import Optional

import av
import librosa
import numpy as np
import soundfile as sf
import torch
from loguru import logger

from handlers.avatar.liteavatar.model.algo_model import AvatarStatus, AudioResult, VideoResult
from handlers.avatar.liteavatar.model.audio_input import SpeechAudio
from src.handlers.avatar.musetalk.avatar_musetalk_algo import MuseAvatarV15
from src.handlers.avatar.musetalk.avatar_musetalk_config import AvatarMuseTalkConfig


class InterruptException(Exception):
    """自定义中断异常"""
    pass


class AvatarMuseTalkProcessor:
    """MuseTalk processor responsible for audio-to-video conversion (multi-threaded queue structure)."""
    
    def __init__(self, avatar: MuseAvatarV15, config: AvatarMuseTalkConfig):
        self._avatar = avatar
        self._config = config
        self._algo_audio_sample_rate = config.algo_audio_sample_rate  # Internal algorithm sample rate, fixed at 16000
        self._output_audio_sample_rate = config.output_audio_sample_rate
        # Output queues
        self.audio_output_queue = None
        self.video_output_queue = None
        self.event_out_queue = None
        # Internal queues
        self._audio_queue = Queue()  # Input audio queue
        self._whisper_queue = Queue()  # Whisper feature queue
        self._unet_queue = Queue()  # Unet output queue
        self._frame_queue = Queue()  # Video frame queue
        self._frame_id_queue = Queue()  # Frame ID allocation queue
        self._compose_queue = Queue()  # Frame composition queue
        self._output_queue = Queue()   # Output queue after composition
        # Threading and state
        self._stop_event = threading.Event()
        self._feature_thread: Optional[Thread] = None
        self._frame_gen_thread: Optional[Thread] = None
        self._frame_gen_unet_thread: Optional[Thread] = None
        self._frame_gen_vae_thread: Optional[Thread] = None
        self._frame_collect_thread: Optional[Thread] = None
        self._compose_thread: Optional[Thread] = None
        self._session_running = False
        # Avatar status
        self._callback_avatar_status = AvatarStatus.LISTENING
        self._last_speech_id = None
        # Audio duration statistics
        self._first_add_audio_time = None
        self._audio_duration_sum = 0.0
        # Audio cache for each speech_id
        self._audio_cache = {}
        self._frame_id_lock = threading.Lock()
        
        # Interrupt handling
        self._interrupt_flag = threading.Event()  # 使用Event代替bool，线程安全
        self._interrupt_lock = threading.Lock()
        self._current_speech_id = None
        self._interrupt_handled = False
        self._last_interrupt_time = 0
        self._interrupt_cooldown = 0.5  # 打断冷却时间，避免频繁打断
        
        # Frame ID management for interrupt
        self._frame_id_counter = 0
        self._frame_id_reset_event = threading.Event()

    def interrupt(self):
        """
        触发打断处理。
        外部调用此方法来中断当前处理流程。
        """
        current_time = time.time()
        if current_time - self._last_interrupt_time < self._interrupt_cooldown:
            logger.warning(f"[INTERRUPT] Too frequent interrupt, ignoring (cooldown: {self._interrupt_cooldown}s)")
            return
            
        with self._interrupt_lock:
            if not self._interrupt_flag.is_set():
                self._interrupt_flag.set()
                self._last_interrupt_time = current_time
                logger.info("[INTERRUPT] Interrupt signal received and flag set")
            else:
                logger.debug("[INTERRUPT] Interrupt flag already set")

    def _check_interrupt(self, throw_exception: bool = False) -> bool:
        """
        检查是否发生打断。
        
        Args:
            throw_exception: 如果为True，在打断时抛出InterruptException
            
        Returns:
            是否发生打断
        """
        if self._interrupt_flag.is_set():
            if throw_exception:
                raise InterruptException("Processing interrupted")
            return True
        return False

    def _handle_interrupt_immediate(self):
        """
        立即处理打断：清空队列，重置状态。
        这个方法应该在检测到打断标志后调用。
        """
        with self._interrupt_lock:
            if self._interrupt_handled:
                return
                
            logger.info("[INTERRUPT] Handling interrupt immediately")
            
            # 清空所有内部队列
            self._clear_all_queues()
            
            # 清空音频缓存
            self._audio_cache.clear()
            
            # 重置状态变量
            self._current_speech_id = None
            self._callback_avatar_status = AvatarStatus.LISTENING
            self._first_add_audio_time = None
            self._audio_duration_sum = 0.0
            self._last_speech_id = None
            
            # 重置帧ID队列并重新填充
            self._reset_frame_id_queue()
            
            # 标记打断已处理
            self._interrupt_handled = True
            
            # 通知状态改变（如果event_out_queue可用）
            try:
                if self.event_out_queue is not None:
                    from handlers.avatar.liteavatar.liteavatar_worker import Tts2FaceEvent
                    self.event_out_queue.put_nowait(Tts2FaceEvent.SPEAKING_TO_LISTENING)
            except Exception as e:
                logger.opt(exception=True).error(f"[INTERRUPT] Failed to notify status change: {e}")
            
            logger.info("[INTERRUPT] Interrupt handling completed, ready for new tasks")

    def _reset_frame_id_queue(self):
        """重置帧ID队列并重新填充"""
        # 清空帧ID队列
        while not self._frame_id_queue.empty():
            try:
                self._frame_id_queue.get_nowait()
            except:
                pass
        
        # 重新填充帧ID（从当前帧ID开始）
        start_id = self._frame_id_counter
        for i in range(start_id, start_id + 1000):  # 填充足够多的帧ID
            try:
                self._frame_id_queue.put_nowait(i)
            except:
                break

    def _clear_all_queues(self):
        """清空所有处理队列"""
        queues = [
            self._audio_queue, self._whisper_queue, self._unet_queue,
            self._frame_queue, self._frame_id_queue, self._compose_queue,
            self._output_queue
        ]
        
        for q in queues:
            while not q.empty():
                try:
                    q.get_nowait()
                except:
                    pass
        
        logger.info("[INTERRUPT] All internal queues cleared")

    def start(self):
        """Start the processor and all worker threads."""
        if self._session_running:
            logger.error("Processor already running. session_running=True")
            return
            
        # 重置打断状态
        self._interrupt_flag.clear()
        self._interrupt_handled = False
        self._frame_id_counter = 0
        self._reset_frame_id_queue()
        
        self._session_running = True
        self._stop_event.clear()
        try:
            self._feature_thread = threading.Thread(target=self._feature_extractor_worker)
            if self._config.multi_thread_inference:
                self._frame_gen_unet_thread = threading.Thread(target=self._frame_generator_unet_worker)
                self._frame_gen_vae_thread = threading.Thread(target=self._frame_generator_vae_worker)
            else:
                self._frame_gen_thread = threading.Thread(target=self._frame_generator_worker)
            self._frame_collect_thread = threading.Thread(target=self._frame_collector_worker)
            self._compose_thread = threading.Thread(target=self._compose_worker)
            
            self._feature_thread.start()
            if self._config.multi_thread_inference:
                self._frame_gen_unet_thread.start()
                self._frame_gen_vae_thread.start()
            else:
                self._frame_gen_thread.start()
            self._frame_collect_thread.start()
            self._compose_thread.start()
            logger.info(f"MuseProcessor started.")
        except Exception as e:
            logger.opt(exception=True).error(f"Exception during thread start: {e}")

    def stop(self):
        """Stop the processor and all worker threads."""
        if not self._session_running:
            logger.warning("Processor not running. Skip stop.")
            return
            
        self._session_running = False
        self._stop_event.set()
        
        # 清除打断标志
        self._interrupt_flag.clear()
        
        try:
            threads_to_join = []
            if self._feature_thread:
                threads_to_join.append(("Feature", self._feature_thread))
            if self._frame_gen_thread:
                threads_to_join.append(("Frame generator", self._frame_gen_thread))
            if self._frame_gen_unet_thread:
                threads_to_join.append(("Frame generator unet", self._frame_gen_unet_thread))
            if self._frame_gen_vae_thread:
                threads_to_join.append(("Frame generator vae", self._frame_gen_vae_thread))
            if self._frame_collect_thread:
                threads_to_join.append(("Frame collector", self._frame_collect_thread))
            if self._compose_thread:
                threads_to_join.append(("Compose", self._compose_thread))
            
            for name, thread in threads_to_join:
                thread.join(timeout=5)
                if thread.is_alive():
                    logger.warning(f"{name} thread did not exit in time.")
            
            self._clear_queues()
        except Exception as e:
            logger.opt(exception=True).error(f"Exception during thread join: {e}")
        logger.info(f"MuseProcessor stopped.")

    def add_audio(self, speech_audio: SpeechAudio):
        """
        Add an audio segment to the processing queue. The segment length must not exceed 1 second. No resampling is performed here.
        Args:
            speech_audio (SpeechAudio): Audio segment to add.
        """
        # 检查打断标志
        if self._check_interrupt():
            # 如果当前正在处理一个speech_id，且与新的speech_id相同，拒绝
            if self._current_speech_id is not None and \
               speech_audio.speech_id == self._current_speech_id:
                logger.warning(f"[INTERRUPT] Rejecting audio for interrupted speech_id: {speech_audio.speech_id}")
                return
            else:
                # 如果speech_id不同，说明是新任务，重置打断状态
                with self._interrupt_lock:
                    self._interrupt_flag.clear()
                    self._interrupt_handled = False
                    logger.info(f"[INTERRUPT] New speech_id detected ({speech_audio.speech_id}), resetting interrupt state")
        
        # 更新当前speech_id
        self._current_speech_id = speech_audio.speech_id
            
        if self._config.debug:
            now = time.time()
            # Record the first add_audio time
            if self._first_add_audio_time is None:
                self._first_add_audio_time = now
            # Calculate audio duration
            audio_len = len(speech_audio.audio_data)
            sample_rate = speech_audio.sample_rate
            audio_duration = audio_len / 4 / sample_rate  # float32, 4 bytes
            self._audio_duration_sum += audio_duration
            # Calculate cumulative interval
            total_interval = now - self._first_add_audio_time
            # Log output
            log_msg = (
                f"Received add_audio: speech_id={speech_audio.speech_id}, end_of_speech={speech_audio.end_of_speech}, "
                f"sample_rate={sample_rate}, audio_len={audio_len}, audio_duration={audio_duration:.3f}s, "
                f"cumulative_audio_duration={self._audio_duration_sum:.3f}s, total_interval={total_interval:.3f}s"
            )
            if self._audio_duration_sum < total_interval:
                logger.error(log_msg + " [Cumulative audio duration < total interval, audio is too slow!]")
            else:
                logger.info(log_msg)
            # Output cumulative duration and interval when end_of_speech is reached and reset
            if speech_audio.end_of_speech:
                logger.info(f"[add_audio] speech_id={speech_audio.speech_id} segment cumulative_audio_duration: {self._audio_duration_sum:.3f}s, total_interval: {total_interval:.3f}s")
                self._audio_duration_sum = 0.0
                self._first_add_audio_time = None

        audio_data = speech_audio.audio_data
        if isinstance(audio_data, bytes):
            audio_data = np.frombuffer(audio_data, dtype=np.float32)
        elif isinstance(audio_data, np.ndarray):
            audio_data = audio_data.astype(np.float32)
        else:
            logger.error(f"audio_data must be bytes or np.ndarray, got {type(audio_data)}")
            return
        if len(audio_data) == 0:
            logger.error(f"Input audio is empty, speech_id={speech_audio.speech_id}")
            return
        # Length check
        if len(audio_data) > self._output_audio_sample_rate:
            logger.error(f"Audio segment too long: {len(audio_data)} > {self._algo_audio_sample_rate}, speech_id={speech_audio.speech_id}")
            return
        assert speech_audio.sample_rate == self._output_audio_sample_rate

        # 再次检查打断（在放入队列前）
        if self._check_interrupt():
            logger.warning(f"[INTERRUPT] Interrupted before queuing audio, dropping segment for speech_id={speech_audio.speech_id}")
            return

        # Directly enqueue, keep original sample rate and audio
        try:
            self._audio_queue.put({
                'audio_data': audio_data,  # Segment at algorithm sample rate (actually original segment)
                'speech_id': speech_audio.speech_id,
                'end_of_speech': speech_audio.end_of_speech,
            }, timeout=1)
        except queue.Full:
            logger.opt(exception=True).error(f"Audio queue full, dropping audio segment, speech_id={speech_audio.speech_id}")
            return

    def _feature_extractor_worker(self):
        """
        Worker thread for extracting audio features.
        """
        # Thread warmup: ensure CUDA context and memory allocation (for whisper feature extraction)
        if torch.cuda.is_available():
            t0 = time.time()
            warmup_sr = 16000
            dummy_audio = np.zeros(warmup_sr, dtype=np.float32)
            self._avatar.extract_whisper_feature(dummy_audio, warmup_sr)
            torch.cuda.synchronize()
            t1 = time.time()
            logger.info(f"[THREAD_WARMUP] _feature_extractor_worker thread id: {threading.get_ident()} whisper feature warmup done, time: {(t1-t0)*1000:.1f} ms")
        
        while not self._stop_event.is_set():
            # 检查打断
            if self._check_interrupt():
                self._handle_interrupt_immediate()
                time.sleep(0.01)
                continue
            
            try:
                t_start = time.time()
                item = self._audio_queue.get(timeout=1)
                
                # 再次检查打断
                if self._check_interrupt():
                    logger.info("[INTERRUPT] Interrupted during feature extraction, dropping current item")
                    self._handle_interrupt_immediate()
                    continue
                    
                audio_data = item['audio_data']
                speech_id = item['speech_id']
                end_of_speech = item['end_of_speech']
                fps = self._config.fps if hasattr(self._config, 'fps') else 25
                
                # 检查speech_id是否与当前一致（防止处理被中断的语音）
                if self._current_speech_id is not None and speech_id != self._current_speech_id:
                    logger.warning(f"[INTERRUPT] Speech ID mismatch: current={self._current_speech_id}, got={speech_id}, dropping")
                    continue
                
                # Resample to algorithm sample rate
                segment = librosa.resample(audio_data, orig_sr=self._output_audio_sample_rate, target_sr=self._algo_audio_sample_rate)
                target_len = self._algo_audio_sample_rate  # 1 second
                if len(segment) > target_len:
                    logger.error(f"Segment too long: {len(segment)} > {target_len}, speech_id={speech_id}")
                    raise ValueError(f"Segment too long: {len(segment)} > {target_len}")
                if len(segment) < target_len:
                    segment = np.pad(segment, (0, target_len - len(segment)), mode='constant')
                
                # Feature extraction
                t0 = time.time()
                whisper_chunks = self._avatar.extract_whisper_feature(segment, self._algo_audio_sample_rate)
                t1 = time.time()
                orig_audio_data_len = len(audio_data)
                orig_samples_per_frame = self._output_audio_sample_rate // fps
                actual_audio_len = orig_audio_data_len
                num_frames = int(np.ceil(actual_audio_len / orig_samples_per_frame))
                whisper_chunks = whisper_chunks[:num_frames]
                target_audio_len = num_frames * orig_samples_per_frame
                if len(audio_data) < target_audio_len:
                    audio_data = np.pad(audio_data, (0, target_audio_len - len(audio_data)), mode='constant')
                else:
                    audio_data = audio_data[:target_audio_len]
                padded_audio_data_len = len(audio_data)
                
                # Put each whisper chunk individually into whisper_queue
                num_chunks = len(whisper_chunks)
                
                for i in range(num_chunks):
                    # 检查打断
                    if self._check_interrupt():
                        logger.info(f"[INTERRUPT] Interrupted during chunk processing, stopping for speech_id={speech_id}")
                        self._handle_interrupt_immediate()
                        break
                    
                    # Extract single whisper chunk
                    whisper_chunk = whisper_chunks[i:i+1]  # Keep as 2D tensor [1, 50, 384]
                    
                    # Extract corresponding audio segment for this chunk
                    start_sample = i * orig_samples_per_frame
                    end_sample = start_sample + orig_samples_per_frame
                    audio_segment = audio_data[start_sample:end_sample]
                    
                    # Pad audio if necessary
                    if len(audio_segment) < orig_samples_per_frame:
                        audio_segment = np.pad(audio_segment, (0, orig_samples_per_frame - len(audio_segment)), mode='constant')
                    
                    # Determine if this is the last chunk for this speech
                    is_last_chunk = (i == num_chunks - 1)
                    
                    try:
                        self._whisper_queue.put({
                            'whisper_chunks': whisper_chunk,  # Single chunk as [1, 50, 384]
                            'speech_id': speech_id,
                            'end_of_speech': end_of_speech and is_last_chunk,
                            'audio_data': audio_segment,  # Single frame's audio
                        }, timeout=1)
                    except queue.Full:
                        logger.error(f"[FEATURE_WORKER] Whisper queue full, dropping chunk {i}/{num_chunks}, speech_id={speech_id}")
                
                t_end = time.time()
                if self._config.debug:
                    logger.info(f"[FEATURE_WORKER] speech_id={speech_id}, total_time={(t_end-t_start)*1000:.1f}ms, whisper_chunks_frames={whisper_chunks.shape[0]}, audio_data_original_length={orig_audio_data_len}, audio_data_padded_length={padded_audio_data_len}, end_of_speech={end_of_speech}")
            except queue.Empty:
                continue
            except InterruptException:
                logger.info("[INTERRUPT] Interrupt exception caught in feature extractor")
                self._handle_interrupt_immediate()
                continue
            except Exception as e:
                logger.opt(exception=True).error(f"Exception in _feature_extractor_worker: {e}")
                continue

    def _frame_generator_unet_worker(self):
        """
        Generate speaking frames only, with rate control when queue buffer is full.
        Uses global frame_id allocation to ensure unique and continuous frame numbering for speaking frames.
        """
        fps = self._config.fps
        orig_samples_per_frame = int(self._output_audio_sample_rate / fps)
        batch_size = self._config.batch_size  # Can be adjusted based on actual needs
        max_speaking_buffer = batch_size * 5  # Maximum length of speaking frame buffer
        
        # Thread self-warmup, ensure CUDA context and memory allocation
        if torch.cuda.is_available():
            t0 = time.time()
            # Regular batch_size warmup
            dummy_whisper = torch.zeros(batch_size, 50, 384, device=self._avatar.device, dtype=self._avatar.weight_dtype)
            self._avatar.generate_frames_unet(dummy_whisper, 0, batch_size)
            torch.cuda.synchronize()
            t1 = time.time()
            logger.info(f"[THREAD_WARMUP] _frame_generator_unet_worker thread id: {threading.get_ident()} self-warmup done, time: {(t1-t0)*1000:.1f} ms")
        
        batch_chunks = []
        batch_audio = []
        batch_speech_id = []
        batch_end_of_speech = []
        
        while not self._stop_event.is_set():
            # 检查打断
            if self._check_interrupt():
                self._handle_interrupt_immediate()
                # 清空批次
                batch_chunks.clear()
                batch_audio.clear()
                batch_speech_id.clear()
                batch_end_of_speech.clear()
                time.sleep(0.01)
                continue
            
            # Control speaking frame buffer, queue full waits
            while self._frame_queue.qsize() > max_speaking_buffer and not self._stop_event.is_set():
                if self._check_interrupt():
                    break
                if self._config.debug:
                    logger.info(f"[FRAME_GEN] speaking frame buffer full, waiting... frame_queue_size={self._frame_queue.qsize()}, max_speaking_buffer={max_speaking_buffer}")
                time.sleep(0.01)
                continue
            
            if self._check_interrupt():
                continue
                
            try:
                item = self._whisper_queue.get(timeout=1)
                
                # 检查打断
                if self._check_interrupt():
                    logger.info("[INTERRUPT] Interrupted during frame generation, dropping current batch")
                    self._handle_interrupt_immediate()
                    batch_chunks.clear()
                    batch_audio.clear()
                    batch_speech_id.clear()
                    batch_end_of_speech.clear()
                    continue
                
                # 检查speech_id是否与当前一致
                if self._current_speech_id is not None and item['speech_id'] != self._current_speech_id:
                    logger.warning(f"[INTERRUPT] Speech ID mismatch in frame gen: current={self._current_speech_id}, got={item['speech_id']}, dropping")
                    continue
                
                batch_chunks.append(item['whisper_chunks'])
                batch_audio.append(item['audio_data'])
                batch_speech_id.append(item['speech_id'])
                batch_end_of_speech.append(item['end_of_speech'])
                
                if len(batch_chunks) == batch_size or item['end_of_speech']:
                    valid_num = len(batch_chunks)
                    if valid_num < batch_size:
                        logger.warning(f"[FRAME_GEN] batch_size < valid_num, batch_size={batch_size}, valid_num={valid_num}")
                        pad_num = batch_size - valid_num
                        pad_shape = list(batch_chunks[0].shape)
                        if isinstance(batch_chunks[0], torch.Tensor):
                            pad_chunks = [torch.zeros(pad_shape, dtype=batch_chunks[0].dtype, device=batch_chunks[0].device) for _ in range(pad_num)]
                        else:
                            pad_chunks = [np.zeros(pad_shape, dtype=batch_chunks[0].dtype) for _ in range(pad_num)]
                        pad_audio = [np.zeros(orig_samples_per_frame, dtype=np.float32) for _ in range(pad_num)]
                        pad_speech_id = [batch_speech_id[-1]] * pad_num
                        pad_end_of_speech = [False] * pad_num
                        batch_chunks.extend(pad_chunks)
                        batch_audio.extend(pad_audio)
                        batch_speech_id.extend(pad_speech_id)
                        batch_end_of_speech.extend(pad_end_of_speech)
                    
                    if isinstance(batch_chunks[0], torch.Tensor):
                        whisper_batch = torch.cat(batch_chunks, dim=0)
                    else:
                        whisper_batch = np.concatenate(batch_chunks, axis=0)
                    
                    batch_start_time = time.time()
                    frame_ids = [self._frame_id_queue.get() for _ in range(batch_size)]
                    
                    try:
                        pred_latents, idx_list = self._avatar.generate_frames_unet(whisper_batch, frame_ids[0], batch_size)
                    except Exception as e:
                        logger.opt(exception=True).error(f"[GEN_FRAME_ERROR] frame_id={frame_ids[0]}, speech_id={batch_speech_id[0]}, error: {e}")
                        pred_latents, idx_list = [torch.zeros((batch_size, 4, 32, 32), dtype=self._avatar.unet.model.dtype, device=self._avatar.device), [(frame_ids[0] + i) for i in range(batch_size)]]
                    
                    batch_end_time = time.time()
                    if self._config.debug:
                        logger.info(f"[FRAME_GEN] Generated speaking frame batch: speech_id={batch_speech_id[0]}, batch_size={batch_size}, batch_time={(batch_end_time - batch_start_time)*1000:.1f}ms")
                    
                    unet_item = {
                            'pred_latents': pred_latents, # torch.Tensor: [B, 4, 32, 32]
                            'speech_id': batch_speech_id,
                            'avatar_status': AvatarStatus.SPEAKING,
                            'end_of_speech': batch_end_of_speech,
                            'audio_data': batch_audio,
                            'valid_num': valid_num,
                            'idx_list': idx_list,
                            'timestamp': time.time()
                        }
                    
                    # 检查打断
                    if not self._check_interrupt():
                        self._unet_queue.put(unet_item)
                    else:
                        logger.info("[INTERRUPT] Interrupted before putting to unet queue, dropping batch")
                    
                    batch_chunks = []
                    batch_audio = []
                    batch_speech_id = []
                    batch_end_of_speech = []
                    
            except queue.Empty:
                time.sleep(0.01)
                continue
            except InterruptException:
                logger.info("[INTERRUPT] Interrupt exception caught in frame generator unet")
                self._handle_interrupt_immediate()
                batch_chunks.clear()
                batch_audio.clear()
                batch_speech_id.clear()
                batch_end_of_speech.clear()
                continue
            except Exception as e:
                logger.opt(exception=True).error(f"Exception in _frame_generator_unet_worker: {e}")
                continue

    def _frame_generator_vae_worker(self):
        """
        Generate speaking frames only, with rate control when queue buffer is full.
        Uses global frame_id allocation to ensure unique and continuous frame numbering for speaking frames.
        """
        fps = self._config.fps
        orig_samples_per_frame = int(self._output_audio_sample_rate / fps)
        batch_size = self._config.batch_size  # Can be adjusted based on actual needs
        max_speaking_buffer = batch_size * 5  # Maximum length of speaking frame buffer
        
        # Thread self-warmup, ensure CUDA context and memory allocation
        if torch.cuda.is_available():
            t0 = time.time()
            # Regular batch_size warmup
            dummy_latents = torch.zeros(batch_size, 4, 32, 32, device=self._avatar.device, dtype=self._avatar.weight_dtype)
            idx_list = [0 + i for i in range(batch_size)]
            self._avatar.generate_frames_vae(dummy_latents, idx_list, batch_size)
            torch.cuda.synchronize()
            t1 = time.time()
            logger.info(f"[THREAD_WARMUP] _frame_generator_vae_worker thread id: {threading.get_ident()} self-warmup done, time: {(t1-t0)*1000:.1f} ms")
        
        while not self._stop_event.is_set():
            # 检查打断
            if self._check_interrupt():
                self._handle_interrupt_immediate()
                time.sleep(0.01)
                continue
            
            # Control speaking frame buffer, queue full waits
            while self._frame_queue.qsize() > max_speaking_buffer and not self._stop_event.is_set():
                if self._check_interrupt():
                    break
                if self._config.debug:
                    logger.info(f"[FRAME_GEN] speaking frame buffer full, waiting... frame_queue_size={self._frame_queue.qsize()}, max_speaking_buffer={max_speaking_buffer}")
                time.sleep(0.01)
                continue
            
            if self._check_interrupt():
                continue
                
            while self._unet_queue.qsize() <= 0 and not self._stop_event.is_set():
                if self._check_interrupt():
                    break
                time.sleep(0.01)
                continue
            
            if self._check_interrupt():
                continue
            
            # Batch vae inference for speaking frames
            try:
                item = self._unet_queue.get_nowait()
                
                # 检查打断
                if self._check_interrupt():
                    logger.info("[INTERRUPT] Interrupted during VAE processing, dropping current item")
                    self._handle_interrupt_immediate()
                    continue
                
                pred_latents = item['pred_latents']
                idx_list = item['idx_list']
                batch_audio = item['audio_data']
                valid_num = item['valid_num']
                batch_speech_id = item['speech_id']
                batch_end_of_speech = item['end_of_speech']
                cur_batch = pred_latents.shape[0]
                
                # 检查speech_id是否与当前一致
                if self._current_speech_id is not None and batch_speech_id[0] != self._current_speech_id:
                    logger.warning(f"[INTERRUPT] Speech ID mismatch in VAE: current={self._current_speech_id}, got={batch_speech_id[0]}, dropping")
                    continue
                
                recon_idx_list = []
                batch_start_time = time.time()
                try:
                    recon_idx_list = self._avatar.generate_frames_vae(pred_latents, idx_list, cur_batch)
                except Exception as e:
                    logger.opt(exception=True).error(f"[GEN_FRAME_ERROR] frame_id={idx_list[0]}, speech_id={batch_end_of_speech[0]}, error: {e}")
                    recon_idx_list = [(np.zeros((256, 256, 3), dtype=np.uint8), idx_list[0] + i) for i in range(cur_batch)]
                batch_end_time = time.time()
                 
                if self._config.debug:
                    logger.info(f"[FRAME_GEN] Generated speaking frame batch: speech_id={batch_end_of_speech[0]}, batch_size={batch_size}, batch_time={(batch_end_time - batch_start_time)*1000:.1f}ms")
                
                # just process valid frames
                for i in range(valid_num):
                    # 检查打断
                    if self._check_interrupt():
                        logger.info(f"[INTERRUPT] Interrupted during VAE frame processing, stopping")
                        self._handle_interrupt_immediate()
                        break
                    
                    recon, idx = recon_idx_list[i]
                    audio = batch_audio[i]
                    eos = batch_end_of_speech[i]
                    compose_item = {
                        'recon': recon,
                        'idx': idx,
                        'speech_id': batch_speech_id[i],
                        'avatar_status': AvatarStatus.SPEAKING,
                        'end_of_speech': eos,
                        'audio_segment': audio,
                        'frame_id': idx,
                        'timestamp': time.time()
                    }
                    
                    if not self._check_interrupt():
                        self._compose_queue.put(compose_item)
                    else:
                        logger.info("[INTERRUPT] Interrupted before putting to compose queue, dropping frame")
                        
            except queue.Empty:
                time.sleep(0.01)
                continue
            except InterruptException:
                logger.info("[INTERRUPT] Interrupt exception caught in frame generator vae")
                self._handle_interrupt_immediate()
                continue
            except Exception as e:
                logger.opt(exception=True).error(f"Exception in _frame_generator_vae_worker: {e}")
                continue

    def _frame_generator_worker(self):
        """
        Generate speaking frames only, with rate control when queue buffer is full.
        Uses global frame_id allocation to ensure unique and continuous frame numbering for speaking frames.
        """
        fps = self._config.fps
        orig_samples_per_frame = int(self._output_audio_sample_rate / fps)
        batch_size = self._config.batch_size  # Can be adjusted based on actual needs
        max_speaking_buffer = batch_size * 5  # Maximum length of speaking frame buffer
        
        # Thread self-warmup, ensure CUDA context and memory allocation
        if torch.cuda.is_available():
            t0 = time.time()
            # Regular batch_size warmup
            dummy_whisper = torch.zeros(batch_size, 50, 384, device=self._avatar.device, dtype=self._avatar.weight_dtype)
            self._avatar.generate_frames(dummy_whisper, 0, batch_size)
            torch.cuda.synchronize()
            t1 = time.time()
            logger.info(f"[THREAD_WARMUP] _frame_generator_worker thread id: {threading.get_ident()} self-warmup done, time: {(t1-t0)*1000:.1f} ms")
        
        batch_chunks = []
        batch_audio = []
        batch_speech_id = []
        batch_end_of_speech = []
        
        while not self._stop_event.is_set():
            # 检查打断
            if self._check_interrupt():
                self._handle_interrupt_immediate()
                # 清空批次
                batch_chunks.clear()
                batch_audio.clear()
                batch_speech_id.clear()
                batch_end_of_speech.clear()
                time.sleep(0.01)
                continue
            
            # Control speaking frame buffer, queue full waits
            while self._frame_queue.qsize() > max_speaking_buffer and not self._stop_event.is_set():
                if self._check_interrupt():
                    break
                if self._config.debug:
                    logger.info(f"[FRAME_GEN] speaking frame buffer full, waiting... frame_queue_size={self._frame_queue.qsize()}, max_speaking_buffer={max_speaking_buffer}")
                time.sleep(0.01)
                continue
            
            if self._check_interrupt():
                continue
                
            try:
                item = self._whisper_queue.get(timeout=1)
                
                # 检查打断
                if self._check_interrupt():
                    logger.info("[INTERRUPT] Interrupted during frame generation, dropping current batch")
                    self._handle_interrupt_immediate()
                    batch_chunks.clear()
                    batch_audio.clear()
                    batch_speech_id.clear()
                    batch_end_of_speech.clear()
                    continue
                
                # 检查speech_id是否与当前一致
                if self._current_speech_id is not None and item['speech_id'] != self._current_speech_id:
                    logger.warning(f"[INTERRUPT] Speech ID mismatch in frame gen: current={self._current_speech_id}, got={item['speech_id']}, dropping")
                    continue
                
                batch_chunks.append(item['whisper_chunks'])
                batch_audio.append(item['audio_data'])
                batch_speech_id.append(item['speech_id'])
                batch_end_of_speech.append(item['end_of_speech'])
                
                if len(batch_chunks) == batch_size or item['end_of_speech']:
                    valid_num = len(batch_chunks)
                    if valid_num < batch_size:
                        logger.warning(f"[FRAME_GEN] batch_size < valid_num, batch_size={batch_size}, valid_num={valid_num}")
                        pad_num = batch_size - valid_num
                        pad_shape = list(batch_chunks[0].shape)
                        if isinstance(batch_chunks[0], torch.Tensor):
                            pad_chunks = [torch.zeros(pad_shape, dtype=batch_chunks[0].dtype, device=batch_chunks[0].device) for _ in range(pad_num)]
                        else:
                            pad_chunks = [np.zeros(pad_shape, dtype=batch_chunks[0].dtype) for _ in range(pad_num)]
                        pad_audio = [np.zeros(orig_samples_per_frame, dtype=np.float32) for _ in range(pad_num)]
                        pad_speech_id = [batch_speech_id[-1]] * pad_num
                        pad_end_of_speech = [False] * pad_num
                        batch_chunks.extend(pad_chunks)
                        batch_audio.extend(pad_audio)
                        batch_speech_id.extend(pad_speech_id)
                        batch_end_of_speech.extend(pad_end_of_speech)
                    
                    if isinstance(batch_chunks[0], torch.Tensor):
                        whisper_batch = torch.cat(batch_chunks, dim=0)
                    else:
                        whisper_batch = np.concatenate(batch_chunks, axis=0)
                    
                    batch_start_time = time.time()
                    frame_ids = [self._frame_id_queue.get() for _ in range(batch_size)]
                    
                    try:
                        recon_idx_list = self._avatar.generate_frames(whisper_batch, frame_ids[0], batch_size)
                    except Exception as e:
                        logger.opt(exception=True).error(f"[GEN_FRAME_ERROR] frame_id={frame_ids[0]}, speech_id={batch_speech_id[0]}, error: {e}")
                        recon_idx_list = [(np.zeros((256, 256, 3), dtype=np.uint8), frame_ids[0] + i) for i in range(batch_size)]
                    
                    batch_end_time = time.time()
                    if self._config.debug:
                        logger.info(f"[FRAME_GEN] Generated speaking frame batch: speech_id={batch_speech_id[0]}, batch_size={batch_size}, batch_time={(batch_end_time - batch_start_time)*1000:.1f}ms")
                    
                    # 只处理有效帧
                    for i in range(valid_num):
                        # 检查打断
                        if self._check_interrupt():
                            logger.info(f"[INTERRUPT] Interrupted during frame processing, stopping")
                            self._handle_interrupt_immediate()
                            break
                        
                        recon, idx = recon_idx_list[i]
                        audio = batch_audio[i]
                        eos = batch_end_of_speech[i]
                        compose_item = {
                            'recon': recon,
                            'idx': idx,
                            'speech_id': batch_speech_id[i],
                            'avatar_status': AvatarStatus.SPEAKING,
                            'end_of_speech': eos,
                            'audio_segment': audio,
                            'frame_id': idx,
                            'timestamp': time.time()
                        }
                        
                        if not self._check_interrupt():
                            self._compose_queue.put(compose_item)
                        else:
                            logger.info("[INTERRUPT] Interrupted before putting to compose queue, dropping frame")
                    
                    batch_chunks = []
                    batch_audio = []
                    batch_speech_id = []
                    batch_end_of_speech = []
                    
            except queue.Empty:
                time.sleep(0.01)
                continue
            except InterruptException:
                logger.info("[INTERRUPT] Interrupt exception caught in frame generator")
                self._handle_interrupt_immediate()
                batch_chunks.clear()
                batch_audio.clear()
                batch_speech_id.clear()
                batch_end_of_speech.clear()
                continue
            except Exception as e:
                logger.opt(exception=True).error(f"Exception in _frame_generator_worker: {e}")
                continue

    def _compose_worker(self):
        """
        Independent thread: Responsible for executing res2combined and putting the synthesis results into _output_queue
        """
        while not self._stop_event.is_set():
            # 检查打断
            if self._check_interrupt():
                self._handle_interrupt_immediate()
                time.sleep(0.01)
                continue
                
            try:
                item = self._compose_queue.get(timeout=0.1)
                
                # 检查打断
                if self._check_interrupt():
                    logger.info("[INTERRUPT] Interrupted during composition, dropping current item")
                    self._handle_interrupt_immediate()
                    continue
                
                # 检查speech_id是否与当前一致
                if self._current_speech_id is not None and item['speech_id'] != self._current_speech_id:
                    logger.warning(f"[INTERRUPT] Speech ID mismatch in compose: current={self._current_speech_id}, got={item['speech_id']}, dropping")
                    continue
                
                recon = item['recon']
                idx = item['idx']
                frame = self._avatar.res2combined(recon, idx)
                item['frame'] = frame
                
                if not self._check_interrupt():
                    self._output_queue.put(item)
                else:
                    logger.info("[INTERRUPT] Interrupted before putting to output queue, dropping frame")
                    
            except queue.Empty:
                continue
            except InterruptException:
                logger.info("[INTERRUPT] Interrupt exception caught in compose worker")
                self._handle_interrupt_immediate()
                continue
            except Exception as e:
                logger.opt(exception=True).error(f"Exception in _compose_worker: {e}")
                continue

    def _frame_collector_worker(self):
        """
        Collector strictly outputs at fps, with frame numbers matching the frame_id assigned by the inference thread.
        """
        fps = self._config.fps
        frame_interval = 1.0 / fps
        start_time = time.perf_counter()
        local_frame_id = 0
        last_active_speech_id = None
        last_speaking = False
        last_end_of_speech = False
        current_speech_id = None
        
        while not self._stop_event.is_set():
            # 检查打断
            if self._check_interrupt():
                self._handle_interrupt_immediate()
                # 重置开始时间和帧ID
                start_time = time.perf_counter()
                local_frame_id = 0
                current_speech_id = None
                last_active_speech_id = None
                time.sleep(0.01)
                continue
            
            # Control fps
            target_time = start_time + local_frame_id * frame_interval
            now = time.perf_counter()
            sleep_time = target_time - now
            if sleep_time > 0.002:
                time.sleep(sleep_time - 0.001)
            while time.perf_counter() < target_time:
                pass
            
            # Record the start time for profiling
            t_frame_start = time.perf_counter()
            
            # 检查打断
            if self._check_interrupt():
                logger.info(f"[INTERRUPT] Interrupted during frame collection at frame_id={local_frame_id}")
                self._handle_interrupt_immediate()
                # 跳过当前帧
                local_frame_id += 1
                continue
            
            # Allocate frame_id
            try:
                self._frame_id_counter = local_frame_id
                self._frame_id_queue.put(local_frame_id)
            except Exception as e:
                logger.opt(exception=True).error(f"Failed to allocate frame_id: {e}")
                local_frame_id += 1
                continue
            
            try:
                output_item = self._output_queue.get_nowait()
                
                # 检查打断
                if self._check_interrupt():
                    logger.info(f"[INTERRUPT] Interrupted after getting output item at frame_id={local_frame_id}")
                    self._handle_interrupt_immediate()
                    # 跳过当前帧
                    local_frame_id += 1
                    continue
                
                frame = output_item['frame']
                speech_id = output_item['speech_id']
                avatar_status = output_item['avatar_status']
                end_of_speech = output_item['end_of_speech']
                frame_timestamp = output_item.get('timestamp', None)
                audio_segment = output_item['audio_segment']
                
                # 检查speech_id是否与当前一致
                if self._current_speech_id is not None and speech_id != self._current_speech_id:
                    logger.warning(f"[INTERRUPT] Speech ID mismatch in frame collector: current={self._current_speech_id}, got={speech_id}, using idle frame")
                    # 使用空闲帧
                    frame = self._avatar.generate_idle_frame(local_frame_id)
                    speech_id = last_active_speech_id
                    avatar_status = AvatarStatus.LISTENING
                    end_of_speech = False
                    frame_timestamp = time.time()
                    audio_segment = None
                    
            except queue.Empty:
                frame = self._avatar.generate_idle_frame(local_frame_id)
                speech_id = last_active_speech_id
                avatar_status = AvatarStatus.LISTENING
                end_of_speech = False
                frame_timestamp = time.time()
                audio_segment = None
            
            # Notify video
            video_frame = av.VideoFrame.from_ndarray(frame, format="bgr24")
            video_result = VideoResult(
                video_frame=video_frame,
                speech_id=speech_id,
                avatar_status=avatar_status,
                end_of_speech=end_of_speech,
                bg_frame_id=-1
            )
            
            # Logging logic
            is_idle = (avatar_status == AvatarStatus.LISTENING and speech_id is None)
            is_speaking = (avatar_status == AvatarStatus.SPEAKING)
            is_end_of_speech = bool(end_of_speech)
            
            if self._config.debug:
                if is_speaking:
                    # First speaking frame
                    if speech_id != current_speech_id:
                        logger.info(f"[SPEAKING_FRAME][START] frame_id={local_frame_id}, speech_id={speech_id}, status={avatar_status}, end_of_speech={end_of_speech}, video_timestamp={frame_timestamp}")
                        current_speech_id = speech_id
                    # Last speaking frame
                    if is_end_of_speech:
                        logger.info(f"[SPEAKING_FRAME][END] frame_id={local_frame_id}, speech_id={speech_id}, status={avatar_status}, end_of_speech={end_of_speech}, video_timestamp={frame_timestamp}")
                        current_speech_id = None
                    # Middle speaking frame
                    if not is_end_of_speech and (speech_id == current_speech_id):
                        logger.info(f"[SPEAKING_FRAME] frame_id={local_frame_id}, speech_id={speech_id}, status={avatar_status}, end_of_speech={end_of_speech}, video_timestamp={frame_timestamp}")
                elif is_idle and last_speaking:
                    if last_end_of_speech:
                        logger.info(f"[IDLE_FRAME] Start after speaking: frame_id={local_frame_id}, status={avatar_status}")
                    else:
                        # logger.warning(f"[IDLE_FRAME] Inserted idle during speaking: frame_id={local_frame_id}")
                        pass
            else:
                if is_speaking and speech_id != current_speech_id:
                    logger.info(f"[SPEAKING_FRAME] Start: frame_id={local_frame_id}, speech_id={speech_id}")
                    current_speech_id = speech_id
                # Last speaking frame
                if is_speaking and is_end_of_speech:
                    logger.info(f"[SPEAKING_FRAME] End: frame_id={local_frame_id}, speech_id={speech_id}, end_of_speech=True")
                    current_speech_id = None
                # Idle frame: distinguish between inserted idle during speaking and first idle after speaking
                if is_idle and last_speaking:
                    if last_end_of_speech:
                        logger.info(f"[IDLE_FRAME] Start after speaking: frame_id={local_frame_id}")
                    else:
                        # logger.warning(f"[IDLE_FRAME] Inserted idle during speaking: frame_id={local_frame_id}")
                        pass
            
            # 检查打断后再通知视频
            if not self._check_interrupt():
                self._notify_video(video_result)
            else:
                logger.info(f"[INTERRUPT] Interrupted before notifying video at frame_id={local_frame_id}")

            # Audio related
            audio_len = len(audio_segment) if audio_segment is not None else 0
            if audio_segment is not None and audio_len > 0 and not self._check_interrupt():
                audio_np = np.asarray(audio_segment, dtype=np.float32)
                if audio_np.ndim == 1:
                    audio_np = audio_np[np.newaxis, :]
                audio_frame = av.AudioFrame.from_ndarray(audio_np, format="flt", layout="mono")
                audio_frame.sample_rate = self._output_audio_sample_rate
                audio_result = AudioResult(
                    audio_frame=audio_frame,
                    speech_id=speech_id,
                    end_of_speech=end_of_speech
                )
                if speech_id not in self._audio_cache:
                    self._audio_cache[speech_id] = []
                self._audio_cache[speech_id].append(audio_np[0] if audio_np.ndim == 2 else audio_np)
                audio_len_sum = sum([len(seg) for seg in self._audio_cache[speech_id]]) / self._output_audio_sample_rate
                if self._config.debug:
                    logger.info(f"[AUDIO_FRAME] frame_id={local_frame_id}, speech_id={speech_id}, end_of_speech={end_of_speech}, audio_timestamp={frame_timestamp}, Cumulative audio duration={audio_len_sum:.3f}s")
                
                if not self._check_interrupt():
                    self._notify_audio(audio_result)
                else:
                    logger.info(f"[INTERRUPT] Interrupted before notifying audio at frame_id={local_frame_id}")
            
            # Status switching etc.
            if end_of_speech and not self._check_interrupt():
                logger.info(f"Status change: SPEAKING -> LISTENING, speech_id={speech_id}")
                try:
                    if getattr(self._config, 'debug_save_handler_audio', False):
                        all_audio = np.concatenate(self._audio_cache[speech_id], axis=-1)
                        save_dir = "logs/audio_segments"
                        os.makedirs(save_dir, exist_ok=True)
                        wav_path = os.path.join(save_dir, f"{speech_id}_all.wav")
                        sf.write(wav_path, all_audio, self._output_audio_sample_rate, subtype='PCM_16')
                        logger.info(f"[AUDIO_FRAME] saved full wav: {wav_path}")
                except Exception as e:
                    logger.error(f"[AUDIO_FRAME] save full wav error: {e}")
                
                if speech_id in self._audio_cache:
                    del self._audio_cache[speech_id]
                
                self._notify_status_change(speech_id, AvatarStatus.LISTENING)
            
            t_frame_end = time.perf_counter()
            if self._config.debug and (t_frame_end - t_frame_start > frame_interval):
                logger.warning(f"[PROFILE] frame_id={local_frame_id} total={t_frame_end-t_frame_start:.4f}s (>{frame_interval:.4f}s)")
            
            local_frame_id += 1
            last_speaking = is_speaking
            last_end_of_speech = is_end_of_speech

    def _notify_audio(self, audio_result: AudioResult):
        if self.audio_output_queue is not None:
            audio_frame = audio_result.audio_frame
            audio_data = audio_frame.to_ndarray()
            # Ensure float32 and shape [1, N]
            if audio_data.dtype != np.float32:
                audio_data = audio_data.astype(np.float32)
            if audio_data.ndim == 1:
                audio_data = audio_data[np.newaxis, ...]
            elif audio_data.ndim == 2 and audio_data.shape[0] != 1:
                audio_data = audio_data[:1, ...]
            try:
                self.audio_output_queue.put_nowait(audio_data)
            except Exception as e:
                logger.opt(exception=True).error(f"Exception in _notify_audio: {e}")

    def _notify_video(self, video_result: VideoResult):
        if self.video_output_queue is not None:
            video_frame = video_result.video_frame
            try:
                data = video_frame.to_ndarray(format="bgr24")
                self.video_output_queue.put_nowait(data)
            except Exception as e:
                logger.opt(exception=True).error(f"Exception in _notify_video: {e}")

    def _notify_status_change(self, speech_id: str, status: AvatarStatus):
        if self.event_out_queue is not None and status == AvatarStatus.LISTENING:
            try:
                from handlers.avatar.liteavatar.liteavatar_worker import Tts2FaceEvent
                self.event_out_queue.put_nowait(Tts2FaceEvent.SPEAKING_TO_LISTENING)
            except Exception as e:
                logger.opt(exception=True).error(f"Exception in _notify_status_change: {e}")

    def _clear_queues(self):
        with self._frame_id_lock:
            for q in [self._audio_queue, self._whisper_queue, self._unet_queue, self._frame_queue, self._frame_id_queue, self._compose_queue, self._output_queue]:
                while not q.empty():
                    try:
                        q.get_nowait()
                    except Exception as e:
                        logger.opt(exception=True).warning(f"Exception in _clear_queues: {e}")
                        pass