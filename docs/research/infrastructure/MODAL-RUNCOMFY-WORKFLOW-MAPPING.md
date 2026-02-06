# Modal Endpoint ↔ RunComfy Workflow Mapping (IN-038)

**Purpose**: Classify every Modal endpoint by app policy (reference image / LoRA / neither), map to RunComfy shortlist workflows, and flag primary vs supporting for the app.  
**Last Updated**: 2026-02-04

---

## 1. App policy (reference image and/or LoRA)

For the main app we only use workflows that support **reference image** and/or **LoRA**. Consistency and hyper-realistic quality are critical.

- **Primary**: Endpoints that accept `reference_image` (or image input for edit/upscale/video-faceswap) and/or `lora_id` / LoRA. These are the main app surfaces.
- **Supporting**: Pure T2I/T2V with no reference image or LoRA; may remain for auxiliary use (e.g. base image for a later reference workflow) but are not primary.

---

## 2. Endpoint classification

| Modal endpoint | Reference image | LoRA | Classification | Primary / Supporting |
|----------------|-----------------|------|----------------|----------------------|
| `/sdxl-instantid` | Yes | No | reference_image | **Primary** |
| `/flux-pulid` | Yes | No | reference_image | **Primary** |
| `/flux-ipadapter-faceid` | Yes | No | reference_image | **Primary** |
| `/qwen-image-edit-2511` | Yes (input image) | No | reference_image | **Primary** |
| `/qwen-image-inpaint-2511` | Yes (input image) | No | reference_image | **Primary** |
| `/video-faceswap` | Yes (ref + video) | No | reference_image | **Primary** |
| `/seedvr2` | Yes (input image) | No | reference_image | **Primary** |
| `/flux-dev-lora` | No | Yes | lora | **Primary** |
| `/qwen-image-2512-lora` | No | Yes | lora | **Primary** |
| `/z-image-lora` | No | Yes | lora | **Primary** |
| `/wan2.6-lora` | No | Yes | lora | **Primary** |
| `/flux` | No | No | neither | Supporting |
| `/flux-dev` | No | No | neither | Supporting |
| `/sdxl-turbo` | No | No | neither | Supporting |
| `/sdxl-lightning` | No | No | neither | Supporting |
| `/qwen-image-2512` | No | No | neither | Supporting |
| `/qwen-image-2512-fast` | No | No | neither | Supporting |
| `/z-image-simple` | No | No | neither | Supporting |
| `/z-image-danrisi` | No | No | neither | Supporting |
| `/wan2.6` | No | No | neither | Supporting |
| `/wan2.6-r2v` | Yes (ref video) | No | reference_image | **Primary** |

**Note**: `/wan2.6-r2v` accepts reference video; counted as primary (reference input). Adjust if product treats R2V as supporting.

---

## 3. Modal endpoint → RunComfy workflow mapping

| Modal endpoint | RunComfy shortlist slug | Path (workflow.json) | Same concept / Different / No equivalent | Action |
|----------------|-------------------------|----------------------|-------------------------------------------|--------|
| **Primary (reference image)** | | | | |
| `/sdxl-instantid` | `comfyui-instantid-workflow` | `runcomfy-workflows/comfyui-instantid-workflow/workflow.json` | Same concept | Port or align params |
| `/flux-pulid` | `comfyui-pulid-customized-face-generation` | `runcomfy-workflows/comfyui-pulid-customized-face-generation/workflow.json` | Same concept | Port or align params |
| `/flux-ipadapter-faceid` | `create-consistent-characters-in-comfyui-with-ipadapter-faceid-plus` | `runcomfy-workflows/create-consistent-characters-in-comfyui-with-ipadapter-faceid-plus/workflow.json` | Same concept | Port or align params |
| `/qwen-image-edit-2511` | `flux-klein-unified-image-editing-inpaint-remove-outpaint-in-comfyui-advanced-image-restoration` | `runcomfy-workflows/flux-klein-unified-image-editing-inpaint-remove-outpaint-in-comfyui-advanced-image-restoration/workflow.json` | Different (Qwen vs Flux Klein) | Note; consider RunComfy Flux Klein for edit later |
| `/qwen-image-inpaint-2511` | (same as edit) | (same) | Different | Note |
| `/video-faceswap` | `comfyui-reactor-workflow-fast-face-swap` | `runcomfy-workflows/comfyui-reactor-workflow-fast-face-swap/workflow.json` | Same concept (ReActor) | Port or align params |
| `/seedvr2` | `seedvr2-comfyui-workflow-best-image-video-upscaler-blur-removal` or `comfyui-hi-res-fix-upscaling-workflow-controlnet-tile-4x-ultrasharp` | In runcomfy-workflows/ | Same concept (upscale) / Alternative | Port or keep current |
| **Primary (LoRA)** | | | | |
| `/flux-dev-lora` | `comfyui-flux-lora-training-detailed-guides` (inference part) / `comfyui-flux-a-new-art-image-generation` | `runcomfy-workflows/comfyui-flux-a-new-art-image-generation/workflow.json` | Same concept | Align with Flux + LoRA |
| `/qwen-image-2512-lora` | No direct RunComfy slug for Qwen+LoRA | — | No equivalent | Fix timeout; keep current |
| `/z-image-lora` | `z-image-turbo-ai-toolkit-lora-inference-in-comfyui-training-matched-results` | In runcomfy-workflows/ | Same concept | Optional port |
| `/wan2.6-lora` | `wan-2-1-lora-customizable-ai-video-generation` | `runcomfy-workflows/wan-2-1-lora-customizable-ai-video-generation/workflow.json` | Similar (Wan 2.1 vs 2.6) | Align or port Wan 2.2 |
| **Supporting (T2I/T2V)** | | | | |
| `/flux` | `comfyui-flux-a-new-art-image-generation` | `runcomfy-workflows/comfyui-flux-a-new-art-image-generation/workflow.json` | Same concept | Align params |
| `/flux-dev` | (same) | (same) | Same concept | Align params |
| `/sdxl-turbo` | `text-to-image-with-sdxl-turbo` | `runcomfy-workflows/text-to-image-with-sdxl-turbo/workflow.json` | Same concept | Align params |
| `/sdxl-lightning` | No dedicated shortlist slug | — | Same family as SDXL | Align or deprioritise |
| `/qwen-image-2512` | No Qwen in shortlist | — | No equivalent | Supporting only |
| `/qwen-image-2512-fast` | No | — | No equivalent | Fix timeout; supporting |
| `/z-image-simple` | Z-Image (diffusers on Modal) | — | Different (Modal uses diffusers) | Fix timeout; no JSON port |
| `/z-image-danrisi` | (same) | — | Different | Fix timeout |
| `/wan2.6` | `comfyui-wan-2-2-image-generation-complete-workflow-pack` or Hunyuan/SVD | In runcomfy-workflows/ | Similar (Wan 2.2) | Optional align |
| `/wan2.6-r2v` | Reference-to-video options in shortlist | — | Same concept | Optional port |

---

## 4. Gap summary and actions

| Priority | Endpoints | Action |
|----------|-----------|--------|
| **Port or align first** (primary, ref image) | `/sdxl-instantid`, `/flux-pulid`, `/flux-ipadapter-faceid`, `/video-faceswap` | Compare Modal handler vs RunComfy workflow.json; port JSON or tweak params. Quality-test (Task 6). |
| **Port or align** (primary, LoRA) | `/flux-dev-lora`, `/wan2.6-lora` | Align with RunComfy Flux/Wan LoRA workflows. Quality-test. |
| **Fix stability only** | `/z-image-simple`, `/z-image-danrisi`, `/qwen-image-2512-fast` | Per-endpoint timeout (Task 2); no workflow change required for now. Supporting. Modal app `timeout=1800` in z-image and qwen-image apps confirmed (client 10 min &lt; server 30 min). |
| **Align supporting** | `/flux`, `/flux-dev`, `/sdxl-turbo` | Align params with RunComfy shortlist for consistency when used as base for ref/LoRA. |
| **Deprioritise or disable** | `/sdxl-lightning` | Bad quality in testing; use SDXL Turbo only until aligned with RunComfy workflow. |
| **Document only** | `/qwen-image-edit-2511`, `/qwen-image-inpaint-2511`, `/seedvr2` | Qwen/SeedVR2 are different from shortlist; keep current; consider RunComfy alternatives in Phase 2. |

---

## 5. T2I workflow alignment notes (Task 3)

### Flux

- **RunComfy** `comfyui-flux-a-new-art-image-generation`: euler sampler, BasicScheduler "simple", **20 steps**, cfg **1**; EmptyLatentImage 1024×1024; separate UNET/CLIP/VAE loaders (Flux Dev–style).
- **Modal**:
  - **Flux Schnell** (`/flux`): CheckpointLoaderSimple `flux1-schnell-fp8`; KSampler **4 steps**, cfg 1, euler, simple; 1024×1024. Different model (Schnell) so 4 steps is correct; no change.
  - **Flux Dev** (`/flux-dev`): UNETLoader + DualCLIPLoader + VAE; **20 steps**, cfg 1, euler, simple. **Aligned** with RunComfy (same steps, CFG, sampler, scheduler).
- **Recommendation**: No param changes. For pixel-aligned behaviour with RunComfy, a future option is to load the RunComfy Flux workflow JSON and drive it with overrides (Option A in plan).

### SDXL Turbo vs SDXL Lightning

- **RunComfy shortlist**: `text-to-image-with-sdxl-turbo` is the SDXL reference; no dedicated SDXL Lightning workflow.
- **Modal**: `/sdxl-turbo` and `/sdxl-lightning` (ByteDance 4-step). Testing showed SDXL Lightning produced distorted output; SDXL Turbo was acceptable.
- **Recommendation**: Prefer **SDXL Turbo** for primary use. **SDXL Lightning** is deprioritised until aligned with a RunComfy or validated workflow; document in app/playground as "supporting only" and avoid promoting for quality-sensitive flows.

---

## 6. Face consistency alignment notes (Task 5)

### Mapping (already in Section 3)

| Modal endpoint | RunComfy workflow |
|----------------|-------------------|
| `/sdxl-instantid` | `comfyui-instantid-workflow` |
| `/flux-pulid` | `comfyui-pulid-customized-face-generation` |
| `/flux-ipadapter-faceid` | `create-consistent-characters-in-comfyui-with-ipadapter-faceid-plus` |

### InstantID comparison

- **RunComfy** `comfyui-instantid-workflow`: Nodes include `InstantIDFaceAnalysis`, `InstantIDModelLoader`, `ControlNetLoader`, `ApplyInstantID` (×2 in graph), plus model/CLIP/VAE and conditioning merge. Uses link IDs and multiple ApplyInstantID for double application.
- **Modal** `handlers/instantid.py`: Builds workflow in code with same node types — `InstantIDFaceAnalysis`, `InstantIDModelLoader`, `ControlNetLoader`, `LoadImage` (reference), `ApplyInstantID`, KSampler, etc. SDXL base (single CLIP) for compatibility; Flux InstantID exists but is not recommended (dual CLIP / ControlNet issues).
- **Differences**: RunComfy graph is more complex (two ApplyInstantID nodes, different node IDs and wiring). Modal uses a single ApplyInstantID and explicit strength params (`instantid_strength`, `controlnet_strength`).
- **Recommendation**: **Tweak first** — align strength/defaults with RunComfy widget values if quality differs. **Optional port**: Load `comfyui-instantid-workflow/workflow.json` in Modal and override prompt, reference image, and dimensions for pixel-aligned behaviour (Phase 2).

### PuLID / IP-Adapter FaceID

- Same approach: mapping in Section 3; compare Modal handler vs RunComfy `workflow.json` if quality issues arise; recommend tweak then optional JSON port.

---

## 7. References

- [RYLA-RUNCOMFY-ONLY-SHORTLIST.md](./RYLA-RUNCOMFY-ONLY-SHORTLIST.md) – use-case → workflow picks
- [runcomfy-workflow-shortlist.md](./runcomfy-workflow-shortlist.md) – tagged catalog
- [apps/modal/ENDPOINT-APP-MAPPING.md](../../apps/modal/ENDPOINT-APP-MAPPING.md) – Modal URLs and apps
- [IN-038 RunComfy Workflow Catalog & RYLA Integration](../initiatives/IN-038-runcomfy-workflow-catalog-integration.md)
