# [EPIC] EP-062: Unit Test Infrastructure & Coverage (IN-026)

**Status**: Proposed  
**Phase**: P1 - Requirements  
**Created**: 2026-01-27  
**Last Updated**: 2026-01-27  
**Initiative**: IN-026  
**Owner**: Engineering Team

---

## Overview

Establish comprehensive unit test infrastructure and achieve 80%+ test coverage for all business logic, shared UI components, utilities, and tRPC routers across the RYLA monorepo.

This epic focuses on unit and integration tests using Vitest, following the testing pyramid principle (70% unit tests). It establishes standardized test utilities, fixtures, and patterns that enable fast, reliable test execution.

---

## Business Impact

**Target Metric**: C - Core Value, B - Retention, E - CAC

**Hypothesis**: When code has comprehensive unit test coverage with fast, reliable tests, developers can refactor confidently, catch bugs early, and deploy with confidence, resulting in fewer production incidents, better user experience, and lower engineering costs.

**Success Criteria**:
- Business logic coverage: **80%+** for `libs/business` and `apps/api/src/services`
- UI component coverage: **80%+** for `libs/ui` shared components
- tRPC router coverage: **80%+** for all routers
- Test execution time: **< 5 minutes** for full unit test suite
- Test reliability: **95%+** pass rate in CI/CD

---

## Related Initiative

This epic is part of [IN-026: Comprehensive Testing Implementation](../../initiatives/IN-026-comprehensive-testing-implementation.md).

**Initiative Goal**: Establish comprehensive test coverage to ensure reliability, prevent regressions, and enable confident deployments.

**This Epic's Contribution**: Provides the foundation (unit tests) of the testing pyramid, covering 70% of all tests. Enables fast feedback loops and catches bugs early in development.

---

## Features

### F1: Test Infrastructure Standardization

- Standardized test utilities across all apps (`test/utils/`)
- Test fixtures and factories for common data patterns
- Global test setup files with shared configuration
- MSW (Mock Service Worker) setup for frontend tests
- pglite setup for database integration tests
- Test helpers for common patterns (auth mocking, context mocking)

### F2: Business Logic Test Coverage

- All services in `libs/business` have `.spec.ts` files
- All services in `apps/api/src/services` have `.spec.ts` files
- Critical business logic paths tested (happy paths + edge cases)
- Error handling tested
- Integration tests for database operations using pglite
- Mock external services appropriately

### F3: UI Component Test Coverage

- All shared components in `libs/ui` have `.spec.tsx` files
- Focus on interaction logic (user interactions, state changes)
- Use MSW for network mocking (never mock `useQuery`/`useMutation` directly)
- Test error states and loading states
- Test accessibility where applicable

### F4: tRPC Router Test Coverage

- All tRPC routers have comprehensive `.spec.ts` files
- Test procedures by calling them directly with mocked context
- Test permission checks (RBAC)
- Test input validation
- Test error handling
- Test success and failure paths

### F5: Utility and Helper Test Coverage

- All utilities in `libs/shared` have `.spec.ts` files
- Test edge cases (null, undefined, empty, invalid inputs)
- Test error handling
- Test type guards and validators

### F6: Coverage Reporting and CI Integration

- Coverage reporting configured for all projects
- Coverage thresholds enforced (80%+ for business logic)
- Coverage reports generated in CI/CD
- Coverage badges or status checks
- Coverage trends tracked over time

---

## User Stories

### ST-001: Standardized Test Utilities

**As a** developer writing tests  
**I want to** use standardized test utilities and fixtures  
**So that** I can write tests quickly and consistently

**AC**:
- AC-1: Test utilities exist in each app's `lib/test/utils/` directory
- AC-2: Common fixtures available (users, influencers, images, etc.)
- AC-3: MSW handlers configured for frontend tests
- AC-4: pglite setup available for database tests
- AC-5: Test helpers documented with examples
- AC-6: All test utilities follow testing standards

### ST-002: Business Logic Test Coverage

**As a** developer  
**I want to** have comprehensive tests for all business logic  
**So that** I can refactor confidently and catch bugs early

**AC**:
- AC-1: All services in `libs/business` have `.spec.ts` files
- AC-2: All services in `apps/api/src/services` have `.spec.ts` files
- AC-3: Critical business logic paths tested (happy + edge cases)
- AC-4: Error handling tested for all services
- AC-5: Integration tests for database operations
- AC-6: 80%+ code coverage for business logic
- AC-7: All tests passing in CI/CD

### ST-003: UI Component Test Coverage

**As a** developer  
**I want to** have tests for all shared UI components  
**So that** I can ensure components work correctly and prevent regressions

**AC**:
- AC-1: All components in `libs/ui` have `.spec.tsx` files
- AC-2: User interactions tested (clicks, form submissions, etc.)
- AC-3: State changes tested (loading, error, success states)
- AC-4: MSW used for network mocking (not hook mocking)
- AC-5: Error states and edge cases tested
- AC-6: 80%+ code coverage for UI components
- AC-7: All tests passing in CI/CD

### ST-004: tRPC Router Test Coverage

**As a** developer  
**I want to** have comprehensive tests for all tRPC routers  
**So that** I can ensure API endpoints work correctly

**AC**:
- AC-1: All tRPC routers have `.spec.ts` files
- AC-2: All procedures tested (success and failure paths)
- AC-3: Permission checks tested (RBAC)
- AC-4: Input validation tested
- AC-5: Error handling tested
- AC-6: Tests call procedures directly with mocked context
- AC-7: 80%+ code coverage for routers
- AC-8: All tests passing in CI/CD

### ST-005: Coverage Reporting

**As a** team lead  
**I want to** see test coverage reports  
**So that** I can track coverage progress and identify gaps

**AC**:
- AC-1: Coverage reporting configured for all projects
- AC-2: Coverage thresholds enforced (80%+ for business logic)
- AC-3: Coverage reports generated in CI/CD
- AC-4: Coverage visible in PRs or CI status
- AC-5: Coverage trends tracked over time

---

## Acceptance Criteria

### Infrastructure (F1)

- [ ] Test utilities standardized across all apps
- [ ] Test fixtures and factories available
- [ ] MSW setup configured for frontend tests
- [ ] pglite setup available for database tests
- [ ] Global test setup files configured
- [ ] Test helpers documented with examples

### Business Logic Coverage (F2)

- [ ] All services in `libs/business` have `.spec.ts` files
- [ ] All services in `apps/api/src/services` have `.spec.ts` files
- [ ] 80%+ code coverage for business logic
- [ ] Critical paths tested (happy + edge cases)
- [ ] Error handling tested
- [ ] Integration tests for database operations
- [ ] All tests passing in CI/CD

### UI Component Coverage (F3)

- [ ] All components in `libs/ui` have `.spec.tsx` files
- [ ] User interactions tested
- [ ] State changes tested
- [ ] MSW used for network mocking
- [ ] Error states tested
- [ ] 80%+ code coverage for UI components
- [ ] All tests passing in CI/CD

### tRPC Router Coverage (F4)

- [ ] All tRPC routers have `.spec.ts` files
- [ ] All procedures tested
- [ ] Permission checks tested
- [ ] Input validation tested
- [ ] Error handling tested
- [ ] 80%+ code coverage for routers
- [ ] All tests passing in CI/CD

### Coverage Reporting (F6)

- [ ] Coverage reporting configured
- [ ] Coverage thresholds enforced
- [ ] Coverage reports in CI/CD
- [ ] Coverage visible in PRs
- [ ] Coverage trends tracked

---

## Non-MVP / Out of Scope

- E2E tests (covered in EP-063)
- Performance tests
- Load tests
- Visual regression tests
- Snapshot testing (unless specifically needed)
- 100% code coverage (target is 80%+)

---

## Technical Notes

### Testing Standards

Follow `.cursor/rules/testing-standards.mdc` and `docs/testing/BEST-PRACTICES.md`:
- Use `.spec.ts` or `.spec.tsx` extensions (never `.test.ts`)
- Colocate tests with source files
- Use MSW for frontend network mocking
- Use pglite for database integration tests
- Never mock `useQuery` or `useMutation` directly
- Test procedures by calling them directly with mocked context

### Test Organization

```
apps/{app}/
├── lib/
│   ├── test/
│   │   ├── utils/
│   │   │   ├── test-db.ts          # pglite setup
│   │   │   ├── test-context.ts     # Mock context
│   │   │   └── test-helpers.ts     # Common utilities
│   │   ├── fixtures/
│   │   │   └── *.ts                # Test data factories
│   │   └── setup.ts                # Global setup
│   └── trpc/
│       └── routers/
│           └── *.router.spec.ts    # Router tests
└── src/
    └── services/
        └── *.service.spec.ts       # Service tests
```

### Priority Order

1. **Tier 1**: Critical business logic (auth, payments, generation)
2. **Tier 2**: Core features (wizard, studio, dashboard)
3. **Tier 3**: Supporting features (notifications, settings)
4. **Tier 4**: Utilities and helpers

---

## Dependencies

- Vitest already configured
- MSW available
- pglite available
- Testing standards documented
- No external dependencies

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Tests slow down development | Medium | High | Focus on fast unit tests, optimize CI |
| Coverage goals too ambitious | Medium | Medium | Start with critical paths, adjust targets |
| Tests become maintenance burden | Medium | High | Follow standards, keep tests simple |

---

## Related Documentation

- Testing Standards: `.cursor/rules/testing-standards.mdc`
- Best Practices: `docs/testing/BEST-PRACTICES.md`
- Initiative: `docs/initiatives/IN-026-comprehensive-testing-implementation.md`
- Admin Testing Plan: `apps/admin/TESTING-PLAN.md` (reference)

---

**Last Updated**: 2026-01-27
