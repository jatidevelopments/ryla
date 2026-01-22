# [EPIC] EP-019: Report a Bug

**Status**: Completed
**Phase**: P10
**Created**: 2026-01-21
**Last Updated**: 2026-01-21


## Overview

Add a "Report a Bug" feature accessible from the bottom navigation that allows users to report issues with a modal interface. The feature automatically captures console logs and a screenshot (without the modal visible) to provide comprehensive context for debugging.

> **Why now**: User feedback and bug reports are critical for improving product quality. Capturing console logs and screenshots automatically reduces friction and provides developers with actionable debugging information.

---

## Business Impact

**Target Metric**: B - Retention

**Hypothesis**: When users can easily report bugs with automatic context capture (logs + screenshots), they feel heard and supported, leading to higher trust and retention. Additionally, better bug reports lead to faster fixes, improving overall product quality.

**Success Criteria**:
- Bug report submission rate: **>5%** of active users submit at least one report
- Bug report completion rate: **>80%** of opened modals result in submission
- Average time to submit: **<2 minutes**
- Reports with screenshots: **>90%**
- Reports with console logs: **>95%**

---

## Features

### F1: Bottom Navigation Entry

- Add "Report a Bug" menu item to bottom navigation (`libs/ui/src/components/bottom-nav.tsx`)
- Icon: Bug/Alert icon (e.g., `Bug` or `AlertCircle` from lucide-react)
- Position: Between existing menu items or as a 5th item
- Click opens the bug report modal
- Visible on all pages where bottom nav is shown (mobile only)
- Consistent styling with existing nav items

### F2: Bug Report Modal

- Modal component opens when "Report a Bug" is clicked
- Modal includes:
  - Title: "Report a Bug" or "Report an Issue"
  - Description textarea (required, min 10 characters)
  - Optional email field (pre-filled if user is logged in)
  - Checkbox to include screenshot (default: checked)
  - Checkbox to include console logs (default: checked)
  - Preview of screenshot (if captured)
  - Preview of console logs count
  - Submit button
  - Cancel/Close button
- Modal uses existing dialog component pattern (`libs/ui/src/components/dialog.tsx`)
- Mobile-responsive design
- Loading state during submission

### F3: Screenshot Capture

- Capture screenshot of current page **before** modal opens (or hide modal temporarily to capture)
- Use `html2canvas` library for client-side screenshot capture
- Screenshot should:
  - Capture entire viewport (or full page if scrollable)
  - Exclude the bug report modal itself
  - Be compressed to reasonable size (< 500 KB)
  - Format: PNG or WebP
- Show preview thumbnail in modal
- Allow user to retake screenshot if needed
- Handle errors gracefully (e.g., if screenshot capture fails, still allow submission)

### F4: Console Log Capture

- Capture all console logs (console.log, console.error, console.warn, console.info, console.debug)
- Store logs in memory buffer (last 100-200 entries)
- Include:
  - Log level (log, error, warn, info, debug)
  - Timestamp
  - Message/content
  - Stack trace (for errors)
- Filter sensitive information (tokens, passwords, API keys) before sending
- Show log count in modal preview
- Allow user to view full logs (expandable section)
- Include browser information (user agent, URL, viewport size)

### F5: Bug Report Submission

- Submit bug report to backend API endpoint
- Payload includes:
  - User ID (if authenticated)
  - Description (text)
  - Email (optional, for follow-up)
  - Screenshot (base64 or file upload)
  - Console logs (JSON array)
  - Browser metadata (user agent, URL, viewport, etc.)
  - Timestamp
- Show success message after submission
- Show error message if submission fails
- Track analytics event for submission

### F6: Backend Storage & Processing

- API endpoint: `POST /api/bug-reports`
- Store bug reports in database (`bug_reports` table)
- Store screenshot in Supabase Storage (bucket: `bug-reports`)
- Store console logs as JSON in database
- Send notification to admin/team (optional, Phase 2)
- Return confirmation to user

---

## Acceptance Criteria

### AC-1: Navigation Entry

- [ ] "Report a Bug" item visible in bottom navigation
- [ ] Icon matches design system
- [ ] Click opens bug report modal
- [ ] Item is visible on all pages where bottom nav is shown
- [ ] Item is hidden on excluded routes (wizard, login) if applicable

### AC-2: Modal UI

- [ ] Modal opens when "Report a Bug" is clicked
- [ ] Modal has clear title and description
- [ ] Description textarea is required and validated (min 10 chars)
- [ ] Email field is optional and pre-filled if user logged in
- [ ] Screenshot checkbox is checked by default
- [ ] Console logs checkbox is checked by default
- [ ] Submit button is enabled when description is valid
- [ ] Cancel/Close button closes modal
- [ ] Modal is mobile-responsive
- [ ] Loading state shown during submission

### AC-3: Screenshot Capture

- [ ] Screenshot is captured automatically when modal opens
- [ ] Screenshot excludes the bug report modal itself
- [ ] Screenshot preview is shown in modal
- [ ] Screenshot is compressed (< 500 KB)
- [ ] User can retake screenshot if needed
- [ ] Screenshot capture errors are handled gracefully
- [ ] If screenshot fails, user can still submit report

### AC-4: Console Log Capture

- [ ] Console logs are captured (last 100-200 entries)
- [ ] Logs include level, timestamp, message, stack trace (errors)
- [ ] Sensitive information is filtered (tokens, passwords, API keys)
- [ ] Log count is shown in modal preview
- [ ] User can view full logs (expandable section)
- [ ] Browser metadata is included (user agent, URL, viewport)
- [ ] Logs are formatted as JSON

### AC-5: Submission

- [ ] Submit button sends bug report to backend
- [ ] Payload includes all required fields
- [ ] Success message shown after submission
- [ ] Error message shown if submission fails
- [ ] Modal closes after successful submission
- [ ] Analytics event tracked for submission
- [ ] Submission is idempotent (no duplicate submissions on retry)

### AC-6: Backend Storage

- [ ] Bug report is stored in database
- [ ] Screenshot is stored in Supabase Storage
- [ ] Console logs are stored as JSON
- [ ] All metadata is preserved
- [ ] Bug report is associated with user (if authenticated)
- [ ] Bug report has unique ID
- [ ] Timestamp is recorded

### AC-7: Error Handling

- [ ] Network errors are handled gracefully
- [ ] Screenshot capture errors don't block submission
- [ ] Console log capture errors don't block submission
- [ ] Validation errors are shown to user
- [ ] Backend errors are logged and user sees friendly message

### AC-8: Analytics

- [ ] Modal open tracked: `bug_report_modal_opened`
- [ ] Screenshot capture tracked: `bug_report_screenshot_captured`
- [ ] Console logs captured tracked: `bug_report_logs_captured`
- [ ] Submission tracked: `bug_report_submitted` (with success/failure)
- [ ] All events include user_id (if authenticated) and relevant metadata

---

## User Stories

### ST-001: Access Bug Report

**As a** user  
**I want to** access "Report a Bug" from the bottom navigation  
**So that** I can report issues I encounter

**Acceptance Criteria**: AC-1

---

### ST-002: Report a Bug with Context

**As a** user  
**I want to** describe a bug and have the system automatically capture screenshot and logs  
**So that** developers have all the information needed to fix it

**Acceptance Criteria**: AC-2, AC-3, AC-4, AC-5

---

### ST-003: View Screenshot Preview

**As a** user  
**I want to** see a preview of the captured screenshot  
**So that** I can verify it shows the issue correctly

**Acceptance Criteria**: AC-3

---

### ST-004: Submit Bug Report

**As a** user  
**I want to** submit my bug report  
**So that** the development team can investigate and fix it

**Acceptance Criteria**: AC-5, AC-6

---

## Technical Notes

### Data Model (Drizzle / Postgres)

Add `bug_reports` table in `@ryla/data/schema`:

```typescript
interface BugReport {
  id: string; // uuid, pk
  userId: string | null; // uuid, fk → users.id (nullable for anonymous)
  email: string | null; // text, nullable
  description: string; // text, required
  screenshotUrl: string | null; // text, nullable (Supabase Storage URL)
  consoleLogs: any; // jsonb, array of log entries
  browserMetadata: any; // jsonb (user agent, URL, viewport, etc.)
  status: 'open' | 'in_progress' | 'resolved' | 'closed'; // enum, default 'open'
  createdAt: Date; // timestamp
  updatedAt: Date; // timestamp
}
```

### Console Log Buffer

Implement a console log interceptor that stores logs in memory:

```typescript
// libs/shared/src/utils/console-log-buffer.ts
interface LogEntry {
  level: 'log' | 'error' | 'warn' | 'info' | 'debug';
  timestamp: number;
  message: string;
  stack?: string;
  args?: any[];
}

class ConsoleLogBuffer {
  private logs: LogEntry[] = [];
  private maxSize = 200;
  
  capture() {
    // Override console methods to capture logs
  }
  
  getLogs(): LogEntry[] {
    return this.logs.slice(-this.maxSize);
  }
  
  clear() {
    this.logs = [];
  }
  
  filterSensitive(data: any): any {
    // Filter tokens, passwords, API keys
  }
}
```

### Screenshot Capture

Use `html2canvas` library:

```typescript
// libs/shared/src/utils/screenshot-capture.ts
import html2canvas from 'html2canvas';

export async function captureScreenshot(
  excludeSelector?: string
): Promise<string> {
  const element = document.body;
  const canvas = await html2canvas(element, {
    excludeElements: excludeSelector ? document.querySelectorAll(excludeSelector) : undefined,
    useCORS: true,
    scale: 0.5, // Reduce size
  });
  return canvas.toDataURL('image/png', 0.8); // Compress
}
```

### API Contract

**Submit Bug Report**
- `POST /api/bug-reports`
- Payload:
  ```typescript
  {
    description: string;
    email?: string;
    includeScreenshot: boolean;
    includeLogs: boolean;
    screenshot?: string; // base64 or file
    consoleLogs?: LogEntry[];
    browserMetadata: {
      userAgent: string;
      url: string;
      viewport: { width: number; height: number };
      platform: string;
    };
  }
  ```
- Response:
  ```typescript
  {
    success: boolean;
    bugReportId: string;
    message: string;
  }
  ```

### Layering (MANDATORY)

- `apps/web` → calls `@ryla/trpc` (or API client) and renders UI
- `apps/api` (controller/gateway) → delegates to `@ryla/business`
- `@ryla/business` → orchestrates bug report creation use case
- `@ryla/data` → Drizzle repository (insert bug report, upload screenshot)

### UI Components

**Bug Report Modal:**
- `apps/web/components/bug-report-modal.tsx` - Main modal component
- `apps/web/components/bug-report/screenshot-preview.tsx` - Screenshot preview
- `apps/web/components/bug-report/logs-preview.tsx` - Console logs preview
- `apps/web/components/bug-report/form.tsx` - Form fields

**Bottom Nav Update:**
- `libs/ui/src/components/bottom-nav.tsx` - Add "Report a Bug" menu item

### Utilities

- `libs/shared/src/utils/console-log-buffer.ts` - Console log capture
- `libs/shared/src/utils/screenshot-capture.ts` - Screenshot capture
- `libs/shared/src/utils/sensitive-data-filter.ts` - Filter sensitive data

### Analytics Events

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

### Dependencies

**Frontend:**
- `html2canvas` - Screenshot capture library
- `@ryla/ui` - Dialog/modal components
- `@ryla/analytics` - Event tracking

**Backend:**
- Supabase Storage - Screenshot storage
- Drizzle ORM - Database operations

---

## Dependencies

- **EP-002**: Authentication (user context, optional email pre-fill)
- **EP-004**: Dashboard (bottom navigation exists)
- Supabase Storage (screenshot storage)
- Drizzle DB wiring (`apps/api/src/modules/drizzle`)

---

## Out of Scope (MVP)

- Admin dashboard to view/manage bug reports (Phase 2)
- Email notifications to team on new bug reports (Phase 2)
- Bug report status updates to users (Phase 2)
- Bug report categories/tags (Phase 2)
- Video screen recording (Phase 2)
- Bug report search/filtering (Phase 2)
- Integration with issue tracking systems (Jira, GitHub Issues) (Phase 2)
- Anonymous bug reports (MVP requires at least email)

---

## Future Enhancements (Phase 2+)

- Admin dashboard for bug report management
- Email notifications to team on new reports
- Status updates to users (open → in progress → resolved)
- Bug report categories (UI bug, performance, feature request, etc.)
- Video screen recording for complex bugs
- Integration with GitHub Issues or Jira
- Bug report analytics (most common issues, trends)
- User feedback on bug fixes
- Anonymous bug reports (no email required)

---

## Testing Requirements

### Unit Tests

- Console log buffer capture and filtering
- Screenshot capture utility
- Sensitive data filtering
- Form validation

### Integration Tests

- Bug report API endpoint
- Screenshot upload to Supabase Storage
- Database storage
- Error handling

### E2E Tests (Playwright)

- Open bug report modal from bottom nav
- Fill out bug report form
- Capture screenshot
- Capture console logs
- Submit bug report
- Verify success message
- Verify data in database
- Verify screenshot in storage

---

## Design Considerations

### Bottom Navigation Placement

The "Report a Bug" item should be added to the bottom navigation. Options:

1. **Add as 5th item** (after Profile):
   - Simple addition
   - May make nav crowded on small screens

2. **Replace one existing item** (not recommended)

3. **Add to overflow menu** (if space is limited)

**Recommendation**: Add as 5th item, but make icon smaller or use a compact design.

### Modal Layout

```
┌─────────────────────────────────────┐
│ Report a Bug                    [×] │
├─────────────────────────────────────┤
│                                     │
│ Describe the issue:                │
│ ┌─────────────────────────────────┐ │
│ │ [Textarea - min 10 chars]      │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Email (optional):                   │
│ ┌─────────────────────────────────┐ │
│ │ [user@example.com]              │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ☑ Include screenshot                │
│   [Screenshot preview thumbnail]    │
│                                     │
│ ☑ Include console logs (42 logs)   │
│   [View logs ▼]                    │
│                                     │
│ Browser: Chrome 120.0.0.0           │
│ URL: /dashboard                     │
│                                     │
│ [Cancel]  [Submit Report]           │
└─────────────────────────────────────┘
```

### Screenshot Capture Strategy

**Option 1: Capture before modal opens**
- Pros: Clean, no modal in screenshot
- Cons: User might navigate away before opening modal

**Option 2: Hide modal temporarily, capture, show modal**
- Pros: Captures exact state when user clicks
- Cons: Brief flash might be noticeable

**Option 3: Capture on modal open, exclude modal element**
- Pros: Simple, no flash
- Cons: Modal overlay might affect screenshot

**Recommendation**: Option 2 (hide modal temporarily) for best results.

---

## Related Epics

- **EP-004**: Dashboard (bottom navigation)
- **EP-002**: Authentication (user context)
- **EP-017**: In-App Notifications (could notify user when bug is resolved)

---

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Bug report submission rate | >5% | % of active users who submit at least one report |
| Bug report completion rate | >80% | % of opened modals that result in submission |
| Average time to submit | <2 min | Average time from modal open to submission |
| Reports with screenshots | >90% | % of reports that include screenshot |
| Reports with console logs | >95% | % of reports that include logs |
| Screenshot capture success | >95% | % of attempts that successfully capture screenshot |
| Submission success rate | >98% | % of submissions that succeed |

---

## Notes

- Screenshot capture should be fast (< 2 seconds) to avoid user frustration
- Console log buffer should be initialized early (on app load) to capture all logs
- Sensitive data filtering is critical for security (tokens, API keys, passwords)
- Bug reports should be stored securely (encrypted if containing sensitive data)
- Consider rate limiting to prevent spam
- Screenshot compression is important to reduce storage costs
- Console logs should be truncated if too large (> 10,000 entries or > 1 MB)

---

## Phase Checklist

- [x] P1: Requirements (this epic)
- [x] P2: Stories + acceptance criteria (this epic)
- [x] P3: Architecture (data model + API contracts) - See [EP-019-REPORT-A-BUG-P3.md](../../architecture/EP-019-REPORT-A-BUG-P3.md)
- [x] P4: UI skeleton (modal states + interactions) - See [EP-019-REPORT-A-BUG-P4-UI-SKELETON.md](../../specs/EP-019-REPORT-A-BUG-P4-UI-SKELETON.md)
- [x] P5: Tech spec (file plan + tasks) - See [EP-019-REPORT-A-BUG-P5-TECH-SPEC.md](../../specs/EP-019-REPORT-A-BUG-P5-TECH-SPEC.md)
- [x] P6: Implementation - See [EP-019-REPORT-A-BUG-P6-IMPLEMENTATION.md](../../specs/EP-019-REPORT-A-BUG-P6-IMPLEMENTATION.md)
- [x] P7: Testing - See [EP-019-REPORT-A-BUG-P7-TESTING.md](../../specs/EP-019-REPORT-A-BUG-P7-TESTING.md)
- [x] P8: Integration - See [EP-019-REPORT-A-BUG-P8-INTEGRATION.md](../../specs/EP-019-REPORT-A-BUG-P8-INTEGRATION.md)
- [x] P9: Deployment - See [EP-019-REPORT-A-BUG-P9-DEPLOYMENT.md](../../specs/EP-019-REPORT-A-BUG-P9-DEPLOYMENT.md)
- [x] P10: Validation - See [EP-019-REPORT-A-BUG-P10-VALIDATION.md](../../specs/EP-019-REPORT-A-BUG-P10-VALIDATION.md)

