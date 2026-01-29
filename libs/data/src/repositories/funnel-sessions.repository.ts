import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';

import * as schema from '../schema';
import type {
  NewFunnelSession,
  FunnelSession,
} from '../schema/funnel-sessions.schema';

export class FunnelSessionsRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  /**
   * Create a new funnel session
   * Returns existing session if sessionId already exists (idempotent)
   */
  async create(
    values: Omit<NewFunnelSession, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<FunnelSession> {
    // Check if session already exists
    const existing = await this.findBySessionId(values.sessionId);
    if (existing) {
      return existing;
    }

    const [row] = await this.db
      .insert(schema.funnelSessions)
      .values(values)
      .returning();

    return row;
  }

  /**
   * Find session by session ID
   */
  async findBySessionId(sessionId: string): Promise<FunnelSession | undefined> {
    return await this.db.query.funnelSessions.findFirst({
      where: (sessions, { eq }) => eq(sessions.sessionId, sessionId),
    });
  }

  /**
   * Update session
   */
  async update(
    sessionId: string,
    values: Partial<Omit<NewFunnelSession, 'id' | 'sessionId' | 'createdAt'>>
  ): Promise<FunnelSession | undefined> {
    const [row] = await this.db
      .update(schema.funnelSessions)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(schema.funnelSessions.sessionId, sessionId))
      .returning();

    return row;
  }
}
