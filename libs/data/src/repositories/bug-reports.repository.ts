import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq, desc } from 'drizzle-orm';

import * as schema from '../schema';
import type { NewBugReport, BugReport } from '../schema/bug-reports.schema';

export class BugReportsRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  async create(
    values: Omit<NewBugReport, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<BugReport> {
    const [row] = await this.db
      .insert(schema.bugReports)
      .values(values)
      .returning();

    return row;
  }

  async findById(id: string): Promise<BugReport | undefined> {
    return await this.db.query.bugReports.findFirst({
      where: (bugReports, { eq }) => eq(bugReports.id, id),
    });
  }

  async listByUserId(
    userId: string,
    options: { limit?: number; offset?: number } = {}
  ): Promise<{ items: BugReport[]; total: number }> {
    const { limit = 50, offset = 0 } = options;

    const items = await this.db.query.bugReports.findMany({
      where: (bugReports, { eq }) => eq(bugReports.userId, userId),
      orderBy: (bugReports, { desc }) => desc(bugReports.createdAt),
      limit,
      offset,
    });

    // Get total count
    const allItems = await this.db.query.bugReports.findMany({
      where: (bugReports, { eq }) => eq(bugReports.userId, userId),
    });

    return {
      items,
      total: allItems.length,
    };
  }

  async updateStatus(
    id: string,
    status: 'open' | 'in_progress' | 'resolved' | 'closed'
  ): Promise<boolean> {
    const result = await this.db
      .update(schema.bugReports)
      .set({ status, updatedAt: new Date() })
      .where(eq(schema.bugReports.id, id));

    return (result.rowCount ?? 0) > 0;
  }
}

