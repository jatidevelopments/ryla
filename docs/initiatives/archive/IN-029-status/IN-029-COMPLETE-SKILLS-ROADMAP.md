# IN-029: Complete Skills Roadmap

**Created**: 2026-01-27  
**Status**: Complete Plan  
**Total Skills**: 18 Skills

---

## Overview

This document provides the complete roadmap for all Skills needed in RYLA, organized by category and priority.

**Skills Breakdown:**
- **10 Skills** from Rules/Docs migration
- **8 Skills** domain-specific to RYLA

---

## Skills by Category

### Development Workflows (6 Skills)

| Skill | Source | Priority | Status |
|-------|--------|----------|--------|
| `epic-implementation/` | `task-execution.mdc` | High | To Migrate |
| `db-migration/` | `db-migrations.mdc` | High | To Migrate |
| `test-generation/` | New | Medium | To Create |
| `api-endpoint-creation/` | New | Medium | To Create |
| `component-creation/` | New | Medium | To Create |
| `ci-cd-workflow/` | `AUTOMATED-COMMIT-SOP.md` | Medium | To Create |

**Purpose:** Core development workflows that apply to any feature development.

---

### MCP Tool Usage (4 Skills)

| Skill | Source | Priority | Status |
|-------|--------|----------|--------|
| `mcp-ryla-api/` | `mcp-ryla-api.mdc` | High | To Migrate |
| `mcp-snyk/` | `mcp-snyk.mdc` | Medium | To Migrate |
| `mcp-cloudflare/` | `mcp-cloudflare.mdc` + ops doc | High | To Migrate |
| `mcp-modal/` | `mcp-modal.mdc` | Medium | To Migrate |

**Purpose:** Tool-specific workflows for MCP server usage.

---

### Domain-Specific Workflows (3 Skills)

| Skill | Source | Priority | Status |
|-------|--------|----------|--------|
| `character-creation/` | Codebase analysis | High | To Create |
| `image-generation/` | Codebase analysis | High | To Create |
| `comfyui-workflow/` | Codebase analysis | Medium | To Create |

**Purpose:** RYLA-specific workflows for core product features.

---

### Infrastructure Setup (5 Skills)

| Skill | Source | Priority | Status |
|-------|--------|----------|--------|
| `deployment-fly-io/` | Codebase analysis | High | To Create |
| `infisical-setup/` | Codebase analysis | Medium | To Create |
| `runpod-setup/` | Codebase analysis | Low | To Create |
| `analytics-integration/` | Codebase analysis | Medium | To Create |
| `testing-setup/` | Codebase analysis | Low | To Create |

**Purpose:** Infrastructure and setup workflows.

---

## Implementation Timeline

### Week 1: Migration + High-Priority Domain Skills

**Days 1-4: Migration Skills**
- Day 1: Setup & `epic-implementation/`
- Day 2: `db-migration/` & `mcp-ryla-api/`
- Day 3: `mcp-snyk/` & `mcp-cloudflare/`
- Day 4: `mcp-modal/` & rules cleanup

**Days 5-7: High-Priority Domain Skills**
- Day 5: `character-creation/`
- Day 6: `image-generation/`
- Day 7: `deployment-fly-io/`

**Deliverable:** 10 Skills complete (6 migration + 3 domain + 1 infrastructure)

---

### Week 2: Medium-Priority Skills

**Days 8-10: Development Workflows**
- Day 8: `test-generation/`
- Day 9: `api-endpoint-creation/` & `component-creation/`
- Day 10: `ci-cd-workflow/`

**Days 11-12: Infrastructure & Domain**
- Day 11: `infisical-setup/` & `comfyui-workflow/`
- Day 12: `analytics-integration/`

**Deliverable:** 6 more Skills complete (total: 16 Skills)

---

### Week 3: Low-Priority Skills + Testing

**Days 13-14: Low-Priority Skills**
- Day 13: `runpod-setup/`
- Day 14: `testing-setup/`

**Days 15-17: Testing & Documentation**
- Day 15: Multi-agent integration testing
- Day 16: Documentation updates
- Day 17: Final verification & completion

**Deliverable:** All 18 Skills complete + tested

---

## Skills Discovery Matrix

### By Agent Type (IN-027 Multi-Agent System)

| Agent Type | Primary Skills | Secondary Skills |
|------------|----------------|------------------|
| **Frontend Agent** | `component-creation/`, `character-creation/` | `test-generation/`, `analytics-integration/` |
| **Backend Agent** | `api-endpoint-creation/`, `image-generation/` | `db-migration/`, `test-generation/` |
| **Testing Agent** | `test-generation/`, `testing-setup/` | `analytics-integration/` |
| **Infrastructure Agent** | `deployment-fly-io/`, `infisical-setup/` | `runpod-setup/`, `mcp-cloudflare/` |
| **Architecture Agent** | `epic-implementation/`, `db-migration/` | All Skills (orchestration) |
| **Integration Agent** | `mcp-ryla-api/`, `mcp-cloudflare/` | `mcp-snyk/`, `mcp-modal/` |

---

### By Task Type

| Task Type | Skills to Use |
|-----------|--------------|
| **Implement Epic** | `epic-implementation/` |
| **Create Component** | `component-creation/` |
| **Create API Endpoint** | `api-endpoint-creation/` |
| **Database Changes** | `db-migration/` |
| **Character Wizard** | `character-creation/` |
| **Image Generation** | `image-generation/` |
| **Deploy App** | `deployment-fly-io/` |
| **Setup Secrets** | `infisical-setup/` |
| **ComfyUI Workflow** | `comfyui-workflow/` |
| **Add Analytics** | `analytics-integration/` |
| **RunPod Setup** | `runpod-setup/` |
| **Test Setup** | `testing-setup/` |
| **CI/CD** | `ci-cd-workflow/` |
| **MCP Operations** | `mcp-ryla-api/`, `mcp-cloudflare/`, `mcp-snyk/`, `mcp-modal/` |

---

## Skills Dependencies

### Skill → Rule Dependencies

| Skill | Depends on Rules |
|-------|------------------|
| `epic-implementation/` | `pipeline-enforcement.mdc` (context) |
| `db-migration/` | `drizzle-schema-style-guide.mdc` (patterns) |
| `component-creation/` | `react-patterns.mdc`, `file-organization.mdc`, `accessibility.mdc` |
| `api-endpoint-creation/` | `api-design.mdc`, `business-logic.mdc`, `data-access.mdc` |
| `test-generation/` | `testing-standards.mdc` |
| `character-creation/` | `zustand-action-patterns.mdc`, `routing.mdc` |
| `image-generation/` | `business-logic.mdc`, `error-handling.mdc` |
| `deployment-fly-io/` | `infisical.mdc` (patterns) |
| `infisical-setup/` | `infisical.mdc` (patterns) |
| `analytics-integration/` | `analytics.mdc` (patterns) |
| `testing-setup/` | `testing-standards.mdc`, `test-fixtures.mdc`, `test-credentials.mdc` |

**Note:** Skills reference Rules for patterns/standards, but Skills contain workflows.

---

## Success Metrics

### Phase 1 (Week 1)
- ✅ 10 Skills created and tested
- ✅ 6 rules migrated
- ✅ High-priority domain Skills complete
- ✅ Skill discovery working

### Phase 2 (Week 2)
- ✅ 16 Skills complete (6 more)
- ✅ All development workflows covered
- ✅ Infrastructure Skills complete

### Phase 3 (Week 3)
- ✅ All 18 Skills complete
- ✅ Multi-agent integration tested
- ✅ Documentation updated
- ✅ Initiative complete

---

## Risk Mitigation

### Risk: Skills Too Complex
**Mitigation:** Start with simple Skills, iterate based on usage

### Risk: Skills Not Discoverable
**Mitigation:** Test descriptions with trigger terms, refine based on testing

### Risk: Duplication with Rules
**Mitigation:** Clear separation - Rules = patterns, Skills = workflows

### Risk: Maintenance Overhead
**Mitigation:** Skills are self-contained, easier to update than mixed Rules

---

## Next Actions

1. **Review & Approve** - Review this roadmap and additional Skills proposal
2. **Start Migration** - Begin with Phase 1 (migration Skills)
3. **Create Domain Skills** - After migration, create high-priority domain Skills
4. **Test & Iterate** - Test skill discovery and refine descriptions
5. **Complete** - Finish all Skills and verify multi-agent integration

---

## Related Documents

- **Migration Plan**: `IN-029-MIGRATION-ACTION-PLAN.md`
- **Additional Skills**: `IN-029-ADDITIONAL-SKILLS-PROPOSAL.md`
- **Analysis**: `CURSOR-RULES-TO-SKILLS-ANALYSIS.md`
- **Verification**: `CURSOR-RULES-COMPLETE-VERIFICATION.md`
- **Research**: `CURSOR-SKILLS-RESEARCH.md`

---

**Last Updated**: 2026-01-27  
**Status**: Complete Roadmap - Ready for Execution
