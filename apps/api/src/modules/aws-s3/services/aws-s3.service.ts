import { randomUUID } from 'node:crypto';
import * as path from 'node:path';

import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { AwsConfig, Config } from '../../../config/config.type';
import { ImageFileInterface } from '../interfaces/image-file.interface';
import { ContentType } from '../enums/content-type.enum';

@Injectable()
export class AwsS3Service {
  private readonly awsConfig: AwsConfig;
  private readonly s3Client: S3Client;

  constructor(private readonly configService: ConfigService<Config>) {
    const config = this.configService.get<AwsConfig>('aws');
    if (!config) {
      throw new Error('AWS config not found');
    }
    this.awsConfig = config;

    this.s3Client = new S3Client({
      region: this.awsConfig.region,
      credentials: {
        accessKeyId: this.awsConfig.accessKeyId,
        secretAccessKey: this.awsConfig.secretAccessKey,
      },
    });
  }

  public async uploadFile(
    file: ImageFileInterface,
    itemType: ContentType,
    itemId: number,
  ): Promise<string> {
    try {
      const filePath = this.buildPath(itemType, itemId, file.file_name);
      
      // Determine content type based on file extension
      const contentType = this.getContentTypeFromFileName(file.file_name);
      
      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.awsConfig.bucketName,
          Key: filePath,
          Body: file.file_data,
          ContentType: contentType,
        }),
      );
      return filePath;
    } catch (error: any) {
      throw new ServiceUnavailableException('Failed to save file, try again');
    }
  }

  public async getFileUrl(filePath: string): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.awsConfig.bucketName,
        Key: filePath,
      });
      return await getSignedUrl(this.s3Client, command, {
        expiresIn: this.awsConfig.urlTtl,
      });
    } catch (error: any) {
      throw new ServiceUnavailableException(
        'Failed to get file URL, try again',
      );
    }
  }

  public async getFileBase64(filePath: string): Promise<string> {
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
    try {
      await this.s3Client.send(
        new DeleteObjectCommand({
          Bucket: this.awsConfig.bucketName,
          Key: filePath,
        }),
      );
    } catch (error: any) {
      throw error;
    }
  }

  //TODO Refactor building file path
  private buildPath(
    itemType: ContentType,
    itemId: number,
    fileName: string,
  ): string {
    return `${itemType}-${randomUUID()}-user-${itemId}${path.extname(fileName)}`;
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

