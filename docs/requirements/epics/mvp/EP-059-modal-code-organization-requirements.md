# EP-059: Modal.com Code Organization & Best Practices - Requirements

**Initiative**: [IN-023](../../../initiatives/IN-023-modal-code-organization.md)  
**Status**: P8 - Integration  
**Created**: 2026-01-21  
**Last Updated**: 2026-01-21

---

## Problem Statement

The Modal.com codebase (`apps/modal/`) has grown organically and is now difficult to maintain. The current structure has a single 1470-line file containing all workflows, models, endpoints, and utilities, 28+ markdown files scattered in the root directory, and no clear patterns for adding new models or workflows. This creates development friction, increases maintenance burden, and blocks rapid feature development.

**Who has this problem**: 
- Infrastructure team needs maintainable, scalable codebase
- Developers need clear patterns for adding new models/workflows
- AI agents need structured codebase for automated development

**Why it matters**: 
- Blocks rapid feature development (hard to add new workflows)
- Increases development time (finding code, understanding structure)
- Reduces code quality (difficult to test, review, refactor)
- Creates technical debt that compounds over time

---

## MVP Objective

Restructure the Modal.com codebase into a maintainable, scalable architecture with clear patterns, organized documentation, and standardized development workflows. The new structure should enable developers to add new models/workflows in <2 hours (vs current 4+ hours) and reduce code review time by 50%.

**Measurable outcomes**:
- Main app file reduced from 1470 lines to <300 lines
- Handler files organized (one per workflow type, <500 lines each)
- Documentation consolidated and organized in `docs/` subdirectory
- Best practices document created and maintained
- All existing endpoints continue working (100% backward compatibility)
- New workflow can be added in <2 hours using documented patterns

---

## Non-Goals

**Explicitly out of scope for this epic**:
- Rewriting existing workflows (only reorganizing)
- Changing API contracts or endpoints
- Performance optimization (separate work)
- Adding new features (only restructuring)
- Frontend changes (backend-only work)
- Model deployment changes (only code organization)

---

## Business Metric

**Target Metrics**:
- [x] **E - CAC**: Reduces development time (30% faster to add workflows)
- [x] **C - Core Value**: Enables faster feature delivery
- [ ] **B - Retention**: Improves code quality and reliability (indirect)

**Primary Metric**: **E - CAC**

---

## Hypothesis

When we restructure the Modal.com codebase with clear patterns and organized structure, we will reduce development time for adding new workflows by 30%, measured by:
- Time to add new workflow: <2 hours (vs current 4+ hours)
- Code review time: 50% reduction
- Developer onboarding time: 50% reduction
- All existing functionality: 100% working

This validates that organized codebase structure improves development velocity and reduces technical debt.

---

## Success Criteria

### Technical Success

- [ ] Main app file (`app.py`) < 300 lines
- [ ] Handler files < 500 lines each
- [ ] All documentation organized in `docs/` subdirectory
- [ ] Best practices document complete and maintained
- [ ] All existing endpoints working (100% pass rate)
- [ ] New workflow can be added using documented patterns
- [ ] Test files organized in `tests/` directory
- [ ] Old/duplicate files archived

### Development Velocity Success

- [ ] Time to add new workflow: <2 hours (measured)
- [ ] Code review time: 50% reduction (measured)
- [ ] Developer onboarding: 50% reduction (measured)
- [ ] Clear patterns documented for all common tasks

### Code Quality Success

- [ ] All handlers follow same pattern
- [ ] All model downloads follow same pattern
- [ ] All endpoints follow same pattern
- [ ] Test coverage maintained or improved
- [ ] No regressions introduced

---

## Constraints

### Technical Constraints

- **Must maintain**: All existing functionality working
- **Must preserve**: Deployment process (`modal deploy apps/modal/app.py`)
- **Must support**: All current workflows (Flux, InstantID, LoRA, Wan2, SeedVR2)
- **Must document**: All patterns and best practices

### Timeline Constraints

- **Target completion**: 4 weeks
- **Incremental migration**: No big bang, must be incremental
- **No downtime**: All endpoints must remain working during migration

### Resource Constraints

- **Team**: 1-2 developers
- **Budget**: Development time only (no external costs)

---

## Dependencies

### Required Inputs

- [x] EP-058 (Modal MVP Models) completed - models working
- [x] Current codebase functional - all endpoints working
- [x] Best practices documented - `BEST-PRACTICES.md` created
- [x] Reorganization plan documented - `REORGANIZATION-PLAN.md` created

### Blocks

- **Blocks**: Future Modal workflow additions (needs structure first)
- **Blocked By**: None

### Related Work

- **Initiative**: IN-023 (Modal Code Organization)
- **Related Epics**: EP-058 (Modal MVP Models)
- **Related Initiatives**: IN-020 (Modal MVP Models), IN-015 (ComfyUI Workflow API Alternatives)

---

## Acceptance Criteria

### AC1: Directory Structure Created

- [ ] `handlers/` directory created with handler files
- [ ] `utils/` directory created with utility files
- [ ] `tests/` directory created with test files
- [ ] `docs/` directory created with documentation
- [ ] `scripts/` directory created with utility scripts

**Definition of Done**: All directories exist, files moved to appropriate locations

### AC2: Main App File Refactored

- [ ] `app.py` created (main entry point)
- [ ] `app.py` < 300 lines
- [ ] All handlers imported from `handlers/` directory
- [ ] Configuration extracted to `config.py`
- [ ] Image build extracted to `image.py`

**Definition of Done**: Main app file is small and readable, all functionality preserved

### AC3: Handlers Extracted

- [ ] Flux handler extracted to `handlers/flux.py`
- [ ] InstantID handler extracted to `handlers/instantid.py`
- [ ] LoRA handler extracted to `handlers/lora.py`
- [ ] Wan2 handler extracted to `handlers/wan2.py`
- [ ] SeedVR2 handler extracted to `handlers/seedvr2.py`
- [ ] Custom workflow handler extracted to `handlers/workflow.py`
- [ ] Each handler < 500 lines

**Definition of Done**: All handlers extracted, all endpoints working

### AC4: Image Build Extracted

- [ ] `image.py` created with all model downloads
- [ ] All custom node installation in `image.py`
- [ ] Model download functions organized
- [ ] Image build logic clear and maintainable

**Definition of Done**: Image build is organized and maintainable

### AC5: Documentation Organized

- [ ] All markdown files moved to `docs/` subdirectory
- [ ] Documentation organized by topic (deployment, models, workflows)
- [ ] Duplicate/outdated documentation removed
- [ ] `BEST-PRACTICES.md` maintained and up-to-date
- [ ] `README.md` updated with new structure

**Definition of Done**: Documentation is organized and findable

### AC6: Best Practices Documented

- [ ] Model deployment patterns documented
- [ ] Workflow creation patterns documented
- [ ] Endpoint creation patterns documented
- [ ] Testing patterns documented
- [ ] Development workflow documented

**Definition of Done**: All patterns documented with examples

### AC7: All Endpoints Working

- [ ] `/flux` endpoint working
- [ ] `/flux-dev` endpoint working
- [ ] `/flux-instantid` endpoint working
- [ ] `/flux-lora` endpoint working
- [ ] `/wan2` endpoint working
- [ ] `/workflow` endpoint working
- [ ] `/seedvr2` endpoint working (if applicable)
- [ ] All endpoints tested end-to-end

**Definition of Done**: 100% of endpoints working, all tests passing

### AC8: Old Files Archived

- [ ] Duplicate files moved to `archive/` directory
- [ ] Test files moved to `tests/` directory
- [ ] Backup files removed or archived
- [ ] Root directory clean (only essential files)

**Definition of Done**: Root directory is clean and organized

### AC9: Development Patterns Established

- [ ] Pattern for adding new model documented
- [ ] Pattern for adding new workflow documented
- [ ] Pattern for adding new endpoint documented
- [ ] Example workflow added using new patterns
- [ ] Time to add workflow: <2 hours (measured)

**Definition of Done**: Clear patterns established, validated with example

### AC10: Team Training Complete

- [ ] Documentation reviewed by team
- [ ] Best practices shared with team
- [ ] New structure explained to team
- [ ] Team can add workflows using new patterns

**Definition of Done**: Team trained and comfortable with new structure

---

## Analytics Acceptance Criteria

### Events to Track

- **Development Metrics** (internal):
  - Time to add new workflow (measured)
  - Code review time (measured)
  - Developer onboarding time (measured)

### Funnel Definitions

N/A (internal development work, no user-facing funnels)

---

## Non-MVP Items

**Explicitly deferred to future work**:
- Performance optimization
- Adding new features
- Changing API contracts
- Frontend integration
- Model deployment optimization
- Advanced testing strategies

---

## Related Documentation

- [Initiative IN-023](../../../initiatives/IN-023-modal-code-organization.md)
- [Best Practices Guide](../../../../apps/modal/BEST-PRACTICES.md)
- [Reorganization Plan](../../../../apps/modal/REORGANIZATION-PLAN.md)
- [Architecture Decision: Modal over RunPod](../../../decisions/ADR-007-modal-over-runpod.md)

---

**Related Documents**:
- [P2 Scoping](./EP-059-modal-code-organization-scoping.md) - Story breakdown and task list
- [P3 Architecture](./../../architecture/epics/EP-059-modal-code-organization-architecture.md) - File structure and module design
- [P5 Technical Spec](./../../specs/epics/EP-059-modal-code-organization-tech-spec.md) - Detailed file plan and migration strategy

**Next Phase**: P6 - Implementation (execute reorganization incrementally)
