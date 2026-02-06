#!/usr/bin/env python3
"""
Test Modal endpoints via RYLA API (playground/modal/call) in parallel.

Uses the same endpoint list and body shapes as the modal-playground app.
Auto-resolves by generating a ref image with /flux and reusing it for
endpoints that require reference_image or input image. Retries on timeout/5xx.

Usage:
  # API at localhost (default)
  python apps/modal/scripts/test-endpoints-via-ryla-api.py

  # Custom API URL
  RYLA_API_URL=https://end.ryla.ai python apps/modal/scripts/test-endpoints-via-ryla-api.py

  # Save JSON report
  python apps/modal/scripts/test-endpoints-via-ryla-api.py --output report.json

  # Limit concurrency
  python apps/modal/scripts/test-endpoints-via-ryla-api.py --parallel 4
"""

import argparse
import base64
import json
import os
import random
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass, field
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import requests

# -----------------------------------------------------------------------------
# Config (mirror apps/modal-playground/lib/constants.ts + body-builder.ts)
# -----------------------------------------------------------------------------

RYLA_API_URL = os.environ.get("RYLA_API_URL", "http://localhost:3001")
PLAYGROUND_CALL_PATH = "/playground/modal/call"
DEFAULT_TIMEOUT = 600  # 10 min for long-running endpoints
RETRY_TIMEOUT = 120
OUTPUT_DIR = Path(__file__).parent.parent / "test-output" / "ryla-api"

# Pre-installed LoRAs available in Modal apps (for testing LoRA endpoints)
# These are already downloaded in the Modal image builds
DEFAULT_LORAS = {
    "/flux-dev-lora": "flux-realism-lora",  # Pre-installed in ryla-flux
    "/z-image-lora": "realistic-snapshot-zit",  # Pre-installed in ryla-z-image
    "/qwen-image-2512-lora": None,  # No pre-installed LoRA
    "/wan2.6-lora": None,  # No pre-installed LoRA
}

# Optimal seeds per endpoint (from multi-seed quality testing)
# Different models produce better results with different seeds
OPTIMAL_SEEDS = {
    "/flux": 12345,              # Q:95, S:221 - sharp, high quality
    "/flux-dev": 12345,          # Likely similar to /flux
    "/qwen-image-2512": 1374878599,  # Q:100, S:550 - excellent sharpness
    "/qwen-image-2512-fast": 1374878599,
    "/z-image-simple": 12345,    # Default good seed
    "/z-image-danrisi": 12345,
    "/wan2.6": 42,               # Classic seed for video
    "/wan2.6-i2v": 42,
    "/wan22-i2v": 42,
    # Default for others
    "_default": 12345,
}

# Model-specific prompts based on research and empirical testing
# See docs/research/infrastructure/PROMPT-ENGINEERING-GUIDE.md
OPTIMAL_PROMPTS = {
    # Flux: Natural language, subject-first. Include "sharp details" explicitly.
    # IMPORTANT: Flux does NOT benefit from quality tags like "8k masterpiece" 
    # But "sharp details" keyword was shown to dramatically improve sharpness in testing
    # CFG: 3.5-4.0, Steps: 28-35, Sampler: euler, Scheduler: simple
    "flux": (
        "Portrait of a young woman with natural makeup, soft studio lighting, "
        "professional photography, sharp details, neutral expression"
    ),
    
    # Qwen: More detailed prompts work well, 8k actually helps here
    # CFG: 4.0-7.0, Steps: 28-50
    "qwen": (
        "Portrait of a young professional woman with natural makeup, "
        "soft studio lighting, professional fashion photography, 8k resolution, "
        "ultra sharp fine details, bokeh background, photorealistic quality"
    ),
    
    # Z-Image: Uses quality keywords, atmospheric style works
    # CFG: 3-5, Steps: 25-50
    "zimage": (
        "Portrait of a young woman, close-up shot, soft natural lighting, "
        "atmospheric warm tones, highly detailed textures, ultra quality, best quality, "
        "masterpiece, professional photography, sharp details"
    ),
    
    # WAN Video T2V: Focus on motion/action, not static description
    "wan_t2v": (
        "Cinematic portrait shot. A professional woman slowly turns her head, "
        "hair flowing gently, subtle smile forming. Soft studio lighting, "
        "professional film quality, smooth natural motion"
    ),
    
    # WAN I2V: Describe the motion to apply to the input image
    "wan_i2v": (
        "The woman slowly turns her head to the right, hair gently moving, "
        "soft natural smile forming, eyes following the camera smoothly"
    ),
    
    # InstantID: Style prompts transform the face
    # CFG: 4.5, Steps: 30, Sampler: ddpm, Scheduler: karras
    "instantid": (
        "professional portrait, soft studio lighting, neutral background, "
        "sharp details, natural skin texture"
    ),
    
    # Default fallback (same as Flux - proven to work)
    "_default": (
        "Portrait of a young woman with natural makeup, soft studio lighting, "
        "professional photography, sharp details, neutral expression"
    ),
}


def get_optimal_prompt(endpoint_path: str) -> str:
    """Get the optimal prompt for an endpoint based on its model type."""
    path = endpoint_path.lower()
    
    if "/flux" in path:
        return OPTIMAL_PROMPTS["flux"]
    elif "/qwen" in path:
        return OPTIMAL_PROMPTS["qwen"]
    elif "/z-image" in path:
        return OPTIMAL_PROMPTS["zimage"]
    elif "/wan" in path and "-i2v" in path:
        return OPTIMAL_PROMPTS["wan_i2v"]
    elif "/wan" in path:
        return OPTIMAL_PROMPTS["wan_t2v"]
    elif "/instantid" in path or "/pulid" in path or "/faceid" in path:
        return OPTIMAL_PROMPTS["instantid"]
    else:
        return OPTIMAL_PROMPTS["_default"]

# Endpoint list aligned with modal-playground MODAL_ENDPOINTS
# Endpoint list aligned with modal-playground MODAL_ENDPOINTS
# Note: /sdxl-turbo, /sdxl-lightning are documented but NOT DEPLOYED (returns 404)
MODAL_ENDPOINTS = [
    # Text-to-image (all working)
    {"path": "/flux", "label": "Flux Schnell", "category": "Text-to-image"},
    {"path": "/flux-dev", "label": "Flux Dev", "category": "Text-to-image"},
    # NOTE: /sdxl-turbo and /sdxl-lightning are NOT DEPLOYED (404 Not Found)
    # {"path": "/sdxl-turbo", "label": "SDXL Turbo", "category": "Text-to-image"},
    # {"path": "/sdxl-lightning", "label": "SDXL Lightning", "category": "Text-to-image"},
    {"path": "/qwen-image-2512", "label": "Qwen Image 2512", "category": "Text-to-image"},
    {"path": "/qwen-image-2512-fast", "label": "Qwen Image 2512 Fast", "category": "Text-to-image"},
    {"path": "/z-image-simple", "label": "Z-Image Simple", "category": "Text-to-image"},
    {"path": "/z-image-danrisi", "label": "Z-Image Danrisi", "category": "Text-to-image"},
    # Face consistency (all working)
    {"path": "/sdxl-instantid", "label": "SDXL InstantID", "category": "Face", "needsRefImage": True},
    {"path": "/flux-pulid", "label": "Flux PuLID", "category": "Face", "needsRefImage": True},
    {"path": "/flux-ipadapter-faceid", "label": "Flux IP-Adapter FaceID", "category": "Face", "needsRefImage": True},
    # LoRA endpoints (require --lora-id to test)
    {"path": "/flux-dev-lora", "label": "Flux Dev LoRA", "category": "LoRA", "needsLora": True},
    {"path": "/qwen-image-2512-lora", "label": "Qwen Image 2512 LoRA", "category": "LoRA", "needsLora": True},
    {"path": "/z-image-lora", "label": "Z-Image LoRA", "category": "LoRA", "needsLora": True},
    # Video generation (all working)
    {"path": "/wan2.6", "label": "WAN 2.6 T2V", "category": "Video", "isVideo": True},
    {"path": "/wan2.6-lora", "label": "WAN 2.6 T2V LoRA", "category": "Video", "needsLora": True, "isVideo": True},
    # Video I2V (all working - WAN 2.6 I2V is best quality)
    {"path": "/wan2.6-i2v", "label": "WAN 2.6 I2V (Best)", "category": "Video I2V", "needsRefImage": True, "isVideo": True},
    {"path": "/wan2.6-i2v-faceswap", "label": "WAN 2.6 I2V + FaceSwap", "category": "Video I2V", "needsRefImage": True, "needsFaceImage": True, "isVideo": True},
    {"path": "/wan22-i2v", "label": "WAN 2.2 I2V (14B)", "category": "Video I2V", "needsRefImage": True, "isVideo": True},
    {"path": "/wan22-i2v-faceswap", "label": "WAN 2.2 I2V + FaceSwap", "category": "Video I2V", "needsRefImage": True, "needsFaceImage": True, "isVideo": True},
    # Face swap (all working)
    {"path": "/image-faceswap", "label": "Image Face Swap", "category": "Face Swap", "needsRefImage": True, "needsFaceImage": True},
    {"path": "/batch-video-faceswap", "label": "Batch Video Face Swap", "category": "Face Swap", "needsImage": True, "needsFaceImage": True},
    # Upscaling (working)
    {"path": "/seedvr2", "label": "SeedVR2 Upscale", "category": "Upscale", "needsImage": True, "isUpscale": True},
]


def get_optimal_seed(endpoint_path: str, fallback_seed: int) -> int:
    """Get optimal seed for endpoint, or use fallback."""
    return OPTIMAL_SEEDS.get(endpoint_path, OPTIMAL_SEEDS.get("_default", fallback_seed))


def build_body(
    endpoint: Dict[str, Any],
    prompt: str,
    seed: int,
    ref_image_data_url: Optional[str] = None,
    face_image_data_url: Optional[str] = None,
    lora_id: Optional[str] = None,
    input_image_data_url: Optional[str] = None,
    width: int = 1024,
    height: int = 1024,
    steps: int = 20,
    cfg: float = 5.0,
    use_optimal_seed: bool = True,
) -> Dict[str, Any]:
    """Build request body for endpoint (mirror of playground body-builder.ts).
    
    Uses parameters validated in chat testing (test-video-faceswap.py):
    - WAN 2.6 I2V: 832x480, length=33, steps=30, cfg=6.0, fps=16
    - WAN 2.6 I2V FaceSwap: same + face_image, restore_face
    - WAN 2.2 I2V: 832x480, num_frames=49, steps=40, cfg=5.0 (higher quality)
    - WAN 2.2 I2V FaceSwap: num_frames=33, steps=30 (faster for face swap)
    
    If use_optimal_seed=True, uses model-specific optimal seeds from testing.
    """
    path = endpoint.get("path", "")
    ref = ref_image_data_url or ""
    face = face_image_data_url or ref
    inp = input_image_data_url or ""
    
    # Use optimal seed if enabled
    effective_seed = get_optimal_seed(path, seed) if use_optimal_seed else seed

    if endpoint.get("isUpscale") and path == "/seedvr2":
        return {"image": inp if input_image_data_url else "", "scale": 2}

    if path == "/image-faceswap":
        return {"source_image": ref, "reference_image": face, "restore_face": True, "face_restore_visibility": 1.0}

    if path == "/batch-video-faceswap":
        return {"source_video": inp, "reference_image": face, "fps": 16, "restore_face": True, "face_restore_visibility": 1.0}

    # WAN 2.6 I2V - Best quality (validated in chat testing)
    if path == "/wan2.6-i2v":
        return {
            "prompt": "A woman smiling and looking at the camera, gentle movement, professional portrait",
            "reference_image": ref,
            "width": 832, "height": 480, "length": 33, "fps": 16, "steps": 30, "cfg": 6.0, "seed": effective_seed
        }

    # WAN 2.6 I2V FaceSwap - Uses Qwen batch-video-faceswap
    if path == "/wan2.6-i2v-faceswap":
        return {
            "prompt": "A woman smiling and looking at camera, natural movement",
            "reference_image": ref, "face_image": face,
            "width": 832, "height": 480, "length": 33, "fps": 16, "steps": 30, "cfg": 6.0,
            "restore_face": True, "seed": effective_seed
        }

    # WAN 2.2 I2V - 14B GGUF model, higher steps/frames for quality (validated in chat)
    if path == "/wan22-i2v":
        return {
            "prompt": "A woman smiling and nodding gently, soft natural movement, high quality, detailed",
            "source_image": ref,
            "width": 832, "height": 480, "num_frames": 49, "fps": 16, "steps": 40, "cfg": 5.0, "seed": effective_seed
        }

    # WAN 2.2 I2V FaceSwap - Faster settings for face swap (validated in chat)
    if path == "/wan22-i2v-faceswap":
        return {
            "prompt": "A woman talking and smiling at camera, professional video",
            "source_image": ref, "face_image": face,
            "width": 832, "height": 480, "num_frames": 33, "fps": 16, "steps": 30, "cfg": 5.0,
            "restore_face": True, "seed": effective_seed
        }

    base = {"prompt": prompt, "width": width, "height": height, "steps": steps, "cfg": cfg, "seed": effective_seed}
    if endpoint.get("needsRefImage") and ref:
        base["reference_image"] = ref
    if endpoint.get("needsLora") and lora_id:
        base["lora_id"] = lora_id
        base["lora_strength"] = 0.8
    # WAN 2.6 T2V - validated parameters
    if endpoint.get("isVideo") and "i2v" not in path:
        base.update({"width": 832, "height": 480, "length": 33, "fps": 16, "steps": 30, "cfg": 6.0})
    return base


# -----------------------------------------------------------------------------
# RYLA API client
# -----------------------------------------------------------------------------


def call_playground_modal(api_base: str, endpoint: str, body: Dict[str, Any], timeout: int = DEFAULT_TIMEOUT) -> Tuple[Optional[Dict], Optional[str], float]:
    """
    POST to RYLA API playground/modal/call. Returns (response_dict, error_message, elapsed_sec).
    """
    url = f"{api_base.rstrip('/')}{PLAYGROUND_CALL_PATH}"
    payload = {"endpoint": endpoint if endpoint.startswith("/") else f"/{endpoint}", "body": body}
    start = datetime.now()
    try:
        r = requests.post(url, json=payload, timeout=timeout, headers={"Content-Type": "application/json"})
        elapsed = (datetime.now() - start).total_seconds()
        data = r.json() if r.headers.get("content-type", "").startswith("application/json") else {}
        if not r.ok:
            err = data.get("error") or data.get("message") or r.text or f"HTTP {r.status_code}"
            return None, err, elapsed
        if data.get("error"):
            return data, data["error"], elapsed
        return data, None, elapsed
    except requests.exceptions.Timeout:
        elapsed = (datetime.now() - start).total_seconds()
        return None, "Request timeout", elapsed
    except requests.exceptions.RequestException as e:
        elapsed = (datetime.now() - start).total_seconds()
        return None, str(e), elapsed
    except Exception as e:
        elapsed = (datetime.now() - start).total_seconds()
        return None, str(e), elapsed


def generate_ref_image(api_base: str, timeout: int = 300) -> Optional[str]:
    """Generate one image via /flux and return as data URL for use as ref/input."""
    body = {
        "prompt": "Portrait of a person, soft lighting, photorealistic, 8k",
        "width": 1024,
        "height": 1024,
        "steps": 20,
        "cfg": 5.0,
        "seed": random.randint(0, 2**31 - 1),
    }
    data, err, _ = call_playground_modal(api_base, "/flux-dev", body, timeout=timeout)
    if err or not data:
        return None
    b64 = data.get("imageBase64")
    ct = data.get("contentType") or "image/png"
    if not b64:
        return None
    return f"data:{ct};base64,{b64}"


# -----------------------------------------------------------------------------
# Test runner and result
# -----------------------------------------------------------------------------


@dataclass
class TestResult:
    endpoint: str
    label: str
    category: str
    ok: bool
    error: Optional[str] = None
    elapsed_sec: float = 0.0
    cost_usd: Optional[float] = None
    skip_reason: Optional[str] = None  # e.g. "needs_lora", "no_ref_image"
    retried: bool = False
    output_file: Optional[str] = None  # Path to saved output file


def save_output(data: Dict, endpoint_path: str, output_dir: Path) -> Optional[str]:
    """Save image/video output to file. Returns filepath or None."""
    b64 = data.get("imageBase64")
    if not b64:
        return None
    
    content_type = data.get("contentType", "image/png")
    # Determine extension from content type
    ext_map = {
        "image/png": "png",
        "image/jpeg": "jpg",
        "image/webp": "webp",
        "video/mp4": "mp4",
        "video/webm": "webm",
    }
    ext = ext_map.get(content_type, "png")
    
    # Create filename from endpoint
    safe_name = endpoint_path.replace("/", "_").strip("_")
    timestamp = datetime.now().strftime("%H%M%S")
    filename = f"{safe_name}_{timestamp}.{ext}"
    
    output_dir.mkdir(parents=True, exist_ok=True)
    filepath = output_dir / filename
    
    try:
        img_bytes = base64.b64decode(b64)
        filepath.write_bytes(img_bytes)
        return str(filepath)
    except Exception as e:
        print(f"  Warning: Failed to save output for {endpoint_path}: {e}")
        return None


def run_one(
    api_base: str,
    endpoint: Dict[str, Any],
    prompt: str,
    seed: int,
    ref_image: Optional[str],
    input_image: Optional[str],
    lora_id: Optional[str],
    timeout: int,
    retry_on_fail: bool,
    save_outputs: bool = True,
    output_dir: Path = OUTPUT_DIR,
    use_optimal_seed: bool = True,
    use_optimal_prompt: bool = True,
) -> TestResult:
    path = endpoint["path"]
    label = endpoint.get("label", path)
    category = endpoint.get("category", "")
    
    # Use model-specific optimal prompt if enabled
    effective_prompt = get_optimal_prompt(path) if use_optimal_prompt else prompt
    
    # Use default LoRA if available for this endpoint and no LoRA provided
    effective_lora = lora_id
    if not effective_lora and endpoint.get("needsLora"):
        effective_lora = DEFAULT_LORAS.get(path)

    # Build request body with effective LoRA (pre-installed or user-provided)
    body = build_body(
        endpoint,
        prompt=effective_prompt,
        seed=seed,
        ref_image_data_url=ref_image,
        face_image_data_url=ref_image,
        lora_id=effective_lora,
        input_image_data_url=input_image,
        use_optimal_seed=use_optimal_seed,
    )

    def do_call() -> Tuple[Optional[Dict], Optional[str], float]:
        return call_playground_modal(api_base, path, body, timeout=timeout)

    def make_result(ok: bool, data: Optional[Dict], err: Optional[str], elapsed: float, retried: bool = False, skip_reason: Optional[str] = None) -> TestResult:
        output_file = None
        if ok and save_outputs and data:
            output_file = save_output(data, path, output_dir)
        return TestResult(
            endpoint=path,
            label=label,
            category=category,
            ok=ok,
            error=err,
            elapsed_sec=elapsed,
            cost_usd=data.get("costUsd") if data else None,
            skip_reason=skip_reason,
            retried=retried,
            output_file=output_file,
        )

    data, err, elapsed = do_call()
    if data and not err:
        return make_result(True, data, None, elapsed)

    # Classify failure for auto-resolve
    err_lower = (err or "").lower()
    if "lora" in err_lower and ("required" in err_lower or "missing" in err_lower):
        return make_result(False, None, err, elapsed, skip_reason="needs_lora")
    if "reference_image" in err_lower and "required" in err_lower and not ref_image:
        return make_result(False, None, err, elapsed, skip_reason="needs_ref_image")
    if "timeout" in err_lower or (err and "408" in err):
        if retry_on_fail:
            data2, err2, elapsed2 = do_call()
            if data2 and not err2:
                return make_result(True, data2, None, elapsed + elapsed2, retried=True)
            return make_result(False, None, err2 or err, elapsed + elapsed2, retried=True)
    if err and ("500" in err or "502" in err or "503" in err) and retry_on_fail:
        data2, err2, elapsed2 = do_call()
        if data2 and not err2:
            return make_result(True, data2, None, elapsed + elapsed2, retried=True)
        return make_result(False, None, err2 or err, elapsed + elapsed2, retried=True)

    return make_result(False, None, err, elapsed)


# -----------------------------------------------------------------------------
# Main
# -----------------------------------------------------------------------------


def main() -> int:
    parser = argparse.ArgumentParser(description="Test Modal endpoints via RYLA API in parallel")
    parser.add_argument("--api-url", default=RYLA_API_URL, help="RYLA API base URL (default: RYLA_API_URL or http://localhost:3001)")
    parser.add_argument("--parallel", type=int, default=8, help="Max concurrent requests (default: 8)")
    parser.add_argument("--timeout", type=int, default=DEFAULT_TIMEOUT, help="Request timeout per call (seconds)")
    parser.add_argument("--no-retry", action="store_true", help="Disable retry on timeout/5xx")
    parser.add_argument("--skip-ref-generation", action="store_true", help="Skip generating ref image with /flux-dev (ref endpoints will fail)")
    parser.add_argument("--lora-id", metavar="ID", help="LoRA ID for LoRA endpoints (e.g. character-abc123). Uses pre-installed LoRAs by default for some endpoints.")
    parser.add_argument("--no-save", action="store_true", help="Don't save output images/videos to disk")
    parser.add_argument("--output-dir", metavar="DIR", default=str(OUTPUT_DIR), help=f"Directory to save outputs (default: {OUTPUT_DIR})")
    parser.add_argument("--output", "-o", metavar="FILE", help="Write JSON report to file")
    parser.add_argument("--filter", metavar="PATH", help="Only test endpoint path (e.g. /flux)")
    parser.add_argument("--no-optimal-seeds", action="store_true", help="Don't use model-specific optimal seeds (use random seed instead)")
    parser.add_argument("--no-optimal-prompts", action="store_true", help="Don't use model-specific optimal prompts (use generic prompt instead)")
    args = parser.parse_args()

    api_base = args.api_url.rstrip("/")
    output_dir = Path(args.output_dir)
    save_outputs = not args.no_save
    use_optimal_seeds = not args.no_optimal_seeds
    use_optimal_prompts = not args.no_optimal_prompts

    # Quick connectivity check
    try:
        r = requests.get(f"{api_base}/health", timeout=10)
        if r.status_code != 200:
            print(f"Warning: API health returned {r.status_code}", file=sys.stderr)
    except requests.exceptions.RequestException as e:
        print(f"Error: Cannot reach API at {api_base}: {e}", file=sys.stderr)
        print("  Start the API (e.g. pnpm nx serve api) or set RYLA_API_URL.", file=sys.stderr)
        return 1
    # Optimized prompt from multi-seed quality testing (produces sharper, higher-quality images)
    prompt = "Portrait of a young woman with natural makeup, soft studio lighting, professional photography, 8k, sharp details"
    seed = random.randint(0, 2**31 - 1)

    endpoints = MODAL_ENDPOINTS
    if args.filter:
        endpoints = [e for e in endpoints if e["path"] == args.filter or args.filter in e["path"]]
        if not endpoints:
            print(f"No endpoint matching filter: {args.filter}", file=sys.stderr)
            return 1

    print("RYLA API Modal endpoint tests (parallel)")
    print(f"  API: {api_base}")
    print(f"  Endpoints: {len(endpoints)}")
    print(f"  Parallel: {args.parallel}")
    print(f"  Retry on timeout/5xx: {not args.no_retry}")
    print(f"  Save outputs: {save_outputs}")
    print(f"  Use optimal seeds: {use_optimal_seeds}")
    print(f"  Use optimal prompts: {use_optimal_prompts}")
    if save_outputs:
        print(f"  Output dir: {output_dir}")
    print()

    # Create output directory with timestamp subfolder
    if save_outputs:
        run_timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        run_output_dir = output_dir / run_timestamp
        run_output_dir.mkdir(parents=True, exist_ok=True)
        print(f"Outputs will be saved to: {run_output_dir}")
    else:
        run_output_dir = output_dir

    ref_image: Optional[str] = None
    input_image: Optional[str] = None
    if not args.skip_ref_generation:
        print("Generating ref image via /flux-dev...")
        ref_image = generate_ref_image(api_base, timeout=args.timeout)
        input_image = ref_image
        if ref_image:
            print("  OK (using for ref/input where needed)")
            # Save the reference image too
            if save_outputs:
                ref_b64 = ref_image.split(",", 1)[1] if "," in ref_image else ref_image
                ref_path = run_output_dir / "reference_image.png"
                ref_path.write_bytes(base64.b64decode(ref_b64))
                print(f"  Saved reference image: {ref_path}")
        else:
            print("  Failed (ref/input endpoints may 400)")

    lora_id: Optional[str] = args.lora_id
    print(f"\nRunning {len(endpoints)} endpoint tests (seed={seed})...")
    print(f"LoRA IDs: user={lora_id or 'none'}, will use pre-installed for: {[k for k,v in DEFAULT_LORAS.items() if v]}")
    print()
    results: List[TestResult] = []
    with ThreadPoolExecutor(max_workers=args.parallel) as ex:
        futures = {
            ex.submit(
                run_one,
                api_base,
                ep,
                prompt,
                seed,
                ref_image,
                input_image,
                lora_id,
                args.timeout,
                not args.no_retry,
                save_outputs,
                run_output_dir,
                use_optimal_seeds,
                use_optimal_prompts,
            ): ep
            for ep in endpoints
        }
        for fut in as_completed(futures):
            ep = futures[fut]
            try:
                res = fut.result()
                results.append(res)
            except Exception as e:
                results.append(TestResult(ep["path"], ep.get("label", ep["path"]), ep.get("category", ""), False, error=str(e)))

    results.sort(key=lambda r: (r.category, r.endpoint))

    # Summary table
    ok_count = sum(1 for r in results if r.ok)
    fail_count = len(results) - ok_count
    saved_count = sum(1 for r in results if r.output_file)
    print()
    print("Results")
    print("-" * 100)
    for r in results:
        status = "OK" if r.ok else "FAIL"
        extra = ""
        if r.retried:
            extra = " (retried)"
        if r.skip_reason:
            extra = f" [{r.skip_reason}]"
        file_info = ""
        if r.output_file:
            file_info = f" -> {Path(r.output_file).name}"
        err_short = (r.error[:40] + "…") if r.error and len(r.error) > 40 else (r.error or "")
        print(f"  {status:4}  {r.endpoint:30}  {r.elapsed_sec:6.1f}s  {err_short}{extra}{file_info}")
    print("-" * 100)
    print(f"  OK: {ok_count}  FAIL: {fail_count}  Saved: {saved_count}")

    # Suggestions
    needs_lora = [r for r in results if not r.ok and r.skip_reason == "needs_lora"]
    needs_ref = [r for r in results if not r.ok and r.skip_reason == "needs_ref_image"]
    other_fail = [r for r in results if not r.ok and not r.skip_reason]
    if needs_lora:
        print("\nEndpoints that need a LoRA ID (provide --lora-id in future): " + ", ".join(r.endpoint for r in needs_lora))
    if needs_ref:
        print("\nEndpoints that need ref image (ref generation failed or was skipped): " + ", ".join(r.endpoint for r in needs_ref))
    if other_fail:
        print("\nOther failures (check API/Modal logs):")
        for r in other_fail[:10]:
            print(f"  {r.endpoint}: {r.error}")
        if len(other_fail) > 10:
            print(f"  ... and {len(other_fail) - 10} more")

    # Print output directory summary
    if save_outputs and saved_count > 0:
        print(f"\nOutputs saved to: {run_output_dir}")
        print(f"  Files: {saved_count} images/videos")
        # List saved files
        for r in results:
            if r.output_file:
                print(f"    - {Path(r.output_file).name}")

    if args.output:
        report = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "api_base": api_base,
            "seed": seed,
            "output_dir": str(run_output_dir) if save_outputs else None,
            "summary": {"ok": ok_count, "fail": fail_count, "saved": saved_count},
            "results": [
                {
                    "endpoint": r.endpoint,
                    "label": r.label,
                    "category": r.category,
                    "ok": r.ok,
                    "error": r.error,
                    "elapsed_sec": r.elapsed_sec,
                    "cost_usd": r.cost_usd,
                    "skip_reason": r.skip_reason,
                    "retried": r.retried,
                    "output_file": r.output_file,
                }
                for r in results
            ],
        }
        Path(args.output).parent.mkdir(parents=True, exist_ok=True)
        with open(args.output, "w") as f:
            json.dump(report, f, indent=2)
        print(f"\nReport written to {args.output}")

    return 0 if fail_count == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
