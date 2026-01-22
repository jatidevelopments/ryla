# EP-059: Modal.com Code Organization - Scoping

**Initiative**: [IN-023](../../../initiatives/IN-023-modal-code-organization.md)  
**Epic**: [EP-059 Requirements](./EP-059-modal-code-organization-requirements.md)  
**Status**: P6 - Implementation (In Progress)  
**Created**: 2026-01-21  
**Last Updated**: 2026-01-21

---

## Story Breakdown

### ST-001: Create Directory Structure

**Story**: Create organized directory structure for Modal codebase

**Acceptance Criteria**:
- [ ] `handlers/` directory created
- [ ] `utils/` directory created
- [ ] `tests/` directory created
- [ ] `docs/` subdirectory created
- [ ] `scripts/` directory created
- [ ] `archive/` directory created (for old files)
- [ ] All directories have `__init__.py` files (for Python packages)
- [ ] Directory structure documented in `README.md`

**Estimated Effort**: 1 hour

**Dependencies**: None (can start immediately)

---

### ST-002: Extract Utilities

**Story**: Move utility files to `utils/` directory

**Acceptance Criteria**:
- [ ] `cost_tracker.py` moved to `utils/cost_tracker.py`
- [ ] ComfyUI management utilities extracted to `utils/comfyui.py`
- [ ] Image processing utilities extracted to `utils/image_utils.py` (if needed)
- [ ] All imports updated in main app
- [ ] All utilities tested and working
- [ ] Utilities documented

**Estimated Effort**: 2 hours

**Dependencies**: ST-001 (directory structure)

---

### ST-003: Extract Flux Handler

**Story**: Extract Flux workflows and endpoints to `handlers/flux.py`

**Acceptance Criteria**:
- [ ] `_flux_impl` method extracted to `handlers/flux.py`
- [ ] `_flux_dev_impl` method extracted to `handlers/flux.py`
- [ ] Handler file < 500 lines
- [ ] Handler follows standard pattern (workflow + endpoint)
- [ ] Cost tracking integrated
- [ ] All imports updated in main app
- [ ] `/flux` endpoint tested and working
- [ ] `/flux-dev` endpoint tested and working
- [ ] Handler documented with examples

**Estimated Effort**: 3 hours

**Dependencies**: ST-001, ST-002 (structure and utilities)

---

### ST-004: Extract InstantID Handler

**Story**: Extract InstantID workflow and endpoint to `handlers/instantid.py`

**Acceptance Criteria**:
- [ ] `_flux_instantid_impl` method extracted to `handlers/instantid.py`
- [ ] Handler file < 500 lines
- [ ] Handler follows standard pattern
- [ ] Cost tracking integrated
- [ ] All imports updated in main app
- [ ] `/flux-instantid` endpoint tested and working
- [ ] Handler documented with examples

**Estimated Effort**: 2 hours

**Dependencies**: ST-001, ST-002, ST-003 (structure, utilities, pattern established)

---

### ST-005: Extract LoRA Handler

**Story**: Extract LoRA workflow and endpoint to `handlers/lora.py`

**Acceptance Criteria**:
- [ ] `_flux_lora_impl` method extracted to `handlers/lora.py`
- [ ] Handler file < 500 lines
- [ ] Handler follows standard pattern
- [ ] Cost tracking integrated
- [ ] All imports updated in main app
- [ ] `/flux-lora` endpoint tested and working
- [ ] Handler documented with examples

**Estimated Effort**: 2 hours

**Dependencies**: ST-001, ST-002, ST-003 (structure, utilities, pattern established)

---

### ST-006: Extract Wan2 Handler

**Story**: Extract Wan2.1 workflow and endpoint to `handlers/wan2.py`

**Acceptance Criteria**:
- [ ] `_wan2_impl` method extracted to `handlers/wan2.py`
- [ ] Handler file < 500 lines
- [ ] Handler follows standard pattern
- [ ] Cost tracking integrated
- [ ] All imports updated in main app
- [ ] `/wan2` endpoint tested and working
- [ ] Handler documented with examples

**Estimated Effort**: 2 hours

**Dependencies**: ST-001, ST-002, ST-003 (structure, utilities, pattern established)

---

### ST-007: Extract SeedVR2 Handler

**Story**: Extract SeedVR2 workflow and endpoint to `handlers/seedvr2.py`

**Acceptance Criteria**:
- [ ] `_seedvr2_impl` method extracted to `handlers/seedvr2.py`
- [ ] Handler file < 500 lines
- [ ] Handler follows standard pattern
- [ ] Cost tracking integrated
- [ ] All imports updated in main app
- [ ] `/seedvr2` endpoint tested and working (if applicable)
- [ ] Handler documented with examples

**Estimated Effort**: 2 hours

**Dependencies**: ST-001, ST-002, ST-003 (structure, utilities, pattern established)

---

### ST-008: Extract Custom Workflow Handler

**Story**: Extract custom workflow endpoint to `handlers/workflow.py`

**Acceptance Criteria**:
- [ ] `_workflow_impl` method extracted to `handlers/workflow.py`
- [ ] Handler file < 500 lines
- [ ] Handler follows standard pattern
- [ ] Cost tracking integrated
- [ ] All imports updated in main app
- [ ] `/workflow` endpoint tested and working
- [ ] Handler documented with examples

**Estimated Effort**: 2 hours

**Dependencies**: ST-001, ST-002, ST-003 (structure, utilities, pattern established)

---

### ST-009: Extract Image Build Logic

**Story**: Extract model downloads and custom node installation to `image.py`

**Acceptance Criteria**:
- [ ] `image.py` created with image build logic
- [ ] All model download functions moved to `image.py`
- [ ] All custom node installation moved to `image.py`
- [ ] Image build logic organized and clear
- [ ] All model downloads documented
- [ ] Image build tested (deployment works)
- [ ] `image.py` < 600 lines (reasonable for all model downloads)

**Estimated Effort**: 4 hours

**Dependencies**: ST-001 (directory structure)

---

### ST-010: Extract Configuration

**Story**: Extract configuration (volumes, secrets, GPU) to `config.py`

**Acceptance Criteria**:
- [ ] `config.py` created with configuration
- [ ] Volume definitions moved to `config.py`
- [ ] Secret definitions moved to `config.py`
- [ ] GPU configuration moved to `config.py`
- [ ] Configuration documented
- [ ] All imports updated in main app
- [ ] Configuration tested (deployment works)

**Estimated Effort**: 1 hour

**Dependencies**: ST-001 (directory structure)

---

### ST-011: Refactor Main App File

**Story**: Create clean `app.py` that imports from handlers and config

**Acceptance Criteria**:
- [ ] `app.py` created (main entry point)
- [ ] `app.py` < 300 lines
- [ ] All handlers imported from `handlers/` directory
- [ ] Configuration imported from `config.py`
- [ ] Image imported from `image.py`
- [ ] FastAPI app setup clean and readable
- [ ] All endpoints registered correctly
- [ ] Deployment works: `modal deploy apps/modal/app.py`

**Estimated Effort**: 3 hours

**Dependencies**: ST-003 through ST-010 (all handlers and config extracted)

---

### ST-012: Organize Documentation

**Story**: Move all markdown files to `docs/` subdirectory and organize

**Acceptance Criteria**:
- [ ] All markdown files moved to `docs/` subdirectory
- [ ] Documentation organized by topic:
  - `docs/deployment.md` - Deployment guide
  - `docs/models.md` - Model documentation
  - `docs/workflows.md` - Workflow documentation
  - `docs/troubleshooting.md` - Troubleshooting guide
- [ ] Duplicate/outdated documentation removed
- [ ] `README.md` updated with new structure
- [ ] `docs/README.md` created with documentation index
- [ ] All documentation links updated

**Estimated Effort**: 3 hours

**Dependencies**: ST-001 (directory structure)

---

### ST-013: Archive Old Files

**Story**: Move old/duplicate files to `archive/` directory

**Acceptance Criteria**:
- [ ] `comfyui_danrisi*.py` files moved to `archive/`
- [ ] `comfyui_z_image_turbo.py` moved to `archive/` (if not needed)
- [ ] Backup files (`*_backup.py`) moved to `archive/`
- [ ] Test files moved to `tests/` directory
- [ ] Root directory clean (only essential files)
- [ ] Archive documented (what's archived and why)

**Estimated Effort**: 1 hour

**Dependencies**: ST-001 (directory structure), ST-003 through ST-011 (handlers extracted)

---

### ST-014: Update Best Practices Document

**Story**: Ensure `BEST-PRACTICES.md` is complete and reflects new structure

**Acceptance Criteria**:
- [ ] Best practices document updated with new structure
- [ ] Model deployment patterns documented with examples
- [ ] Workflow creation patterns documented with examples
- [ ] Endpoint creation patterns documented with examples
- [ ] Testing patterns documented
- [ ] Development workflow documented
- [ ] All patterns validated with actual code examples

**Estimated Effort**: 2 hours

**Dependencies**: ST-003 through ST-011 (handlers extracted, patterns established)

---

### ST-015: Update Client Script

**Story**: Update `ryla_client.py` to work with new structure

**Acceptance Criteria**:
- [ ] Client script updated if needed (should work as-is)
- [ ] Client script tested with all endpoints
- [ ] Client script documented
- [ ] Cost tracking display working in client

**Estimated Effort**: 1 hour

**Dependencies**: ST-003 through ST-011 (all handlers extracted)

---

### ST-016: Comprehensive Testing

**Story**: Test all endpoints after reorganization

**Acceptance Criteria**:
- [ ] All endpoints tested end-to-end
- [ ] `/flux` endpoint tested
- [ ] `/flux-dev` endpoint tested
- [ ] `/flux-instantid` endpoint tested
- [ ] `/flux-lora` endpoint tested
- [ ] `/wan2` endpoint tested
- [ ] `/workflow` endpoint tested
- [ ] `/seedvr2` endpoint tested (if applicable)
- [ ] All tests passing
- [ ] Cost tracking verified in all endpoints
- [ ] No regressions introduced

**Estimated Effort**: 4 hours

**Dependencies**: ST-003 through ST-015 (all handlers extracted and working)

---

### ST-017: Update Deployment Documentation

**Story**: Update deployment docs to reflect new structure

**Acceptance Criteria**:
- [ ] `DEPLOYMENT.md` updated with new structure
- [ ] Deployment command documented: `modal deploy apps/modal/app.py`
- [ ] Deployment process tested
- [ ] Troubleshooting guide updated
- [ ] Quick start guide updated

**Estimated Effort**: 2 hours

**Dependencies**: ST-011 (main app refactored), ST-012 (documentation organized)

---

### ST-018: Create Example Workflow

**Story**: Add a new simple workflow using new patterns to validate structure

**Acceptance Criteria**:
- [ ] New simple workflow added using documented patterns
- [ ] Time to add workflow: <2 hours (measured)
- [ ] Workflow follows all patterns
- [ ] Workflow tested and working
- [ ] Example documented in best practices

**Estimated Effort**: 2 hours (including measurement)

**Dependencies**: ST-003 through ST-014 (all patterns established)

---

## Story Summary

| Story ID | Name | Effort | Dependencies |
|----------|------|--------|---------------|
| ST-001 | Create Directory Structure | 1h | None |
| ST-002 | Extract Utilities | 2h | ST-001 |
| ST-003 | Extract Flux Handler | 3h | ST-001, ST-002 |
| ST-004 | Extract InstantID Handler | 2h | ST-001, ST-002, ST-003 |
| ST-005 | Extract LoRA Handler | 2h | ST-001, ST-002, ST-003 |
| ST-006 | Extract Wan2 Handler | 2h | ST-001, ST-002, ST-003 |
| ST-007 | Extract SeedVR2 Handler | 2h | ST-001, ST-002, ST-003 |
| ST-008 | Extract Custom Workflow Handler | 2h | ST-001, ST-002, ST-003 |
| ST-009 | Extract Image Build Logic | 4h | ST-001 |
| ST-010 | Extract Configuration | 1h | ST-001 |
| ST-011 | Refactor Main App File | 3h | ST-003 through ST-010 |
| ST-012 | Organize Documentation | 3h | ST-001 |
| ST-013 | Archive Old Files | 1h | ST-001, ST-003 through ST-011 |
| ST-014 | Update Best Practices Document | 2h | ST-003 through ST-011 |
| ST-015 | Update Client Script | 1h | ST-003 through ST-011 |
| ST-016 | Comprehensive Testing | 4h | ST-003 through ST-015 |
| ST-017 | Update Deployment Documentation | 2h | ST-011, ST-012 |
| ST-018 | Create Example Workflow | 2h | ST-003 through ST-014 |

**Total Estimated Effort**: 38 hours (~1 week for 1 developer, ~0.5 weeks for 2 developers)

---

## Implementation Order

### Phase 1: Foundation (Week 1, Days 1-2)
1. ST-001: Create Directory Structure
2. ST-002: Extract Utilities
3. ST-010: Extract Configuration
4. ST-009: Extract Image Build Logic

### Phase 2: Extract Handlers (Week 1, Days 3-5)
5. ST-003: Extract Flux Handler (establish pattern)
6. ST-004: Extract InstantID Handler
7. ST-005: Extract LoRA Handler
8. ST-006: Extract Wan2 Handler
9. ST-007: Extract SeedVR2 Handler
10. ST-008: Extract Custom Workflow Handler

### Phase 3: Main App & Documentation (Week 2, Days 1-2)
11. ST-011: Refactor Main App File
12. ST-012: Organize Documentation
13. ST-014: Update Best Practices Document

### Phase 4: Clean Up & Testing (Week 2, Days 3-5)
14. ST-013: Archive Old Files
15. ST-015: Update Client Script
16. ST-016: Comprehensive Testing
17. ST-017: Update Deployment Documentation
18. ST-018: Create Example Workflow

---

## Task Breakdown

### TSK-001: Create Directory Structure
- Create `handlers/` directory
- Create `utils/` directory
- Create `tests/` directory
- Create `docs/` subdirectory
- Create `scripts/` directory
- Create `archive/` directory
- Add `__init__.py` files
- Update `README.md`

### TSK-002: Move Cost Tracker
- Move `cost_tracker.py` to `utils/`
- Update imports in main app
- Test cost tracking still works

### TSK-003: Extract ComfyUI Utilities
- Create `utils/comfyui.py`
- Extract ComfyUI server management
- Update imports
- Test utilities

### TSK-004: Extract Flux Handler
- Create `handlers/flux.py`
- Move `_flux_impl` method
- Move `_flux_dev_impl` method
- Update imports in main app
- Test `/flux` endpoint
- Test `/flux-dev` endpoint

### TSK-005: Extract InstantID Handler
- Create `handlers/instantid.py`
- Move `_flux_instantid_impl` method
- Update imports
- Test `/flux-instantid` endpoint

### TSK-006: Extract LoRA Handler
- Create `handlers/lora.py`
- Move `_flux_lora_impl` method
- Update imports
- Test `/flux-lora` endpoint

### TSK-007: Extract Wan2 Handler
- Create `handlers/wan2.py`
- Move `_wan2_impl` method
- Update imports
- Test `/wan2` endpoint

### TSK-008: Extract SeedVR2 Handler
- Create `handlers/seedvr2.py`
- Move `_seedvr2_impl` method
- Update imports
- Test `/seedvr2` endpoint

### TSK-009: Extract Workflow Handler
- Create `handlers/workflow.py`
- Move `_workflow_impl` method
- Update imports
- Test `/workflow` endpoint

### TSK-010: Extract Image Build
- Create `image.py`
- Move all model download functions
- Move custom node installation
- Update imports
- Test image build

### TSK-011: Extract Configuration
- Create `config.py`
- Move volume definitions
- Move secret definitions
- Move GPU configuration
- Update imports

### TSK-012: Refactor Main App
- Create `app.py`
- Import from handlers
- Import from config
- Import from image
- Set up FastAPI app
- Register all endpoints
- Test deployment

### TSK-013: Organize Documentation
- Move markdown files to `docs/`
- Organize by topic
- Remove duplicates
- Update links
- Create docs index

### TSK-014: Archive Old Files
- Move duplicate files to `archive/`
- Move test files to `tests/`
- Clean root directory
- Document archive

### TSK-015: Update Best Practices
- Update with new structure
- Add code examples
- Validate patterns
- Document workflows

### TSK-016: Test All Endpoints
- Test each endpoint
- Verify cost tracking
- Check for regressions
- Document test results

### TSK-017: Update Deployment Docs
- Update deployment guide
- Update troubleshooting
- Update quick start
- Test deployment process

### TSK-018: Create Example Workflow
- Add simple workflow
- Measure time taken
- Document example
- Validate patterns

---

## Analytics Acceptance Criteria

### Development Metrics (Internal Tracking)

**Events to Track**:
- Time to add new workflow (measured in hours)
- Code review time (measured in hours)
- Developer onboarding time (measured in hours)

**Measurement Method**:
- Time tracking during ST-018 (Create Example Workflow)
- Before/after comparison for code review time
- Before/after comparison for onboarding time

**Success Criteria**:
- Time to add workflow: <2 hours (vs current 4+ hours)
- Code review time: 50% reduction
- Developer onboarding: 50% reduction

---

## Non-MVP Items

**Explicitly deferred**:
- Performance optimization
- Adding new features
- Changing API contracts
- Advanced testing strategies
- CI/CD improvements
- Monitoring/observability improvements

---

## Dependencies

### External Dependencies
- None (all work is internal code reorganization)

### Internal Dependencies
- EP-058 (Modal MVP Models) must be completed (models working)
- Current codebase must be functional (all endpoints working)

### Blocking
- **Blocks**: Future Modal workflow additions (needs structure first)
- **Blocked By**: None

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Breaking existing functionality | Incremental migration, comprehensive testing after each step |
| Import errors | Test imports after each extraction |
| Deployment failures | Test deployment after main app refactor |
| Lost functionality | Keep old files in archive until migration complete |

---

## Next Phase

**P3: Architecture** - Design detailed file structure, module boundaries, import patterns, and handler architecture.

---

**Status**: P2 - Scoping Complete  
**Next**: P3 - Architecture
