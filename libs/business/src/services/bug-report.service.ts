/**
 * Bug Report Service
 *
 * Orchestrates bug report creation and storage.
 */

import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@ryla/data/schema';
import { BugReportsRepository } from '@ryla/data';
import type { ConsoleLogEntry, BrowserMetadata } from '@ryla/data/schema/bug-reports.schema';

export interface CreateBugReportInput {
  userId: string | null;
  email?: string;
  description: string;
  screenshotUrl?: string | null; // Already uploaded, URL provided
  consoleLogs?: ConsoleLogEntry[] | null;
  browserMetadata: BrowserMetadata;
}

export class BugReportService {
  constructor(
    private readonly db: NodePgDatabase<typeof schema>
  ) {}

  async create(input: CreateBugReportInput): Promise<schema.BugReport> {
    const repository = new BugReportsRepository(this.db);

    // Create bug report record
    const bugReport = await repository.create({
      userId: input.userId,
      email: input.email || null,
      description: input.description,
      screenshotUrl: input.screenshotUrl || null,
      consoleLogs: input.consoleLogs || null,
      browserMetadata: input.browserMetadata,
      status: 'open',
    });

    return bugReport;
  }
}

