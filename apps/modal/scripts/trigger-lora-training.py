#!/usr/bin/env python3
"""
Trigger LoRA Training on Modal.com

This script is called by the Node.js backend to start LoRA training.
It returns JSON output that can be parsed by the backend.

Usage:
    python trigger-lora-training.py start \
        --character-id=abc123 \
        --trigger-word=mycharacter \
        --image-urls='["url1", "url2", "url3"]' \
        --config='{"max_train_steps": 500}'

    python trigger-lora-training.py status --call-id=fc-xxx

Output (JSON):
    {"status": "started", "job_id": "lora-abc123-xyz", "call_id": "fc-xxx"}
    {"status": "training", "call_id": "fc-xxx"}
    {"status": "completed", "result": {...}}
    {"status": "error", "error": "..."}
"""

import argparse
import json
import sys
import uuid


def start_training(args):
    """Start a new training job."""
    from modal import Function
    
    # Parse arguments
    character_id = args.character_id
    trigger_word = args.trigger_word
    image_urls = json.loads(args.image_urls)
    config = json.loads(args.config) if args.config else {}
    
    # Validate
    if len(image_urls) < 3:
        print(json.dumps({
            "status": "error",
            "error": "At least 3 images are required"
        }))
        sys.exit(1)
    
    # Generate job ID
    job_id = f"lora-{character_id}-{uuid.uuid4().hex[:8]}"
    
    try:
        # Get the training function
        train_fn = Function.from_name("ryla-lora-training", "train_lora")
        
        # Spawn training (non-blocking)
        call = train_fn.spawn(
            job_id=job_id,
            image_urls=image_urls,
            trigger_word=trigger_word,
            character_id=character_id,
            config=config,
        )
        
        print(json.dumps({
            "status": "started",
            "job_id": job_id,
            "call_id": call.object_id,
            "character_id": character_id,
            "trigger_word": trigger_word,
            "image_count": len(image_urls),
        }))
        
    except Exception as e:
        print(json.dumps({
            "status": "error",
            "error": str(e)
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


def main():
    parser = argparse.ArgumentParser(description="Trigger LoRA training on Modal.com")
    subparsers = parser.add_subparsers(dest="command", required=True)
    
    # Start command
    start_parser = subparsers.add_parser("start", help="Start a training job")
    start_parser.add_argument("--character-id", required=True, help="Character ID")
    start_parser.add_argument("--trigger-word", required=True, help="Trigger word for LoRA")
    start_parser.add_argument("--image-urls", required=True, help="JSON array of image URLs")
    start_parser.add_argument("--config", default="{}", help="JSON config object")
    
    # Status command
    status_parser = subparsers.add_parser("status", help="Check job status")
    status_parser.add_argument("--call-id", required=True, help="Modal call ID")
    
    args = parser.parse_args()
    
    if args.command == "start":
        start_training(args)
    elif args.command == "status":
        check_status(args)


if __name__ == "__main__":
    main()
