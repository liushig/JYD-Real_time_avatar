import requests

# 接口地址
url = "http://188.18.18.149:5001/v1/chat-messages"

# 请求头
headers = {
    "Content-Type": "application/json",
    "Authorization": "Bearer app-jOt7Ny1Ken6fvH6Igi4e52nJ"
}

# ✅ 终极修复：所有参数外层套 data 对象（解决报错）
payload = {
    "data": {  # 这里是关键！必须套一层 data
        "inputs": {
            "bl": "男，35岁，2025年12月19日初诊。伤寒瘥后劳复。现症见身热心烦，心中懊憹，胸中窒塞，心下痞闷，纳呆口渴。舌红苔薄黄，脉数。",
            "gqmz": "身热心烦，心中懊憹，胸中窒塞，心下痞闷，舌红苔薄黄，脉数",
            "zfhn": "瘥后劳复，余热复集，气机痞塞",
            "szzz": "枳实栀子豉汤：枳实9g（炙），栀子9g（擘），香豉9g（绵裹）。以清浆水700mL，空煮取400mL，纳枳实、栀子，煮取200mL，下香豉，更煮五六沸，去滓，分二服，温进一服，得吐者止后服。",
            "zf": "暂无",
            "twyy": "暂无"
        },
        "query": "你好",
        "response_mode": "streaming",
        "conversation_id": "",
        "user": "songyiqing"
    }
}

# 发送请求
response = requests.post(url, headers=headers, json=payload)

# 输出结果
print("状态码:", response.status_code)
print("返回结果:", response.text)