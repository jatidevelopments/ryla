import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, desc, eq } from 'drizzle-orm';

import * as schema from '../schema';

export type ImageRow = typeof schema.images.$inferSelect;
export type NewImageRow = typeof schema.images.$inferInsert;

export class ImagesRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  async createImage(values: Omit<NewImageRow, 'id' | 'createdAt' | 'updatedAt'>) {
    const result = await this.db
      .insert(schema.images)
      .values(values)
      .returning();

    return result[0];
  }

  async getById(input: { id: string; userId: string }) {
    return this.db.query.images.findFirst({
      where: and(eq(schema.images.id, input.id), eq(schema.images.userId, input.userId)),
    });
  }

  async listByCharacterId(input: { characterId: string; userId: string; limit?: number }) {
    const limit = input.limit ?? 50;
    return this.db.query.images.findMany({
      where: and(
        eq(schema.images.characterId, input.characterId),
        eq(schema.images.userId, input.userId),
      ),
      orderBy: [desc(schema.images.createdAt)],
      limit,
    });
  }

  async updateById(input: { id: string; userId: string; patch: Partial<NewImageRow> }) {
    const result = await this.db
      .update(schema.images)
      .set({ ...input.patch, updatedAt: new Date() })
      .where(and(eq(schema.images.id, input.id), eq(schema.images.userId, input.userId)))
      .returning();

    return result[0];
  }
}


