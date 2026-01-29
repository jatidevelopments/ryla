# Modal App Organization Strategy

> **Date**: 2026-01-27  
> **Status**: Best Practices Guide  
> **Purpose**: Guide for organizing Modal apps (single vs multiple) and enabling multi-developer workflows

---

## Current Architecture

**Single App Approach** (`ryla-comfyui`):
- ✅ All workflows in one Modal app
- ✅ Shared ComfyUI server instance
- ✅ Shared volumes and secrets
- ✅ Single deployment command

**Workflows**:
- Flux (Schnell, Dev)
- InstantID
- LoRA
- Wan2.1
- SeedVR2
- Generic workflow handler

---

## Single App vs Multiple Apps

### When to Use Single App (Current - Recommended)

**Use single app when:**
- ✅ Workflows share the same infrastructure (ComfyUI, models, volumes)
- ✅ Workflows have similar GPU requirements
- ✅ You want simpler deployment (`modal deploy apps/modal/app.py`)
- ✅ Workflows are developed/maintained by the same team
- ✅ You want to minimize cold start overhead

**Benefits:**
- Simpler deployment and management
- Shared container pool (better resource utilization)
- Single ComfyUI server instance (faster startup)
- Shared volumes and secrets (less duplication)
- Lower operational overhead

**Drawbacks:**
- All workflows deploy together (can't deploy one independently)
- Shared scaling configuration (though functions scale independently)
- Less isolation between workflows

### When to Use Multiple Apps

**Use multiple apps when:**
- ✅ Workflows have different GPU requirements (e.g., Flux needs L40S, LoRA needs T4)
- ✅ Workflows need independent deployment cycles
- ✅ Different teams own different workflows
- ✅ You need strict isolation (security, billing, monitoring)
- ✅ Workflows have very different resource needs

**Benefits:**
- Independent deployment (`modal deploy apps/modal/apps/flux/app.py`)
- Independent scaling configuration per app
- Better isolation and security boundaries
- Separate monitoring and billing per workflow
- Can optimize GPU per workflow

**Drawbacks:**
- More complex deployment (need to deploy multiple apps)
- Potential duplication of shared resources
- More operational overhead
- Each app has its own ComfyUI instance (more memory usage)

---

## Recommended Structure: Hybrid Approach

### Option 1: Single App with Modular Handlers (Current - Keep)

**Structure:**
```
apps/modal/
├── app.py              # Single Modal app
├── config.py           # Shared config
├── image.py            # Shared image build
├── handlers/           # One handler per workflow
│   ├── flux.py
│   ├── instantid.py
│   ├── lora.py
│   ├── wan2.py
│   └── seedvr2.py
└── utils/              # Shared utilities
```

**Deployment:**
```bash
modal deploy apps/modal/app.py
```

**When to use:** ✅ **Recommended for RYLA MVP** - All workflows share ComfyUI and resources

### Option 2: Multiple Apps with Shared Code

**Structure:**
```
apps/modal/
├── shared/                    # Shared code (imported by all apps)
│   ├── __init__.py
│   ├── config.py             # Shared config
│   ├── image.py              # Shared image build
│   └── utils/                # Shared utilities
│
├── apps/                     # Individual Modal apps
│   ├── flux/
│   │   ├── app.py           # modal.App("ryla-flux")
│   │   └── handler.py       # Flux-specific logic
│   ├── instantid/
│   │   ├── app.py           # modal.App("ryla-instantid")
│   │   └── handler.py
│   └── wan2/
│       ├── app.py           # modal.App("ryla-wan2")
│       └── handler.py
│
└── deploy.sh                 # Deploy all apps
```

**Deployment:**
```bash
# Deploy all
./deploy.sh

# Deploy specific app
modal deploy apps/modal/apps/flux/app.py
```

**When to use:** When workflows need independent deployment or different GPU configs

### Option 3: Modal Package Structure (Modal Best Practice)

**Structure:**
```
apps/modal/
├── src/
│   ├── __init__.py          # Imports all modules
│   ├── app.py               # Defines modal.App
│   ├── config.py
│   ├── image.py
│   ├── handlers/
│   │   ├── __init__.py      # Imports all handlers
│   │   ├── flux.py          # Imports app, decorates functions
│   │   ├── instantid.py
│   │   └── ...
│   └── utils/
│
└── pyproject.toml           # Python package config
```

**Deployment:**
```bash
modal deploy -m src.app
```

**When to use:** When you want Modal's recommended package structure

---

## Multi-Agent Workflow with Cursor (IN-027)

### Agent Isolation Strategy

**For IN-027 Multi-Agent Orchestration System:**

1. **File Isolation per Agent:**
   ```
   apps/modal/apps/flux/      # Flux Agent (isolated)
   apps/modal/apps/instantid/ # Integration Agent (isolated)
   apps/modal/apps/wan2/      # Backend Agent (isolated)
   ```

2. **Git Worktrees for True Isolation:**
   ```bash
   # Orchestrator creates worktrees for parallel execution
   git worktree add ../modal-flux apps/modal/apps/flux
   git worktree add ../modal-instantid apps/modal/apps/instantid
   git worktree add ../modal-wan2 apps/modal/apps/wan2
   
   # Each agent works in separate worktree (no conflicts)
   ```

3. **Agent File Assignments:**
   ```json
   {
     "flux-agent": {
       "files": ["apps/modal/apps/flux/**"],
       "exclude": ["apps/modal/shared/**", "apps/modal/apps/instantid/**"]
     },
     "instantid-agent": {
       "files": ["apps/modal/apps/instantid/**"],
       "exclude": ["apps/modal/shared/**", "apps/modal/apps/flux/**"]
     }
   }
   ```

4. **Shared Code Coordination:**
   - `shared/` directory is read-only for agents
   - Changes to `shared/` require orchestrator coordination
   - Testing agent validates all apps after shared changes

### Modal Workspace Setup

**For multi-agent system:**

1. **Use Shared Workspace:**
   ```bash
   modal workspace create ryla-team
   ```

2. **Workspace Structure:**
   ```
   Workspace: ryla-team
   ├── Apps (one per workflow)
   │   ├── ryla-flux
   │   ├── ryla-instantid
   │   ├── ryla-wan2
   │   └── ryla-seedvr2
   ├── Volumes (shared)
   │   ├── ryla-models
   │   └── hf-hub-cache
   └── Secrets (shared)
       └── huggingface
   ```

3. **Agent Coordination:**
   - Orchestrator assigns tasks to agents
   - Each agent deploys their app independently
   - Shared state files coordinate progress
   - Success criteria validated per app

### Best Practices for Multi-Developer

1. **Use Feature Branches:**
   - Each developer works on separate branch
   - Merge to main after review
   - Deploy from main branch

2. **Coordinate Deployments:**
   - Single app: One person deploys (or use CI/CD)
   - Multiple apps: Can deploy independently

3. **Shared Resources:**
   - Volumes: All developers share same volume
   - Secrets: Managed centrally
   - Models: Uploaded once, shared by all

4. **Testing:**
   - Test locally with `modal run` before deploying
   - Use staging app for integration testing
   - Production deployments from main branch only

---

## Migration Path: Single → Multiple Apps

**If you need to split later:**

### Step 1: Extract Shared Code
```bash
# Create shared directory
mkdir -p apps/modal/shared
mv apps/modal/config.py apps/modal/shared/
mv apps/modal/image.py apps/modal/shared/
mv apps/modal/utils apps/modal/shared/
```

### Step 2: Create Individual Apps
```bash
# Create app directories
mkdir -p apps/modal/apps/flux
mkdir -p apps/modal/apps/instantid
# ... etc
```

### Step 3: Update Imports
```python
# apps/modal/apps/flux/app.py
import sys
sys.path.insert(0, "/root/shared")

from shared.config import volume, hf_cache_vol
from shared.image import image
from shared.handlers.flux import setup_flux_endpoints

app = modal.App("ryla-flux")
# ... rest of app
```

### Step 4: Update Deployment
```bash
# Deploy all apps
for app in apps/modal/apps/*/; do
  modal deploy "$app/app.py"
done
```

---

## Recommendation for RYLA

### ⚠️ UPDATED: Split into Multiple Apps for Multi-Agent System

**Critical Context**: IN-027 (Multi-Agent Orchestration System) requires agents to work in isolation on files to enable parallel execution.

**New Recommendation: Split into Multiple Apps**

**Reasons:**
1. **Agent Isolation**: Each agent needs isolated files to work in parallel without conflicts
2. **Clear Code Path Assignments**: Each workflow app = clear file boundaries for agent assignment
3. **Parallel Execution**: Multiple agents can work on different workflows simultaneously
4. **Git Worktrees**: Each app can be in separate worktree for true isolation
5. **Specialized Agents**: Different agents (Backend, Integration, Testing) can work on different workflows

**Trade-offs:**
- ⚠️ Each app has its own ComfyUI instance (more memory, but enables true isolation)
- ⚠️ More deployment commands (but can be automated)
- ✅ Agents can work in parallel without file conflicts
- ✅ Better alignment with multi-agent orchestration system

### Architecture for Multi-Agent System

**Structure:**
```
apps/modal/
├── shared/                    # Shared code (minimal, well-defined)
│   ├── __init__.py
│   ├── config.py             # Shared config (read-only for agents)
│   ├── image_base.py         # Base image build (shared)
│   └── utils/                # Shared utilities (read-only)
│
├── apps/                     # Individual Modal apps (agent-isolated)
│   ├── flux/
│   │   ├── app.py           # modal.App("ryla-flux")
│   │   ├── handler.py       # Flux-specific logic
│   │   └── image.py         # Flux-specific image (extends base)
│   │   # Agent assignment: Backend Agent
│   │
│   ├── instantid/
│   │   ├── app.py           # modal.App("ryla-instantid")
│   │   ├── handler.py
│   │   └── image.py
│   │   # Agent assignment: Integration Agent
│   │
│   ├── wan2/
│   │   ├── app.py           # modal.App("ryla-wan2")
│   │   ├── handler.py
│   │   └── image.py
│   │   # Agent assignment: Backend Agent
│   │
│   └── seedvr2/
│       ├── app.py           # modal.App("ryla-seedvr2")
│       ├── handler.py
│       └── image.py
│       # Agent assignment: Integration Agent
│
└── deploy.sh                 # Deploy all apps (or specific app)
```

**Agent File Assignments:**
- **Flux Agent**: `apps/modal/apps/flux/**` (isolated)
- **InstantID Agent**: `apps/modal/apps/instantid/**` (isolated)
- **Wan2 Agent**: `apps/modal/apps/wan2/**` (isolated)
- **Testing Agent**: `apps/modal/apps/*/tests/**` (can work in parallel)
- **Shared Code Changes**: Require coordination (orchestrator manages)

### When to Keep Single App

**Keep single app only if:**
- Not using multi-agent orchestration system
- Workflows are tightly coupled and must deploy together
- Resource constraints require shared ComfyUI instance

### Multi-Agent Isolation Strategy

**For IN-027 Multi-Agent System, use multiple apps with clear file boundaries:**

```
apps/modal/
├── shared/                    # Shared code (read-only for agents)
│   ├── config.py             # Shared config
│   ├── image_base.py         # Base image build
│   └── utils/                # Shared utilities
│
├── apps/                     # Individual apps (agent-isolated)
│   ├── flux/
│   │   ├── app.py           # Isolated: Flux Agent only
│   │   ├── handler.py
│   │   └── image.py
│   ├── instantid/
│   │   ├── app.py           # Isolated: Integration Agent only
│   │   └── handler.py
│   └── ...
│
└── .agent-state/             # Multi-agent coordination (IN-027)
    ├── flux/
    │   └── task-state.json
    └── instantid/
        └── task-state.json
```

**Benefits:**
- ✅ Agents work in parallel without file conflicts
- ✅ Clear file boundaries for agent assignment
- ✅ Git worktrees can isolate each app completely
- ✅ Orchestrator can assign tasks to isolated agents
- ✅ Testing agent can test each app independently

---

## Quick Reference

### Single App (Current)
```bash
# Deploy
modal deploy apps/modal/app.py

# Test
modal run apps/modal/app.py::test_function

# Logs
modal app logs ryla-comfyui
```

### Multiple Apps (If Split)
```bash
# Deploy all
./apps/modal/deploy.sh

# Deploy one
modal deploy apps/modal/apps/flux/app.py

# Test
modal run apps/modal/apps/flux/app.py::test_function
```

### Multi-Developer Setup
```bash
# Create shared workspace
modal workspace create ryla-team

# Invite team
modal workspace invite user@example.com

# List workspaces
modal workspace list
```

---

## Related Documentation

- [Modal Best Practices](./BEST-PRACTICES.md)
- [Modal Comprehensive Guide](../../../docs/research/infrastructure/MODAL-COMPREHENSIVE-GUIDE.md)
- [Multi-Agent Orchestration System](../../../docs/initiatives/IN-027-multi-agent-orchestration-system.md) - **Critical context for file isolation**
- [Modal Project Structure](https://modal.com/docs/guide/project-structure)
- [Modal Workspaces](https://modal.com/docs/guide/workspaces)

---

## Key Takeaway

**For IN-027 Multi-Agent System: Split into multiple apps with isolated files.**

This enables:
- ✅ Agents to work in parallel without file conflicts
- ✅ Clear file boundaries for agent assignment
- ✅ Git worktrees for true isolation
- ✅ Independent deployment per workflow
- ✅ Better alignment with multi-agent orchestration

**Trade-off**: Each app has its own ComfyUI instance, but this is necessary for agent isolation.

---

**Last Updated**: 2026-01-27  
**Status**: Updated for IN-027 Multi-Agent System
