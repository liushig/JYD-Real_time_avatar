# coding=utf-8
"""
Qwen3-ASR Flask API Server (No Frontend)
启动方式:
CUDA_VISIBLE_DEVICES=2 python3 -m qwen_asr.cli.demo_streaming_server.py --asr-model-path model/Qwen3-ASR-1.7B --gpu-memory-utilization 0.3 --port 9008
"""
import argparse
import time
import uuid
import wave
from dataclasses import dataclass
from typing import Dict, Optional

import numpy as np
from flask import Flask, jsonify, request
from qwen_asr import Qwen3ASRModel


@dataclass
class Session:
    state: object
    created_at: float
    last_seen: float


app = Flask(__name__)

global asr
global UNFIXED_CHUNK_NUM
global UNFIXED_TOKEN_NUM
global CHUNK_SIZE_SEC

SESSIONS: Dict[str, Session] = {}
SESSION_TTL_SEC = 10 * 60


def _gc_sessions():
    now = time.time()
    dead = [sid for sid, s in SESSIONS.items() if now - s.last_seen > SESSION_TTL_SEC]
    for sid in dead:
        SESSIONS.pop(sid, None)


def _get_session(session_id: str) -> Optional[Session]:
    _gc_sessions()
    s = SESSIONS.get(session_id)
    if s:
        s.last_seen = time.time()
    return s


def warmup_model(warmup_audio_path: str):
    """模型预热：加载音频文件并执行一次推理"""
    print(f"[Warmup] Loading audio from {warmup_audio_path}")
    try:
        with wave.open(warmup_audio_path, 'rb') as wf:
            sample_rate = wf.getframerate()
            frames = wf.readframes(wf.getnframes())
            audio_data = np.frombuffer(frames, dtype=np.int16).astype(np.float32) / 32768.0

        if sample_rate != 16000:
            print(f"[Warmup] Resampling from {sample_rate}Hz to 16000Hz")
            import scipy.signal
            audio_data = scipy.signal.resample(audio_data, int(len(audio_data) * 16000 / sample_rate))

        print("[Warmup] Starting inference...")
        state = asr.init_streaming_state(
            unfixed_chunk_num=UNFIXED_CHUNK_NUM,
            unfixed_token_num=UNFIXED_TOKEN_NUM,
            chunk_size_sec=CHUNK_SIZE_SEC
        )

        chunk_samples = int(16000 * CHUNK_SIZE_SEC)
        for i in range(0, len(audio_data), chunk_samples):
            chunk = audio_data[i:i + chunk_samples]
            asr.streaming_transcribe(chunk, state)

        print("[Warmup] Model warmup completed successfully")
    except Exception as e:
        print(f"[Warmup] Warning: warmup failed - {e}")


@app.route("/api/start", methods=["POST"])
def api_start():
    sid = str(uuid.uuid4())
    now = time.time()
    state = asr.init_streaming_state(
        unfixed_chunk_num=UNFIXED_CHUNK_NUM,
        unfixed_token_num=UNFIXED_TOKEN_NUM,
        chunk_size_sec=CHUNK_SIZE_SEC
    )
    SESSIONS[sid] = Session(state=state, created_at=now, last_seen=now)
    return jsonify({"session_id": sid})


@app.route("/api/chunk", methods=["POST"])
def api_chunk():
    session_id = request.args.get("session_id", "")
    s = _get_session(session_id)
    if not s:
        return jsonify({"error": "Invalid session_id"}), 400

    raw = request.get_data()
    audio = np.frombuffer(raw, dtype=np.float32)
    print(f"[DEBUG] Received audio chunk: {len(audio)} samples")
    asr.streaming_transcribe(audio, s.state)

    out = {
        "language": getattr(s.state, "language", "") or "",
        "text": getattr(s.state, "text", "") or "",
    }
    print(f"[DEBUG] ASR result: language={out['language']}, text={out['text']}")
    return jsonify(out)


@app.route("/api/finish", methods=["POST"])
def api_finish():
    session_id = request.args.get("session_id", "")
    s = _get_session(session_id)
    if not s:
        return jsonify({"error": "Invalid session_id"}), 400

    out = {
        "language": getattr(s.state, "language", "") or "",
        "text": getattr(s.state, "text", "") or "",
    }
    SESSIONS.pop(session_id, None)
    return jsonify(out)


def parse_args():
    p = argparse.ArgumentParser(description="Qwen3-ASR Streaming API Server")
    p.add_argument("--asr-model-path", default="Qwen/Qwen3-ASR-1.7B", help="Model name or local path")
    p.add_argument("--host", default="0.0.0.0", help="Bind host")
    p.add_argument("--port", type=int, default=9008, help="Bind port")
    p.add_argument("--gpu-memory-utilization", type=float, default=0.8, help="vLLM GPU memory utilization")
    p.add_argument("--unfixed-chunk-num", type=int, default=4)
    p.add_argument("--unfixed-token-num", type=int, default=5)
    p.add_argument("--chunk-size-sec", type=float, default=1.0)
    p.add_argument("--warmup-audio", default="/opt/jyd01/liushiguo/OpenAvatarChat_test/config/data/tangran13xplus.wav", help="Warmup audio path")
    return p.parse_args()


def main():
    args = parse_args()

    global asr
    global UNFIXED_CHUNK_NUM
    global UNFIXED_TOKEN_NUM
    global CHUNK_SIZE_SEC

    UNFIXED_CHUNK_NUM = args.unfixed_chunk_num
    UNFIXED_TOKEN_NUM = args.unfixed_token_num
    CHUNK_SIZE_SEC = args.chunk_size_sec

    print("Loading ASR model...")
    asr = Qwen3ASRModel.LLM(
        model=args.asr_model_path,
        gpu_memory_utilization=args.gpu_memory_utilization,
        max_new_tokens=32,
    )
    print("Model loaded.")

    warmup_model(args.warmup_audio)

    print(f"Starting Flask server on {args.host}:{args.port}")
    app.run(host=args.host, port=args.port, debug=False, use_reloader=False, threaded=True)


if __name__ == "__main__":
    main()
