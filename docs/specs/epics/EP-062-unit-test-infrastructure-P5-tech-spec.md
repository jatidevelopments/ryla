# EP-062 (P5) — Unit Test Infrastructure & Coverage: File Plan + Tasks

Working in **PHASE P5 (File plan + tasks)** on **EP-062**.

## Scope (MVP)

- **Test infrastructure standardization** across all apps
- **80%+ test coverage** for business logic, UI components, and tRPC routers
- **Test utilities and fixtures** for common patterns
- **Coverage reporting** integrated into CI/CD
- **Fast, reliable test execution** (< 5 min for unit tests)

Explicitly out of MVP:
- E2E tests (covered in EP-063)
- 100% code coverage (target is 80%+)
- Performance tests
- Load tests
- Visual regression tests

---

## Current Reality (Starting Point)

**Existing Test Coverage:**
- ✅ Admin panel: 15 tRPC routers have test files (partial coverage)
- ✅ Some business services: WebSocket client, job persistence, error handler (partial)
- ✅ Some frontend components: Auth forms, wizard steps, studio components (partial)
- ⚠️ Coverage gaps: Many services, components, and critical flows untested

**Test Infrastructure:**
- ✅ Vitest configured for unit/integration tests
- ✅ Playwright configured for E2E tests
- ✅ MSW (Mock Service Worker) available
- ✅ pglite available for database integration tests
- ⚠️ Test utilities and fixtures incomplete
- ⚠️ Coverage reporting not standardized

---

## File Plan

### New Files - Test Infrastructure

1. **`apps/web/lib/test/utils/test-db.ts`**
   - Purpose: pglite setup for web app database tests
   - Exports: `setupTestDb()`, `teardownTestDb()`, `resetTestDb()`

2. **`apps/web/lib/test/utils/test-context.ts`**
   - Purpose: Mock context utilities for web app tests
   - Exports: `createMockContext()`, `createUserContext()`, `createAdminContext()`

3. **`apps/web/lib/test/utils/test-helpers.ts`**
   - Purpose: Common test utilities for web app
   - Exports: `waitFor()`, `createMockRequest()`, `createMockResponse()`

4. **`apps/web/lib/test/fixtures/users.ts`**
   - Purpose: User test fixtures and factories
   - Exports: `createTestUser()`, `createTestAdmin()`, user fixtures

5. **`apps/web/lib/test/fixtures/influencers.ts`**
   - Purpose: Influencer test fixtures
   - Exports: `createTestInfluencer()`, influencer fixtures

6. **`apps/web/lib/test/fixtures/images.ts`**
   - Purpose: Image test fixtures
   - Exports: `createTestImage()`, image fixtures

7. **`apps/web/lib/test/setup.ts`**
   - Purpose: Global test setup for web app (MSW, mocks)
   - Exports: `setupMSW()`, global setup function

8. **`apps/api/src/test/utils/test-db.ts`**
   - Purpose: pglite setup for API database tests
   - Exports: `setupTestDb()`, `teardownTestDb()`, `resetTestDb()`

9. **`apps/api/src/test/utils/test-context.ts`**
   - Purpose: Mock context utilities for API tests
   - Exports: `createMockContext()`, `createAdminContext()`, `createUserContext()`

10. **`apps/api/src/test/fixtures/users.ts`**
    - Purpose: User test fixtures for API tests
    - Exports: `createTestUser()`, user fixtures

11. **`apps/admin/lib/test/utils/test-db.ts`**
    - Purpose: pglite setup for admin database tests (if not exists)
    - Exports: `setupTestDb()`, `teardownTestDb()`, `resetTestDb()`

12. **`apps/admin/lib/test/utils/test-context.ts`**
    - Purpose: Mock context utilities for admin tests (if not exists)
    - Exports: `createMockContext()`, `createAdminContext()`

### Modified Files - Test Configuration

13. **`apps/web/vitest.config.ts`**
    - Purpose: Update Vitest config for coverage reporting
    - Changes: Add coverage provider, thresholds, reporting

14. **`apps/api/vitest.config.ts`**
    - Purpose: Update Vitest config for coverage reporting
    - Changes: Add coverage provider, thresholds, reporting

15. **`apps/admin/vitest.config.ts`**
    - Purpose: Update Vitest config for coverage reporting (if not exists)
    - Changes: Add coverage provider, thresholds, reporting

16. **`libs/business/vitest.config.ts`**
    - Purpose: Update Vitest config for coverage reporting
    - Changes: Add coverage provider, thresholds, reporting

17. **`libs/ui/vitest.config.ts`**
    - Purpose: Update Vitest config for coverage reporting
    - Changes: Add coverage provider, thresholds, reporting

### New Files - Test Coverage (Priority Order)

**Tier 1: Critical Business Logic**

18. **`libs/business/src/services/auth.service.spec.ts`** (if not exists)
19. **`libs/business/src/services/subscription.service.spec.ts`** (if not exists)
20. **`libs/business/src/services/generation.service.spec.ts`** (if not exists)
21. **`apps/api/src/modules/auth/services/auth.service.spec.ts`** (if not exists)
22. **`apps/api/src/modules/image/services/studio-generation.service.spec.ts`** (if not exists)

**Tier 2: Core Features**

23. **`libs/business/src/services/comfyui-websocket-client.spec.ts`** (complete if partial)
24. **`libs/business/src/services/comfyui-job-persistence.service.spec.ts`** (verify complete)
25. **`libs/business/src/services/comfyui-error-handler.service.spec.ts`** (verify complete)

**Tier 3: Supporting Features**

26. Additional service tests as needed

**Tier 1: UI Components**

27. **`libs/ui/src/components/Button.spec.tsx`** (if not exists)
28. **`libs/ui/src/components/Modal.spec.tsx`** (if not exists)
29. **`apps/web/components/auth/AuthModal.spec.tsx`** (if not exists)
30. **`apps/web/components/studio/StudioGallery.spec.tsx`** (if not exists)

**Tier 1: tRPC Routers**

31. **`apps/api/lib/trpc/routers/auth.router.spec.ts`** (if not exists)
32. **`apps/api/lib/trpc/routers/generation.router.spec.ts`** (if not exists)
33. **`apps/admin/lib/trpc/routers/admins.router.spec.ts`** (complete if partial)
34. **`apps/admin/lib/trpc/routers/users.router.spec.ts`** (complete if partial)

---

## Technical Specification

### Dependencies

**Existing Dependencies:**
- `vitest` - Test framework (already installed)
- `@testing-library/react` - React component testing (already installed)
- `@testing-library/jest-dom` - DOM matchers (already installed)
- `msw` - Mock Service Worker (already installed)
- `pglite` - In-memory PostgreSQL (already installed)
- `@vitest/coverage-v8` - Coverage provider (may need to install)

**New Dependencies:**
- `@vitest/coverage-v8` - If not already installed

### Environment Variables

No new environment variables required. Tests use test environment configuration.

### Logic Flows

#### Flow 1: Test Execution

```
1. Developer runs: pnpm nx test {project}
   ↓
2. Vitest loads test files
   ↓
3. Global setup runs (MSW, mocks)
   ↓
4. Tests execute (isolated)
   ↓
5. Coverage calculated
   ↓
6. Coverage threshold checked
   ↓
7. Results reported
```

#### Flow 2: Database Integration Test

```
1. Test file loads
   ↓
2. setupTestDb() creates pglite instance
   ↓
3. Schema synced (drizzle-kit push)
   ↓
4. Test runs with real database
   ↓
5. resetTestDb() cleans up
   ↓
6. teardownTestDb() closes connection
```

#### Flow 3: Component Test with MSW

```
1. Test file loads
   ↓
2. setupMSW() starts MSW server
   ↓
3. Component renders
   ↓
4. User interaction (click, type)
   ↓
5. MSW intercepts API call
   ↓
6. Mock response returned
   ↓
7. Component updates
   ↓
8. Assertions verify behavior
```

---

## Task Breakdown

### ST-001: Test Infrastructure Setup

**Story**: Create standardized test utilities and fixtures across all apps

**Tasks**:
- **TSK-001**: Create `apps/web/lib/test/utils/test-db.ts` with pglite setup
- **TSK-002**: Create `apps/web/lib/test/utils/test-context.ts` with context mocking
- **TSK-003**: Create `apps/web/lib/test/utils/test-helpers.ts` with common utilities
- **TSK-004**: Create `apps/web/lib/test/fixtures/users.ts` with user factories
- **TSK-005**: Create `apps/web/lib/test/fixtures/influencers.ts` with influencer factories
- **TSK-006**: Create `apps/web/lib/test/fixtures/images.ts` with image factories
- **TSK-007**: Create `apps/web/lib/test/setup.ts` with MSW setup
- **TSK-008**: Create `apps/api/src/test/utils/test-db.ts` with pglite setup
- **TSK-009**: Create `apps/api/src/test/utils/test-context.ts` with context mocking
- **TSK-010**: Create `apps/api/src/test/fixtures/users.ts` with user factories
- **TSK-011**: Update `apps/web/vitest.config.ts` with coverage configuration
- **TSK-012**: Update `apps/api/vitest.config.ts` with coverage configuration
- **TSK-013**: Update `apps/admin/vitest.config.ts` with coverage configuration
- **TSK-014**: Update `libs/business/vitest.config.ts` with coverage configuration
- **TSK-015**: Update `libs/ui/vitest.config.ts` with coverage configuration

**Acceptance Criteria**:
- ✅ Test utilities available in all apps
- ✅ Test fixtures and factories available
- ✅ MSW setup configured for frontend tests
- ✅ pglite setup available for database tests
- ✅ Coverage reporting configured
- ✅ Coverage thresholds enforced (80%+)

**Dependencies**: None

---

### ST-002: Critical Business Logic Test Coverage

**Story**: Achieve 80%+ test coverage for critical business logic services

**Tasks**:
- **TSK-016**: Create/complete `libs/business/src/services/auth.service.spec.ts`
- **TSK-017**: Create/complete `libs/business/src/services/subscription.service.spec.ts`
- **TSK-018**: Create/complete `libs/business/src/services/generation.service.spec.ts`
- **TSK-019**: Create/complete `apps/api/src/modules/auth/services/auth.service.spec.ts`
- **TSK-020**: Create/complete `apps/api/src/modules/image/services/studio-generation.service.spec.ts`
- **TSK-021**: Complete `libs/business/src/services/comfyui-websocket-client.spec.ts` (if partial)
- **TSK-022**: Verify `libs/business/src/services/comfyui-job-persistence.service.spec.ts` is complete
- **TSK-023**: Verify `libs/business/src/services/comfyui-error-handler.service.spec.ts` is complete

**Acceptance Criteria**:
- ✅ All critical business logic services have test files
- ✅ 80%+ code coverage for business logic
- ✅ Critical paths tested (happy + edge cases)
- ✅ Error handling tested
- ✅ All tests passing in CI/CD

**Dependencies**: ST-001

---

### ST-003: UI Component Test Coverage

**Story**: Achieve 80%+ test coverage for shared UI components

**Tasks**:
- **TSK-024**: Create `libs/ui/src/components/Button.spec.tsx`
- **TSK-025**: Create `libs/ui/src/components/Modal.spec.tsx`
- **TSK-026**: Create `apps/web/components/auth/AuthModal.spec.tsx`
- **TSK-027**: Create `apps/web/components/studio/StudioGallery.spec.tsx`
- **TSK-028**: Complete existing component tests (verify coverage)

**Acceptance Criteria**:
- ✅ All shared UI components have test files
- ✅ User interactions tested
- ✅ State changes tested
- ✅ MSW used for network mocking
- ✅ Error states tested
- ✅ 80%+ code coverage for UI components
- ✅ All tests passing in CI/CD

**Dependencies**: ST-001

---

### ST-004: tRPC Router Test Coverage

**Story**: Achieve 80%+ test coverage for all tRPC routers

**Tasks**:
- **TSK-029**: Create `apps/api/lib/trpc/routers/auth.router.spec.ts`
- **TSK-030**: Create `apps/api/lib/trpc/routers/generation.router.spec.ts`
- **TSK-031**: Complete `apps/admin/lib/trpc/routers/admins.router.spec.ts`
- **TSK-032**: Complete `apps/admin/lib/trpc/routers/users.router.spec.ts`
- **TSK-033**: Complete remaining admin router tests (verify coverage)

**Acceptance Criteria**:
- ✅ All tRPC routers have test files
- ✅ All procedures tested
- ✅ Permission checks tested
- ✅ Input validation tested
- ✅ Error handling tested
- ✅ 80%+ code coverage for routers
- ✅ All tests passing in CI/CD

**Dependencies**: ST-001

---

### ST-005: Coverage Reporting and CI Integration

**Story**: Integrate coverage reporting into CI/CD pipeline

**Tasks**:
- **TSK-034**: Configure coverage reporting in all vitest configs
- **TSK-035**: Set coverage thresholds (80%+ for business logic)
- **TSK-036**: Add coverage reporting to CI/CD workflow
- **TSK-037**: Add coverage status checks to PRs
- **TSK-038**: Document coverage requirements

**Acceptance Criteria**:
- ✅ Coverage reporting configured
- ✅ Coverage thresholds enforced
- ✅ Coverage reports in CI/CD
- ✅ Coverage visible in PRs
- ✅ Coverage trends tracked

**Dependencies**: ST-001, ST-002, ST-003, ST-004

---

## Implementation Order

1. **Week 1**: ST-001 (Test Infrastructure Setup)
2. **Week 2-3**: ST-002 (Critical Business Logic Tests)
3. **Week 4**: ST-003 (UI Component Tests)
4. **Week 5**: ST-004 (tRPC Router Tests)
5. **Week 6**: ST-005 (Coverage Reporting)

---

## Tracking Plan

### Coverage Tracking

- **Business Logic**: Track coverage for `libs/business` and `apps/api/src/services`
- **UI Components**: Track coverage for `libs/ui` and `apps/web/components`
- **tRPC Routers**: Track coverage for all router files
- **Overall**: Track overall project coverage

### Test Execution Tracking

- **Test Count**: Track number of tests
- **Pass Rate**: Track test pass rate (target: 95%+)
- **Execution Time**: Track test execution time (target: < 5 min)
- **Flaky Tests**: Track flaky test rate (target: < 1%)

---

## Related Documentation

- Epic: `docs/requirements/epics/mvp/EP-062-unit-test-infrastructure-coverage.md`
- Architecture: `docs/architecture/epics/EP-062-unit-test-infrastructure-architecture.md`
- Test File Structure: `docs/specs/epics/EP-062-unit-test-infrastructure-ui-skeleton.md`
- Testing Standards: `.cursor/rules/testing-standards.mdc`
- Best Practices: `docs/testing/BEST-PRACTICES.md`

---

**Last Updated**: 2026-01-27
