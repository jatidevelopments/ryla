#!/usr/bin/env python3
"""
Quality test matrix for Modal reference-image and LoRA endpoints.

Runs structured tests on primary endpoints (reference_image or LoRA), records
success/duration, and outputs a JSON summary for CI or regression. Manual
quality scoring (face consistency, realism) should be filled in
MODAL-ENDPOINT-QUALITY-TEST-RESULTS.md.

Usage:
  python apps/modal/scripts/quality-test-matrix.py [--output results.json]
  REF_IMAGE_PATH=/path/to/face.jpg LORA_ID=character-123 python ...  # optional assets

Output: JSON with endpoint, success, duration_sec, error (if any), and timestamp.
"""

import argparse
import base64
import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import requests

# Same base URLs as test-all-endpoints-comprehensive.py (ENDPOINT-APP-MAPPING)
WORKSPACE = os.environ.get("MODAL_WORKSPACE", "ryla")
APPS = {
    "instantid": f"https://{WORKSPACE}--ryla-instantid-comfyui-fastapi-app.modal.run",
    "flux": f"https://{WORKSPACE}--ryla-flux-comfyui-fastapi-app.modal.run",
    "qwen-image": f"https://{WORKSPACE}--ryla-qwen-image-comfyui-fastapi-app.modal.run",
    "qwen-edit": f"https://{WORKSPACE}--ryla-qwen-edit-comfyui-fastapi-app.modal.run",
    "wan26": f"https://{WORKSPACE}--ryla-wan26-comfyui-fastapi-app.modal.run",
    "z-image": f"https://{WORKSPACE}--ryla-z-image-comfyui-fastapi-app.modal.run",
    "seedvr2": f"https://{WORKSPACE}--ryla-seedvr2-comfyui-fastapi-app.modal.run",
}

TIMEOUT_REF = 420   # 7 min for face/edit
TIMEOUT_VIDEO = 600  # 10 min for video/upscale
TIMEOUT_LORA = 600  # 10 min for LoRA

# Reference-image endpoints: (app, path, payload_builder_name)
REFERENCE_IMAGE_ENDPOINTS: List[Tuple[str, str, str]] = [
    ("instantid", "/sdxl-instantid", "face"),
    ("instantid", "/flux-pulid", "face"),
    ("instantid", "/flux-ipadapter-faceid", "face"),
    ("qwen-edit", "/qwen-image-edit-2511", "edit"),
    ("qwen-edit", "/qwen-image-inpaint-2511", "inpaint"),
    ("qwen-image", "/video-faceswap", "video_faceswap"),
    ("seedvr2", "/seedvr2", "upscale"),
]

# LoRA endpoints: (app, path)
LORA_ENDPOINTS: List[Tuple[str, str]] = [
    ("flux", "/flux-dev-lora"),
    ("qwen-image", "/qwen-image-2512-lora"),
    ("z-image", "/z-image-lora"),
    ("wan26", "/wan2.6-lora"),
]


def make_request(
    app: str, endpoint: str, payload: dict, timeout: int = TIMEOUT_REF
) -> Tuple[bool, float, Optional[str], Optional[float]]:
    """POST endpoint; handle 303 redirect. Returns (success, duration_sec, error, cost)."""
    url = f"{APPS[app]}{endpoint}"
    start = time.time()
    try:
        resp = requests.post(url, json=payload, timeout=timeout, allow_redirects=False)
        if resp.status_code == 303:
            redirect_url = resp.headers.get("Location")
            if redirect_url:
                poll_start = time.time()
                while time.time() - poll_start < timeout:
                    r = requests.get(redirect_url, timeout=60)
                    if r.status_code == 200:
                        resp = r
                        break
                    if r.status_code == 202:
                        time.sleep(2)
                    else:
                        break
        duration = time.time() - start
        cost = None
        if resp.status_code == 200 and "X-Cost-USD" in resp.headers:
            try:
                cost = float(resp.headers["X-Cost-USD"])
            except Exception:
                pass
        if resp.status_code == 200:
            return True, duration, None, cost
        return False, duration, (resp.text[:300] if resp.text else f"HTTP {resp.status_code}"), cost
    except requests.exceptions.Timeout:
        return False, time.time() - start, "Timeout", None
    except Exception as e:
        return False, time.time() - start, str(e)[:300], None


def build_face_payload(reference_image_base64: str) -> dict:
    prompt = "professional headshot photo, studio lighting, clean background, high quality"
    return {
        "prompt": prompt,
        "reference_image": reference_image_base64,
        "width": 1024,
        "height": 1024,
        "seed": 42,
    }


def build_edit_payload(reference_image_base64: str) -> dict:
    return {
        "image": reference_image_base64,
        "prompt": "make the background a sunset beach",
        "seed": 42,
    }


def build_inpaint_payload(reference_image_base64: str) -> dict:
    return {
        "image": reference_image_base64,
        "mask": reference_image_base64,  # placeholder; real test would use mask
        "prompt": "fix the background",
        "seed": 42,
    }


def build_video_faceswap_payload(reference_image_base64: str) -> dict:
    return {
        "reference_image": reference_image_base64,
        "video_url": "",  # optional: URL to short video for swap
        "prompt": "person smiling",
        "seed": 42,
    }


def build_upscale_payload(reference_image_base64: str) -> dict:
    return {"image": reference_image_base64}


def get_reference_image() -> Optional[str]:
    """Base64 data URL from REF_IMAGE_PATH or generate via /flux."""
    path = os.environ.get("REF_IMAGE_PATH")
    if path and Path(path).exists():
        with open(path, "rb") as f:
            b64 = base64.b64encode(f.read()).decode("utf-8")
        return f"data:image/jpeg;base64,{b64}"
    # Optional: generate one with /flux (same as comprehensive test)
    url = f"{APPS['flux']}/flux"
    try:
        r = requests.post(
            url,
            json={
                "prompt": "professional headshot photo of a woman, studio lighting",
                "width": 1024,
                "height": 1024,
                "steps": 4,
                "seed": 42,
            },
            timeout=180,
        )
        if r.status_code == 200 and len(r.content) > 1000:
            b64 = base64.b64encode(r.content).decode("utf-8")
            return f"data:image/jpeg;base64,{b64}"
    except Exception:
        pass
    return None


def run_quality_matrix(
    reference_image: Optional[str],
    lora_id: Optional[str],
) -> List[Dict[str, Any]]:
    results: List[Dict[str, Any]] = []
    timestamp = datetime.utcnow().isoformat() + "Z"

    # Reference-image endpoints
    for app, path, kind in REFERENCE_IMAGE_ENDPOINTS:
        if not reference_image and kind in ("face", "edit", "inpaint", "video_faceswap", "upscale"):
            results.append({
                "endpoint": path,
                "app": app,
                "type": "reference_image",
                "success": False,
                "duration_sec": 0,
                "error": "No reference image (set REF_IMAGE_PATH or allow /flux fallback)",
                "timestamp": timestamp,
            })
            continue
        if kind == "face":
            payload = build_face_payload(reference_image)
        elif kind == "edit":
            payload = build_edit_payload(reference_image)
        elif kind == "inpaint":
            payload = build_inpaint_payload(reference_image)
        elif kind == "video_faceswap":
            payload = build_video_faceswap_payload(reference_image)
        elif kind == "upscale":
            payload = build_upscale_payload(reference_image)
        else:
            payload = build_face_payload(reference_image)
        timeout = TIMEOUT_VIDEO if kind in ("video_faceswap", "upscale") else TIMEOUT_REF
        success, duration, error, cost = make_request(app, path, payload, timeout=timeout)
        results.append({
            "endpoint": path,
            "app": app,
            "type": "reference_image",
            "success": success,
            "duration_sec": round(duration, 2),
            "error": error,
            "cost_usd": cost,
            "timestamp": timestamp,
        })

    # LoRA endpoints
    for app, path in LORA_ENDPOINTS:
        if not lora_id:
            results.append({
                "endpoint": path,
                "app": app,
                "type": "lora",
                "success": False,
                "duration_sec": 0,
                "error": "No LORA_ID set",
                "timestamp": timestamp,
            })
            continue
        payload = {
            "prompt": "character in a cozy coffee shop, warm lighting",
            "lora_id": lora_id,
            "width": 1024,
            "height": 1024,
            "seed": 42,
        }
        success, duration, error, cost = make_request(app, path, payload, timeout=TIMEOUT_LORA)
        results.append({
            "endpoint": path,
            "app": app,
            "type": "lora",
            "success": success,
            "duration_sec": round(duration, 2),
            "error": error,
            "cost_usd": cost,
            "timestamp": timestamp,
        })

    return results


def main():
    parser = argparse.ArgumentParser(description="Quality test matrix for Modal ref-image and LoRA endpoints")
    _default_out = Path(__file__).resolve().parent.parent / "docs" / "status" / "quality-test-results.json"
    parser.add_argument(
        "--output", "-o",
        default=str(_default_out),
        help="Output JSON file path",
    )
    parser.add_argument("--no-ref-image", action="store_true", help="Skip ref-image tests if no REF_IMAGE_PATH")
    args = parser.parse_args()

    ref_image = None if args.no_ref_image else get_reference_image()
    lora_id = os.environ.get("LORA_ID")

    if not ref_image and not args.no_ref_image:
        print("Warning: No reference image (set REF_IMAGE_PATH or remove --no-ref-image to generate via /flux)")

    print("Running quality test matrix (reference-image + LoRA endpoints)...")
    results = run_quality_matrix(ref_image, lora_id)

    out_path = Path(args.output)
    out_path.parent.mkdir(parents=True, exist_ok=True)
    with open(out_path, "w") as f:
        json.dump({"results": results, "summary": {
            "total": len(results),
            "passed": sum(1 for r in results if r.get("success")),
            "failed": sum(1 for r in results if not r.get("success")),
        }}, f, indent=2)

    print(f"Results written to {out_path}")
    passed = sum(1 for r in results if r.get("success"))
    print(f"Summary: {passed}/{len(results)} passed")
    return 0 if passed == len(results) else 1


if __name__ == "__main__":
    sys.exit(main())
