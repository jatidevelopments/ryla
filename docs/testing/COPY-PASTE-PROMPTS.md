# Copy-Paste Prompts for 100% Test Coverage

**Initiative**: IN-026 - Comprehensive Testing Implementation  
**Epic**: EP-062 - Unit Test Infrastructure & Coverage  
**Goal**: Achieve **100% test coverage** for each app/lib

---

## 📋 How to Use

1. Copy the entire prompt block for the app/lib you want to test
2. Paste it into a new agent conversation
3. The agent will work independently to achieve 100% coverage
4. Verify with: `pnpm nx test <app-name>`

---

## 🎯 PROMPT 1: Apps/Web

```
You are implementing 100% unit test coverage for apps/web as part of EP-062 (IN-026).

CONTEXT:
- Initiative: IN-026 (Comprehensive Testing Implementation)
- Epic: EP-062 (Unit Test Infrastructure & Coverage)
- Goal: 100% test coverage for apps/web
- Test infrastructure already exists: apps/web/lib/test/, apps/web/src/test/setup.tsx
- Coverage config: apps/web/vitest.config.ts (currently 80% threshold, update to 100%)

TASK:
Achieve 100% test coverage for apps/web by creating .spec.ts/.spec.tsx files for:

1. ALL components in apps/web/components/ (every .tsx file needs .spec.tsx)
2. ALL utilities in apps/web/lib/utils/ (every .ts file needs .spec.ts)
3. ALL hooks in apps/web/lib/hooks/ or apps/web/hooks/ (every .ts file needs .spec.ts)
4. ALL services in apps/web/lib/services/ (if any, every .ts file needs .spec.ts)
5. ALL API clients in apps/web/lib/api/ (every .ts file needs .spec.ts)

REQUIREMENTS:
- Follow .cursor/rules/testing-standards.mdc
- Use MSW for network mocking (never mock useQuery/useMutation directly)
- Colocate tests with source files (Component.tsx → Component.spec.tsx)
- Use .spec.ts/.spec.tsx extensions (NOT .test.ts)
- Test user interactions, state changes, error states
- Update vitest.config.ts thresholds to 100% (lines, functions, branches, statements)

VERIFICATION:
1. Run: pnpm nx test web
2. Check coverage report: coverage/apps/web/index.html
3. Verify 100% coverage for all files
4. All tests must pass

DELIVERABLES:
- All missing .spec.ts/.spec.tsx files created
- vitest.config.ts updated to 100% thresholds
- All tests passing
- Coverage report showing 100% coverage
```

---

## 🎯 PROMPT 2: Apps/API

```
You are implementing 100% unit test coverage for apps/api as part of EP-062 (IN-026).

CONTEXT:
- Initiative: IN-026 (Comprehensive Testing Implementation)
- Epic: EP-062 (Unit Test Infrastructure & Coverage)
- Goal: 100% test coverage for apps/api
- Test infrastructure already exists: apps/api/src/test/utils/
- Coverage config: apps/api/vitest.config.ts (currently 80% threshold, update to 100%)
- Framework: NestJS with Vitest

TASK:
Achieve 100% test coverage for apps/api by creating .spec.ts files for:

1. ALL services in apps/api/src/modules/*/services/ (every .service.ts needs .service.spec.ts)
2. ALL controllers in apps/api/src/modules/*/controllers/ (every .controller.ts needs .controller.spec.ts)
3. ALL modules in apps/api/src/modules/*/ (test module setup if complex)
4. ALL utilities in apps/api/src/common/ or apps/api/src/utils/ (every .ts file needs .spec.ts)
5. ALL guards, filters, interceptors in apps/api/src/common/ (every .ts file needs .spec.ts)

REQUIREMENTS:
- Follow .cursor/rules/testing-standards.mdc
- Use pglite for database integration tests (apps/api/src/test/utils/test-db.ts)
- Use createTestingModule() for NestJS module testing
- Test procedures by calling them directly with mocked context
- Colocate tests with source files (Service.ts → Service.spec.ts)
- Use .spec.ts extensions (NOT .test.ts)
- Test success paths, error handling, edge cases
- Update vitest.config.ts thresholds to 100% (lines, functions, branches, statements)

VERIFICATION:
1. Run: pnpm nx test api
2. Check coverage report: coverage/apps/api/index.html
3. Verify 100% coverage for all files
4. All tests must pass

DELIVERABLES:
- All missing .spec.ts files created
- vitest.config.ts updated to 100% thresholds
- All tests passing
- Coverage report showing 100% coverage
```

---

## 🎯 PROMPT 3: Apps/Funnel

```
You are implementing 100% unit test coverage for apps/funnel as part of EP-062 (IN-026).

CONTEXT:
- Initiative: IN-026 (Comprehensive Testing Implementation)
- Epic: EP-062 (Unit Test Infrastructure & Coverage)
- Goal: 100% test coverage for apps/funnel
- Test infrastructure already exists: apps/funnel/src/lib/test/, apps/funnel/src/test/setup.tsx
- Coverage config: apps/funnel/vitest.config.ts (currently 80% threshold, update to 100%)

TASK:
Achieve 100% test coverage for apps/funnel by creating .spec.ts/.spec.tsx files for:

1. ALL components in apps/funnel/src/components/ (every .tsx file needs .spec.tsx)
2. ALL utilities in apps/funnel/src/lib/utils/ or apps/funnel/src/utils/ (every .ts file needs .spec.ts)
3. ALL hooks in apps/funnel/src/hooks/ or apps/funnel/src/lib/hooks/ (every .ts file needs .spec.ts)
4. ALL services in apps/funnel/src/services/ (if any, every .ts file needs .spec.ts)
5. ALL API clients in apps/funnel/src/lib/api/ (every .ts file needs .spec.ts)

REQUIREMENTS:
- Follow .cursor/rules/testing-standards.mdc
- Use MSW for network mocking (never mock useQuery/useMutation directly)
- Colocate tests with source files (Component.tsx → Component.spec.tsx)
- Use .spec.ts/.spec.tsx extensions (NOT .test.ts)
- Test user interactions, form validation, payment flows, error states
- Update vitest.config.ts thresholds to 100% (lines, functions, branches, statements)

VERIFICATION:
1. Run: pnpm nx test funnel
2. Check coverage report: coverage/apps/funnel/index.html
3. Verify 100% coverage for all files
4. All tests must pass

DELIVERABLES:
- All missing .spec.ts/.spec.tsx files created
- vitest.config.ts updated to 100% thresholds
- All tests passing
- Coverage report showing 100% coverage
```

---

## 🎯 PROMPT 4: Apps/Landing

```
You are implementing 100% unit test coverage for apps/landing as part of EP-062 (IN-026).

CONTEXT:
- Initiative: IN-026 (Comprehensive Testing Implementation)
- Epic: EP-062 (Unit Test Infrastructure & Coverage)
- Goal: 100% test coverage for apps/landing
- Test infrastructure already exists: apps/landing/src/lib/test/, apps/landing/src/test/setup.tsx
- Coverage config: apps/landing/vitest.config.ts (currently 80% threshold, update to 100%)

TASK:
Achieve 100% test coverage for apps/landing by creating .spec.ts/.spec.tsx files for:

1. ALL components in apps/landing/src/components/ (every .tsx file needs .spec.tsx)
2. ALL utilities in apps/landing/src/lib/utils/ or apps/landing/src/utils/ (every .ts file needs .spec.ts)
3. ALL hooks in apps/landing/src/hooks/ or apps/landing/src/lib/hooks/ (every .ts file needs .spec.ts)
4. ALL sections in apps/landing/src/sections/ (if any, every .tsx file needs .spec.tsx)
5. ALL API clients in apps/landing/src/lib/api/ (every .ts file needs .spec.ts)

REQUIREMENTS:
- Follow .cursor/rules/testing-standards.mdc
- Use MSW for network mocking (never mock useQuery/useMutation directly)
- Colocate tests with source files (Component.tsx → Component.spec.tsx)
- Use .spec.ts/.spec.tsx extensions (NOT .test.ts)
- Test user interactions, CTA clicks, form submissions, navigation
- Update vitest.config.ts thresholds to 100% (lines, functions, branches, statements)

VERIFICATION:
1. Run: pnpm nx test landing
2. Check coverage report: coverage/apps/landing/index.html
3. Verify 100% coverage for all files
4. All tests must pass

DELIVERABLES:
- All missing .spec.ts/.spec.tsx files created
- vitest.config.ts updated to 100% thresholds
- All tests passing
- Coverage report showing 100% coverage
```

---

## 🎯 PROMPT 5: Apps/Admin

```
You are implementing 100% unit test coverage for apps/admin as part of EP-062 (IN-026).

CONTEXT:
- Initiative: IN-026 (Comprehensive Testing Implementation)
- Epic: EP-062 (Unit Test Infrastructure & Coverage)
- Goal: 100% test coverage for apps/admin
- Test infrastructure: Already has comprehensive tRPC router tests
- Coverage config: Check apps/admin/vitest.config.ts (update to 100% if needed)

TASK:
Achieve 100% test coverage for apps/admin by creating .spec.ts/.spec.tsx files for:

1. ALL components in apps/admin/app/ (every .tsx file needs .spec.tsx)
2. ALL components in apps/admin/components/ (every .tsx file needs .spec.tsx)
3. ALL utilities in apps/admin/lib/utils/ or apps/admin/lib/ (every .ts file needs .spec.ts)
4. ALL hooks in apps/admin/lib/hooks/ (every .ts file needs .spec.ts)
5. Verify ALL tRPC routers in apps/admin/lib/trpc/routers/ have .spec.ts files (already mostly done)

REQUIREMENTS:
- Follow .cursor/rules/testing-standards.mdc
- Use MSW for network mocking (never mock useQuery/useMutation directly)
- Colocate tests with source files (Component.tsx → Component.spec.tsx)
- Use .spec.ts/.spec.tsx extensions (NOT .test.ts)
- Test user interactions, admin operations, data tables, forms
- Update vitest.config.ts thresholds to 100% (lines, functions, branches, statements)

VERIFICATION:
1. Run: pnpm nx test admin
2. Check coverage report: coverage/apps/admin/index.html
3. Verify 100% coverage for all files
4. All tests must pass

DELIVERABLES:
- All missing .spec.ts/.spec.tsx files created
- vitest.config.ts updated to 100% thresholds
- All tests passing
- Coverage report showing 100% coverage
```

---

## 🎯 PROMPT 6: Libs/Business

```
You are implementing 100% unit test coverage for libs/business as part of EP-062 (IN-026).

CONTEXT:
- Initiative: IN-026 (Comprehensive Testing Implementation)
- Epic: EP-062 (Unit Test Infrastructure & Coverage)
- Goal: 100% test coverage for libs/business
- Test infrastructure: Check libs/business/vitest.config.ts
- Coverage config: Update to 100% thresholds

TASK:
Achieve 100% test coverage for libs/business by creating .spec.ts files for:

1. ALL services in libs/business/src/services/ (every .service.ts needs .service.spec.ts)
2. ALL models in libs/business/src/models/ (if any, every .ts file needs .spec.ts)
3. ALL utilities in libs/business/src/utils/ (if any, every .ts file needs .spec.ts)

REQUIREMENTS:
- Follow .cursor/rules/testing-standards.mdc
- Use pglite for database integration tests where needed
- Mock external dependencies (repositories, external services)
- Colocate tests with source files (Service.ts → Service.spec.ts)
- Use .spec.ts extensions (NOT .test.ts)
- Test business logic, validation, error handling, edge cases
- Update vitest.config.ts thresholds to 100% (lines, functions, branches, statements)

VERIFICATION:
1. Run: pnpm nx test business
2. Check coverage report: coverage/libs/business/index.html
3. Verify 100% coverage for all files
4. All tests must pass

DELIVERABLES:
- All missing .spec.ts files created
- vitest.config.ts updated to 100% thresholds
- All tests passing
- Coverage report showing 100% coverage
```

---

## 🎯 PROMPT 7: Libs/UI

```
You are implementing 100% unit test coverage for libs/ui as part of EP-062 (IN-026).

CONTEXT:
- Initiative: IN-026 (Comprehensive Testing Implementation)
- Epic: EP-062 (Unit Test Infrastructure & Coverage)
- Goal: 100% test coverage for libs/ui
- Test infrastructure: Check libs/ui/vitest.config.ts
- Coverage config: Update to 100% thresholds
- Example tests exist: libs/ui/src/components/button.spec.tsx, dialog.spec.tsx

TASK:
Achieve 100% test coverage for libs/ui by creating .spec.tsx files for:

1. ALL components in libs/ui/src/components/ (every .tsx file needs .spec.tsx)
2. ALL hooks in libs/ui/src/hooks/ (if any, every .ts file needs .spec.ts)
3. ALL utilities in libs/ui/src/utils/ (if any, every .ts file needs .spec.ts)

REQUIREMENTS:
- Follow .cursor/rules/testing-standards.mdc
- Use MSW for network mocking (never mock useQuery/useMutation directly)
- Colocate tests with source files (Component.tsx → Component.spec.tsx)
- Use .spec.tsx extensions (NOT .test.tsx)
- Test user interactions, props, variants, states, accessibility
- Update vitest.config.ts thresholds to 100% (lines, functions, branches, statements)

VERIFICATION:
1. Run: pnpm nx test ui
2. Check coverage report: coverage/libs/ui/index.html
3. Verify 100% coverage for all files
4. All tests must pass

DELIVERABLES:
- All missing .spec.tsx files created
- vitest.config.ts updated to 100% thresholds
- All tests passing
- Coverage report showing 100% coverage
```

---

## 🎯 PROMPT 8: Libs/Shared

```
You are implementing 100% unit test coverage for libs/shared as part of EP-062 (IN-026).

CONTEXT:
- Initiative: IN-026 (Comprehensive Testing Implementation)
- Epic: EP-062 (Unit Test Infrastructure & Coverage)
- Goal: 100% test coverage for libs/shared
- Test infrastructure: Check libs/shared/vitest.config.ts (may need to create)
- Coverage config: Create/update to 100% thresholds

TASK:
Achieve 100% test coverage for libs/shared by creating .spec.ts files for:

1. ALL utilities in libs/shared/src/utils/ (every .ts file needs .spec.ts)
2. ALL types/validators in libs/shared/src/ (every .ts file with logic needs .spec.ts)
3. ALL constants/helpers in libs/shared/src/ (if any logic, needs .spec.ts)

REQUIREMENTS:
- Follow .cursor/rules/testing-standards.mdc
- Colocate tests with source files (util.ts → util.spec.ts)
- Use .spec.ts extensions (NOT .test.ts)
- Test edge cases (null, undefined, empty, invalid inputs)
- Test type guards, validators, formatters
- Create/update vitest.config.ts with 100% thresholds

VERIFICATION:
1. Run: pnpm nx test shared
2. Check coverage report: coverage/libs/shared/index.html
3. Verify 100% coverage for all files
4. All tests must pass

DELIVERABLES:
- All missing .spec.ts files created
- vitest.config.ts created/updated to 100% thresholds
- All tests passing
- Coverage report showing 100% coverage
```

---

## 🎯 PROMPT 9: Libs/TRPC

```
You are implementing 100% unit test coverage for libs/trpc as part of EP-062 (IN-026).

CONTEXT:
- Initiative: IN-026 (Comprehensive Testing Implementation)
- Epic: EP-062 (Unit Test Infrastructure & Coverage)
- Goal: 100% test coverage for libs/trpc
- Test infrastructure: Check libs/trpc/vitest.config.ts (may need to create)
- Coverage config: Create/update to 100% thresholds

TASK:
Achieve 100% test coverage for libs/trpc by creating .spec.ts files for:

1. ALL routers in libs/trpc/src/routers/ (every .router.ts needs .router.spec.ts)
2. ALL utilities in libs/trpc/src/utils/ (if any, every .ts file needs .spec.ts)
3. ALL middleware in libs/trpc/src/middleware/ (if any, every .ts file needs .spec.ts)

REQUIREMENTS:
- Follow .cursor/rules/testing-standards.mdc
- Test procedures by calling them directly with mocked context
- Test permission checks (RBAC)
- Test input validation
- Test error handling
- Colocate tests with source files (router.ts → router.spec.ts)
- Use .spec.ts extensions (NOT .test.ts)
- Create/update vitest.config.ts with 100% thresholds

VERIFICATION:
1. Run: pnpm nx test trpc
2. Check coverage report: coverage/libs/trpc/index.html
3. Verify 100% coverage for all files
4. All tests must pass

DELIVERABLES:
- All missing .spec.ts files created
- vitest.config.ts created/updated to 100% thresholds
- All tests passing
- Coverage report showing 100% coverage
```

---

## 📋 Quick Commands

```bash
# Test each app/lib
pnpm nx test web
pnpm nx test api
pnpm nx test funnel
pnpm nx test landing
pnpm nx test admin
pnpm nx test business
pnpm nx test ui
pnpm nx test shared
pnpm nx test trpc

# View coverage reports
open coverage/apps/web/index.html
open coverage/apps/api/index.html
open coverage/apps/funnel/index.html
open coverage/apps/landing/index.html
open coverage/apps/admin/index.html
open coverage/libs/business/index.html
open coverage/libs/ui/index.html
open coverage/libs/shared/index.html
open coverage/libs/trpc/index.html
```

---

**Last Updated**: 2026-01-27  
**Related**: [EP-062](../requirements/epics/mvp/EP-062-unit-test-infrastructure-coverage.md), [IN-026](../initiatives/IN-026-comprehensive-testing-implementation.md)
