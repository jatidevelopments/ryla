# [EPIC] EP-015: Image Generation Speed-First Flow + Benchmarking

## Overview

The Influencer Wizard currently feels **slow** during:
- Base image generation (3 options)
- Profile picture set generation (7–10 images)

This epic introduces a **speed-first generation mode** (consistency is optional) and a **repeatable benchmark harness** to measure latency across workflows, modes, and “verticals” (archetypes/styles).

## Related Decision Matrix

See `docs/technical/IMAGE-GEN-TECHNOLOGY-DECISION-MATRIX.md`.

## Related Price Matrix

See `docs/technical/IMAGE-GEN-PRICE-MATRIX.md`.

---

## Business Impact

**Target Metric**: **A – Activation**

**Hypothesis**: If users can get base images + profile pictures fast enough to maintain momentum, wizard completion rate increases and abandonment decreases.

**Success Criteria** (measured in production):
- **Time to 3 base images available**: **p50 < 10s** (primary SLA; requires 3-way parallelism), p95 < 25s
- **Profile pictures generated post-create** (Influencer Profile page):
  - Non-blocking (user can use platform while generating)
  - **Notify user when complete** (MVP: in-app toast + persistent status on profile)
  - **Consistency-first** mode is default (reference-based)
  - Target: **Time to 8 profile pics available**: p50 < 60s, p95 < 120s (TBD once consistent mode is stable)
- Wizard completion uplift (baseline → new): +10% relative

---

## Scope

### In Scope

- **Speed-first generation mode** for profile picture set generation:
  - Default to **no PuLID** / no heavy identity constraints
  - Prefer `z-image-danrisi` when compatible; fallback to `z-image-simple`
  - Expose tunables for speed: `steps`, `resolution`, `imageCount`
- **Base image submission parallelization**:
  - Submit the 3 base image jobs concurrently (reduce “time to queue”)
- **Benchmark harness**:
  - Script to generate base images and profile images end-to-end
  - Run multiple permutations (workflow/mode/vertical/prompt sets)
  - Output timing results as JSON + console table
  - Detect missing nodes and skip incompatible workflows (e.g., Danrisi requires RES4LYF)
- **UX/Progress fixes**:
  - Ensure progress never shows `0/0` due to state initialization bugs
- **Analytics instrumentation**:
  - Track latency + selected workflow/mode for each generation step

### Out of Scope (Non-Goals)

- Implementing a new identity-consistency system (FaceID/IP-Adapter) in production
- Training LoRAs as part of wizard flow
- Multi-GPU orchestration / horizontal scaling changes
- Major UI redesign of the wizard

---

## Stories

### [STORY] ST-150: Base Image Generation – Parallel Submission

**Goal**: Reduce base-image latency by ensuring the 3 jobs are queued immediately.

**Acceptance Criteria**
- [ ] Base image generation submits **3 jobs concurrently** (no sequential `await` in a loop)
- [ ] Results can still be polled progressively (image-by-image)
- [ ] Errors are handled per-job; partial completion is supported

---

### [STORY] ST-151: Profile Picture Set – Speed Mode (Default) + Consistency Mode (Optional)

**Goal**: Make wizard profile picture generation fast by default, with optional consistency mode.

**Acceptance Criteria**
- [ ] API supports `generationMode: "fast" | "consistent"` for profile picture set generation
- [ ] Default mode is **fast**
- [ ] Fast mode uses `z-image-danrisi` when compatible, else `z-image-simple`
- [ ] Fast mode defaults to **steps=8 or 9** and **resolution=768 or 1024** (configurable)
- [ ] Consistent mode uses PuLID (current behavior), if available
- [ ] If required nodes are missing for a mode/workflow, API returns a clear error or auto-fallback (documented)

---

### [STORY] ST-152: Benchmark Script – Wizard Generation E2E + Verticals

**Goal**: Provide a single command to benchmark latency and success rate across permutations.

**Acceptance Criteria**
- [ ] Add `scripts/benchmark-image-generation.ts`
- [ ] Supports running:
  - Base images → profile pictures end-to-end
  - Multiple workflows/modes
  - Multiple verticals via a JSON config
- [ ] Records per-run metrics:
  - queue/submit time
  - time-to-first-image
  - time-to-N-images
  - failures/timeouts
  - workflowId + mode + steps + resolution
- [ ] Writes results to `tmp/benchmarks/*.json`
- [ ] Prints a readable summary table to stdout
- [ ] Skips incompatible workflows based on pod node discovery

---

### [STORY] ST-153: Wizard Progress UI – Accuracy + No 0/0

**Goal**: Make progress reporting stable and correct.

**Acceptance Criteria**
- [ ] “Generating X/Y images…” never shows `0/0` when generation is active
- [ ] Expected counts match the selected set + NSFW toggle
- [ ] Rehydration/back navigation doesn’t break progress display

---

## Analytics (PostHog)

### Events

- `wizard_generation_started`
  - props: `{ step: "base_images" | "profile_pictures", mode, workflowId, steps, resolution, nsfwEnabled, setId }`
- `wizard_generation_image_ready`
  - props: `{ step, mode, workflowId, index, positionId?, durationMs }`
- `wizard_generation_completed`
  - props: `{ step, mode, workflowId, totalImages, durationMs, success: true }`
- `wizard_generation_failed`
  - props: `{ step, mode, workflowId, error, durationMs }`
- `wizard_generation_benchmark_run` (dev-only / script)
  - props: `{ runId, permutations, durationMs }`

---

## Risks / Notes

- ComfyUI on a **single GPU** is fundamentally queue-based; “parallel submit” improves queue latency, not true parallel GPU rendering.
- Danrisi requires RES4LYF nodes; if the pod doesn’t have them, we must fallback to simple workflow.

---

## Open Questions

- Should speed-mode default resolution be **768** (faster) or **1024** (better quality)?
- Should benchmark run through **apps/api** (auth + storage) or directly against **ComfyUI pod** (raw speed)?


