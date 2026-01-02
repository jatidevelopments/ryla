import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, isNull } from 'drizzle-orm';
import * as schema from '@ryla/data/schema';
import { RedisService } from '../../redis/services/redis.service';

@Injectable()
export class ImageGalleryService {
  constructor(
    @Inject('DRIZZLE_DB')
    private readonly db: NodePgDatabase<typeof schema>,
    @Inject(RedisService)
    private readonly redisService: RedisService,
  ) {}

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
    const images = await this.db.query.images.findMany({
      where: and(
        eq(schema.images.characterId, characterId),
        isNull(schema.images.deletedAt),
      ),
      orderBy: (images, { desc }) => [desc(images.createdAt)],
    });

    return images;
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

    const nextLiked = !Boolean(image.liked);
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

