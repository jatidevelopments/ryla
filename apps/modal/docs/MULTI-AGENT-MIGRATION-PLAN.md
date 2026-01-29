# Modal App Migration Plan: Single App → Multi-Agent Isolated Apps

> **Date**: 2026-01-27  
> **Status**: Migration Plan  
> **Purpose**: Split single Modal app into multiple apps with isolated files for IN-027 Multi-Agent Orchestration System  
> **Related**: [IN-027 Multi-Agent Orchestration System](../../../docs/initiatives/IN-027-multi-agent-orchestration-system.md)

---

## Current State

**Single App Structure:**
```
apps/modal/
├── app.py              # Single Modal app (all workflows)
├── config.py           # Shared config
├── image.py            # Shared image build
├── handlers/           # All workflow handlers
│   ├── flux.py
│   ├── instantid.py
│   ├── lora.py
│   ├── wan2.py
│   └── seedvr2.py
└── utils/              # Shared utilities
```

**Problem**: Agents can't work in parallel - all workflows in one file/app.

---

## Target State

**Multi-Agent Isolated Structure:**
```
apps/modal/
├── shared/                    # Shared code (read-only for agents)
│   ├── __init__.py
│   ├── config.py             # Shared config
│   ├── image_base.py         # Base image build
│   └── utils/                 # Shared utilities
│       ├── comfyui.py
│       ├── cost_tracker.py
│       └── image_utils.py
│
├── apps/                     # Individual apps (agent-isolated)
│   ├── flux/
│   │   ├── app.py           # modal.App("ryla-flux")
│   │   ├── handler.py       # Flux-specific logic
│   │   ├── image.py         # Flux image (extends base)
│   │   └── tests/           # Flux tests
│   │
│   ├── instantid/
│   │   ├── app.py           # modal.App("ryla-instantid")
│   │   ├── handler.py
│   │   ├── image.py
│   │   └── tests/
│   │
│   ├── lora/
│   │   ├── app.py           # modal.App("ryla-lora")
│   │   ├── handler.py
│   │   ├── image.py
│   │   └── tests/
│   │
│   ├── wan2/
│   │   ├── app.py           # modal.App("ryla-wan2")
│   │   ├── handler.py
│   │   ├── image.py
│   │   └── tests/
│   │
│   └── seedvr2/
│       ├── app.py           # modal.App("ryla-seedvr2")
│       ├── handler.py
│       ├── image.py
│       └── tests/
│
└── deploy.sh                 # Deploy all apps
```

**Agent File Assignments:**
- **Flux Agent**: `apps/modal/apps/flux/**` (isolated)
- **InstantID Agent**: `apps/modal/apps/instantid/**` (isolated)
- **LoRA Agent**: `apps/modal/apps/lora/**` (isolated)
- **Wan2 Agent**: `apps/modal/apps/wan2/**` (isolated)
- **SeedVR2 Agent**: `apps/modal/apps/seedvr2/**` (isolated)
- **Testing Agent**: `apps/modal/apps/*/tests/**` (can work in parallel)

---

## Migration Steps

### Phase 1: Extract Shared Code (Week 1)

**Goal**: Create `shared/` directory with read-only code for agents.

**Steps:**

1. **Create shared directory structure:**
   ```bash
   mkdir -p apps/modal/shared/utils
   ```

2. **Move shared code:**
   ```bash
   # Move config
   mv apps/modal/config.py apps/modal/shared/config.py
   
   # Move utils
   mv apps/modal/utils/* apps/modal/shared/utils/
   
   # Create base image
   cp apps/modal/image.py apps/modal/shared/image_base.py
   ```

3. **Update shared code imports:**
   ```python
   # apps/modal/shared/config.py
   # (no changes needed - already self-contained)
   
   # apps/modal/shared/image_base.py
   # Extract base image build (ComfyUI, common models)
   # Remove workflow-specific model downloads
   ```

4. **Test shared code:**
   ```bash
   # Verify imports work
   python -c "from apps.modal.shared.config import volume"
   ```

**Checklist:**
- [ ] `shared/` directory created
- [ ] Config moved to `shared/config.py`
- [ ] Utils moved to `shared/utils/`
- [ ] Base image extracted to `shared/image_base.py`
- [ ] Imports tested

---

### Phase 2: Create Individual Apps (Week 2)

**Goal**: Create one app per workflow with isolated files.

**Steps:**

1. **Create app directories:**
   ```bash
   mkdir -p apps/modal/apps/{flux,instantid,lora,wan2,seedvr2}
   ```

2. **Create Flux app (example):**
   ```python
   # apps/modal/apps/flux/app.py
   import modal
   import sys
   from pathlib import Path
   
   # Add shared to path
   sys.path.insert(0, str(Path(__file__).parent.parent.parent / "shared"))
   
   from config import volume, hf_cache_vol, huggingface_secret, GPU_TYPE
   from image_base import base_image
   from handler import setup_flux_endpoints
   
   # Create Flux-specific image
   from image import flux_image
   
   app = modal.App(name="ryla-flux", image=flux_image)
   
   @app.cls(
       scaledown_window=300,
       gpu=GPU_TYPE,
       volumes={"/cache": hf_cache_vol, "/root/models": volume},
       secrets=[huggingface_secret],
       timeout=1800,
   )
   @modal.concurrent(max_inputs=5)
   class ComfyUI:
       port: int = 8000
       
       @modal.enter()
       def launch_comfy_background(self):
           from utils.comfyui import launch_comfy_server
           launch_comfy_server(self.port)
       
       @modal.asgi_app()
       def fastapi_app(self):
           from fastapi import FastAPI
           fastapi = FastAPI(title="RYLA Flux API")
           setup_flux_endpoints(fastapi, self)
           return fastapi
   ```

3. **Create Flux handler:**
   ```python
   # apps/modal/apps/flux/handler.py
   # Move flux-specific logic from handlers/flux.py
   # Keep isolated - no dependencies on other handlers
   ```

4. **Create Flux image:**
   ```python
   # apps/modal/apps/flux/image.py
   import modal
   import sys
   from pathlib import Path
   
   sys.path.insert(0, str(Path(__file__).parent.parent.parent / "shared"))
   from image_base import base_image
   
   def hf_download_flux_dev():
       """Download Flux Dev models (Flux-specific)."""
       # Move Flux-specific model downloads here
       pass
   
   flux_image = (
       base_image
       .run_function(
           hf_download_flux_dev,
           volumes={"/cache": modal.Volume.from_name("hf-hub-cache")},
           secrets=[modal.Secret.from_name("huggingface")],
       )
   )
   ```

5. **Repeat for each workflow:**
   - InstantID app
   - LoRA app
   - Wan2 app
   - SeedVR2 app

**Checklist:**
- [ ] All app directories created
- [ ] Each app has `app.py`, `handler.py`, `image.py`
- [ ] Each app imports from `shared/`
- [ ] No cross-app dependencies
- [ ] Each app can be deployed independently

---

### Phase 3: Update Deployment (Week 2)

**Goal**: Create deployment scripts for multi-app structure.

**Steps:**

1. **Create deploy script:**
   ```bash
   # apps/modal/deploy.sh
   #!/bin/bash
   
   set -e
   
   echo "🚀 Deploying RYLA Modal Apps..."
   
   # Deploy all apps
   for app_dir in apps/modal/apps/*/; do
       app_name=$(basename "$app_dir")
       echo "📦 Deploying $app_name..."
       modal deploy "$app_dir/app.py"
   done
   
   echo "✅ All apps deployed!"
   ```

2. **Create deploy script for single app:**
   ```bash
   # apps/modal/deploy-one.sh
   #!/bin/bash
   
   APP_NAME=$1
   
   if [ -z "$APP_NAME" ]; then
       echo "Usage: ./deploy-one.sh <app-name>"
       echo "Available apps: flux, instantid, lora, wan2, seedvr2"
       exit 1
   fi
   
   modal deploy "apps/modal/apps/$APP_NAME/app.py"
   ```

3. **Update CI/CD:**
   ```yaml
   # .github/workflows/deploy-modal.yml
   - name: Deploy Modal Apps
     run: |
       cd apps/modal
       ./deploy.sh
   ```

**Checklist:**
- [ ] `deploy.sh` created (deploy all)
- [ ] `deploy-one.sh` created (deploy single)
- [ ] CI/CD updated
- [ ] Deployment tested

---

### Phase 4: Agent File Assignments (Week 3)

**Goal**: Define clear file boundaries for agent assignment.

**Steps:**

1. **Create agent assignment config:**
   ```json
   // apps/modal/.agent-assignments.json
   {
     "flux-agent": {
       "files": [
         "apps/modal/apps/flux/**"
       ],
       "exclude": [
         "apps/modal/shared/**",
         "apps/modal/apps/instantid/**",
         "apps/modal/apps/lora/**",
         "apps/modal/apps/wan2/**",
         "apps/modal/apps/seedvr2/**"
       ],
       "read-only": [
         "apps/modal/shared/**"
       ]
     },
     "instantid-agent": {
       "files": [
         "apps/modal/apps/instantid/**"
       ],
       "exclude": [
         "apps/modal/shared/**",
         "apps/modal/apps/flux/**",
         "apps/modal/apps/lora/**",
         "apps/modal/apps/wan2/**",
         "apps/modal/apps/seedvr2/**"
       ],
       "read-only": [
         "apps/modal/shared/**"
       ]
     }
     // ... repeat for each agent
   }
   ```

2. **Create orchestrator task template:**
   ```typescript
   // scripts/orchestrator/tasks/modal-flux-improvement.ts
   {
     agent: "flux-agent",
     task: "Improve Flux workflow performance",
     files: ["apps/modal/apps/flux/**"],
     successCriteria: [
       "Flux endpoint response time < 5s",
       "All Flux tests pass",
       "No TypeScript errors"
     ]
   }
   ```

**Checklist:**
- [ ] Agent assignment config created
- [ ] File boundaries defined for each agent
- [ ] Read-only shared code marked
- [ ] Orchestrator templates created

---

### Phase 5: Testing & Validation (Week 3)

**Goal**: Ensure all apps work independently.

**Steps:**

1. **Test each app independently:**
   ```bash
   # Test Flux app
   modal deploy apps/modal/apps/flux/app.py
   python apps/modal/ryla_client.py flux --prompt "test"
   
   # Test InstantID app
   modal deploy apps/modal/apps/instantid/app.py
   python apps/modal/ryla_client.py instantid --prompt "test"
   
   # ... repeat for each app
   ```

2. **Test shared code changes:**
   ```bash
   # Make change to shared/config.py
   # Verify all apps still work
   ./apps/modal/deploy.sh
   ```

3. **Test agent isolation:**
   ```bash
   # Create git worktrees for parallel execution
   git worktree add ../modal-flux apps/modal/apps/flux
   git worktree add ../modal-instantid apps/modal/apps/instantid
   
   # Agents can work in parallel without conflicts
   ```

**Checklist:**
- [ ] All apps deploy successfully
- [ ] All endpoints work
- [ ] Shared code changes don't break apps
- [ ] Git worktrees work for isolation
- [ ] No cross-app dependencies

---

### Phase 6: Documentation & Cleanup (Week 4)

**Goal**: Document new structure and remove old code.

**Steps:**

1. **Update documentation:**
   - Update `README.md` with new structure
   - Update `BEST-PRACTICES.md` with multi-agent patterns
   - Create agent assignment guide

2. **Archive old code:**
   ```bash
   # Move old single app to archive
   mkdir -p apps/modal/archive
   mv apps/modal/app.py apps/modal/archive/app.py.old
   mv apps/modal/handlers apps/modal/archive/handlers.old
   ```

3. **Update client scripts:**
   ```python
   # apps/modal/ryla_client.py
   # Update endpoint URLs for new app structure
   FLUX_ENDPOINT = "https://ryla--ryla-flux-comfyui-fastapi-app.modal.run"
   INSTANTID_ENDPOINT = "https://ryla--ryla-instantid-comfyui-fastapi-app.modal.run"
   # ... etc
   ```

**Checklist:**
- [ ] Documentation updated
- [ ] Old code archived
- [ ] Client scripts updated
- [ ] Team trained on new structure

---

## Agent Workflow Example

**Scenario**: Improve Flux workflow performance

1. **Orchestrator creates task:**
   ```json
   {
     "taskId": "modal-flux-perf-001",
     "agent": "flux-agent",
     "files": ["apps/modal/apps/flux/**"],
     "successCriteria": [
       "Response time < 5s",
       "All tests pass",
       "No TypeScript errors"
     ]
   }
   ```

2. **Flux Agent works in isolation:**
   - Opens `apps/modal/apps/flux/` files only
   - Reads `apps/modal/shared/` (read-only)
   - Makes changes to Flux-specific code
   - Deploys: `modal deploy apps/modal/apps/flux/app.py`

3. **Testing Agent validates:**
   - Runs Flux tests
   - Validates success criteria
   - Reports results

4. **No conflicts:**
   - Other agents can work on InstantID, Wan2, etc. simultaneously
   - Git worktrees provide true isolation
   - Shared code changes coordinated by orchestrator

---

## Rollback Plan

**If migration fails:**

1. **Keep old structure:**
   - Old `app.py` in `archive/`
   - Can restore if needed

2. **Gradual migration:**
   - Migrate one app at a time
   - Test thoroughly before next app

3. **Hybrid approach:**
   - Keep single app for some workflows
   - Split only workflows that need agent isolation

---

## Success Criteria

**Migration complete when:**

- [ ] All workflows split into individual apps
- [ ] Each app can be deployed independently
- [ ] Agents can work in parallel without conflicts
- [ ] Git worktrees provide true isolation
- [ ] All endpoints work correctly
- [ ] Documentation updated
- [ ] Team trained on new structure

---

## Related Documentation

- [App Organization Strategy](./APP-ORGANIZATION-STRATEGY.md)
- [Multi-Agent Orchestration System](../../../docs/initiatives/IN-027-multi-agent-orchestration-system.md)
- [Modal Best Practices](./BEST-PRACTICES.md)

---

**Last Updated**: 2026-01-27  
**Status**: Migration Plan Ready
