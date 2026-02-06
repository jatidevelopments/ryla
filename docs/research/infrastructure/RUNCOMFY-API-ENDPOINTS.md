# RunComfy API Endpoints Reference (RYLA)

**Purpose**: Single reference for all deployed RunComfy API endpoints, API shape, authentication, request/response formats, and overrides. Use when wiring RunComfy into RYLA (e.g. RunComfy service or provider config).

**Related**: [RYLA-RUNCOMFY-ONLY-SHORTLIST.md](./RYLA-RUNCOMFY-ONLY-SHORTLIST.md) (use-case mapping), [RUNCOMFY-WORKFLOW-DISCOVERY.md](./RUNCOMFY-WORKFLOW-DISCOVERY.md) (catalog), [IN-038 RunComfy Integration](../../initiatives/IN-038-runcomfy-workflow-catalog-integration.md).

---

## 1. API overview

| Item               | Value                                                                                                                       |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------- |
| **Base URL**       | `https://api.runcomfy.net`                                                                                                  |
| **Auth**           | Bearer token. Header: `Authorization: Bearer <token>`. Get token from [RunComfy Profile](https://www.runcomfy.com/profile). |
| **Deployment API** | **v2**: create, get, list, update, delete deployments                                                                       |
| **Inference**      | **v1**: submit job, status, result, cancel                                                                                  |

Official docs: [RunComfy Serverless API](https://docs.runcomfy.com/serverless/quickstart), [Deployment Endpoints](https://docs.runcomfy.com/serverless/deployment-endpoints), [Async Queue Endpoints](https://docs.runcomfy.com/serverless/async-queue-endpoints).

---

## 2. Deployment API (v2)

All deployment operations use **v2** and the same base URL.

| Endpoint                               | Method   | Description                                                   |
| -------------------------------------- | -------- | ------------------------------------------------------------- |
| `/prod/v2/deployments`                 | `POST`   | Create a deployment                                           |
| `/prod/v2/deployments/{deployment_id}` | `GET`    | Get one deployment                                            |
| `/prod/v2/deployments/{deployment_id}` | `PATCH`  | Update deployment (name, hardware, scaling, is_enabled, etc.) |
| `/prod/v2/deployments`                 | `GET`    | List deployments                                              |
| `/prod/v2/deployments/{deployment_id}` | `DELETE` | Delete a deployment                                           |

**Path/query**

- `deployment_id`: UUID string.
- **List**: `?includes=payload` adds `payload` (workflow_api_json, overrides, object_info_url). `?includes=readme` adds readme. `?ids=<id1>&ids=<id2>` filters by IDs.

**Create body (POST)**  
Required: `name`, `workflow_id`, `workflow_version`, `hardware` (array with one SKU), `min_instances`, `max_instances`, `queue_size`, `keep_warm_duration_in_seconds`.  
Hardware SKUs (one of): `TURING_16`, `AMPERE_24`, `AMPERE_48`, `ADA_48_PLUS`, `AMPERE_80`, `ADA_80_PLUS`, `HOPPER_141`.

**Get/List response**  
Each deployment includes: `id`, `name`, `workflow_id`, `workflow_version`, `hardware`, `min_instances`, `max_instances`, `queue_size`, `keep_warm_duration_in_seconds`, `status`, `is_enabled`, `created_at`, `updated_at`. With `?includes=payload`: `payload.workflow_api_json`, `payload.overrides`, `payload.object_info_url`.

---

## 3. Inference (async queue, v1)

Inference uses **v1** paths under a specific deployment.

| Endpoint                                                            | Method | Description  |
| ------------------------------------------------------------------- | ------ | ------------ |
| `/prod/v1/deployments/{deployment_id}/inference`                    | `POST` | Submit a job |
| `/prod/v1/deployments/{deployment_id}/requests/{request_id}/status` | `GET`  | Poll status  |
| `/prod/v1/deployments/{deployment_id}/requests/{request_id}/result` | `GET`  | Get outputs  |
| `/prod/v1/deployments/{deployment_id}/requests/{request_id}/cancel` | `POST` | Cancel job   |

### 3.1 Submit (POST inference)

**URL**: `POST https://api.runcomfy.net/prod/v1/deployments/{deployment_id}/inference`  
**Headers**: `Content-Type: application/json`, `Authorization: Bearer <token>`  
**Body (typical)**:

```json
{
  "overrides": {
    "<node_id>": { "inputs": { "<input_key>": "<value>" } }
  }
}
```

- **overrides**: Keyed by **node ID** (string). Each value is `{ "inputs": { ... } }` merging into that node’s inputs in the deployment’s stored `workflow_api.json`. Node IDs and input keys must exist in the workflow; values should match schema (see `object_info`).
- **Image/Video**: For image/video inputs, value can be a public HTTPS URL or a Base64 data URI, e.g. `"image": "https://example.com/image.jpg"` or `"image": "data:image/jpeg;base64,..."`.
- **Optional**: `webhook`, `webhook_intermediate_status` for callbacks. For Core API nodes: `extra_data.api_key_comfy_org`.
- **Dynamic workflow**: To run a different graph without changing the deployment, send `workflow_api_json` (full workflow) in the body instead of (or in addition to) overrides.

**Response (200)**:

```json
{
  "request_id": "<request_id>",
  "status_url": "https://api.runcomfy.net/prod/v1/deployments/{deployment_id}/requests/{request_id}/status",
  "result_url": "https://api.runcomfy.net/prod/v1/deployments/{deployment_id}/requests/{request_id}/result",
  "cancel_url": "https://api.runcomfy.net/prod/v1/deployments/{deployment_id}/requests/{request_id}/cancel"
}
```

### 3.2 Status (GET)

**URL**: `GET {status_url}` (or same path with deployment_id and request_id).  
**Response**: `status` one of `in_queue`, `in_progress`, `completed`, `cancelled`; optional `queue_position`, `result_url`, `instance_id`.

### 3.3 Result (GET)

**URL**: `GET {result_url}`.  
**Response (succeeded)**:

```json
{
  "request_id": "<request_id>",
  "status": "succeeded",
  "outputs": {
    "<node_id>": {
      "images": [
        {
          "url": "https://...",
          "filename": "...",
          "subfolder": "",
          "type": "output"
        }
      ]
    }
  },
  "created_at": "...",
  "finished_at": "...",
  "instance_id": "..."
}
```

Output URLs are temporary (e.g. 7 days); persist by downloading or copying to R2/own storage.

### 3.4 Cancel (POST)

**URL**: `POST {cancel_url}`.  
**Response (202)**: e.g. `{ "request_id": "...", "status": "completed", "outcome": "cancelled" }`.

---

## 4. Overrides in detail

- **Source of truth**: The deployment’s stored **workflow_api.json** (node IDs, `class_type`, `inputs`). You only send **overrides** to change specific node inputs.
- **Format**: `overrides` is an object: keys = node IDs (strings), values = `{ "inputs": { "key": "value", ... } }`. Only listed inputs are merged; the rest stay from the stored workflow.
- **Discovery**:
  - **workflow_api.json**: From RunComfy (e.g. Export API in ComfyUI after loading the workflow), or from `GET /prod/v2/deployments/{deployment_id}?includes=payload` → `payload.workflow_api_json`.
  - **object_info**: Schema for node types (input names, types). From `payload.object_info_url` (if set) or from a running ComfyUI instance’s `/object_info` (see [RUNCOMFY-WORKFLOW-DISCOVERY.md](./RUNCOMFY-WORKFLOW-DISCOVERY.md)).
- **Example (prompt + seed)**:  
  If node `"6"` is CLIPTextEncode with `text`, and node `"31"` is KSampler with `seed`:  
  `{ "overrides": { "6": { "inputs": { "text": "futuristic cityscape" } }, "31": { "inputs": { "seed": 987654321 } } } }`

---

## 5. RYLA-relevant deployments

### 5.1 Already deployed (RunComfy dashboard)

Full deployment IDs are in the RunComfy dashboard: [Deployments](https://runcomfy.com/comfyui-api/deployments). You can also list them via `GET https://api.runcomfy.net/prod/v2/deployments` with your Bearer token.

| Name                                       | Deployment ID (prefix) | GPU         | RYLA use case                           |
| ------------------------------------------ | ---------------------- | ----------- | --------------------------------------- |
| RunComfy/Z-Image                           | 8486...6273            | 48G (A6000) | T2I (fast)                              |
| RunComfy/UltraRealisticV2                  | 5208...af12            | 48G (A6000) | T2I (quality)                           |
| RunComfy/PuLID-Flux-II                     | cc27...6e8b            | 48G (A6000) | Face / character consistency            |
| RunComfy/Z-Image-ControlNet                | 1f47...1129            | 48G (A6000) | T2I with control                        |
| RunComfy/Image-Bypass                      | da83...18fb            | 48G (A6000) | T2I (detection-bypass)                  |
| RunComfy/SCAIL                             | 63c3...2860            | 48G (A6000) | Pose-based character animation (video)  |
| RunComfy/Z-Image-Finetuned-Models          | 2c28...16a3            | 48G (A6000) | T2I (finetuned)                         |
| RunComfy/Fantasy-Portrait                  | 31f2...ff41            | 48G (A6000) | T2I (fantasy/portrait)                  |
| RunComfy/FLUX-Klein-Editing                | 7d77...f5ba            | 48G (A6000) | Image editing (inpaint/outpaint/remove) |
| RunComfy/Flux-Klein-Face-Swap              | 78aa...af0d            | 48G (A6000) | Face swap                               |
| RunComfy/Z-Image-I2I-Ultimate-Photorealism | 0d6d...8e26            | 48G (A6000) | I2I (photorealism)                      |

**To get full IDs and payload (workflow_api_json, object_info_url)**:

```bash
curl -s -H "Authorization: Bearer <RUNCOMFY_API_TOKEN>" \
  "https://api.runcomfy.net/prod/v2/deployments?includes=payload" | jq .
```

Use each deployment’s `id` for inference and `payload.workflow_api_json` / `payload.object_info_url` to derive override parameters.

### 5.2 Minimal RunComfy-only set (9 workflows, deploy via UI or script)

These are the **minimal set** of workflows to deploy if RYLA uses only RunComfy (see [RYLA-RUNCOMFY-ONLY-SHORTLIST.md](./RYLA-RUNCOMFY-ONLY-SHORTLIST.md)). After deploying each via “Deploy as API” → “Instant Deploy”, record the returned `deployment_id` and add it to this table (or to a config/registry).

| #   | Use case         | Workflow                        | Slug                                                                                             | Deployment ID (after deploy) |
| --- | ---------------- | ------------------------------- | ------------------------------------------------------------------------------------------------ | ---------------------------- |
| 1   | T2I              | FLUX Art Image Generation       | `comfyui-flux-a-new-art-image-generation`                                                        | _TBD_                        |
| 2   | T2I fast         | SDXL Turbo                      | `text-to-image-with-sdxl-turbo`                                                                  | _TBD_                        |
| 3   | Face consistency | IPAdapter FaceID Plus           | `create-consistent-characters-in-comfyui-with-ipadapter-faceid-plus`                             | _TBD_                        |
| 4   | Image editing    | Flux Klein Inpaint/Outpaint     | `flux-klein-unified-image-editing-inpaint-remove-outpaint-in-comfyui-advanced-image-restoration` | _TBD_                        |
| 5   | Video T2V        | Hunyuan Video 1.5               | `hunyuan-video-1-5-in-comfyui-efficient-text-to-video-workflow`                                  | _TBD_                        |
| 6   | Video I2V        | SVD + FreeU                     | `comfyui-stable-video-diffusion-svd-and-freeu-workflow-image2video`                              | _TBD_                        |
| 7   | Upscaling        | ControlNet Tile + 4x UltraSharp | `comfyui-hi-res-fix-upscaling-workflow-controlnet-tile-4x-ultrasharp`                            | _TBD_                        |
| 8   | LoRA             | FLUX LoRA Training              | `comfyui-flux-lora-training-detailed-guides`                                                     | _TBD_                        |
| 9   | Face swap        | ReActor Fast Face Swap          | `comfyui-reactor-workflow-fast-face-swap`                                                        | _TBD_                        |

Deploy script (Playwright): `npx tsx scripts/runcomfy-deploy-as-api.ts --all-minimal` (requires `RUNCOMFY_COOKIE` if logged-in session needed). Workflow pages: `https://www.runcomfy.com/comfyui-workflows/{slug}`.

---

## 6. Discovering per-workflow parameters (overrides)

1. **From deployment payload** (after deploy):  
   `GET /prod/v2/deployments?includes=payload` (or per-ID). Use `payload.workflow_api_json` for node IDs and default `inputs`; use `payload.object_info_url` to resolve node types and allowed input keys/types.
2. **From RunComfy docs**: Example workflow_api for FLUX: [flux_workflow_api.json](https://docs.runcomfy.com/static/flux_workflow_api.json). Other workflows may have similar static URLs or must be exported from ComfyUI (Workflow → Export (API)).
3. **From downloaded workflows**: Local copies under `docs/research/infrastructure/runcomfy-workflows/<slug>/workflow.json` are UI format; for API format either export `workflow_api.json` from ComfyUI after loading that workflow on RunComfy, or convert (see [Workflow Files](https://docs.runcomfy.com/serverless/workflow-files)).

Once you have `workflow_api_json`, identify the node IDs for prompt (e.g. CLIPTextEncode), sampler (e.g. KSampler: seed, steps, cfg), and any image/video inputs; then build `overrides` accordingly.

---

## 7. Quick reference: inference flow

```text
1. POST /prod/v1/deployments/{deployment_id}/inference
   Body: { "overrides": { "6": { "inputs": { "text": "..." } }, "31": { "inputs": { "seed": 12345 } } } }
   → request_id, status_url, result_url, cancel_url

2. GET status_url  (poll until status === "completed")

3. GET result_url  → outputs (e.g. images[].url); persist within 7 days if needed
```

---

## 8. Links

- [RunComfy Quickstart](https://docs.runcomfy.com/serverless/quickstart)
- [Deployment Endpoints](https://docs.runcomfy.com/serverless/deployment-endpoints)
- [Async Queue Endpoints](https://docs.runcomfy.com/serverless/async-queue-endpoints)
- [Workflow Files (workflow_api.json, object_info)](https://docs.runcomfy.com/serverless/workflow-files)
- [RYLA shortlist & use-case mapping](./RYLA-RUNCOMFY-ONLY-SHORTLIST.md)
- [RunComfy workflow discovery](./RUNCOMFY-WORKFLOW-DISCOVERY.md)
