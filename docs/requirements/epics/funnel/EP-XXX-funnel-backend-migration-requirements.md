# EP-XXX: Funnel Backend Migration - Requirements

**Initiative**: [IN-032](../../../initiatives/IN-032-funnel-supabase-to-backend-migration.md)  
**Status**: P1-P2 - Requirements & Scoping  
**Created**: 2026-01-28  
**Last Updated**: 2026-01-28

---

## Problem Statement

The funnel app currently uses Supabase for session and option storage, creating data fragmentation and infrastructure complexity. Funnel session data exists in Supabase while the rest of the platform uses the backend API and Postgres database. This prevents unified data access, increases operational overhead, and adds unnecessary costs.

**Who has this problem**: 
- Engineering team needs unified data architecture
- Backend team needs access to funnel analytics
- Product team needs unified user journey tracking
- Business needs cost reduction (Supabase elimination)

**Why it matters**: 
- Data silos prevent cross-platform analytics
- Dual database systems increase complexity and costs
- Can't easily correlate funnel data with user accounts or payments
- Development friction from maintaining two different data access patterns

---

## MVP Objective

Migrate funnel app from Supabase to backend API, enabling unified data access and eliminating Supabase dependency. All funnel session and option operations must work identically to current Supabase implementation, with zero downtime and no data loss.

**Measurable outcomes**:
- 100% of Supabase operations replaced with backend API calls
- Zero Supabase dependencies in funnel app codebase
- All existing session IDs continue to work
- Session operations complete in < 100ms (same as Supabase)
- Zero data loss during migration
- Backend API provides all required funnel endpoints

---

## Non-Goals

**Explicitly out of scope for this epic**:
- Changing session ID format or structure
- Modifying funnel user experience
- Adding new funnel features
- Changing authentication flow
- Performance optimization (beyond maintaining current performance)

---

## Features

### F1: Backend Database Schema
**Description**: Create database tables for funnel sessions and options in main Postgres database

**User Story**: As a backend developer, I need funnel session and option tables in the main database so that all platform data is unified.

**Acceptance Criteria**:
- [ ] `funnel_sessions` table created with all required fields
- [ ] `funnel_options` table created with all required fields
- [ ] Foreign key relationships properly defined
- [ ] Indexes created for performance (session_id, option_key)
- [ ] Migration script created and tested
- [ ] Schema matches Supabase structure (for data compatibility)

### F2: Backend tRPC Router
**Description**: Create tRPC router with endpoints for all funnel operations

**User Story**: As a frontend developer, I need tRPC endpoints for funnel operations so that I can replace Supabase calls with backend API calls.

**Acceptance Criteria**:
- [ ] `funnelRouter` created in `libs/trpc/src/routers/`
- [ ] `createSession` procedure implemented
- [ ] `updateSession` procedure implemented
- [ ] `getSession` procedure implemented
- [ ] `saveOption` procedure implemented
- [ ] `saveAllOptions` procedure implemented
- [ ] `getSessionOptions` procedure implemented
- [ ] All procedures support anonymous sessions (no auth required)
- [ ] Error handling matches Supabase behavior
- [ ] Response types match current Supabase types

### F3: Backend Services
**Description**: Create business logic services for funnel operations

**User Story**: As a backend developer, I need services to handle funnel business logic so that operations are properly validated and processed.

**Acceptance Criteria**:
- [ ] `FunnelSessionService` created in `libs/business/src/services/`
- [ ] `FunnelOptionService` created in `libs/business/src/services/`
- [ ] Services use data layer repositories
- [ ] Business logic validates inputs
- [ ] Services handle errors appropriately
- [ ] Services are unit tested

### F4: Frontend API Client
**Description**: Update funnel app to use backend API instead of Supabase

**User Story**: As a funnel user, I need the funnel to work exactly as before, but using the backend API instead of Supabase.

**Acceptance Criteria**:
- [ ] `session-service.ts` updated to use backend API
- [ ] All Supabase client calls replaced with API calls
- [ ] Session ID generation logic preserved
- [ ] Error handling matches current behavior
- [ ] Development mode behavior preserved (optional API calls)
- [ ] All existing functions maintain same signatures
- [ ] TypeScript types maintained

### F5: Supabase Removal
**Description**: Remove all Supabase dependencies from funnel app

**User Story**: As a developer, I need Supabase completely removed so that we have a single data architecture.

**Acceptance Criteria**:
- [ ] `@supabase/ssr` package removed from `package.json`
- [ ] All Supabase imports removed from codebase
- [ ] `utils/supabase/` directory removed
- [ ] Supabase environment variables removed from `.env.example`
- [ ] Supabase documentation removed/updated
- [ ] No Supabase references in code comments

### F6: Data Migration (if needed)
**Description**: Migrate existing Supabase data to main database (if production data exists)

**User Story**: As a business stakeholder, I need existing funnel data preserved so that analytics and user tracking continue to work.

**Acceptance Criteria**:
- [ ] Migration script created to copy Supabase data
- [ ] Data validation script ensures no data loss
- [ ] Migration tested in staging environment
- [ ] Production migration plan documented
- [ ] Rollback plan documented

---

## Acceptance Criteria Summary

### AC-1: Backend Infrastructure
- [ ] Database schema created and migrated
- [ ] tRPC router implemented with all endpoints
- [ ] Services created with business logic
- [ ] All backend code tested and passing

### AC-2: Frontend Migration
- [ ] Funnel app uses backend API for all operations
- [ ] No Supabase dependencies remain
- [ ] All existing functionality works identically
- [ ] TypeScript types maintained

### AC-3: Data Integrity
- [ ] Existing session IDs continue to work
- [ ] No data loss during migration
- [ ] Data validation confirms integrity
- [ ] Rollback plan tested

### AC-4: Performance
- [ ] Session operations complete in < 100ms
- [ ] API response times match Supabase performance
- [ ] No performance regressions

### AC-5: Documentation
- [ ] Supabase setup docs removed/updated
- [ ] Backend API docs created
- [ ] Migration guide documented
- [ ] Architecture docs updated

---

## Analytics Events

**N/A** - This is an infrastructure migration, not a user-facing feature. No new analytics events required.

---

## Non-MVP Items

**Explicitly deferred**:
- Funnel analytics dashboard (separate epic)
- Advanced session querying features
- Session expiration/cleanup automation
- Real-time session updates (WebSocket)
- Session data export functionality

---

## Business Metric

**Target Metric**: E-CAC (Cost Reduction), C-Core Value (Unified Data), B-Retention (Better Analytics)

**Expected Impact**:
- **E-CAC**: Eliminate Supabase costs (~$25-50/month)
- **C-Core Value**: Unified data enables better analytics and user experience
- **B-Retention**: Better data consistency improves user experience

---

## Dependencies

- **Backend API**: tRPC infrastructure (✅ exists)
- **Database**: Postgres access (✅ exists)
- **Authentication**: Anonymous session support (may need updates)

---

## Risks

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Data loss during migration | Low | High | Comprehensive testing, backup, validation |
| Performance degradation | Medium | Medium | Load testing, query optimization |
| Breaking API changes | Low | High | Version API, backward compatibility |
| Anonymous session support | Medium | Medium | Design auth system, test thoroughly |

---

**Next Phase**: P3 - Architecture
