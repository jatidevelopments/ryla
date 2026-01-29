/**
 * Modal.com Client Tests
 *
 * Unit tests for ModalClient HTTP client functionality.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ModalClient } from './modal-client';

describe('ModalClient', () => {
  let client: ModalClient;
  let globalFetch: typeof fetch;

  beforeEach(() => {
    client = new ModalClient({
      endpointUrl: 'https://test--ryla-comfyui-comfyui-fastapi-app.modal.run',
    });
    globalFetch = global.fetch;
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = globalFetch;
    vi.restoreAllMocks();
  });

  describe('generateFluxDev', () => {
    it('should call /flux-dev endpoint with correct payload', async () => {
      const mockImageBuffer = Buffer.from('fake-image-data');
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        headers: {
          get: vi.fn((key: string) => {
            if (key === 'content-type') return 'image/jpeg';
            if (key === 'x-cost-usd') return '0.001234';
            if (key === 'x-execution-time-sec') return '2.345';
            if (key === 'x-gpu-type') return 'L40S';
            return null;
          }),
        },
        arrayBuffer: vi.fn().mockResolvedValue(mockImageBuffer.buffer),
      } as any);

      const result = await client.generateFluxDev({
        prompt: 'test prompt',
        negative_prompt: 'bad prompt',
        width: 1024,
        height: 1024,
        steps: 20,
        cfg: 3.5,
        seed: 42,
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://test--ryla-comfyui-comfyui-fastapi-app.modal.run/flux-dev',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: 'test prompt',
            negative_prompt: 'bad prompt',
            width: 1024,
            height: 1024,
            steps: 20,
            cfg: 3.5,
            seed: 42,
          }),
        })
      );

      expect(result.image).toEqual(mockImageBuffer);
      expect(result.contentType).toBe('image/jpeg');
      expect(result.costUsd).toBe(0.001234);
      expect(result.executionTimeSec).toBe(2.345);
      expect(result.gpuType).toBe('L40S');
    });

    it('should throw error when API returns error status', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: vi.fn().mockResolvedValue('Server error'),
      } as any);

      await expect(
        client.generateFluxDev({
          prompt: 'test prompt',
        })
      ).rejects.toThrow('Modal.com API error: 500 Internal Server Error');
    });

    it('should handle timeout', async () => {
      vi.mocked(global.fetch).mockImplementation(
        () =>
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('AbortError')), 100);
          })
      );

      // Use shorter timeout for test
      const testClient = new ModalClient({
        endpointUrl: 'https://test--ryla-comfyui-comfyui-fastapi-app.modal.run',
        timeout: 50,
      });

      await expect(
        testClient.generateFluxDev({
          prompt: 'test prompt',
        })
      ).rejects.toThrow();
    });
  });

  describe('generateFlux', () => {
    it('should call /flux endpoint', async () => {
      const mockImageBuffer = Buffer.from('fake-image-data');
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('image/jpeg'),
        },
        arrayBuffer: vi.fn().mockResolvedValue(mockImageBuffer.buffer),
      } as any);

      const result = await client.generateFlux({
        prompt: 'test prompt',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://test--ryla-comfyui-comfyui-fastapi-app.modal.run/flux',
        expect.any(Object)
      );
      expect(result.image).toEqual(mockImageBuffer);
    });
  });

  describe('generateFluxLoRA', () => {
    it('should call /flux-lora endpoint with LoRA parameters', async () => {
      const mockImageBuffer = Buffer.from('fake-image-data');
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        headers: {
          get: vi.fn().mockReturnValue('image/jpeg'),
        },
        arrayBuffer: vi.fn().mockResolvedValue(mockImageBuffer.buffer),
      } as any);

      const result = await client.generateFluxLoRA({
        prompt: 'test prompt',
        lora_id: 'test-lora',
        lora_strength: 0.8,
        trigger_word: 'test',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        'https://test--ryla-comfyui-comfyui-fastapi-app.modal.run/flux-lora',
        expect.objectContaining({
          body: JSON.stringify({
            prompt: 'test prompt',
            lora_id: 'test-lora',
            lora_strength: 0.8,
            trigger_word: 'test',
          }),
        })
      );
      expect(result.image).toEqual(mockImageBuffer);
    });
  });

  describe('healthCheck', () => {
    it('should return true when endpoint is reachable', async () => {
      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
      } as any);

      const result = await client.healthCheck();

      expect(result).toBe(true);
    });

    it('should return false when endpoint is not reachable', async () => {
      vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

      const result = await client.healthCheck();

      expect(result).toBe(false);
    });
  });
});
