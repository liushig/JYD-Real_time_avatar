import os
import csv
from pathlib import Path

# 目标文件夹路径
folder_path = "/opt/jyd01/liushiguo/OpenAvatarChat_test/config/data/设计审美原理课程图文对"

# 输出CSV文件路径
output_csv = os.path.join(folder_path, "设计审美原理图文对.csv")

# 支持的图片格式
image_extensions = {'.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'}

# 收集图片和文字描述
image_text_pairs = []

for filename in os.listdir(folder_path):
    file_path = os.path.join(folder_path, filename)

    # 检查是否为文件
    if os.path.isfile(file_path):
        # 获取文件扩展名
        ext = os.path.splitext(filename)[1].lower()

        # 如果是图片文件
        if ext in image_extensions:
            # 去掉扩展名作为文字描述
            text_description = os.path.splitext(filename)[0]
            image_text_pairs.append({
                'image': file_path,
                'text': text_description
            })

# 写入CSV文件
with open(output_csv, 'w', newline='', encoding='utf-8') as csvfile:
    fieldnames = ['image', 'text']
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    writer.writeheader()
    writer.writerows(image_text_pairs)

print(f"成功生成CSV文件: {output_csv}")
print(f"共处理 {len(image_text_pairs)} 张图片")
