/**
 * EP-044: RunPod Serverless API Client
 *
 * Client for interacting with RunPod serverless endpoints.
 *
 * @module scripts/tests/serverless/utils/runpod-client
 */

import type {
  IRunPodClient,
  RunPodJobSubmissionResponse,
  RunPodJobStatusResponse,
  RunPodHealthCheckResponse,
  ComfyUIWorkflow,
  TestConfig,
  EndpointDiagnostics,
} from '../types';
import { DEFAULT_CONFIG } from '../types';

/**
 * RunPod API base URL
 */
const RUNPOD_API_BASE = 'https://api.runpod.ai/v2';

/**
 * RunPod Serverless API Client
 */
export class RunPodClient implements IRunPodClient {
  private readonly endpointId: string;
  private readonly apiKey: string;
  private readonly timeout: number;
  private readonly retries: number;
  private readonly pollInterval: number;

  constructor(config: TestConfig) {
    this.endpointId = config.endpointId;
    this.apiKey = config.apiKey;
    this.timeout = config.timeout ?? DEFAULT_CONFIG.timeout;
    this.retries = config.retries ?? DEFAULT_CONFIG.retries;
    this.pollInterval = config.pollInterval ?? DEFAULT_CONFIG.pollInterval;
  }

  /**
   * Get authorization headers
   */
  private getHeaders(): Record<string, string> {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    };
  }

  /**
   * Make a request with retry logic
   */
  private async fetchWithRetry<T>(
    url: string,
    options: RequestInit,
    retries = this.retries
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, options);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(
            `RunPod API error: ${response.status} ${response.statusText} - ${errorText}`
          );
        }

        return (await response.json()) as T;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on 4xx errors (client errors)
        if (
          lastError.message.includes('4') &&
          lastError.message.includes('RunPod API error')
        ) {
          throw lastError;
        }

        // Wait before retrying (exponential backoff)
        if (attempt < retries) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError ?? new Error('Request failed after retries');
  }

  /**
   * Submit a job to the RunPod endpoint
   */
  async submitJob(
    workflow: ComfyUIWorkflow
  ): Promise<RunPodJobSubmissionResponse> {
    const url = `${RUNPOD_API_BASE}/${this.endpointId}/run`;

    const response = await this.fetchWithRetry<RunPodJobSubmissionResponse>(
      url,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          input: {
            workflow,
          },
        }),
      }
    );

    return response;
  }

  /**
   * Get the status of a job
   */
  async getJobStatus(jobId: string): Promise<RunPodJobStatusResponse> {
    const url = `${RUNPOD_API_BASE}/${this.endpointId}/status/${jobId}`;

    const response = await this.fetchWithRetry<RunPodJobStatusResponse>(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    return response;
  }

  /**
   * Check endpoint health
   */
  async healthCheck(): Promise<RunPodHealthCheckResponse> {
    try {
      // Try to get endpoint info by submitting a minimal request
      // RunPod doesn't have a dedicated health endpoint, so we check if the endpoint exists
      const url = `${RUNPOD_API_BASE}/${this.endpointId}/health`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(),
      });

      // If we get a 404, the endpoint doesn't exist
      if (response.status === 404) {
        return {
          accessible: false,
          status: 'NOT_FOUND',
          error: 'Endpoint not found',
        };
      }

      // If we get a 401/403, authentication failed
      if (response.status === 401 || response.status === 403) {
        return {
          accessible: false,
          status: 'UNAUTHORIZED',
          error: 'Authentication failed',
        };
      }

      // If we get any response, the endpoint is accessible
      return {
        accessible: response.ok,
        status: response.ok ? 'HEALTHY' : 'UNHEALTHY',
        error: response.ok ? undefined : `Status: ${response.status}`,
      };
    } catch (error) {
      return {
        accessible: false,
        status: 'ERROR',
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Get endpoint diagnostics (comprehensive health check)
   * This submits a minimal test job to verify workers can spin up and process jobs
   */
  async getDiagnostics(
    testWorkflow?: ComfyUIWorkflow,
    timeout = 120000 // 2 minutes for diagnostics
  ): Promise<import('../types').EndpointDiagnostics> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // 1. Basic health check
    const health = await this.healthCheck();
    const healthCheckResult: import('../types').HealthCheckResult = {
      accessible: health.accessible,
      endpointExists: health.status !== 'NOT_FOUND',
      configurationValid: health.accessible,
      responseTime: 0, // Will be set by framework
      errors: health.error ? [health.error] : undefined,
    };

    if (!health.accessible) {
      issues.push(`Endpoint not accessible: ${health.error}`);
      return {
        health: healthCheckResult,
        workers: {
          available: false,
          canSpinUp: false,
          issues: ['Cannot check workers - endpoint not accessible'],
        },
        jobProcessing: {
          canAcceptJobs: false,
          processingJobs: false,
          issues: ['Cannot test job processing - endpoint not accessible'],
        },
        overallStatus: 'unavailable',
        issues,
        recommendations: ['Check endpoint ID and API key', 'Verify endpoint exists in RunPod console'],
      };
    }

    // 2. Test job submission and worker availability
    let testJobId: string | undefined;
    let testJobStatus: import('../types').RunPodJobStatus | undefined;
    let queueTime: number | undefined;
    let canSpinUp = false;
    let activeWorkers: number | undefined;

    if (testWorkflow) {
      try {
        // Submit a minimal test job
        const submission = await this.submitJob(testWorkflow);
        testJobId = submission.id;
        testJobStatus = submission.status;

        const startTime = Date.now();
        let lastStatus = submission.status;
        let statusCheckCount = 0;
        const maxChecks = Math.floor(timeout / this.pollInterval);

        // Poll for a short time to see if workers spin up
        while (statusCheckCount < Math.min(maxChecks, 12)) { // Check for up to 1 minute
          await new Promise((resolve) => setTimeout(resolve, this.pollInterval));
          const status = await this.getJobStatus(testJobId);
          lastStatus = status.status;
          statusCheckCount++;

          // If job moved from IN_QUEUE to IN_PROGRESS, workers are spinning up
          if (status.status === 'IN_PROGRESS') {
            canSpinUp = true;
            queueTime = status.delayTime ?? Date.now() - startTime;
            break;
          }

          // If job completed, workers are definitely working
          if (status.status === 'COMPLETED') {
            canSpinUp = true;
            queueTime = status.delayTime ?? Date.now() - startTime;
            testJobStatus = status.status;
            break;
          }

          // If job failed immediately, there's an issue
          if (status.status === 'FAILED') {
            issues.push(`Test job failed: ${status.error ?? 'Unknown error'}`);
            break;
          }

          // If still in queue after 1 minute, workers might not be spinning up
          if (statusCheckCount >= 12 && status.status === 'IN_QUEUE') {
            issues.push('Workers not spinning up - job stuck in queue for 1+ minute');
            recommendations.push('Check RunPod console for worker status', 'Verify GPU availability', 'Consider setting minWorkers=1 to keep warm worker');
            break;
          }
        }

        testJobStatus = lastStatus;
      } catch (error) {
        issues.push(`Failed to submit test job: ${error instanceof Error ? error.message : String(error)}`);
      }
    } else {
      issues.push('No test workflow provided - cannot verify job processing');
    }

    // Determine overall status
    let overallStatus: 'operational' | 'degraded' | 'unavailable';
    if (!health.accessible) {
      overallStatus = 'unavailable';
    } else if (canSpinUp && testJobStatus === 'COMPLETED') {
      overallStatus = 'operational';
    } else if (canSpinUp || testJobStatus === 'IN_PROGRESS') {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'unavailable';
    }

    return {
      health: healthCheckResult,
      workers: {
        available: canSpinUp,
        activeWorkers,
        canSpinUp,
        spinUpTime: queueTime,
        issues: canSpinUp ? [] : ['Workers not spinning up or processing jobs'],
      },
      jobProcessing: {
        canAcceptJobs: testJobId !== undefined,
        processingJobs: canSpinUp,
        testJobId,
        testJobStatus,
        queueTime,
        issues: canSpinUp ? [] : ['Jobs not being processed'],
      },
      overallStatus,
      issues,
      recommendations,
    };
  }

  /**
   * Get comprehensive endpoint diagnostics
   * This submits a minimal test job to verify workers can spin up and process jobs
   */
  async getDiagnostics(
    testWorkflow?: ComfyUIWorkflow,
    timeout = 120000 // 2 minutes for diagnostics
  ): Promise<EndpointDiagnostics> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    // 1. Basic health check
    const health = await this.healthCheck();
    const healthCheckResult: import('../types').HealthCheckResult = {
      accessible: health.accessible,
      endpointExists: health.status !== 'NOT_FOUND',
      configurationValid: health.accessible,
      responseTime: 0, // Will be set by framework
      errors: health.error ? [health.error] : undefined,
    };

    if (!health.accessible) {
      issues.push(`Endpoint not accessible: ${health.error}`);
      return {
        health: healthCheckResult,
        workers: {
          available: false,
          canSpinUp: false,
          issues: ['Cannot check workers - endpoint not accessible'],
        },
        jobProcessing: {
          canAcceptJobs: false,
          processingJobs: false,
          issues: ['Cannot test job processing - endpoint not accessible'],
        },
        overallStatus: 'unavailable',
        issues,
        recommendations: ['Check endpoint ID and API key', 'Verify endpoint exists in RunPod console'],
      };
    }

    // 2. Test job submission and worker availability
    let testJobId: string | undefined;
    let testJobStatus: import('../types').RunPodJobStatus | undefined;
    let queueTime: number | undefined;
    let canSpinUp = false;
    let activeWorkers: number | undefined;

    if (testWorkflow) {
      try {
        // Submit a minimal test job
        const submission = await this.submitJob(testWorkflow);
        testJobId = submission.id;
        testJobStatus = submission.status;

        const startTime = Date.now();
        let lastStatus = submission.status;
        let statusCheckCount = 0;
        const maxChecks = Math.floor(timeout / this.pollInterval);

        // Poll for a short time to see if workers spin up
        while (statusCheckCount < Math.min(maxChecks, 12)) { // Check for up to 1 minute
          await new Promise((resolve) => setTimeout(resolve, this.pollInterval));
          const status = await this.getJobStatus(testJobId);
          lastStatus = status.status;
          statusCheckCount++;

          // If job moved from IN_QUEUE to IN_PROGRESS, workers are spinning up
          if (status.status === 'IN_PROGRESS') {
            canSpinUp = true;
            queueTime = status.delayTime ?? Date.now() - startTime;
            break;
          }

          // If job completed, workers are definitely working
          if (status.status === 'COMPLETED') {
            canSpinUp = true;
            queueTime = status.delayTime ?? Date.now() - startTime;
            testJobStatus = status.status;
            break;
          }

          // If job failed immediately, there's an issue
          if (status.status === 'FAILED') {
            issues.push(`Test job failed: ${status.error ?? 'Unknown error'}`);
            break;
          }

          // If still in queue after 1 minute, workers might not be spinning up
          if (statusCheckCount >= 12 && status.status === 'IN_QUEUE') {
            issues.push('Workers not spinning up - job stuck in queue for 1+ minute');
            recommendations.push('Check RunPod console for worker status', 'Verify GPU availability', 'Consider setting minWorkers=1 to keep warm worker');
            break;
          }
        }

        testJobStatus = lastStatus;
      } catch (error) {
        issues.push(`Failed to submit test job: ${error instanceof Error ? error.message : String(error)}`);
      }
    } else {
      issues.push('No test workflow provided - cannot verify job processing');
    }

    // Determine overall status
    let overallStatus: 'operational' | 'degraded' | 'unavailable';
    if (!health.accessible) {
      overallStatus = 'unavailable';
    } else if (canSpinUp && testJobStatus === 'COMPLETED') {
      overallStatus = 'operational';
    } else if (canSpinUp || testJobStatus === 'IN_PROGRESS') {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'unavailable';
    }

    return {
      health: healthCheckResult,
      workers: {
        available: canSpinUp,
        activeWorkers,
        canSpinUp,
        spinUpTime: queueTime,
        issues: canSpinUp ? [] : ['Workers not spinning up or processing jobs'],
      },
      jobProcessing: {
        canAcceptJobs: testJobId !== undefined,
        processingJobs: canSpinUp,
        testJobId,
        testJobStatus,
        queueTime,
        issues: canSpinUp ? [] : ['Jobs not being processed'],
      },
      overallStatus,
      issues,
      recommendations,
    };
  }

  /**
   * Poll a job until it completes or times out
   */
  async pollJobUntilComplete(
    jobId: string,
    timeout = this.timeout,
    pollInterval = this.pollInterval
  ): Promise<RunPodJobStatusResponse> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const status = await this.getJobStatus(jobId);

      // Check for terminal states
      if (
        status.status === 'COMPLETED' ||
        status.status === 'FAILED' ||
        status.status === 'CANCELLED' ||
        status.status === 'TIMED_OUT'
      ) {
        return status;
      }

      // Wait before next poll
      await new Promise((resolve) => setTimeout(resolve, pollInterval));
    }

    // Timeout reached
    return {
      id: jobId,
      status: 'TIMED_OUT',
      error: `Job timed out after ${timeout}ms`,
    };
  }

  /**
   * Submit a job and wait for completion
   */
  async submitAndWait(
    workflow: ComfyUIWorkflow,
    timeout = this.timeout
  ): Promise<RunPodJobStatusResponse> {
    const submission = await this.submitJob(workflow);
    return this.pollJobUntilComplete(submission.id, timeout);
  }

  /**
   * Cancel a running job
   */
  async cancelJob(jobId: string): Promise<void> {
    const url = `${RUNPOD_API_BASE}/${this.endpointId}/cancel/${jobId}`;

    await this.fetchWithRetry<{ status: string }>(url, {
      method: 'POST',
      headers: this.getHeaders(),
    });
  }
}

/**
 * Create a RunPod client from environment variables
 */
export function createRunPodClientFromEnv(): RunPodClient {
  const endpointId = process.env.RUNPOD_ENDPOINT_ID;
  const apiKey = process.env.RUNPOD_API_KEY;

  if (!endpointId) {
    throw new Error('RUNPOD_ENDPOINT_ID environment variable is required');
  }

  if (!apiKey) {
    throw new Error('RUNPOD_API_KEY environment variable is required');
  }

  return new RunPodClient({
    endpointId,
    apiKey,
  });
}
