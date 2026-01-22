# [EPIC] EP-053: Bug Reports Management

**Initiative**: [IN-014](../../../initiatives/IN-014-admin-back-office.md) - Admin Back-Office Application  
**Phase**: 1 (MVP)  
**Priority**: P0  
**Status**: Completed

---

## Overview

Build a bug report management system that allows support team to view, triage, and manage bug reports submitted through the web app's "Report a Bug" feature (EP-019). Includes screenshot viewing, console log analysis, and status workflow.

---

## Business Impact

**Target Metric**: B-Retention (faster bug resolution)

**Hypothesis**: When bug reports are properly managed and triaged, we can fix issues faster, improving user experience and retention.

**Success Criteria**:

- All bug reports visible within 24 hours of submission
- Average triage time: < 2 hours
- Bug report resolution workflow: 100% trackable

---

## Features

### F1: Bug Reports Queue

- List all bug reports
- Filter by status (open, in_progress, resolved, closed)
- Filter by date range
- Filter by user (email or ID)
- Sort by date, status, user
- Pagination (25 items per page)

**Queue Columns**:
| Column | Description |
|--------|-------------|
| ID | Report ID (truncated) |
| Date | Submission date |
| User | Email (or "Anonymous") |
| Status | Status badge |
| Description | First 100 chars |
| Has Screenshot | ✅/❌ |
| Has Console Logs | ✅/❌ |
| Actions | View button |

### F2: Bug Report Detail View

Comprehensive view of a single bug report:

**Report Info**:
- Report ID
- Submission date/time
- User email (with link to user profile)
- Status (with change dropdown)
- Admin notes

**Description Panel**:
- Full bug description
- Formatted text display

**Screenshot Panel**:
- Full-size screenshot image
- Zoom capability
- Download button
- "No screenshot" placeholder if missing

**Console Logs Panel**:
- Formatted console log viewer
- Color-coded by level (log, warn, error, info)
- Expandable stack traces
- Search within logs
- "No logs captured" if empty

**Browser Metadata Panel**:
- User agent (parsed into browser/OS)
- URL where bug was reported
- Viewport size
- Platform
- Language
- Timezone

### F3: Status Workflow

Status transitions:
```
open → in_progress → resolved → closed
  ↓        ↓            ↓
closed   closed      closed
```

- Status change dropdown
- Optional note on status change
- Timestamp and admin recorded
- Status history visible

### F4: Admin Notes

- Add notes to bug report
- Notes timestamped with admin
- Cannot be deleted
- Visible to all admins
- Supports markdown formatting

### F5: Link to User

- Click email to view user profile
- See user's other bug reports
- See user's generation history (for context)

### F6: Bulk Actions

- Select multiple reports
- Bulk status change
- Bulk assign (future)

### F7: Quick Stats

- Open reports count (badge in nav)
- Reports by status
- Reports this week vs last week
- Average time to resolve

---

## Acceptance Criteria

### AC-1: Bug Reports Queue

- [ ] Lists all bug reports
- [ ] Pagination works correctly
- [ ] Filters work correctly
- [ ] Sorting works correctly
- [ ] Status badges display correctly
- [ ] Open count shown in nav badge

### AC-2: Bug Report Detail

- [ ] All report fields displayed
- [ ] Description renders correctly
- [ ] Screenshot displays if available
- [ ] Console logs display if available
- [ ] Browser metadata parsed and displayed
- [ ] User link navigates to user profile

### AC-3: Screenshot Viewing

- [ ] Screenshot loads correctly
- [ ] Can zoom in/out
- [ ] Can download screenshot
- [ ] Placeholder shown if no screenshot
- [ ] Loading state while image loads

### AC-4: Console Logs

- [ ] Logs display in readable format
- [ ] Color-coded by level
- [ ] Stack traces expandable
- [ ] Can search within logs
- [ ] Handles empty logs gracefully

### AC-5: Status Workflow

- [ ] Can change status via dropdown
- [ ] Status change recorded with timestamp
- [ ] Admin who changed status recorded
- [ ] Status history visible
- [ ] Optional note on status change

### AC-6: Admin Notes

- [ ] Can add notes to report
- [ ] Notes show admin name and time
- [ ] Notes persist correctly
- [ ] Markdown renders correctly
- [ ] Notes cannot be deleted

### AC-7: Quick Stats

- [ ] Open count accurate
- [ ] Status breakdown accurate
- [ ] Time comparison works
- [ ] Stats refresh on actions

---

## Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `admin_bug_report_viewed` | Report opened | `report_id`, `status` |
| `admin_bug_report_status_changed` | Status changed | `report_id`, `old_status`, `new_status` |
| `admin_bug_report_note_added` | Note added | `report_id`, `note_length` |
| `admin_bug_reports_filtered` | Filter applied | `filter_type`, `result_count` |

---

## User Stories

### ST-230: View Bug Reports Queue

**As a** support admin  
**I want to** see all submitted bug reports  
**So that** I can triage and prioritize issues

**AC**: AC-1

### ST-231: View Bug Report Details

**As a** support admin  
**I want to** see full details of a bug report  
**So that** I can understand and reproduce the issue

**AC**: AC-2, AC-3, AC-4

### ST-232: Update Bug Report Status

**As a** support admin  
**I want to** update the status of a bug report  
**So that** I can track progress on fixing it

**AC**: AC-5

### ST-233: Add Notes to Bug Report

**As a** support admin  
**I want to** add notes to a bug report  
**So that** I can document investigation progress

**AC**: AC-6

---

## Technical Notes

### API Endpoints

```typescript
// Admin tRPC Router - Bug Reports
admin.bugReports.list({ status?, userId?, dateFrom?, dateTo?, limit, offset })
admin.bugReports.get({ reportId })
admin.bugReports.updateStatus({ reportId, status, note? })
admin.bugReports.addNote({ reportId, note })
admin.bugReports.getStats()
admin.bugReports.getStatusHistory({ reportId })
```

### Status History Schema

```typescript
export const bugReportStatusHistory = pgTable('bug_report_status_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  bugReportId: uuid('bug_report_id')
    .notNull()
    .references(() => bugReports.id, { onDelete: 'cascade' }),
  adminUserId: uuid('admin_user_id')
    .notNull()
    .references(() => adminUsers.id),
  fromStatus: bugReportStatusEnum('from_status'),
  toStatus: bugReportStatusEnum('to_status').notNull(),
  note: text('note'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

### Console Log Viewer Component

```typescript
// apps/admin/components/ConsoleLogViewer.tsx
interface ConsoleLogEntry {
  level: 'log' | 'error' | 'warn' | 'info' | 'debug';
  timestamp: number;
  message: string;
  stack?: string;
}

const levelColors = {
  log: 'text-gray-400',
  info: 'text-blue-400',
  warn: 'text-yellow-400',
  error: 'text-red-400',
  debug: 'text-purple-400',
};

export function ConsoleLogViewer({ logs }: { logs: ConsoleLogEntry[] }) {
  const [search, setSearch] = useState('');
  const [expandedStacks, setExpandedStacks] = useState<Set<number>>(new Set());
  
  const filteredLogs = logs.filter(log => 
    log.message.toLowerCase().includes(search.toLowerCase())
  );
  
  return (
    <div className="bg-card rounded-lg border border-border">
      <div className="p-4 border-b border-border">
        <input 
          placeholder="Search logs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-input border border-border rounded px-3 py-2"
        />
      </div>
      <div className="font-mono text-sm p-4 max-h-96 overflow-auto">
        {filteredLogs.map((log, i) => (
          <div key={i} className="flex gap-2 py-1">
            <span className="text-muted-foreground">
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
            <span className={levelColors[log.level]}>
              [{log.level.toUpperCase()}]
            </span>
            <span className="text-foreground">{log.message}</span>
            {log.stack && (
              <button onClick={() => toggleStack(i)}>
                {expandedStacks.has(i) ? '▼' : '▶'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### UI Components

```
apps/admin/app/support/bug-reports/
├── page.tsx                    # Bug reports queue
├── [id]/
│   └── page.tsx               # Bug report detail
├── components/
│   ├── BugReportQueue.tsx
│   ├── BugReportFilters.tsx
│   ├── BugReportDetail.tsx
│   ├── ScreenshotViewer.tsx
│   ├── ConsoleLogViewer.tsx
│   ├── BrowserMetadata.tsx
│   ├── StatusDropdown.tsx
│   ├── StatusHistory.tsx
│   └── BugReportStats.tsx
└── hooks/
    ├── useBugReports.ts
    └── useBugReportDetail.ts
```

---

## Non-Goals (Phase 2+)

- Assign to specific admin
- Email response to user
- Integration with external issue trackers (Jira, Linear)
- Automated categorization
- Duplicate detection

---

## Dependencies

- EP-050: Admin Authentication
- EP-019: Report a Bug (existing feature in web app)
- Existing `bugReports` schema
- S3/R2 for screenshot storage

---

## Phase Checklist

- [ ] P1: Requirements (this epic)
- [ ] P2: Stories created
- [ ] P3: Architecture design
- [ ] P4: UI skeleton
- [ ] P5: Tech spec
- [ ] P6: Implementation
- [ ] P7: Testing
- [ ] P8: Integration
- [ ] P9: Deployment
- [ ] P10: Validation
