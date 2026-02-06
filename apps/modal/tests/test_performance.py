#!/usr/bin/env python3
"""
Performance benchmark for all endpoints

Usage:
    python apps/modal/test_performance.py [workspace]
"""

import requests
import time
import statistics
import sys
from pathlib import Path

# Allow running as script from repo root or apps/modal
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
from tests.endpoint_urls import get_endpoint_url


def benchmark_endpoint(
    endpoint: str, payload: dict, name: str, num_requests: int = 5
):
    """Benchmark an endpoint with multiple requests"""
    times = []
    successes = 0

    print(f"\n📊 Benchmarking {name}")
    print(f"   Endpoint: {endpoint}")
    print(f"   Requests: {num_requests}")

    for i in range(num_requests):
        start = time.time()
        try:
            response = requests.post(endpoint, json=payload, timeout=180)
            response.raise_for_status()
            elapsed = time.time() - start
            times.append(elapsed)
            successes += 1
            print(f"   [{i+1}/{num_requests}] {elapsed:.1f}s ✅")
        except Exception as e:
            elapsed = time.time() - start
            print(f"   [{i+1}/{num_requests}] {elapsed:.1f}s ❌ {e}")

    if times:
        avg = statistics.mean(times)
        median = statistics.median(times)
        min_time = min(times)
        max_time = max(times)

        print(f"\n   Results:")
        print(f"   - Success Rate: {successes}/{num_requests} ({successes/num_requests*100:.1f}%)")
        print(f"   - Average: {avg:.1f}s")
        print(f"   - Median: {median:.1f}s")
        print(f"   - Min: {min_time:.1f}s")
        print(f"   - Max: {max_time:.1f}s")

        return {
            "name": name,
            "success_rate": successes / num_requests,
            "avg_time": avg,
            "median_time": median,
            "min_time": min_time,
            "max_time": max_time,
        }
    return None


def main(workspace: str):
    results = []

    # Flux Schnell (split-app: ryla-flux)
    results.append(
        benchmark_endpoint(
            get_endpoint_url(workspace, "/flux"),
            {"prompt": "A beautiful landscape", "width": 1024, "height": 1024},
            "Flux Schnell",
        )
    )
    
    # Flux Dev (requires HF token - will fail if not configured)
    # results.append(
    #     benchmark_endpoint(
    #         get_endpoint_url(workspace, "/flux-dev"),
    #         {"prompt": "A beautiful landscape", "width": 1024, "height": 1024},
    #         "Flux Dev",
    #     )
    # )

    # Summary
    print(f"\n{'='*60}")
    print("Performance Summary")
    print(f"{'='*60}")

    for r in results:
        if r:
            print(f"\n{r['name']}:")
            print(f"  Success Rate: {r['success_rate']*100:.1f}%")
            print(f"  Average Time: {r['avg_time']:.1f}s")
            print(f"  Target: <30s {'✅' if r['avg_time'] < 30 else '❌'}")


if __name__ == "__main__":
    workspace = sys.argv[1] if len(sys.argv) > 1 else None
    if not workspace:
        import subprocess

        result = subprocess.run(
            ["modal", "profile", "current"], capture_output=True, text=True
        )
        workspace = result.stdout.strip()

    main(workspace)
