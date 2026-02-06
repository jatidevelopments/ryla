#!/usr/bin/env python3
"""
Prompt Quality Testing Script

Tests different prompt structures and settings to find optimal configurations
for each endpoint type. Based on research from:
- Flux 2 Official Prompting Guide (Black Forest Labs)
- WAN 2.6 Developer Guide (fal.ai)
- InstantID documentation
- Z-Image workflow analysis

Usage:
    python prompt-quality-test.py
    python prompt-quality-test.py --endpoint /flux
    python prompt-quality-test.py --limit 5
    python prompt-quality-test.py --api-url https://end.ryla.ai
"""

import argparse
import base64
import json
import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any

import requests

# ============================================================================
# Configuration
# ============================================================================

DEFAULT_API_URL = "http://localhost:3001"
TIMEOUT_SECONDS = 300

# Reference image for face/i2v endpoints
REFERENCE_IMAGE_PATH = Path(__file__).parent.parent / "handlers" / "test-input" / "model-portrait-3.jpg"

# Test images directory (for output)
OUTPUT_BASE_DIR = Path(__file__).parent.parent / "test-output" / "prompt-tests"

# ============================================================================
# Prompt Templates - Based on Research
# ============================================================================

PROMPT_TEMPLATES = {
    # -----------------------------
    # Flux-optimized prompts (natural language, subject-first)
    # -----------------------------
    "flux_basic": {
        "name": "Flux Basic",
        "prompt": "Portrait of a young woman with natural makeup, soft studio lighting, photorealistic",
        "models": ["/flux", "/flux-dev"],
        "expected_quality": "baseline",
    },
    "flux_optimized": {
        "name": "Flux Optimized",
        "prompt": "Portrait of a young woman with natural makeup, soft studio lighting, professional photography, sharp details, neutral expression, cream background",
        "models": ["/flux", "/flux-dev"],
        "expected_quality": "high",
    },
    "flux_detailed": {
        "name": "Flux Detailed (Four-Pillar)",
        "prompt": "A professional woman in her early 30s, confidently smiling with natural makeup, photorealistic portrait style with soft studio lighting, cream studio background with subtle shadows, shot on 85mm lens at f/2.8 with natural skin texture",
        "models": ["/flux", "/flux-dev"],
        "expected_quality": "excellent",
    },
    "flux_no_quality_tags": {
        "name": "Flux Without Quality Tags",
        "prompt": "Portrait of a young woman with natural makeup, soft studio lighting, professional photography, sharp details",
        "models": ["/flux", "/flux-dev"],
        "expected_quality": "high",
    },
    "flux_with_quality_tags": {
        "name": "Flux With Quality Tags (Should NOT Help)",
        "prompt": "Portrait of a young woman, 8k masterpiece, best quality, ultra detailed, soft lighting",
        "models": ["/flux", "/flux-dev"],
        "expected_quality": "baseline",  # Quality tags hurt Flux
    },
    
    # -----------------------------
    # Qwen-optimized prompts
    # -----------------------------
    "qwen_basic": {
        "name": "Qwen Basic",
        "prompt": "Portrait of a young woman, soft studio lighting, photorealistic",
        "models": ["/qwen-image-2512", "/qwen-image-2512-fast"],
        "expected_quality": "baseline",
    },
    "qwen_optimized": {
        "name": "Qwen Optimized",
        "prompt": "Portrait of a young professional woman with natural makeup, soft studio lighting, professional photography, 8k resolution, sharp fine details, bokeh background",
        "models": ["/qwen-image-2512", "/qwen-image-2512-fast"],
        "expected_quality": "high",
    },
    "qwen_detailed": {
        "name": "Qwen Detailed",
        "prompt": "Portrait of a young professional woman in her late 20s, natural makeup with subtle highlights, soft key lighting with fill light, professional fashion photography style, 8k resolution, ultra sharp fine details, shallow depth of field with creamy bokeh background, natural skin texture, photorealistic quality",
        "models": ["/qwen-image-2512", "/qwen-image-2512-fast"],
        "expected_quality": "excellent",
    },
    
    # -----------------------------
    # Z-Image prompts (from workflow analysis)
    # -----------------------------
    "zimage_basic": {
        "name": "Z-Image Basic",
        "prompt": "Portrait of a young woman, natural lighting, photorealistic",
        "models": ["/z-image-simple", "/z-image-danrisi"],
        "expected_quality": "baseline",
    },
    "zimage_creative": {
        "name": "Z-Image Creative",
        "prompt": "Portrait of a young woman with soft natural lighting, atmospheric, stylized, surreal quality, detailed textures, ultra quality, masterpiece",
        "models": ["/z-image-simple", "/z-image-danrisi"],
        "expected_quality": "high",
    },
    "zimage_workflow_style": {
        "name": "Z-Image Workflow Style",
        "prompt": "Portrait of a young woman, close-up shot, soft natural lighting, atmospheric warm tones, highly detailed textures, ultra quality, best quality, masterpiece, professional photography",
        "models": ["/z-image-simple", "/z-image-danrisi"],
        "expected_quality": "excellent",
    },
    
    # -----------------------------
    # WAN Video prompts
    # -----------------------------
    "wan_basic": {
        "name": "WAN Basic Motion",
        "prompt": "The woman slowly turns her head",
        "models": ["/wan2.6-i2v", "/wan22-i2v"],
        "expected_quality": "baseline",
    },
    "wan_detailed_motion": {
        "name": "WAN Detailed Motion",
        "prompt": "The woman slowly turns her head to the right, hair gently moving with the motion, soft natural smile forming on her face, eyes following the camera smoothly",
        "models": ["/wan2.6-i2v", "/wan22-i2v"],
        "expected_quality": "high",
    },
    "wan_cinematic": {
        "name": "WAN Cinematic",
        "prompt": "Cinematic portrait shot. The woman slowly turns her head with elegant grace, hair flowing gently, subtle smile forming, eyes expressing confidence. Soft studio lighting, professional film quality, smooth natural motion",
        "models": ["/wan2.6-i2v", "/wan22-i2v"],
        "expected_quality": "excellent",
    },
    
    # -----------------------------
    # InstantID prompts
    # -----------------------------
    "instantid_basic": {
        "name": "InstantID Basic",
        "prompt": "professional portrait",
        "models": ["/instantid"],
        "expected_quality": "baseline",
    },
    "instantid_styled": {
        "name": "InstantID Styled",
        "prompt": "professional portrait, soft studio lighting, neutral background, sharp details",
        "models": ["/instantid"],
        "expected_quality": "high",
    },
    "instantid_workflow_style": {
        "name": "InstantID Workflow Style",
        "prompt": "comic character, graphic illustration, comic art, graphic novel art, vibrant, highly detailed",
        "models": ["/instantid"],
        "expected_quality": "high",
    },
}

# Parameter variations to test
PARAMETER_VARIATIONS = {
    "flux": {
        "default": {"steps": 28, "cfg": 3.5, "sampler": "euler", "scheduler": "simple"},
        "draft": {"steps": 20, "cfg": 3.5, "sampler": "euler", "scheduler": "simple"},
        "production": {"steps": 35, "cfg": 3.8, "sampler": "euler", "scheduler": "simple"},
    },
    "qwen": {
        "default": {"steps": 28, "cfg": 4.0},
        "quality": {"steps": 35, "cfg": 5.0},
        "text_focus": {"steps": 40, "cfg": 6.0},  # For text rendering
    },
    "zimage": {
        "default": {"steps": 25, "cfg": 4},
        "quality": {"steps": 40, "cfg": 3},
        "detailed": {"steps": 50, "cfg": 5},
    },
    "instantid": {
        "default": {"steps": 30, "cfg": 4.5, "sampler": "ddpm", "scheduler": "karras"},
        "quality": {"steps": 40, "cfg": 5.0, "sampler": "ddpm", "scheduler": "karras"},
    },
}

# Seeds to test for each prompt
TEST_SEEDS = [12345, 42, 1374878599]

# ============================================================================
# Data Classes
# ============================================================================

@dataclass
class TestResult:
    prompt_key: str
    prompt_name: str
    endpoint: str
    seed: int
    parameters: dict
    success: bool
    output_path: str = ""
    file_size_kb: float = 0
    sharpness: float = 0
    brightness: float = 0
    contrast: float = 0
    quality_score: float = 0
    error: str = ""
    generation_time_ms: int = 0

# ============================================================================
# Helper Functions
# ============================================================================

def load_image_as_base64(path: Path) -> str:
    """Load image and return as data URL."""
    with open(path, "rb") as f:
        data = base64.b64encode(f.read()).decode("utf-8")
    ext = path.suffix.lower()
    mime = {"jpg": "jpeg", "jpeg": "jpeg", "png": "png", "webp": "webp"}.get(ext.lstrip("."), "jpeg")
    return f"data:image/{mime};base64,{data}"


def calculate_image_quality(filepath: Path) -> dict:
    """Calculate quality metrics for an image."""
    try:
        import cv2
        import numpy as np
        
        img = cv2.imread(str(filepath))
        if img is None:
            return {"error": "Could not read image"}
        
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Sharpness (Laplacian variance)
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        sharpness = laplacian.var()
        
        # Brightness
        brightness = np.mean(gray)
        
        # Contrast
        contrast = np.std(gray)
        
        # Quality score (weighted combination)
        size_kb = filepath.stat().st_size / 1024
        size_score = min(100, (size_kb / 500) * 100)  # 500KB = 100%
        sharpness_score = min(100, (sharpness / 200) * 100)  # 200 = 100%
        
        quality_score = (
            sharpness_score * 0.5 +
            size_score * 0.3 +
            min(100, contrast) * 0.2
        )
        
        return {
            "sharpness": round(sharpness, 2),
            "brightness": round(brightness, 2),
            "contrast": round(contrast, 2),
            "quality_score": round(quality_score, 1),
            "file_size_kb": round(size_kb, 1),
        }
    except ImportError:
        return {"error": "OpenCV not installed"}
    except Exception as e:
        return {"error": str(e)}


def build_body(
    endpoint: str,
    prompt: str,
    seed: int,
    ref_image: str = "",
    parameters: dict = None,
) -> dict:
    """Build request body for endpoint."""
    params = parameters or {}
    
    base = {
        "prompt": prompt,
        "seed": seed,
        "width": params.get("width", 1024),
        "height": params.get("height", 1024),
    }
    
    # Add model-specific parameters
    # CRITICAL: Use 'steps' and 'cfg' - NOT 'num_inference_steps' or 'guidance_scale'
    # The Modal handlers use these exact names; wrong names = default values (4 steps!)
    if "/flux" in endpoint:
        base["steps"] = params.get("steps", 28)
        base["cfg"] = params.get("cfg", 3.5)
    elif "/qwen" in endpoint:
        base["steps"] = params.get("steps", 28)
        base["cfg"] = params.get("cfg", 4.0)
    elif "/z-image" in endpoint:
        base["steps"] = params.get("steps", 25)
        base["cfg"] = params.get("cfg", 4)
    elif "/instantid" in endpoint:
        base["face_image"] = ref_image
        base["steps"] = params.get("steps", 30)
        base["cfg"] = params.get("cfg", 4.5)
    elif "/wan" in endpoint:
        base["image"] = ref_image
        base["frames"] = 49
    
    return base


def call_endpoint(
    api_url: str,
    endpoint: str,
    body: dict,
) -> tuple[bool, bytes | None, str]:
    """Call the Modal endpoint via RYLA API."""
    url = f"{api_url}/playground/modal/call"
    payload = {"endpoint": endpoint, "body": body}
    
    try:
        resp = requests.post(url, json=payload, timeout=TIMEOUT_SECONDS)
        
        if resp.status_code != 200 and resp.status_code != 201:
            return False, None, f"{resp.status_code}: {resp.text[:200]}"
        
        data = resp.json()
        
        # Extract output
        if "output" in data:
            output = data["output"]
            
            # Handle different output formats
            if isinstance(output, dict):
                if "image" in output:
                    return True, base64.b64decode(output["image"].split(",")[-1]), ""
                elif "video" in output:
                    return True, base64.b64decode(output["video"].split(",")[-1]), ""
                elif "images" in output and output["images"]:
                    return True, base64.b64decode(output["images"][0].split(",")[-1]), ""
            elif isinstance(output, str) and output.startswith("data:"):
                return True, base64.b64decode(output.split(",")[-1]), ""
        
        return False, None, f"Unexpected response format: {str(data)[:200]}"
        
    except requests.exceptions.Timeout:
        return False, None, f"Timeout after {TIMEOUT_SECONDS}s"
    except Exception as e:
        return False, None, str(e)


def run_test(
    api_url: str,
    prompt_key: str,
    template: dict,
    endpoint: str,
    seed: int,
    parameters: dict,
    output_dir: Path,
    ref_image: str = "",
) -> TestResult:
    """Run a single prompt test."""
    prompt = template["prompt"]
    
    # Build body
    body = build_body(endpoint, prompt, seed, ref_image, parameters)
    
    # Call API
    start_time = time.time()
    success, data, error = call_endpoint(api_url, endpoint, body)
    elapsed_ms = int((time.time() - start_time) * 1000)
    
    if not success:
        return TestResult(
            prompt_key=prompt_key,
            prompt_name=template["name"],
            endpoint=endpoint,
            seed=seed,
            parameters=parameters,
            success=False,
            error=error,
            generation_time_ms=elapsed_ms,
        )
    
    # Save output
    endpoint_name = endpoint.strip("/").replace("/", "-")
    param_suffix = "_".join(f"{k}{v}" for k, v in parameters.items() if k in ["steps", "cfg"])
    filename = f"{prompt_key}_{endpoint_name}_seed{seed}_{param_suffix}"
    
    # Determine extension
    is_video = "/wan" in endpoint
    ext = ".mp4" if is_video else ".png"
    output_path = output_dir / f"{filename}{ext}"
    
    with open(output_path, "wb") as f:
        f.write(data)
    
    # Calculate quality metrics (for images only)
    quality_metrics = {}
    if not is_video:
        quality_metrics = calculate_image_quality(output_path)
    
    return TestResult(
        prompt_key=prompt_key,
        prompt_name=template["name"],
        endpoint=endpoint,
        seed=seed,
        parameters=parameters,
        success=True,
        output_path=str(output_path),
        file_size_kb=quality_metrics.get("file_size_kb", len(data) / 1024),
        sharpness=quality_metrics.get("sharpness", 0),
        brightness=quality_metrics.get("brightness", 0),
        contrast=quality_metrics.get("contrast", 0),
        quality_score=quality_metrics.get("quality_score", 0),
        generation_time_ms=elapsed_ms,
    )


# ============================================================================
# Main
# ============================================================================

def main():
    parser = argparse.ArgumentParser(description="Prompt Quality Testing")
    parser.add_argument("--api-url", default=DEFAULT_API_URL)
    parser.add_argument("--endpoint", help="Test specific endpoint only")
    parser.add_argument("--prompt", help="Test specific prompt template only")
    parser.add_argument("--limit", type=int, help="Limit number of tests")
    parser.add_argument("--parallel", type=int, default=2, help="Parallel tests")
    parser.add_argument("--seeds", help="Comma-separated seeds to test")
    args = parser.parse_args()
    
    # Create output directory
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_dir = OUTPUT_BASE_DIR / timestamp
    output_dir.mkdir(parents=True, exist_ok=True)
    
    print(f"Prompt Quality Testing")
    print(f"=" * 60)
    print(f"API URL: {args.api_url}")
    print(f"Output: {output_dir}")
    print(f"Parallel: {args.parallel}")
    
    # Load reference image
    ref_image = ""
    if REFERENCE_IMAGE_PATH.exists():
        ref_image = load_image_as_base64(REFERENCE_IMAGE_PATH)
        print(f"Reference image: {REFERENCE_IMAGE_PATH}")
    else:
        print(f"Warning: Reference image not found at {REFERENCE_IMAGE_PATH}")
    
    # Build test matrix
    tests = []
    seeds = [int(s) for s in args.seeds.split(",")] if args.seeds else TEST_SEEDS
    
    for prompt_key, template in PROMPT_TEMPLATES.items():
        if args.prompt and prompt_key != args.prompt:
            continue
        
        for endpoint in template["models"]:
            if args.endpoint and endpoint != args.endpoint:
                continue
            
            # Get parameter set for this model type
            model_type = "flux" if "flux" in endpoint else \
                        "qwen" if "qwen" in endpoint else \
                        "zimage" if "z-image" in endpoint else \
                        "instantid" if "instantid" in endpoint else \
                        "wan"
            
            param_sets = PARAMETER_VARIATIONS.get(model_type, {})
            
            # Use default parameters only (for faster testing)
            params = param_sets.get("default", {})
            
            for seed in seeds:
                tests.append((prompt_key, template, endpoint, seed, params))
    
    if args.limit:
        tests = tests[:args.limit]
    
    print(f"Tests to run: {len(tests)}")
    print()
    
    # Run tests
    results: list[TestResult] = []
    
    with ThreadPoolExecutor(max_workers=args.parallel) as executor:
        futures = {}
        
        for prompt_key, template, endpoint, seed, params in tests:
            future = executor.submit(
                run_test,
                args.api_url,
                prompt_key,
                template,
                endpoint,
                seed,
                params,
                output_dir,
                ref_image,
            )
            futures[future] = (prompt_key, endpoint, seed)
        
        for i, future in enumerate(as_completed(futures), 1):
            prompt_key, endpoint, seed = futures[future]
            try:
                result = future.result()
                results.append(result)
                
                status = "✓" if result.success else "✗"
                quality = f"Q:{result.quality_score:.0f} S:{result.sharpness:.0f}" if result.success else result.error[:30]
                print(f"[{i}/{len(tests)}] {status} {endpoint} | {prompt_key} | seed={seed} | {quality}")
                
            except Exception as e:
                print(f"[{i}/{len(tests)}] ✗ {endpoint} | {prompt_key} | Error: {e}")
    
    # Generate report
    print()
    print("=" * 60)
    print("RESULTS SUMMARY")
    print("=" * 60)
    
    # Group by prompt template
    by_prompt = {}
    for r in results:
        if r.prompt_key not in by_prompt:
            by_prompt[r.prompt_key] = []
        by_prompt[r.prompt_key].append(r)
    
    for prompt_key, prompt_results in sorted(by_prompt.items()):
        successful = [r for r in prompt_results if r.success]
        if not successful:
            print(f"\n{prompt_key}: All failed")
            continue
        
        avg_quality = sum(r.quality_score for r in successful) / len(successful)
        avg_sharpness = sum(r.sharpness for r in successful) / len(successful)
        
        template = PROMPT_TEMPLATES[prompt_key]
        print(f"\n{prompt_key} ({template['name']})")
        print(f"  Expected: {template['expected_quality']}")
        print(f"  Results: {len(successful)}/{len(prompt_results)} success")
        print(f"  Avg Quality: {avg_quality:.1f}")
        print(f"  Avg Sharpness: {avg_sharpness:.1f}")
        
        # Best seed for this prompt
        best = max(successful, key=lambda r: r.quality_score)
        print(f"  Best: seed={best.seed} Q={best.quality_score:.1f} S={best.sharpness:.1f}")
    
    # Save full results
    results_file = output_dir / "results.json"
    results_data = [
        {
            "prompt_key": r.prompt_key,
            "prompt_name": r.prompt_name,
            "prompt": PROMPT_TEMPLATES[r.prompt_key]["prompt"],
            "endpoint": r.endpoint,
            "seed": r.seed,
            "parameters": r.parameters,
            "success": r.success,
            "output_path": r.output_path,
            "file_size_kb": r.file_size_kb,
            "sharpness": r.sharpness,
            "brightness": r.brightness,
            "contrast": r.contrast,
            "quality_score": r.quality_score,
            "error": r.error,
            "generation_time_ms": r.generation_time_ms,
        }
        for r in results
    ]
    
    with open(results_file, "w") as f:
        json.dump(results_data, f, indent=2)
    
    print(f"\nResults saved to: {results_file}")
    print(f"Outputs saved to: {output_dir}")


if __name__ == "__main__":
    main()
