/**
 * Storage Test Controller
 * Debug endpoint for testing S3/MinIO configuration
 * NOTE: No authentication required - for development only
 */

import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ImageStorageService } from './services/image-storage.service';

@ApiTags('Debug')
@Controller('debug')
export class StorageTestController {
  constructor(
    @Inject(ImageStorageService)
    private readonly imageStorage: ImageStorageService,
  ) {}

  /**
   * Test S3/MinIO storage upload
   */
  @Get('test-storage')
  @ApiOperation({ summary: 'Test S3/MinIO storage upload' })
  @ApiResponse({ status: 200, description: 'Storage test results' })
  public async testStorage() {
    const results: {
      step: string;
      status: 'success' | 'error';
      message: string;
      data?: unknown;
    }[] = [];

    // Step 1: Check S3 config
    const configCheck = {
      hasAccessKey: !!process.env['AWS_S3_ACCESS_KEY'],
      hasSecretKey: !!process.env['AWS_S3_SECRET_KEY'],
      bucket: process.env['AWS_S3_BUCKET_NAME'] || 'not set',
      endpoint: process.env['AWS_S3_ENDPOINT'] || 'AWS default',
      forcePathStyle: process.env['AWS_S3_FORCE_PATH_STYLE'] === 'true',
    };

    results.push({
      step: '1. Check S3 Config',
      status:
        configCheck.hasAccessKey && configCheck.hasSecretKey
          ? 'success'
          : 'error',
      message:
        configCheck.hasAccessKey && configCheck.hasSecretKey
          ? 'S3 credentials configured'
          : 'Missing AWS_S3_ACCESS_KEY or AWS_S3_SECRET_KEY',
      data: configCheck,
    });

    // Step 2: Create test image (1x1 red pixel PNG)
    const testImageBase64 =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==';
    results.push({
      step: '2. Create Test Image',
      status: 'success',
      message: 'Created 1x1 test PNG image',
      data: { size: testImageBase64.length },
    });

    // Step 3: Try ImageStorageService upload
    try {
      const uploadResult = await this.imageStorage.uploadImages(
        [testImageBase64],
        {
          userId: 'test-user',
          category: 'base-images',
          jobId: `storage-test-${Date.now()}`,
        },
      );
      results.push({
        step: '3. ImageStorageService Upload',
        status: 'success',
        message: `Uploaded successfully! ${uploadResult.images.length} image(s)`,
        data: {
          images: uploadResult.images,
          totalBytes: uploadResult.totalBytes,
        },
      });
    } catch (error: any) {
      results.push({
        step: '3. ImageStorageService Upload',
        status: 'error',
        message: error.message,
        data: { stack: error.stack?.split('\n').slice(0, 5) },
      });
    }

    // Summary
    const allPassed = results.every((r) => r.status === 'success');

    return {
      success: allPassed,
      summary: allPassed
        ? '✅ S3/MinIO storage is working correctly!'
        : '❌ Storage test failed - check configuration',
      results,
      envHint:
        !configCheck.hasAccessKey || !configCheck.hasSecretKey
          ? `Add to apps/api/.env:
AWS_S3_ACCESS_KEY=ryla_minio
AWS_S3_SECRET_KEY=ryla_minio_secret
AWS_S3_BUCKET_NAME=ryla-images
AWS_S3_ENDPOINT=http://localhost:9000
AWS_S3_FORCE_PATH_STYLE=true`
          : null,
    };
  }
}

