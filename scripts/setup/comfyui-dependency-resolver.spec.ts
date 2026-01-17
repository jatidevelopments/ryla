import { describe, it, expect, beforeEach, vi } from 'vitest';
import { promises as fs } from 'fs';
import path from 'path';
import { analyzeWorkflows } from './comfyui-dependency-resolver';

// Mock fs module
vi.mock('fs', () => ({
  promises: {
    readdir: vi.fn(),
    readFile: vi.fn(),
  },
}));

describe('comfyui-dependency-resolver', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('analyzeWorkflows', () => {
    it('should extract nodes and models from workflow files', async () => {
      const mockFiles = ['workflow1.ts', 'workflow2.ts'];
      const mockContent1 = `
        export const workflow = {
          id: 'test-workflow-1',
          name: 'Test Workflow 1',
          nodes: {
            '1': {
              class_type: 'CheckpointLoaderSimple',
              inputs: { ckpt_name: 'model1.safetensors' }
            },
            '2': {
              class_type: 'CLIPTextEncode',
              inputs: { text: 'prompt' }
            }
          }
        };
      `;
      const mockContent2 = `
        export const workflow = {
          id: 'test-workflow-2',
          name: 'Test Workflow 2',
          nodes: {
            '1': {
              class_type: 'LoraLoader',
              inputs: { lora_name: 'lora1.safetensors' }
            },
            '2': {
              class_type: 'KSampler',
              inputs: {}
            }
          }
        };
      `;

      vi.mocked(fs.readdir).mockResolvedValue(mockFiles as never);
      vi.mocked(fs.readFile)
        .mockResolvedValueOnce(mockContent1)
        .mockResolvedValueOnce(mockContent2);

      const result = await analyzeWorkflows('/test/workflows');

      expect(result.workflows).toHaveLength(2);
      expect(result.workflows[0].id).toBe('test-workflow-1');
      expect(result.workflows[1].id).toBe('test-workflow-2');
      expect(result.uniqueNodes).toContain('CheckpointLoaderSimple');
      expect(result.uniqueNodes).toContain('CLIPTextEncode');
      expect(result.uniqueNodes).toContain('LoraLoader');
      expect(result.uniqueNodes).toContain('KSampler');
      expect(result.uniqueModels).toContain('model1.safetensors');
      expect(result.uniqueModels).toContain('lora1.safetensors');
    });

    it('should handle missing workflow files gracefully', async () => {
      vi.mocked(fs.readdir).mockResolvedValue([] as never);

      const result = await analyzeWorkflows('/test/workflows');

      expect(result.workflows).toHaveLength(0);
      expect(result.uniqueNodes).toHaveLength(0);
      expect(result.uniqueModels).toHaveLength(0);
    });

    it('should extract workflow id and name from content', async () => {
      const mockFiles = ['workflow.ts'];
      const mockContent = `
        export const workflow = {
          id: 'custom-id',
          name: 'Custom Name',
          nodes: {
            '1': { class_type: 'CheckpointLoaderSimple' }
          }
        };
      `;

      vi.mocked(fs.readdir).mockResolvedValue(mockFiles as never);
      vi.mocked(fs.readFile).mockResolvedValue(mockContent);

      const result = await analyzeWorkflows('/test/workflows');

      expect(result.workflows[0].id).toBe('custom-id');
      expect(result.workflows[0].name).toBe('Custom Name');
    });

    it('should use filename as fallback for id and name', async () => {
      const mockFiles = ['my-workflow.ts'];
      const mockContent = `
        export const workflow = {
          nodes: {
            '1': { class_type: 'CheckpointLoaderSimple' }
          }
        };
      `;

      vi.mocked(fs.readdir).mockResolvedValue(mockFiles as never);
      vi.mocked(fs.readFile).mockResolvedValue(mockContent);

      const result = await analyzeWorkflows('/test/workflows');

      expect(result.workflows[0].id).toBe('my-workflow');
      expect(result.workflows[0].name).toBe('my-workflow');
    });

    it('should identify missing nodes and models from registry', async () => {
      const mockFiles = ['workflow.ts'];
      const mockContent = `
        export const workflow = {
          nodes: {
            '1': {
              class_type: 'UnknownNodeType',
              inputs: { model: 'unknown-model.safetensors' }
            }
          }
        };
      `;

      vi.mocked(fs.readdir).mockResolvedValue(mockFiles as never);
      vi.mocked(fs.readFile).mockResolvedValue(mockContent);

      const result = await analyzeWorkflows('/test/workflows');

      // Should include unknown model in missing models
      expect(result.uniqueModels).toContain('unknown-model.safetensors');
    });

    it('should deduplicate nodes and models across workflows', async () => {
      const mockFiles = ['workflow1.ts', 'workflow2.ts'];
      const mockContent = `
        export const workflow = {
          nodes: {
            '1': { class_type: 'CheckpointLoaderSimple' },
            '2': { class_type: 'CLIPTextEncode' }
          }
        };
      `;

      vi.mocked(fs.readdir).mockResolvedValue(mockFiles as never);
      vi.mocked(fs.readFile)
        .mockResolvedValueOnce(mockContent)
        .mockResolvedValueOnce(mockContent);

      const result = await analyzeWorkflows('/test/workflows');

      // Should have unique nodes only
      expect(result.uniqueNodes).toHaveLength(2);
      expect(result.uniqueNodes).toContain('CheckpointLoaderSimple');
      expect(result.uniqueNodes).toContain('CLIPTextEncode');
    });
  });
});
