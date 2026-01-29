#!/usr/bin/env python3
"""Final comprehensive endpoint test"""
import requests
import time
import sys

endpoint = sys.argv[1] if len(sys.argv) > 1 else "https://ryla--ryla-z-image-danrisi-z-image-danrisi-fastapi-app.modal.run"

print(f"🧪 Final Test: {endpoint}\n")

for attempt in range(1, 8):
    print(f"Attempt {attempt}/7 (waiting {30 * (attempt - 1)}s total)...")
    try:
        start = time.time()
        r = requests.get(f"{endpoint}/health", timeout=60)
        elapsed = int(time.time() - start)
        print(f"✅ SUCCESS after {elapsed}s!")
        print(f"   Status: {r.status_code}")
        print(f"   Response: {r.json() if r.ok else r.text[:200]}")
        sys.exit(0)
    except requests.exceptions.Timeout:
        elapsed = int(time.time() - start)
        print(f"   ⏳ Timeout after {elapsed}s")
    except Exception as e:
        print(f"   ❌ Error: {str(e)[:150]}")
    
    if attempt < 7:
        wait = 30
        print(f"   Waiting {wait}s...\n")
        time.sleep(wait)

print("\n❌ All attempts failed")
print("   Check Modal dashboard: https://modal.com/apps")
sys.exit(1)
