# src/api/__init__.py
from .vad_api import register_vad_api
from .asr_api import register_asr_api
from .tts_api import register_tts_api
from .llm_api import register_llm_api
from .avatar_api import register_avatar_api

# 导出所有注册函数，方便demo统一调用
__all__ = [
    "register_vad_api",
    "register_asr_api",
    "register_tts_api",
    "register_llm_api",
    "register_avatar_api"
]