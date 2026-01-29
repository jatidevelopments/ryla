# EP-062: Unit Test Infrastructure & Coverage - Architecture

**Epic**: [EP-062: Unit Test Infrastructure & Coverage](../requirements/epics/mvp/EP-062-unit-test-infrastructure-coverage.md)  
**Initiative**: [IN-026: Comprehensive Testing Implementation](../../initiatives/IN-026-comprehensive-testing-implementation.md)  
**Phase**: P3 - Architecture  
**Status**: In Progress  
**Created**: 2026-01-27  
**Last Updated**: 2026-01-27

---

## Overview

Architecture for comprehensive unit test infrastructure and coverage across the RYLA monorepo. This document defines the test infrastructure structure, patterns, and organization to achieve 80%+ test coverage for business logic, UI components, and tRPC routers.

---

## Functional Architecture

### Test Infrastructure Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Test Execution                         │
│  (Vitest, CI/CD, Coverage Reporting)                     │
└─────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼──────┐  ┌─────────▼────────┐  ┌─────▼──────┐
│ Unit Tests   │  │ Integration Tests │  │ E2E Tests   │
│ (70%)        │  │ (20%)             │  │ (10%)       │
└───────┬──────┘  └─────────┬─────────┘  └─────┬──────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
        ┌───────────────────▼───────────────────┐
        │      Test Infrastructure              │
        │  (Utilities, Fixtures, Helpers)       │
        └───────────────────────────────────────┘
                            │
        ┌───────────────────▼───────────────────┐
        │      Test Frameworks & Tools           │
        │  (Vitest, MSW, pglite, Mocking)       │
        └───────────────────────────────────────┘
```

### Test Organization by App/Lib

```
apps/
├── web/
│   ├── lib/
│   │   └── test/
│   │       ├── utils/          # Test utilities
│   │       ├── fixtures/       # Test data factories
│   │       └── setup.ts        # Global setup
│   └── components/
│       └── *.spec.tsx         # Component tests
├── api/
│   ├── src/
│   │   ├── test/
│   │   │   ├── utils/
│   │   │   ├── fixtures/
│   │   │   └── setup.ts
│   │   └── modules/
│   │       └── */services/
│   │           └── *.spec.ts  # Service tests
│   └── lib/
│       └── trpc/
│           └── routers/
│               └── *.router.spec.ts
├── admin/
│   └── lib/
│       ├── test/
│       │   ├── utils/
│       │   ├── fixtures/
│       │   └── setup.ts
│       └── trpc/
│           └── routers/
│               └── *.router.spec.ts
└── ...

libs/
├── business/
│   └── src/
│       └── services/
│           └── *.spec.ts      # Service tests
├── ui/
│   └── src/
│       └── components/
│           └── *.spec.tsx     # Component tests
├── shared/
│   └── src/
│       └── utils/
│           └── *.spec.ts      # Utility tests
└── ...
```

---

## Data Model

### Test Data Structure

**Test Fixtures:**
- User fixtures (admin, regular, pro users)
- Influencer fixtures (with DNA, images)
- Image fixtures (generated images, metadata)
- Payment fixtures (subscriptions, transactions)
- Job fixtures (generation jobs, status)

**Test Factories:**
- `createTestUser(options)` - Create user with optional overrides
- `createTestInfluencer(options)` - Create influencer with DNA
- `createTestImage(options)` - Create image with metadata
- `createTestJob(options)` - Create generation job
- `createTestSubscription(options)` - Create subscription

### Database Test Setup

**pglite Integration:**
- In-memory PostgreSQL for integration tests
- Schema sync using `drizzle-kit push`
- Separate database instance per test file
- Automatic cleanup after tests

**Mock Database (Unit Tests):**
- Chainable mocks for Drizzle queries
- `mockReturnThis()` pattern for builder methods
- Mocked return values for queries

---

## API Contracts

### Test Utilities API

**Test Database (`test-db.ts`):**
```typescript
export async function setupTestDb(): Promise<PGlite>
export async function teardownTestDb(db: PGlite): Promise<void>
export async function resetTestDb(db: PGlite): Promise<void>
```

**Test Context (`test-context.ts`):**
```typescript
export function createMockContext(options?: {
  userId?: string
  role?: string
  permissions?: string[]
}): Context

export function createAdminContext(): Context
export function createUserContext(userId: string): Context
```

**Test Helpers (`test-helpers.ts`):**
```typescript
export function waitFor(condition: () => boolean, timeout?: number): Promise<void>
export function createMockRequest(options?: Partial<Request>): Request
export function createMockResponse(): Response
```

### MSW Handlers API

**Frontend Network Mocking:**
```typescript
// handlers.ts
export const handlers = [
  rest.get('/api/users/:id', (req, res, ctx) => {
    return res(ctx.json({ id: req.params.id, name: 'Test User' }))
  }),
  // ... more handlers
]

// setup.ts
export function setupMSW() {
  const server = setupServer(...handlers)
  beforeAll(() => server.listen())
  afterEach(() => server.resetHandlers())
  afterAll(() => server.close())
}
```

---

## Component Architecture

### Test File Structure

**Service Test (`*.service.spec.ts`):**
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ServiceName } from './service-name'

describe('ServiceName', () => {
  beforeEach(() => {
    // Reset mocks
  })

  describe('methodName', () => {
    it('should [behavior] when [condition]', async () => {
      // Arrange
      // Act
      // Assert
    })
  })
})
```

**Component Test (`*.spec.tsx`):**
```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ComponentName } from './component-name'
import { setupMSW } from '@/test/setup'

setupMSW()

describe('ComponentName', () => {
  it('should [behavior] when [condition]', () => {
    // Arrange
    // Act
    // Assert
  })
})
```

**Router Test (`*.router.spec.ts`):**
```typescript
import { describe, it, expect, vi } from 'vitest'
import { createMockContext } from '@/test/utils/test-context'
import { router } from './router'

describe('RouterName', () => {
  const ctx = createMockContext()

  describe('procedureName', () => {
    it('should [behavior] when [condition]', async () => {
      // Arrange
      // Act
      const result = await router.procedureName.query({ /* input */ }, ctx)
      // Assert
      expect(result).toEqual(/* expected */)
    })
  })
})
```

---

## Event Schema

### Test Execution Events

**Coverage Events:**
- `test_coverage_calculated` - Coverage report generated
- `test_coverage_threshold_met` - Coverage threshold reached
- `test_coverage_threshold_failed` - Coverage below threshold

**Test Execution Events:**
- `test_suite_started` - Test suite execution started
- `test_suite_completed` - Test suite execution completed
- `test_failed` - Individual test failed
- `test_passed` - Individual test passed

**Note**: These are internal events for monitoring test health, not user-facing analytics events.

---

## Funnel Definitions

### Test Coverage Funnel

```
All Code
  ↓
Code with Tests (Target: 80%+)
  ↓
Tests Passing (Target: 95%+)
  ↓
Coverage Threshold Met (Target: 80%+)
```

### Test Development Funnel

```
Write Test
  ↓
Test Passes Locally
  ↓
Test Passes in CI/CD
  ↓
Coverage Increases
```

---

## Technical Decisions

### Testing Framework: Vitest

**Rationale:**
- Fast execution (Vite-powered)
- Compatible with Jest API
- Good TypeScript support
- Already configured in monorepo

### Network Mocking: MSW

**Rationale:**
- Intercepts at network level (not hook level)
- Tests real integration between hooks and components
- Prevents hiding integration bugs
- Industry standard for React testing

### Database Testing: pglite

**Rationale:**
- In-memory PostgreSQL (real database)
- No Docker required
- Fast startup (< 1s)
- Separate instance per test file (isolation)

### Coverage Tool: Vitest Coverage

**Rationale:**
- Built into Vitest
- Supports multiple providers (v8, istanbul)
- CI/CD integration
- Threshold enforcement

---

## Dependencies

### Internal Dependencies

- `@ryla/shared` - Shared utilities and types
- `@ryla/business` - Business logic services
- `@ryla/data` - Data access layer
- `@ryla/ui` - UI components

### External Dependencies

- `vitest` - Test framework
- `@testing-library/react` - React component testing
- `@testing-library/jest-dom` - DOM matchers
- `msw` - Mock Service Worker
- `pglite` - In-memory PostgreSQL
- `@vitest/coverage-v8` - Coverage provider

---

## Non-Functional Requirements

### Performance

- Unit test execution: **< 5 minutes** for full suite
- Individual test file: **< 1 second** average
- Test startup: **< 100ms** per test file
- Coverage calculation: **< 30 seconds**

### Reliability

- Test pass rate: **95%+** in CI/CD
- Flaky test rate: **< 1%**
- Test isolation: Tests must not depend on execution order
- Test cleanup: All mocks and state reset between tests

### Maintainability

- Test code follows same standards as production code
- Tests are self-documenting (clear names, comments)
- Test utilities are reusable across projects
- Test patterns documented with examples

---

## Security Considerations

### Test Data

- No production data in tests
- Test credentials clearly marked as test-only
- Sensitive data mocked, not hardcoded
- Test databases isolated from production

### Test Execution

- Tests run in isolated environment
- No network calls to production services
- External services mocked
- Test secrets in test environment only

---

## Migration Strategy

### Phase 1: Infrastructure (Week 1-2)

1. Create test utilities and fixtures
2. Set up MSW for frontend tests
3. Set up pglite for database tests
4. Configure coverage reporting
5. Document patterns and examples

### Phase 2: Critical Paths (Week 3-4)

1. Test critical business logic (auth, payments, generation)
2. Test shared UI components
3. Test tRPC routers
4. Achieve 50%+ coverage

### Phase 3: Expansion (Week 5-6)

1. Test remaining business logic
2. Test remaining UI components
3. Test utilities and helpers
4. Achieve 80%+ coverage

### Phase 4: Maintenance (Ongoing)

1. Write tests alongside new code
2. Maintain coverage thresholds
3. Refactor tests as needed
4. Update patterns based on learnings

---

## Open Questions

1. **Coverage Thresholds**: Should different areas have different thresholds? (e.g., 90% for business logic, 70% for UI)
   - **Decision**: 80% for business logic, 80% for UI components, 80% for routers

2. **Test Data Management**: How to handle test data that needs to persist across test files?
   - **Decision**: Use fixtures and factories, reset between test files

3. **Integration Test Scope**: What level of integration testing is needed?
   - **Decision**: Database operations with pglite, external services mocked

---

## Related Documentation

- Epic: `docs/requirements/epics/mvp/EP-062-unit-test-infrastructure-coverage.md`
- Initiative: `docs/initiatives/IN-026-comprehensive-testing-implementation.md`
- Testing Standards: `.cursor/rules/testing-standards.mdc`
- Best Practices: `docs/testing/BEST-PRACTICES.md`

---

**Last Updated**: 2026-01-27
