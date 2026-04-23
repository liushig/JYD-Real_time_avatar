"""
MuseTalk Avatar Handler with LANCZOS4 interpolation
Uses LANCZOS4 for better upscaling quality without enhancement
"""
import os
import time
import pickle
from typing import Dict, Optional, cast
import numpy as np
from loguru import logger
import threading
import queue
import hashlib

from chat_engine.data_models.chat_data_type import ChatDataType, EngineChannelType
from chat_engine.common.handler_base import HandlerBase, HandlerBaseInfo, HandlerDataInfo, HandlerDetail, \
    ChatDataConsumeMode
from chat_engine.contexts.handler_context import HandlerContext
from chat_engine.contexts.session_context import SessionContext
from chat_engine.data_models.chat_data.chat_data_model import ChatData
from chat_engine.data_models.chat_engine_config_data import ChatEngineConfigModel
from chat_engine.data_models.runtime_data.data_bundle import DataBundleDefinition, DataBundleEntry, DataBundle, VariableSize
from handlers.avatar.liteavatar.model.audio_input import SpeechAudio
from handlers.avatar.liteavatar.liteavatar_worker import Tts2FaceEvent
from handlers.avatar.musetalk.avatar_musetalk_processor41 import AvatarMuseTalkProcessor
from handlers.avatar.musetalk.avatar_musetalk_algo_LANCZOS4 import MuseAvatarV15_LANCZOS4 as MuseAvatarV15
from handlers.avatar.musetalk.avatar_musetalk_config import AvatarMuseTalkConfig
from engine_utils.general_slicer import slice_data, SliceContext


# Import everything else from the original handler
import sys
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

# Import the original handler module to reuse all classes
from handlers.avatar.musetalk import avatar_handler_musetalk42

# Re-export all classes from original handler
AvatarMuseTalkContext = avatar_handler_musetalk42.AvatarMuseTalkContext
HandlerAvatarMusetalk = avatar_handler_musetalk42.HandlerAvatarMusetalk

logger.info("MuseTalk handler with LANCZOS4 interpolation loaded")
