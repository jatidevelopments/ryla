import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RunPodService } from './runpod.service';
import { ConfigService } from '@nestjs/config';

describe('RunPodService', () => {
  let service: RunPodService;
  let mockConfigService: ConfigService;

  beforeEach(() => {
    mockConfigService = {
      get: vi.fn().mockImplementation((key: string) => {
        if (key === 'RUNPOD_API_KEY') {
          return 'test-api-key';
        }
        if (key === 'RUNPOD_ENDPOINT_FLUX_DEV') {
          return 'endpoint-flux-123';
        }
        if (key === 'RUNPOD_ENDPOINT_Z_IMAGE_TURBO') {
          return 'endpoint-zimage-123';
        }
        return null;
      }),
    } as unknown as ConfigService;

    service = new RunPodService(mockConfigService);
  });

  describe('runJob', () => {
    it('should throw error when client not initialized', async () => {
      const serviceWithoutKey = new RunPodService({
        get: vi.fn().mockReturnValue(null),
      } as any);

      await expect(serviceWithoutKey.runJob('endpoint-123', {})).rejects.toThrow(
        'RunPod client not initialized',
      );
    });

    it('should throw error when endpoint ID is missing', async () => {
      await expect(service.runJob('', {})).rejects.toThrow('RunPod endpoint ID is required');
    });

    it('should have runJob method', () => {
      expect(typeof service.runJob).toBe('function');
    });
  });

  describe('getJobStatus', () => {
    it('should throw error when client not initialized', async () => {
      const serviceWithoutKey = new RunPodService({
        get: vi.fn().mockReturnValue(null),
      } as any);

      await expect(serviceWithoutKey.getJobStatus('job-123')).rejects.toThrow(
        'RunPod client not initialized',
      );
    });

    it('should have getJobStatus method', () => {
      expect(typeof service.getJobStatus).toBe('function');
    });
  });

  describe('listPods', () => {
    it('should throw error when client not initialized', async () => {
      const serviceWithoutKey = new RunPodService({
        get: vi.fn().mockReturnValue(null),
      } as any);

      await expect(serviceWithoutKey.listPods()).rejects.toThrow(
        'RunPod client not initialized',
      );
    });

    it('should have listPods method', () => {
      expect(typeof service.listPods).toBe('function');
    });
  });

  describe('getPod', () => {
    it('should throw error when client not initialized', async () => {
      const serviceWithoutKey = new RunPodService({
        get: vi.fn().mockReturnValue(null),
      } as any);

      await expect(serviceWithoutKey.getPod('pod-1')).rejects.toThrow(
        'RunPod client not initialized',
      );
    });

    it('should have getPod method', () => {
      expect(typeof service.getPod).toBe('function');
    });
  });
});
