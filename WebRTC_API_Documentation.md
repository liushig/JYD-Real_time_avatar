# OpenAvatarChat WebRTC 连接接口文档

## 概述

本文档描述了前端如何与 OpenAvatarChat 后端建立 WebRTC 连接的完整流程和接口规范。

---

## 1. 初始化配置接口

### 1.1 获取初始配置

**接口地址**: `GET /openavatarchat/initconfig`

**请求方式**: GET

**请求参数**: 无

**响应格式**: JSON

**响应示例**:
```json
{
  "avatar_config": {},
  "rtc_configuration": {
    "iceServers": [
      {
        "urls": ["stun:stun.l.google.com:19302"]
      },
      {
        "urls": ["turn:your-turn-server:3478"],
        "username": "username",
        "credential": "password"
      }
    ]
  }
}
```

**说明**:
- `rtc_configuration`: WebRTC 的 ICE 服务器配置，用于 NAT 穿透
- 前端必须在建立 WebRTC 连接前调用此接口获取 TURN/STUN 服务器配置

---

## 2. WebRTC 连接建立流程

### 2.1 WebRTC Offer 接口

**接口地址**: `POST /webrtc/offer`

**请求方式**: POST

**Content-Type**: `application/json`

**请求参数**:

#### 2.1.1 发送 SDP Offer

```json
{
  "sdp": "v=0\r\no=- 123456789 2 IN IP4 127.0.0.1\r\n...",
  "type": "offer",
  "webrtc_id": "abc123xyz"
}
```

**字段说明**:
- `sdp` (string, 必填): WebRTC SDP offer 描述
- `type` (string, 必填): 固定值 `"offer"`
- `webrtc_id` (string, 必填): 客户端生成的唯一会话标识符

#### 2.1.2 发送 ICE Candidate

```json
{
  "candidate": {
    "candidate": "candidate:1 1 UDP 2130706431 192.168.1.100 54321 typ host",
    "sdpMLineIndex": 0,
    "sdpMid": "0"
  },
  "type": "ice-candidate",
  "webrtc_id": "abc123xyz"
}
```

**字段说明**:
- `candidate` (object, 必填): ICE candidate 对象
- `type` (string, 必填): 固定值 `"ice-candidate"`
- `webrtc_id` (string, 必填): 与 offer 相同的会话标识符

**响应格式**: JSON

**SDP Offer 响应示例**:
```json
{
  "sdp": "v=0\r\no=- 987654321 2 IN IP4 0.0.0.0\r\n...",
  "type": "answer"
}
```

**ICE Candidate 响应**: 无响应体（仅状态码）

**错误响应**:
```json
{
  "status": "failed",
  "message": "错误描述"
}
```

---

## 3. 前端连接实现关键代码

### 3.1 完整连接流程

```javascript
// 1. 配置后端地址
const BACKEND_URL = 'https://your-backend-domain.com:8026/';

// 2. 加载 RTC 配置
async function loadConfig() {
  const resp = await fetch(BACKEND_URL + '/openavatarchat/initconfig');
  const cfg = await resp.json();
  return cfg.rtc_configuration;
}

// 3. 生成唯一会话ID
const webrtcId = Math.random().toString(36).substring(2, 9);

// 4. 创建 RTCPeerConnection
const rtcConfig = await loadConfig();
const pc = new RTCPeerConnection(rtcConfig);

// 5. 添加本地媒体流
localStream.getTracks().forEach(track => {
  pc.addTrack(track, localStream);
});

// 6. 创建 DataChannel（用于文本消息）
const dataChannel = pc.createDataChannel('text');

// 7. 监听 ICE Candidate
pc.onicecandidate = (event) => {
  if (event.candidate) {
    fetch(BACKEND_URL + '/webrtc/offer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidate: event.candidate.toJSON(),
        webrtc_id: webrtcId,
        type: 'ice-candidate'
      })
    }).catch(err => console.error('ICE candidate 发送失败', err));
  }
};

// 8. 创建并发送 Offer
const offer = await pc.createOffer();
await pc.setLocalDescription(offer);

const resp = await fetch(BACKEND_URL + '/webrtc/offer', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sdp: offer.sdp,
    type: offer.type,
    webrtc_id: webrtcId
  })
});

// 9. 处理 Answer
const answer = await resp.json();
if (answer.status === 'failed') {
  throw new Error(answer.message || 'Connection rejected');
}
await pc.setRemoteDescription(answer);

// 10. 监听连接状态
pc.onconnectionstatechange = () => {
  console.log('连接状态:', pc.connectionState);
  if (pc.connectionState === 'connected') {
    console.log('WebRTC 连接成功');
  } else if (pc.connectionState === 'disconnected' || 
             pc.connectionState === 'failed') {
    console.log('连接断开或失败');
  }
};

// 11. 接收远程视频流
pc.ontrack = (event) => {
  if (event.streams && event.streams[0]) {
    remoteVideo.srcObject = event.streams[0];
    remoteVideo.play();
  }
};
```

---

## 4. DataChannel 消息协议

### 4.1 初始化消息

连接建立后立即发送:
```json
{
  "type": "init"
}
```

### 4.2 发送文本消息

```json
{
  "type": "chat",
  "data": "用户输入的文本内容"
}
```

### 4.3 中断对话

```json
{
  "type": "stop_chat"
}
```

### 4.4 接收消息格式

#### 聊天消息
```json
{
  "type": "chat",
  "id": "avatar-1234567890",
  "role": "avatar",
  "message": "AI 回复的内容"
}
```

#### 回复结束
```json
{
  "type": "avatar_end"
}
```

#### 输入确认
```json
{
  "type": "send_input"
}
```

---

## 5. 常见断连问题排查

### 5.1 必须遵守的关键点

1. **webrtc_id 一致性**
   - 同一个会话的所有请求（offer + 所有 ICE candidates）必须使用相同的 `webrtc_id`
   - `webrtc_id` 必须在客户端生成，建议使用随机字符串

2. **ICE Candidate 发送时机**
   - 必须在 `pc.onicecandidate` 回调中立即发送
   - 不要等待所有 candidates 收集完成
   - 每个 candidate 都要单独发送

3. **连接状态监听**
   ```javascript
   pc.onconnectionstatechange = () => {
     if (pc.connectionState === 'failed' || 
         pc.connectionState === 'disconnected') {
       // 连接失败，需要重新建立
       stopWebRTC();
     }
   };
   ```

4. **DataChannel 状态检查**
   ```javascript
   dataChannel.onopen = () => {
     console.log('DataChannel 已打开');
     dataChannel.send(JSON.stringify({ type: 'init' }));
   };
   
   dataChannel.onerror = (error) => {
     console.error('DataChannel 错误:', error);
   };
   ```

### 5.2 断连常见原因

1. **TURN 服务器配置错误**
   - 确保从 `/openavatarchat/initconfig` 获取正确的 TURN 配置
   - 验证 TURN 服务器可访问性

2. **webrtc_id 不一致**
   - Offer 和 ICE candidates 使用了不同的 `webrtc_id`
   - 每次重连必须生成新的 `webrtc_id`

3. **ICE Candidate 发送失败**
   - 网络请求被拦截或超时
   - 建议添加重试机制

4. **媒体流问题**
   - 本地媒体流未正确添加到 PeerConnection
   - 音视频轨道被意外停止

5. **CORS 问题**
   - 后端已启用 CORS，但前端域名可能被防火墙拦截
   - 检查浏览器控制台的 CORS 错误

### 5.3 调试建议

```javascript
// 启用详细日志
pc.addEventListener('icegatheringstatechange', () => {
  console.log('ICE gathering state:', pc.iceGatheringState);
});

pc.addEventListener('iceconnectionstatechange', () => {
  console.log('ICE connection state:', pc.iceConnectionState);
});

pc.addEventListener('signalingstatechange', () => {
  console.log('Signaling state:', pc.signalingState);
});

// 监控 DataChannel
dataChannel.addEventListener('open', () => {
  console.log('DataChannel opened');
});

dataChannel.addEventListener('close', () => {
  console.log('DataChannel closed');
});
```

---

## 6. 完整示例代码

参考文件: `src/handlers/client/rtc_client/frontend_new3_auto-xiaoyu/app.js`

关键函数:
- `loadConfig()` - 第 407-414 行
- `startWebRTC()` - 第 203-242 行
- `negotiate()` - 第 243-260 行
- `handleDataChannelMessage()` - 第 288-333 行

---

## 7. 后端架构说明

- **WebRTC 框架**: 使用 `fastrtc` (基于 `aiortc`)
- **路由挂载**: `/webrtc/offer` 由 `Stream.mount()` 自动注册
- **并发限制**: 可通过 `concurrency_limit` 配置
- **连接超时**: 可通过 `time_limit` 配置

---

## 8. 安全建议

1. 使用 HTTPS 协议访问后端
2. 定期轮换 TURN 服务器凭证
3. 验证 `webrtc_id` 的唯一性和合法性
4. 实施连接速率限制
5. 监控异常连接行为

---

## 附录: 错误码说明

| HTTP 状态码 | 说明 |
|------------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 500 | 服务器内部错误 |
| 503 | 并发连接数已达上限 |

**响应中的 status 字段**:
- `"success"`: 连接建立成功
- `"failed"`: 连接失败，查看 `message` 字段获取详情
