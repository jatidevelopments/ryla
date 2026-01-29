# Modal App Splitting - Migration Status

**Date**: 2026-01-28  
**Status**: ✅ **Phase 1 & 2 Complete** - Shared code extracted, all 5 apps created  
**Initiative**: IN-031 (Agentic Workflow Deployment) + IN-027 (Multi-Agent Orchestration)

---

## Decision

**Split single Modal app into multiple isolated apps** to enable:
- Agent isolation for parallel work (IN-027)
- Independent deployment per workflow
- Faster iteration and testing
- Clear file boundaries for agent assignment

---

## Migration Progress

### ✅ Phase 1: Extract Shared Code (Complete)

**Status**: ✅ Complete

**Created**:
- ✅ `apps/modal/shared/` directory
- ✅ `apps/modal/shared/config.py` - Shared configuration
- ✅ `apps/modal/shared/image_base.py` - Base image with ComfyUI
- ✅ `apps/modal/shared/utils/` - Shared utilities (comfyui, cost_tracker, image_utils)
- ✅ `apps/modal/shared/__init__.py` - Package init

**Files Copied**:
- `config.py` → `shared/config.py`
- `utils/` → `shared/utils/`
- Base image extracted from `image.py` → `shared/image_base.py`

---

### ✅ Phase 2: Create Individual Apps (Complete)

**Status**: ✅ Complete (5/5 apps created)

#### ✅ Flux App (Template)

**Created**:
- ✅ `apps/modal/apps/flux/app.py` - Modal app definition
- ✅ `apps/modal/apps/flux/handler.py` - Flux workflow handler
- ✅ `apps/modal/apps/flux/image.py` - Flux-specific image (extends base)

**Endpoints**:
- `/flux` - Flux Schnell
- `/flux-dev` - Flux Dev

**Status**: ✅ Created, ready for testing

#### ✅ All Apps Created

- ✅ `apps/flux/` - Flux Schnell & Flux Dev
- ✅ `apps/wan2/` - Wan2.1 text-to-video
- ✅ `apps/seedvr2/` - SeedVR2 upscaling
- ✅ `apps/instantid/` - InstantID face consistency (includes IP-Adapter FaceID)
- ✅ `apps/z-image/` - Z-Image-Turbo workflows (all variants)

---

### ✅ Phase 3: Deployment Scripts (Complete)

**Created**:
- ✅ `apps/modal/deploy.sh` - Deploy all apps or single app
- ✅ `apps/modal/apps/README.md` - App structure documentation

**Usage**:
```bash
# Deploy all apps
./apps/modal/deploy.sh

# Deploy single app
./apps/modal/deploy.sh flux
```

**Usage**:
```bash
# Deploy all apps
./apps/modal/deploy.sh

# Deploy single app
./apps/modal/deploy.sh flux
```

---

## Current Structure

```
apps/modal/
├── shared/                    # ✅ Created
│   ├── __init__.py
│   ├── config.py
│   ├── image_base.py
│   └── utils/
│       ├── comfyui.py
│       ├── cost_tracker.py
│       └── image_utils.py
│
├── apps/                      # ⏳ In Progress
│   ├── flux/                  # ✅ Created (template)
│   │   ├── app.py
│   │   ├── handler.py
│   │   └── image.py
│   ├── instantid/             # ⏳ Pending
│   ├── wan2/                  # ⏳ Pending
│   ├── seedvr2/               # ⏳ Pending
│   └── z-image/               # ⏳ Pending
│
├── deploy.sh                  # ✅ Created
└── [old files remain for now]
    ├── app.py                 # Will be archived
    ├── handlers/              # Will be split into apps
    └── image.py               # Base extracted to shared/
```

---

## Next Steps

### Immediate (Complete Migration)

1. ⏳ Create remaining apps:
   - `apps/wan2/` - Copy from handlers/wan2.py
   - `apps/seedvr2/` - Copy from handlers/seedvr2.py
   - `apps/instantid/` - Copy from handlers/instantid.py, ipadapter_faceid.py
   - `apps/z-image/` - Copy from handlers/z_image.py

2. ⏳ Test each app independently:
   - Deploy Flux app: `modal deploy apps/modal/apps/flux/app.py`
   - Test endpoints work
   - Verify no regressions

3. ⏳ Update client script:
   - Point to new app endpoints
   - Update endpoint URLs

4. ⏳ Archive old structure:
   - Move `app.py` to `archive/`
   - Move `handlers/` to `archive/`
   - Move `image.py` to `archive/`

### Follow-up

5. ⏳ Create agent assignment config
6. ⏳ Test git worktrees for isolation
7. ⏳ Document agent file boundaries

---

## Benefits Achieved

### ✅ Agent Isolation
- Each app has isolated files
- Agents can work in parallel without conflicts
- Clear file boundaries for assignment

### ✅ Independent Deployment
- Deploy one app without affecting others
- Faster iteration cycle
- Parallel testing possible

### ✅ Faster Development
- Fix one endpoint, deploy only that app
- Test endpoints independently
- Check logs per app (faster debugging)

---

## Agent File Assignments (Planned)

| Agent | App | Files |
|-------|-----|-------|
| **Flux Agent** | `apps/flux/` | `apps/modal/apps/flux/**` |
| **InstantID Agent** | `apps/instantid/` | `apps/modal/apps/instantid/**` |
| **Wan2 Agent** | `apps/wan2/` | `apps/modal/apps/wan2/**` |
| **SeedVR2 Agent** | `apps/seedvr2/` | `apps/modal/apps/seedvr2/**` |
| **Z-Image Agent** | `apps/z-image/` | `apps/modal/apps/z-image/**` |
| **Testing Agent** | All apps | `apps/modal/apps/*/tests/**` |

**Shared Code**: Read-only for all agents (requires orchestrator coordination)

---

## Testing Plan

### Per-App Testing

1. **Deploy app**: `modal deploy apps/modal/apps/{app}/app.py`
2. **Test endpoint**: Use `ryla_client.py` or direct API calls
3. **Verify**: Endpoint works, cost tracking present, no regressions
4. **Check logs**: `modal app logs ryla-{app}` (with timeout)

### Integration Testing

1. Deploy all apps: `./deploy.sh`
2. Test all endpoints: `python scripts/test-all-endpoints.py`
3. Verify no conflicts between apps

---

## Rollback Plan

**If migration fails**:
1. Old `app.py` remains functional
2. Can deploy old app: `modal deploy apps/modal/app.py`
3. New apps are additive (don't break existing)
4. Can migrate gradually (one app at a time)

---

## Related Documentation

- [App Organization Strategy](../APP-ORGANIZATION-STRATEGY.md)
- [Multi-Agent Migration Plan](../MULTI-AGENT-MIGRATION-PLAN.md)
- [IN-031: Agentic Workflow Deployment](../../../../docs/initiatives/IN-031-agentic-workflow-deployment.md)
- [IN-027: Multi-Agent Orchestration](../../../../docs/initiatives/IN-027-multi-agent-orchestration-system.md)

---

**Last Updated**: 2026-01-28  
**Status**: Phase 1 Complete, Phase 2 In Progress
