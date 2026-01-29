# IN-029: Additional Skills Proposal for RYLA

**Created**: 2026-01-27  
**Status**: Proposal  
**Purpose**: Identify domain-specific Skills needed for RYLA's development workflow

---

## Executive Summary

Beyond the 10 Skills already identified for migration, RYLA has **domain-specific workflows** that would benefit from Skills. This document proposes **8 additional Skills** based on actual RYLA development patterns.

**Total Skills Needed: 18**
- **10 Skills** (already identified - migration)
- **8 Skills** (new - domain-specific)

---

## Analysis Methodology

**Reviewed:**
- Character creation wizard flows (presets + prompt-based)
- Image generation workflows (studio, character sheets, base images)
- Deployment processes (Fly.io, GitHub Actions)
- Infrastructure setup (Infisical, RunPod, ComfyUI)
- Testing and QA workflows
- Analytics integration patterns

**Criteria for New Skills:**
- ✅ Multi-step workflow (3+ steps)
- ✅ Domain-specific to RYLA
- ✅ Recurring task pattern
- ✅ Would benefit from agent discovery
- ✅ Contains procedures, not just patterns

---

## Additional Skills to Create

### 1. `character-creation/` - Character Wizard Implementation

**Why:**
- Complex multi-step workflow (10-step presets, 4-step prompt-based)
- Multiple flows (presets, prompt-based, existing person)
- Integration with image generation
- State management patterns
- Route configuration

**Description:** "Implements character creation wizard flows following RYLA patterns. Use when creating wizard steps, implementing character creation flows, or when the user mentions character wizard or wizard implementation."

**Workflow:**
1. Determine creation method (presets/prompt-based/existing)
2. Configure wizard steps based on method
3. Implement step components
4. Set up state management (Zustand store)
5. Configure routes and navigation
6. Integrate with base image generation
7. Add validation and error handling

**References:**
- `docs/requirements/wizard/WIZARD-AUDIT.md`
- `libs/business/src/store/character-wizard.store.ts`
- `libs/business/src/wizard/flow-router.ts`

**Priority:** High (core feature)

---

### 2. `image-generation/` - Studio & Character Image Generation

**Why:**
- Complex generation workflows (studio, character sheets, base images, profile pictures)
- Multiple providers (Modal, ComfyUI, Fal)
- Prompt building patterns
- Job polling and status tracking
- NSFW handling

**Description:** "Implements image generation workflows for studio, character sheets, and base images. Use when implementing image generation, creating generation services, or when the user mentions image generation, studio generation, or character sheets."

**Workflow:**
1. Determine generation type (studio/character-sheet/base-image/profile-picture)
2. Build prompt using PromptBuilder
3. Select model provider (Modal/ComfyUI/Fal)
4. Create workflow JSON (if ComfyUI)
5. Submit generation job
6. Poll for completion
7. Handle results and upload to storage
8. Update UI state

**References:**
- `apps/api/src/modules/image/services/studio-generation.service.ts`
- `apps/api/src/modules/image/services/character-sheet.service.ts`
- `apps/api/src/modules/image/services/base-image-generation.service.ts`
- `docs/technical/systems/IMAGE-GENERATION-FLOW.md`

**Priority:** High (core feature)

---

### 3. `deployment-fly-io/` - Fly.io Deployment Workflow

**Why:**
- Multi-step deployment process
- GitHub Actions integration
- Infisical secrets management
- Health checks and verification
- Environment-specific configuration

**Description:** "Deploys applications to Fly.io following RYLA deployment patterns. Use when deploying apps, setting up Fly.io infrastructure, configuring deployment workflows, or when the user mentions Fly.io deployment."

**Workflow:**
1. Create/update `fly.toml` configuration
2. Create/update Dockerfile
3. Set up GitHub Actions workflow
4. Configure Infisical secrets export
5. Set up health check endpoint
6. Deploy to staging
7. Verify deployment
8. Deploy to production (if staging passes)

**References:**
- `docs/ops/FLY-IO-DEPLOYMENT-GUIDE.md`
- `docs/ops/DEPLOYMENT-WORKFLOW-POLICY.md`
- `.github/workflows/deploy-auto.yml`
- `docs/ops/ADMIN-APP-DEPLOYMENT-SETUP.md`

**Priority:** High (infrastructure)

---

### 4. `infisical-setup/` - Infisical Secrets Configuration

**Why:**
- Secrets management workflow
- Environment-specific setup
- Machine identity configuration
- MCP integration patterns

**Description:** "Configures Infisical secrets management for applications and services. Use when setting up secrets, configuring Infisical for new apps, creating machine identities, or when the user mentions Infisical or secrets management."

**Workflow:**
1. Determine secrets needed (app-specific vs shared)
2. Create Infisical folders (`/apps/{app}`, `/shared`)
3. Add secrets to appropriate folders
4. Configure environment variables
5. Set up machine identity (if needed)
6. Update MCP configuration (if needed)
7. Test secrets access

**References:**
- `.cursor/rules/infisical.mdc` (patterns - keep as Rule)
- `docs/technical/guides/INFISICAL-SETUP.md`
- `docs/ops/INFISICAL-WORKFLOW-QUICK-REF.md`

**Priority:** Medium (infrastructure)

---

### 5. `comfyui-workflow/` - ComfyUI Workflow Management

**Why:**
- Workflow conversion (UI JSON → API JSON)
- Workflow creation and modification
- ComfyUI deployment patterns
- Workflow testing

**Description:** "Creates and manages ComfyUI workflows for image generation. Use when creating ComfyUI workflows, converting workflow formats, deploying ComfyUI handlers, or when the user mentions ComfyUI workflows."

**Workflow:**
1. Determine workflow type (character-sheet, studio, base-image)
2. Create workflow JSON structure
3. Configure nodes and connections
4. Convert UI JSON to API JSON (if needed)
5. Test workflow locally (if possible)
6. Deploy workflow handler
7. Integrate with generation service

**References:**
- `docs/ops/COMFYUI-WORKFLOW-CONVERSION.md`
- `libs/business/src/services/comfyui-workflow-builder.ts`
- `workflows/character-sheet.json`
- `apps/modal/handlers/workflow.py`

**Priority:** Medium (domain-specific)

---

### 6. `analytics-integration/` - PostHog Analytics Setup

**Why:**
- Event tracking setup
- Funnel configuration
- Analytics verification
- Event schema definition

**Description:** "Integrates PostHog analytics tracking following RYLA analytics patterns. Use when adding analytics events, setting up funnels, verifying tracking, or when the user mentions analytics or PostHog."

**Workflow:**
1. Identify events to track
2. Define event schema
3. Add `analytics.capture()` calls
4. Configure funnels (if needed)
5. Add E2E tests for events
6. Verify events in PostHog
7. Document event schema

**References:**
- `.cursor/rules/analytics.mdc` (patterns - keep as Rule)
- `libs/analytics/`
- `docs/analytics/TRACKING-PLAN.md` (if exists)

**Priority:** Medium (feature enhancement)

---

### 7. `runpod-setup/` - RunPod Infrastructure Setup

**Why:**
- Endpoint creation workflow
- Pod configuration
- Safety policy compliance
- Resource management

**Description:** "Sets up RunPod infrastructure for GPU workloads following RYLA safety policies. Use when creating RunPod endpoints, configuring GPU pods, or when the user mentions RunPod infrastructure."

**Workflow:**
1. Review RunPod safety policy (from Rule)
2. Determine resource requirements
3. Create endpoint configuration
4. Request user confirmation (safety policy)
5. Create endpoint via MCP or CLI
6. Configure pod settings
7. Test endpoint connectivity
8. Document in resources ledger

**References:**
- `.cursor/rules/runpod-safety.mdc` (policy - keep as Rule)
- `docs/ops/runpod/RESOURCES.md`
- RunPod MCP tools (if available)

**Priority:** Low (infrastructure, less frequent)

---

### 8. `testing-setup/` - Test Environment Configuration

**Why:**
- Test database setup
- Test fixtures creation
- Test credentials management
- E2E test configuration

**Description:** "Sets up testing environments and configurations for unit, integration, and E2E tests. Use when configuring test environments, creating test fixtures, setting up test databases, or when the user mentions test setup."

**Workflow:**
1. Determine test type (unit/integration/E2E)
2. Set up test database (PGlite for unit/integration)
3. Create test fixtures
4. Configure test credentials
5. Set up test utilities
6. Configure Playwright (if E2E)
7. Add test helpers
8. Verify test environment

**References:**
- `.cursor/rules/testing-standards.mdc` (patterns - keep as Rule)
- `.cursor/rules/test-fixtures.mdc` (patterns - keep as Rule)
- `.cursor/rules/test-credentials.mdc` (patterns - keep as Rule)
- `apps/api/src/test/utils/test-db.ts`

**Priority:** Low (supporting workflow)

---

## Skills Priority Matrix

| Skill | Priority | Frequency | Complexity | Value |
|-------|----------|-----------|------------|-------|
| `character-creation/` | High | High | High | High |
| `image-generation/` | High | High | High | High |
| `deployment-fly-io/` | High | Medium | Medium | High |
| `infisical-setup/` | Medium | Low | Low | Medium |
| `comfyui-workflow/` | Medium | Medium | High | Medium |
| `analytics-integration/` | Medium | Medium | Low | Medium |
| `runpod-setup/` | Low | Low | Medium | Low |
| `testing-setup/` | Low | Low | Low | Low |

---

## Complete Skills List (18 Total)

### Migration Skills (10)
1. `epic-implementation/` - 10-phase pipeline workflow
2. `db-migration/` - Database migration workflow
3. `mcp-ryla-api/` - RYLA MCP usage
4. `mcp-snyk/` - Snyk MCP usage
5. `mcp-cloudflare/` - Cloudflare MCP usage
6. `mcp-modal/` - Modal deployment
7. `test-generation/` - Test creation workflow
8. `api-endpoint-creation/` - tRPC endpoint workflow
9. `component-creation/` - React component workflow
10. `ci-cd-workflow/` - CI/CD automation workflow

### Domain-Specific Skills (8)
11. `character-creation/` - Character wizard implementation
12. `image-generation/` - Studio & character image generation
13. `deployment-fly-io/` - Fly.io deployment workflow
14. `infisical-setup/` - Infisical secrets configuration
15. `comfyui-workflow/` - ComfyUI workflow management
16. `analytics-integration/` - PostHog analytics setup
17. `runpod-setup/` - RunPod infrastructure setup
18. `testing-setup/` - Test environment configuration

---

## Implementation Plan

### Phase 1: High-Priority Domain Skills (Week 1)
- [ ] `character-creation/` - Core feature workflow
- [ ] `image-generation/` - Core feature workflow
- [ ] `deployment-fly-io/` - Infrastructure workflow

### Phase 2: Medium-Priority Skills (Week 2)
- [ ] `infisical-setup/` - Infrastructure setup
- [ ] `comfyui-workflow/` - Domain-specific
- [ ] `analytics-integration/` - Feature enhancement

### Phase 3: Low-Priority Skills (Week 3)
- [ ] `runpod-setup/` - Infrastructure (less frequent)
- [ ] `testing-setup/` - Supporting workflow

---

## Skills Organization

```
.cursor/skills/
├── epic-implementation/      # Development workflow
├── db-migration/             # Database workflow
├── test-generation/          # Testing workflow
├── api-endpoint-creation/   # API workflow
├── component-creation/      # Frontend workflow
├── ci-cd-workflow/          # CI/CD workflow
│
├── mcp-ryla-api/            # MCP tools
├── mcp-snyk/                # MCP tools
├── mcp-cloudflare/          # MCP tools
├── mcp-modal/               # MCP tools
│
├── character-creation/      # Domain: Character wizard
├── image-generation/        # Domain: Image generation
├── comfyui-workflow/        # Domain: ComfyUI
│
├── deployment-fly-io/       # Infrastructure
├── infisical-setup/         # Infrastructure
├── runpod-setup/            # Infrastructure
├── analytics-integration/   # Infrastructure
└── testing-setup/           # Infrastructure
```

---

## Benefits

**For Development:**
- ✅ Agents can discover domain-specific workflows
- ✅ Specialized agents (frontend, backend, infrastructure) can use relevant Skills
- ✅ Complex workflows (character creation, image generation) have clear procedures
- ✅ Infrastructure setup becomes discoverable

**For Multi-Agent System (IN-027):**
- ✅ Frontend agent uses `character-creation/`, `component-creation/`
- ✅ Backend agent uses `image-generation/`, `api-endpoint-creation/`
- ✅ Infrastructure agent uses `deployment-fly-io/`, `infisical-setup/`
- ✅ Testing agent uses `test-generation/`, `testing-setup/`

**For Maintenance:**
- ✅ Workflows documented and discoverable
- ✅ New team members can discover procedures
- ✅ Consistent workflow execution
- ✅ Better onboarding

---

## Next Steps

1. **Approve Proposal** - Review and approve additional Skills
2. **Update Action Plan** - Add domain-specific Skills to migration plan
3. **Prioritize** - Start with high-priority Skills (character-creation, image-generation)
4. **Create Skills** - Follow same process as migration Skills
5. **Test Discovery** - Verify agents can discover and use Skills

---

**Last Updated**: 2026-01-27  
**Status**: Proposal - Awaiting Approval
