import { randomUUID } from 'node:crypto';
import * as path from 'node:path';
import { ContentType } from '../enums/content-type.enum';

/**
 * Configuration for S3 path building
 */
interface PathBuilderConfig {
  /**
   * Whether to organize files in folders by content type
   * @default false
   */
  useFolderStructure?: boolean;

  /**
   * Whether to include user ID in the path
   * @default true
   */
  includeUserId?: boolean;

  /**
   * Custom separator between path segments
   * @default '/'
   */
  separator?: string;
}

/**
 * Utility class for building S3 file paths
 */
export class S3PathBuilder {
  private static readonly DEFAULT_CONFIG: Required<PathBuilderConfig> = {
    useFolderStructure: false,
    includeUserId: true,
    separator: '/',
  };

  /**
   * Builds a file path for S3 storage
   * 
   * @param itemType - The type of content (e.g., IMAGE_GEN_PAGE, IMAGE_CHARACTER_GEN)
   * @param itemId - The ID of the item/user
   * @param fileName - Original file name (used to extract extension)
   * @param config - Optional configuration for path building
   * @returns The S3 key/path for the file
   * 
   * @example
   * // Simple flat structure: "image-gen-page-{uuid}-user-123.jpg"
   * buildPath(ContentType.IMAGE_GEN_PAGE, 123, "photo.jpg")
   * 
   * @example
   * // Folder structure: "image-gen-page/user-123/{uuid}.jpg"
   * buildPath(ContentType.IMAGE_GEN_PAGE, 123, "photo.jpg", { useFolderStructure: true })
   */
  static buildPath(
    itemType: ContentType,
    itemId: number,
    fileName: string,
    config: PathBuilderConfig = {},
  ): string {
    const finalConfig = { ...this.DEFAULT_CONFIG, ...config };

    // Validate inputs
    this.validateInputs(itemType, itemId, fileName);

    // Extract file extension
    const extension = path.extname(fileName);
    if (!extension) {
      throw new Error(`File name must have an extension: ${fileName}`);
    }

    // Generate unique identifier
    const uniqueId = randomUUID();

    // Build path based on configuration
    if (finalConfig.useFolderStructure) {
      return this.buildFolderPath(
        itemType,
        itemId,
        uniqueId,
        extension,
        finalConfig,
      );
    }

    return this.buildFlatPath(
      itemType,
      itemId,
      uniqueId,
      extension,
      finalConfig,
    );
  }

  /**
   * Builds a flat path structure: "itemType-{uuid}-user-{itemId}.ext"
   */
  private static buildFlatPath(
    itemType: ContentType,
    itemId: number,
    uniqueId: string,
    extension: string,
    config: Required<PathBuilderConfig>,
  ): string {
    const parts: string[] = [itemType, uniqueId];

    if (config.includeUserId) {
      parts.push(`user-${itemId}`);
    }

    return `${parts.join('-')}${extension}`;
  }

  /**
   * Builds a folder-based path structure: "itemType/user-{itemId}/{uuid}.ext"
   */
  private static buildFolderPath(
    itemType: ContentType,
    itemId: number,
    uniqueId: string,
    extension: string,
    config: Required<PathBuilderConfig>,
  ): string {
    const parts: string[] = [itemType];

    if (config.includeUserId) {
      parts.push(`user-${itemId}`);
    }

    parts.push(`${uniqueId}${extension}`);

    return parts.join(config.separator);
  }

  /**
   * Validates input parameters
   */
  private static validateInputs(
    itemType: ContentType,
    itemId: number,
    fileName: string,
  ): void {
    if (!itemType || typeof itemType !== 'string') {
      throw new Error('itemType must be a valid ContentType');
    }

    if (!Number.isInteger(itemId) || itemId <= 0) {
      throw new Error(`itemId must be a positive integer, got: ${itemId}`);
    }

    if (!fileName || typeof fileName !== 'string' || fileName.trim().length === 0) {
      throw new Error(`fileName must be a non-empty string, got: ${fileName}`);
    }
  }

  /**
   * Extracts the content type folder from a path
   * Useful for parsing existing paths
   */
  static extractContentTypeFromPath(filePath: string): ContentType | null {
    const parts = filePath.split(/[/-]/);
    const contentType = parts[0] as ContentType;

    if (Object.values(ContentType).includes(contentType)) {
      return contentType;
    }

    return null;
  }

  /**
   * Extracts the user ID from a path
   * Useful for parsing existing paths
   */
  static extractUserIdFromPath(filePath: string): number | null {
    const match = filePath.match(/user-(\d+)/);
    if (match && match[1]) {
      return parseInt(match[1], 10);
    }
    return null;
  }
}
