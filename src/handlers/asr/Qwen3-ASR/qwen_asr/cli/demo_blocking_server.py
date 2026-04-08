# coding=utf-8
"""
Qwen3-ASR Flask API Server (Blocking/Pseudo-streaming with Transformers)
启动方式:
CUDA_VISIBLE_DEVICES=2 python3 -m qwen_asr.cli.demo_blocking_server --asr-model-path model/Qwen3-ASR-1.7B --port 9009
CUDA_VISIBLE_DEVICES=2 python3 -m qwen_asr.cli.demo_blocking_server --asr-model-path model/Qwen3-ASR-1.7B --port 9009
CUDA_VISIBLE_DEVICES=2 nohup python3 -m qwen_asr.cli.demo_blocking_server --asr-model-path model/Qwen3-ASR-1.7B --port 9009 > /opt/jyd01/liushiguo/OpenAvatarChat_test/logs/9009.log 2>&1 &


"""
import argparse
import time
import wave
import torch
import numpy as np
from flask import Flask, jsonify, request
from qwen_asr import Qwen3ASRModel

app = Flask(__name__)

global asr
global SAMPLE_RATE
SAMPLE_RATE = 16000


def warmup_model(warmup_audio_path: str):
    """模型预热：加载音频文件并执行多次推理"""
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

        print("[Warmup] Starting inference (3 rounds)...")
        for i in range(3):
            start = time.time()
            results = asr.transcribe(
                audio=(audio_data, 16000),
                language="Chinese",
                return_time_stamps=False,
            )
            text = results[0].text if results else ""
            print(f"[Warmup] Round {i+1}: {time.time()-start:.3f}s | text: '{text}'")
        print("[Warmup] Model warmup completed successfully")
    except Exception as e:
        print(f"[Warmup] Warning: warmup failed - {e}")


@app.route("/api/transcribe", methods=["POST"])
def api_transcribe():
    """接收完整音频，返回识别结果"""
    try:
        raw = request.get_data()
        audio = np.frombuffer(raw, dtype=np.float32)

        if len(audio) == 0:
            return jsonify({"text": "", "language": ""}), 200

        print(f"[API] Received audio: {len(audio)} samples ({len(audio)/SAMPLE_RATE:.2f}s)")

        start_time = time.time()
        results = asr.transcribe(
            audio=(audio, SAMPLE_RATE),
            language="Chinese",
            return_time_stamps=False,
        )

        text = results[0].text if results else ""
        language = results[0].language if results and hasattr(results[0], 'language') else "Chinese"

        duration = time.time() - start_time
        print(f"[API] Transcription: '{text}' | Time: {duration:.3f}s")

        return jsonify({"text": text, "language": language})

    except Exception as e:
        print(f"[API] Error: {e}")
        return jsonify({"error": str(e)}), 500


def parse_args():
    p = argparse.ArgumentParser(description="Qwen3-ASR Blocking API Server")
    p.add_argument("--asr-model-path", default="Qwen/Qwen3-ASR-1.7B", help="Model name or local path")
    p.add_argument("--host", default="0.0.0.0", help="Bind host")
    p.add_argument("--port", type=int, default=9009, help="Bind port")
    p.add_argument("--dtype", default="bfloat16", help="Model dtype (bfloat16/float16/float32)")
    p.add_argument("--device", default="cuda:0", help="Device (cuda:0/cpu)")
    p.add_argument("--warmup-audio", default="/opt/jyd01/liushiguo/OpenAvatarChat_test/config/data/tangran13xplus.wav", help="Warmup audio path")
    return p.parse_args()


def main():
    args = parse_args()

    global asr

    dtype_map = {
        "bfloat16": torch.bfloat16,
        "float16": torch.float16,
        "float32": torch.float32,
    }
    dtype = dtype_map.get(args.dtype, torch.bfloat16)

    print(f"Loading ASR model from {args.asr_model_path}...")
    print(f"Device: {args.device}, Dtype: {args.dtype}")

    asr = Qwen3ASRModel.from_pretrained(
        args.asr_model_path,
        dtype=dtype,
        device_map=args.device,
    )
    print("Model loaded.")

    warmup_model(args.warmup_audio)

    print(f"Starting Flask server on {args.host}:{args.port}")
    app.run(host=args.host, port=args.port, debug=False, use_reloader=False, threaded=True)


if __name__ == "__main__":
    main()
