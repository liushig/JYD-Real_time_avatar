# pip install websocket-client
import os
import time
import json
import threading
import base64
import websocket
import logging
import logging.handlers
from datetime import datetime

logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)


API_KEY=""
QWEN_MODEL = "qwen3-asr-flash-realtime"
# 以下是北京地域baseUrl，如果使用新加坡地域的模型，需要将baseUrl替换为：wss://dashscope-intl.aliyuncs.com/api-ws/v1/realtime
baseUrl = "wss://dashscope.aliyuncs.com/api-ws/v1/realtime"
url = f"{baseUrl}?model={QWEN_MODEL}"
print(f"Connecting to server: {url}")

# 注意： 如果是非vad模式，建议持续发送的音频时长累加不超过60s
enableServerVad = True
is_running = True  # 增加运行标志位

headers = [
    "Authorization: Bearer " + API_KEY,
    "OpenAI-Beta: realtime=v1"
]

def init_logger():
    formatter = logging.Formatter('%(asctime)s|%(levelname)s|%(message)s')
    f_handler = logging.handlers.RotatingFileHandler(
        "omni_tester.log", maxBytes=100 * 1024 * 1024, backupCount=3
    )
    f_handler.setLevel(logging.DEBUG)
    f_handler.setFormatter(formatter)

    console = logging.StreamHandler()
    console.setLevel(logging.DEBUG)
    console.setFormatter(formatter)

    logger.addHandler(f_handler)
    logger.addHandler(console)

def on_open(ws):
    logger.info("Connected to server.")

    # 会话更新事件
    event_manual = {
        "event_id": "event_123",
        "type": "session.update",
        "session": {
            "modalities": ["text"],
            "input_audio_format": "pcm",
            "sample_rate": 16000,
            "input_audio_transcription": {
                # 语种标识，可选，如果有明确的语种信息，建议设置
                "language": "zh"
                # 语料，可选，如果有语料，建议设置以增强识别效果
                # "corpus": {
                #     "text": ""
                # }
            },
            "turn_detection": None
        }
    }
    event_vad = {
        "event_id": "event_123",
        "type": "session.update",
        "session": {
            "modalities": ["text"],
            "input_audio_format": "pcm",
            "sample_rate": 16000,
            "input_audio_transcription": {
                "language": "zh"
            },
            "turn_detection": {
                "type": "server_vad",
                "threshold": 0.0,
                "silence_duration_ms": 400
            }
        }
    }
    if enableServerVad:
        logger.info(f"Sending event: {json.dumps(event_vad, indent=2)}")
        ws.send(json.dumps(event_vad))
    else:
        logger.info(f"Sending event: {json.dumps(event_manual, indent=2)}")
        ws.send(json.dumps(event_manual))

def on_message(ws, message):
    global is_running
    try:
        data = json.loads(message)
        logger.info(f"Received event: {json.dumps(data, ensure_ascii=False, indent=2)}")
        if data.get("type") == "session.finished":
            logger.info(f"Final transcript: {data.get('transcript')}")
            logger.info("Closing WebSocket connection after session finished...")
            is_running = False  # 停止音频发送线程
            ws.close()
    except json.JSONDecodeError:
        logger.error(f"Failed to parse message: {message}")

def on_error(ws, error):
    logger.error(f"Error: {error}")

def on_close(ws, close_status_code, close_msg):
    logger.info(f"Connection closed: {close_status_code} - {close_msg}")

def send_audio(ws, local_audio_path):
    time.sleep(3)  # 等待会话更新完成
    global is_running

    with open(local_audio_path, 'rb') as audio_file:
        logger.info(f"文件读取开始: {datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]}")
        while is_running:
            audio_data = audio_file.read(3200)  # ~0.1s PCM16/16kHz
            if not audio_data:
                logger.info(f"文件读取完毕: {datetime.now().strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]}")
                if ws.sock and ws.sock.connected:
                    if not enableServerVad:
                        commit_event = {
                            "event_id": "event_789",
                            "type": "input_audio_buffer.commit"
                        }
                        ws.send(json.dumps(commit_event))
                    finish_event = {
                        "event_id": "event_987",
                        "type": "session.finish"
                    }
                    ws.send(json.dumps(finish_event))
                break

            if not ws.sock or not ws.sock.connected:
                logger.info("WebSocket已关闭，停止发送音频。")
                break

            encoded_data = base64.b64encode(audio_data).decode('utf-8')
            eventd = {
                "event_id": f"event_{int(time.time() * 1000)}",
                "type": "input_audio_buffer.append",
                "audio": encoded_data
            }
            ws.send(json.dumps(eventd))
            logger.info(f"Sending audio event: {eventd['event_id']}")
            time.sleep(0.1)  # 模拟实时采集

# 初始化日志
init_logger()
logger.info(f"Connecting to WebSocket server at {url}...")

local_audio_path = "your_audio_file.pcm"
ws = websocket.WebSocketApp(
    url,
    header=headers,
    on_open=on_open,
    on_message=on_message,
    on_error=on_error,
    on_close=on_close
)

thread = threading.Thread(target=send_audio, args=(ws, local_audio_path))
thread.start()
ws.run_forever()