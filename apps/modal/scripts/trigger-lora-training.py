#!/usr/bin/env python3
"""
Trigger LoRA Training on Modal.com

This script is called by the Node.js backend to start LoRA training.
It returns JSON output that can be parsed by the backend.

Supports multiple model types:
- flux: Flux LoRA for image generation (default)
- wan: Wan 2.6 LoRA for video generation
- wan-14b: Wan 2.6 14B LoRA for high-quality video
- qwen: Qwen-Image LoRA for image generation

Usage:
    # Flux LoRA (images)
    python trigger-lora-training.py start \
        --model-type=flux \
        --character-id=abc123 \
        --trigger-word=mycharacter \
        --media-urls='["url1", "url2", "url3"]' \
        --config='{"max_train_steps": 500}'

    # Wan LoRA (videos)
    python trigger-lora-training.py start \
        --model-type=wan \
        --character-id=abc123 \
        --trigger-word=mycharacter \
        --media-urls='["video1.mp4", "video2.mp4"]' \
        --config='{"max_train_steps": 500, "model_size": "1.3B"}'

    # Status check
    python trigger-lora-training.py status --call-id=fc-xxx

Output (JSON):
    {"status": "started", "job_id": "lora-abc123-xyz", "call_id": "fc-xxx", "model_type": "flux"}
    {"status": "training", "call_id": "fc-xxx"}
    {"status": "completed", "result": {...}}
    {"status": "error", "error": "..."}
"""

import argparse
import json
import sys
import uuid

# Model type to Modal app/function mapping
MODEL_CONFIG = {
    "flux": {
        "app_name": "ryla-lora-training",
        "function_name": "train_lora",
        "media_param": "image_urls",
        "min_media": 3,
        "media_type": "images",
    },
    "wan": {
        "app_name": "ryla-wan-lora-training",
        "function_name": "train_wan_lora",
        "media_param": "video_urls",
        "min_media": 3,
        "media_type": "videos",
    },
    "wan-14b": {
        "app_name": "ryla-wan-lora-training",
        "function_name": "train_wan_lora_14b",
        "media_param": "video_urls",
        "min_media": 3,
        "media_type": "videos",
    },
    "qwen": {
        "app_name": "ryla-qwen-lora-training",
        "function_name": "train_qwen_lora",
        "media_param": "image_urls",
        "min_media": 5,
        "media_type": "images",
    },
}


def start_training(args):
    """Start a new training job."""
    from modal import Function
    
    # Parse arguments
    model_type = args.model_type or "flux"
    character_id = args.character_id
    trigger_word = args.trigger_word
    media_urls = json.loads(args.media_urls)
    config = json.loads(args.config) if args.config else {}
    
    # Validate model type
    if model_type not in MODEL_CONFIG:
        print(json.dumps({
            "status": "error",
            "error": f"Invalid model_type: {model_type}. Valid options: {list(MODEL_CONFIG.keys())}"
        }))
        sys.exit(1)
    
    model_cfg = MODEL_CONFIG[model_type]
    
    # Validate media count
    if len(media_urls) < model_cfg["min_media"]:
        print(json.dumps({
            "status": "error",
            "error": f"At least {model_cfg['min_media']} {model_cfg['media_type']} are required for {model_type} training"
        }))
        sys.exit(1)
    
    # Generate job ID
    job_id = f"lora-{model_type}-{character_id}-{uuid.uuid4().hex[:8]}"
    
    try:
        # Get the training function for this model type
        train_fn = Function.from_name(model_cfg["app_name"], model_cfg["function_name"])
        
        # Build spawn kwargs based on model type
        spawn_kwargs = {
            "job_id": job_id,
            model_cfg["media_param"]: media_urls,
            "trigger_word": trigger_word,
            "character_id": character_id,
            "config": config,
        }
        
        # Spawn training (non-blocking)
        call = train_fn.spawn(**spawn_kwargs)
        
        print(json.dumps({
            "status": "started",
            "job_id": job_id,
            "call_id": call.object_id,
            "character_id": character_id,
            "trigger_word": trigger_word,
            "media_count": len(media_urls),
            "model_type": model_type,
        }))
        
    except Exception as e:
        print(json.dumps({
            "status": "error",
            "error": str(e),
            "model_type": model_type,
        }))
        sys.exit(1)


def check_status(args):
    """Check training job status."""
    from modal.functions import FunctionCall
    
    call_id = args.call_id
    
    try:
        fc = FunctionCall.from_id(call_id)
        
        try:
            # Try to get result (non-blocking)
            result = fc.get(timeout=0)
            print(json.dumps({
                "status": "completed",
                "result": result
            }))
        except TimeoutError:
            print(json.dumps({
                "status": "training",
                "call_id": call_id,
                "message": "Training in progress..."
            }))
            
    except Exception as e:
        print(json.dumps({
            "status": "error",
            "error": str(e)
        }))
        sys.exit(1)


def list_model_types(args):
    """List available model types and their requirements."""
    info = []
    for model_type, cfg in MODEL_CONFIG.items():
        info.append({
            "model_type": model_type,
            "app_name": cfg["app_name"],
            "function_name": cfg["function_name"],
            "media_type": cfg["media_type"],
            "min_media": cfg["min_media"],
        })
    print(json.dumps({"model_types": info}))


def main():
    parser = argparse.ArgumentParser(description="Trigger LoRA training on Modal.com")
    subparsers = parser.add_subparsers(dest="command", required=True)
    
    # Start command
    start_parser = subparsers.add_parser("start", help="Start a training job")
    start_parser.add_argument("--model-type", default="flux", 
                              choices=list(MODEL_CONFIG.keys()),
                              help="Model type: flux (images), wan (video), wan-14b (video HQ), qwen (images)")
    start_parser.add_argument("--character-id", required=True, help="Character ID")
    start_parser.add_argument("--trigger-word", required=True, help="Trigger word for LoRA")
    start_parser.add_argument("--media-urls", required=True, help="JSON array of media URLs (images or videos)")
    # Keep --image-urls for backward compatibility
    start_parser.add_argument("--image-urls", dest="media_urls_legacy", help="(deprecated) Use --media-urls instead")
    start_parser.add_argument("--config", default="{}", help="JSON config object")
    
    # Status command
    status_parser = subparsers.add_parser("status", help="Check job status")
    status_parser.add_argument("--call-id", required=True, help="Modal call ID")
    
    # List command
    subparsers.add_parser("list-models", help="List available model types")
    
    args = parser.parse_args()
    
    # Handle backward compatibility for --image-urls
    if args.command == "start" and hasattr(args, "media_urls_legacy") and args.media_urls_legacy:
        if not hasattr(args, "media_urls") or not args.media_urls:
            args.media_urls = args.media_urls_legacy
    
    if args.command == "start":
        start_training(args)
    elif args.command == "status":
        check_status(args)
    elif args.command == "list-models":
        list_model_types(args)


if __name__ == "__main__":
    main()
