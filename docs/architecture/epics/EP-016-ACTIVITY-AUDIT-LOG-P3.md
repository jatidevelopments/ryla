# EP-016 (P3) — Activity (Generation History + Credit Audit)

Working in **PHASE P3 (Architecture + API)** on **EP-016, ST-046**.

## Goal

Ship an MVP Activity page that lets an authenticated user:

- See a unified timeline of **generation activity** and **credit changes**
- Filter by **date range** and **type** (Generation vs Credits)
- Open a detail drawer that links credit spend/refunds to the underlying generation job

MVP constraint: **No new `activity_log` table**. Activity is derived from existing sources of truth.

---

## Architecture (Layers)

- **apps/web**: `/activity` page, filters, list, detail drawer
- **libs/trpc**: `activity.list` procedure (authenticated)
- **libs/business**: `ActivityService` (merge + mapping logic)
- **libs/data**: `ActivityRepository` (DB queries for jobs + credit tx)

Data flow:
1. Web loads `/activity` → calls `trpc.activity.list`
2. `activity.list` calls `ActivityService.listActivity(userId, filters, pagination)`
3. `ActivityService` queries `ActivityRepository` for:
   - `generation_jobs` (user scoped)
   - `credit_transactions` (user scoped)
4. Service merges, sorts, and returns a unified list of `ActivityItem` DTOs

---

## Data Sources (Existing)

### `generation_jobs` (source of truth for generation lifecycle)

- Fields used: `id`, `userId`, `characterId`, `type`, `status`, `input`, `creditsUsed`, `createdAt`, `startedAt`, `completedAt`, `error`

### `credit_transactions` (source of truth for credit changes)

- Fields used: `id`, `userId`, `type`, `amount`, `balanceAfter`, `referenceType`, `referenceId`, `qualityMode`, `description`, `createdAt`
- Linkage: for generation-related credit events:
  - `referenceType = 'generation_job'`
  - `referenceId = generation_jobs.id`

---

## Activity Item Model (API DTO)

We return a unified list of typed items:

```ts
type ActivityItemType =
  | 'generation_started'
  | 'generation_completed'
  | 'generation_failed'
  | 'credits_consumed'
  | 'credits_refunded'
  | 'credits_refreshed'
  | 'credits_added';

type ActivitySource =
  | { sourceType: 'generation_job'; sourceId: string }
  | { sourceType: 'credit_transaction'; sourceId: string };

interface ActivityItem {
  id: string; // stable per returned item (see ID strategy)
  occurredAt: string; // ISO timestamp used for ordering
  type: ActivityItemType;
  title: string;
  description?: string;

  // Optional linkage
  characterId?: string | null;
  generationJobId?: string | null;
  creditTransactionId?: string | null;

  // Credit context (when applicable)
  creditsDelta?: number | null;
  balanceAfter?: number | null;

  source: ActivitySource;
}
```

### ID Strategy (MVP)

- For credit-based items: `id = creditTransactionId`
- For generation-based items: `id = generationJobId`
- If we ever need multiple items per job (Phase 2): add suffix (`jobId:completed`, etc.)

---

## Event Mapping Rules (Derived)

### Generation → ActivityItem

We derive a single generation activity item based on current job status:

- `status in ('queued','processing')` → `generation_started`, `occurredAt = startedAt ?? createdAt`
- `status = 'completed'` → `generation_completed`, `occurredAt = completedAt ?? updatedAt ?? createdAt`
- `status = 'failed'` → `generation_failed`, `occurredAt = completedAt ?? updatedAt ?? createdAt`

### Credits → ActivityItem

- `type = 'generation'` and `amount < 0` → `credits_consumed`
- `type = 'refund'` and `amount > 0` → `credits_refunded`
- `type = 'subscription_grant'` → `credits_refreshed` (MVP wording)
- `type in ('purchase','bonus','admin_adjustment')` → `credits_added`

`occurredAt = credit_transactions.createdAt`

---

## Pagination + Query Strategy (MVP)

We need a single merged feed. For MVP, implement **two-source keyset pagination**:

Input:
- `limit` (default 50, max 100)
- `cursor?: { occurredAt: string; sourceType: 'generation_job'|'credit_transaction'; sourceId: string }`

Approach:
1. Fetch up to `limit * 2` generation jobs (filtered) ordered by `occurredAt desc`
2. Fetch up to `limit * 2` credit transactions (filtered) ordered by `createdAt desc`
3. Merge-sort in memory by `occurredAt desc`, take first `limit`
4. Compute `nextCursor` as the last item in the returned page

> This avoids offset pagination drift when new events arrive.

---

## Proposed API (tRPC)

### `activity.list` (new)

Input:
- `limit?: number`
- `cursor?: { occurredAt: string; sourceType: 'generation_job'|'credit_transaction'; sourceId: string }`
- `dateRange?: 'last_7_days' | 'last_30_days' | 'all_time'`
- `typeFilter?: 'all' | 'generation' | 'credits'`

Response:
- `items: ActivityItem[]`
- `nextCursor?: { occurredAt: string; sourceType: ...; sourceId: string }`

Auth:
- Protected (user-scoped only)

---

## Analytics (PostHog)

We track usage (not as source-of-truth):

- `activity_viewed` (page load)
- `activity_filter_applied` (any filter change)
- `activity_item_opened` (detail drawer open)

---

## Open Questions (for P4/P5)

1. Activity page route group: keep under authenticated app layout (recommended).
2. Side nav ordering: where does Activity sit relative to Dashboard / Gallery / Settings?


