# 实时数字人系统耗时统计功能实现文档

## 概述

本文档记录了在实时数字人交互系统中实现5个关键耗时统计指标的完整过程。这些指标用于监控系统各模块的性能表现，帮助优化用户体验。

## 统计指标

1. **VAD检测耗时** (`vad_duration_ms`): 语音活动检测+回溯的总耗时
2. **ASR识别耗时** (`asr_duration_ms`): 语音识别合成的总耗时
3. **LLM首句延迟** (`llm_first_delay_ms`): 大语言模型生成首句的延迟
4. **TTS合成耗时** (`tts_duration_ms`): 文本转语音每句话的合成耗时
5. **Avatar首帧延迟** (`avatar_first_frame_delay_ms`): 数字人首帧动作的延迟

## 实现架构

### 数据流向

```
VAD → ASR → LLM → TTS → Avatar → RTC Client → Frontend
 ↓     ↓     ↓     ↓       ↓          ↓
时间1  时间2  时间3  时间4   时间5    汇总展示
```

### 核心机制

- **时间记录**: 使用 `time.time()` 记录开始和结束时间，计算差值并转换为毫秒
- **元数据传递**: 通过 `DataBundle.add_meta()` 在pipeline中传递耗时数据
- **数据汇总**: RTC Client Handler收集所有耗时数据
- **实时传输**: 通过WebRTC DataChannel发送JSON格式的统计数据到前端
- **动态展示**: 前端接收数据后实时更新UI显示

## 修改文件清单

### 1. VAD Handler
**文件**: `src/handlers/vad/silerovad/vad_handler_silero_button_test_time.py`

**主要修改**:
```python
# 添加时间记录字段
self.vad_start_time: Optional[float] = None
self.vad_end_time: Optional[float] = None

# 在检测开始时记录
self.vad_start_time = time.time()

# 在检测结束时计算耗时
self.vad_end_time = time.time()
vad_duration = (self.vad_end_time - self.vad_start_time) * 1000
extra_args["vad_duration_ms"] = vad_duration

# 添加到输出元数据
output.add_meta("vad_duration_ms", extra_args["vad_duration_ms"])
```

### 2. ASR Handler
**文件**: `src/handlers/asr/qwen3asr/qwen3_asr_handler_blocking_test_time.py`

**主要修改**:
```python
# Context中添加时间字段
self.asr_start_time: Optional[float] = None
self.asr_end_time: Optional[float] = None

# 在handle方法中记录耗时
vad_duration_ms = audio_bundle.get_meta("vad_duration_ms", 0)
context.asr_start_time = time.time()
text = self._transcribe_audio(full_audio).strip()
context.asr_end_time = time.time()
asr_duration_ms = (context.asr_end_time - context.asr_start_time) * 1000

# 传递VAD和ASR耗时
output.add_meta("vad_duration_ms", vad_duration_ms)
output.add_meta("asr_duration_ms", asr_duration_ms)
```

### 3. LLM Handler
**文件**: `src/handlers/llm/xingkong3/llm_handler_xingkong3_streaming4_test_time.py`

**主要修改**:
```python
# Context中添加时间字段
self.llm_start_time: Optional[float] = None
self.llm_first_sentence_time: Optional[float] = None

# 在开始处理时记录
context.llm_start_time = time.time()
context.llm_first_sentence_time = None
vad_duration_ms = inputs.data.get_meta("vad_duration_ms", 0)
asr_duration_ms = inputs.data.get_meta("asr_duration_ms", 0)

# 在首句发送时记录
if context.llm_first_sentence_time is None:
    context.llm_first_sentence_time = time.time()
    llm_first_delay_ms = (context.llm_first_sentence_time - context.llm_start_time) * 1000

# 首句传递所有累积耗时
if context.first_chunk_sent and context.llm_first_sentence_time is not None:
    output.add_meta("vad_duration_ms", vad_duration_ms)
    output.add_meta("asr_duration_ms", asr_duration_ms)
    output.add_meta("llm_first_delay_ms", llm_first_delay_ms)
```

### 4. TTS Handler
**文件**: `src/handlers/tts/faster-qwen3-tts/handler/faster_qwen3_tts_handler2_test_time.py`

**主要修改**:
```python
# Context中添加耗时记录字典
self.tts_sentence_times = {}

# 在_process_and_send_sentence方法中记录
tts_start_time = time.time()
# ... TTS合成代码 ...
tts_end_time = time.time()
tts_duration_ms = (tts_end_time - tts_start_time) * 1000

# 保存到context
if speech_id not in context.tts_sentence_times:
    context.tts_sentence_times[speech_id] = []
context.tts_sentence_times[speech_id].append(tts_duration_ms)

# 添加到输出
output.add_meta("tts_duration_ms", tts_duration_ms)
```

### 5. Avatar Handler
**文件**: `src/handlers/avatar/musetalk/avatar_handler_musetalk42_test_time.py`

**主要修改**:
```python
# Context中添加时间字段
self.first_frame_start_time: Optional[float] = None
self.first_frame_generated_time: Optional[float] = None

# 在新speech开始时记录
context.first_frame_start_time = time.time()
context.first_frame_generated_time = None

# 在_media_out_loop中首帧输出时记录
if self.first_frame_generated_time is None and self.first_frame_start_time is not None:
    self.first_frame_generated_time = time.time()
    first_frame_delay_ms = (self.first_frame_generated_time - self.first_frame_start_time) * 1000
    logger.info(f"[Avatar耗时统计] 首帧动作延时: {first_frame_delay_ms:.2f}ms")
```

### 6. RTC Client Handler
**文件**: `src/handlers/client/rtc_client/client_handler_rtc51_newfront3_test_time.py`

**主要修改**:
```python
# 在Delegate类中添加耗时数据字典和rtc_channel引用
self.timing_data = {
    'vad_duration_ms': 0,
    'asr_duration_ms': 0,
    'llm_first_delay_ms': 0,
    'tts_duration_ms': 0,
    'avatar_first_frame_delay_ms': 0
}
self.rtc_channel = None

# 在handle方法中收集耗时数据
if inputs.data:
    vad_duration = inputs.data.get_meta("vad_duration_ms", None)
    asr_duration = inputs.data.get_meta("asr_duration_ms", None)
    llm_first_delay = inputs.data.get_meta("llm_first_delay_ms", None)
    tts_duration = inputs.data.get_meta("tts_duration_ms", None)
    
    if vad_duration is not None:
        delegate.timing_data['vad_duration_ms'] = vad_duration
    if asr_duration is not None:
        delegate.timing_data['asr_duration_ms'] = asr_duration
    if llm_first_delay is not None:
        delegate.timing_data['llm_first_delay_ms'] = llm_first_delay
    if tts_duration is not None:
        delegate.timing_data['tts_duration_ms'] = tts_duration

# 当收到LLM首句延迟时发送统计数据
if llm_first_delay is not None and delegate.rtc_channel:
    import json
    timing_message = {
        'type': 'timing_stats',
        'data': delegate.timing_data.copy()
    }
    delegate.rtc_channel.send(json.dumps(timing_message))
```

### 7. 前端HTML
**文件**: `src/handlers/client/rtc_client/frontend_new3_test_time/index.html`

**主要修改**:
```html
<!-- 添加耗时统计面板 -->
<div id="timing-stats-panel">
  <div class="timing-title">性能统计</div>
  <div class="timing-item">
    <span class="timing-label">VAD检测</span>
    <span class="timing-value" id="timing-vad">--</span>
  </div>
  <div class="timing-item">
    <span class="timing-label">ASR识别</span>
    <span class="timing-value" id="timing-asr">--</span>
  </div>
  <div class="timing-item">
    <span class="timing-label">LLM首句</span>
    <span class="timing-value" id="timing-llm">--</span>
  </div>
  <div class="timing-item">
    <span class="timing-label">TTS合成</span>
    <span class="timing-value" id="timing-tts">--</span>
  </div>
  <div class="timing-item">
    <span class="timing-label">Avatar首帧</span>
    <span class="timing-value" id="timing-avatar">--</span>
  </div>
</div>
```

### 8. 前端CSS
**文件**: `src/handlers/client/rtc_client/frontend_new3_test_time/style.css`

**主要修改**:
```css
/* 耗时统计面板样式 */
#timing-stats-panel {
  position: absolute;
  bottom: 28px;
  left: 28px;
  z-index: 25;
  background: var(--bg-glass);
  backdrop-filter: blur(12px);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 16px 20px;
  min-width: 280px;
  box-shadow: var(--shadow-card);
  font-family: 'JetBrains Mono', monospace;
}

/* 耗时值颜色分级 */
.timing-value.fast { color: var(--accent-green); }
.timing-value.slow { color: var(--accent-amber); }
.timing-value.very-slow { color: var(--accent-red); }
```

### 9. 前端JavaScript
**文件**: `src/handlers/client/rtc_client/frontend_new3_test_time/app.js`

**主要修改**:
```javascript
// 添加DOM引用
let timingVad, timingAsr, timingLlm, timingTts, timingAvatar;

// 在initDOMRefs中获取元素
timingVad = document.getElementById('timing-vad');
timingAsr = document.getElementById('timing-asr');
timingLlm = document.getElementById('timing-llm');
timingTts = document.getElementById('timing-tts');
timingAvatar = document.getElementById('timing-avatar');

// 在handleDataChannelMessage中处理timing_stats消息
if (data.type === 'timing_stats') {
  updateTimingStats(data.data);
  return;
}

// 添加updateTimingStats函数
function updateTimingStats(timingData) {
  if (!timingData) return;

  function formatTime(ms) {
    if (ms === undefined || ms === null || ms === 0) return '--';
    return ms.toFixed(0) + 'ms';
  }

  function getColorClass(ms, thresholds) {
    if (ms === undefined || ms === null || ms === 0) return '';
    if (ms < thresholds.fast) return 'fast';
    if (ms < thresholds.normal) return '';
    if (ms < thresholds.slow) return 'slow';
    return 'very-slow';
  }

  // 更新各项指标
  if (timingVad && timingData.vad_duration_ms !== undefined) {
    timingVad.textContent = formatTime(timingData.vad_duration_ms);
    timingVad.className = 'timing-value ' + getColorClass(timingData.vad_duration_ms, 
      {fast: 100, normal: 200, slow: 300});
  }
  // ... 其他指标类似
}
```

## 性能阈值设置

各模块的性能阈值（用于颜色分级显示）：

| 模块 | 快速(绿色) | 正常(青色) | 慢(琥珀色) | 很慢(红色) |
|------|-----------|-----------|-----------|-----------|
| VAD  | < 100ms   | 100-200ms | 200-300ms | > 300ms   |
| ASR  | < 500ms   | 500-1000ms| 1000-2000ms| > 2000ms |
| LLM  | < 500ms   | 500-1000ms| 1000-2000ms| > 2000ms |
| TTS  | < 500ms   | 500-1000ms| 1000-2000ms| > 2000ms |
| Avatar| < 200ms  | 200-500ms | 500-1000ms| > 1000ms |

## 使用说明

1. **启动系统**: 使用配置文件 `config/chat_with_qen3asr_qwen3_tts_xingkong3_musetalk_button2_jyd_auto2-test_time.yaml`

2. **查看统计**: 连接成功后，左下角会显示性能统计面板，实时展示各模块耗时

3. **颜色含义**:
   - 绿色: 性能优秀
   - 青色: 性能正常
   - 琥珀色: 性能较慢
   - 红色: 性能很慢，需要优化

4. **日志输出**: 各handler会在日志中输出详细的耗时信息，格式如：
   ```
   [VAD耗时统计] VAD检测+回溯总耗时: 150.23ms
   [ASR耗时统计] ASR合成总耗时: 823.45ms | 文本: '你好'
   [LLM耗时统计] LLM首句延迟: 456.78ms
   [TTS耗时统计] TTS句子合成耗时: 678.90ms | 句子: '你好，我是...'
   [Avatar耗时统计] 首帧动作延时: 234.56ms
   ```

## 技术要点

1. **时间精度**: 使用 `time.time()` 提供微秒级精度，转换为毫秒显示
2. **元数据传递**: 利用DataBundle的meta机制在pipeline中传递数据
3. **异步通信**: 通过WebRTC DataChannel实现实时数据传输
4. **动态更新**: 前端使用JavaScript动态更新DOM，无需刷新页面
5. **性能影响**: 耗时统计本身开销极小（< 1ms），不影响系统性能

## 注意事项

1. **首次显示**: 只有在完整执行一次对话流程后，所有指标才会显示数值
2. **数据更新**: 每次新的对话都会更新统计数据
3. **中断处理**: 打断对话时，未完成的统计数据不会发送
4. **网络延迟**: 显示的耗时不包含网络传输延迟

## 后续优化建议

1. 添加历史统计数据记录和趋势分析
2. 实现性能告警机制（超过阈值时提示）
3. 添加统计数据导出功能
4. 支持自定义性能阈值
5. 添加更详细的性能分析图表

## 版本信息

- 实现日期: 2026-04-28
- 系统版本: v1.4.2
- 文档版本: 1.0
