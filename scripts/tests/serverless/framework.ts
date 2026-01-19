/**
 * EP-044: Serverless Test Framework
 *
 * Reusable test framework for testing ComfyUI workflows on RunPod serverless endpoints.
 * Supports mock mode for local testing without real API calls.
 *
 * @module scripts/tests/serverless/framework
 */

import type {
  TestConfig,
  IRunPodClient,
  IComfyUIClient,
  WorkflowTestDefinition,
  TestResult,
  TestCase,
  HealthCheckResult,
  DependencyVerificationResult,
  PerformanceMetrics,
  ValidationReport,
  ComfyUIWorkflow,
  RunPodJobStatusResponse,
} from './types';
import { DEFAULT_CONFIG } from './types';
import { RunPodClient } from './utils/runpod-client';
import { ComfyUIClient } from './utils/comfyui-client';
import { MockRunPodClient } from './__test-utils__/mock-runpod-client';
import { MockComfyUIClient } from './__test-utils__/mock-comfyui-client';
import {
  NodeValidator,
  summarizeNodeVerification,
} from './validators/node-validator';
import {
  ModelValidator,
  summarizeModelVerification,
} from './validators/model-validator';
import { ImageValidator } from './validators/image-validator';
import { processRunPodImages } from './utils/image-decoder';

/**
 * Serverless Test Framework
 *
 * Main entry point for testing ComfyUI workflows on RunPod serverless endpoints.
 */
export class ServerlessTestFramework {
  private readonly config: Required<TestConfig>;
  private readonly runpodClient: IRunPodClient;
  private readonly comfyuiClient: IComfyUIClient | null;
  private readonly nodeValidator: NodeValidator;
  private readonly modelValidator: ModelValidator;
  private readonly imageValidator: ImageValidator;

  constructor(config: TestConfig) {
    // Merge with defaults
    this.config = {
      endpointId: config.endpointId,
      apiKey: config.apiKey,
      endpointUrl: config.endpointUrl ?? '',
      timeout: config.timeout ?? DEFAULT_CONFIG.timeout,
      retries: config.retries ?? DEFAULT_CONFIG.retries,
      pollInterval: config.pollInterval ?? DEFAULT_CONFIG.pollInterval,
      mockMode: config.mockMode ?? DEFAULT_CONFIG.mockMode,
      mockResponses: config.mockResponses ?? {},
    };

    // Create clients based on mock mode
    if (this.config.mockMode) {
      this.runpodClient = new MockRunPodClient(
        this.config.mockResponses?.runpod
      );
      this.comfyuiClient = new MockComfyUIClient(
        this.config.mockResponses?.comfyui
      );
    } else {
      this.runpodClient = new RunPodClient(this.config);
      // ComfyUI client requires endpoint URL
      this.comfyuiClient = this.config.endpointUrl
        ? new ComfyUIClient(this.config)
        : null;
    }

    // Create validators
    this.nodeValidator = new NodeValidator(
      this.comfyuiClient ?? new MockComfyUIClient()
    );
    this.modelValidator = new ModelValidator(
      this.comfyuiClient ?? new MockComfyUIClient()
    );
    this.imageValidator = new ImageValidator();
  }

  /**
   * Check if running in mock mode
   */
  get isMockMode(): boolean {
    return this.config.mockMode;
  }

  /**
   * Validate endpoint health
   */
  async validateEndpoint(): Promise<HealthCheckResult> {
    const startTime = Date.now();

    try {
      const health = await this.runpodClient.healthCheck();

      return {
        accessible: health.accessible,
        endpointExists: !health.error?.includes('not found'),
        configurationValid: health.accessible,
        responseTime: Date.now() - startTime,
        errors: health.error ? [health.error] : undefined,
      };
    } catch (error) {
      return {
        accessible: false,
        endpointExists: false,
        configurationValid: false,
        responseTime: Date.now() - startTime,
        errors: [error instanceof Error ? error.message : String(error)],
      };
    }
  }

  /**
   * Get comprehensive endpoint diagnostics
   * This checks health, worker availability, and job processing capability
   */
  async getDiagnostics(
    testWorkflow?: ComfyUIWorkflow
  ): Promise<import('./types').EndpointDiagnostics> {
    if (this.config.mockMode) {
      // Return mock diagnostics
      return {
        health: {
          accessible: true,
          endpointExists: true,
          configurationValid: true,
          responseTime: 50,
        },
        workers: {
          available: true,
          canSpinUp: true,
          issues: [],
        },
        jobProcessing: {
          canAcceptJobs: true,
          processingJobs: true,
          issues: [],
        },
        overallStatus: 'operational',
        issues: [],
        recommendations: [],
      };
    }

    if (!this.runpodClient.getDiagnostics) {
      throw new Error('Diagnostics not supported by this client');
    }

    return this.runpodClient.getDiagnostics(testWorkflow);
  }

  /**
   * Verify dependencies (nodes and models)
   */
  async verifyDependencies(
    expectedNodes: string[],
    expectedModels: { name: string; type?: string }[]
  ): Promise<DependencyVerificationResult> {
    const nodeResults = await this.nodeValidator.verifyNodes(expectedNodes);
    const modelResults = await this.modelValidator.verifyModels(expectedModels);

    const nodeSummary = summarizeNodeVerification(nodeResults);
    const modelSummary = summarizeModelVerification(modelResults);

    return {
      nodes: nodeResults,
      models: modelResults,
      allVerified: nodeSummary.allInstalled && modelSummary.allAvailable,
      summary: {
        nodesVerified: nodeSummary.installed,
        nodesTotal: nodeSummary.total,
        modelsVerified: modelSummary.available,
        modelsTotal: modelSummary.total,
      },
    };
  }

  /**
   * Run a single test case
   */
  async runTestCase(
    workflow: ComfyUIWorkflow,
    testCase: TestCase
  ): Promise<TestResult> {
    const startTime = Date.now();
    const timestamp = new Date().toISOString();
    let jobId: string | undefined;

    try {
      // Apply test case input overrides to workflow
      const testWorkflow = this.applyInputOverrides(workflow, testCase.inputs);

      // Submit job and wait for completion
      const jobResult = await this.runpodClient.submitJob(testWorkflow);
      jobId = jobResult.id;

      const finalStatus = await this.runpodClient.pollJobUntilComplete(
        jobId,
        this.config.timeout,
        this.config.pollInterval
      );

      const duration = Date.now() - startTime;

      // Check for failure
      if (finalStatus.status === 'FAILED') {
        const passed = testCase.expected.status === 'failure';
        return {
          testId: testCase.id,
          testName: testCase.name,
          jobId,
          passed,
          status: passed ? 'passed' : 'failed',
          error: finalStatus.error,
          duration,
          timestamp,
        };
      }

      // Check for timeout
      if (finalStatus.status === 'TIMED_OUT') {
        return {
          testId: testCase.id,
          testName: testCase.name,
          jobId,
          passed: false,
          status: 'error',
          error: 'Job timed out',
          duration,
          timestamp,
        };
      }

      // Process images
      const images = finalStatus.output?.images ?? [];
      const imageResults = processRunPodImages(images);

      // Validate images against expectations
      const validation = this.imageValidator.validateAgainstExpectation(
        images,
        testCase.expected
      );

      // Calculate performance metrics
      const performance = this.calculatePerformanceMetrics(
        finalStatus,
        duration
      );

      // Determine if test passed
      const passed =
        testCase.expected.status === 'success' &&
        finalStatus.status === 'COMPLETED' &&
        validation.valid;

      return {
        testId: testCase.id,
        testName: testCase.name,
        jobId,
        passed,
        status: passed ? 'passed' : 'failed',
        error:
          validation.errors.length > 0
            ? validation.errors.join('; ')
            : undefined,
        duration,
        images: imageResults,
        performance,
        timestamp,
      };
    } catch (error) {
      return {
        testId: testCase.id,
        testName: testCase.name,
        jobId,
        passed: false,
        status: 'error',
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime,
        timestamp,
      };
    }
  }

  /**
   * Run all tests in a test definition
   */
  async runTest(testDefinition: WorkflowTestDefinition): Promise<TestResult[]> {
    const results: TestResult[] = [];

    for (const testCase of testDefinition.testCases) {
      const result = await this.runTestCase(testDefinition.workflow, testCase);
      results.push(result);

      // Log progress
      console.log(
        `[${result.status.toUpperCase()}] ${testCase.name} (${
          result.duration
        }ms)`
      );
    }

    return results;
  }

  /**
   * Run a complete validation
   */
  async runValidation(
    testDefinition: WorkflowTestDefinition
  ): Promise<ValidationReport> {
    const timestamp = new Date().toISOString();

    // Health check
    console.log('Checking endpoint health...');
    const health = await this.validateEndpoint();

    // Dependency verification
    console.log('Verifying dependencies...');
    const expectedModels = (testDefinition.expectedModels ?? []).map(
      (name) => ({
        name,
      })
    );
    const dependencies = await this.verifyDependencies(
      testDefinition.expectedNodes ?? [],
      expectedModels
    );

    // Run tests
    console.log(`Running ${testDefinition.testCases.length} test(s)...`);
    const testResults = await this.runTest(testDefinition);

    // Calculate summary
    const passedTests = testResults.filter((r) => r.passed).length;
    const failedTests = testResults.filter((r) => r.status === 'failed').length;
    const errorTests = testResults.filter((r) => r.status === 'error').length;
    const skippedTests = testResults.filter(
      (r) => r.status === 'skipped'
    ).length;

    // Calculate performance averages
    const performanceMetrics = testResults
      .filter((r) => r.performance)
      .map((r) => r.performance!);

    const performance = this.aggregatePerformanceMetrics(performanceMetrics);

    // Determine overall status
    let overallStatus: 'passed' | 'failed' | 'partial';
    if (
      passedTests === testResults.length &&
      health.accessible &&
      dependencies.allVerified
    ) {
      overallStatus = 'passed';
    } else if (passedTests === 0) {
      overallStatus = 'failed';
    } else {
      overallStatus = 'partial';
    }

    return {
      endpointId: this.config.endpointId,
      timestamp,
      health,
      dependencies,
      workflows: [
        {
          workflowId: testDefinition.id,
          workflowName: testDefinition.name,
          tests: testResults,
          passRate: (passedTests / testResults.length) * 100,
          status:
            passedTests === testResults.length
              ? 'passed'
              : passedTests > 0
              ? 'partial'
              : 'failed',
        },
      ],
      performance,
      overallStatus,
      summary: {
        totalTests: testResults.length,
        passedTests,
        failedTests,
        errorTests,
        skippedTests,
        passRate: (passedTests / testResults.length) * 100,
      },
    };
  }

  /**
   * Apply input overrides to a workflow
   */
  private applyInputOverrides(
    workflow: ComfyUIWorkflow,
    overrides?: Record<string, unknown>
  ): ComfyUIWorkflow {
    if (!overrides) {
      return workflow;
    }

    // Deep clone workflow
    const clonedWorkflow = JSON.parse(
      JSON.stringify(workflow)
    ) as ComfyUIWorkflow;

    // Apply overrides
    for (const [key, value] of Object.entries(overrides)) {
      // Key format: "nodeId.inputName" or just "inputName" for first matching node
      const [nodeIdOrInput, inputName] = key.split('.');

      if (inputName) {
        // Specific node
        if (clonedWorkflow[nodeIdOrInput]) {
          clonedWorkflow[nodeIdOrInput].inputs[inputName] = value;
        }
      } else {
        // Find first node with this input
        for (const node of Object.values(clonedWorkflow)) {
          if (nodeIdOrInput in node.inputs) {
            node.inputs[nodeIdOrInput] = value;
            break;
          }
        }
      }
    }

    return clonedWorkflow;
  }

  /**
   * Calculate performance metrics from job result
   */
  private calculatePerformanceMetrics(
    jobResult: RunPodJobStatusResponse,
    totalDuration: number
  ): PerformanceMetrics {
    const images = jobResult.output?.images ?? [];

    return {
      coldStartTime: 0, // Would need separate measurement
      generationTime: jobResult.executionTime ?? 0,
      totalTime: totalDuration,
      queueDelayTime: jobResult.delayTime ?? 0,
      costPerImage: this.estimateCost(
        jobResult.executionTime ?? 0,
        images.length
      ),
      imagesGenerated: images.length,
    };
  }

  /**
   * Estimate cost based on execution time
   */
  private estimateCost(executionTimeMs: number, imageCount: number): number {
    // Rough estimate: $0.0002 per second for GPU
    const executionSeconds = executionTimeMs / 1000;
    const totalCost = executionSeconds * 0.0002;
    return imageCount > 0 ? totalCost / imageCount : 0;
  }

  /**
   * Aggregate multiple performance metrics
   */
  private aggregatePerformanceMetrics(
    metrics: PerformanceMetrics[]
  ): import('./types').PerformanceBenchmarkResult {
    if (metrics.length === 0) {
      return {
        iterations: 0,
        avgColdStartTime: 0,
        avgGenerationTime: 0,
        avgTotalTime: 0,
        minGenerationTime: 0,
        maxGenerationTime: 0,
        avgCostPerImage: 0,
        totalCost: 0,
        targetsMet: {
          coldStart: false,
          generationTime: false,
          costPerImage: false,
        },
      };
    }

    const generationTimes = metrics.map((m) => m.generationTime);
    const totalCost = metrics.reduce(
      (sum, m) => sum + m.costPerImage * m.imagesGenerated,
      0
    );
    const totalImages = metrics.reduce((sum, m) => sum + m.imagesGenerated, 0);

    const avgColdStartTime =
      metrics.reduce((sum, m) => sum + m.coldStartTime, 0) / metrics.length;
    const avgGenerationTime =
      generationTimes.reduce((sum, t) => sum + t, 0) / generationTimes.length;
    const avgTotalTime =
      metrics.reduce((sum, m) => sum + m.totalTime, 0) / metrics.length;
    const avgCostPerImage = totalImages > 0 ? totalCost / totalImages : 0;

    return {
      iterations: metrics.length,
      avgColdStartTime,
      avgGenerationTime,
      avgTotalTime,
      minGenerationTime: Math.min(...generationTimes),
      maxGenerationTime: Math.max(...generationTimes),
      avgCostPerImage,
      totalCost,
      targetsMet: {
        coldStart: avgColdStartTime < 60000, // 60 seconds
        generationTime: avgGenerationTime < 30000, // 30 seconds
        costPerImage: avgCostPerImage < 0.01, // $0.01
      },
    };
  }

  /**
   * Get the underlying clients for advanced usage
   */
  getClients(): {
    runpod: IRunPodClient;
    comfyui: IComfyUIClient | null;
  } {
    return {
      runpod: this.runpodClient,
      comfyui: this.comfyuiClient,
    };
  }
}

/**
 * Create a test framework from environment variables
 */
export function createFrameworkFromEnv(
  mockMode = false
): ServerlessTestFramework {
  // Prefer RUNPOD_ENDPOINT_COMFYUI for ComfyUI workflows, fallback to RUNPOD_ENDPOINT_ID
  const endpointId =
    process.env.RUNPOD_ENDPOINT_COMFYUI || process.env.RUNPOD_ENDPOINT_ID;
  const apiKey = process.env.RUNPOD_API_KEY;
  const endpointUrl = process.env.RUNPOD_ENDPOINT_URL;

  if (!mockMode) {
    if (!endpointId) {
      throw new Error(
        'RUNPOD_ENDPOINT_COMFYUI or RUNPOD_ENDPOINT_ID environment variable is required'
      );
    }
    if (!apiKey) {
      throw new Error('RUNPOD_API_KEY environment variable is required');
    }
  }

  return new ServerlessTestFramework({
    endpointId: endpointId ?? 'mock-endpoint',
    apiKey: apiKey ?? 'mock-api-key',
    endpointUrl: endpointUrl ?? (mockMode ? 'http://mock-endpoint' : ''),
    mockMode,
  });
}
