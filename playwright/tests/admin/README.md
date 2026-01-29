# Admin Panel E2E Tests

End-to-end tests for the RYLA Admin Panel using Playwright.

## Setup

### Prerequisites

1. Admin app must be running:
   ```bash
   pnpm nx serve admin
   # Or with Infisical:
   infisical run --path=/apps/admin --env=dev -- pnpm nx serve admin
   ```

2. Default admin credentials (development):
   - Email: `admin@ryla.ai`
   - Password: `admin123`

### Configuration

The admin app runs on port **3004** by default. Tests use this port unless overridden:

```bash
# Set custom base URL
export PLAYWRIGHT_ADMIN_BASE_URL=http://localhost:3004

# Run tests
npx playwright test tests/admin
```

## Test Suites

### 1. Login Journey (`login.spec.ts`)
- Successful login flow
- Invalid credentials handling
- Return URL redirect
- Password visibility toggle
- Loading states

### 2. User Management Journey (`user-management.spec.ts`)
- Navigate to users page
- Search functionality
- Status filtering
- User detail view
- Pagination

### 3. Content Moderation Journey (`content-moderation.spec.ts`)
- Navigate to content page
- Image search
- Status filtering
- View mode toggle (grid/list)
- Image detail modal
- Modal interactions

## Running Tests

```bash
# Run all admin E2E tests
npx playwright test tests/admin

# Run specific test file
npx playwright test tests/admin/login.spec.ts

# Run in headed mode (see browser)
npx playwright test tests/admin --headed

# Run with UI mode
npx playwright test tests/admin --ui
```

## Test Data

Tests assume:
- Admin user exists with credentials: `admin@ryla.ai` / `admin123`
- Test data may or may not exist (tests handle both cases)
- Database is accessible and migrations are applied

## Notes

- Tests use `test.skip()` when required data doesn't exist
- Some tests may need test data setup for full coverage
- Tests are designed to be resilient to missing data
