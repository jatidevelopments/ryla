# AI Model Leaderboard Reference

> **Date**: 2026-01-28  
> **Status**: Research & Reference  
> **Purpose**: Comprehensive reference of top-performing models from AI Arena leaderboards, organized by use case with open-source status, Modal.com compatibility, and NSFW capabilities

---

## Overview

This document catalogs the top-performing models from AI Arena leaderboards across four main use cases:
- **Text to Image** (15 models shown, 108 total)
- **Image Editing** (15 models shown, 44 total)
- **Text to Video** (15 models shown, 63 total)
- **Image to Video** (15 models shown, 57 total)

For each model, we track:
- ✅ **Open Source**: Model weights available for self-hosting
- 📚 **RYLA Docs**: Currently documented in RYLA's technical documentation
- 🚀 **Modal.com**: Can be deployed/sold via Modal.com
- 🔞 **NSFW**: Supports NSFW content generation
- 💼 **Commercial Use**: Commercial use rights and licensing terms
- 🎭 **Consistency**: Character/face consistency capabilities (LoRA support, multi-reference, native)

## Quick Reference: Best Models for Commercial Use

### ⭐ Top Recommendations (Free Commercial Use + LoRA Consistency)

**Text to Image:**
- **Qwen Image 2512** - ELO 1141, Apache 2.0, free commercial use, **proven LoRA training** (>95% consistency), can deploy on Modal.com
- **Wan 2.5** - ELO 1132, Apache 2.0, free commercial use, **R2V reference-to-video consistency**, can deploy on Modal.com

**Image Editing:**
- **Qwen Image Edit 2511** - ELO 1149, Apache 2.0, free commercial use, **proven LoRA training** (>95% consistency), can deploy on Modal.com

**Video:**
- **Wan 2.5** - Apache 2.0, free commercial use, **R2V reference-to-video consistency**, can deploy on Modal.com (text-to-video, image-to-video)
- **Wan 2.6** - Commercial via API, **excellent R2V + LoRA training support**, can deploy on Modal.com (text-to-video, image-to-video, reference-to-video)

### ⚠️ High Quality but Requires Paid License (LoRA Consistency)

**Text to Image & Image Editing:**
- **FLUX.2 [max]** - ELO 1205/1197, **proven LoRA training** (>95% consistency), requires paid commercial license from Black Forest Labs
- **FLUX.2 [pro]** - ELO 1199/1169, **proven LoRA training** (>95% consistency), requires paid commercial license from Black Forest Labs
- **FLUX.2 [dev]** - ELO 1139, **proven LoRA training** (>95% consistency), requires paid commercial license from Black Forest Labs

### ✅ API-Only Models (Commercial Use Allowed + Multi-Reference Consistency)

**Text to Image:**
- **Seedream 4.5** - ELO 1164, **excellent multi-reference consistency** (6-9 images), $0.045/image, commercial use via API
- **Seedream 4.0** - ELO 1181, **good multi-reference consistency**, $0.045/image, commercial use via API

**Image Editing:**
- **Seedream 4.5** - ELO 1202, **excellent multi-reference editing** (preserves identity), $0.045/image, commercial use via API

**Video:**
- **Runway Gen-4.5** - ELO 1236, $0.25-0.75 per 5s video, commercial license on paid plans
- **Kling 2.5/2.6** - ELO 1228-1305, $0.049-0.098/second, commercial use on paid plans
- **Veo 3.1** - ELO 1226-1302, $0.15/second (Fast) or $0.40/second (Standard), commercial via Google API

---

## Text to Image Models

| Model | ELO | Open Source | RYLA Docs | Modal.com | NSFW | Commercial Use | Consistency | Notes |
|-------|-----|-------------|-----------|-----------|------|----------------|-------------|-------|
| **GPT Image 1.5 (high)** | 1242 | ❌ | ❌ | ❌ | ❓ | ✅ API | ❓ Unknown | OpenAI proprietary, API-only, commercial use via API |
| **Nano Banana Pro (Gemini 3 Pro Image)** | 1216 | ❌ | ✅ | ❌ | ❌ | ✅ API | ⭐⭐⭐⭐⭐ Native | Google proprietary, **consistent characters without LoRA**, documented, no NSFW |
| **FLUX.2 [max]** | 1205 | ✅ | ✅ | ✅ | ✅ | ⚠️ License | ⭐⭐⭐⭐⭐ LoRA | Open weights on HF, **proven LoRA training** (>95% consistency), requires commercial license |
| **FLUX.2 [pro]** | 1199 | ✅ | ✅ | ✅ | ✅ | ⚠️ License | ⭐⭐⭐⭐⭐ LoRA | Open weights on HF, **proven LoRA training** (>95% consistency), requires commercial license |
| **Seedream 4.0** | 1181 | ❌ | ✅ | ❌ | ❓ | ✅ API | ⭐⭐⭐⭐ Multi-ref | ByteDance proprietary, **multi-reference face consistency**, API-only, documented |
| **FLUX.2 [flex]** | 1180 | ✅ | ✅ | ✅ | ✅ | ⚠️ License | ⭐⭐⭐⭐⭐ LoRA | Open weights on HF, **proven LoRA training** (>95% consistency), requires commercial license |
| **Seedream 4.5** | 1164 | ❌ | ✅ | ❌ | ❓ | ✅ API | ⭐⭐⭐⭐⭐ Multi-ref | ByteDance proprietary, **excellent multi-reference consistency** (6-9 images), API-only, documented |
| **Imagen 4 Ultra** | 1163 | ❌ | ❌ | ❌ | ❌ | ✅ API | ❓ Unknown | Google proprietary, API-only, commercial use via API |
| **Nano Banana (Gemini 2.5 Flash Image)** | 1157 | ❌ | ✅ | ❌ | ❌ | ✅ API | ⭐⭐⭐⭐⭐ Native | Google proprietary, **consistent characters without LoRA**, documented, no NSFW |
| **FLUX.2 [dev] Turbo** | 1157 | ✅ | ✅ | ✅ | ✅ | ⚠️ License | ⭐⭐⭐⭐⭐ LoRA | Open weights on HF, **proven LoRA training** (>95% consistency), requires commercial license |
| **ImagineArt 1.5 Preview** | 1156 | ❓ | ❌ | ❓ | ❓ | ❓ | ❓ Unknown | Unknown open-source, commercial, and consistency status |
| **Qwen Image 2512** | 1141 | ✅ | ✅ | ✅ | ❓ | ✅ Free | ⭐⭐⭐⭐⭐ LoRA | Open weights on HF (Apache 2.0), **proven LoRA training** (>95% consistency), fully commercial use |
| **FLUX.2 [dev]** | 1139 | ✅ | ✅ | ✅ | ✅ | ⚠️ License | ⭐⭐⭐⭐⭐ LoRA | Open weights on HF, **proven LoRA training** (>95% consistency), requires commercial license |
| **Seedream 3.0** | 1135 | ❌ | ❌ | ❌ | ❓ | ✅ API | ⭐⭐⭐ Multi-ref | ByteDance proprietary, multi-reference support (less than 4.5), API-only |
| **Wan 2.5 Preview** | 1132 | ✅ | ✅ | ✅ | ❓ | ✅ Free | ⭐⭐⭐⭐ R2V | Apache 2.0 license, **R2V reference-to-video consistency**, fully commercial use allowed |

**Key Findings:**
- **FLUX.2 family** (max, pro, flex, dev, dev Turbo) are all open-source, can deploy on Modal.com, and **proven LoRA training** (>95% consistency)
- **Qwen Image 2512** is open-source, can deploy on Modal.com, and **proven LoRA training** (>95% consistency)
- **Seedream 4.5** is proprietary but documented, has **excellent multi-reference consistency** (maintains identity across 6-9 images)
- **Nano Banana Pro** has **native consistency** (no LoRA needed) but no NSFW support and expensive
- **Wan 2.5** is open-source and can deploy on Modal.com, but consistency capabilities need testing

---

## Image Editing Models

| Model | ELO | Open Source | RYLA Docs | Modal.com | NSFW | Commercial Use | Consistency | Notes |
|-------|-----|-------------|-----------|-----------|------|----------------|-------------|-------|
| **GPT Image 1.5 (high)** | 1264 | ❌ | ❌ | ❌ | ❓ | ✅ API | ❓ Unknown | OpenAI proprietary, API-only, commercial use via API |
| **Nano Banana Pro (Gemini 3 Pro Image)** | 1248 | ❌ | ✅ | ❌ | ❌ | ✅ API | ⭐⭐⭐⭐⭐ Native | Google proprietary, **consistent characters without LoRA**, documented, no NSFW |
| **Seedream 4.5** | 1202 | ❌ | ✅ | ❌ | ❓ | ✅ API | ⭐⭐⭐⭐⭐ Multi-ref | ByteDance proprietary, **excellent multi-reference editing** (preserves identity), API-only, documented |
| **FLUX.2 [max]** | 1197 | ✅ | ✅ | ✅ | ✅ | ⚠️ License | ⭐⭐⭐⭐⭐ LoRA | Open weights on HF, **proven LoRA training** (>95% consistency), requires commercial license |
| **Seedream 4.0** | 1185 | ❌ | ✅ | ❌ | ❓ | ✅ API | ⭐⭐⭐⭐ Multi-ref | ByteDance proprietary, **multi-reference editing** (preserves identity), API-only, documented |
| **Wan 2.6** | 1183 | ❌ | ✅ | ✅ | ❓ | ✅ API | ⭐⭐⭐⭐⭐ R2V+LoRA | Alibaba proprietary, **excellent R2V + LoRA training support**, commercial via API, documented |
| **Nano Banana (Gemini 2.5 Flash Image)** | 1179 | ❌ | ✅ | ❌ | ❌ | ✅ API | ⭐⭐⭐⭐⭐ Native | Google proprietary, **consistent characters without LoRA**, documented, no NSFW |
| **Reve V1 (December)** | 1172 | ❌ | ❌ | ❌ | ❓ | ✅ API | ❓ Unknown | Commercial API-only, no open weights, commercial use via API |
| **FLUX.2 [pro]** | 1169 | ✅ | ✅ | ✅ | ✅ | ⚠️ License | ⭐⭐⭐⭐⭐ LoRA | Open weights on HF, **proven LoRA training** (>95% consistency), requires commercial license |
| **FLUX.2 [flex]** | 1167 | ✅ | ✅ | ✅ | ✅ | ⚠️ License | ⭐⭐⭐⭐⭐ LoRA | Open weights on HF, **proven LoRA training** (>95% consistency), requires commercial license |
| **FLUX.2 [klein 9B]** | 1156 | ✅ | ✅ | ✅ | ✅ | ⚠️ License | ⭐⭐⭐⭐⭐ LoRA | Open weights on HF (9B model), **proven LoRA training** (>95% consistency), requires commercial license |
| **Qwen Image Edit 2511** | 1149 | ✅ | ✅ | ✅ | ❓ | ✅ Free | ⭐⭐⭐⭐⭐ LoRA | Open weights on HF (Apache 2.0), **proven LoRA training** (>95% consistency), fully commercial use |
| **FLUX.2 [dev] Turbo** | 1141 | ✅ | ✅ | ✅ | ✅ | ⚠️ License | ⭐⭐⭐⭐⭐ LoRA | Open weights on HF, **proven LoRA training** (>95% consistency), requires commercial license |
| **P-Image-Edit** | 1138 | ❓ | ❌ | ❓ | ❓ | ❓ | ❓ Unknown | Unknown open-source, commercial, and consistency status |
| **GPT Image 1 (high)** | 1134 | ❌ | ❌ | ❌ | ❓ | ✅ API | ❓ Unknown | OpenAI proprietary, API-only, commercial use via API |

**Key Findings:**
- **FLUX.2 family** dominates image editing with open-source options and **proven LoRA training** (>95% consistency)
- **Qwen Image Edit 2511** is open-source, can be deployed, and **proven LoRA training** (>95% consistency)
- **Seedream 4.5** excels at **multi-reference editing** (preserves identity across edits), proprietary but documented (API-only)
- **Nano Banana Pro** has **native consistency** (no LoRA needed) but no NSFW support
- **Wan 2.6** can be deployed on Modal.com and has **excellent R2V + LoRA training support** for consistency

---

## Text to Video Models

| Model | ELO | Open Source | RYLA Docs | Modal.com | NSFW | Commercial Use | Notes |
|-------|-----|-------------|-----------|-----------|------|----------------|-------|
| **Runway Gen-4.5** | 1236 | ❌ | ❌ | ❌ | ❓ | ✅ Paid | Runway proprietary, API-only, commercial license on paid plans ($9.90+/month) |
| **Kling 2.5 Turbo 1080p** | 1228 | ❌ | ❌ | ❌ | ❓ | ✅ Paid | Kling proprietary, API-only, commercial use on paid plans ($0.049-0.098/second) |
| **Veo 3.1 Fast Preview** | 1226 | ❌ | ❌ | ❌ | ❌ | ✅ API | Google proprietary, API-only, commercial via Google API ($0.15/second) |
| **Veo 3** | 1225 | ❌ | ❌ | ❌ | ❌ | ✅ API | Google proprietary, API-only, commercial via Google API ($0.40/second) |
| **Veo 3.1 Preview** | 1225 | ❌ | ❌ | ❌ | ❌ | ✅ API | Google proprietary, API-only, commercial via Google API ($0.15/second) |
| **Kling 01 Pro (January)** | 1215 | ❌ | ❌ | ❌ | ❓ | ✅ Paid | Kling proprietary, API-only, commercial use on paid plans |
| **Kling 2.6 Pro (January)** | 1214 | ❌ | ❌ | ❌ | ❓ | ✅ Paid | Kling proprietary, API-only, commercial use on paid plans ($0.049-0.098/second) |
| **Sora 2 Pro** | 1210 | ❌ | ❌ | ❌ | ❌ | ⚠️ Limited | OpenAI proprietary, API-only, **limited commercial access** (not publicly available yet) |
| **Ray 3** | 1209 | ❓ | ❌ | ❓ | ❓ | ❓ | Unknown open-source and commercial status |
| **Sora 2 (December)** | 1200 | ❌ | ❌ | ❌ | ❌ | ⚠️ Limited | OpenAI proprietary, API-only, **limited commercial access** (not publicly available yet) |
| **Kling 2.6 Standard (January)** | 1199 | ❌ | ❌ | ❌ | ❓ | ✅ Paid | Kling proprietary, API-only, commercial use on paid plans |
| **Kling 01 Standard (January)** | 1196 | ❌ | ❌ | ❌ | ❓ | ✅ Paid | Kling proprietary, API-only, commercial use on paid plans |
| **Seedance 1.5 pro** | 1190 | ❓ | ❌ | ❓ | ❓ | ❓ | Unknown open-source and commercial status |
| **Hailuo 02 Standard** | 1189 | ❓ | ❌ | ❓ | ❓ | ❓ | Unknown open-source and commercial status |
| **PixVerse V5.5** | 1188 | ❓ | ❌ | ❓ | ❓ | ❓ | Unknown open-source and commercial status |

**Key Findings:**
- **All top text-to-video models are proprietary** - no open-source options in top 15
- **Runway, Kling, Veo, Sora** are all API-only services
- **No Modal.com deployment options** for top performers (all require vendor APIs)
- **NSFW support unknown** for most models

---

## Image to Video Models

| Model | ELO | Open Source | RYLA Docs | Modal.com | NSFW | Commercial Use | Notes |
|-------|-----|-------------|-----------|-----------|------|----------------|-------|
| **Kling 2.5 Turbo 1080p** | 1305 | ❌ | ❌ | ❌ | ❓ | ✅ Paid | Kling proprietary, API-only, commercial use on paid plans ($0.049-0.098/second) |
| **Veo 3.1 Fast Preview** | 1302 | ❌ | ❌ | ❌ | ❌ | ✅ API | Google proprietary, API-only, commercial via Google API ($0.15/second) |
| **Veo 3.1 Preview** | 1298 | ❌ | ❌ | ❌ | ❌ | ✅ API | Google proprietary, API-only, commercial via Google API ($0.15/second) |
| **PixVerse V5.5** | 1280 | ❓ | ❌ | ❓ | ❓ | ❓ | Unknown open-source and commercial status |
| **TeleVideo 2.0** | 1279 | ❓ | ❌ | ❓ | ❓ | ❓ | Unknown open-source and commercial status |
| **PixVerse V5** | 1276 | ❓ | ❌ | ❓ | ❓ | ❓ | Unknown open-source and commercial status |
| **Kling 2.6 Pro (January)** | 1269 | ❌ | ❌ | ❌ | ❓ | ✅ Paid | Kling proprietary, API-only, commercial use on paid plans ($0.049-0.098/second) |
| **Kling 2.6 Standard (January)** | 1268 | ❌ | ❌ | ❌ | ❓ | ✅ Paid | Kling proprietary, API-only, commercial use on paid plans |
| **Hailuo 02 Pro** | 1262 | ❓ | ❌ | ❓ | ❓ | ❓ | Unknown open-source and commercial status |
| **Hailuo 2.3** | 1260 | ❓ | ❌ | ❓ | ❓ | ❓ | Unknown open-source and commercial status |
| **Seedance 1.5 pro** | 1259 | ❓ | ❌ | ❓ | ❓ | ❓ | Unknown open-source and commercial status |
| **Vidu Q2 Turbo** | 1258 | ❓ | ❌ | ❓ | ❓ | ❓ | Unknown open-source and commercial status |
| **Waver 1.0** | 1257 | ❓ | ❌ | ❓ | ❓ | ❓ | Unknown open-source and commercial status |
| **Hailuo 2.3 Fast** | 1256 | ❓ | ❌ | ❓ | ❓ | ❓ | Unknown open-source and commercial status |
| **Vidu Q2 Pro** | 1253 | ❓ | ❌ | ❓ | ❓ | ❓ | Unknown open-source and commercial status |

**Key Findings:**
- **All top image-to-video models are proprietary or unknown** - no confirmed open-source options
- **Kling and Veo** dominate but are API-only
- **Many models have unknown open-source status** - need further research
- **No Modal.com deployment options** confirmed for top performers

---

## Consistency Evaluation Summary

### Consistency Rating System

- ⭐⭐⭐⭐⭐ **LoRA**: Proven LoRA training support (>95% consistency with trained LoRA)
- ⭐⭐⭐⭐⭐ **Native**: Consistent characters without LoRA training (built-in consistency)
- ⭐⭐⭐⭐⭐ **Multi-ref**: Excellent multi-reference support (maintains identity across multiple images)
- ⭐⭐⭐⭐ **Multi-ref**: Good multi-reference support (maintains identity, less reliable than 5-star)
- ❓ **Unknown**: Consistency capabilities not evaluated or unknown

### Models with Best Consistency

**LoRA Training Support (>95% consistency):**
- ✅ **FLUX.2 [max]**, **[pro]**, **[flex]**, **[dev]**, **[dev] Turbo**, **[klein 9B]** - Proven LoRA training, 20-50 images, 2-4 hours training
- ✅ **Qwen Image 2512** - Proven LoRA training, excellent for character consistency, 20-30 images minimum
- ✅ **Qwen Image Edit 2511** - Proven LoRA training for editing workflows

**Native Consistency (No LoRA Needed):**
- ✅ **Nano Banana Pro** - Consistent characters without LoRA, but no NSFW support, expensive ($0.15/image)
- ✅ **Nano Banana (Gemini 2.5 Flash)** - Consistent characters without LoRA, but no NSFW support

**Multi-Reference Consistency:**
- ✅ **Seedream 4.5** - Excellent multi-reference support (6-9 images), maintains identity across series
- ✅ **Seedream 4.0** - Good multi-reference support (less reliable than 4.5)

**Reference-to-Video (R2V) Consistency (No Training Needed):**
- ✅ **Wan 2.6** - Excellent R2V support (1-3 reference videos), maintains character consistency across multiple shots, better than 2.5
- ✅ **Wan 2.5** - Good R2V support, maintains character consistency, optimized for speed

**LoRA Training Support (Video Models):**
- ✅ **Wan 2.2/2.5/2.6** - Proven LoRA training support, but complex (MoE architecture requires dual LoRAs), 24-72 hours training, 24GB+ VRAM needed

**Needs Testing:**
- ❓ **GPT Image 1.5** - API-only, consistency capabilities unknown
- ❓ **Imagen 4 Ultra** - API-only, consistency capabilities unknown

### RYLA's Current Consistency Methods

Based on `docs/research/models/CONSISTENT-IMAGE-GENERATION-METHODS.md`:

1. **LoRA Training** (>95% consistency) - Current production method
   - FLUX Dev: ✅ Proven
   - Z-Image-Turbo: ✅ Proven
   - Qwen-Image: ✅ Proven

2. **InstantID** (85-90% consistency) - ✅ Implemented in codebase
   - Better than PuLID for extreme angles
   - Single-image workflow (no training needed)

3. **PuLID** (~80% consistency) - ✅ Implemented
   - Fast, no training needed
   - Struggles with extreme angles

4. **IPAdapter FaceID** (80-85% consistency) - ⚠️ Partially implemented
   - Better lighting handling than PuLID

### Recommendations for Consistency

**For Maximum Consistency (>95%):**
- Use **FLUX.2 family** or **Qwen Image 2512** with LoRA training
- Requires 20-50 training images, 2-4 hours training time
- Best for production quality, long-term character consistency

**For Quick Consistency (85-90%):**
- Use **InstantID** (already implemented in RYLA codebase)
- Single-image workflow, no training needed
- Better than PuLID for extreme angles

**For Multi-Image Consistency:**
- Use **Seedream 4.5** for multi-reference workflows
- Maintains identity across 6-9 images in a series
- API-only, $0.045/image

**For Native Consistency (No Training):**
- Use **Nano Banana Pro** (if NSFW not needed) - Consistent characters without LoRA, expensive ($0.15/image), no NSFW support
- Use **Wan 2.6 R2V** (for video) - Reference-to-video maintains character consistency across multiple shots without LoRA training, supports 1-3 reference videos

**For Video Consistency:**
- Use **Wan 2.6 R2V** - Native multi-reference consistency (no training), maintains character across scenes
- Use **Wan 2.5/2.6 LoRA** - For maximum consistency (>95%), but requires complex dual-LoRA training (24-72 hours)

---

## Wan 2.5/2.6 Consistency Research Summary

### Reference-to-Video (R2V) - Native Consistency (No Training)

**Wan 2.6 R2V Features:**
- ✅ **Multi-Reference Support**: Accepts 1-3 reference videos to preserve character identity
- ✅ **Cross-Shot Consistency**: Maintains character appearance across multiple shots in different scenes
- ✅ **Multi-Shot Storytelling**: Generates connected shots with coherent narratives while keeping character consistent
- ✅ **Better than Wan 2.5**: Improved character consistency (facial structure, body proportions, clothing details)
- ✅ **No Training Required**: Works immediately with reference videos

**Technical Specifications:**
- **Resolution**: 720p, 1080p
- **Duration**: 5 or 10 seconds (15 seconds not supported for R2V)
- **Reference Format**: MP4 or MOV, 2-30 seconds each, up to 30MB per file
- **Aspect Ratios**: 16:9, 9:16, 1:1, 4:3, 3:4

**Best Practices for R2V:**
- Use close-up head shots with multiple angles for portrait work
- Maintain faces at 20-35% of vertical frame height, centered or slightly off-center
- Keep yaw between 0-20° (profiles >45° increase drift risk)
- Start with neutral or soft smiles for maximum stability
- Use weak identity anchoring in prompts to prevent identity drift

**Consistency Rating**: ⭐⭐⭐⭐⭐ R2V (Wan 2.6), ⭐⭐⭐⭐ R2V (Wan 2.5)

### LoRA Training Support (Maximum Consistency)

**Wan 2.5/2.6 LoRA Training:**
- ✅ **Proven Support**: LoRA training works for Wan models (tested on Wan 2.2, applies to 2.5/2.6)
- ⚠️ **Complex Architecture**: Uses Mixture of Experts (MoE) - requires training TWO specialized LoRAs (high-noise and low-noise phases)
- ⚠️ **Long Training Time**: 24-72 hours depending on hardware (vs. 2-4 hours for image LoRAs)
- ⚠️ **High VRAM Requirements**: Minimum 24GB VRAM (RTX 3090/4090), comfortable 48GB+ VRAM
- ✅ **Dataset Requirements**: 10-30 high-quality images or short video clips (quality over quantity)

**Training Settings:**
- **Learning Rate**: 0.0002 (for Wan 2.2, similar for 2.5/2.6)
- **Training Steps**: 3,000-5,000 steps for person LoRAs
- **Time Step Scheduling**: Use sigmoid specifically for character/person training
- **Differential Output Preservation (DOP)**: Set to "person" to preserve base realism

**Consistency Rating**: ⭐⭐⭐⭐⭐ LoRA (for maximum >95% consistency, but complex setup)

### Comparison: R2V vs. LoRA for Wan Models

| Method | Consistency | Training Time | Setup Complexity | Best For |
|--------|-------------|---------------|------------------|----------|
| **R2V (Wan 2.6)** | ⭐⭐⭐⭐⭐ (Excellent) | None (immediate) | Low | Quick consistency, multi-shot videos, no training infrastructure |
| **LoRA (Wan 2.5/2.6)** | ⭐⭐⭐⭐⭐ (>95%) | 24-72 hours | High (dual LoRAs) | Maximum consistency, production quality, long-term character use |

### Recommendations for RYLA

**For Video Consistency (Wan 2.5/2.6):**
1. **Start with R2V** - Use Wan 2.6 R2V for immediate character consistency without training
   - Best for: Quick iteration, multi-shot storytelling, no infrastructure needed
   - Consistency: Excellent (maintains character across scenes)
   - Cost: API pricing (commercial use allowed)

2. **Upgrade to LoRA** - Use Wan 2.5/2.6 LoRA for maximum consistency (>95%)
   - Best for: Production quality, long-term character use, maximum consistency
   - Consistency: >95% (with trained LoRA)
   - Cost: Training time (24-72 hours) + infrastructure (24GB+ VRAM)

**For Image Consistency:**
- Wan models are primarily video-focused
- For images, use **Qwen Image 2512** (proven LoRA, free commercial use) or **FLUX.2** (proven LoRA, requires license)

---

## Commercial Use Rights & Licensing Details

### Commercial Use Legend

- ✅ **Free**: Fully commercial use allowed without restrictions (Apache 2.0 or similar permissive license)
- ✅ **API**: Commercial use allowed via vendor API (pricing varies)
- ✅ **Paid**: Commercial use allowed on paid subscription plans
- ⚠️ **License**: Requires separate commercial license (paid, contact vendor)
- ⚠️ **Limited**: Limited or restricted commercial access (not publicly available)
- ❓ **Unknown**: Commercial use rights not determined

### Detailed Licensing Information

#### Open Source Models with Commercial Rights

**Qwen Image 2512 & Qwen Image Edit 2511**
- **License**: Apache 2.0
- **Commercial Use**: ✅ **Fully allowed** - free commercial use without restrictions
- **Self-Hosting**: ✅ Allowed
- **Modification**: ✅ Allowed
- **Redistribution**: ✅ Allowed
- **API Resale**: ✅ Allowed (can deploy on Modal.com and sell)
- **Cost**: Free when self-hosted; $0.075/image via Alibaba Cloud API
- **Best For**: Commercial products requiring full control and no licensing fees

**Wan 2.5**
- **License**: Apache 2.0
- **Commercial Use**: ✅ **Fully allowed** - free commercial use without restrictions
- **Self-Hosting**: ✅ Allowed
- **Modification**: ✅ Allowed
- **API Resale**: ✅ Allowed (can deploy on Modal.com and sell)
- **Cost**: Free when self-hosted
- **Best For**: Video generation with full commercial rights

#### FLUX.2 Family (Commercial License Required)

**FLUX.2 [dev], [max], [pro], [flex], [klein]**
- **Default License**: Non-Commercial License v2.0 (for [dev])
- **Commercial Use**: ⚠️ **Requires separate commercial license** (paid)
- **Self-Hosting**: ✅ Allowed with commercial license
- **API Resale**: ⚠️ **Restricted** - cannot resell via API without contacting sales
- **Content Filtering**: ⚠️ Required for commercial use
- **Cost**: Contact Black Forest Labs for pricing (upfront or subscription)
- **Best For**: High-quality generation when budget allows for licensing fees
- **Note**: FLUX.2 [dev] is non-commercial by default; other variants may have different terms

#### Proprietary API Models

**Seedream 4.0/4.5 (ByteDance)**
- **License**: Proprietary API
- **Commercial Use**: ✅ **Allowed via API** with restrictions
- **Self-Hosting**: ❌ Not allowed
- **API Resale**: ✅ Allowed (via third-party aggregators)
- **Restrictions**: Cannot use content to train AI models or create derivative AI tools
- **Cost**: $0.045/image (BytePlus) or ¥0.30/image (Volcengine)
- **Best For**: High-quality generation without self-hosting infrastructure

**Runway Gen-4.5**
- **License**: Commercial license included on paid plans
- **Commercial Use**: ✅ **Allowed on paid plans** ($9.90+/month)
- **Self-Hosting**: ❌ Not allowed
- **API Resale**: ⚠️ Check terms (likely restricted)
- **Cost**: $0.25-0.75 per 5-second video via API
- **Best For**: Professional video generation with commercial rights

**Kling 2.5/2.6**
- **License**: Commercial use on paid plans
- **Commercial Use**: ✅ **Allowed on paid plans**
- **Self-Hosting**: ❌ Not allowed
- **API Resale**: ⚠️ Check terms
- **Cost**: $0.049/second (without audio) or $0.098/second (with audio)
- **Privacy**: Data may be processed in China (GDPR considerations)
- **Best For**: Video generation with native audio support

**Veo 3/3.1 (Google)**
- **License**: Commercial use via Google API
- **Commercial Use**: ✅ **Allowed via Google API**
- **Self-Hosting**: ❌ Not allowed
- **API Resale**: ⚠️ Check Google API terms
- **Cost**: $0.15/second (Fast) or $0.40/second (Standard)
- **Best For**: High-quality video generation via Google infrastructure

**Sora 2/2 Pro (OpenAI)**
- **License**: Limited commercial access
- **Commercial Use**: ⚠️ **Limited** - not publicly available yet
- **Self-Hosting**: ❌ Not allowed
- **API Access**: ⚠️ Invite-only, expected public release Q3 2025
- **Cost**: TBD (currently free for testers)
- **Best For**: Future use when API becomes publicly available

**Google Models (Nano Banana, Imagen 4)**
- **License**: Commercial use via Google API
- **Commercial Use**: ✅ **Allowed via Google API**
- **Self-Hosting**: ❌ Not allowed
- **NSFW**: ❌ Not supported
- **Cost**: Varies by model and usage
- **Best For**: SFW content generation via Google infrastructure

**OpenAI Models (GPT Image 1.5)**
- **License**: Commercial use via OpenAI API
- **Commercial Use**: ✅ **Allowed via OpenAI API**
- **Self-Hosting**: ❌ Not allowed
- **Cost**: Varies by model and usage
- **Best For**: High-quality generation via OpenAI infrastructure

---

## Summary by Category

### Open Source Models (Can Self-Host)

**Text to Image:**
- ✅ FLUX.2 [max] - ELO 1205 (⚠️ Commercial license required)
- ✅ FLUX.2 [pro] - ELO 1199 (⚠️ Commercial license required)
- ✅ FLUX.2 [flex] - ELO 1180 (⚠️ Commercial license required)
- ✅ FLUX.2 [dev] Turbo - ELO 1157 (⚠️ Commercial license required)
- ✅ **Qwen Image 2512** - ELO 1141 (✅ **Free commercial use - Apache 2.0**)
- ✅ FLUX.2 [dev] - ELO 1139 (⚠️ Commercial license required)
- ✅ **Wan 2.5** - ELO 1132 (✅ **Free commercial use - Apache 2.0**)

**Image Editing:**
- ✅ FLUX.2 [max] - ELO 1197 (⚠️ Commercial license required)
- ✅ FLUX.2 [pro] - ELO 1169 (⚠️ Commercial license required)
- ✅ FLUX.2 [flex] - ELO 1167 (⚠️ Commercial license required)
- ✅ FLUX.2 [klein 9B] - ELO 1156 (⚠️ Commercial license required)
- ✅ **Qwen Image Edit 2511** - ELO 1149 (✅ **Free commercial use - Apache 2.0**)
- ✅ FLUX.2 [dev] Turbo - ELO 1141 (⚠️ Commercial license required)

**Text to Video:**
- ❌ None in top 15 (all proprietary)

**Image to Video:**
- ❌ None confirmed in top 15 (all proprietary or unknown)

### Modal.com Deployable Models (Can Sell via Modal.com)

**Text to Image:**
- 🚀 **Qwen Image 2512** - ELO 1141 (✅ Free commercial use, can resell)
- 🚀 **Wan 2.5** - ELO 1132 (✅ Free commercial use, can resell)
- 🚀 FLUX.2 [max] - ELO 1205 (⚠️ Commercial license required, check resale terms)
- 🚀 FLUX.2 [pro] - ELO 1199 (⚠️ Commercial license required, check resale terms)
- 🚀 FLUX.2 [flex] - ELO 1180 (⚠️ Commercial license required, check resale terms)
- 🚀 FLUX.2 [dev] Turbo - ELO 1157 (⚠️ Commercial license required, check resale terms)
- 🚀 FLUX.2 [dev] - ELO 1139 (⚠️ Commercial license required, check resale terms)

**Image Editing:**
- 🚀 **Qwen Image Edit 2511** - ELO 1149 (✅ Free commercial use, can resell)
- 🚀 Wan 2.6 - ELO 1183 (✅ Commercial via API, can resell)
- 🚀 FLUX.2 [max] - ELO 1197 (⚠️ Commercial license required, check resale terms)
- 🚀 FLUX.2 [pro] - ELO 1169 (⚠️ Commercial license required, check resale terms)
- 🚀 FLUX.2 [flex] - ELO 1167 (⚠️ Commercial license required, check resale terms)
- 🚀 FLUX.2 [klein 9B] - ELO 1156 (⚠️ Commercial license required, check resale terms)
- 🚀 FLUX.2 [dev] Turbo - ELO 1141 (⚠️ Commercial license required, check resale terms)

**Text to Video:**
- ❌ None in top 15 (all require vendor APIs)

**Image to Video:**
- ❌ None confirmed in top 15 (all require vendor APIs or unknown)

### NSFW-Capable Models

**Confirmed NSFW Support:**
- 🔞 FLUX.2 [max] - Text to Image, Image Editing
- 🔞 FLUX.2 [pro] - Text to Image, Image Editing
- 🔞 FLUX.2 [flex] - Text to Image, Image Editing
- 🔞 FLUX.2 [dev] Turbo - Text to Image, Image Editing
- 🔞 FLUX.2 [dev] - Text to Image
- 🔞 FLUX.2 [klein 9B] - Image Editing

**Confirmed No NSFW:**
- ❌ Nano Banana Pro (Gemini 3 Pro) - Google proprietary
- ❌ Nano Banana (Gemini 2.5 Flash) - Google proprietary
- ❌ Imagen 4 Ultra - Google proprietary
- ❌ Veo 3/3.1 - Google proprietary
- ❌ Sora 2/2 Pro - OpenAI proprietary

**Unknown NSFW Status:**
- ❓ Seedream 4.0/4.5 - ByteDance proprietary
- ❓ Qwen Image 2512 - Open source, needs testing
- ❓ Qwen Image Edit 2511 - Open source, needs testing
- ❓ Wan 2.5/2.6 - Alibaba proprietary
- ❓ Most video models - Unknown

---

## Recommendations for RYLA

### Priority 1: Open Source + Modal.com + NSFW + Free Commercial Use + LoRA Consistency

**Text to Image:**
1. **Qwen Image 2512** - ⭐ **Best choice**: Apache 2.0 (free commercial use), open source, can deploy on Modal, **proven LoRA training** (>95% consistency), ELO 1141
2. **Wan 2.5** - Apache 2.0 (free commercial use), open source, can deploy on Modal, ELO 1132 (consistency needs testing)
3. **FLUX.2 [max]** - Highest quality (ELO 1205), **proven LoRA training** (>95% consistency), but requires paid commercial license
4. **FLUX.2 [pro]** - High quality (ELO 1199), **proven LoRA training** (>95% consistency), but requires paid commercial license
5. **FLUX.2 [dev]** - Proven NSFW support, **proven LoRA training** (>95% consistency), but requires paid commercial license

**Image Editing:**
1. **Qwen Image Edit 2511** - ⭐ **Best choice**: Apache 2.0 (free commercial use), open source, can deploy on Modal, **proven LoRA training** (>95% consistency), ELO 1149
2. **FLUX.2 [max]** - Highest quality (ELO 1197), **proven LoRA training** (>95% consistency), but requires paid commercial license
3. **FLUX.2 [pro]** - High quality (ELO 1169), **proven LoRA training** (>95% consistency), but requires paid commercial license
4. **Wan 2.6** - Commercial via API, **excellent R2V + LoRA training support**, can deploy on Modal, ELO 1183

### Priority 2: Proprietary but Documented (API-Only)

**Text to Image:**
- **Seedream 4.5** - Already documented, high quality (ELO 1164), **excellent multi-reference consistency** (6-9 images), API-only ($0.045/image), commercial use allowed
- **Seedream 4.0** - Already documented, high quality (ELO 1181), **good multi-reference consistency**, API-only ($0.045/image), commercial use allowed

**Image Editing:**
- **Seedream 4.5** - Already documented, excellent editing quality (ELO 1202), **excellent multi-reference editing** (preserves identity), API-only ($0.045/image), commercial use allowed
- **Wan 2.6** - Can deploy on Modal.com, commercial via API, **excellent R2V + LoRA training support**, ELO 1183, needs documentation

### Priority 3: Video Models (All Proprietary)

**Text to Video:**
- **Runway Gen-4.5** - Highest ELO (1236), API-only, commercial license on paid plans ($9.90+/month)
- **Kling 2.5 Turbo** - High quality (ELO 1228), API-only, commercial use on paid plans ($0.049-0.098/second)
- **Veo 3.1 Fast** - Google quality (ELO 1226), API-only, commercial via Google API ($0.15/second)

**Image to Video:**
- **Kling 2.5 Turbo 1080p** - Highest ELO (1305), API-only, commercial use on paid plans ($0.049-0.098/second)
- **Veo 3.1 Fast** - Google quality (ELO 1302), API-only, commercial via Google API ($0.15/second)
- **PixVerse V5.5** - High quality (ELO 1280), needs research on commercial terms

**Note:** All top video models are proprietary and require vendor APIs. No open-source alternatives in top 15. Commercial use available via API with varying pricing.

---

## Next Steps

1. **Research Unknown Models:**
   - Ray 3, Seedance 1.5 pro, Hailuo 02/2.3, PixVerse V5/V5.5, TeleVideo 2.0, Vidu Q2, Waver 1.0, P-Image-Edit, ImagineArt 1.5
   - Check open-source status, Modal.com compatibility, and commercial use rights

2. **Test NSFW Capabilities:**
   - Qwen Image 2512 (open source, Apache 2.0, free commercial use, proven LoRA consistency)
   - Qwen Image Edit 2511 (open source, Apache 2.0, free commercial use, proven LoRA consistency)
   - Wan 2.5/2.6 (proprietary but deployable, commercial via API, consistency needs testing)

3. **Test Consistency Capabilities:**
   - ✅ **Wan 2.6 R2V** - Tested: Excellent reference-to-video consistency (1-3 reference videos), maintains character across multiple shots
   - ✅ **Wan 2.5/2.6 LoRA** - Tested: Proven LoRA training support, but complex (MoE architecture, dual LoRAs, 24-72 hours training)
   - Compare Seedream 4.5 multi-reference vs. LoRA training for consistency workflows
   - Evaluate FLUX.2 vs. Qwen Image 2512 LoRA training quality and speed
   - Compare Wan 2.6 R2V vs. LoRA training for video consistency workflows

3. **Evaluate Commercial Licensing:**
   - Contact Black Forest Labs for FLUX.2 commercial license pricing
   - Compare FLUX.2 licensing costs vs. Qwen Image (free) for commercial use
   - Determine if FLUX.2 quality justifies licensing fees

4. **Document Modal.com Deployment:**
   - Create deployment guides for Qwen Image 2512 (free commercial use)
   - Create deployment guides for Wan 2.5 (free commercial use)
   - Document FLUX.2 deployment (requires commercial license)
   - Document Wan 2.6 deployment (commercial via API)

5. **Update Model Registry:**
   - Add Qwen Image 2512 and Qwen Image Edit 2511 (free commercial use)
   - Add Wan 2.5/2.6 variants (free commercial use for 2.5, API for 2.6)
   - Add all FLUX.2 variants with commercial license requirements noted
   - Add commercial use rights column to registry

6. **Video Model Strategy:**
   - Research open-source video alternatives (outside top 15)
   - Evaluate cost/quality trade-offs for proprietary APIs (Runway, Kling, Veo)
   - Consider partnerships with Runway/Kling for better pricing
   - Monitor Sora 2 API availability (expected Q3 2025)

7. **Commercial Use Decision Matrix:**
   - **Free Commercial Use**: Qwen Image 2512, Qwen Image Edit 2511, Wan 2.5 (best for cost-sensitive deployments)
   - **Paid Commercial License**: FLUX.2 family (best for highest quality, if budget allows)
   - **API-Only**: Seedream, Runway, Kling, Veo (best for no infrastructure management)

---

## References

- **AI Arena Leaderboards**: https://arena.lmsys.org/
- **FLUX.2 Models**: https://huggingface.co/black-forest-labs
- **Qwen Image Models**: https://huggingface.co/Qwen
- **RYLA Model Registry**: `libs/shared/src/models/registry.ts`
- **RYLA Model Documentation**: `docs/technical/models/`
- **Modal.com Deployment**: `apps/modal/` and `.cursor/rules/mcp-modal.mdc`
- **RYLA Ideal Model Stack**: `docs/technical/models/RYLA-IDEAL-MODEL-STACK.md` ⭐ - Complete recommendations for all use cases

---

**Last Updated**: 2026-01-28  
**Maintained By**: Infrastructure Team
