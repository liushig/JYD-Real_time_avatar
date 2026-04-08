# coding=utf-8

# conda activate qwen3-asr

# CUDA_VISIBLE_DEVICES=2 python3 -m qwen_asr.cli.wrh_ko_streaming5 --asr-checkpoint model/Qwen3-ASR-1.7B --port 7998

# 关键词报警 前端页面支持添加并判断检测关键词报警，后端关键词检测逻辑暂时没用到

# 修改关键词报警为后端处理，添加关键词表，不同模型有不同关键词表

# 多并发，稳定，连接状态，日志打印，后端接口稳定版

# 避免重复连接，后续vad模型会出问题

# 优化对 短的关键词的检测 是否考虑去掉vad模型

# 去掉vad模型，使用滑动窗口切片识别，效果非常好（重大突破） 后续可细化模糊匹配，滑动窗口策略

# 关键字添加和删除按钮失效，定位到不是前端问题，需要修改

# 滑动窗口稳定基础备份版



# coding=utf-8

# CUDA_VISIBLE_DEVICES=2 python3 streaming_short_keyword.py \
# --asr-checkpoint model/Qwen3-ASR-1.7B \
# --port 7998

import argparse
import asyncio
import websockets
import numpy as np
import torch
import json
import os
import time
from datetime import datetime
from urllib.parse import urlparse, parse_qs

from qwen_asr import Qwen3ASRModel


############################################################
# 日志
############################################################

def log(msg, client=None):

    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    prefix = f"[{ts}]"

    if client:
        prefix += f" [{client}]"

    print(prefix, msg, flush=True)


############################################################
# 参数
############################################################

def parse_args():

    parser = argparse.ArgumentParser()

    parser.add_argument("--asr-checkpoint", required=True)

    parser.add_argument("--port", type=int, default=7998)

    parser.add_argument("--ip", default="0.0.0.0")

    return parser.parse_args()


############################################################
# 音频参数
############################################################

SAMPLE_RATE = 16000
CHUNK_SIZE = 512

# 2秒滑动窗口
WINDOW_SECONDS = 2.0
WINDOW_CHUNKS = int(WINDOW_SECONDS * SAMPLE_RATE / CHUNK_SIZE)

# 识别间隔
ASR_INTERVAL = 0.5

# 能量过滤阈值
ENERGY_THRESHOLD = 0.01


############################################################
# 关键词
############################################################

KEYWORD_DIR = "keywords"


def keyword_file(language):

    return os.path.join(KEYWORD_DIR, f"{language}.txt")


def load_keywords(language):

    path = keyword_file(language)

    if not os.path.exists(path):

        return []

    with open(path, "r", encoding="utf8") as f:

        kws = [i.strip() for i in f.readlines() if i.strip()]

    return kws


############################################################
# 关键词检测
############################################################

def keyword_detect(text, keywords):

    text = text.replace(" ", "")

    for kw in keywords:

        if kw in text:

            return True, kw

    return False, None


############################################################
# WebSocket Handler
############################################################

async def asr_handler(websocket, asr):

    client_ip = websocket.remote_address[0]

    client = client_ip

    log("新连接", client)

    ############################################################
    # 获取语言
    ############################################################

    try:
        path = websocket.request.path
    except:
        path = websocket.path

    parsed = urlparse(path)

    params = parse_qs(parsed.query)

    language = params.get("lang", ["Chinese"])[0]

    log(f"language={language}", client)

    ############################################################
    # 加载关键词
    ############################################################

    keywords = load_keywords(language)

    await websocket.send(json.dumps({

        "type": "keywords",

        "keywords": keywords

    }))

    ############################################################
    # 音频缓存
    ############################################################

    audio_buffer = []

    last_asr_time = 0

    try:

        async for message in websocket:

            pcm = np.frombuffer(message, dtype=np.float32).copy()

            audio_buffer.append(pcm)

            # 保持2秒窗口
            if len(audio_buffer) > WINDOW_CHUNKS:
                audio_buffer.pop(0)

            if len(audio_buffer) < WINDOW_CHUNKS:
                continue

            # 控制识别频率
            if time.time() - last_asr_time < ASR_INTERVAL:
                continue

            last_asr_time = time.time()

            full_audio = np.concatenate(audio_buffer)

            ############################################################
            # 能量过滤
            ############################################################

            energy = np.abs(full_audio).mean()

            if energy < ENERGY_THRESHOLD:
                log("能量过低 跳过识别", client)
                continue

            ############################################################
            # ASR
            ############################################################

            st = time.time()

            results = asr.transcribe(

                audio=(full_audio, SAMPLE_RATE),

                language=language,

                return_time_stamps=False,

            )

            text = results[0].text

            cost = int((time.time() - st) * 1000)

            log(f"识别: {text} ({cost}ms)", client)

            ############################################################
            # 关键词检测
            ############################################################

            alarm, hit = keyword_detect(text, keywords)

            if alarm:

                log(f"⚠️关键词触发: {hit}", client)

            ############################################################
            # 返回
            ############################################################

            msg = {

                "type": "asr",

                "text": text,

                "alarm": alarm

            }

            await websocket.send(json.dumps(msg))

    except websockets.ConnectionClosed:

        log("连接关闭", client)


############################################################
# Server
############################################################

async def start_server(asr, ip, port):

    log(f"🚀 ws://{ip}:{port}")

    async with websockets.serve(

        lambda ws: asr_handler(ws, asr),

        ip,

        port,

        max_size=10_000_000,

        ping_interval=20,

        ping_timeout=20

    ):

        await asyncio.Future()


############################################################
# 主程序
############################################################

def main():

    args = parse_args()

    print("Loading ASR model...")

    asr = Qwen3ASRModel.from_pretrained(

        args.asr_checkpoint,

        dtype=torch.bfloat16,

        device_map="cuda:0",

    )

    print("ASR model loaded.")

    asyncio.run(start_server(asr, args.ip, args.port))


if __name__ == "__main__":

    main()