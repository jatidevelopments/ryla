# EP-059: Modal.com Code Organization - Technical Spec

**Initiative**: [IN-023](../../initiatives/IN-023-modal-code-organization.md)  
**Epic**: [EP-059 Requirements](../../requirements/epics/mvp/EP-059-modal-code-organization-requirements.md)  
**Scoping**: [EP-059 Scoping](../../requirements/epics/mvp/EP-059-modal-code-organization-scoping.md)  
**Architecture**: [EP-059 Architecture](../../architecture/epics/EP-059-modal-code-organization-architecture.md)  
**Status**: P5 - Technical Spec  
**Created**: 2026-01-21  
**Last Updated**: 2026-01-21

---

## Scope (MVP)

- Reorganize Modal codebase into modular structure
- Extract handlers, utilities, configuration, and image build
- Maintain all existing functionality (no breaking changes)
- Improve maintainability and developer experience
- Establish patterns for future development

**Out of scope (MVP)**:
- Adding new features
- Changing API contracts
- Performance optimization
- Advanced testing strategies
- CI/CD improvements

---

## File Plan

### Files to Create

#### Core Application Files

1. **`apps/modal/app.py`** (~200 lines)
   - **Purpose**: Main entry point for Modal app
   - **Contents**:
     - Modal app definition (`modal.App`)
     - ComfyUI class with lifecycle methods
     - FastAPI app setup
     - Endpoint registration from handlers
   - **Dependencies**: `config.py`, `image.py`, `handlers/*.py`, `utils/comfyui.py`

2. **`apps/modal/config.py`** (~100 lines)
   - **Purpose**: Centralized configuration
   - **Contents**:
     - Volume definitions (`ryla-models`, `hf-hub-cache`)
     - Secret definitions (`huggingface`)
     - GPU configuration (`L40S`)
     - Image build configuration (Python version, ComfyUI version)
     - Model paths configuration
   - **Dependencies**: `modal` SDK

3. **`apps/modal/image.py`** (~600 lines)
   - **Purpose**: Image build with model downloads
   - **Contents**:
     - Model download functions:
       - `hf_download_flux()` - Flux Schnell
       - `hf_download_flux_dev()` - Flux Dev
       - `hf_download_instantid()` - InstantID
       - `hf_download_wan2()` - Wan2.1
       - `hf_download_seedvr2()` - SeedVR2
     - Custom node installation commands
     - Image build definition
   - **Dependencies**: `config.py`, `modal` SDK

#### Handler Files

4. **`apps/modal/handlers/__init__.py`** (~10 lines)
   - **Purpose**: Package initialization
   - **Contents**: Package exports

5. **`apps/modal/handlers/flux.py`** (~400 lines)
   - **Purpose**: Flux workflows and endpoints
   - **Contents**:
     - `build_flux_workflow(item)` - Flux Schnell workflow builder
     - `build_flux_dev_workflow(item)` - Flux Dev workflow builder
     - `FluxHandler` class with `_flux_impl()` and `_flux_dev_impl()` methods
     - `setup_flux_endpoints(fastapi, comfyui_instance)` - Endpoint registration
   - **Dependencies**: `utils/cost_tracker.py`, `utils/comfyui.py`

6. **`apps/modal/handlers/instantid.py`** (~400 lines)
   - **Purpose**: InstantID workflows and endpoints
   - **Contents**:
     - `build_flux_instantid_workflow(item)` - InstantID workflow builder
     - `InstantIDHandler` class with `_flux_instantid_impl()` method
     - `setup_instantid_endpoints(fastapi, comfyui_instance)` - Endpoint registration
   - **Dependencies**: `utils/cost_tracker.py`, `utils/comfyui.py`, `utils/image_utils.py`

7. **`apps/modal/handlers/lora.py`** (~300 lines)
   - **Purpose**: LoRA workflows and endpoints
   - **Contents**:
     - `build_flux_lora_workflow(item)` - LoRA workflow builder
     - `LoRAHandler` class with `_flux_lora_impl()` method
     - `setup_lora_endpoints(fastapi, comfyui_instance)` - Endpoint registration
   - **Dependencies**: `utils/cost_tracker.py`, `utils/comfyui.py`

8. **`apps/modal/handlers/wan2.py`** (~400 lines)
   - **Purpose**: Wan2.1 workflows and endpoints
   - **Contents**:
     - `build_wan2_workflow(item)` - Wan2.1 workflow builder
     - `Wan2Handler` class with `_wan2_impl()` method
     - `setup_wan2_endpoints(fastapi, comfyui_instance)` - Endpoint registration
   - **Dependencies**: `utils/cost_tracker.py`, `utils/comfyui.py`

9. **`apps/modal/handlers/seedvr2.py`** (~300 lines)
   - **Purpose**: SeedVR2 workflows and endpoints
   - **Contents**:
     - `build_seedvr2_workflow(item)` - SeedVR2 workflow builder
     - `SeedVR2Handler` class with `_seedvr2_impl()` method
     - `setup_seedvr2_endpoints(fastapi, comfyui_instance)` - Endpoint registration
   - **Dependencies**: `utils/cost_tracker.py`, `utils/comfyui.py`, `utils/image_utils.py`

10. **`apps/modal/handlers/workflow.py`** (~200 lines)
    - **Purpose**: Custom workflow endpoint
    - **Contents**:
      - `WorkflowHandler` class with `_workflow_impl()` method
      - `setup_workflow_endpoints(fastapi, comfyui_instance)` - Endpoint registration
    - **Dependencies**: `utils/cost_tracker.py`, `utils/comfyui.py`

#### Utility Files

11. **`apps/modal/utils/__init__.py`** (~10 lines)
    - **Purpose**: Package initialization
    - **Contents**: Package exports

12. **`apps/modal/utils/cost_tracker.py`** (~150 lines)
    - **Purpose**: Cost tracking utilities
    - **Contents**:
      - `CostTracker` class (start/stop timers, calculate costs)
      - `get_cost_summary()` function
      - GPU pricing constants
    - **Dependencies**: None (standalone)

13. **`apps/modal/utils/comfyui.py`** (~200 lines)
    - **Purpose**: ComfyUI server management
    - **Contents**:
      - `launch_comfy_server(port)` - Launch ComfyUI server
      - `check_comfy_health()` - Health check
      - `execute_workflow(workflow)` - Workflow execution helper
    - **Dependencies**: None (standalone)

14. **`apps/modal/utils/image_utils.py`** (~100 lines)
    - **Purpose**: Image processing utilities
    - **Contents**:
      - `encode_base64(image_path)` - Base64 encoding
      - `decode_base64(base64_string)` - Base64 decoding
      - `validate_image(image_path)` - Image validation
    - **Dependencies**: PIL/Pillow

#### Documentation Files

15. **`apps/modal/docs/README.md`** (~50 lines)
    - **Purpose**: Documentation index
    - **Contents**: Links to all documentation files

16. **`apps/modal/docs/deployment.md`** (~100 lines)
    - **Purpose**: Deployment guide
    - **Contents**: Deployment instructions, troubleshooting

17. **`apps/modal/docs/models.md`** (~150 lines)
    - **Purpose**: Model documentation
    - **Contents**: Model information, download instructions

18. **`apps/modal/docs/workflows.md`** (~200 lines)
    - **Purpose**: Workflow documentation
    - **Contents**: Workflow descriptions, examples

#### Test Files

19. **`apps/modal/tests/__init__.py`** (~10 lines)
    - **Purpose**: Package initialization

20. **`apps/modal/tests/test_flux.py`** (~100 lines)
    - **Purpose**: Flux endpoint tests
    - **Contents**: Test Flux and Flux Dev endpoints

21. **`apps/modal/tests/test_instantid.py`** (~100 lines)
    - **Purpose**: InstantID endpoint tests
    - **Contents**: Test InstantID endpoint

22. **`apps/modal/tests/test_handlers.py`** (~150 lines)
    - **Purpose**: Handler pattern tests
    - **Contents**: Test handler patterns, workflow builders

23. **`apps/modal/tests/test_utils.py`** (~100 lines)
    - **Purpose**: Utility tests
    - **Contents**: Test cost tracker, ComfyUI utils, image utils

---

### Files to Modify

1. **`apps/modal/comfyui_ryla.py`** → **Archive**
   - **Action**: Move to `apps/modal/archive/comfyui_ryla.py`
   - **Reason**: Replaced by new modular structure

2. **`apps/modal/ryla_client.py`** → **Update**
   - **Action**: Verify it works with new structure (should work as-is)
   - **Changes**: None expected (endpoints unchanged)

3. **`apps/modal/README.md`** → **Update**
   - **Action**: Update with new structure, links to docs
   - **Changes**: Add structure diagram, update deployment command

4. **`apps/modal/BEST-PRACTICES.md`** → **Update**
   - **Action**: Update with new patterns and examples
   - **Changes**: Add handler patterns, workflow creation examples

---

### Files to Archive

Move to `apps/modal/archive/`:

1. `comfyui_danrisi.py` (1171 lines)
2. `comfyui_danrisi_backup.py`
3. `comfyui_danrisi_fixed.py`
4. `comfyui_z_image_turbo.py` (if not needed)
5. `comfyui_flux_test.py` (move to `tests/`)
6. `comfyui_wan2_test.py` (move to `tests/`)
7. `comfyclient_flux.py` (if not needed)
8. `comfyclient_wan2.py` (if not needed)

---

### Files to Organize

Move to `apps/modal/docs/`:

1. `DEPLOYMENT-NOTES.md` → `docs/deployment.md`
2. `QUICK-START.md` → `docs/quick-start.md`
3. `BEST-PRACTICES.md` → Keep in root (main reference)
4. `COST-TRACKING.md` → `docs/cost-tracking.md`
5. `KNOWN-ISSUES.md` → `docs/troubleshooting.md`
6. `TEST-RESULTS.md` → `docs/test-results.md`
7. `REORGANIZATION-PLAN.md` → `docs/reorganization-plan.md`
8. All other `*.md` files → Review and organize

Move to `apps/modal/tests/`:

1. `test_flux_dev_success_rate.py`
2. `test_instantid_consistency.py`
3. `test_performance.py`
4. `test_seedvr2.py`

Move to `apps/modal/scripts/`:

1. `upload_models.py`
2. `upload_z_image_models.py`
3. `setup.sh` (if needed)

---

## Technical Specification

### Logic Flows

#### 1. Application Startup Flow

```
1. Modal loads app.py
   ↓
2. app.py imports config.py (volumes, secrets, GPU)
   ↓
3. app.py imports image.py (image build)
   ↓
4. app.py defines ComfyUI class
   ↓
5. ComfyUI.enter() launches ComfyUI server (utils/comfyui.py)
   ↓
6. ComfyUI.asgi_app() creates FastAPI app
   ↓
7. FastAPI app registers endpoints from handlers
   ↓
8. Application ready to receive requests
```

#### 2. Request Flow (Example: /flux-dev)

```
1. Client sends POST /flux-dev
   ↓
2. FastAPI routes to handlers/flux.py setup_flux_endpoints()
   ↓
3. FluxHandler._flux_dev_impl() called
   ↓
4. CostTracker.start() (utils/cost_tracker.py)
   ↓
5. build_flux_dev_workflow(item) builds workflow JSON
   ↓
6. ComfyUI.infer.local(workflow) executes workflow
   ↓
7. CostTracker.stop() and calculate_cost()
   ↓
8. Response created with cost headers
   ↓
9. Client receives response with image + cost info
```

#### 3. Image Build Flow

```
1. modal deploy apps/modal/app.py
   ↓
2. Modal loads image.py
   ↓
3. image.py imports config.py (volumes, secrets)
   ↓
4. Image build executes:
   - Base image (Debian + Python)
   - Install dependencies (FastAPI, ComfyUI CLI)
   - Install ComfyUI
   - Install custom nodes
   - Download models (hf_download_* functions)
   ↓
5. Models stored in volumes
   ↓
6. Image ready for deployment
```

---

### Environment Variables

**No new environment variables required** - all configuration in `config.py`.

**Existing Modal Secrets**:
- `huggingface` - HuggingFace token (for gated models)

**Existing Modal Volumes**:
- `ryla-models` - Model storage
- `hf-hub-cache` - HuggingFace cache

---

### Dependencies

#### Python Dependencies

**No new dependencies** - all existing dependencies preserved:

- `modal` - Modal SDK
- `fastapi[standard]==0.115.4` - FastAPI framework
- `comfy-cli==1.5.3` - ComfyUI CLI
- `huggingface_hub` - HuggingFace Hub (for model downloads)
- `PIL/Pillow` - Image processing (for image_utils.py)

#### Internal Dependencies

```
app.py
├── config.py
├── image.py
├── handlers/*.py
└── utils/comfyui.py

handlers/*.py
├── utils/cost_tracker.py
├── utils/comfyui.py
└── utils/image_utils.py (for InstantID, SeedVR2)

image.py
└── config.py

config.py
└── modal (SDK)
```

**No circular dependencies** - clean dependency graph.

---

## Task Breakdown (P6-ready)

### Story ST-001: Create Directory Structure

**Tasks**:

- **TSK-001-001**: Create directory structure
  - Create `handlers/` directory
  - Create `utils/` directory
  - Create `tests/` directory
  - Create `docs/` subdirectory
  - Create `scripts/` directory
  - Create `archive/` directory
  - Add `__init__.py` files to all Python packages
  - **Input**: None
  - **Output**: Directory structure created
  - **Test**: Verify directories exist

- **TSK-001-002**: Update README.md with structure
  - Add structure diagram
  - Document directory purposes
  - **Input**: Directory structure
  - **Output**: Updated README.md
  - **Test**: Verify README is clear

---

### Story ST-002: Extract Utilities

**Tasks**:

- **TSK-002-001**: Move cost_tracker.py to utils/
  - Move `cost_tracker.py` → `utils/cost_tracker.py`
  - Update imports in main app (temporary, will be removed later)
  - **Input**: `cost_tracker.py` in root
  - **Output**: `utils/cost_tracker.py`
  - **Test**: Import works, cost tracking still functions

- **TSK-002-002**: Extract ComfyUI utilities
  - Create `utils/comfyui.py`
  - Extract ComfyUI server launch logic from `comfyui_ryla.py`
  - Extract workflow execution helpers
  - **Input**: `comfyui_ryla.py` (ComfyUI class methods)
  - **Output**: `utils/comfyui.py` with `launch_comfy_server()`, helpers
  - **Test**: Utilities can be imported, functions work

- **TSK-002-003**: Extract image utilities
  - Create `utils/image_utils.py`
  - Extract base64 encoding/decoding logic
  - Extract image validation logic
  - **Input**: Base64/image handling code from handlers
  - **Output**: `utils/image_utils.py` with image utilities
  - **Test**: Utilities can be imported, functions work

---

### Story ST-003: Extract Flux Handler

**Tasks**:

- **TSK-003-001**: Create handlers/flux.py structure
  - Create `handlers/flux.py` file
  - Define `FluxHandler` class structure
  - Define `build_flux_workflow()` function
  - Define `build_flux_dev_workflow()` function
  - **Input**: Flux workflow code from `comfyui_ryla.py`
  - **Output**: `handlers/flux.py` with structure
  - **Test**: File created, no syntax errors

- **TSK-003-002**: Extract _flux_impl method
  - Move `_flux_impl()` from `ComfyUI` class to `FluxHandler` class
  - Update imports (use `utils/cost_tracker.py`, `utils/comfyui.py`)
  - Update workflow builder call
  - **Input**: `_flux_impl()` method from `comfyui_ryla.py`
  - **Output**: `FluxHandler._flux_impl()` in `handlers/flux.py`
  - **Test**: Method works, imports resolve

- **TSK-003-003**: Extract _flux_dev_impl method
  - Move `_flux_dev_impl()` from `ComfyUI` class to `FluxHandler` class
  - Update imports
  - Update workflow builder call
  - **Input**: `_flux_dev_impl()` method from `comfyui_ryla.py`
  - **Output**: `FluxHandler._flux_dev_impl()` in `handlers/flux.py`
  - **Test**: Method works, imports resolve

- **TSK-003-004**: Create endpoint setup function
  - Create `setup_flux_endpoints(fastapi, comfyui_instance)` function
  - Register `/flux` and `/flux-dev` endpoints
  - Wire up handler methods
  - **Input**: FastAPI app, ComfyUI instance
  - **Output**: Endpoints registered in FastAPI
  - **Test**: Endpoints accessible, handlers called correctly

- **TSK-003-005**: Test Flux endpoints
  - Deploy Modal app (temporary, using old structure)
  - Test `/flux` endpoint
  - Test `/flux-dev` endpoint
  - Verify cost tracking works
  - **Input**: Deployed app
  - **Output**: Test results
  - **Test**: Both endpoints work, cost headers present

---

### Story ST-004: Extract InstantID Handler

**Tasks**:

- **TSK-004-001**: Create handlers/instantid.py
  - Create `handlers/instantid.py` file
  - Define `InstantIDHandler` class structure
  - Define `build_flux_instantid_workflow()` function
  - **Input**: InstantID workflow code from `comfyui_ryla.py`
  - **Output**: `handlers/instantid.py` with structure
  - **Test**: File created, no syntax errors

- **TSK-004-002**: Extract _flux_instantid_impl method
  - Move `_flux_instantid_impl()` to `InstantIDHandler` class
  - Update imports (use `utils/image_utils.py` for base64)
  - Update workflow builder call
  - **Input**: `_flux_instantid_impl()` method
  - **Output**: `InstantIDHandler._flux_instantid_impl()` in `handlers/instantid.py`
  - **Test**: Method works, imports resolve

- **TSK-004-003**: Create endpoint setup function
  - Create `setup_instantid_endpoints(fastapi, comfyui_instance)` function
  - Register `/flux-instantid` endpoint
  - **Input**: FastAPI app, ComfyUI instance
  - **Output**: Endpoint registered
  - **Test**: Endpoint accessible

- **TSK-004-004**: Test InstantID endpoint
  - Deploy Modal app
  - Test `/flux-instantid` endpoint
  - Verify cost tracking works
  - **Input**: Deployed app
  - **Output**: Test results
  - **Test**: Endpoint works, cost headers present

---

### Story ST-005: Extract LoRA Handler

**Tasks**:

- **TSK-005-001**: Create handlers/lora.py
  - Create `handlers/lora.py` file
  - Define `LoRAHandler` class structure
  - Define `build_flux_lora_workflow()` function
  - **Input**: LoRA workflow code from `comfyui_ryla.py`
  - **Output**: `handlers/lora.py` with structure
  - **Test**: File created, no syntax errors

- **TSK-005-002**: Extract _flux_lora_impl method
  - Move `_flux_lora_impl()` to `LoRAHandler` class
  - Update imports
  - Update workflow builder call
  - **Input**: `_flux_lora_impl()` method
  - **Output**: `LoRAHandler._flux_lora_impl()` in `handlers/lora.py`
  - **Test**: Method works, imports resolve

- **TSK-005-003**: Create endpoint setup function
  - Create `setup_lora_endpoints(fastapi, comfyui_instance)` function
  - Register `/flux-lora` endpoint
  - **Input**: FastAPI app, ComfyUI instance
  - **Output**: Endpoint registered
  - **Test**: Endpoint accessible

- **TSK-005-004**: Test LoRA endpoint
  - Deploy Modal app
  - Test `/flux-lora` endpoint
  - Verify cost tracking works
  - **Input**: Deployed app
  - **Output**: Test results
  - **Test**: Endpoint works, cost headers present

---

### Story ST-006: Extract Wan2 Handler

**Tasks**:

- **TSK-006-001**: Create handlers/wan2.py
  - Create `handlers/wan2.py` file
  - Define `Wan2Handler` class structure
  - Define `build_wan2_workflow()` function
  - **Input**: Wan2 workflow code from `comfyui_ryla.py`
  - **Output**: `handlers/wan2.py` with structure
  - **Test**: File created, no syntax errors

- **TSK-006-002**: Extract _wan2_impl method
  - Move `_wan2_impl()` to `Wan2Handler` class
  - Update imports
  - Update workflow builder call
  - **Input**: `_wan2_impl()` method
  - **Output**: `Wan2Handler._wan2_impl()` in `handlers/wan2.py`
  - **Test**: Method works, imports resolve

- **TSK-006-003**: Create endpoint setup function
  - Create `setup_wan2_endpoints(fastapi, comfyui_instance)` function
  - Register `/wan2` endpoint
  - **Input**: FastAPI app, ComfyUI instance
  - **Output**: Endpoint registered
  - **Test**: Endpoint accessible

- **TSK-006-004**: Test Wan2 endpoint
  - Deploy Modal app
  - Test `/wan2` endpoint
  - Verify cost tracking works
  - **Input**: Deployed app
  - **Output**: Test results
  - **Test**: Endpoint works, cost headers present

---

### Story ST-007: Extract SeedVR2 Handler

**Tasks**:

- **TSK-007-001**: Create handlers/seedvr2.py
  - Create `handlers/seedvr2.py` file
  - Define `SeedVR2Handler` class structure
  - Define `build_seedvr2_workflow()` function
  - **Input**: SeedVR2 workflow code from `comfyui_ryla.py`
  - **Output**: `handlers/seedvr2.py` with structure
  - **Test**: File created, no syntax errors

- **TSK-007-002**: Extract _seedvr2_impl method
  - Move `_seedvr2_impl()` to `SeedVR2Handler` class
  - Update imports (use `utils/image_utils.py` for base64)
  - Update workflow builder call
  - **Input**: `_seedvr2_impl()` method
  - **Output**: `SeedVR2Handler._seedvr2_impl()` in `handlers/seedvr2.py`
  - **Test**: Method works, imports resolve

- **TSK-007-003**: Create endpoint setup function
  - Create `setup_seedvr2_endpoints(fastapi, comfyui_instance)` function
  - Register `/seedvr2` endpoint
  - **Input**: FastAPI app, ComfyUI instance
  - **Output**: Endpoint registered
  - **Test**: Endpoint accessible

- **TSK-007-004**: Test SeedVR2 endpoint
  - Deploy Modal app
  - Test `/seedvr2` endpoint
  - Verify cost tracking works
  - **Input**: Deployed app
  - **Output**: Test results
  - **Test**: Endpoint works, cost headers present

---

### Story ST-008: Extract Custom Workflow Handler

**Tasks**:

- **TSK-008-001**: Create handlers/workflow.py
  - Create `handlers/workflow.py` file
  - Define `WorkflowHandler` class structure
  - **Input**: Custom workflow code from `comfyui_ryla.py`
  - **Output**: `handlers/workflow.py` with structure
  - **Test**: File created, no syntax errors

- **TSK-008-002**: Extract _workflow_impl method
  - Move `_workflow_impl()` to `WorkflowHandler` class
  - Update imports
  - **Input**: `_workflow_impl()` method
  - **Output**: `WorkflowHandler._workflow_impl()` in `handlers/workflow.py`
  - **Test**: Method works, imports resolve

- **TSK-008-003**: Create endpoint setup function
  - Create `setup_workflow_endpoints(fastapi, comfyui_instance)` function
  - Register `/workflow` endpoint
  - **Input**: FastAPI app, ComfyUI instance
  - **Output**: Endpoint registered
  - **Test**: Endpoint accessible

- **TSK-008-004**: Test workflow endpoint
  - Deploy Modal app
  - Test `/workflow` endpoint
  - Verify cost tracking works
  - **Input**: Deployed app
  - **Output**: Test results
  - **Test**: Endpoint works, cost headers present

---

### Story ST-009: Extract Image Build Logic

**Tasks**:

- **TSK-009-001**: Create image.py structure
  - Create `image.py` file
  - Import from `config.py`
  - Define image build structure
  - **Input**: Image build code from `comfyui_ryla.py`
  - **Output**: `image.py` with structure
  - **Test**: File created, no syntax errors

- **TSK-009-002**: Move model download functions
  - Move `hf_download_flux()` to `image.py`
  - Move `hf_download_flux_dev()` to `image.py`
  - Move `hf_download_instantid()` to `image.py`
  - Move `hf_download_wan2()` to `image.py`
  - Move `hf_download_seedvr2()` to `image.py`
  - **Input**: Model download functions from `comfyui_ryla.py`
  - **Output**: All download functions in `image.py`
  - **Test**: Functions work, imports resolve

- **TSK-009-003**: Move custom node installation
  - Move custom node installation commands to `image.py`
  - Organize by custom node
  - **Input**: Custom node installation from `comfyui_ryla.py`
  - **Output**: Custom node installation in `image.py`
  - **Test**: Installation commands correct

- **TSK-009-004**: Build image definition
  - Create complete image build definition
  - Include all model downloads
  - Include all custom nodes
  - **Input**: Image build code from `comfyui_ryla.py`
  - **Output**: Complete `image` definition in `image.py`
  - **Test**: Image builds successfully

- **TSK-009-005**: Test image build
  - Deploy Modal app (using new image.py)
  - Verify models download correctly
  - Verify custom nodes install correctly
  - **Input**: Deployed app
  - **Output**: Test results
  - **Test**: Image build works, models available

---

### Story ST-010: Extract Configuration

**Tasks**:

- **TSK-010-001**: Create config.py structure
  - Create `config.py` file
  - Define configuration structure
  - **Input**: Configuration code from `comfyui_ryla.py`
  - **Output**: `config.py` with structure
  - **Test**: File created, no syntax errors

- **TSK-010-002**: Move volume definitions
  - Move `volume = modal.Volume.from_name(...)` to `config.py`
  - Move `hf_cache_vol = modal.Volume.from_name(...)` to `config.py`
  - **Input**: Volume definitions from `comfyui_ryla.py`
  - **Output**: Volume definitions in `config.py`
  - **Test**: Volumes accessible

- **TSK-010-003**: Move secret definitions
  - Move `modal.Secret.from_name("huggingface")` to `config.py`
  - **Input**: Secret definitions from `comfyui_ryla.py`
  - **Output**: Secret definitions in `config.py`
  - **Test**: Secrets accessible

- **TSK-010-004**: Add GPU and build configuration
  - Add `GPU_TYPE = "L40S"` constant
  - Add Python version, ComfyUI version constants
  - Add model paths configuration
  - **Input**: Configuration values
  - **Output**: Complete configuration in `config.py`
  - **Test**: Configuration values correct

---

### Story ST-011: Refactor Main App File

**Tasks**:

- **TSK-011-001**: Create app.py structure
  - Create `app.py` file
  - Import from `config.py`
  - Import from `image.py`
  - Import from `handlers/*.py`
  - Import from `utils/comfyui.py`
  - **Input**: Main app code from `comfyui_ryla.py`
  - **Output**: `app.py` with imports
  - **Test**: File created, imports resolve

- **TSK-011-002**: Define Modal app
  - Create `app = modal.App("ryla-comfyui")`
  - **Input**: Modal app definition
  - **Output**: Modal app in `app.py`
  - **Test**: App definition correct

- **TSK-011-003**: Define ComfyUI class
  - Create `ComfyUI` class with `@app.cls()` decorator
  - Use `image` from `image.py`
  - Use volumes from `config.py`
  - Use secrets from `config.py`
  - **Input**: ComfyUI class from `comfyui_ryla.py`
  - **Output**: ComfyUI class in `app.py`
  - **Test**: Class definition correct

- **TSK-011-004**: Implement lifecycle methods
  - Implement `@modal.enter()` method (launch ComfyUI server)
  - Use `utils/comfyui.py` for server launch
  - **Input**: Lifecycle methods from `comfyui_ryla.py`
  - **Output**: Lifecycle methods in `app.py`
  - **Test**: Methods work

- **TSK-011-005**: Create FastAPI app
  - Create `@modal.asgi_app()` method
  - Create FastAPI instance
  - **Input**: FastAPI setup from `comfyui_ryla.py`
  - **Output**: FastAPI app in `app.py`
  - **Test**: FastAPI app created

- **TSK-011-006**: Register all endpoints
  - Call `setup_flux_endpoints(fastapi, self)`
  - Call `setup_instantid_endpoints(fastapi, self)`
  - Call `setup_lora_endpoints(fastapi, self)`
  - Call `setup_wan2_endpoints(fastapi, self)`
  - Call `setup_seedvr2_endpoints(fastapi, self)`
  - Call `setup_workflow_endpoints(fastapi, self)`
  - **Input**: Endpoint setup functions from handlers
  - **Output**: All endpoints registered
  - **Test**: All endpoints accessible

- **TSK-011-007**: Test deployment
  - Deploy: `modal deploy apps/modal/app.py`
  - Verify deployment succeeds
  - **Input**: Deployed app
  - **Output**: Deployment successful
  - **Test**: Deployment works, app accessible

---

### Story ST-012: Organize Documentation

**Tasks**:

- **TSK-012-001**: Create docs/ subdirectory structure
  - Create `docs/` directory
  - Create `docs/README.md` (index)
  - **Input**: Documentation files in root
  - **Output**: `docs/` directory structure
  - **Test**: Directory exists

- **TSK-012-002**: Move and organize documentation
  - Move `DEPLOYMENT-NOTES.md` → `docs/deployment.md`
  - Move `QUICK-START.md` → `docs/quick-start.md`
  - Move `COST-TRACKING.md` → `docs/cost-tracking.md`
  - Move `KNOWN-ISSUES.md` → `docs/troubleshooting.md`
  - Move `TEST-RESULTS.md` → `docs/test-results.md`
  - Move `REORGANIZATION-PLAN.md` → `docs/reorganization-plan.md`
  - **Input**: Documentation files
  - **Output**: Organized documentation in `docs/`
  - **Test**: Files moved, links updated

- **TSK-012-003**: Create documentation index
  - Create `docs/README.md` with links to all docs
  - Organize by topic
  - **Input**: All documentation files
  - **Output**: Documentation index
  - **Test**: Index complete, links work

- **TSK-012-004**: Update README.md
  - Update root `README.md` with new structure
  - Add links to `docs/`
  - Update deployment command
  - **Input**: New structure
  - **Output**: Updated README.md
  - **Test**: README clear and accurate

---

### Story ST-013: Archive Old Files

**Tasks**:

- **TSK-013-001**: Move duplicate files to archive
  - Move `comfyui_danrisi.py` → `archive/`
  - Move `comfyui_danrisi_backup.py` → `archive/`
  - Move `comfyui_danrisi_fixed.py` → `archive/`
  - Move `comfyui_z_image_turbo.py` → `archive/` (if not needed)
  - **Input**: Duplicate files
  - **Output**: Files in `archive/`
  - **Test**: Files moved

- **TSK-013-002**: Move test files to tests/
  - Move `comfyui_flux_test.py` → `tests/`
  - Move `comfyui_wan2_test.py` → `tests/`
  - Move `test_*.py` → `tests/`
  - **Input**: Test files
  - **Output**: Test files in `tests/`
  - **Test**: Files moved

- **TSK-013-003**: Move scripts to scripts/
  - Move `upload_models.py` → `scripts/`
  - Move `upload_z_image_models.py` → `scripts/`
  - Move `setup.sh` → `scripts/` (if needed)
  - **Input**: Script files
  - **Output**: Script files in `scripts/`
  - **Test**: Files moved

- **TSK-013-004**: Document archive
  - Create `archive/README.md` explaining what's archived
  - Document why files were archived
  - **Input**: Archived files
  - **Output**: Archive documentation
  - **Test**: Documentation clear

---

### Story ST-014: Update Best Practices Document

**Tasks**:

- **TSK-014-001**: Update with new structure
  - Update `BEST-PRACTICES.md` with new file structure
  - Add handler patterns
  - Add workflow creation patterns
  - **Input**: New structure, patterns
  - **Output**: Updated BEST-PRACTICES.md
  - **Test**: Document accurate

- **TSK-014-002**: Add code examples
  - Add handler creation example
  - Add workflow builder example
  - Add endpoint registration example
  - **Input**: Actual code from handlers
  - **Output**: Code examples in BEST-PRACTICES.md
  - **Test**: Examples work

- **TSK-014-003**: Validate patterns
  - Verify all patterns documented are used in code
  - Verify examples match actual implementation
  - **Input**: Code, documentation
  - **Output**: Validated patterns
  - **Test**: Patterns accurate

---

### Story ST-015: Update Client Script

**Tasks**:

- **TSK-015-001**: Verify client script works
  - Test `ryla_client.py` with all endpoints
  - Verify cost tracking display works
  - **Input**: Client script, deployed app
  - **Output**: Test results
  - **Test**: Client script works

- **TSK-015-002**: Update if needed
  - Update client script if any changes needed
  - **Input**: Test results
  - **Output**: Updated client script (if needed)
  - **Test**: Client script works

---

### Story ST-016: Comprehensive Testing

**Tasks**:

- **TSK-016-001**: Test all endpoints
  - Test `/flux` endpoint
  - Test `/flux-dev` endpoint
  - Test `/flux-instantid` endpoint
  - Test `/flux-lora` endpoint
  - Test `/wan2` endpoint
  - Test `/workflow` endpoint
  - Test `/seedvr2` endpoint
  - **Input**: Deployed app
  - **Output**: Test results for each endpoint
  - **Test**: All endpoints work

- **TSK-016-002**: Verify cost tracking
  - Verify cost headers in all responses
  - Verify cost calculations correct
  - **Input**: Endpoint responses
  - **Output**: Cost tracking verification
  - **Test**: Cost tracking works

- **TSK-016-003**: Check for regressions
  - Compare before/after behavior
  - Verify no functionality lost
  - **Input**: Before/after comparison
  - **Output**: Regression test results
  - **Test**: No regressions

---

### Story ST-017: Update Deployment Documentation

**Tasks**:

- **TSK-017-001**: Update deployment guide
  - Update `docs/deployment.md` with new structure
  - Update deployment command: `modal deploy apps/modal/app.py`
  - **Input**: New structure
  - **Output**: Updated deployment guide
  - **Test**: Guide accurate

- **TSK-017-002**: Update troubleshooting
  - Update `docs/troubleshooting.md` with new structure
  - Add common issues and solutions
  - **Input**: New structure, known issues
  - **Output**: Updated troubleshooting guide
  - **Test**: Guide helpful

- **TSK-017-003**: Update quick start
  - Update `docs/quick-start.md` with new structure
  - **Input**: New structure
  - **Output**: Updated quick start guide
  - **Test**: Guide clear

---

### Story ST-018: Create Example Workflow

**Tasks**:

- **TSK-018-001**: Add simple workflow
  - Create new simple workflow using documented patterns
  - Follow handler pattern
  - Follow workflow builder pattern
  - **Input**: Patterns, requirements
  - **Output**: New workflow handler
  - **Test**: Workflow works

- **TSK-018-002**: Measure time taken
  - Track time to add workflow
  - Document time taken
  - **Input**: Time tracking
  - **Output**: Time measurement
  - **Test**: Time < 2 hours

- **TSK-018-003**: Document example
  - Document example in BEST-PRACTICES.md
  - Show how patterns were used
  - **Input**: Example workflow
  - **Output**: Documentation
  - **Test**: Documentation clear

---

## Implementation Order

### Phase 1: Foundation (Week 1, Days 1-2)

**Goal**: Set up structure and extract utilities

1. **ST-001**: Create Directory Structure (1h)
2. **ST-002**: Extract Utilities (2h)
3. **ST-010**: Extract Configuration (1h)
4. **ST-009**: Extract Image Build Logic (4h)

**Total**: 8 hours

**Deliverable**: Foundation ready, utilities extracted

---

### Phase 2: Extract Handlers (Week 1, Days 3-5)

**Goal**: Extract all handlers following established pattern

5. **ST-003**: Extract Flux Handler (3h) - **Establish pattern**
6. **ST-004**: Extract InstantID Handler (2h)
7. **ST-005**: Extract LoRA Handler (2h)
8. **ST-006**: Extract Wan2 Handler (2h)
9. **ST-007**: Extract SeedVR2 Handler (2h)
10. **ST-008**: Extract Custom Workflow Handler (2h)

**Total**: 13 hours

**Deliverable**: All handlers extracted, endpoints working

---

### Phase 3: Main App & Documentation (Week 2, Days 1-2)

**Goal**: Refactor main app and organize documentation

11. **ST-011**: Refactor Main App File (3h)
12. **ST-012**: Organize Documentation (3h)
13. **ST-014**: Update Best Practices Document (2h)

**Total**: 8 hours

**Deliverable**: Main app refactored, documentation organized

---

### Phase 4: Clean Up & Testing (Week 2, Days 3-5)

**Goal**: Final cleanup and comprehensive testing

14. **ST-013**: Archive Old Files (1h)
15. **ST-015**: Update Client Script (1h)
16. **ST-016**: Comprehensive Testing (4h)
17. **ST-017**: Update Deployment Documentation (2h)
18. **ST-018**: Create Example Workflow (2h)

**Total**: 10 hours

**Deliverable**: Codebase clean, all tests passing

---

## Testing Strategy

### Unit Tests

**Location**: `apps/modal/tests/`

**Test Files**:
- `test_utils.py` - Test utilities (cost tracker, ComfyUI utils, image utils)
- `test_handlers.py` - Test handler patterns, workflow builders

**Coverage**:
- Cost tracker calculations
- Workflow builder functions
- Image utilities
- Handler patterns

---

### Integration Tests

**Location**: `apps/modal/tests/`

**Test Files**:
- `test_flux.py` - Test Flux endpoints
- `test_instantid.py` - Test InstantID endpoint

**Coverage**:
- Endpoint functionality
- Cost tracking in responses
- Error handling

---

### End-to-End Tests

**Location**: Manual testing + existing test scripts

**Test Scripts**:
- `test_flux_dev_success_rate.py` - Flux Dev success rate
- `test_instantid_consistency.py` - InstantID consistency
- `test_performance.py` - Performance benchmarks
- `test_seedvr2.py` - SeedVR2 functionality

**Coverage**:
- All endpoints working
- Cost tracking accurate
- No regressions

---

## Risk Mitigation

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| **Breaking existing functionality** | Medium | High | Incremental migration, test after each step |
| **Import errors** | Medium | Medium | Test imports after each extraction |
| **Deployment failures** | Low | High | Test deployment after main app refactor |
| **Lost functionality** | Low | High | Keep old files in archive until migration complete |
| **Circular dependencies** | Low | Medium | Follow dependency graph, no cross-handler imports |
| **Handler pattern inconsistencies** | Medium | Low | Establish pattern in ST-003, follow in all handlers |

---

## Success Criteria

### Code Quality

- ✅ All files < 500 lines (most < 300)
- ✅ No circular dependencies
- ✅ Clear module boundaries
- ✅ Consistent patterns across handlers

### Functionality

- ✅ All endpoints working
- ✅ Cost tracking working
- ✅ No regressions
- ✅ Deployment works: `modal deploy apps/modal/app.py`

### Developer Experience

- ✅ Time to add workflow: < 2 hours (measured in ST-018)
- ✅ Clear documentation
- ✅ Established patterns
- ✅ Easy to navigate codebase

---

## Related Documentation

- [Requirements](./../../requirements/epics/mvp/EP-059-modal-code-organization-requirements.md)
- [Scoping](./../../requirements/epics/mvp/EP-059-modal-code-organization-scoping.md)
- [Architecture](./../../architecture/epics/EP-059-modal-code-organization-architecture.md)
- [Initiative IN-023](./../../initiatives/IN-023-modal-code-organization.md)

---

**Next Phase**: P6 - Implementation (execute reorganization incrementally)

**Status**: P5 - Technical Spec Complete
