# [INITIATIVE] IN-008: ComfyUI Dependency Management & Versioning System

**Status**: Proposed  
**Created**: 2026-01-27  
**Last Updated**: 2026-01-27  
**Owner**: Infrastructure Team  
**Stakeholders**: Backend Team, DevOps Team, Product Team

---

## Executive Summary

**One-sentence description**: Implement an automated dependency management system that analyzes ComfyUI workflows, identifies required custom nodes and models, generates versioned install scripts, and ensures reproducible builds across pods and serverless endpoints.

**Business Impact**: E-CAC (reduces infrastructure setup time and costs), C-Core Value (ensures reliable image generation), B-Retention (prevents workflow failures from dependency issues)

---

## Why (Business Rationale)

### Problem Statement

Currently, managing ComfyUI dependencies (custom nodes and models) is manual, error-prone, and time-consuming:

- **Manual Setup**: Each new workflow requires manually identifying and installing custom nodes
- **Version Drift**: No version pinning means upstream updates can break workflows
- **Inconsistent Environments**: Pods and serverless endpoints can have different node versions
- **Time Waste**: Developers spend hours troubleshooting "missing node" errors
- **No Automation**: Adding a new workflow requires manual Dockerfile updates and pod setup
- **Unclear Dependencies**: Hard to know what nodes/models a workflow needs without testing

**Key Pain Points**:
- Adding a new workflow requires manual research into custom nodes
- Dockerfile updates needed for every new custom node
- No way to verify all dependencies are installed correctly
- Version mismatches cause silent failures
- Network volume model installation is manual and error-prone

### Current State

- **Dependency Discovery**: Manual - developers read workflow code to identify nodes
- **Node Installation**: Mix of `comfy-node-install` (for Manager nodes) and `git clone` (for others)
- **Version Management**: No version pinning - always uses latest
- **Model Management**: Manual download scripts with hardcoded URLs
- **Dockerfile**: Manually updated when new nodes added
- **Pod Setup**: Manual scripts run via SSH
- **Verification**: No automated checks for installed dependencies

### Desired State

- **Automated Discovery**: System analyzes all workflows and extracts dependencies
- **Version Pinning**: All nodes and models pinned to specific versions (git tags/commits)
- **Single Source of Truth**: Centralized registry of all nodes/models with versions
- **Auto-Generated Scripts**: Install scripts generated automatically from workflow analysis
- **Auto-Generated Dockerfile**: Dockerfile updated automatically when dependencies change
- **Reproducible Builds**: Same versions installed every time
- **Verification**: Automated checks ensure all dependencies are correctly installed

### Business Drivers

- **Revenue Impact**: Faster workflow deployment = faster feature delivery = more revenue
- **Cost Impact**: Reduces infrastructure setup time by 80%, reduces debugging time
- **Risk Mitigation**: Prevents production failures from dependency issues
- **Competitive Advantage**: Faster iteration on new workflows than competitors
- **User Experience**: Fewer generation failures from missing dependencies

---

## How (Approach & Strategy)

### Strategy

1. **Automated Dependency Analysis**
   - Scan all workflow TypeScript files in `libs/business/src/workflows/`
   - Extract `class_type` values (custom node types)
   - Extract model filenames from workflow definitions
   - Map node types to package names (ComfyUI Manager or GitHub repos)

2. **Automatic Version Discovery & Verification**
   - **ComfyUI Manager Nodes**: Query Manager registry API to get available versions
   - **GitHub Nodes**: Fetch git tags/commits from repository, verify they exist
   - **HuggingFace Models**: Query HuggingFace API to get commit hashes, verify files exist
   - **Version Verification**: Before pinning, verify specified version exists
   - **Auto-Update**: Optionally auto-update to latest stable version if current is invalid

3. **Versioned Registry System**
   - Create centralized registry: `scripts/setup/comfyui-registry.ts`
   - Map node types to installation sources (Manager package vs GitHub)
   - Pin versions using git tags/commits for GitHub nodes (auto-discovered)
   - Pin model versions using HuggingFace commit hashes (auto-discovered)
   - Registry is version-controlled in repo (single source of truth)
   - Registry includes verification status for each dependency

4. **Script Generation**
   - Generate pod install script: `scripts/generated/install-all-models.sh`
   - Generates Dockerfile: `docker/comfyui-worker/Dockerfile` (or separate generated file)
   - Uses versioned sources from registry (verified versions only)
   - Handles both Manager nodes and GitHub nodes
   - Includes verification checks in generated scripts

5. **Verification & Validation**
   - **Pre-installation**: Verify all versions exist before generating scripts
   - **Post-installation**: Check installed nodes match registry versions
   - **Model Verification**: Verify models are present and correct size/hash
   - **Version Consistency**: Ensure same versions across all environments
   - Generate dependency report JSON with verification status

### Key Principles

- **Single Source of Truth**: Registry file is the authoritative source for all dependencies
- **Version Pinning**: All dependencies pinned to specific versions for reproducibility
- **Automation First**: Minimize manual steps, maximize automation
- **Fail Fast**: Detect missing dependencies early (at build time, not runtime)
- **Backward Compatible**: Existing workflows continue to work

### Phases

1. **Phase 1: Registry & Analysis** - Create dependency registry, build analyzer - 1 week
2. **Phase 2: Version Discovery & Verification** - Build automatic version discovery and verification system - 1 week
3. **Phase 3: Script Generation** - Generate install scripts and Dockerfile with verified versions - 1 week
4. **Phase 4: Version Pinning** - Auto-discover and pin all current dependencies - 1 week
5. **Phase 5: Integration & Testing** - Integrate into CI/CD, test end-to-end - 1 week

**Total Timeline**: 5 weeks

### Dependencies

- **IN-006**: LoRA Character Consistency System (uses ComfyUI workflows)
- **IN-007**: ComfyUI Infrastructure Improvements (related infrastructure work)
- **EP-005**: Content Studio (uses ComfyUI workflows)

### Constraints

- Must maintain backward compatibility with existing workflows
- Cannot break existing pod/serverless deployments
- Must work with RunPod's `comfy-node-install` tool
- Must support both Manager nodes and GitHub nodes

---

## When (Timeline & Priority)

### Timeline

- **Start Date**: 2026-02-01 (after IN-006 Phase 1 completes)
- **Target Completion**: 2026-03-07
- **Key Milestones**:
  - **M1: Registry Created**: 2026-02-07
  - **M2: Analyzer Working**: 2026-02-14
  - **M3: Version Discovery System**: 2026-02-21
  - **M4: Script Generation**: 2026-02-28
  - **M5: Full Integration**: 2026-03-07

### Priority

**Priority Level**: P1

**Rationale**: 
- Blocks efficient workflow development (IN-006, EP-005)
- Reduces infrastructure costs (E-CAC)
- Prevents production issues (C-Core Value)
- Enables faster feature delivery

### Resource Requirements

- **Team**: Infrastructure Team (1 engineer), Backend Team (0.5 engineer for integration)
- **Budget**: No additional budget required (uses existing infrastructure)
- **External Dependencies**: 
  - ComfyUI Manager registry (public, no API key needed)
  - GitHub repositories (public access)
  - HuggingFace (public access)

---

## Who (Stakeholders & Ownership)

### Initiative Owner

**Name**: Infrastructure Team Lead  
**Role**: Infrastructure Team  
**Responsibilities**: 
- Design and implement dependency management system
- Maintain registry and version pinning
- Ensure system works with RunPod infrastructure

### Key Stakeholders

| Name | Role | Involvement | Responsibilities |
|------|------|-------------|------------------|
| Backend Team | Backend | High | Integrate analyzer into build process, use generated scripts |
| DevOps Team | DevOps | Medium | CI/CD integration, deployment automation |
| Product Team | Product | Low | Provide workflow requirements, test generated workflows |

### Teams Involved

- **Infrastructure Team**: Primary implementation, registry maintenance
- **Backend Team**: Integration with workflow builders, testing
- **DevOps Team**: CI/CD integration, deployment automation

### Communication Plan

- **Updates Frequency**: Weekly
- **Update Format**: Slack status update in #mvp-ryla-dev
- **Audience**: Infrastructure Team, Backend Team, DevOps Team

---

## Success Criteria

### Primary Success Metrics

| Metric | Target | Measurement Method | Timeline |
|--------|--------|-------------------|----------|
| Dependency Setup Time | < 5 minutes | Time to run install script | End of Phase 4 |
| Workflow Deployment Time | < 30 minutes | Time from workflow code to deployed | End of Phase 5 |
| Dependency Errors | 0 in production | Error logs, user reports | Ongoing |
| Version Consistency | 100% match | Automated verification | Ongoing |
| Version Verification Rate | 100% verified | All versions verified before pinning | End of Phase 2 |
| Invalid Version Detection | 100% caught | Invalid versions detected before install | End of Phase 2 |

### Business Metrics Impact

**Target Metric**: [x] E-CAC [x] C-Core Value [x] B-Retention

**Expected Impact**:
- **E-CAC**: -50% infrastructure setup time = lower operational costs
- **C-Core Value**: 0% dependency-related generation failures = better user experience
- **B-Retention**: Fewer workflow failures = higher user satisfaction

### Leading Indicators

- Registry file created with all current dependencies
- Analyzer successfully extracts dependencies from workflows
- Generated scripts install all dependencies correctly
- Dockerfile builds successfully with generated dependencies

### Lagging Indicators

- Zero dependency-related production errors
- New workflows deploy without manual dependency setup
- Infrastructure setup time reduced by 80%
- All workflows work consistently across pods/serverless

---

## Definition of Done

### Initiative Complete When:

- [ ] Dependency registry created with all current nodes/models
- [ ] Automatic version discovery system implemented (Manager, GitHub, HuggingFace)
- [ ] Version verification system validates all versions exist before pinning
- [ ] All dependencies pinned to specific verified versions
- [ ] Analyzer extracts dependencies from all workflows
- [ ] Install script generator creates working pod setup script with verified versions
- [ ] Dockerfile generator creates working serverless Dockerfile with verified versions
- [ ] Pre-installation verification checks all versions exist
- [ ] Post-installation verification system checks installed dependencies
- [ ] CI/CD integrated (scripts auto-regenerate on workflow changes)
- [ ] Documentation updated (setup guides, registry maintenance, version discovery)
- [ ] All existing workflows verified to work with new system
- [ ] Zero dependency-related errors in production for 1 week

### Not Done Criteria

**This initiative is NOT done if:**
- [ ] Dependencies not pinned to specific versions
- [ ] Manual steps still required for new workflows
- [ ] Generated scripts don't work correctly
- [ ] Version mismatches possible between environments
- [ ] Documentation missing or incomplete
- [ ] Production errors from dependency issues

---

## Related Work

### Epics

| Epic | Name | Status | Link |
|------|------|--------|------|
| EP-005 | Content Studio | Active | [Link](../requirements/epics/mvp/EP-005-content-studio.md) |
| EP-026 | LoRA Training | Proposed | [Link](../requirements/epics/mvp/EP-026-lora-training.md) |
| EP-038 | LoRA Usage in Generation | Proposed | [Link](../requirements/epics/mvp/EP-038-lora-usage-in-generation.md) |

### Dependencies

- **Blocks**: Faster workflow development (enables IN-006, EP-005)
- **Blocked By**: None (can start immediately)
- **Related Initiatives**: 
  - IN-006: LoRA Character Consistency System (uses workflows)
  - IN-007: ComfyUI Infrastructure Improvements (related infrastructure)

### Documentation

- [ComfyUI Serverless Setup Guide](../technical/infrastructure/comfyui/COMFYUI-SERVERLESS-SETUP-GUIDE.md)
- [ComfyUI Worker Dockerfile](../../docker/comfyui-worker/Dockerfile)
- [PuLID Setup Guide](../../ops/runpod/PULID-SETUP.md)

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|-------------------|
| ComfyUI Manager registry changes format | Medium | High | Cache registry locally, version pin our copy, add format validation |
| GitHub repositories deleted/renamed | Low | High | Fork critical repos, maintain mirrors, verify in CI/CD |
| Version pinning breaks compatibility | Medium | Medium | Test all workflows after pinning, maintain compatibility matrix |
| Generated scripts fail in production | Medium | High | Extensive testing in staging, rollback plan |
| Registry maintenance overhead | Medium | Low | Automate registry updates where possible, document maintenance process |
| Version discovery API failures | Medium | Medium | Cache results, fallback to manual verification, retry logic |
| Invalid versions in registry | Low | High | Pre-commit hooks verify all versions, CI/CD validation |

---

## Progress Tracking

### Current Phase

**Phase**: Proposed  
**Status**: Not Started

### Recent Updates

- **2026-01-27**: Initiative created

### Next Steps

1. Review and approve initiative
2. Assign Infrastructure Team engineer
3. Start Phase 1: Create dependency registry structure
4. Analyze all existing workflows to extract dependencies
5. Research API endpoints for version discovery:
   - ComfyUI Manager registry API
   - GitHub API for tags/commits
   - HuggingFace API for model commits

---

## Technical Details

### Registry Structure

```typescript
// scripts/setup/comfyui-registry.ts
export const COMFYUI_NODE_REGISTRY: Record<string, NodeInstallSource> = {
  // Manager nodes (via comfy-node-install)
  'res4lyf': {
    managerPackage: 'res4lyf',
    expectedVersion: 'latest', // Manager handles versioning
    verified: true, // Auto-verified via Manager API
    lastVerified: '2026-01-27T10:00:00Z',
  },
  
  // GitHub nodes (with version pinning)
  'ComfyUI-PuLID': {
    gitRepo: {
      url: 'https://github.com/cubiq/ComfyUI_PuLID.git',
      version: 'v1.0.0', // Git tag (auto-discovered)
      verified: true, // Auto-verified via GitHub API
      availableVersions: ['v1.0.0', 'v0.9.1', 'main'], // Auto-discovered
    },
  },
};

export const COMFYUI_MODEL_REGISTRY: Record<string, ModelSource> = {
  'pulid_flux_v0.9.1.safetensors': {
    huggingface: {
      repo: 'huchenlei/PuLID',
      file: 'pulid_flux_v0.9.1.safetensors',
      commit: 'abc123def456', // Commit hash (auto-discovered)
      path: 'models/pulid/',
      verified: true, // Auto-verified via HuggingFace API
      fileSize: 1200000000, // Auto-discovered
      lastVerified: '2026-01-27T10:00:00Z',
    },
  },
};
```

### Version Discovery & Verification System

**Automatic Version Discovery**:
```typescript
// scripts/setup/version-discovery.ts

// 1. ComfyUI Manager Nodes
async function discoverManagerNodeVersions(packageName: string) {
  // Query Manager registry API
  const response = await fetch('https://raw.githubusercontent.com/Comfy-Org/ComfyUI-Manager/main/custom-node-list.json');
  const registry = await response.json();
  const nodeInfo = registry.find(n => n.package === packageName);
  return {
    available: nodeInfo !== undefined,
    latestVersion: nodeInfo?.version,
    allVersions: nodeInfo?.versions || [],
  };
}

// 2. GitHub Nodes
async function discoverGitHubNodeVersions(repoUrl: string) {
  // Extract owner/repo from URL
  const match = repoUrl.match(/github.com\/([^\/]+)\/([^\/]+)/);
  const [owner, repo] = [match[1], match[2]];
  
  // Fetch tags via GitHub API
  const tagsResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/tags`);
  const tags = await tagsResponse.json();
  
  // Fetch latest commit from main branch
  const commitResponse = await fetch(`https://api.github.com/repos/${owner}/${repo}/commits/main`);
  const commit = await commitResponse.json();
  
  return {
    tags: tags.map(t => t.name),
    latestCommit: commit.sha,
    verified: true,
  };
}

// 3. HuggingFace Models
async function discoverHuggingFaceModelVersion(repo: string, file: string) {
  // Query HuggingFace API
  const response = await fetch(`https://huggingface.co/api/models/${repo}`);
  const modelInfo = await response.json();
  
  // Get file info with commit hash
  const fileResponse = await fetch(`https://huggingface.co/api/models/${repo}/tree/main`);
  const files = await fileResponse.json();
  const fileInfo = files.find(f => f.path === file);
  
  return {
    commit: fileInfo?.oid, // Commit hash
    fileSize: fileInfo?.size,
    verified: fileInfo !== undefined,
    downloadUrl: `https://huggingface.co/${repo}/resolve/${fileInfo?.oid}/${file}`,
  };
}

// 4. Verification System
async function verifyAllVersions(registry: Registry) {
  const results = {
    nodes: [] as VerificationResult[],
    models: [] as VerificationResult[],
  };
  
  // Verify all nodes
  for (const [nodeName, nodeSource] of Object.entries(registry.nodes)) {
    if (nodeSource.managerPackage) {
      const verification = await discoverManagerNodeVersions(nodeSource.managerPackage);
      results.nodes.push({ nodeName, verified: verification.available, ...verification });
    } else if (nodeSource.gitRepo) {
      const verification = await discoverGitHubNodeVersions(nodeSource.gitRepo.url);
      const versionExists = verification.tags.includes(nodeSource.gitRepo.version) || 
                           verification.latestCommit === nodeSource.gitRepo.version;
      results.nodes.push({ nodeName, verified: versionExists, ...verification });
    }
  }
  
  // Verify all models
  for (const [modelName, modelSource] of Object.entries(registry.models)) {
    if (modelSource.huggingface) {
      const verification = await discoverHuggingFaceModelVersion(
        modelSource.huggingface.repo,
        modelSource.huggingface.file
      );
      results.models.push({ modelName, verified: verification.verified, ...verification });
    }
  }
  
  return results;
}
```

### Analyzer Output

```typescript
interface DependencyReport {
  workflows: {
    id: string;
    name: string;
    nodes: string[];      // Custom node class_types
    models: string[];     // Model filenames
  }[];
  uniqueNodes: string[];  // All unique custom nodes
  uniqueModels: string[]; // All unique models
  missingFromRegistry: {
    nodes: string[];
    models: string[];
  };
  verificationStatus: {
    nodes: {
      [nodeName: string]: {
        verified: boolean;
        version: string;
        availableVersions?: string[];
        error?: string;
      };
    };
    models: {
      [modelName: string]: {
        verified: boolean;
        commit: string;
        fileSize?: number;
        error?: string;
      };
    };
  };
}
```

### Generated Artifacts

1. **Pod Install Script** (`scripts/generated/install-all-models.sh`)
   - Downloads all models to network volume
   - Installs all custom nodes
   - Uses versioned sources

2. **Dockerfile** (`docker/comfyui-worker/Dockerfile` or generated variant)
   - Installs all custom nodes via Manager or git
   - Uses versioned sources

3. **Dependency Report** (`scripts/generated/dependencies.json`)
   - Full dependency analysis
   - Missing dependencies list
   - Version information

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

- [ComfyUI Manager GitHub](https://github.com/Comfy-Org/ComfyUI-Manager)
- [ComfyUI Manager Model List](https://raw.githubusercontent.com/Comfy-Org/ComfyUI-Manager/main/model-list.json)
- [RunPod ComfyUI Worker](https://github.com/runpod-workers/worker-comfyui)
- [ComfyUI Serverless Setup Guide](../technical/infrastructure/comfyui/COMFYUI-SERVERLESS-SETUP-GUIDE.md)

---

**Template Version**: 1.0  
**Last Template Update**: 2026-01-27
