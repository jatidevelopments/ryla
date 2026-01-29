# Vast.ai ComfyUI Custom Workflows Guide

> **Date**: 2026-01-27  
> **Status**: Research Complete  
> **Purpose**: Practical guide for using Vast.ai serverless with ComfyUI custom workflows and nodes

---

## What Does "Vast.ai for Serverless ComfyUI" Mean?

**Vast.ai provides a pre-built serverless template** that allows you to:
1. **Deploy ComfyUI workflows** without managing infrastructure
2. **Send workflow JSON** via API endpoint (`/generate/sync`)
3. **Scale automatically** based on demand (serverless)
4. **Pay only for GPU time** used (scale-to-zero when idle)

**Key Difference from Modal/RunPod**:
- **Vast.ai**: Pre-built template (faster setup, less control)
- **Modal**: Code-driven (Infrastructure as Code, more control)
- **RunPod**: Docker-based (manual setup, most control)

---

## How Custom Workflows Work with Vast.ai

### 1. Pre-built ComfyUI Template

Vast.ai offers **multiple ComfyUI templates**:
- **ComfyUI** (base template)
- **ComfyUI Wan 2.2** (video generation)
- **ComfyUI ACE Step** (specialized variant)

**What's Included**:
- ComfyUI installed and configured
- `/generate/sync` endpoint ready to use
- S3 integration for inputs/outputs (optional)
- Environment variable configuration

### 2. Sending Custom Workflows

**API Endpoint**: `POST /generate/sync`

**Request Format** (from Vast.ai docs):
```json
{
  "workflow": {
    // Your ComfyUI workflow JSON
    "1": {
      "inputs": {
        "text": "a beautiful landscape",
        "clip": ["2", 0]
      },
      "class_type": "CLIPTextEncode",
      "_meta": {
        "title": "CLIP Text Encode (Prompt)"
      }
    },
    "2": {
      "inputs": {},
      "class_type": "CheckpointLoaderSimple",
      "_meta": {
        "title": "Load Checkpoint"
      }
    }
    // ... rest of workflow nodes
  },
  "output_format": "base64"  // or "url" for S3
}
```

**Response**:
```json
{
  "status": "success",
  "image": "base64_encoded_image_data",
  "metadata": {
    "generation_time": 5.2,
    "gpu_used": "RTX 4090"
  }
}
```

### 3. Custom Nodes Support

**The Critical Question**: Does Vast.ai's pre-built template support custom nodes?

**Answer**: ⚠️ **Unknown - Needs Testing**

**What We Know**:
- Vast.ai template is pre-built (not customizable like Modal)
- Template may include common custom nodes
- **PyWorker framework** allows building custom workers if template doesn't support your nodes

**For RYLA's Use Case** (res4lyf, controlaltai-nodes):
- ✅ **Option 1**: Test if template includes these nodes
- ✅ **Option 2**: Use PyWorker to build custom worker with required nodes
- ⚠️ **Option 3**: May need to use different workflow if nodes not supported

---

## PyWorker: Building Custom Workers

If the pre-built template doesn't support your custom nodes, Vast.ai provides **PyWorker framework** for building custom serverless workers.

### PyWorker Overview

**What is PyWorker?**
- Python web server framework for serverless compatibility
- Forwards API requests to your backend
- Monitors performance metrics
- Handles scaling and worker management

### Building Custom ComfyUI Worker

**Example Structure** (hypothetical, based on PyWorker docs):
```python
# custom_comfyui_worker.py
from pyworker import PyWorker
import subprocess
import json

class CustomComfyUIWorker(PyWorker):
    def setup(self):
        # Install ComfyUI
        subprocess.run(["git", "clone", "https://github.com/comfyanonymous/ComfyUI.git"])
        
        # Install custom nodes
        subprocess.run([
            "python", "ComfyUI/custom_nodes/ComfyUI-Manager/cm-cli.py",
            "install", "https://github.com/ClownsharkBatwing/RES4LYF"
        ])
        
        # Install other custom nodes
        subprocess.run([
            "python", "ComfyUI/custom_nodes/ComfyUI-Manager/cm-cli.py",
            "install", "controlaltai-nodes"
        ])
    
    def process_request(self, request):
        # Parse workflow JSON
        workflow = request.get("workflow")
        
        # Execute ComfyUI workflow
        result = self.run_comfyui(workflow)
        
        return {
            "status": "success",
            "image": result["image"],
            "metadata": result["metadata"]
        }
```

**Deployment**:
```bash
# Deploy custom worker
vastai deploy custom_comfyui_worker.py
```

**Trade-offs**:
- ✅ Full control over custom nodes
- ✅ Can install any ComfyUI custom nodes
- ⚠️ More setup effort (similar to Modal/RunPod)
- ⚠️ Loses "pre-built template" advantage

---

## Comparison: Vast.ai vs Current Setup

### Current RYLA Setup (Modal/RunPod)

**Workflow**:
1. Define ComfyUI image with custom nodes in code
2. Install custom nodes during image build:
   ```python
   # Modal example
   .run_commands([
       "cd /root/comfy/ComfyUI && python custom_nodes/ComfyUI-Manager/cm-cli.py install https://github.com/ClownsharkBatwing/RES4LYF",
       "cd /root/comfy/ComfyUI && python custom_nodes/ComfyUI-Manager/cm-cli.py install controlaltai-nodes"
   ])
   ```
3. Deploy via `modal deploy` or RunPod API
4. Send workflow JSON to endpoint

**Custom Nodes**: ✅ Full control (install any nodes)

### Vast.ai Pre-built Template

**Workflow**:
1. Deploy pre-built ComfyUI template (one command)
2. Send workflow JSON to `/generate/sync`
3. Template handles execution

**Custom Nodes**: ⚠️ Unknown (may be limited to template's included nodes)

### Vast.ai PyWorker (Custom)

**Workflow**:
1. Build custom PyWorker with ComfyUI + custom nodes
2. Deploy custom worker
3. Send workflow JSON to custom endpoint

**Custom Nodes**: ✅ Full control (similar to Modal/RunPod)

---

## Practical Examples

### Example 1: Simple Workflow (No Custom Nodes)

**Use Case**: Standard SDXL text-to-image

**Vast.ai Approach**:
```python
import requests

# Deploy template (one-time)
# vastai deploy comfyui-template

# Send workflow
response = requests.post(
    "https://your-endpoint.vast.ai/generate/sync",
    json={
        "workflow": {
            "1": {
                "inputs": {"text": "a beautiful landscape"},
                "class_type": "CLIPTextEncode"
            },
            # ... rest of workflow
        }
    }
)

image = response.json()["image"]
```

**Advantage**: ✅ Fastest setup (pre-built template)

### Example 2: Custom Nodes Workflow (Denrisi)

**Use Case**: Z-Image-Turbo with res4lyf nodes (ClownsharKSampler_Beta, Sigmas Rescale)

**Vast.ai Approach - Option 1 (Template)**:
```python
# Test if template supports res4lyf nodes
response = requests.post(
    "https://your-endpoint.vast.ai/generate/sync",
    json={
        "workflow": denrisi_workflow_json  # Includes res4lyf nodes
    }
)

if response.status_code == 400:
    # Template doesn't support custom nodes
    # Need to use PyWorker
    pass
```

**Vast.ai Approach - Option 2 (PyWorker)**:
```python
# Build custom worker with res4lyf nodes
# custom_worker.py
class DenrisiWorker(PyWorker):
    def setup(self):
        # Install ComfyUI
        install_comfyui()
        
        # Install custom nodes
        install_custom_node("https://github.com/ClownsharkBatwing/RES4LYF")
        install_custom_node("controlaltai-nodes")
    
    def process_request(self, request):
        return execute_comfyui_workflow(request["workflow"])

# Deploy
# vastai deploy custom_worker.py
```

**Trade-off**: ⚠️ More setup (similar to Modal), but still cheaper

---

## Testing Strategy for RYLA

### Phase 1: Test Pre-built Template

**Goal**: Verify if template supports RYLA's custom nodes

**Steps**:
1. Deploy Vast.ai ComfyUI template
2. Send simple workflow (SDXL) - verify basic functionality
3. Send Denrisi workflow with res4lyf nodes - test custom nodes
4. Check response:
   - ✅ **Success**: Template supports custom nodes → Use template
   - ❌ **400 Error**: Template doesn't support → Use PyWorker

**Expected Outcome**:
- If template works: ✅ Fastest path, cheapest cost
- If template fails: Need PyWorker (similar effort to Modal)

### Phase 2: Build PyWorker (If Needed)

**Goal**: Create custom worker with required nodes

**Steps**:
1. Create PyWorker script with ComfyUI setup
2. Install custom nodes (res4lyf, controlaltai-nodes)
3. Deploy custom worker
4. Test with Denrisi workflow

**Expected Outcome**:
- Similar setup effort to Modal
- But cheaper cost (~20% cheaper than RunPod)

### Phase 3: Cost & Reliability Testing

**Goal**: Compare with Modal/RunPod

**Metrics**:
- Cost per image (SDXL, Flux, Video)
- Worker reliability (crashes, spin-up failures)
- Cold start time
- API response time

---

## Key Questions Answered

### Q: Can I deploy custom workflows with custom nodes?

**A**: **Yes, but it depends**:
- ✅ **Pre-built template**: Fast setup, but custom nodes support unknown
- ✅ **PyWorker**: Full control, can install any custom nodes (similar to Modal)

### Q: How does it compare to Modal/RunPod?

**A**: 
- **Cost**: ✅ Cheaper (~20% cheaper than RunPod)
- **Setup**: ⚠️ Template = faster, PyWorker = similar to Modal
- **Custom Nodes**: ⚠️ Template = unknown, PyWorker = full control
- **Infrastructure as Code**: ❌ No (template-based or PyWorker)
- **GitHub Actions**: ⚠️ Unknown (needs testing)

### Q: Should RYLA use Vast.ai?

**A**: **Depends on testing**:
- ✅ **If template supports custom nodes**: Best option (fastest + cheapest)
- ⚠️ **If PyWorker needed**: Trade-off (cheaper but no Infrastructure as Code)
- ⚠️ **If reliability issues**: Stick with Modal

---

## Next Steps

1. **Test Vast.ai ComfyUI Template**:
   - Deploy template
   - Test with simple workflow (SDXL)
   - Test with Denrisi workflow (res4lyf nodes)

2. **If Template Fails**:
   - Build PyWorker with custom nodes
   - Test deployment and execution

3. **Compare with Modal**:
   - Cost comparison (per 1000 images)
   - Reliability testing (100+ generations)
   - Developer experience evaluation

4. **Decision**:
   - If template works → Use Vast.ai (fastest + cheapest)
   - If PyWorker needed → Evaluate vs Modal (cost vs Infrastructure as Code)
   - If reliability issues → Stick with Modal

---

## References

- [Vast.ai ComfyUI Template Docs](https://docs.vast.ai/serverless/comfy-ui)
- [Vast.ai PyWorker Overview](https://vast.ai/docs/pyworker/pyworker-introduction)
- [Vast.ai Serverless Getting Started](https://docs.vast.ai/serverless/getting-started-with-serverless)
- [Vast.ai vs Modal/RunPod Comparison](./VAST-AI-VS-MODAL-RUNPOD-COMPARISON.md)
- [RYLA Custom Nodes Fix (IN-028)](../../initiatives/IN-028-CUSTOM-NODES-FIX.md)

---

**Last Updated**: 2026-01-27  
**Status**: Research Complete - Ready for Testing
