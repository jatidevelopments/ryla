/**
 * EP-044: RunPod Serverless Endpoint Testing Framework
 * Type Definitions
 *
 * @module scripts/tests/serverless/types
 */

// =============================================================================
// Configuration Types
// =============================================================================

/**
 * Test framework configuration
 */
export interface TestConfig {
  /** RunPod endpoint ID */
  endpointId: string;
  /** RunPod API key */
  apiKey: string;
  /** Optional: ComfyUI API URL for direct access */
  endpointUrl?: string;
  /** Timeout in milliseconds (default: 600000 = 10 minutes) */
  timeout?: number;
  /** Number of retries for failed requests (default: 3) */
  retries?: number;
  /** Poll interval in milliseconds (default: 5000 = 5 seconds) */
  pollInterval?: number;
  /** Enable mock mode for local testing (default: false) */
  mockMode?: boolean;
  /** Custom mock responses for testing */
  mockResponses?: MockResponses;
}

/**
 * Default configuration values
 */
export const DEFAULT_CONFIG: Required<
  Pick<TestConfig, 'timeout' | 'retries' | 'pollInterval' | 'mockMode'>
> = {
  timeout: 600000, // 10 minutes
  retries: 3,
  pollInterval: 5000, // 5 seconds
  mockMode: false,
};

// =============================================================================
// Mock Response Types
// =============================================================================

/**
 * Mock responses for local testing
 */
export interface MockResponses {
  /** Mock RunPod API responses */
  runpod?: MockRunPodResponses;
  /** Mock ComfyUI API responses */
  comfyui?: MockComfyUIResponses;
}

/**
 * Mock RunPod API responses
 */
export interface MockRunPodResponses {
  /** Mock job submission response */
  jobSubmission?: RunPodJobSubmissionResponse;
  /** Mock job status responses by job ID */
  jobStatus?: Record<string, RunPodJobStatusResponse>;
  /** Mock health check response */
  healthCheck?: RunPodHealthCheckResponse;
}

/**
 * Mock ComfyUI API responses
 */
export interface MockComfyUIResponses {
  /** Mock system stats response */
  systemStats?: ComfyUISystemStats;
  /** Mock node info by node type */
  nodeInfo?: Record<string, ComfyUINodeInfo>;
  /** Mock model list */
  modelList?: string[];
  /** Mock object info (all nodes) */
  objectInfo?: Record<string, ComfyUINodeInfo>;
}

// =============================================================================
// RunPod API Types
// =============================================================================

/**
 * RunPod job status values
 */
export type RunPodJobStatus =
  | 'IN_QUEUE'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED'
  | 'CANCELLED'
  | 'TIMED_OUT';

/**
 * RunPod job submission response
 */
export interface RunPodJobSubmissionResponse {
  /** Job ID */
  id: string;
  /** Initial job status */
  status: RunPodJobStatus;
}

/**
 * RunPod job status response
 */
export interface RunPodJobStatusResponse {
  /** Job ID */
  id: string;
  /** Current job status */
  status: RunPodJobStatus;
  /** Time spent in queue (ms) */
  delayTime?: number;
  /** Time spent executing (ms) */
  executionTime?: number;
  /** Job output (when completed) */
  output?: RunPodJobOutput;
  /** Error message (when failed) */
  error?: string;
}

/**
 * RunPod job output
 */
export interface RunPodJobOutput {
  /** Generated images */
  images?: RunPodImage[];
  /** Status message */
  message?: string;
  /** Raw output data */
  [key: string]: unknown;
}

/**
 * RunPod image output
 */
export interface RunPodImage {
  /** Image filename */
  filename?: string;
  /** Image type */
  type?: 'base64' | 'url';
  /** Image data (base64 or URL) */
  data: string;
}

/**
 * RunPod health check response
 */
export interface RunPodHealthCheckResponse {
  /** Whether endpoint is accessible */
  accessible: boolean;
  /** Endpoint status */
  status?: string;
  /** Error message if not accessible */
  error?: string;
}

/**
 * Comprehensive endpoint diagnostics
 */
export interface EndpointDiagnostics {
  /** Basic health check */
  health: HealthCheckResult;
  /** Worker availability check */
  workers: WorkerDiagnostics;
  /** Job processing test */
  jobProcessing: JobProcessingDiagnostics;
  /** Overall endpoint status */
  overallStatus: 'operational' | 'degraded' | 'unavailable';
  /** Summary of issues found */
  issues: string[];
  /** Recommendations */
  recommendations: string[];
}

/**
 * Worker diagnostics
 */
export interface WorkerDiagnostics {
  /** Whether workers are available */
  available: boolean;
  /** Number of active workers */
  activeWorkers?: number;
  /** Whether workers can spin up */
  canSpinUp: boolean;
  /** Time to spin up (if tested) */
  spinUpTime?: number;
  /** Issues found */
  issues: string[];
}

/**
 * Job processing diagnostics
 */
export interface JobProcessingDiagnostics {
  /** Whether endpoint can accept jobs */
  canAcceptJobs: boolean;
  /** Whether jobs are being processed */
  processingJobs: boolean;
  /** Test job ID (if submitted) */
  testJobId?: string;
  /** Test job status */
  testJobStatus?: RunPodJobStatus;
  /** Time in queue (if applicable) */
  queueTime?: number;
  /** Issues found */
  issues: string[];
}

// =============================================================================
// ComfyUI API Types
// =============================================================================

/**
 * ComfyUI system stats response
 */
export interface ComfyUISystemStats {
  system: {
    os: string;
    python_version: string;
    embedded_python?: boolean;
  };
  devices: ComfyUIDevice[];
}

/**
 * ComfyUI device info
 */
export interface ComfyUIDevice {
  name: string;
  type: string;
  index: number;
  vram_total?: number;
  vram_free?: number;
  torch_vram_total?: number;
  torch_vram_free?: number;
}

/**
 * ComfyUI node info
 */
export interface ComfyUINodeInfo {
  input: {
    required?: Record<string, unknown>;
    optional?: Record<string, unknown>;
  };
  output: string[];
  output_is_list?: boolean[];
  output_name?: string[];
  name?: string;
  display_name?: string;
  description?: string;
  category?: string;
}

/**
 * ComfyUI workflow structure
 */
export interface ComfyUIWorkflow {
  [nodeId: string]: ComfyUINode;
}

/**
 * ComfyUI workflow node
 */
export interface ComfyUINode {
  inputs: Record<string, unknown>;
  class_type: string;
  _meta?: {
    title?: string;
  };
}

// =============================================================================
// Test Definition Types
// =============================================================================

/**
 * Workflow test definition
 */
export interface WorkflowTestDefinition {
  /** Unique test ID */
  id: string;
  /** Human-readable test name */
  name: string;
  /** ComfyUI workflow to test */
  workflow: ComfyUIWorkflow;
  /** Expected custom nodes required */
  expectedNodes?: string[];
  /** Expected models required */
  expectedModels?: string[];
  /** Test cases to execute */
  testCases: TestCase[];
}

/**
 * Individual test case
 */
export interface TestCase {
  /** Test case ID */
  id: string;
  /** Test case name */
  name: string;
  /** Test input overrides */
  inputs?: Record<string, unknown>;
  /** Expected outcome */
  expected: TestExpectation;
}

/**
 * Expected test outcome
 */
export interface TestExpectation {
  /** Expected status */
  status: 'success' | 'failure' | 'error';
  /** Expected image count */
  imageCount?: number;
  /** Expected minimum image width */
  minWidth?: number;
  /** Expected minimum image height */
  minHeight?: number;
  /** Expected error message pattern (regex) */
  errorPattern?: string;
}

// =============================================================================
// Test Result Types
// =============================================================================

/**
 * Test execution result
 */
export interface TestResult {
  /** Test case ID */
  testId: string;
  /** Test case name */
  testName: string;
  /** RunPod job ID */
  jobId?: string;
  /** Whether test passed */
  passed: boolean;
  /** Test status */
  status: 'passed' | 'failed' | 'error' | 'skipped';
  /** Error message if failed/error */
  error?: string;
  /** Test duration in milliseconds */
  duration: number;
  /** Generated images */
  images?: ImageResult[];
  /** Performance metrics */
  performance?: PerformanceMetrics;
  /** Timestamp */
  timestamp: string;
}

/**
 * Generated image result
 */
export interface ImageResult {
  /** Image filename */
  filename?: string;
  /** Image format (png, jpeg, etc.) */
  format?: string;
  /** Image width in pixels */
  width?: number;
  /** Image height in pixels */
  height?: number;
  /** Image size in bytes */
  size?: number;
  /** Whether image is valid */
  isValid: boolean;
  /** Base64 data (optional, for validation) */
  data?: string;
  /** Validation errors */
  errors?: string[];
}

/**
 * Performance metrics
 */
export interface PerformanceMetrics {
  /** Cold start time in milliseconds */
  coldStartTime: number;
  /** Generation time in milliseconds */
  generationTime: number;
  /** Total time in milliseconds */
  totalTime: number;
  /** Cost per image in RunPod credits */
  costPerImage: number;
  /** Number of images generated */
  imagesGenerated: number;
  /** Queue delay time in milliseconds */
  queueDelayTime?: number;
}

// =============================================================================
// Validation Report Types
// =============================================================================

/**
 * Complete validation report
 */
export interface ValidationReport {
  /** Endpoint ID */
  endpointId: string;
  /** Report generation timestamp */
  timestamp: string;
  /** Health check results */
  health: HealthCheckResult;
  /** Dependency verification results */
  dependencies: DependencyVerificationResult;
  /** Workflow test results */
  workflows: WorkflowTestResult[];
  /** Performance benchmark results */
  performance: PerformanceBenchmarkResult;
  /** Overall validation status */
  overallStatus: 'passed' | 'failed' | 'partial';
  /** Summary statistics */
  summary: ValidationSummary;
}

/**
 * Validation summary
 */
export interface ValidationSummary {
  /** Total tests run */
  totalTests: number;
  /** Tests passed */
  passedTests: number;
  /** Tests failed */
  failedTests: number;
  /** Tests with errors */
  errorTests: number;
  /** Tests skipped */
  skippedTests: number;
  /** Pass rate percentage */
  passRate: number;
}

/**
 * Health check result
 */
export interface HealthCheckResult {
  /** Whether endpoint is accessible */
  accessible: boolean;
  /** Whether endpoint exists */
  endpointExists: boolean;
  /** Whether configuration is valid */
  configurationValid: boolean;
  /** Response time in milliseconds */
  responseTime?: number;
  /** Error messages */
  errors?: string[];
}

/**
 * Dependency verification result
 */
export interface DependencyVerificationResult {
  /** Node verification results */
  nodes: NodeVerificationResult[];
  /** Model verification results */
  models: ModelVerificationResult[];
  /** Whether all dependencies are verified */
  allVerified: boolean;
  /** Summary counts */
  summary: {
    nodesVerified: number;
    nodesTotal: number;
    modelsVerified: number;
    modelsTotal: number;
  };
}

/**
 * Node verification result
 */
export interface NodeVerificationResult {
  /** Node class type name */
  name: string;
  /** Whether node is installed */
  installed: boolean;
  /** Installed version (if available) */
  version?: string;
  /** Expected version (from registry) */
  expectedVersion?: string;
  /** Version match status */
  versionMatch?: boolean;
  /** Error message */
  error?: string;
}

/**
 * Model verification result
 */
export interface ModelVerificationResult {
  /** Model name */
  name: string;
  /** Whether model exists */
  exists: boolean;
  /** Model file path */
  path?: string;
  /** Model file size in bytes */
  size?: number;
  /** Expected size (from registry) */
  expectedSize?: number;
  /** Size match status */
  sizeMatch?: boolean;
  /** Error message */
  error?: string;
}

/**
 * Workflow test result
 */
export interface WorkflowTestResult {
  /** Workflow ID */
  workflowId: string;
  /** Workflow name */
  workflowName: string;
  /** Test results */
  tests: TestResult[];
  /** Pass rate for this workflow */
  passRate: number;
  /** Overall status */
  status: 'passed' | 'failed' | 'partial';
}

/**
 * Performance benchmark result
 */
export interface PerformanceBenchmarkResult {
  /** Number of iterations run */
  iterations: number;
  /** Average cold start time (ms) */
  avgColdStartTime: number;
  /** Average generation time (ms) */
  avgGenerationTime: number;
  /** Average total time (ms) */
  avgTotalTime: number;
  /** Min generation time (ms) */
  minGenerationTime: number;
  /** Max generation time (ms) */
  maxGenerationTime: number;
  /** Average cost per image (credits) */
  avgCostPerImage: number;
  /** Total cost for all iterations (credits) */
  totalCost: number;
  /** Performance target met */
  targetsMet: {
    coldStart: boolean;
    generationTime: boolean;
    costPerImage: boolean;
  };
}

// =============================================================================
// Client Interface Types
// =============================================================================

/**
 * RunPod client interface (for dependency injection)
 */
export interface IRunPodClient {
  /** Submit a job to the endpoint */
  submitJob(workflow: ComfyUIWorkflow): Promise<RunPodJobSubmissionResponse>;
  /** Get job status */
  getJobStatus(jobId: string): Promise<RunPodJobStatusResponse>;
  /** Check endpoint health */
  healthCheck(): Promise<RunPodHealthCheckResponse>;
  /** Get comprehensive endpoint diagnostics */
  getDiagnostics?(
    testWorkflow?: ComfyUIWorkflow,
    timeout?: number
  ): Promise<EndpointDiagnostics>;
  /** Poll job until completion */
  pollJobUntilComplete(
    jobId: string,
    timeout?: number,
    pollInterval?: number
  ): Promise<RunPodJobStatusResponse>;
}

/**
 * ComfyUI client interface (for dependency injection)
 */
export interface IComfyUIClient {
  /** Get system stats */
  getSystemStats(): Promise<ComfyUISystemStats>;
  /** Get node info */
  getNodeInfo(nodeType: string): Promise<ComfyUINodeInfo | null>;
  /** Get all available nodes */
  getObjectInfo(): Promise<Record<string, ComfyUINodeInfo>>;
  /** Check if node exists */
  nodeExists(nodeType: string): Promise<boolean>;
  /** List available models */
  listModels(): Promise<string[]>;
}

// =============================================================================
// CLI Types
// =============================================================================

/**
 * CLI command options
 */
export interface CLIOptions {
  /** RunPod endpoint ID */
  endpointId?: string;
  /** Workflow ID to test */
  workflow?: string;
  /** Test prompt */
  prompt?: string;
  /** Number of test iterations */
  iterations?: number;
  /** Timeout in milliseconds */
  timeout?: number;
  /** Enable mock mode */
  mock?: boolean;
  /** Number of test samples */
  samples?: number;
  /** Run full validation */
  full?: boolean;
  /** Output format */
  format?: 'console' | 'json' | 'markdown';
  /** Output file path */
  output?: string;
  /** Verbose logging */
  verbose?: boolean;
}

/**
 * CLI command result
 */
export interface CLIResult {
  /** Whether command succeeded */
  success: boolean;
  /** Result data */
  data?: unknown;
  /** Error message */
  error?: string;
  /** Exit code */
  exitCode: number;
}
