#!/usr/bin/env python3
"""
Test Modal endpoint with proper headers (Python requests)

Usage: python3 scripts/workflow-deployer/test-endpoint.py <endpoint-url>
"""

import sys
import requests
import json
from typing import Dict, Any

def test_endpoint(endpoint_url: str) -> None:
    """Test all endpoints of a Modal deployment."""
    print(f"🧪 Testing endpoint: {endpoint_url}\n")
    
    # Test root endpoint
    print("1️⃣  Testing root endpoint (/)...")
    try:
        response = requests.get(f"{endpoint_url}/", timeout=30)
        if response.ok:
            data = response.json()
            print(f"   ✅ Root endpoint: OK")
            print(f"   Response: {json.dumps(data, indent=2)}")
        else:
            print(f"   ❌ Root endpoint: HTTP {response.status_code}")
            print(f"   Response: {response.text[:200]}")
    except requests.exceptions.Timeout:
        print("   ⚠️  Root endpoint: Timeout (cold start may be in progress)")
    except Exception as e:
        print(f"   ❌ Root endpoint: {str(e)}")
    
    print()
    
    # Test health endpoint
    print("2️⃣  Testing health endpoint (/health)...")
    try:
        response = requests.get(f"{endpoint_url}/health", timeout=30)
        if response.ok:
            data = response.json()
            print(f"   ✅ Health endpoint: OK")
            print(f"   Response: {json.dumps(data, indent=2)}")
        else:
            print(f"   ❌ Health endpoint: HTTP {response.status_code}")
            print(f"   Response: {response.text[:200]}")
    except requests.exceptions.Timeout:
        print("   ⚠️  Health endpoint: Timeout (cold start may be in progress)")
    except Exception as e:
        print(f"   ❌ Health endpoint: {str(e)}")
    
    print()
    
    # Test generate endpoint with minimal workflow
    print("3️⃣  Testing generate endpoint (/generate)...")
    try:
        payload = {
            "workflow": {
                "1": {
                    "class_type": "SaveImage",
                    "inputs": {
                        "filename_prefix": "test"
                    }
                }
            }
        }
        response = requests.post(
            f"{endpoint_url}/generate",
            json=payload,
            timeout=60  # Longer timeout for generation
        )
        if response.ok:
            data = response.json()
            print(f"   ✅ Generate endpoint: OK")
            print(f"   Response keys: {list(data.keys())}")
            if "images" in data:
                print(f"   Images count: {data.get('count', 0)}")
                print(f"   Format: {data.get('format', 'unknown')}")
        else:
            print(f"   ❌ Generate endpoint: HTTP {response.status_code}")
            print(f"   Response: {response.text[:500]}")
    except requests.exceptions.Timeout:
        print("   ⚠️  Generate endpoint: Timeout")
        print("   ⚠️  This may be normal for cold starts (2-5 minutes) or long workflows")
    except Exception as e:
        print(f"   ❌ Generate endpoint: {str(e)}")
    
    print("\n✅ Endpoint testing complete!")
    print("\n💡 Note: If endpoints timed out, wait 2-5 minutes for cold start and try again.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("❌ Usage: python3 test-endpoint.py <endpoint-url>")
        sys.exit(1)
    
    endpoint_url = sys.argv[1].rstrip('/')
    test_endpoint(endpoint_url)
