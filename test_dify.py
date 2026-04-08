import requests
import json
import time
from typing import Dict, Any

# API配置
API_URL = "http://188.18.18.106:5001/v1/workflows/run"
API_KEY = "app-Mbzurid5vkLrmjKuo4rERLDO"  # 请替换为实际的API密钥

# 请求数据
request_data = {
    "inputs": {"query": "你好"},
    "response_mode": "streaming",
    "user": "abc-123"
}

# 请求头
headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json"
}

def test_streaming_api():
    """测试实时互动数字人流式API"""
    print("=== 开始测试实时互动数字人流式API ===")
    print(f"API URL: {API_URL}")
    print(f"请求数据: {json.dumps(request_data, indent=2)}")
    print("=" * 50)
    
    try:
        # 发送POST请求并启用流式响应
        response = requests.post(
            API_URL,
            headers=headers,
            json=request_data,
            stream=True,  # 启用流式响应
            timeout=30  # 设置超时时间
        )
        
        # 检查响应状态码
        response.raise_for_status()
        
        print(f"响应状态码: {response.status_code}")
        print("开始接收流式响应数据...")
        print("-" * 50)
        
        # 处理流式响应
        response_count = 0
        start_time = time.time()
        
        for line in response.iter_lines():
            if line:
                # 解码字节数据为字符串
                line_str = line.decode('utf-8')
                
                # 去除可能的前缀（如"data: "）
                if line_str.startswith("data: "):
                    line_str = line_str[6:]
                
                try:
                    # 解析JSON数据
                    data = json.loads(line_str)
                    response_count += 1
                    
                    # 打印响应数据
                    print(f"\n响应 #{response_count}:")
                    print(f"事件类型: {data.get('event', 'unknown')}")
                    
                    # 根据不同的事件类型显示不同的信息
                    if data.get('event') == 'workflow_started':
                        print(f"  - Task ID: {data.get('task_id')}")
                        print(f"  - Workflow Run ID: {data.get('workflow_run_id')}")
                    elif data.get('event') == 'tts_message':
                        print(f"  - Conversation ID: {data.get('conversation_id')}")
                        print(f"  - Message ID: {data.get('message_id')}")
                        print(f"  - Audio data length: {len(data.get('audio', ''))}")
                    elif data.get('event') == 'tts_message_end':
                        print("  - TTS message completed")
                    else:
                        # 显示其他事件的关键信息
                        for key, value in data.items():
                            if key != 'audio' or len(str(value)) < 50:  # 避免打印过长的音频数据
                                print(f"  - {key}: {value}")
                
                except json.JSONDecodeError:
                    print(f"无法解析的响应行: {line_str}")
                except Exception as e:
                    print(f"处理响应时出错: {e}")
        
        end_time = time.time()
        print("\n" + "=" * 50)
        print(f"测试完成!")
        print(f"总共接收了 {response_count} 个响应块")
        print(f"耗时: {end_time - start_time:.2f} 秒")
        
    except requests.exceptions.RequestException as e:
        print(f"\n请求出错: {e}")
    except KeyboardInterrupt:
        print("\n用户中断了测试。")
    except Exception as e:
        print(f"\n发生未知错误: {e}")

def save_test_results(response_data: str):
    """保存测试结果到文件"""
    try:
        timestamp = time.strftime("%Y%m%d_%H%M%S")
        filename = f"api_test_result_{timestamp}.txt"
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write("=== API测试结果 ===\n")
            f.write(f"测试时间: {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
            f.write(f"API URL: {API_URL}\n")
            f.write(f"\n请求数据:\n")
            f.write(json.dumps(request_data, indent=2))
            f.write(f"\n\n响应数据:\n")
            f.write(response_data)
        
        print(f"\n测试结果已保存到: {filename}")
    except Exception as e:
        print(f"保存测试结果时出错: {e}")

if __name__ == "__main__":
    # 运行测试
    test_streaming_api()
    
