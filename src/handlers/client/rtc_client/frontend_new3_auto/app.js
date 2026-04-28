'use strict';

const state = {
  streamState: 'closed', peerConnection: null, dataChannel: null,
  localStream: null, webrtcId: '', rtcConfig: undefined,
  micMuted: false, cameraOff: false, volumeMuted: false,
  panelOpen: false, replying: false, chatRecords: [],
  hasCamera: false, hasMic: false, typingRowId: null,
  lastAvatarMsgId: null, lastAvatarMsg: '',
  interruptCooldown: false,   // 新增：打断按钮冷却中
  
};
let interruptTimer = null;     // 新增：打断复原计时器
let remoteVideo, localVideo, localPip, placeholder,
    statusDot, statusText, callBtn, micBtn, volBtn, chatPanelBtn,
    textInput, sendBtn, interruptBtn, chatMessages, chatEmpty,
    subtitleHumanRow, subtitleHumanText, subtitleAvatarRow, subtitleAvatarText,
    hintBadge, hintText, permOverlay, toast, rightPanel, appEl, waveformCanvas, waveformCtx;

// --- 新增：浮动输入框相关变量 ---
let chatInputArea = null;          // 输入区域容器
let inputFloated = false;          // 是否处于浮动（顶部）状态

// --- 新增：音频分析相关变量 ---
let audioContext = null;
let analyser = null;
let dataArray = null;
let animationId = null;

function initDOMRefs() {
  remoteVideo   = document.getElementById('remote-video');
  localVideo    = document.getElementById('local-video');
  localPip      = document.getElementById('local-video-pip');
  placeholder   = document.getElementById('avatar-placeholder');
  statusDot     = document.getElementById('status-dot');
  statusText    = document.getElementById('status-text');
  callBtn       = document.getElementById('call-btn');
  micBtn        = document.getElementById('mic-btn');
  volBtn        = document.getElementById('vol-btn');
  chatPanelBtn  = document.getElementById('chat-panel-btn');
  textInput     = document.getElementById('text-input');
  sendBtn       = document.getElementById('send-btn');
  interruptBtn  = document.getElementById('interrupt-btn');
  chatMessages  = document.getElementById('chat-messages');
  chatEmpty     = document.getElementById('chat-empty');
  subtitleHumanRow  = document.getElementById('subtitle-human');
  subtitleHumanText = document.getElementById('subtitle-human-text');
  subtitleAvatarRow  = document.getElementById('subtitle-avatar');
  subtitleAvatarText = document.getElementById('subtitle-avatar-text');
  hintBadge     = document.getElementById('hint-badge');
  hintText      = document.getElementById('hint-text');
  permOverlay   = document.getElementById('permission-overlay');
  toast         = document.getElementById('toast');
  rightPanel    = document.getElementById('right-panel');
  appEl         = document.getElementById('app');
  waveformCanvas = document.getElementById('waveform-canvas');
  waveformCtx   = waveformCanvas ? waveformCanvas.getContext('2d') : null;
  // 新增：获取输入区域容器
  chatInputArea = document.getElementById('chat-input-area');
}

let _tt = null;
function showToast(msg, type, dur) {
  toast.textContent = msg;
  toast.className = 'show' + (type ? ' ' + type : '');
  clearTimeout(_tt);
  _tt = setTimeout(function() { toast.className = ''; }, dur || 3000);
}

function updateCallButton() {
  const stateMap = {
    'open':    { icon: iconHangup(), active: true,  loading: false, title: '断开连接' },
    'waiting': { icon: iconPhone(),  active: false, loading: true,  title: '连接中...' },
    'error':   { icon: iconPhone(),  active: false, loading: false, title: '开始连接' },
    'closed':  { icon: iconPhone(),  active: false, loading: false, title: '开始连接' }
  };
  const cfg = stateMap[state.streamState] || stateMap['closed'];
  callBtn.innerHTML = cfg.icon;
  callBtn.title = cfg.title;
  callBtn.classList.toggle('active', cfg.active);
  callBtn.classList.toggle('loading', cfg.loading);
}

function setStreamState(s) {
  state.streamState = s;
  statusDot.className = 'status-indicator';
  if (s === 'open')         { statusDot.classList.add('connected');  statusText.textContent = '已连接'; }
  else if (s === 'waiting') { statusDot.classList.add('connecting'); statusText.textContent = '连接中...'; }
  else if (s === 'error')   { statusDot.classList.add('error');      statusText.textContent = '连接失败'; }
  else                      { statusText.textContent = '未连接'; }
  updateCallButton();
}

function updateInputHint() {
  var online = state.streamState === 'open';
  textInput.disabled = sendBtn.disabled = !online;
  if (!online) {
    hintBadge.textContent = '离线'; hintBadge.className = 'hint-badge';
    hintText.textContent = '请先开始连接'; return;
  }
  if (state.hasMic && !state.micMuted) {
    hintBadge.textContent = '语音'; hintBadge.className = 'hint-badge voice';
    hintText.textContent = '麦克风已启用，也可输入文字';
  } else {
    hintBadge.textContent = '文字'; hintBadge.className = 'hint-badge';
    hintText.textContent = '麦克风已关闭，请输入文字发送';
  }
}

function syncCtrlBtns() {
  micBtn.className = 'ctrl-btn' + (state.micMuted ? ' muted' : '');
  micBtn.innerHTML = state.micMuted ? iconMicOff() : iconMicOn();
  micBtn.title = state.micMuted ? '已静音 (点击开启)' : '麦克风 (点击静音)';
  volBtn.className = 'ctrl-btn' + (state.volumeMuted ? ' vol-muted' : '');
  volBtn.innerHTML = state.volumeMuted ? iconVolOff() : iconVolOn();
  volBtn.title = state.volumeMuted ? '已静音 (点击开启)' : '音量 (点击静音)';
  if (remoteVideo) remoteVideo.muted = state.volumeMuted;
  chatPanelBtn.className = 'ctrl-btn' + (state.panelOpen ? ' panel-on' : '');
  chatPanelBtn.title = state.panelOpen ? '关闭对话记录' : '对话记录';
  updateInputHint();

  // 控制波形显示
  if (waveformCanvas) {
    if (state.hasMic && !state.micMuted && state.streamState === 'open') {
      waveformCanvas.classList.add('active');
      if (!animationId) startWaveformAnimation();
    } else {
      waveformCanvas.classList.remove('active');
      stopWaveformAnimation();
    }
  }
}

// ========== 新增：输入框浮动控制 ==========
// 将输入框移动到顶部（chat-messages 之前）
function elevateInputToTop() {
  // 仅当面板打开、未浮动、且必要元素存在时执行
  if (!state.panelOpen || inputFloated || !rightPanel || !chatInputArea || !chatMessages) return;
  // 将输入区域移动到聊天消息区域之前（即 panel-header 之后）
  rightPanel.insertBefore(chatInputArea, chatMessages);
  inputFloated = true;
  // 移动后保持输入框焦点（如果原本有焦点）
  if (document.activeElement === textInput) {
    textInput.focus();
  }
}

// 恢复输入框到底部（原样式）
function restoreInputToBottom() {
  if (!inputFloated || !rightPanel || !chatInputArea) return;
  // 将输入区域移回末尾（chat-messages 之后）
  rightPanel.appendChild(chatInputArea);
  inputFloated = false;
  // 滚动聊天区域到底部，让最新消息可见
  scrollToBottom();
  // 主动让输入框失去焦点，避免立即再次触发浮动（用户若需重新输入需再次点击）
  if (document.activeElement === textInput) {
    textInput.blur();
  }
}

// 强制重置浮动状态（例如关闭面板时使用）
function resetInputFloat() {
  if (inputFloated) {
    restoreInputToBottom();
  }
  inputFloated = false;
}
// ====================================

function toggleChatPanel() {
  state.panelOpen = !state.panelOpen;
  if (state.panelOpen) {
    rightPanel.classList.add('open');
    appEl.classList.add('panel-open');
    // 隐藏字幕，避免与对话记录冲突
    document.getElementById('subtitle-bar').style.visibility = 'hidden';
    // 面板打开时，直接将输入框移到顶部
    elevateInputToTop();
  } else {
    rightPanel.classList.remove('open');
    appEl.classList.remove('panel-open');
    // 恢复字幕显示
    document.getElementById('subtitle-bar').style.visibility = 'visible';
    // 面板关闭时，也重置浮动状态
    resetInputFloat();
  }
  syncCtrlBtns();
}

function _svg(d){return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">'+d+'</svg>';}
function iconMicOn()  { return _svg('<path d="M12 2a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V6a4 4 0 0 1 4-4z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>'); }
function iconMicOff() { return _svg('<line x1="1" y1="1" x2="23" y2="23"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V6a3 3 0 0 0-5.94-.6"/><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>'); }
function iconVolOn()  { return _svg('<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>'); }
function iconVolOff() { return _svg('<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>'); }
function iconPhone()  { return _svg('<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.45 2 2 0 0 1 3.59 1.27h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.83a16 16 0 0 0 6 6l.92-.92a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21.73 16.92z"/>'); }
function iconHangup() { return '<svg class="icon" viewBox="0 0 2896 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M55.891476 560.95957C55.891476 326.658413 585.156489 1.704008 1416.882996 1.704008c834.112118 0 1360.99152 324.954404 1360.99152 559.255562 0 201.584195 51.120252 503.875288-351.366535 458.548664-402.316386-45.326624-375.563454-201.584195-375.563454-410.666028 0-146.033521-326.828814-178.920883-634.061531-178.920883-309.78873 0-634.231932 32.887362-634.231932 178.920883 0 209.081832 26.923333 365.339404-375.563454 410.666028C2.215211 1064.834858 55.891476 765.099778 55.891476 561.129971z" fill="currentColor"></path></svg>'; }
function iconSend()   { return _svg('<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>'); }
function iconPause()  { return _svg('<rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none"/><rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor" stroke="none"/>'); }
function iconChat()   { return _svg('<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'); }

function showSubtitle(role, text) {
  if (role === 'human') {
    subtitleHumanText.textContent = text;
    subtitleHumanRow.classList.add('visible');
  } else {
    subtitleAvatarText.textContent = text;
    subtitleAvatarRow.classList.add('visible');
  }
}

function updateSubtitle(role, fullText) {
  if (role === 'human') {
    
    subtitleHumanText.textContent = fullText;
    subtitleHumanRow.classList.add("visible");
  } else {
    subtitleAvatarText.textContent = fullText;
    subtitleAvatarRow.classList.add("visible");
  }
}
function hideSubtitle() {
  subtitleHumanRow.classList.remove("visible");
  subtitleAvatarRow.classList.remove("visible");
  subtitleHumanText.textContent = "";
  subtitleAvatarText.textContent = "";
}

async function accessMedia() {
  if (!navigator.mediaDevices) { showToast('请使用 HTTPS 或 localhost 访问', 'error'); return; }
  await navigator.mediaDevices.getUserMedia({ audio: true }).catch(function() {});
  await navigator.mediaDevices.getUserMedia({ video: true }).catch(function() {});
  var devs = await navigator.mediaDevices.enumerateDevices();
  state.hasMic    = devs.some(function(d){ return d.kind === 'audioinput' && d.deviceId; });
  state.hasCamera = devs.some(function(d){ return d.kind === 'videoinput' && d.deviceId; });
  var stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: state.hasMic ? { echoCancellation: true, noiseSuppression: true } : false,
      video: state.hasCamera ? { width: { ideal: 640 }, height: { ideal: 480 } } : false,
    });
  } catch(e) { stream = new MediaStream(); }
  if (!stream.getAudioTracks().length) { var strack = createSilentAudioTrack(); stream.addTrack(strack); }
  if (!stream.getVideoTracks().length) { stream.addTrack(createBlackVideoTrack()); }
  state.localStream = stream;
  localVideo.srcObject = stream;
  localVideo.muted = true;
  localVideo.play().catch(function(){});

  // 初始化音频分析器
  if (state.hasMic && stream.getAudioTracks().length > 0) {
    initAudioAnalyser(stream);
  }

  syncCtrlBtns();
  permOverlay.classList.add('hidden');
}
function createSilentAudioTrack() {
  var ctx = new AudioContext();
  var osc = ctx.createOscillator();
  var dst = osc.connect(ctx.createMediaStreamDestination());
  osc.start();
  var t = dst.stream.getAudioTracks()[0];
  t.enabled = false;
  return t;
}
function createBlackVideoTrack() {
  var c = document.createElement('canvas');
  c.width = 2; c.height = 2;
  var t = c.captureStream(1).getVideoTracks()[0];
  t.enabled = false;
  return t;
}
async function startWebRTC() {
  if (state.streamState === 'waiting') return;
  if (state.streamState === 'open') { await stopWebRTC(); return; }
  setStreamState('waiting');
  try {
    if (!state.localStream) await accessMedia();
    var pc = new RTCPeerConnection(state.rtcConfig);
    state.peerConnection = pc;
        // ICE 状态监听
    pc.addEventListener('iceconnectionstatechange', function() {
        console.log('🧊 ICE 连接状态:', pc.iceConnectionState);
        if (pc.iceConnectionState === 'connected') {
            console.log('✅ ICE 已连通，媒体流可正常传输');
        } else if (pc.iceConnectionState === 'failed') {
            console.error('❌ ICE 连接失败，请检查 TURN 服务器配置');
        } else if (pc.iceConnectionState === 'disconnected') {
            console.warn('⚠️ ICE 连接断开，尝试重连中...');
        }
    });
    pc.addEventListener('track', function(evt) {
      if (evt.streams && evt.streams[0]) {
        remoteVideo.srcObject = evt.streams[0];
        remoteVideo.muted = state.volumeMuted;
        remoteVideo.play().catch(function(){});
        remoteVideo.classList.add('visible');
        placeholder.classList.add('hidden');
      }
    });
    pc.addEventListener('connectionstatechange', function() {
      if (pc.connectionState === 'connected') {
        setStreamState('open');
        showToast('连接成功', 'success');
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed') {
        showToast('连接已断开', 'error');
        stopWebRTC();
      }
    });
    state.localStream.getTracks().forEach(function(t) { pc.addTrack(t, state.localStream); });
    var dc = pc.createDataChannel('text');
    state.dataChannel = dc;
    dc.onopen = function() { dc.send(JSON.stringify({ type: 'init' })); };
    dc.onmessage = handleDataChannelMessage;
    dc.onerror = function(e) { console.error('[DC]', e); };
    state.webrtcId = Math.random().toString(36).substring(2, 9);
    await negotiate(pc, state.webrtcId);
  } catch(err) {
    console.error('[WebRTC]', err);
    setStreamState('error');
    showToast('连接失败，请重试', 'error');
  }
}
async function negotiate(pc, webrtcId) {
  pc.onicecandidate = function(e) {
    if (e.candidate) {
      fetch('/webrtc/offer', { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate: e.candidate.toJSON(), webrtc_id: webrtcId, type: 'ice-candidate' }),
      }).catch(function(){});
    }
  };
  var offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  var resp = await fetch('/webrtc/offer', { method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sdp: offer.sdp, type: offer.type, webrtc_id: webrtcId }),
  });
  if (!resp.ok) throw new Error('Server ' + resp.status);
  var answer = await resp.json();
  if (answer.status === 'failed') throw new Error(answer.message || 'rejected');
  await pc.setRemoteDescription(answer);
}
async function stopWebRTC() {
  if (state.peerConnection) {
    if (state.peerConnection.getTransceivers)
      state.peerConnection.getTransceivers().forEach(function(t){ if(t.stop) t.stop(); });
    if (state.peerConnection.getSenders)
      state.peerConnection.getSenders().forEach(function(s){ if(s.track) s.track.stop(); });
    setTimeout(function(){ if(state.peerConnection) state.peerConnection.close(); }, 400);
    state.peerConnection = null;
    if (interruptTimer) {
    clearTimeout(interruptTimer);
    interruptTimer = null;
  }
  interruptBtn.classList.remove('interrupt-cooldown');
  state.interruptCooldown = false;
  }
  state.dataChannel = null;
  state.replying = false;
  state.chatRecords = [];
  state.lastAvatarMsgId = null;
  state.lastAvatarMsg = '';
  clearTypingIndicator();
  while (chatMessages.firstChild) chatMessages.removeChild(chatMessages.firstChild);
  chatMessages.appendChild(chatEmpty);
  chatEmpty.style.display = '';
  remoteVideo.srcObject = null;
  remoteVideo.classList.remove('visible');
  placeholder.classList.remove('hidden');
  setStreamState('closed');
  interruptBtn.classList.remove('active');
  hideSubtitle();
  state.localStream = null;
  await accessMedia();
}
function handleDataChannelMessage(event) {
  var data;
  try { data = JSON.parse(event.data); } catch(e) { return; }
  if (!data || !data.type) return;
  if (data.type === 'chat') {
    var existing = null;
    for (var i = 0; i < state.chatRecords.length; i++) {
      if (state.chatRecords[i].id === data.id) { existing = state.chatRecords[i]; break; }
    }
    var role = data.role || 'avatar';
    if (existing) {
      existing.message += data.message;
      updateMsgBubble(data.id, existing.message);
      updateSubtitle(role, existing.message);
    } else {
      // 检查是否已存在相同内容的human消息（避免文字输入重复显示）
      var isDuplicate = false;
      if (role === 'human') {
        for (var i = state.chatRecords.length - 1; i >= Math.max(0, state.chatRecords.length - 3); i--) {
          if (state.chatRecords[i].role === 'human' && state.chatRecords[i].message === data.message) {
            isDuplicate = true;
            break;
          }
        }
      }
      if (!isDuplicate) {
        state.chatRecords.push({ id: data.id, role: role, message: data.message });
        clearTypingIndicator();
        appendMsgRow(data.id, role, data.message);
      }
      showSubtitle(role, data.message);
    }
    return;
  }
  if (data.type === 'avatar_end') {
    state.replying = false;
    interruptBtn.classList.remove('active');
    clearTypingIndicator();
    return;
  }
  if (data.type === 'send_input') {
    clearTypingIndicator();
    showTypingIndicator();
    return;
  }
}

function appendMsgRow(id, role, message) {
  chatEmpty.style.display = 'none';
  var row = document.createElement('div');
  row.className = 'msg-row ' + role;
  row.dataset.id = id;
  var roleEl = document.createElement('div');
  roleEl.className = 'msg-role';
  roleEl.textContent = role === 'human' ? 'YOU' : 'AI';
  var bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.id = 'bubble-' + id;
  bubble.textContent = message;
  row.appendChild(roleEl);
  row.appendChild(bubble);
  chatMessages.appendChild(row);
  scrollToBottom();
}
function updateMsgBubble(id, fullText) {
  var el = document.getElementById('bubble-' + id);
  if (el) { el.textContent = fullText; scrollToBottom(); }
}
function showTypingIndicator() {
  if (state.typingRowId) return;
  var id = 'typing-' + Date.now();
  state.typingRowId = id;
  chatEmpty.style.display = 'none';
  var row = document.createElement('div');
  row.className = 'msg-row avatar';
  row.id = id;
  var roleEl = document.createElement('div');
  roleEl.className = 'msg-role';
  roleEl.textContent = 'AI';
  var bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.innerHTML = '<div class=typing-indicator><span></span><span></span><span></span></div>';
  row.appendChild(roleEl);
  row.appendChild(bubble);
  chatMessages.appendChild(row);
  scrollToBottom();
}
function clearTypingIndicator() {
  if (state.typingRowId) {
    var el = document.getElementById(state.typingRowId);
    if (el) el.remove();
    state.typingRowId = null;
  }
}
function scrollToBottom() { chatMessages.scrollTop = chatMessages.scrollHeight; }
function sendTextMessage() {
  var text = textInput.value.trim();
  if (!text) return;
  if (!state.dataChannel || state.dataChannel.readyState !== 'open') {
    showToast('请先开始连接', 'error'); return;
  }
  var id = 'human-' + Date.now();
  state.dataChannel.send(JSON.stringify({ type: 'chat', data: text }));
  state.chatRecords.push({ id: id, role: 'human', message: text });
  appendMsgRow(id, 'human', text);
  state.replying = true;
  interruptBtn.classList.add('active');
  showTypingIndicator();
  textInput.value = '';
  textInput.style.height = 'auto';
}
function sendInterrupt() {
  // 冷却中或未连接则不允许打断
  if (state.interruptCooldown) return;
  if (!state.dataChannel || state.dataChannel.readyState !== 'open') {
    showToast('未连接，无法打断', 'error');
    return;
  }

  // 进入冷却状态
  state.interruptCooldown = true;
  interruptBtn.classList.add('interrupt-cooldown');

  // 发送打断指令
  state.dataChannel.send(JSON.stringify({ type: 'stop_chat' }));

  // 清除回复状态及UI高亮
  state.replying = false;
  interruptBtn.classList.remove('active');
  clearTypingIndicator();

  // 1秒后自动复原
  if (interruptTimer) clearTimeout(interruptTimer);
  interruptTimer = setTimeout(() => {
    interruptBtn.classList.remove('interrupt-cooldown');
    state.interruptCooldown = false;
    interruptTimer = null;
  }, 1000);
}
async function loadConfig() {
  try {
    var resp = await fetch('/openavatarchat/initconfig');
    if (!resp.ok) return;
    var cfg = await resp.json();
    if (cfg.rtc_configuration) state.rtcConfig = cfg.rtc_configuration;
  } catch(e) { console.warn('config load failed'); }
}
function bindEvents() {
  callBtn.addEventListener('click', function() {
    if (state.streamState === 'closed') {
      location.reload();
    } else {
      startWebRTC();
    }
  });
  micBtn.addEventListener('click', function() {
    if (state.streamState !== 'open') return;
    state.micMuted = !state.micMuted;
    if (state.localStream) { state.localStream.getAudioTracks().forEach(function(t) { t.enabled = !state.micMuted; }); }
    syncCtrlBtns();
  });
  volBtn.addEventListener('click', function() {
    if (state.streamState !== 'open') return;
    state.volumeMuted = !state.volumeMuted;
    syncCtrlBtns();
  });
  chatPanelBtn.addEventListener('click', function() { toggleChatPanel(); });
  sendBtn.addEventListener('click', function() { sendTextMessage(); });
  textInput.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendTextMessage(); }
  });
  textInput.addEventListener('input', function() {
    textInput.style.height = 'auto';
    textInput.style.height = Math.min(textInput.scrollHeight, 80) + 'px';
  });
  interruptBtn.addEventListener('click', function() { sendInterrupt(); });
  document.getElementById('perm-grant-btn').addEventListener('click', function() { accessMedia(); });
  document.getElementById('clear-btn').addEventListener('click', function() {
    state.chatRecords = [];
    while (chatMessages.firstChild) chatMessages.removeChild(chatMessages.firstChild);
    chatMessages.appendChild(chatEmpty);
    chatEmpty.style.display = '';
  });
}
// ========== 音频波形可视化 ==========
function initAudioAnalyser(stream) {
  try {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    const bufferLength = analyser.frequencyBinCount;
    dataArray = new Uint8Array(bufferLength);

    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
  } catch(e) {
    console.warn('音频分析器初始化失败:', e);
  }
}

function startWaveformAnimation() {
  if (!waveformCtx || !analyser || !dataArray) return;

  function draw() {
    animationId = requestAnimationFrame(draw);

    analyser.getByteFrequencyData(dataArray);

    const canvas = waveformCanvas;
    const ctx = waveformCtx;
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    ctx.clearRect(0, 0, width, height);

    // 计算平均音量
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const average = sum / dataArray.length;
    const normalizedVolume = average / 255;

    // 绘制多层波形圆环
    const numBars = 32;
    const baseRadius = 35;
    const maxBarLength = 18;

    for (let i = 0; i < numBars; i++) {
      const angle = (Math.PI * 2 * i) / numBars;
      const dataIndex = Math.floor((i / numBars) * dataArray.length);
      const barHeight = (dataArray[dataIndex] / 255) * maxBarLength;

      const x1 = centerX + Math.cos(angle) * baseRadius;
      const y1 = centerY + Math.sin(angle) * baseRadius;
      const x2 = centerX + Math.cos(angle) * (baseRadius + barHeight);
      const y2 = centerY + Math.sin(angle) * (baseRadius + barHeight);

      // 渐变色 - 使用更鲜艳的颜色
      const gradient = ctx.createLinearGradient(x1, y1, x2, y2);
      gradient.addColorStop(0, 'rgba(46, 204, 113, 1)');  // 翠绿色
      gradient.addColorStop(1, 'rgba(255, 215, 0, 1)');   // 金黄色

      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // 中心发光圆
    const glowRadius = 8 + normalizedVolume * 6;
    const glowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowRadius);
    glowGradient.addColorStop(0, 'rgba(46, 204, 113, 0.8)');
    glowGradient.addColorStop(1, 'rgba(46, 204, 113, 0)');
    ctx.fillStyle = glowGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  draw();
}

function stopWaveformAnimation() {
  if (animationId) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }
  if (waveformCtx && waveformCanvas) {
    waveformCtx.clearRect(0, 0, waveformCanvas.width, waveformCanvas.height);
  }
}

document.addEventListener('DOMContentLoaded', async function() {
  initDOMRefs();
  setStreamState('closed');
  micBtn.innerHTML = iconMicOn();
  volBtn.innerHTML = iconVolOn();
  chatPanelBtn.innerHTML = iconChat();
  sendBtn.innerHTML = iconSend();
  interruptBtn.innerHTML = iconPause();
  syncCtrlBtns();
  bindEvents();
  await loadConfig();
  await accessMedia();
  setTimeout(function() { startWebRTC(); }, 500);
});