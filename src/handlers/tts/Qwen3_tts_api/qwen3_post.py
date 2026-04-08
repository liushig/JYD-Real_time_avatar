# coding=utf-8
import pyaudio
import os
import requests
import base64
import pathlib
import threading
import time
import json
import wave
import dashscope  # DashScope Python SDK 版本需要不低于1.23.9
from dashscope.audio.qwen_tts_realtime import QwenTtsRealtime, QwenTtsRealtimeCallback, AudioFormat

# ======= 常量配置 =======
DEFAULT_TARGET_MODEL = "qwen3-tts-vc-realtime-2026-01-15"  # 声音复刻、语音合成要使用相同的模型
DEFAULT_PREFERRED_NAME = "guanyu"
DEFAULT_AUDIO_MIME_TYPE = "audio/wav"  # 适配1-1.WAV文件，修改为wav格式
VOICE_FILE_PATH = "./Qwen3-TTS/assets/工业级三防设计满足行业需求.mp3"  # 用于声音复刻的本地音频文件的相对路径
VOICE_CACHE_FILE = "qwen_voice_cache.json"  # 音色缓存文件，避免重复复刻
SAVE_WAV_FILE = "tts_synthesize_result.wav"  # 合成音频保存的WAV文件名
# TEXT_TO_SYNTHESIZE = [
#     '我就特别喜欢这种超市，',
#     '尤其是过年的时候',
#     '去逛超市',
#     '就会觉得',
#     '超级超级开心！',
#     '想买好多好多的东西呢！'
# ]
TEXT_TO_SYNTHESIZE = [
    "你好，我是竞业达开发的数字人助手小达，很高兴为你服务，有什么可以帮助你的吗？"
]
# ======= 音色复刻 + 本地缓存（避免重复复刻）=======
def create_voice(file_path: str,
                 target_model: str = DEFAULT_TARGET_MODEL,
                 preferred_name: str = DEFAULT_PREFERRED_NAME,
                 audio_mime_type: str = DEFAULT_AUDIO_MIME_TYPE) -> str:
    """创建音色，并返回 voice 参数"""
    api_key = "sk-5f2d36a950e1406aa9a15b9bcb8b4616"

    file_path_obj = pathlib.Path(file_path)
    if not file_path_obj.exists():
        raise FileNotFoundError(f"音频文件不存在: {file_path}")

    base64_str = base64.b64encode(file_path_obj.read_bytes()).decode()
    data_uri = f"data:{audio_mime_type};base64,{base64_str}"

    url = "https://dashscope.aliyuncs.com/api/v1/services/audio/tts/customization"
    payload = {
        "model": "qwen-voice-enrollment",
        "input": {
            "action": "create",
            "target_model": target_model,
            "preferred_name": preferred_name,
            "audio": {"data": data_uri}
        }
    }
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    resp = requests.post(url, json=payload, headers=headers)
    if resp.status_code != 200:
        raise RuntimeError(f"创建 voice 失败: {resp.status_code}, {resp.text}")

    try:
        return resp.json()["output"]["voice"]
    except (KeyError, ValueError) as e:
        raise RuntimeError(f"解析 voice 响应失败: {e}")

def get_cached_voice(file_path: str, target_model: str = DEFAULT_TARGET_MODEL) -> str:
    """获取缓存的voice，无缓存则复刻并写入缓存"""
    cache_path = pathlib.Path(VOICE_CACHE_FILE)
    # 按模型+音频文件名作为缓存key，避免不同音色冲突
    cache_key = f"{target_model}_{pathlib.Path(file_path).name}"

    # 检查缓存是否有效
    if cache_path.exists():
        try:
            with open(cache_path, 'r', encoding='utf-8') as f:
                cache_data = json.load(f)
            if cache_key in cache_data and cache_data[cache_key].strip():
                print(f"[音色缓存] 找到有效缓存，直接复用voice参数")
                return cache_data[cache_key]
        except (json.JSONDecodeError, KeyError):
            print(f"[音色缓存] 缓存无效/损坏，重新复刻音色")

    # 无有效缓存，执行复刻
    print(f"[音色缓存] 无缓存，开始首次音色复刻...")
    new_voice = create_voice(file_path, target_model)

    # 写入缓存
    cache_data = {}
    if cache_path.exists():
        with open(cache_path, 'r', encoding='utf-8') as f:
            cache_data = json.load(f)
    cache_data[cache_key] = new_voice
    with open(cache_path, 'w', encoding='utf-8') as f:
        json.dump(cache_data, f, ensure_ascii=False, indent=2)
    print(f"[音色缓存] 新voice已保存至缓存文件：{VOICE_CACHE_FILE}")
    return new_voice

# ======= 初始化dashscope API key =======
def init_dashscope_api_key():
    """初始化 dashscope SDK 的 API key"""
    dashscope.api_key = "sk-5f2d36a950e1406aa9a15b9bcb8b4616"

# ======= 自定义回调类（新增音频保存+保留播放）=======
class MyCallback(QwenTtsRealtimeCallback):
    """
    自定义 TTS 流式回调：实时播放 + 流式保存为WAV文件（验证音频有效性）
    """
    def __init__(self):
        self.complete_event = threading.Event()
        # 初始化音频播放流（保留原有逻辑）
        self._player = pyaudio.PyAudio()
        self._stream = self._player.open(
            format=pyaudio.paInt16, channels=1, rate=24000, output=True
        )
        # 初始化WAV文件写入：适配TTS返回的PCM格式（24000Hz/单声道/16位）
        self.wav_file = wave.open(SAVE_WAV_FILE, 'wb')
        self.wav_file.setnchannels(1)  # 单声道，与TTS格式一致
        self.wav_file.setsampwidth(2)  # 16位深=2字节，与paInt16一致
        self.wav_file.setframerate(24000)  # 采样率24000Hz，与TTS格式一致
        print(f"[音频保存] 已初始化WAV文件，将保存至：{SAVE_WAV_FILE}")

    def on_open(self) -> None:
        print('[TTS] WebSocket连接已建立')

    def on_close(self, close_status_code, close_msg) -> None:
        # 释放播放资源
        self._stream.stop_stream()
        self._stream.close()
        self._player.terminate()
        # 关闭WAV文件，确保数据完整写入
        self.wav_file.close()
        print(f'[TTS] 连接关闭 code={close_status_code}, msg={close_msg}')
        print(f"[音频保存] 合成音频已完整保存至：{SAVE_WAV_FILE} | 文件大小：{os.path.getsize(SAVE_WAV_FILE)/1024:.2f}KB")

    def on_event(self, response: dict) -> None:
        try:
            event_type = response.get('type', '')
            if event_type == 'session.created':
                print(f'[TTS] 会话开始: {response["session"]["id"]}')
            elif event_type == 'response.audio.delta':
                # 核心：解码PCM音频数据，同时实现播放+保存
                audio_data = base64.b64decode(response['delta'])
                self._stream.write(audio_data)  # 实时播放
                self.wav_file.writeframes(audio_data)  # 流式写入WAV文件
                print(f"[TTS] 接收并处理音频块 | 字节数：{len(audio_data)}")
            elif event_type == 'response.done':
                print(f'[TTS] 响应完成, Response ID: {qwen_tts_realtime.get_last_response_id()}')
            elif event_type == 'session.finished':
                print('[TTS] 会话结束')
                self.complete_event.set()
        except Exception as e:
            print(f'[Error] 处理回调事件异常: {e}')

    def wait_for_finished(self):
        self.complete_event.wait()

# ======= 主执行逻辑 =======
if __name__ == '__main__':
    try:
        init_dashscope_api_key()
        print('[系统] 初始化 Qwen TTS Realtime ...')

        # 初始化回调（含播放+保存）
        callback = MyCallback()
        qwen_tts_realtime = QwenTtsRealtime(
            model=DEFAULT_TARGET_MODEL,
            callback=callback,
            url='wss://dashscope.aliyuncs.com/api-ws/v1/realtime'
        )
        qwen_tts_realtime.connect()
        
        # 更新会话：使用缓存的voice，避免重复复刻
        qwen_tts_realtime.update_session(
            voice=get_cached_voice(VOICE_FILE_PATH),
            response_format=AudioFormat.PCM_24000HZ_MONO_16BIT,
            mode='server_commit'
        )

        # 流式发送文本
        for text_chunk in TEXT_TO_SYNTHESIZE:
            print(f'[发送文本]: {text_chunk}')
            qwen_tts_realtime.append_text(text_chunk)
            time.sleep(0.1)

        # 结束合成，等待会话完成
        qwen_tts_realtime.finish()
        callback.wait_for_finished()

        # 打印统计信息
        print(f'\n[Metric] session_id={qwen_tts_realtime.get_session_id()}, '
              f'first_audio_delay={qwen_tts_realtime.get_first_audio_delay():.2f}s')
    except Exception as e:
        print(f'[系统错误] 程序执行失败: {str(e)}')
        raise