# EP-044 (P3) — RunPod Serverless Endpoint Testing: Architecture

Working in **PHASE P3 (Architecture + API)** on **EP-044, ST-047-ST-053**.

## Goal

Ship a comprehensive testing and validation framework that:
- Validates serverless endpoint health and configuration
- Verifies all dependencies (custom nodes, models) are installed correctly
- Tests ComfyUI workflows end-to-end on serverless endpoints
- Benchmarks performance (cold start, generation time, cost)
- Provides reusable framework for testing any workflow
- Integrates into CI/CD for automated validation

---

## Architecture (Layers)

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    TEST FRAMEWORK LAYER                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  scripts/tests/serverless/                                 │  │
│  │  ├── framework.ts                    (F5: Reusable)       │  │
│  │  ├── endpoint-validator.ts           (F1: Health Check)   │  │
│  │  ├── dependency-verifier.ts          (F4: Dependencies)   │  │
│  │  ├── workflow-tester.ts              (F2: Workflow Test)  │  │
│  │  ├── performance-benchmark.ts        (F3: Performance)    │  │
│  │  └── denrisi-validator.ts            (F6: Denrisi)        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    VALIDATION LAYER                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  scripts/tests/serverless/validators/                      │  │
│  │  ├── node-validator.ts              (F4: Node Check)      │  │
│  │  ├── model-validator.ts             (F4: Model Check)     │  │
│  │  └── image-validator.ts             (F2: Image Check)     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REPORTING LAYER                               │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  scripts/tests/serverless/reporters/                      │  │
│  │  ├── test-reporter.ts              (F5: Test Reports)     │  │
│  │  └── performance-reporter.ts      (F3: Perf Reports)     │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL API LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  RunPod Serverless API                                    │  │
│  │  ├── POST /v2/{endpoint_id}/run      (Submit job)        │  │
│  │  └── GET /v2/{endpoint_id}/status/{job_id} (Status)      │  │
│  │                                                           │  │
│  │  ComfyUI API (via endpoint)                               │  │
│  │  ├── GET /system_stats              (Health check)        │  │
│  │  └── GET /object_info/{node}        (Node info)           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

**1. Endpoint Validation Flow:**
```
RunPod API
    ↓
Endpoint Validator (endpoint-validator.ts)
    ├── Check endpoint exists
    ├── Check endpoint is accessible
    └── Check endpoint configuration
    ↓
Validation Report
```

**2. Dependency Verification Flow:**
```
ComfyUI API (via endpoint)
    ↓
Dependency Verifier (dependency-verifier.ts)
    ├── Node Validator → Check custom nodes installed
    ├── Model Validator → Check models exist on volume
    └── Version Checker → Compare with EP-039 registry
    ↓
Dependency Report
```

**3. Workflow Testing Flow:**
```
Workflow Definition (JSON)
    ↓
Workflow Tester (workflow-tester.ts)
    ├── Submit to RunPod API
    ├── Poll job status
    ├── Retrieve results
    └── Image Validator → Validate image format/size
    ↓
Test Result Report
```

**4. Performance Benchmarking Flow:**
```
Workflow Test Execution
    ↓
Performance Benchmark (performance-benchmark.ts)
    ├── Measure cold start time
    ├── Measure generation time
    ├── Calculate cost per image
    └── Generate performance report
    ↓
Performance Report
```

---

## Data Models

### Test Configuration

```typescript
interface TestConfig {
  endpointId: string;
  apiKey: string;
  endpointUrl?: string; // Optional: if ComfyUI API is accessible
  timeout?: number; // Default: 600000 (10 minutes)
  retries?: number; // Default: 3
  pollInterval?: number; // Default: 5000 (5 seconds)
  mockMode?: boolean; // Default: false - Enable mock mode for local testing
  mockResponses?: MockResponses; // Optional: Custom mock responses
}

interface MockResponses {
  runpod?: {
    jobSubmission?: { id: string; status: string };
    jobStatus?: Record<string, JobStatus>; // jobId -> status
  };
  comfyui?: {
    systemStats?: unknown;
    nodeInfo?: Record<string, unknown>; // nodeType -> info
    modelList?: string[];
  };
}
```

### Workflow Test Definition

```typescript
interface WorkflowTestDefinition {
  id: string;
  name: string;
  workflow: ComfyUIWorkflow; // From libs/business/src/workflows
  expectedNodes?: string[]; // Required custom nodes
  expectedModels?: string[]; // Required models
  testCases: TestCase[];
}

interface TestCase {
  name: string;
  prompt: string;
  negativePrompt?: string;
  seed?: number;
  expectedResult: 'success' | 'error';
  expectedError?: string;
}
```

### Test Result

```typescript
interface TestResult {
  testId: string;
  workflowId: string;
  endpointId: string;
  status: 'passed' | 'failed' | 'timeout' | 'error';
  startTime: string;
  endTime: string;
  duration: number;
  coldStartTime?: number;
  generationTime?: number;
  jobId?: string;
  images?: ImageResult[];
  error?: string;
  metrics?: PerformanceMetrics;
}

interface ImageResult {
  filename: string;
  format: 'png' | 'jpeg';
  size: number; // bytes
  width?: number;
  height?: number;
  isValid: boolean;
  data?: string; // base64 (optional, for validation)
}

interface PerformanceMetrics {
  coldStartTime: number; // ms
  generationTime: number; // ms
  totalTime: number; // ms
  costPerImage: number; // RunPod credits
  imagesGenerated: number;
}
```

### Validation Report

```typescript
interface ValidationReport {
  endpointId: string;
  timestamp: string;
  health: HealthCheckResult;
  dependencies: DependencyVerificationResult;
  workflows: WorkflowTestResult[];
  performance: PerformanceBenchmarkResult;
}

interface HealthCheckResult {
  accessible: boolean;
  endpointExists: boolean;
  configurationValid: boolean;
  errors?: string[];
}

interface DependencyVerificationResult {
  nodes: NodeVerificationResult[];
  models: ModelVerificationResult[];
  allVerified: boolean;
}

interface NodeVerificationResult {
  name: string;
  installed: boolean;
  version?: string;
  expectedVersion?: string;
  error?: string;
}

interface ModelVerificationResult {
  name: string;
  exists: boolean;
  path?: string;
  size?: number;
  error?: string;
}
```

---

## API Contracts

### RunPod Serverless API

**Submit Job:**
```
POST https://api.runpod.ai/v2/{endpoint_id}/run
Headers:
  Content-Type: application/json
  Authorization: Bearer {api_key}
Body:
  {
    "input": {
      "workflow": { /* ComfyUI workflow JSON */ }
    }
  }
Response:
  {
    "id": "job-uuid",
    "status": "IN_QUEUE"
  }
```

**Get Job Status:**
```
GET https://api.runpod.ai/v2/{endpoint_id}/status/{job_id}
Headers:
  Authorization: Bearer {api_key}
Response (In Progress):
  {
    "id": "job-uuid",
    "status": "IN_PROGRESS",
    "delayTime": 2188
  }
Response (Completed):
  {
    "id": "job-uuid",
    "status": "COMPLETED",
    "delayTime": 2188,
    "executionTime": 2297,
    "output": {
      "images": [
        {
          "filename": "ComfyUI_00001_.png",
          "type": "base64",
          "data": "data:image/png;base64,..."
        }
      ]
    }
  }
```

### ComfyUI API (via Endpoint)

**Health Check:**
```
GET {endpoint_url}/system_stats
Response:
  {
    "system": {
      "os": "posix",
      "python_version": "3.10.x"
    },
    "devices": [...]
  }
```

**Get Node Info:**
```
GET {endpoint_url}/object_info/{node_type}
Response:
  {
    "input": { /* node input schema */ },
    "output": [ /* node output types */ ]
  }
```

---

## File Structure

```
scripts/tests/serverless/
├── framework.ts                    # Reusable test framework
├── endpoint-validator.ts           # Endpoint health check
├── dependency-verifier.ts          # Dependency verification
├── workflow-tester.ts             # Workflow testing
├── performance-benchmark.ts       # Performance benchmarking
├── denrisi-validator.ts           # Denrisi-specific validation
├── cli.ts                         # CLI interface
├── types.ts                       # TypeScript type definitions
├── validators/
│   ├── node-validator.ts          # Node verification
│   ├── model-validator.ts         # Model verification
│   └── image-validator.ts         # Image validation
├── reporters/
│   ├── test-reporter.ts           # Test report generator
│   └── performance-reporter.ts   # Performance report generator
├── utils/
│   ├── runpod-client.ts           # RunPod API client
│   ├── comfyui-client.ts          # ComfyUI API client
│   ├── image-decoder.ts           # Base64 image decoder
│   └── mock-clients.ts            # Mock clients for local testing
├── fixtures/
│   ├── denrisi-workflow.json      # Test workflow fixture
│   └── mock-responses.json        # Mock API responses
└── __test-utils__/
    ├── mock-runpod-client.ts      # Mock RunPod client
    └── mock-comfyui-client.ts     # Mock ComfyUI client
```

---

## Component Responsibilities

### Framework (`framework.ts`)

**Purpose**: Reusable test framework for any ComfyUI workflow

**Responsibilities**:
- Accept workflow test definition
- Execute test cases
- Coordinate validators and reporters
- Handle errors and timeouts
- Generate test reports
- Support mock mode for local testing

**Interface**:
```typescript
class ServerlessTestFramework {
  constructor(config: TestConfig);
  
  async runTest(
    testDefinition: WorkflowTestDefinition
  ): Promise<TestResult[]>;
  
  async validateEndpoint(): Promise<HealthCheckResult>;
  
  async verifyDependencies(
    expectedNodes: string[],
    expectedModels: string[]
  ): Promise<DependencyVerificationResult>;
  
  // Internal: Selects real or mock clients based on config
  private getRunPodClient(): IRunPodClient;
  private getComfyUIClient(): IComfyUIClient;
}
```

### Endpoint Validator (`endpoint-validator.ts`)

**Purpose**: Validate serverless endpoint health and configuration

**Responsibilities**:
- Check endpoint exists via RunPod API
- Verify endpoint is accessible
- Check endpoint configuration (GPU, network volume, etc.)
- Generate health check report

**Interface**:
```typescript
class EndpointValidator {
  async validate(config: TestConfig): Promise<HealthCheckResult>;
  async checkAccessibility(endpointId: string): Promise<boolean>;
  async checkConfiguration(endpointId: string): Promise<ConfigCheckResult>;
}
```

### Dependency Verifier (`dependency-verifier.ts`)

**Purpose**: Verify all dependencies are installed correctly

**Responsibilities**:
- Verify custom nodes via ComfyUI API
- Verify models exist on network volume
- Check versions match EP-039 registry
- Generate dependency report

**Interface**:
```typescript
class DependencyVerifier {
  async verify(
    config: TestConfig,
    expectedNodes: string[],
    expectedModels: string[]
  ): Promise<DependencyVerificationResult>;
  
  async verifyNodes(
    endpointUrl: string,
    expectedNodes: string[]
  ): Promise<NodeVerificationResult[]>;
  
  async verifyModels(
    endpointUrl: string,
    expectedModels: string[]
  ): Promise<ModelVerificationResult[]>;
}
```

### Workflow Tester (`workflow-tester.ts`)

**Purpose**: Test workflows end-to-end on serverless endpoints

**Responsibilities**:
- Submit workflow to RunPod API
- Poll job status until completion
- Retrieve and decode image results
- Validate image format and quality
- Handle errors and timeouts

**Interface**:
```typescript
class WorkflowTester {
  async testWorkflow(
    config: TestConfig,
    workflow: ComfyUIWorkflow
  ): Promise<TestResult>;
  
  async submitJob(
    endpointId: string,
    workflow: ComfyUIWorkflow
  ): Promise<string>; // Returns job ID
  
  async pollJobStatus(
    endpointId: string,
    jobId: string,
    timeout: number
  ): Promise<JobStatus>;
}
```

### Performance Benchmark (`performance-benchmark.ts`)

**Purpose**: Measure and report performance metrics

**Responsibilities**:
- Measure cold start time
- Measure generation time
- Calculate cost per image
- Generate performance report

**Interface**:
```typescript
class PerformanceBenchmark {
  async benchmark(
    config: TestConfig,
    workflow: ComfyUIWorkflow,
    iterations: number
  ): Promise<PerformanceMetrics>;
  
  async measureColdStart(
    config: TestConfig,
    workflow: ComfyUIWorkflow
  ): Promise<number>; // Returns cold start time in ms
}
```

### Denrisi Validator (`denrisi-validator.ts`)

**Purpose**: Specific validation for Denrisi workflow

**Responsibilities**:
- Test Denrisi workflow with various prompts
- Verify all required nodes (res4lyf)
- Verify all required models (Z-Image-Turbo)
- Validate performance meets targets
- Generate validation report

**Interface**:
```typescript
class DenrisiValidator {
  async validate(
    config: TestConfig
  ): Promise<ValidationReport>;
  
  async testWorkflow(
    config: TestConfig,
    prompt: string
  ): Promise<TestResult>;
}
```

---

## Integration Points

### EP-039 Integration

**Dependency Registry**:
- Use `scripts/setup/comfyui-registry.ts` for expected dependencies
- Use `scripts/setup/comfyui-dependency-resolver.ts` for workflow analysis
- Verify installed versions match registry

**Generated Scripts**:
- Use `scripts/generated/install-all-models.sh` for model verification
- Use `scripts/generated/Dockerfile.comfyui-worker` for node verification

### Workflow Integration

**Workflow Definitions**:
- Use `libs/business/src/workflows/z-image-danrisi.ts` for Denrisi workflow
- Use `libs/business/src/workflows/registry.ts` for workflow definitions
- Support any workflow from workflow registry

### CI/CD Integration

**GitHub Actions**:
- Run tests on workflow changes
- Pre-deployment validation
- Test result reporting
- Failure notifications

---

## Environment Variables

```bash
# Required
RUNPOD_API_KEY=your-api-key
RUNPOD_ENDPOINT_ID=your-endpoint-id

# Optional
RUNPOD_ENDPOINT_URL=https://your-endpoint-url.proxy.runpod.net  # For ComfyUI API access
TEST_TIMEOUT=600000  # 10 minutes default
TEST_POLL_INTERVAL=5000  # 5 seconds default
TEST_RETRIES=3  # Default retry count
```

---

## Error Handling

### Error Types

1. **Endpoint Errors**: Endpoint not found, not accessible, configuration issues
2. **Dependency Errors**: Missing nodes, missing models, version mismatches
3. **Workflow Errors**: Invalid workflow, job failures, timeouts
4. **API Errors**: RunPod API failures, ComfyUI API failures
5. **Validation Errors**: Image validation failures, format errors

### Error Recovery

- **Retry Logic**: Automatic retry for transient errors (API failures, timeouts)
- **Graceful Degradation**: Continue testing other workflows if one fails
- **Error Reporting**: Detailed error messages in test reports
- **Timeout Handling**: Configurable timeouts with clear error messages

---

## Testing Strategy

### Mock Mode (Local Development)

**Purpose**: Enable local testing without real API calls

**Features**:
- Mock RunPod API responses (job submission, status polling)
- Mock ComfyUI API responses (health check, node info, model list)
- Skip actual image generation
- Test framework logic without costs
- Fast iteration during development

**Usage**:
```typescript
const config: TestConfig = {
  endpointId: 'mock-endpoint',
  apiKey: 'mock-key',
  mockMode: true,
  mockResponses: {
    runpod: {
      jobSubmission: { id: 'mock-job-id', status: 'IN_QUEUE' },
      jobStatus: {
        'mock-job-id': {
          status: 'COMPLETED',
          output: { images: [{ data: 'data:image/png;base64,...' }] }
        }
      }
    }
  }
};
```

### Unit Tests

- Test individual validators in isolation
- Mock RunPod and ComfyUI API responses
- Test error handling and edge cases
- Use mock mode for framework testing

### Integration Tests

- Test framework with real RunPod API (with test endpoint)
- Test dependency verification with real ComfyUI API
- Test workflow submission and polling
- Can use mock mode for faster iteration

### E2E Tests

- Test complete validation flow on actual serverless endpoint
- Test Denrisi workflow end-to-end
- Test performance benchmarking
- Use real endpoints (mock mode disabled)

---

## Performance Considerations

### Optimization

- **Parallel Testing**: Run multiple test cases in parallel (if supported)
- **Caching**: Cache endpoint health checks and dependency verification
- **Polling Optimization**: Adaptive polling intervals (faster when close to completion)
- **Timeout Management**: Configurable timeouts per test type

### Resource Usage

- **API Rate Limits**: Respect RunPod API rate limits
- **Cost Management**: Track RunPod credits used during testing
- **Test Isolation**: Each test should be independent and clean up after itself

---

## Security Considerations

### API Keys

- Never commit API keys to repository
- Use environment variables for all secrets
- Validate API keys before making requests

### Data Handling

- Don't store base64 images in reports (optional flag)
- Clean up temporary files after tests
- Don't log sensitive information

---

## Future Enhancements

### Phase 2+ Features

- **Historical Tracking**: Track test results over time
- **Comparison Reports**: Compare performance across endpoints
- **Automated Analysis**: AI-powered test result analysis
- **Dashboard UI**: Web dashboard for viewing test results
- **Alerting**: Automated alerts on test failures

---

**Last Updated**: 2026-01-15  
**Status**: P3 (Architecture) Complete
