# Admin App User Journey

**App**: `apps/admin`  
**Domain**: Admin dashboard (internal)  
**Purpose**: Administrative interface for managing users, content, billing, and system operations

---

## Overview

The admin app provides role-based access control (RBAC) for administrators to manage the RYLA platform, including user management, content moderation, billing, analytics, and system configuration.

## Key User Flows

### 1. Admin Login Flow

**Goal**: Authenticated admin access to dashboard  
**Target Time**: < 30 seconds

```
┌─────────────┐
│    LOGIN    │
│  /login     │
└──────┬──────┘
       │ Authenticated
       │ (Role checked)
       ▼
┌─────────────┐
│  DASHBOARD  │
│ /dashboard  │
│             │
│ Overview stats
│ Quick actions
│ Recent activity
└─────────────┘
```

**Key Events**:
- `admin.login.viewed`
- `admin.login.completed`
- `admin.dashboard.viewed`

---

### 2. User Management Flow

**Goal**: View and manage user accounts  
**Target Time**: < 1 minute to find user

```
┌─────────────┐
│    USERS    │
│  /users     │
└──────┬──────┘
       │ Browse/Filter
       ▼
┌─────────────┐
│    USERS    │
│ (filtered)  │
│             │
│ [Search]
│ [Filter by status]
│ [Sort]
│ [Select User]
└──────┬──────┘
       │ Click user
       ▼
┌─────────────┐
│ USER DETAIL │
│ /users/[id] │
│             │
│ [View Profile]
│ [Edit Status]
│ [Ban/Unban]
│ [View History]
└─────────────┘
```

**Key Events**:
- `admin.users.viewed`
- `admin.users.filtered`
- `admin.user.detail.viewed`
- `admin.user.status.updated`
- `admin.user.banned`

---

### 3. Content Moderation Flow

**Goal**: Review and moderate user-generated content  
**Target Time**: < 30 seconds per item

```
┌─────────────┐
│   CONTENT   │
│  /content   │
└──────┬──────┘
       │ Browse
       ▼
┌─────────────┐
│   CONTENT   │
│ (queue)     │
│             │
│ [Filter]
│ [Review Image]
│ [Approve/Reject]
│ [Flag for Review]
└─────────────┘
```

**Key Events**:
- `admin.content.viewed`
- `admin.content.approved`
- `admin.content.rejected`
- `admin.content.flagged`

---

### 4. Billing Management Flow

**Goal**: View and manage user billing and credits  
**Target Time**: < 1 minute to find transaction

```
┌─────────────┐
│   BILLING   │
│  /billing   │
└──────┬──────┘
       │ Browse
       ▼
┌─────────────┐
│   BILLING   │
│ (transactions)│
│             │
│ [Filter by user]
│ [Filter by type]
│ [View Details]
│ [Refund]
│ [Adjust Credits]
└─────────────┘
```

**Key Events**:
- `admin.billing.viewed`
- `admin.billing.transaction.viewed`
- `admin.billing.refund.created`
- `admin.billing.credits.adjusted`

---

### 5. Analytics & Reporting Flow

**Goal**: View platform metrics and analytics  
**Target Time**: < 30 seconds to load dashboard

```
┌─────────────┐
│  ANALYTICS  │
│ /analytics  │
└──────┬──────┘
       │ View
       ▼
┌─────────────┐
│  ANALYTICS  │
│ (dashboard) │
│             │
│ [Time Range]
│ [Metrics]
│ [Charts]
│ [Export]
└─────────────┘
```

**Key Events**:
- `admin.analytics.viewed`
- `admin.analytics.filtered`
- `admin.analytics.exported`

---

### 6. System Configuration Flow

**Goal**: Manage system settings and feature flags  
**Target Time**: < 2 minutes to update config

```
┌─────────────┐
│    CONFIG   │
│  /config    │
└──────┬──────┘
       │ Browse
       ▼
┌─────────────┐
│    CONFIG   │
│ (settings)  │
│             │
│ [Category]
│ [Edit Value]
│ [Save]
│ [View History]
└─────────────┘
```

**Key Events**:
- `admin.config.viewed`
- `admin.config.updated`
- `admin.config.history.viewed`

---

## Screen Inventory

### Auth Screens

| ID | Screen | Route | Purpose | Key Event |
|----|--------|-------|---------|-----------|
| A-A-01 | Login | `/login` | Admin authentication | `admin.login.viewed` |

### Core Admin Screens (Auth Required)

| ID | Screen | Route | Purpose | Key Event | Permission |
|----|--------|-------|---------|-----------|------------|
| A-C-01 | Dashboard | `/dashboard` | Overview statistics | `admin.dashboard.viewed` | `*` |
| A-C-02 | Users | `/users` | User list | `admin.users.viewed` | `users:read` |
| A-C-03 | User Detail | `/users/[id]` | User details | `admin.user.detail.viewed` | `users:read` |
| A-C-04 | Billing | `/billing` | Credits & subscriptions | `admin.billing.viewed` | `billing:read` |
| A-C-05 | Bug Reports | `/bugs` | Bug report list | `admin.bugs.viewed` | `bugs:read` |
| A-C-06 | Bug Detail | `/bugs/[id]` | Bug details | `admin.bug.detail.viewed` | `bugs:read` |
| A-C-07 | Content | `/content` | Content moderation | `admin.content.viewed` | `content:read` |
| A-C-08 | Jobs | `/jobs` | Generation jobs | `admin.jobs.viewed` | `jobs:read` |
| A-C-09 | Analytics | `/analytics` | Platform metrics | `admin.analytics.viewed` | `analytics:read` |
| A-C-10 | Library | `/library` | Template library | `admin.library.viewed` | `library:read` |
| A-C-11 | Audit Log | `/audit` | Audit trail | `admin.audit.viewed` | `settings:read` |
| A-C-12 | LoRA Models | `/lora` | LoRA management | `admin.lora.viewed` | `settings:read` |
| A-C-13 | LoRA Detail | `/lora/[id]` | LoRA details | `admin.lora.detail.viewed` | `settings:read` |
| A-C-14 | Admin Users | `/admins` | Admin management | `admin.admins.viewed` | `admins:read` |
| A-C-15 | Admin Detail | `/admins/[id]` | Admin details | `admin.admin.detail.viewed` | `admins:read` |
| A-C-16 | Feature Flags | `/flags` | Feature flag management | `admin.flags.viewed` | `settings:write` |
| A-C-17 | System Config | `/config` | System configuration | `admin.config.viewed` | `settings:write` |
| A-C-18 | Notifications | `/notifications` | Broadcast notifications | `admin.notifications.viewed` | `settings:write` |
| A-C-19 | Settings | `/settings` | Admin profile settings | `admin.settings.viewed` | `*` |

---

## Navigation Structure

### Main Navigation (Sidebar)

```
[Logo]
├── Dashboard
├── Users
├── Credits & Billing
├── Bug Reports
├── Content
├── Jobs
├── LoRA Models
├── Analytics
├── Library
├── Audit Log
├── Admin Users (super_admin only)
├── Feature Flags
├── System Config
├── Notifications
└── Settings
```

### Mobile Navigation

```
[☰ Menu] ──────────────────────────── [Logo]

Menu (filtered by permissions)
```

---

## Role-Based Access Control (RBAC)

### Roles

| Role | Permissions | Access Level |
|------|------------|--------------|
| `super_admin` | All permissions | Full system access |
| `admin` | Most permissions | Management access |
| `support` | User support | User management, billing |
| `moderator` | Content moderation | Content, bugs |
| `viewer` | Read-only | View analytics, reports |

### Permission Examples

- `users:read` - View users
- `users:write` - Edit users
- `billing:read` - View billing
- `billing:write` - Adjust credits
- `content:read` - View content
- `content:write` - Moderate content
- `settings:read` - View settings
- `settings:write` - Edit settings
- `admins:read` - View admins (super_admin only)
- `admins:write` - Manage admins (super_admin only)

---

## Key Touchpoints

### Operational Touchpoints

| Touchpoint | Screen | Action | Event | Purpose |
|------------|--------|--------|-------|---------|
| User banned | Users | Ban user | `admin.user.banned` | User management |
| Content approved | Content | Approve | `admin.content.approved` | Content moderation |
| Credits adjusted | Billing | Adjust | `admin.billing.credits.adjusted` | Billing management |
| Bug resolved | Bugs | Resolve | `admin.bug.resolved` | Support |
| Feature flag toggled | Flags | Toggle | `admin.flag.toggled` | System control |

---

## Error States

| Screen | Error | User Sees | Recovery |
|--------|-------|-----------|----------|
| Login | Wrong credentials | "Invalid credentials" | Retry |
| Login | No permission | "Access denied" | Contact super_admin |
| Any | Permission denied | "You don't have permission" | Request access |
| Any | Session expired | Redirect to login | Re-authenticate |

---

## Audit Logging

All admin actions are automatically logged:

| Action | Logged As | Properties |
|--------|-----------|------------|
| User status change | `admin.user.status.updated` | `user_id`, `old_status`, `new_status` |
| Content moderation | `admin.content.approved/rejected` | `content_id`, `reason` |
| Billing adjustment | `admin.billing.credits.adjusted` | `user_id`, `amount`, `reason` |
| Config change | `admin.config.updated` | `key`, `old_value`, `new_value` |

---

## Related Documentation

- **Routes**: `apps/admin/lib/routes.ts`
- **RBAC**: `apps/admin/IMPLEMENTATION-CHECKLIST.md`
- **Epics**: `docs/requirements/epics/admin/`
