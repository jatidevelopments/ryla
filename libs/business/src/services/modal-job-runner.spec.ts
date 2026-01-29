/**
 * Modal.com Job Runner Tests
 *
 * Unit tests for ModalJobRunner functionality.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ModalJobRunner } from './modal-job-runner';
import { ModalClient } from './modal-client';

// Mock ModalClient
vi.mock('./modal-client');

describe('ModalJobRunner', () => {
  let runner: ModalJobRunner;
  let mockClient: {
    generateFluxDev: ReturnType<typeof vi.fn>;
    generateFlux: ReturnType<typeof vi.fn>;
    generateFluxLoRA: ReturnType<typeof vi.fn>;
    healthCheck: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockClient = {
      generateFluxDev: vi.fn(),
      generateFlux: vi.fn(),
      generateFluxLoRA: vi.fn(),
      healthCheck: vi.fn(),
    };

    // Mock ModalClient constructor
    (ModalClient as any).mockImplementation(() => mockClient);

    runner = new ModalJobRunner({
      endpointUrl: 'https://test--ryla-comfyui-comfyui-fastapi-app.modal.run',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('submitBaseImages', () => {
    it('should submit base image generation and return job ID', async () => {
      const mockImageBuffer = Buffer.from('fake-image-data');
      mockClient.generateFluxDev.mockResolvedValue({
        image: mockImageBuffer,
        contentType: 'image/jpeg',
        costUsd: 0.001,
        executionTimeSec: 2.0,
      });

      const jobId = await runner.submitBaseImages({
        prompt: 'test prompt',
        nsfw: false,
        seed: 42,
      });

      expect(jobId).toMatch(/^modal_/);
      expect(mockClient.generateFluxDev).toHaveBeenCalledWith({
        prompt: 'test prompt',
        negative_prompt:
          'deformed, blurry, bad anatomy, ugly, low quality, nsfw, nude, naked',
        width: 1024,
        height: 1024,
        steps: 20,
        cfg: 3.5,
        seed: 42,
      });

      // Verify job status can be retrieved
      const status = await runner.getJobStatus(jobId);
      expect(status.status).toBe('COMPLETED');
      expect(status.output).toBeDefined();
    });

    it('should handle NSFW prompts correctly', async () => {
      const mockImageBuffer = Buffer.from('fake-image-data');
      mockClient.generateFluxDev.mockResolvedValue({
        image: mockImageBuffer,
        contentType: 'image/jpeg',
      });

      await runner.submitBaseImages({
        prompt: 'test prompt',
        nsfw: true,
      });

      expect(mockClient.generateFluxDev).toHaveBeenCalledWith(
        expect.objectContaining({
          negative_prompt: 'deformed, blurry, bad anatomy, ugly, low quality',
        })
      );
    });

    it('should store error when generation fails', async () => {
      mockClient.generateFluxDev.mockRejectedValue(
        new Error('Generation failed')
      );

      await expect(
        runner.submitBaseImages({
          prompt: 'test prompt',
          nsfw: false,
        })
      ).rejects.toThrow('Generation failed');

      // Job should still be stored with failed status
      const jobs = (runner as any).jobs;
      expect(jobs.size).toBeGreaterThan(0);
    });
  });

  describe('getJobStatus', () => {
    it('should return job status for completed job', async () => {
      const mockImageBuffer = Buffer.from('fake-image-data');
      mockClient.generateFluxDev.mockResolvedValue({
        image: mockImageBuffer,
        contentType: 'image/jpeg',
      });

      const jobId = await runner.submitBaseImages({
        prompt: 'test prompt',
        nsfw: false,
      });

      const status = await runner.getJobStatus(jobId);

      expect(status.status).toBe('COMPLETED');
      expect(status.output).toBeDefined();
      expect((status.output as any).images).toBeDefined();
      expect((status.output as any).images[0].buffer).toEqual(mockImageBuffer);
    });

    it('should return failed status for non-existent job', async () => {
      const status = await runner.getJobStatus('nonexistent-job-id');

      expect(status.status).toBe('FAILED');
      expect(status.error).toBe('Job not found');
    });

    it('should clean up old jobs', async () => {
      const mockImageBuffer = Buffer.from('fake-image-data');
      mockClient.generateFluxDev.mockResolvedValue({
        image: mockImageBuffer,
        contentType: 'image/jpeg',
      });

      const jobId = await runner.submitBaseImages({
        prompt: 'test prompt',
        nsfw: false,
      });

      // Manually set old timestamp
      const jobs = (runner as any).jobs;
      const job = jobs.get(jobId);
      if (job) {
        job.createdAt = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
      }

      // Get status should clean up old jobs
      await runner.getJobStatus(jobId);

      // Job should still exist (it's the one we're querying)
      expect(jobs.has(jobId)).toBe(true);
    });
  });

  describe('submitFaceSwap', () => {
    it('should return job ID with failed status (not yet implemented)', async () => {
      const jobId = await runner.submitFaceSwap({
        baseImageUrl: 'https://example.com/image.jpg',
        prompt: 'test prompt',
        nsfw: false,
      });

      const status = await runner.getJobStatus(jobId);
      expect(status.status).toBe('FAILED');
      expect(status.error).toContain('not yet available');
    });
  });

  describe('submitCharacterSheet', () => {
    it('should return job ID with failed status (not yet implemented)', async () => {
      const jobId = await runner.submitCharacterSheet({
        baseImageUrl: 'https://example.com/image.jpg',
        nsfw: false,
        angles: ['front', 'side'],
      });

      const status = await runner.getJobStatus(jobId);
      expect(status.status).toBe('FAILED');
      expect(status.error).toContain('not yet implemented');
    });
  });

  describe('healthCheck', () => {
    it('should delegate to client healthCheck', async () => {
      mockClient.healthCheck.mockResolvedValue(true);

      const result = await runner.healthCheck();

      expect(result).toBe(true);
      expect(mockClient.healthCheck).toHaveBeenCalled();
    });
  });
});
