# coding=utf-8

# conda activate qwen3-asr

# CUDA_VISIBLE_DEVICES=2 python3 -m qwen_asr.cli.wrh_ko_streaming6 --asr-checkpoint model/Qwen3-ASR-1.7B --port 7998

# CUDA_VISIBLE_DEVICES=2 nohup python3 -m qwen_asr.cli.wrh_ko_streaming6 --asr-checkpoint model/Qwen3-ASR-1.7B --port 7998 > logs/7998.log 2>&1 &

# 关键词报警 前端页面支持添加并判断检测关键词报警，后端关键词检测逻辑暂时没用到

# 修改关键词报警为后端处理，添加关键词表，不同模型有不同关键词表

# 多并发，稳定，连接状态，日志打印，后端接口稳定版

# 避免重复连接，后续vad模型会出问题

# 优化对 短的关键词的检测 是否考虑去掉vad模型

# 效果非常好

# 关键字添加和删除按钮失效，定位到不是前端问题，需要修改（修复关键词）

# 目前有个问题，韩语关键词新添加的可以识别到但是不会报警闪红灯 可能和长词汇或者空格有关系

# 服务器可能会卡，单条2s语音音频，推理延迟超过1000ms，会造成语音推理堆积，产生滞后性，在堆积期间产生的部分实时录制音频会跳过识别，或者丢失

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

# 减小窗口
WINDOW_SECONDS = 2.0
# WINDOW_SECONDS = 2.0
WINDOW_CHUNKS = int(WINDOW_SECONDS * SAMPLE_RATE / CHUNK_SIZE)

# 降低识别频率,减少GPU压力
# ASR_INTERVAL = 0.5
ASR_INTERVAL = 0.8

# 增加能量门上限，较少无意义识别
# ENERGY_THRESHOLD = 0.01
ENERGY_THRESHOLD = 0.005


############################################################
# 关键词管理
############################################################

KEYWORD_DIR = "keywords"


def ensure_keyword_dir():

    if not os.path.exists(KEYWORD_DIR):
        os.makedirs(KEYWORD_DIR)


def keyword_file(language):

    return os.path.join(KEYWORD_DIR, f"{language}.txt")


def load_keywords(language):

    ensure_keyword_dir()

    path = keyword_file(language)

    if not os.path.exists(path):
        return []

    with open(path, "r", encoding="utf8") as f:

        kws = [i.strip() for i in f.readlines() if i.strip()]

    return kws


def save_keywords(language, kws):

    ensure_keyword_dir()

    path = keyword_file(language)

    with open(path, "w", encoding="utf8") as f:

        for k in kws:
            f.write(k + "\n")


def add_keyword(language, word):

    kws = load_keywords(language)

    if word not in kws:
        kws.append(word)

    save_keywords(language, kws)

    return kws


def delete_keyword(language, word):

    kws = load_keywords(language)

    if word in kws:
        kws.remove(word)

    save_keywords(language, kws)

    return kws


############################################################
# 关键词检测
############################################################

# def keyword_detect(text, keywords):

#     text = text.replace(" ", "")

#     for kw in keywords:

#         if kw in text:
#             return True, kw

#     return False, None

# 关键词和文本都去空格 同时解决：韩语空格 英文大小写 长词
def keyword_detect(text, keywords):

    text = text.replace(" ", "").lower()

    for kw in keywords:

        kw_clean = kw.replace(" ", "").lower()

        if kw_clean in text:
            return True, kw

    return False, None


############################################################
# WebSocket Handler
############################################################

async def asr_handler(websocket, asr):

    client_ip = websocket.remote_address[0]

    client = f"client_{client_ip}"

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

    log(f"连接建立 language={language}", client)

    ############################################################
    # 加载关键词
    ############################################################

    keywords = load_keywords(language)

    log(f"加载关键词 {keywords}", client)

    await websocket.send(json.dumps({

        "type": "keywords",

        "keywords": keywords

    }))

    ############################################################
    # 音频缓存
    ############################################################

    audio_buffer = []

    last_asr_time = 0

    last_text = ""

    try:

        async for message in websocket:

            ##################################################
            # 控制消息
            ##################################################

            if isinstance(message, str):

                try:

                    data = json.loads(message)

                    if "cmd" in data:

                        if data["cmd"] == "add_keyword":

                            keywords = add_keyword(language, data["word"])

                            await websocket.send(json.dumps({
                                "type": "keywords",
                                "keywords": keywords
                            }))

                            log(f"新增关键词 {data['word']}", client)

                            continue

                        if data["cmd"] == "delete_keyword":

                            keywords = delete_keyword(language, data["word"])

                            await websocket.send(json.dumps({
                                "type": "keywords",
                                "keywords": keywords
                            }))

                            log(f"删除关键词 {data['word']}", client)

                            continue

                except:
                    pass

            ##################################################
            # 音频处理
            ##################################################

            pcm = np.frombuffer(message, dtype=np.float32).copy()

            audio_buffer.append(pcm)

            if len(audio_buffer) > WINDOW_CHUNKS:
                audio_buffer.pop(0)

            if len(audio_buffer) < WINDOW_CHUNKS:
                continue

            if time.time() - last_asr_time < ASR_INTERVAL:
                continue

            last_asr_time = time.time()

            full_audio = np.concatenate(audio_buffer)

            ##################################################
            # 能量过滤
            ##################################################

            # 能量检测逻辑
            energy = np.abs(full_audio).mean()
            
            # RMS 能量可能更稳定。（待测试）
            # energy = np.sqrt(np.mean(full_audio**2))
            # RMS 能量可能更稳定。（待测试）
            # energy = np.sqrt(np.mean(full_audio**2.5))
            

            if energy < ENERGY_THRESHOLD:

                log("能量过低 跳过识别", client)

                continue


            ##################################################
            # ASR
            ##################################################

            st = time.time()

            results = asr.transcribe(

                audio=(full_audio, SAMPLE_RATE),

                language=language,

                return_time_stamps=False,

            )

            text = results[0].text.strip()

            if not text:
                continue

            if text == last_text:
                continue

            last_text = text

            cost = int((time.time() - st) * 1000)

            log(f"识别: {text}", client)
            log(f"耗时 {cost} ms", client)

            ##################################################
            # 关键词检测
            ##################################################

            keywords = load_keywords(language)

            alarm, hit = keyword_detect(text, keywords)

            if alarm:

                log(f"⚠️关键词触发: {hit}", client)

            ##################################################
            # 返回
            ##################################################

            msg = {

                "type": "asr",

                "text": text,

                "alarm": alarm

            }

            await websocket.send(json.dumps(msg))

    except websockets.ConnectionClosed:

        log("客户端断开", client)


############################################################
# Server
############################################################

async def start_server(asr, ip, port):

    log(f"🚀 WebSocket ASR running ws://{ip}:{port}")

    async with websockets.serve(

        lambda ws: asr_handler(ws, asr),

        ip,

        port,

        max_size=10_000_000

    ):

        await asyncio.Future()


############################################################
# 主程序
############################################################

def main():

    args = parse_args()

    print("Loading model...")

    asr = Qwen3ASRModel.from_pretrained(

        args.asr_checkpoint,

        dtype=torch.bfloat16,

        device_map="cuda:0",

    )

    print("Model loaded.")

    asyncio.run(start_server(asr, args.ip, args.port))


if __name__ == "__main__":

    main()