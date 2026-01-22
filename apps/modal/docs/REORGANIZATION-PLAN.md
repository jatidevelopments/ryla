# Modal App Reorganization Plan

> **Status:** Proposed  
> **Date:** January 2026  
> **Purpose:** Restructure `apps/modal/` for better maintainability and scalability

---

## Current State Analysis

### Problems Identified

1. **File Organization**
   - 28+ markdown files in root directory (documentation chaos)
   - Multiple duplicate Python files (`comfyui_danrisi.py`, `comfyui_danrisi_backup.py`, etc.)
   - Test files mixed with production code
   - No clear separation of concerns

2. **Code Structure**
   - `comfyui_ryla.py` = 1470 lines (too large)
   - All workflows, models, endpoints in one file
   - Hard to test individual components
   - Difficult to add new workflows

3. **Development Workflow**
   - Unclear where to add new models/workflows
   - No standard patterns
   - Documentation scattered

---

## Proposed Structure

### Option 1: Modular (Recommended for Long-term)

```
apps/modal/
├── README.md                    # Main entry point
├── DEPLOYMENT.md                # How to deploy
├── BEST-PRACTICES.md            # Development guidelines
│
├── src/                         # Production code
│   ├── __init__.py
│   ├── app.py                   # Main Modal app (200 lines)
│   ├── config.py                # Configuration (volumes, secrets, GPU)
│   ├── image.py                 # Image build (model downloads, custom nodes)
│   │
│   ├── models/                  # Model download functions
│   │   ├── __init__.py
│   │   ├── flux.py              # Flux models
│   │   ├── instantid.py         # InstantID models
│   │   ├── wan2.py              # Wan2.1 models
│   │   └── base.py              # Base utilities
│   │
│   ├── handlers/                # Workflow + endpoint handlers
│   │   ├── __init__.py
│   │   ├── flux.py              # Flux workflows + endpoints
│   │   ├── instantid.py          # InstantID workflows + endpoints
│   │   ├── lora.py              # LoRA workflows + endpoints
│   │   ├── wan2.py              # Wan2.1 workflows + endpoints
│   │   ├── seedvr2.py           # SeedVR2 workflows + endpoints
│   │   └── workflow.py          # Custom workflow endpoint
│   │
│   └── utils/                   # Shared utilities
│       ├── __init__.py
│       ├── cost_tracker.py      # Cost tracking
│       ├── comfyui.py           # ComfyUI server management
│       └── image_utils.py       # Image processing
│
├── tests/                       # Test files
│   ├── __init__.py
│   ├── test_flux.py
│   ├── test_instantid.py
│   └── fixtures/
│
├── scripts/                     # Utility scripts
│   ├── upload_models.py
│   └── test_performance.py
│
└── docs/                        # Documentation
    ├── deployment.md
    ├── models.md
    └── workflows.md
```

**Pros:**
- ✅ Clear separation of concerns
- ✅ Easy to find code
- ✅ Scalable structure
- ✅ Follows RYLA patterns

**Cons:**
- ⚠️ More files to manage
- ⚠️ Requires refactoring

### Option 2: Hybrid (Recommended for Migration)

```
apps/modal/
├── README.md
├── DEPLOYMENT.md
├── BEST-PRACTICES.md
│
├── app.py                       # Main entry point (300 lines)
├── config.py                    # Configuration
├── image.py                     # Image build (all model downloads)
│
├── handlers/                    # Endpoint handlers (one per workflow)
│   ├── __init__.py
│   ├── flux.py                  # Flux (400 lines)
│   ├── instantid.py             # InstantID (400 lines)
│   ├── lora.py                  # LoRA (300 lines)
│   ├── wan2.py                  # Wan2.1 (400 lines)
│   ├── seedvr2.py               # SeedVR2 (300 lines)
│   └── workflow.py              # Custom workflow (200 lines)
│
├── utils/                       # Shared utilities
│   ├── __init__.py
│   ├── cost_tracker.py
│   └── comfyui.py
│
├── tests/                       # Test files
│   └── ...
│
├── scripts/                     # Utility scripts
│   └── ...
│
└── docs/                        # Documentation
    └── ...
```

**Pros:**
- ✅ Simpler than full modular
- ✅ Still organized
- ✅ Easier migration path
- ✅ Main app stays small

**Cons:**
- ⚠️ Model downloads still in one file
- ⚠️ Less granular than Option 1

---

## Migration Steps

### Phase 1: Create Structure (No Code Changes)

1. Create new directories:
   ```bash
   mkdir -p apps/modal/{handlers,utils,tests,scripts,docs}
   ```

2. Move utilities:
   ```bash
   mv apps/modal/cost_tracker.py apps/modal/utils/
   ```

3. Organize documentation:
   ```bash
   mkdir -p apps/modal/docs/{deployment,models,workflows}
   # Move relevant .md files
   ```

### Phase 2: Extract Handlers (Incremental)

1. Extract Flux handler:
   - Create `handlers/flux.py`
   - Move `_flux_impl` and `_flux_dev_impl` methods
   - Update imports in `app.py`

2. Extract InstantID handler:
   - Create `handlers/instantid.py`
   - Move `_flux_instantid_impl` method
   - Update imports

3. Continue for other handlers...

### Phase 3: Extract Image Build

1. Create `image.py`:
   - Move all model download functions
   - Move custom node installation
   - Keep image definition

2. Update `app.py`:
   - Import from `image.py`
   - Keep app definition simple

### Phase 4: Clean Up

1. Archive old files:
   ```bash
   mkdir -p apps/modal/archive
   mv apps/modal/comfyui_danrisi*.py apps/modal/archive/
   mv apps/modal/*_test.py apps/modal/tests/
   ```

2. Consolidate documentation:
   - Merge duplicate docs
   - Remove outdated files
   - Create index in `docs/README.md`

---

## Implementation Plan

### Week 1: Structure Setup

- [ ] Create directory structure
- [ ] Move utilities to `utils/`
- [ ] Organize documentation
- [ ] Create `BEST-PRACTICES.md`

### Week 2: Extract Handlers

- [ ] Extract Flux handler
- [ ] Extract InstantID handler
- [ ] Extract LoRA handler
- [ ] Extract Wan2 handler
- [ ] Extract SeedVR2 handler

### Week 3: Extract Image Build

- [ ] Create `image.py`
- [ ] Move model downloads
- [ ] Move custom node installation
- [ ] Update imports

### Week 4: Clean Up & Test

- [ ] Archive old files
- [ ] Consolidate documentation
- [ ] Test all endpoints
- [ ] Update deployment docs

---

## Decision: Single vs Multi-File

### Recommendation: **Hybrid Approach**

**Keep together:**
- Model downloads (in `image.py`) - related to image build
- Workflow + endpoint logic (in `handlers/`) - self-contained units

**Split out:**
- Utilities (cost tracking, ComfyUI management)
- Configuration (volumes, secrets, GPU)
- Tests

**Benefits:**
- ✅ Main app file stays small (~300 lines)
- ✅ Each handler is self-contained (~300-400 lines)
- ✅ Easy to add new workflows
- ✅ Still simple deployment

---

## File Size Targets

| File Type | Target | Max |
|-----------|--------|-----|
| Main app (`app.py`) | < 200 lines | 300 lines |
| Handler files | < 400 lines | 500 lines |
| Utility files | < 200 lines | 300 lines |
| Model download functions | < 100 lines | 150 lines |

---

## Next Steps

1. **Review this plan** - Get feedback on structure
2. **Choose approach** - Option 1 (Modular) or Option 2 (Hybrid)
3. **Start Phase 1** - Create structure, no code changes
4. **Incremental migration** - Extract handlers one at a time
5. **Test thoroughly** - Ensure no regressions

---

## Questions to Answer

1. **Single file or multi-file?**
   - Recommendation: Hybrid (Option 2)

2. **Where to put model downloads?**
   - Recommendation: `image.py` (related to image build)

3. **How to organize handlers?**
   - Recommendation: One file per workflow type

4. **Documentation location?**
   - Recommendation: `docs/` subdirectory

5. **Test file location?**
   - Recommendation: `tests/` directory

---

## Related Documents

- [Best Practices](./BEST-PRACTICES.md)
- [Cost Tracking](./COST-TRACKING.md)
- [Architecture Decision](../../docs/decisions/ADR-007-modal-over-runpod.md)
