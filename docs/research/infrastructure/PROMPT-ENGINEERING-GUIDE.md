# Prompt Engineering & Quality Optimization Guide

**Purpose**: Best practices for generating high-quality images and videos across RYLA's Modal endpoints.

---

## Table of Contents

1. [Flux Models](#flux-models)
2. [Qwen Image Models](#qwen-image-models)
3. [Z-Image Models](#z-image-models)
4. [WAN Video Models](#wan-video-models)
5. [InstantID Face Generation](#instantid-face-generation)
6. [Optimal Seeds](#optimal-seeds)
7. [Quality Metrics](#quality-metrics)
8. [Testing Methodology](#testing-methodology)

---

## Flux Models

### Key Philosophy

Flux 2 uses a **natural language approach** powered by a 24B parameter vision-language model. This differs fundamentally from older SDXL-style prompting.

### Do's

1. **Use conversational sentences** - Write like you're describing the image to a colleague
2. **Lead with the subject** - Critical elements go first (Flux weights earlier tokens more heavily)
3. **Be specific with details** - "Professional model, mid-30s, holding fragrance bottle at chest height, natural smile"
4. **Use HEX codes for colors** - `#FF6B35` for precise brand colors
5. **Include lighting/mood** - "soft studio lighting", "golden hour", "dramatic shadows"
6. **Request sharpness explicitly** - "sharp details" is CRITICAL for quality (tested: 220 vs 8 sharpness score!)

### Don'ts

1. ❌ **Skip most quality tags** - "8k masterpiece", "best quality" don't help Flux
2. ❌ **Don't keyword spam** - Long comma-separated lists don't work
3. ❌ **Avoid negative prompts** - Flux handles quality by default; use sparingly
4. ❌ **Don't make prompts too long** - Shorter, focused prompts often outperform verbose ones

### IMPORTANT: Empirical Findings

#### 1. "sharp details" Keyword (Critical)
**"sharp details" keyword is essential!** Testing showed:
- With "sharp details": Sharpness score 220+, Quality 85+
- Without "sharp details": Sharpness score ~8, Quality 60

Always include "sharp details" in Flux prompts for high-quality output.

#### 2. Parameter Names (Critical)
**Use correct Modal.com parameter names:**
- `steps` (not `num_inference_steps`)
- `cfg` (not `guidance_scale`)

Wrong parameter names cause the handler to use defaults (4 steps, 1.0 cfg), which dramatically reduces quality:
- Correct params: Sharpness 1500+, File size 1400KB
- Wrong params: Sharpness 105, File size 1100KB

```javascript
// ✅ CORRECT - Modal handler parameters
{ prompt: "...", steps: 28, cfg: 3.5, seed: 12345 }

// ❌ WRONG - These are ignored by the handler!
{ prompt: "...", num_inference_steps: 28, guidance_scale: 3.5, seed: 12345 }
```

### Four-Pillar Framework

```
Subject → Action → Style → Context
```

**Example:**
```
A professional woman in her 30s, confidently presenting at a tech conference, 
photorealistic style with natural studio lighting, modern minimalist stage 
with subtle blue accent lighting, shot on 85mm lens at f/2.8
```

### Optimal Settings

| Parameter | Draft | Production |
|-----------|-------|------------|
| **Steps** | 20 | 28-35 |
| **CFG/Guidance** | 3.5 | 3.5-4.0 |
| **Sampler** | euler | euler |
| **Scheduler** | simple | simple |
| **Resolution** | 896×1152 | 1024×1024+ |

### Sample Prompts

**Portrait (high quality):**
```
Portrait of a young woman with natural makeup, soft studio lighting, 
professional photography, sharp details, neutral expression, 
cream background, shot on medium format camera
```

**Product photography:**
```
Luxury leather handbag displayed on marble surface, soft directional lighting, 
warm amber tones, clean product photography, sharp focus, white background
```

**Tech founder:**
```
RAW photo of a highly realistic close-up portrait of a 40-year-old tech founder. 
Sharp blue eyes with an intelligent gaze, light stubble, dark brown hair with 
hints of gray at temples, neatly styled. Rectangular thin-rimmed glasses. 
Dark blue blazer over white dress shirt, top button undone. Blurred office 
background with modern decor. Soft natural lighting highlighting facial contours.
```

---

## Qwen Image Models

### Model Capabilities

- **Excellent at**: Complex text rendering (especially Chinese), photorealistic human faces, natural textures
- **Optimal for**: Portraits, detailed scenes, text-in-image

### Settings

| Parameter | Value | Notes |
|-----------|-------|-------|
| **Guidance Scale (CFG)** | 4.0-7.0 | Default 4.0; production 5-7 |
| **Inference Steps** | 28-50 | Push to 35+ for text rendering |
| **Resolution** | 1024×1024 | Up to 1328×1328 for square_hd |

### Prompt Tips

1. **Front-load subjects** - Most important elements first
2. **Use specific, descriptive language** - More detail = better output
3. **For text rendering** - Use 35+ steps

### Sample Prompts

**Portrait:**
```
Portrait of a young professional woman with natural makeup, soft studio lighting, 
professional photography, 8k resolution, sharp fine details, bokeh background
```

---

## Z-Image Models

### From Workflow Analysis

Z-Image uses Qwen 3 4B text encoder with `res_multistep` sampler and `simple` scheduler.

### Settings

| Parameter | Value | Notes |
|-----------|-------|-------|
| **Steps** | 25-50 | Workflow shows 25 |
| **CFG** | 3-5 | Workflow recommends 3-5 |
| **Sampler** | res_multistep | Specific to Z-Image |
| **Scheduler** | simple | Standard |
| **ModelSamplingAuraFlow shift** | 3 | From workflow |

### Sample Prompts

**Creative/artistic:**
```
A tiny, lost rubber ducky with a pirate hat in an action shot close-up, 
surfing humongous waves, inside the tube, sun sets in background casting 
warm golden glow, orange and pink hues, atmospheric, stylized, surreal, 
ultra quality, best quality, masterpiece
```

---

## WAN Video Models

### WAN 2.1 / 2.2 / 2.6 Overview

| Model | Best For | Key Features |
|-------|----------|--------------|
| WAN 2.1 | General T2V, I2V | Stable baseline |
| WAN 2.2 | High quality | MoE architecture, dual sampler config |
| WAN 2.6 | Multi-shot | Native multi-shot with timing brackets |

### Text-to-Video Prompts

**Structure:**
```
[Global style description] + [Shot description with timing]
```

**WAN 2.6 Multi-shot format:**
```
A cinematic journey through ancient ruins at sunset. Photoreal, 4K, film grain.

Shot 1 [0-3s] Wide establishing shot of crumbling stone columns silhouetted 
against orange sky, slow push in.

Shot 2 [3-7s] Camera tracks forward through archway, dust particles visible 
in light beams, shadows lengthen.
```

### Image-to-Video Prompts

Focus on **motion** rather than scene description:

```
The woman slowly turns her head to the right, hair gently moving, 
soft smile forming, eyes following the camera
```

### Settings

| Parameter | WAN 2.1 | WAN 2.2 | WAN 2.6 |
|-----------|---------|---------|---------|
| **Steps** | 20-30 | 20-30 (per expert) | 20-30 |
| **CFG** | 5.0-7.0 | Dual CFG (high/low noise) | 5.0-7.0 |
| **Duration** | 5-15s | 5-15s | 5, 10, or 15s |
| **Resolution** | 720p, 1080p | 720p, 1080p | 720p, 1080p |

### Camera Actions (WAN 2.6)

Use these keywords for controlled camera motion:
- `push` / `pull` - Dolly in/out
- `pan left` / `pan right` - Horizontal rotation
- `tilt up` / `tilt down` - Vertical rotation
- `orbit` - Circular motion around subject
- `track` - Follow movement

---

## InstantID Face Generation

### Workflow Analysis (from RunComfy)

The InstantID workflow uses:
- **Base model**: SDXL (albedobaseXL v1.3)
- **IP-Adapter weight**: 0.8
- **ControlNet scale**: 0.8 (from workflow widget values)
- **CFG rescale**: 0.5

### Settings

| Parameter | Value | Notes |
|-----------|-------|-------|
| **CFG** | 4.5 | Workflow shows 4.5 |
| **Steps** | 30 | Workflow shows 30 |
| **IP-Adapter weight** | 0.8 | Identity preservation strength |
| **ControlNet weight** | 0.8 | Default from workflow |
| **Sampler** | ddpm | From workflow |
| **Scheduler** | karras | From workflow |

### Prompt Tips

1. **Style prompts are key** - The prompt transforms the reference face:
   ```
   80s cyberpunk anime character, neonpunk, vivid colors, magenta
   ```

2. **Use negative prompts sparingly:**
   ```
   photograph, deformed, glitch, noisy, realistic, stock photo, naked
   ```

3. **Multi-character scenes** - Use mask regions for positioning

### Sample Prompts

**Comic style:**
```
comic character, graphic illustration, comic art, graphic novel art, 
vibrant, highly detailed, dark hair
```

**Cyberpunk:**
```
80s cyberpunk anime character, neonpunk, vivid colors, magenta, 
digital art style, high contrast
```

---

## Optimal Seeds

### Tested Optimal Seeds by Endpoint

Based on multi-seed quality testing:

```python
OPTIMAL_SEEDS = {
    # Image Generation
    "/flux": 12345,              # Q:95, Sharpness:221
    "/flux-dev": 12345,          
    "/qwen-image-2512": 1374878599,  # Q:100, Sharpness:550
    "/qwen-image-2512-fast": 1374878599,
    "/z-image-simple": 12345,    
    "/z-image-danrisi": 12345,
    
    # Video Generation
    "/wan2.6": 42,               # Classic seed
    "/wan2.6-i2v": 42,
    "/wan22-i2v": 42,
    
    # Default fallback
    "_default": 12345,
}
```

### Seed Testing Methodology

When testing new models:

1. **Test diverse seeds**: Include simple (42, 12345), timestamp-based, and large primes
2. **Run same prompt with each seed** - Isolate seed impact
3. **Measure sharpness** - Laplacian variance is the key metric
4. **Record file sizes** - Larger files often indicate more detail

### Why Seeds Matter

- Seeds control the initial noise pattern
- Some noise patterns happen to align well with model weights
- The same seed will produce identical results with identical parameters
- Different models respond differently to the same seed

---

## Quality Metrics

### Key Metrics & Targets

| Metric | Method | Target | Poor |
|--------|--------|--------|------|
| **Sharpness** | Laplacian variance | >100 | <50 |
| **Brightness** | Mean pixel value | 80-180 | <50 or >220 |
| **Contrast** | Std deviation | >40 | <25 |
| **File Size** | Raw KB | >500KB | <200KB |

### Quality Tiers

| Score | Tier | Action |
|-------|------|--------|
| 90-100 | Excellent | Production ready |
| 75-89 | Good | Minor touch-ups may help |
| 50-74 | Acceptable | Consider regeneration |
| <50 | Poor | Regenerate with different seed/prompt |

### Sharpness Calculation (Laplacian Variance)

```python
import cv2
import numpy as np

def calculate_sharpness(image_path):
    img = cv2.imread(image_path)
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    laplacian = cv2.Laplacian(gray, cv2.CV_64F)
    return laplacian.var()

# Interpretation:
# >200: Very sharp, detailed
# 100-200: Good sharpness
# 50-100: Acceptable
# <50: Blurry or lacks detail
```

---

## Testing Methodology

### Systematic Quality Testing

1. **Baseline test** - Single prompt, single seed, all endpoints
2. **Seed matrix** - Same prompt, multiple seeds per endpoint
3. **Prompt comparison** - Same seed, different prompt structures
4. **Production validation** - Full pipeline with optimal settings

### Test Script Usage

```bash
# Full endpoint test with optimal seeds (default)
python apps/modal/scripts/test-endpoints-via-ryla-api.py

# Disable optimal seeds for comparison
python apps/modal/scripts/test-endpoints-via-ryla-api.py --no-optimal-seeds

# Multi-seed quality testing
python apps/modal/scripts/multi-seed-quality-test.py

# Analyze output quality
python apps/modal/scripts/quality-analysis.py apps/modal/test-output/ryla-api/TIMESTAMP/
```

### Quality Analysis Script

```bash
# Analyze a directory of outputs
python apps/modal/scripts/quality-analysis.py /path/to/outputs/

# Output includes:
# - Per-file metrics (sharpness, brightness, contrast)
# - Quality scores and tiers
# - Endpoint-level summaries
```

---

## Quick Reference: High-Quality Prompt Template

### Image Generation

```
[SUBJECT] with [KEY DETAILS], [LIGHTING], [STYLE], [QUALITY KEYWORDS]
```

**Universal quality keywords that help:**
- "sharp details"
- "professional photography"
- "soft studio lighting"
- "8k" (only for non-Flux models)
- "[camera lens]" (e.g., "shot on 85mm lens at f/2.8")

### Video Generation

```
[GLOBAL STYLE]. [SUBJECT] [ACTION/MOTION], [CAMERA MOVEMENT], [ATMOSPHERE]
```

**Video-specific keywords:**
- Camera actions: push, pull, pan, orbit, track
- Motion: "slowly turns", "gently moving", "walking forward"
- Atmosphere: "dust particles visible", "light beams", "bokeh"

---

## Related Documentation

- Quality findings: `apps/modal/test-output/QUALITY-OPTIMIZATION-FINDINGS.md`
- Workflow catalog: `docs/research/infrastructure/runcomfy-workflow-catalog.json`
- Test scripts: `apps/modal/scripts/`
