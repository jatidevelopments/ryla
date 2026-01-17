# EP-044 (P5) — RunPod Serverless Endpoint Testing: Tech Spec (File Plan + Tasks)

Working in **PHASE P5 (File plan + tasks)** on **EP-044, ST-047-ST-053**.

## Scope (MVP)

- Endpoint health check and validation
- Dependency verification (nodes and models)
- Workflow testing framework for serverless endpoints
- Performance benchmarking (cold start, generation time, cost)
- Reusable test framework for any ComfyUI workflow
- Denrisi workflow specific validation
- CI/CD integration for automated testing

**Out of scope (MVP)**:
- UI dashboard for test results (use CLI/reports)
- Historical test result tracking
- Automated test result analysis
- Real-time test monitoring dashboard
- Test result comparison across endpoints

---

## Prerequisites (Must Complete First)

### 1. RunPod API Access

**Status**: ⚠️ **REQUIRED BEFORE P6**

- RunPod API key configured
- Serverless endpoint deployed
- Network volume with models attached
- ComfyUI endpoint accessible (optional, for dependency verification)

**Environment Variables**:
- `RUNPOD_API_KEY` - RunPod API key
- `RUNPOD_ENDPOINT_ID` - Serverless endpoint ID
- `RUNPOD_ENDPOINT_URL` - Optional: ComfyUI API URL

### 2. EP-039 Dependency Management

**Status**: ✅ **COMPLETE**

- Dependency registry available (`scripts/setup/comfyui-registry.ts`)
- Generated install scripts available
- Dependency resolver available

---

## CLI Interface

### Main Commands

#### `pnpm test:serverless:endpoint`

Validate serverless endpoint health and configuration.

**Output**: Health check report to console

**Options**:
- `--endpoint-id`: Endpoint ID (default: from env)
- `--api-key`: RunPod API key (default: from env)
- `--verbose`: Show detailed output

#### `pnpm test:serverless:dependencies`

Verify all dependencies are installed on endpoint.

**Output**: Dependency verification report to console and `scripts/generated/dependency-verification.json`

**Options**:
- `--endpoint-id`: Endpoint ID
- `--endpoint-url`: ComfyUI API URL (optional)
- `--workflow`: Workflow ID to check dependencies for (default: all)

#### `pnpm test:serverless:workflow`

Test a workflow on serverless endpoint.

**Output**: Test result report to console and `scripts/generated/test-results.json`

**Options**:
- `--endpoint-id`: Endpoint ID
- `--workflow`: Workflow ID (e.g., `z-image-danrisi`)
- `--prompt`: Test prompt (default: test prompt)
- `--iterations`: Number of test iterations (default: 1)
- `--timeout`: Timeout in ms (default: 600000)
- `--mock`: Enable mock mode (no real API calls, for local testing)

#### `pnpm test:serverless:benchmark`

Benchmark performance metrics.

**Output**: Performance report to console and `scripts/generated/performance-report.json`

**Options**:
- `--endpoint-id`: Endpoint ID
- `--workflow`: Workflow ID
- `--iterations`: Number of iterations (default: 5)
- `--cold-start`: Measure cold start time only

#### `pnpm test:serverless:denrisi`

Validate Denrisi workflow end-to-end.

**Output**: Validation report to console and `scripts/generated/denrisi-validation.json`

**Options**:
- `--endpoint-id`: Endpoint ID
- `--samples`: Number of test samples (default: 10)
- `--full`: Run full validation (dependencies + workflow + performance)
- `--mock`: Enable mock mode (no real API calls, for local testing)

#### `pnpm test:serverless:all`

Run complete validation suite.

**Options**: Combines all above options

---

## File Plan

### Serverless Testing Directory

#### Core Framework

- **Add** `scripts/tests/serverless/framework.ts`
  - **Purpose**: Reusable test framework for any ComfyUI workflow
  - **Exports**: `ServerlessTestFramework` class
  - **Dependencies**: RunPod client, workflow tester, validators
  - **Size**: ~400-500 lines

- **Add** `scripts/tests/serverless/types.ts`
  - **Purpose**: TypeScript type definitions for testing
  - **Exports**: `TestConfig`, `TestResult`, `ValidationReport`, etc.
  - **Dependencies**: None
  - **Size**: ~200-300 lines

#### Validators

- **Add** `scripts/tests/serverless/endpoint-validator.ts`
  - **Purpose**: Validate serverless endpoint health and configuration
  - **Exports**: `EndpointValidator` class
  - **Dependencies**: RunPod client
  - **Size**: ~200-300 lines

- **Add** `scripts/tests/serverless/dependency-verifier.ts`
  - **Purpose**: Verify dependencies are installed correctly
  - **Exports**: `DependencyVerifier` class
  - **Dependencies**: ComfyUI client, EP-039 registry
  - **Size**: ~300-400 lines

- **Add** `scripts/tests/serverless/validators/node-validator.ts`
  - **Purpose**: Verify custom nodes are installed
  - **Exports**: `NodeValidator` class
  - **Dependencies**: ComfyUI client
  - **Size**: ~150-200 lines

- **Add** `scripts/tests/serverless/validators/model-validator.ts`
  - **Purpose**: Verify models exist on network volume
  - **Exports**: `ModelValidator` class
  - **Dependencies**: ComfyUI client
  - **Size**: ~150-200 lines

- **Add** `scripts/tests/serverless/validators/image-validator.ts`
  - **Purpose**: Validate generated images
  - **Exports**: `ImageValidator` class
  - **Dependencies**: Image decoding utilities
  - **Size**: ~100-150 lines

#### Testers

- **Add** `scripts/tests/serverless/workflow-tester.ts`
  - **Purpose**: Test workflows end-to-end on serverless endpoints
  - **Exports**: `WorkflowTester` class
  - **Dependencies**: RunPod client, image validator
  - **Size**: ~300-400 lines

- **Add** `scripts/tests/serverless/performance-benchmark.ts`
  - **Purpose**: Measure and report performance metrics
  - **Exports**: `PerformanceBenchmark` class
  - **Dependencies**: Workflow tester
  - **Size**: ~200-300 lines

- **Add** `scripts/tests/serverless/denrisi-validator.ts`
  - **Purpose**: Specific validation for Denrisi workflow
  - **Exports**: `DenrisiValidator` class
  - **Dependencies**: Framework, dependency verifier, workflow tester
  - **Size**: ~250-350 lines

#### Utilities

- **Add** `scripts/tests/serverless/utils/runpod-client.ts`
  - **Purpose**: RunPod API client wrapper
  - **Exports**: `RunPodClient` class
  - **Dependencies**: `node-fetch` or `axios`
  - **Size**: ~200-300 lines

- **Add** `scripts/tests/serverless/utils/comfyui-client.ts`
  - **Purpose**: ComfyUI API client wrapper
  - **Exports**: `ComfyUIClient` class
  - **Dependencies**: `node-fetch` or `axios`
  - **Size**: ~150-200 lines

- **Add** `scripts/tests/serverless/utils/image-decoder.ts`
  - **Purpose**: Decode base64 images and validate
  - **Exports**: `ImageDecoder` class, decode functions
  - **Dependencies**: Image processing library (optional)
  - **Size**: ~100-150 lines

#### Reporters

- **Add** `scripts/tests/serverless/reporters/test-reporter.ts`
  - **Purpose**: Generate test result reports
  - **Exports**: `TestReporter` class
  - **Dependencies**: Test result types
  - **Size**: ~200-300 lines

- **Add** `scripts/tests/serverless/reporters/performance-reporter.ts`
  - **Purpose**: Generate performance reports
  - **Exports**: `PerformanceReporter` class
  - **Dependencies**: Performance metrics types
  - **Size**: ~150-200 lines

#### CLI

- **Add** `scripts/tests/serverless/cli.ts`
  - **Purpose**: CLI interface for all test commands
  - **Exports**: `main()` function
  - **Dependencies**: All framework components
  - **Size**: ~300-400 lines

#### Fixtures

- **Add** `scripts/tests/serverless/fixtures/denrisi-workflow.json`
  - **Purpose**: Test workflow fixture for Denrisi
  - **Exports**: None (JSON file)
  - **Dependencies**: None
  - **Size**: ~50-100 lines (JSON)

- **Add** `scripts/tests/serverless/fixtures/mock-responses.json`
  - **Purpose**: Mock API responses for local testing
  - **Exports**: None (JSON file)
  - **Dependencies**: None
  - **Size**: ~200-300 lines (JSON)

### Generated Files

- **Add** `scripts/generated/test-results.json`
  - **Purpose**: Test execution results (auto-generated)
  - **Format**: JSON

- **Add** `scripts/generated/dependency-verification.json`
  - **Purpose**: Dependency verification results (auto-generated)
  - **Format**: JSON

- **Add** `scripts/generated/performance-report.json`
  - **Purpose**: Performance benchmark results (auto-generated)
  - **Format**: JSON

- **Add** `scripts/generated/denrisi-validation.json`
  - **Purpose**: Denrisi validation results (auto-generated)
  - **Format**: JSON

### Package.json Updates

- **Modify** `package.json`
  - **Add scripts**:
    - `test:serverless:endpoint`
    - `test:serverless:dependencies`
    - `test:serverless:workflow`
    - `test:serverless:benchmark`
    - `test:serverless:denrisi`
    - `test:serverless:all`

---

## Task Breakdown

### ST-047: Endpoint Health Check

#### TSK-047-001: Create Endpoint Validator
- **File**: `scripts/tests/serverless/endpoint-validator.ts`
- **Time**: 4 hours
- **Tasks**:
  - Create `EndpointValidator` class
  - Implement endpoint existence check
  - Implement accessibility check
  - Implement configuration check
  - Add error handling

#### TSK-047-002: Create RunPod Client Utility
- **File**: `scripts/tests/serverless/utils/runpod-client.ts`
- **Time**: 3 hours
- **Tasks**:
  - Create `RunPodClient` class
  - Implement job submission
  - Implement job status polling
  - Add retry logic
  - Add error handling

#### TSK-047-003: Add CLI Command for Endpoint Validation
- **File**: `scripts/tests/serverless/cli.ts`
- **Time**: 2 hours
- **Tasks**:
  - Add `endpoint` command
  - Parse command-line options
  - Call endpoint validator
  - Display results

**Total for ST-047**: 9 hours

---

### ST-048: Dependency Verification

#### TSK-048-001: Create Node Validator
- **File**: `scripts/tests/serverless/validators/node-validator.ts`
- **Time**: 3 hours
- **Tasks**:
  - Create `NodeValidator` class
  - Query ComfyUI API for available nodes
  - Compare with expected nodes
  - Generate verification report

#### TSK-048-002: Create Model Validator
- **File**: `scripts/tests/serverless/validators/model-validator.ts`
- **Time**: 3 hours
- **Tasks**:
  - Create `ModelValidator` class
  - Query ComfyUI API for available models
  - Check model files exist
  - Generate verification report

#### TSK-048-003: Create Dependency Verifier
- **File**: `scripts/tests/serverless/dependency-verifier.ts`
- **Time**: 4 hours
- **Tasks**:
  - Create `DependencyVerifier` class
  - Integrate node and model validators
  - Use EP-039 registry for expected dependencies
  - Generate comprehensive report

#### TSK-048-004: Create ComfyUI Client Utility
- **File**: `scripts/tests/serverless/utils/comfyui-client.ts`
- **Time**: 3 hours
- **Tasks**:
  - Create `ComfyUIClient` class
  - Implement health check
  - Implement node info query
  - Implement model list query
  - Add error handling

#### TSK-048-005: Add CLI Command for Dependency Verification
- **File**: `scripts/tests/serverless/cli.ts`
- **Time**: 2 hours
- **Tasks**:
  - Add `dependencies` command
  - Parse options
  - Call dependency verifier
  - Display results

**Total for ST-048**: 15 hours

---

### ST-049: Workflow Testing

#### TSK-049-001: Create Image Validator
- **File**: `scripts/tests/serverless/validators/image-validator.ts`
- **Time**: 2 hours
- **Tasks**:
  - Create `ImageValidator` class
  - Validate image format
  - Validate image size
  - Check image dimensions (optional)

#### TSK-049-002: Create Image Decoder Utility
- **File**: `scripts/tests/serverless/utils/image-decoder.ts`
- **Time**: 2 hours
- **Tasks**:
  - Create `ImageDecoder` class
  - Decode base64 images
  - Extract image metadata
  - Validate image data

#### TSK-049-003: Create Workflow Tester
- **File**: `scripts/tests/serverless/workflow-tester.ts`
- **Time**: 5 hours
- **Tasks**:
  - Create `WorkflowTester` class
  - Implement workflow submission
  - Implement job status polling
  - Implement result retrieval
  - Integrate image validator
  - Add timeout handling

#### TSK-049-004: Add CLI Command for Workflow Testing
- **File**: `scripts/tests/serverless/cli.ts`
- **Time**: 2 hours
- **Tasks**:
  - Add `workflow` command
  - Parse options
  - Load workflow from registry
  - Call workflow tester
  - Display results

**Total for ST-049**: 11 hours

---

### ST-050: Performance Benchmarking

#### TSK-050-001: Create Performance Benchmark
- **File**: `scripts/tests/serverless/performance-benchmark.ts`
- **Time**: 4 hours
- **Tasks**:
  - Create `PerformanceBenchmark` class
  - Measure cold start time
  - Measure generation time
  - Calculate cost per image
  - Generate performance metrics

#### TSK-050-002: Create Performance Reporter
- **File**: `scripts/tests/serverless/reporters/performance-reporter.ts`
- **Time**: 2 hours
- **Tasks**:
  - Create `PerformanceReporter` class
  - Format performance metrics
  - Generate JSON report
  - Generate console output

#### TSK-050-003: Add CLI Command for Benchmarking
- **File**: `scripts/tests/serverless/cli.ts`
- **Time**: 2 hours
- **Tasks**:
  - Add `benchmark` command
  - Parse options
  - Run multiple iterations
  - Call performance benchmark
  - Display results

**Total for ST-050**: 8 hours

---

### ST-051: Reusable Framework

#### TSK-051-001: Create Type Definitions
- **File**: `scripts/tests/serverless/types.ts`
- **Time**: 3 hours
- **Tasks**:
  - Define `TestConfig` interface
  - Define `TestResult` interface
  - Define `ValidationReport` interface
  - Define `PerformanceMetrics` interface
  - Define all supporting types

#### TSK-051-002: Create Test Framework
- **File**: `scripts/tests/serverless/framework.ts`
- **Time**: 6 hours
- **Tasks**:
  - Create `ServerlessTestFramework` class
  - Implement test execution orchestration
  - Integrate all validators and testers
  - Implement error handling
  - Implement timeout management
  - Add retry logic

#### TSK-051-003: Create Test Reporter
- **File**: `scripts/tests/serverless/reporters/test-reporter.ts`
- **Time**: 3 hours
- **Tasks**:
  - Create `TestReporter` class
  - Format test results
  - Generate JSON report
  - Generate console output
  - Add summary statistics

#### TSK-051-004: Create Mock Clients
- **File**: `scripts/tests/serverless/__test-utils__/mock-runpod-client.ts`, `mock-comfyui-client.ts`
- **Time**: 3 hours
- **Tasks**:
  - Create `MockRunPodClient` class implementing `IRunPodClient`
  - Create `MockComfyUIClient` class implementing `IComfyUIClient`
  - Support custom mock responses
  - Support default mock responses for common scenarios
  - Add mock response fixtures

#### TSK-051-005: Add Mock Mode Support to Framework
- **File**: `scripts/tests/serverless/framework.ts`
- **Time**: 2 hours
- **Tasks**:
  - Add `mockMode` flag to `TestConfig`
  - Add `mockResponses` to `TestConfig`
  - Implement client selection logic (real vs mock)
  - Update framework to use mock clients when enabled
  - Add mock mode documentation

#### TSK-051-006: Create Mock Response Fixtures
- **File**: `scripts/tests/serverless/fixtures/mock-responses.json`
- **Time**: 2 hours
- **Tasks**:
  - Create mock RunPod API responses
  - Create mock ComfyUI API responses
  - Add common test scenarios
  - Document mock response structure

**Total for ST-051**: 19 hours (was 12 hours, +7 hours for mock mode)

---

### ST-052: Denrisi Validation

#### TSK-052-001: Create Denrisi Validator
- **File**: `scripts/tests/serverless/denrisi-validator.ts`
- **Time**: 5 hours
- **Tasks**:
  - Create `DenrisiValidator` class
  - Load Denrisi workflow definition
  - Run dependency verification
  - Run workflow tests (10+ samples)
  - Run performance benchmarking
  - Generate validation report

#### TSK-052-002: Create Denrisi Workflow Fixture
- **File**: `scripts/tests/serverless/fixtures/denrisi-workflow.json`
- **Time**: 1 hour
- **Tasks**:
  - Export Denrisi workflow to JSON
  - Add test prompts
  - Add test cases

#### TSK-052-003: Add CLI Command for Denrisi Validation
- **File**: `scripts/tests/serverless/cli.ts`
- **Time**: 2 hours
- **Tasks**:
  - Add `denrisi` command
  - Parse options
  - Call Denrisi validator
  - Display results

**Total for ST-052**: 8 hours

---

### ST-053: CI/CD Integration

#### TSK-053-001: Create GitHub Actions Workflow
- **File**: `.github/workflows/test-serverless.yml`
- **Time**: 3 hours
- **Tasks**:
  - Create workflow file
  - Configure environment variables
  - Add test commands
  - Add result reporting
  - Add failure notifications

#### TSK-053-002: Add Pre-Deployment Validation
- **File**: `.github/workflows/pre-deploy-validation.yml`
- **Time**: 2 hours
- **Tasks**:
  - Create pre-deployment workflow
  - Run endpoint validation
  - Run dependency verification
  - Block deployment on failures

#### TSK-053-003: Document CI/CD Integration
- **File**: `docs/testing/serverless/CI-CD-INTEGRATION.md`
- **Time**: 2 hours
- **Tasks**:
  - Document workflow setup
  - Document environment variables
  - Document test execution
  - Document result interpretation

**Total for ST-053**: 7 hours

---

## Implementation Order

### Phase 1: Foundation (Week 1)

**Goal**: Build core infrastructure and utilities

1. **Day 1-2**: Utilities and Types
   - TSK-051-001: Type definitions (3h)
   - TSK-047-002: RunPod client (3h)
   - TSK-048-004: ComfyUI client (3h)
   - TSK-049-002: Image decoder (2h)

2. **Day 3-4**: Validators
   - TSK-047-001: Endpoint validator (4h)
   - TSK-048-001: Node validator (3h)
   - TSK-048-002: Model validator (3h)
   - TSK-048-003: Dependency verifier (4h)
   - TSK-049-001: Image validator (2h)

3. **Day 5**: CLI Foundation
   - TSK-047-003: Endpoint CLI command (2h)
   - TSK-048-005: Dependencies CLI command (2h)
   - Basic CLI structure (4h)

**Deliverables**: Core utilities, validators, basic CLI

---

### Phase 2: Testing Framework (Week 2)

**Goal**: Build workflow testing and framework

1. **Day 1-2**: Workflow Testing
   - TSK-049-003: Workflow tester (5h)
   - TSK-049-004: Workflow CLI command (2h)
   - Testing and debugging (5h)

2. **Day 3-4**: Framework and Reporting
   - TSK-051-002: Test framework (6h)
   - TSK-051-003: Test reporter (3h)
   - TSK-051-004: Mock clients (3h)
   - TSK-051-005: Mock mode support (2h)
   - TSK-051-006: Mock fixtures (2h)
   - TSK-050-001: Performance benchmark (4h)
   - TSK-050-002: Performance reporter (2h)
   - TSK-050-003: Benchmark CLI command (2h)

3. **Day 5**: Denrisi Validation
   - TSK-052-001: Denrisi validator (5h)
   - TSK-052-002: Denrisi fixture (1h)
   - TSK-052-003: Denrisi CLI command (2h)

**Deliverables**: Complete testing framework, Denrisi validation

---

### Phase 3: Integration & Polish (Week 3)

**Goal**: CI/CD integration and documentation

1. **Day 1-2**: CI/CD Integration
   - TSK-053-001: GitHub Actions workflow (3h)
   - TSK-053-002: Pre-deployment validation (2h)
   - TSK-053-003: CI/CD documentation (2h)
   - Testing and refinement (5h)

2. **Day 3-4**: Testing and Documentation
   - Unit tests for all components (8h)
   - Integration tests (4h)
   - Documentation updates (4h)

3. **Day 5**: Final Validation
   - End-to-end testing (4h)
   - Bug fixes and polish (4h)

**Deliverables**: CI/CD integration, tests, documentation

---

## Time Estimates

| Story | Tasks | Total Hours | Days (8h/day) |
|-------|-------|-------------|---------------|
| ST-047 | 3 | 9 | 1.1 |
| ST-048 | 5 | 15 | 1.9 |
| ST-049 | 4 | 11 | 1.4 |
| ST-050 | 3 | 8 | 1.0 |
| ST-051 | 6 | 19 | 2.4 |
| ST-052 | 3 | 8 | 1.0 |
| ST-053 | 3 | 7 | 0.9 |
| **Total** | **27** | **77** | **9.6** |

**Estimated Timeline**: 2-3 weeks (with buffer)

---

## Dependencies

### External Dependencies

- **RunPod API**: Serverless endpoint API access
- **ComfyUI API**: Optional, for dependency verification
- **Node.js**: 18+ for TypeScript execution
- **TypeScript**: For type safety

### Internal Dependencies

- **EP-039**: Dependency registry and resolver
- **Workflow Registry**: `libs/business/src/workflows`
- **Existing Test Infrastructure**: `scripts/tests/` patterns

### NPM Packages

- `tsx` or `ts-node`: TypeScript execution
- `node-fetch` or `axios`: HTTP client
- `dotenv`: Environment variable loading
- Optional: Image processing library for image validation

---

## Environment Variables

```bash
# Required
RUNPOD_API_KEY=your-api-key
RUNPOD_ENDPOINT_ID=your-endpoint-id

# Optional
RUNPOD_ENDPOINT_URL=https://your-endpoint-url.proxy.runpod.net
TEST_TIMEOUT=600000
TEST_POLL_INTERVAL=5000
TEST_RETRIES=3
```

---

## Testing Strategy

### Unit Tests

- Test each validator in isolation
- Mock RunPod and ComfyUI API responses
- Test error handling and edge cases
- Target: 80%+ code coverage

### Integration Tests

- Test framework with real RunPod API (test endpoint)
- Test dependency verification with real ComfyUI API
- Test workflow submission and polling

### E2E Tests

- Test complete validation flow on actual serverless endpoint
- Test Denrisi workflow end-to-end
- Test performance benchmarking

---

## Success Criteria

### Technical

- [ ] All CLI commands work correctly
- [ ] Framework is reusable for any workflow
- [ ] All validators pass for Denrisi workflow
- [ ] Performance metrics meet targets
- [ ] CI/CD integration works
- [ ] 80%+ code coverage

### Functional

- [ ] Endpoint health check works
- [ ] Dependency verification works
- [ ] Workflow testing works
- [ ] Performance benchmarking works
- [ ] Denrisi validation passes
- [ ] Reports are generated correctly

---

**Last Updated**: 2026-01-15  
**Status**: P5 (Technical Spec) Complete
