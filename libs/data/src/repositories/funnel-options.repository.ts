import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, and, sql } from 'drizzle-orm';

import * as schema from '../schema';
import type {
  NewFunnelOption,
  FunnelOption,
} from '../schema/funnel-options.schema';

export class FunnelOptionsRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  /**
   * Save a single option (upsert)
   */
  async upsert(
    values: Omit<NewFunnelOption, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<FunnelOption> {
    const [row] = await this.db
      .insert(schema.funnelOptions)
      .values(values)
      .onConflictDoUpdate({
        target: [
          schema.funnelOptions.sessionId,
          schema.funnelOptions.optionKey,
        ],
        set: {
          optionValue: values.optionValue,
          updatedAt: new Date(),
        },
      })
      .returning();

    return row;
  }

  /**
   * Save multiple options (upsert)
   */
  async upsertMany(
    values: Array<Omit<NewFunnelOption, 'id' | 'createdAt' | 'updatedAt'>>
  ): Promise<FunnelOption[]> {
    if (values.length === 0) {
      return [];
    }

    const rows = await this.db
      .insert(schema.funnelOptions)
      .values(values)
      .onConflictDoUpdate({
        target: [
          schema.funnelOptions.sessionId,
          schema.funnelOptions.optionKey,
        ],
        set: {
          optionValue: sql`excluded.option_value`,
          updatedAt: new Date(),
        },
      })
      .returning();

    return rows;
  }

  /**
   * Get all options for a session
   */
  async findBySessionId(sessionId: string): Promise<FunnelOption[]> {
    return await this.db.query.funnelOptions.findMany({
      where: (options, { eq }) => eq(options.sessionId, sessionId),
      orderBy: (options, { asc }) => asc(options.optionKey),
    });
  }

  /**
   * Delete an option
   */
  async delete(sessionId: string, optionKey: string): Promise<boolean> {
    const result = await this.db
      .delete(schema.funnelOptions)
      .where(
        and(
          eq(schema.funnelOptions.sessionId, sessionId),
          eq(schema.funnelOptions.optionKey, optionKey)
        )
      );

    return (result.rowCount ?? 0) > 0;
  }
}
