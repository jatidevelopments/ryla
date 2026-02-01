# AI Generation Explainer

> A non-technical guide to how RYLA creates AI influencer images and videos.

## What RYLA Does

**Core Value:** Creates virtual influencers (AI-generated people) that look consistent across all their photos - like a real person would.

Users can create an AI influencer once, then generate unlimited content featuring that same "person" in any scenario, pose, or location.

---

## Key AI Concepts in Plain English

| Technical Term | Simple Explanation |
|---|---|
| **AI Model** | A "digital brain" trained on millions of images. It learned what faces, bodies, clothes, backgrounds look like. When you give it a description, it "imagines" and draws a new image. |
| **LoRA** | A small "memory file" that teaches the AI to remember ONE specific face. Without it, the AI creates random faces. With it, your influencer always looks like the same person. |
| **ComfyUI** | A visual "recipe builder" for image creation. Instead of writing code, you connect boxes like LEGO blocks: "take this face" → "put in this pose" → "add this background" → "output image". |
| **Workflow** | The actual recipe - a saved set of steps the AI follows to create your image. Different workflows for different tasks (portraits, full body, video, etc.). |
| **Face Consistency** | Technology (InstantID, PuLID, IPAdapter) that ensures generated images always show the SAME face, not random faces. Critical for influencer identity. |

---

## The Magic (User Perspective)

### Without RYLA
- Need to understand AI models, install software, tweak settings, troubleshoot errors
- Each image might look like a different person
- Hours of learning and setup
- GPU hardware or cloud credits needed

### With RYLA
- Describe your influencer once (age, style, vibe)
- RYLA trains a LoRA for you automatically
- Just type "sitting at a cafe in Paris" and get a consistent photo of YOUR influencer
- No technical knowledge needed
- Pay per generation, no hardware required

---

## The Business Value

Users pay to:
1. **Create** a unique AI influencer identity
2. **Generate** unlimited content featuring that same "person"
3. **Skip** the technical complexity entirely

It's like having a virtual model who never gets tired, is always available, and can be in any location instantly.

---

## How It Works (Technical Flow)

```
User Types Prompt
       ↓
   RYLA API
       ↓
  Select Workflow
  (based on task)
       ↓
   Modal.com
  (GPU servers)
       ↓
    ComfyUI
 (runs workflow)
       ↓
 Generated Image
       ↓
  Stored in R2
       ↓
 Shown to User
```

---

## Current Capabilities

### What RYLA Can Generate Today

| Category | Capability | Quality |
|---|---|---|
| **Text-to-Image** | Generate images from text descriptions | ✅ Production |
| **Face Consistency** | Same face across all images (InstantID) | ✅ Production |
| **LoRA Support** | Custom trained faces | ✅ Production |
| **Image Editing** | Modify existing images with instructions | ✅ Production |
| **Inpainting** | Edit specific parts of an image | ✅ Production |
| **Video Generation** | Create short videos from prompts | ✅ Production |
| **Image Upscaling** | Increase image resolution | ✅ Production |

### Deployed AI Models

| Model | Speed | Quality | Best For |
|---|---|---|---|
| **Qwen-Image 2512** | Slow (50 steps) | Highest | Hero shots, marketing |
| **Qwen-Image Fast** | Fast (4 steps) | Good | Bulk content |
| **Z-Image-Turbo** | Very Fast | Good | Quick iterations |
| **Flux Schnell** | Fast | High | General use |
| **Flux Dev** | Medium | Highest | Quality focus |
| **Wan 2.6** | Slow | High | Video generation |

### Face Consistency Technologies

| Technology | Model Support | Status |
|---|---|---|
| **InstantID** | Flux, SDXL | ✅ Working |
| **IPAdapter FaceID** | Flux | ✅ Working |
| **IPAdapter** | Qwen-Image 2512 | ⚠️ Weak (experimental) |
| **PuLID** | Flux | ✅ Working |
| **ReActor Face Swap** | All models (post-process) | ✅ Working |
| **LoRA Training** | Most models | ✅ Working |

> **Note**: IPAdapter with Qwen-Image 2512 produces weak results due to architectural differences. For reliable face consistency with Qwen-Image, use the **ReActor face swap** endpoints (`/qwen-faceswap` or `/qwen-faceswap-fast`).

---

## Architecture Overview

### Workflow Types

1. **Production Workflows** (`apps/modal/workflows/`)
   - API format JSON files ready for execution
   - Deployed and tested

2. **Community Workflows** (`libs/comfyui-workflows/`)
   - Collected from community sources
   - UI format, need conversion before use

3. **TypeScript Builders** (`libs/business/src/workflows/`)
   - Programmatic workflow creation
   - Type-safe, testable

### Modal Apps (GPU Endpoints)

| App | Purpose |
|---|---|
| `ryla-qwen-image` | High-quality image generation |
| `ryla-qwen-edit` | Image editing and inpainting |
| `ryla-wan26` | Video generation |
| `ryla-z-image` | Fast image generation |
| `ryla-flux` | Flux model generation |
| `ryla-instantid` | Face consistency |
| `ryla-lora` | LoRA-based generation |
| `ryla-seedvr2` | Image upscaling |

---

## Known Limitations

### Current Gaps

| Gap | Impact | Status |
|---|---|---|
| Z-Image + InstantID | Can't use InstantID with Z-Image | Architecture incompatibility |
| Z-Image + PuLID | Can't use PuLID with Z-Image | Architecture incompatibility |
| Workflow converter | Sometimes fails on complex workflows | Being improved |

### Active Initiatives

- **IN-015**: Evaluating workflow deployment platforms (RunComfy, ViewComfy)
- **IN-031**: Agentic workflow deployment system
- **IN-019**: Automated workflow analyzer and code generator

---

## Glossary

| Term | Definition |
|---|---|
| **T2I** | Text-to-Image - generate image from text |
| **I2I** | Image-to-Image - transform one image to another |
| **T2V** | Text-to-Video - generate video from text |
| **Inpaint** | Edit specific masked areas of an image |
| **Checkpoint** | Full AI model file (several GB) |
| **LoRA** | Small add-on model (tens of MB) |
| **CFG** | Classifier-Free Guidance - how closely to follow prompt |
| **Steps** | Number of refinement passes (more = slower but better) |
| **Sampler** | Algorithm for generating images (euler, dpm++, etc.) |
| **Latent** | Compressed representation of image during generation |
| **VAE** | Variational Auto-Encoder - converts latents to pixels |
| **CLIP** | Model that understands text for guiding generation |

---

## Related Documentation

- [Ideal Model Stack](./models/RYLA-IDEAL-MODEL-STACK.md) - Which AI models we use and why
- [Modal Deployment](./infrastructure/modal/) - How we deploy AI endpoints
- [Workflow Conversion](../ops/workflows/COMFYUI-WORKFLOW-CONVERSION.md) - How to convert workflows

---

*Last updated: January 2026*
