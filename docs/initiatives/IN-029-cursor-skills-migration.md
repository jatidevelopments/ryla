# [INITIATIVE] IN-029: Cursor Skills Migration

**Status**: Active  
**Created**: 2026-01-27  
**Last Updated**: 2026-01-28  
**Owner**: Engineering Team  
**Stakeholders**: Engineering Team, Product Team

---

## Executive Summary

**One-sentence description**: Migrate workflow-oriented Cursor rules and MCP/operations documentation to the new Cursor Skills system, improving task discovery and agent specialization for multi-agent orchestration.

**Business Impact**: C-Core Value, E-CAC

---

## Why (Business Rationale)

### Problem Statement

Currently, RYLA has a mix of:
- **Rules** (`.cursor/rules/*.mdc`) - Coding standards, patterns, context
- **Workflow documentation** (in rules and docs) - Task-oriented procedures
- **MCP usage guides** (in rules and docs) - Tool-specific workflows

**Issues:**
- Workflow-oriented content is in Rules (meant for standards/patterns)
- MCP usage is documented in Rules but should be task-oriented Skills
- Operations/SOPs are in documentation but not discoverable by agents
- No clear separation between "what to do" (Rules) vs "how to do it" (Skills)
- Multi-agent system (IN-027) needs specialized Skills for agent discovery

This creates:
- **Reduced agent efficiency**: Agents can't easily discover task workflows
- **Context bloat**: Rules contain workflow steps that should be Skills
- **Poor specialization**: Can't create specialized agent Skills (e.g., "MCP operations agent")
- **Maintenance overhead**: Workflows mixed with standards makes updates harder

### Current State

**Rules Analysis:**
- **Total Rules**: 50+ rules in `.cursor/rules/`
- **Always-Applied**: ~15 rules (core context)
- **Glob-Based**: ~20 rules (file-specific patterns)
- **Requestable**: ~15 rules (specialized patterns)

**Workflow Content in Rules:**
- `task-execution.mdc` - SOP workflow (423 lines) → **Should be Skill**
- `db-migrations.mdc` - Migration workflow (368 lines) → **Should be Skill**
- `mcp-ryla-api.mdc` - MCP usage workflow → **Should be Skill**
- `mcp-snyk.mdc` - MCP usage workflow → **Should be Skill**
- `mcp-cloudflare.mdc` - MCP usage workflow → **Should be Skill**
- `mcp-modal.mdc` - Modal deployment workflow → **Should be Skill**
- `runpod-safety.mdc` - Safety policy (could stay as Rule or become Skill)

**Operations Documentation:**
- `docs/ops/CLOUDFLARE-MCP-USAGE.md` - MCP workflow guide → **Should be Skill**
- `docs/ops/AUTOMATED-COMMIT-SOP.md` - CI/CD workflow → **Should be Skill**
- Other operations guides that are task-oriented

### Desired State

**Clear Separation:**
- **Rules**: Standards, patterns, context (always-apply or glob-based)
- **Skills**: Task workflows, operations, tool usage (discovered via description)

**Skills Structure:**
```
.cursor/skills/
├── epic-implementation/      # 10-phase pipeline workflow
├── db-migration/             # Database migration workflow
├── mcp-ryla-api/            # RYLA MCP usage
├── mcp-snyk/                # Snyk MCP usage
├── mcp-cloudflare/          # Cloudflare MCP usage
├── mcp-modal/               # Modal deployment
├── runpod-operations/       # RunPod safety & operations
├── test-generation/         # Test creation workflow
├── api-endpoint-creation/   # tRPC endpoint workflow
└── component-creation/      # React component workflow
```

**Benefits:**
- ✅ Agents discover workflows via description matching
- ✅ Specialized agents can use specific Skills (e.g., "MCP operations agent")
- ✅ Rules stay focused on standards/patterns
- ✅ Skills can include scripts and detailed workflows
- ✅ Better support for multi-agent orchestration (IN-027)

### Business Drivers

- **C-Core Value**: Better agent specialization improves code quality
- **E-CAC**: Faster task completion through better workflow discovery
- **Multi-Agent Support**: Enables IN-027 multi-agent orchestration
- **Maintainability**: Clear separation makes updates easier

---

## How (Approach & Strategy)

### Strategy

**Phase 1: Analysis & Planning**
1. Categorize all rules (Rule vs Skill)
2. Identify operations docs that should be Skills
3. Create migration plan
4. Define Skill structure and patterns

**Phase 2: Create First Skills**
1. Start with highest-value Skills (epic-implementation, db-migration)
2. Migrate MCP usage rules to Skills
3. Create supporting reference files
4. Test skill discovery

**Phase 3: Migrate Remaining Content**
1. Migrate operations documentation to Skills
2. Update rules to reference Skills where appropriate
3. Remove workflow content from Rules
4. Update documentation

**Phase 4: Integration & Testing**
1. Test skill discovery in multi-agent scenarios
2. Verify specialized agents can use Skills
3. Update IN-027 with Skills integration
4. Document usage patterns

### Key Principles

1. **Rules = Standards/Patterns**: Keep coding standards, patterns, context
2. **Skills = Workflows/Tasks**: Move task-oriented procedures to Skills
3. **Progressive Disclosure**: Skills can link to detailed docs
4. **Backward Compatibility**: Rules can reference Skills for workflows
5. **Clear Descriptions**: Skills must have discoverable descriptions

### Migration Criteria

**Move to Skills if:**
- ✅ Contains step-by-step workflow
- ✅ Task-oriented (how to do X)
- ✅ Tool-specific usage (MCP, CLI, etc.)
- ✅ Operations/SOP procedures
- ✅ Can be executed as a task

**Keep as Rule if:**
- ✅ Coding standards/patterns
- ✅ Context/background information
- ✅ Always-applied foundational knowledge
- ✅ File-specific patterns (globs)
- ✅ Architectural principles

---

## When (Timeline & Priority)

### Timeline

- **Start Date**: 2026-01-27
- **Target Completion**: 2026-02-15 (3 weeks)
- **Key Milestones**:
  - **Week 1**: Analysis complete, first Skills created
  - **Week 2**: MCP Skills migrated, operations docs converted
  - **Week 3**: Integration testing, documentation updated

### Priority

**Priority Level**: P1

**Rationale**: 
- Enables IN-027 multi-agent orchestration
- Improves agent efficiency and specialization
- Foundation for better task discovery

---

## Who (Stakeholders & Ownership)

### Initiative Owner

**Name**: Engineering Team Lead  
**Role**: Engineering  
**Responsibilities**: 
- Design Skills structure
- Migrate rules and docs
- Test skill discovery
- Update documentation

### Key Stakeholders

| Name | Role | Involvement | Responsibilities |
|------|------|-------------|------------------|
| Engineering Team | Development | High | Create Skills, migrate content, test |
| Product Team | Product | Low | Validate workflow improvements |

---

## Success Criteria

### Primary Success Metrics

| Metric | Target | Measurement Method | Timeline |
|--------|--------|-------------------|----------|
| Skills Created | 10+ Skills | Count of `.cursor/skills/` directories | Week 3 |
| Rules Migrated | 6+ rules | Rules moved to Skills | Week 2 |
| Operations Docs Migrated | 3+ docs | Operations docs converted to Skills | Week 2 |
| Skill Discovery Working | 100% | Agents can discover and use Skills | Week 3 |
| Multi-Agent Integration | Functional | IN-027 agents can use Skills | Week 3 |

### Business Metrics Impact

**Target Metric**: [x] C-Core Value [x] E-CAC

**Expected Impact**:
- **C-Core Value**: 10-15% improvement in code quality (better workflows)
- **E-CAC**: 15-20% reduction in task time (better discovery)

---

## Definition of Done

### Initiative Complete When:

- [ ] All workflow-oriented rules migrated to Skills
- [ ] All MCP usage guides converted to Skills
- [ ] Operations SOPs converted to Skills
- [ ] 10+ Skills created and tested
- [ ] Skills discoverable by agents
- [ ] Rules updated to reference Skills where appropriate
- [ ] Documentation updated
- [ ] IN-027 integration tested
- [ ] Team trained on Skills usage

---

## Related Work

### Epics

| Epic | Name | Status | Link |
|------|------|--------|------|
| EP-XXX | Skills Migration Implementation | Proposed | [To be created] |

### Dependencies

- **Enables**: IN-027 (Multi-Agent Orchestration System)
- **Blocked By**: None
- **Related Initiatives**: 
  - IN-027 (Multi-Agent Orchestration) - Skills enable agent specialization

### Documentation

- Cursor Skills Research: `docs/research/CURSOR-SKILLS-RESEARCH.md`
- Cursor Rules: `.cursor/rules/`
- MCP Documentation: `docs/ops/CLOUDFLARE-MCP-USAGE.md`
- Operations Docs: `docs/ops/`

---

## Detailed Migration Plan

### Rule Analysis

#### Rules to Migrate to Skills (6 rules)

1. **`task-execution.mdc`** → `epic-implementation/`
   - **Reason**: Step-by-step workflow for implementing epics
   - **Size**: 423 lines
   - **Content**: SOP workflow, task breakdown, quality gates
   - **Skill Name**: `epic-implementation`

2. **`db-migrations.mdc`** → `db-migration/`
   - **Reason**: Database migration workflow
   - **Size**: 368 lines
   - **Content**: Step-by-step migration process
   - **Skill Name**: `db-migration`

3. **`mcp-ryla-api.mdc`** → `mcp-ryla-api/`
   - **Reason**: MCP tool usage workflow
   - **Size**: 288 lines
   - **Content**: Tool reference, workflows, best practices
   - **Skill Name**: `mcp-ryla-api`

4. **`mcp-snyk.mdc`** → `mcp-snyk/`
   - **Reason**: MCP tool usage workflow
   - **Size**: 163 lines
   - **Content**: Tool reference, workflows, best practices
   - **Skill Name**: `mcp-snyk`

5. **`mcp-cloudflare.mdc`** → `mcp-cloudflare/`
   - **Reason**: MCP tool usage workflow
   - **Size**: 423 lines
   - **Content**: Tool reference, workflows, best practices
   - **Skill Name**: `mcp-cloudflare`

6. **`mcp-modal.mdc`** → `mcp-modal/`
   - **Reason**: Modal deployment workflow
   - **Size**: 448 lines
   - **Content**: Deployment patterns, best practices
   - **Skill Name**: `mcp-modal`

#### Rules to Keep (44+ rules)

**Always-Applied Rules** (keep as Rules):
- `rules-index.mdc` - Rule catalog
- `project-introduce.mdc` - Project overview
- `architecture.mdc` - Architecture context
- `pipeline-enforcement.mdc` - Pipeline enforcement (context)
- `way-of-work.mdc` - Communication patterns
- `mvp-principles.mdc` - MVP constraints
- `routing.mdc` - Routing patterns
- `infisical.mdc` - Secrets management patterns
- `file-organization.mdc` - File structure patterns
- `git-workflow.mdc` - Git patterns
- `code-style.mdc` - Code conventions
- `dependencies.mdc` - External services context
- `task-execution.mdc` - **MIGRATE** (workflow)
- `user-intent-validation.mdc` - Validation patterns
- `learning-and-rules.mdc` - Rule management

**Glob-Based Rules** (keep as Rules):
- `typescript.mdc` - TypeScript patterns
- `react-patterns.mdc` - React patterns
- `react-hook-form.mdc` - Form patterns
- `styling.mdc` - Styling patterns
- `testing-standards.mdc` - Testing patterns
- `drizzle-schema-style-guide.mdc` - Schema patterns
- `zustand-action-patterns.mdc` - State patterns
- `zustand-slice-organization.mdc` - State patterns
- `business-logic.mdc` - Business patterns
- `data-access.mdc` - Data patterns
- `presentation.mdc` - API patterns
- `api-design.mdc` - API patterns
- `security.mdc` - Security patterns
- `accessibility.mdc` - A11y patterns
- `performance.mdc` - Performance patterns
- `seo.mdc` - SEO patterns
- `tanstack-query.mdc` - Query patterns
- `error-handling.mdc` - Error patterns
- `logging.mdc` - Logging patterns
- `environment-variables.mdc` - Env var patterns
- `analytics.mdc` - Analytics patterns
- `notifications.mdc` - Notification patterns
- `image-optimization.mdc` - Image patterns
- `management.mdc` - Management patterns
- `refactoring.mdc` - Refactoring patterns
- `cursor-rules.mdc` - Rule creation patterns
- `ralph.mdc` - Iterative development patterns
- `journey-documentation.mdc` - Documentation patterns
- `initiatives.mdc` - Initiative patterns
- `test-fixtures.mdc` - Test patterns
- `test-credentials.mdc` - Test patterns
- `mobile-ux.mdc` - Mobile patterns
- `ai-reasoning-patterns.mdc` - Reasoning patterns
- `ci-fix-agent.mdc` - CI patterns

**Requestable Rules** (keep as Rules):
- All glob-based rules above
- `db-migrations.mdc` - **MIGRATE** (workflow)
- `mcp-ryla-api.mdc` - **MIGRATE** (workflow)
- `mcp-snyk.mdc` - **MIGRATE** (workflow)
- `mcp-cloudflare.mdc` - **MIGRATE** (workflow)
- `mcp-modal.mdc` - **MIGRATE** (workflow)
- `runpod-safety.mdc` - **EVALUATE** (could be Skill or Rule)

### Operations Documentation to Migrate

1. **`docs/ops/CLOUDFLARE-MCP-USAGE.md`** → `mcp-cloudflare/`
   - **Reason**: MCP workflow guide
   - **Content**: Usage examples, workflows, troubleshooting
   - **Action**: Integrate into `mcp-cloudflare` Skill

2. **`docs/ops/AUTOMATED-COMMIT-SOP.md`** → `ci-cd-workflow/`
   - **Reason**: CI/CD workflow SOP
   - **Content**: Automated commit workflow
   - **Action**: Create new Skill

3. **Other operations guides** (evaluate case-by-case)
   - Check for workflow-oriented content
   - Convert to Skills if task-oriented

### New Skills to Create

1. **`epic-implementation/`** - 10-phase pipeline workflow
2. **`db-migration/`** - Database migration workflow
3. **`mcp-ryla-api/`** - RYLA MCP usage
4. **`mcp-snyk/`** - Snyk MCP usage
5. **`mcp-cloudflare/`** - Cloudflare MCP usage
6. **`mcp-modal/`** - Modal deployment
7. **`runpod-operations/`** - RunPod safety & operations (if migrated)
8. **`test-generation/`** - Test creation workflow
9. **`api-endpoint-creation/`** - tRPC endpoint workflow
10. **`component-creation/`** - React component workflow
11. **`ci-cd-workflow/`** - CI/CD automation workflow

---

## Migration Steps

### Step 1: Create Skills Directory Structure

```bash
mkdir -p .cursor/skills/{epic-implementation,db-migration,mcp-ryla-api,mcp-snyk,mcp-cloudflare,mcp-modal,test-generation,api-endpoint-creation,component-creation,ci-cd-workflow}
```

### Step 2: Migrate First Skill (Epic Implementation)

1. Create `epic-implementation/SKILL.md` from `task-execution.mdc`
2. Extract workflow steps
3. Add description with trigger terms
4. Create reference files if needed
5. Test skill discovery

### Step 3: Migrate MCP Skills

1. Migrate each MCP rule to corresponding Skill
2. Integrate operations documentation
3. Add tool reference sections
4. Include workflow examples
5. Test with MCP tools

### Step 4: Update Rules

1. Remove workflow content from Rules
2. Add references to Skills where appropriate
3. Keep standards/patterns in Rules
4. Update `rules-index.mdc`

### Step 5: Test & Validate

1. Test skill discovery
2. Verify agents can use Skills
3. Test multi-agent scenarios (IN-027)
4. Update documentation

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|-------------------|
| Skills not discoverable | Low | Medium | Test descriptions, add trigger terms |
| Rules broken after migration | Low | Medium | Test rules still work, update references |
| Duplicate content | Medium | Low | Remove from Rules, keep only in Skills |
| Team confusion | Low | Low | Document clearly, provide examples |

---

## References

- Cursor Skills Research: `docs/research/CURSOR-SKILLS-RESEARCH.md`
- Cursor Rules: `.cursor/rules/`
- IN-027: Multi-Agent Orchestration System
- Cursor Skills Documentation: `~/.cursor/skills-cursor/create-skill/SKILL.md`

---

**Template Version**: 1.0  
**Last Template Update**: 2026-01-27
