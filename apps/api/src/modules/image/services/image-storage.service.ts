/**
 * Image Storage Service
 *
 * Handles uploading generated images to S3/MinIO storage
 * and generating accessible URLs for the frontend.
 *
 * Folder structure:
 *   users/{userId}/characters/{characterId}/base-images/
 *   users/{userId}/characters/{characterId}/character-sheets/
 *   users/{userId}/characters/{characterId}/gallery/
 */

import { Injectable, Inject, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AwsS3Service } from '../../aws-s3/services/aws-s3.service';

export type ImageCategory =
  | 'base-images'
  | 'character-sheets'
  | 'gallery'
  | 'avatars'
  | 'profile-pictures'
  | 'user-uploads'
  // ComfyUI Studio/inpaint job outputs (legacy naming, kept for backwards compatibility)
  | 'studio-images'
  | 'inpaint'
  // Debug/replay assets for inpaint
  | 'inpaint-masks';

export interface StoredImage {
  /** S3 key/path */
  key: string;
  /** Public URL to access the image */
  url: string;
  /** Thumbnail URL (same as url for now) */
  thumbnailUrl: string;
}

export interface UploadResult {
  images: StoredImage[];
  /** Total bytes uploaded */
  totalBytes: number;
}

export interface UploadOptions {
  /** User ID for folder organization */
  userId: string;
  /** Character ID (optional - for character-specific assets) */
  characterId?: string;
  /** Category of images */
  category: ImageCategory;
  /** Job/batch ID for naming */
  jobId: string;
}

@Injectable()
export class ImageStorageService {
  private readonly logger = new Logger(ImageStorageService.name);

  constructor(
    @Inject(AwsS3Service) private readonly s3Service: AwsS3Service,
  ) {}

  /**
   * Upload base64 images to S3/MinIO storage with proper folder structure
   *
   * @param base64Images Array of base64 data URLs (e.g., "data:image/png;base64,...")
   * @param options Upload options including userId, characterId, category
   * @returns Array of stored image info with URLs
   */
  async uploadImages(
    base64Images: string[],
    options: UploadOptions,
  ): Promise<UploadResult> {
    const results: StoredImage[] = [];
    let totalBytes = 0;

    for (let i = 0; i < base64Images.length; i++) {
      const base64Data = base64Images[i];

      try {
        // Parse base64 data URL
        const { buffer, extension } = this.parseBase64DataUrl(base64Data);
        totalBytes += buffer.length;

        // Build the storage path
        const key = this.buildStoragePath(options, i, extension);

        // Upload directly with the full key
        await this.s3Service.uploadFileDirect(key, buffer, this.getMimeType(extension));

        // Get signed URL for accessing the image
        const url = await this.s3Service.getFileUrl(key);

        results.push({
          key,
          url,
          thumbnailUrl: url, // Use same URL for thumbnail (can add resizing later)
        });

        this.logger.debug(`Uploaded image ${i + 1}/${base64Images.length}: ${key}`);
      } catch (error) {
        this.logger.error(`Failed to upload image ${i}: ${error}`);
        throw error;
      }
    }

    this.logger.log(
      `Uploaded ${results.length} images (${(totalBytes / 1024).toFixed(1)} KB) for ${options.category}`,
    );

    return { images: results, totalBytes };
  }

  /**
   * Legacy method for backwards compatibility
   */
  async uploadGeneratedImages(
    base64Images: string[],
    userId: string,
    jobId: string,
  ): Promise<UploadResult> {
    return this.uploadImages(base64Images, {
      userId,
      category: 'base-images',
      jobId,
    });
  }

  /**
   * Build the storage path for an image
   * Format: users/{userId}/characters/{characterId}/{category}/{filename}
   * Or: users/{userId}/{category}/{filename} if no characterId
   */
  private buildStoragePath(
    options: UploadOptions,
    index: number,
    extension: string,
  ): string {
    const { userId, characterId, category, jobId } = options;
    const shortId = randomUUID().slice(0, 8);
    const filename = `${jobId}_${String(index).padStart(2, '0')}_${shortId}${extension}`;

    if (characterId) {
      return `users/${userId}/characters/${characterId}/${category}/${filename}`;
    }
    return `users/${userId}/${category}/${filename}`;
  }

  private getMimeType(extension: string): string {
    const mimeTypes: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
    };
    return mimeTypes[extension] || 'image/png';
  }

  /**
   * Parse a base64 data URL into buffer and metadata
   */
  private parseBase64DataUrl(dataUrl: string): {
    buffer: Buffer;
    mimeType: string;
    extension: string;
  } {
    // Handle both data URLs and raw base64
    let base64Data: string;
    let mimeType = 'image/png';

    if (dataUrl.startsWith('data:')) {
      // Parse data URL: data:image/png;base64,xxxxx
      const matches = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        throw new Error('Invalid base64 data URL format');
      }
      mimeType = matches[1];
      base64Data = matches[2];
    } else {
      // Raw base64 string
      base64Data = dataUrl;
    }

    // Determine extension from MIME type
    const extensionMap: Record<string, string> = {
      'image/png': '.png',
      'image/jpeg': '.jpg',
      'image/jpg': '.jpg',
      'image/webp': '.webp',
      'image/gif': '.gif',
    };
    const extension = extensionMap[mimeType] || '.png';

    return {
      buffer: Buffer.from(base64Data, 'base64'),
      mimeType,
      extension,
    };
  }

  /**
   * Delete images from storage
   */
  async deleteImages(keys: string[]): Promise<void> {
    for (const key of keys) {
      try {
        await this.s3Service.deleteFile(key);
      } catch (error) {
        this.logger.warn(`Failed to delete image ${key}: ${error}`);
      }
    }
  }

  /**
   * Get a fresh signed URL for an existing image
   */
  async getImageUrl(key: string): Promise<string> {
    return this.s3Service.getFileUrl(key);
  }
}


