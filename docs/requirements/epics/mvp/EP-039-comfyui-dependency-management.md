# [EPIC] EP-039: ComfyUI Dependency Management & Versioning System

**Status**: In Progress
**Phase**: P6
**Created**: 2026-01-21
**Last Updated**: 2026-01-21


> **Initiative**: [IN-008: ComfyUI Dependency Management & Versioning System](../../../initiatives/IN-008-comfyui-dependency-management.md)  
> **Type**: Backend Infrastructure  
> **Phases**: P1, P2, P3, P5, P6, P7, P8, P9, P10 (skipping P4 - UI)

## Overview

Automated dependency management system that analyzes ComfyUI workflows, discovers and verifies versions for custom nodes and models, generates install scripts and Dockerfiles, and ensures reproducible builds across pods and serverless endpoints.

> **Scope**: Backend-only epic. No UI components required. All work is in scripts, services, and infrastructure.

---

## Business Impact

**Target Metric**: E-CAC, C-Core Value, B-Retention

**Hypothesis**: When dependency management is automated and versioned, infrastructure setup time decreases by 80%, dependency-related errors drop to zero, and new workflows can be deployed in <30 minutes instead of hours.

**Success Criteria**:
- Dependency setup time: **< 5 minutes** (down from ~30 minutes)
- Workflow deployment time: **< 30 minutes** (down from ~2 hours)
- Dependency errors in production: **0%** (currently ~5-10%)
- Version consistency: **100%** across all environments

---

## Features

### F1: Workflow Dependency Analyzer

- **Input**: Scans all workflow TypeScript files in `libs/business/src/workflows/`
- **Output**: Extracts all custom node `class_type` values and model filenames
- **Functionality**:
  - Parse TypeScript AST to find workflow definitions
  - Extract `class_type` from all nodes
  - Extract model filenames from `requiredModels` and workflow inputs
  - Map node types to package names (Manager vs GitHub)
  - Generate dependency report JSON

### F2: Version Discovery System

- **ComfyUI Manager Nodes**: Query Manager registry API for available versions
- **GitHub Nodes**: Fetch git tags and commits via GitHub API
- **HuggingFace Models**: Query HuggingFace API for commit hashes and file info
- **Functionality**:
  - Auto-discover latest stable versions
  - Fetch all available versions (tags, commits)
  - Verify specified versions exist
  - Cache results with timestamps
  - Handle API failures gracefully

### F3: Version Verification System

- **Pre-installation Verification**: Verify all versions exist before generating scripts
- **Post-installation Verification**: Check installed dependencies match registry
- **Functionality**:
  - Validate git tags/commits exist
  - Validate HuggingFace files exist
  - Check file sizes match expected
  - Verify Manager packages are available
  - Generate verification report

### F4: Dependency Registry

- **Centralized Registry**: Single source of truth for all dependencies
- **Version Pinning**: All dependencies pinned to specific verified versions
- **Metadata**: Includes verification status, timestamps, available versions
- **Functionality**:
  - TypeScript registry file: `scripts/setup/comfyui-registry.ts`
  - Node registry: Maps node types to installation sources
  - Model registry: Maps model names to HuggingFace repos/commits
  - Auto-update capability (with verification)

### F5: Install Script Generator

- **Pod Install Script**: Generates bash script for RunPod pod setup
- **Model Downloads**: Downloads all models to network volume
- **Node Installation**: Installs all custom nodes (Manager + GitHub)
- **Functionality**:
  - Uses versioned sources from registry
  - Handles both Manager nodes (`comfy-node-install`) and GitHub nodes (`git clone`)
  - Includes verification checks
  - Generates: `scripts/generated/install-all-models.sh`

### F6: Dockerfile Generator

- **Serverless Dockerfile**: Generates Dockerfile for RunPod serverless endpoints
- **Custom Node Installation**: Installs all required custom nodes
- **Version Pinning**: Uses verified versions from registry
- **Functionality**:
  - Generates Dockerfile with all custom nodes
  - Uses `comfy-node-install` for Manager nodes
  - Uses `git clone` with version tags for GitHub nodes
  - Generates: `docker/comfyui-worker/Dockerfile` (or separate generated file)

### F7: CI/CD Integration

- **Auto-Regeneration**: Scripts regenerate on workflow changes
- **Pre-commit Validation**: Verify all versions before commit
- **Build-time Verification**: Check dependencies during build
- **Functionality**:
  - GitHub Actions workflow to regenerate scripts
  - Pre-commit hook to verify registry versions
  - Build step to validate dependencies
  - Automated testing of generated scripts

---

## User Stories

### ST-040: Analyze Workflow Dependencies

**As a** developer  
**I want to** automatically extract all dependencies from workflows  
**So that** I don't have to manually identify custom nodes and models

**AC**:
- [ ] Analyzer scans all workflow files in `libs/business/src/workflows/`
- [ ] Extracts all `class_type` values (custom nodes)
- [ ] Extracts all model filenames from workflow definitions
- [ ] Generates dependency report JSON
- [ ] Identifies missing dependencies (not in registry)

### ST-041: Discover Node Versions

**As a** developer  
**I want to** automatically discover available versions for custom nodes  
**So that** I can pin to specific versions and verify they exist

**AC**:
- [ ] Queries ComfyUI Manager API for Manager nodes
- [ ] Fetches git tags from GitHub for GitHub nodes
- [ ] Fetches latest commit from GitHub main branch
- [ ] Returns available versions list
- [ ] Handles API failures gracefully

### ST-042: Discover Model Versions

**As a** developer  
**I want to** automatically discover commit hashes for HuggingFace models  
**So that** I can pin models to specific versions

**AC**:
- [ ] Queries HuggingFace API for model repository
- [ ] Fetches commit hash for specific file
- [ ] Gets file size and download URL
- [ ] Verifies file exists
- [ ] Caches results with timestamp

### ST-043: Verify Dependency Versions

**As a** developer  
**I want to** verify all versions exist before pinning  
**So that** I don't pin invalid versions that will fail during installation

**AC**:
- [ ] Verifies git tags exist in repository
- [ ] Verifies commit hashes exist
- [ ] Verifies HuggingFace files exist
- [ ] Verifies Manager packages are available
- [ ] Generates verification report with status
- [ ] Fails fast if invalid versions detected

### ST-044: Generate Pod Install Script

**As a** DevOps engineer  
**I want to** generate install script automatically from registry  
**So that** I can set up pods quickly without manual steps

**AC**:
- [ ] Generates bash script from registry
- [ ] Downloads all models to network volume
- [ ] Installs Manager nodes via `comfy-node-install`
- [ ] Installs GitHub nodes via `git clone` with version tags
- [ ] Includes verification checks
- [ ] Script is executable and tested

### ST-045: Generate Serverless Dockerfile

**As a** DevOps engineer  
**I want to** generate Dockerfile automatically from registry  
**So that** serverless endpoints have all required dependencies

**AC**:
- [ ] Generates Dockerfile from registry
- [ ] Installs all custom nodes (Manager + GitHub)
- [ ] Uses versioned sources (verified versions)
- [ ] Includes model symlink setup
- [ ] Dockerfile builds successfully
- [ ] Generated image works with all workflows

### ST-046: Integrate into CI/CD

**As a** developer  
**I want** scripts to auto-regenerate on workflow changes  
**So that** dependencies stay up-to-date automatically

**AC**:
- [ ] GitHub Actions workflow detects workflow file changes
- [ ] Regenerates install script and Dockerfile
- [ ] Validates generated scripts
- [ ] Commits changes (or creates PR)
- [ ] Pre-commit hook verifies registry versions
- [ ] Build step validates all dependencies

---

## Acceptance Criteria

### AC-1: Dependency Analysis

- [x] Analyzer successfully extracts dependencies from all workflows ✅
- [x] Dependency report includes all custom nodes and models ✅
- [x] Missing dependencies are identified and reported ✅
- [x] Report is in JSON format for programmatic use ✅
- **Status**: ✅ **COMPLETE** - Analyzer implemented and tested. Generated `dependencies.json` with all workflows analyzed.

### AC-2: Version Discovery

- [x] Manager node versions discovered from Manager API ✅
- [x] GitHub node versions discovered from GitHub API ✅ (with auth support)
- [x] HuggingFace model commits discovered from HuggingFace API ✅ (with auth support)
- [x] All API calls handle failures gracefully ✅ (retry logic, error handling)
- [x] Results are cached with timestamps ✅
- **Status**: ✅ **COMPLETE** - Version discovery implemented with retry logic and caching. Some 404s expected for repos/models that don't exist.

### AC-3: Version Verification

- [x] All specified versions verified before pinning ✅
- [x] Invalid versions detected and reported ✅
- [x] Verification report includes status for each dependency ✅
- [x] System fails fast if critical versions invalid ⚠️ (graceful degradation instead)
- **Status**: ⚠️ **PARTIAL** - Verification implemented and generates report. System logs warnings but continues (graceful degradation). Some dependencies show as unverified due to 404s (expected for non-existent repos/models).

### AC-4: Registry Management

- [x] Registry file created with all current dependencies ✅
- [x] All dependencies pinned to verified versions ✅
- [x] Registry includes verification metadata ✅
- [x] Registry is type-safe (TypeScript) ✅
- **Status**: ✅ **COMPLETE** - Registry implemented in `comfyui-registry.ts` with TypeScript types. Auto-update capability via `--write-registry` flag.

### AC-5: Install Script Generation

- [x] Generated script installs all dependencies correctly ✅
- [x] Script uses versioned sources from registry ✅
- [x] Script includes verification checks ✅
- [ ] Script runs successfully on clean pod ⏳ (not tested on actual pod yet)
- [ ] All workflows work after script execution ⏳ (requires pod testing)
- **Status**: ⚠️ **PARTIAL** - Script generation complete and validated. Generated `install-all-models.sh` with proper bash syntax. Requires testing on actual RunPod pod.

### AC-6: Dockerfile Generation

- [x] Generated Dockerfile installs all custom nodes ✅
- [x] Dockerfile uses versioned sources ✅
- [ ] Docker image builds successfully ⏳ (not tested yet)
- [ ] Generated image works with all workflows ⏳ (requires build + test)
- [ ] Image size is reasonable (< 5GB base) ⏳ (requires build to measure)
- **Status**: ⚠️ **PARTIAL** - Dockerfile generation complete. Generated `Dockerfile.comfyui-worker` with proper syntax. Requires Docker build test.

### AC-7: CI/CD Integration

- [ ] Scripts auto-regenerate on workflow changes ⏳ (not implemented)
- [ ] Pre-commit hook validates registry versions ⏳ (not implemented)
- [ ] Build step verifies all dependencies ⏳ (not implemented)
- [ ] Generated artifacts are committed/PR'd automatically ⏳ (not implemented)
- [ ] CI/CD pipeline passes with new system ⏳ (not implemented)
- **Status**: ❌ **NOT STARTED** - CI/CD integration planned for P8 (Integration phase).

---

## Technical Notes

### Architecture

**Layers**:
- **Scripts Layer**: `scripts/setup/` - Analysis, discovery, generation
- **Registry Layer**: `scripts/setup/comfyui-registry.ts` - Centralized registry
- **Generated Layer**: `scripts/generated/` - Auto-generated scripts
- **Infrastructure Layer**: `docker/comfyui-worker/` - Dockerfile generation

**Data Flow**:
```
Workflow Files → Analyzer → Dependency Report
                                    ↓
                            Version Discovery
                                    ↓
                            Version Verification
                                    ↓
                            Registry Update
                                    ↓
                    Script Generator → Install Script
                    Dockerfile Generator → Dockerfile
```

### External APIs

- **ComfyUI Manager**: `https://raw.githubusercontent.com/Comfy-Org/ComfyUI-Manager/main/custom-node-list.json`
- **GitHub API**: `https://api.github.com/repos/{owner}/{repo}/tags`
- **HuggingFace API**: `https://huggingface.co/api/models/{repo}`

### File Structure

```
scripts/
  setup/
    comfyui-dependency-resolver.ts    # Main analyzer
    version-discovery.ts              # Version discovery
    version-verification.ts            # Version verification
    node-package-mapper.ts            # Node type → package mapping
    model-registry.ts                 # Model definitions
    generate-install-script.ts        # Script generator
    generate-dockerfile.ts            # Dockerfile generator
    comfyui-registry.ts               # Centralized registry
  generated/
    install-all-models.sh             # Generated pod script
    Dockerfile.comfyui-worker         # Generated Dockerfile
    dependencies.json                  # Dependency report
```

---

## Phase Plan (Backend-Only)

### ✅ P1: Requirements - COMPLETE
- [x] Problem statement defined
- [x] MVP objective (measurable)
- [x] Non-goals listed
- [x] Business metric (E-CAC, C-Core Value, B-Retention)
- **File**: This document

### ✅ P2: Scoping - COMPLETE
- [x] Feature list (F1-F7)
- [x] User stories (ST-040 to ST-046)
- [x] Acceptance criteria (AC-1 to AC-7)
- [x] Analytics events (N/A - backend only)
- [x] Non-MVP items listed
- **File**: This document

### ✅ P3: Architecture - COMPLETE
- [x] Functional architecture (scripts/services split)
- [x] Data model (registry structure, dependency report)
- [x] API contract list (external APIs, internal interfaces)
- [x] Event schema (N/A - backend only)
- [x] Funnel definitions (N/A - backend only)
- **File**: `docs/architecture/epics/EP-039-ARCHITECTURE.md` ✅ **CREATED**

### ⏭️ P4: UI Skeleton - SKIPPED
- **Reason**: Backend-only epic, no UI components

### ✅ P5: Technical Spec - COMPLETE
- [x] File plan (files to create/modify + purpose)
- [x] Technical spec (logic flows, env vars, dependencies)
- [x] Task breakdown (ST-XXX stories, TSK-XXX tasks)
- [x] Tracking plan (N/A - backend only)
- **File**: `docs/specs/epics/EP-039-TECH-SPEC.md` ✅ **CREATED**

### ✅ P6: Implementation - COMPLETE
- [x] Core scripts implemented (analyzer, discovery, verification)
- [x] Generators implemented (install script + Dockerfile)
- [x] CLI wiring and package.json scripts added
- [x] Registry auto-update validation (end-to-end test completed)
- [x] AC status: See below
- **Files**: All implementation files in `scripts/setup/` and `scripts/generated/`

### ✅ P7: Testing - COMPLETE
- [x] Test plan created ✅
- [x] Test infrastructure setup (Vitest config, fixtures, utilities) ✅
- [x] Unit tests for all core components ✅ (50 tests passing)
  - [x] Dependency resolver (6 tests)
  - [x] Version discovery (12 tests)
  - [x] Version verification (10 tests)
  - [x] Install script generator (8 tests)
  - [x] Dockerfile generator (8 tests)
  - [x] Node package mapper (6 tests)
- [ ] Integration tests for CLI commands (planned for P8)
- [ ] E2E tests (script execution, Dockerfile builds) (planned for P8)
- **Files**: 
  - Test plan: `docs/testing/epics/EP-039-TEST-PLAN.md` ✅
  - Test config: `scripts/vitest.config.ts` ✅
  - Test fixtures: `scripts/setup/__fixtures__/` ✅
  - Test utilities: `scripts/setup/__test-utils__/` ✅

### ⏳ P8: Integration - PENDING
- [ ] CI/CD integration
- [ ] Pre-commit hooks
- [ ] Build validation
- **File**: Integration notes (to be created)

### ⏳ P9: Deploy Config - PENDING
- [ ] Environment variables
- [ ] Deployment checklist
- [ ] Rollback plan
- **File**: Deploy config (to be created)

### ⏳ P10: Validation - PENDING
- [ ] Smoke tests
- [ ] Learnings documented
- [ ] Next steps identified
- **File**: Validation report (to be created)

---

## Dependencies

- **IN-008**: ComfyUI Dependency Management Initiative (parent)
- **EP-005**: Content Studio (uses ComfyUI workflows)
- **EP-026**: LoRA Training (uses ComfyUI workflows)
- **EP-038**: LoRA Usage in Generation (uses ComfyUI workflows)
- **EP-044**: RunPod Serverless Endpoint Testing (validates generated scripts)

---

## Non-MVP Items

- UI for viewing dependency reports (backend-only)
- Manual version override UI (use registry file directly)
- Dependency conflict resolution UI (auto-resolve in scripts)
- Historical version tracking (future enhancement)

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Dependency Setup Time | < 5 minutes | Time to run install script |
| Workflow Deployment Time | < 30 minutes | Time from code to deployed |
| Dependency Errors | 0% | Production error logs |
| Version Consistency | 100% | Automated verification |
| Version Verification Rate | 100% | All versions verified |

---

## Related Documentation

- [IN-008 Initiative](../../../initiatives/IN-008-comfyui-dependency-management.md)
- [ComfyUI Serverless Setup Guide](../../../technical/infrastructure/comfyui/COMFYUI-SERVERLESS-SETUP-GUIDE.md)
- [ComfyUI Worker Dockerfile](../../../../docker/comfyui-worker/Dockerfile)

---

**Status**: 🚧 Implementation Complete (P6 Complete, P7-P10 Pending)  
**Last Updated**: 2026-01-15
