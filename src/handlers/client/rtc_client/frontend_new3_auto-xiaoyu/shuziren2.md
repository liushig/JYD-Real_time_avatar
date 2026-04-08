# 数字人后端 API 接口文档

## 1. 服务配置

### 服务地址
- **Host**: `0.0.0.0`
- **Port**: `8026`
- **协议**: HTTP (SSL证书未配置时)

### 并发配置
- **concurrent_limit**: 2 (最大并发连接数)
- **connection_ttl**: 3600秒 (连接超时时间)

---

## 2. HTTP 接口

### 2.1 获取初始化配置

**接口**: `GET /openavatarchat/initconfig`

**功能**: 返回 WebRTC 连接所需的配置信息

**请求**: 无参数

**响应**:
```json
{
  "avatar_config": {},
  "rtc_configuration": null
}
```

**字段说明**:
- `avatar_config`: 数字人配置(当前为空对象)
- `rtc_configuration`: ICE服务器配置(未配置TURN时为null)

**实现位置**: `client_handler_rtc51_newfront3_auto_xiaoyu.py:196-202`

---

### 2.2 WebRTC Offer 协商

**接口**: `POST /webrtc/offer`

**功能**: 处理 WebRTC SDP Offer/Answer 协商和 ICE Candidate 交换

**请求体 - SDP Offer**:
```json
{
  "sdp": "v=0\r\no=...",
  "type": "offer",
  "webrtc_id": "随机生成的会话ID"
}
```

**请求体 - ICE Candidate**:
```json
{
  "candidate": {
    "candidate": "candidate:...",
    "sdpMid": "0",
    "sdpMLineIndex": 0
  },
  "webrtc_id": "会话ID",
  "type": "ice-candidate"
}
```

**响应 - SDP Answer**:
```json
{
  "sdp": "v=0\r\no=...",
  "type": "answer"
}
```

**错误响应**:
```json
{
  "status": "failed",
  "message": "错误信息"
}
```

**实现**: 由 `fastrtc.Stream` 自动处理

---

## 3. WebRTC DataChannel 协议

### DataChannel 配置
- **名称**: `"text"`
- **创建方**: 客户端
- **传输格式**: JSON 字符串

---

### 3.1 客户端发送消息

#### 初始化消息
```json
{
  "type": "init"
}
```
**说明**: 连接建立后立即发送

#### 文本聊天
```json
{
  "type": "chat",
  "data": "用户输入的文本内容"
}
```
**处理流程**:
1. 生成 `speech_id`
2. 创建 `HUMAN_TEXT` 类型的 `ChatData`
3. 提交到数据处理管道
4. 触发 ASR/LLM/TTS/Avatar 处理链

#### 停止对话
```json
{
  "type": "stop_chat"
}
```
**说明**: 打断当前 AI 回复

---

### 3.2 服务端推送消息

#### 聊天消息(流式)
```json
{
  "type": "chat",
  "id": "消息唯一ID",
  "role": "human" | "avatar",
  "message": "消息内容(可能是增量)"
}
```

**字段说明**:
- `id`: 消息唯一标识,相同ID表示同一消息的增量更新
- `role`:
  - `"human"`: 用户消息(ASR识别结果)
  - `"avatar"`: AI回复(LLM生成内容)
- `message`: 文本内容,流式推送时为增量片段

**实现位置**: `RtcStream` 通过 DataChannel 推送

#### 对话结束标记
```json
{
  "type": "avatar_end"
}
```
**说明**: AI 回复完成

#### 输入已发送标记
```json
{
  "type": "send_input"
}
```
**说明**: 用户输入已提交处理

---

## 4. WebRTC 媒体流规格

### 4.1 音频流

#### 输入(客户端 → 服务端)
- **采样率**: 16000 Hz
- **声道**: 单声道(mono)
- **用途**: 语音识别(ASR)

#### 输出(服务端 → 客户端)
- **采样率**: 24000 Hz
- **帧大小**: 480 samples
- **用途**: 数字人语音(TTS合成)

**配置位置**: `client_handler_rtc51_newfront3_auto_xiaoyu.py:269-277`

---

### 4.2 视频流

#### 输出(服务端 → 客户端)
- **帧率**: 30 fps
- **分辨率**: 可变(由Avatar模块决定)
- **格式**: RGB (3通道)
- **用途**: 数字人视频画面

**配置位置**: `client_handler_rtc51_newfront3_auto_xiaoyu.py:289-296`

---

## 5. 数据处理流程

### 5.1 用户文本输入流程
```
客户端发送 {"type":"chat","data":"文本"}
  ↓
RtcStream 接收 DataChannel 消息
  ↓
创建 ChatData(type=HUMAN_TEXT, speech_id=生成)
  ↓
提交到 data_submitter
  ↓
LLM 处理 → TTS 合成 → Avatar 生成
  ↓
推送 AVATAR_TEXT/AVATAR_AUDIO/AVATAR_VIDEO
  ↓
RtcStream 通过 DataChannel 和媒体流返回客户端
```

### 5.2 语音输入流程
```
客户端麦克风音频流
  ↓
RtcStream 接收音频帧(16kHz)
  ↓
创建 ChatData(type=MIC_AUDIO)
  ↓
VAD 检测语音活动
  ↓
ASR 识别文本 → 推送 HUMAN_TEXT
  ↓
LLM 处理 → TTS 合成 → Avatar 生成
  ↓
推送 AVATAR_AUDIO(24kHz) + AVATAR_VIDEO(30fps)
  ↓
客户端播放音视频
```

---

## 6. 中断机制

### 6.1 中断触发条件
**唯一条件**: `shared_states.interrupt_flag = True`

**触发方式**: ASR 检测到唤醒词
- 唤醒词正则: `^((你)?好\s*[，,]?\s*(小达|小的|小德|小岛|小当|小唐|小打)|(等一下|停一下|暂停|别说了|打住|一下|等一下|停一下|闭嘴|stop|shut up))`

**配置位置**: `config/xiaoyu_chat_with_qen3asr_qwen3_tts_xingkong3_musetalk_button2_jyd_auto2.yaml:45`

---

### 6.2 中断处理逻辑

**实现位置**: `client_handler_rtc51_newfront3_auto_xiaoyu.py:74-97`

```python
def _is_interrupted(self, speech_id: str = None) -> bool:
    # 仅检查 interrupt_flag
    interrupt_flag = getattr(self.shared_states, 'interrupt_flag', False)
    if interrupt_flag:
        return True
    return False

def _handle_interrupt(self):
    # 清空所有输出队列
    self.clear_data()
    # 更新 tracking_speech_id
    new_speech_id = getattr(self.shared_states, 'current_speech_id', None)
    self.tracking_speech_id = new_speech_id
    # 重置中断标志
    self.shared_states.interrupt_flag = False
```

**效果**:
1. 清空 AUDIO/VIDEO/TEXT 三个输出队列
2. 停止推送旧的 speech_id 数据
3. 切换到新的 speech_id

---

## 7. 数据延迟配置

### 文本推送延迟
- **human_text_delay**: 0.2秒 (用户输入文字)
- **avatar_text_delay**: 0.3秒 (AI生成文字)

**用途**: 控制字幕显示节奏

**配置位置**: `config/xiaoyu_chat_with_qen3asr_qwen3_tts_xingkong3_musetalk_button2_jyd_auto2.yaml:32-33`

**实现位置**: `client_handler_rtc51_newfront3_auto_xiaoyu.py:260-261`

---

## 8. Handler 处理链

### 8.1 注册的 Handler

| Handler | 模块 | 功能 |
|---------|------|------|
| RtcClient | client_handler_rtc51_newfront3_auto_xiaoyu | WebRTC客户端 |
| SileroVad | vad_handler_silero_button | 语音活动检测 |
| Qwen3ASRBlocking | qwen3_asr_handler_blocking | 语音识别 |
| LLMWorkflowStreaming | llm_handler_xingkong3_streaming4 | 大语言模型 |
| FasterQwen3TTS | faster_qwen3_tts_handler2 | 语音合成 |
| AvatarMusetalk | avatar_handler_musetalk42 | 数字人生成 |

---

### 8.2 数据流转

```
MIC_AUDIO → SileroVad → Qwen3ASRBlocking → HUMAN_TEXT
                                               ↓
                                         LLMWorkflowStreaming
                                               ↓
                                          AVATAR_TEXT
                                               ↓
                                         FasterQwen3TTS
                                               ↓
                                          AVATAR_AUDIO
                                               ↓
                                         AvatarMusetalk
                                               ↓
                                          AVATAR_VIDEO
                                               ↓
                                          RtcClient → 客户端
```

---

## 9. 会话管理

### 9.1 会话创建
```python
# 每个 WebRTC 连接创建独立会话
session_context = SessionContext(session_id)
handler_context = ClientRtcContext(session_id)
session_delegate = RtcClientSessionDelegate()
```

### 9.2 会话状态
- **session_id**: 唯一会话标识
- **shared_states**: 共享状态对象
  - `current_speech_id`: 当前对话ID
  - `interrupt_flag`: 中断标志
- **output_queues**: 输出数据队列
  - `AUDIO`: 音频队列
  - `VIDEO`: 视频队列
  - `TEXT`: 文本队列

---

## 10. CORS 配置

### 跨域支持
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**实现位置**: `client_handler_rtc51_newfront3_auto_xiaoyu.py:224-231`

**说明**: 支持前后端分离部署,允许任意源访问

---

## 11. 错误处理

### 并发限制
- **错误**: `concurrency_limit_reached`
- **原因**: 超过 concurrent_limit=2
- **解决**: 断开旧连接或重启服务

### 抽象方法错误
- **错误**: `TypeError: Can't instantiate abstract class`
- **原因**: SessionDelegate 缺少必需方法
- **必需方法**: `get_data`, `put_data`, `get_timestamp`, `emit_signal`

### CORS 错误
- **错误**: `No 'Access-Control-Allow-Origin' header`
- **原因**: CORS 中间件未正确配置
- **解决**: 确保在 `on_setup_app` 中添加 CORS 中间件

---

## 12. 部署检查清单

### 启动前检查
- [ ] CUDA 设备可用 (`CUDA_VISIBLE_DEVICES=2`)
- [ ] 配置文件路径正确
- [ ] 模型文件已下载
- [ ] 端口 8026 未被占用

### 启动命令
```bash
cd /opt/jyd01/liushiguo/OpenAvatarChat_test
CUDA_VISIBLE_DEVICES=2 nohup uv run src/demo.py \
  --config config/xiaoyu_chat_with_qen3asr_qwen3_tts_xingkong3_musetalk_button2_jyd_auto2.yaml \
  > ./logs/8026.log 2>&1 &
```

### 启动验证
```bash
# 检查进程
ps aux | grep demo.py

# 检查端口
netstat -tlnp | grep 8026

# 测试 API
curl http://localhost:8026/openavatarchat/initconfig

# 查看日志
tail -f ./logs/8026.log
```

---

## 13. 性能参数

### VAD 配置
- **speaking_threshold**: 0.4 (语音检测阈值)
- **start_delay**: 1024 samples (起始延迟)
- **end_delay**: 10000 samples (结束延迟)
- **buffer_look_back**: 5000 samples (回溯缓冲)
- **speech_padding**: 1024 samples (语音填充)

### Avatar 配置
- **fps**: 20 (视频帧率)
- **batch_size**: 8 (批处理帧数)
- **multi_thread_inference**: true (多线程推理)

---

**文档版本**: v2.0
**更新日期**: 2026-03-30
**适用后端**: client_handler_rtc51_newfront3_auto_xiaoyu.py
