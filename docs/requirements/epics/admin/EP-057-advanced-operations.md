# [EPIC] EP-057: Advanced Admin Operations

**Initiative**: [IN-014](../../../initiatives/IN-014-admin-back-office.md) - Admin Back-Office Application  
**Phase**: 4  
**Priority**: P2  
**Status**: Completed

---

## Overview

Build advanced administrative capabilities including LoRA model management, feature flags, admin user management, system configuration, and notification broadcasting.

---

## Business Impact

**Target Metric**: E-CAC (Operational Efficiency)

**Hypothesis**: When we have advanced tooling for system management, we can operate more efficiently and enable more sophisticated operations.

**Success Criteria**:

- All advanced operations accessible without infrastructure access
- Admin team can be managed within the platform
- Feature flags enable safe rollouts

---

## Features

### F1: LoRA Model Management

View and manage trained LoRA models:

**List View**:
- All LoRA models
- Filter by status (pending, training, ready, failed)
- Filter by user/character
- Training progress indicator

**Model Detail**:
- Model ID and character info
- Training status and progress
- Training configuration
- Training images used
- Model file location
- Training duration and cost
- Error details (if failed)

**Actions**:
- Retry failed training
- Delete model
- View training logs
- Link to character

### F2: Admin User Management

Manage admin users (super_admin only):

**List View**:
- All admin users
- Role, status, last login
- MFA status

**Create Admin**:
- Email (invite flow)
- Name
- Role assignment
- Temporary password or invite link

**Edit Admin**:
- Change role
- Reset password
- Enable/disable account
- Force MFA setup

**Delete Admin**:
- Soft delete with confirmation
- Cannot delete self
- Cannot delete last super_admin

### F3: Feature Flags

Control feature rollout:

**Flag Types**:
- Boolean (on/off)
- Percentage rollout
- User-specific override
- Tier-specific (free, starter, pro)

**Flag Management**:
- Create new flag
- Edit flag configuration
- View flag history
- Delete flag

**Example Flags**:
- `new_studio_ui`: Rollout new studio interface
- `hd_mode_enabled`: Enable HD generation
- `video_generation`: Enable video features
- `beta_features`: Show beta features

### F4: System Configuration

Manage system settings:

**Categories**:
- Generation settings (default quality, limits)
- Credit pricing
- Subscription features per tier
- Rate limits
- Maintenance mode

**Configuration UI**:
- Grouped by category
- Type-safe editors (number, string, boolean, JSON)
- Validation before save
- Audit trail for changes

### F5: Notification Broadcasting

Send notifications to users:

**Notification Types**:
- System announcement
- Maintenance notice
- Feature announcement
- Promotional message

**Targeting**:
- All users
- By subscription tier
- By activity (active in last N days)
- Specific user list

**Scheduling**:
- Send immediately
- Schedule for future
- Recurring (daily/weekly)

### F6: Subscription Management

Advanced subscription operations:

**View Subscription**:
- Full subscription details
- Payment history (via Finby)
- Usage statistics

**Actions** (with proper Finby integration):
- Cancel subscription
- Change tier (upgrade/downgrade)
- Extend period
- Apply discount

### F7: Data Export

Export platform data:

**Export Types**:
- Users (all or filtered)
- Transactions (date range)
- Generation jobs (date range)
- Audit logs (date range)

**Formats**:
- CSV
- JSON
- Excel (future)

**Scheduling**:
- One-time export
- Scheduled recurring export (future)

### F8: System Maintenance

Maintenance operations:

- Enable/disable maintenance mode
- Maintenance banner message
- Maintenance schedule
- System health checks
- Database cleanup tools (orphaned records)

---

## Acceptance Criteria

### AC-1: LoRA Management

- [ ] Can list all LoRA models
- [ ] Can view model details
- [ ] Can retry failed training
- [ ] Can delete model
- [ ] Status updates correctly

### AC-2: Admin User Management

- [ ] Can list admin users
- [ ] Can create new admin
- [ ] Can edit admin role
- [ ] Can disable/enable admin
- [ ] Cannot delete self or last super_admin
- [ ] Audit log created

### AC-3: Feature Flags

- [ ] Can create new flag
- [ ] Can edit flag configuration
- [ ] Percentage rollout works
- [ ] User override works
- [ ] Changes take effect immediately

### AC-4: System Configuration

- [ ] Can view all settings
- [ ] Can edit settings
- [ ] Validation works
- [ ] Audit log created
- [ ] Settings apply correctly

### AC-5: Notification Broadcasting

- [ ] Can create notification
- [ ] Targeting filters work
- [ ] Can preview before send
- [ ] Scheduled sends work
- [ ] Sent notifications logged

### AC-6: Subscription Management

- [ ] Can view subscription details
- [ ] Can cancel subscription (if Finby integrated)
- [ ] Audit log created
- [ ] User notified of changes

### AC-7: Data Export

- [ ] Can export users
- [ ] Can export transactions
- [ ] Filters work correctly
- [ ] CSV format correct
- [ ] Large exports handled (async)

### AC-8: Maintenance Mode

- [ ] Can enable/disable
- [ ] Banner shows on web app
- [ ] API returns maintenance status
- [ ] Admins can still access

---

## Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `admin_lora_retried` | LoRA retry | `model_id` |
| `admin_lora_deleted` | LoRA deleted | `model_id` |
| `admin_user_created` | Admin created | `role` |
| `admin_user_role_changed` | Role changed | `admin_id`, `old_role`, `new_role` |
| `admin_flag_created` | Flag created | `flag_name` |
| `admin_flag_updated` | Flag updated | `flag_name`, `changes` |
| `admin_config_updated` | Config changed | `category`, `key` |
| `admin_notification_sent` | Notification sent | `type`, `target_count` |
| `admin_subscription_action` | Sub action | `action`, `user_id` |
| `admin_export_started` | Export started | `type`, `format` |
| `admin_maintenance_toggled` | Maintenance changed | `enabled` |

---

## User Stories

### ST-270: View LoRA Models

**As a** support admin  
**I want to** see all LoRA models and their status  
**So that** I can help users with training issues

**AC**: AC-1

### ST-271: Create Admin User

**As a** super admin  
**I want to** create new admin accounts  
**So that** team members can access the admin panel

**AC**: AC-2

### ST-272: Manage Feature Flags

**As a** super admin  
**I want to** control feature rollout with flags  
**So that** we can safely release new features

**AC**: AC-3

### ST-273: Update System Config

**As a** super admin  
**I want to** change system settings  
**So that** I can tune platform behavior

**AC**: AC-4

### ST-274: Broadcast Notification

**As a** support admin  
**I want to** send notifications to users  
**So that** I can communicate important updates

**AC**: AC-5

### ST-275: Export User Data

**As a** billing admin  
**I want to** export user and transaction data  
**So that** I can analyze it externally

**AC**: AC-7

### ST-276: Enable Maintenance Mode

**As a** super admin  
**I want to** put the platform in maintenance mode  
**So that** users know we're doing updates

**AC**: AC-8

---

## Technical Notes

### API Endpoints

```typescript
// Admin tRPC Router - Advanced Operations

// LoRA Models
admin.lora.list({ filters, limit, offset })
admin.lora.get({ modelId })
admin.lora.retry({ modelId })
admin.lora.delete({ modelId })

// Admin Users
admin.admins.list()
admin.admins.get({ adminId })
admin.admins.create({ email, name, role })
admin.admins.update({ adminId, data })
admin.admins.disable({ adminId })
admin.admins.enable({ adminId })
admin.admins.resetPassword({ adminId })
admin.admins.delete({ adminId })

// Feature Flags
admin.flags.list()
admin.flags.get({ flagName })
admin.flags.create({ name, type, config })
admin.flags.update({ flagName, config })
admin.flags.delete({ flagName })
admin.flags.checkForUser({ flagName, userId })

// System Config
admin.config.list({ category? })
admin.config.get({ key })
admin.config.set({ key, value })
admin.config.getHistory({ key })

// Notifications
admin.notifications.list({ limit, offset })
admin.notifications.create({ type, title, message, targeting, schedule? })
admin.notifications.preview({ targeting })
admin.notifications.cancel({ notificationId })

// Subscriptions (Advanced)
admin.subscriptions.cancel({ userId, reason })
admin.subscriptions.changeTier({ userId, newTier })
admin.subscriptions.extend({ userId, days })

// Export
admin.export.users({ filters, format })
admin.export.transactions({ dateFrom, dateTo, format })
admin.export.jobs({ dateFrom, dateTo, format })
admin.export.status({ exportId })
admin.export.download({ exportId })

// Maintenance
admin.maintenance.getStatus()
admin.maintenance.enable({ message, scheduledEnd? })
admin.maintenance.disable()
```

### Feature Flags Schema

```typescript
export const featureFlags = pgTable('feature_flags', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull().unique(),
  description: text('description'),
  type: text('type').notNull(), // 'boolean', 'percentage', 'tier'
  enabled: boolean('enabled').default(false),
  config: jsonb('config').$type<{
    percentage?: number;
    tiers?: string[];
    userOverrides?: Record<string, boolean>;
  }>(),
  createdBy: uuid('created_by').references(() => adminUsers.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const featureFlagHistory = pgTable('feature_flag_history', {
  id: uuid('id').defaultRandom().primaryKey(),
  flagId: uuid('flag_id').references(() => featureFlags.id, { onDelete: 'cascade' }),
  adminUserId: uuid('admin_user_id').references(() => adminUsers.id),
  oldConfig: jsonb('old_config'),
  newConfig: jsonb('new_config'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

### System Config Schema

```typescript
export const systemConfig = pgTable('system_config', {
  id: uuid('id').defaultRandom().primaryKey(),
  key: text('key').notNull().unique(),
  value: jsonb('value').notNull(),
  category: text('category').notNull(),
  description: text('description'),
  validationType: text('validation_type'), // 'number', 'string', 'boolean', 'json'
  updatedBy: uuid('updated_by').references(() => adminUsers.id),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Example configs
const DEFAULT_CONFIGS = [
  { key: 'generation.max_concurrent', value: 5, category: 'generation' },
  { key: 'generation.default_quality', value: 'draft', category: 'generation' },
  { key: 'credits.draft_cost', value: 1, category: 'credits' },
  { key: 'credits.hq_cost', value: 3, category: 'credits' },
  { key: 'rate_limit.generations_per_minute', value: 10, category: 'rate_limits' },
  { key: 'maintenance.enabled', value: false, category: 'maintenance' },
  { key: 'maintenance.message', value: '', category: 'maintenance' },
];
```

### UI Components

```
apps/admin/app/advanced/
├── lora/
│   ├── page.tsx               # LoRA list
│   └── [id]/
│       └── page.tsx           # LoRA detail
├── admins/
│   ├── page.tsx               # Admin users list
│   ├── new/
│   │   └── page.tsx           # Create admin
│   └── [id]/
│       └── page.tsx           # Edit admin
├── flags/
│   ├── page.tsx               # Feature flags
│   └── [name]/
│       └── page.tsx           # Flag detail
├── config/
│   └── page.tsx               # System config
├── notifications/
│   ├── page.tsx               # Notification list
│   └── new/
│       └── page.tsx           # Create notification
├── subscriptions/
│   └── page.tsx               # Advanced sub management
├── export/
│   └── page.tsx               # Data export
├── maintenance/
│   └── page.tsx               # Maintenance mode
├── components/
│   ├── LoraCard.tsx
│   ├── AdminUserForm.tsx
│   ├── FlagEditor.tsx
│   ├── ConfigEditor.tsx
│   ├── NotificationForm.tsx
│   ├── ExportDialog.tsx
│   └── MaintenanceBanner.tsx
└── hooks/
    ├── useLora.ts
    ├── useAdminUsers.ts
    ├── useFeatureFlags.ts
    └── useSystemConfig.ts
```

### Feature Flag Check Utility

```typescript
// libs/shared/src/feature-flags/index.ts
export async function checkFeatureFlag(
  flagName: string,
  userId?: string,
  tier?: string
): Promise<boolean> {
  const flag = await getFlag(flagName);
  
  if (!flag || !flag.enabled) return false;
  
  switch (flag.type) {
    case 'boolean':
      return true;
      
    case 'percentage':
      // Deterministic based on user ID
      if (!userId) return false;
      const hash = hashUserId(userId);
      return hash < (flag.config.percentage || 0);
      
    case 'tier':
      if (!tier) return false;
      return flag.config.tiers?.includes(tier) || false;
      
    default:
      return false;
  }
}
```

---

## Non-Goals (Phase 2+)

- Automated LoRA retraining
- Complex permission builder (ACL)
- A/B testing framework
- Multi-tenant admin
- API key management
- Webhook management

---

## Dependencies

- EP-050: Admin Authentication (RBAC for super_admin)
- EP-051: User Management (user context)
- EP-055: Analytics (system health)
- Existing loraModels, subscriptions, notifications schemas
- Finby integration for subscription operations

---

## Security Considerations

1. **Admin management**: Only super_admin can manage admins
2. **Feature flags**: Changes logged and reversible
3. **System config**: Validation prevents breaking changes
4. **Subscription actions**: Require confirmation and audit
5. **Data export**: Rate limited, logged

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
