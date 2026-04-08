# coding=utf-8

# conda activate qwen3-asr

# CUDA_VISIBLE_DEVICES=2 python3 -m qwen_asr.cli.wrh_ko_streaming3 --asr-checkpoint model/Qwen3-ASR-1.7B --port 7998

# 关键词报警 前端页面支持添加并判断检测关键词报警，后端关键词检测逻辑暂时没用到

# 修改关键词报警为后端处理，添加关键词表，不同模型有不同关键词表

# 一个连接版本 切换语言后需要重新点击识别才有效


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
from silero_vad import load_silero_vad, VADIterator


############################################################
# 日志
############################################################

def log(msg, client=None):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    prefix = f"[{ts}]"
    if client:
        prefix += f" [{client}]"
    print(prefix, msg)


############################################################
# 参数
############################################################

def parse_args():

    parser = argparse.ArgumentParser()

    parser.add_argument("--asr-checkpoint", required=True)

    parser.add_argument("--backend", default="transformers")

    parser.add_argument("--backend-kwargs", default=None)

    parser.add_argument("--port", type=int, default=7998)

    parser.add_argument("--ip", default="0.0.0.0")

    return parser.parse_args()


############################################################
# 音频参数
############################################################

SAMPLE_RATE = 16000
PREV_SECS = 0.2
PREV_CHUNKS = int(PREV_SECS * SAMPLE_RATE / 512)


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
        log(f"关键词文件不存在: {path}")
        return []

    with open(path, "r", encoding="utf-8") as f:
        kws = [i.strip() for i in f.readlines() if i.strip()]

    return kws


def save_keywords(language, kws):

    ensure_keyword_dir()

    path = keyword_file(language)

    with open(path, "w", encoding="utf-8") as f:
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
# WebSocket Handler
############################################################

async def asr_handler(websocket, asr):

    client_ip = websocket.remote_address[0]
    client = f"client_{client_ip}"

    # 获取语言
    try:
        path = websocket.request.path
    except:
        path = websocket.path

    parsed = urlparse(path)
    params = parse_qs(parsed.query)

    language = params.get("lang", ["Chinese"])[0]

    log(f"连接建立 language={language}", client)

    # 读取关键词
    keywords = load_keywords(language)

    log(f"加载关键词 {keywords}", client)

    # 先发送关键词表
    await websocket.send(json.dumps({
        "type": "keywords",
        "keywords": keywords
    }))

    # 等待一点时间避免和音频冲突
    await asyncio.sleep(0.05)

    audio_chunks = []
    prev_audio_chunks = []

    speaking = False

    vad = load_silero_vad()
    vad_iter = VADIterator(vad, threshold=0.3)

    try:

        async for message in websocket:

            ##################################################
            # 判断控制消息
            ##################################################

            try:

                data = json.loads(message)

                if isinstance(data, dict) and "cmd" in data:

                    if data["cmd"] == "add_keyword":

                        kws = add_keyword(language, data["word"])

                        await websocket.send(json.dumps({
                            "type": "keywords",
                            "keywords": kws
                        }))

                        log(f"新增关键词 {data['word']}", client)

                        continue

                    if data["cmd"] == "delete_keyword":

                        kws = delete_keyword(language, data["word"])

                        await websocket.send(json.dumps({
                            "type": "keywords",
                            "keywords": kws
                        }))

                        log(f"删除关键词 {data['word']}", client)

                        continue

            except:
                pass


            ##################################################
            # 音频处理
            ##################################################

            pcm = np.frombuffer(message, dtype=np.float32).copy()

            speech_dict = vad_iter(pcm)

            if speech_dict and "start" in speech_dict:
                speaking = True

            if speaking:
                audio_chunks.append(pcm)

            else:
                prev_audio_chunks.append(pcm)

                if len(prev_audio_chunks) > PREV_CHUNKS:
                    prev_audio_chunks.pop(0)

            if speech_dict and "end" in speech_dict:

                speaking = False

                full_audio = np.concatenate(prev_audio_chunks + audio_chunks)

                audio_chunks.clear()

                st = time.time()

                results = asr.transcribe(
                    audio=(full_audio, SAMPLE_RATE),
                    language=language,
                    return_time_stamps=False,
                )

                text = results[0].text

                ##################################################
                # 关键词报警
                ##################################################

                keywords = load_keywords(language)

                alarm = False

                for k in keywords:
                    if k in text:
                        alarm = True
                        break

                log(f"识别: {text}", client)
                log(f"耗时 {int((time.time()-st)*1000)} ms", client)

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

    backend_kwargs = {}

    if args.backend_kwargs:
        backend_kwargs = json.loads(args.backend_kwargs)

    if args.backend == "transformers":
        backend_kwargs.setdefault("dtype", torch.bfloat16)
        backend_kwargs.setdefault("device_map", "cuda:0")

    print("Loading model...")

    asr = Qwen3ASRModel.from_pretrained(
        args.asr_checkpoint,
        **backend_kwargs,
    )

    print("Model loaded.")

    asyncio.run(start_server(asr, args.ip, args.port))


if __name__ == "__main__":
    main()