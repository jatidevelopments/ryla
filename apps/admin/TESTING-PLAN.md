# Admin Panel Testing Plan

## Context

**Working in PHASE 7 – Testing** on Admin Panel implementation.

**Problem Statement:**
Many admin operations are failing in the backend. We need comprehensive test coverage to:
1. Identify and fix failing operations
2. Prevent regressions
3. Ensure reliability of admin panel features

**MVP Objective:**
Achieve 80%+ test coverage for all admin tRPC routers and critical frontend flows, with all tests passing.

**Business Metric:** 
- **C**: Core Value - Admin operations must be reliable
- **D**: Conversion - Admin efficiency affects platform operations

---

## Phase 7: Testing Plan

### Inputs Available ✅
- [x] All 15 tRPC routers implemented
- [x] All 15 pages implemented
- [x] Database schemas defined
- [x] Authentication flow working
- [x] Testing standards documented

### Testing Strategy

Following the **Testing Pyramid**:
1. **Unit Tests** (70%) - Fast, isolated tests for routers and utilities
2. **Integration Tests** (20%) - Test router + database interactions
3. **E2E Tests** (10%) - Critical user flows with Playwright

---

## Phase 7.1: Test Infrastructure Setup

### Tasks

1. **Create Test Utilities**
   - [ ] `apps/admin/lib/test/utils/test-db.ts` - pglite setup for admin tables
   - [ ] `apps/admin/lib/test/utils/test-context.ts` - Mock admin context for tRPC
   - [ ] `apps/admin/lib/test/utils/test-helpers.ts` - Common test utilities
   - [ ] `apps/admin/lib/test/setup.ts` - Global test setup

2. **Update Vitest Config**
   - [ ] Add pglite support
   - [ ] Configure path aliases
   - [ ] Set up coverage reporting
   - [ ] Add MSW setup for frontend tests

3. **Create Test Fixtures**
   - [ ] Admin user fixtures
   - [ ] Test data factories
   - [ ] Mock data generators

---

## Phase 7.2: Backend Tests (tRPC Routers)

### Priority Order (Critical First)

#### Tier 1: Core Operations (Week 1)
1. **auth.router.spec.ts** - Authentication & session management
2. **admins.router.spec.ts** - Admin user CRUD (super_admin only)
3. **users.router.spec.ts** - User management operations
4. **audit.router.spec.ts** - Audit log queries

#### Tier 2: Business Operations (Week 2)
5. **billing.router.spec.ts** - Credits & subscriptions
6. **content.router.spec.ts** - Content moderation
7. **jobs.router.spec.ts** - Generation job management
8. **bug-reports.router.spec.ts** - Bug report handling

#### Tier 3: Analytics & Configuration (Week 3)
9. **stats.router.spec.ts** - Dashboard statistics
10. **analytics.router.spec.ts** - Analytics queries
11. **system.router.spec.ts** - System health
12. **flags.router.spec.ts** - Feature flag management
13. **config.router.spec.ts** - System configuration
14. **notifications.router.spec.ts** - Broadcast notifications

#### Tier 4: Advanced Features (Week 4)
15. **library.router.spec.ts** - Template library
16. **lora.router.spec.ts** - LoRA model management

### Test Structure Per Router

Each router test file should cover:

```typescript
describe('{RouterName}Router', () => {
  describe('permissions', () => {
    it('should require authentication')
    it('should check role permissions')
    it('should reject unauthorized access')
  })

  describe('{procedureName}', () => {
    it('should succeed with valid input')
    it('should fail with invalid input')
    it('should handle edge cases')
    it('should audit log actions')
  })
})
```

---

## Phase 7.3: Frontend Tests

### Priority Order

#### Tier 1: Critical Flows
1. **auth-context.spec.tsx** - Authentication context logic
2. **login/page.spec.tsx** - Login flow
3. **dashboard/page.spec.tsx** - Dashboard data loading

#### Tier 2: Core Pages
4. **users/page.spec.tsx** - User list & filters
5. **billing/page.spec.tsx** - Billing operations
6. **content/page.spec.tsx** - Content moderation actions

#### Tier 3: Management Pages
7. **admins/page.spec.tsx** - Admin user management
8. **flags/page.spec.tsx** - Feature flag UI
9. **config/page.spec.tsx** - System config UI

### Frontend Test Structure

```typescript
describe('{PageName}Page', () => {
  describe('data loading', () => {
    it('should load data on mount')
    it('should show loading state')
    it('should handle errors')
  })

  describe('user interactions', () => {
    it('should handle form submissions')
    it('should update filters')
    it('should navigate on actions')
  })
})
```

---

## Phase 7.4: Integration Tests

### Critical Flows to Test

1. **Authentication Flow**
   - Login → Validate → Access protected route → Logout

2. **User Management Flow**
   - List users → View user detail → Update user → Audit log created

3. **Content Moderation Flow**
   - List images → Flag image → Review flag → Audit log created

4. **Admin User Management Flow**
   - List admins → Create admin → Update admin → Delete admin → Audit log

---

## Phase 7.5: E2E Tests (Playwright)

### Critical User Journeys

1. **Admin Login Journey**
   - Navigate to login → Enter credentials → Access dashboard

2. **User Management Journey**
   - Navigate to users → Search → View detail → Update status

3. **Content Moderation Journey**
   - Navigate to content → Filter → Flag image → Verify flag

---

## Implementation Plan

### Week 1: Infrastructure + Tier 1 Backend
- [ ] Set up test infrastructure
- [ ] Create test utilities
- [ ] Write auth router tests
- [ ] Write admins router tests
- [ ] Write users router tests
- [ ] Write audit router tests

### Week 2: Tier 2 Backend + Tier 1 Frontend
- [ ] Write billing router tests
- [ ] Write content router tests
- [ ] Write jobs router tests
- [ ] Write bug-reports router tests
- [ ] Write auth context tests
- [ ] Write login page tests

### Week 3: Tier 3 Backend + Tier 2 Frontend
- [ ] Write stats/analytics/system router tests
- [ ] Write flags/config/notifications router tests
- [ ] Write dashboard page tests
- [ ] Write users/billing/content page tests

### Week 4: Tier 4 Backend + Integration + E2E
- [ ] Write library/lora router tests
- [ ] Write remaining frontend tests
- [ ] Write integration tests
- [ ] Write E2E tests

---

## Acceptance Criteria

### Backend Tests
- [ ] All 15 routers have test files
- [ ] Each router has permission tests
- [ ] Each procedure has success/failure tests
- [ ] Edge cases covered
- [ ] Audit logging verified
- [ ] 80%+ code coverage

### Frontend Tests
- [ ] Critical pages have test files
- [ ] Data loading tested
- [ ] User interactions tested
- [ ] Error states tested
- [ ] MSW used for API mocking

### Integration Tests
- [ ] Critical flows tested end-to-end
- [ ] Database interactions verified
- [ ] Audit logging verified

### E2E Tests
- [ ] Login flow tested
- [ ] Key user journeys tested
- [ ] All tests passing

---

## File Structure

```
apps/admin/
├── lib/
│   ├── test/
│   │   ├── utils/
│   │   │   ├── test-db.ts          # pglite setup
│   │   │   ├── test-context.ts     # Mock admin context
│   │   │   └── test-helpers.ts     # Common utilities
│   │   ├── fixtures/
│   │   │   ├── admin-users.ts      # Admin user fixtures
│   │   │   └── test-data.ts        # Test data factories
│   │   └── setup.ts                # Global test setup
│   └── trpc/
│       └── routers/
│           ├── admins.router.spec.ts
│           ├── users.router.spec.ts
│           └── ... (all routers)
├── app/
│   ├── (admin)/
│   │   ├── dashboard/
│   │   │   └── page.spec.tsx
│   │   └── ... (all pages)
│   └── api/
│       └── auth/
│           ├── login/
│           │   └── route.spec.ts
│           └── validate/
│               └── route.spec.ts
└── vitest.config.ts                 # Updated config
```

---

## Next Steps

1. **Create test infrastructure** (Phase 7.1)
2. **Start with Tier 1 backend tests** (Phase 7.2)
3. **Iterate and fix failing operations** as tests reveal issues
4. **Continue with remaining tiers**
5. **Add frontend tests**
6. **Add integration and E2E tests**

---

## Success Metrics

- ✅ All tests passing
- ✅ 80%+ code coverage
- ✅ No failing operations in backend
- ✅ All critical flows tested
- ✅ Tests run in CI/CD
