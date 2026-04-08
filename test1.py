import requests
import json
import base64

# ------------------------
# 配置参数
# ------------------------
API_URL = "http://188.18.18.106:5001/v1/workflows/run"
API_KEY = "你的_api_key_here"
USER_ID = "abc-123"  # 用户标识
RESPONSE_MODE = "streaming"  # streaming 或 blocking

# ------------------------
# 构建输入数据（inputs）
# 可根据 App 定义的变量调整
# 例如：上传一个 PDF 文件
# ------------------------
inputs = {
    "my_document": [
        {
            "type": "document",
            "transfer_method": "local_file",  # 或 "remote_url"
            "upload_file_id": "文件ID或者URL"
        }
    ],
    # 如果有文本变量
    "text": "这是一个测试文本"
}

payload = {
    "inputs": inputs,
    "response_mode": RESPONSE_MODE,
    "user": USER_ID
}

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

# ------------------------
# 发起请求并处理流式响应
# ------------------------
try:
    with requests.post(API_URL, headers=headers, json=payload, stream=True) as response:
        response.raise_for_status()  # 若非 2xx 报错

        # 处理每一行 SSE 流
        for line in response.iter_lines():
            if not line:
                continue
            decoded_line = line.decode("utf-8")
            # SSE 流以 data: 开头
            if decoded_line.startswith("data:"):
                content = decoded_line[5:].strip()
                try:
                    data = json.loads(content)
                except json.JSONDecodeError:
                    print("无法解析数据:", content)
                    continue

                event_type = data.get("event")
                if event_type == "workflow_started":
                    print("Workflow 已开始:", data)
                elif event_type == "node_started":
                    print("节点开始:", data)
                elif event_type == "text_chunk":
                    print("文本片段:", data["data"].get("text"))
                elif event_type == "node_finished":
                    print("节点完成:", data)
                elif event_type == "workflow_finished":
                    print("Workflow 执行结束:", data)
                elif event_type == "tts_message":
                    audio_base64 = data["audio"]
                    audio_bytes = base64.b64decode(audio_base64)
                    # 可将音频写入文件播放
                    with open("tts_output.mp3", "ab") as f:
                        f.write(audio_bytes)
                    print("TTS 音频块已保存")
                elif event_type == "tts_message_end":
                    print("TTS 音频流结束")
                elif event_type == "ping":
                    print("Ping 心跳保持连接")
                else:
                    print("其他事件:", data)

except requests.exceptions.HTTPError as e:
    print(f"请求失败: {e}, 响应内容: {e.response.text}")
except Exception as e:
    print("发生异常:", e)
