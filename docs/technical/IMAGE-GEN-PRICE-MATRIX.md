# Image Generation – Price Matrix + Budget Fit (MVP)

> **Date**: 2025-12-30  
> **Scope**: Wizard (base + profile) + Studio (generate/edit/upscale)  
> **Budget constraints from PM**:
> - **$2 max per influencer creation** (base + initial profile set)
> - **$5 max per influencer creation including LoRA training**
> - **NSFW** required; keep it to **1–2 models** for now

---

## Definitions (so we compare apples-to-apples)

### “Influencer creation” cost (MVP)

For budgeting, assume:
- **Base images**: 3 images
- **Profile set**: 8 images (speed mode default)

Total = **11 images** (SFW path).  
If NSFW enabled and you generate 2 additional NSFW profiles, total = **13 images**.

**Target average cost per image**:
- SFW 11 images: \(2 / 11 \approx 0.18\) USD/image
- With 2 NSFW images (13): \(2 / 13 \approx 0.15\) USD/image

## Target latency (so price comparisons include UX)

PM targets:
- **Base image generation**: ideally **< 10s**
- **Profile images (set)**: ideally **< 30–60s**

Clarification needed (to lock this into KPIs): does “<10s” mean **time-to-first** base image, or **time-to-all-3** base images?

---

## Price matrix (provider-level)

This section is meant to pick the *provider strategy* first, then the exact models.

### A) Self-hosted (RunPod / ComfyUI pod) – recommended for NSFW + cost control

**Cost drivers**:
- GPU hourly rate × wall-clock seconds per image (plus overhead)

Example reference rate from internal research:
- **RTX 4090**: **$0.69/hr** (≈ **$0.0001917/sec**)  
  Source: `docs/research/FAL-AI-VS-RUNPOD-COMPARISON.md`

**Measured benchmark (our pod, Z-Image Danrisi, fast mode)**:
- Base (3 images): **~28.65s** total
- Profile (8 images): **~55.07s** total
- Total: **~83.7s** for 11 images  
  Source: `tmp/benchmarks/benchmark-2025-12-30T17-12-41-871Z.json` (latest run)

**Estimated compute cost per influencer creation**:
- \(83.7 \times 0.0001917 \approx 0.016\) USD

✅ Easily under **$2** (even with higher steps/resolution)  
✅ NSFW possible (full control)  
⚠️ Requires ops (model/node management, reliability work)

### B) fal.ai (managed serverless GPUs) – good for SFW “premium” option

Internal research summary:
- Some models are priced per image (e.g. Nano Banana Pro **$0.15/image**)
- Flux/Qwen/cDream pricing varies and must be verified per chosen model  
  Source: `docs/research/FAL-AI-VS-RUNPOD-COMPARISON.md`

Rule of thumb from internal doc:
- “Flux (estimated)” **$0.05–0.15/image**

Budget fit (SFW 11 images):
- Low: 11 × 0.05 = **$0.55**
- High: 11 × 0.15 = **$1.65**

✅ Can fit under **$2** for SFW creation  
⚠️ NSFW support is model-dependent/uncertain (treat as SFW-only unless proven)

### C) Replicate (managed) – generally avoid for NSFW-critical paths

Internal research summary:
- NSFW-capable models exist, but platform policy risk is higher for production NSFW
  Source: `docs/research/FAL-AI-VS-RUNPOD-COMPARISON.md`

✅ Useful for SFW experiments/prototyping  
⚠️ NSFW risk (policy + model availability churn)  
⚠️ Pricing varies per model and hardware; compute budget must be validated per model

---

## Recommended MVP price strategy (based on your constraints)

### Influencer creation (Wizard: base + initial profile set)

**Primary path** (SFW + NSFW):
- **Self-hosted ComfyUI** (RunPod pod) for **all** wizard creation steps
  - Reason: meets the **$2** cap by a wide margin, and covers NSFW reliably.

**Optional premium path** (SFW only):
- Add **fal.ai** as an optional **SFW “quality model”** later if we need higher fidelity on base images.

### Studio

Studio wants “3 models”:
- Model #1: **Self-hosted (NSFW-capable)** baseline (always available)
- Model #2: **SFW external** “premium quality”
- Model #3: **SFW external** “fast / cheap”

---

## Cost decision rubric (what we score)

For each candidate model/provider we record:
- **$/image @ 1024×1024** (or $/MP)
- **p50 time-to-first-image**
- **p50 time-to-N-images**
- **SFW/NSFW policy** (hard constraint)
- **Quality score** (QA rubric)
- **Reliability** (error rate)

Then select the minimum set that satisfies:
- Wizard creation ≤ **$2**
- Wizard + LoRA training ≤ **$5**

---

## TODOs (to finalize with exact model names)

1) Pick **which fal.ai models** are our two SFW “studio models” (premium + fast)
2) Add a small benchmark harness for fal.ai (same prompts, same resolution) to compute:
   - $/image
   - time-to-first
   - quality rubric


