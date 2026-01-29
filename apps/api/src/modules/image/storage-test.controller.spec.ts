import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StorageTestController } from './storage-test.controller';
import { ImageStorageService } from './services/image-storage.service';

describe('StorageTestController', () => {
  let controller: StorageTestController;
  let mockImageStorageService: ImageStorageService;
  let originalEnv: Record<string, string | undefined>;

  beforeEach(() => {
    originalEnv = {
      AWS_S3_ACCESS_KEY: process.env.AWS_S3_ACCESS_KEY,
      AWS_S3_SECRET_KEY: process.env.AWS_S3_SECRET_KEY,
      AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
      AWS_S3_ENDPOINT: process.env.AWS_S3_ENDPOINT,
      AWS_S3_FORCE_PATH_STYLE: process.env.AWS_S3_FORCE_PATH_STYLE,
    };

    mockImageStorageService = {
      uploadImages: vi.fn(),
    } as unknown as ImageStorageService;

    controller = new StorageTestController(mockImageStorageService);
  });

  afterEach(() => {
    Object.entries(originalEnv).forEach(([key, value]) => {
      if (value) {
        process.env[key] = value;
      } else {
        delete process.env[key];
      }
    });
  });

  describe('testStorage', () => {
    it('should return success when S3 is configured and upload works', async () => {
      process.env.AWS_S3_ACCESS_KEY = 'test-key';
      process.env.AWS_S3_SECRET_KEY = 'test-secret';
      process.env.AWS_S3_BUCKET_NAME = 'test-bucket';

      vi.mocked(mockImageStorageService.uploadImages).mockResolvedValue({
        images: [{ key: 'test.jpg', url: 'https://example.com/test.jpg' }],
        totalBytes: 100,
      } as any);

      const result = await controller.testStorage();

      expect(result.success).toBe(true);
      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results[0].status).toBe('success');
    });

    it('should return error when S3 is not configured', async () => {
      delete process.env.AWS_S3_ACCESS_KEY;
      delete process.env.AWS_S3_SECRET_KEY;

      const result = await controller.testStorage();

      expect(result.success).toBe(false);
      expect(result.results[0].status).toBe('error');
      expect(result.results[0].message).toContain('Missing');
    });

    it('should handle upload errors gracefully', async () => {
      process.env.AWS_S3_ACCESS_KEY = 'test-key';
      process.env.AWS_S3_SECRET_KEY = 'test-secret';

      vi.mocked(mockImageStorageService.uploadImages).mockRejectedValue(
        new Error('Upload failed'),
      );

      const result = await controller.testStorage();

      expect(result.success).toBe(false);
      expect(result.results.some((r) => r.status === 'error')).toBe(true);
    });

    it('should include env hint when credentials are missing', async () => {
      delete process.env.AWS_S3_ACCESS_KEY;

      const result = await controller.testStorage();

      expect(result.envHint).toBeDefined();
      expect(result.envHint).toContain('AWS_S3_ACCESS_KEY');
    });

    it('should not include env hint when credentials are present', async () => {
      process.env.AWS_S3_ACCESS_KEY = 'test-key';
      process.env.AWS_S3_SECRET_KEY = 'test-secret';

      vi.mocked(mockImageStorageService.uploadImages).mockResolvedValue({
        images: [],
        totalBytes: 0,
      } as any);

      const result = await controller.testStorage();

      expect(result.envHint).toBeNull();
    });
  });
});
