# ComfyUI/Workflow Infrastructure - Improvement Proposals

> Deep analysis and actionable proposals to improve RYLA's AI generation capabilities.

**Date**: January 2026  
**Status**: Proposal  
**Related Initiatives**: IN-015, IN-019, IN-028, IN-031

---

## Executive Summary

RYLA has a **solid foundation** for ComfyUI workflows with 8 deployed Modal apps covering major use cases. However, there are significant opportunities to improve reliability, developer experience, and feature completeness.

### Quick Assessment

| Area | Current State | Target State | Priority |
|---|---|---|---|
| **Handler Consistency** | Each handler is different | Unified handler pattern | High |
| **Face Consistency** | Works on Flux/SDXL only | Works on all models | High |
| **Error Handling** | Basic, inconsistent | Centralized, actionable | High |
| **Workflow Catalog** | Scattered, undocumented | Central catalog with metadata | Medium |
| **Testing** | Some tests exist | Automated regression suite | Medium |
| **Deployment Speed** | Hours per workflow | Minutes (automated) | Medium |
| **Model Coverage** | Good (Qwen, Flux, Wan) | Complete (add newer models) | Low |

---

## Current Gaps Analysis

### 1. Handler Pattern Inconsistency

**Problem**: Each handler (z_image, instantid, qwen, etc.) implements patterns differently.

**Evidence**:
- `z_image.py`: Uses diffusers pipeline directly, has `ZImageHandler` class
- `instantid.py`: Uses ComfyUI workflow JSON, has `InstantIDHandler` class
- `workflow.py`: Generic handler, simpler pattern
- `qwen_image.py`: Different structure again

**Impact**:
- Hard to maintain - each handler is a snowflake
- Hard to add new features across all handlers
- Inconsistent error handling
- No shared utilities

**Proposal**: Create a **unified handler base class** with standardized patterns.

```python
class BaseWorkflowHandler:
    """Standard handler pattern for all workflows."""
    
    def __init__(self, comfyui):
        self.comfyui = comfyui
        self.cost_tracker = CostTracker(gpu_type=self.GPU_TYPE)
    
    GPU_TYPE = "L40S"  # Override in subclass
    
    def build_workflow(self, item: dict) -> dict:
        """Build workflow JSON. Override in subclass."""
        raise NotImplementedError
    
    def validate_input(self, item: dict) -> None:
        """Validate input before processing."""
        raise NotImplementedError
    
    def execute(self, item: dict) -> Response:
        """Standard execution flow."""
        self.validate_input(item)
        self.cost_tracker.start()
        
        try:
            workflow = self.build_workflow(item)
            result = self._execute_workflow(workflow)
            return self._create_response(result)
        except WorkflowError as e:
            return self._handle_error(e)
        finally:
            self.cost_tracker.stop()
```

---

### 2. Face Consistency Gaps

**Problem**: Face consistency (InstantID, PuLID) doesn't work on all models.

**Current State**:
| Model | InstantID | PuLID | IPAdapter | LoRA |
|---|---|---|---|---|
| Flux Dev | ⚠️ Partial | ✅ Works | ✅ Works | ✅ Works |
| Flux Schnell | ❌ N/A | ❌ N/A | ❌ N/A | ✅ Works |
| SDXL | ✅ Works | ✅ Works | ✅ Works | ✅ Works |
| Z-Image-Turbo | ❌ Incompatible | ❌ Incompatible | ❌ Incompatible | ✅ Works |
| Qwen-Image 2512 | ❌ Untested | ❌ Untested | ⚠️ Experimental | ✅ Works |
| Qwen-Image Fast | ❌ Untested | ❌ Untested | ⚠️ Experimental | ✅ Works |
| Wan 2.6 | N/A (video) | N/A | N/A | ✅ Works |

> **Update (Jan 2026)**: Added experimental IPAdapter support for Qwen-Image 2512 via `/qwen-image-2512-ipadapter` and `/qwen-image-2512-ipadapter-fast` endpoints. These are experimental as IPAdapter was designed for SD/SDXL/Flux architectures.

**Impact**:
- Users can't use face consistency with fastest models (Z-Image, Qwen Fast)
- Forces users to slower models for consistent faces
- Limits product value

**Proposals**:

**A. Investigate Z-Image + Face Consistency (High Priority)**

The current error says "Qwen text encoder incompatible" but this needs validation:
1. Research if Z-Image-Turbo custom nodes have face consistency support
2. Test if IPAdapter (not InstantID) works with Z-Image
3. If not possible, document clearly with alternatives

**B. Add Qwen-Image Face Consistency**

Qwen-Image 2512 is our best quality model. Add:
1. Qwen-Image + InstantID endpoint
2. Qwen-Image + IPAdapter endpoint
3. Document which combinations work

**C. Create "Smart Face" Endpoint**

Single endpoint that automatically picks the best model for face consistency:
```
POST /smart-face-generate
{
  "prompt": "...",
  "reference_image": "...",
  "priority": "quality" | "speed" | "balanced"
}
```

Logic:
- `quality` → Flux Dev + InstantID
- `speed` → SDXL + IPAdapter (faster than Flux)
- `balanced` → Auto-select based on queue depth

---

### 3. Error Handling is Inconsistent

**Problem**: Each handler handles errors differently, messages are not actionable.

**Current**:
```python
# z_image.py
raise HTTPException(status_code=501, detail="Z-Image-Turbo InstantID is not supported...")

# instantid.py
# No standard error handling, just lets exceptions bubble

# workflow.py
# Catches some errors, ignores others
```

**Impact**:
- Users get cryptic errors
- Hard to debug issues
- No retry guidance
- No alternative suggestions

**Proposal**: Create centralized error handling with actionable messages.

```python
class WorkflowError(Exception):
    """Base workflow error with user-friendly message."""
    
    def __init__(
        self,
        code: str,
        message: str,
        suggestion: str = None,
        alternative_endpoint: str = None,
        retry_after: int = None,
    ):
        self.code = code
        self.message = message
        self.suggestion = suggestion
        self.alternative_endpoint = alternative_endpoint
        self.retry_after = retry_after

# Usage
raise WorkflowError(
    code="FACE_CONSISTENCY_NOT_SUPPORTED",
    message="Z-Image-Turbo doesn't support InstantID",
    suggestion="Use a different model for face consistency",
    alternative_endpoint="/sdxl-instantid",
)
```

Response format:
```json
{
  "error": {
    "code": "FACE_CONSISTENCY_NOT_SUPPORTED",
    "message": "Z-Image-Turbo doesn't support InstantID",
    "suggestion": "Use a different model for face consistency",
    "alternative_endpoint": "/sdxl-instantid",
    "docs": "https://docs.ryla.ai/errors/FACE_CONSISTENCY_NOT_SUPPORTED"
  }
}
```

---

### 4. No Workflow Catalog

**Problem**: Workflows are scattered, undocumented, hard to discover.

**Current Locations**:
- `apps/modal/workflows/` - 2 production workflows
- `libs/comfyui-workflows/` - 50+ community workflows
- `libs/business/src/workflows/` - 6 TypeScript builders
- `apps/modal/handlers/*.py` - Inline workflow definitions

**Impact**:
- Hard to know what's available
- Hard to find the right workflow for a task
- Duplicate efforts - same workflow might exist in multiple places
- No metadata (speed, quality, cost estimates)

**Proposal**: Create a **Workflow Catalog** system.

**A. Catalog File Structure**:
```
libs/workflow-catalog/
├── catalog.json           # Master index
├── workflows/
│   ├── text-to-image/
│   │   ├── qwen-image-2512.json
│   │   ├── qwen-image-fast.json
│   │   ├── flux-schnell.json
│   │   └── z-image-turbo.json
│   ├── face-consistency/
│   │   ├── flux-instantid.json
│   │   ├── sdxl-instantid.json
│   │   └── flux-pulid.json
│   └── video/
│       ├── wan26-t2v.json
│       └── wan26-r2v.json
└── README.md
```

**B. Catalog Entry Format**:
```json
{
  "id": "qwen-image-2512",
  "name": "Qwen-Image 2512",
  "category": "text-to-image",
  "description": "High quality text-to-image with Qwen-Image 2512",
  "endpoint": "/qwen-t2i",
  "modal_app": "ryla-qwen-image",
  
  "performance": {
    "speed": "slow",
    "quality": "highest",
    "cost_per_image_usd": 0.02,
    "typical_time_seconds": 30
  },
  
  "capabilities": {
    "face_consistency": false,
    "lora_support": true,
    "negative_prompt": true,
    "resolution_range": [512, 2048]
  },
  
  "parameters": {
    "prompt": { "type": "string", "required": true },
    "width": { "type": "int", "default": 1024 },
    "height": { "type": "int", "default": 1024 },
    "steps": { "type": "int", "default": 50, "range": [1, 100] }
  },
  
  "examples": [
    {
      "prompt": "A beautiful sunset over mountains",
      "result_url": "https://..."
    }
  ],
  
  "status": "production",
  "last_tested": "2026-01-29",
  "known_issues": []
}
```

**C. Benefits**:
- Single source of truth for all workflows
- API can serve catalog for frontend discovery
- Easy to add new workflows with metadata
- Enables smart routing (pick best workflow for task)

---

### 5. Testing is Fragmented

**Problem**: Tests exist but are scattered and not comprehensive.

**Current Tests**:
```
apps/modal/tests/
├── test_cost_tracker.py      # ✅ Unit tests
├── test_workflow_builders.py # ✅ Unit tests
├── test_imports.py           # ✅ Import checks
├── test_image_utils.py       # ✅ Unit tests
├── test_seedvr2.py           # ⚠️ Integration test
├── test_performance.py       # ⚠️ Performance benchmarks
├── test_flux_dev_success_rate.py    # ⚠️ Success rate tracking
├── test_instantid_consistency.py    # ⚠️ Face consistency checks
├── comfyui_wan2_test.py      # ⚠️ Manual test script
└── comfyui_flux_test.py      # ⚠️ Manual test script
```

**Impact**:
- No automated regression testing
- Can't verify all endpoints work after deployment
- No visual quality checks
- No cost tracking in tests

**Proposal**: Create **Automated Test Suite** for all endpoints.

**A. Test Categories**:

```python
# 1. Smoke Tests (run after every deploy)
def test_endpoint_returns_image():
    """Every endpoint should return valid image bytes."""
    pass

# 2. Quality Tests (run nightly)
def test_image_quality_score():
    """Generated images should meet quality threshold."""
    pass

# 3. Consistency Tests (run weekly)
def test_face_consistency_score():
    """Same face reference should produce similar faces."""
    pass

# 4. Performance Tests (run on demand)
def test_generation_time_within_sla():
    """Generation should complete within expected time."""
    pass

# 5. Cost Tests (run after changes)
def test_cost_within_budget():
    """Generation cost should be within expected range."""
    pass
```

**B. Test Matrix**:

| Endpoint | Smoke | Quality | Consistency | Performance | Cost |
|---|---|---|---|---|---|
| `/qwen-t2i` | ✅ | ✅ | N/A | ✅ | ✅ |
| `/flux-instantid` | ✅ | ✅ | ✅ | ✅ | ✅ |
| `/z-image-simple` | ✅ | ✅ | N/A | ✅ | ✅ |
| `/wan26-t2v` | ✅ | ✅ | N/A | ✅ | ✅ |
| ... | ... | ... | ... | ... | ... |

**C. CI Integration**:
```yaml
# .github/workflows/modal-tests.yml
on:
  push:
    paths:
      - 'apps/modal/**'
  schedule:
    - cron: '0 0 * * *'  # Nightly

jobs:
  smoke-tests:
    runs-on: ubuntu-latest
    steps:
      - run: pnpm test:modal:smoke
  
  quality-tests:
    if: github.event_name == 'schedule'
    runs-on: ubuntu-latest
    steps:
      - run: pnpm test:modal:quality
```

---

### 6. Deployment is Slow

**Problem**: Adding new workflows takes hours of manual work.

**Current Process**:
1. Find workflow JSON (from community or create manually)
2. Analyze dependencies (which custom nodes, models needed)
3. Update Modal image to include dependencies
4. Write handler code
5. Deploy to Modal
6. Test endpoint
7. Document

**Impact**:
- Can't quickly test new workflows
- Blocks innovation
- Engineering time wasted on boilerplate

**Proposal**: **Automated Workflow Deployment** (relates to IN-031)

See IN-031 for full details. Key improvements:

**A. Workflow Analyzer** (exists in IN-028):
```bash
# Analyze workflow and generate deployment code
pnpm workflow-deploy analyze workflow.json
```

Output:
```yaml
dependencies:
  custom_nodes:
    - ComfyUI-InstantID
    - ComfyUI-ELLA
  models:
    - flux1-dev.safetensors
    - ip-adapter.bin
  
generated:
  handler: handlers/new_workflow.py
  dockerfile_additions: |
    RUN comfy node install ComfyUI-InstantID
```

**B. One-Command Deploy** (target state):
```bash
# From workflow JSON to deployed endpoint
pnpm workflow-deploy deploy workflow.json --name "my-workflow" --test
```

---

### 7. Missing Models

**Problem**: Some newer/popular models not yet deployed.

**Not Yet Deployed**:
| Model | Type | Why Important | Effort |
|---|---|---|---|
| **SDXL Lightning** | T2I | Very fast (4 steps), good quality | Low |
| **Flux Fill** | Inpaint | Best inpainting for Flux | Low |
| **CogVideoX** | T2V | Higher quality than Wan | Medium |
| **Stable Video Diffusion** | I2V | Image-to-video | Medium |
| **ControlNet (various)** | Control | Pose, depth, edge control | Medium |

**Proposal**: Prioritized model additions.

**Phase 1 (Quick Wins)**:
1. SDXL Lightning - fast generation alternative
2. Flux Fill - better inpainting

**Phase 2 (Video Enhancement)**:
1. CogVideoX - higher quality video
2. Stable Video Diffusion - image-to-video

**Phase 3 (Control)**:
1. ControlNet Pose - pose-guided generation
2. ControlNet Depth - depth-guided generation

---

## Prioritized Action Plan

### Immediate (This Week)

| # | Action | Impact | Effort |
|---|---|---|---|
| 1 | Document all working endpoints in catalog format | High | Low |
| 2 | Add consistent error handling to all handlers | High | Medium |
| 3 | Test Qwen-Image + face consistency options | High | Low |

### Short-term (This Month)

| # | Action | Impact | Effort |
|---|---|---|---|
| 4 | Create BaseWorkflowHandler pattern | Medium | Medium |
| 5 | Migrate handlers to base pattern | Medium | High |
| 6 | Create automated smoke test suite | High | Medium |
| 7 | Deploy SDXL Lightning | Medium | Low |

### Medium-term (This Quarter)

| # | Action | Impact | Effort |
|---|---|---|---|
| 8 | Implement workflow catalog system | High | High |
| 9 | Create "smart" endpoint with auto-routing | High | Medium |
| 10 | Add quality evaluation to tests | Medium | Medium |
| 11 | Deploy Flux Fill (inpainting) | Medium | Low |

### Long-term (Future)

| # | Action | Impact | Effort |
|---|---|---|---|
| 12 | Automated workflow deployment (IN-031) | Very High | Very High |
| 13 | ControlNet integration | Medium | High |
| 14 | CogVideoX deployment | Medium | Medium |

---

## Success Metrics

### Current Baseline
- **Deployment time**: ~4 hours per new workflow
- **Endpoint reliability**: ~95% (some timeouts)
- **Test coverage**: ~40% of endpoints
- **Face consistency coverage**: 2 models (Flux, SDXL)

### Target State
- **Deployment time**: <30 minutes per new workflow
- **Endpoint reliability**: >99%
- **Test coverage**: 100% of endpoints
- **Face consistency coverage**: 4+ models

---

## Related Documentation

- [AI Generation Explainer](./AI-GENERATION-EXPLAINER.md) - Non-technical overview
- [Ideal Model Stack](./models/RYLA-IDEAL-MODEL-STACK.md) - Model selection rationale
- [IN-015](../initiatives/IN-015-comfyui-workflow-api-alternatives.md) - Platform evaluation
- [IN-031](../initiatives/IN-031-agentic-workflow-deployment.md) - Automated deployment

---

*Last updated: January 2026*
