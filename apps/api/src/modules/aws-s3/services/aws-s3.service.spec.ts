import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AwsS3Service } from './aws-s3.service';
import { ConfigService } from '@nestjs/config';
import { ServiceUnavailableException } from '@nestjs/common';

describe('AwsS3Service', () => {
  let service: AwsS3Service;
  let mockConfigService: ConfigService;
  let originalEnv: Record<string, string | undefined>;

  beforeEach(() => {
    originalEnv = {
      AWS_S3_ACCESS_KEY: process.env.AWS_S3_ACCESS_KEY,
      AWS_S3_SECRET_KEY: process.env.AWS_S3_SECRET_KEY,
      AWS_S3_REGION: process.env.AWS_S3_REGION,
      AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME,
    };

    process.env.AWS_S3_ACCESS_KEY = 'test-access-key';
    process.env.AWS_S3_SECRET_KEY = 'test-secret-key';
    process.env.AWS_S3_REGION = 'us-east-1';
    process.env.AWS_S3_BUCKET_NAME = 'test-bucket';

    mockConfigService = {
      get: vi.fn(),
    } as unknown as ConfigService;

    service = new AwsS3Service(mockConfigService);
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

  describe('isConfigured', () => {
    it('should return true when S3 is configured', () => {
      // Service uses lazy initialization - isConfigured() triggers initialization
      // Since we set env vars in beforeEach, it should be configured
      // The service reads from process.env directly, not ConfigService
      const result = service.isConfigured();
      expect(result).toBe(true);
    });

    it('should return false when S3 is not configured', () => {
      // Save original values
      const originalKey = process.env.AWS_S3_ACCESS_KEY;
      const originalSecret = process.env.AWS_S3_SECRET_KEY;
      const originalRegion = process.env.AWS_S3_REGION;
      const originalBucket = process.env.AWS_S3_BUCKET_NAME;
      
      // Remove env vars to simulate unconfigured state
      delete process.env.AWS_S3_ACCESS_KEY;
      delete process.env.AWS_S3_SECRET_KEY;
      delete process.env.AWS_S3_REGION;
      delete process.env.AWS_S3_BUCKET_NAME;
      
      // Create new service instance - it will initialize lazily when isConfigured is called
      const unconfiguredService = new AwsS3Service(mockConfigService);
      
      // Trigger initialization by calling isConfigured
      const result = unconfiguredService.isConfigured();
      expect(result).toBe(false);
      
      // Restore original values
      if (originalKey !== undefined) process.env.AWS_S3_ACCESS_KEY = originalKey;
      if (originalSecret !== undefined) process.env.AWS_S3_SECRET_KEY = originalSecret;
      if (originalRegion !== undefined) process.env.AWS_S3_REGION = originalRegion;
      if (originalBucket !== undefined) process.env.AWS_S3_BUCKET_NAME = originalBucket;
    });
  });

  describe('uploadFile', () => {
    it('should throw ServiceUnavailableException when not configured', async () => {
      delete process.env.AWS_S3_ACCESS_KEY;
      const unconfiguredService = new AwsS3Service(mockConfigService);

      await expect(
        unconfiguredService.uploadFile(
          {
            file_name: 'test.jpg',
            file_data: Buffer.from('test'),
          } as any,
          'image' as any,
          1,
        ),
      ).rejects.toThrow(ServiceUnavailableException);
    });
  });

  describe('uploadFileDirect', () => {
    it('should throw ServiceUnavailableException when not configured', async () => {
      delete process.env.AWS_S3_ACCESS_KEY;
      const unconfiguredService = new AwsS3Service(mockConfigService);

      await expect(
        unconfiguredService.uploadFileDirect('test.jpg', Buffer.from('test'), 'image/jpeg'),
      ).rejects.toThrow(ServiceUnavailableException);
    });
  });

  describe('getFileUrl', () => {
    it('should throw ServiceUnavailableException when not configured', async () => {
      // Save original env vars
      const originalAccessKey = process.env.AWS_S3_ACCESS_KEY;
      const originalSecretKey = process.env.AWS_S3_SECRET_KEY;
      const originalRegion = process.env.AWS_S3_REGION;
      const originalBucket = process.env.AWS_S3_BUCKET_NAME;
      
      try {
        // Delete all S3 env vars to ensure service is not configured
        delete process.env.AWS_S3_ACCESS_KEY;
        delete process.env.AWS_S3_SECRET_KEY;
        delete process.env.AWS_S3_REGION;
        delete process.env.AWS_S3_BUCKET_NAME;
        
        // Create a fresh service instance - it will initialize lazily on first use
        const unconfiguredService = new AwsS3Service(mockConfigService);
        
        // Verify it's not configured
        expect(unconfiguredService.isConfigured()).toBe(false);
        
        // Now try to use it - should throw (the service checks _isConfigured internally)
        await expect(unconfiguredService.getFileUrl('test.jpg')).rejects.toThrow(
          ServiceUnavailableException,
        );
      } finally {
        // Always restore env vars
        if (originalAccessKey !== undefined) process.env.AWS_S3_ACCESS_KEY = originalAccessKey;
        if (originalSecretKey !== undefined) process.env.AWS_S3_SECRET_KEY = originalSecretKey;
        if (originalRegion !== undefined) process.env.AWS_S3_REGION = originalRegion;
        if (originalBucket !== undefined) process.env.AWS_S3_BUCKET_NAME = originalBucket;
      }
    });
  });

  describe('getFileBase64', () => {
    it('should throw ServiceUnavailableException when not configured', async () => {
      // Save original env vars
      const originalAccessKey = process.env.AWS_S3_ACCESS_KEY;
      const originalSecretKey = process.env.AWS_S3_SECRET_KEY;
      const originalRegion = process.env.AWS_S3_REGION;
      const originalBucket = process.env.AWS_S3_BUCKET_NAME;
      
      try {
        // Delete all S3 env vars to ensure service is not configured
        delete process.env.AWS_S3_ACCESS_KEY;
        delete process.env.AWS_S3_SECRET_KEY;
        delete process.env.AWS_S3_REGION;
        delete process.env.AWS_S3_BUCKET_NAME;
        
        // Create a fresh service instance - it will initialize lazily on first use
        const unconfiguredService = new AwsS3Service(mockConfigService);
        
        // Force initialization by calling isConfigured first
        unconfiguredService.isConfigured();
        
        // Now try to use it - should throw
        await expect(unconfiguredService.getFileBase64('test.jpg')).rejects.toThrow(
          ServiceUnavailableException,
        );
      } finally {
        // Always restore env vars
        if (originalAccessKey !== undefined) process.env.AWS_S3_ACCESS_KEY = originalAccessKey;
        if (originalSecretKey !== undefined) process.env.AWS_S3_SECRET_KEY = originalSecretKey;
        if (originalRegion !== undefined) process.env.AWS_S3_REGION = originalRegion;
        if (originalBucket !== undefined) process.env.AWS_S3_BUCKET_NAME = originalBucket;
      }
    });
  });

  describe('deleteFile', () => {
    it('should throw ServiceUnavailableException when not configured', async () => {
      // Save original env vars
      const originalAccessKey = process.env.AWS_S3_ACCESS_KEY;
      const originalSecretKey = process.env.AWS_S3_SECRET_KEY;
      const originalRegion = process.env.AWS_S3_REGION;
      const originalBucket = process.env.AWS_S3_BUCKET_NAME;
      
      try {
        // Delete all S3 env vars to ensure service is not configured
        delete process.env.AWS_S3_ACCESS_KEY;
        delete process.env.AWS_S3_SECRET_KEY;
        delete process.env.AWS_S3_REGION;
        delete process.env.AWS_S3_BUCKET_NAME;
        
        // Create a fresh service instance - it will initialize lazily on first use
        const unconfiguredService = new AwsS3Service(mockConfigService);
        
        // Force initialization by calling isConfigured first
        unconfiguredService.isConfigured();
        
        // Now try to use it - should throw
        await expect(unconfiguredService.deleteFile('test.jpg')).rejects.toThrow(
          ServiceUnavailableException,
        );
      } finally {
        // Always restore env vars
        if (originalAccessKey !== undefined) process.env.AWS_S3_ACCESS_KEY = originalAccessKey;
        if (originalSecretKey !== undefined) process.env.AWS_S3_SECRET_KEY = originalSecretKey;
        if (originalRegion !== undefined) process.env.AWS_S3_REGION = originalRegion;
        if (originalBucket !== undefined) process.env.AWS_S3_BUCKET_NAME = originalBucket;
      }
    });
  });
});
