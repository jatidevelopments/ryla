#!/usr/bin/env python3
"""
Multi-Seed Quality Testing for Modal Endpoints.

Tests each endpoint with multiple seeds to find optimal configurations.
Produces a quality matrix showing which seeds work best for which endpoints.

Features:
- Tests 3-5 different seeds per endpoint
- Runs quality analysis on each output
- Finds the best seed per endpoint
- Creates comparison report

Usage:
  # Test a few key endpoints with multiple seeds
  python apps/modal/scripts/multi-seed-quality-test.py --endpoints /flux,/flux-dev,/qwen-image-2512

  # Full matrix test (slow)
  python apps/modal/scripts/multi-seed-quality-test.py --full

  # Quick test with 2 seeds per endpoint
  python apps/modal/scripts/multi-seed-quality-test.py --seeds-per-endpoint 2
"""

import argparse
import base64
import json
import os
import sys
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass, asdict
from datetime import datetime
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple
import random
import time

import requests

try:
    import cv2
    import numpy as np
    HAS_CV2 = True
except ImportError:
    HAS_CV2 = False
    print("Warning: OpenCV required. Install: pip install opencv-python numpy")
    sys.exit(1)


# -----------------------------------------------------------------------------
# Config
# -----------------------------------------------------------------------------

RYLA_API_URL = os.environ.get("RYLA_API_URL", "http://localhost:3001")
PLAYGROUND_CALL_PATH = "/playground/modal/call"
DEFAULT_TIMEOUT = 600
OUTPUT_DIR = Path(__file__).parent.parent / "test-output" / "multi-seed"

# Test seeds - diverse range including known "good" seeds from community
TEST_SEEDS = [
    42,           # Classic
    12345,        # Simple
    1337,         # l33t
    314159,       # Pi
    999999999,    # High
    123456789,    # Sequential
    1374878599,   # Previous test seed
    2024020600,   # Date-based
    7777777,      # Lucky 7s
    88888888,     # Lucky 8s
]

# Key endpoints for quality testing (skip slow/LoRA ones initially)
KEY_ENDPOINTS = [
    {"path": "/flux", "label": "Flux Schnell", "fast": True},
    {"path": "/flux-dev", "label": "Flux Dev", "fast": False},
    {"path": "/qwen-image-2512-fast", "label": "Qwen 2512 Fast", "fast": True},
    {"path": "/qwen-image-2512", "label": "Qwen 2512", "fast": False},
    {"path": "/z-image-simple", "label": "Z-Image Simple", "fast": False},
    {"path": "/z-image-danrisi", "label": "Z-Image Danrisi", "fast": False},
    {"path": "/wan2.6", "label": "WAN 2.6 T2V", "isVideo": True, "fast": False},
]

# Different prompts to test
TEST_PROMPTS = {
    "portrait": "Portrait of a young woman with natural makeup, soft studio lighting, professional photography, 8k, sharp details",
    "portrait_simple": "Beautiful woman portrait, photorealistic, high quality",
    "person_outdoor": "Young woman standing in a park, natural sunlight, candid photography, sharp focus, 8k",
    "closeup": "Extreme close-up portrait of a woman's face, studio lighting, sharp details, high resolution",
}


@dataclass
class SeedTestResult:
    """Result of testing one endpoint with one seed."""
    endpoint: str
    seed: int
    prompt_key: str
    ok: bool
    error: Optional[str] = None
    elapsed_sec: float = 0.0
    output_file: Optional[str] = None
    
    # Quality metrics
    file_size_kb: float = 0.0
    width: Optional[int] = None
    height: Optional[int] = None
    sharpness: Optional[float] = None
    brightness: Optional[float] = None
    contrast: Optional[float] = None
    quality_score: Optional[float] = None


def call_modal(api_base: str, endpoint: str, body: Dict[str, Any], timeout: int = DEFAULT_TIMEOUT) -> Tuple[Optional[Dict], Optional[str], float]:
    """Call Modal endpoint via RYLA API."""
    url = f"{api_base.rstrip('/')}{PLAYGROUND_CALL_PATH}"
    payload = {"endpoint": endpoint if endpoint.startswith("/") else f"/{endpoint}", "body": body}
    start = datetime.now()
    try:
        r = requests.post(url, json=payload, timeout=timeout, headers={"Content-Type": "application/json"})
        elapsed = (datetime.now() - start).total_seconds()
        data = r.json() if r.headers.get("content-type", "").startswith("application/json") else {}
        if not r.ok:
            err = data.get("error") or data.get("message") or r.text or f"HTTP {r.status_code}"
            return None, err, elapsed
        if data.get("error"):
            return data, data["error"], elapsed
        return data, None, elapsed
    except requests.exceptions.Timeout:
        elapsed = (datetime.now() - start).total_seconds()
        return None, "Request timeout", elapsed
    except Exception as e:
        elapsed = (datetime.now() - start).total_seconds()
        return None, str(e), elapsed


def analyze_image_quality(filepath: Path) -> Dict[str, Any]:
    """Analyze image quality metrics."""
    metrics = {"file_size_kb": filepath.stat().st_size / 1024}
    
    try:
        img = cv2.imread(str(filepath))
        if img is None:
            return metrics
        
        metrics["height"], metrics["width"] = img.shape[:2]
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Sharpness (Laplacian variance)
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        metrics["sharpness"] = round(laplacian.var(), 2)
        
        # Brightness
        metrics["brightness"] = round(np.mean(gray), 2)
        
        # Contrast
        metrics["contrast"] = round(np.std(gray), 2)
        
        # Calculate quality score
        score = 50  # Base
        
        # Sharpness contribution (0-25 points)
        if metrics["sharpness"] > 500:
            score += 25
        elif metrics["sharpness"] > 200:
            score += 20
        elif metrics["sharpness"] > 100:
            score += 15
        elif metrics["sharpness"] > 50:
            score += 10
        
        # Brightness contribution (0-15 points) - penalize extremes
        if 80 < metrics["brightness"] < 180:
            score += 15
        elif 60 < metrics["brightness"] < 200:
            score += 10
        elif 40 < metrics["brightness"] < 220:
            score += 5
        
        # Contrast contribution (0-10 points)
        if metrics["contrast"] > 60:
            score += 10
        elif metrics["contrast"] > 40:
            score += 7
        elif metrics["contrast"] > 25:
            score += 3
        
        metrics["quality_score"] = min(100, score)
        
    except Exception as e:
        metrics["error"] = str(e)
    
    return metrics


def test_endpoint_with_seed(
    api_base: str,
    endpoint: Dict[str, Any],
    seed: int,
    prompt: str,
    prompt_key: str,
    output_dir: Path,
    timeout: int,
) -> SeedTestResult:
    """Test one endpoint with one seed and analyze output."""
    path = endpoint["path"]
    
    # Build request body
    body = {
        "prompt": prompt,
        "seed": seed,
        "width": 1024,
        "height": 1024,
        "steps": 20,
        "cfg": 5.0,
    }
    
    # Video endpoints need different params
    if endpoint.get("isVideo"):
        body.update({
            "width": 832,
            "height": 480,
            "length": 33,
            "fps": 16,
            "steps": 30,
            "cfg": 6.0,
        })
    
    result = SeedTestResult(
        endpoint=path,
        seed=seed,
        prompt_key=prompt_key,
        ok=False,
    )
    
    # Make the API call
    data, err, elapsed = call_modal(api_base, path, body, timeout=timeout)
    result.elapsed_sec = round(elapsed, 1)
    
    if err or not data:
        result.error = err
        return result
    
    # Save output
    b64 = data.get("imageBase64")
    if not b64:
        result.error = "No imageBase64 in response"
        return result
    
    content_type = data.get("contentType", "image/png")
    ext_map = {"image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "video/mp4": "mp4", "video/webm": "webm"}
    ext = ext_map.get(content_type, "png")
    
    safe_path = path.replace("/", "")
    filename = f"{safe_path}_seed{seed}_{prompt_key}.{ext}"
    filepath = output_dir / filename
    
    try:
        img_bytes = base64.b64decode(b64)
        filepath.write_bytes(img_bytes)
        result.output_file = str(filepath)
        result.ok = True
        
        # Analyze quality
        metrics = analyze_image_quality(filepath)
        result.file_size_kb = round(metrics.get("file_size_kb", 0), 1)
        result.width = metrics.get("width")
        result.height = metrics.get("height")
        result.sharpness = metrics.get("sharpness")
        result.brightness = metrics.get("brightness")
        result.contrast = metrics.get("contrast")
        result.quality_score = metrics.get("quality_score")
        
    except Exception as e:
        result.error = f"Save/analyze error: {e}"
        result.ok = False
    
    return result


def run_seed_matrix(
    api_base: str,
    endpoints: List[Dict],
    seeds: List[int],
    prompts: Dict[str, str],
    output_dir: Path,
    timeout: int,
    parallel: int,
) -> List[SeedTestResult]:
    """Run full seed matrix test."""
    all_results = []
    
    # Use primary prompt for matrix test
    prompt_key = "portrait"
    prompt = prompts[prompt_key]
    
    total_tests = len(endpoints) * len(seeds)
    print(f"Running {total_tests} tests ({len(endpoints)} endpoints × {len(seeds)} seeds)")
    print(f"Prompt: {prompt[:60]}...")
    print()
    
    completed = 0
    
    for endpoint in endpoints:
        path = endpoint["path"]
        print(f"\nTesting {path} with {len(seeds)} seeds...")
        
        endpoint_results = []
        with ThreadPoolExecutor(max_workers=min(parallel, len(seeds))) as ex:
            futures = {
                ex.submit(
                    test_endpoint_with_seed,
                    api_base, endpoint, seed, prompt, prompt_key, output_dir, timeout
                ): seed
                for seed in seeds
            }
            
            for fut in as_completed(futures):
                seed = futures[fut]
                try:
                    result = fut.result()
                    endpoint_results.append(result)
                    
                    status = "✓" if result.ok else "✗"
                    score = f"Q:{result.quality_score:.0f}" if result.quality_score else "-"
                    sharp = f"S:{result.sharpness:.0f}" if result.sharpness else "-"
                    print(f"  {status} seed={seed:>10}  {result.elapsed_sec:>5.1f}s  {score:<6}  {sharp}")
                    
                except Exception as e:
                    print(f"  ✗ seed={seed}: {e}")
                    endpoint_results.append(SeedTestResult(path, seed, prompt_key, False, str(e)))
                
                completed += 1
        
        # Find best seed for this endpoint
        successful = [r for r in endpoint_results if r.ok and r.quality_score]
        if successful:
            best = max(successful, key=lambda r: r.quality_score or 0)
            print(f"  → Best seed: {best.seed} (quality: {best.quality_score}, sharpness: {best.sharpness})")
        
        all_results.extend(endpoint_results)
    
    return all_results


def print_matrix_report(results: List[SeedTestResult], endpoints: List[Dict], seeds: List[int]):
    """Print seed/endpoint quality matrix."""
    print("\n" + "=" * 100)
    print("SEED × ENDPOINT QUALITY MATRIX")
    print("=" * 100)
    
    # Build matrix
    matrix = {}
    for r in results:
        key = (r.endpoint, r.seed)
        matrix[key] = r.quality_score or 0
    
    # Print header
    print(f"\n{'Seed':<12}", end="")
    for ep in endpoints:
        short_name = ep["path"][1:10]
        print(f"{short_name:>12}", end="")
    print()
    print("-" * (12 + 12 * len(endpoints)))
    
    # Print rows
    for seed in seeds:
        print(f"{seed:<12}", end="")
        for ep in endpoints:
            score = matrix.get((ep["path"], seed), 0)
            if score >= 80:
                cell = f"★ {score:.0f}"
            elif score >= 60:
                cell = f"  {score:.0f}"
            elif score > 0:
                cell = f"  {score:.0f}"
            else:
                cell = "  -"
            print(f"{cell:>12}", end="")
        print()
    
    print("-" * (12 + 12 * len(endpoints)))
    
    # Best seeds per endpoint
    print("\nBEST SEEDS PER ENDPOINT:")
    for ep in endpoints:
        ep_results = [r for r in results if r.endpoint == ep["path"] and r.ok and r.quality_score]
        if ep_results:
            best = max(ep_results, key=lambda r: r.quality_score or 0)
            avg_score = sum(r.quality_score or 0 for r in ep_results) / len(ep_results)
            print(f"  {ep['path']:<25}  Best: seed={best.seed} (Q:{best.quality_score:.0f})  Avg: {avg_score:.1f}")
    
    # Best overall seeds
    print("\nBEST OVERALL SEEDS:")
    seed_scores = {}
    for seed in seeds:
        seed_results = [r for r in results if r.seed == seed and r.ok and r.quality_score]
        if seed_results:
            avg = sum(r.quality_score or 0 for r in seed_results) / len(seed_results)
            seed_scores[seed] = avg
    
    sorted_seeds = sorted(seed_scores.items(), key=lambda x: x[1], reverse=True)
    for seed, avg in sorted_seeds[:5]:
        print(f"  seed={seed:<12}  avg_quality={avg:.1f}")
    
    print("\n" + "=" * 100)


def main():
    parser = argparse.ArgumentParser(description="Multi-seed quality testing for Modal endpoints")
    parser.add_argument("--api-url", default=RYLA_API_URL, help="RYLA API base URL")
    parser.add_argument("--endpoints", metavar="LIST", help="Comma-separated endpoints to test (e.g., /flux,/flux-dev)")
    parser.add_argument("--seeds", metavar="LIST", help="Comma-separated seeds to test (e.g., 42,12345,1337)")
    parser.add_argument("--seeds-per-endpoint", type=int, default=5, help="Number of seeds to test per endpoint (default: 5)")
    parser.add_argument("--timeout", type=int, default=DEFAULT_TIMEOUT, help="Request timeout (seconds)")
    parser.add_argument("--parallel", type=int, default=3, help="Parallel requests per endpoint")
    parser.add_argument("--fast-only", action="store_true", help="Only test fast endpoints")
    parser.add_argument("--full", action="store_true", help="Test all endpoints with all seeds")
    parser.add_argument("--output-dir", metavar="DIR", default=str(OUTPUT_DIR), help="Output directory")
    parser.add_argument("--output", "-o", metavar="FILE", help="Write JSON report to file")
    args = parser.parse_args()
    
    api_base = args.api_url.rstrip("/")
    
    # Check API
    try:
        r = requests.get(f"{api_base}/health", timeout=10)
        if r.status_code != 200:
            print(f"Warning: API health returned {r.status_code}", file=sys.stderr)
    except Exception as e:
        print(f"Error: Cannot reach API at {api_base}: {e}", file=sys.stderr)
        return 1
    
    # Select endpoints
    if args.endpoints:
        paths = [p.strip() for p in args.endpoints.split(",")]
        endpoints = [ep for ep in KEY_ENDPOINTS if ep["path"] in paths]
        if not endpoints:
            print(f"No matching endpoints found for: {paths}", file=sys.stderr)
            return 1
    elif args.fast_only:
        endpoints = [ep for ep in KEY_ENDPOINTS if ep.get("fast")]
    else:
        endpoints = KEY_ENDPOINTS
    
    # Select seeds
    if args.seeds:
        seeds = [int(s.strip()) for s in args.seeds.split(",")]
    elif args.full:
        seeds = TEST_SEEDS
    else:
        # Random subset of test seeds
        seeds = random.sample(TEST_SEEDS, min(args.seeds_per_endpoint, len(TEST_SEEDS)))
    
    # Create output directory
    output_dir = Path(args.output_dir)
    run_timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    run_output_dir = output_dir / run_timestamp
    run_output_dir.mkdir(parents=True, exist_ok=True)
    
    print("=" * 80)
    print("MULTI-SEED QUALITY TEST")
    print("=" * 80)
    print(f"API: {api_base}")
    print(f"Endpoints: {len(endpoints)}")
    print(f"Seeds: {seeds}")
    print(f"Output: {run_output_dir}")
    print("=" * 80)
    
    # Run matrix test
    results = run_seed_matrix(
        api_base=api_base,
        endpoints=endpoints,
        seeds=seeds,
        prompts=TEST_PROMPTS,
        output_dir=run_output_dir,
        timeout=args.timeout,
        parallel=args.parallel,
    )
    
    # Print matrix report
    print_matrix_report(results, endpoints, seeds)
    
    # Save JSON report
    if args.output:
        report = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "api_base": api_base,
            "output_dir": str(run_output_dir),
            "endpoints": [ep["path"] for ep in endpoints],
            "seeds": seeds,
            "results": [asdict(r) for r in results],
        }
        Path(args.output).write_text(json.dumps(report, indent=2))
        print(f"\nJSON report: {args.output}")
    
    print(f"\nOutputs saved to: {run_output_dir}")
    
    # Return success if at least half succeeded
    success_rate = sum(1 for r in results if r.ok) / len(results) if results else 0
    return 0 if success_rate >= 0.5 else 1


if __name__ == "__main__":
    sys.exit(main())
