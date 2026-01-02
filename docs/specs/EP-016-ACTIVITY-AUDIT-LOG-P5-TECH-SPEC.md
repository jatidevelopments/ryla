# EP-016 (P5) — Activity: Tech Spec (File Plan + Tasks)

Working in **PHASE P5 (File plan + tasks)** on **EP-016, ST-046**.

## Scope (MVP)

- New authenticated page: `/activity`
- Side navigation link to Activity
- Activity feed derived from:
  - `generation_jobs`
  - `credit_transactions`
- Filters: date range + type (all/generation/credits)
- Detail drawer (no extra fetch required in MVP)
- Analytics capture (PostHog via `@ryla/analytics`)

Out of scope (MVP):
- Persisted `activity_log` table
- Download/export activity events
- CSV export

---

## API Contract (tRPC)

### `activity.list`

Input:
- `limit?: number` (default 50, max 100)
- `cursor?: { occurredAt: string; sourceType: 'generation_job'|'credit_transaction'; sourceId: string }`
- `dateRange?: 'last_7_days' | 'last_30_days' | 'all_time'` (default last_30_days)
- `typeFilter?: 'all' | 'generation' | 'credits'` (default all)

Output:
- `items: ActivityItem[]` (sorted by `occurredAt desc`)
- `nextCursor?: { occurredAt: string; sourceType: ...; sourceId: string }`

---

## File Plan

### Data (libs/data)

- **Add** `libs/data/src/repositories/activity.repository.ts`
  - `listGenerationJobsForActivity(userId, { since, cursor, limit })`
  - `listCreditTransactionsForActivity(userId, { since, cursor, limit })`
- **Update** `libs/data/src/repositories/index.ts` exports

### Business (libs/business)

- **Add** `libs/business/src/services/activity.service.ts`
  - `listActivity(userId, filters, pagination) -> { items, nextCursor }`
  - maps DB rows to `ActivityItem` DTO
  - merges + sorts + cursor handling
- **Update** `libs/business/src/services/index.ts` exports

### API (libs/trpc)

- **Add** `libs/trpc/src/routers/activity.router.ts`
  - protected procedure `list`
  - calls `ActivityService`
- **Update** `libs/trpc/src/routers/_app.ts` (or equivalent root router) to register `activity`

### Web (apps/web)

- **Add** page route: `apps/web/app/(app)/activity/page.tsx` (exact folder verified during implementation)
- **Add** components (location flexible):
  - `apps/web/components/activity/activity-filters.tsx`
  - `apps/web/components/activity/activity-list.tsx`
  - `apps/web/components/activity/activity-detail-drawer.tsx`
- **Update** side nav component to include Activity link

### Analytics (libs/analytics)

- **Update** event list/types if the repo enforces typing (verify during implementation)
- Add capture calls in Activity page/components:
  - `activity_viewed`
  - `activity_filter_applied`
  - `activity_item_opened`

---

## Task Breakdown (P6-ready)

### [STORY] ST-046: View Activity Feed

- **AC**: EP-016 AC-1, AC-4, AC-6

Tasks:
- [TASK] TSK-EP016-001: Add `ActivityRepository` (generation_jobs + credit_transactions queries)
- [TASK] TSK-EP016-002: Add `ActivityService` (merge/sort/cursor + mapping)
- [TASK] TSK-EP016-003: Add `activity.list` tRPC endpoint
- [TASK] TSK-EP016-004: Build `/activity` page + list + filters + load more

### [STORY] ST-047: Audit Credits in Activity

- **AC**: EP-016 AC-2, AC-3

Tasks:
- [TASK] TSK-EP016-005: Link credit transactions to generation jobs when referenced
- [TASK] TSK-EP016-006: Detail drawer fields (IDs, deltas, balance)

### [STORY] ST-048: Track Activity Usage (Analytics)

- **AC**: EP-016 analytics section

Tasks:
- [TASK] TSK-EP016-007: Add capture calls for view/filter/open

---

## Tracking Plan (Where events fire)

- `activity_viewed`: on `/activity` page mount after first successful list response (includes `event_count`)
- `activity_filter_applied`: on filter changes (include filter values)
- `activity_item_opened`: when drawer opens (include `activity_type`, `has_generation_link`, `has_credit_link`)

---

## Phase 2+ (Future Requirement)

- Add `activity_log` projection table (read-optimized timeline)
- Persist additional event types (downloads/exports)
- Add CSV export


