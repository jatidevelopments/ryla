# [EPIC] EP-051: User Management Dashboard

**Initiative**: [IN-014](../../../initiatives/IN-014-admin-back-office.md) - Admin Back-Office Application  
**Phase**: 1 (MVP)  
**Priority**: P0  
**Status**: Completed

---

## Overview

Build a comprehensive user management dashboard that allows admin team to search, view, and manage customer accounts. This is the primary interface for support operations.

---

## Business Impact

**Target Metric**: B-Retention (faster support response)

**Hypothesis**: When support team can quickly find and view user information, they can resolve issues faster, improving customer satisfaction and retention.

**Success Criteria**:

- Average time to find a user: < 5 seconds
- User profile completeness: 100% of relevant data visible
- Support actions (ban/unban): < 30 seconds to complete

---

## Features

### F1: User Search

- Search by email (exact or partial)
- Search by user ID (UUID)
- Search by public name / display name
- Search by character name
- Advanced filters:
  - Registration date range
  - Subscription tier
  - Account status (active, banned)
  - Has generated images (yes/no)
  - Credit balance range

### F2: User List View

- Paginated table (50 items per page)
- Sortable columns (name, email, created, credits, subscription)
- Quick status indicators (subscription tier, banned status)
- Quick actions column (view, ban/unban)
- Export to CSV

**Columns**:
| Column | Description |
|--------|-------------|
| ID | User UUID (truncated, copy on click) |
| Email | User email |
| Name | Display name |
| Subscription | Current tier badge (Free, Starter, Pro, Unlimited) |
| Credits | Current balance |
| Characters | Count of characters |
| Images | Count of generated images |
| Status | Active / Banned badge |
| Created | Registration date |
| Actions | View, Ban/Unban buttons |

### F3: User Detail View

Comprehensive single-user view with all relevant information:

**Overview Tab**:
- User ID, email, name, public name
- Account creation date
- Last login date
- Email verification status
- Age verification status
- Settings (JSON viewer)

**Credits Tab**:
- Current balance
- Total earned (lifetime)
- Total spent (lifetime)
- Transaction history table (paginated)
  - Date, type, amount, balance after, description

**Subscription Tab**:
- Current tier and status
- Finby subscription ID
- Current period start/end
- Cancel at period end flag
- Subscription history

**Characters Tab**:
- List of all characters
- Status (draft, ready, training, etc.)
- Base image thumbnail
- Created date
- Quick link to character images

**Images Tab**:
- Grid of generated images
- Filter by character
- Filter by status
- Filter by date range
- Image metadata on click

**Activity Tab**:
- Recent activity timeline
- Generation jobs
- Login events
- Credit transactions

### F4: Ban/Unban User

- Ban user action (with reason input)
- Unban user action
- Ban reason stored and visible
- Email notification option (future)
- Audit log entry created

### F5: User Notes

- Admin can add notes to user account
- Notes visible to all admins
- Timestamped with admin name
- Cannot be deleted (audit trail)

### F6: Quick Stats Dashboard

- Total users count
- New users today/week/month
- Users by subscription tier
- Active vs inactive users
- Banned users count

---

## Acceptance Criteria

### AC-1: User Search

- [ ] Can search by email (partial match)
- [ ] Can search by user ID
- [ ] Can search by name
- [ ] Search results load in < 2 seconds
- [ ] Advanced filters work correctly
- [ ] Clear filters button resets all

### AC-2: User List

- [ ] Displays paginated list of users
- [ ] Pagination works correctly
- [ ] Sorting works on all columns
- [ ] Status badges display correctly
- [ ] Quick actions work from list
- [ ] Export to CSV works

### AC-3: User Detail - Overview

- [ ] All user fields displayed
- [ ] Settings displayed as formatted JSON
- [ ] Copy buttons for ID/email work
- [ ] Last login shows correctly
- [ ] Verification statuses accurate

### AC-4: User Detail - Credits

- [ ] Current balance matches database
- [ ] Lifetime stats correct
- [ ] Transaction history paginated
- [ ] Transaction types color-coded
- [ ] Links to related entities work

### AC-5: User Detail - Subscription

- [ ] Current subscription accurate
- [ ] Finby ID displayed (if exists)
- [ ] Period dates formatted correctly
- [ ] Subscription history shows
- [ ] Status badges accurate

### AC-6: User Detail - Characters

- [ ] All characters listed
- [ ] Thumbnails load correctly
- [ ] Status badges accurate
- [ ] Can navigate to character images
- [ ] Character count matches header

### AC-7: User Detail - Images

- [ ] Image grid loads correctly
- [ ] Filters work correctly
- [ ] Image metadata shows on click
- [ ] Pagination/infinite scroll works
- [ ] Can open full-size image

### AC-8: Ban/Unban

- [ ] Ban action requires reason
- [ ] Ban immediately takes effect
- [ ] Banned users cannot login
- [ ] Unban action works
- [ ] Audit log entry created
- [ ] Confirmation dialog before action

### AC-9: User Notes

- [ ] Can add notes to user
- [ ] Notes appear in chronological order
- [ ] Admin name and timestamp shown
- [ ] Notes persist correctly
- [ ] Notes cannot be edited/deleted

---

## Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `admin_user_searched` | Search executed | `query_type`, `result_count` |
| `admin_user_viewed` | User detail opened | `user_id`, `tab` |
| `admin_user_banned` | User banned | `user_id`, `reason` |
| `admin_user_unbanned` | User unbanned | `user_id` |
| `admin_user_note_added` | Note added | `user_id`, `note_length` |
| `admin_user_exported` | CSV export | `filter_count`, `row_count` |

---

## User Stories

### ST-210: Search for User

**As a** support admin  
**I want to** search for a user by email or name  
**So that** I can quickly find their account

**AC**: AC-1

### ST-211: View User Details

**As a** support admin  
**I want to** see all information about a user  
**So that** I can understand their account status and history

**AC**: AC-3, AC-4, AC-5, AC-6, AC-7

### ST-212: Ban User

**As a** support admin  
**I want to** ban a user who violated terms  
**So that** they cannot access the platform

**AC**: AC-8

### ST-213: Add User Note

**As a** support admin  
**I want to** add notes to a user account  
**So that** other team members can see context

**AC**: AC-9

### ST-214: Export User List

**As a** billing admin  
**I want to** export user data to CSV  
**So that** I can analyze it externally

**AC**: AC-2

---

## Technical Notes

### API Endpoints

```typescript
// Admin tRPC Router
admin.users.list({ limit, offset, filters, sort })
admin.users.get({ userId })
admin.users.search({ query, filters })
admin.users.ban({ userId, reason })
admin.users.unban({ userId })
admin.users.addNote({ userId, note })
admin.users.getNotes({ userId })
admin.users.getCredits({ userId, limit, offset })
admin.users.getSubscription({ userId })
admin.users.getCharacters({ userId })
admin.users.getImages({ userId, limit, offset, filters })
admin.users.getActivity({ userId, limit, offset })
admin.users.export({ filters, format: 'csv' })
```

### New Schema: Admin Notes

```typescript
export const adminNotes = pgTable('admin_notes', {
  id: uuid('id').defaultRandom().primaryKey(),
  entityType: text('entity_type').notNull(), // 'user', 'bug_report', etc.
  entityId: uuid('entity_id').notNull(),
  adminUserId: uuid('admin_user_id')
    .notNull()
    .references(() => adminUsers.id),
  note: text('note').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
  entityIdx: index('admin_notes_entity_idx').on(table.entityType, table.entityId),
}));
```

### User Search Query

```typescript
// Efficient search with partial matching
const searchUsers = async (query: string, filters: UserFilters) => {
  return db.query.users.findMany({
    where: and(
      or(
        ilike(users.email, `%${query}%`),
        ilike(users.name, `%${query}%`),
        ilike(users.publicName, `%${query}%`),
        eq(users.id, query), // Exact ID match
      ),
      filters.status && eq(users.banned, filters.status === 'banned'),
      filters.subscription && exists(
        db.select().from(subscriptions)
          .where(and(
            eq(subscriptions.userId, users.id),
            eq(subscriptions.tier, filters.subscription)
          ))
      ),
    ),
    limit: filters.limit || 50,
    offset: filters.offset || 0,
    orderBy: [desc(users.createdAt)],
  });
};
```

### UI Components

```
apps/admin/app/users/
├── page.tsx                    # User list page
├── [id]/
│   └── page.tsx               # User detail page
├── components/
│   ├── UserSearchBar.tsx
│   ├── UserFilters.tsx
│   ├── UserTable.tsx
│   ├── UserDetailTabs.tsx
│   ├── CreditsTab.tsx
│   ├── SubscriptionTab.tsx
│   ├── CharactersTab.tsx
│   ├── ImagesTab.tsx
│   ├── ActivityTab.tsx
│   ├── BanUserDialog.tsx
│   └── AddNoteDialog.tsx
└── hooks/
    ├── useUserSearch.ts
    └── useUserDetail.ts
```

---

## Non-Goals (Phase 2+)

- Impersonate user (login as user)
- Direct database edits
- Bulk user operations
- User communication (in-app messaging)
- Account merge functionality

---

## Dependencies

- EP-050: Admin Authentication (must be authenticated)
- Existing `@ryla/data` schemas (users, credits, subscriptions, etc.)
- TanStack Table for data tables
- TanStack Query for data fetching

---

## Phase Checklist

- [ ] P1: Requirements (this epic)
- [ ] P2: Stories created
- [ ] P3: Architecture design
- [ ] P4: UI skeleton
- [ ] P5: Tech spec
- [ ] P6: Implementation
- [ ] P7: Testing
- [ ] P8: Integration
- [ ] P9: Deployment
- [ ] P10: Validation
