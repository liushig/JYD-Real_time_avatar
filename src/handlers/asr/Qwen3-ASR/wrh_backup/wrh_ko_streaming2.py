# coding=utf-8
"""
Qwen3-ASR 伪流式 WebSocket ASR
"""

# 为了控制显存占用，必须使用Transformers实现伪流失输出

# CUDA_VISIBLE_DEVICES=2 python3 -m qwen_asr.cli.wrh_ko_streaming2 --asr-checkpoint model/Qwen3-ASR-1.7B --port 7998

# 关键词报警 前端业面关键词，未实现关键词同步

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


KEYWORDS = [
    "危险",
    "폭발",
    "bomb",
    "help",
    "救命"
]

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
# WebSocket Handler
############################################################

async def asr_handler(websocket, asr):

    client_ip = websocket.remote_address[0]
    client = f"client_{client_ip}"
    
    # 读取前端语言参数
    try:
        path = websocket.request.path
    except:
        path = websocket.path

    parsed = urlparse(path)
    params = parse_qs(parsed.query)

    language = params.get("lang", ["Korean"])[0]

    log(f"连接建立 language={language}", client)

    audio_chunks = []
    prev_audio_chunks = []

    speaking = False

    # 每个连接单独VAD
    vad = load_silero_vad()
    vad_iter = VADIterator(vad, threshold=0.3)

    try:

        async for message in websocket:

            pcm = np.frombuffer(message, dtype=np.float32)

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

                text = ""

                text = results[0].text

                alarm = False

                for k in KEYWORDS:
                    if k in text:
                        alarm = True
                        break

                log(f"识别: {text}", client)
                log(f"耗时 {int((time.time()-st)*1000)} ms", client)

                import json

                msg = {
                    "text": text,
                    "alarm": alarm
                }

                await websocket.send(json.dumps(msg))

    except websockets.ConnectionClosed:
        log("客户端断开", client)


############################################################
# 主程序
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