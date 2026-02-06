# Modal Endpoints & Scripts Audit

**Date**: 2026-02-04  
**Scope**: Deployed Modal endpoints, deployment scripts, testing, benchmarking, and repo consistency.

---

## 1. Currently Deployed Modal Endpoints

**Source of truth**: `apps/modal/ENDPOINT-APP-MAPPING.md` (updated 2026-02-02)

### 7 Split Apps (Production)

| App Name          | Endpoints | Purpose |
|-------------------|-----------|---------|
| `ryla-flux`       | `/flux`, `/flux-dev`, `/flux-dev-lora` | Flux Schnell/Dev + LoRA |
| `ryla-instantid`  | `/sdxl-instantid`, `/sdxl-turbo`, `/sdxl-lightning`, `/flux-pulid`, `/flux-ipadapter-faceid` | Face consistency (InstantID, PuLID, IP-Adapter) |
| `ryla-qwen-image` | `/qwen-image-2512`, `/qwen-image-2512-fast`, `/qwen-image-2512-lora`, `/video-faceswap` | Qwen-Image 2512 + video faceswap |
| `ryla-qwen-edit`  | `/qwen-image-edit-2511`, `/qwen-image-inpaint-2511` | Qwen-Image Edit/Inpaint |
| `ryla-z-image`    | `/z-image-simple`, `/z-image-danrisi`, `/z-image-lora` | Z-Image-Turbo T2I |
| `ryla-wan26`      | `/wan2.6`, `/wan2.6-r2v`, `/wan2.6-lora` | Wan 2.6 video |
| `ryla-seedvr2`    | `/seedvr2` | Image upscaling |

**Total**: 21 endpoints across 7 apps.  
**URL pattern**: `https://{workspace}--{app-name}-comfyui-fastapi-app.modal.run{path}`  
**Legacy single app** (`ryla-comfyui`): Root `app.py` still exists; deploy script uses **split apps** only.

---

## 2. Deployment

### 2.1 How to Deploy (Current)

| Action | Command |
|--------|---------|
| Deploy all split apps | `cd apps/modal && ./deploy.sh` |
| Deploy one app | `cd apps/modal && ./deploy.sh flux` (or `instantid`, `z-image`, etc.) |
| Direct Modal CLI | `modal deploy apps/modal/apps/flux/app.py` |

**Canonical script**: `apps/modal/deploy.sh` — loops over `apps/modal/apps/*/app.py`.

### 2.2 Duplicate / Legacy Scripts

| File | Purpose | Status |
|------|---------|--------|
| `apps/modal/deploy.sh` | Deploy all/single **split** apps | ✅ Use this |
| `apps/modal/scripts/deploy.sh` | Deploys root `app.py` (single `ryla-comfyui`) | ⚠️ Legacy; only if you need the monolithic app |

Root `app.py` is still the old single-app entry; production uses split apps.

### 2.3 CI/CD

- **`.github/workflows/deploy-modal.yml`**: **Outdated**  
  - Deploys `comfyui_danrisi.py` and `comfyui_z_image_turbo.py`, which **no longer exist**.  
  - Does not deploy current split apps (`apps/modal/apps/*/app.py`).  
- **Recommendation**: Update workflow to run `./deploy.sh` (or equivalent) from `apps/modal`, or remove if deployment is manual.

---

## 3. Testing Scripts

| Script | What it does | URL / Target | Status |
|--------|------------------|--------------|--------|
| `scripts/test-all-endpoints.py` | POSTs to all endpoints | `BASE_URL = ryla--ryla-comfyui-comfyui-fastapi-app.modal.run` | ❌ **Wrong** — single app; should use split-app URLs |
| `scripts/test-all-endpoints-comprehensive.py` | Full generation tests, chained | Uses `APPS` dict with split-app base URLs | ✅ Correct |
| `scripts/test-split-apps.py` | Split-app tests | Builds URL from app name | ✅ Correct |
| `scripts/test-sdxl-endpoints.py` | SDXL/InstantID only | `ryla-instantid-comfyui-fastapi-app.modal.run` | ✅ Correct |
| `scripts/test-endpoints.sh` / `.extended.sh` / `.generate.sh` | Shell curl tests | Need to be checked for base URL | ⚠️ Verify |

**Fix**: In `test-all-endpoints.py`, replace single `BASE_URL` with the same split-app mapping used in `benchmark-endpoints.py` or `ENDPOINT-APP-MAPPING.md`.

---

## 4. Benchmarking

| Script | Purpose | URLs |
|--------|---------|------|
| `scripts/benchmark-endpoints.py` | Cold/warm timing, markdown/JSON report | Uses `SPLIT_APPS` dict (split-app URLs) ✅ |

- Writes to `apps/modal/docs/status/BENCHMARK-RESULTS.md` and `.json`.  
- Supports `--quick`, `--fast`, `--generate` / `--generate-video`.  
- Aligned with current split-app layout.

---

## 5. API & Backend Usage

| Component | How it resolves Modal URLs | Status |
|-----------|----------------------------|--------|
| `libs/business/src/services/modal-client.ts` | `ENDPOINT_APP_MAP` + workspace → per-endpoint URL | ✅ Split-app aware |
| `libs/business/src/services/modal-job-runner.ts` | Uses `ModalClient` (above) | ✅ |
| `apps/api` `ModalJobRunnerAdapter` | Sets `endpointUrl` from `MODAL_ENDPOINT_URL` or builds `https://${workspace}--ryla-comfyui-comfyui-fastapi-app.modal.run` | ⚠️ Fallback URL is **single app**; actual calls go through `ModalClient` which uses `ENDPOINT_APP_MAP`, so real traffic is correct. Health check uses flux app. Prefer configuring `MODAL_WORKSPACE` and letting client build URLs. |

**Config**: API uses `MODAL_ENDPOINT_URL` and/or `MODAL_WORKSPACE` (see `apps/api/src/config/configuration.ts`). Infisical template mentions `MODAL_EMAIL` under `/logins`; ensure `MODAL_WORKSPACE` (e.g. `ryla`) is set for API if using workspace-based URL construction.

---

## 6. Other Scripts in `apps/modal/scripts/`

| Script | Purpose |
|--------|---------|
| `check-deployment-status.sh` | Check deployment status |
| `monitor-deployments.sh` / `monitor-deployments-continuous.sh` | Monitor deployments |
| `setup.sh` | Environment/setup (may reference old paths) |
| `trigger-lora-training.py` | Trigger LoRA training |
| `download_z_image.py` / `upload_models.py` / `upload_z_image_models.py` | Model upload/download |

Worth a quick pass to ensure any base URLs or app names match the split-app mapping.

---

## 7. Python CLI Client

- **`apps/modal/ryla_client.py`**: Uses an endpoint→app map and builds `https://{workspace}--{app_name}-comfyui-fastapi-app.modal.run`.  
- Covers flux, instantid, wan2, seedvr2, z-image, etc.; fallback `ryla-comfyui` for unknown.  
- ✅ Aligned with split apps.

---

## 8. Unit / Integration Tests (apps/modal/tests/)

| Test file | URL used | Status |
|-----------|----------|--------|
| `test_seedvr2.py` | `ryla--ryla-comfyui-comfyui-fastapi-app.modal.run/seedvr2` | ❌ Single app |
| `test_performance.py` | `ryla--ryla-comfyui-comfyui-fastapi-app.modal.run` | ❌ Single app |
| `test_flux_dev_success_rate.py` | `ryla--ryla-comfyui-comfyui-fastapi-app.modal.run/flux-dev` | ❌ Single app |
| `test_instantid_consistency.py` | `ryla--ryla-comfyui-comfyui-fastapi-app.modal.run/flux-instantid` | ❌ Single app (and endpoint removed) |

**Recommendation**: Point these at the correct split-app base URLs (e.g. `ryla-seedvr2`, `ryla-flux`, `ryla-instantid`) or a shared helper from `ENDPOINT-APP-MAPPING.md`.

---

## 9. Documentation Consistency

- **`apps/modal/README.md`**: Says `modal deploy apps/modal/app.py` — legacy. Should at least mention split apps and `./deploy.sh`.
- **`docs/ops/deployment/modal/README.md`**: Mentions both `modal deploy apps/modal/app.py` and workflow deploy; should recommend `./deploy.sh` and split apps as primary.
- **Cursor skills** (e.g. `modal-ai-endpoints`, `mcp-modal`): Reference `modal deploy apps/modal/app.py`; should be updated to split-app deploy.
- **`apps/modal/apps/README.md`**: Correctly describes split apps and `./deploy.sh` ✅.

---

## 10. Single Source of Truth for Endpoints

- **Endpoint list and mapping**: `apps/modal/ENDPOINT-APP-MAPPING.md` (and code in `ENDPOINT_APP_MAP` / `SPLIT_APPS` where needed).  
- **API request/response details**: `apps/modal/docs/ENDPOINTS-REFERENCE.md`.  
- **Gaps**: Test and benchmark scripts each define their own URL map. Consider a small shared module (e.g. `apps/modal/shared/endpoints.py` or a JSON) that both Python scripts and docs can use so new endpoints are added in one place.

---

## 11. Summary: What’s in Good Shape

- **Split apps**: 7 apps, 21 endpoints, clearly listed in `ENDPOINT-APP-MAPPING.md`.  
- **Deploy**: `apps/modal/deploy.sh` is the right entrypoint for production.  
- **Benchmark**: `benchmark-endpoints.py` uses split-app URLs and writes to docs.  
- **API**: `ModalClient` + `ENDPOINT_APP_MAP` use split-app URLs; only adapter fallback is legacy.  
- **CLI**: `ryla_client.py` uses an endpoint→app map and is split-app aware.  
- **Comprehensive test**: `test-all-endpoints-comprehensive.py` uses split-app `APPS` (missing only `qwen-edit` in the dict).

---

## 12. Recommended Fixes (Priority)

1. **CI**: Update `.github/workflows/deploy-modal.yml` to deploy split apps (e.g. `./deploy.sh` from `apps/modal`) or document that Modal deploy is manual and remove/repurpose the workflow.  
2. **Test script**: In `test-all-endpoints.py`, replace single `BASE_URL` with per-endpoint or per-app URLs (reuse mapping from `ENDPOINT-APP-MAPPING` or `benchmark-endpoints.py`).  
3. **Unit/integration tests**: Update `test_seedvr2.py`, `test_performance.py`, `test_flux_dev_success_rate.py`, `test_instantid_consistency.py` to use split-app base URLs (and correct endpoint names).  
4. **Docs**: In `apps/modal/README.md` and `docs/ops/deployment/modal/README.md`, state that production deploy is `./deploy.sh` (split apps) and keep root `app.py` as optional/legacy.  
5. **Comprehensive test**: Add `qwen-edit` to the `APPS` dict in `test-all-endpoints-comprehensive.py` if you want that app covered.  
6. **Optional**: Introduce a single shared endpoint list (e.g. Python + JSON) and use it from scripts and docs to avoid drift.

---

## 13. Quick Reference

| Need to… | Use |
|----------|-----|
| Deploy all Modal apps | `cd apps/modal && ./deploy.sh` |
| Deploy one app | `cd apps/modal && ./deploy.sh <app-name>` |
| List endpoints & apps | `apps/modal/ENDPOINT-APP-MAPPING.md` |
| Test from CLI | `python apps/modal/ryla_client.py <workflow> …` |
| Run full endpoint tests | `python apps/modal/scripts/test-all-endpoints-comprehensive.py` |
| Benchmark endpoints | `python apps/modal/scripts/benchmark-endpoints.py` (optionally with `--quick` / `--fast`) |
| API env vars | `MODAL_WORKSPACE` (e.g. `ryla`); optionally `MODAL_ENDPOINT_URL` for legacy/health |

---

## 14. Modal timeouts and 408 handling

**Policy**: Per-endpoint timeout overrides so slow/cold-start endpoints get sufficient time; 408 (server/proxy timeout) is distinguished from client timeout.

### Client timeouts

| Location | Default | Override |
|----------|---------|----------|
| `libs/business/src/services/modal-client.ts` | 180000 ms (3 min) | `ENDPOINT_TIMEOUT_MS` map per endpoint |
| `apps/api/src/modules/playground/playground.service.ts` | 600000 ms (10 min) | Single default for all playground calls; client still applies per-endpoint overrides when calling Modal |
| `apps/api/src/modules/image/services/modal-job-runner.adapter.ts` | 180000 ms | Consider passing per-endpoint timeout when used by studio |

### Per-endpoint overrides (modal-client.ts)

| Endpoint group | Timeout | Reason |
|----------------|--------|--------|
| Z-Image (`/z-image-simple`, `/z-image-danrisi`, `/z-image-lora`) | 10 min | Cold start + diffusers pipeline load |
| Qwen (`/qwen-image-2512`, `/qwen-image-2512-fast`, `/qwen-image-2512-lora`) | 10 min | 50 steps or cold start; fast can 408 |
| SeedVR2, video-faceswap, Wan 2.6 variants | 10 min | Upscaling / video inference |
| Face consistency (`/sdxl-instantid`, `/flux-pulid`, `/flux-ipadapter-faceid`) | 7 min | Heavier face pipelines |
| Qwen Edit/Inpaint | 7 min | Edit/inpaint inference |
| All others | 3 min (default) | Flux, SDXL Turbo, etc. |

### 408 Request Timeout

- **Meaning**: Modal (or proxy in front) closed the request before the function finished (e.g. server-side `timeout` in the Modal app, or gateway limit).
- **Client timeout**: Request aborted by our code when `timeout` ms elapsed; error message indicates client timeout.
- **Handling**: `ModalClient` throws with a message that distinguishes "Modal 408 (server/proxy timeout)" from "client timeout". Optional: retry once on 408 for idempotent endpoints (not yet implemented).
- **If 408 persists**: Ensure Modal app `timeout` in `apps/modal/apps/*/app.py` is at least as high as the client timeout for that endpoint (e.g. 600s or 900s for Z-Image). Check Modal dashboard for proxy/gateway limits.

### Recommended Modal app `timeout` values

In each `@app.function(timeout=...)` in `apps/modal/apps/*/app.py`, set:

- **Z-Image, Qwen Image, SeedVR2, Wan 2.6, video-faceswap**: 600–900 s (10–15 min).
- **Face consistency, Qwen Edit**: 420–600 s (7–10 min).
- **Flux, SDXL Turbo**: 300 s (5 min) is usually enough.

Document actual values in each app’s `app.py` or in this audit; align with client `ENDPOINT_TIMEOUT_MS` so the server does not 408 before the client gives up.

---

## Repo structure (maintainability)

- **apps/modal/STRUCTURE.md** – Folder layout and where to add or change things.
- **apps/modal/scripts/README.md** – What each script does and which deploy to use.
- **apps/modal/tests/README.md** – Unit vs integration tests and shared `endpoint_urls.py`.
- **apps/modal/docs/README.md** – Doc index and role of `status/`.

Single source of truth for endpoint → app → URL: **apps/modal/ENDPOINT-APP-MAPPING.md**.

**Workflow alignment and quality** (see plan *RunComfy Workflows + Modal Endpoints*):

- **Modal ↔ RunComfy mapping**: [docs/research/infrastructure/MODAL-RUNCOMFY-WORKFLOW-MAPPING.md](../../research/infrastructure/MODAL-RUNCOMFY-WORKFLOW-MAPPING.md) — endpoint classification (reference_image / LoRA / supporting), T2I and face-consistency alignment notes.
- **Quality test results** (ref-image and LoRA endpoints): [docs/research/infrastructure/MODAL-ENDPOINT-QUALITY-TEST-RESULTS.md](../../research/infrastructure/MODAL-ENDPOINT-QUALITY-TEST-RESULTS.md). Optional automation: `apps/modal/scripts/quality-test-matrix.py`.

---

*Last updated: 2026-02-04*
