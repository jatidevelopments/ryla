import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, desc, eq } from 'drizzle-orm';

import * as schema from '../schema';

export type ImageRow = typeof schema.images.$inferSelect;
export type NewImageRow = typeof schema.images.$inferInsert;

export class ImagesRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  async createImage(
    values: Omit<NewImageRow, 'id' | 'createdAt' | 'updatedAt'>
  ) {
    try {
      const result = await this.db
        .insert(schema.images)
        .values(values)
        .returning();

      return result[0];
    } catch (error: any) {
      // Log detailed error information for debugging
      console.error('[ImagesRepository.createImage] Error Details:');
      console.error('  Error name:', error?.name);
      console.error('  Error message:', error?.message);
      console.error('  Error code:', error?.code);
      console.error('  Error detail:', error?.detail);
      console.error('  Error constraint:', error?.constraint);
      console.error('  Error column:', error?.column);
      console.error('  Error table:', error?.table);
      console.error('  Error cause:', error?.cause);

      // Check for nested cause (Drizzle wraps errors)
      if (error?.cause) {
        console.error('  Cause name:', error.cause?.name);
        console.error('  Cause message:', error.cause?.message);
        console.error('  Cause code:', error.cause?.code);
        console.error('  Cause detail:', error.cause?.detail);
        console.error('  Cause constraint:', error.cause?.constraint);
        console.error('  Cause column:', error.cause?.column);
        console.error('  Cause table:', error.cause?.table);
      }

      // Full error object
      console.error(
        '  Full error:',
        JSON.stringify(error, Object.getOwnPropertyNames(error), 2)
      );

      console.error(
        '  Values being inserted:',
        JSON.stringify(values, null, 2)
      );
      throw error;
    }
  }

  async getById(input: { id: string; userId: string }) {
    return this.db.query.images.findFirst({
      where: and(
        eq(schema.images.id, input.id),
        eq(schema.images.userId, input.userId)
      ),
    });
  }

  async listByCharacterId(input: {
    characterId: string;
    userId: string;
    limit?: number;
  }) {
    const limit = input.limit ?? 50;
    return this.db.query.images.findMany({
      where: and(
        eq(schema.images.characterId, input.characterId),
        eq(schema.images.userId, input.userId)
      ),
      orderBy: [desc(schema.images.createdAt)],
      limit,
    });
  }

  async updateById(input: {
    id: string;
    userId: string;
    patch: Partial<NewImageRow>;
  }) {
    const result = await this.db
      .update(schema.images)
      .set({ ...input.patch, updatedAt: new Date() })
      .where(
        and(
          eq(schema.images.id, input.id),
          eq(schema.images.userId, input.userId)
        )
      )
      .returning();

    return result[0];
  }

  /**
   * Get available images for LoRA training
   * Returns completed images for a character, prioritizing liked images
   */
  async getAvailableForTraining(input: {
    characterId: string;
    userId: string;
    limit?: number;
  }): Promise<{
    images: ImageRow[];
    likedCount: number;
    totalCount: number;
  }> {
    const limit = input.limit ?? 50;

    // Get all completed images for this character
    const allImages = await this.db.query.images.findMany({
      where: and(
        eq(schema.images.characterId, input.characterId),
        eq(schema.images.userId, input.userId),
        eq(schema.images.status, 'completed')
      ),
      orderBy: [desc(schema.images.liked), desc(schema.images.createdAt)],
      limit,
    });

    const likedCount = allImages.filter((img) => img.liked).length;

    return {
      images: allImages,
      likedCount,
      totalCount: allImages.length,
    };
  }
}
