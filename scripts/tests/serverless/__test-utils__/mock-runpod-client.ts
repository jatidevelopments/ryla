/**
 * EP-044: Mock RunPod Client
 *
 * Mock implementation of RunPod client for local testing.
 *
 * @module scripts/tests/serverless/__test-utils__/mock-runpod-client
 */

import type {
  IRunPodClient,
  RunPodJobSubmissionResponse,
  RunPodJobStatusResponse,
  RunPodHealthCheckResponse,
  ComfyUIWorkflow,
  MockRunPodResponses,
  EndpointDiagnostics,
} from '../types';

/**
 * Base64 PNG image (512x512 solid color) for mock testing
 * This is a minimal PNG that reports as 512x512 for validation
 */
const MOCK_512x512_PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAIAAAB7GkOtAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwgAADsIBFShKgAAAABl0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMC4xNkRpr/UAAAFhSURBVHja7cExAQAAAMKg9U/tbQahAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYGoBPAABsU9/GQAAAABJRU5ErkJggg==';

/**
 * Default mock responses
 */
const DEFAULT_MOCK_RESPONSES: Required<MockRunPodResponses> = {
  jobSubmission: {
    id: 'mock-job-id-12345',
    status: 'IN_QUEUE',
  },
  jobStatus: {
    'mock-job-id-12345': {
      id: 'mock-job-id-12345',
      status: 'COMPLETED',
      delayTime: 1500,
      executionTime: 5000,
      output: {
        images: [
          {
            filename: 'ComfyUI_00001_.png',
            type: 'base64',
            // 512x512 PNG for realistic mock testing
            data: MOCK_512x512_PNG,
          },
        ],
        message: 'success',
      },
    },
  },
  healthCheck: {
    accessible: true,
    status: 'HEALTHY',
  },
};

/**
 * Mock RunPod Client for local testing
 *
 * Simulates RunPod API responses without making real network calls.
 */
export class MockRunPodClient implements IRunPodClient {
  private readonly mockResponses: Required<MockRunPodResponses>;
  private jobCounter = 0;
  private submittedJobs: Map<string, ComfyUIWorkflow> = new Map();
  private jobStatusOverrides: Map<string, RunPodJobStatusResponse> = new Map();

  /**
   * Call history for verification in tests
   */
  public callHistory: {
    method: string;
    args: unknown[];
    timestamp: number;
  }[] = [];

  constructor(mockResponses?: MockRunPodResponses) {
    this.mockResponses = {
      jobSubmission: mockResponses?.jobSubmission ?? DEFAULT_MOCK_RESPONSES.jobSubmission,
      jobStatus: mockResponses?.jobStatus ?? DEFAULT_MOCK_RESPONSES.jobStatus,
      healthCheck: mockResponses?.healthCheck ?? DEFAULT_MOCK_RESPONSES.healthCheck,
    };
  }

  /**
   * Record a method call for test verification
   */
  private recordCall(method: string, ...args: unknown[]): void {
    this.callHistory.push({
      method,
      args,
      timestamp: Date.now(),
    });
  }

  /**
   * Simulate network delay
   */
  private async simulateDelay(ms = 50): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Generate a unique job ID
   */
  private generateJobId(): string {
    this.jobCounter++;
    return `mock-job-${Date.now()}-${this.jobCounter}`;
  }

  /**
   * Submit a job (mock)
   */
  async submitJob(workflow: ComfyUIWorkflow): Promise<RunPodJobSubmissionResponse> {
    this.recordCall('submitJob', workflow);
    await this.simulateDelay();

    const jobId = this.generateJobId();
    this.submittedJobs.set(jobId, workflow);

    // Set up default status for this job
    this.jobStatusOverrides.set(jobId, {
      id: jobId,
      status: 'IN_QUEUE',
    });

    // Simulate job progressing through states
    setTimeout(() => {
      this.jobStatusOverrides.set(jobId, {
        id: jobId,
        status: 'IN_PROGRESS',
        delayTime: 100,
      });
    }, 100);

    setTimeout(() => {
      const defaultCompleted = Object.values(this.mockResponses.jobStatus)[0];
      this.jobStatusOverrides.set(jobId, {
        ...defaultCompleted,
        id: jobId,
      });
    }, 200);

    return {
      id: jobId,
      status: 'IN_QUEUE',
    };
  }

  /**
   * Get job status (mock)
   */
  async getJobStatus(jobId: string): Promise<RunPodJobStatusResponse> {
    this.recordCall('getJobStatus', jobId);
    await this.simulateDelay();

    // Check for override
    const override = this.jobStatusOverrides.get(jobId);
    if (override) {
      return override;
    }

    // Check mock responses
    if (this.mockResponses.jobStatus[jobId]) {
      return this.mockResponses.jobStatus[jobId];
    }

    // Return default completed response
    const defaultStatus = Object.values(this.mockResponses.jobStatus)[0];
    return {
      ...defaultStatus,
      id: jobId,
    };
  }

  /**
   * Health check (mock)
   */
  async healthCheck(): Promise<RunPodHealthCheckResponse> {
    this.recordCall('healthCheck');
    await this.simulateDelay();

    return this.mockResponses.healthCheck;
  }

  /**
   * Get comprehensive endpoint diagnostics (mock)
   */
  async getDiagnostics(
    testWorkflow?: ComfyUIWorkflow,
    timeout = 120000
  ): Promise<EndpointDiagnostics> {
    this.recordCall('getDiagnostics', testWorkflow, timeout);

    const health = await this.healthCheck();

    return {
      health: {
        accessible: health.accessible,
        endpointExists: health.accessible,
        configurationValid: health.accessible,
        responseTime: 50,
        errors: health.error ? [health.error] : undefined,
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
      overallStatus: health.accessible ? 'operational' : 'unavailable',
      issues: health.error ? [health.error] : [],
      recommendations: [],
    };
  }

  /**
   * Poll job until complete (mock)
   */
  async pollJobUntilComplete(
    jobId: string,
    timeout = 600000,
    pollInterval = 100
  ): Promise<RunPodJobStatusResponse> {
    this.recordCall('pollJobUntilComplete', jobId, timeout, pollInterval);

    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const status = await this.getJobStatus(jobId);

      if (
        status.status === 'COMPLETED' ||
        status.status === 'FAILED' ||
        status.status === 'CANCELLED' ||
        status.status === 'TIMED_OUT'
      ) {
        return status;
      }

      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    return {
      id: jobId,
      status: 'TIMED_OUT',
      error: `Mock timeout after ${timeout}ms`,
    };
  }

  // =========================================================================
  // Test Helpers
  // =========================================================================

  /**
   * Set the status for a specific job
   */
  setJobStatus(jobId: string, status: RunPodJobStatusResponse): void {
    this.jobStatusOverrides.set(jobId, status);
  }

  /**
   * Set the next job to fail
   */
  setNextJobToFail(errorMessage = 'Mock job failure'): void {
    const jobId = `mock-job-${Date.now()}-${this.jobCounter + 1}`;
    this.jobStatusOverrides.set(jobId, {
      id: jobId,
      status: 'FAILED',
      error: errorMessage,
    });
  }

  /**
   * Clear all job overrides
   */
  clearJobOverrides(): void {
    this.jobStatusOverrides.clear();
  }

  /**
   * Clear call history
   */
  clearCallHistory(): void {
    this.callHistory = [];
  }

  /**
   * Get submitted workflows
   */
  getSubmittedWorkflows(): Map<string, ComfyUIWorkflow> {
    return new Map(this.submittedJobs);
  }

  /**
   * Reset the mock client
   */
  reset(): void {
    this.jobCounter = 0;
    this.submittedJobs.clear();
    this.jobStatusOverrides.clear();
    this.callHistory = [];
  }
}

/**
 * Create mock responses for different test scenarios
 */
export const MockScenarios = {
  /**
   * Successful job completion
   */
  success(): MockRunPodResponses {
    return DEFAULT_MOCK_RESPONSES;
  },

  /**
   * Job failure scenario
   */
  failure(errorMessage = 'Generation failed'): MockRunPodResponses {
    return {
      jobSubmission: { id: 'failed-job', status: 'IN_QUEUE' },
      jobStatus: {
        'failed-job': {
          id: 'failed-job',
          status: 'FAILED',
          error: errorMessage,
        },
      },
      healthCheck: { accessible: true, status: 'HEALTHY' },
    };
  },

  /**
   * Endpoint not accessible
   */
  endpointDown(): MockRunPodResponses {
    return {
      healthCheck: {
        accessible: false,
        status: 'ERROR',
        error: 'Endpoint not responding',
      },
    };
  },

  /**
   * Slow job (for timeout testing)
   */
  slowJob(): MockRunPodResponses {
    return {
      jobSubmission: { id: 'slow-job', status: 'IN_QUEUE' },
      jobStatus: {
        'slow-job': {
          id: 'slow-job',
          status: 'IN_PROGRESS',
          delayTime: 5000,
        },
      },
      healthCheck: { accessible: true, status: 'HEALTHY' },
    };
  },

  /**
   * Multiple images output
   */
  multipleImages(count = 4): MockRunPodResponses {
    const images = Array.from({ length: count }, (_, i) => ({
      filename: `ComfyUI_${String(i + 1).padStart(5, '0')}_.png`,
      type: 'base64' as const,
      data: MOCK_512x512_PNG,
    }));

    return {
      jobSubmission: { id: 'multi-image-job', status: 'IN_QUEUE' },
      jobStatus: {
        'multi-image-job': {
          id: 'multi-image-job',
          status: 'COMPLETED',
          delayTime: 1000,
          executionTime: 10000,
          output: { images, message: 'success' },
        },
      },
      healthCheck: { accessible: true, status: 'HEALTHY' },
    };
  },
};
