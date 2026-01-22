# EP-058: Modal.com MVP Model Implementation - Architecture

**Initiative**: [IN-020](../../initiatives/IN-020-modal-mvp-models.md)  
**Epic**: [EP-058](../../requirements/epics/mvp/EP-058-modal-mvp-models-requirements.md)  
**Status**: P3 - Architecture  
**Created**: 2025-01-21

---

## Functional Architecture

### Backend-Only Architecture

This epic is **backend-only** (no frontend components). The architecture consists of:

1. **Modal.com Serverless Platform** - Hosts ComfyUI and models
2. **Unified Modal App** (`comfyui_ryla.py`) - Single app with multiple endpoints
3. **Model Storage** - Modal volumes for persistent model storage
4. **API Endpoints** - FastAPI endpoints for each workflow type
5. **Client Scripts** - Python scripts to interact with APIs

### Component Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Modal.com Platform                       │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         Unified Modal App (comfyui_ryla.py)         │  │
│  │                                                      │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │  ComfyUI Server (Background Process)         │  │  │
│  │  │  - Launches on container start                │  │  │
│  │  │  - Handles workflow execution                 │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  │                                                      │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │  FastAPI Endpoints                            │  │  │
│  │  │  - /flux-dev      (Flux Dev text-to-image)    │  │  │
│  │  │  - /flux-instantid (Flux Dev + InstantID)     │  │  │
│  │  │  - /flux-lora     (Flux Dev + LoRA)           │  │  │
│  │  │  - /workflow      (Custom workflow JSON)       │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  │                                                      │  │
│  │  ┌──────────────────────────────────────────────┐  │  │
│  │  │  Model Loaders                                 │  │  │
│  │  │  - Flux Dev models                            │  │  │
│  │  │  - InstantID models                           │  │  │
│  │  │  - LoRA models (from volume)                  │  │  │
│  │  └──────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Modal Volumes (Persistent Storage)                  │  │
│  │  - ryla-models/    (Flux Dev, InstantID, LoRAs)     │  │
│  │  - hf-hub-cache/   (HuggingFace cache)               │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP API Calls
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Client Scripts                            │
│  - ryla_client.py (unified client)                          │
│  - Individual test scripts                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Model

### Model Storage Structure

Models are stored on Modal volumes with the following structure:

```
ryla-models/ (Modal Volume)
├── checkpoints/
│   ├── flux1-dev-fp8.safetensors (or FP16)  # Flux Dev diffusion model
│   └── [user LoRAs]/
│       └── character-{id}.safetensors       # User-trained LoRAs
├── clip/
│   └── clip_l.safetensors                    # Flux Dev CLIP encoder
├── text_encoders/
│   └── t5xxl_fp16.safetensors                # Flux Dev T5 encoder
├── vae/
│   └── ae.safetensors                        # Flux Dev VAE
├── instantid/
│   └── ip-adapter.bin                        # InstantID IP-Adapter (~1.69GB)
├── controlnet/
│   └── diffusion_pytorch_model.safetensors   # InstantID ControlNet (~2.50GB)
└── insightface/
    └── models/
        └── [antelopev2 models]              # InsightFace models

hf-hub-cache/ (Modal Volume)
└── [HuggingFace cache]                       # Cached model downloads
```

### Model Metadata

**Flux Dev Models**:
- `flux1-dev-fp8.safetensors` - Diffusion model (~12 GB)
- `clip_l.safetensors` - CLIP text encoder (~2 GB)
- `t5xxl_fp16.safetensors` - T5 text encoder (~5 GB)
- `ae.safetensors` - VAE (~1 GB)
- **Total**: ~20 GB

**InstantID Models**:
- `ip-adapter.bin` - IP-Adapter model (~1.69 GB)
- `diffusion_pytorch_model.safetensors` - ControlNet (~2.50 GB)
- InsightFace antelopev2 models (~500 MB)
- **Total**: ~4.7 GB

**LoRA Models**:
- User-trained LoRAs stored per character
- Format: `character-{id}.safetensors`
- Size: ~50-200 MB per LoRA

### Volume Mount Points

- `/root/models` - Main model storage (ryla-models volume)
- `/cache` - HuggingFace cache (hf-hub-cache volume)
- `/root/comfy/ComfyUI/models/` - ComfyUI model directories (symlinked from volumes)

---

## API Contract List

### Base URL

```
https://{workspace}--ryla-comfyui-comfyui-{endpoint}.modal.run
```

Where `{workspace}` is the Modal workspace name and `{endpoint}` is the specific endpoint name.

### Endpoint 1: `/flux-dev`

**Purpose**: Flux Dev text-to-image generation

**Method**: `POST`

**Request Body**:
```json
{
  "prompt": "string (required)",
  "negative_prompt": "string (optional, default: '')",
  "width": "integer (optional, default: 1024)",
  "height": "integer (optional, default: 1024)",
  "steps": "integer (optional, default: 20)",
  "cfg": "float (optional, default: 1.0)",
  "seed": "integer (optional, random if not provided)"
}
```

**Response**:
- **Content-Type**: `image/jpeg`
- **Body**: JPEG image bytes
- **Status Codes**:
  - `200 OK` - Image generated successfully
  - `400 Bad Request` - Invalid request parameters
  - `500 Internal Server Error` - Generation failed

**Example**:
```bash
curl -X POST \
  "https://workspace--ryla-comfyui-comfyui-flux-dev.modal.run" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A beautiful landscape",
    "width": 1024,
    "height": 1024,
    "steps": 20,
    "cfg": 1.0
  }' \
  --output output.jpg
```

---

### Endpoint 2: `/flux-instantid`

**Purpose**: Flux Dev + InstantID face consistency generation

**Method**: `POST`

**Request Body**:
```json
{
  "prompt": "string (required)",
  "reference_image": "string (required, base64 data URL or file path)",
  "negative_prompt": "string (optional, default: '')",
  "width": "integer (optional, default: 1024)",
  "height": "integer (optional, default: 1024)",
  "steps": "integer (optional, default: 20)",
  "cfg": "float (optional, default: 1.0)",
  "seed": "integer (optional, random if not provided)",
  "instantid_strength": "float (optional, default: 0.8, range: 0.0-1.0)",
  "controlnet_strength": "float (optional, default: 0.8, range: 0.0-1.0)",
  "face_provider": "string (optional, default: 'CPU', options: 'CPU'|'GPU')"
}
```

**Response**:
- **Content-Type**: `image/jpeg`
- **Body**: JPEG image bytes
- **Status Codes**:
  - `200 OK` - Image generated successfully
  - `400 Bad Request` - Invalid request parameters or missing reference_image
  - `500 Internal Server Error` - Generation failed

**Example**:
```bash
curl -X POST \
  "https://workspace--ryla-comfyui-comfyui-flux-instantid.modal.run" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A portrait in a studio setting",
    "reference_image": "data:image/jpeg;base64,/9j/4AAQ...",
    "instantid_strength": 0.8,
    "controlnet_strength": 0.8
  }' \
  --output output.jpg
```

---

### Endpoint 3: `/flux-lora`

**Purpose**: Flux Dev + LoRA character-specific generation

**Method**: `POST`

**Request Body**:
```json
{
  "prompt": "string (required)",
  "lora_id": "string (required, e.g., 'character-123')",
  "negative_prompt": "string (optional, default: '')",
  "width": "integer (optional, default: 1024)",
  "height": "integer (optional, default: 1024)",
  "steps": "integer (optional, default: 20)",
  "cfg": "float (optional, default: 1.0)",
  "seed": "integer (optional, random if not provided)",
  "lora_strength": "float (optional, default: 1.0, range: 0.0-1.0)",
  "trigger_word": "string (optional, LoRA trigger word)"
}
```

**Response**:
- **Content-Type**: `image/jpeg`
- **Body**: JPEG image bytes
- **Status Codes**:
  - `200 OK` - Image generated successfully
  - `400 Bad Request` - Invalid request parameters or LoRA not found
  - `500 Internal Server Error` - Generation failed

**Example**:
```bash
curl -X POST \
  "https://workspace--ryla-comfyui-comfyui-flux-lora.modal.run" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "A character in a fantasy setting",
    "lora_id": "character-123",
    "lora_strength": 1.0,
    "trigger_word": "ryla_character"
  }' \
  --output output.jpg
```

---

### Endpoint 4: `/workflow`

**Purpose**: Custom ComfyUI workflow execution (supports any workflow type)

**Method**: `POST`

**Request Body**:
```json
{
  "workflow": {
    "node_id": {
      "class_type": "NodeType",
      "inputs": {...}
    }
  },
  "prompt": "string (optional, injected into CLIPTextEncode nodes)"
}
```

**Response**:
- **Content-Type**: `image/jpeg` or `image/webp` (based on workflow)
- **Body**: Image/video bytes
- **Status Codes**:
  - `200 OK` - Workflow executed successfully
  - `400 Bad Request` - Invalid workflow JSON
  - `500 Internal Server Error` - Workflow execution failed

**Example**:
```bash
curl -X POST \
  "https://workspace--ryla-comfyui-comfyui-workflow.modal.run" \
  -H "Content-Type: application/json" \
  -d '{
    "workflow": {...},
    "prompt": "Optional prompt to inject"
  }' \
  --output output.jpg
```

---

## Component Architecture

### Modal App Structure

```python
# apps/modal/comfyui_ryla.py

app = modal.App(name="ryla-comfyui", image=image)

@app.cls(
    scaledown_window=300,  # 5 minute container keep alive
    gpu="L40S",
    volumes={"/cache": hf_cache_vol, "/root/models": volume},
)
@modal.concurrent(max_inputs=5)
class ComfyUI:
    port: int = 8000

    @modal.enter()
    def launch_comfy_background(self):
        """Launch ComfyUI server in background on container start"""
        # Launch comfy server
        # Poll for health
        # Ready for requests

    @modal.method()
    def infer(self, workflow_path: str):
        """Execute ComfyUI workflow and return output"""
        # Poll server health
        # Run workflow via comfy-cli
        # Read output image
        # Return bytes

    @modal.fastapi_endpoint(method="POST")
    def flux_dev(self, item: Dict):
        """Flux Dev text-to-image endpoint"""
        # Build workflow JSON
        # Call infer()
        # Return image bytes

    @modal.fastapi_endpoint(method="POST")
    def flux_instantid(self, item: Dict):
        """Flux Dev + InstantID face consistency endpoint"""
        # Build InstantID workflow JSON
        # Call infer()
        # Return image bytes

    @modal.fastapi_endpoint(method="POST")
    def flux_lora(self, item: Dict):
        """Flux Dev + LoRA endpoint"""
        # Build LoRA workflow JSON
        # Load LoRA from volume
        # Call infer()
        # Return image bytes

    @modal.fastapi_endpoint(method="POST")
    def workflow(self, item: Dict):
        """Custom workflow endpoint"""
        # Use provided workflow JSON
        # Call infer()
        # Return output bytes

    def poll_server_health(self) -> Dict:
        """Check ComfyUI server health"""
        # Check /system_stats endpoint
        # Raise if unhealthy
```

### Model Download Functions

```python
def hf_download_flux_dev():
    """Download Flux Dev models to volume"""
    # Download flux1-dev-fp8.safetensors
    # Download clip_l.safetensors
    # Download t5xxl_fp16.safetensors
    # Download ae.safetensors
    # Symlink to ComfyUI directories

def hf_download_instantid():
    """Download InstantID models to volume"""
    # Download ip-adapter.bin
    # Download diffusion_pytorch_model.safetensors (ControlNet)
    # Download InsightFace models
    # Symlink to ComfyUI directories
```

### Custom Node Installation

```python
# In image build
image = (
    image.run_commands(
        "comfy node install ComfyUI_InstantID"
    )
)
```

---

## Event Schema (PostHog)

### Event: `modal_flux_dev_generation_requested`

**Trigger**: When `/flux-dev` endpoint is called

**Properties**:
```json
{
  "workflow_type": "flux_dev",
  "prompt_length": 123,
  "width": 1024,
  "height": 1024,
  "steps": 20,
  "cfg": 1.0,
  "has_seed": true
}
```

---

### Event: `modal_flux_dev_generation_completed`

**Trigger**: When `/flux-dev` generation succeeds

**Properties**:
```json
{
  "workflow_type": "flux_dev",
  "generation_time_ms": 25000,
  "success": true
}
```

---

### Event: `modal_flux_dev_generation_failed`

**Trigger**: When `/flux-dev` generation fails

**Properties**:
```json
{
  "workflow_type": "flux_dev",
  "error_type": "timeout|model_error|workflow_error",
  "error_message": "string"
}
```

---

### Event: `modal_instantid_generation_requested`

**Trigger**: When `/flux-instantid` endpoint is called

**Properties**:
```json
{
  "workflow_type": "flux_instantid",
  "prompt_length": 123,
  "instantid_strength": 0.8,
  "controlnet_strength": 0.8,
  "face_provider": "CPU"
}
```

---

### Event: `modal_instantid_face_consistency_measured`

**Trigger**: When InstantID generation completes (optional, if consistency measurement implemented)

**Properties**:
```json
{
  "workflow_type": "flux_instantid",
  "consistency_score": 0.87,
  "generation_time_ms": 28000
}
```

---

### Event: `modal_lora_loaded`

**Trigger**: When LoRA model is successfully loaded

**Properties**:
```json
{
  "lora_id": "character-123",
  "lora_size_mb": 150,
  "load_time_ms": 500
}
```

---

### Event: `modal_lora_generation_completed`

**Trigger**: When `/flux-lora` generation succeeds

**Properties**:
```json
{
  "workflow_type": "flux_lora",
  "lora_id": "character-123",
  "lora_strength": 1.0,
  "generation_time_ms": 30000,
  "success": true
}
```

---

### Event: `modal_app_deployed`

**Trigger**: When Modal app is deployed

**Properties**:
```json
{
  "app_name": "ryla-comfyui",
  "models_installed": ["flux_dev", "instantid"],
  "deployment_time": "2025-01-21T10:00:00Z"
}
```

---

## Funnel Definitions

### Generation Success Funnel

**Purpose**: Track generation success rate across all workflows

**Steps**:
1. `modal_{workflow}_generation_requested` - Request received
2. `modal_{workflow}_generation_completed` - Generation succeeded
3. `modal_{workflow}_generation_failed` - Generation failed (alternative to step 2)

**Metrics**:
- Success rate = completed / (completed + failed)
- Average generation time
- Error rate by error type

---

## Model Loading Strategy

### Cold Start Optimization

1. **Model Persistence**: All models stored on Modal volumes (no re-downloads)
2. **Lazy Loading**: Models loaded on first use, cached in memory
3. **Volume Mounting**: Volumes mounted at container start for fast access
4. **Symlink Strategy**: Models symlinked from volumes to ComfyUI directories

### Volume Management

- **ryla-models**: Main model storage (~42 GB for P0 models)
- **hf-hub-cache**: HuggingFace cache (speeds up downloads)
- **Volume Lifecycle**: Volumes persist across container restarts
- **Model Updates**: Manual volume updates when models change

---

## Error Handling

### Error Types

1. **Model Not Found**: LoRA or base model missing from volume
2. **Workflow Error**: Invalid workflow JSON or node missing
3. **Generation Timeout**: Workflow takes too long (>120s)
4. **Server Unhealthy**: ComfyUI server not responding

### Error Responses

All endpoints return appropriate HTTP status codes:
- `400 Bad Request` - Invalid parameters
- `404 Not Found` - Model or resource not found
- `500 Internal Server Error` - Generation failed
- `503 Service Unavailable` - Server unhealthy

---

## Security Considerations

1. **API Authentication**: None for MVP (add in future if needed)
2. **Rate Limiting**: Modal handles auto-scaling
3. **Input Validation**: Validate all request parameters
4. **NSFW Support**: Flux Dev uncensored checkpoint (no filtering)

---

## Performance Targets

- **Cold Start**: <60s (first request after container start)
- **Generation Time**: <30s per image (average)
- **API Response Time**: <35s (including generation)
- **Success Rate**: >95% (10+ test samples)
- **Concurrent Requests**: 5 per container (configurable)

---

## Next Steps

1. ✅ **P3: Architecture** - Complete
2. **P4: UI Skeleton** - Document API contracts (backend-only, minimal UI)
3. **P5: Technical Spec** - Detailed implementation plan
4. **P6: Implementation** - Build Modal app with all models

---

## References

- Epic Requirements: `docs/requirements/epics/mvp/EP-058-modal-mvp-models-requirements.md`
- Initiative: `docs/initiatives/IN-020-modal-mvp-models.md`
- Existing Modal App: `apps/modal/comfyui_ryla.py`
- InstantID Workflow: `libs/business/src/workflows/z-image-instantid.ts`
