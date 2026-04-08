import os
from threading import Thread
from typing import Optional, Dict, cast

import torch
from loguru import logger
from pydantic import BaseModel, Field
from transformers import AutoTokenizer, AutoModelForCausalLM, TextIteratorStreamer

from chat_engine.common.handler_base import (
    HandlerBase,
    HandlerBaseInfo,
    HandlerDetail,
    HandlerDataInfo,
)
from chat_engine.contexts.handler_context import HandlerContext
from chat_engine.contexts.session_context import SessionContext
from chat_engine.data_models.chat_data.chat_data_model import ChatData
from chat_engine.data_models.chat_data_type import ChatDataType
from chat_engine.data_models.runtime_data.data_bundle import DataBundle, DataBundleDefinition
from chat_engine.data_models.chat_engine_config_data import HandlerBaseConfigModel


# =========================
# Config
# =========================
class Qwen3PlusConfig(HandlerBaseConfigModel, BaseModel):
    system_prompt: str = Field(
        default="你不是通义千问，也不是阿里云模型，你是一名由竞业达开发的数字老师。请用简洁中文回答问题。"
    )
    max_new_tokens: int = Field(default=512)
    temperature: float = Field(default=0.7)
    streaming: bool = Field(default=True)


# =========================
# Context
# =========================
class Qwen3PlusContext(HandlerContext):
    def __init__(self, session_id: str):
        super().__init__(session_id)
        self.config: Optional[Qwen3PlusConfig] = None
        self.messages = []


# =========================
# Handler
# =========================
class HandlerLLMQwen3PlusLocal(HandlerBase):
    def __init__(self):
        super().__init__()
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.model = None
        self.tokenizer = None

    # ---------- Handler info ----------
    def get_handler_info(self) -> HandlerBaseInfo:
        return HandlerBaseInfo(config_model=Qwen3PlusConfig)

    # ---------- load model ----------
    def load(self, engine_config, handler_config: Optional[BaseModel] = None):
        model_path = "/opt/jyd01/liushiguo/OpenAvatarChat_test/models/qwen3_plus"
        logger.info(f"[Qwen3Plus] Loading local model from: {model_path}")

        self.tokenizer = AutoTokenizer.from_pretrained(
            model_path,
            trust_remote_code=True,
            use_fast=False,
        )
        if self.tokenizer.pad_token is None:
            self.tokenizer.pad_token = self.tokenizer.eos_token

        self.model = AutoModelForCausalLM.from_pretrained(
            model_path,
            trust_remote_code=True,
            torch_dtype=torch.float16,
            device_map="auto",
        )
        self.model.eval()
        logger.info("[Qwen3Plus] Model loaded successfully")

    # ---------- create context ----------
    def create_context(
        self,
        session_context: SessionContext,
        handler_config: Optional[BaseModel] = None,
    ) -> HandlerContext:
        if not isinstance(handler_config, Qwen3PlusConfig):
            handler_config = Qwen3PlusConfig()

        ctx = Qwen3PlusContext(session_context.session_info.session_id)
        ctx.config = handler_config
        ctx.messages.append(
            {"role": "system", "content": handler_config.system_prompt}
        )
        return ctx

    def start_context(self, session_context, handler_context):
        pass

    # ---------- Handler IO ----------
    def get_handler_detail(
        self,
        session_context: SessionContext,
        context: HandlerContext,
    ) -> HandlerDetail:
        # 创建一个 DataBundleDefinition，定义一个字段并标记为主数据
        avatar_def = DataBundleDefinition({
            "text": {"type": "str", "description": "Avatar text response"}
        })
        avatar_def.set_main_field("text")  # 标记 "text" 为主数据字段

        return HandlerDetail(
            inputs={
                ChatDataType.HUMAN_TEXT: HandlerDataInfo(type=ChatDataType.HUMAN_TEXT)
            },
            outputs={
                ChatDataType.AVATAR_TEXT: HandlerDataInfo(
                    type=ChatDataType.AVATAR_TEXT,
                    definition=avatar_def,
                )
            },
        )

    # ---------- handle ----------
    def handle(
        self,
        context: HandlerContext,
        inputs: ChatData,
        output_definitions: Dict[ChatDataType, HandlerDataInfo],
    ):
        context = cast(Qwen3PlusContext, context)

        if inputs.type != ChatDataType.HUMAN_TEXT:
            return

        user_text = inputs.data.get_main_data()
        if not user_text:
            return

        context.messages.append({"role": "user", "content": user_text})

        # ---------------- encode ----------------
        inputs_enc = self.tokenizer.apply_chat_template(
            context.messages,
            tokenize=True,
            return_tensors="pt",
        )

        # 修复：兼容返回字典或张量的情况
        if isinstance(inputs_enc, dict):
            input_ids = inputs_enc["input_ids"]
            attention_mask = inputs_enc.get("attention_mask", torch.ones_like(input_ids))
        else:
            input_ids = inputs_enc
            attention_mask = torch.ones_like(input_ids)

        logger.debug(f"input_ids shape: {input_ids.shape}")

        # ⚠️ 保证二维 [1, seq_len]
        if input_ids.dim() == 1:
            input_ids = input_ids.unsqueeze(0)
        if attention_mask.dim() == 1:
            attention_mask = attention_mask.unsqueeze(0)

        input_ids = input_ids.to(self.device)
        attention_mask = attention_mask.to(self.device)

        avatar_def_info = output_definitions.get(ChatDataType.AVATAR_TEXT)
        if avatar_def_info is None or avatar_def_info.definition is None:
            logger.warning("AVATAR_TEXT definition is missing, skipping handle")
            return

        avatar_def = avatar_def_info.definition

        # ---------- 流式生成 ----------
        if context.config.streaming:
            streamer = TextIteratorStreamer(
                self.tokenizer, skip_special_tokens=True, timeout=5.0
            )

            def generate_thread():
                with torch.no_grad():
                    self.model.generate(
                        input_ids=input_ids,
                        attention_mask=attention_mask,
                        max_new_tokens=context.config.max_new_tokens,
                        temperature=context.config.temperature,
                        do_sample=True,
                        streamer=streamer,
                    )

            t = Thread(target=generate_thread)
            t.start()

            reply_buffer = ""
            for partial_text in streamer:
                reply_buffer += partial_text
                bundle = DataBundle(avatar_def)
                bundle.set_main_data(reply_buffer)
                context.submit_data(bundle)

            context.messages.append({"role": "assistant", "content": reply_buffer})

        # ---------- 非流式生成 ----------
        else:
            with torch.no_grad():
                output_ids = self.model.generate(
                    input_ids=input_ids,
                    attention_mask=attention_mask,
                    max_new_tokens=context.config.max_new_tokens,
                    temperature=context.config.temperature,
                    do_sample=True,
                )
            reply_ids = output_ids[:, input_ids.shape[-1]:]
            reply = self.tokenizer.decode(reply_ids[0], skip_special_tokens=True)
            context.messages.append({"role": "assistant", "content": reply})
            bundle = DataBundle(avatar_def)
            bundle.set_main_data(reply)
            context.submit_data(bundle)

    def destroy_context(self, context: HandlerContext):
        pass


# ---------- 模块顶层导出 Handler ----------
__all__ = ["HandlerLLMQwen3PlusLocal"]