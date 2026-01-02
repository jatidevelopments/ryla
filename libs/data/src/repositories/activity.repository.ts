import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { and, desc, eq, sql } from 'drizzle-orm';

import * as schema from '../schema';

export type ActivitySourceType = 'generation_job' | 'credit_transaction';

export interface ActivityCursor {
  occurredAt: Date;
  sourceType: ActivitySourceType;
  sourceId: string;
}

export class ActivityRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  async listGenerationJobsForActivity(input: {
    userId: string;
    since?: Date;
    cursor?: ActivityCursor;
    limit: number;
  }) {
    const occurredAtExpr = sql<Date>`coalesce(${schema.generationJobs.completedAt}, ${schema.generationJobs.startedAt}, ${schema.generationJobs.createdAt})`;

    const conditions: unknown[] = [eq(schema.generationJobs.userId, input.userId)];

    if (input.since) {
      conditions.push(sql`${occurredAtExpr} >= ${input.since}`);
    }

    if (input.cursor) {
      const c = input.cursor;
      if (c.sourceType === 'generation_job') {
        conditions.push(
          sql`(${occurredAtExpr} < ${c.occurredAt} OR (${occurredAtExpr} = ${c.occurredAt} AND ${schema.generationJobs.id} < ${c.sourceId}))`
        );
      } else {
        // Cursor from the other source: filter strictly by timestamp to avoid duplication
        conditions.push(sql`${occurredAtExpr} < ${c.occurredAt}`);
      }
    }

    return this.db
      .select()
      .from(schema.generationJobs)
      .where(and(...(conditions as any[])))
      .orderBy(desc(occurredAtExpr), desc(schema.generationJobs.id))
      .limit(input.limit);
  }

  async listCreditTransactionsForActivity(input: {
    userId: string;
    since?: Date;
    cursor?: ActivityCursor;
    limit: number;
  }) {
    const conditions: unknown[] = [
      eq(schema.creditTransactions.userId, input.userId),
    ];

    if (input.since) {
      conditions.push(sql`${schema.creditTransactions.createdAt} >= ${input.since}`);
    }

    if (input.cursor) {
      const c = input.cursor;
      if (c.sourceType === 'credit_transaction') {
        conditions.push(
          sql`(${schema.creditTransactions.createdAt} < ${c.occurredAt} OR (${schema.creditTransactions.createdAt} = ${c.occurredAt} AND ${schema.creditTransactions.id} < ${c.sourceId}))`
        );
      } else {
        conditions.push(sql`${schema.creditTransactions.createdAt} < ${c.occurredAt}`);
      }
    }

    return this.db
      .select()
      .from(schema.creditTransactions)
      .where(and(...(conditions as any[])))
      .orderBy(desc(schema.creditTransactions.createdAt), desc(schema.creditTransactions.id))
      .limit(input.limit);
  }
}


