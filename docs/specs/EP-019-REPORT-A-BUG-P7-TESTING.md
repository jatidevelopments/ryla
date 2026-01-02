# EP-019 (P7) — Report a Bug: Testing

Working in **PHASE P7 (Testing)** on **EP-019, ST-001-ST-004**.

## Testing Strategy

### Unit Tests
- Console log buffer
- Screenshot capture utility
- Sensitive data filtering
- Form validation
- Repository methods
- Service methods

### Integration Tests
- Bug report API endpoint
- Screenshot upload to S3
- Database operations
- Error handling

### E2E Tests (Playwright)
- User flow: open modal → fill form → submit
- Screenshot capture
- Console log capture
- Error scenarios
- Success scenarios

---

## Unit Tests

### Console Log Buffer

**File**: `libs/shared/src/utils/__tests__/console-log-buffer.test.ts`

```typescript
describe('ConsoleLogBuffer', () => {
  it('should capture console.log calls', () => {
    // Test log capture
  });

  it('should capture console.error calls with stack', () => {
    // Test error capture
  });

  it('should filter sensitive data from logs', () => {
    // Test filtering
  });

  it('should limit log buffer size', () => {
    // Test max size limit
  });

  it('should filter JWT tokens', () => {
    // Test JWT filtering
  });

  it('should filter API keys', () => {
    // Test API key filtering
  });
});
```

### Screenshot Capture

**File**: `libs/shared/src/utils/__tests__/screenshot-capture.test.ts`

```typescript
describe('Screenshot Capture', () => {
  it('should capture screenshot successfully', async () => {
    // Test capture
  });

  it('should compress screenshot', async () => {
    // Test compression
  });

  it('should handle capture errors', async () => {
    // Test error handling
  });

  it('should exclude elements by selector', async () => {
    // Test exclusion
  });
});
```

### Repository

**File**: `libs/data/src/repositories/__tests__/bug-reports.repository.test.ts`

```typescript
describe('BugReportsRepository', () => {
  it('should create bug report', async () => {
    // Test creation
  });

  it('should find bug report by id', async () => {
    // Test findById
  });

  it('should list bug reports by user id', async () => {
    // Test listByUserId
  });

  it('should update status', async () => {
    // Test updateStatus
  });
});
```

### Service

**File**: `libs/business/src/services/__tests__/bug-report.service.test.ts`

```typescript
describe('BugReportService', () => {
  it('should create bug report with screenshot', async () => {
    // Test creation with screenshot upload
  });

  it('should create bug report without screenshot', async () => {
    // Test creation without screenshot
  });

  it('should handle screenshot upload failure', async () => {
    // Test error handling
  });
});
```

### Form Validation

**File**: `apps/web/components/bug-report/__tests__/bug-report-modal.test.tsx`

```typescript
describe('BugReportModal', () => {
  it('should validate description min length', () => {
    // Test validation
  });

  it('should validate email format', () => {
    // Test email validation
  });

  it('should enable submit when valid', () => {
    // Test submit button state
  });
});
```

---

## Integration Tests

### API Endpoint

**File**: `apps/api/src/modules/bug-report/__tests__/bug-report.integration.test.ts`

```typescript
describe('Bug Report API', () => {
  it('should submit bug report successfully', async () => {
    // Test successful submission
  });

  it('should validate input', async () => {
    // Test validation
  });

  it('should enforce size limits', async () => {
    // Test size limits
  });

  it('should handle screenshot upload', async () => {
    // Test screenshot upload
  });

  it('should handle storage errors', async () => {
    // Test error handling
  });
});
```

### Database Operations

**File**: `libs/data/src/repositories/__tests__/bug-reports.integration.test.ts`

```typescript
describe('Bug Reports Repository Integration', () => {
  it('should create and retrieve bug report', async () => {
    // Test full cycle
  });

  it('should handle user deletion cascade', async () => {
    // Test cascade delete
  });
});
```

---

## E2E Tests (Playwright)

### Basic Flow

**File**: `apps/web/__e2e__/bug-report.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Bug Report', () => {
  test('should open modal from bottom navigation', async ({ page }) => {
    // Navigate to page
    await page.goto('/dashboard');
    
    // Click "Report Bug" in bottom nav
    await page.click('[data-testid="bug-report-nav-item"]');
    
    // Verify modal opens
    await expect(page.locator('[data-testid="bug-report-modal"]')).toBeVisible();
  });

  test('should capture screenshot on modal open', async ({ page }) => {
    // Open modal
    await page.click('[data-testid="bug-report-nav-item"]');
    
    // Wait for screenshot capture
    await page.waitForSelector('[data-testid="screenshot-preview"]', { timeout: 5000 });
    
    // Verify screenshot preview exists
    await expect(page.locator('[data-testid="screenshot-preview"] img')).toBeVisible();
  });

  test('should capture console logs on modal open', async ({ page }) => {
    // Generate some console logs
    await page.evaluate(() => {
      console.log('Test log');
      console.error('Test error');
    });
    
    // Open modal
    await page.click('[data-testid="bug-report-nav-item"]');
    
    // Verify logs captured
    await expect(page.locator('[data-testid="console-logs-preview"]')).toContainText('2 logs');
  });

  test('should submit bug report successfully', async ({ page }) => {
    // Open modal
    await page.click('[data-testid="bug-report-nav-item"]');
    
    // Fill form
    await page.fill('[data-testid="description-input"]', 'This is a test bug report with enough characters');
    await page.fill('[data-testid="email-input"]', 'test@example.com');
    
    // Submit
    await page.click('[data-testid="submit-button"]');
    
    // Verify success message
    await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
    
    // Verify modal closes
    await expect(page.locator('[data-testid="bug-report-modal"]')).not.toBeVisible();
  });

  test('should validate description length', async ({ page }) => {
    // Open modal
    await page.click('[data-testid="bug-report-nav-item"]');
    
    // Fill short description
    await page.fill('[data-testid="description-input"]', 'Short');
    
    // Verify submit disabled
    await expect(page.locator('[data-testid="submit-button"]')).toBeDisabled();
    
    // Verify error message
    await expect(page.locator('[data-testid="description-error"]')).toContainText('at least 10 characters');
  });

  test('should handle screenshot capture failure', async ({ page }) => {
    // Mock screenshot capture failure
    await page.route('**/capture-screenshot', route => route.abort());
    
    // Open modal
    await page.click('[data-testid="bug-report-nav-item"]');
    
    // Verify warning message
    await expect(page.locator('[data-testid="screenshot-error"]')).toBeVisible();
    
    // Verify can still submit
    await page.fill('[data-testid="description-input"]', 'This is a test bug report');
    await expect(page.locator('[data-testid="submit-button"]')).toBeEnabled();
  });

  test('should handle submission failure', async ({ page }) => {
    // Mock API failure
    await page.route('**/api/trpc/bugReport.submit', route => route.fulfill({
      status: 500,
      body: JSON.stringify({ error: 'Internal server error' }),
    }));
    
    // Open modal and fill form
    await page.click('[data-testid="bug-report-nav-item"]');
    await page.fill('[data-testid="description-input"]', 'This is a test bug report');
    await page.click('[data-testid="submit-button"]');
    
    // Verify error message
    await expect(page.locator('[data-testid="error-message"]')).toBeVisible();
    
    // Verify form still enabled
    await expect(page.locator('[data-testid="submit-button"]')).toBeEnabled();
  });
});
```

---

## Test Coverage Goals

### Unit Tests
- **Target**: >80% coverage
- **Focus**: Business logic, utilities, repositories

### Integration Tests
- **Target**: All API endpoints
- **Focus**: End-to-end data flow

### E2E Tests
- **Target**: Critical user flows
- **Focus**: Happy path + error scenarios

---

## Test Data

### Test Bug Reports

```typescript
const testBugReport = {
  description: 'Test bug report with sufficient length to pass validation',
  email: 'test@example.com',
  includeScreenshot: true,
  includeLogs: true,
  browserMetadata: {
    userAgent: 'Mozilla/5.0 (Test)',
    url: 'http://localhost:3000/test',
    viewport: { width: 1920, height: 1080 },
    platform: 'Test',
    language: 'en-US',
    timezone: 'UTC',
  },
};
```

### Mock Screenshot

```typescript
const mockScreenshot = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
```

### Mock Console Logs

```typescript
const mockConsoleLogs = [
  {
    level: 'log',
    timestamp: Date.now(),
    message: 'Test log message',
  },
  {
    level: 'error',
    timestamp: Date.now(),
    message: 'Test error message',
    stack: 'Error: Test error\n    at test.js:1:1',
  },
];
```

---

## Manual Testing Checklist

### Functionality
- [ ] Bottom nav "Report Bug" visible
- [ ] Modal opens on click
- [ ] Screenshot captured automatically
- [ ] Console logs captured automatically
- [ ] Form validation works
- [ ] Submit button enables/disables correctly
- [ ] Submission works
- [ ] Success message shows
- [ ] Modal closes after success
- [ ] Error handling works

### Edge Cases
- [ ] Very long description (5000 chars)
- [ ] Screenshot capture fails
- [ ] Console logs unavailable
- [ ] Network error during submission
- [ ] Large screenshot (>5MB)
- [ ] Many console logs (>1MB)
- [ ] Anonymous user (no email)
- [ ] Logged in user (email pre-filled)

### Browser Compatibility
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile Safari
- [ ] Mobile Chrome

### Accessibility
- [ ] Keyboard navigation works
- [ ] Screen reader announces correctly
- [ ] Focus management correct
- [ ] ARIA labels present
- [ ] Color contrast sufficient

---

## Performance Testing

### Screenshot Capture
- [ ] Capture time < 2 seconds
- [ ] File size < 500KB
- [ ] Memory usage acceptable

### Console Log Buffer
- [ ] Buffer size limited (200 entries)
- [ ] Memory usage acceptable
- [ ] Filtering doesn't slow down

### Submission
- [ ] Submission time < 5 seconds
- [ ] No UI freezing
- [ ] Loading states show correctly

---

## Security Testing

### Sensitive Data Filtering
- [ ] JWT tokens filtered
- [ ] API keys filtered
- [ ] Passwords filtered
- [ ] Email addresses in suspicious context filtered

### Input Validation
- [ ] Description length validated
- [ ] Email format validated
- [ ] Screenshot size limited
- [ ] Console logs size limited
- [ ] SQL injection prevented

---

## Next Steps

1. Write unit tests
2. Write integration tests
3. Write E2E tests
4. Run all tests
5. Fix any failures
6. Achieve coverage goals
7. Proceed to P8 (Integration)

