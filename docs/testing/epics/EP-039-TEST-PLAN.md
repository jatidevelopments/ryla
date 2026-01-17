# EP-039: ComfyUI Dependency Management - Test Plan

> **Epic**: [EP-039: ComfyUI Dependency Management & Versioning System](../../requirements/epics/mvp/EP-039-comfyui-dependency-management.md)  
> **Phase**: P7 (Testing)  
> **Status**: 🚧 In Progress

## Overview

Comprehensive test coverage for the ComfyUI dependency management system, including unit tests for core functions, integration tests for CLI commands, and E2E tests for script execution.

---

## Test Strategy

### Test Levels

1. **Unit Tests** - Test individual functions in isolation
2. **Integration Tests** - Test component interactions
3. **E2E Tests** - Test full CLI workflows and generated scripts

### Test Framework

- **Framework**: Vitest (consistent with project standards)
- **Location**: `scripts/setup/**/*.spec.ts`
- **Config**: `scripts/vitest.config.ts`

---

## Unit Tests

### T1: Dependency Analyzer (`comfyui-dependency-resolver.ts`)

**Test File**: `scripts/setup/comfyui-dependency-resolver.spec.ts`

#### Test Cases

- ✅ `analyzeWorkflows()` - Extracts nodes and models from workflow files
  - [ ] Handles single workflow file
  - [ ] Handles multiple workflow files
  - [ ] Extracts all `class_type` values
  - [ ] Extracts all model filenames
  - [ ] Handles missing workflow files gracefully
  - [ ] Handles invalid workflow JSON gracefully

- ✅ `analyzeWorkflow()` - Analyzes single workflow
  - [ ] Extracts nodes from workflow JSON
  - [ ] Extracts models from `requiredModels`
  - [ ] Extracts models from node inputs
  - [ ] Handles nested node structures
  - [ ] Handles missing fields gracefully

### T2: Version Discovery (`version-discovery.ts`)

**Test File**: `scripts/setup/version-discovery.spec.ts`

#### Test Cases

- ✅ `discoverManagerNodeVersions()` - Discovers Manager node versions
  - [ ] Fetches from Manager API
  - [ ] Parses registry correctly
  - [ ] Returns available versions
  - [ ] Handles API failures gracefully
  - [ ] Uses cache when available

- ✅ `discoverGitHubNodeVersions()` - Discovers GitHub node versions
  - [ ] Fetches tags from GitHub API
  - [ ] Fetches latest commit
  - [ ] Handles authentication (with/without token)
  - [ ] Handles 404 errors gracefully
  - [ ] Uses cache when available

- ✅ `discoverHuggingFaceModelVersion()` - Discovers HuggingFace model versions
  - [ ] Fetches tree from HuggingFace API
  - [ ] Finds file in tree
  - [ ] Returns commit hash and file size
  - [ ] Handles authentication (with/without token)
  - [ ] Handles 404 errors gracefully
  - [ ] Uses cache when available

### T3: Version Verification (`version-verification.ts`)

**Test File**: `scripts/setup/version-verification.spec.ts`

#### Test Cases

- ✅ `verifyAllVersions()` - Verifies all registry versions
  - [ ] Verifies Manager nodes
  - [ ] Verifies GitHub nodes
  - [ ] Verifies HuggingFace models
  - [ ] Returns verification report
  - [ ] Handles failures gracefully

### T4: Install Script Generator (`generate-install-script.ts`)

**Test File**: `scripts/setup/generate-install-script.spec.ts`

#### Test Cases

- ✅ `generateInstallScript()` - Generates bash install script
  - [ ] Includes Manager node installation
  - [ ] Includes GitHub node installation
  - [ ] Includes model downloads
  - [ ] Uses correct paths and variables
  - [ ] Includes verification checks
  - [ ] Handles empty registry gracefully

- ✅ `getDownloadUrl()` - Generates download URLs
  - [ ] Handles HuggingFace repos
  - [ ] Handles direct URLs
  - [ ] Handles downloadUrl field
  - [ ] Returns null for missing sources

### T5: Dockerfile Generator (`generate-dockerfile.ts`)

**Test File**: `scripts/setup/generate-dockerfile.spec.ts`

#### Test Cases

- ✅ `generateDockerfile()` - Generates Dockerfile
  - [ ] Includes base image
  - [ ] Installs Manager nodes
  - [ ] Installs GitHub nodes with versions
  - [ ] Uses correct paths
  - [ ] Handles empty registry gracefully

### T6: Node Package Mapper (`node-package-mapper.ts`)

**Test File**: `scripts/setup/node-package-mapper.spec.ts`

#### Test Cases

- ✅ `NODE_TO_PACKAGE_MAP` - Maps node types to packages
  - [ ] Contains expected mappings
  - [ ] Returns correct package for known nodes
  - [ ] Returns null for unknown nodes

### T7: Registry (`comfyui-registry.ts`)

**Test File**: `scripts/setup/comfyui-registry.spec.ts`

#### Test Cases

- ✅ Registry structure - Validates registry structure
  - [ ] All nodes have required fields
  - [ ] All models have required fields
  - [ ] Types are correct
  - [ ] No duplicate keys

---

## Integration Tests

### I1: CLI Commands (`cli.ts`)

**Test File**: `scripts/setup/cli.spec.ts`

#### Test Cases

- ✅ `analyze:dependencies` - Analyzes workflows
  - [ ] Reads workflow files
  - [ ] Generates dependency report
  - [ ] Writes to output file
  - [ ] Handles errors gracefully

- ✅ `discover:versions` - Discovers versions
  - [ ] Loads registry
  - [ ] Discovers all versions
  - [ ] Updates registry with versions
  - [ ] Writes updated registry (if flag set)
  - [ ] Handles API failures gracefully

- ✅ `verify:versions` - Verifies versions
  - [ ] Loads registry
  - [ ] Verifies all versions
  - [ ] Generates verification report
  - [ ] Writes report to file
  - [ ] Handles failures gracefully

- ✅ `generate:scripts` - Generates scripts
  - [ ] Loads registry
  - [ ] Generates install script
  - [ ] Generates Dockerfile
  - [ ] Writes files to output directory
  - [ ] Handles errors gracefully

- ✅ `setup:all` - Full pipeline
  - [ ] Runs all steps in sequence
  - [ ] Handles errors at each step
  - [ ] Generates all artifacts
  - [ ] Writes registry updates (if flag set)

---

## E2E Tests

### E1: Generated Script Execution

**Test File**: `scripts/setup/e2e-install-script.spec.ts`

#### Test Cases

- ✅ Install script syntax - Validates bash syntax
  - [ ] Script is valid bash
  - [ ] All variables are defined
  - [ ] All commands are valid
  - [ ] Paths are correct

- ✅ Install script execution - Tests script execution (mock)
  - [ ] Script runs without errors (dry-run)
  - [ ] All commands are executable
  - [ ] Error handling works

### E2: Generated Dockerfile

**Test File**: `scripts/setup/e2e-dockerfile.spec.ts`

#### Test Cases

- ✅ Dockerfile syntax - Validates Dockerfile syntax
  - [ ] Dockerfile is valid
  - [ ] All commands are valid
  - [ ] Paths are correct

- ✅ Dockerfile build - Tests Dockerfile build (mock)
  - [ ] Dockerfile builds (dry-run)
  - [ ] All layers are valid
  - [ ] Image size is reasonable

---

## Test Data

### Mock Data

- **Mock Workflows**: `scripts/setup/__fixtures__/workflows/`
  - `simple-workflow.json` - Minimal workflow
  - `complex-workflow.json` - Workflow with all node types
  - `invalid-workflow.json` - Invalid workflow for error testing

- **Mock Registry**: `scripts/setup/__fixtures__/registry.ts`
  - Sample registry with known nodes/models

- **Mock API Responses**: `scripts/setup/__fixtures__/api/`
  - `manager-registry.json` - Manager API response
  - `github-tags.json` - GitHub API response
  - `huggingface-tree.json` - HuggingFace API response

### Test Utilities

- **Mock API Client**: `scripts/setup/__test-utils__/mock-api-client.ts`
- **Mock Cache**: `scripts/setup/__test-utils__/mock-cache.ts`
- **Mock Logger**: `scripts/setup/__test-utils__/mock-logger.ts`

---

## Test Execution

### Running Tests

```bash
# Run all tests
pnpm test:comfyui-deps

# Run unit tests only
pnpm test:comfyui-deps:unit

# Run integration tests only
pnpm test:comfyui-deps:integration

# Run E2E tests only
pnpm test:comfyui-deps:e2e

# Run with coverage
pnpm test:comfyui-deps:coverage

# Watch mode
pnpm test:comfyui-deps:watch
```

### CI/CD Integration

Tests run automatically on:
- Pre-commit hooks
- Pull request creation
- Main branch pushes

---

## Coverage Goals

| Component | Target Coverage | Current Coverage |
|-----------|----------------|------------------|
| Dependency Analyzer | 90% | 0% |
| Version Discovery | 85% | 0% |
| Version Verification | 80% | 0% |
| Install Script Generator | 90% | 0% |
| Dockerfile Generator | 90% | 0% |
| CLI Commands | 80% | 0% |
| **Overall** | **85%** | **0%** |

---

## Test Status

### ✅ Completed
- [x] Test plan created
- [x] Test infrastructure setup (Vitest config, fixtures, utilities)
- [x] Unit tests for all core components (50 tests passing)
  - [x] Dependency resolver (6 tests)
  - [x] Version discovery (12 tests)
  - [x] Version verification (10 tests)
  - [x] Install script generator (8 tests)
  - [x] Dockerfile generator (8 tests)
  - [x] Node package mapper (6 tests)
- [x] Test fixtures created (workflows, API responses)
- [x] Test utilities created (mock API client, cache, logger)
- [ ] Integration tests implemented (planned for P8)
- [ ] E2E tests implemented (planned for P8)
- [ ] CI/CD integration (planned for P8)

### ⏳ In Progress
- [ ] Integration tests for CLI commands
- [ ] E2E tests for generated scripts

### ⏸️ Pending
- [ ] All test cases

---

## Notes

- Tests use mocks for external APIs (GitHub, HuggingFace, Manager)
- E2E tests use dry-run mode to avoid actual API calls
- Test fixtures are committed to repository
- Tests run in CI/CD pipeline

---

**Last Updated**: 2026-01-15  
**Status**: 🚧 In Progress
