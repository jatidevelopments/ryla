# [EPIC] EP-016: Generation Activity + Credit Audit Log

**Status**: Completed
**Phase**: P10
**Created**: 2026-01-21
**Last Updated**: 2026-01-21


## Overview

A unified, user-facing activity log that answers:

- What has been generated (when, for which AI Influencer, and status)?
- Where credits were used (consumed/refunded/refreshed) and why?

This improves trust, reduces support friction (“where did my credits go?”), and increases retention by making progress visible.

---

## Business Impact

**Target Metric**: B - Retention (primary), D - Conversion (secondary)

**Hypothesis**: When users can audit their generations and credit usage, they trust the product more, feel progress, and are more likely to return and/or upgrade.

**Success Criteria**:
- Activity engagement: **>30%** of weekly active users view Activity
- Support deflection: **-30%** “credits missing / generation missing” support tickets (proxy)
- Trust: **>70%** of users can locate a specific generation in <30 seconds (UX test)

---

## Features

### F1: Activity Feed (Timeline/Table)

- Reverse chronological list of activity items
- Shows: timestamp, type, short summary, and optional linked entity (AI Influencer, generation job, image)
- Paginated (MVP: last 50 items; load more)

### F2: Supported Event Types (MVP)

**Generation**
- Generation started
- Generation completed
- Generation failed

**Credits**
- Credits consumed
- Credits refunded (failed job)
- Credits refreshed (monthly / plan refresh)

**Optional (MVP+)**
- Download/export actions (only if already tracked reliably)

### F3: Filters (MVP)

- Date range (Last 7 days / 30 days / All time)
- Event type (Generation vs Credits)
- AI Influencer (optional if data is available cheaply)

> MVP requirement: ship with **date range + event type** at minimum.

### F4: Activity Item Detail Drawer (MVP)

Click an item to view:
- Human-readable summary
- IDs (generation job id, transaction id) for support/debug
- For generation: AI Influencer, quality mode, aspect ratio, status, created_at, optional output preview links
- For credits: delta, balance_after, action, created_at, and reference to generation job if applicable

### F5: Linking & Navigation (MVP)

- Generation items deep-link to the relevant content (e.g., gallery item / generation result)
- Credit items deep-link to Activity detail and show associated generation if present

---

## Acceptance Criteria

### AC-1: Activity Visibility

- [ ] Signed-in user can access Activity from the app navigation (or settings)
- [ ] Activity shows the most recent 50 items in reverse chronological order
- [ ] Each item shows timestamp + type + short description

### AC-2: Credit Audit Integrity

- [ ] Every credit event shown in Activity corresponds to a persisted credit transaction
- [ ] Credit items display `delta` and `balance_after`
- [ ] Credit items show a clear action label (consume/refund/refresh)

### AC-3: Generation Linkage

- [ ] Generation items show status (started/completed/failed)
- [ ] Generation items show AI Influencer (name/id) and key settings summary (quality, aspect ratio at minimum)
- [ ] If a generation caused credit consumption, the Activity UI makes the linkage visible (e.g., “-10 credits” on the generation item or a link to the credit transaction)

### AC-4: Filtering

- [ ] User can filter by date range and event type
- [ ] Filtering changes the results and preserves correct ordering
- [ ] Clear empty state when no results match filters

### AC-5: Privacy & Access Control

- [ ] User can only view their own Activity items
- [ ] No cross-user leakage via direct URL or API

### AC-6: Performance

- [ ] Activity initial load (last 50 items) returns in <2s on typical broadband (excluding image binary fetches)

---

## Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `activity_viewed` | Activity page opened | `event_count`, `date_range`, `event_type_filter` |
| `activity_item_opened` | Detail drawer opened | `activity_type`, `has_generation_link`, `has_credit_link` |
| `activity_filter_applied` | Filter changed | `filter_name`, `filter_value` |

---

## User Stories

### ST-0XX: See My Activity

**As a** user  
**I want to** see a history of what happened in my account (generations + credits)  
**So that** I can trust the system and understand my usage

**AC**: AC-1, AC-4

### ST-0XX: Audit My Credits

**As a** user  
**I want to** see every credit change with a reason  
**So that** I know where my credits went

**AC**: AC-2

### ST-0XX: Debug a Generation

**As a** user  
**I want to** see whether my generation succeeded or failed and what it cost  
**So that** I can take action (retry, change settings, or contact support)

**AC**: AC-3

---

## UI Wireframes

### Activity Feed

```
┌─────────────────────────────────────────────────────┐
│  Activity                                            │
├─────────────────────────────────────────────────────┤
│  Date: [Last 30d ▾]   Type: [All ▾]                  │
│                                                     │
│  Today                                               │
│  • Generated 5 images (HQ) for Luna   -10 credits    │
│    14:12  Status: completed                          │
│                                                     │
│  • Credits refreshed (Pro plan)       +300 credits   │
│    09:00  Balance: 320                                │
│                                                     │
│  Yesterday                                           │
│  • Generation failed (HQ) for Luna    +10 refunded    │
│    21:05  Status: failed                              │
│                                                     │
│                 [Load more]                          │
└─────────────────────────────────────────────────────┘
```

### Detail Drawer

```
┌──────────────────────────────────────────────┐
│ Activity Detail                        [X]   │
├──────────────────────────────────────────────┤
│ Type: Generation completed                    │
│ Time: 2026-01-01 14:12                        │
│ AI Influencer: Luna (id: ...)                 │
│ Quality: HQ   Aspect ratio: 9:16              │
│ Credits: -10   Balance after: 42              │
│ Generation job id: ...                        │
│ Credit transaction id: ...                    │
│                                              │
│ [View results]                                │
└──────────────────────────────────────────────┘
```

---

## Technical Notes (requirements-level)

### MVP Approach (Source of Truth)

- **Do not** introduce a new `activity_log` table for MVP.
- Build the Activity feed from existing persisted sources of truth:
  - `generation_jobs` (job lifecycle + metadata)
  - `credit_transactions` (credit ledger with `reference_type/reference_id`)
- Merge/sort results by timestamp and link credits ↔ generation jobs via references.

### Data Sources

- Generations (EP-005): job records with status and metadata
- Credits (EP-009): `credit_transactions` as the source of truth for credit deltas
- Optional: downloads (EP-008) if tracked as events or persisted records

### Activity Read Model

- Activity feed can be implemented as:
  - A union query/view (generation jobs + credit transactions), or
  - A dedicated `activity_log` table populated by application writes (Phase 2 if needed)
- MVP goal: **show reliable history** without requiring new complex infra.

### Phase 2+ Requirement: `activity_log` Projection

If/when we need persisted “UX events” (e.g., downloads/exports) or faster unified reads:

- Add an `activity_log` table as a **projection/read-optimized** timeline (not the source of truth)
- Populate it from application writes (or a job/trigger) based on authoritative tables:
  - `generation_jobs` updates (queued → processing → completed/failed)
  - `credit_transactions` inserts (generation, refund, subscription_grant, etc.)
- Ensure idempotency (avoid duplicates) using stable keys (e.g., `source_type + source_id + type`)

---

## Non-Goals (Phase 2+)

- Admin/global audit log across all users
- Advanced search (free text, deep filtering)
- CSV export
- Cross-device “reconciliation” UX beyond the Activity list

---

## Dependencies

- User authentication (EP-002)
- Image generation job tracking (EP-005)
- Credit transactions ledger (EP-009)
- Gallery/result linking (EP-008) for deep links

---

## Phase Checklist

- [x] P1: Requirements (this epic)
- [ ] P2: Stories created
- [ ] P3: Architecture design
- [ ] P4: UI skeleton
- [ ] P5: Tech spec
- [ ] P6: Implementation
- [ ] P7: Testing
- [ ] P8: Integration
- [ ] P9: Deployment
- [ ] P10: Validation


