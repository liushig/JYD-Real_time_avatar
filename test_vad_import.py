import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

import importlib
import inspect
from chat_engine.common.handler_base import HandlerBase

# Test importing the VAD handler
module = importlib.import_module('handlers.vad.silerovad.vad_handler_silero')

print("Module members:")
for name, obj in inspect.getmembers(module):
    print(f"  {name}: {type(obj)}")

print("\nChecking for HandlerBase subclasses:")
for name, obj in inspect.getmembers(module):
    if inspect.isclass(obj) and issubclass(obj, HandlerBase):
        print(f"  Found: {name}")
