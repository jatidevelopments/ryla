# EP-019 (P5) — Report a Bug: Tech Spec (File Plan + Tasks)

Working in **PHASE P5 (File plan + tasks)** on **EP-019, ST-001-ST-004**.

## Scope (MVP)

- "Report a Bug" entry in bottom navigation
- Bug report modal with form
- Automatic screenshot capture (html2canvas)
- Automatic console log capture (buffer)
- Submit bug report via tRPC
- Store in database + S3 storage
- Analytics tracking

Out of scope (MVP):
- Admin dashboard to view bug reports
- Email notifications to team
- Status updates to users
- Bug report categories/tags

---

## API Contract (tRPC)

### `bugReport.submit`

Input:
- `description: string` (min 10 chars, required)
- `email?: string` (optional, email format)
- `includeScreenshot: boolean` (default true)
- `includeLogs: boolean` (default true)
- `screenshot?: string` (base64 data URL, optional)
- `consoleLogs?: LogEntry[]` (optional)
- `browserMetadata: BrowserMetadata` (required)

Output:
- `success: boolean`
- `bugReportId: string`
- `message: string`

---

## File Plan

### Data (libs/data)

- **Add** `libs/data/src/schema/bug-reports.schema.ts`
  - `bugReports` table definition
  - `bugReportStatusEnum` enum
  - Types: `BugReport`, `NewBugReport`, `ConsoleLogEntry`, `BrowserMetadata`
- **Update** `libs/data/src/schema/index.ts` exports
- **Add** `libs/data/src/repositories/bug-reports.repository.ts`
  - `create(values)`
  - `findById(id)`
  - `listByUserId(userId, options)`
  - `updateStatus(id, status)`
- **Update** `libs/data/src/repositories/index.ts` exports
- **Add** migration: `drizzle/migrations/XXXX-bug-reports.sql`

### Shared (libs/shared)

- **Add** `libs/shared/src/utils/console-log-buffer.ts`
  - `ConsoleLogBuffer` class
  - `getConsoleLogBuffer()` singleton
  - `initConsoleLogBuffer()` initialization
  - Sensitive data filtering
- **Add** `libs/shared/src/utils/screenshot-capture.ts`
  - `captureScreenshot(options)`
  - `dataURLToBlob(dataURL)`
  - `getScreenshotSize(dataURL)`
- **Update** `libs/shared/src/utils/index.ts` exports
- **Add** `html2canvas` dependency to `libs/shared/package.json`

### Business (libs/business)

- **Add** `libs/business/src/services/bug-report.service.ts`
  - `BugReportService` class
  - `create(input)` method
  - `uploadScreenshot(base64DataUrl)` private method
- **Update** `libs/business/src/services/index.ts` exports
- **Note**: May need to inject `AwsS3Service` from API module (or create abstraction)

### API (libs/trpc)

- **Add** `libs/trpc/src/routers/bug-report.router.ts`
  - `bugReport.submit` procedure (public, supports anonymous)
  - Input validation with Zod
  - Size limits enforcement
- **Update** `libs/trpc/src/routers/index.ts` exports
- **Update** `libs/trpc/src/router.ts` to include `bugReport` router

### Web (apps/web)

- **Add** `apps/web/components/bug-report/bug-report-modal.tsx`
  - Main modal component
  - State management
  - Form handling
  - Submission logic
- **Add** `apps/web/components/bug-report/screenshot-preview.tsx`
  - Screenshot thumbnail
  - Retake button
  - Loading/error states
- **Add** `apps/web/components/bug-report/console-logs-preview.tsx`
  - Log count badge
  - Expandable log viewer
  - Log level indicators
- **Add** `apps/web/components/bug-report/browser-info-display.tsx`
  - Collapsible browser metadata
  - Read-only display
- **Add** `apps/web/components/bug-report/index.ts` (barrel export)
- **Update** `libs/ui/src/components/bottom-nav.tsx`
  - Add "Report Bug" menu item
  - Modal state management
  - Icon import (Bug from lucide-react)
- **Update** `apps/web/app/layout.tsx` (or root component)
  - Initialize console log buffer on app mount

### Analytics (libs/analytics)

- **Update** event types if enforced (verify during implementation)
- Add capture calls in bug report components:
  - `bug_report_modal_opened`
  - `bug_report_screenshot_captured`
  - `bug_report_logs_captured`
  - `bug_report_submitted`
  - `bug_report_screenshot_retaken`
  - `bug_report_logs_expanded`

---

## Task Breakdown (P6-ready)

### [STORY] ST-001: Access Bug Report

- **AC**: EP-019 AC-1

Tasks:
- [TASK] TSK-EP019-001: Add "Report Bug" to bottom navigation
  - Update `libs/ui/src/components/bottom-nav.tsx`
  - Add Bug icon from lucide-react
  - Add modal state management
  - Handle click to open modal

### [STORY] ST-002: Report a Bug with Context

- **AC**: EP-019 AC-2, AC-3, AC-4, AC-5

Tasks:
- [TASK] TSK-EP019-002: Create bug reports database schema
  - Add `bug-reports.schema.ts`
  - Create migration
  - Add enum for status
- [TASK] TSK-EP019-003: Implement console log buffer utility
  - Create `console-log-buffer.ts`
  - Implement capture logic
  - Add sensitive data filtering
  - Initialize on app startup
- [TASK] TSK-EP019-004: Implement screenshot capture utility
  - Create `screenshot-capture.ts`
  - Add html2canvas dependency
  - Implement capture with compression
  - Handle errors gracefully
- [TASK] TSK-EP019-005: Create bug reports repository
  - Implement `BugReportsRepository`
  - Add CRUD methods
  - Export from repositories index
- [TASK] TSK-EP019-006: Create bug report service
  - Implement `BugReportService`
  - Add screenshot upload logic
  - Handle storage errors
- [TASK] TSK-EP019-007: Create bug report tRPC router
  - Add `bug-report.router.ts`
  - Implement `submit` procedure
  - Add input validation
  - Register in app router
- [TASK] TSK-EP019-008: Build bug report modal component
  - Create main modal component
  - Add form fields (description, email)
  - Add checkboxes (screenshot, logs)
  - Implement form validation
  - Add loading/success/error states
- [TASK] TSK-EP019-009: Build screenshot preview component
  - Create preview component
  - Add thumbnail display
  - Add retake functionality
  - Handle loading/error states
- [TASK] TSK-EP019-010: Build console logs preview component
  - Create preview component
  - Add log count badge
  - Add expandable log viewer
  - Add log level indicators
- [TASK] TSK-EP019-011: Build browser info display component
  - Create collapsible component
  - Display browser metadata
  - Read-only format
- [TASK] TSK-EP019-012: Wire modal to tRPC submission
  - Connect form to `trpc.bugReport.submit`
  - Handle success/error responses
  - Clear form on success
  - Show appropriate messages

### [STORY] ST-003: View Screenshot Preview

- **AC**: EP-019 AC-3

Tasks:
- [TASK] TSK-EP019-013: Implement screenshot capture on modal open
  - Capture before modal renders (or hide temporarily)
  - Store in component state
  - Show preview in modal
  - Handle capture errors

### [STORY] ST-004: Submit Bug Report

- **AC**: EP-019 AC-5, AC-6

Tasks:
- [TASK] TSK-EP019-014: Add analytics tracking
  - Add capture calls for all events
  - Include relevant properties
  - Track success/failure rates

---

## Dependencies

### NPM Packages

- `html2canvas` (for screenshot capture)
  ```bash
  pnpm add html2canvas
  ```

### Existing Services

- `AwsS3Service` (from `apps/api/src/modules/aws-s3`)
  - Used for screenshot storage
  - May need abstraction layer if called from business service

### Database

- New table: `bug_reports`
- New enum: `bug_report_status`
- Indexes: `user_id`, `status`, `created_at`

---

## Implementation Order

1. **Data Layer** (TSK-EP019-002, TSK-EP019-005)
   - Schema + migration
   - Repository

2. **Utilities** (TSK-EP019-003, TSK-EP019-004)
   - Console log buffer
   - Screenshot capture

3. **Business Layer** (TSK-EP019-006)
   - Bug report service

4. **API Layer** (TSK-EP019-007)
   - tRPC router

5. **UI Components** (TSK-EP019-008, TSK-EP019-009, TSK-EP019-010, TSK-EP019-011)
   - Modal
   - Previews
   - Browser info

6. **Integration** (TSK-EP019-001, TSK-EP019-012, TSK-EP019-013)
   - Bottom nav
   - Modal wiring
   - Capture logic

7. **Analytics** (TSK-EP019-014)
   - Event tracking

---

## Acceptance Criteria Mapping

| AC | Task(s) |
|----|---------|
| AC-1: Navigation Entry | TSK-EP019-001 |
| AC-2: Modal UI | TSK-EP019-008 |
| AC-3: Screenshot Capture | TSK-EP019-004, TSK-EP019-009, TSK-EP019-013 |
| AC-4: Console Log Capture | TSK-EP019-003, TSK-EP019-010 |
| AC-5: Submission | TSK-EP019-007, TSK-EP019-012 |
| AC-6: Backend Storage | TSK-EP019-002, TSK-EP019-005, TSK-EP019-006 |
| AC-7: Error Handling | TSK-EP019-008, TSK-EP019-012 |
| AC-8: Analytics | TSK-EP019-014 |

---

## Testing Considerations (P7 Preview)

### Unit Tests
- Console log buffer capture and filtering
- Screenshot capture utility
- Sensitive data filtering
- Form validation
- Repository methods

### Integration Tests
- Bug report API endpoint
- Screenshot upload to S3
- Database operations
- Error handling

### E2E Tests (Playwright)
- Open bug report modal from bottom nav
- Fill out form
- Capture screenshot
- Capture console logs
- Submit bug report
- Verify success message
- Verify data in database
- Verify screenshot in storage

---

## Phase 2+ (Future Requirements)

- Admin dashboard for bug report management
- Email notifications to team on new reports
- Status updates to users (open → in_progress → resolved)
- Bug report categories/tags
- Video screen recording
- Integration with GitHub Issues or Jira
- Bug report analytics dashboard
- User feedback on bug fixes
- Anonymous bug reports (no email required)

