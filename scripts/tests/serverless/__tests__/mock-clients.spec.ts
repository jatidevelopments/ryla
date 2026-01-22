/**
 * EP-044: Mock Clients Tests
 *
 * Unit tests for mock RunPod and ComfyUI clients.
 *
 * @module scripts/tests/serverless/__tests__/mock-clients.spec
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  MockRunPodClient,
  MockScenarios,
} from '../__test-utils__/mock-runpod-client';
import {
  MockComfyUIClient,
  MockComfyUIScenarios,
} from '../__test-utils__/mock-comfyui-client';

describe('MockRunPodClient', () => {
  let client: MockRunPodClient;

  beforeEach(() => {
    client = new MockRunPodClient();
  });

  describe('submitJob', () => {
    it('should return job submission response', async () => {
      const workflow = { '1': { inputs: {}, class_type: 'Test' } };
      const result = await client.submitJob(workflow);
      expect(result.id).toBeDefined();
      expect(result.status).toBe('IN_QUEUE');
    });

    it('should record call in history', async () => {
      const workflow = { '1': { inputs: {}, class_type: 'Test' } };
      await client.submitJob(workflow);
      expect(client.callHistory).toHaveLength(1);
      expect(client.callHistory[0].method).toBe('submitJob');
    });

    it('should store submitted workflow', async () => {
      const workflow = { '1': { inputs: {}, class_type: 'Test' } };
      const result = await client.submitJob(workflow);
      const stored = client.getSubmittedWorkflows();
      expect(stored.has(result.id)).toBe(true);
    });
  });

  describe('getJobStatus', () => {
    it('should return job status', async () => {
      const workflow = { '1': { inputs: {}, class_type: 'Test' } };
      const submission = await client.submitJob(workflow);
      
      // Wait for mock status progression
      await new Promise((r) => setTimeout(r, 300));
      
      const status = await client.getJobStatus(submission.id);
      expect(status.id).toBe(submission.id);
      expect(status.status).toBe('COMPLETED');
    });
  });

  describe('healthCheck', () => {
    it('should return healthy by default', async () => {
      const result = await client.healthCheck();
      expect(result.accessible).toBe(true);
      expect(result.status).toBe('HEALTHY');
    });
  });

  describe('pollJobUntilComplete', () => {
    it('should poll until completion', async () => {
      const workflow = { '1': { inputs: {}, class_type: 'Test' } };
      const submission = await client.submitJob(workflow);
      const result = await client.pollJobUntilComplete(
        submission.id,
        5000,
        50
      );
      expect(result.status).toBe('COMPLETED');
    });
  });

  describe('setJobStatus', () => {
    it('should override job status', async () => {
      client.setJobStatus('custom-job', {
        id: 'custom-job',
        status: 'FAILED',
        error: 'Custom error',
      });
      const status = await client.getJobStatus('custom-job');
      expect(status.status).toBe('FAILED');
      expect(status.error).toBe('Custom error');
    });
  });

  describe('reset', () => {
    it('should clear all state', async () => {
      const workflow = { '1': { inputs: {}, class_type: 'Test' } };
      await client.submitJob(workflow);
      client.reset();
      expect(client.callHistory).toHaveLength(0);
      expect(client.getSubmittedWorkflows().size).toBe(0);
    });
  });
});

describe('MockScenarios', () => {
  describe('success', () => {
    it('should return success scenario', () => {
      const scenario = MockScenarios.success();
      expect(scenario.healthCheck?.accessible).toBe(true);
    });
  });

  describe('failure', () => {
    it('should return failure scenario', () => {
      const scenario = MockScenarios.failure('Test error');
      expect(scenario.jobStatus?.['failed-job']?.status).toBe('FAILED');
      expect(scenario.jobStatus?.['failed-job']?.error).toBe('Test error');
    });
  });

  describe('endpointDown', () => {
    it('should return endpoint down scenario', () => {
      const scenario = MockScenarios.endpointDown();
      expect(scenario.healthCheck?.accessible).toBe(false);
    });
  });

  describe('multipleImages', () => {
    it('should return multiple images', () => {
      const scenario = MockScenarios.multipleImages(4);
      const images = scenario.jobStatus?.['multi-image-job']?.output?.images;
      expect(images).toHaveLength(4);
    });
  });
});

describe('MockComfyUIClient', () => {
  let client: MockComfyUIClient;

  beforeEach(() => {
    client = new MockComfyUIClient();
  });

  describe('getSystemStats', () => {
    it('should return system stats', async () => {
      const stats = await client.getSystemStats();
      expect(stats.system).toBeDefined();
      expect(stats.system.os).toBe('posix');
      expect(stats.devices).toBeInstanceOf(Array);
    });
  });

  describe('getNodeInfo', () => {
    it('should return node info for existing node', async () => {
      const info = await client.getNodeInfo('CheckpointLoaderSimple');
      expect(info).not.toBeNull();
      expect(info?.input).toBeDefined();
      expect(info?.output).toBeDefined();
    });

    it('should return null for non-existing node', async () => {
      client.removeNode('NonExistentNode');
      const info = await client.getNodeInfo('NonExistentNode');
      expect(info).toBeNull();
    });
  });

  describe('nodeExists', () => {
    it('should return true for existing node', async () => {
      const exists = await client.nodeExists('CheckpointLoaderSimple');
      expect(exists).toBe(true);
    });

    it('should return false for non-existing node', async () => {
      client.removeNode('NonExistentNode');
      const exists = await client.nodeExists('NonExistentNode');
      expect(exists).toBe(false);
    });
  });

  describe('listModels', () => {
    it('should return model list', async () => {
      const models = await client.listModels();
      expect(models).toBeInstanceOf(Array);
      expect(models.length).toBeGreaterThan(0);
    });
  });

  describe('setNodeInfo', () => {
    it('should override node info', async () => {
      client.setNodeInfo('CustomNode', {
        input: { required: {} },
        output: ['CUSTOM'],
        name: 'CustomNode',
      });
      const info = await client.getNodeInfo('CustomNode');
      expect(info?.output).toContain('CUSTOM');
    });
  });

  describe('getQueriedNodes', () => {
    it('should track queried nodes', async () => {
      await client.nodeExists('Node1');
      await client.getNodeInfo('Node2');
      const queried = client.getQueriedNodes();
      expect(queried).toContain('Node1');
      expect(queried).toContain('Node2');
    });
  });

  describe('reset', () => {
    it('should clear all state', async () => {
      await client.getNodeInfo('Test');
      client.reset();
      expect(client.callHistory).toHaveLength(0);
      expect(client.getQueriedNodes()).toHaveLength(0);
    });
  });
});

describe('MockComfyUIScenarios', () => {
  describe('standard', () => {
    it('should return standard scenario', () => {
      const scenario = MockComfyUIScenarios.standard();
      expect(scenario.systemStats).toBeDefined();
      expect(scenario.modelList?.length).toBeGreaterThan(0);
    });
  });

  describe('denrisi', () => {
    it('should include Denrisi models', () => {
      const scenario = MockComfyUIScenarios.denrisi();
      expect(scenario.modelList).toContain('z_image_turbo_bf16.safetensors');
    });
  });

  describe('missingNodes', () => {
    it('should exclude specified nodes', () => {
      const scenario = MockComfyUIScenarios.missingNodes(['KSampler']);
      expect(scenario.nodeInfo?.['KSampler']).toBeUndefined();
    });
  });

  describe('minimal', () => {
    it('should have minimal nodes', () => {
      const scenario = MockComfyUIScenarios.minimal();
      expect(Object.keys(scenario.nodeInfo || {})).toHaveLength(5);
    });
  });
});
