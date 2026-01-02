# [EPIC] EP-017: In-App Notifications (Inbox + Navbar Indicator)

## Overview

Persist **all user notifications** in the database and expose them in the product UI via a **top-right navbar indicator (clock icon)** that opens a menu listing recent notifications and whether they’re new/unread.

> Why now: RYLA already has an API module stubbed under `apps/api/src/modules/notification/*`, but it is not backed by a database table/repository and is not surfaced in `apps/web`.

---

## Business Impact

**Target Metric**: B - Retention  

**Hypothesis**: Users who can reliably see “what happened while I was away” (generation complete, errors, billing state) have higher trust and return rate.

---

## Features

### F1: Notification Persistence (DB)

- Every time the system “sends a notification to the user”, we **also create a DB record**.
- Notification record includes:
  - recipient (`userId`)
  - type (enum/string)
  - title/body
  - optional deep link (`href`)
  - read-state (`isRead`, `readAt`)
  - timestamps (`createdAt`)

### F2: List Notifications (API)

- Authenticated endpoint to fetch the current user’s notifications
- Supports pagination / ordering
- Includes unread state so UI can render a “new” section and badge indicator

### F3: Mark Read / Mark All Read (API)

- Mark a single notification as read
- Mark all as read

### F4: Navbar Indicator + Menu (Web)

- Add a **clock icon** in top-right navigation (`apps/web` header)
- Show unread indicator:
  - **badge count** (preferred) or **dot** when count > 0
- Clicking opens a menu:
  - Lists recent notifications (new first)
  - Separates New vs Earlier (optional but preferred)
  - Empty state (“No notifications yet”)
  - “Mark all as read” action when unread > 0

### F5: (Optional) Real-time Updates

- If websocket infrastructure is enabled, emit a user-scoped event when a notification is created
- UI may subscribe for live updates; otherwise poll/refetch on open

---

## Acceptance Criteria

### AC-1: Notifications are persisted

- [ ] Any codepath that sends a user notification creates a row in `notifications`
- [ ] Notifications are scoped to the recipient (no cross-user access)

### AC-2: User can view notifications

- [ ] Authenticated user can open the navbar menu and see their recent notifications
- [ ] Notifications are ordered newest → oldest
- [ ] Empty state renders when none exist

### AC-3: Unread indicator works

- [ ] Navbar clock shows an indicator when at least one unread notification exists
- [ ] Indicator updates when notifications are marked read (single or all)

### AC-4: Mark read works

- [ ] User can mark all notifications as read from the menu
- [ ] (Optional) Clicking a notification marks it read and navigates if `href` is present

### AC-5: Analytics is captured

- [ ] PostHog events fire for: menu open, notification click, mark-all-read
- [ ] Events include `user_id` and the notification context (type/id where applicable)

---

## Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `notifications.menu_opened` | User opens menu | `unread_count` |
| `notifications.notification_clicked` | User clicks an item | `notification_id`, `type`, `has_href` |
| `notifications.mark_all_read_clicked` | User clicks mark-all-read | `unread_count_before` |
| `notifications.notification_marked_read` | Notification marked read | `notification_id`, `type`, `source` |

---

## User Stories

### [STORY] ST-158: See My Notifications

**As a** logged-in user  
**I want to** open a navbar notifications menu  
**So that** I can see what happened while I was away

**AC**: AC-2

### [STORY] ST-159: Unread Indicator

**As a** logged-in user  
**I want to** see an indicator when I have new notifications  
**So that** I don’t miss important updates

**AC**: AC-3

### [STORY] ST-160: Persist Notifications When Sent

**As the** system  
**I want to** store notifications in the database whenever they are sent  
**So that** the UI can reliably show them later

**AC**: AC-1

### [STORY] ST-161: Mark Notifications Read

**As a** logged-in user  
**I want to** mark notifications read (single/all)  
**So that** my indicator accurately reflects what’s new

**AC**: AC-4

---

## Technical Notes (P3/P5 Preview)

### Data Model (Drizzle / Postgres)

Add `notifications` table in `@ryla/data/schema`, e.g.:

- `id` (uuid, pk)
- `userId` (uuid, fk → `users.id`)
- `type` (text)
- `title` (text)
- `body` (text, nullable)
- `href` (text, nullable)
- `isRead` (boolean, default false)
- `readAt` (timestamp, nullable)
- `metadata` (jsonb, nullable)
- `createdAt` (timestamp, default now)

### Layering (MANDATORY)

- `apps/web` → calls `@ryla/trpc` (or API client) and renders UI
- `apps/api` (controller/gateway) → delegates to `@ryla/business`
- `@ryla/business` → orchestrates create/list/mark-read use cases
- `@ryla/data` → Drizzle repository (insert/select/update)

### API Contract (initial)

- `GET /notifications` (paginated list)
- `POST /notifications/:id/read`
- `POST /notifications/read-all`

> Note: `apps/api/src/modules/notification/services/notification.service.ts` is currently a placeholder and must be wired to a real repository.

---

## Non-Goals (Phase 2+)

- Push notifications (iOS/Android/browser push)
- Email notifications (covered by EP-007)
- Notification preference center / digest frequency
- Admin broadcast UI
- Complex templating / localization

---

## Dependencies

- Auth (user identity in API)
- Drizzle DB wiring (`apps/api/src/modules/drizzle`)
- PostHog capture (`@ryla/analytics`)

---

## Phase Checklist

- [x] P1: Requirements (this epic)
- [x] P2: Stories + acceptance criteria (this epic)
- [ ] P3: Architecture (data model + API contracts)
- [ ] P4: UI skeleton (menu states + interactions)
- [ ] P5: Tech spec (file plan + tasks)
- [ ] P6: Implementation
- [ ] P7: Testing
- [ ] P8: Integration
- [ ] P9: Deployment
- [ ] P10: Validation


