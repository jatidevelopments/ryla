# EP-017 Tech Spec: In-App Notifications (P5)

## Goal

Implement an in-app notifications system that:

- Persists all notifications to Postgres (Drizzle)
- Exposes read/unread state via API
- Shows a **top-right clock icon** in `apps/web` with an unread indicator + menu

## Constraints

- **Do not skip layers**: `apps/* → @ryla/business → @ryla/data → DB`
- Use `@ryla/analytics` for PostHog capture
- No push/email/SMS (EP-007 covers email)

---

## Data Model (Drizzle)

### Table: `notifications`

Minimal MVP fields:

- `id` uuid pk
- `userId` uuid fk → `users.id`
- `type` text (future-proof; can later become enum)
- `title` text
- `body` text nullable
- `href` text nullable (deep link inside app)
- `isRead` boolean default false
- `readAt` timestamp nullable
- `createdAt` timestamp default now

Optional (recommended):

- `metadata` jsonb nullable (payload for rendering/routing)

---

## API Contract (apps/api)

Base endpoints (align with existing controller routes):

- `GET /notifications`
  - Query: `page`, `limit` (or existing `PageOptionsDto`)
  - Returns: list + paging meta + `unreadCount`
- `POST /notifications/:id/read`
  - Returns: 204
- `POST /notifications/read-all`
  - Returns: 204

Realtime (optional):

- websocket event: `notification.created` emitted to `user-${userId}`

---

## Web UI Contract (apps/web)

### Desktop header

Modify `apps/web/components/app-shell.tsx` desktop header right side:

- Add a new icon button (clock icon)
- If `unreadCount > 0`, show badge/dot
- On click, open a menu listing notifications

### Mobile header

Optional for MVP:

- Either show the same icon button, or defer to a later iteration

### Menu behavior

- Open state: fetch notifications (or refetch if already loaded)
- Render:
  - “New” section (unread) then “Earlier” (read), or single list with styling
  - Each item shows title, optional body, relative time
  - If item has `href`, click navigates
- Actions:
  - “Mark all read” (only if unreadCount > 0)

---

## Analytics (PostHog)

Fire via `@ryla/analytics`:

- `notifications.menu_opened` `{ unread_count }`
- `notifications.notification_clicked` `{ notification_id, type, has_href }`
- `notifications.mark_all_read_clicked` `{ unread_count_before }`

---

## File Plan (P5)

### Data layer (`libs/data`)

- **Add** `libs/data/src/schema/notifications.schema.ts`
- **Update** `libs/data/src/schema/index.ts` to export notifications schema
- **Add** `libs/data/src/repositories/notifications.repository.ts`
- **Add** drizzle migration under `drizzle/migrations/####_*.sql` creating `notifications`

### Business layer (`libs/business`)

- **Add** `libs/business/src/services/notifications.service.ts`
  - `createNotification()`: insert + optional websocket emit
  - `getUserNotifications()`: list + unreadCount
  - `markAsRead()`, `markAllAsRead()`

### Presentation layer (`apps/api`)

- **Update** `apps/api/src/modules/notification/services/notification.service.ts`
  - Replace placeholder throws with calls to `@ryla/business`
- **Update** `apps/api/src/modules/notification/notification.module.ts`
  - Provide business service + data repository via DI (Drizzle DB token)
- **Update** `apps/api/src/modules/notification/notification.controller.ts`
  - Ensure DTOs/pagination types are consistent (no `any`)
- **(Optional)** update `apps/api/src/modules/notification/notification.gateway.ts`
  - Emit `notification.created`

### Web (`apps/web`)

- **Update** `apps/web/components/app-shell.tsx` to add the clock icon + badge + menu
- **Add** `apps/web/components/notifications/notifications-menu.tsx` (menu UI)
- **Add** `apps/web/lib/hooks/use-notifications.ts` (fetch/refetch, unreadCount)

---

## Task Breakdown

- **[TASK]** Add `notifications` schema + migration (Drizzle)
- **[TASK]** Implement `NotificationsRepository` (list, insert, mark read)
- **[TASK]** Implement business `NotificationsService` (orchestration + validation)
- **[TASK]** Wire `apps/api` notification module to repository + business service
- **[TASK]** Build `apps/web` navbar clock + menu + unread badge
- **[TASK]** Add analytics events (menu open, click, mark-all-read)

---

## Self-Review Checklist (before merge)

- No layer skipping (apps do not talk to DB directly)
- No `any` in new code
- Notification access always scoped to current user
- Unread count matches DB state after mark-read operations
- Analytics event names follow `<feature>.<action>`


