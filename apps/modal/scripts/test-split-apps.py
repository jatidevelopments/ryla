#!/usr/bin/env python3
"""
Test script for split Modal apps.

Tests endpoints across the new app structure where each workflow has its own app.
"""

import sys
import json
import base64
import requests
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Tuple, Optional

TIMEOUT = 300  # 5 minutes for cold starts

# Endpoint to app mapping
ENDPOINT_APP_MAP = {
    # Flux app
    "/flux": "ryla-flux",
    "/flux-dev": "ryla-flux",
    
    # Wan2 app
    "/wan2": "ryla-wan2",
    
    # SeedVR2 app
    "/seedvr2": "ryla-seedvr2",
    
    # InstantID app
    "/flux-instantid": "ryla-instantid",
    "/sdxl-instantid": "ryla-instantid",
    "/flux-ipadapter-faceid": "ryla-instantid",
    
    # Z-Image app
    "/z-image-simple": "ryla-z-image",
    "/z-image-danrisi": "ryla-z-image",
    "/z-image-instantid": "ryla-z-image",
    "/z-image-pulid": "ryla-z-image",
}

WORKSPACE = "ryla"  # Default workspace

def get_app_url(app_name: str, workspace: str = WORKSPACE) -> str:
    """Get the Modal app URL for a given app name."""
    return f"https://{workspace}--{app_name}-comfyui-fastapi-app.modal.run"

def get_endpoint_url(endpoint: str, workspace: str = WORKSPACE) -> str:
    """Get the full URL for an endpoint."""
    app_name = ENDPOINT_APP_MAP.get(endpoint)
    if not app_name:
        raise ValueError(f"Unknown endpoint: {endpoint}")
    base_url = get_app_url(app_name, workspace)
    return f"{base_url}{endpoint}"

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

def test_endpoint(name: str, endpoint: str, payload: dict, requires_file: bool = False, test_image_path: Optional[Path] = None) -> Tuple[bool, str, dict]:
    """Test a single endpoint."""
    url = get_endpoint_url(endpoint)
    app_name = ENDPOINT_APP_MAP.get(endpoint, "unknown")
    
    print(f"\n{Colors.BOLD}Testing: {name}{Colors.RESET}")
    print(f"  Endpoint: {endpoint}")
    print(f"  App: {app_name}")
    print(f"  URL: {url}")
    print(f"  Payload keys: {list(payload.keys())}")
    
    try:
        start_time = datetime.now()
        response = requests.post(url, json=payload, timeout=TIMEOUT)
        elapsed = (datetime.now() - start_time).total_seconds()
        
        if response.status_code == 200:
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
                    "exec_time": exec_time,
                }
            else:
                print_warning(f"Unexpected content type: {content_type}")
                return False, f"Unexpected content type: {content_type}", {}
        else:
            error_text = response.text[:500] if response.text else "No error message"
            print_error(f"Status: {response.status_code}")
            print_error(f"Error: {error_text}")
            return False, f"HTTP {response.status_code}: {error_text}", {
                "status_code": response.status_code,
                "error": error_text,
            }
    except requests.exceptions.Timeout:
        print_error("Request timed out")
        return False, "Timeout", {}
    except Exception as e:
        print_error(f"Exception: {str(e)}")
        return False, str(e), {}

def main():
    print_header("RYLA Modal Apps - Endpoint Testing")
    print_info(f"Workspace: {WORKSPACE}")
    print_info(f"Testing {len(ENDPOINT_APP_MAP)} endpoints across {len(set(ENDPOINT_APP_MAP.values()))} apps")
    
    # Generate test image if needed
    test_image_path = Path("test_image_for_seedvr2.jpg")
    if not test_image_path.exists():
        print_info("Generating test image using Flux endpoint...")
        flux_url = get_endpoint_url("/flux")
        flux_payload = {
            "prompt": "A simple test image for endpoint testing",
            "width": 512,
            "height": 512,
            "steps": 4,
        }
        try:
            response = requests.post(flux_url, json=flux_payload, timeout=TIMEOUT)
            if response.status_code == 200:
                with open(test_image_path, "wb") as f:
                    f.write(response.content)
                print_success(f"Test image saved: {test_image_path}")
            else:
                print_warning(f"Failed to generate test image: {response.status_code}")
                test_image_path = None
        except Exception as e:
            print_warning(f"Failed to generate test image: {e}")
            test_image_path = None
    
    # Test endpoints
    results = {}
    
    # Flux endpoints
    flux_payload = {"prompt": "A beautiful landscape", "width": 512, "height": 512, "steps": 4}
    results["/flux"] = test_endpoint("Flux Schnell", "/flux", flux_payload)
    
    flux_dev_payload = {"prompt": "A beautiful landscape", "width": 512, "height": 512, "steps": 20}
    results["/flux-dev"] = test_endpoint("Flux Dev", "/flux-dev", flux_dev_payload)
    
    # Wan2 endpoint
    wan2_payload = {"prompt": "A cinematic scene", "width": 512, "height": 512, "length": 16}
    results["/wan2"] = test_endpoint("Wan2.1", "/wan2", wan2_payload)
    
    # SeedVR2 endpoint
    if test_image_path and test_image_path.exists():
        seedvr2_payload = {
            "image": encode_image(test_image_path),
            "resolution": 1080,
        }
        results["/seedvr2"] = test_endpoint("SeedVR2", "/seedvr2", seedvr2_payload, requires_file=True, test_image_path=test_image_path)
    else:
        print_warning("Skipping /seedvr2 - no test image available")
        results["/seedvr2"] = (False, "No test image", {})
    
    # InstantID endpoints (skip for now - require reference images)
    print_warning("Skipping InstantID endpoints - require reference images")
    for endpoint in ["/flux-instantid", "/sdxl-instantid", "/flux-ipadapter-faceid"]:
        results[endpoint] = (False, "Skipped - requires reference image", {})
    
    # Z-Image endpoints (skip for now - some may have issues)
    print_warning("Skipping Z-Image endpoints - may have model issues")
    for endpoint in ["/z-image-simple", "/z-image-danrisi", "/z-image-instantid", "/z-image-pulid"]:
        results[endpoint] = (False, "Skipped - may have model issues", {})
    
    # Summary
    print_header("Test Results Summary")
    
    working = [ep for ep, (success, _, _) in results.items() if success]
    failed = [ep for ep, (success, _, _) in results.items() if not success]
    skipped = [ep for ep, (success, msg, _) in results.items() if not success and "Skipped" in msg]
    
    print(f"\n{Colors.BOLD}Working: {len(working)}/{len(results)}{Colors.RESET}")
    for ep in working:
        app = ENDPOINT_APP_MAP.get(ep, "unknown")
        print_success(f"  {ep} ({app})")
    
    if failed and len(failed) > len(skipped):
        print(f"\n{Colors.BOLD}Failed: {len([f for f in failed if f not in skipped])}/{len(results)}{Colors.RESET}")
        for ep in failed:
            if ep not in skipped:
                app = ENDPOINT_APP_MAP.get(ep, "unknown")
                _, msg, _ = results[ep]
                print_error(f"  {ep} ({app}): {msg}")
    
    if skipped:
        print(f"\n{Colors.BOLD}Skipped: {len(skipped)}{Colors.RESET}")
        for ep in skipped:
            app = ENDPOINT_APP_MAP.get(ep, "unknown")
            _, msg, _ = results[ep]
            print_warning(f"  {ep} ({app}): {msg}")
    
    # Save results
    output_file = Path("apps/modal/docs/status/SPLIT-APPS-TEST-RESULTS.json")
    output_file.parent.mkdir(parents=True, exist_ok=True)
    
    results_data = {
        "timestamp": datetime.now().isoformat(),
        "workspace": WORKSPACE,
        "results": {
            ep: {
                "success": success,
                "message": msg,
                "data": data,
                "app": ENDPOINT_APP_MAP.get(ep, "unknown"),
            }
            for ep, (success, msg, data) in results.items()
        },
        "summary": {
            "total": len(results),
            "working": len(working),
            "failed": len([f for f in failed if f not in skipped]),
            "skipped": len(skipped),
        },
    }
    
    with open(output_file, "w") as f:
        json.dump(results_data, f, indent=2)
    
    print(f"\n{Colors.BOLD}Results saved to: {output_file}{Colors.RESET}")

if __name__ == "__main__":
    main()
