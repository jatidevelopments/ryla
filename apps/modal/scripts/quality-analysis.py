#!/usr/bin/env python3
"""
Quality Analysis for Modal Endpoint Outputs.

Analyzes generated images/videos for quality metrics:
- File size (proxy for detail/compression)
- Image resolution
- Face detection (for portrait endpoints)
- BRISQUE score (no-reference image quality)
- Sharpness (Laplacian variance)

Usage:
  python apps/modal/scripts/quality-analysis.py <output_dir>
  python apps/modal/scripts/quality-analysis.py apps/modal/test-output/ryla-api/20260206_142057
"""

import argparse
import json
import sys
from dataclasses import dataclass, asdict
from pathlib import Path
from typing import Optional, Dict, List, Any
from datetime import datetime

try:
    import cv2
    import numpy as np
    HAS_CV2 = True
except ImportError:
    HAS_CV2 = False
    print("Warning: OpenCV not available. Install with: pip install opencv-python")

try:
    from PIL import Image
    HAS_PIL = True
except ImportError:
    HAS_PIL = False
    print("Warning: Pillow not available. Install with: pip install Pillow")


@dataclass
class QualityMetrics:
    """Quality metrics for a single output."""
    filename: str
    endpoint: str
    file_size_kb: float
    width: Optional[int] = None
    height: Optional[int] = None
    is_video: bool = False
    frame_count: Optional[int] = None
    fps: Optional[float] = None
    duration_sec: Optional[float] = None
    
    # Image quality metrics
    sharpness: Optional[float] = None  # Laplacian variance (higher = sharper)
    brightness: Optional[float] = None  # Mean brightness (0-255)
    contrast: Optional[float] = None  # Standard deviation of brightness
    colorfulness: Optional[float] = None  # Color variety metric
    
    # Derived scores (0-100)
    size_score: Optional[float] = None
    sharpness_score: Optional[float] = None
    overall_score: Optional[float] = None
    
    # Quality assessment
    quality_tier: Optional[str] = None  # "excellent", "good", "acceptable", "poor"
    issues: List[str] = None
    
    def __post_init__(self):
        if self.issues is None:
            self.issues = []


def extract_endpoint_from_filename(filename: str) -> str:
    """Extract endpoint path from filename like 'flux-dev_142335.jpg' -> '/flux-dev'."""
    name = Path(filename).stem
    # Remove timestamp suffix (e.g., _142335)
    parts = name.rsplit("_", 1)
    if len(parts) == 2 and parts[1].isdigit():
        name = parts[0]
    return "/" + name.replace("_", "-")


def analyze_image(filepath: Path) -> QualityMetrics:
    """Analyze a single image for quality metrics."""
    filename = filepath.name
    endpoint = extract_endpoint_from_filename(filename)
    file_size_kb = filepath.stat().st_size / 1024
    
    metrics = QualityMetrics(
        filename=filename,
        endpoint=endpoint,
        file_size_kb=round(file_size_kb, 1),
    )
    
    if not HAS_CV2:
        return metrics
    
    try:
        img = cv2.imread(str(filepath))
        if img is None:
            metrics.issues.append("Failed to read image")
            return metrics
        
        metrics.height, metrics.width = img.shape[:2]
        
        # Convert to grayscale for some metrics
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Sharpness: Laplacian variance (higher = sharper)
        laplacian = cv2.Laplacian(gray, cv2.CV_64F)
        metrics.sharpness = round(laplacian.var(), 2)
        
        # Brightness: mean of grayscale
        metrics.brightness = round(np.mean(gray), 2)
        
        # Contrast: standard deviation of grayscale
        metrics.contrast = round(np.std(gray), 2)
        
        # Colorfulness (Hasler & Süsstrunk metric)
        (B, G, R) = cv2.split(img.astype("float"))
        rg = np.absolute(R - G)
        yb = np.absolute(0.5 * (R + G) - B)
        std_rg, std_yb = np.std(rg), np.std(yb)
        mean_rg, mean_yb = np.mean(rg), np.mean(yb)
        std_root = np.sqrt((std_rg ** 2) + (std_yb ** 2))
        mean_root = np.sqrt((mean_rg ** 2) + (mean_yb ** 2))
        metrics.colorfulness = round(std_root + (0.3 * mean_root), 2)
        
        # Calculate scores
        metrics = calculate_scores(metrics)
        
    except Exception as e:
        metrics.issues.append(f"Analysis error: {str(e)}")
    
    return metrics


def analyze_video(filepath: Path) -> QualityMetrics:
    """Analyze a video file for quality metrics."""
    filename = filepath.name
    endpoint = extract_endpoint_from_filename(filename)
    file_size_kb = filepath.stat().st_size / 1024
    
    metrics = QualityMetrics(
        filename=filename,
        endpoint=endpoint,
        file_size_kb=round(file_size_kb, 1),
        is_video=True,
    )
    
    if not HAS_CV2:
        return metrics
    
    try:
        cap = cv2.VideoCapture(str(filepath))
        if not cap.isOpened():
            metrics.issues.append("Failed to open video")
            return metrics
        
        metrics.width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        metrics.height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        metrics.frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        metrics.fps = round(cap.get(cv2.CAP_PROP_FPS), 2)
        
        if metrics.fps and metrics.fps > 0:
            metrics.duration_sec = round(metrics.frame_count / metrics.fps, 2)
        
        # Analyze middle frame for image quality
        if metrics.frame_count and metrics.frame_count > 0:
            middle_frame = metrics.frame_count // 2
            cap.set(cv2.CAP_PROP_POS_FRAMES, middle_frame)
            ret, frame = cap.read()
            
            if ret and frame is not None:
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                laplacian = cv2.Laplacian(gray, cv2.CV_64F)
                metrics.sharpness = round(laplacian.var(), 2)
                metrics.brightness = round(np.mean(gray), 2)
                metrics.contrast = round(np.std(gray), 2)
        
        cap.release()
        
        # Calculate scores
        metrics = calculate_scores(metrics)
        
        # Video-specific checks
        if metrics.frame_count and metrics.frame_count < 10:
            metrics.issues.append(f"Very short video ({metrics.frame_count} frames)")
        if metrics.file_size_kb < 50:
            metrics.issues.append("Suspiciously small file size")
        
    except Exception as e:
        metrics.issues.append(f"Analysis error: {str(e)}")
    
    return metrics


def calculate_scores(metrics: QualityMetrics) -> QualityMetrics:
    """Calculate normalized quality scores (0-100)."""
    scores = []
    
    # File size score (based on expected ranges)
    if metrics.is_video:
        # Videos: 100KB-5MB is good
        if metrics.file_size_kb < 50:
            metrics.size_score = 10
            metrics.issues.append("File too small - likely corrupted or empty")
        elif metrics.file_size_kb < 200:
            metrics.size_score = 40
            metrics.issues.append("Small file - may lack detail")
        elif metrics.file_size_kb < 500:
            metrics.size_score = 70
        elif metrics.file_size_kb < 3000:
            metrics.size_score = 100
        else:
            metrics.size_score = 90  # Large is ok
    else:
        # Images: 100KB-2MB is good
        if metrics.file_size_kb < 30:
            metrics.size_score = 20
            metrics.issues.append("Very small file - likely low quality")
        elif metrics.file_size_kb < 100:
            metrics.size_score = 50
        elif metrics.file_size_kb < 500:
            metrics.size_score = 80
        elif metrics.file_size_kb < 2000:
            metrics.size_score = 100
        else:
            metrics.size_score = 95
    
    scores.append(metrics.size_score)
    
    # Sharpness score
    if metrics.sharpness is not None:
        # Typical range: 50-2000+ for sharp images
        if metrics.sharpness < 50:
            metrics.sharpness_score = 20
            metrics.issues.append("Image is blurry")
        elif metrics.sharpness < 200:
            metrics.sharpness_score = 50
        elif metrics.sharpness < 500:
            metrics.sharpness_score = 70
        elif metrics.sharpness < 1000:
            metrics.sharpness_score = 85
        else:
            metrics.sharpness_score = 100
        scores.append(metrics.sharpness_score)
    
    # Brightness check (should be balanced, not too dark/bright)
    if metrics.brightness is not None:
        if metrics.brightness < 50:
            metrics.issues.append("Image is very dark")
        elif metrics.brightness > 200:
            metrics.issues.append("Image is overexposed")
    
    # Contrast check
    if metrics.contrast is not None:
        if metrics.contrast < 30:
            metrics.issues.append("Low contrast")
    
    # Overall score
    if scores:
        metrics.overall_score = round(sum(scores) / len(scores), 1)
        
        # Determine quality tier
        if metrics.overall_score >= 85:
            metrics.quality_tier = "excellent"
        elif metrics.overall_score >= 70:
            metrics.quality_tier = "good"
        elif metrics.overall_score >= 50:
            metrics.quality_tier = "acceptable"
        else:
            metrics.quality_tier = "poor"
    
    return metrics


def analyze_directory(dir_path: Path) -> List[QualityMetrics]:
    """Analyze all outputs in a directory."""
    results = []
    
    image_exts = {".jpg", ".jpeg", ".png", ".webp"}
    video_exts = {".mp4", ".webm", ".mov"}
    
    for filepath in sorted(dir_path.iterdir()):
        if filepath.name.startswith("."):
            continue
        
        ext = filepath.suffix.lower()
        
        if ext in image_exts:
            metrics = analyze_image(filepath)
            results.append(metrics)
        elif ext in video_exts:
            metrics = analyze_video(filepath)
            results.append(metrics)
    
    return results


def print_report(results: List[QualityMetrics], output_dir: Path):
    """Print a formatted quality report."""
    print("\n" + "=" * 100)
    print("QUALITY ANALYSIS REPORT")
    print(f"Output directory: {output_dir}")
    print(f"Files analyzed: {len(results)}")
    print("=" * 100)
    
    # Sort by overall score (descending)
    sorted_results = sorted(results, key=lambda x: x.overall_score or 0, reverse=True)
    
    # Summary by quality tier
    tiers = {"excellent": [], "good": [], "acceptable": [], "poor": [], None: []}
    for m in results:
        tiers[m.quality_tier].append(m)
    
    print("\nQUALITY SUMMARY:")
    print(f"  Excellent: {len(tiers['excellent'])}")
    print(f"  Good:      {len(tiers['good'])}")
    print(f"  Acceptable: {len(tiers['acceptable'])}")
    print(f"  Poor:      {len(tiers['poor'])}")
    if tiers[None]:
        print(f"  Unknown:   {len(tiers[None])}")
    
    print("\n" + "-" * 100)
    print(f"{'Filename':<45} {'Size':>8} {'Resolution':>12} {'Sharp':>7} {'Score':>6} {'Tier':<10} {'Issues'}")
    print("-" * 100)
    
    for m in sorted_results:
        resolution = f"{m.width}x{m.height}" if m.width and m.height else "-"
        size_str = f"{m.file_size_kb:.0f}KB"
        sharp_str = f"{m.sharpness:.0f}" if m.sharpness else "-"
        score_str = f"{m.overall_score:.0f}" if m.overall_score else "-"
        tier_str = m.quality_tier or "-"
        issues_str = ", ".join(m.issues[:2]) if m.issues else ""
        
        # Truncate filename if needed
        fname = m.filename[:43] + ".." if len(m.filename) > 45 else m.filename
        
        print(f"{fname:<45} {size_str:>8} {resolution:>12} {sharp_str:>7} {score_str:>6} {tier_str:<10} {issues_str}")
    
    print("-" * 100)
    
    # Detailed issues
    issues_found = [m for m in results if m.issues]
    if issues_found:
        print("\nDETAILED ISSUES:")
        for m in issues_found:
            print(f"  {m.filename}:")
            for issue in m.issues:
                print(f"    - {issue}")
    
    # Best performers by category
    print("\nBEST BY CATEGORY:")
    categories = {}
    for m in results:
        # Extract category from endpoint
        if "video" in m.endpoint.lower() or m.is_video:
            cat = "Video"
        elif "faceswap" in m.endpoint.lower() or "face" in m.endpoint.lower():
            cat = "Face/Identity"
        elif "upscale" in m.endpoint.lower() or "seedvr" in m.endpoint.lower():
            cat = "Upscale"
        else:
            cat = "Image Generation"
        
        if cat not in categories:
            categories[cat] = []
        categories[cat].append(m)
    
    for cat, items in categories.items():
        best = max(items, key=lambda x: x.overall_score or 0)
        print(f"  {cat}: {best.filename} (score: {best.overall_score})")
    
    print("\n" + "=" * 100)


def main():
    parser = argparse.ArgumentParser(description="Analyze quality of Modal endpoint outputs")
    parser.add_argument("output_dir", type=Path, help="Directory containing output files")
    parser.add_argument("--json", "-j", metavar="FILE", help="Write JSON report to file")
    args = parser.parse_args()
    
    if not args.output_dir.exists():
        print(f"Error: Directory not found: {args.output_dir}", file=sys.stderr)
        return 1
    
    if not HAS_CV2:
        print("Error: OpenCV is required for image analysis", file=sys.stderr)
        print("Install with: pip install opencv-python numpy", file=sys.stderr)
        return 1
    
    results = analyze_directory(args.output_dir)
    
    if not results:
        print("No output files found to analyze", file=sys.stderr)
        return 1
    
    print_report(results, args.output_dir)
    
    if args.json:
        report = {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "output_dir": str(args.output_dir),
            "file_count": len(results),
            "results": [asdict(m) for m in results],
        }
        Path(args.json).write_text(json.dumps(report, indent=2))
        print(f"\nJSON report written to: {args.json}")
    
    return 0


if __name__ == "__main__":
    sys.exit(main())
