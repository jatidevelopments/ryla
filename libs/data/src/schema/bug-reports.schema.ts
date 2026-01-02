import {
  pgTable,
  uuid,
  text,
  timestamp,
  jsonb,
  index,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';

/**
 * Bug report status enum
 */
export const bugReportStatusEnum = pgEnum('bug_report_status', [
  'open',
  'in_progress',
  'resolved',
  'closed',
]);

/**
 * Console log entry type
 */
export interface ConsoleLogEntry {
  level: 'log' | 'error' | 'warn' | 'info' | 'debug';
  timestamp: number; // Unix timestamp in ms
  message: string;
  stack?: string; // For errors
  args?: unknown[]; // Additional arguments (filtered for sensitive data)
}

/**
 * Browser metadata type
 */
export interface BrowserMetadata {
  userAgent: string;
  url: string;
  viewport: {
    width: number;
    height: number;
  };
  platform: string;
  language: string;
  timezone: string;
}

/**
 * Bug reports table
 * Stores user bug reports with screenshots and console logs
 */
export const bugReports = pgTable(
  'bug_reports',
  {
    id: uuid('id').defaultRandom().primaryKey(),

    // User association (nullable for anonymous reports in future)
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),

    // Contact info
    email: text('email'), // Optional, for follow-up

    // Bug description
    description: text('description').notNull(), // Required, min 10 chars

    // Screenshot (stored in S3/MinIO, URL here)
    screenshotUrl: text('screenshot_url'), // Nullable if screenshot capture failed

    // Console logs (JSONB array)
    consoleLogs: jsonb('console_logs').$type<ConsoleLogEntry[]>(), // Nullable

    // Browser metadata (JSONB object)
    browserMetadata: jsonb('browser_metadata').$type<BrowserMetadata>().notNull(),

    // Status tracking
    status: bugReportStatusEnum('status').notNull().default('open'),

    // Timestamps
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index('bug_reports_user_id_idx').on(table.userId),
    statusIdx: index('bug_reports_status_idx').on(table.status),
    createdAtIdx: index('bug_reports_created_at_idx').on(table.createdAt),
  })
);

export const bugReportsRelations = relations(bugReports, ({ one }) => ({
  user: one(users, {
    fields: [bugReports.userId],
    references: [users.id],
  }),
}));

export type BugReport = typeof bugReports.$inferSelect;
export type NewBugReport = typeof bugReports.$inferInsert;
export type BugReportStatus = (typeof bugReportStatusEnum.enumValues)[number];

