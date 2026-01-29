# [INITIATIVE] IN-032: Funnel Supabase to Backend Migration

**Status**: Active  
**Created**: 2026-01-28  
**Last Updated**: 2026-01-28  
**Owner**: Engineering Team  
**Stakeholders**: Backend Team, Frontend Team, DevOps Team

---

## Executive Summary

**One-sentence description**: Migrate the funnel app from Supabase to use the RYLA backend API and database, eliminating external dependencies and centralizing data management.

**Business Impact**: E-CAC (reduce Supabase costs), C-Core Value (unified data architecture), B-Retention (better data consistency), A-Activation (simplified infrastructure)

---

## Why (Business Rationale)

### Problem Statement

**Current Pain Points**:
- **Dual Database Systems**: Funnel app uses Supabase while rest of platform uses backend API + Postgres
- **Data Fragmentation**: Funnel session data is isolated in Supabase, not accessible from main backend
- **Infrastructure Complexity**: Managing two separate database systems increases operational overhead
- **Cost Inefficiency**: Paying for Supabase when we already have backend infrastructure
- **Development Friction**: Developers need to understand both Supabase and backend patterns
- **Limited Integration**: Can't easily join funnel data with user data, payments, or other platform data

**Key Pain Points**:
- Funnel session data exists in Supabase, user data in main DB → Can't easily correlate
- Payment tracking happens in backend, but funnel sessions in Supabase → Data silos
- Need to query funnel analytics → Requires accessing two different systems
- Want to link funnel sessions to user accounts → Requires complex cross-system queries

### Current State

**Funnel App Current Architecture**:
- ✅ Uses Supabase client (`@supabase/ssr`) for database operations
- ✅ Stores `funnel_sessions` table in Supabase
- ✅ Stores `funnel_options` table in Supabase
- ✅ Session service (`session-service.ts`) directly queries Supabase
- ✅ Disabled in development by default (prevents test data pollution)
- ✅ Uses Supabase anon key for client-side access

**Backend API Current Architecture**:
- ✅ Uses Drizzle ORM with direct Postgres access
- ✅ tRPC routers for all API endpoints
- ✅ No Supabase dependency (explicitly removed)
- ✅ Centralized authentication and authorization
- ✅ Unified data access layer

**What's Missing**:
- ❌ No funnel session management in backend API
- ❌ No funnel router in tRPC
- ❌ No database schema for funnel tables in main DB
- ❌ Funnel app can't use backend API for sessions

### Desired State

**Target Architecture**:
- ✅ Funnel app uses backend API (tRPC or REST) for all data operations
- ✅ Funnel sessions stored in main Postgres database
- ✅ Funnel data accessible from backend/admin tools
- ✅ Unified authentication and authorization
- ✅ Single source of truth for all platform data
- ✅ No Supabase dependency in funnel app
- ✅ Simplified infrastructure (one database system)

### Business Drivers

- **Revenue Impact**: Better data integration enables better analytics and conversion tracking
- **Cost Impact**: Eliminate Supabase costs (~$25-50/month), reduce infrastructure complexity
- **Risk Mitigation**: Single database reduces data consistency risks, simplifies backup/restore
- **Competitive Advantage**: Unified data enables better user experience and analytics
- **User Experience**: Faster queries, better data consistency, unified user experience

---

## How (Approach & Strategy)

### Strategy

**Incremental Migration Approach**:
1. **Phase 1**: Create backend infrastructure (database schema, tRPC router, services)
2. **Phase 2**: Implement backend API endpoints for funnel operations
3. **Phase 3**: Update funnel app to use backend API instead of Supabase
4. **Phase 4**: Migrate existing Supabase data (if needed)
5. **Phase 5**: Remove Supabase dependencies and clean up

### Key Principles

- **Zero Downtime**: Migration must not disrupt active funnel sessions
- **Backward Compatibility**: Support existing session IDs and data structures
- **Incremental Rollout**: Test thoroughly before removing Supabase
- **Data Preservation**: Ensure no data loss during migration
- **Type Safety**: Maintain TypeScript types throughout migration

### Phases

1. **Phase 1: Backend Infrastructure** - Create database schema, tRPC router, services (P3-P5)
2. **Phase 2: API Implementation** - Implement all funnel endpoints (P5-P6)
3. **Phase 3: Frontend Migration** - Update funnel app to use backend API (P6)
4. **Phase 4: Data Migration** - Migrate existing Supabase data (if needed) (P7)
5. **Phase 5: Cleanup** - Remove Supabase dependencies, update docs (P8-P9)

### Dependencies

- **Backend API**: Must have tRPC router infrastructure (✅ exists)
- **Database**: Must have Postgres access (✅ exists)
- **Authentication**: Backend auth must support anonymous sessions (may need updates)

### Constraints

- **Must maintain session ID format**: Existing session IDs must continue to work
- **Must support anonymous sessions**: Funnel users may not be authenticated
- **Must handle high volume**: Funnel can have many concurrent sessions
- **Must be performant**: Session operations must be fast (< 100ms)

---

## When (Timeline & Priority)

### Timeline

- **Start Date**: 2026-01-28
- **Target Completion**: 2026-02-15
- **Key Milestones**:
  - Backend infrastructure complete: 2026-02-05
  - Frontend migration complete: 2026-02-10
  - Supabase removal complete: 2026-02-15

### Priority

**Priority Level**: P1

**Rationale**: 
- Reduces infrastructure costs
- Simplifies architecture
- Enables better data integration
- Reduces operational complexity

### Resource Requirements

- **Team**: Backend Team (API/router), Frontend Team (funnel app), DevOps (migration)
- **Budget**: No additional budget required (saves Supabase costs)
- **External Dependencies**: None

---

## Who (Stakeholders & Ownership)

### Initiative Owner

**Name**: Engineering Team  
**Role**: Engineering  
**Responsibilities**: Overall initiative execution, coordination between teams

### Key Stakeholders

| Name | Role | Involvement | Responsibilities |
|------|------|-------------|------------------|
| Backend Team | Backend Development | High | Create API endpoints, database schema |
| Frontend Team | Frontend Development | High | Update funnel app to use backend API |
| DevOps Team | Infrastructure | Medium | Database migration, deployment |
| Product Team | Product | Low | Validate data access, analytics |

### Teams Involved

- **Backend Team**: Create funnel router, database schema, services
- **Frontend Team**: Update funnel app session service, remove Supabase
- **DevOps Team**: Database migration, deployment coordination

### Communication Plan

- **Updates Frequency**: Weekly
- **Update Format**: Status update in initiative doc, Slack notification
- **Audience**: Engineering team, stakeholders

---

## Success Criteria

### Primary Success Metrics

| Metric | Target | Measurement Method | Timeline |
|--------|--------|-------------------|----------|
| Supabase dependency removed | 100% removal | Code audit, package.json check | End of migration |
| Backend API coverage | 100% of Supabase operations | API endpoint coverage | End of migration |
| Data migration success | 100% data preserved | Data comparison, validation | End of migration |
| Zero downtime | 0 session disruptions | Monitoring, error tracking | Throughout migration |

### Business Metrics Impact

**Target Metric**: [x] A-Activation [x] B-Retention [x] C-Core Value [ ] D-Conversion [x] E-CAC

**Expected Impact**:
- **E-CAC**: Eliminate Supabase costs (~$25-50/month)
- **C-Core Value**: Unified data enables better analytics and user experience
- **B-Retention**: Better data consistency improves user experience
- **A-Activation**: Simplified infrastructure reduces friction

### Leading Indicators

- Backend API endpoints created and tested
- Funnel app successfully using backend API in development
- No Supabase errors in logs
- Session operations working correctly

### Lagging Indicators

- Supabase dependency completely removed
- All funnel data accessible from backend
- Cost reduction confirmed (Supabase bill eliminated)
- No data loss or session disruptions

---

## Definition of Done

### Initiative Complete When:

- [ ] Backend database schema created and migrated
- [ ] tRPC funnel router implemented with all endpoints
- [ ] Funnel app updated to use backend API
- [ ] All Supabase dependencies removed from funnel app
- [ ] Existing Supabase data migrated (if applicable)
- [ ] Tests passing for both backend and frontend
- [ ] Documentation updated (removed Supabase references)
- [ ] Deployment successful to production
- [ ] Supabase project can be decommissioned
- [ ] Cost savings confirmed

### Not Done Criteria

**This initiative is NOT done if:**
- [ ] Supabase still referenced in funnel app code
- [ ] Funnel sessions still stored in Supabase
- [ ] Backend API missing any required endpoints
- [ ] Data migration incomplete or data loss occurred
- [ ] Tests failing
- [ ] Documentation not updated

---

## Related Work

### Epics

| Epic | Name | Status | Link |
|------|------|--------|------|
| TBD | Funnel Backend API Implementation | TBD | TBD |
| TBD | Funnel Frontend Migration | TBD | TBD |

### Dependencies

- **Blocks**: Future funnel analytics features (need unified data)
- **Blocked By**: None
- **Related Initiatives**: 
  - IN-023 (Fly.io Deployment) - May affect deployment process
  - IN-026 (Comprehensive Testing) - Testing infrastructure needed

### Documentation

- Funnel Supabase Setup: `apps/funnel/docs/SUPABASE_SETUP.md` (to be removed/updated)
- Backend API Design: `docs/specs/general/API-DESIGN.md`
- Database Schema: `libs/data/src/schema/`

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|-------------------|
| Data loss during migration | Low | High | Comprehensive testing, backup before migration, validate data integrity |
| Performance degradation | Medium | Medium | Load testing, optimize queries, use indexes |
| Breaking changes in API | Low | High | Version API, maintain backward compatibility, thorough testing |
| Anonymous session support | Medium | Medium | Design auth system to support anonymous sessions, test thoroughly |
| Deployment issues | Low | Medium | Staged rollout, feature flags, rollback plan |

---

## Progress Tracking

### Current Phase

**Phase**: P9 - Deployment  
**Status**: On Track

### Recent Updates

- **2026-01-28**: Initiative created, problem statement defined
- **2026-01-28**: P1-P5 completed - Requirements, architecture, and technical spec
- **2026-01-28**: P6 completed - Backend infrastructure and frontend migration implemented
- **2026-01-28**: P7 completed - Tests updated to use backend API mocks
- **2026-01-28**: P8 completed - Database migrations applied successfully, tables verified
- **2026-01-28**: P9 in progress - Deployment configuration and staging validation

### Next Steps

1. ✅ Database migration applied to development database
2. Deploy to staging environment
3. Test end-to-end funnel flow in staging
4. Verify all operations work correctly
5. Deploy to production
6. Remove Supabase project (after production validation)

---

## Lessons Learned

[To be filled during/after initiative completion]

### What Went Well

- [To be filled]

### What Could Be Improved

- [To be filled]

### Recommendations for Future Initiatives

- [To be filled]

---

## References

- Funnel Supabase Setup: `apps/funnel/docs/SUPABASE_SETUP.md`
- Backend API Design: `docs/specs/general/API-DESIGN.md`
- tRPC Router Patterns: `libs/trpc/src/routers/`
- Database Schema Patterns: `libs/data/src/schema/`

---

**Template Version**: 1.0  
**Last Template Update**: 2026-01-28
