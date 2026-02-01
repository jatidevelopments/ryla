#!/usr/bin/env python3
"""
Test /sdxl-turbo and /sdxl-lightning.

Modal returns 303 on first request (cold start); client must GET the Location URL
to receive the result (connection is held until job completes). Total time:
~2–3 min first request (cold + inference), ~10–30s when warm.

Run: python apps/modal/scripts/test-sdxl-endpoints.py
(May take 5+ min total if both endpoints cold.)
"""
import requests
import sys
from pathlib import Path

WORKSPACE = "ryla"
BASE = f"https://{WORKSPACE}--ryla-instantid-comfyui-fastapi-app.modal.run"
# First request can be 303 + long GET; second request often warm
TIMEOUT_POST = 200
TIMEOUT_GET = 300


def post_follow_303(url: str, json_payload: dict) -> requests.Response:
    """POST to url; if 303, GET Location (Modal holds until result ready)."""
    r = requests.post(url, json=json_payload, timeout=TIMEOUT_POST, allow_redirects=False)
    if r.status_code == 303:
        location = r.headers.get("Location")
        if not location:
            raise RuntimeError("303 without Location header")
        return requests.get(location, timeout=TIMEOUT_GET)
    return r


def test(name: str, path: str, payload: dict, out_path: Path):
    print(f"\n--- {name} ---")
    url = f"{BASE}{path}"
    try:
        r = post_follow_303(url, payload)
        print(f"Status: {r.status_code}")
        print(f"Content-Type: {r.headers.get('Content-Type')}")
        print(f"Size: {len(r.content)} bytes")
        if r.status_code == 200:
            out_path.write_bytes(r.content)
            print(f"Saved: {out_path}")
            if "X-Cost-USD" in r.headers:
                print(f"Cost: ${r.headers['X-Cost-USD']} | Time: {r.headers.get('X-Execution-Time-Sec', 'N/A')}s")
            return True
        else:
            print(f"Error body: {r.text[:400]}")
            return False
    except Exception as e:
        print(f"Exception: {e}")
        return False


def main():
    out_dir = Path("/tmp/ryla-sdxl-test")
    out_dir.mkdir(exist_ok=True)

    payload_turbo = {"prompt": "A mountain at sunset", "width": 512, "height": 512, "steps": 4}
    payload_lightning = {"prompt": "A mountain at sunset", "width": 512, "height": 512}

    ok_turbo = test("/sdxl-turbo", "/sdxl-turbo", payload_turbo, out_dir / "sdxl-turbo.jpg")
    ok_lightning = test("/sdxl-lightning", "/sdxl-lightning", payload_lightning, out_dir / "sdxl-lightning.jpg")

    print("\n--- Summary ---")
    print(f"sdxl-turbo:    {'OK' if ok_turbo else 'FAIL'}")
    print(f"sdxl-lightning: {'OK' if ok_lightning else 'FAIL'}")
    sys.exit(0 if (ok_turbo and ok_lightning) else 1)


if __name__ == "__main__":
    main()
