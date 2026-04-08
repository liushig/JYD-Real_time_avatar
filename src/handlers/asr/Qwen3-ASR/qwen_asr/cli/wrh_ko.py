# coding=utf-8
"""
Korean-only Qwen3-ASR Gradio Demo
"""

# CUDA_VISIBLE_DEVICES=2 python3 -m qwen_asr.cli.wrh_ko --asr-checkpoint model/Qwen3-ASR-1.7B --port 7998

import argparse
import json
import os
from typing import Any, Dict, Optional, Tuple

import gradio as gr
import numpy as np
import torch
from qwen_asr import Qwen3ASRModel


# =========================
# 音频处理
# =========================

def normalize_audio(wav):
    x = np.asarray(wav)

    if np.issubdtype(x.dtype, np.integer):
        info = np.iinfo(x.dtype)
        x = x.astype(np.float32) / max(abs(info.min), info.max)

    elif np.issubdtype(x.dtype, np.floating):
        x = x.astype(np.float32)

    if x.ndim > 1:
        x = np.mean(x, axis=-1)

    return np.clip(x, -1.0, 1.0)


def parse_audio(audio: Any) -> Tuple[np.ndarray, int]:
    if audio is None:
        raise ValueError("Audio is required.")

    if isinstance(audio, dict):
        sr = int(audio["sampling_rate"])
        wav = normalize_audio(audio["data"])
        return wav, sr

    if isinstance(audio, tuple):
        sr, wav = audio
        wav = normalize_audio(wav)
        return wav, sr

    raise ValueError("Unsupported audio format.")


# =========================
# 参数解析
# =========================

def parse_args():
    parser = argparse.ArgumentParser("Korean-only Qwen3-ASR Demo")

    parser.add_argument("--asr-checkpoint", required=True)
    parser.add_argument("--backend", default="transformers", choices=["transformers", "vllm"])
    parser.add_argument("--backend-kwargs", default=None)

    parser.add_argument("--ip", default="0.0.0.0")
    parser.add_argument("--port", type=int, default=8000)

    parser.add_argument("--cuda-visible-devices", default="0")

    return parser.parse_args()


# =========================
# 主程序
# =========================

def main():

    args = parse_args()

    os.environ["CUDA_VISIBLE_DEVICES"] = args.cuda_visible_devices

    backend_kwargs: Dict = {}
    if args.backend_kwargs:
        backend_kwargs = json.loads(args.backend_kwargs)

    # 默认参数
    if args.backend == "transformers":
        backend_kwargs.setdefault("dtype", torch.bfloat16)
        backend_kwargs.setdefault("device_map", "cuda:0")
    else:
        backend_kwargs.setdefault("gpu_memory_utilization", 0.8)

    print("Loading model...")

    if args.backend == "transformers":
        asr = Qwen3ASRModel.from_pretrained(
            args.asr_checkpoint,
            **backend_kwargs,
        )
    else:
        asr = Qwen3ASRModel.LLM(
            model=args.asr_checkpoint,
            **backend_kwargs,
        )

    print("Model loaded.")

    # =========================
    # 构建界面
    # =========================

    with gr.Blocks(title="Korean ASR") as demo:

        gr.Markdown(
            """
            # 🇰🇷 Korean Speech Recognition
            This demo only supports **Korean language recognition**.
            """
        )

        with gr.Row():
            audio_input = gr.Audio(type="numpy", label="Upload Korean Audio")
            transcribe_btn = gr.Button("Transcribe", variant="primary")

        result_text = gr.Textbox(label="Recognized Text", lines=10)

        def run(audio):
            wav, sr = parse_audio(audio)

            results = asr.transcribe(
                audio=(wav, sr),
                language="Korean",   # 🔥 强制韩语
                return_time_stamps=False,
            )

            if not results:
                return ""

            return results[0].text

        transcribe_btn.click(
            run,
            inputs=[audio_input],
            outputs=[result_text],
        )

    demo.launch(server_name=args.ip, server_port=args.port)


if __name__ == "__main__":
    main()