#!/usr/bin/env python3
"""
Modal Endpoint Benchmarking Script

Generates test resources and benchmarks ALL endpoints with cold/warm timing.
Outputs a comprehensive markdown report.

Usage:
    python benchmark-endpoints.py              # Run full benchmark
    python benchmark-endpoints.py --quick      # Quick benchmark (warm only)
    python benchmark-endpoints.py --generate   # Generate test resources only
"""

import sys
import json
import base64
import requests
import time
import argparse
from pathlib import Path
from datetime import datetime
from typing import Dict, Optional, Tuple, List
from dataclasses import dataclass, asdict
from io import BytesIO

# ==============================================================================
# CONFIGURATION
# ==============================================================================

WORKSPACE = "ryla"
TIMEOUT = 900  # 15 minutes max for video endpoints
SCRIPT_DIR = Path(__file__).parent
TEST_RESOURCES_DIR = SCRIPT_DIR / "test_resources"
RESULTS_DIR = Path(__file__).parent.parent / "docs" / "status"

# Split app URL mappings
SPLIT_APPS = {
    # Flux
    "/flux": f"https://{WORKSPACE}--ryla-flux-comfyui-fastapi-app.modal.run/flux",
    "/flux-dev": f"https://{WORKSPACE}--ryla-flux-comfyui-fastapi-app.modal.run/flux-dev",
    "/flux-dev-lora": f"https://{WORKSPACE}--ryla-flux-comfyui-fastapi-app.modal.run/flux-dev-lora",
    "/flux-lora": f"https://{WORKSPACE}--ryla-lora-comfyui-fastapi-app.modal.run/flux-lora",
    # Face Consistency
    "/sdxl-instantid": f"https://{WORKSPACE}--ryla-instantid-comfyui-fastapi-app.modal.run/sdxl-instantid",
    "/flux-pulid": f"https://{WORKSPACE}--ryla-instantid-comfyui-fastapi-app.modal.run/flux-pulid",
    "/flux-ipadapter-faceid": f"https://{WORKSPACE}--ryla-instantid-comfyui-fastapi-app.modal.run/flux-ipadapter-faceid",
    # Qwen Image
    "/qwen-image-2512": f"https://{WORKSPACE}--ryla-qwen-image-comfyui-fastapi-app.modal.run/qwen-image-2512",
    "/qwen-image-2512-fast": f"https://{WORKSPACE}--ryla-qwen-image-comfyui-fastapi-app.modal.run/qwen-image-2512-fast",
    "/qwen-image-2512-lora": f"https://{WORKSPACE}--ryla-qwen-image-comfyui-fastapi-app.modal.run/qwen-image-2512-lora",
    "/video-faceswap": f"https://{WORKSPACE}--ryla-qwen-image-comfyui-fastapi-app.modal.run/video-faceswap",
    # Qwen Edit
    "/qwen-image-edit-2511": f"https://{WORKSPACE}--ryla-qwen-edit-comfyui-fastapi-app.modal.run/qwen-image-edit-2511",
    "/qwen-image-inpaint-2511": f"https://{WORKSPACE}--ryla-qwen-edit-comfyui-fastapi-app.modal.run/qwen-image-inpaint-2511",
    # Z-Image
    "/z-image-simple": f"https://{WORKSPACE}--ryla-z-image-comfyui-fastapi-app.modal.run/z-image-simple",
    "/z-image-danrisi": f"https://{WORKSPACE}--ryla-z-image-comfyui-fastapi-app.modal.run/z-image-danrisi",
    "/z-image-lora": f"https://{WORKSPACE}--ryla-z-image-comfyui-fastapi-app.modal.run/z-image-lora",
    # Video
    "/wan2": f"https://{WORKSPACE}--ryla-wan26-comfyui-fastapi-app.modal.run/wan2",
    "/wan2.6": f"https://{WORKSPACE}--ryla-wan26-comfyui-fastapi-app.modal.run/wan2.6",
    "/wan2.6-r2v": f"https://{WORKSPACE}--ryla-wan26-comfyui-fastapi-app.modal.run/wan2.6-r2v",
    "/wan2.6-lora": f"https://{WORKSPACE}--ryla-wan26-comfyui-fastapi-app.modal.run/wan2.6-lora",
    # Upscaling
    "/seedvr2": f"https://{WORKSPACE}--ryla-seedvr2-comfyui-fastapi-app.modal.run/seedvr2",
}

# Endpoint categories and requirements
ENDPOINT_CONFIG = {
    # Format: "path": {"category": str, "requires": list, "description": str}
    "/flux": {"category": "Flux", "requires": [], "description": "Flux Schnell text-to-image"},
    "/flux-dev": {"category": "Flux", "requires": [], "description": "Flux Dev text-to-image"},
    "/flux-dev-lora": {"category": "Flux", "requires": ["lora"], "description": "Flux Dev + LoRA"},
    "/flux-lora": {"category": "Flux", "requires": ["lora"], "description": "Flux + LoRA"},
    "/sdxl-instantid": {"category": "Face Consistency", "requires": ["image"], "description": "SDXL + InstantID"},
    "/flux-pulid": {"category": "Face Consistency", "requires": ["image"], "description": "Flux + PuLID"},
    "/flux-ipadapter-faceid": {"category": "Face Consistency", "requires": ["image"], "description": "Flux + IP-Adapter FaceID"},
    "/qwen-image-2512": {"category": "Qwen Image", "requires": [], "description": "Qwen Image (50 steps)"},
    "/qwen-image-2512-fast": {"category": "Qwen Image", "requires": [], "description": "Qwen Image Fast (4 steps)"},
    "/qwen-image-2512-lora": {"category": "Qwen Image", "requires": ["lora"], "description": "Qwen Image + LoRA"},
    "/video-faceswap": {"category": "Qwen Image", "requires": ["video", "image"], "description": "Video face swap"},
    "/qwen-image-edit-2511": {"category": "Qwen Edit", "requires": ["image"], "description": "Image editing"},
    "/qwen-image-inpaint-2511": {"category": "Qwen Edit", "requires": ["image"], "description": "Image inpainting"},
    "/z-image-simple": {"category": "Z-Image", "requires": [], "description": "Z-Image basic"},
    "/z-image-danrisi": {"category": "Z-Image", "requires": [], "description": "Z-Image Danrisi"},
    "/z-image-lora": {"category": "Z-Image", "requires": ["lora"], "description": "Z-Image + LoRA"},
    "/wan2": {"category": "Video", "requires": [], "description": "Wan2.1 text-to-video"},
    "/wan2.6": {"category": "Video", "requires": [], "description": "Wan2.6 text-to-video"},
    "/wan2.6-r2v": {"category": "Video", "requires": ["video"], "description": "Wan2.6 reference-to-video"},
    "/wan2.6-lora": {"category": "Video", "requires": ["lora"], "description": "Wan2.6 + LoRA"},
    "/seedvr2": {"category": "Upscaling", "requires": ["video"], "description": "SeedVR2 video upscaling"},
}

# ==============================================================================
# DATA CLASSES
# ==============================================================================

@dataclass
class EndpointResult:
    """Result from testing an endpoint."""
    endpoint: str
    path: str
    category: str
    description: str
    cold_time_sec: Optional[float] = None
    warm_time_sec: Optional[float] = None
    cost_usd: Optional[float] = None
    gpu_type: Optional[str] = None
    size_kb: Optional[float] = None
    status: str = "pending"
    error: Optional[str] = None
    skipped_reason: Optional[str] = None

# ==============================================================================
# UTILITY FUNCTIONS
# ==============================================================================

def get_endpoint_url(path: str) -> str:
    """Get the full URL for an endpoint path."""
    return SPLIT_APPS.get(path, f"https://{WORKSPACE}--ryla-comfyui-comfyui-fastapi-app.modal.run{path}")


def encode_file_to_base64(file_path: Path, mime_type: str = None) -> str:
    """Encode a file to base64 data URI."""
    with open(file_path, "rb") as f:
        content = base64.b64encode(f.read()).decode("utf-8")
    
    if mime_type is None:
        ext = file_path.suffix.lower()
        mime_types = {
            ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
            ".png": "image/png", ".gif": "image/gif",
            ".mp4": "video/mp4", ".webm": "video/webm",
        }
        mime_type = mime_types.get(ext, "application/octet-stream")
    
    return f"data:{mime_type};base64,{content}"


def call_endpoint(url: str, payload: dict, timeout: int = TIMEOUT) -> Tuple[bool, dict]:
    """
    Call an endpoint and return timing/cost info.
    
    Returns:
        (success, result_dict) with time_sec, cost_usd, gpu_type, error, size_kb
    """
    result = {
        "time_sec": None,
        "cost_usd": None,
        "gpu_type": None,
        "error": None,
        "size_kb": None,
    }
    
    try:
        start = time.time()
        response = requests.post(url, json=payload, timeout=timeout)
        elapsed = time.time() - start
        
        result["time_sec"] = elapsed
        result["size_kb"] = len(response.content) / 1024
        
        # Extract headers
        result["cost_usd"] = float(response.headers.get("X-Cost-USD", 0))
        result["gpu_type"] = response.headers.get("X-GPU-Type", "L40S")
        
        # Check response
        if response.status_code == 200:
            return True, result
        else:
            try:
                error_json = response.json()
                result["error"] = error_json.get("error", error_json.get("detail", str(response.status_code)))
            except:
                result["error"] = f"HTTP {response.status_code}: {response.text[:200]}"
            return False, result
            
    except requests.exceptions.Timeout:
        result["error"] = "Timeout"
        return False, result
    except Exception as e:
        result["error"] = str(e)[:200]
        return False, result


def save_response_content(response_content: bytes, path: Path, content_type: str = None):
    """Save response content to file."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with open(path, "wb") as f:
        f.write(response_content)
    print(f"  Saved: {path}")


# ==============================================================================
# TEST RESOURCE GENERATION
# ==============================================================================

def generate_test_image(output_path: Path) -> bool:
    """Generate a test image using Z-Image (fastest endpoint)."""
    print("\n📸 Generating test image with Z-Image...")
    
    url = get_endpoint_url("/z-image-simple")
    payload = {
        "prompt": "A professional headshot portrait of a person, neutral background, high quality",
        "width": 512,
        "height": 512,
        "steps": 4,
        "cfg": 0.0,
        "seed": 42,
    }
    
    try:
        response = requests.post(url, json=payload, timeout=TIMEOUT)
        if response.status_code == 200:
            output_path.parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, "wb") as f:
                f.write(response.content)
            print(f"  ✅ Test image saved: {output_path}")
            return True
        else:
            print(f"  ❌ Failed: HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False


def generate_test_video(output_path: Path) -> bool:
    """Generate a test video using Wan2.6 (most reliable video endpoint)."""
    print("\n🎬 Generating test video with Wan2.6...")
    
    url = get_endpoint_url("/wan2.6")
    payload = {
        "prompt": "A person standing still, simple background",
        "width": 512,
        "height": 512,
        "length": 17,  # Minimum frames
        "fps": 16,
        "steps": 15,
        "cfg": 5.0,
        "seed": 42,
    }
    
    try:
        response = requests.post(url, json=payload, timeout=TIMEOUT)
        if response.status_code == 200:
            output_path.parent.mkdir(parents=True, exist_ok=True)
            with open(output_path, "wb") as f:
                f.write(response.content)
            print(f"  ✅ Test video saved: {output_path}")
            return True
        else:
            print(f"  ❌ Failed: HTTP {response.status_code}")
            try:
                error = response.json()
                print(f"      Error: {error.get('error', error.get('detail', 'Unknown'))[:100]}")
            except:
                pass
            return False
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return False


def check_lora_available() -> bool:
    """Check if any LoRA files are available in Modal volume."""
    # We can't directly check Modal volume from here, so we'll try a LoRA endpoint
    # and check if it fails due to missing LoRA vs other errors
    print("\n🔍 Checking LoRA availability...")
    
    url = get_endpoint_url("/flux-lora")
    payload = {
        "prompt": "test",
        "lora_id": "test-benchmark",
        "width": 256,
        "height": 256,
        "steps": 1,
    }
    
    try:
        response = requests.post(url, json=payload, timeout=60)
        if response.status_code == 200:
            print("  ✅ LoRA 'test-benchmark' found")
            return True
        elif response.status_code == 404:
            print("  ⚠️  No LoRA files found (train one first)")
            return False
        else:
            print(f"  ⚠️  LoRA check inconclusive: HTTP {response.status_code}")
            return False
    except Exception as e:
        print(f"  ⚠️  LoRA check failed: {e}")
        return False


def ensure_test_resources() -> dict:
    """Ensure all test resources exist, generating if needed."""
    TEST_RESOURCES_DIR.mkdir(parents=True, exist_ok=True)
    
    resources = {
        "image": TEST_RESOURCES_DIR / "test_portrait.jpg",
        "video": TEST_RESOURCES_DIR / "test_video.mp4",
        "lora_available": False,
    }
    
    # Check/generate test image
    if not resources["image"].exists():
        if not generate_test_image(resources["image"]):
            print("  ⚠️  Will skip endpoints requiring test image")
            resources["image"] = None
    else:
        print(f"  ✅ Test image exists: {resources['image']}")
    
    # Check/generate test video
    if not resources["video"].exists():
        if not generate_test_video(resources["video"]):
            print("  ⚠️  Will skip endpoints requiring test video")
            resources["video"] = None
    else:
        print(f"  ✅ Test video exists: {resources['video']}")
    
    # Check LoRA availability
    resources["lora_available"] = check_lora_available()
    
    return resources


# ==============================================================================
# BENCHMARK FUNCTIONS
# ==============================================================================

def build_payload(path: str, resources: dict) -> Optional[dict]:
    """Build the payload for an endpoint based on its requirements."""
    config = ENDPOINT_CONFIG.get(path, {})
    requires = config.get("requires", [])
    
    # Base payloads by category
    base_payloads = {
        "/flux": {"prompt": "A beautiful landscape", "width": 512, "height": 512, "steps": 4},
        "/flux-dev": {"prompt": "A beautiful landscape", "width": 512, "height": 512, "steps": 10},
        "/flux-dev-lora": {"prompt": "A beautiful landscape", "width": 512, "height": 512, "steps": 10, "lora_id": "test-benchmark", "lora_strength": 0.8},
        "/flux-lora": {"prompt": "A beautiful landscape", "width": 512, "height": 512, "steps": 4, "lora_id": "test-benchmark", "lora_strength": 0.8},
        "/sdxl-instantid": {"prompt": "Professional portrait", "width": 512, "height": 512, "steps": 15, "cfg": 5.0, "face_provider": "CPU"},
        "/flux-pulid": {"prompt": "Professional portrait", "width": 512, "height": 512, "steps": 15, "cfg": 1.0, "face_provider": "CPU"},
        "/flux-ipadapter-faceid": {"prompt": "Professional portrait", "width": 512, "height": 512, "steps": 15, "cfg": 1.0, "face_provider": "CPU"},
        "/qwen-image-2512": {"prompt": "A beautiful landscape", "width": 512, "height": 512, "steps": 20, "cfg": 4.0},
        "/qwen-image-2512-fast": {"prompt": "A beautiful landscape", "width": 512, "height": 512, "steps": 4, "cfg": 1.0},
        "/qwen-image-2512-lora": {"prompt": "A beautiful landscape", "width": 512, "height": 512, "steps": 20, "cfg": 4.0, "lora_id": "test-benchmark", "lora_strength": 0.8},
        "/video-faceswap": {"fps": 16},
        "/qwen-image-edit-2511": {"instruction": "Make the background blue", "steps": 20, "cfg": 4.0},
        "/qwen-image-inpaint-2511": {"prompt": "A beautiful blue sky", "steps": 20, "cfg": 4.0},
        "/z-image-simple": {"prompt": "A beautiful landscape", "width": 512, "height": 512, "steps": 4, "cfg": 0.0},
        "/z-image-danrisi": {"prompt": "A beautiful landscape", "width": 512, "height": 512, "steps": 4, "cfg": 1.0},
        "/z-image-lora": {"prompt": "A beautiful landscape", "width": 512, "height": 512, "steps": 8, "cfg": 4.5, "lora_id": "test-benchmark", "lora_strength": 0.8},
        "/wan2": {"prompt": "A landscape animation", "width": 512, "height": 512, "length": 17, "fps": 16, "steps": 10, "cfg": 5.0},
        "/wan2.6": {"prompt": "A landscape animation", "width": 512, "height": 512, "length": 17, "fps": 16, "steps": 10, "cfg": 5.0},
        "/wan2.6-r2v": {"prompt": "A person animation", "width": 512, "height": 512, "length": 17, "fps": 16, "steps": 10, "cfg": 5.0},
        "/wan2.6-lora": {"prompt": "A landscape animation", "width": 512, "height": 512, "length": 17, "fps": 16, "steps": 10, "cfg": 5.0, "lora_id": "test-benchmark", "lora_strength": 0.8},
        "/seedvr2": {"scale": 2, "steps": 10, "cfg": 5.0},
    }
    
    payload = base_payloads.get(path, {"prompt": "test"})
    
    # Check and add required resources
    if "image" in requires:
        if not resources.get("image"):
            return None
        image_b64 = encode_file_to_base64(resources["image"])
        if path in ["/sdxl-instantid", "/flux-pulid", "/flux-ipadapter-faceid"]:
            payload["reference_image"] = image_b64
        elif path == "/video-faceswap":
            payload["face_image"] = image_b64
        elif path == "/qwen-image-edit-2511":
            payload["source_image"] = image_b64
        elif path == "/qwen-image-inpaint-2511":
            payload["source_image"] = image_b64
            payload["mask_image"] = image_b64  # Using same as mask for test
    
    if "video" in requires:
        if not resources.get("video"):
            return None
        video_b64 = encode_file_to_base64(resources["video"])
        if path == "/video-faceswap":
            payload["video"] = video_b64
        elif path == "/wan2.6-r2v":
            payload["reference_videos"] = [video_b64]
        elif path == "/seedvr2":
            payload["video"] = video_b64
    
    if "lora" in requires:
        if not resources.get("lora_available"):
            return None
    
    return payload


def run_endpoint_test(path: str, resources: dict, run_cold: bool = True) -> EndpointResult:
    """Run a single endpoint test with cold and warm runs."""
    config = ENDPOINT_CONFIG.get(path, {})
    result = EndpointResult(
        endpoint=path.lstrip("/").replace("-", " ").title(),
        path=path,
        category=config.get("category", "Unknown"),
        description=config.get("description", ""),
    )
    
    # Build payload
    payload = build_payload(path, resources)
    if payload is None:
        requires = config.get("requires", [])
        missing = []
        if "image" in requires and not resources.get("image"):
            missing.append("test image")
        if "video" in requires and not resources.get("video"):
            missing.append("test video")
        if "lora" in requires and not resources.get("lora_available"):
            missing.append("LoRA file")
        result.status = "skipped"
        result.skipped_reason = f"Missing: {', '.join(missing)}"
        return result
    
    url = get_endpoint_url(path)
    print(f"\n  Testing {path}...")
    
    # Cold run (if requested)
    if run_cold:
        print(f"    Cold run...")
        success, data = call_endpoint(url, payload)
        if success:
            result.cold_time_sec = data["time_sec"]
            result.cost_usd = data["cost_usd"]
            result.gpu_type = data["gpu_type"]
            result.size_kb = data["size_kb"]
            print(f"    ✅ Cold: {result.cold_time_sec:.1f}s, ${result.cost_usd:.4f}")
        else:
            result.status = "failed"
            result.error = data["error"]
            print(f"    ❌ Cold failed: {result.error}")
            return result
    
    # Warm run
    print(f"    Warm run...")
    success, data = call_endpoint(url, payload)
    if success:
        result.warm_time_sec = data["time_sec"]
        if not result.cost_usd:
            result.cost_usd = data["cost_usd"]
        if not result.gpu_type:
            result.gpu_type = data["gpu_type"]
        if not result.size_kb:
            result.size_kb = data["size_kb"]
        result.status = "success"
        print(f"    ✅ Warm: {result.warm_time_sec:.1f}s")
    else:
        result.status = "failed"
        result.error = data["error"]
        print(f"    ❌ Warm failed: {result.error}")
    
    return result


def run_benchmark(resources: dict, quick: bool = False) -> List[EndpointResult]:
    """Run the full benchmark suite."""
    results = []
    
    # Group endpoints by app for efficient cold/warm testing
    app_endpoints = {}
    for path in ENDPOINT_CONFIG.keys():
        url = get_endpoint_url(path)
        # Extract app name from URL
        app = url.split("--")[1].split("-comfyui")[0] if "--" in url else "default"
        if app not in app_endpoints:
            app_endpoints[app] = []
        app_endpoints[app].append(path)
    
    # Track which apps have been warmed up
    warmed_apps = set()
    
    for app, endpoints in app_endpoints.items():
        print(f"\n{'='*60}")
        print(f"Testing app: {app}")
        print(f"{'='*60}")
        
        for path in endpoints:
            # First endpoint of each app gets cold test
            run_cold = (app not in warmed_apps) and not quick
            result = run_endpoint_test(path, resources, run_cold=run_cold)
            results.append(result)
            
            if result.status == "success":
                warmed_apps.add(app)
    
    return results


# ==============================================================================
# REPORT GENERATION
# ==============================================================================

def generate_markdown_report(results: List[EndpointResult], resources: dict) -> str:
    """Generate a comprehensive markdown report."""
    now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    
    # Calculate totals
    successful = [r for r in results if r.status == "success"]
    failed = [r for r in results if r.status == "failed"]
    skipped = [r for r in results if r.status == "skipped"]
    total_cost = sum(r.cost_usd or 0 for r in successful)
    
    report = f"""# Modal Endpoint Benchmark Report

**Generated:** {now}  
**Workspace:** {WORKSPACE}  
**Test Resources:** Image={'✅' if resources.get('image') else '❌'}, Video={'✅' if resources.get('video') else '❌'}, LoRA={'✅' if resources.get('lora_available') else '❌'}

## Summary

| Metric | Value |
|--------|-------|
| Total Endpoints | {len(results)} |
| Successful | {len(successful)} |
| Failed | {len(failed)} |
| Skipped | {len(skipped)} |
| Total Benchmark Cost | ${total_cost:.4f} |

## Results by Category

"""
    
    # Group by category
    categories = {}
    for r in results:
        if r.category not in categories:
            categories[r.category] = []
        categories[r.category].append(r)
    
    for category, cat_results in categories.items():
        report += f"### {category}\n\n"
        report += "| Endpoint | Path | Cold (s) | Warm (s) | Δ Savings | Cost ($) | Status |\n"
        report += "|----------|------|----------|----------|-----------|----------|--------|\n"
        
        for r in cat_results:
            if r.status == "success":
                cold = f"{r.cold_time_sec:.1f}" if r.cold_time_sec else "-"
                warm = f"{r.warm_time_sec:.1f}" if r.warm_time_sec else "-"
                if r.cold_time_sec and r.warm_time_sec:
                    savings = ((r.cold_time_sec - r.warm_time_sec) / r.cold_time_sec) * 100
                    delta = f"{savings:.0f}%"
                else:
                    delta = "-"
                cost = f"{r.cost_usd:.4f}" if r.cost_usd else "-"
                status = "✅"
            elif r.status == "skipped":
                cold = warm = delta = cost = "-"
                status = f"⏭️ {r.skipped_reason}"
            else:
                cold = warm = delta = cost = "-"
                status = f"❌ {r.error[:30]}..." if r.error and len(r.error) > 30 else f"❌ {r.error}"
            
            report += f"| {r.endpoint} | `{r.path}` | {cold} | {warm} | {delta} | {cost} | {status} |\n"
        
        report += "\n"
    
    # Add key findings
    if successful:
        avg_cold = sum(r.cold_time_sec or 0 for r in successful if r.cold_time_sec) / max(1, len([r for r in successful if r.cold_time_sec]))
        avg_warm = sum(r.warm_time_sec or 0 for r in successful if r.warm_time_sec) / max(1, len([r for r in successful if r.warm_time_sec]))
        
        report += f"""## Key Findings

- **Average Cold Start:** {avg_cold:.1f}s
- **Average Warm Time:** {avg_warm:.1f}s  
- **Warm vs Cold Improvement:** {((avg_cold - avg_warm) / avg_cold * 100):.0f}% faster
- **Total Benchmark Cost:** ${total_cost:.4f}

## Recommendations

1. **Keep containers warm** for production - warm containers are significantly faster
2. **Use Z-Image Danrisi** for fastest image generation (minimal cold start overhead)
3. **Batch video requests** - video endpoints have the longest cold starts
4. **Pre-warm before peak hours** - schedule periodic pings to keep containers warm

"""
    
    # Add failed/skipped details
    if failed:
        report += "## Failed Endpoints\n\n"
        for r in failed:
            report += f"- `{r.path}`: {r.error}\n"
        report += "\n"
    
    if skipped:
        report += "## Skipped Endpoints\n\n"
        for r in skipped:
            report += f"- `{r.path}`: {r.skipped_reason}\n"
        report += "\n"
    
    report += """## How to Run This Benchmark

```bash
# Full benchmark (cold + warm)
python apps/modal/scripts/benchmark-endpoints.py

# Quick benchmark (warm only)
python apps/modal/scripts/benchmark-endpoints.py --quick

# Generate test resources only
python apps/modal/scripts/benchmark-endpoints.py --generate

# To enable LoRA endpoints, train a test LoRA first:
modal run apps/modal/apps/lora-training/app.py --character-id=test-benchmark --steps=100
```

---
*Report generated by `benchmark-endpoints.py`*
"""
    
    return report


def generate_json_results(results: List[EndpointResult], resources: dict) -> dict:
    """Generate JSON results for programmatic use."""
    return {
        "timestamp": datetime.utcnow().isoformat(),
        "workspace": WORKSPACE,
        "resources": {
            "image": str(resources.get("image")) if resources.get("image") else None,
            "video": str(resources.get("video")) if resources.get("video") else None,
            "lora_available": resources.get("lora_available", False),
        },
        "summary": {
            "total": len(results),
            "successful": len([r for r in results if r.status == "success"]),
            "failed": len([r for r in results if r.status == "failed"]),
            "skipped": len([r for r in results if r.status == "skipped"]),
            "total_cost": sum(r.cost_usd or 0 for r in results if r.status == "success"),
        },
        "results": [asdict(r) for r in results],
    }


# ==============================================================================
# MAIN
# ==============================================================================

def main():
    parser = argparse.ArgumentParser(description="Benchmark Modal endpoints")
    parser.add_argument("--quick", action="store_true", help="Quick mode (warm runs only)")
    parser.add_argument("--generate", action="store_true", help="Generate test resources only")
    args = parser.parse_args()
    
    print("=" * 60)
    print("Modal Endpoint Benchmark")
    print("=" * 60)
    
    # Ensure test resources exist
    print("\n📦 Checking test resources...")
    resources = ensure_test_resources()
    
    if args.generate:
        print("\n✅ Test resources generated. Exiting.")
        return
    
    # Run benchmark
    print(f"\n🚀 Running benchmark ({'quick' if args.quick else 'full'} mode)...")
    results = run_benchmark(resources, quick=args.quick)
    
    # Generate reports
    print("\n📝 Generating reports...")
    
    # Markdown report
    RESULTS_DIR.mkdir(parents=True, exist_ok=True)
    md_report = generate_markdown_report(results, resources)
    md_path = RESULTS_DIR / "BENCHMARK-RESULTS.md"
    with open(md_path, "w") as f:
        f.write(md_report)
    print(f"  ✅ Markdown report: {md_path}")
    
    # JSON results
    json_results = generate_json_results(results, resources)
    json_path = RESULTS_DIR / "BENCHMARK-RESULTS.json"
    with open(json_path, "w") as f:
        json.dump(json_results, f, indent=2)
    print(f"  ✅ JSON results: {json_path}")
    
    # Print summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    successful = [r for r in results if r.status == "success"]
    failed = [r for r in results if r.status == "failed"]
    skipped = [r for r in results if r.status == "skipped"]
    print(f"✅ Successful: {len(successful)}")
    print(f"❌ Failed: {len(failed)}")
    print(f"⏭️  Skipped: {len(skipped)}")
    print(f"💰 Total Cost: ${sum(r.cost_usd or 0 for r in successful):.4f}")
    print(f"\n📄 Full report: {md_path}")


if __name__ == "__main__":
    main()
