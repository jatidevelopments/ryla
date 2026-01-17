# EP-039 (P5) — ComfyUI Dependency Management: Tech Spec (File Plan + Tasks)

Working in **PHASE P5 (File plan + tasks)** on **EP-039, ST-040-ST-046**.

## Scope (MVP)

- Automated dependency analysis from workflow files
- Version discovery from external APIs (Manager, GitHub, HuggingFace)
- Version verification before pinning
- Centralized dependency registry with version pinning
- Install script generation for RunPod pods
- Dockerfile generation for serverless endpoints
- CI/CD integration for auto-regeneration

**Out of scope (MVP)**:
- UI for viewing dependency reports (backend-only)
- Manual version override UI (use registry file directly)
- Dependency conflict resolution UI (auto-resolve in scripts)
- Historical version tracking (future enhancement)
- Dependency update notifications (future enhancement)

---

## Prerequisites (Must Complete First)

### 1. Node.js Scripts Setup

**Status**: ⚠️ **REQUIRED BEFORE P6**

Ensure scripts can run TypeScript directly:
- `ts-node` or `tsx` installed
- TypeScript config for scripts directory
- Node.js 18+ required

**Files to check/create**:
- `scripts/tsconfig.json` - TypeScript config for scripts
- `package.json` - Ensure `ts-node` or `tsx` in devDependencies

---

## CLI Interface

### Main Commands

#### `pnpm analyze:dependencies`

Analyze all workflows and generate dependency report.

**Output**: `scripts/generated/dependencies.json`

**Options**:
- `--workflows-dir`: Path to workflow files (default: `libs/business/src/workflows`)
- `--output`: Output file path (default: `scripts/generated/dependencies.json`)
- `--verbose`: Show detailed output

#### `pnpm discover:versions`

Discover versions for all dependencies in registry.

**Output**: Updates registry with discovered versions

**Options**:
- `--registry`: Registry file path (default: `scripts/setup/comfyui-registry.ts`)
- `--cache`: Use cached results (default: true)
- `--force`: Force refresh (ignore cache)

#### `pnpm verify:versions`

Verify all versions in registry exist.

**Output**: Verification report to console and `scripts/generated/verification-report.json`

**Options**:
- `--registry`: Registry file path
- `--fail-fast`: Exit on first invalid version (default: false)

#### `pnpm generate:scripts`

Generate install script and Dockerfile.

**Output**: 
- `scripts/generated/install-all-models.sh`
- `scripts/generated/Dockerfile.comfyui-worker`

**Options**:
- `--registry`: Registry file path
- `--output-dir`: Output directory (default: `scripts/generated`)

#### `pnpm setup:all`

Run full pipeline: analyze → discover → verify → generate.

**Options**: Same as individual commands

---

## File Plan

### Scripts Setup Directory

#### Core Modules

- **Add** `scripts/setup/comfyui-dependency-resolver.ts`
  - **Purpose**: Analyze workflow files and extract dependencies
  - **Exports**: `DependencyAnalyzer` class, `analyzeWorkflows()` function
  - **Dependencies**: `typescript` compiler API, `fs-extra`, workflow registry
  - **Size**: ~300-400 lines

- **Add** `scripts/setup/version-discovery.ts`
  - **Purpose**: Discover versions from external APIs
  - **Exports**: `VersionDiscovery` class, discovery functions
  - **Dependencies**: `node-fetch` or `axios`, cache module
  - **Size**: ~400-500 lines

- **Add** `scripts/setup/version-verification.ts`
  - **Purpose**: Verify versions exist before pinning
  - **Exports**: `VersionVerification` class, verification functions
  - **Dependencies**: Version discovery module
  - **Size**: ~200-300 lines

- **Add** `scripts/setup/node-package-mapper.ts`
  - **Purpose**: Map node class_types to package names
  - **Exports**: `NODE_TO_PACKAGE_MAP` constant, `mapNodeToPackage()` function
  - **Dependencies**: None
  - **Size**: ~100-150 lines

- **Add** `scripts/setup/model-registry.ts`
  - **Purpose**: Model definitions and metadata
  - **Exports**: `MODEL_METADATA` constant, helper functions
  - **Dependencies**: None
  - **Size**: ~200-300 lines

- **Add** `scripts/setup/generate-install-script.ts`
  - **Purpose**: Generate bash script for pod setup
  - **Exports**: `ScriptGenerator` class, `generateInstallScript()` function
  - **Dependencies**: Registry module
  - **Size**: ~300-400 lines

- **Add** `scripts/setup/generate-dockerfile.ts`
  - **Purpose**: Generate Dockerfile for serverless
  - **Exports**: `DockerfileGenerator` class, `generateDockerfile()` function
  - **Dependencies**: Registry module
  - **Size**: ~200-300 lines

- **Add** `scripts/setup/comfyui-registry.ts`
  - **Purpose**: Centralized dependency registry
  - **Exports**: `COMFYUI_NODE_REGISTRY`, `COMFYUI_MODEL_REGISTRY` constants
  - **Dependencies**: Type definitions
  - **Size**: ~500-800 lines (grows with dependencies)

#### Type Definitions

- **Add** `scripts/setup/types.ts`
  - **Purpose**: TypeScript type definitions
  - **Exports**: `NodeInstallSource`, `ModelSource`, `DependencyReport`, etc.
  - **Dependencies**: None
  - **Size**: ~150-200 lines

#### Utilities

- **Add** `scripts/utils/api-client.ts`
  - **Purpose**: HTTP client for external APIs with retry logic
  - **Exports**: `ApiClient` class, retry utilities
  - **Dependencies**: `node-fetch` or `axios`
  - **Size**: ~150-200 lines

- **Add** `scripts/utils/cache.ts`
  - **Purpose**: Cache management for API responses
  - **Exports**: `Cache` class, cache utilities
  - **Dependencies**: `fs-extra`
  - **Size**: ~100-150 lines

- **Add** `scripts/utils/logger.ts`
  - **Purpose**: Logging utilities
  - **Exports**: `Logger` class, log functions
  - **Dependencies**: None
  - **Size**: ~50-100 lines

#### CLI Entry Points

- **Add** `scripts/setup/cli.ts`
  - **Purpose**: CLI command parser and router
  - **Exports**: Main CLI function
  - **Dependencies**: All core modules
  - **Size**: ~200-300 lines

### Generated Directory

- **Add** `scripts/generated/.gitkeep`
  - **Purpose**: Ensure directory exists in git
  - **Note**: Generated files may be git-ignored or committed (TBD)

- **Auto-generated** `scripts/generated/dependencies.json`
  - **Purpose**: Dependency analysis report
  - **Generated by**: `comfyui-dependency-resolver.ts`
  - **Format**: JSON

- **Auto-generated** `scripts/generated/verification-report.json`
  - **Purpose**: Version verification report
  - **Generated by**: `version-verification.ts`
  - **Format**: JSON

- **Auto-generated** `scripts/generated/install-all-models.sh`
  - **Purpose**: Pod install script
  - **Generated by**: `generate-install-script.ts`
  - **Format**: Bash script
  - **Executable**: Yes

- **Auto-generated** `scripts/generated/Dockerfile.comfyui-worker`
  - **Purpose**: Serverless Dockerfile
  - **Generated by**: `generate-dockerfile.ts`
  - **Format**: Dockerfile

### Configuration Files

- **Add** `scripts/tsconfig.json`
  - **Purpose**: TypeScript config for scripts
  - **Extends**: Root `tsconfig.json`
  - **Settings**: Node.js target, module resolution

- **Modify** `package.json`
  - **Add scripts**:
    - `analyze:dependencies`: Run dependency analyzer
    - `discover:versions`: Discover versions
    - `verify:versions`: Verify versions
    - `generate:scripts`: Generate scripts
    - `setup:all`: Run full pipeline
  - **Add devDependencies**:
    - `ts-node` or `tsx` (for running TypeScript)
    - `typescript` (if not already present)
    - `node-fetch` or `axios` (for HTTP requests)
    - `fs-extra` (for file operations)

### CI/CD Workflows

- **Add** `.github/workflows/regenerate-dependencies.yml`
  - **Purpose**: Auto-regenerate scripts on workflow changes
  - **Triggers**: Push to `main`, PR to `main`
  - **Actions**: Run `pnpm setup:all`, commit changes (or create PR)

- **Add** `.github/workflows/verify-registry.yml`
  - **Purpose**: Verify registry versions in CI
  - **Triggers**: Push, PR
  - **Actions**: Run `pnpm verify:versions`, fail if invalid

- **Add** `.husky/pre-commit` (or update existing)
  - **Purpose**: Pre-commit hook to verify registry
  - **Actions**: Run `pnpm verify:versions --fail-fast`

### Documentation

- **Add** `scripts/setup/README.md`
  - **Purpose**: Documentation for dependency management system
  - **Content**: Usage, commands, examples

---

## Task Breakdown

### ST-040: Analyze Workflow Dependencies

**Tasks**:

- **TSK-040-001**: Create `scripts/setup/types.ts` with type definitions
  - Define `DependencyReport`, `WorkflowDependency`, etc.
  - Estimated: 2 hours

- **TSK-040-002**: Create `scripts/setup/node-package-mapper.ts`
  - Map node class_types to package names
  - Include all known mappings (res4lyf, controlaltai-nodes, etc.)
  - Estimated: 3 hours

- **TSK-040-003**: Create `scripts/setup/comfyui-dependency-resolver.ts`
  - Parse TypeScript workflow files using compiler API
  - Extract `class_type` values from workflow definitions
  - Extract model filenames from `requiredModels` and workflow inputs
  - Generate dependency report JSON
  - Estimated: 8 hours

- **TSK-040-004**: Add CLI command `analyze:dependencies`
  - Create `scripts/setup/cli.ts` with command parser
  - Integrate dependency resolver
  - Add to `package.json` scripts
  - Estimated: 2 hours

**Total**: ~15 hours

### ST-041: Discover Node Versions

**Tasks**:

- **TSK-041-001**: Create `scripts/utils/api-client.ts`
  - HTTP client with retry logic and rate limiting
  - Support for GitHub, HuggingFace, Manager APIs
  - Estimated: 4 hours

- **TSK-041-002**: Create `scripts/utils/cache.ts`
  - File-based cache for API responses
  - TTL support (24 hours default)
  - Estimated: 3 hours

- **TSK-041-003**: Create `scripts/setup/version-discovery.ts`
  - Implement `discoverManagerNodeVersions()` function
  - Query ComfyUI Manager API
  - Implement `discoverGitHubNodeVersions()` function
  - Query GitHub API for tags and commits
  - Cache results
  - Estimated: 6 hours

- **TSK-041-004**: Add CLI command `discover:versions`
  - Integrate version discovery
  - Update registry with discovered versions
  - Add to `package.json` scripts
  - Estimated: 2 hours

**Total**: ~15 hours

### ST-042: Discover Model Versions

**Tasks**:

- **TSK-042-001**: Extend `scripts/setup/version-discovery.ts`
  - Implement `discoverHuggingFaceModelVersion()` function
  - Query HuggingFace API for model commits
  - Get file size and download URL
  - Estimated: 4 hours

- **TSK-042-002**: Create `scripts/setup/model-registry.ts`
  - Define model metadata structure
  - Include all current models (Z-Image, FLUX, PuLID, etc.)
  - Estimated: 3 hours

**Total**: ~7 hours

### ST-043: Verify Dependency Versions

**Tasks**:

- **TSK-043-001**: Create `scripts/setup/version-verification.ts`
  - Implement `verifyAllVersions()` function
  - Verify git tags exist
  - Verify commit hashes exist
  - Verify HuggingFace files exist
  - Verify Manager packages available
  - Generate verification report
  - Estimated: 6 hours

- **TSK-043-002**: Add CLI command `verify:versions`
  - Integrate version verification
  - Output verification report
  - Add `--fail-fast` option
  - Estimated: 2 hours

**Total**: ~8 hours

### ST-044: Generate Pod Install Script

**Tasks**:

- **TSK-044-001**: Create `scripts/setup/comfyui-registry.ts`
  - Define `COMFYUI_NODE_REGISTRY` with all current nodes
  - Define `COMFYUI_MODEL_REGISTRY` with all current models
  - Include verification metadata structure
  - Estimated: 6 hours

- **TSK-044-002**: Create `scripts/setup/generate-install-script.ts`
  - Implement `generateInstallScript()` function
  - Generate bash script with model downloads
  - Generate Manager node installation (`comfy-node-install`)
  - Generate GitHub node installation (`git clone` with versions)
  - Include verification checks
  - Estimated: 8 hours

- **TSK-044-003**: Add CLI command `generate:scripts`
  - Integrate script generator
  - Output to `scripts/generated/install-all-models.sh`
  - Make script executable
  - Estimated: 2 hours

**Total**: ~16 hours

### ST-045: Generate Serverless Dockerfile

**Tasks**:

- **TSK-045-001**: Create `scripts/setup/generate-dockerfile.ts`
  - Implement `generateDockerfile()` function
  - Generate Dockerfile with base image
  - Install Manager nodes via `comfy-node-install`
  - Install GitHub nodes via `git clone` with version tags
  - Include model symlink setup
  - Estimated: 6 hours

- **TSK-045-002**: Extend CLI command `generate:scripts`
  - Also generate Dockerfile
  - Output to `scripts/generated/Dockerfile.comfyui-worker`
  - Estimated: 1 hour

**Total**: ~7 hours

### ST-046: Integrate into CI/CD

**Tasks**:

- **TSK-046-001**: Create `.github/workflows/regenerate-dependencies.yml`
  - Detect workflow file changes
  - Run `pnpm setup:all`
  - Validate generated scripts
  - Commit changes (or create PR)
  - Estimated: 4 hours

- **TSK-046-002**: Create `.github/workflows/verify-registry.yml`
  - Run `pnpm verify:versions` on push/PR
  - Fail if invalid versions detected
  - Estimated: 2 hours

- **TSK-046-003**: Add pre-commit hook
  - Update `.husky/pre-commit` (or create)
  - Run `pnpm verify:versions --fail-fast`
  - Estimated: 1 hour

- **TSK-046-004**: Add `setup:all` CLI command
  - Run full pipeline: analyze → discover → verify → generate
  - Add to `package.json` scripts
  - Estimated: 2 hours

**Total**: ~9 hours

---

## Implementation Order

### Phase 1: Foundation (Week 1)

1. **TSK-040-001**: Create type definitions
2. **TSK-040-002**: Create node package mapper
3. **TSK-041-001**: Create API client utility
4. **TSK-041-002**: Create cache utility
5. **TSK-044-001**: Create registry structure (initial version)

**Dependencies**: None  
**Estimated**: ~20 hours

### Phase 2: Analysis & Discovery (Week 2)

6. **TSK-040-003**: Create dependency analyzer
7. **TSK-040-004**: Add analyze CLI command
8. **TSK-041-003**: Create version discovery
9. **TSK-042-001**: Extend discovery for HuggingFace
10. **TSK-042-002**: Create model registry

**Dependencies**: Phase 1  
**Estimated**: ~20 hours

### Phase 3: Verification (Week 2-3)

11. **TSK-043-001**: Create version verification
12. **TSK-043-002**: Add verify CLI command

**Dependencies**: Phase 2  
**Estimated**: ~8 hours

### Phase 4: Generation (Week 3)

13. **TSK-044-002**: Create install script generator
14. **TSK-044-003**: Add generate CLI command
15. **TSK-045-001**: Create Dockerfile generator
16. **TSK-045-002**: Extend generate command

**Dependencies**: Phase 3  
**Estimated**: ~17 hours

### Phase 5: CI/CD Integration (Week 4)

17. **TSK-046-001**: Create GitHub Actions workflow
18. **TSK-046-002**: Create verification workflow
19. **TSK-046-003**: Add pre-commit hook
20. **TSK-046-004**: Add setup:all command

**Dependencies**: Phase 4  
**Estimated**: ~9 hours

---

## Dependencies Between Tasks

```
TSK-040-001 (types) 
  → TSK-040-002 (mapper)
  → TSK-040-003 (analyzer)
  → TSK-040-004 (analyze CLI)

TSK-041-001 (API client)
  → TSK-041-002 (cache)
  → TSK-041-003 (discovery)
  → TSK-041-004 (discover CLI)

TSK-042-001 (HuggingFace discovery)
  → TSK-042-002 (model registry)

TSK-041-003 + TSK-042-001
  → TSK-043-001 (verification)
  → TSK-043-002 (verify CLI)

TSK-044-001 (registry)
  → TSK-044-002 (script generator)
  → TSK-044-003 (generate CLI)

TSK-044-002
  → TSK-045-001 (Dockerfile generator)
  → TSK-045-002 (extend generate)

TSK-040-004 + TSK-041-004 + TSK-043-002 + TSK-044-003 + TSK-045-002
  → TSK-046-004 (setup:all)

TSK-046-004
  → TSK-046-001 (GitHub Actions)
  → TSK-046-002 (verify workflow)
  → TSK-046-003 (pre-commit)
```

---

## Environment Variables

```bash
# Optional: GitHub API token for higher rate limits
GITHUB_TOKEN=

# Optional: HuggingFace token (if needed for private repos)
HUGGINGFACE_TOKEN=

# Registry cache directory
REGISTRY_CACHE_DIR=./scripts/generated/.cache

# Generated files directory
GENERATED_DIR=./scripts/generated

# Workflows directory (default: libs/business/src/workflows)
WORKFLOWS_DIR=./libs/business/src/workflows

# Registry file path (default: scripts/setup/comfyui-registry.ts)
REGISTRY_FILE=./scripts/setup/comfyui-registry.ts
```

---

## Testing Strategy

### Unit Tests

- **Location**: `scripts/setup/__tests__/`
- **Coverage**: All core modules
- **Tools**: Vitest
- **Files**:
  - `comfyui-dependency-resolver.test.ts`
  - `version-discovery.test.ts`
  - `version-verification.test.ts`
  - `generate-install-script.test.ts`
  - `generate-dockerfile.test.ts`

### Integration Tests

- **Location**: `scripts/setup/__tests__/integration/`
- **Coverage**: End-to-end pipeline
- **Files**:
  - `full-pipeline.test.ts` - Test analyze → discover → verify → generate

### E2E Tests

- **Location**: `scripts/setup/__tests__/e2e/`
- **Coverage**: Script execution, Dockerfile builds
- **Files**:
  - `install-script.test.ts` - Test generated script on clean pod
  - `dockerfile-build.test.ts` - Test Dockerfile builds successfully

---

## Success Criteria

### Technical

- [ ] All scripts run without errors
- [ ] Generated install script works on clean RunPod pod
- [ ] Generated Dockerfile builds successfully
- [ ] All dependencies verified before pinning
- [ ] CI/CD pipeline passes
- [ ] Pre-commit hook prevents invalid versions

### Functional

- [ ] Dependency analyzer extracts all nodes and models
- [ ] Version discovery finds versions for all dependencies
- [ ] Version verification catches invalid versions
- [ ] Generated scripts install all dependencies correctly
- [ ] All workflows work after script execution

---

## Next Steps (P6: Implementation)

1. Start with Phase 1: Foundation tasks
2. Create type definitions and utilities
3. Build dependency analyzer
4. Implement version discovery
5. Add verification system
6. Generate scripts
7. Integrate CI/CD

---

**Status**: ✅ P5 Complete  
**Last Updated**: 2026-01-27
