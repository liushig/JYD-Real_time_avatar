#!/bin/bash
# 监控多会话并发状态

echo "=========================================="
echo "多会话并发监控"
echo "=========================================="
echo ""

LOG_FILE="/opt/jyd01/liushiguo/OpenAvatarChat_test/logs/8028_multisession.log"

if [ ! -f "$LOG_FILE" ]; then
    echo "错误：日志文件不存在: $LOG_FILE"
    exit 1
fi

echo "实时监控会话创建和销毁..."
echo "按 Ctrl+C 退出"
echo ""
echo "格式说明："
echo "  [session_id] - 会话标识符"
echo "  Creating new processor - 创建新会话"
echo "  Cleaning up session - 清理会话"
echo ""
echo "----------------------------------------"

# 实时监控会话相关日志
tail -f "$LOG_FILE" | grep --line-buffered -E "\[.*\].*(Creating new processor|Session resources created|Cleaning up session|Context created|Context started|Context destroyed)" | while read line; do
    timestamp=$(echo "$line" | cut -d'|' -f1 | xargs)
    message=$(echo "$line" | cut -d'|' -f4- | xargs)

    if echo "$message" | grep -q "Creating new processor"; then
        session_id=$(echo "$message" | grep -oP '\[\K[^\]]+')
        echo "[$timestamp] ✓ 新会话创建: $session_id"
    elif echo "$message" | grep -q "Session resources created"; then
        session_id=$(echo "$message" | grep -oP '\[\K[^\]]+')
        echo "[$timestamp]   └─ 会话资源就绪: $session_id"
    elif echo "$message" | grep -q "Context started"; then
        session_id=$(echo "$message" | grep -oP '\[\K[^\]]+')
        echo "[$timestamp]   └─ 会话已启动: $session_id"
    elif echo "$message" | grep -q "Cleaning up session"; then
        session_id=$(echo "$message" | grep -oP '\[\K[^\]]+')
        echo "[$timestamp] ✗ 会话清理: $session_id"
    elif echo "$message" | grep -q "Context destroyed"; then
        session_id=$(echo "$message" | grep -oP '\[\K[^\]]+')
        echo "[$timestamp]   └─ 会话已销毁: $session_id"
    fi
done
