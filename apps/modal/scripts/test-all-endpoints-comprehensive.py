#!/usr/bin/env python3
"""
Comprehensive Modal Endpoint Test Script

Tests ALL generation endpoints, not just health checks.
Chains outputs where needed (e.g., generates face image first, then uses it for InstantID).
"""

import base64
import json
import os
import sys
import time
from datetime import datetime
from pathlib import Path
from typing import Optional, Tuple, List
import requests

# Test output directory
OUTPUT_DIR = Path(__file__).parent.parent / "test_outputs"
OUTPUT_DIR.mkdir(exist_ok=True)

# Base URLs
APPS = {
    "instantid": "https://ryla--ryla-instantid-comfyui-fastapi-app.modal.run",
    "flux": "https://ryla--ryla-flux-comfyui-fastapi-app.modal.run",
    "qwen-image": "https://ryla--ryla-qwen-image-comfyui-fastapi-app.modal.run",
    "wan26": "https://ryla--ryla-wan26-comfyui-fastapi-app.modal.run",
    "z-image": "https://ryla--ryla-z-image-comfyui-fastapi-app.modal.run",
    "seedvr2": "https://ryla--ryla-seedvr2-comfyui-fastapi-app.modal.run",
}

# Test prompts
FACE_PROMPT = "professional headshot photo of a beautiful young woman with long brown hair, green eyes, soft smile, studio lighting, clean background, high quality, detailed face"
SCENE_PROMPT = "beautiful sunset over the ocean, orange and purple sky, dramatic clouds, photorealistic"
VIDEO_PROMPT = "a woman walking on a beach at sunset, ocean waves, golden hour lighting"

# Timeouts
TIMEOUT_SHORT = 120  # 2 min for fast endpoints
TIMEOUT_MEDIUM = 300  # 5 min for standard endpoints
TIMEOUT_LONG = 600   # 10 min for video endpoints

class TestResult:
    def __init__(self, app: str, endpoint: str, success: bool, duration: float, 
                 error: Optional[str] = None, output_file: Optional[str] = None,
                 cost: Optional[float] = None):
        self.app = app
        self.endpoint = endpoint
        self.success = success
        self.duration = duration
        self.error = error
        self.output_file = output_file
        self.cost = cost
    
    def __str__(self):
        status = "✅" if self.success else "❌"
        cost_str = f" ${self.cost:.4f}" if self.cost else ""
        if self.success:
            return f"{status} {self.app}/{self.endpoint} - {self.duration:.1f}s{cost_str}"
        else:
            return f"{status} {self.app}/{self.endpoint} - {self.error}"


def make_request(app: str, endpoint: str, payload: dict, timeout: int = TIMEOUT_MEDIUM) -> Tuple[bool, bytes, dict, float]:
    """
    Make a request to a Modal endpoint, handling 303 redirects.
    
    Returns: (success, content_bytes, headers, duration_seconds)
    """
    url = f"{APPS[app]}{endpoint}"
    start = time.time()
    
    print(f"  📡 POST {url}")
    
    try:
        # Initial POST request
        resp = requests.post(url, json=payload, timeout=timeout, allow_redirects=False)
        
        # Handle 303 redirect (Modal's async pattern)
        if resp.status_code == 303:
            redirect_url = resp.headers.get("Location")
            if redirect_url:
                print(f"  ⏳ Following redirect to {redirect_url}")
                # Poll the redirect URL
                poll_start = time.time()
                while time.time() - poll_start < timeout:
                    resp = requests.get(redirect_url, timeout=60)
                    if resp.status_code == 200:
                        break
                    elif resp.status_code == 202:
                        # Still processing
                        time.sleep(2)
                    else:
                        break
        
        duration = time.time() - start
        
        if resp.status_code == 200:
            cost = None
            if "X-Cost-USD" in resp.headers:
                try:
                    cost = float(resp.headers["X-Cost-USD"])
                except:
                    pass
            return True, resp.content, dict(resp.headers), duration
        else:
            error = resp.text[:500] if resp.text else f"HTTP {resp.status_code}"
            return False, b"", {}, duration
            
    except requests.exceptions.Timeout:
        return False, b"", {}, time.time() - start
    except Exception as e:
        return False, b"", {}, time.time() - start


def save_output(content: bytes, name: str, extension: str) -> str:
    """Save output to file and return filename."""
    filename = f"{name}_{datetime.now().strftime('%H%M%S')}.{extension}"
    filepath = OUTPUT_DIR / filename
    with open(filepath, "wb") as f:
        f.write(content)
    return str(filepath)


def image_to_base64(image_bytes: bytes) -> str:
    """Convert image bytes to base64 data URL."""
    b64 = base64.b64encode(image_bytes).decode("utf-8")
    return f"data:image/jpeg;base64,{b64}"


def run_tests():
    """Run all endpoint tests."""
    results: List[TestResult] = []
    generated_face: Optional[bytes] = None
    generated_scene: Optional[bytes] = None
    
    print("\n" + "="*60)
    print("🧪 COMPREHENSIVE MODAL ENDPOINT TEST")
    print("="*60 + "\n")
    
    # ============================================================
    # PHASE 1: Generate base images for later use
    # ============================================================
    print("\n📸 PHASE 1: Generating base images...")
    print("-"*40)
    
    # 1.1 Generate a face image with Flux Schnell (fastest)
    print("\n1.1 Generating face image with /flux...")
    success, content, headers, duration = make_request(
        "flux", "/flux",
        {"prompt": FACE_PROMPT, "width": 1024, "height": 1024, "steps": 4, "seed": 42},
        timeout=TIMEOUT_MEDIUM
    )
    cost = float(headers.get("X-Cost-USD", 0)) if success else None
    if success and len(content) > 1000:
        generated_face = content
        filepath = save_output(content, "01_flux_face", "jpg")
        results.append(TestResult("flux", "/flux", True, duration, output_file=filepath, cost=cost))
        print(f"  ✅ Face image generated ({len(content)} bytes) -> {filepath}")
    else:
        results.append(TestResult("flux", "/flux", False, duration, error="Failed to generate"))
        print(f"  ❌ Failed to generate face image")
    
    # 1.2 Generate a scene image for upscaling tests
    print("\n1.2 Generating scene image with /sdxl-lightning...")
    success, content, headers, duration = make_request(
        "instantid", "/sdxl-lightning",
        {"prompt": SCENE_PROMPT, "width": 1024, "height": 1024, "seed": 123},
        timeout=TIMEOUT_MEDIUM
    )
    cost = float(headers.get("X-Cost-USD", 0)) if success else None
    if success and len(content) > 1000:
        generated_scene = content
        filepath = save_output(content, "02_sdxl_lightning_scene", "jpg")
        results.append(TestResult("instantid", "/sdxl-lightning", True, duration, output_file=filepath, cost=cost))
        print(f"  ✅ Scene image generated ({len(content)} bytes) -> {filepath}")
    else:
        results.append(TestResult("instantid", "/sdxl-lightning", False, duration, error="Failed to generate"))
        print(f"  ❌ Failed to generate scene image")
    
    # ============================================================
    # PHASE 2: Test all image generation endpoints
    # ============================================================
    print("\n\n📸 PHASE 2: Testing image generation endpoints...")
    print("-"*40)
    
    # 2.1 Flux Dev
    print("\n2.1 Testing /flux-dev...")
    success, content, headers, duration = make_request(
        "flux", "/flux-dev",
        {"prompt": "a majestic mountain landscape with snow peaks, photorealistic", "width": 1024, "height": 768, "steps": 20, "seed": 42},
        timeout=TIMEOUT_LONG
    )
    cost = float(headers.get("X-Cost-USD", 0)) if success else None
    if success and len(content) > 1000:
        filepath = save_output(content, "03_flux_dev", "jpg")
        results.append(TestResult("flux", "/flux-dev", True, duration, output_file=filepath, cost=cost))
        print(f"  ✅ Generated ({len(content)} bytes) -> {filepath}")
    else:
        results.append(TestResult("flux", "/flux-dev", False, duration, error="Failed to generate"))
        print(f"  ❌ Failed")
    
    # 2.2 SDXL Turbo
    print("\n2.2 Testing /sdxl-turbo...")
    success, content, headers, duration = make_request(
        "instantid", "/sdxl-turbo",
        {"prompt": "a cute cat sitting on a windowsill, sunlight, cozy", "width": 1024, "height": 1024, "seed": 42},
        timeout=TIMEOUT_SHORT
    )
    cost = float(headers.get("X-Cost-USD", 0)) if success else None
    if success and len(content) > 1000:
        filepath = save_output(content, "04_sdxl_turbo", "jpg")
        results.append(TestResult("instantid", "/sdxl-turbo", True, duration, output_file=filepath, cost=cost))
        print(f"  ✅ Generated ({len(content)} bytes) -> {filepath}")
    else:
        results.append(TestResult("instantid", "/sdxl-turbo", False, duration, error="Failed to generate"))
        print(f"  ❌ Failed")
    
    # 2.3 Qwen Image 2512 Fast
    print("\n2.3 Testing /qwen-image-2512-fast...")
    success, content, headers, duration = make_request(
        "qwen-image", "/qwen-image-2512-fast",
        {"prompt": "beautiful asian woman in elegant dress, studio portrait, soft lighting", "aspect_ratio": "1:1", "seed": 42},
        timeout=TIMEOUT_MEDIUM
    )
    cost = float(headers.get("X-Cost-USD", 0)) if success else None
    if success and len(content) > 1000:
        filepath = save_output(content, "05_qwen_fast", "jpg")
        results.append(TestResult("qwen-image", "/qwen-image-2512-fast", True, duration, output_file=filepath, cost=cost))
        print(f"  ✅ Generated ({len(content)} bytes) -> {filepath}")
    else:
        results.append(TestResult("qwen-image", "/qwen-image-2512-fast", False, duration, error="Failed to generate"))
        print(f"  ❌ Failed")
    
    # ============================================================
    # PHASE 3: Test face consistency endpoints (require face image)
    # ============================================================
    print("\n\n👤 PHASE 3: Testing face consistency endpoints...")
    print("-"*40)
    
    if generated_face:
        face_b64 = image_to_base64(generated_face)
        
        # 3.1 SDXL InstantID
        print("\n3.1 Testing /sdxl-instantid...")
        success, content, headers, duration = make_request(
            "instantid", "/sdxl-instantid",
            {
                "prompt": "a woman as a medieval queen, throne room, crown, royal robes",
                "reference_image": face_b64,
                "width": 1024, "height": 1024, "steps": 20, "seed": 42,
                "instantid_strength": 0.8
            },
            timeout=TIMEOUT_LONG
        )
        cost = float(headers.get("X-Cost-USD", 0)) if success else None
        if success and len(content) > 1000:
            filepath = save_output(content, "06_sdxl_instantid", "jpg")
            results.append(TestResult("instantid", "/sdxl-instantid", True, duration, output_file=filepath, cost=cost))
            print(f"  ✅ Generated ({len(content)} bytes) -> {filepath}")
        else:
            results.append(TestResult("instantid", "/sdxl-instantid", False, duration, error="Failed to generate"))
            print(f"  ❌ Failed")
        
        # 3.2 Flux PuLID
        print("\n3.2 Testing /flux-pulid...")
        success, content, headers, duration = make_request(
            "instantid", "/flux-pulid",
            {
                "prompt": "a woman as a cyberpunk hacker, neon lights, futuristic city",
                "reference_image": face_b64,
                "width": 1024, "height": 1024, "steps": 20, "seed": 42,
                "pulid_weight": 0.8
            },
            timeout=TIMEOUT_LONG
        )
        cost = float(headers.get("X-Cost-USD", 0)) if success else None
        if success and len(content) > 1000:
            filepath = save_output(content, "07_flux_pulid", "jpg")
            results.append(TestResult("instantid", "/flux-pulid", True, duration, output_file=filepath, cost=cost))
            print(f"  ✅ Generated ({len(content)} bytes) -> {filepath}")
        else:
            results.append(TestResult("instantid", "/flux-pulid", False, duration, error="Failed to generate"))
            print(f"  ❌ Failed")
        
        # 3.3 Flux IP-Adapter FaceID
        print("\n3.3 Testing /flux-ipadapter-faceid...")
        success, content, headers, duration = make_request(
            "instantid", "/flux-ipadapter-faceid",
            {
                "prompt": "a woman as an astronaut, space station, earth in background",
                "reference_image": face_b64,
                "width": 1024, "height": 1024, "steps": 20, "seed": 42,
                "ipadapter_strength": 0.8
            },
            timeout=TIMEOUT_LONG
        )
        cost = float(headers.get("X-Cost-USD", 0)) if success else None
        if success and len(content) > 1000:
            filepath = save_output(content, "08_flux_ipadapter", "jpg")
            results.append(TestResult("instantid", "/flux-ipadapter-faceid", True, duration, output_file=filepath, cost=cost))
            print(f"  ✅ Generated ({len(content)} bytes) -> {filepath}")
        else:
            results.append(TestResult("instantid", "/flux-ipadapter-faceid", False, duration, error="Failed to generate"))
            print(f"  ❌ Failed")
    else:
        print("  ⚠️ Skipping face consistency tests - no face image generated")
        results.append(TestResult("instantid", "/sdxl-instantid", False, 0, error="No face image"))
        results.append(TestResult("instantid", "/flux-pulid", False, 0, error="No face image"))
        results.append(TestResult("instantid", "/flux-ipadapter-faceid", False, 0, error="No face image"))
    
    # ============================================================
    # PHASE 4: Test upscaling endpoint (requires image)
    # ============================================================
    print("\n\n🔍 PHASE 4: Testing upscaling endpoints...")
    print("-"*40)
    
    if generated_scene:
        scene_b64 = image_to_base64(generated_scene)
        
        # 4.1 SeedVR2 Upscaler
        print("\n4.1 Testing /seedvr2...")
        success, content, headers, duration = make_request(
            "seedvr2", "/seedvr2",
            {
                "image": scene_b64,
                "resolution": 1080,
                "seed": 42
            },
            timeout=TIMEOUT_LONG
        )
        cost = float(headers.get("X-Cost-USD", 0)) if success else None
        if success and len(content) > 1000:
            filepath = save_output(content, "09_seedvr2_upscaled", "png")
            results.append(TestResult("seedvr2", "/seedvr2", True, duration, output_file=filepath, cost=cost))
            print(f"  ✅ Upscaled ({len(content)} bytes) -> {filepath}")
        else:
            results.append(TestResult("seedvr2", "/seedvr2", False, duration, error="Failed to upscale"))
            print(f"  ❌ Failed")
    else:
        print("  ⚠️ Skipping upscaling test - no source image")
        results.append(TestResult("seedvr2", "/seedvr2", False, 0, error="No source image"))
    
    # ============================================================
    # PHASE 5: Test video generation endpoints
    # ============================================================
    print("\n\n🎬 PHASE 5: Testing video generation endpoints...")
    print("-"*40)
    
    # 5.1 Wan 2.1 (basic video)
    print("\n5.1 Testing /wan2...")
    success, content, headers, duration = make_request(
        "wan26", "/wan2",
        {
            "prompt": VIDEO_PROMPT,
            "width": 832, "height": 480, "length": 17, "steps": 20, "fps": 16, "seed": 42
        },
        timeout=TIMEOUT_LONG
    )
    cost = float(headers.get("X-Cost-USD", 0)) if success else None
    if success and len(content) > 1000:
        filepath = save_output(content, "10_wan2_video", "webp")
        results.append(TestResult("wan26", "/wan2", True, duration, output_file=filepath, cost=cost))
        print(f"  ✅ Generated ({len(content)} bytes) -> {filepath}")
    else:
        results.append(TestResult("wan26", "/wan2", False, duration, error="Failed to generate"))
        print(f"  ❌ Failed")
    
    # 5.2 Wan 2.6 (upgraded video)
    print("\n5.2 Testing /wan2.6...")
    success, content, headers, duration = make_request(
        "wan26", "/wan2.6",
        {
            "prompt": "a spaceship flying through an asteroid field, dramatic lighting, cinematic",
            "width": 832, "height": 480, "length": 17, "steps": 20, "fps": 16, "seed": 42
        },
        timeout=TIMEOUT_LONG
    )
    cost = float(headers.get("X-Cost-USD", 0)) if success else None
    if success and len(content) > 1000:
        filepath = save_output(content, "11_wan26_video", "webp")
        results.append(TestResult("wan26", "/wan2.6", True, duration, output_file=filepath, cost=cost))
        print(f"  ✅ Generated ({len(content)} bytes) -> {filepath}")
    else:
        results.append(TestResult("wan26", "/wan2.6", False, duration, error="Failed to generate"))
        print(f"  ❌ Failed")
    
    # ============================================================
    # PHASE 6: Health checks for remaining apps
    # ============================================================
    print("\n\n💓 PHASE 6: Health checks for remaining apps...")
    print("-"*40)
    
    for app_name in ["z-image"]:
        print(f"\n6.x Testing {app_name} /health...")
        url = f"{APPS[app_name]}/health"
        try:
            start = time.time()
            resp = requests.get(url, timeout=120)
            duration = time.time() - start
            if resp.status_code == 200:
                results.append(TestResult(app_name, "/health", True, duration))
                print(f"  ✅ Healthy ({duration:.1f}s)")
            else:
                results.append(TestResult(app_name, "/health", False, duration, error=f"HTTP {resp.status_code}"))
                print(f"  ❌ Failed - HTTP {resp.status_code}")
        except Exception as e:
            results.append(TestResult(app_name, "/health", False, 0, error=str(e)))
            print(f"  ❌ Failed - {e}")
    
    # ============================================================
    # SUMMARY
    # ============================================================
    print("\n\n" + "="*60)
    print("📊 TEST SUMMARY")
    print("="*60)
    
    passed = sum(1 for r in results if r.success)
    failed = sum(1 for r in results if not r.success)
    total_duration = sum(r.duration for r in results)
    total_cost = sum(r.cost for r in results if r.cost)
    
    print(f"\nResults: {passed}/{len(results)} passed, {failed} failed")
    print(f"Total time: {total_duration:.1f}s ({total_duration/60:.1f} min)")
    print(f"Total cost: ${total_cost:.4f}")
    print(f"\nOutputs saved to: {OUTPUT_DIR}")
    
    print("\n--- Detailed Results ---")
    for r in results:
        print(f"  {r}")
    
    print("\n" + "="*60)
    
    # Return exit code
    return 0 if failed == 0 else 1


if __name__ == "__main__":
    sys.exit(run_tests())
