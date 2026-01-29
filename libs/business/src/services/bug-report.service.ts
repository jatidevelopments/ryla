/**
 * Bug Report Service
 *
 * Orchestrates bug report creation, storage, and notifications.
 */

import 'server-only';

import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from '@ryla/data/schema';
import { BugReportsRepository, users } from '@ryla/data';
import type {
  ConsoleLogEntry,
  BrowserMetadata,
} from '@ryla/data/schema/bug-reports.schema';
import { sendEmail, BugReportNotificationEmail } from '@ryla/email';

export interface CreateBugReportInput {
  userId: string | null;
  email?: string;
  description: string;
  screenshotUrl?: string | null; // Already uploaded, URL provided
  consoleLogs?: ConsoleLogEntry[] | null;
  browserMetadata: BrowserMetadata;
}

export class BugReportService {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

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

    // Send email notification to team (don't fail bug report if email fails)
    await this.sendNotificationEmail(bugReport, input);

    return bugReport;
  }

  /**
   * Send email notification to team when a bug report is created
   */
  private async sendNotificationEmail(
    bugReport: schema.BugReport,
    input: CreateBugReportInput
  ): Promise<void> {
    const notificationEmail = process.env['BUG_REPORT_NOTIFICATION_EMAIL'];
    if (!notificationEmail) {
      console.warn(
        'BUG_REPORT_NOTIFICATION_EMAIL not configured - skipping email notification'
      );
      return;
    }

    try {
      // Get user info if userId is available
      let userName: string | null = null;
      let userEmail: string | null = input.email || null;

      if (bugReport.userId) {
        const user = await this.db.query.users.findFirst({
          where: eq(users.id, bugReport.userId),
          columns: {
            name: true,
            publicName: true,
            email: true,
          },
        });

        if (user) {
          userName = user.name || user.publicName || null;
          userEmail = user.email || userEmail;
        }
      }

      // Build browser info string
      const browserInfo = `${
        input.browserMetadata.userAgent.split(' ')[0]
      } on ${input.browserMetadata.platform}`;

      // Build view URL (admin page or direct link)
      const appUrl =
        process.env['NEXT_PUBLIC_APP_URL'] || 'https://app.ryla.ai';
      const viewUrl = `${appUrl}/admin/bug-reports/${bugReport.id}`;

      await sendEmail({
        to: notificationEmail,
        subject: `[Bug Report] ${bugReport.id.substring(
          0,
          8
        )} - ${input.description.substring(0, 50)}${
          input.description.length > 50 ? '...' : ''
        }`,
        template: BugReportNotificationEmail,
        props: {
          bugReportId: bugReport.id,
          description: input.description,
          userEmail,
          userName,
          hasScreenshot: !!bugReport.screenshotUrl,
          hasLogs: !!bugReport.consoleLogs && bugReport.consoleLogs.length > 0,
          browserInfo,
          url: input.browserMetadata.url,
          viewUrl,
        },
      });
    } catch (error) {
      // Log but don't fail the bug report submission
      console.error('Failed to send bug report notification email:', error);
    }
  }
}
