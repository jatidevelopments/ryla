/**
 * EP-044: Types Tests
 *
 * Unit tests for type definitions and default configurations.
 *
 * @module scripts/tests/serverless/__tests__/types.spec
 */

import { describe, it, expect } from 'vitest';
import { DEFAULT_CONFIG } from '../types';
import type {
  TestConfig,
  MockResponses,
  RunPodJobStatus,
  WorkflowTestDefinition,
  TestResult,
  ValidationReport,
} from '../types';

describe('types', () => {
  describe('DEFAULT_CONFIG', () => {
    it('should have correct default timeout', () => {
      expect(DEFAULT_CONFIG.timeout).toBe(600000); // 10 minutes
    });

    it('should have correct default retries', () => {
      expect(DEFAULT_CONFIG.retries).toBe(3);
    });

    it('should have correct default poll interval', () => {
      expect(DEFAULT_CONFIG.pollInterval).toBe(5000); // 5 seconds
    });

    it('should have mock mode disabled by default', () => {
      expect(DEFAULT_CONFIG.mockMode).toBe(false);
    });
  });

  describe('TestConfig type', () => {
    it('should accept minimal required fields', () => {
      const config: TestConfig = {
        endpointId: 'test-endpoint',
        apiKey: 'test-api-key',
      };
      expect(config.endpointId).toBe('test-endpoint');
      expect(config.apiKey).toBe('test-api-key');
    });

    it('should accept all optional fields', () => {
      const config: TestConfig = {
        endpointId: 'test-endpoint',
        apiKey: 'test-api-key',
        endpointUrl: 'https://example.com',
        timeout: 300000,
        retries: 5,
        pollInterval: 10000,
        mockMode: true,
        mockResponses: {},
      };
      expect(config.mockMode).toBe(true);
      expect(config.timeout).toBe(300000);
    });
  });

  describe('MockResponses type', () => {
    it('should accept empty object', () => {
      const responses: MockResponses = {};
      expect(responses).toEqual({});
    });

    it('should accept runpod mock responses', () => {
      const responses: MockResponses = {
        runpod: {
          jobSubmission: { id: 'job-1', status: 'IN_QUEUE' },
          healthCheck: { accessible: true },
        },
      };
      expect(responses.runpod?.jobSubmission?.id).toBe('job-1');
    });

    it('should accept comfyui mock responses', () => {
      const responses: MockResponses = {
        comfyui: {
          modelList: ['model1.safetensors', 'model2.safetensors'],
        },
      };
      expect(responses.comfyui?.modelList).toHaveLength(2);
    });
  });

  describe('RunPodJobStatus type', () => {
    it('should accept valid status values', () => {
      const statuses: RunPodJobStatus[] = [
        'IN_QUEUE',
        'IN_PROGRESS',
        'COMPLETED',
        'FAILED',
        'CANCELLED',
        'TIMED_OUT',
      ];
      expect(statuses).toHaveLength(6);
    });
  });

  describe('WorkflowTestDefinition type', () => {
    it('should accept complete workflow definition', () => {
      const definition: WorkflowTestDefinition = {
        id: 'test-workflow',
        name: 'Test Workflow',
        workflow: {
          '1': {
            inputs: { ckpt_name: 'model.safetensors' },
            class_type: 'CheckpointLoaderSimple',
          },
        },
        expectedNodes: ['CheckpointLoaderSimple'],
        expectedModels: ['model.safetensors'],
        testCases: [
          {
            id: 'test-1',
            name: 'Basic Test',
            expected: { status: 'success' },
          },
        ],
      };
      expect(definition.testCases).toHaveLength(1);
    });
  });

  describe('TestResult type', () => {
    it('should accept complete test result', () => {
      const result: TestResult = {
        testId: 'test-1',
        testName: 'Test Name',
        passed: true,
        status: 'passed',
        duration: 5000,
        timestamp: new Date().toISOString(),
      };
      expect(result.passed).toBe(true);
    });

    it('should accept failed test result with error', () => {
      const result: TestResult = {
        testId: 'test-1',
        testName: 'Test Name',
        passed: false,
        status: 'failed',
        error: 'Something went wrong',
        duration: 5000,
        timestamp: new Date().toISOString(),
      };
      expect(result.passed).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('ValidationReport type', () => {
    it('should accept complete validation report', () => {
      const report: ValidationReport = {
        endpointId: 'test-endpoint',
        timestamp: new Date().toISOString(),
        health: {
          accessible: true,
          endpointExists: true,
          configurationValid: true,
        },
        dependencies: {
          nodes: [],
          models: [],
          allVerified: true,
          summary: {
            nodesVerified: 0,
            nodesTotal: 0,
            modelsVerified: 0,
            modelsTotal: 0,
          },
        },
        workflows: [],
        performance: {
          iterations: 0,
          avgColdStartTime: 0,
          avgGenerationTime: 0,
          avgTotalTime: 0,
          minGenerationTime: 0,
          maxGenerationTime: 0,
          avgCostPerImage: 0,
          totalCost: 0,
          targetsMet: {
            coldStart: true,
            generationTime: true,
            costPerImage: true,
          },
        },
        overallStatus: 'passed',
        summary: {
          totalTests: 0,
          passedTests: 0,
          failedTests: 0,
          errorTests: 0,
          skippedTests: 0,
          passRate: 100,
        },
      };
      expect(report.overallStatus).toBe('passed');
    });
  });
});
