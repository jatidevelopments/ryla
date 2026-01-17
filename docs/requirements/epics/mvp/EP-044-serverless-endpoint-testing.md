# [EPIC] EP-044: RunPod Serverless Endpoint Testing & Validation Framework

> **Initiative**: [IN-010: Denrisi Workflow Serverless Validation & Testing Framework](../../../initiatives/IN-010-denrisi-workflow-serverless-validation.md)  
> **Type**: Backend Infrastructure  
> **Phases**: P1, P2, P3, P5, P6, P7, P8, P9, P10 (skipping P4 - UI)

## Overview

Comprehensive testing and validation framework for ComfyUI workflows on RunPod serverless endpoints, ensuring dependencies are correctly installed, workflows execute successfully, and performance meets requirements. Initially validates the Z-Image Denrisi workflow, then provides a reusable framework for testing any workflow.

> **Scope**: Backend-only epic. Focuses on testing infrastructure, validation scripts, and performance benchmarking. No UI components required.

---

## Business Impact

**Target Metric**: C-Core Value, E-CAC, B-Retention

**Hypothesis**: When workflows are systematically tested and validated on serverless endpoints before production deployment, dependency-related failures drop to zero, deployment confidence increases, and infrastructure costs are optimized.

**Success Criteria**:
- Workflow success rate: **100%** (10+ test samples)
- Cold start time: **< 60 seconds**
- Generation time: **< 30 seconds** per image
- Dependency verification: **100%** (all nodes/models confirmed)
- Test framework reusability: **80%+** code coverage
- Production incidents from missing dependencies: **0%**

---

## Features

### F1: Serverless Endpoint Validation

- **Endpoint Health Check**: Verify serverless endpoint is accessible and healthy
- **Dependency Verification**: Confirm all custom nodes and models are installed
- **Network Volume Validation**: Verify models are accessible on network volume
- **Functionality**:
  - Check endpoint status via RunPod API
  - Verify custom nodes via ComfyUI API
  - Verify models exist at expected paths
  - Generate validation report

### F2: Workflow Testing Framework

- **Workflow Submission**: Submit ComfyUI workflows to serverless endpoints
- **Job Status Polling**: Monitor job progress and completion
- **Result Validation**: Verify generated images are valid
- **Error Handling**: Capture and report errors
- **Functionality**:
  - Submit workflow JSON to RunPod serverless API
  - Poll job status until completion
  - Decode base64 image results
  - Validate image format and size
  - Handle timeouts and errors gracefully

### F3: Performance Benchmarking

- **Cold Start Measurement**: Measure endpoint startup time
- **Generation Time Tracking**: Track time per image generation
- **Cost Analysis**: Calculate cost per image
- **Scalability Testing**: Test concurrent job handling
- **Functionality**:
  - Measure cold start from job submission to first response
  - Track generation time from start to completion
  - Calculate RunPod credits used per job
  - Test multiple concurrent jobs
  - Generate performance report

### F4: Dependency Verification System

- **Node Verification**: Verify custom nodes are installed and accessible
- **Model Verification**: Verify models exist and are accessible
- **Version Checking**: Verify correct versions are installed
- **Functionality**:
  - Query ComfyUI API for available nodes
  - Check model files exist on network volume
  - Compare installed versions with registry
  - Generate dependency verification report

### F5: Reusable Testing Framework

- **Generic Workflow Testing**: Test any ComfyUI workflow
- **Configurable Test Suites**: Define test scenarios
- **Automated Test Execution**: Run tests via CLI or CI/CD
- **Test Reporting**: Generate detailed test reports
- **Mock Mode Support**: Enable local testing without real API calls
- **Functionality**:
  - Accept workflow definition as input
  - Execute test scenarios (success, error, edge cases)
  - Generate test reports with pass/fail status
  - Support CI/CD integration
  - Mock mode for local development (no API costs, fast iteration)
  - Mock clients for RunPod and ComfyUI APIs
  - Customizable mock responses for different test scenarios

### F6: Denrisi Workflow Validation

- **End-to-End Testing**: Test complete Denrisi workflow
- **Dependency Verification**: Verify res4lyf nodes and Z-Image models
- **Performance Validation**: Ensure meets performance targets
- **Functionality**:
  - Test Denrisi workflow with various prompts
  - Verify all required nodes (ClownsharKSampler_Beta, Sigmas Rescale, BetaSamplingScheduler)
  - Verify all required models (z_image_turbo_bf16, qwen_3_4b, z-image-turbo-vae)
  - Measure and validate performance metrics

### F7: CI/CD Integration

- **Automated Testing**: Run tests in CI/CD pipeline
- **Pre-Deployment Validation**: Validate before production deployment
- **Test Reporting**: Integrate test results into CI/CD reports
- **Functionality**:
  - GitHub Actions workflow for automated testing
  - Pre-deployment validation checks
  - Test result reporting
  - Failure notifications

---

## User Stories

### ST-047: As a developer, I want to validate serverless endpoint health

**AC**:
- [ ] Can check endpoint status via API
- [ ] Can verify endpoint is accessible
- [ ] Can detect endpoint configuration issues
- [ ] Health check completes in < 5 seconds

### ST-048: As a developer, I want to verify dependencies are installed

**AC**:
- [ ] Can verify custom nodes are installed
- [ ] Can verify models exist on network volume
- [ ] Can check node versions match registry
- [ ] Dependency verification completes in < 10 seconds

### ST-049: As a developer, I want to test workflows end-to-end

**AC**:
- [ ] Can submit workflow to serverless endpoint
- [ ] Can monitor job progress
- [ ] Can retrieve generated images
- [ ] Can validate image format and quality
- [ ] Test completes successfully for Denrisi workflow

### ST-050: As a developer, I want to benchmark performance

**AC**:
- [ ] Can measure cold start time
- [ ] Can measure generation time
- [ ] Can calculate cost per image
- [ ] Performance metrics are documented
- [ ] Metrics meet target thresholds

### ST-051: As a developer, I want a reusable testing framework

**AC**:
- [ ] Can test any ComfyUI workflow
- [ ] Framework is configurable
- [ ] Test reports are generated
- [ ] Framework is documented
- [ ] Framework has 80%+ code coverage

### ST-052: As a developer, I want to validate Denrisi workflow

**AC**:
- [ ] Denrisi workflow tests pass
- [ ] All dependencies verified
- [ ] Performance meets targets
- [ ] Validation report generated
- [ ] Ready for production deployment

### ST-053: As a DevOps engineer, I want automated testing in CI/CD

**AC**:
- [ ] Tests run automatically in CI/CD
- [ ] Pre-deployment validation works
- [ ] Test results reported in CI/CD
- [ ] Failures trigger notifications
- [ ] CI/CD integration documented

---

## Acceptance Criteria

### AC-1: Endpoint Health Check

- [ ] Health check script validates endpoint accessibility
- [ ] Detects endpoint configuration issues
- [ ] Returns clear error messages
- [ ] Completes in < 5 seconds

### AC-2: Dependency Verification

- [ ] Verifies all custom nodes are installed
- [ ] Verifies all models exist on network volume
- [ ] Checks versions match registry (from EP-039)
- [ ] Generates verification report
- [ ] Completes in < 10 seconds

### AC-3: Workflow Testing

- [ ] Can submit workflow to serverless endpoint
- [ ] Can monitor job progress
- [ ] Can retrieve generated images
- [ ] Validates image format (PNG/JPEG)
- [ ] Validates image size > 0
- [ ] Handles errors gracefully

### AC-4: Performance Benchmarking

- [ ] Measures cold start time accurately
- [ ] Measures generation time accurately
- [ ] Calculates cost per image
- [ ] Generates performance report
- [ ] Metrics meet target thresholds

### AC-5: Reusable Framework

- [ ] Framework accepts workflow definition as input
- [ ] Framework is configurable (endpoint, API key, etc.)
- [ ] Framework supports mock mode for local testing
- [ ] Framework generates test reports
- [ ] Framework is documented
- [ ] Framework has 80%+ code coverage

### AC-6: Denrisi Validation

- [ ] Denrisi workflow tests pass (10+ samples)
- [ ] All dependencies verified
- [ ] Performance meets targets (cold start < 60s, generation < 30s)
- [ ] Validation report generated
- [ ] Ready for production deployment

### AC-7: CI/CD Integration

- [ ] Tests run in GitHub Actions
- [ ] Pre-deployment validation works
- [ ] Test results reported
- [ ] Failures trigger notifications
- [ ] CI/CD integration documented

---

## Technical Notes

### Architecture

**Layers**:
- **Test Scripts Layer**: `scripts/tests/serverless/` - Test execution scripts
- **Framework Layer**: `scripts/tests/serverless/framework.ts` - Reusable test framework
- **Validation Layer**: `scripts/tests/serverless/validators/` - Validation utilities
- **Reporting Layer**: `scripts/tests/serverless/reporters/` - Test report generators

**Data Flow**:
```
Workflow Definition → Test Framework → RunPod API → Job Status
                                                      ↓
                                              Image Results
                                                      ↓
                                              Validation & Reporting
```

### External APIs

- **RunPod Serverless API**: `https://api.runpod.ai/v2/{endpoint_id}/run`
- **RunPod Status API**: `https://api.runpod.ai/v2/{endpoint_id}/status/{job_id}`
- **ComfyUI API**: `{endpoint_url}/system_stats`, `/object_info`

### File Structure

```
scripts/tests/serverless/
├── framework.ts                    # Reusable test framework
├── endpoint-validator.ts          # Endpoint health check
├── dependency-verifier.ts         # Dependency verification
├── workflow-tester.ts             # Workflow testing
├── performance-benchmark.ts       # Performance benchmarking
├── denrisi-validator.ts           # Denrisi-specific validation
├── validators/
│   ├── node-validator.ts          # Node verification
│   ├── model-validator.ts         # Model verification
│   └── image-validator.ts         # Image validation
├── reporters/
│   ├── test-reporter.ts           # Test report generator
│   └── performance-reporter.ts   # Performance report generator
└── fixtures/
    └── denrisi-workflow.json      # Test workflow fixture
```

---

## Phase Plan (Backend-Only)

### ⏳ P1: Requirements - PENDING
- [ ] Problem statement defined
- [ ] MVP objective (measurable)
- [ ] Non-goals listed
- [ ] Business metric (C-Core Value, E-CAC, B-Retention)
- **File**: This document

### ⏳ P2: Scoping - PENDING
- [ ] Feature list (F1-F7)
- [ ] User stories (ST-047 to ST-053)
- [ ] Acceptance criteria (AC-1 to AC-7)
- [ ] Analytics events (N/A - backend only)
- [ ] Non-MVP items listed
- **File**: This document

### ✅ P3: Architecture - COMPLETE
- [x] Functional architecture (test scripts/framework split)
- [x] Data model (test results, validation reports)
- [x] API contract list (RunPod API, ComfyUI API)
- [x] Event schema (N/A - backend only)
- [x] Funnel definitions (N/A - backend only)
- **File**: `docs/architecture/epics/EP-044-ARCHITECTURE.md` ✅ **CREATED**

### ⏭️ P4: UI Skeleton - SKIPPED
- **Reason**: Backend-only epic, no UI components

### ✅ P5: Technical Spec - COMPLETE
- [x] File plan (files to create/modify + purpose)
- [x] Technical spec (logic flows, env vars, dependencies)
- [x] Task breakdown (ST-047 to ST-053, 24 tasks)
- [x] Tracking plan (N/A - backend only)
- **File**: `docs/specs/epics/EP-044-TECH-SPEC.md` ✅ **CREATED**

### ⏳ P6: Implementation - PENDING
- [ ] Test scripts implemented
- [ ] Framework implemented
- [ ] Validators implemented
- [ ] Reporters implemented
- [ ] AC status: ✅/⚠️/❌
- **File**: Implementation notes (to be created)

### ⏳ P7: Testing - PENDING
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests (actual serverless endpoint testing)
- **File**: Test plan (to be created)

### ⏳ P8: Integration - PENDING
- [ ] CI/CD integration
- [ ] Pre-deployment validation
- [ ] Test reporting integration
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

- **IN-010**: Denrisi Workflow Serverless Validation Initiative (parent)
- **EP-039**: ComfyUI Dependency Management (provides dependency verification)
- **EP-005**: Content Studio (uses ComfyUI workflows)
- **RunPod Infrastructure**: Serverless endpoint must be available

---

## Non-MVP Items

- UI for viewing test results (use CLI/reports)
- Real-time test monitoring dashboard
- Historical test result tracking
- Automated test result analysis
- Test result comparison across endpoints

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Workflow Success Rate | 100% | Automated test runs (10+ samples) |
| Cold Start Time | < 60 seconds | Measure endpoint startup time |
| Generation Time | < 30 seconds | Average time per image |
| Dependency Verification | 100% | All nodes/models confirmed |
| Test Framework Coverage | 80%+ | Code coverage of framework |
| Production Incidents | 0% | Missing dependency errors |

---

## Related Documentation

- [IN-010 Initiative](../../../initiatives/IN-010-denrisi-workflow-serverless-validation.md)
- [EP-039: ComfyUI Dependency Management](./EP-039-comfyui-dependency-management.md)
- [ComfyUI Serverless Setup Guide](../../../technical/infrastructure/comfyui/COMFYUI-SERVERLESS-SETUP-GUIDE.md)
- [RunPod Serverless API Documentation](https://docs.runpod.io/serverless/endpoints)

---

**Status**: 📝 Defined (P1, P2 Complete)  
**Last Updated**: 2026-01-15
