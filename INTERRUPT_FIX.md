# 打断信号重置问题修复

## 问题描述

当打断信号出现在调用大模型之前或过程中时，打断数字人流程后，后续新任务无法执行。

## 根本原因

系统中存在两个关键问题：

### 问题1：LLM handler 的 `_execute_new_task` 方法设计缺陷

1. 该方法在被调用时立即重置 `llm_interrupt_flag = False`
2. 然后尝试从 `context.input_texts` 获取新任务文本
3. 但 `context.input_texts` 在主 `handle` 方法中已经被清空
4. 导致 `chat_text` 为空，方法直接返回
5. 此时打断标志已被重置为 `False`，但没有执行任何新任务
6. 后续的新任务因为打断标志已经是 `False` 而无法正确处理

### 问题2：RTC handler 过早重置 `interrupt_flag`

1. 打断发生时，多个 handler 都会检测到 `interrupt_flag = True`
2. RTC handler 在 `_handle_interrupt` 中过早地重置了 `interrupt_flag = False`
3. 导致其他 handler（LLM、TTS）还没来得及检测打断就被重置
4. 后续数据在 `put_data` 时检查 `_is_interrupted()` 返回 `False`，被正常入队
5. 但系统实际上还在处理打断流程，导致状态不一致

## 修复方案

### 修复1：重构 LLM handler 的打断处理

将 `_execute_new_task` 方法重构为 `_reset_interrupt_state` 方法：

1. **简化职责**：只负责重置打断状态，不再尝试执行新任务
2. **重置打断标志**：将 `llm_interrupt_flag` 设置为 `False`
3. **清空上下文**：清空 `input_texts`、`output_texts` 等状态
4. **等待新输入**：让新的 `handle` 调用自然地处理新任务

### 修复2：移除 RTC handler 中的打断标志重置

1. **删除过早重置**：RTC handler 不再重置 `interrupt_flag`
2. **保留清空队列**：RTC handler 只负责清空输出队列
3. **统一重置点**：让 Avatar handler 在所有 handler 都处理完打断后统一重置标志

## 修改的文件

1. `src/handlers/llm/xingkong3/llm_handler_xingkong3_streaming4.py`
2. `src/handlers/client/rtc_client/client_handler_rtc51_newfront3_auto.py`

## 修改的位置

### llm_handler_xingkong3_streaming4.py

1. 第157-169行：重构 `_execute_new_task` 为 `_reset_interrupt_state`
2. 第212行：打断发生在LLM开始前
3. 第255行：打断发生在LLM流式处理中
4. 第309行：打断发生在flush前
5. 第340行：打断发生在发送结束信号前

### client_handler_rtc51_newfront3_auto.py

1. 第117-134行：删除 `_handle_interrupt` 中重置 `interrupt_flag` 的代码

## 打断信号重置的正确顺序

修复后，打断信号的处理顺序应该是：

1. **触发打断**：ASR 检测到唤醒词，设置 `interrupt_flag = True`
2. **RTC handler**：清空输出队列，但不重置标志
3. **TTS handler**：检测到打断，停止合成
4. **LLM handler**：检测到打断，停止流式输出，重置 `llm_interrupt_flag = False`
5. **Avatar handler**：检测到打断，清空队列，最后重置 `interrupt_flag = False`
6. **接收新任务**：所有标志已重置，系统准备好接收新输入

## 测试建议

1. 在用户说话时（ASR识别中），触发打断
2. 在LLM开始处理前，触发打断
3. 在LLM流式输出过程中，触发打断
4. 验证打断后，新的语音输入能够正常处理
5. 验证打断后，新的文字输入能够正常处理

## 日志关键字

修复后，日志中会出现：
- `[LLM RESET] 检测到打断，重置状态并等待新任务`
- `[LLM RESET] 打断标志已重置为False，准备接收新任务`
- `[RTC中断处理] 唤醒词触发全局打断，清空旧推流队列`（不再有重置标志的日志）

修复前的问题日志：
- `[LLM RESTART] 中断后获取新speech_id: xxx`（之后没有后续处理）
- RTC handler 过早重置标志，导致其他 handler 无法检测打断
