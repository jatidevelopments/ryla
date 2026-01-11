import * as path from 'node:path';

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, Logger, Optional, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AwsConfig, Config } from '../../../config/config.type';
import { ImageFileInterface } from '../interfaces/image-file.interface';
import { ContentType } from '../enums/content-type.enum';
import { S3PathBuilder } from '../utils/path-builder.util';

@Injectable()
export class AwsS3Service {
  private readonly logger = new Logger(AwsS3Service.name);
  private awsConfig!: AwsConfig;
  private s3Client!: S3Client;
  private isConfigured = false;
  private initialized = false;

  constructor(@Optional() private readonly configService: ConfigService<Config> | null) {
    // Defer initialization to first use to avoid race condition with ConfigModule
  }

  /**
   * Lazy initialization to avoid race condition with ConfigModule
   * Called on first use of the service
   */
  private ensureInitialized(): void {
    if (this.initialized) return;
    this.initialized = true;

    // Read directly from process.env to avoid ConfigService timing issues
    const accessKeyId = process.env['AWS_S3_ACCESS_KEY'] || '';
    const secretAccessKey = process.env['AWS_S3_SECRET_KEY'] || '';
    const region = process.env['AWS_S3_REGION'] || 'us-east-1';
    const bucketName = process.env['AWS_S3_BUCKET_NAME'] || 'ryla-images';
    const urlTtl = Number(process.env['AWS_S3_URL_TTL']) || 3600;
    const endpoint = process.env['AWS_S3_ENDPOINT'] || undefined;
    const forcePathStyle = process.env['AWS_S3_FORCE_PATH_STYLE'] === 'true';

    this.logger.log(
      `Initializing S3: accessKeyId=${accessKeyId ? 'SET' : 'EMPTY'}, endpoint=${endpoint || 'AWS default'}`,
    );

    if (!accessKeyId || !secretAccessKey) {
      this.logger.warn('S3 not configured - missing AWS_S3_ACCESS_KEY or AWS_S3_SECRET_KEY');
      this.awsConfig = {
        region: '',
        accessKeyId: '',
        secretAccessKey: '',
        bucketName: '',
        urlTtl: 3600,
      };
      this.s3Client = new S3Client({
        region: 'us-east-1',
        credentials: { accessKeyId: 'dummy', secretAccessKey: 'dummy' },
      });
      this.isConfigured = false;
      return;
    }

    this.awsConfig = {
      region,
      accessKeyId,
      secretAccessKey,
      bucketName,
      urlTtl,
      endpoint,
      forcePathStyle,
    };
    this.isConfigured = true;

    // Build S3 client options
    const s3Options: {
      region: string;
      credentials: { accessKeyId: string; secretAccessKey: string };
      endpoint?: string;
      forcePathStyle?: boolean;
    } = {
      region: this.awsConfig.region,
      credentials: {
        accessKeyId: this.awsConfig.accessKeyId,
        secretAccessKey: this.awsConfig.secretAccessKey,
      },
    };

    // Add custom endpoint for MinIO/S3-compatible storage
    if (this.awsConfig.endpoint) {
      s3Options.endpoint = this.awsConfig.endpoint;
      s3Options.forcePathStyle = this.awsConfig.forcePathStyle ?? true;
    }

    this.s3Client = new S3Client(s3Options);

    this.logger.log(
      `S3 configured: bucket=${this.awsConfig.bucketName}, endpoint=${this.awsConfig.endpoint || 'AWS default'}`,
    );
  }

  public async uploadFile(
    file: ImageFileInterface,
    itemType: ContentType,
    itemId: number,
  ): Promise<string> {
    this.ensureInitialized();

    if (!this.isConfigured) {
      this.logger.error('S3 not configured! Missing AWS_S3_ACCESS_KEY or AWS_S3_SECRET_KEY');
      throw new ServiceUnavailableException(
        'S3 storage not configured. Check AWS_S3_ACCESS_KEY and AWS_S3_SECRET_KEY environment variables.',
      );
    }

    try {
      const filePath = this.buildPath(itemType, itemId, file.file_name);

      // Determine content type based on file extension
      const contentType = this.getContentTypeFromFileName(file.file_name);

      this.logger.debug(
        `Uploading to S3: bucket=${this.awsConfig.bucketName}, key=${filePath}, size=${file.file_data.length}`,
      );

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.awsConfig.bucketName,
          Key: filePath,
          Body: file.file_data,
          ContentType: contentType,
        }),
      );

      this.logger.debug(`Upload successful: ${filePath}`);
      return filePath;
    } catch (error: any) {
      this.logger.error(`S3 upload failed: ${error.message}`, error.stack);
      this.logger.error(
        `S3 config: bucket=${this.awsConfig.bucketName}, endpoint=${this.awsConfig.endpoint}, region=${this.awsConfig.region}`,
      );
      throw new ServiceUnavailableException(`Failed to save file: ${error.message}`);
    }
  }

  /**
   * Upload a file directly with a full key path
   * Use this for organized folder structures
   */
  public async uploadFileDirect(
    key: string,
    data: Buffer,
    contentType: string,
  ): Promise<string> {
    this.ensureInitialized();

    if (!this.isConfigured) {
      this.logger.error('S3 not configured! Missing AWS_S3_ACCESS_KEY or AWS_S3_SECRET_KEY');
      throw new ServiceUnavailableException(
        'S3 storage not configured. Check AWS_S3_ACCESS_KEY and AWS_S3_SECRET_KEY environment variables.',
      );
    }

    try {
      this.logger.debug(
        `Uploading to S3: bucket=${this.awsConfig.bucketName}, key=${key}, size=${data.length}`,
      );

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.awsConfig.bucketName,
          Key: key,
          Body: data,
          ContentType: contentType,
        }),
      );

      this.logger.debug(`Upload successful: ${key}`);
      return key;
    } catch (error: any) {
      this.logger.error(`S3 upload failed: ${error.message}`, error.stack);
      throw new ServiceUnavailableException(`Failed to save file: ${error.message}`);
    }
  }

  public async getFileUrl(filePath: string): Promise<string> {
    this.ensureInitialized();

    try {
      const command = new GetObjectCommand({
        Bucket: this.awsConfig.bucketName,
        Key: filePath,
      });
      return await getSignedUrl(this.s3Client, command, {
        expiresIn: this.awsConfig.urlTtl,
      });
    } catch (_error: any) {
      throw new ServiceUnavailableException(
        'Failed to get file URL, try again',
      );
    }
  }

  public async getFileBase64(filePath: string): Promise<string> {
    this.ensureInitialized();

    try {
      // Create command to get object from S3 bucket
      const command = new GetObjectCommand({
        Bucket: this.awsConfig.bucketName,
        Key: filePath,
      });

      // Send request to S3 and get response
      const response = await this.s3Client.send(command);

      // Check if response body exists
      if (!response.Body) {
        throw new Error('Empty file body received');
      }

      // Initialize array to store chunks of file data
      const chunks: Uint8Array[] = [];
      // Cast response body to a readable stream
      const stream = response.Body as any;

      // Read all chunks from the stream
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      // Combine all chunks into a single buffer
      const buffer = Buffer.concat(chunks);

      // Convert buffer to base64 string and return
      return buffer.toString('base64');
    } catch (error: any) {
      // If any error occurs during the process, throw service unavailable exception
      throw new ServiceUnavailableException(
        `Failed to retrieve image: ${error.message}`,
      );
    }
  }

  public async deleteFile(filePath: string): Promise<void> {
    this.ensureInitialized();

    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.awsConfig.bucketName,
        Key: filePath,
      }),
    );
  }

  /**
   * Builds a file path for S3 storage
   * 
   * Uses S3PathBuilder utility for consistent path generation.
   * Currently uses flat structure (backward compatible).
   * 
   * @param itemType - The type of content
   * @param itemId - The ID of the item/user
   * @param fileName - Original file name (used to extract extension)
   * @returns The S3 key/path for the file
   */
  private buildPath(
    itemType: ContentType,
    itemId: number,
    fileName: string,
  ): string {
    return S3PathBuilder.buildPath(itemType, itemId, fileName, {
      useFolderStructure: false, // Keep flat structure for backward compatibility
      includeUserId: true,
    });
  }

  /**
   * Determines the content type based on file extension
   * @param fileName The name of the file
   * @returns The appropriate MIME type
   */
  private getContentTypeFromFileName(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();

    const mimeTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.mp4': 'video/mp4',
      '.mov': 'video/quicktime',
      '.avi': 'video/x-msvideo',
      '.webm': 'video/webm',
    };

    return mimeTypes[ext] || 'application/octet-stream';
  }
}

