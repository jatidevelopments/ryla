import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';

import * as schema from '../schema';

export type GenerationJobRow = typeof schema.generationJobs.$inferSelect;
export type NewGenerationJobRow = typeof schema.generationJobs.$inferInsert;

export class GenerationJobsRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) { }

  async createJob(values: Omit<NewGenerationJobRow, 'id' | 'createdAt' | 'updatedAt'>) {
    const [row] = await this.db
      .insert(schema.generationJobs)
      .values(values)
      .returning();

    return row;
  }

  async getById(id: string) {
    return this.db.query.generationJobs.findFirst({
      where: eq(schema.generationJobs.id, id),
    });
  }

  async updateById(id: string, patch: Partial<NewGenerationJobRow>) {
    const [row] = await this.db
      .update(schema.generationJobs)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(schema.generationJobs.id, id))
      .returning();

    return row;
  }
}


