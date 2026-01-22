/**
 * EP-044: Framework Tests
 *
 * Unit tests for the ServerlessTestFramework.
 *
 * @module scripts/tests/serverless/__tests__/framework.spec
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ServerlessTestFramework, createFrameworkFromEnv } from '../framework';
import type { TestConfig, WorkflowTestDefinition } from '../types';

// Test PNG
const VALID_512x512_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAIAAAB7GkOtAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwgAADsIBFShKgAAAABl0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMC4xNkRpr/UAAAFhSURBVHja7cExAQAAAMKg9U/tbQahAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYGoBPAABsU9/GQAAAABJRU5ErkJggg==';

describe('ServerlessTestFramework', () => {
  describe('constructor', () => {
    it('should create framework with minimal config', () => {
      const framework = new ServerlessTestFramework({
        endpointId: 'test-endpoint',
        apiKey: 'test-key',
        mockMode: true,
      });
      expect(framework.isMockMode).toBe(true);
    });

    it('should use default config values', () => {
      const framework = new ServerlessTestFramework({
        endpointId: 'test-endpoint',
        apiKey: 'test-key',
        mockMode: true,
      });
      expect(framework).toBeDefined();
    });

    it('should create mock clients when mockMode is true', () => {
      const framework = new ServerlessTestFramework({
        endpointId: 'test-endpoint',
        apiKey: 'test-key',
        mockMode: true,
      });
      const clients = framework.getClients();
      expect(clients.runpod).toBeDefined();
      expect(clients.comfyui).toBeDefined();
    });
  });

  describe('validateEndpoint', () => {
    let framework: ServerlessTestFramework;

    beforeEach(() => {
      framework = new ServerlessTestFramework({
        endpointId: 'test-endpoint',
        apiKey: 'test-key',
        mockMode: true,
      });
    });

    it('should return healthy result in mock mode', async () => {
      const result = await framework.validateEndpoint();
      expect(result.accessible).toBe(true);
      expect(result.endpointExists).toBe(true);
      expect(result.configurationValid).toBe(true);
      expect(result.responseTime).toBeDefined();
    });
  });

  describe('verifyDependencies', () => {
    let framework: ServerlessTestFramework;

    beforeEach(() => {
      framework = new ServerlessTestFramework({
        endpointId: 'test-endpoint',
        apiKey: 'test-key',
        mockMode: true,
      });
    });

    it('should verify existing nodes and models', async () => {
      const result = await framework.verifyDependencies(
        ['CheckpointLoaderSimple', 'KSampler'],
        [{ name: 'z_image_turbo_bf16.safetensors' }]
      );
      expect(result.allVerified).toBe(true);
      expect(result.summary.nodesVerified).toBe(2);
      expect(result.summary.modelsVerified).toBe(1);
    });

    it('should report missing dependencies', async () => {
      const result = await framework.verifyDependencies(
        ['NonExistentNode'],
        [{ name: 'nonexistent.safetensors' }]
      );
      expect(result.allVerified).toBe(false);
    });
  });

  describe('runTestCase', () => {
    let framework: ServerlessTestFramework;
    const testWorkflow = {
      '1': {
        inputs: { ckpt_name: 'model.safetensors' },
        class_type: 'CheckpointLoaderSimple',
      },
    };

    beforeEach(() => {
      framework = new ServerlessTestFramework({
        endpointId: 'test-endpoint',
        apiKey: 'test-key',
        mockMode: true,
        mockResponses: {
          runpod: {
            jobSubmission: { id: 'test-job', status: 'IN_QUEUE' },
            jobStatus: {
              'test-job': {
                id: 'test-job',
                status: 'COMPLETED',
                delayTime: 100,
                executionTime: 1000,
                output: {
                  images: [
                    {
                      filename: 'test.png',
                      type: 'base64',
                      data: VALID_512x512_PNG,
                    },
                  ],
                },
              },
            },
          },
        },
      });
    });

    it('should run test case and return result', async () => {
      const result = await framework.runTestCase(testWorkflow, {
        id: 'test-1',
        name: 'Basic Test',
        expected: { status: 'success', imageCount: 1 },
      });
      expect(result.testId).toBe('test-1');
      expect(result.testName).toBe('Basic Test');
      expect(result.duration).toBeGreaterThan(0);
      expect(result.timestamp).toBeDefined();
    });

    it('should pass when expectations are met', async () => {
      const result = await framework.runTestCase(testWorkflow, {
        id: 'test-1',
        name: 'Basic Test',
        expected: { status: 'success', imageCount: 1 },
      });
      expect(result.passed).toBe(true);
      expect(result.status).toBe('passed');
    });

    it('should fail when image count does not match', async () => {
      const result = await framework.runTestCase(testWorkflow, {
        id: 'test-1',
        name: 'Wrong Count Test',
        expected: { status: 'success', imageCount: 5 },
      });
      expect(result.passed).toBe(false);
      expect(result.error).toContain('Expected 5 images');
    });

    it('should include performance metrics', async () => {
      const result = await framework.runTestCase(testWorkflow, {
        id: 'test-1',
        name: 'Basic Test',
        expected: { status: 'success' },
      });
      expect(result.performance).toBeDefined();
      expect(result.performance?.generationTime).toBeDefined();
      expect(result.performance?.imagesGenerated).toBe(1);
    });

    it('should include images in result', async () => {
      const result = await framework.runTestCase(testWorkflow, {
        id: 'test-1',
        name: 'Basic Test',
        expected: { status: 'success' },
      });
      expect(result.images).toBeDefined();
      expect(result.images).toHaveLength(1);
      expect(result.images?.[0].isValid).toBe(true);
    });
  });

  describe('runTest', () => {
    let framework: ServerlessTestFramework;

    beforeEach(() => {
      framework = new ServerlessTestFramework({
        endpointId: 'test-endpoint',
        apiKey: 'test-key',
        mockMode: true,
        mockResponses: {
          runpod: {
            jobSubmission: { id: 'test-job', status: 'IN_QUEUE' },
            jobStatus: {
              'test-job': {
                id: 'test-job',
                status: 'COMPLETED',
                executionTime: 1000,
                output: {
                  images: [{ data: VALID_512x512_PNG }],
                },
              },
            },
          },
        },
      });
    });

    it('should run all test cases', async () => {
      const definition: WorkflowTestDefinition = {
        id: 'test-workflow',
        name: 'Test Workflow',
        workflow: {
          '1': { inputs: {}, class_type: 'Test' },
        },
        testCases: [
          { id: 'test-1', name: 'Test 1', expected: { status: 'success' } },
          { id: 'test-2', name: 'Test 2', expected: { status: 'success' } },
        ],
      };
      const results = await framework.runTest(definition);
      expect(results).toHaveLength(2);
    });
  });

  describe('runValidation', () => {
    let framework: ServerlessTestFramework;

    beforeEach(() => {
      framework = new ServerlessTestFramework({
        endpointId: 'test-endpoint',
        apiKey: 'test-key',
        mockMode: true,
        mockResponses: {
          runpod: {
            jobSubmission: { id: 'test-job', status: 'IN_QUEUE' },
            jobStatus: {
              'test-job': {
                id: 'test-job',
                status: 'COMPLETED',
                executionTime: 5000,
                output: {
                  images: [{ data: VALID_512x512_PNG }],
                },
              },
            },
          },
        },
      });
    });

    it('should return complete validation report', async () => {
      const definition: WorkflowTestDefinition = {
        id: 'test-workflow',
        name: 'Test Workflow',
        workflow: {
          '1': { inputs: {}, class_type: 'CheckpointLoaderSimple' },
        },
        expectedNodes: ['CheckpointLoaderSimple'],
        expectedModels: ['z_image_turbo_bf16.safetensors'],
        testCases: [
          { id: 'test-1', name: 'Test 1', expected: { status: 'success' } },
        ],
      };
      const report = await framework.runValidation(definition);
      expect(report.endpointId).toBe('test-endpoint');
      expect(report.timestamp).toBeDefined();
      expect(report.health).toBeDefined();
      expect(report.dependencies).toBeDefined();
      expect(report.workflows).toHaveLength(1);
      expect(report.performance).toBeDefined();
      expect(report.summary).toBeDefined();
    });

    it('should calculate pass rate correctly', async () => {
      const definition: WorkflowTestDefinition = {
        id: 'test-workflow',
        name: 'Test Workflow',
        workflow: { '1': { inputs: {}, class_type: 'Test' } },
        testCases: [
          { id: 'test-1', name: 'Test 1', expected: { status: 'success' } },
        ],
      };
      const report = await framework.runValidation(definition);
      expect(report.summary.passRate).toBe(100);
    });
  });
});

describe('createFrameworkFromEnv', () => {
  it('should create framework in mock mode without env vars', () => {
    const framework = createFrameworkFromEnv(true);
    expect(framework).toBeDefined();
    expect(framework.isMockMode).toBe(true);
  });

  it('should throw in non-mock mode without env vars', () => {
    const originalEndpointId = process.env.RUNPOD_ENDPOINT_ID;
    const originalApiKey = process.env.RUNPOD_API_KEY;
    delete process.env.RUNPOD_ENDPOINT_ID;
    delete process.env.RUNPOD_API_KEY;

    expect(() => createFrameworkFromEnv(false)).toThrow();

    // Restore
    if (originalEndpointId) process.env.RUNPOD_ENDPOINT_ID = originalEndpointId;
    if (originalApiKey) process.env.RUNPOD_API_KEY = originalApiKey;
  });
});
