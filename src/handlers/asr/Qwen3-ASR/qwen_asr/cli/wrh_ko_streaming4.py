# coding=utf-8

# conda activate qwen3-asr

# CUDA_VISIBLE_DEVICES=2 python3 -m qwen_asr.cli.wrh_ko_streaming4 --asr-checkpoint model/Qwen3-ASR-1.7B --port 7998

# 关键词报警 前端页面支持添加并判断检测关键词报警，后端关键词检测逻辑暂时没用到

# 修改关键词报警为后端处理，添加关键词表，不同模型有不同关键词表

# 多并发，稳定，连接状态，日志打印，后端接口稳定版

# 避免重复连接，后续vad模型会出问题

"""

[2026-03-05 17:23:18] [188.18.24.102] VAD start [2026-03-05 17:23:18] [188.18.24.102] VAD end [2026-03-05 17:23:18] [188.18.24.102] 开始ASR识别 Setting pad_token_id to eos_token_id:151645 for open-end generation. [2026-03-05 17:23:18] [188.18.24.102] 识别结果: 嗯。 [2026-03-05 17:23:18] [188.18.24.102] 识别耗时: 165 ms [2026-03-05 17:23:18] [188.18.24.102] 结果已发送 [2026-03-05 17:23:18] [188.18.24.102] VAD start [2026-03-05 17:23:18] [188.18.24.102] VAD end [2026-03-05 17:23:18] [188.18.24.102] 语音过短 跳过识别 [2026-03-05 17:23:25] [188.18.24.102] VAD start [2026-03-05 17:23:25] [188.18.24.102] VAD end [2026-03-05 17:23:25] [188.18.24.102] 语音过短 跳过识别 [2026-03-05 17:23:27] [188.18.24.102] VAD start [2026-03-05 17:23:27] [188.18.24.102] VAD end [2026-03-05 17:23:27] [188.18.24.102] 开始ASR识别 Setting pad_token_id to eos_token_id:151645 for open-end generation. [2026-03-05 17:23:27] [188.18.24.102] 识别结果: 呃。 [2026-03-05 17:23:27] [188.18.24.102] 识别耗时: 167 ms [2026-03-05 17:23:27] [188.18.24.102] 结果已发送 [2026-03-05 17:23:27] [188.18.24.102] VAD start [2026-03-05 17:23:27] [188.18.24.102] VAD end [2026-03-05 17:23:27] [188.18.24.102] 开始ASR识别 Setting pad_token_id to eos_token_id:151645 for open-end generation. [2026-03-05 17:23:27] [188.18.24.102] 识别结果: 但。 [2026-03-05 17:23:27] [188.18.24.102] 识别耗时: 160 ms [2026-03-05 17:23:27] [188.18.24.102] 结果已发送 [2026-03-05 17:23:29] [188.18.24.102] VAD start [2026-03-05 17:23:29] [188.18.24.102] VAD end [2026-03-05 17:23:29] [188.18.24.102] 开始ASR识别 Setting pad_token_id to eos_token_id:151645 for open-end generation. [2026-03-05 17:23:29] [188.18.24.102] 识别结果: 诶。 [2026-03-05 17:23:29] [188.18.24.102] 识别耗时: 207 ms [2026-03-05 17:23:29] [188.18.24.102] 结果已发送 [2026-03-05 17:23:32] [188.18.24.102] VAD start [2026-03-05 17:23:32] [188.18.24.102] VAD end [2026-03-05 17:23:32] [188.18.24.102] 语音过短 跳过识别 [2026-03-05 17:23:42] [188.18.24.102] VAD start [2026-03-05 17:23:42] [188.18.24.102] VAD end [2026-03-05 17:23:42] [188.18.24.102] 开始ASR识别 Setting pad_token_id to eos_token_id:151645 for open-end generation. [2026-03-05 17:23:42] [188.18.24.102] 识别结果: 啊。 [2026-03-05 17:23:42] [188.18.24.102] 识别耗时: 169 ms [2026-03-05 17:23:42] [188.18.24.102] 结果已发送 [2026-03-05 17:23:50] [188.18.24.102] VAD start [2026-03-05 17:23:50] [188.18.24.102] VAD end [2026-03-05 17:23:50] [188.18.24.102] 开始ASR识别 Setting pad_token_id to eos_token_id:151645 for open-end generation. [2026-03-05 17:23:50] [188.18.24.102] 识别结果: 行。 [2026-03-05 17:23:50] [188.18.24.102] 识别耗时: 169 ms [2026-03-05 17:23:50] [188.18.24.102] 结果已发送 [2026-03-05 17:23:50] [188.18.24.102] VAD start [2026-03-05 17:23:50] [188.18.24.102] VAD end [2026-03-05 17:23:50] [188.18.24.102] 语音过短 跳过识别 [2026-03-05 17:23:53] [188.18.24.102] VAD start [2026-03-05 17:23:53] [188.18.24.102] VAD end [2026-03-05 17:23:53] [188.18.24.102] 开始ASR识别 Setting pad_token_id to eos_token_id:151645 for open-end generation. [2026-03-05 17:23:54] [188.18.24.102] 识别结果: 呃。 [2026-03-05 17:23:54] [188.18.24.102] 识别耗时: 192 ms [2026-03-05 17:23:54] [188.18.24.102] 结果已发送 

后面这个vad模型好像不行了，我们这里有明显的对话，但是vad检测不到



"""





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

    print(prefix, msg, flush=True)


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

MIN_CHUNKS = 10


############################################################
# 全局状态
############################################################

clients = set()

# 防止同IP重复连接
client_sessions = {}


############################################################
# VAD全局加载
############################################################

log("Loading VAD model...")

vad_model = load_silero_vad()

log("VAD loaded.")


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

    with open(path, "r", encoding="utf-8") as f:

        kws = [i.strip() for i in f.readlines() if i.strip()]

    return kws


############################################################
# WebSocket Handler
############################################################

async def asr_handler(websocket, asr):

    client_ip = websocket.remote_address[0]

    client = f"{client_ip}"

    log("收到新连接请求", client)

    ############################################################
    # 防止重复连接
    ############################################################

    if client_ip in client_sessions:

        old_ws = client_sessions[client_ip]

        try:

            log("检测到重复连接，关闭旧连接", client)

            await old_ws.close()

        except:

            pass

    client_sessions[client_ip] = websocket

    clients.add(websocket)

    log(f"连接建立 当前在线 {len(clients)}", client)

    ############################################################
    # VAD
    ############################################################

    vad_iter = VADIterator(vad_model, threshold=0.3)

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
    # 发送关键词表
    ############################################################

    keywords = load_keywords(language)

    await websocket.send(json.dumps({

        "type": "keywords",

        "keywords": keywords

    }))

    ############################################################
    # 音频缓存
    ############################################################

    audio_chunks = []

    prev_audio_chunks = []

    speaking = False

    chunk_count = 0

    try:

        async for message in websocket:

            ############################################################
            # 音频
            ############################################################

            pcm = np.frombuffer(message, dtype=np.float32).copy()

            chunk_count += 1

            speech_dict = vad_iter(pcm)

            ############################################################
            # VAD start
            ############################################################

            if speech_dict and "start" in speech_dict:

                log("VAD start", client)

                speaking = True

            ############################################################
            # 收集音频
            ############################################################

            if speaking:

                audio_chunks.append(pcm)

            else:

                prev_audio_chunks.append(pcm)

                if len(prev_audio_chunks) > PREV_CHUNKS:

                    prev_audio_chunks.pop(0)

            ############################################################
            # VAD end
            ############################################################

            if speech_dict and "end" in speech_dict:

                log("VAD end", client)

                speaking = False

                if len(audio_chunks) < MIN_CHUNKS:

                    log("语音过短 跳过识别", client)

                    audio_chunks.clear()

                    continue

                full_audio = np.concatenate(prev_audio_chunks + audio_chunks)

                audio_chunks.clear()

                ############################################################
                # ASR
                ############################################################

                st = time.time()

                log("开始ASR识别", client)

                results = asr.transcribe(

                    audio=(full_audio, SAMPLE_RATE),

                    language=language,

                    return_time_stamps=False,

                )

                text = results[0].text

                cost = int((time.time() - st) * 1000)

                log(f"识别结果: {text}", client)

                log(f"识别耗时: {cost} ms", client)

                ############################################################
                # 关键词检测
                ############################################################

                keywords = load_keywords(language)

                alarm = False

                for k in keywords:

                    if k in text:

                        alarm = True

                        log(f"关键词触发: {k}", client)

                        break

                ############################################################
                # 返回前端
                ############################################################

                msg = {

                    "type": "asr",

                    "text": text,

                    "alarm": alarm

                }

                await websocket.send(json.dumps(msg))

                log("结果已发送", client)

    ############################################################
    # 客户端关闭
    ############################################################

    except websockets.ConnectionClosed:

        log("客户端主动断开", client)

    except Exception as e:

        log(f"连接异常 {e}", client)

    ############################################################
    # 清理
    ############################################################

    finally:

        if websocket in clients:

            clients.remove(websocket)

        if client_ip in client_sessions:

            del client_sessions[client_ip]

        log(f"连接释放 当前在线 {len(clients)}", client)


############################################################
# Server
############################################################

async def start_server(asr, ip, port):

    log(f"🚀 WebSocket ASR running ws://{ip}:{port}")

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

    backend_kwargs = {}

    if args.backend_kwargs:

        backend_kwargs = json.loads(args.backend_kwargs)

    if args.backend == "transformers":

        backend_kwargs.setdefault("dtype", torch.bfloat16)

        backend_kwargs.setdefault("device_map", "cuda:0")

    print("Loading ASR model...")

    asr = Qwen3ASRModel.from_pretrained(

        args.asr_checkpoint,

        **backend_kwargs,

    )

    print("ASR model loaded.")

    asyncio.run(start_server(asr, args.ip, args.port))


if __name__ == "__main__":

    main()