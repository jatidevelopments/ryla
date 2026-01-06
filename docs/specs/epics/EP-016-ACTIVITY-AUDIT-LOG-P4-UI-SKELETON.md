# EP-016 (P4) — Activity: UI Skeleton

Working in **PHASE P4 (UI Skeleton)** on **EP-016, ST-046**.

## Screens

### A1: Activity (New)

- **Route**: `/activity`
- **Auth required**: Yes
- **Navigation**: Visible in **side navigation** (desktop) and menu (mobile)
- **Purpose**: Unified activity feed (generations + credits) with filters and detail drawer

---

## Navigation Placement

### Side Navigation (App)

Add a new item:

- **Label**: Activity
- **Route**: `/activity`
- **Icon**: “History/Clock” style (final icon chosen during implementation)

Recommended order (MVP):
1. Dashboard
2. Gallery (if exists as separate route)
3. **Activity**
4. Settings

---

## Components (Page-Level)

### `ActivityPage`

Composition:

- `ActivityHeader`
  - Title: “Activity”
  - Optional subtitle: “Your generations and credit usage”
- `ActivityFilters`
  - Date range: Last 7 / Last 30 / All time
  - Type: All / Generation / Credits
- `ActivityList`
  - `ActivityRow` items (clickable)
  - Loading skeleton
  - Empty state
  - “Load more” button (MVP)
- `ActivityDetailDrawer`
  - Opens when a row is clicked
  - Shows detail fields + IDs
  - Optional deep link CTA (“View results”)

---

## Interactions → API

### Initial Load

1. User opens `/activity`
2. UI calls `trpc.activity.list({ limit: 50, dateRange, typeFilter })`
3. UI renders list (most recent first)

### Apply Filter

1. User changes date range or type filter
2. UI resets pagination + calls `trpc.activity.list(...)` again
3. UI shows updated results

### Open Detail

1. User clicks an activity row
2. UI opens drawer and renders details from the selected list item (MVP)

> MVP: no extra fetch required for detail unless we need additional fields later.

### Load More

1. User clicks “Load more”
2. UI calls `trpc.activity.list({ cursor: nextCursor, ...filters })`
3. UI appends results

---

## States

### Loading

- Skeleton list (10 rows)
- Filters disabled until first load resolves

### Empty

- “No activity yet”
- CTA: “Generate images” (links to Studio/Generation entry point if available)

### Error

- Inline error panel: “Could not load activity”
- CTA: “Retry”

---

## Analytics Mapping (UI)

- On page mount: `activity_viewed`
- On filter change: `activity_filter_applied`
- On row click (drawer open): `activity_item_opened`

---

## Accessibility Notes

- List rows are keyboard-focusable
- Drawer closes on `Esc`
- Proper aria labels for filters and drawer


