#!/bin/bash
# 测试多会话并发版本

echo "=========================================="
echo "测试多会话并发版本"
echo "=========================================="
echo ""
echo "配置信息："
echo "- GPU: CUDA_VISIBLE_DEVICES=2 (A100 80GB)"
echo "- 端口: 8028"
echo "- concurrent_limit: 5"
echo "- Handler: avatar_handler_musetalk42_xiaoyu_processor"
echo ""
echo "启动服务..."
echo ""

cd /opt/jyd01/liushiguo/OpenAvatarChat_test

# 启动服务
CUDA_VISIBLE_DEVICES=2 nohup uv run src/demo.py \
  --config config/xiaoyu_chat_with_qen3asr_qwen3_tts_xingkong3_musetalk_button2_jyd_auto2_multisession.yaml \
  > ./logs/8028_multisession.log 2>&1 &

PID=$!
echo "服务已启动，PID: $PID"
echo "日志文件: ./logs/8028_multisession.log"
echo ""
echo "等待服务启动..."
sleep 5

# 检查进程是否还在运行
if ps -p $PID > /dev/null; then
    echo "✓ 服务运行正常"
    echo ""
    echo "访问地址: https://localhost:8028"
    echo ""
    echo "查看日志: tail -f ./logs/8028_multisession.log"
    echo "停止服务: kill $PID"
    echo ""
    echo "测试建议："
    echo "1. 打开多个浏览器标签页访问 https://localhost:8028"
    echo "2. 同时在多个标签页中与数字人对话"
    echo "3. 观察是否有卡顿或相互影响"
    echo "4. 使用 nvidia-smi 监控 GPU 使用情况"
else
    echo "✗ 服务启动失败，请查看日志"
    tail -50 ./logs/8028_multisession.log
    exit 1
fi
