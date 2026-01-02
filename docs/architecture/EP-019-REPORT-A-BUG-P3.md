# EP-019 (P3) — Report a Bug (Architecture + API)

Working in **PHASE P3 (Architecture + API)** on **EP-019, ST-001-ST-004**.

## Goal

Ship an MVP bug reporting feature that allows users to:
- Access "Report a Bug" from bottom navigation
- Open a modal to describe the issue
- Automatically capture screenshot (without modal visible)
- Automatically capture console logs
- Submit bug report with all context to backend

---

## Architecture (Layers)

- **apps/web**: Bottom nav entry, bug report modal, screenshot/log capture utilities
- **libs/trpc**: `bugReport.submit` procedure (public or protected)
- **libs/business**: `BugReportService` (orchestrates creation, screenshot upload)
- **libs/data**: `BugReportsRepository` (DB operations)
- **apps/api**: `AwsS3Service` (screenshot storage, same as image storage)

Data flow:
1. User clicks "Report a Bug" in bottom nav
2. Frontend captures screenshot (before modal opens) and console logs
3. User fills form in modal
4. Web calls `trpc.bugReport.submit` with payload
5. `bugReport.submit` calls `BugReportService.create(userId, data)`
6. Service uploads screenshot to S3/MinIO via `AwsS3Service`
7. Service creates DB record via `BugReportsRepository`
8. Returns success with bug report ID

---

## Data Model (Drizzle / Postgres)

### `bug_reports` Table

```typescript
// libs/data/src/schema/bug-reports.schema.ts
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

export const bugReportStatusEnum = pgEnum('bug_report_status', [
  'open',
  'in_progress',
  'resolved',
  'closed',
]);

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

// Console log entry type
export interface ConsoleLogEntry {
  level: 'log' | 'error' | 'warn' | 'info' | 'debug';
  timestamp: number; // Unix timestamp in ms
  message: string;
  stack?: string; // For errors
  args?: unknown[]; // Additional arguments (filtered for sensitive data)
}

// Browser metadata type
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
```

---

## Console Log Buffer (Frontend Utility)

### Implementation: `libs/shared/src/utils/console-log-buffer.ts`

```typescript
/**
 * Console Log Buffer
 * 
 * Captures console logs in memory for bug reporting.
 * Filters sensitive data before storage.
 */

export interface LogEntry {
  level: 'log' | 'error' | 'warn' | 'info' | 'debug';
  timestamp: number;
  message: string;
  stack?: string;
  args?: unknown[];
}

class ConsoleLogBuffer {
  private logs: LogEntry[] = [];
  private maxSize = 200; // Keep last 200 entries
  private originalConsole: {
    log: typeof console.log;
    error: typeof console.error;
    warn: typeof console.warn;
    info: typeof console.info;
    debug: typeof console.debug;
  };

  constructor() {
    this.originalConsole = {
      log: console.log.bind(console),
      error: console.error.bind(console),
      warn: console.warn.bind(console),
      info: console.info.bind(console),
      debug: console.debug.bind(console),
    };
  }

  /**
   * Start capturing console logs
   */
  start(): void {
    console.log = (...args: unknown[]) => {
      this.capture('log', args);
      this.originalConsole.log(...args);
    };

    console.error = (...args: unknown[]) => {
      const stack = new Error().stack;
      this.capture('error', args, stack);
      this.originalConsole.error(...args);
    };

    console.warn = (...args: unknown[]) => {
      this.capture('warn', args);
      this.originalConsole.warn(...args);
    };

    console.info = (...args: unknown[]) => {
      this.capture('info', args);
      this.originalConsole.info(...args);
    };

    console.debug = (...args: unknown[]) => {
      this.capture('debug', args);
      this.originalConsole.debug(...args);
    };
  }

  /**
   * Stop capturing (restore original console)
   */
  stop(): void {
    console.log = this.originalConsole.log;
    console.error = this.originalConsole.error;
    console.warn = this.originalConsole.warn;
    console.info = this.originalConsole.info;
    console.debug = this.originalConsole.debug;
  }

  /**
   * Capture a log entry
   */
  private capture(
    level: LogEntry['level'],
    args: unknown[],
    stack?: string
  ): void {
    const message = args
      .map((arg) => {
        if (typeof arg === 'string') return arg;
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      })
      .join(' ');

    // Filter sensitive data from args
    const filteredArgs = this.filterSensitive(args);

    this.logs.push({
      level,
      timestamp: Date.now(),
      message: this.filterSensitiveString(message),
      stack,
      args: filteredArgs,
    });

    // Keep only last maxSize entries
    if (this.logs.length > this.maxSize) {
      this.logs = this.logs.slice(-this.maxSize);
    }
  }

  /**
   * Get captured logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Clear logs
   */
  clear(): void {
    this.logs = [];
  }

  /**
   * Filter sensitive data from objects/arrays
   */
  private filterSensitive(data: unknown): unknown {
    if (typeof data === 'string') {
      return this.filterSensitiveString(data);
    }

    if (Array.isArray(data)) {
      return data.map((item) => this.filterSensitive(item));
    }

    if (data && typeof data === 'object') {
      const filtered: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(data)) {
        const lowerKey = key.toLowerCase();
        // Filter common sensitive keys
        if (
          lowerKey.includes('token') ||
          lowerKey.includes('password') ||
          lowerKey.includes('secret') ||
          lowerKey.includes('key') ||
          lowerKey.includes('auth') ||
          lowerKey.includes('api')
        ) {
          filtered[key] = '[FILTERED]';
        } else {
          filtered[key] = this.filterSensitive(value);
        }
      }
      return filtered;
    }

    return data;
  }

  /**
   * Filter sensitive patterns from strings
   */
  private filterSensitiveString(str: string): string {
    // Filter JWT tokens (base64-like strings)
    str = str.replace(
      /[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}/g,
      '[JWT_TOKEN]'
    );

    // Filter API keys (long alphanumeric strings)
    str = str.replace(/[A-Za-z0-9]{32,}/g, (match) => {
      // Don't filter if it looks like a normal word or number
      if (/^\d+$/.test(match) || match.length < 40) return match;
      return '[API_KEY]';
    });

    // Filter email-like patterns that might be tokens
    str = str.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, (match) => {
      // Only filter if it's in a suspicious context
      if (str.includes('token') || str.includes('key') || str.includes('secret')) {
        return '[EMAIL_FILTERED]';
      }
      return match;
    });

    return str;
  }
}

// Singleton instance
let bufferInstance: ConsoleLogBuffer | null = null;

/**
 * Get or create the console log buffer singleton
 */
export function getConsoleLogBuffer(): ConsoleLogBuffer {
  if (!bufferInstance) {
    bufferInstance = new ConsoleLogBuffer();
    bufferInstance.start();
  }
  return bufferInstance;
}

/**
 * Initialize console log buffer (call on app startup)
 */
export function initConsoleLogBuffer(): void {
  getConsoleLogBuffer();
}
```

---

## Screenshot Capture (Frontend Utility)

### Implementation: `libs/shared/src/utils/screenshot-capture.ts`

```typescript
/**
 * Screenshot Capture Utility
 * 
 * Uses html2canvas to capture page screenshots for bug reports.
 */

import html2canvas from 'html2canvas';

export interface ScreenshotOptions {
  /**
   * CSS selector to exclude from screenshot (e.g., modal)
   */
  excludeSelector?: string;
  /**
   * Quality (0-1, default 0.8)
   */
  quality?: number;
  /**
   * Scale factor (default 0.5 for smaller file size)
   */
  scale?: number;
}

/**
 * Capture screenshot of current page
 * 
 * @param options Screenshot options
 * @returns Base64 data URL (PNG format)
 */
export async function captureScreenshot(
  options: ScreenshotOptions = {}
): Promise<string> {
  const {
    excludeSelector,
    quality = 0.8,
    scale = 0.5, // Reduce size for storage efficiency
  } = options;

  try {
    // Get elements to exclude
    const excludeElements: HTMLElement[] = [];
    if (excludeSelector) {
      const elements = document.querySelectorAll<HTMLElement>(excludeSelector);
      excludeElements.push(...Array.from(elements));
    }

    // Capture screenshot
    const canvas = await html2canvas(document.body, {
      useCORS: true,
      allowTaint: false,
      scale,
      logging: false,
      // Exclude elements by temporarily hiding them
      onclone: (clonedDoc) => {
        excludeElements.forEach((el) => {
          const clonedEl = clonedDoc.querySelector(
            `[data-original-id="${el.getAttribute('data-original-id') || el.id}"]`
          );
          if (clonedEl) {
            (clonedEl as HTMLElement).style.display = 'none';
          }
        });
      },
    });

    // Convert to base64 with compression
    return canvas.toDataURL('image/png', quality);
  } catch (error) {
    console.error('Screenshot capture failed:', error);
    throw new Error('Failed to capture screenshot');
  }
}

/**
 * Convert base64 data URL to Blob
 */
export function dataURLToBlob(dataURL: string): Blob {
  const arr = dataURL.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/png';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

/**
 * Get screenshot file size in bytes
 */
export function getScreenshotSize(dataURL: string): number {
  const blob = dataURLToBlob(dataURL);
  return blob.size;
}
```

---

## API Contract (tRPC)

### Router: `libs/trpc/src/routers/bug-report.router.ts`

```typescript
/**
 * Bug Report Router
 * 
 * Handles bug report submissions with screenshot and console logs.
 */

import { z } from 'zod';
import { TRPCError } from '@trpc/server';

import { router, publicProcedure } from '../trpc';
import { BugReportService } from '@ryla/business';

// Input validation schema
const submitBugReportSchema = z.object({
  description: z.string().min(10, 'Description must be at least 10 characters'),
  email: z.string().email().optional().or(z.literal('')),
  includeScreenshot: z.boolean().default(true),
  includeLogs: z.boolean().default(true),
  screenshot: z.string().optional(), // Base64 data URL
  consoleLogs: z
    .array(
      z.object({
        level: z.enum(['log', 'error', 'warn', 'info', 'debug']),
        timestamp: z.number(),
        message: z.string(),
        stack: z.string().optional(),
        args: z.array(z.unknown()).optional(),
      })
    )
    .optional(),
  browserMetadata: z.object({
    userAgent: z.string(),
    url: z.string(),
    viewport: z.object({
      width: z.number(),
      height: z.number(),
    }),
    platform: z.string(),
    language: z.string(),
    timezone: z.string(),
  }),
});

export const bugReportRouter = router({
  /**
   * Submit a bug report
   * 
   * Public procedure (allows anonymous reports with email)
   * If user is authenticated, userId is automatically included.
   */
  submit: publicProcedure
    .input(submitBugReportSchema)
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user?.id || null;

      // Validate screenshot if included
      if (input.includeScreenshot && input.screenshot) {
        const size = input.screenshot.length;
        // Limit to 5MB (base64 is ~33% larger than binary)
        if (size > 5 * 1024 * 1024) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Screenshot too large (max 5MB)',
          });
        }
      }

      // Validate console logs if included
      if (input.includeLogs && input.consoleLogs) {
        const logsSize = JSON.stringify(input.consoleLogs).length;
        // Limit to 1MB
        if (logsSize > 1024 * 1024) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Console logs too large (max 1MB)',
          });
        }
      }

      // Create bug report via service
      const bugReportService = new BugReportService(ctx.db);
      const bugReport = await bugReportService.create({
        userId,
        email: input.email || undefined,
        description: input.description,
        screenshot: input.includeScreenshot ? input.screenshot : undefined,
        consoleLogs: input.includeLogs ? input.consoleLogs : undefined,
        browserMetadata: input.browserMetadata,
      });

      return {
        success: true,
        bugReportId: bugReport.id,
        message: 'Bug report submitted successfully',
      };
    }),
});
```

---

## Business Service

### Implementation: `libs/business/src/services/bug-report.service.ts`

```typescript
/**
 * Bug Report Service
 * 
 * Orchestrates bug report creation, screenshot upload, and storage.
 */

import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '@ryla/data/schema';
import { BugReportsRepository } from '@ryla/data';
import { AwsS3Service } from '@ryla/business'; // Or inject from API module

export interface CreateBugReportInput {
  userId: string | null;
  email?: string;
  description: string;
  screenshot?: string; // Base64 data URL
  consoleLogs?: Array<{
    level: 'log' | 'error' | 'warn' | 'info' | 'debug';
    timestamp: number;
    message: string;
    stack?: string;
    args?: unknown[];
  }>;
  browserMetadata: {
    userAgent: string;
    url: string;
    viewport: { width: number; height: number };
    platform: string;
    language: string;
    timezone: string;
  };
}

export class BugReportService {
  constructor(
    private readonly db: NodePgDatabase<typeof schema>,
    private readonly s3Service?: AwsS3Service // Optional, inject if available
  ) {}

  async create(input: CreateBugReportInput): Promise<schema.BugReport> {
    const repository = new BugReportsRepository(this.db);

    // Upload screenshot if provided
    let screenshotUrl: string | null = null;
    if (input.screenshot) {
      try {
        screenshotUrl = await this.uploadScreenshot(input.screenshot);
      } catch (error) {
        console.error('Failed to upload screenshot:', error);
        // Continue without screenshot
      }
    }

    // Create bug report record
    const bugReport = await repository.create({
      userId: input.userId,
      email: input.email || null,
      description: input.description,
      screenshotUrl,
      consoleLogs: input.consoleLogs || null,
      browserMetadata: input.browserMetadata,
      status: 'open',
    });

    return bugReport;
  }

  /**
   * Upload screenshot to S3/MinIO storage
   */
  private async uploadScreenshot(base64DataUrl: string): Promise<string> {
    if (!this.s3Service) {
      throw new Error('S3 service not available');
    }

    // Parse base64 data URL
    const base64Data = base64DataUrl.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 9);
    const filename = `bug-reports/${timestamp}-${randomId}.png`;

    // Upload to S3
    const key = await this.s3Service.uploadFileDirect(
      filename,
      buffer,
      'image/png'
    );

    // Get public URL
    const url = await this.s3Service.getFileUrl(key);

    return url;
  }
}
```

---

## Data Repository

### Implementation: `libs/data/src/repositories/bug-reports.repository.ts`

```typescript
/**
 * Bug Reports Repository
 * 
 * Database operations for bug reports.
 */

import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../schema';
import type { NewBugReport, BugReport } from '../schema/bug-reports.schema';

export class BugReportsRepository {
  constructor(private readonly db: NodePgDatabase<typeof schema>) {}

  async create(
    values: Omit<NewBugReport, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<BugReport> {
    const [row] = await this.db
      .insert(schema.bugReports)
      .values({
        ...values,
        updatedAt: new Date(),
      })
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

    // Get total count (simplified, can be optimized)
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
      .where((bugReports, { eq }) => eq(bugReports.id, id));

    return (result.rowCount ?? 0) > 0;
  }
}
```

---

## Frontend Integration

### Bottom Navigation Update

```typescript
// libs/ui/src/components/bottom-nav.tsx
// Add to menuItems array:

const menuItems = [
  // ... existing items ...
  {
    id: 5,
    title: 'Report Bug',
    url: '', // No URL, opens modal
    icon: BugIcon, // From lucide-react
    activeIcon: BugIcon,
    onClick: () => {
      // Open bug report modal
      setBugReportModalOpen(true);
    },
  },
];
```

### Bug Report Modal Component

```typescript
// apps/web/components/bug-report-modal.tsx
// Main modal component that:
// 1. Captures screenshot on mount (before modal renders)
// 2. Shows form with description, email, checkboxes
// 3. Shows preview of screenshot and log count
// 4. Submits via trpc.bugReport.submit
```

---

## Storage Strategy

### Screenshot Storage

- **Location**: S3/MinIO bucket (same as image storage)
- **Path**: `bug-reports/{timestamp}-{randomId}.png`
- **Service**: `AwsS3Service` (existing, used by `ImageStorageService`)
- **Format**: PNG (compressed, quality 0.8)
- **Size limit**: 5MB (base64)
- **Access**: Public URLs (or signed URLs if needed)

### Console Logs Storage

- **Location**: Database (JSONB column)
- **Format**: Array of `ConsoleLogEntry` objects
- **Size limit**: 1MB (JSON stringified)
- **Filtering**: Sensitive data filtered before storage

---

## Error Handling

### Screenshot Capture Failures

- If screenshot capture fails, allow submission without screenshot
- Show warning message: "Screenshot capture failed, but you can still submit"
- Log error for debugging

### Console Log Capture Failures

- If console log buffer is empty or fails, allow submission without logs
- Show warning message: "Console logs unavailable"
- Log error for debugging

### Storage Failures

- If screenshot upload fails, store bug report without screenshot URL
- Log error for admin review
- Return success to user (don't block submission)

### Validation Errors

- Description too short: Show inline error
- Screenshot too large: Show error, allow retry
- Console logs too large: Truncate or show error
- Network errors: Show retry option

---

## Analytics Events

```typescript
// Modal opened
analytics.capture('bug_report_modal_opened', {
  user_id?: string;
  page_url: string;
});

// Screenshot captured
analytics.capture('bug_report_screenshot_captured', {
  user_id?: string;
  screenshot_size: number; // bytes
  success: boolean;
});

// Console logs captured
analytics.capture('bug_report_logs_captured', {
  user_id?: string;
  log_count: number;
  has_errors: boolean;
});

// Bug report submitted
analytics.capture('bug_report_submitted', {
  user_id?: string;
  bug_report_id: string;
  has_screenshot: boolean;
  has_logs: boolean;
  description_length: number;
  success: boolean;
});
```

---

## Dependencies

### Frontend

- `html2canvas` - Screenshot capture library
  ```bash
  pnpm add html2canvas
  ```
- `@ryla/ui` - Dialog/modal components (existing)
- `@ryla/trpc` - API client (existing)
- `@ryla/analytics` - Event tracking (existing)

### Backend

- `AwsS3Service` - Storage service (existing)
- Drizzle ORM - Database operations (existing)
- tRPC - API layer (existing)

---

## Migration

### Database Migration

```sql
-- Create bug_report_status enum
CREATE TYPE bug_report_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- Create bug_reports table
CREATE TABLE bug_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  email TEXT,
  description TEXT NOT NULL,
  screenshot_url TEXT,
  console_logs JSONB,
  browser_metadata JSONB NOT NULL,
  status bug_report_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX bug_reports_user_id_idx ON bug_reports(user_id);
CREATE INDEX bug_reports_status_idx ON bug_reports(status);
CREATE INDEX bug_reports_created_at_idx ON bug_reports(created_at);
```

---

## Security Considerations

### Sensitive Data Filtering

- Console logs are filtered for:
  - JWT tokens
  - API keys (long alphanumeric strings)
  - Passwords
  - Secrets
  - Auth headers

### Rate Limiting

- Consider rate limiting bug report submissions (e.g., 5 per hour per user)
- Prevent spam/abuse

### Privacy

- Screenshots may contain sensitive user data
- Store securely (encrypted at rest)
- Access restricted to admin/team only
- Consider GDPR compliance (user can request deletion)

---

## Open Questions (for P4/P5)

1. **Screenshot capture timing**: Capture before modal opens or hide modal temporarily?
   - **Recommendation**: Hide modal temporarily for cleanest screenshot

2. **Anonymous reports**: Allow without email in MVP?
   - **Recommendation**: Require email for MVP (can be anonymous email)

3. **Admin dashboard**: Include in MVP or Phase 2?
   - **Recommendation**: Phase 2 (MVP focuses on submission only)

4. **Email notifications**: Notify team on new bug report?
   - **Recommendation**: Phase 2 (use existing notification system)

5. **Screenshot compression**: Further optimize file size?
   - **Recommendation**: Use WebP format if supported, or PNG with quality 0.8

---

## Next Steps (P4/P5)

- P4: UI skeleton (modal states, form validation, previews)
- P5: File plan (exact file locations, component structure, task breakdown)

