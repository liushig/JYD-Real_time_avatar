# 数字人实时互动 API 接口文档

## 1. 后端配置

### 后端地址
```javascript
const BACKEND_URL = 'http://localhost:8026';
```

### 服务端口
- 后端服务: `0.0.0.0:8026`
- 前端服务: `localhost:9011` (或其他端口)

---

## 2. HTTP API 接口

### 2.1 获取初始化配置

**接口**: `GET /openavatarchat/initconfig`

**功能**: 获取 WebRTC 连接所需的 RTC 配置信息

**请求参数**: 无

**响应示例**:
```json
{
  "avatar_config": {},
  "rtc_configuration": null
}
```

**响应字段**:
- `avatar_config`: 数字人配置对象(当前为空)
- `rtc_configuration`: ICE 服务器配置(STUN/TURN)

---

### 2.2 WebRTC Offer 协商

**接口**: `POST /webrtc/offer`

**功能**: WebRTC SDP 协商和 ICE Candidate 交换

#### 请求类型1: SDP Offer
```json
{
  "sdp": "v=0\r\no=- ...",
  "type": "offer",
  "webrtc_id": "abc123"
}
```

#### 请求类型2: ICE Candidate
```json
{
  "candidate": {
    "candidate": "candidate:...",
    "sdpMid": "0",
    "sdpMLineIndex": 0
  },
  "webrtc_id": "abc123",
  "type": "ice-candidate"
}
```

#### 响应: SDP Answer
```json
{
  "sdp": "v=0\r\no=- ...",
  "type": "answer"
}
```

#### 错误响应
```json
{
  "status": "failed",
  "message": "错误描述"
}
```

---

## 3. WebRTC DataChannel 协议

### DataChannel 名称
```
"text"
```

### 3.1 客户端 → 服务端消息

#### 初始化
```json
{
  "type": "init"
}
```

#### 发送文本消息
```json
{
  "type": "chat",
  "data": "用户输入的文本"
}
```

#### 打断对话
```json
{
  "type": "stop_chat"
}
```

---

### 3.2 服务端 → 客户端消息

#### 聊天消息(流式推送)
```json
{
  "type": "chat",
  "id": "avatar-1234567890",
  "role": "avatar",
  "message": "AI回复的文本片段"
}
```

或

```json
{
  "type": "chat",
  "id": "human-1234567890",
  "role": "human",
  "message": "用户语音识别结果"
}
```

**字段说明**:
- `id`: 消息唯一标识,相同 id 表示同一条消息的增量更新
- `role`: `"human"` 或 `"avatar"`
- `message`: 消息内容(可能是增量片段)

#### 对话结束
```json
{
  "type": "avatar_end"
}
```

#### 输入已发送
```json
{
  "type": "send_input"
}
```

---

## 4. WebRTC 媒体流

### 音频流
- **方向**: 双向
- **客户端 → 服务端**: 麦克风音频(16kHz, 单声道)
- **服务端 → 客户端**: 数字人语音(24kHz)

### 视频流
- **方向**: 单向(服务端 → 客户端)
- **内容**: 数字人视频画面
- **帧率**: 20fps

---

## 5. 前端状态管理

### 连接状态 (streamState)
- `closed`: 未连接
- `waiting`: 连接中
- `open`: 已连接
- `error`: 连接失败

### 控制状态
- `micMuted`: 麦克风静音
- `volumeMuted`: 音量静音
- `replying`: AI 正在回复
- `panelOpen`: 对话记录面板打开

---

## 6. 前端交互流程

### 6.1 连接建立
```
1. 页面加载 → 请求媒体权限
2. GET /openavatarchat/initconfig
3. 创建 RTCPeerConnection
4. 创建 DataChannel("text")
5. 生成 SDP Offer
6. POST /webrtc/offer (发送 Offer)
7. 接收 SDP Answer
8. 交换 ICE Candidates
9. 连接成功 → streamState = 'open'
```

### 6.2 文本对话
```
用户输入文字 → 点击发送
→ DataChannel.send({"type":"chat","data":"..."})
→ 显示 typing indicator
→ 收到 {"type":"chat","role":"avatar","message":"..."}
→ 更新对话记录和字幕
→ 收到 {"type":"avatar_end"}
→ 清除 typing indicator
```

### 6.3 语音对话
```
用户说话 → 音频流传输
→ 服务端 ASR 识别
→ 收到 {"type":"chat","role":"human","message":"识别文本"}
→ 显示用户字幕
→ LLM 生成回复 → TTS 合成
→ 音视频流推送 + 文本推送
→ 播放数字人视频和语音
→ 显示 AI 字幕
```

### 6.4 打断对话
```
用户点击"打断"按钮
→ DataChannel.send({"type":"stop_chat"})
→ replying = false
→ 清除 typing indicator
```

---

## 7. 前端关键函数

### 7.1 连接管理
```javascript
startWebRTC()      // 建立 WebRTC 连接
stopWebRTC()       // 断开连接
negotiate()        // SDP 协商
```

### 7.2 消息处理
```javascript
handleDataChannelMessage(event)  // 处理服务端消息
sendTextMessage()                // 发送文本消息
sendInterrupt()                  // 发送打断指令
```

### 7.3 UI 更新
```javascript
showSubtitle(role, text)         // 显示字幕
updateSubtitle(role, fullText)   // 更新字幕
hideSubtitle()                   // 隐藏字幕
appendMsgRow(id, role, message)  // 添加对话记录
updateMsgBubble(id, fullText)    // 更新对话气泡
showTypingIndicator()            // 显示输入中
clearTypingIndicator()           // 清除输入中
```

---

## 8. 部署说明

### 8.1 启动后端
```bash
cd /opt/jyd01/liushiguo/OpenAvatarChat_test
CUDA_VISIBLE_DEVICES=2 uv run src/demo.py \
  --config config/xiaoyu_chat_with_qen3asr_qwen3_tts_xingkong3_musetalk_button2_jyd_auto2.yaml
```

### 8.2 启动前端
```bash
cd /opt/jyd01/liushiguo/OpenAvatarChat_test/src/handlers/client/rtc_client/frontend_new3_auto-xiaoyu
python -m http.server 9011
```

### 8.3 访问地址
```
http://localhost:9011
```

---

## 9. 注意事项

1. **HTTPS 要求**: WebRTC 需要 HTTPS 或 localhost 环境
2. **媒体权限**: 需要用户授权麦克风和摄像头
3. **浏览器兼容**: Chrome/Edge/Firefox 最新版
4. **CORS 配置**: 后端已启用 CORS 支持前后端分离
5. **端口匹配**: 前端 BACKEND_URL 必须与后端端口一致
6. **并发限制**: 默认 concurrent_limit=2

---

## 10. 故障排查

### 连接失败
```bash
# 检查后端进程
ps aux | grep demo.py

# 检查端口
netstat -tlnp | grep 8026

# 查看日志
tail -f ./logs/8026.log

# 测试 API
curl http://localhost:8026/openavatarchat/initconfig
```

### CORS 错误
- 确认后端已启用 CORS 中间件
- 检查前端 BACKEND_URL 配置
- 查看浏览器控制台 Network 标签

### 媒体权限
- 使用 HTTP/HTTPS 协议(不能用 file://)
- 检查浏览器权限设置
- 刷新页面重新授权

---

**文档版本**: v2.0
**更新日期**: 2026-03-30
**适用前端**: frontend_new3_auto-xiaoyu
