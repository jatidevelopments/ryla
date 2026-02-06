# Modal Endpoint Quality Test Results (Reference Image & LoRA)

**Purpose**: Structured quality tests for all **primary** Modal endpoints (reference-image and LoRA). Used to flag endpoints that fail the consistency/realism bar for workflow port or deprecation.  
**Last Updated**: 2026-02-04

**Dependency**: Run after Task 2 (timeouts) so slow/cold-start endpoints do not fail for timeout rather than quality.

---

## 1. Test matrix

### 1.1 Reference-image endpoints

For each endpoint, use the **same reference image(s)** and 2–3 fixed prompts. Score **face/identity consistency** and **hyper-realistic quality**.

| Endpoint | App | Test prompts (examples) | Pass/fail | Notes |
|----------|-----|--------------------------|-----------|--------|
| `/sdxl-instantid` | ryla-instantid | Professional headshot; portrait; full body | | |
| `/flux-pulid` | ryla-instantid | Same as above | | |
| `/flux-ipadapter-faceid` | ryla-instantid | Same as above | | |
| `/qwen-image-edit-2511` | ryla-qwen-edit | Edit prompt A; Edit prompt B | | |
| `/qwen-image-inpaint-2511` | ryla-qwen-edit | Inpaint prompt A; Inpaint prompt B | | |
| `/video-faceswap` | ryla-qwen-image | Short video faceswap prompt | | |
| `/seedvr2` | ryla-seedvr2 | Upscale input image | | |

### 1.2 LoRA endpoints

For each endpoint, use a **fixed LoRA ID** and 2–3 prompts. Score **character consistency** and **realism**.

| Endpoint | App | Test prompts (examples) | Pass/fail | Notes |
|----------|-----|--------------------------|-----------|--------|
| `/flux-dev-lora` | ryla-flux | Character scene A; Character scene B | | |
| `/qwen-image-2512-lora` | ryla-qwen-image | Same | | |
| `/z-image-lora` | ryla-z-image | Same | | |
| `/wan2.6-lora` | ryla-wan26 | Short video prompt | | |

---

## 2. Pass/fail criteria

- **Face/identity consistency** (reference-image): Same face/identity as reference across outputs; no obvious identity drift. Subjective bar: ≥85% match or pass/fail per reviewer.
- **Hyper-realistic quality**: No major artifacts; skin and lighting realistic; no distorted anatomy. Pass = meets product bar for “influencer” use.
- **Character consistency** (LoRA): Character looks consistent across prompts; LoRA influence visible and stable.
- **Realism** (LoRA): Same as hyper-realistic; no obvious AI artifacts.

**Scoring**: Use 1–5 or pass/fail per criterion. Document in Notes. Endpoint **fails** if either consistency or realism is below bar (e.g. fail, or score &lt; 3).

---

## 3. Test results summary

| Endpoint | Last test date | Result | Face/identity or character | Realism | Notes |
|----------|----------------|--------|----------------------------|---------|--------|
| `/sdxl-instantid` | | ⏳ Pending | | | |
| `/flux-pulid` | | ⏳ Pending | | | |
| `/flux-ipadapter-faceid` | | ⏳ Pending | | | |
| `/qwen-image-edit-2511` | | ⏳ Pending | | | |
| `/qwen-image-inpaint-2511` | | ⏳ Pending | | | |
| `/video-faceswap` | | ⏳ Pending | | | |
| `/seedvr2` | | ⏳ Pending | | | |
| `/flux-dev-lora` | | ⏳ Pending | | | |
| `/qwen-image-2512-lora` | | ⏳ Pending | | | |
| `/z-image-lora` | | ⏳ Pending | | | |
| `/wan2.6-lora` | | ⏳ Pending | | | |

**Legend**: ✅ Pass | ❌ Fail | ⏳ Pending

---

## 4. Sample assets

- **Reference image(s)**: Use a single high-quality face image for all face-consistency endpoints for comparability. Store path or URL in shared test assets (e.g. `apps/modal/scripts/test_assets/` or doc link).
- **LoRA**: Use one known-good LoRA ID for all LoRA endpoints where possible.

---

## 5. Handoff

- **Failures** → Feed into Task 3 / Task 5 (workflow alignment) and product decisions (promote vs hide vs replace endpoint).
- **Automation**: Script `apps/modal/scripts/quality-test-matrix.py` runs the test matrix and outputs a machine-readable summary (JSON) for CI or regression. Usage: `python apps/modal/scripts/quality-test-matrix.py [--output path]`; set `REF_IMAGE_PATH` and/or `LORA_ID` for full coverage.
