# [INITIATIVE] IN-019: Automated ComfyUI Workflow Analyzer & Deployment Code Generator

**Status**: Proposed  
**Created**: 2026-01-27  
**Last Updated**: 2026-01-27  
**Owner**: Infrastructure Team  
**Stakeholders**: Backend Team, DevOps Team, Product Team

---

## Executive Summary

**One-sentence description**: Build an automated tool that analyzes any ComfyUI workflow JSON, detects required custom nodes and models, automatically discovers their GitHub repositories and versions, and generates complete deployment code (Modal, RunPod, Docker) with all dependencies configured, reducing workflow deployment time from hours to minutes.

**Business Impact**: E-CAC (reduces infrastructure setup time by 80%), C-Core Value (enables rapid workflow deployment), B-Retention (fewer deployment failures), A-Activation (faster feature delivery)

---

## Why (Business Rationale)

### Problem Statement

Currently, deploying a new ComfyUI workflow to serverless infrastructure requires extensive manual work:

- **Manual Dependency Discovery**: Developers must manually identify custom nodes from workflow JSON
- **GitHub Repository Research**: Must manually find GitHub repos for each custom node
- **Version Management**: No automatic version discovery or pinning
- **Deployment Code Generation**: Must manually write Modal Python code or Dockerfiles
- **Model Detection**: Must manually identify required models and their sources
- **Time Waste**: Adding a new workflow takes 2-4 hours of manual setup work
- **Error-Prone**: Manual steps lead to missing dependencies, wrong versions, deployment failures

**Key Pain Points**:
- No automated way to go from workflow JSON → working serverless endpoint
- Must manually research each custom node's GitHub repository
- Must manually write Modal deployment code or Dockerfiles
- Must manually identify and configure model downloads
- Current tools (ComfyUI-to-API) only work for RunPod, not Modal
- No integration with RYLA's existing workflow builders

### Current State

- **Workflow Analysis**: ✅ Basic analyzer exists (`scripts/setup/comfyui-dependency-resolver.ts`) - extracts node types and models from TypeScript files
- **Dependency Registry**: ✅ Basic registry exists (`scripts/setup/comfyui-registry.ts`) - maps node types to packages
- **Node Package Mapping**: ✅ Basic mapper exists (`scripts/setup/node-package-mapper.ts`) - maps node types to Manager packages
- **Deployment Code**: ❌ Must manually write Modal Python or Dockerfiles
- **GitHub Repo Discovery**: ❌ Manual research required
- **Version Discovery**: ❌ No automatic version detection
- **Model Source Detection**: ❌ Manual model URL research
- **Workflow JSON Analysis**: ⚠️ Analyzer only works on TypeScript files, not raw workflow JSON

### Desired State

- **Automated Analysis**: Tool accepts any ComfyUI workflow JSON (API format or full export)
- **Automatic Dependency Detection**: Extracts all custom node types and required models
- **GitHub Repo Discovery**: Automatically finds GitHub repositories for custom nodes
- **Version Discovery**: Automatically discovers available versions (tags, commits) and pins to latest stable
- **Model Source Detection**: Automatically identifies model sources (HuggingFace, Civitai, etc.) and download URLs
- **Deployment Code Generation**: Automatically generates:
  - Modal Python deployment code (`apps/modal/comfyui_workflow_name.py`)
  - RunPod Dockerfile with all dependencies
  - Install scripts for pod setup
- **Integration**: Works with RYLA's existing workflow builders and registry
- **Time to Deploy**: < 5 minutes from workflow JSON to deployed endpoint

### Business Drivers

- **Revenue Impact**: Faster workflow deployment = faster feature delivery = more revenue opportunities
- **Cost Impact**: Reduces infrastructure setup time by 80% = lower operational costs
- **Risk Mitigation**: Automated dependency detection prevents missing dependencies in production
- **Competitive Advantage**: Can deploy new workflows in minutes vs. competitors' hours/days
- **User Experience**: Faster iteration on new workflows = better product features
- **Developer Experience**: Eliminates tedious manual research and setup work

---

## How (Approach & Strategy)

### Strategy

1. **Enhanced Workflow Analysis**
   - Accept workflow JSON (API format or full export)
   - Extract all `class_type` values (custom node types)
   - Extract model filenames from node inputs
   - Identify node connections and dependencies
   - Detect workflow type (image, video, face-swap, etc.)

2. **Automatic GitHub Repository Discovery**
   - Query ComfyUI Manager registry for Manager packages
   - Search GitHub for custom node repositories (by node class name or package name)
   - Verify repository exists and contains ComfyUI custom node structure
   - Cache discovered repositories in registry

3. **Automatic Version Discovery & Pinning**
   - For GitHub repos: Fetch git tags and latest commit
   - For Manager packages: Query Manager registry for available versions
   - Pin to latest stable version (or allow user selection)
   - Verify version exists before pinning

4. **Model Source Detection**
   - Identify model types (checkpoint, VAE, LoRA, text encoder, etc.)
   - Search HuggingFace for model files
   - Search Civitai for LoRA models
   - Generate download URLs with commit hashes (for reproducibility)

5. **Deployment Code Generation**
   - **Modal**: Generate Python file with:
     - Image definition with all custom nodes installed
     - Model download functions
     - FastAPI endpoint for workflow execution
     - Volume configuration for model storage
   - **RunPod**: Generate Dockerfile with:
     - Base image selection
     - Custom node installation (Manager or git)
     - Model download commands
     - Handler script generation
   - **Install Scripts**: Generate pod setup scripts with model downloads

6. **Integration with Existing Systems**
   - Extend `comfyui-dependency-resolver.ts` to accept workflow JSON
   - Enhance `node-package-mapper.ts` with GitHub repo discovery
   - Update `comfyui-registry.ts` with auto-discovered repositories
   - Generate TypeScript workflow builders from analyzed workflows (optional)

### Key Principles

- **Automation First**: Minimize manual steps, maximize automation
- **Fail Fast**: Detect missing dependencies early (at analysis time, not deployment)
- **Version Pinning**: Always pin to specific versions for reproducibility
- **Multi-Platform**: Generate code for Modal, RunPod, and other platforms
- **Integration**: Works with existing RYLA infrastructure and tools
- **Extensibility**: Easy to add new platforms or deployment targets

### Phases

1. **Phase 1: Enhanced Workflow Analysis** - Accept workflow JSON, extract dependencies - 1 week
2. **Phase 2: GitHub Repo Discovery** - Auto-discover GitHub repos for custom nodes - 1 week
3. **Phase 3: Version Discovery & Pinning** - Auto-discover and pin versions - 1 week
4. **Phase 4: Model Source Detection** - Auto-detect model sources and URLs - 1 week
5. **Phase 5: Modal Code Generation** - Generate Modal Python deployment code - 1 week
6. **Phase 6: RunPod Code Generation** - Generate Dockerfiles and install scripts - 1 week
7. **Phase 7: Integration & Testing** - Integrate with existing tools, end-to-end testing - 1 week

**Total Timeline**: 7 weeks

### Dependencies

- **IN-008**: ComfyUI Dependency Management (provides registry and versioning infrastructure)
- **IN-015**: ComfyUI Workflow-to-API Platform Evaluation (informs deployment targets)
- **Existing Tools**: `comfyui-dependency-resolver.ts`, `node-package-mapper.ts`, `comfyui-registry.ts`

### Constraints

- Must work with both API format and full export workflow JSON
- Must handle unknown custom nodes gracefully (warn, don't fail)
- Must support both Manager packages and GitHub repos
- Must generate valid, working deployment code
- Must maintain compatibility with existing RYLA infrastructure

---

## When (Timeline & Priority)

### Timeline

- **Start Date**: 2026-02-15 (after IN-008 Phase 2 completes - version discovery system)
- **Target Completion**: 2026-04-05
- **Key Milestones**:
  - **M1: Enhanced Analyzer**: 2026-02-22
  - **M2: GitHub Repo Discovery**: 2026-03-01
  - **M3: Version Discovery**: 2026-03-08
  - **M4: Model Detection**: 2026-03-15
  - **M5: Modal Code Generation**: 2026-03-22
  - **M6: RunPod Code Generation**: 2026-03-29
  - **M7: Integration Complete**: 2026-04-05

### Priority

**Priority Level**: P1

**Rationale**: 
- Enables rapid workflow deployment (critical for competitive advantage)
- Reduces infrastructure setup time by 80% (E-CAC impact)
- Prevents deployment failures from missing dependencies (C-Core Value)
- Enables faster feature delivery (A-Activation)
- Complements IN-008 dependency management system

### Resource Requirements

- **Team**: Infrastructure Team (1 engineer), Backend Team (0.5 engineer for integration)
- **Budget**: No additional budget required (uses existing infrastructure)
- **External Dependencies**: 
  - ComfyUI Manager registry API (public, no API key)
  - GitHub API (public access, may need token for rate limits)
  - HuggingFace API (public access)
  - Civitai API (if available, or web scraping)

---

## Who (Stakeholders & Ownership)

### Initiative Owner

**Name**: Infrastructure Team Lead  
**Role**: Infrastructure Team  
**Responsibilities**: 
- Design and implement automated analyzer
- Build GitHub repo discovery system
- Generate deployment code generators
- Integrate with existing RYLA tools

### Key Stakeholders

| Name | Role | Involvement | Responsibilities |
|------|------|-------------|------------------|
| Backend Team | Backend Engineers | High | Integration with workflow builders, testing generated code |
| DevOps Team | DevOps Engineers | Medium | Validate generated Dockerfiles, deployment automation |
| Product Team | Product Manager | Low | Provide workflow requirements, test generated deployments |

### Teams Involved

- **Infrastructure Team**: Primary implementation, analyzer and code generators
- **Backend Team**: Integration with workflow builders, testing
- **DevOps Team**: Deployment validation, CI/CD integration

### Communication Plan

- **Updates Frequency**: Weekly
- **Update Format**: Slack status update in #mvp-ryla-dev
- **Audience**: Infrastructure Team, Backend Team, DevOps Team

---

## Success Criteria

### Primary Success Metrics

| Metric | Target | Measurement Method | Timeline |
|--------|--------|-------------------|----------|
| **Workflow Analysis Time** | < 30 seconds | Time to analyze workflow JSON | End of Phase 1 |
| **GitHub Repo Discovery Rate** | > 80% of custom nodes | Percentage of nodes with discovered repos | End of Phase 2 |
| **Version Discovery Rate** | 100% for discovered repos | Percentage of repos with discovered versions | End of Phase 3 |
| **Model Source Detection Rate** | > 70% of models | Percentage of models with detected sources | End of Phase 4 |
| **Deployment Code Generation** | 100% success rate | Generated code deploys successfully | End of Phase 7 |
| **Time to Deploy** | < 5 minutes | Time from workflow JSON to deployed endpoint | End of Phase 7 |
| **Manual Steps Reduction** | 80% reduction | Compare manual vs. automated setup time | End of Phase 7 |

### Business Metrics Impact

**Target Metric**: [x] A-Activation [x] B-Retention [x] C-Core Value [ ] D-Conversion [x] E-CAC

**Expected Impact**:
- **E-CAC**: -80% infrastructure setup time = lower operational costs
- **C-Core Value**: Faster workflow deployment = more features = better product
- **B-Retention**: Fewer deployment failures = better reliability
- **A-Activation**: Faster feature delivery = more user value

### Leading Indicators

- Workflow analyzer successfully extracts dependencies from JSON
- GitHub repo discovery working for known custom nodes
- Version discovery system finding and pinning versions
- Generated Modal code deploys successfully
- Generated Dockerfiles build successfully

### Lagging Indicators

- New workflows deploy in < 5 minutes (vs. 2-4 hours manual)
- Zero deployment failures from missing dependencies
- Infrastructure setup time reduced by 80%
- Developers using tool for all new workflow deployments

---

## Definition of Done

### Initiative Complete When:

- [ ] Workflow analyzer accepts workflow JSON and extracts all dependencies
- [ ] GitHub repo discovery system finds repositories for >80% of custom nodes
- [ ] Version discovery system finds and pins versions for all discovered repos
- [ ] Model source detection identifies sources for >70% of models
- [ ] Modal code generator creates working deployment files
- [ ] RunPod code generator creates working Dockerfiles and install scripts
- [ ] Generated code deploys successfully (tested with 3+ workflows)
- [ ] Integration with existing RYLA tools complete
- [ ] Documentation updated (usage guide, examples)
- [ ] CLI tool or script available for developers
- [ ] Success metrics validated

### Not Done Criteria

**This initiative is NOT done if:**
- [ ] Workflow analyzer only works on TypeScript files (must accept JSON)
- [ ] GitHub repo discovery rate < 50%
- [ ] Generated code doesn't deploy successfully
- [ ] Manual steps still required for deployment
- [ ] Documentation missing or incomplete
- [ ] Integration with existing tools broken

---

## Related Work

### Epics

| Epic | Name | Status | Link |
|------|------|--------|------|
| EP-005 | Content Studio | Active | [EP-005](../requirements/epics/mvp/EP-005-content-studio.md) |
| EP-026 | LoRA Training | Proposed | [EP-026](../requirements/epics/mvp/EP-026-lora-training.md) |
| EP-039 | ComfyUI Dependency Management | In Progress | [EP-039](../requirements/epics/mvp/EP-039-comfyui-dependency-management.md) |

### Dependencies

- **Blocks**: Faster workflow deployment (enables rapid feature development)
- **Blocked By**: IN-008 Phase 2 (version discovery system needed)
- **Related Initiatives**: 
  - IN-008: ComfyUI Dependency Management (provides registry infrastructure)
  - IN-015: ComfyUI Workflow-to-API Platform Evaluation (informs deployment targets)
  - IN-007: ComfyUI Infrastructure Improvements (related infrastructure work)

### Documentation

- [ComfyUI Dependency Resolver](../../scripts/setup/comfyui-dependency-resolver.ts)
- [Node Package Mapper](../../scripts/setup/node-package-mapper.ts)
- [ComfyUI Registry](../../scripts/setup/comfyui-registry.ts)
- [Modal Deployment Guide](../../apps/modal/README-RYLA.md)
- [RunPod Serverless Setup](../../docs/technical/infrastructure/comfyui/COMFYUI-SERVERLESS-SETUP-GUIDE.md)

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|-------------------|
| **GitHub Repo Discovery Fails** | Medium | High | Fallback to manual registry, cache discovered repos, allow manual override |
| **Version Discovery API Rate Limits** | Medium | Medium | Cache results, use GitHub tokens, batch requests |
| **Generated Code Has Bugs** | Medium | High | Extensive testing with real workflows, code review, validation checks |
| **Unknown Custom Nodes** | High | Medium | Warn user, allow manual configuration, learn from user input |
| **Model Source Detection Fails** | Medium | Medium | Fallback to manual URLs, support multiple sources, allow manual override |
| **Integration Breaks Existing Tools** | Low | High | Maintain backward compatibility, extensive testing, incremental integration |
| **Platform-Specific Code Generation** | Medium | Medium | Abstract platform details, use templates, support multiple platforms |

---

## Progress Tracking

### Current Phase

**Phase**: Proposed  
**Status**: Not Started

### Recent Updates

- **2026-01-27**: Initiative created based on ComfyUI-to-API research and RYLA workflow deployment needs

### Next Steps

1. Review and approve initiative
2. Wait for IN-008 Phase 2 completion (version discovery system)
3. Start Phase 1: Enhanced workflow analysis (accept JSON input)
4. Research GitHub API for repo discovery strategies
5. Design code generation templates for Modal and RunPod

---

## Technical Implementation Details

### Workflow Analyzer Architecture

```typescript
// scripts/setup/workflow-analyzer.ts

interface WorkflowAnalysis {
  workflowId: string;
  workflowType: 'image' | 'video' | 'face-swap' | 'other';
  customNodes: {
    classType: string;
    packageName?: string;  // Manager package
    gitRepo?: {
      url: string;
      version?: string;
      discovered: boolean;
    };
  }[];
  models: {
    filename: string;
    type: 'checkpoint' | 'vae' | 'lora' | 'text-encoder' | 'other';
    source?: {
      huggingface?: { repo: string; file: string; commit?: string };
      civitai?: { modelId: string; versionId: string };
      url?: string;
    };
    discovered: boolean;
  }[];
  dependencies: {
    nodes: string[];
    models: string[];
    missing: {
      nodes: string[];
      models: string[];
    };
  };
}

export async function analyzeWorkflow(
  workflowJson: ComfyUIWorkflow
): Promise<WorkflowAnalysis> {
  // 1. Extract custom node types
  // 2. Extract model filenames
  // 3. Discover GitHub repos
  // 4. Discover versions
  // 5. Detect model sources
  // 6. Return analysis
}
```

### GitHub Repo Discovery

```typescript
// scripts/setup/github-repo-discovery.ts

async function discoverNodeRepository(
  classType: string,
  packageName?: string
): Promise<{ url: string; verified: boolean } | null> {
  // 1. Check ComfyUI Manager registry for package name
  // 2. Search GitHub for class type name
  // 3. Search GitHub for package name
  // 4. Verify repository structure (has custom_nodes folder, etc.)
  // 5. Cache result in registry
}
```

### Modal Code Generator

```typescript
// scripts/setup/generate-modal-code.ts

interface ModalCodeOptions {
  workflowName: string;
  workflowAnalysis: WorkflowAnalysis;
  modelsVolume: string;
  gpuType: 'L40S' | 'A100' | 'A10';
}

export function generateModalCode(
  options: ModalCodeOptions
): string {
  // Generate Python file with:
  // - Image definition with custom nodes
  // - Model download functions
  // - FastAPI endpoint
  // - Volume configuration
}
```

### RunPod Code Generator

```typescript
// scripts/setup/generate-runpod-code.ts

interface RunPodCodeOptions {
  workflowName: string;
  workflowAnalysis: WorkflowAnalysis;
  baseImage: string;
  networkVolume?: string;
}

export function generateRunPodDockerfile(
  options: RunPodCodeOptions
): string {
  // Generate Dockerfile with:
  // - Base image
  // - Custom node installation
  // - Model download commands
  // - Handler script
}
```

### CLI Tool

```bash
# Usage example
pnpm nx run scripts:analyze-workflow -- \
  --input workflow.json \
  --output analysis.json \
  --generate modal \
  --generate runpod

# Output:
# - analysis.json (dependency analysis)
# - apps/modal/comfyui_workflow_name.py (Modal deployment)
# - docker/comfyui-worker/Dockerfile.workflow_name (RunPod Dockerfile)
```

---

## Lessons Learned

[To be filled during/after initiative completion]

### What Went Well

- [To be documented]

### What Could Be Improved

- [To be documented]

### Recommendations for Future Initiatives

- [To be documented]

---

## References

- [ComfyUI-to-API Tool](https://comfy.getrunpod.io/) - Inspiration for automated workflow analysis
- [ComfyUI Manager Registry](https://raw.githubusercontent.com/Comfy-Org/ComfyUI-Manager/main/custom-node-list.json)
- [GitHub API Documentation](https://docs.github.com/en/rest)
- [HuggingFace API Documentation](https://huggingface.co/docs/api-inference)
- [Modal Documentation](https://modal.com/docs)
- [RunPod Serverless Documentation](https://docs.runpod.io/serverless/endpoints)
- [IN-008: ComfyUI Dependency Management](./IN-008-comfyui-dependency-management.md)
- [IN-015: ComfyUI Workflow-to-API Platform Evaluation](./IN-015-comfyui-workflow-api-alternatives.md)

---

**Template Version**: 1.0  
**Last Template Update**: 2026-01-27
