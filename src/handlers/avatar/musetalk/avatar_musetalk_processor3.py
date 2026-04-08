"""
MuseTalk 数字人音视频处理核心处理器
负责音频特征提取、人脸帧生成（Unet/VAE）、帧合成、音视频输出等核心逻辑
支持打断机制、多线程推理、帧率控制、音频缓存与导出等功能
"""
import os
import queue
import threading
import time
from queue import Queue
from threading import Thread
from typing import Optional, List, Tuple

import av
import librosa
import numpy as np
import soundfile as sf
import torch
from loguru import logger

# 注意：请根据实际项目目录结构调整导入路径
try:
    from handlers.avatar.liteavatar.model.algo_model import AvatarStatus, AudioResult, VideoResult
    from handlers.avatar.liteavatar.model.audio_input import SpeechAudio
    from src.handlers.avatar.musetalk.avatar_musetalk_algo import MuseAvatarV15
    from src.handlers.avatar.musetalk.avatar_musetalk_config import AvatarMuseTalkConfig
    from handlers.avatar.liteavatar.liteavatar_worker import Tts2FaceEvent
except ImportError as e:
    logger.warning(f"导入模块失败（请检查路径）: {e}")
    # 备用占位定义（仅用于避免语法错误，实际运行需替换为真实实现）
    class AvatarStatus:
        LISTENING = "LISTENING"
        SPEAKING = "SPEAKING"
    
    class AudioResult:
        def __init__(self, audio_frame, speech_id, end_of_speech):
            self.audio_frame = audio_frame
            self.speech_id = speech_id
            self.end_of_speech = end_of_speech
    
    class VideoResult:
        def __init__(self, video_frame, speech_id, avatar_status, end_of_speech, bg_frame_id):
            self.video_frame = video_frame
            self.speech_id = speech_id
            self.avatar_status = avatar_status
            self.end_of_speech = end_of_speech
            self.bg_frame_id = bg_frame_id
    
    class SpeechAudio:
        def __init__(self, speech_id, end_of_speech, audio_data, sample_rate):
            self.speech_id = speech_id
            self.end_of_speech = end_of_speech
            self.audio_data = audio_data
            self.sample_rate = sample_rate
    
    class MuseAvatarV15:
        def __init__(self, *args, **kwargs):
            self.device = torch.device("cpu")
            self.weight_dtype = torch.float32
        
        def extract_whisper_feature(self, audio, sr):
            return torch.zeros(25, 50, 384)
        
        def generate_frames_unet(self, whisper_batch, start_id, batch_size):
            return torch.zeros(batch_size, 4, 32, 32), [start_id + i for i in range(batch_size)]
        
        def generate_frames_vae(self, latents, idx_list, batch_size):
            return [(np.zeros((256, 256, 3), dtype=np.uint8), idx) for idx in idx_list]
        
        def generate_frames(self, whisper_batch, start_id, batch_size):
            return [(np.zeros((256, 256, 3), dtype=np.uint8), start_id + i) for i in range(batch_size)]
        
        def res2combined(self, recon, idx):
            return np.zeros((256, 256, 3), dtype=np.uint8)
        
        def generate_idle_frame(self, frame_id):
            return np.zeros((256, 256, 3), dtype=np.uint8)
    
    class AvatarMuseTalkConfig:
        def __init__(self):
            self.algo_audio_sample_rate = 16000
            self.output_audio_sample_rate = 24000
            self.multi_thread_inference = True
            self.batch_size = 8
            self.fps = 25
            self.debug = False
            self.debug_save_handler_audio = False
    
    class Tts2FaceEvent:
        SPEAKING_TO_LISTENING = "SPEAKING_TO_LISTENING"

class AvatarMuseTalkProcessor:
    """
    MuseTalk 数字人音视频转换处理器（多线程队列架构）
    核心功能：
    1. 接收音频片段，提取Whisper特征
    2. 多线程生成人脸帧（Unet+VAE 或 单线程）
    3. 帧合成与音视频输出
    4. 支持实时打断、帧率控制、音频缓存与导出
    """
    def __init__(self, avatar: MuseAvatarV15, config: AvatarMuseTalkConfig):
        self._avatar = avatar
        self._config = config
        self._algo_audio_sample_rate = config.algo_audio_sample_rate  # 算法内部采样率（固定16000）
        self._output_audio_sample_rate = config.output_audio_sample_rate  # 输出音频采样率
        # 外部输出队列（由Handler注入）
        self.audio_output_queue = None
        self.video_output_queue = None
        self.event_out_queue = None
        # 内部处理队列
        self._audio_queue = Queue()        # 输入音频队列
        self._whisper_queue = Queue()      # Whisper特征队列
        self._unet_queue = Queue()         # Unet输出队列
        self._frame_queue = Queue()        # 视频帧队列
        self._frame_id_queue = Queue()     # 帧ID分配队列
        self._compose_queue = Queue()      # 帧合成队列
        self._output_queue = Queue()       # 合成后输出队列
        # 线程与状态控制
        self._stop_event = threading.Event()
        self._feature_thread: Optional[Thread] = None
        self._frame_gen_thread: Optional[Thread] = None
        self._frame_gen_unet_thread: Optional[Thread] = None
        self._frame_gen_vae_thread: Optional[Thread] = None
        self._frame_collect_thread: Optional[Thread] = None
        self._compose_thread: Optional[Thread] = None
        self._session_running = False
        # 数字人状态
        self._callback_avatar_status = AvatarStatus.LISTENING
        self._last_speech_id = None
        # 音频时长统计
        self._first_add_audio_time = None
        self._audio_duration_sum = 0.0
        # 每个speech_id的音频缓存
        self._audio_cache = {}
        self._frame_id_lock = threading.Lock()
        # 共享状态（由外部传入，对应SessionContext的SharedStates）
        self.shared_state = None
        # 线程锁：保护打断标志的原子性读写
        self.interrupt_lock = threading.Lock()

    def start(self):
        """启动处理器及所有工作线程"""
        if self._session_running:
            logger.error("处理器已运行，无需重复启动")
            return
        
        # 启动前重置打断标志（加锁保护）
        with self.interrupt_lock:
            if self.shared_state is not None and hasattr(self.shared_state, 'avatar_interrupt_flag'):
                self.shared_state.avatar_interrupt_flag = False
        
        self._session_running = True
        self._stop_event.clear()
        
        try:
            # 初始化工作线程
            self._feature_thread = threading.Thread(target=self._feature_extractor_worker, daemon=True)
            if self._config.multi_thread_inference:
                self._frame_gen_unet_thread = threading.Thread(target=self._frame_generator_unet_worker, daemon=True)
                self._frame_gen_vae_thread = threading.Thread(target=self._frame_generator_vae_worker, daemon=True)
            else:
                self._frame_gen_thread = threading.Thread(target=self._frame_generator_worker, daemon=True)
            self._frame_collect_thread = threading.Thread(target=self._frame_collector_worker, daemon=True)
            self._compose_thread = threading.Thread(target=self._compose_worker, daemon=True)
            
            # 启动线程
            self._feature_thread.start()
            if self._config.multi_thread_inference:
                self._frame_gen_unet_thread.start()
                self._frame_gen_vae_thread.start()
            else:
                self._frame_gen_thread.start()
            self._frame_collect_thread.start()
            self._compose_thread.start()
            
            logger.info(f"MuseProcessor 启动成功（多线程推理: {self._config.multi_thread_inference}）")
        except Exception as e:
            logger.opt(exception=True).error(f"线程启动失败: {e}")
            self.stop()

    def stop(self):
        """停止处理器及所有工作线程"""
        # 置位全局打断标志（加锁保护）
        with self.interrupt_lock:
            if self.shared_state is not None and hasattr(self.shared_state, 'avatar_interrupt_flag'):
                self.shared_state.avatar_interrupt_flag = True
        
        if not self._session_running:
            logger.warning("处理器未运行，无需停止")
            return
        
        self._session_running = False
        self._stop_event.set()
        
        # 等待线程退出
        thread_list = [
            ("特征提取线程", self._feature_thread),
            ("帧生成线程(单)", self._frame_gen_thread),
            ("帧生成线程(Unet)", self._frame_gen_unet_thread),
            ("帧生成线程(VAE)", self._frame_gen_vae_thread),
            ("帧收集线程", self._frame_collect_thread),
            ("帧合成线程", self._compose_thread)
        ]
        
        for thread_name, thread in thread_list:
            if thread and thread.is_alive():
                try:
                    thread.join(timeout=5)
                    if thread.is_alive():
                        logger.warning(f"{thread_name} 未及时退出")
                except Exception as e:
                    logger.opt(exception=True).error(f"等待{thread_name}退出失败: {e}")
        
        # 清空所有队列
        self._clear_queues()
        
        # 重置打断标志
        with self.interrupt_lock:
            if self.shared_state is not None and hasattr(self.shared_state, 'avatar_interrupt_flag'):
                self.shared_state.avatar_interrupt_flag = False
        
        logger.info("MuseProcessor 已停止并清理资源")

    def add_audio(self, speech_audio: SpeechAudio):
        """
        向处理队列添加音频片段（长度不超过1秒）
        Args:
            speech_audio (SpeechAudio): 音频片段对象
        """
        # 检查打断标志，触发时拒绝接收新音频（加锁保护）
        with self.interrupt_lock:
            if (self.shared_state is not None and 
                hasattr(self.shared_state, 'avatar_interrupt_flag') and 
                self.shared_state.avatar_interrupt_flag):
                logger.error(f"数字人已被打断，拒绝接收音频（speech_id={speech_audio.speech_id}）")
                return
        
        # 调试日志：音频时长统计
        if self._config.debug:
            now = time.time()
            if self._first_add_audio_time is None:
                self._first_add_audio_time = now
            
            audio_len = len(speech_audio.audio_data)
            sample_rate = speech_audio.sample_rate
            audio_duration = audio_len / 4 / sample_rate  # float32占4字节
            self._audio_duration_sum += audio_duration
            total_interval = now - self._first_add_audio_time
            
            log_msg = (
                f"接收音频片段: speech_id={speech_audio.speech_id}, end_of_speech={speech_audio.end_of_speech}, "
                f"采样率={sample_rate}, 长度={audio_len}, 时长={audio_duration:.3f}s, "
                f"累计音频时长={self._audio_duration_sum:.3f}s, 累计时间间隔={total_interval:.3f}s"
            )
            
            if self._audio_duration_sum < total_interval:
                logger.error(log_msg + " [音频生成速度过慢！]")
            else:
                logger.info(log_msg)
            
            # 语音结束时重置统计
            if speech_audio.end_of_speech:
                logger.info(f"[音频片段结束] speech_id={speech_audio.speech_id} 累计音频时长: {self._audio_duration_sum:.3f}s, 累计时间间隔: {total_interval:.3f}s")
                self._audio_duration_sum = 0.0
                self._first_add_audio_time = None

        # 音频数据格式转换
        audio_data = speech_audio.audio_data
        if isinstance(audio_data, bytes):
            audio_data = np.frombuffer(audio_data, dtype=np.float32)
        elif isinstance(audio_data, np.ndarray):
            audio_data = audio_data.astype(np.float32)
        else:
            logger.error(f"音频数据类型错误（需bytes/np.ndarray）: {type(audio_data)}")
            return
        
        # 空音频检查
        if len(audio_data) == 0:
            logger.error(f"空音频片段（speech_id={speech_audio.speech_id}）")
            return
        
        # 长度检查（不超过1秒）
        if len(audio_data) > self._output_audio_sample_rate:
            logger.error(f"音频片段过长（{len(audio_data)} > {self._output_audio_sample_rate}）, speech_id={speech_audio.speech_id}")
            return
        
        # 采样率校验
        assert speech_audio.sample_rate == self._output_audio_sample_rate, "采样率不匹配"

        # 入队处理
        try:
            self._audio_queue.put({
                'audio_data': audio_data,
                'speech_id': speech_audio.speech_id,
                'end_of_speech': speech_audio.end_of_speech,
            }, timeout=1)
        except queue.Full:
            logger.opt(exception=True).error(f"音频队列满，丢弃片段（speech_id={speech_audio.speech_id}）")

    def _feature_extractor_worker(self):
        """音频特征提取工作线程（Whisper特征）"""
        # 线程预热：初始化CUDA上下文（如有）
        if torch.cuda.is_available():
            t0 = time.time()
            warmup_audio = np.zeros(self._algo_audio_sample_rate, dtype=np.float32)
            self._avatar.extract_whisper_feature(warmup_audio, self._algo_audio_sample_rate)
            torch.cuda.synchronize()
            t1 = time.time()
            logger.info(f"[线程预热] 特征提取线程 Whisper 预热完成，耗时: {(t1-t0)*1000:.1f}ms")

        while not self._stop_event.is_set():
            # 检测打断标志，触发时清空音频队列
            with self.interrupt_lock:
                if (self.shared_state is not None and 
                    hasattr(self.shared_state, 'avatar_interrupt_flag') and 
                    self.shared_state.avatar_interrupt_flag):
                    # 清空音频队列
                    while not self._audio_queue.empty():
                        try:
                            self._audio_queue.get_nowait()
                        except:
                            pass
                    time.sleep(0.01)
                    continue
            
            try:
                # 获取音频片段
                item = self._audio_queue.get(timeout=1)
                audio_data = item['audio_data']
                speech_id = item['speech_id']
                end_of_speech = item['end_of_speech']
                fps = self._config.fps if hasattr(self._config, 'fps') else 25

                # 重采样到算法内部采样率
                segment = librosa.resample(
                    audio_data, 
                    orig_sr=self._output_audio_sample_rate, 
                    target_sr=self._algo_audio_sample_rate
                )
                
                # 长度补全到1秒
                target_len = self._algo_audio_sample_rate
                if len(segment) < target_len:
                    segment = np.pad(segment, (0, target_len - len(segment)), mode='constant')

                # 提取Whisper特征
                whisper_chunks = self._avatar.extract_whisper_feature(segment, self._algo_audio_sample_rate)

                # 计算帧数量和每帧音频长度
                orig_samples_per_frame = self._output_audio_sample_rate // fps
                actual_audio_len = len(audio_data)
                num_frames = int(np.ceil(actual_audio_len / orig_samples_per_frame))
                whisper_chunks = whisper_chunks[:num_frames]

                # 音频补全到帧数量对应的长度
                target_audio_len = num_frames * orig_samples_per_frame
                if len(audio_data) < target_audio_len:
                    audio_data = np.pad(audio_data, (0, target_audio_len - len(audio_data)), mode='constant')
                else:
                    audio_data = audio_data[:target_audio_len]

                # 分帧入队
                num_chunks = len(whisper_chunks)
                for i in range(num_chunks):
                    # 再次检测打断标志
                    with self.interrupt_lock:
                        if (self.shared_state is not None and 
                            hasattr(self.shared_state, 'avatar_interrupt_flag') and 
                            self.shared_state.avatar_interrupt_flag):
                            logger.info(f"[特征提取] 已打断，跳过 speech_id={speech_id} 的第{i}帧处理")
                            break

                    # 提取单帧特征和音频
                    whisper_chunk = whisper_chunks[i:i+1]  # 保持维度 [1, 50, 384]
                    start_sample = i * orig_samples_per_frame
                    end_sample = start_sample + orig_samples_per_frame
                    audio_segment = audio_data[start_sample:end_sample]
                    
                    # 音频补全
                    if len(audio_segment) < orig_samples_per_frame:
                        audio_segment = np.pad(audio_segment, (0, orig_samples_per_frame - len(audio_segment)), mode='constant')

                    # 入队Whisper特征
                    self._whisper_queue.put({
                        'whisper_chunks': whisper_chunk,
                        'speech_id': speech_id,
                        'end_of_speech': end_of_speech and (i == num_chunks - 1),
                        'audio_data': audio_segment,
                    }, timeout=1)

                # 调试日志
                if self._config.debug:
                    logger.info(
                        f"[特征提取] speech_id={speech_id}, 帧数量={whisper_chunks.shape[0]}, "
                        f"原音频长度={len(item['audio_data'])}, 补全后长度={len(audio_data)}, end_of_speech={end_of_speech}"
                    )

            except queue.Empty:
                continue
            except Exception as e:
                logger.opt(exception=True).error(f"特征提取线程异常: {e}")
                continue

    def _frame_generator_unet_worker(self):
        """Unet 帧生成工作线程（多线程模式）"""
        fps = self._config.fps
        orig_samples_per_frame = int(self._output_audio_sample_rate / fps)
        batch_size = self._config.batch_size
        max_speaking_buffer = batch_size * 5  # 最大帧缓存

        # 线程预热
        if torch.cuda.is_available():
            t0 = time.time()
            dummy_whisper = torch.zeros(batch_size, 50, 384, device=self._avatar.device, dtype=self._avatar.weight_dtype)
            self._avatar.generate_frames_unet(dummy_whisper, 0, batch_size)
            torch.cuda.synchronize()
            t1 = time.time()
            logger.info(f"[线程预热] Unet帧生成线程预热完成，耗时: {(t1-t0)*1000:.1f}ms")

        batch_chunks = []
        batch_audio = []
        batch_speech_id = []
        batch_end_of_speech = []

        while not self._stop_event.is_set():
            # 检测打断标志
            with self.interrupt_lock:
                if (self.shared_state is not None and 
                    hasattr(self.shared_state, 'avatar_interrupt_flag') and 
                    self.shared_state.avatar_interrupt_flag):
                    # 清空批次缓存和Whisper队列
                    batch_chunks.clear()
                    batch_audio.clear()
                    batch_speech_id.clear()
                    batch_end_of_speech.clear()
                    while not self._whisper_queue.empty():
                        try:
                            self._whisper_queue.get_nowait()
                        except:
                            pass
                    time.sleep(0.01)
                    continue

            # 帧缓存满时等待
            while self._frame_queue.qsize() > max_speaking_buffer and not self._stop_event.is_set():
                if self._config.debug:
                    logger.info(f"[Unet帧生成] 帧缓存满，等待... 当前缓存: {self._frame_queue.qsize()}, 最大缓存: {max_speaking_buffer}")
                time.sleep(0.01)
                continue

            try:
                # 获取Whisper特征
                item = self._whisper_queue.get(timeout=1)
                batch_chunks.append(item['whisper_chunks'])
                batch_audio.append(item['audio_data'])
                batch_speech_id.append(item['speech_id'])
                batch_end_of_speech.append(item['end_of_speech'])

                # 批次满或语音结束时处理
                if len(batch_chunks) == batch_size or item['end_of_speech']:
                    # 再次检测打断
                    with self.interrupt_lock:
                        if (self.shared_state is not None and 
                            hasattr(self.shared_state, 'avatar_interrupt_flag') and 
                            self.shared_state.avatar_interrupt_flag):
                            batch_chunks.clear()
                            batch_audio.clear()
                            batch_speech_id.clear()
                            batch_end_of_speech.clear()
                            continue

                    # 补全批次
                    valid_num = len(batch_chunks)
                    if valid_num < batch_size:
                        logger.warning(f"[Unet帧生成] 批次不足（{valid_num}/{batch_size}），补全空数据")
                        pad_num = batch_size - valid_num
                        pad_shape = list(batch_chunks[0].shape)
                        
                        # 根据数据类型补全
                        if isinstance(batch_chunks[0], torch.Tensor):
                            pad_chunks = [torch.zeros(pad_shape, dtype=batch_chunks[0].dtype, device=batch_chunks[0].device) for _ in range(pad_num)]
                        else:
                            pad_chunks = [np.zeros(pad_shape, dtype=batch_chunks[0].dtype) for _ in range(pad_num)]
                        
                        pad_audio = [np.zeros(orig_samples_per_frame, dtype=np.float32) for _ in range(pad_num)]
                        pad_speech_id = [batch_speech_id[-1]] * pad_num
                        pad_end_of_speech = [False] * pad_num

                        # 补全批次
                        batch_chunks.extend(pad_chunks)
                        batch_audio.extend(pad_audio)
                        batch_speech_id.extend(pad_speech_id)
                        batch_end_of_speech.extend(pad_end_of_speech)

                    # 拼接批次数据
                    if isinstance(batch_chunks[0], torch.Tensor):
                        whisper_batch = torch.cat(batch_chunks, dim=0)
                    else:
                        whisper_batch = np.concatenate(batch_chunks, axis=0)

                    # 生成帧（Unet）
                    batch_start_time = time.time()
                    frame_ids = [self._frame_id_queue.get() for _ in range(batch_size)]
                    try:
                        pred_latents, idx_list = self._avatar.generate_frames_unet(whisper_batch, frame_ids[0], batch_size)
                    except Exception as e:
                        logger.opt(exception=True).error(f"[Unet帧生成失败] frame_id={frame_ids[0]}, speech_id={batch_speech_id[0]}, 错误: {e}")
                        pred_latents = torch.zeros((batch_size, 4, 32, 32), dtype=self._avatar.weight_dtype, device=self._avatar.device)
                        idx_list = [frame_ids[0] + i for i in range(batch_size)]
                    batch_end_time = time.time()

                    # 调试日志
                    if self._config.debug:
                        logger.info(
                            f"[Unet帧生成] speech_id={batch_speech_id[0]}, 批次大小={batch_size}, "
                            f"耗时={(batch_end_time - batch_start_time)*1000:.1f}ms"
                        )

                    # 入队Unet输出
                    unet_item = {
                        'pred_latents': pred_latents,
                        'speech_id': batch_speech_id,
                        'avatar_status': AvatarStatus.SPEAKING,
                        'end_of_speech': batch_end_of_speech,
                        'audio_data': batch_audio,
                        'valid_num': valid_num,
                        'idx_list': idx_list,
                        'timestamp': time.time()
                    }
                    self._unet_queue.put(unet_item)

                    # 清空批次缓存
                    batch_chunks.clear()
                    batch_audio.clear()
                    batch_speech_id.clear()
                    batch_end_of_speech.clear()

            except queue.Empty:
                time.sleep(0.01)
                continue
            except Exception as e:
                logger.opt(exception=True).error(f"Unet帧生成线程异常: {e}")
                continue

    def _frame_generator_vae_worker(self):
        """VAE 帧生成工作线程（多线程模式）"""
        fps = self._config.fps
        orig_samples_per_frame = int(self._output_audio_sample_rate / fps)
        batch_size = self._config.batch_size
        max_speaking_buffer = batch_size * 5

        # 线程预热
        if torch.cuda.is_available():
            t0 = time.time()
            dummy_latents = torch.zeros(batch_size, 4, 32, 32, device=self._avatar.device, dtype=self._avatar.weight_dtype)
            idx_list = [0 + i for i in range(batch_size)]
            self._avatar.generate_frames_vae(dummy_latents, idx_list, batch_size)
            torch.cuda.synchronize()
            t1 = time.time()
            logger.info(f"[线程预热] VAE帧生成线程预热完成，耗时: {(t1-t0)*1000:.1f}ms")

        while not self._stop_event.is_set():
            # 检测打断标志
            with self.interrupt_lock:
                if (self.shared_state is not None and 
                    hasattr(self.shared_state, 'avatar_interrupt_flag') and 
                    self.shared_state.avatar_interrupt_flag):
                    # 清空Unet队列
                    while not self._unet_queue.empty():
                        try:
                            self._unet_queue.get_nowait()
                        except:
                            pass
                    time.sleep(0.01)
                    continue

            # 帧缓存满时等待
            while self._frame_queue.qsize() > max_speaking_buffer and not self._stop_event.is_set():
                if self._config.debug:
                    logger.info(f"[VAE帧生成] 帧缓存满，等待... 当前缓存: {self._frame_queue.qsize()}, 最大缓存: {max_speaking_buffer}")
                time.sleep(0.01)
                continue

            # 等待Unet输出
            while self._unet_queue.qsize() <= 0 and not self._stop_event.is_set():
                time.sleep(0.01)
                continue

            try:
                # 获取Unet输出
                item = self._unet_queue.get_nowait()
                pred_latents = item['pred_latents']
                idx_list = item['idx_list']
                batch_audio = item['audio_data']
                valid_num = item['valid_num']
                batch_speech_id = item['speech_id']
                batch_end_of_speech = item['end_of_speech']
                cur_batch = pred_latents.shape[0]

                # VAE生成帧
                batch_start_time = time.time()
                try:
                    recon_idx_list = self._avatar.generate_frames_vae(pred_latents, idx_list, cur_batch)
                except Exception as e:
                    logger.opt(exception=True).error(f"[VAE帧生成失败] frame_id={idx_list[0]}, speech_id={batch_end_of_speech[0]}, 错误: {e}")
                    recon_idx_list = [(np.zeros((256, 256, 3), dtype=np.uint8), idx_list[0] + i) for i in range(cur_batch)]
                batch_end_time = time.time()

                # 调试日志
                if self._config.debug:
                    logger.info(
                        f"[VAE帧生成] speech_id={batch_end_of_speech[0]}, 批次大小={batch_size}, "
                        f"耗时={(batch_end_time - batch_start_time)*1000:.1f}ms"
                    )

                # 处理有效帧
                for i in range(valid_num):
                    # 检测打断标志
                    with self.interrupt_lock:
                        if (self.shared_state is not None and 
                            hasattr(self.shared_state, 'avatar_interrupt_flag') and 
                            self.shared_state.avatar_interrupt_flag):
                            logger.info(f"[VAE帧生成] 已打断，跳过 speech_id={batch_speech_id[i]} 的第{i}帧处理")
                            break

                    recon, idx = recon_idx_list[i]
                    audio = batch_audio[i]
                    eos = batch_end_of_speech[i]

                    # 入队合成队列
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
                    self._compose_queue.put(compose_item)

            except queue.Empty:
                time.sleep(0.01)
                continue
            except Exception as e:
                logger.opt(exception=True).error(f"VAE帧生成线程异常: {e}")
                continue

    def _frame_generator_worker(self):
        """单线程帧生成工作线程（Unet+VAE合并）"""
        fps = self._config.fps
        orig_samples_per_frame = int(self._output_audio_sample_rate / fps)
        batch_size = self._config.batch_size
        max_speaking_buffer = batch_size * 5

        # 线程预热
        if torch.cuda.is_available():
            t0 = time.time()
            dummy_whisper = torch.zeros(batch_size, 50, 384, device=self._avatar.device, dtype=self._avatar.weight_dtype)
            self._avatar.generate_frames(dummy_whisper, 0, batch_size)
            torch.cuda.synchronize()
            t1 = time.time()
            logger.info(f"[线程预热] 单线程帧生成线程预热完成，耗时: {(t1-t0)*1000:.1f}ms")

        batch_chunks = []
        batch_audio = []
        batch_speech_id = []
        batch_end_of_speech = []

        while not self._stop_event.is_set():
            # 检测打断标志
            with self.interrupt_lock:
                if (self.shared_state is not None and 
                    hasattr(self.shared_state, 'avatar_interrupt_flag') and 
                    self.shared_state.avatar_interrupt_flag):
                    # 清空批次缓存和Whisper队列
                    batch_chunks.clear()
                    batch_audio.clear()
                    batch_speech_id.clear()
                    batch_end_of_speech.clear()
                    while not self._whisper_queue.empty():
                        try:
                            self._whisper_queue.get_nowait()
                        except:
                            pass
                    time.sleep(0.01)
                    continue

            # 帧缓存满时等待
            while self._frame_queue.qsize() > max_speaking_buffer and not self._stop_event.is_set():
                if self._config.debug:
                    logger.info(f"[单线程帧生成] 帧缓存满，等待... 当前缓存: {self._frame_queue.qsize()}, 最大缓存: {max_speaking_buffer}")
                time.sleep(0.01)
                continue

            try:
                # 获取Whisper特征
                item = self._whisper_queue.get(timeout=1)
                batch_chunks.append(item['whisper_chunks'])
                batch_audio.append(item['audio_data'])
                batch_speech_id.append(item['speech_id'])
                batch_end_of_speech.append(item['end_of_speech'])

                # 批次满或语音结束时处理
                if len(batch_chunks) == batch_size or item['end_of_speech']:
                    # 再次检测打断
                    with self.interrupt_lock:
                        if (self.shared_state is not None and 
                            hasattr(self.shared_state, 'avatar_interrupt_flag') and 
                            self.shared_state.avatar_interrupt_flag):
                            batch_chunks.clear()
                            batch_audio.clear()
                            batch_speech_id.clear()
                            batch_end_of_speech.clear()
                            continue

                    # 补全批次
                    valid_num = len(batch_chunks)
                    if valid_num < batch_size:
                        logger.warning(f"[单线程帧生成] 批次不足（{valid_num}/{batch_size}），补全空数据")
                        pad_num = batch_size - valid_num
                        pad_shape = list(batch_chunks[0].shape)
                        
                        # 根据数据类型补全
                        if isinstance(batch_chunks[0], torch.Tensor):
                            pad_chunks = [torch.zeros(pad_shape, dtype=batch_chunks[0].dtype, device=batch_chunks[0].device) for _ in range(pad_num)]
                        else:
                            pad_chunks = [np.zeros(pad_shape, dtype=batch_chunks[0].dtype) for _ in range(pad_num)]
                        
                        pad_audio = [np.zeros(orig_samples_per_frame, dtype=np.float32) for _ in range(pad_num)]
                        pad_speech_id = [batch_speech_id[-1]] * pad_num
                        pad_end_of_speech = [False] * pad_num

                        # 补全批次
                        batch_chunks.extend(pad_chunks)
                        batch_audio.extend(pad_audio)
                        batch_speech_id.extend(pad_speech_id)
                        batch_end_of_speech.extend(pad_end_of_speech)

                    # 拼接批次数据
                    if isinstance(batch_chunks[0], torch.Tensor):
                        whisper_batch = torch.cat(batch_chunks, dim=0)
                    else:
                        whisper_batch = np.concatenate(batch_chunks, axis=0)

                    # 生成帧（单线程）
                    batch_start_time = time.time()
                    frame_ids = [self._frame_id_queue.get() for _ in range(batch_size)]
                    try:
                        recon_idx_list = self._avatar.generate_frames(whisper_batch, frame_ids[0], batch_size)
                    except Exception as e:
                        logger.opt(exception=True).error(f"[单线程帧生成失败] frame_id={frame_ids[0]}, speech_id={batch_speech_id[0]}, 错误: {e}")
                        recon_idx_list = [(np.zeros((256, 256, 3), dtype=np.uint8), frame_ids[0] + i) for i in range(batch_size)]
                    batch_end_time = time.time()

                    # 调试日志
                    if self._config.debug:
                        logger.info(
                            f"[单线程帧生成] speech_id={batch_speech_id[0]}, 批次大小={batch_size}, "
                            f"耗时={(batch_end_time - batch_start_time)*1000:.1f}ms"
                        )

                    # 处理有效帧
                    for i in range(valid_num):
                        # 检测打断标志
                        with self.interrupt_lock:
                            if (self.shared_state is not None and 
                                hasattr(self.shared_state, 'avatar_interrupt_flag') and 
                                self.shared_state.avatar_interrupt_flag):
                                logger.info(f"[单线程帧生成] 已打断，跳过 speech_id={batch_speech_id[i]} 的第{i}帧处理")
                                break

                        recon, idx = recon_idx_list[i]
                        audio = batch_audio[i]
                        eos = batch_end_of_speech[i]

                        # 入队合成队列
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
                        self._compose_queue.put(compose_item)

                    # 清空批次缓存
                    batch_chunks.clear()
                    batch_audio.clear()
                    batch_speech_id.clear()
                    batch_end_of_speech.clear()

            except queue.Empty:
                time.sleep(0.01)
                continue
            except Exception as e:
                logger.opt(exception=True).error(f"单线程帧生成线程异常: {e}")
                continue

    def _compose_worker(self):
        """帧合成工作线程（res2combined）"""
        while not self._stop_event.is_set():
            # 检测打断标志
            with self.interrupt_lock:
                if (self.shared_state is not None and 
                    hasattr(self.shared_state, 'avatar_interrupt_flag') and 
                    self.shared_state.avatar_interrupt_flag):
                    # 清空合成队列
                    while not self._compose_queue.empty():
                        try:
                            self._compose_queue.get_nowait()
                        except:
                            pass
                    time.sleep(0.01)
                    continue

            try:
                # 获取合成任务
                item = self._compose_queue.get(timeout=0.1)
                recon = item['recon']
                idx = item['idx']

                # 帧合成
                frame = self._avatar.res2combined(recon, idx)
                item['frame'] = frame

                # 入队输出队列
                self._output_queue.put(item)

            except queue.Empty:
                continue
            except Exception as e:
                logger.opt(exception=True).error(f"帧合成线程异常: {e}")
                continue

    def _frame_collector_worker(self):
        """帧收集线程（严格按FPS输出，帧ID与推理线程同步）"""
        fps = self._config.fps
        frame_interval = 1.0 / fps  # 每帧间隔时间
        start_time = time.perf_counter()
        local_frame_id = 0
        last_active_speech_id = None
        last_speaking = False
        last_end_of_speech = False
        current_speech_id = None

        while not self._stop_event.is_set():
            # 检测打断标志
            with self.interrupt_lock:
                if (self.shared_state is not None and 
                    hasattr(self.shared_state, 'avatar_interrupt_flag') and 
                    self.shared_state.avatar_interrupt_flag):
                    # 清空输出队列
                    while not self._output_queue.empty():
                        try:
                            self._output_queue.get_nowait()
                        except:
                            pass
                    # 重置音频缓存
                    self._audio_cache.clear()
                    current_speech_id = None
                    time.sleep(0.01)
                    continue

            # 严格控制帧率
            target_time = start_time + local_frame_id * frame_interval
            now = time.perf_counter()
            sleep_time = target_time - now
            if sleep_time > 0.002:
                time.sleep(sleep_time - 0.001)
            while time.perf_counter() < target_time:
                pass

            # 记录帧处理开始时间
            t_frame_start = time.perf_counter()

            # 分配帧ID
            self._frame_id_queue.put(local_frame_id)

            try:
                # 获取输出帧
                output_item = self._output_queue.get_nowait()
                frame = output_item['frame']
                speech_id = output_item['speech_id']
                avatar_status = output_item['avatar_status']
                end_of_speech = output_item['end_of_speech']
                frame_timestamp = output_item.get('timestamp', None)
                audio_segment = output_item['audio_segment']
            except queue.Empty:
                # 无输出时生成空闲帧
                frame = self._avatar.generate_idle_frame(local_frame_id)
                speech_id = last_active_speech_id
                avatar_status = AvatarStatus.LISTENING
                end_of_speech = False
                frame_timestamp = time.time()
                audio_segment = None

            # 封装视频帧并输出
            video_frame = av.VideoFrame.from_ndarray(frame, format="bgr24")
            video_result = VideoResult(
                video_frame=video_frame,
                speech_id=speech_id,
                avatar_status=avatar_status,
                end_of_speech=end_of_speech,
                bg_frame_id=-1
            )
            self._notify_video(video_result)

            # 音频处理
            audio_len = len(audio_segment) if audio_segment is not None else 0
            if audio_segment is not None and audio_len > 0:
                # 音频格式转换
                audio_np = np.asarray(audio_segment, dtype=np.float32)
                if audio_np.ndim == 1:
                    audio_np = audio_np[np.newaxis, :]
                
                # 封装音频帧并输出
                audio_frame = av.AudioFrame.from_ndarray(audio_np, format="flt", layout="mono")
                audio_frame.sample_rate = self._output_audio_sample_rate
                audio_result = AudioResult(
                    audio_frame=audio_frame,
                    speech_id=speech_id,
                    end_of_speech=end_of_speech
                )
                
                # 音频缓存
                if speech_id not in self._audio_cache:
                    self._audio_cache[speech_id] = []
                self._audio_cache[speech_id].append(audio_np[0] if audio_np.ndim == 2 else audio_np)
                
                # 调试日志
                audio_len_sum = sum([len(seg) for seg in self._audio_cache[speech_id]]) / self._output_audio_sample_rate
                if self._config.debug:
                    logger.info(
                        f"[音频帧] frame_id={local_frame_id}, speech_id={speech_id}, end_of_speech={end_of_speech}, "
                        f"累计音频时长={audio_len_sum:.3f}s"
                    )
                
                # 输出音频
                self._notify_audio(audio_result)

            # 语音结束处理
            if end_of_speech:
                logger.info(f"状态切换: SPEAKING -> LISTENING (speech_id={speech_id})")
                # 导出完整音频（调试模式）
                if getattr(self._config, 'debug_save_handler_audio', False) and speech_id in self._audio_cache:
                    try:
                        all_audio = np.concatenate(self._audio_cache[speech_id], axis=-1)
                        save_dir = "logs/audio_segments"
                        os.makedirs(save_dir, exist_ok=True)
                        wav_path = os.path.join(save_dir, f"{speech_id}_all.wav")
                        sf.write(wav_path, all_audio, self._output_audio_sample_rate, subtype='PCM_16')
                        logger.info(f"[音频导出] 已保存完整音频: {wav_path}")
                    except Exception as e:
                        logger.error(f"[音频导出失败] speech_id={speech_id}, 错误: {e}")
                
                # 清理音频缓存并通知状态变更
                if speech_id in self._audio_cache:
                    del self._audio_cache[speech_id]
                self._notify_status_change(speech_id, AvatarStatus.LISTENING)

            # 性能日志
            t_frame_end = time.perf_counter()
            if self._config.debug and (t_frame_end - t_frame_start > frame_interval):
                logger.warning(
                    f"[性能警告] frame_id={local_frame_id} 处理耗时={(t_frame_end-t_frame_start):.4f}s "
                    f"(超过帧间隔 {frame_interval:.4f}s)"
                )

            # 更新状态
            local_frame_id += 1
            last_speaking = (avatar_status == AvatarStatus.SPEAKING)
            last_end_of_speech = end_of_speech
            last_active_speech_id = speech_id if last_speaking else last_active_speech_id

    def _notify_audio(self, audio_result: AudioResult):
        """音频输出通知"""
        if self.audio_output_queue is None:
            return
        
        try:
            audio_frame = audio_result.audio_frame
            audio_data = audio_frame.to_ndarray()
            
            # 确保格式正确（float32, [1, N]）
            if audio_data.dtype != np.float32:
                audio_data = audio_data.astype(np.float32)
            if audio_data.ndim == 1:
                audio_data = audio_data[np.newaxis, ...]
            elif audio_data.ndim == 2 and audio_data.shape[0] != 1:
                audio_data = audio_data[:1, ...]
            
            self.audio_output_queue.put_nowait(audio_data)
        except Exception as e:
            logger.opt(exception=True).error(f"音频输出异常: {e}")

    def _notify_video(self, video_result: VideoResult):
        """视频输出通知"""
        if self.video_output_queue is None:
            return
        
        try:
            video_frame = video_result.video_frame
            data = video_frame.to_ndarray(format="bgr24")
            self.video_output_queue.put_nowait(data)
        except Exception as e:
            logger.opt(exception=True).error(f"视频输出异常: {e}")

    def _notify_status_change(self, speech_id: str, status: AvatarStatus):
        """状态变更通知"""
        if self.event_out_queue is None or status != AvatarStatus.LISTENING:
            return
        
        try:
            self.event_out_queue.put_nowait(Tts2FaceEvent.SPEAKING_TO_LISTENING)
        except Exception as e:
            logger.opt(exception=True).error(f"状态变更通知异常: {e}")

    def _clear_queues(self):
        """清空所有内部队列"""
        with self._frame_id_lock:
            queue_list = [
                self._audio_queue, self._whisper_queue, self._unet_queue,
                self._frame_queue, self._frame_id_queue, self._compose_queue, self._output_queue
            ]
            for q in queue_list:
                while not q.empty():
                    try:
                        q.get_nowait()
                    except Exception as e:
                        logger.opt(exception=True).warning(f"清空队列异常: {e}")
                        pass

