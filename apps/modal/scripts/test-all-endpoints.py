#!/usr/bin/env python3
"""
Comprehensive Modal Endpoint Testing Script

Tests all Modal endpoints systematically and reports results.
"""

import sys
import json
import base64
import requests
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

WORKSPACE = "ryla"
TIMEOUT = 300  # 5 minutes for cold starts

# Split-app URL mapping (must match apps/modal/ENDPOINT-APP-MAPPING.md)
SPLIT_APPS = {
    "/flux": f"https://{WORKSPACE}--ryla-flux-comfyui-fastapi-app.modal.run/flux",
    "/flux-dev": f"https://{WORKSPACE}--ryla-flux-comfyui-fastapi-app.modal.run/flux-dev",
    "/flux-dev-lora": f"https://{WORKSPACE}--ryla-flux-comfyui-fastapi-app.modal.run/flux-dev-lora",
    "/sdxl-instantid": f"https://{WORKSPACE}--ryla-instantid-comfyui-fastapi-app.modal.run/sdxl-instantid",
    "/sdxl-turbo": f"https://{WORKSPACE}--ryla-instantid-comfyui-fastapi-app.modal.run/sdxl-turbo",
    "/sdxl-lightning": f"https://{WORKSPACE}--ryla-instantid-comfyui-fastapi-app.modal.run/sdxl-lightning",
    "/flux-pulid": f"https://{WORKSPACE}--ryla-instantid-comfyui-fastapi-app.modal.run/flux-pulid",
    "/flux-ipadapter-faceid": f"https://{WORKSPACE}--ryla-instantid-comfyui-fastapi-app.modal.run/flux-ipadapter-faceid",
    "/qwen-image-2512": f"https://{WORKSPACE}--ryla-qwen-image-comfyui-fastapi-app.modal.run/qwen-image-2512",
    "/qwen-image-2512-fast": f"https://{WORKSPACE}--ryla-qwen-image-comfyui-fastapi-app.modal.run/qwen-image-2512-fast",
    "/qwen-image-2512-lora": f"https://{WORKSPACE}--ryla-qwen-image-comfyui-fastapi-app.modal.run/qwen-image-2512-lora",
    "/video-faceswap": f"https://{WORKSPACE}--ryla-qwen-image-comfyui-fastapi-app.modal.run/video-faceswap",
    "/qwen-image-edit-2511": f"https://{WORKSPACE}--ryla-qwen-edit-comfyui-fastapi-app.modal.run/qwen-image-edit-2511",
    "/qwen-image-inpaint-2511": f"https://{WORKSPACE}--ryla-qwen-edit-comfyui-fastapi-app.modal.run/qwen-image-inpaint-2511",
    "/z-image-simple": f"https://{WORKSPACE}--ryla-z-image-comfyui-fastapi-app.modal.run/z-image-simple",
    "/z-image-danrisi": f"https://{WORKSPACE}--ryla-z-image-comfyui-fastapi-app.modal.run/z-image-danrisi",
    "/z-image-lora": f"https://{WORKSPACE}--ryla-z-image-comfyui-fastapi-app.modal.run/z-image-lora",
    "/wan2.6": f"https://{WORKSPACE}--ryla-wan26-comfyui-fastapi-app.modal.run/wan2.6",
    "/wan2.6-r2v": f"https://{WORKSPACE}--ryla-wan26-comfyui-fastapi-app.modal.run/wan2.6-r2v",
    "/wan2.6-lora": f"https://{WORKSPACE}--ryla-wan26-comfyui-fastapi-app.modal.run/wan2.6-lora",
    "/seedvr2": f"https://{WORKSPACE}--ryla-seedvr2-comfyui-fastapi-app.modal.run/seedvr2",
}


def get_url(path: str) -> str:
    """Return full URL for an endpoint path (split-app aware)."""
    path = path if path.startswith("/") else f"/{path}"
    return SPLIT_APPS.get(path, f"https://{WORKSPACE}--ryla-comfyui-comfyui-fastapi-app.modal.run{path}")

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

def print_warning(text: str):
    print(f"{Colors.YELLOW}⚠️  {text}{Colors.RESET}")

def print_info(text: str):
    print(f"{Colors.BLUE}ℹ️  {text}{Colors.RESET}")

def encode_image(image_path: Path) -> str:
    """Encode image to base64 data URI."""
    with open(image_path, "rb") as f:
        image_bytes = f.read()
        image_b64 = base64.b64encode(image_bytes).decode("utf-8")
        ext = image_path.suffix.lower()
        mime_type = "image/jpeg" if ext in [".jpg", ".jpeg"] else "image/png" if ext == ".png" else "image/webp"
        return f"data:{mime_type};base64,{image_b64}"

def test_endpoint(name: str, url: str, payload: dict, requires_file: bool = False) -> Tuple[bool, str, dict]:
    """Test a single endpoint."""
    print(f"\n{Colors.BOLD}Testing: {name}{Colors.RESET}")
    print(f"  URL: {url}")
    print(f"  Payload keys: {list(payload.keys())}")
    
    try:
        start_time = datetime.now()
        response = requests.post(url, json=payload, timeout=TIMEOUT)
        elapsed = (datetime.now() - start_time).total_seconds()
        
        if response.status_code == 200:
            # Check if response is an image
            content_type = response.headers.get("Content-Type", "")
            if "image" in content_type:
                size_kb = len(response.content) / 1024
                cost = response.headers.get("X-Cost-USD", "N/A")
                exec_time = response.headers.get("X-Execution-Time-Sec", "N/A")
                print_success(f"Status: 200 OK")
                print_info(f"Response time: {elapsed:.1f}s")
                print_info(f"Image size: {size_kb:.1f} KB")
                print_info(f"Cost: ${cost}")
                print_info(f"Execution time: {exec_time}s")
                return True, "Success", {
                    "status_code": 200,
                    "response_time": elapsed,
                    "size_kb": size_kb,
                    "cost": cost,
                    "exec_time": exec_time
                }
            else:
                # Try to parse as JSON
                try:
                    result = response.json()
                    print_success(f"Status: 200 OK")
                    print_info(f"Response: {json.dumps(result, indent=2)[:200]}...")
                    return True, "Success", {"status_code": 200, "response": result}
                except:
                    print_success(f"Status: 200 OK")
                    print_info(f"Response length: {len(response.content)} bytes")
                    return True, "Success", {"status_code": 200}
        else:
            error_text = response.text[:500] if response.text else "No error message"
            print_error(f"Status: {response.status_code}")
            print_error(f"Error: {error_text}")
            return False, f"HTTP {response.status_code}: {error_text}", {
                "status_code": response.status_code,
                "error": error_text
            }
    except requests.exceptions.Timeout:
        print_error("Request timed out")
        return False, "Timeout", {"error": "Request timed out"}
    except Exception as e:
        print_error(f"Exception: {str(e)}")
        return False, str(e), {"error": str(e)}

def main():
    print_header("RYLA Modal Endpoints - Comprehensive Test")
    print("Using split-app URLs (see apps/modal/ENDPOINT-APP-MAPPING.md)")
    print(f"Test started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
    
    results = {}
    
    # Check for test images
    test_image = Path("test_image_for_seedvr2.jpg")
    if not test_image.exists():
        print_warning("Test image not found. Generating one with /flux...")
        # Generate test image first
        flux_payload = {
            "prompt": "A simple test image, high quality",
            "width": 1024,
            "height": 1024,
            "steps": 4,
            "cfg": 1.0
        }
        success, msg, data = test_endpoint("Flux (for test image)", get_url("/flux"), flux_payload)
        if success and "size_kb" in data:
            # Save the image
            response = requests.post(get_url("/flux"), json=flux_payload, timeout=TIMEOUT)
            if response.status_code == 200:
                test_image.parent.mkdir(exist_ok=True)
                with open(test_image, "wb") as f:
                    f.write(response.content)
                print_success(f"Test image saved: {test_image}")
    
    reference_image = test_image if test_image.exists() else None
    
    # Test endpoints
    endpoints = [
        # 1. Basic text-to-image
        {
            "name": "/flux",
            "url": get_url("/flux"),
            "payload": {
                "prompt": "A beautiful landscape with mountains and a lake, photorealistic, high quality",
                "width": 1024,
                "height": 1024,
                "steps": 4,
                "cfg": 1.0
            }
        },
        {
            "name": "/flux-dev",
            "url": get_url("/flux-dev"),
            "payload": {
                "prompt": "A detailed portrait of a person, professional photography, high quality",
                "width": 1024,
                "height": 1024,
                "steps": 20,
                "cfg": 1.0
            }
        },
        # 2. Face consistency (need reference image)
        {
            "name": "/flux-ipadapter-faceid",
            "url": get_url("/flux-ipadapter-faceid"),
            "payload": {
                "prompt": "A professional AI influencer portrait, high quality, detailed face, studio lighting",
                "reference_image": encode_image(reference_image) if reference_image else None,
                "width": 1024,
                "height": 1024,
                "steps": 20,
                "cfg": 1.0,
                "face_provider": "CPU"
            },
            "requires_file": True
        },
        {
            "name": "/sdxl-instantid",
            "url": get_url("/sdxl-instantid"),
            "payload": {
                "prompt": "A professional AI influencer portrait, high quality, detailed face, studio lighting",
                "reference_image": encode_image(reference_image) if reference_image else None,
                "width": 1024,
                "height": 1024,
                "steps": 20,
                "cfg": 7.0,
                "face_provider": "CPU"
            },
            "requires_file": True
        },
        {
            "name": "/flux-instantid",
            "url": get_url("/flux-instantid"),
            "payload": {
                "prompt": "A professional AI influencer portrait, high quality, detailed face, studio lighting",
                "reference_image": encode_image(reference_image) if reference_image else None,
                "width": 1024,
                "height": 1024,
                "steps": 20,
                "cfg": 1.0,
                "face_provider": "CPU"
            },
            "requires_file": True,
            "expected_fail": True  # Known incompatible
        },
        # 3. Video
        {
            "name": "/wan2",
            "url": get_url("/wan2.6"),
            "payload": {
                "prompt": "A beautiful landscape animation, cinematic, high quality",
                "width": 512,
                "height": 512,
                "length": 16,
                "fps": 16,
                "steps": 30,
                "cfg": 6
            }
        },
        # 4. Upscaling
        {
            "name": "/seedvr2",
            "url": get_url("/seedvr2"),
            "payload": {
                "image": encode_image(reference_image) if reference_image else None,
                "resolution": 1080
            },
            "requires_file": True
        },
        # 5. Z-Image workflows
        {
            "name": "/z-image-simple",
            "url": get_url("/z-image-simple"),
            "payload": {
                "prompt": "A beautiful landscape with mountains and a lake, photorealistic, high quality",
                "width": 1024,
                "height": 1024,
                "steps": 9,
                "cfg": 1.0
            }
        },
        {
            "name": "/z-image-danrisi",
            "url": get_url("/z-image-danrisi"),
            "payload": {
                "prompt": "A beautiful landscape with mountains and a lake, photorealistic, high quality",
                "width": 1024,
                "height": 1024,
                "steps": 20,
                "cfg": 1.0
            }
        },
        {
            "name": "/z-image-instantid",
            "url": get_url("/sdxl-instantid"),
            "payload": {
                "prompt": "A professional AI influencer portrait, high quality, detailed face, studio lighting",
                "reference_image": encode_image(reference_image) if reference_image else None,
                "width": 1024,
                "height": 1024,
                "steps": 20,
                "cfg": 1.0,
                "instantid_strength": 0.8,
                "controlnet_strength": 0.8,
                "face_provider": "CPU"
            },
            "requires_file": True
        },
        {
            "name": "/z-image-pulid",
            "url": get_url("/flux-pulid"),
            "payload": {
                "prompt": "A professional AI influencer portrait, high quality, detailed face, studio lighting",
                "reference_image": encode_image(reference_image) if reference_image else None,
                "width": 1024,
                "height": 1024,
                "steps": 20,
                "cfg": 1.0,
                "pulid_strength": 0.8,
                "face_provider": "CPU"
            },
            "requires_file": True
        },
        # 6. LoRA (skip - requires LoRA file in volume)
        {
            "name": "/flux-lora",
            "url": get_url("/flux-dev-lora"),
            "payload": {
                "prompt": "A character in a scene, high quality",
                "lora_id": "test_lora",  # May not exist
                "width": 1024,
                "height": 1024,
                "steps": 20,
                "cfg": 1.0
            },
            "skip": True,  # Requires LoRA file
            "note": "Requires LoRA file in Modal volume"
        },
        # 7. Custom workflow (skip - requires workflow JSON)
        {
            "name": "/workflow",
            "url": get_url("/flux"),
            "payload": {
                "workflow": {}  # Empty - will likely fail
            },
            "skip": True,
            "note": "Requires valid workflow JSON"
        }
    ]
    
    # Test each endpoint
    for endpoint in endpoints:
        if endpoint.get("skip"):
            print_warning(f"Skipping {endpoint['name']}: {endpoint.get('note', 'Skipped')}")
            results[endpoint['name']] = {
                "status": "skipped",
                "note": endpoint.get("note", "Skipped")
            }
            continue
        
        if endpoint.get("requires_file") and not reference_image:
            print_warning(f"Skipping {endpoint['name']}: Requires reference image")
            results[endpoint['name']] = {
                "status": "skipped",
                "note": "Requires reference image"
            }
            continue
        
        # Remove None values from payload
        payload = {k: v for k, v in endpoint['payload'].items() if v is not None}
        
        success, message, data = test_endpoint(
            endpoint['name'],
            endpoint['url'],
            payload,
            endpoint.get("requires_file", False)
        )
        
        if endpoint.get("expected_fail"):
            # For known failures, mark as expected
            results[endpoint['name']] = {
                "status": "expected_fail" if not success else "unexpected_success",
                "message": message,
                "data": data,
                "note": "Known incompatible endpoint"
            }
        else:
            results[endpoint['name']] = {
                "status": "success" if success else "failed",
                "message": message,
                "data": data
            }
    
    # Print summary
    print_header("Test Results Summary")
    
    success_count = sum(1 for r in results.values() if r.get("status") == "success")
    failed_count = sum(1 for r in results.values() if r.get("status") == "failed")
    skipped_count = sum(1 for r in results.values() if r.get("status") == "skipped")
    expected_fail_count = sum(1 for r in results.values() if r.get("status") == "expected_fail")
    total = len(results)
    
    print(f"\n{Colors.BOLD}Total Endpoints: {total}{Colors.RESET}")
    print_success(f"Working: {success_count}")
    print_error(f"Failed: {failed_count}")
    print_warning(f"Skipped: {skipped_count}")
    if expected_fail_count > 0:
        print_warning(f"Expected Failures: {expected_fail_count}")
    
    print(f"\n{Colors.BOLD}Success Rate: {success_count}/{total - skipped_count - expected_fail_count} ({100 * success_count / max(1, total - skipped_count - expected_fail_count):.1f}%){Colors.RESET}")
    
    # Detailed results
    print_header("Detailed Results")
    for endpoint_name, result in results.items():
        status = result.get("status", "unknown")
        if status == "success":
            print_success(f"{endpoint_name}: ✅ Working")
            if "size_kb" in result.get("data", {}):
                print(f"   Size: {result['data']['size_kb']:.1f} KB")
            if "cost" in result.get("data", {}):
                print(f"   Cost: ${result['data']['cost']}")
        elif status == "failed":
            print_error(f"{endpoint_name}: ❌ Failed - {result.get('message', 'Unknown error')}")
        elif status == "skipped":
            print_warning(f"{endpoint_name}: ⏭️  Skipped - {result.get('note', 'N/A')}")
        elif status == "expected_fail":
            print_warning(f"{endpoint_name}: ⚠️  Expected Failure - {result.get('note', 'Known issue')}")
    
    # Save results to file
    results_file = Path("apps/modal/docs/status/ENDPOINT-TEST-RESULTS.json")
    results_file.parent.mkdir(parents=True, exist_ok=True)
    with open(results_file, "w") as f:
        json.dump({
            "test_date": datetime.now().isoformat(),
            "split_apps": True,
            "results": results,
            "summary": {
                "total": total,
                "success": success_count,
                "failed": failed_count,
                "skipped": skipped_count,
                "expected_fail": expected_fail_count
            }
        }, f, indent=2)
    
    print_success(f"\nResults saved to: {results_file}")
    
    return 0 if failed_count == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
