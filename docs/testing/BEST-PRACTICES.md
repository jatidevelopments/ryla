# RYLA Testing Best Practices

This document outlines the testing standards and best practices for the RYLA monorepo.

## 🧪 Testing Pyramid

We follow a classic testing pyramid with a focus on fast, reliable unit tests and critical E2E flows.

1.  **Unit Tests (Vitest)**: Fast, isolated tests for individual functions, hooks, and components.
2.  **Integration Tests (Vitest)**: Testing how multiple components or services work together.
3.  **E2E Tests (Playwright)**: testing high-value user journeys (Login, Character Creation, Checkout).

---

## 🛠 Unit & Integration Testing (Vitest)

We use **Vitest** for all unit and integration tests across both Frontend and Backend.

### File Naming & Placement

- Tests must be colocated with the source code.
- File extension: `*.spec.ts` or `*.spec.tsx`.
- Example: `libs/shared/src/utils/math.ts` -> `libs/shared/src/utils/math.spec.ts`.

### Best Practices

- **Isolation**: Each test should be independent. Reset mocks and state between tests.
- **Mocking**:
  - Use `vi.mock()` for internal dependencies.
  - Use **MSW (Mock Service Worker)** for mocking API calls in frontend tests.
- **Naming**: Use descriptive `describe` and `it` blocks.
  - `it('should return 4 when 2+2 is called')` is better than `it('works')`.
- **AAA Pattern**: Arrange, Act, Assert.

```typescript
import { describe, it, expect, vi } from 'vitest';
import { calculateTotal } from './math';

describe('calculateTotal', () => {
  it('should calculate the sum of items', () => {
    // Arrange
    const items = [{ price: 10 }, { price: 20 }];

    // Act
    const result = calculateTotal(items);

    // Assert
    expect(result).toBe(30);
  });
});
```

---

## 🎭 E2E Testing (Playwright)

We use **Playwright** for end-to-end testing of critical flows.

### Best Practices

- **Focus on Business Value**: Don't test every edge case in E2E; focus on the main happy paths and critical failure modes.
- **Use Page Objects**: Abstract page-specific logic into Page Object Models (POM).
- **Stable Locators**: Use `data-testid` or accessible labels instead of CSS classes or brittle selectors.
- **Clean State**: Ensure tests start with a known state (e.g., using a test user account).

## 🏢 Integration & Unit Testing per Tech Stack

### Frontend (Next.js 14, React, TanStack Query)

#### App Router Considerations

- **Client Components**: Test using `vitest` + `@testing-library/react`. Mock hooks like `useParams` when necessary.
- **Server Components**: Focus on testing the underlying logic (services/repositories). RSCs are best tested via Playwright E2E or by extracting logic into testable functions.

#### Mocking with MSW (Mock Service Worker)

- **Rule**: Never mock `useQuery` or `useMutation` directly.
- **Practice**: Mock the network layer using MSW. This ensures you test the full integration between the hook and the component logic.
- MSW handlers should be shared across the workspace in a `test-utils` or project-specific mock folder.

#### Web App Specifics

- **Config**: `apps/web/vitest.config.ts`
- **Setup**: `apps/web/src/test/setup.tsx` (Use for global mocks like `next/navigation`)
- **Environment**: `jsdom`
- **Commands**: `pnpm nx test web`

### Backend (NestJS, Drizzle ORM)

#### Database Integration with `pglite`

- For tests requiring a database, use **pglite**. It is a WASM-powered in-memory PostgreSQL.
- **Benefits**: No Docker requirement, sub-second startup, separate database instance per test file.
- **Setup**: Use `drizzle-kit push` to sync the schema to the pglite instance in a global setup or `beforeAll` block.

#### Unit Testing Services

- Mock the Drizzle database instance for unit tests.
- For chainable Drizzle queries, use `mockReturnThis()`:
  ```typescript
  const mockDb = {
    insert: vi.fn().mockReturnThis(),
    values: vi.fn().mockReturnThis(),
    returning: vi.fn().mockResolvedValue([{ id: 1 }]),
  };
  ```

### API Layer (tRPC)

- **Direct Testing**: Call procedures directly by passing a mocked context object.
- **Type Safety**: Rely on tRPC's shared types. If the test compiles, the payload structure is guaranteed to match the API.

---

## 📊 Coverage Requirements

- **Business Logic**: 80%+ coverage for `libs/business` and `apps/api/src/services`.
- **UI Components**: Focus on interaction logic rather than snapshot testing.
- **Prerendering**: Ensure tests cover both SSR and Client-side behavior where applicable.

---

## 🚀 Running Tests

- Run all tests: `pnpm nx run-many --target=test`
- Run specific project: `pnpm nx test <project-name>`
- Watch mode: `pnpm nx test <project-name> --watch`
