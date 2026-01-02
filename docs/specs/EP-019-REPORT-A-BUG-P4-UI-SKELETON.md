# EP-019 (P4) — Report a Bug: UI Skeleton

Working in **PHASE P4 (UI Skeleton)** on **EP-019, ST-001-ST-004**.

## Screens

### A1: Bug Report Modal (New)

- **Trigger**: "Report a Bug" button in bottom navigation
- **Auth required**: No (supports anonymous with email)
- **Purpose**: Allow users to report bugs with automatic screenshot and console log capture

---

## Navigation Placement

### Bottom Navigation (Mobile)

Add a new menu item to `libs/ui/src/components/bottom-nav.tsx`:

- **Label**: "Report Bug" (or shorter: "Bug")
- **Icon**: `Bug` or `AlertCircle` from lucide-react
- **Position**: 5th item (after Profile)
- **Action**: Opens bug report modal (no URL navigation)
- **Visibility**: Visible on all pages where bottom nav is shown (mobile only)

**Menu Items Order:**
1. My Influencers
2. [Add Button - center]
3. Studio
4. Profile
5. **Report Bug** (new)

---

## Components (Modal-Level)

### `BugReportModal`

Composition:

- `BugReportModal` (main container)
  - `Dialog` (from `@ryla/ui`)
  - `DialogHeader`
    - `DialogTitle`: "Report a Bug"
    - `DialogDescription`: "Help us improve by reporting issues you encounter"
  - `BugReportForm`
    - `DescriptionField` (textarea, required)
    - `EmailField` (input, optional, pre-filled if logged in)
    - `ScreenshotPreview` (conditional, if captured)
    - `ConsoleLogsPreview` (conditional, if captured)
    - `IncludeScreenshotCheckbox` (default: checked)
    - `IncludeLogsCheckbox` (default: checked)
    - `BrowserInfoDisplay` (read-only, collapsed by default)
  - `DialogFooter`
    - `CancelButton`
    - `SubmitButton` (disabled until description valid)

### `ScreenshotPreview`

- Thumbnail image (max 200px width)
- "Retake" button (optional, allows re-capture)
- File size indicator
- Loading state during capture
- Error state if capture failed

### `ConsoleLogsPreview`

- Log count badge (e.g., "42 logs captured")
- Expandable section to view logs
- Log level indicators (error = red, warn = yellow, etc.)
- "View logs" button (opens expandable section)
- Truncated preview (first 3-5 log entries)

### `BrowserInfoDisplay`

- Collapsed by default
- Expandable section showing:
  - User Agent
  - Current URL
  - Viewport size
  - Platform
  - Language
  - Timezone

---

## Interactions → API

### Open Modal

1. User clicks "Report a Bug" in bottom nav
2. **Before modal renders:**
   - Capture screenshot (hide modal temporarily if needed)
   - Get console logs from buffer
   - Get browser metadata
3. Modal opens with captured data
4. Analytics: `bug_report_modal_opened`

### Capture Screenshot

1. On modal open trigger (before modal visible)
2. Call `captureScreenshot({ excludeSelector: '[data-bug-report-modal]' })`
3. Store base64 data URL in component state
4. Show preview thumbnail in modal
5. Analytics: `bug_report_screenshot_captured` (with success/failure)

### Capture Console Logs

1. On modal open trigger
2. Call `getConsoleLogBuffer().getLogs()`
3. Store logs array in component state
4. Show log count in modal
5. Analytics: `bug_report_logs_captured` (with count)

### Form Validation

1. User types in description field
2. Real-time validation:
   - Min 10 characters
   - Show character count
   - Show error message if too short
3. Enable/disable submit button based on validation

### Submit Bug Report

1. User clicks "Submit Report"
2. Validate form:
   - Description ≥ 10 chars
   - Screenshot included if checkbox checked
   - Logs included if checkbox checked
3. Show loading state (disable form, show spinner)
4. Call `trpc.bugReport.submit.mutate({ ... })`
5. On success:
   - Show success message
   - Close modal after 2 seconds
   - Clear form state
   - Analytics: `bug_report_submitted` (success: true)
6. On error:
   - Show error message
   - Re-enable form
   - Analytics: `bug_report_submitted` (success: false)

### Cancel/Close

1. User clicks Cancel or X button
2. Close modal
3. Clear captured data (optional, or keep for retry)
4. No analytics event (user didn't submit)

### Retake Screenshot

1. User clicks "Retake" button
2. Hide modal temporarily
3. Capture new screenshot
4. Update preview
5. Analytics: `bug_report_screenshot_captured` (retake: true)

---

## States

### Initial (Modal Opening)

- **Screenshot**: Loading spinner
- **Console Logs**: Loading spinner
- **Form**: Disabled until capture complete
- **Submit**: Disabled

### Ready (Data Captured)

- **Screenshot**: Preview thumbnail shown
- **Console Logs**: Count badge shown
- **Form**: Enabled
- **Submit**: Enabled if description valid

### Submitting

- **Form**: Disabled (all inputs)
- **Submit**: Loading spinner, "Submitting..."
- **Cancel**: Disabled
- **Screenshot/Logs**: Read-only

### Success

- **Form**: Hidden
- **Message**: "Thank you! Your bug report has been submitted."
- **Auto-close**: After 2 seconds
- **Icon**: Checkmark or success indicator

### Error (Capture Failed)

- **Screenshot**: Error message "Screenshot capture failed"
- **Console Logs**: Error message "Console logs unavailable"
- **Form**: Still enabled (can submit without)
- **Warning**: "You can still submit without screenshot/logs"

### Error (Submission Failed)

- **Form**: Re-enabled
- **Message**: Error banner at top of modal
- **Submit**: Re-enabled
- **Retry**: User can fix and resubmit

### Validation Error

- **Description**: Red border, error message below field
- **Submit**: Disabled
- **Message**: "Description must be at least 10 characters"

---

## Component Structure

### File: `apps/web/components/bug-report/bug-report-modal.tsx`

```typescript
export interface BugReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string; // Pre-fill if logged in
}

export function BugReportModal({
  isOpen,
  onClose,
  userEmail,
}: BugReportModalProps) {
  // State
  const [description, setDescription] = useState('');
  const [email, setEmail] = useState(userEmail || '');
  const [includeScreenshot, setIncludeScreenshot] = useState(true);
  const [includeLogs, setIncludeLogs] = useState(true);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [consoleLogs, setConsoleLogs] = useState<LogEntry[]>([]);
  const [browserMetadata, setBrowserMetadata] = useState<BrowserMetadata | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Capture on open
  useEffect(() => {
    if (isOpen && !screenshot && !isCapturing) {
      captureData();
    }
  }, [isOpen]);

  // Validation
  const isDescriptionValid = description.length >= 10;
  const canSubmit = isDescriptionValid && !isSubmitting;

  // Handlers
  const handleSubmit = async () => { /* ... */ };
  const handleRetakeScreenshot = async () => { /* ... */ };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report a Bug</DialogTitle>
          <DialogDescription>
            Help us improve by reporting issues you encounter
          </DialogDescription>
        </DialogHeader>

        <BugReportForm
          description={description}
          onDescriptionChange={setDescription}
          email={email}
          onEmailChange={setEmail}
          includeScreenshot={includeScreenshot}
          onIncludeScreenshotChange={setIncludeScreenshot}
          includeLogs={includeLogs}
          onIncludeLogsChange={setIncludeLogs}
          screenshot={screenshot}
          onRetakeScreenshot={handleRetakeScreenshot}
          consoleLogs={consoleLogs}
          browserMetadata={browserMetadata}
          isCapturing={isCapturing}
          error={error}
        />

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit}
            loading={isSubmitting}
          >
            Submit Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

### File: `apps/web/components/bug-report/screenshot-preview.tsx`

```typescript
export interface ScreenshotPreviewProps {
  screenshot: string | null;
  isCapturing: boolean;
  onRetake?: () => void;
}

export function ScreenshotPreview({
  screenshot,
  isCapturing,
  onRetake,
}: ScreenshotPreviewProps) {
  if (isCapturing) {
    return <LoadingSpinner />;
  }

  if (!screenshot) {
    return <ErrorMessage>Failed to capture screenshot</ErrorMessage>;
  }

  return (
    <div className="relative">
      <img
        src={screenshot}
        alt="Screenshot preview"
        className="max-w-[200px] rounded-lg border border-white/10"
      />
      {onRetake && (
        <Button size="sm" onClick={onRetake} variant="outline">
          Retake
        </Button>
      )}
    </div>
  );
}
```

### File: `apps/web/components/bug-report/console-logs-preview.tsx`

```typescript
export interface ConsoleLogsPreviewProps {
  logs: LogEntry[];
  isCapturing: boolean;
}

export function ConsoleLogsPreview({
  logs,
  isCapturing,
}: ConsoleLogsPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isCapturing) {
    return <LoadingSpinner />;
  }

  if (logs.length === 0) {
    return <ErrorMessage>No console logs available</ErrorMessage>;
  }

  const errorCount = logs.filter((l) => l.level === 'error').length;
  const warnCount = logs.filter((l) => l.level === 'warn').length;

  return (
    <div>
      <div className="flex items-center gap-2">
        <Badge>{logs.length} logs captured</Badge>
        {errorCount > 0 && <Badge variant="destructive">{errorCount} errors</Badge>}
        {warnCount > 0 && <Badge variant="warning">{warnCount} warnings</Badge>}
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Hide' : 'View'} logs
        </Button>
      </div>

      {isExpanded && (
        <div className="mt-2 max-h-[200px] overflow-y-auto rounded-lg bg-black/20 p-3 font-mono text-xs">
          {logs.map((log, idx) => (
            <div key={idx} className={getLogLevelClass(log.level)}>
              <span className="text-white/40">
                {new Date(log.timestamp).toLocaleTimeString()}
              </span>
              <span className="ml-2">{log.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## Form Validation

### Description Field

- **Required**: Yes
- **Min length**: 10 characters
- **Max length**: 5000 characters (reasonable limit)
- **Validation**: Real-time as user types
- **Error message**: "Description must be at least 10 characters"
- **Character count**: Show "X / 10 minimum" or "X characters"

### Email Field

- **Required**: No
- **Validation**: Email format if provided
- **Pre-fill**: User email if logged in
- **Placeholder**: "your@email.com (optional)"

### Checkboxes

- **Include Screenshot**: Default checked
- **Include Logs**: Default checked
- **Behavior**: If unchecked, don't send that data (but still allow submission)

---

## Analytics Mapping (UI)

### Modal Events

- **Modal opened**: `bug_report_modal_opened`
  - Properties: `user_id?`, `page_url`, `is_authenticated`
- **Modal closed (without submit)**: No event (privacy)

### Capture Events

- **Screenshot captured**: `bug_report_screenshot_captured`
  - Properties: `user_id?`, `screenshot_size`, `success`, `retake?`
- **Console logs captured**: `bug_report_logs_captured`
  - Properties: `user_id?`, `log_count`, `has_errors`, `has_warnings`

### Submission Events

- **Bug report submitted**: `bug_report_submitted`
  - Properties: `user_id?`, `bug_report_id`, `has_screenshot`, `has_logs`, `description_length`, `success`, `error?`

### Interaction Events

- **Screenshot retake**: `bug_report_screenshot_retaken`
  - Properties: `user_id?`, `attempt_number`
- **Logs expanded**: `bug_report_logs_expanded`
  - Properties: `user_id?`, `log_count`

---

## Accessibility Notes

### Modal

- **Focus trap**: Focus stays within modal when open
- **Escape key**: Closes modal (unless submitting)
- **Backdrop click**: Closes modal (unless submitting)
- **ARIA labels**: 
  - `aria-labelledby` on DialogContent (points to DialogTitle)
  - `aria-describedby` on DialogContent (points to DialogDescription)

### Form Fields

- **Description textarea**: 
  - `aria-label`: "Bug description (required, minimum 10 characters)"
  - `aria-required`: true
  - `aria-invalid`: true if validation fails
  - `aria-describedby`: points to error message
- **Email input**:
  - `aria-label`: "Email address (optional, for follow-up)"
  - `type`: "email"
- **Checkboxes**:
  - Proper labels with `htmlFor` and `id`
  - `aria-describedby` for help text

### Buttons

- **Submit button**: 
  - `aria-busy`: true when submitting
  - Disabled state clearly communicated
- **Cancel button**: 
  - `aria-label`: "Close bug report modal"

### Screenshot Preview

- **Image**: `alt` text: "Screenshot preview for bug report"
- **Retake button**: `aria-label`: "Retake screenshot"

### Console Logs Preview

- **Expandable section**: 
  - `aria-expanded`: true/false
  - `aria-controls`: ID of logs container
- **Log entries**: 
  - Semantic structure (list or table)
  - Color coding not sole indicator (use icons/text too)

---

## Mobile Considerations

### Bottom Navigation

- **Position**: Fixed at bottom, z-index above modal
- **Modal**: Should appear above bottom nav (z-index: 60+)
- **Spacing**: Modal padding accounts for safe area (iOS notch)

### Modal Size

- **Mobile**: Full width minus padding (max-w-md)
- **Desktop**: Centered, max-w-lg
- **Height**: Max 90vh, scrollable content

### Form Fields

- **Textarea**: Auto-resize or fixed height with scroll
- **Inputs**: Large touch targets (min 44px height)
- **Buttons**: Full width on mobile, side-by-side on desktop

### Screenshot Preview

- **Mobile**: Full width, max 200px height
- **Desktop**: Constrained width, aspect ratio maintained

---

## Error Handling (UI)

### Screenshot Capture Failure

**Display:**
```
⚠️ Screenshot capture failed
You can still submit your bug report without a screenshot.
```

**Behavior:**
- Uncheck "Include screenshot" checkbox
- Allow submission without screenshot
- Show retry option

### Console Logs Capture Failure

**Display:**
```
⚠️ Console logs unavailable
You can still submit your bug report without logs.
```

**Behavior:**
- Uncheck "Include logs" checkbox
- Allow submission without logs
- No retry (logs are historical)

### Submission Failure

**Display:**
```
❌ Failed to submit bug report
[Error message from API]
Please try again or contact support.
```

**Behavior:**
- Keep form data (don't clear)
- Re-enable form
- Show retry button
- Log error for debugging

### Network Error

**Display:**
```
⚠️ Network error
Please check your connection and try again.
```

**Behavior:**
- Same as submission failure
- Suggest checking connection

---

## Loading States

### Initial Capture (Modal Opening)

- **Screenshot**: Spinner with "Capturing screenshot..."
- **Console Logs**: Spinner with "Collecting console logs..."
- **Form**: Disabled, grayed out
- **Overlay**: Slight dimming

### Submission

- **Form**: Disabled, grayed out
- **Submit button**: Spinner + "Submitting..."
- **Cancel**: Disabled
- **Overlay**: Slight dimming

### Retake Screenshot

- **Preview**: Replaced with spinner
- **Retake button**: Disabled
- **Message**: "Capturing new screenshot..."

---

## Success State

### After Successful Submission

**Display:**
```
✅ Thank you!
Your bug report has been submitted successfully.
We'll review it and get back to you if needed.
```

**Behavior:**
- Hide form
- Show success message
- Auto-close after 2 seconds
- Clear form state
- Analytics event fired

---

## Integration Points

### Bottom Navigation

**File**: `libs/ui/src/components/bottom-nav.tsx`

**Changes:**
- Add "Report Bug" to `menuItems` array
- Handle click to open modal (state management)
- Icon: `Bug` from lucide-react

### Modal State Management

**Options:**
1. **Local state** in bottom nav component (simple)
2. **Context/Provider** (if modal used elsewhere)
3. **Zustand store** (if complex state needed)

**Recommendation**: Start with local state, upgrade if needed.

### Console Log Buffer Initialization

**File**: `apps/web/app/layout.tsx` or root component

**Code:**
```typescript
import { initConsoleLogBuffer } from '@ryla/shared/utils/console-log-buffer';

// On app mount
useEffect(() => {
  initConsoleLogBuffer();
}, []);
```

### tRPC Client

**File**: `apps/web/lib/trpc/client.ts` (or wherever tRPC client is set up)

**Usage:**
```typescript
const submitBugReport = trpc.bugReport.submit.useMutation({
  onSuccess: () => {
    // Handle success
  },
  onError: (error) => {
    // Handle error
  },
});
```

---

## Design Tokens

### Colors

- **Success**: Green (`var(--green-500)`)
- **Error**: Red (`var(--red-500)`)
- **Warning**: Yellow (`var(--yellow-500)`)
- **Info**: Blue (`var(--blue-500)`)

### Spacing

- **Modal padding**: `p-6` (24px)
- **Form field gap**: `gap-4` (16px)
- **Button gap**: `gap-3` (12px)

### Typography

- **Title**: `text-lg font-semibold` (18px, semibold)
- **Description**: `text-sm text-zinc-400` (14px, gray)
- **Form label**: `text-sm font-medium` (14px, medium)
- **Error text**: `text-xs text-red-400` (12px, red)

---

## Next Steps (P5)

- File plan (exact file locations)
- Component imports and dependencies
- Task breakdown (TSK-XXX)
- Implementation order

