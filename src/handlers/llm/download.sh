MODEL_DIR="OpenAvatarChat_test/src/handlers/llm/qwen3-plus"

mkdir -p ${MODEL_DIR}

pip install --upgrade pip
pip install modelscope

python - << EOF
from modelscope import snapshot_download
import shutil
import os

# 实际下载到 ModelScope 缓存
cache_path = snapshot_download(
    'YukinoStuki/Qwen3-4B-Plus-LLM'
)

# 将模型复制到目标目录
target_dir = '${MODEL_DIR}'
os.makedirs(target_dir, exist_ok=True)

if not os.listdir(target_dir):
    shutil.copytree(cache_path, target_dir, dirs_exist_ok=True)
    print("模型已复制到:", target_dir)
else:
    print("目标目录非空，跳过复制:", target_dir)
EOF

echo "=== 完成 ==="