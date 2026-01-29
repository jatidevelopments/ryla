# EP-062: Unit Test Infrastructure & Coverage - Test File Structure

**Epic**: [EP-062: Unit Test Infrastructure & Coverage](../requirements/epics/mvp/EP-062-unit-test-infrastructure-coverage.md)  
**Initiative**: [IN-026: Comprehensive Testing Implementation](../../initiatives/IN-026-comprehensive-testing-implementation.md)  
**Phase**: P4 - Test File Structure (Adapted from UI Skeleton)  
**Status**: In Progress  
**Created**: 2026-01-27  
**Last Updated**: 2026-01-27

---

## Overview

Test file structure and organization for EP-062. Since this epic is about test infrastructure (not user-facing UI), this document defines the "skeleton" of test files, their organization, and how they map to source code.

---

## Test File Organization

### Directory Structure

```
{app-or-lib}/
├── src/                          # Source code
│   ├── services/
│   │   └── service-name.ts
│   ├── components/
│   │   └── component-name.tsx
│   └── utils/
│       └── util-name.ts
└── [test files colocated or in test/]

# Test files (colocated pattern - preferred)
src/
├── services/
│   ├── service-name.ts
│   └── service-name.spec.ts     # ✅ Colocated
├── components/
│   ├── component-name.tsx
│   └── component-name.spec.tsx  # ✅ Colocated
└── utils/
    ├── util-name.ts
    └── util-name.spec.ts        # ✅ Colocated

# OR test files (centralized pattern - for shared utilities)
lib/
└── test/
    ├── utils/                   # Test utilities
    ├── fixtures/                # Test data factories
    └── setup.ts                 # Global setup
```

---

## Test File Mapping

### Business Logic Tests

| Source File | Test File | Location | Priority |
|------------|-----------|----------|----------|
| `libs/business/src/services/auth.service.ts` | `auth.service.spec.ts` | Colocated | Tier 1 |
| `libs/business/src/services/subscription.service.ts` | `subscription.service.spec.ts` | Colocated | Tier 1 |
| `libs/business/src/services/generation.service.ts` | `generation.service.spec.ts` | Colocated | Tier 1 |
| `libs/business/src/services/comfyui-websocket-client.ts` | `comfyui-websocket-client.spec.ts` | Colocated | Tier 2 |
| `apps/api/src/modules/auth/services/auth.service.ts` | `auth.service.spec.ts` | Colocated | Tier 1 |
| `apps/api/src/modules/image/services/studio-generation.service.ts` | `studio-generation.service.spec.ts` | Colocated | Tier 1 |

### UI Component Tests

| Source File | Test File | Location | Priority |
|------------|-----------|----------|----------|
| `libs/ui/src/components/Button.tsx` | `Button.spec.tsx` | Colocated | Tier 3 |
| `libs/ui/src/components/Modal.tsx` | `Modal.spec.tsx` | Colocated | Tier 3 |
| `apps/web/components/auth/AuthModal.tsx` | `AuthModal.spec.tsx` | Colocated | Tier 1 |
| `apps/web/components/studio/StudioGallery.tsx` | `StudioGallery.spec.tsx` | Colocated | Tier 1 |
| `apps/web/components/wizard/steps/StepAIGeneration.tsx` | `StepAIGeneration.spec.tsx` | Colocated | Tier 1 |

### tRPC Router Tests

| Source File | Test File | Location | Priority |
|------------|-----------|----------|----------|
| `apps/api/lib/trpc/routers/auth.router.ts` | `auth.router.spec.ts` | Colocated | Tier 1 |
| `apps/api/lib/trpc/routers/generation.router.ts` | `generation.router.spec.ts` | Colocated | Tier 1 |
| `apps/admin/lib/trpc/routers/admins.router.ts` | `admins.router.spec.ts` | Colocated | Tier 1 |
| `apps/admin/lib/trpc/routers/users.router.ts` | `users.router.spec.ts` | Colocated | Tier 1 |

### Utility Tests

| Source File | Test File | Location | Priority |
|------------|-----------|----------|----------|
| `libs/shared/src/utils/format-date.ts` | `format-date.spec.ts` | Colocated | Tier 4 |
| `libs/shared/src/utils/validate-email.ts` | `validate-email.spec.ts` | Colocated | Tier 4 |
| `libs/shared/src/utils/error-handler.ts` | `error-handler.spec.ts` | Colocated | Tier 3 |

---

## Test Infrastructure Files

### Test Utilities Structure

```
apps/{app}/lib/test/
├── utils/
│   ├── test-db.ts              # pglite setup
│   ├── test-context.ts          # Mock context for tRPC
│   ├── test-helpers.ts          # Common utilities
│   └── index.ts                 # Barrel export
├── fixtures/
│   ├── users.ts                 # User fixtures
│   ├── influencers.ts           # Influencer fixtures
│   ├── images.ts                # Image fixtures
│   ├── jobs.ts                  # Job fixtures
│   └── index.ts                 # Barrel export
└── setup.ts                     # Global setup
```

### Test Setup Files

| File | Purpose | Location |
|------|---------|----------|
| `vitest.config.ts` | Vitest configuration | Project root |
| `test/setup.ts` | Global test setup (MSW, mocks) | `lib/test/setup.ts` |
| `test/utils/test-db.ts` | Database setup utilities | `lib/test/utils/test-db.ts` |
| `test/utils/test-context.ts` | Context mocking utilities | `lib/test/utils/test-context.ts` |

---

## Test File Patterns

### Service Test Pattern

```typescript
// service-name.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ServiceName } from './service-name'

describe('ServiceName', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('methodName', () => {
    it('should [behavior] when [condition]', async () => {
      // Arrange
      // Act
      // Assert
    })

    it('should handle [error case]', async () => {
      // Arrange
      // Act
      // Assert
    })
  })
})
```

### Component Test Pattern

```typescript
// component-name.spec.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ComponentName } from './component-name'
import { setupMSW } from '@/test/setup'

setupMSW()

describe('ComponentName', () => {
  it('should [behavior] when [condition]', () => {
    // Arrange
    // Act
    // Assert
  })

  it('should handle user interaction', () => {
    // Arrange
    // Act (fireEvent.click, etc.)
    // Assert
  })
})
```

### Router Test Pattern

```typescript
// router-name.router.spec.ts
import { describe, it, expect, vi } from 'vitest'
import { createMockContext } from '@/test/utils/test-context'
import { router } from './router-name'

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

    it('should reject unauthorized access', async () => {
      // Arrange
      const unauthorizedCtx = createMockContext({ role: 'user' })
      // Act & Assert
      await expect(
        router.procedureName.query({ /* input */ }, unauthorizedCtx)
      ).rejects.toThrow()
    })
  })
})
```

---

## Test File Naming Conventions

### File Extensions

- **Unit/Integration Tests**: `.spec.ts` or `.spec.tsx`
- **Never use**: `.test.ts` or `.test.tsx` (project standard)

### Naming Patterns

| Source File | Test File | Pattern |
|------------|-----------|---------|
| `service-name.ts` | `service-name.spec.ts` | `{source}.spec.ts` |
| `ComponentName.tsx` | `ComponentName.spec.tsx` | `{Source}.spec.tsx` |
| `router-name.router.ts` | `router-name.router.spec.ts` | `{source}.spec.ts` |
| `util-name.ts` | `util-name.spec.ts` | `{source}.spec.ts` |

---

## Test Coverage Mapping

### Coverage Targets by Area

| Area | Coverage Target | Priority |
|------|----------------|----------|
| Business Logic (`libs/business`, `apps/api/services`) | 80%+ | Tier 1 |
| UI Components (`libs/ui`) | 80%+ | Tier 2 |
| tRPC Routers | 80%+ | Tier 1 |
| Utilities (`libs/shared`) | 70%+ | Tier 3 |

### Coverage by Feature Area

| Feature Area | Services | Components | Routers | Priority |
|--------------|----------|------------|---------|----------|
| Authentication | ✅ | ✅ | ✅ | Tier 1 |
| Payments | ✅ | ✅ | ✅ | Tier 1 |
| Image Generation | ✅ | ✅ | ✅ | Tier 1 |
| Character Wizard | ✅ | ✅ | ✅ | Tier 2 |
| Dashboard | ✅ | ✅ | ✅ | Tier 2 |
| Settings | ✅ | ✅ | ✅ | Tier 3 |

---

## Test Execution Flow

### Local Development

```
Developer writes code
  ↓
Developer writes test (colocated)
  ↓
Run: pnpm nx test {project}
  ↓
Test passes/fails
  ↓
Fix code or test
  ↓
Repeat until passing
```

### CI/CD Flow

```
Code pushed to PR
  ↓
CI runs: pnpm nx run-many --target=test
  ↓
All tests execute in parallel
  ↓
Coverage calculated
  ↓
Coverage threshold checked
  ↓
PR status updated (pass/fail)
```

---

## Test File Checklist

### When Creating a Test File

- [ ] Test file colocated with source (or in `test/` if shared)
- [ ] File extension: `.spec.ts` or `.spec.tsx`
- [ ] Test file name matches source file name
- [ ] Test follows AAA pattern (Arrange, Act, Assert)
- [ ] Test has descriptive `describe` and `it` blocks
- [ ] Test is isolated (no dependencies on other tests)
- [ ] Mocks are reset in `beforeEach`
- [ ] Test covers happy path and edge cases
- [ ] Test follows testing standards (`.cursor/rules/testing-standards.mdc`)

---

## Related Documentation

- Epic: `docs/requirements/epics/mvp/EP-062-unit-test-infrastructure-coverage.md`
- Architecture: `docs/architecture/epics/EP-062-unit-test-infrastructure-architecture.md`
- Testing Standards: `.cursor/rules/testing-standards.mdc`
- Best Practices: `docs/testing/BEST-PRACTICES.md`

---

**Last Updated**: 2026-01-27
