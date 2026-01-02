# EP-019 (P6) — Report a Bug: Implementation

Working in **PHASE P6 (Implementation)** on **EP-019, ST-001-ST-004**.

## Implementation Status

### Completed Tasks

- [ ] TSK-EP019-001: Add "Report Bug" to bottom navigation
- [ ] TSK-EP019-002: Create bug reports database schema
- [ ] TSK-EP019-003: Implement console log buffer utility
- [ ] TSK-EP019-004: Implement screenshot capture utility
- [ ] TSK-EP019-005: Create bug reports repository
- [ ] TSK-EP019-006: Create bug report service
- [ ] TSK-EP019-007: Create bug report tRPC router
- [ ] TSK-EP019-008: Build bug report modal component
- [ ] TSK-EP019-009: Build screenshot preview component
- [ ] TSK-EP019-010: Build console logs preview component
- [ ] TSK-EP019-011: Build browser info display component
- [ ] TSK-EP019-012: Wire modal to tRPC submission
- [ ] TSK-EP019-013: Implement screenshot capture on modal open
- [ ] TSK-EP019-014: Add analytics tracking

---

## Implementation Notes

### Database Migration

**File**: `drizzle/migrations/XXXX-bug-reports.sql`

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

### Console Log Buffer Initialization

**File**: `apps/web/app/layout.tsx` (or appropriate root component)

```typescript
'use client';

import { useEffect } from 'react';
import { initConsoleLogBuffer } from '@ryla/shared/utils/console-log-buffer';

export default function RootLayout({ children }) {
  useEffect(() => {
    // Initialize console log buffer on app startup
    initConsoleLogBuffer();
  }, []);

  return <>{children}</>;
}
```

### Bottom Navigation Update

**File**: `libs/ui/src/components/bottom-nav.tsx`

Key changes:
- Import `Bug` icon from lucide-react
- Add modal state management
- Add "Report Bug" menu item
- Handle click to open modal

### Screenshot Capture Strategy

**Recommendation**: Capture screenshot before modal opens

1. User clicks "Report Bug"
2. Immediately capture screenshot (modal not yet visible)
3. Store screenshot in state
4. Open modal with preview

Alternative (if needed): Hide modal temporarily, capture, show modal.

### Error Handling

**Screenshot capture fails:**
- Show warning message
- Uncheck "Include screenshot" checkbox
- Allow submission without screenshot
- Log error for debugging

**Console logs unavailable:**
- Show warning message
- Uncheck "Include logs" checkbox
- Allow submission without logs
- No retry (logs are historical)

**Submission fails:**
- Show error message with details
- Keep form data (don't clear)
- Re-enable form
- Allow retry

### Storage Considerations

**Screenshot storage:**
- Path: `bug-reports/{timestamp}-{randomId}.png`
- Compression: PNG quality 0.8, scale 0.5
- Size limit: 5MB (base64)
- Access: Public URLs (or signed if needed)

**Console logs storage:**
- Format: JSONB array
- Size limit: 1MB (JSON stringified)
- Filtering: Sensitive data removed before storage

---

## Code Review Checklist

### Data Layer
- [ ] Schema matches P3 architecture
- [ ] Migration runs successfully
- [ ] Repository methods tested
- [ ] Types exported correctly

### Utilities
- [ ] Console log buffer captures all log levels
- [ ] Sensitive data filtering works correctly
- [ ] Screenshot capture handles errors gracefully
- [ ] Screenshot compression reduces file size

### Business Layer
- [ ] Service handles screenshot upload errors
- [ ] Service creates bug report correctly
- [ ] Error messages are clear

### API Layer
- [ ] tRPC router validates input correctly
- [ ] Size limits enforced
- [ ] Error responses are clear
- [ ] Supports anonymous submissions

### UI Components
- [ ] Modal opens/closes correctly
- [ ] Form validation works
- [ ] Screenshot preview displays correctly
- [ ] Console logs preview works
- [ ] Browser info displays correctly
- [ ] Loading states show appropriately
- [ ] Error states show appropriately
- [ ] Success state works

### Integration
- [ ] Bottom nav entry visible
- [ ] Modal opens from bottom nav
- [ ] Screenshot captured on open
- [ ] Console logs captured on open
- [ ] Submission works end-to-end
- [ ] Analytics events fire correctly

---

## Self-Review Checklist

### Functionality
- [ ] All acceptance criteria met
- [ ] Error handling works
- [ ] Loading states work
- [ ] Success states work
- [ ] Form validation works

### Code Quality
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Code follows project conventions
- [ ] Comments added where needed
- [ ] Types are correct

### Performance
- [ ] Screenshot capture is fast (< 2s)
- [ ] Modal opens quickly
- [ ] Form is responsive
- [ ] No memory leaks

### Security
- [ ] Sensitive data filtered from logs
- [ ] Input validation on backend
- [ ] File size limits enforced
- [ ] SQL injection prevented (Drizzle)

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader support
- [ ] ARIA labels present
- [ ] Focus management correct

---

## Known Issues / TODOs

- [ ] Screenshot capture may be slow on large pages
- [ ] Console log buffer may grow large over time (consider cleanup)
- [ ] Screenshot storage costs (monitor usage)
- [ ] Rate limiting not implemented (consider for Phase 2)

---

## Next Steps

1. Complete all tasks
2. Self-review code
3. Fix any issues
4. Proceed to P7 (Testing)

