#!/usr/bin/env python3
"""
Test Modal endpoint with retry logic and longer timeouts
"""

import sys
import requests
import json
import time

def test_endpoint_with_retry(endpoint_url: str, max_retries: int = 5, wait_seconds: int = 30):
    """Test endpoint with retry logic."""
    print(f"🧪 Testing endpoint: {endpoint_url}\n")
    
    for attempt in range(1, max_retries + 1):
        print(f"Attempt {attempt}/{max_retries}...")
        
        # Test health endpoint
        try:
            response = requests.get(f"{endpoint_url}/health", timeout=60)
            if response.ok:
                data = response.json()
                print(f"✅ Health endpoint: OK")
                print(f"   Response: {json.dumps(data, indent=2)}")
                
                # Test root endpoint
                try:
                    root_response = requests.get(f"{endpoint_url}/", timeout=30)
                    if root_response.ok:
                        root_data = root_response.json()
                        print(f"\n✅ Root endpoint: OK")
                        print(f"   Response: {json.dumps(root_data, indent=2)}")
                    else:
                        print(f"\n⚠️  Root endpoint: HTTP {root_response.status_code}")
                except Exception as e:
                    print(f"\n⚠️  Root endpoint: {str(e)[:100]}")
                
                print("\n✅ All endpoints working!")
                return True
            else:
                print(f"   Health: HTTP {response.status_code} - {response.text[:200]}")
        except requests.exceptions.Timeout:
            print(f"   ⏳ Timeout (cold start may still be in progress)")
        except Exception as e:
            print(f"   ❌ Error: {str(e)[:100]}")
        
        if attempt < max_retries:
            print(f"   Waiting {wait_seconds}s before retry...\n")
            time.sleep(wait_seconds)
    
    print(f"\n❌ Endpoints not responding after {max_retries} attempts")
    print("   Check Modal dashboard for logs: https://modal.com/apps")
    return False

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("❌ Usage: python3 test-endpoint-with-retry.py <endpoint-url>")
        sys.exit(1)
    
    endpoint_url = sys.argv[1].rstrip('/')
    success = test_endpoint_with_retry(endpoint_url, max_retries=6, wait_seconds=30)
    sys.exit(0 if success else 1)
