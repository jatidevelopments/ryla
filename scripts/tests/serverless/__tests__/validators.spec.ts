/**
 * EP-044: Validators Tests
 *
 * Unit tests for node, model, and image validators.
 *
 * @module scripts/tests/serverless/__tests__/validators.spec
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { NodeValidator, summarizeNodeVerification } from '../validators/node-validator';
import { ModelValidator, summarizeModelVerification, inferModelType } from '../validators/model-validator';
import { ImageValidator, summarizeImageValidation } from '../validators/image-validator';
import { MockComfyUIClient } from '../__test-utils__/mock-comfyui-client';

// Test PNG
const VALID_512x512_PNG =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAAAAIACAIAAAB7GkOtAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAOwgAADsIBFShKgAAAABl0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMC4xNkRpr/UAAAFhSURBVHja7cExAQAAAMKg9U/tbQahAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYGoBPAABsU9/GQAAAABJRU5ErkJggg==';

describe('NodeValidator', () => {
  let mockClient: MockComfyUIClient;
  let validator: NodeValidator;

  beforeEach(() => {
    mockClient = new MockComfyUIClient();
    validator = new NodeValidator(mockClient);
  });

  describe('verifyNode', () => {
    it('should verify existing node', async () => {
      const result = await validator.verifyNode('CheckpointLoaderSimple');
      expect(result.installed).toBe(true);
      expect(result.name).toBe('CheckpointLoaderSimple');
    });

    it('should report missing node', async () => {
      mockClient.removeNode('NonExistentNode');
      const result = await validator.verifyNode('NonExistentNode');
      expect(result.installed).toBe(false);
      expect(result.error).toBeDefined();
    });
  });

  describe('verifyNodes', () => {
    it('should verify multiple nodes', async () => {
      const results = await validator.verifyNodes([
        'CheckpointLoaderSimple',
        'KSampler',
        'VAEDecode',
      ]);
      expect(results).toHaveLength(3);
      expect(results.every((r) => r.installed)).toBe(true);
    });

    it('should handle mixed results', async () => {
      mockClient.removeNode('MissingNode');
      const results = await validator.verifyNodes([
        'CheckpointLoaderSimple',
        'MissingNode',
      ]);
      expect(results).toHaveLength(2);
      expect(results[0].installed).toBe(true);
      expect(results[1].installed).toBe(false);
    });
  });

  describe('extractNodesFromWorkflow', () => {
    it('should extract node types from workflow', () => {
      const workflow = {
        '1': { inputs: {}, class_type: 'CheckpointLoaderSimple' },
        '2': { inputs: {}, class_type: 'KSampler' },
        '3': { inputs: {}, class_type: 'VAEDecode' },
      };
      const nodes = validator.extractNodesFromWorkflow(workflow);
      expect(nodes).toContain('CheckpointLoaderSimple');
      expect(nodes).toContain('KSampler');
      expect(nodes).toContain('VAEDecode');
    });

    it('should handle empty workflow', () => {
      const nodes = validator.extractNodesFromWorkflow({});
      expect(nodes).toHaveLength(0);
    });

    it('should deduplicate node types', () => {
      const workflow = {
        '1': { inputs: {}, class_type: 'CLIPTextEncode' },
        '2': { inputs: {}, class_type: 'CLIPTextEncode' },
      };
      const nodes = validator.extractNodesFromWorkflow(workflow);
      expect(nodes).toHaveLength(1);
    });
  });

  describe('allNodesInstalled', () => {
    it('should return true when all nodes exist', async () => {
      const result = await validator.allNodesInstalled([
        'CheckpointLoaderSimple',
        'KSampler',
      ]);
      expect(result).toBe(true);
    });

    it('should return false when any node missing', async () => {
      mockClient.removeNode('MissingNode');
      const result = await validator.allNodesInstalled([
        'CheckpointLoaderSimple',
        'MissingNode',
      ]);
      expect(result).toBe(false);
    });
  });
});

describe('summarizeNodeVerification', () => {
  it('should summarize results correctly', () => {
    const results = [
      { name: 'Node1', installed: true },
      { name: 'Node2', installed: true },
      { name: 'Node3', installed: false, error: 'Not found' },
    ];
    const summary = summarizeNodeVerification(results);
    expect(summary.total).toBe(3);
    expect(summary.installed).toBe(2);
    expect(summary.missing).toBe(1);
    expect(summary.allInstalled).toBe(false);
    expect(summary.missingNodes).toContain('Node3');
  });

  it('should handle all installed', () => {
    const results = [
      { name: 'Node1', installed: true },
      { name: 'Node2', installed: true },
    ];
    const summary = summarizeNodeVerification(results);
    expect(summary.allInstalled).toBe(true);
    expect(summary.missingNodes).toHaveLength(0);
  });
});

describe('ModelValidator', () => {
  let mockClient: MockComfyUIClient;
  let validator: ModelValidator;

  beforeEach(() => {
    mockClient = new MockComfyUIClient();
    validator = new ModelValidator(mockClient);
  });

  describe('verifyModel', () => {
    it('should verify existing model', async () => {
      const result = await validator.verifyModel('z_image_turbo_bf16.safetensors');
      expect(result.exists).toBe(true);
    });

    it('should report missing model', async () => {
      const result = await validator.verifyModel('nonexistent.safetensors');
      expect(result.exists).toBe(false);
    });
  });

  describe('verifyModels', () => {
    it('should verify multiple models', async () => {
      const results = await validator.verifyModels([
        { name: 'z_image_turbo_bf16.safetensors' },
        { name: 'qwen_3_4b.safetensors' },
      ]);
      expect(results).toHaveLength(2);
      expect(results.every((r) => r.exists)).toBe(true);
    });
  });

  describe('listCheckpointModels', () => {
    it('should list available models', async () => {
      const models = await validator.listCheckpointModels();
      expect(models.length).toBeGreaterThan(0);
    });
  });
});

describe('summarizeModelVerification', () => {
  it('should summarize results correctly', () => {
    const results = [
      { name: 'model1.safetensors', exists: true },
      { name: 'model2.safetensors', exists: false, error: 'Not found' },
    ];
    const summary = summarizeModelVerification(results);
    expect(summary.total).toBe(2);
    expect(summary.available).toBe(1);
    expect(summary.missing).toBe(1);
    expect(summary.allAvailable).toBe(false);
    expect(summary.missingModels).toContain('model2.safetensors');
  });
});

describe('inferModelType', () => {
  it('should infer vae from name', () => {
    expect(inferModelType('my-vae-model.safetensors')).toBe('vae');
    expect(inferModelType('z-image-turbo-vae.safetensors')).toBe('vae');
  });

  it('should infer lora from name', () => {
    expect(inferModelType('character_lora.safetensors')).toBe('lora');
  });

  it('should infer controlnet from name', () => {
    expect(inferModelType('controlnet_canny.safetensors')).toBe('controlnet');
  });

  it('should default to checkpoint', () => {
    expect(inferModelType('sd_xl_base.safetensors')).toBe('checkpoint');
    expect(inferModelType('flux1-dev.safetensors')).toBe('checkpoint');
  });
});

describe('ImageValidator', () => {
  let validator: ImageValidator;

  beforeEach(() => {
    validator = new ImageValidator();
  });

  describe('validateImage', () => {
    it('should validate valid image', () => {
      const image = {
        filename: 'test.png',
        type: 'base64' as const,
        data: VALID_512x512_PNG,
      };
      const result = validator.validateImage(image);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should fail on invalid data', () => {
      const image = {
        filename: 'test.png',
        type: 'base64' as const,
        data: '',
      };
      const result = validator.validateImage(image);
      expect(result.valid).toBe(false);
    });

    it('should validate against custom options', () => {
      const image = {
        filename: 'test.png',
        type: 'base64' as const,
        data: VALID_512x512_PNG,
      };
      const result = validator.validateImage(image, {
        exactDimensions: { width: 512, height: 512 },
      });
      expect(result.valid).toBe(true);
    });

    it('should fail when dimensions do not match', () => {
      const image = {
        filename: 'test.png',
        type: 'base64' as const,
        data: VALID_512x512_PNG,
      };
      const result = validator.validateImage(image, {
        exactDimensions: { width: 1024, height: 1024 },
      });
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Expected 1024x1024');
    });
  });

  describe('validateAgainstExpectation', () => {
    it('should validate image count', () => {
      const images = [{ data: VALID_512x512_PNG }];
      const result = validator.validateAgainstExpectation(images, {
        status: 'success',
        imageCount: 1,
      });
      expect(result.valid).toBe(true);
    });

    it('should fail when image count does not match', () => {
      const images = [{ data: VALID_512x512_PNG }];
      const result = validator.validateAgainstExpectation(images, {
        status: 'success',
        imageCount: 2,
      });
      expect(result.valid).toBe(false);
      expect(result.errors[0]).toContain('Expected 2 images');
    });
  });
});

describe('summarizeImageValidation', () => {
  it('should summarize results correctly', () => {
    const results = [
      { valid: true, errors: [], warnings: [], details: { isValid: true } },
      {
        valid: false,
        errors: ['Error 1'],
        warnings: ['Warning 1'],
        details: { isValid: false },
      },
    ];
    const summary = summarizeImageValidation(results as any);
    expect(summary.total).toBe(2);
    expect(summary.valid).toBe(1);
    expect(summary.invalid).toBe(1);
    expect(summary.allValid).toBe(false);
    expect(summary.errors).toContain('Error 1');
    expect(summary.warnings).toContain('Warning 1');
  });
});
