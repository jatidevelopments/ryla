import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, isNull, desc } from 'drizzle-orm';
import * as schema from '@ryla/data/schema';
import { RedisService } from '../../redis/services/redis.service';
import { AwsS3Service } from '../../aws-s3/services/aws-s3.service';

@Injectable()
export class ImageGalleryService {
  constructor(
    @Inject('DRIZZLE_DB')
    private readonly db: NodePgDatabase<typeof schema>,
    @Inject(RedisService)
    private readonly redisService: RedisService,
    @Inject(AwsS3Service)
    private readonly s3: AwsS3Service,
  ) { }

  /**
   * Get images for a character - verifies user owns the character
   */
  async getCharacterImages(characterId: string, userId: string) {
    // First verify user owns the character
    const character = await this.db.query.characters.findFirst({
      where: eq(schema.characters.id, characterId),
    });

    if (!character) {
      throw new NotFoundException('Character not found');
    }

    if (character.userId !== userId) {
      throw new ForbiddenException('You do not have access to this character');
    }

    // Get images for the character
    // Try with all columns first, fallback to columns that definitely exist
    // if migration 0008 (style_id, lighting_id, model_id, objects) hasn't been applied
    let images;
    try {
      images = await this.db.query.images.findMany({
        where: and(
          eq(schema.images.characterId, characterId),
          isNull(schema.images.deletedAt),
        ),
        orderBy: [desc(schema.images.createdAt)],
      });
    } catch (error: any) {
      // Check if error is due to missing columns (migration not applied)
      const originalError = error.originalError || error.cause;
      const isMissingColumn =
        originalError?.code === '42703' ||
        originalError?.message?.includes('does not exist');

      if (isMissingColumn) {
        // Fallback: use select API with only columns that definitely exist
        // (up to migration 0007, excluding 0008 columns: style_id, lighting_id, model_id, objects)
        console.warn(
          '[ImageGalleryService] Missing columns detected (style_id, lighting_id, model_id, objects). Using fallback query. Run migration 0008: pnpm db:push',
        );
        const result = await this.db
          .select({
            id: schema.images.id,
            characterId: schema.images.characterId,
            userId: schema.images.userId,
            sourceImageId: schema.images.sourceImageId,
            editType: schema.images.editType,
            editMaskS3Key: schema.images.editMaskS3Key,
            s3Key: schema.images.s3Key,
            s3Url: schema.images.s3Url,
            thumbnailKey: schema.images.thumbnailKey,
            thumbnailUrl: schema.images.thumbnailUrl,
            prompt: schema.images.prompt,
            negativePrompt: schema.images.negativePrompt,
            seed: schema.images.seed,
            scene: schema.images.scene,
            environment: schema.images.environment,
            outfit: schema.images.outfit,
            poseId: schema.images.poseId,
            aspectRatio: schema.images.aspectRatio,
            // qualityMode removed - EP-045
            nsfw: schema.images.nsfw,
            liked: schema.images.liked,
            deletedAt: schema.images.deletedAt,
            status: schema.images.status,
            width: schema.images.width,
            height: schema.images.height,
            generationError: schema.images.generationError,
            // Prompt enhancement metadata
            promptEnhance: schema.images.promptEnhance,
            originalPrompt: schema.images.originalPrompt,
            enhancedPrompt: schema.images.enhancedPrompt,
            createdAt: schema.images.createdAt,
            updatedAt: schema.images.updatedAt,
          })
          .from(schema.images)
          .where(
            and(
              eq(schema.images.characterId, characterId),
              isNull(schema.images.deletedAt),
            ),
          )
          .orderBy(desc(schema.images.createdAt));

        // Add missing columns as null
        images = result.map((img) => ({
          ...img,
          styleId: null,
          lightingId: null,
          modelId: null,
          objects: null,
        }));
      } else {
        // Log other database errors
        console.error('[ImageGalleryService] Database error:', {
          message: error.message,
          code: error.code,
          detail: error.detail,
          hint: error.hint,
          stack: error.stack,
          originalError,
        });
        throw new Error(
          `Failed to fetch images: ${error.message || 'Unknown database error'}`,
        );
      }
    }

    // IMPORTANT:
    // Do NOT trust persisted s3Url/thumbnailUrl, since they may be presigned and expire.
    // Always return fresh signed URLs derived from storage keys.
    // For images with status 'generating', s3Key may be a placeholder - skip URL generation
    const signed = await Promise.all(
      images.map(async (img) => {
        // Skip URL generation for generating images with placeholder keys
        if (img.status === 'generating' && img.s3Key.startsWith('generating/')) {
          return {
            ...img,
            s3Url: null,
            thumbnailUrl: null,
          };
        }

        const key = img.s3Key;
        const thumbKey = img.thumbnailKey ?? img.s3Key;
        const [s3Url, thumbnailUrl] = await Promise.all([
          this.s3.getFileUrl(key),
          this.s3.getFileUrl(thumbKey),
        ]);

        return {
          ...img,
          s3Url,
          thumbnailUrl,
        };
      }),
    );

    return signed;
  }

  /**
   * Get a stable (auth-protected) URL for an image by redirecting to a fresh signed S3/MinIO URL.
   * Useful for downloads / open-in-new-tab without leaking long-lived URLs.
   */
  async getImageRedirectUrl(imageId: string, userId: string): Promise<string> {
    const image = await this.db.query.images.findFirst({
      where: eq(schema.images.id, imageId),
    });

    if (!image || image.deletedAt) {
      throw new NotFoundException('Image not found');
    }

    if (image.userId !== userId) {
      throw new ForbiddenException('You do not have access to this image');
    }

    return this.s3.getFileUrl(image.s3Key);
  }

  /**
   * Toggle like for an image - verifies user owns the image
   */
  async likeImage(imageId: string, userId: string) {
    // Verify user owns the image
    const image = await this.db.query.images.findFirst({
      where: eq(schema.images.id, imageId),
    });

    if (!image) {
      throw new NotFoundException('Image not found');
    }

    if (image.userId !== userId) {
      throw new ForbiddenException('You do not have access to this image');
    }

    if (image.deletedAt) {
      throw new NotFoundException('Image not found');
    }

    const nextLiked = !image.liked;
    await this.db
      .update(schema.images)
      .set({ liked: nextLiked, updatedAt: new Date() })
      .where(eq(schema.images.id, imageId));

    return nextLiked;
  }

  /**
   * Soft delete an image - verifies user owns the image
   */
  async deleteImage(imageId: string, userId: string) {
    const image = await this.db.query.images.findFirst({
      where: eq(schema.images.id, imageId),
    });

    if (!image || image.deletedAt) {
      throw new NotFoundException('Image not found');
    }

    if (image.userId !== userId) {
      throw new ForbiddenException('You do not have access to this image');
    }

    await this.db
      .update(schema.images)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(eq(schema.images.id, imageId));

    return true;
  }
}

