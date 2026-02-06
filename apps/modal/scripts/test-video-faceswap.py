#!/usr/bin/env python3
"""
Test Video Generation and Face Swap Endpoints

Tests:
1. WAN 2.6 I2V - Image to Video
2. WAN 2.2 I2V - Image to Video with GGUF models  
3. WAN 2.2 I2V FaceSwap - Image to Video + Face Swap
4. Image FaceSwap - Single image face swap
5. Batch Video FaceSwap - Video face swap frame by frame

Uses real AI influencer images for testing.
"""

import base64
import json
import os
import requests
import time
import urllib.request
from datetime import datetime
from pathlib import Path

WORKSPACE = "ryla"
TIMEOUT = 600  # 10 minutes for video generation

# Endpoint URLs
ENDPOINTS = {
    "wan26_t2v": f"https://{WORKSPACE}--ryla-wan26-comfyui-fastapi-app.modal.run/wan2.6",
    "wan26_i2v": f"https://{WORKSPACE}--ryla-wan26-comfyui-fastapi-app.modal.run/wan2.6-i2v",
    "wan26_i2v_faceswap": f"https://{WORKSPACE}--ryla-wan26-comfyui-fastapi-app.modal.run/wan2.6-i2v-faceswap",
    "wan22_i2v": f"https://{WORKSPACE}--ryla-wan22-i2v-comfyui-fastapi-app.modal.run/wan22-i2v",
    "wan22_i2v_faceswap": f"https://{WORKSPACE}--ryla-wan22-i2v-comfyui-fastapi-app.modal.run/wan22-i2v-faceswap",
    "image_faceswap": f"https://{WORKSPACE}--ryla-qwen-image-comfyui-fastapi-app.modal.run/image-faceswap",
    "batch_video_faceswap": f"https://{WORKSPACE}--ryla-qwen-image-comfyui-fastapi-app.modal.run/batch-video-faceswap",
}

# Sample images for testing
SAMPLE_IMAGES = {
    "influencer": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=512&q=80",  # Woman portrait
    "face_ref": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=512&q=80",  # Another woman for face swap
}

OUTPUT_DIR = Path(__file__).parent.parent / "test-output"


class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    RESET = '\033[0m'
    BOLD = '\033[1m'


def print_header(text: str):
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*70}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{text}{Colors.RESET}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*70}{Colors.RESET}\n")


def print_success(text: str):
    print(f"{Colors.GREEN}✅ {text}{Colors.RESET}")


def print_error(text: str):
    print(f"{Colors.RED}❌ {text}{Colors.RESET}")


def print_info(text: str):
    print(f"{Colors.BLUE}ℹ️  {text}{Colors.RESET}")


def download_image(url: str) -> bytes:
    """Download image from URL."""
    print(f"   Downloading: {url[:60]}...")
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=30) as response:
        return response.read()


def encode_image_bytes(image_bytes: bytes, ext: str = "jpg") -> str:
    """Encode image bytes to base64 data URI."""
    b64 = base64.b64encode(image_bytes).decode("utf-8")
    mime = "image/jpeg" if ext in ["jpg", "jpeg"] else "image/png" if ext == "png" else "image/webp"
    return f"data:{mime};base64,{b64}"


def save_output(content: bytes, name: str, ext: str):
    """Save output to file."""
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filepath = OUTPUT_DIR / f"{name}_{timestamp}.{ext}"
    filepath.write_bytes(content)
    print_success(f"Saved: {filepath}")
    return filepath


def test_health(name: str, base_url: str) -> bool:
    """Test health endpoint."""
    health_url = base_url.rsplit("/", 1)[0] + "/health"
    try:
        response = requests.get(health_url, timeout=120)
        if response.status_code == 200:
            print_success(f"{name} health: OK")
            return True
        else:
            print_error(f"{name} health: {response.status_code}")
            return False
    except Exception as e:
        print_error(f"{name} health: {e}")
        return False


def test_wan26_t2v():
    """Test WAN 2.6 text-to-video (baseline)."""
    print_header("Test 1: WAN 2.6 Text-to-Video (T2V)")
    
    # Check health first
    if not test_health("WAN26", ENDPOINTS["wan26_t2v"]):
        return False
    
    payload = {
        "prompt": "A beautiful woman with long brown hair smiling, walking in a sunny park, professional photography, 4k quality",
        "width": 832,
        "height": 480,
        "length": 33,  # Standard video length
        "steps": 30,  # Higher quality
        "cfg": 6.0,
        "fps": 16,
    }
    
    print_info(f"Generating T2V with prompt: {payload['prompt'][:50]}...")
    
    start = time.time()
    try:
        response = requests.post(ENDPOINTS["wan26_t2v"], json=payload, timeout=TIMEOUT)
        elapsed = time.time() - start
        
        if response.status_code == 200:
            print_success(f"WAN 2.6 T2V: {elapsed:.1f}s, {len(response.content)/1024:.1f}KB")
            save_output(response.content, "wan26_t2v", "webp")
            return True
        else:
            print_error(f"WAN 2.6 T2V failed: {response.status_code} - {response.text[:200]}")
            return False
    except Exception as e:
        print_error(f"WAN 2.6 T2V error: {e}")
        return False


def test_wan26_i2v(source_image: str):
    """Test WAN 2.6 image-to-video."""
    print_header("Test 2: WAN 2.6 Image-to-Video (I2V)")
    
    payload = {
        "prompt": "A woman smiling and looking at the camera, gentle movement, professional portrait",
        "reference_image": source_image,
        "width": 832,
        "height": 480,
        "length": 33,
        "steps": 30,  # Higher quality
        "cfg": 6.0,
        "fps": 16,
    }
    
    print_info("Generating I2V from source image...")
    
    start = time.time()
    try:
        response = requests.post(ENDPOINTS["wan26_i2v"], json=payload, timeout=TIMEOUT)
        elapsed = time.time() - start
        
        if response.status_code == 200:
            print_success(f"WAN 2.6 I2V: {elapsed:.1f}s, {len(response.content)/1024:.1f}KB")
            save_output(response.content, "wan26_i2v", "webp")
            return True
        else:
            print_error(f"WAN 2.6 I2V failed: {response.status_code} - {response.text[:200]}")
            return False
    except Exception as e:
        print_error(f"WAN 2.6 I2V error: {e}")
        return False


def test_wan22_i2v(source_image: str):
    """Test WAN 2.2 I2V with GGUF models."""
    print_header("Test 3: WAN 2.2 I2V (GGUF)")
    
    # Check health first
    if not test_health("WAN22-I2V", ENDPOINTS["wan22_i2v"]):
        return False
    
    payload = {
        "source_image": source_image,
        "prompt": "A woman smiling and nodding gently, soft natural movement, high quality, detailed",
        "width": 832,
        "height": 480,
        "num_frames": 49,  # More frames for smoother video
        "steps": 40,  # More steps for better quality
        "cfg": 5.0,  # Higher CFG for better prompt adherence
        "fps": 16,
    }
    
    print_info("Generating I2V with WAN 2.2 GGUF model...")
    
    start = time.time()
    try:
        response = requests.post(ENDPOINTS["wan22_i2v"], json=payload, timeout=TIMEOUT)
        elapsed = time.time() - start
        
        if response.status_code == 200:
            print_success(f"WAN 2.2 I2V: {elapsed:.1f}s, {len(response.content)/1024:.1f}KB")
            save_output(response.content, "wan22_i2v", "webp")
            return True
        else:
            print_error(f"WAN 2.2 I2V failed: {response.status_code} - {response.text[:200]}")
            return False
    except Exception as e:
        print_error(f"WAN 2.2 I2V error: {e}")
        return False


def test_wan22_i2v_faceswap(source_image: str, face_image: str):
    """Test WAN 2.2 I2V with face swap."""
    print_header("Test 4: WAN 2.2 I2V + Face Swap")
    
    payload = {
        "source_image": source_image,
        "face_image": face_image,
        "prompt": "A woman talking and smiling at camera, professional video",
        "width": 832,
        "height": 480,
        "num_frames": 33,  # ~2s at 16fps for faster face swap
        "steps": 30,
        "cfg": 5.0,
        "fps": 16,
    }
    
    print_info("Generating I2V + face swap (via Qwen)...")
    
    start = time.time()
    try:
        response = requests.post(ENDPOINTS["wan22_i2v_faceswap"], json=payload, timeout=900)
        elapsed = time.time() - start
        
        if response.status_code == 200:
            print_success(f"WAN 2.2 I2V FaceSwap: {elapsed:.1f}s, {len(response.content)/1024:.1f}KB")
            save_output(response.content, "wan22_i2v_faceswap", "mp4")
            return True
        else:
            print_error(f"WAN 2.2 I2V FaceSwap failed: {response.status_code} - {response.text[:200]}")
            return False
    except Exception as e:
        print_error(f"WAN 2.2 I2V FaceSwap error: {e}")
        return False


def test_wan26_i2v_faceswap(source_image: str, face_image: str):
    """Test WAN 2.6 I2V with face swap (via Qwen)."""
    print_header("Test 5: WAN 2.6 I2V + Face Swap")
    
    payload = {
        "prompt": "A woman smiling and looking at camera, natural movement",
        "reference_image": source_image,
        "face_image": face_image,
        "width": 832,
        "height": 480,
        "length": 33,
        "steps": 30,
        "cfg": 6.0,
        "fps": 16,
    }
    
    print_info("Generating I2V + face swap (via Qwen)...")
    
    start = time.time()
    try:
        response = requests.post(ENDPOINTS["wan26_i2v_faceswap"], json=payload, timeout=900)
        elapsed = time.time() - start
        
        if response.status_code == 200:
            print_success(f"WAN 2.6 I2V FaceSwap: {elapsed:.1f}s, {len(response.content)/1024:.1f}KB")
            save_output(response.content, "wan26_i2v_faceswap", "mp4")
            return True
        else:
            print_error(f"WAN 2.6 I2V FaceSwap failed: {response.status_code} - {response.text[:200]}")
            return False
    except Exception as e:
        print_error(f"WAN 2.6 I2V FaceSwap error: {e}")
        return False


def test_image_faceswap(source_image: str, face_image: str):
    """Test single image face swap."""
    print_header("Test 6: Image Face Swap")
    
    # Check health first
    if not test_health("Qwen-Image", ENDPOINTS["image_faceswap"]):
        return False
    
    payload = {
        "source_image": source_image,
        "reference_image": face_image,  # Face to swap IN
        "restore_face": True,
    }
    
    print_info("Swapping face in single image...")
    
    start = time.time()
    try:
        response = requests.post(ENDPOINTS["image_faceswap"], json=payload, timeout=TIMEOUT)
        elapsed = time.time() - start
        
        if response.status_code == 200:
            print_success(f"Image FaceSwap: {elapsed:.1f}s, {len(response.content)/1024:.1f}KB")
            save_output(response.content, "image_faceswap", "png")
            return True
        else:
            print_error(f"Image FaceSwap failed: {response.status_code} - {response.text[:200]}")
            return False
    except Exception as e:
        print_error(f"Image FaceSwap error: {e}")
        return False


def main():
    print_header("RYLA Video Generation & Face Swap Endpoint Tests")
    print(f"Output directory: {OUTPUT_DIR}")
    print(f"Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Download sample images
    print("\n📥 Downloading sample images...")
    try:
        influencer_bytes = download_image(SAMPLE_IMAGES["influencer"])
        face_ref_bytes = download_image(SAMPLE_IMAGES["face_ref"])
        
        influencer_b64 = encode_image_bytes(influencer_bytes)
        face_ref_b64 = encode_image_bytes(face_ref_bytes)
        
        # Save source images for reference
        OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
        (OUTPUT_DIR / "source_influencer.jpg").write_bytes(influencer_bytes)
        (OUTPUT_DIR / "source_face_ref.jpg").write_bytes(face_ref_bytes)
        print_success("Downloaded and saved sample images")
    except Exception as e:
        print_error(f"Failed to download sample images: {e}")
        return
    
    results = {}
    
    # Test 1: WAN 2.6 T2V
    results["wan26_t2v"] = test_wan26_t2v()
    
    # Test 2: WAN 2.6 I2V
    results["wan26_i2v"] = test_wan26_i2v(influencer_b64)
    
    # Test 3: WAN 2.2 I2V
    results["wan22_i2v"] = test_wan22_i2v(influencer_b64)
    
    # Test 4: WAN 2.2 I2V + FaceSwap
    results["wan22_i2v_faceswap"] = test_wan22_i2v_faceswap(influencer_b64, face_ref_b64)
    
    # Test 5: WAN 2.6 I2V + FaceSwap
    results["wan26_i2v_faceswap"] = test_wan26_i2v_faceswap(influencer_b64, face_ref_b64)
    
    # Test 6: Image FaceSwap
    results["image_faceswap"] = test_image_faceswap(influencer_b64, face_ref_b64)
    
    # Summary
    print_header("Test Results Summary")
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, success in results.items():
        status = f"{Colors.GREEN}PASS{Colors.RESET}" if success else f"{Colors.RED}FAIL{Colors.RESET}"
        print(f"  {test_name}: {status}")
    
    print(f"\n{Colors.BOLD}Total: {passed}/{total} passed{Colors.RESET}")
    
    if passed == total:
        print_success("All tests passed!")
    else:
        print_error(f"{total - passed} tests failed")
    
    print(f"\nOutput files saved to: {OUTPUT_DIR}")


if __name__ == "__main__":
    main()
