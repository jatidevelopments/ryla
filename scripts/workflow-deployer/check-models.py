#!/usr/bin/env python3
"""
Check if ComfyUI can see models via object_info API
"""
import requests
import json

# ComfyUI runs on port 8000 inside the container
# We need to access it via Modal's internal network
# But we can't directly access it - we need to add a debug endpoint

# Actually, let's check the logs first to see what's happening
print("Checking Modal logs for model verification messages...")
print("Look for:")
print("  - '✅ Found qwen_3_4b.safetensors'")
print("  - '⚠️  Missing qwen_3_4b.safetensors'")
print("  - '✅ All required models verified'")
print("  - 'ComfyUI started'")
