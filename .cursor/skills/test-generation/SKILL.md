---
name: test-generation
description: Generates unit, integration, and E2E tests following RYLA testing standards. Use when writing tests, creating test files, testing components, services, or when the user mentions testing, test coverage, or test generation.
---

# Test Generation

Generates comprehensive tests following RYLA testing standards for unit, integration, and E2E testing.

## Quick Start

When generating tests:

1. **Identify Test Type** - Unit, integration, or E2E
2. **Choose Framework** - Vitest for unit/integration, Playwright for E2E
3. **Follow Patterns** - Use MSW for frontend, pglite for backend
4. **Colocate Tests** - Place `.spec.ts` files next to source
5. **Write Tests** - Test behavior, not implementation

## Frameworks & Tools

- **Unit/Integration**: Vitest for all apps and libs
- **E2E**: Playwright for high-value flows
- **Backend Integration**: pglite for in-memory PostgreSQL tests
- **Mocking**: 
  - **Frontend**: Always use **MSW (Mock Service Worker)** for network mocking
  - **Drizzle**: Use `mockReturnThis()` for chainable query mocking in unit tests

## Test File Conventions

### File Naming

- **Extension**: Always use `.spec.ts` or `.spec.tsx`. DO NOT use `.test.ts`
- **Location**: Colocate tests with the source file
- **Naming**: Use descriptive `describe` (Component/Service name) and `it` (Behavior description)

### File Structure

```
libs/business/src/services/
├── character.service.ts
└── character.service.spec.ts  # Colocated test

apps/web/components/
├── CharacterCard.tsx
└── CharacterCard.spec.tsx  # Colocated test
```

## Mandatory Testing

- Every new Service in `libs/business` or `apps/api` MUST have a corresponding `.spec.ts` file
- Every new shared UI Component in `libs/ui` MUST have a corresponding `.spec.tsx` file for its core interactions

## Frontend Testing Patterns

### Component Testing

```typescript
// ✅ Good: Test component behavior with MSW
import { render, screen } from '@testing-library/react';
import { server } from '@/test/msw-server';
import { CharacterCard } from './CharacterCard';

describe('CharacterCard', () => {
  it('should display character name', async () => {
    server.use(
      rest.get('/api/characters/:id', (req, res, ctx) => {
        return res(ctx.json({ id: '1', name: 'Luna' }));
      })
    );

    render(<CharacterCard characterId="1" />);
    
    expect(await screen.findByText('Luna')).toBeInTheDocument();
  });
});
```

### Rules

- **NEVER mock `useQuery` or `useMutation` hooks directly** - This hides integration bugs
- **Mock at the Network Level**: Configure MSW handlers for API responses
- **Server Components**: Prefer testing underlying logic in libraries rather than testing the RSC output in unit tests

## Backend Testing Patterns

### Service Testing

```typescript
// ✅ Good: Integration test with pglite
import { createTestDb } from '@/test/utils/test-db';
import { CharacterService } from './character.service';

describe('CharacterService', () => {
  it('should create character', async () => {
    const { db } = await createTestDb();
    const service = new CharacterService(db);
    
    const character = await service.create({
      userId: 'user-1',
      name: 'Luna',
    });
    
    expect(character.name).toBe('Luna');
  });
});
```

### tRPC Procedure Testing

```typescript
// ✅ Good: Test procedure with mocked context
import { createCallerFactory } from '@ryla/trpc';
import { appRouter } from '@ryla/trpc';
import { characterRouter } from './character.router';

describe('characterRouter', () => {
  it('should create character', async () => {
    const createCaller = createCallerFactory(appRouter);
    const caller = createCaller({
      user: { id: 'user-1' },
      db: mockDb,
    });
    
    const result = await caller.character.create({ name: 'Luna' });
    expect(result.name).toBe('Luna');
  });
});
```

### Rules

- **Database Tests**: Prefer integration tests with `pglite` over extensive mocking of Drizzle repositories for business-critical logic
- **tRPC Procedures**: Test procedures by calling them directly with a mocked `context`
- **Chainable Mocks**: When unit testing Drizzle, ensure mocks handle the builder pattern (`.insert().values().returning()`)

## E2E Testing with Playwright

### Setup

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
  },
});
```

### Test Example

```typescript
// e2e/character-creation.spec.ts
import { test, expect } from '@playwright/test';

test('should create character', async ({ page }) => {
  await page.goto('/wizard');
  
  // Fill wizard steps
  await page.click('[data-testid="gender-male"]');
  await page.click('button:has-text("Next")');
  
  // Verify completion
  await expect(page.locator('text=Character Created')).toBeVisible();
});
```

## Test Structure

### Describe Blocks

```typescript
describe('ComponentName', () => {
  describe('when [condition]', () => {
    it('should [expected behavior]', () => {
      // Test implementation
    });
  });
});
```

### Test Naming

- Use `should [behavior]` format
- Be specific about conditions and expected outcomes
- Group related tests in `describe` blocks

## Running Tests

```bash
# Run all tests
pnpm nx run-many --target=test

# Run specific project
pnpm nx test <project-name>

# Run with coverage
pnpm nx test <project-name> --coverage

# Run E2E tests
pnpm nx e2e <project-name>
```

## Best Practices

### 1. Test Behavior, Not Implementation

```typescript
// ✅ Good: Test what user sees
expect(screen.getByText('Character Created')).toBeInTheDocument();

// ❌ Bad: Test implementation details
expect(component.state.character).toBeDefined();
```

### 2. Use Descriptive Test Names

```typescript
// ✅ Good
it('should display error message when API call fails', () => {});

// ❌ Bad
it('test error', () => {});
```

### 3. Keep Tests Isolated

```typescript
// ✅ Good: Each test is independent
beforeEach(() => {
  // Reset state
});

// ❌ Bad: Tests depend on each other
let sharedState;
```

### 4. Test Edge Cases

```typescript
// ✅ Good: Test null, empty, error states
it('should handle null character', () => {});
it('should handle empty array', () => {});
it('should handle API error', () => {});
```

### 5. Use MSW for Network Mocking

```typescript
// ✅ Good: MSW handler
server.use(
  rest.get('/api/characters', (req, res, ctx) => {
    return res(ctx.json([{ id: '1', name: 'Luna' }]));
  })
);

// ❌ Bad: Mock fetch directly
global.fetch = jest.fn(() => Promise.resolve({ json: () => ({}) }));
```

## Common Patterns

### Testing Async Operations

```typescript
it('should load data', async () => {
  render(<Component />);
  
  // Wait for async operation
  expect(await screen.findByText('Loaded')).toBeInTheDocument();
});
```

### Testing User Interactions

```typescript
it('should submit form', async () => {
  const { user } = render(<Form />);
  
  await user.type(screen.getByLabelText('Name'), 'Luna');
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  
  expect(await screen.findByText('Success')).toBeInTheDocument();
});
```

### Testing Error States

```typescript
it('should display error', async () => {
  server.use(
    rest.get('/api/characters', (req, res, ctx) => {
      return res(ctx.status(500), ctx.json({ error: 'Server error' }));
    })
  );
  
  render(<Component />);
  expect(await screen.findByText('Server error')).toBeInTheDocument();
});
```

## Related Resources

- **Testing Standards**: `.cursor/rules/testing-standards.mdc`
- **Test Fixtures**: `.cursor/rules/test-fixtures.mdc`
- **Test Credentials**: `.cursor/rules/test-credentials.mdc`
- **Best Practices**: `docs/testing/BEST-PRACTICES.md`
