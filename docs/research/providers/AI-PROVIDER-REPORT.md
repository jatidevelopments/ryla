# AI Provider Report: Complete Research & Comparison

> **Date**: 2026-02-02  
> **Status**: Living document  
> **Purpose**: Single source of truth for AI/infra provider research—costs, pros/cons, use cases, and RYLA relevance

---

## What's in This Report

| Section                         | Content                                                                    |
| ------------------------------- | -------------------------------------------------------------------------- |
| **Executive summary**           | Key findings, RYLA stack, quick recommendations                            |
| **Provider categories**         | GPU/infra vs managed API                                                   |
| **Provider profiles**           | Per-provider: overview, pricing, pros/cons, NSFW, best for, RYLA relevance |
| **Comparison matrices**         | Cost, features, NSFW, setup effort                                         |
| **Recommendations by use case** | Image gen, video, LoRA, prompt enhancement                                 |
| **Maintenance**                 | How to keep this report updated                                            |

**Source docs** (detailed research):

- GPU/infra: `docs/research/infrastructure/COMFYUI-PLATFORM-MARKET-RESEARCH.md`, `MODAL-VS-RUNPOD-COMPARISON.md`, `VAST-AI-VS-MODAL-RUNPOD-COMPARISON.md`
- API/managed: `docs/research/providers/MVP-PROVIDER-RECOMMENDATIONS.md`, `FAL-AI-VS-RUNPOD-COMPARISON.md`
- NSFW: `docs/research/providers/INFRASTRUCTURE-NSFW-POLICIES.md`
- Modal costs (RYLA): `docs/technical/infrastructure/MODAL-ENDPOINT-COST-REPORT.md`

---

## Executive Summary

### RYLA Current Stack (as of 2026-02)

| Use case                   | Primary                     | Fallback / notes                       |
| -------------------------- | --------------------------- | -------------------------------------- |
| **Image/Video generation** | **Modal** (ADR-007)         | RunPod legacy; Fal.ai for quick tests  |
| **LoRA training**          | RunPod (AI Toolkit) / Modal | —                                      |
| **Prompt enhancement**     | Direct OpenAI/Gemini        | OpenRouter recommended (not yet added) |
| **Payments**               | Finby                       | —                                      |
| **Analytics**              | PostHog                     | —                                      |
| **Storage**                | Cloudflare R2               | —                                      |

### Quick Recommendations

- **Image/video production**: Modal (reliability, IaC, GitHub Actions). Vast.ai or RunComfy if cost is paramount and templates fit.
- **NSFW / full control**: Modal or RunPod (infra); avoid managed APIs for critical NSFW.
- **Cheapest raw compute**: Vast.ai ≈ RunPod &lt; Modal &lt; RunComfy/ViewComfy &lt; Fal/Replicate &lt; enterprise clouds.
- **Fastest setup**: RunComfy / ViewComfy (ComfyUI-native) &gt; Vast.ai (template) &gt; Fal.ai &gt; Modal &gt; RunPod.
- **Best DX / IaC**: Modal (Python, `modal deploy`, volumes in code).

---

## Provider Categories

### Category A: GPU / Infrastructure (self-host workflows, ComfyUI, custom models)

You bring code/models; provider runs GPUs. Full control, NSFW depends on provider policy.

| Provider          | Type                         | Serverless | ComfyUI            | Typical cost tier |
| ----------------- | ---------------------------- | ---------- | ------------------ | ----------------- |
| **Modal**         | Code-driven serverless       | ✅         | Manual (Python)    | $$                |
| **RunPod**        | GPU pods + serverless        | ✅         | Via workers        | $                 |
| **Vast.ai**       | GPU marketplace + serverless | ✅         | Pre-built template | $                 |
| **RunComfy**      | ComfyUI-native cloud         | ✅         | Native             | $$                |
| **ViewComfy**     | ComfyUI-native cloud         | ✅         | Native             | $$                |
| **Fal.ai**        | Managed inference            | ✅         | Optimized          | $$                |
| **Replicate**     | Cog/containers               | ✅         | Via Cog            | $$                |
| **Baseten**       | Enterprise ML                | ✅         | Manual             | $$$               |
| **AWS SageMaker** | Enterprise                   | ⚠️ Partial | Manual             | $$$$              |
| **GCP Vertex AI** | Enterprise                   | ⚠️ Partial | Manual             | $$$               |
| **Azure ML**      | Enterprise                   | ⚠️ Partial | Manual             | $$$$              |

### Category B: Managed API / LLM (prompt enhancement, chat, no GPU ops)

| Provider            | Use case               | RYLA relevance                     |
| ------------------- | ---------------------- | ---------------------------------- |
| **OpenRouter**      | LLM proxy, 500+ models | Recommended for prompt enhancement |
| **OpenAI / Gemini** | Direct LLM APIs        | Current prompt enhancement         |
| **Wiro.ai**         | Image/editing API      | Phase 2 eval (NSFW unknown)        |

---

## Provider Profiles

### Modal

| Field        | Content                                                                                                                                                                             |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Overview** | Code-driven serverless GPU platform. Deploy with Python; `modal deploy`; GitHub Actions native. Volumes and NFS in code.                                                            |
| **Pricing**  | Per-second GPU. L40S ~$1.95/hr; A10 ~$1.10/hr; A100-80GB ~$2.50/hr. **Volume storage included.** RYLA benchmarks: Flux Dev ~$0.020/img, Flux Dev LoRA ~$0.033, Wan 2.6 ~$0.016/vid. |
| **Pros**     | IaC (Python); native GitHub Actions; no separate volume fee; reliable; MCP/REST friendly; local `modal run`; good docs.                                                             |
| **Cons**     | Higher $/execution than RunPod/Vast; need to define image (custom nodes in code).                                                                                                   |
| **NSFW**     | ✅ Allowed (legal content). IaaS; no content scanning.                                                                                                                              |
| **Best for** | Teams that want IaC, CI/CD, and stable production.                                                                                                                                  |
| **RYLA**     | **Primary** image/video provider (ADR-007). 21 endpoints on L40S.                                                                                                                   |

---

### RunPod

| Field        | Content                                                                                                                                       |
| ------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| **Overview** | GPU pods + serverless workers. Network volumes for models. ComfyUI via workers/templates.                                                     |
| **Pricing**  | GPU: RTX 4090 ~$0.25–0.70/hr, A100 ~$1.80/hr. Volume ~$0.07/GB/mo. Per image (Flux Dev): ~$0.003–0.007 (serverless), ~$0.05–0.07 (dedicated). |
| **Pros**     | Low raw compute cost; scale-to-zero; full control; proven NSFW (e.g. Flux Dev uncensored).                                                    |
| **Cons**     | Worker reliability issues; custom nodes = custom Docker; no native GitHub Actions; setup complexity.                                          |
| **NSFW**     | ✅ Allowed (legal). Unmanaged pods; no content monitoring.                                                                                    |
| **Best for** | Cost-sensitive workloads if reliability is acceptable; LoRA (AI Toolkit).                                                                     |
| **RYLA**     | Legacy; LoRA training (AI Toolkit). Migrated primary inference to Modal.                                                                      |

---

### Vast.ai

| Field        | Content                                                                                                                             |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Overview** | GPU marketplace with serverless; reserve pool for faster cold starts. Pre-built ComfyUI template, `/generate/sync`, S3 config.      |
| **Pricing**  | RTX 4090 ~$0.35/hr (~20% cheaper than RunPod); A100 ~$1.4–1.6/hr (est.). Volume pricing unclear. Per 1k images (SDXL): ~$0.50–1.00. |
| **Pros**     | Cheapest raw compute; fast setup (template); good cold starts; Jupyter/SSH.                                                         |
| **Cons**     | No IaC (template-based); GitHub Actions unclear; marketplace reliability unknown; custom nodes support unclear.                     |
| **NSFW**     | ⚠️ Not documented in policy; assume similar to RunPod (infra) but verify.                                                           |
| **Best for** | Cost-optimized ComfyUI when template fits; simple workflows.                                                                        |
| **RYLA**     | Alternative for cost; needs testing (custom nodes, reliability).                                                                    |

---

### RunComfy

| Field        | Content                                                                                                                         |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------- |
| **Overview** | ComfyUI-native cloud: Cloud Save (env + nodes + models), one-click serverless deploy.                                           |
| **Pricing**  | Pay-per-use GPU. T4/A4000 ~$0.40/hr; A10 ~$1.75–2.50/hr; A100 ~$2–3.50/hr. Per 1k SDXL ~$0.90–1.30 (T4) to ~$5.60–14.60 (A100). |
| **Pros**     | Easiest ComfyUI path; custom nodes via Manager; scale-to-zero; no Docker.                                                       |
| **Cons**     | More expensive than RunPod/Vast/Modal for raw compute; no IaC.                                                                  |
| **NSFW**     | ⚠️ Not documented; verify before relying for NSFW.                                                                              |
| **Best for** | Fast production ComfyUI with minimal DevOps.                                                                                    |
| **RYLA**     | Option for “fast path” if custom-node pain is high; cost vs Modal to be compared.                                               |

---

### ViewComfy

| Field        | Content                                                                  |
| ------------ | ------------------------------------------------------------------------ |
| **Overview** | ComfyUI-focused, workflow-as-a-service; team collaboration, env sharing. |
| **Pricing**  | Per-second GPU. A10 ~$2.20/hr, A100 ~$4.10/hr. Scales to zero.           |
| **Pros**     | Native ComfyUI; low setup; collaboration features.                       |
| **Cons**     | Higher cost than Vast/RunPod/Modal; no IaC.                              |
| **NSFW**     | ⚠️ Not documented; verify.                                               |
| **Best for** | Teams wanting managed ComfyUI and collaboration.                         |
| **RYLA**     | Alternative to RunComfy; same trade-offs.                                |

---

### Fal.ai

| Field        | Content                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------ |
| **Overview** | Managed inference; 600+ models; upload ComfyUI JSON; managed runtime, scale-to-zero.             |
| **Pricing**  | Pay-per-execution. Nano Banana Pro ~$0.15/img; Flux ~$0.05–0.15/img (est.). No idle cost.        |
| **Pros**     | No infra; fast experimentation; LoRA training APIs; unified API.                                 |
| **Cons**     | Higher per-image cost at scale; NSFW model-dependent (Nano Banana Pro: no NSFW); vendor lock-in. |
| **NSFW**     | ❓ Model-dependent. Nano Banana Pro: ❌ No. Others: unknown.                                     |
| **Best for** | Prototyping, testing, low volume; fallback when self-host unavailable.                           |
| **RYLA**     | Fallback / testing. Not primary for NSFW production.                                             |

---

### Replicate

| Field        | Content                                                                                        |
| ------------ | ---------------------------------------------------------------------------------------------- |
| **Overview** | Cog-based containers; model versioning; API-first. ComfyUI via custom Cog builds.              |
| **Pricing**  | Pay-per-run; model-dependent. Roughly ~$0.002–0.005/img for common models.                     |
| **Pros**     | Versioned models; REST/MCP-friendly; scale-to-zero.                                            |
| **Cons**     | Custom nodes = custom Cog builds; platform ToS may restrict NSFW; less control than self-host. |
| **NSFW**     | ⚠️ Some models (e.g. Whiskii Gen) but ToS restrictions; not reliable for critical NSFW.        |
| **Best for** | Versioned model APIs; structured deployments.                                                  |
| **RYLA**     | Not in MVP stack (RunPod/Modal + Fal.ai preferred).                                            |

---

### Baseten

| Field        | Content                                                       |
| ------------ | ------------------------------------------------------------- |
| **Overview** | Enterprise serverless ML; Docker-based deployment; REST APIs. |
| **Pricing**  | $$$; enterprise pricing and management.                       |
| **Pros**     | Reliability; good docs; REST/MCP.                             |
| **Cons**     | Expensive; ComfyUI/custom nodes manual.                       |
| **NSFW**     | ⚠️ Enterprise policies; verify.                               |
| **Best for** | Enterprise compliance, productizing ML.                       |
| **RYLA**     | Overkill for current MVP.                                     |

---

### AWS SageMaker / GCP Vertex AI / Azure ML

| Field        | Content                                                                                      |
| ------------ | -------------------------------------------------------------------------------------------- |
| **Overview** | Managed ML platforms; custom Docker for ComfyUI; async/autoscaling (not true scale-to-zero). |
| **Pricing**  | $$$–$$$$; high management and per-hour/per-ms costs. Spot can cut 60–90% but interruptible.  |
| **Pros**     | Compliance, SLAs, existing cloud integration.                                                |
| **Cons**     | Heavy DevOps; slow setup; highest cost for ComfyUI.                                          |
| **NSFW**     | Depends on account/org policy; typically not an issue for infra.                             |
| **Best for** | Enterprise, compliance, data residency.                                                      |
| **RYLA**     | Not recommended for fast MVP.                                                                |

---

### OpenRouter

| Field        | Content                                                                                   |
| ------------ | ----------------------------------------------------------------------------------------- |
| **Overview** | LLM proxy: one API, 500+ models; automatic fallback; OpenAI-compatible.                   |
| **Pricing**  | Often 20–40% cheaper than direct OpenAI/Gemini via model selection (e.g. DeepSeek, Qwen). |
| **Pros**     | Single key; many models; cost savings; drop-in for OpenAI client.                         |
| **Cons**     | Extra dependency; need to validate quality per model.                                     |
| **NSFW**     | N/A (LLM only).                                                                           |
| **Best for** | Prompt enhancement, chat, cost-optimized LLM.                                             |
| **RYLA**     | **Recommended** for prompt enhancement (not yet implemented).                             |

---

### Wiro.ai

| Field        | Content                                            |
| ------------ | -------------------------------------------------- |
| **Overview** | Image/editing API (e.g. Seedream 4.5, Qwen Image). |
| **Pricing**  | Unclear; to be verified.                           |
| **Pros**     | Additional models; API simplicity.                 |
| **Cons**     | NSFW unknown; not self-hosted.                     |
| **NSFW**     | ❓ Unknown.                                        |
| **Best for** | Phase 2 evaluation for SFW/alternative models.     |
| **RYLA**     | Skip for MVP; re-evaluate after NSFW verification. |

---

## Comparison Matrices

### Cost (low → high)

| Tier     | Providers                              | Notes                                   |
| -------- | -------------------------------------- | --------------------------------------- |
| **$**    | Vast.ai, RunPod                        | Cheapest raw GPU; RunPod + volume fee   |
| **$–$$** | Modal                                  | Slightly higher $/run; storage included |
| **$$**   | RunComfy, ViewComfy, Fal.ai, Replicate | Balanced or per-run                     |
| **$$$**  | Baseten, GCP Vertex                    | Enterprise                              |
| **$$$$** | AWS SageMaker, Azure ML                | Highest                                 |

### Per-image (approx, 1k images)

| Provider         | SDXL-type   | Flux-type       | Notes                   |
| ---------------- | ----------- | --------------- | ----------------------- |
| Vast.ai RTX 4090 | ~$0.50–1.00 | —               | Per 1k                  |
| RunPod RTX 4090  | $0.60–1.60  | —               | Per 1k                  |
| Modal L40S       | —           | ~$20 (Flux Dev) | RYLA benchmark          |
| Fal.ai           | ~$2–5       | ~$50–150        | Per 1k, model-dependent |
| RunComfy A10     | $2.40–5.60  | $5.60–14.60     | Per 1k                  |

### Features

| Feature                  | Modal       | RunPod     | Vast.ai     | RunComfy   | Fal.ai    |
| ------------------------ | ----------- | ---------- | ----------- | ---------- | --------- |
| Serverless scale-to-zero | ✅          | ✅         | ✅          | ✅         | ✅        |
| IaC / version control    | ✅ Python   | ⚠️ Docker  | ❌          | ❌         | ❌        |
| GitHub Actions native    | ✅          | ❌         | ⚠️          | ⚠️         | ❌        |
| ComfyUI native/easy      | ⚠️ Manual   | ⚠️ Workers | ✅ Template | ✅         | ✅        |
| Custom nodes             | ⚠️ In image | ⚠️ Complex | ⚠️ Unknown  | ✅ Manager | ✅ Mostly |
| Volume/storage           | Included    | Extra $    | Unclear     | —          | N/A       |
| MCP / REST friendly      | ✅          | ⚠️         | ⚠️          | ⚠️         | ✅        |

### NSFW / content policy

| Provider                   | Policy             | Notes                                       |
| -------------------------- | ------------------ | ------------------------------------------- |
| **Modal**                  | ✅ Allowed (legal) | IaaS; no content scanning                   |
| **RunPod**                 | ✅ Allowed (legal) | Unmanaged pods; proven (e.g. Flux Dev)      |
| **Vast.ai**                | ⚠️ Verify          | Infra; policy not quoted                    |
| **RunComfy / ViewComfy**   | ⚠️ Verify          | Not documented                              |
| **Fal.ai**                 | ❓ Model-dependent | Nano Banana Pro: no NSFW                    |
| **Replicate**              | ⚠️ ToS limits      | Some models; not reliable for critical NSFW |
| **Managed (OpenAI, etc.)** | N/A or restrictive | LLM; not image gen                          |

---

## Recommendations by Use Case

| Use case                        | Preferred                 | Alternative                     | Avoid / caveat                  |
| ------------------------------- | ------------------------- | ------------------------------- | ------------------------------- |
| **RYLA image/video production** | Modal                     | RunPod (legacy), Vast.ai (cost) | Fal/Replicate for critical NSFW |
| **NSFW, full control**          | Modal, RunPod             | Vast.ai (verify policy)         | Fal/Replicate as primary        |
| **Lowest cost**                 | Vast.ai, RunPod           | Modal (incl. storage)           | Enterprise clouds for MVP       |
| **Fastest setup**               | RunComfy, ViewComfy       | Vast.ai, Fal.ai                 | RunPod, AWS/GCP/Azure           |
| **IaC + CI/CD**                 | Modal                     | —                               | RunPod, Vast, RunComfy (no IaC) |
| **Prompt enhancement**          | OpenRouter (recommended)  | Direct OpenAI/Gemini            | —                               |
| **LoRA training**               | RunPod AI Toolkit / Modal | Fal.ai 1.2.2 (NSFW unknown)     | —                               |
| **Testing new models**          | Fal.ai                    | RunPod/Modal                    | —                               |
| **Enterprise compliance**       | AWS / GCP / Azure         | Baseten                         | —                               |

---

## Maintenance: Keeping This Report Updated

1. **Pricing**

   - Update from provider pricing pages and RYLA benchmarks.
   - RYLA Modal: refresh from `docs/technical/infrastructure/MODAL-ENDPOINT-COST-REPORT.md` and benchmark runs.

2. **New providers**

   - Add a row to the right category (GPU/infra vs API).
   - Fill: overview, pricing, pros/cons, NSFW, best for, RYLA relevance.
   - Add to comparison matrices.

3. **Policy / NSFW**

   - After any provider or ToS change, re-check `INFRASTRUCTURE-NSFW-POLICIES.md` and this report’s NSFW cells.

4. **Review cadence**

   - Quarterly or when changing stack (e.g. new primary provider, new use case).
   - Update “Date” and “RYLA Current Stack” at top.

5. **Source docs**
   - Keep “What’s in This Report” and “Source docs” accurate when adding or moving detailed research.

---

## References

- [ComfyUI Platform Market Research](../research/infrastructure/COMFYUI-PLATFORM-MARKET-RESEARCH.md)
- [Modal vs RunPod Comparison](../research/infrastructure/MODAL-VS-RUNPOD-COMPARISON.md)
- [Vast.ai vs Modal/RunPod Comparison](../research/infrastructure/VAST-AI-VS-MODAL-RUNPOD-COMPARISON.md)
- [Fal.ai vs RunPod Comparison](FAL-AI-VS-RUNPOD-COMPARISON.md)
- [MVP Provider Recommendations](MVP-PROVIDER-RECOMMENDATIONS.md)
- [Infrastructure NSFW Policies](INFRASTRUCTURE-NSFW-POLICIES.md)
- [Modal Endpoint Cost Report (RYLA)](../../technical/infrastructure/MODAL-ENDPOINT-COST-REPORT.md)
- [ADR-007: Modal over RunPod](../../decisions/ADR-007-modal-over-runpod.md)

---

**Last Updated**: 2026-02-02  
**Next Review**: When changing primary provider or quarterly
