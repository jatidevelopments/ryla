# Cursor Rules to Skills Migration Analysis

**Analysis Date:** 2026-01-27  
**Purpose:** Categorize all Cursor rules and identify which should migrate to Skills

---

## Executive Summary

**Total Rules Analyzed:** 50+ rules  
**Rules to Migrate:** 6 rules (workflow-oriented)  
**Rules to Keep:** 44+ rules (standards/patterns)  
**New Skills to Create:** 11 Skills

---

## Migration Criteria

### Move to Skills If:
- ✅ Contains step-by-step workflow
- ✅ Task-oriented (how to do X)
- ✅ Tool-specific usage (MCP, CLI, etc.)
- ✅ Operations/SOP procedures
- ✅ Can be executed as a task

### Keep as Rule If:
- ✅ Coding standards/patterns
- ✅ Context/background information
- ✅ Always-applied foundational knowledge
- ✅ File-specific patterns (globs)
- ✅ Architectural principles

---

## Rules to Migrate to Skills

### 1. `task-execution.mdc` → `epic-implementation/`

**Current Status:**
- **Type:** Always-Applied Rule
- **Size:** 423 lines
- **Description:** "Standard Operating Procedure (SOP) for AI agents to complete tasks and initiatives systematically"

**Why Migrate:**
- ✅ Step-by-step workflow (6 steps)
- ✅ Task-oriented (how to complete tasks)
- ✅ Contains execution checklist
- ✅ Can be executed as a task

**Migration Plan:**
- Create `epic-implementation/SKILL.md`
- Extract workflow steps
- Add description: "Implements complete epics following RYLA's 10-phase pipeline. Use when starting work on EP-XXX epics, implementing features, or when the user mentions epic implementation."
- Keep quality gates and checklists
- Reference pipeline-enforcement rule for context

**Keep in Rules:**
- Remove workflow steps
- Keep as context reference (if needed)
- Or remove entirely (workflow in Skill)

---

### 2. `db-migrations.mdc` → `db-migration/`

**Current Status:**
- **Type:** Glob-Based Rule (`drizzle/migrations/**`, `libs/data/src/schema/**`)
- **Size:** 368 lines
- **Description:** "Database migration patterns and best practices for Drizzle ORM"

**Why Migrate:**
- ✅ Step-by-step workflow (5 steps)
- ✅ Task-oriented (how to create migrations)
- ✅ Contains commands and procedures
- ✅ Can be executed as a task

**Migration Plan:**
- Create `db-migration/SKILL.md`
- Extract migration workflow
- Add description: "Creates and applies database migrations using Drizzle ORM following RYLA schema patterns. Use when modifying database schemas, creating migrations, or when the user mentions database changes."
- Include command reference
- Keep best practices

**Keep in Rules:**
- `drizzle-schema-style-guide.mdc` (schema patterns - keep)
- Remove workflow from `db-migrations.mdc` or remove rule entirely

---

### 3. `mcp-ryla-api.mdc` → `mcp-ryla-api/`

**Current Status:**
- **Type:** Requestable Rule
- **Size:** 288 lines
- **Description:** "RYLA MCP Server usage guidelines for AI assistants"

**Why Migrate:**
- ✅ Tool-specific usage workflow
- ✅ Contains tool reference and workflows
- ✅ Task-oriented (how to use MCP tools)
- ✅ Can be executed as a task

**Migration Plan:**
- Create `mcp-ryla-api/SKILL.md`
- Extract tool reference and workflows
- Add description: "Uses RYLA MCP Server tools for API operations, debugging, and automation. Use when working with RYLA API, debugging issues, generating test data, or when the user mentions MCP tools or API operations."
- Include tool reference
- Add workflow examples

**Keep in Rules:**
- Remove entirely (all content in Skill)

---

### 4. `mcp-snyk.mdc` → `mcp-snyk/`

**Current Status:**
- **Type:** Requestable Rule
- **Size:** 163 lines
- **Description:** "Snyk MCP Server usage guidelines for security scanning"

**Why Migrate:**
- ✅ Tool-specific usage workflow
- ✅ Contains tool reference and workflows
- ✅ Task-oriented (how to use Snyk MCP)
- ✅ Can be executed as a task

**Migration Plan:**
- Create `mcp-snyk/SKILL.md`
- Extract tool reference and workflows
- Add description: "Uses Snyk MCP Server for security vulnerability scanning. Use when scanning repositories, checking security issues, verifying dependencies, or when the user mentions security scanning or Snyk."
- Include tool reference
- Add workflow examples

**Keep in Rules:**
- Remove entirely (all content in Skill)

---

### 5. `mcp-cloudflare.mdc` → `mcp-cloudflare/`

**Current Status:**
- **Type:** Requestable Rule
- **Size:** 423 lines
- **Description:** "Cloudflare MCP Server usage guidelines for Cloudflare services integration"

**Why Migrate:**
- ✅ Tool-specific usage workflow
- ✅ Contains tool reference and workflows
- ✅ Task-oriented (how to use Cloudflare MCP)
- ✅ Can be executed as a task

**Migration Plan:**
- Create `mcp-cloudflare/SKILL.md`
- Extract tool reference and workflows
- Integrate `docs/ops/CLOUDFLARE-MCP-USAGE.md` content
- Add description: "Uses Cloudflare MCP servers for infrastructure management, R2 storage, Workers, and monitoring. Use when managing Cloudflare resources, debugging Workers, managing R2 buckets, or when the user mentions Cloudflare operations."
- Include all 15 Cloudflare MCP servers
- Add workflow examples

**Keep in Rules:**
- Remove entirely (all content in Skill)

---

### 6. `mcp-modal.mdc` → `mcp-modal/`

**Current Status:**
- **Type:** Requestable Rule
- **Size:** 448 lines
- **Description:** "Modal.com best practices and deployment patterns"

**Why Migrate:**
- ✅ Tool-specific usage workflow
- ✅ Contains deployment patterns and workflows
- ✅ Task-oriented (how to deploy to Modal)
- ✅ Can be executed as a task

**Migration Plan:**
- Create `mcp-modal/SKILL.md`
- Extract deployment patterns and workflows
- Add description: "Deploys and manages Modal.com serverless functions following RYLA patterns. Use when deploying to Modal, managing ComfyUI deployments, configuring serverless functions, or when the user mentions Modal.com."
- Include deployment patterns
- Add troubleshooting guide

**Keep in Rules:**
- Remove entirely (all content in Skill)

---

### 7. `runpod-safety.mdc` → `runpod-operations/` (Evaluate)

**Current Status:**
- **Type:** Requestable Rule
- **Size:** 38 lines
- **Description:** "RunPod safety: confirmation-gated, create-only operations. Destructive actions are forbidden."

**Why Consider Migrating:**
- ⚠️ Contains safety policy (could be Rule)
- ⚠️ Contains operations procedures (could be Skill)
- ⚠️ Small size (38 lines)

**Decision:**
- **Option A:** Keep as Rule (safety policy = standard)
- **Option B:** Migrate to Skill (operations = workflow)
- **Recommendation:** Keep as Rule (safety policy is a standard, not a workflow)

**If Migrated:**
- Create `runpod-operations/SKILL.md`
- Add description: "Manages RunPod infrastructure with safety policies. Use when working with RunPod, creating GPU resources, or when the user mentions RunPod operations."

---

## Rules to Keep (Standards/Patterns)

### Always-Applied Rules (Keep)

| Rule | Reason | Notes |
|------|--------|-------|
| `rules-index.mdc` | Rule catalog | Always needed |
| `project-introduce.mdc` | Project context | Always needed |
| `architecture.mdc` | Architecture context | Always needed |
| `pipeline-enforcement.mdc` | Pipeline context | Always needed (references Skills) |
| `way-of-work.mdc` | Communication patterns | Always needed |
| `mvp-principles.mdc` | MVP constraints | Always needed |
| `routing.mdc` | Routing patterns | Always needed |
| `infisical.mdc` | Secrets patterns | Always needed |
| `file-organization.mdc` | File structure patterns | Always needed |
| `git-workflow.mdc` | Git patterns | Always needed |
| `code-style.mdc` | Code conventions | Always needed |
| `dependencies.mdc` | External services context | Always needed |
| `user-intent-validation.mdc` | Validation patterns | Always needed |
| `learning-and-rules.mdc` | Rule management | Always needed |

### Glob-Based Rules (Keep)

| Rule | Globs | Reason |
|------|-------|--------|
| `typescript.mdc` | `*.ts, *.tsx, *.mts` | TypeScript patterns |
| `react-patterns.mdc` | `**/*.tsx` | React patterns |
| `react-hook-form.mdc` | `**/*.tsx, **/*.ts` | Form patterns |
| `styling.mdc` | `**/*.tsx, **/*.css` | Styling patterns |
| `testing-standards.mdc` | `**/*.spec.ts, **/*.test.ts` | Testing patterns |
| `drizzle-schema-style-guide.mdc` | `libs/data/src/schema/**` | Schema patterns |
| `zustand-action-patterns.mdc` | `libs/business/src/store/**` | State patterns |
| `zustand-slice-organization.mdc` | `libs/business/src/store/**` | State patterns |
| `business-logic.mdc` | `libs/business/**` | Business patterns |
| `data-access.mdc` | `libs/data/**` | Data patterns |
| `presentation.mdc` | `apps/api/**`, `apps/web/**` | API patterns |
| `api-design.mdc` | `libs/trpc/**`, `apps/api/**` | API patterns |
| `security.mdc` | `**/*.ts`, `apps/api/**` | Security patterns |
| `accessibility.mdc` | `**/*.tsx`, `**/*.ts` | A11y patterns |
| `performance.mdc` | `**/*.tsx`, `**/*.ts` | Performance patterns |
| `seo.mdc` | `apps/landing/**`, `apps/web/app/**` | SEO patterns |
| `tanstack-query.mdc` | `**/*.tsx`, `**/*.ts` | Query patterns |
| `error-handling.mdc` | `**/*.tsx`, `**/*.ts` | Error patterns |
| `logging.mdc` | `apps/api/**`, `apps/web/**` | Logging patterns |
| `environment-variables.mdc` | `**/*.ts`, `apps/api/**` | Env var patterns |
| `analytics.mdc` | `libs/analytics/**`, `apps/**` | Analytics patterns |
| `notifications.mdc` | `apps/**`, `libs/**` | Notification patterns |
| `image-optimization.mdc` | N/A | Image patterns (always-apply) |
| `management.mdc` | `src/management/**` | Management patterns |
| `refactoring.mdc` | N/A | Refactoring patterns |
| `cursor-rules.mdc` | N/A | Rule creation patterns |
| `ralph.mdc` | N/A | Iterative development patterns |
| `journey-documentation.mdc` | N/A | Documentation patterns |
| `initiatives.mdc` | N/A | Initiative patterns |
| `test-fixtures.mdc` | N/A | Test patterns |
| `test-credentials.mdc` | N/A | Test patterns |
| `mobile-ux.mdc` | `**/*.tsx`, `**/*.ts` | Mobile patterns |
| `ai-reasoning-patterns.mdc` | N/A | Reasoning patterns |
| `ci-fix-agent.mdc` | N/A | CI patterns |

---

## Operations Documentation to Migrate

### 1. `docs/ops/CLOUDFLARE-MCP-USAGE.md` → `mcp-cloudflare/`

**Current Status:**
- **Type:** Operations Guide
- **Size:** 382 lines
- **Content:** MCP usage examples, workflows, troubleshooting

**Action:**
- Integrate into `mcp-cloudflare` Skill
- Add as reference file or merge into SKILL.md
- Remove from `docs/ops/` (or keep as backup)

---

### 2. `docs/ops/AUTOMATED-COMMIT-SOP.md` → `ci-cd-workflow/`

**Current Status:**
- **Type:** SOP Document
- **Size:** 49+ lines
- **Content:** Automated commit workflow

**Action:**
- Create new Skill `ci-cd-workflow/`
- Extract workflow steps
- Add description: "Automates CI/CD workflows with AI-powered error fixing. Use when setting up CI/CD, fixing build errors, or when the user mentions automated commits or CI/CD workflows."

---

## New Skills to Create

### High Priority (Migrate from Rules)

1. **`epic-implementation/`** - From `task-execution.mdc`
2. **`db-migration/`** - From `db-migrations.mdc`
3. **`mcp-ryla-api/`** - From `mcp-ryla-api.mdc`
4. **`mcp-snyk/`** - From `mcp-snyk.mdc`
5. **`mcp-cloudflare/`** - From `mcp-cloudflare.mdc` + `docs/ops/CLOUDFLARE-MCP-USAGE.md`
6. **`mcp-modal/`** - From `mcp-modal.mdc`

### Medium Priority (New Skills)

7. **`test-generation/`** - Test creation workflow
8. **`api-endpoint-creation/`** - tRPC endpoint workflow
9. **`component-creation/`** - React component workflow
10. **`ci-cd-workflow/`** - From `docs/ops/AUTOMATED-COMMIT-SOP.md`

### Low Priority (Future)

11. **`runpod-operations/`** - If `runpod-safety.mdc` is migrated

---

## Migration Checklist

### Phase 1: Setup
- [ ] Create `.cursor/skills/` directory
- [ ] Create subdirectories for each Skill
- [ ] Set up Skill template structure

### Phase 2: Migrate High-Priority Skills
- [ ] Migrate `epic-implementation/` from `task-execution.mdc`
- [ ] Migrate `db-migration/` from `db-migrations.mdc`
- [ ] Migrate `mcp-ryla-api/` from `mcp-ryla-api.mdc`
- [ ] Migrate `mcp-snyk/` from `mcp-snyk.mdc`
- [ ] Migrate `mcp-cloudflare/` from `mcp-cloudflare.mdc` + ops doc
- [ ] Migrate `mcp-modal/` from `mcp-modal.mdc`

### Phase 3: Create New Skills
- [ ] Create `test-generation/` Skill
- [ ] Create `api-endpoint-creation/` Skill
- [ ] Create `component-creation/` Skill
- [ ] Create `ci-cd-workflow/` Skill from SOP

### Phase 4: Update Rules
- [ ] Remove workflow content from migrated rules
- [ ] Update rule descriptions to reference Skills
- [ ] Update `rules-index.mdc`
- [ ] Test rules still work

### Phase 5: Test & Validate
- [ ] Test skill discovery
- [ ] Verify agents can use Skills
- [ ] Test multi-agent scenarios
- [ ] Update documentation

---

## Summary

**Rules to Migrate:** 6 rules
- `task-execution.mdc` → `epic-implementation/`
- `db-migrations.mdc` → `db-migration/`
- `mcp-ryla-api.mdc` → `mcp-ryla-api/`
- `mcp-snyk.mdc` → `mcp-snyk/`
- `mcp-cloudflare.mdc` → `mcp-cloudflare/`
- `mcp-modal.mdc` → `mcp-modal/`

**Rules to Keep:** 44+ rules (standards/patterns)

**New Skills to Create:** 11 Skills total
- 6 from Rules (high priority)
- 4 new Skills (medium priority)
- 1 optional (low priority)

**Operations Docs to Migrate:** 2 documents
- `docs/ops/CLOUDFLARE-MCP-USAGE.md` → `mcp-cloudflare/`
- `docs/ops/AUTOMATED-COMMIT-SOP.md` → `ci-cd-workflow/`

---

**Analysis Status**: ✅ Complete  
**Next Action**: Begin Phase 1 migration  
**Last Updated**: 2026-01-27
