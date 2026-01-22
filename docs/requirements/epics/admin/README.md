# Admin Back-Office Epics

This directory contains all epics related to the Admin Back-Office Application initiative ([IN-014](../../../initiatives/IN-014-admin-back-office.md)).

## Overview

The Admin Back-Office Application is a comprehensive internal web application at `admin.ryla.ai` for back-office operations including user management, billing operations, content moderation, and system configuration.

## Epics by Phase

### Phase 1: Foundation & Core Operations (MVP)

| Epic | Name | Priority | Status |
|------|------|----------|--------|
| [EP-050](./EP-050-admin-authentication.md) | Admin Authentication & RBAC | ✅ Completed | Proposed |  |  |  |  |  |
| [EP-051](./EP-051-user-management.md) | User Management Dashboard | ✅ Completed | Proposed |  |  |  |  |  |
| [EP-052](./EP-052-credits-billing.md) | Credits & Billing Operations | ✅ Completed | Proposed |  |  |  |  |  |
| [EP-053](./EP-053-bug-reports.md) | Bug Reports Management | ✅ Completed | Proposed |  |  |  |  |  |

**Phase 1 Scope**:
- Separate admin authentication system
- User search, view, and ban/unban
- Credit operations (add, refund)
- Bug report viewing and status management

**Timeline**: 3-4 weeks

### Phase 2: Content & Analytics

| Epic | Name | Priority | Status |
|------|------|----------|--------|
| [EP-054](./EP-054-content-moderation.md) | Content Moderation & Gallery | ✅ Completed | Proposed |  |  |  |  |  |
| [EP-055](./EP-055-analytics-monitoring.md) | Analytics & Monitoring | ✅ Completed | Proposed |  |  |  |  |  |

**Phase 2 Scope**:
- Browse all generated images
- Content moderation actions
- Generation job monitoring
- User and content analytics
- System health dashboard

**Timeline**: 2-3 weeks

### Phase 3: Content Library Management

| Epic | Name | Priority | Status |
|------|------|----------|--------|
| [EP-056](./EP-056-content-library.md) | Content Library Management | ✅ Completed | Proposed |  |  |  |  |  |

**Phase 3 Scope**:
- Prompt CRUD and publishing
- Template curation
- Pose/outfit preset management
- Profile picture set management
- Content tagging and categorization

**Timeline**: 2-3 weeks

### Phase 4: Advanced Operations

| Epic | Name | Priority | Status |
|------|------|----------|--------|
| [EP-057](./EP-057-advanced-operations.md) | Advanced Admin Operations | ✅ Completed | Proposed |  |  |  |  |  |

**Phase 4 Scope**:
- LoRA model management
- Admin user management
- Feature flags
- System configuration
- Notification broadcasting
- Data export

**Timeline**: 2-3 weeks

## Dependencies

```
EP-050 (Auth) ──┬──> EP-051 (Users) ──┬──> EP-052 (Billing)
                │                      │
                │                      └──> EP-053 (Bug Reports)
                │
                └──> EP-054 (Content) ──> EP-056 (Library)
                │
                └──> EP-055 (Analytics)
                │
                └──> EP-057 (Advanced) ← requires EP-050, EP-051, EP-055
```

## Key Decisions

1. **Separate Admin Users Table**: For security isolation, admin users are stored in a separate `admin_users` table
2. **Visual Consistency**: Admin panel uses same design system as web app (dark theme, purple gradients)
3. **Audit Everything**: All admin actions are logged in `audit_logs` table
4. **Role-Based Access**: Five roles with different permission levels

## Role Permissions

| Role | Description |
|------|-------------|
| `super_admin` | Full access to everything |
| `billing_admin` | Credits, subscriptions, refunds |
| `support_admin` | Users, bug reports, content moderation |
| `content_admin` | Templates, prompts, content library |
| `viewer` | Read-only access |

## Database Changes Required

New tables:
- `admin_users` - Admin accounts
- `admin_sessions` - Admin sessions
- `audit_logs` - Action audit trail
- `admin_notes` - Notes on entities
- `bug_report_status_history` - Status change tracking
- `image_moderation` - Moderation actions
- `feature_flags` - Feature flag config
- `feature_flag_history` - Flag change history
- `system_config` - System settings
- `poses` - Pose presets (if not exists)

## Related Documentation

- Initiative: [IN-014](../../../initiatives/IN-014-admin-back-office.md)
- Design System: Same as web app (`@ryla/ui`)
- Architecture: Nx monorepo pattern

---

**Last Updated**: 2026-01-19
