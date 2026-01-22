# [INITIATIVE] IN-014: Admin Back-Office Application

**Status**: Completed  
**Created**: 2026-01-19  
**Last Updated**: 2026-01-19  
**Owner**: Product/Engineering Team  
**Stakeholders**: Operations, Customer Support, Finance

---

## Executive Summary

**One-sentence description**: Build a comprehensive internal admin web application at `admin.ryla.ai` for back-office operations including user management, billing operations, content moderation, and system configuration.

**Business Impact**: E-CAC (operational efficiency), B-Retention (faster support response), D-Conversion (refund handling)

---

## Why (Business Rationale)

### Problem Statement

As RYLA scales, we need robust internal tooling for:

- Managing user accounts and support requests
- Handling billing operations (credits, refunds, subscriptions)
- Moderating generated content
- Managing prompt/template libraries
- Monitoring system health and usage analytics
- Responding to bug reports and feature requests

### Current State

- No centralized admin interface
- Operations require direct database access
- Support requests handled manually via email
- No visibility into user credit usage or generation patterns
- Bug reports exist in database but no UI to manage them
- Templates/prompts managed ad-hoc

### Desired State

- Fully functional admin dashboard at `admin.ryla.ai`
- Role-based access control for admin operations
- Complete visibility into user accounts, billing, and content
- Streamlined workflows for common support operations
- Content management for prompts, templates, poses, outfits
- Real-time system monitoring and analytics

### Business Drivers

- **Revenue Impact**: Faster refund processing, better subscription visibility
- **Cost Impact**: Reduced operational overhead, fewer manual DB operations
- **Risk Mitigation**: Audit trail for admin actions, proper access controls
- **Competitive Advantage**: Professional-grade operations tooling
- **User Experience**: Faster support response times

---

## How (Approach & Strategy)

### Strategy

Build a standalone Next.js application sharing the same Postgres database but with dedicated admin authentication. Prioritize MVP features for day-to-day operations first.

### Key Principles

- **Visual Consistency**: Admin panel MUST look exactly like the web app (same design system, colors, fonts, components)
- **Mobile-Ready**: Responsive design that works on tablets and mobile devices (support team may use mobile)
- **Security First**: Separate admin_users table, strict RBAC, audit logging
- **Progressive Enhancement**: Start with read-only views, then add write operations
- **Reuse Everything**: Leverage `@ryla/ui`, `@ryla/business`, and `@ryla/data` libs
- **Audit Everything**: Log all admin actions for compliance
- **Dark Mode Only**: Match the RYLA brand identity with consistent dark theme

### Architecture Decision: Separate Admin Users Table

**Recommendation: Use a separate `admin_users` table** rather than adding roles to the existing users table.

**Rationale:**

1. **Security Isolation**: Complete separation prevents privilege escalation attacks
2. **Different Auth Flow**: Admins may need MFA, IP restrictions, SSO integration
3. **Audit Requirements**: Separate table simplifies admin-specific audit trails
4. **No Customer Data Leakage**: Admin credentials never mix with customer data
5. **Easier Compliance**: GDPR/SOC2 separation of duties

**Alternative (Shared Table with Roles):**

- Pros: Simpler schema, users can become admins easily
- Cons: Higher security risk, mixed concerns, harder to audit

### Phases

#### Phase 1: Foundation & Core Operations (MVP)

**Timeline**: 3-4 weeks

- Admin authentication (separate table, MFA optional)
- User account management (view, search, ban/unban)
- Credit operations (view balance, add credits, refunds)
- Subscription management (view status, history)
- Bug reports management (view, status updates, respond)

#### Phase 2: Content & Analytics

**Timeline**: 2-3 weeks

- Image gallery browser (search, filter, moderate)
- Generation job monitoring
- User analytics dashboard
- System health dashboard

#### Phase 3: Content Library Management

**Timeline**: 2-3 weeks

- Prompt management (CRUD, publish/draft status)
- Template management (curate, feature, categories)
- Pose/outfit preset management
- Profile picture set management

#### Phase 4: Advanced Operations

**Timeline**: 2-3 weeks

- Influencer request review workflow
- LoRA model management
- Audit log viewer
- Feature flags/system configuration
- Notification broadcasting

### Dependencies

- Existing `@ryla/data` schemas and repositories
- Existing `@ryla/business` services
- Supabase/Postgres database connection
- R2/S3 storage access for images

### Constraints

- Must not interfere with production web app performance
- Audit logging required for all write operations
- VPN/IP restriction capability for production access
- 2FA recommended for production admin access

---

## When (Timeline & Priority)

### Timeline

- **Start Date**: TBD
- **Target MVP Completion**: +4 weeks from start
- **Full Feature Completion**: +10 weeks from start

### Key Milestones

- **M1**: Admin auth + user management (Week 2)
- **M2**: Credits/billing operations (Week 3)
- **M3**: Bug reports + content moderation (Week 4)
- **M4**: Analytics + monitoring (Week 6)
- **M5**: Content library management (Week 8)
- **M6**: Advanced operations (Week 10)

### Priority

**Priority Level**: P1

**Rationale**: Essential for scalable operations. Currently blocking efficient customer support and billing operations.

### Resource Requirements

- **Team**: 1-2 Full-stack developers
- **Budget**: Standard development costs
- **External Dependencies**: None (uses existing infrastructure)

---

## Who (Stakeholders & Ownership)

### Initiative Owner

**Name**: TBD  
**Role**: Product/Engineering Lead  
**Responsibilities**: Feature prioritization, milestone tracking, stakeholder updates

### Key Stakeholders

| Name             | Role             | Involvement | Responsibilities                |
| ---------------- | ---------------- | ----------- | ------------------------------- |
| Operations       | Back-office team | High        | Define workflows, test features |
| Customer Support | Support team     | High        | Define support workflows        |
| Finance          | Billing team     | Medium      | Billing/refund requirements     |
| Engineering      | Development      | High        | Implementation                  |

### Teams Involved

- Engineering: Full implementation
- Operations: Requirements, testing, feedback
- Security: Auth review, access controls

### Communication Plan

- **Updates Frequency**: Weekly
- **Update Format**: Slack updates in #mvp-ryla-dev
- **Audience**: Product, Engineering, Operations

---

## Success Criteria

### Primary Success Metrics

| Metric                          | Target      | Measurement Method  | Timeline            |
| ------------------------------- | ----------- | ------------------- | ------------------- |
| Time to resolve support request | < 5 minutes | Average ticket time | Month 1 post-launch |
| Admin actions per day           | > 50        | Usage analytics     | Month 1 post-launch |
| Direct DB operations eliminated | 100%        | Audit               | Month 1 post-launch |

### Business Metrics Impact

**Target Metric**: [x] E-CAC [x] B-Retention [ ] A-Activation [ ] C-Core Value [x] D-Conversion

**Expected Impact**:

- E-CAC: -50% time spent on manual operations
- B-Retention: +30% faster support response time
- D-Conversion: +20% faster refund processing

### Leading Indicators

- Admin login frequency
- Actions per session
- Support ticket volume decrease

### Lagging Indicators

- Customer satisfaction scores
- Support response time
- Churn rate improvement

---

## Definition of Done

### Initiative Complete When:

- [ ] All MVP features implemented and tested
- [ ] Admin authentication with separate user table
- [ ] User management operational
- [ ] Billing operations (credits/refunds) working
- [ ] Bug reports management functional
- [ ] Content moderation tools available
- [ ] Analytics dashboards deployed
- [ ] Content library management complete
- [ ] Audit logging implemented
- [ ] Documentation complete
- [ ] Operations team trained

### Not Done Criteria

**This initiative is NOT done if:**

- [ ] No separate admin authentication
- [ ] Missing audit trails
- [ ] No role-based access control
- [ ] Critical operations still require DB access
- [ ] No documentation/training

---

## Related Work

### Epics

| Epic   | Name                         | Status   | Priority | Phase | Link                                                               |
| ------ | ---------------------------- | -------- | -------- | ----- | ------------------------------------------------------------------ |
| EP-050 | Admin Authentication & RBAC  | Proposed | P0       | 1     | [View](../requirements/epics/admin/EP-050-admin-authentication.md) |
| EP-051 | User Management Dashboard    | Proposed | P0       | 1     | [View](../requirements/epics/admin/EP-051-user-management.md)      |
| EP-052 | Credits & Billing Operations | Proposed | P0       | 1     | [View](../requirements/epics/admin/EP-052-credits-billing.md)      |
| EP-053 | Bug Reports Management       | Proposed | P0       | 1     | [View](../requirements/epics/admin/EP-053-bug-reports.md)          |
| EP-054 | Content Moderation & Gallery | Proposed | P1       | 2     | [View](../requirements/epics/admin/EP-054-content-moderation.md)   |
| EP-055 | Analytics & Monitoring       | Proposed | P1       | 2     | [View](../requirements/epics/admin/EP-055-analytics-monitoring.md) |
| EP-056 | Content Library Management   | Proposed | P2       | 3     | [View](../requirements/epics/admin/EP-056-content-library.md)      |
| EP-057 | Advanced Admin Operations    | Proposed | P2       | 4     | [View](../requirements/epics/admin/EP-057-advanced-operations.md)  |

### Dependencies

- **Blocks**: Nothing directly
- **Blocked By**: None (can start immediately)
- **Related Initiatives**: IN-011 (Template Gallery - content management overlap)

### Documentation

- Technical: Architecture Decision Record (to be created)
- Security: Access Control Specification (to be created)

---

## Risks & Mitigation

| Risk                           | Probability | Impact | Mitigation Strategy                             |
| ------------------------------ | ----------- | ------ | ----------------------------------------------- |
| Security vulnerability         | Medium      | High   | Code review, penetration testing, separate auth |
| Scope creep                    | High        | Medium | Strict MVP focus, phase-gated features          |
| Performance impact on main app | Low         | High   | Separate connection pool, read replicas         |
| Admin privilege abuse          | Low         | High   | Audit logging, role-based access                |

---

## Technical Specification

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     admin.ryla.ai                                │
│                   (Next.js App Router)                          │
├─────────────────────────────────────────────────────────────────┤
│  Pages/Routes                                                    │
│  ├── /auth/login                    Admin login                 │
│  ├── /dashboard                     Overview dashboard          │
│  ├── /users                         User management             │
│  ├── /users/[id]                    User detail view            │
│  ├── /billing                       Billing overview            │
│  ├── /billing/credits               Credit operations           │
│  ├── /billing/subscriptions         Subscription management     │
│  ├── /support/bug-reports           Bug reports queue           │
│  ├── /support/influencer-requests   Influencer requests         │
│  ├── /content/gallery               Image gallery browser       │
│  ├── /content/prompts               Prompt management           │
│  ├── /content/templates             Template management         │
│  ├── /content/poses                 Pose preset management      │
│  ├── /content/outfits               Outfit preset management    │
│  ├── /analytics                     Usage analytics             │
│  ├── /system/health                 System health               │
│  ├── /system/jobs                   Generation jobs monitor     │
│  ├── /system/audit                  Audit log viewer            │
│  └── /settings                      Admin settings              │
├─────────────────────────────────────────────────────────────────┤
│  API Routes (tRPC)                                               │
│  ├── admin.auth.*                   Admin authentication        │
│  ├── admin.users.*                  User operations             │
│  ├── admin.billing.*                Billing operations          │
│  ├── admin.content.*                Content operations          │
│  ├── admin.support.*                Support operations          │
│  └── admin.system.*                 System operations           │
├─────────────────────────────────────────────────────────────────┤
│                      Shared Libraries                            │
│  @ryla/data       → Database schemas, repositories              │
│  @ryla/business   → Business logic services                     │
│  @ryla/shared     → Types, constants, utilities                 │
│  @ryla/ui         → Shared UI components                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     PostgreSQL Database                          │
│  (Shared with web app, uses same @ryla/data schemas)            │
│  + New: admin_users, admin_sessions, audit_logs tables          │
└─────────────────────────────────────────────────────────────────┘
```

### New Database Schemas Required

#### 1. Admin Users Table

```typescript
// libs/data/src/schema/admin-users.schema.ts
export const adminRoleEnum = pgEnum('admin_role', [
  'super_admin', // Full access to everything
  'billing_admin', // Credits, subscriptions, refunds
  'support_admin', // User management, bug reports
  'content_admin', // Templates, prompts, moderation
  'viewer', // Read-only access
]);

export const adminUsers = pgTable('admin_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(), // bcrypt hashed
  name: text('name').notNull(),
  role: adminRoleEnum('role').notNull().default('viewer'),

  // Security
  mfaEnabled: boolean('mfa_enabled').default(false),
  mfaSecret: text('mfa_secret'), // TOTP secret
  lastLoginAt: timestamp('last_login_at'),
  lastLoginIp: text('last_login_ip'),
  failedLoginAttempts: integer('failed_login_attempts').default(0),
  lockedUntil: timestamp('locked_until'),

  // Status
  isActive: boolean('is_active').default(true),

  // Audit
  createdBy: uuid('created_by'), // Self-referencing
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});
```

#### 2. Admin Sessions Table

```typescript
export const adminSessions = pgTable('admin_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  adminUserId: uuid('admin_user_id')
    .notNull()
    .references(() => adminUsers.id, { onDelete: 'cascade' }),
  accessToken: text('access_token').notNull(),
  refreshToken: text('refresh_token'),
  userAgent: text('user_agent'),
  ipAddress: text('ip_address'),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

#### 3. Audit Logs Table

```typescript
export const auditActionEnum = pgEnum('audit_action', [
  'create',
  'read',
  'update',
  'delete',
  'login',
  'logout',
  'export',
]);

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  adminUserId: uuid('admin_user_id')
    .notNull()
    .references(() => adminUsers.id),
  action: auditActionEnum('action').notNull(),
  resourceType: text('resource_type').notNull(), // 'user', 'credit', 'subscription', etc.
  resourceId: uuid('resource_id'),
  oldValue: jsonb('old_value'), // Previous state (for updates)
  newValue: jsonb('new_value'), // New state
  metadata: jsonb('metadata'), // Additional context
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').defaultNow(),
});
```

### Feature Breakdown by Priority

#### MVP (Phase 1) - Must Have

| Feature                 | Description                            | Complexity |
| ----------------------- | -------------------------------------- | ---------- |
| **Admin Auth**          | Login, logout, session management      | Medium     |
| **User Search**         | Search users by email, name, ID        | Low        |
| **User Detail View**    | View complete user profile             | Low        |
| **User Status**         | Ban/unban users                        | Low        |
| **Credit Balance View** | See user's current credits             | Low        |
| **Credit History**      | View all credit transactions           | Low        |
| **Add Credits**         | Manually add credits with reason       | Medium     |
| **Credit Refund**       | Refund credits for failed generations  | Medium     |
| **Subscription View**   | See subscription status, tier, dates   | Low        |
| **Bug Reports List**    | View all bug reports, filter by status | Low        |
| **Bug Report Detail**   | View full bug report with screenshot   | Low        |
| **Bug Report Status**   | Update status, add admin notes         | Low        |

#### Phase 2 - Should Have

| Feature                 | Description                             | Complexity |
| ----------------------- | --------------------------------------- | ---------- |
| **Image Gallery**       | Browse all generated images             | Medium     |
| **Image Moderation**    | Flag/remove inappropriate content       | Medium     |
| **Generation Jobs**     | Monitor job queue, status, errors       | Medium     |
| **User Analytics**      | Credit usage patterns, generation stats | Medium     |
| **System Health**       | Database, Redis, S3 status              | Low        |
| **Influencer Requests** | Review and approve/reject requests      | Medium     |

#### Phase 3 - Nice to Have

| Feature                  | Description                      | Complexity |
| ------------------------ | -------------------------------- | ---------- |
| **Prompt CRUD**          | Create, edit, delete prompts     | Medium     |
| **Prompt Categories**    | Manage prompt categories         | Low        |
| **Template Curation**    | Feature, categorize templates    | Medium     |
| **Pose Management**      | CRUD for pose presets            | Medium     |
| **Outfit Management**    | CRUD for outfit presets          | Medium     |
| **Profile Picture Sets** | Manage starter sets              | Medium     |
| **Generate from Admin**  | Test generation from admin panel | High       |

#### Phase 4 - Future

| Feature                     | Description                             | Complexity |
| --------------------------- | --------------------------------------- | ---------- |
| **LoRA Model Viewer**       | View trained models, status             | Medium     |
| **Audit Log Viewer**        | Search, filter, export audit logs       | Medium     |
| **Feature Flags**           | Enable/disable features per user/global | Medium     |
| **System Config**           | Manage system settings                  | Medium     |
| **Broadcast Notifications** | Send notifications to users             | Medium     |
| **Subscription Management** | Cancel, upgrade, downgrade              | High       |
| **Admin User Management**   | CRUD for admin users                    | Medium     |
| **Role Management**         | Custom permissions                      | High       |

### API Endpoints Structure

```typescript
// Admin tRPC Router Structure
adminRouter = {
  // Authentication
  auth: {
    login: procedure,
    logout: procedure,
    refreshToken: procedure,
    me: procedure,
  },

  // User Management
  users: {
    list: procedure, // GET with pagination, filters
    get: procedure, // GET by ID
    ban: procedure, // POST ban user
    unban: procedure, // POST unban user
    getCredits: procedure, // GET credit balance + history
    getSubscription: procedure,
    getCharacters: procedure,
    getImages: procedure,
  },

  // Billing Operations
  billing: {
    addCredits: procedure, // POST add credits
    refundCredits: procedure, // POST refund credits
    adjustCredits: procedure, // POST manual adjustment
    getTransactions: procedure, // GET all transactions
    getSubscriptions: procedure, // GET all subscriptions
  },

  // Support
  support: {
    bugReports: {
      list: procedure,
      get: procedure,
      updateStatus: procedure,
      addNote: procedure,
    },
    influencerRequests: {
      list: procedure,
      get: procedure,
      approve: procedure,
      reject: procedure,
    },
  },

  // Content
  content: {
    images: {
      list: procedure,
      get: procedure,
      moderate: procedure, // Flag/remove
    },
    prompts: {
      list: procedure,
      create: procedure,
      update: procedure,
      delete: procedure,
      publish: procedure,
    },
    templates: {
      list: procedure,
      get: procedure,
      curate: procedure,
      feature: procedure,
    },
  },

  // System
  system: {
    health: procedure,
    jobs: {
      list: procedure,
      get: procedure,
      retry: procedure,
      cancel: procedure,
    },
    audit: {
      list: procedure,
      export: procedure,
    },
  },
};
```

### UI/UX Design System (Visual Consistency with Web App)

**CRITICAL REQUIREMENT**: The admin panel MUST look and feel exactly like the main web app (`app.ryla.ai`). This ensures brand consistency, reduces cognitive load for team members who use both interfaces, and maintains the premium RYLA aesthetic.

#### Design System Alignment

The admin app will share the **exact same design system** as the web app:

| Element                  | Value                       | CSS Variable         |
| ------------------------ | --------------------------- | -------------------- |
| **Background**           | `#121214`                   | `--background`       |
| **Card Background**      | `#111113`                   | `--card`             |
| **Secondary Background** | `#1a1a1d`                   | `--secondary`        |
| **Primary Color**        | `#a855f7` (Purple)          | `--primary`          |
| **Accent Color**         | `#9333ea` (Deep Purple)     | `--accent`           |
| **Pink Accent**          | `#ec4899`                   | `--chart-2`          |
| **Border**               | `rgba(255, 255, 255, 0.08)` | `--border`           |
| **Text Primary**         | `#ffffff`                   | `--foreground`       |
| **Text Muted**           | `rgba(255, 255, 255, 0.4)`  | `--muted-foreground` |
| **Destructive**          | `#ef4444`                   | `--destructive`      |
| **Success**              | `#22c55e`                   | `--chart-3`          |
| **Radius**               | `0.625rem` (10px)           | `--radius`           |

#### Typography

| Element          | Font           | Weight             |
| ---------------- | -------------- | ------------------ |
| **Primary Font** | DM Sans        | 400, 500, 600, 700 |
| **Monospace**    | JetBrains Mono | 400, 500, 600      |

#### Gradient System

```css
/* Primary Gradient (Purple → Pink) */
background: linear-gradient(135deg, #9333ea 0%, #ec4899 100%);

/* Hover Gradient */
background: linear-gradient(135deg, #a855f7 0%, #f472b6 100%);

/* Background Gradient (for headers/accents) */
background: linear-gradient(
  to bottom,
  rgba(10, 10, 11, 0.8) 0.2%,
  rgba(147, 51, 234, 0.3) 50%,
  rgba(10, 10, 11, 0.8) 99.8%
);
```

#### Shared Resources

```
├── @ryla/ui                          # Shared component library
│   ├── design-system/tokens.ts       # Design tokens
│   ├── styles/design-tokens.css      # CSS variables
│   └── components/                   # Shared components
├── apps/web/app/globals.css          # Reference for custom utilities
└── libs/ui/src/components/           # Button, Card, Input, etc.
```

#### Layout Structure

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Top Header Bar (64px)                                    [User ▾] [🔔] │
│  ┌─────────────────────────────────────────────────────────────────────┐
│  │ RYLA Admin                                              Search [🔍] │
│  └─────────────────────────────────────────────────────────────────────┘
├──────────────┬──────────────────────────────────────────────────────────┤
│              │                                                          │
│  Sidebar     │  Main Content Area                                       │
│  (256px)     │                                                          │
│              │  ┌─────────────────────────────────────────────────────┐ │
│  • Dashboard │  │ Page Header + Breadcrumbs                           │ │
│  • Users     │  ├─────────────────────────────────────────────────────┤ │
│  • Billing   │  │                                                     │ │
│  • Support   │  │ Content Cards                                       │ │
│  • Content   │  │                                                     │ │
│  • Analytics │  │ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐    │ │
│  • System    │  │ │ Stat Card   │ │ Stat Card   │ │ Stat Card   │    │ │
│  • Settings  │  │ └─────────────┘ └─────────────┘ └─────────────┘    │ │
│              │  │                                                     │ │
│              │  │ ┌───────────────────────────────────────────────┐  │ │
│              │  │ │ Data Table                                    │  │ │
│              │  │ │ ┌──────────────────────────────────────────┐  │  │ │
│              │  │ │ │ Filters    │ Search     │ Export ▾       │  │  │ │
│              │  │ │ ├──────────────────────────────────────────┤  │  │ │
│              │  │ │ │ ID | Name | Email | Status | Actions    │  │  │ │
│              │  │ │ ├──────────────────────────────────────────┤  │  │ │
│              │  │ │ │ ...                                       │  │  │ │
│              │  │ │ └──────────────────────────────────────────┘  │  │ │
│              │  │ │ ← 1 2 3 ... 10 →                              │  │ │
│              │  │ └───────────────────────────────────────────────┘  │ │
│              │  └─────────────────────────────────────────────────────┘ │
└──────────────┴──────────────────────────────────────────────────────────┘
```

#### Component Patterns (Matching Web App)

**Buttons:**

```tsx
// Primary (Purple gradient) - same as web app
<button className="bg-primary-gradient text-white rounded-lg px-4 py-2
  hover:bg-primary-gradient:hover transition-colors">
  Action
</button>

// Secondary (Ghost with gradient border)
<button className="ghost-button">
  Secondary Action
</button>

// Destructive
<button className="bg-destructive text-white rounded-lg px-4 py-2">
  Delete
</button>
```

**Cards:**

```tsx
// Standard card - same dark theme
<div className="bg-card rounded-lg border border-border p-6">
  <h3 className="text-lg font-semibold text-foreground">Card Title</h3>
  <p className="text-muted-foreground">Card content</p>
</div>

// Elevated card with gradient accent
<div className="bg-card rounded-lg border border-border p-6
  shadow-[0px_0px_12.3px_rgba(255,255,255,0.1)]">
  Content
</div>
```

**Data Tables:**

```tsx
// Dark theme tables matching web app aesthetic
<table className="w-full">
  <thead className="bg-secondary border-b border-border">
    <tr>
      <th className="text-left text-muted-foreground text-sm font-medium p-4">
        Column
      </th>
    </tr>
  </thead>
  <tbody>
    <tr className="border-b border-border hover:bg-secondary/50 transition-colors">
      <td className="p-4 text-foreground">Data</td>
    </tr>
  </tbody>
</table>
```

**Form Inputs:**

```tsx
// Matching web app input styling
<input
  className="w-full bg-input border border-border rounded-lg px-4 py-2 
    text-foreground placeholder:text-muted-foreground
    focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
  placeholder="Search..."
/>
```

#### Sidebar Navigation

```tsx
// Sidebar using same design tokens as web app
<aside className="w-64 bg-sidebar border-r border-sidebar-border">
  <nav className="p-4 space-y-1">
    <a
      className="flex items-center gap-3 px-3 py-2 rounded-lg 
      text-sidebar-foreground hover:bg-sidebar-accent 
      data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
    >
      <Icon className="w-5 h-5" />
      <span>Menu Item</span>
    </a>
  </nav>
</aside>
```

#### Animation Patterns

Use the same animations defined in web app:

- `animate-shimmer` for loading states
- `pulse-button` for CTA emphasis
- `transition-colors` for hover states
- Smooth scrolling (`scroll-behavior: smooth`)

#### Responsive Behavior

- **Desktop-first** (admin is primarily desktop usage)
- **Minimum width**: 1280px optimized
- **Collapsible sidebar** at 1024px and below
- **Touch-friendly targets**: 44px minimum (for tablet support)

#### Dark Mode Only

Admin panel will be **dark mode only** (matching main web app):

- `<html className="dark">`
- No light mode toggle needed
- Consistent with RYLA brand identity

### Tech Stack

```
Framework:      Next.js 14 (App Router)
Language:       TypeScript 5.x
Styling:        TailwindCSS 4.x + @ryla/ui design system
Components:     Shadcn/ui (same as web app)
State:          Zustand (for client state)
Data Fetching:  TanStack Query + tRPC
Forms:          React Hook Form + Zod
Tables:         TanStack Table v8
Charts:         Recharts (with RYLA color tokens)
Icons:          Lucide React (same as web app)
Fonts:          DM Sans, JetBrains Mono (same as web app)
Auth:           Custom JWT (separate from main app)
```

### Implementation Requirements

1. **Import shared design tokens** from `@ryla/ui`:

   ```css
   @import '../../../libs/ui/src/styles/design-tokens.css';
   ```

2. **Use same globals.css structure** as web app (copy and adapt)

3. **Reuse @ryla/ui components** wherever possible:

   - Button, Card, Input, Dialog, Toast, etc.
   - Only create admin-specific components when needed

4. **Follow same class naming conventions**:
   - Use CSS variables via `var(--token)`
   - Use Tailwind utilities with design tokens
   - Use CVA for component variants

---

## Progress Tracking

### Current Phase

**Phase**: Not Started  
**Status**: Proposed

### Recent Updates

- **2026-01-19**: Initiative document created

### Next Steps

1. Review and approve initiative
2. Create EP-040 (Admin Auth) detailed requirements
3. Set up `apps/admin` project structure
4. Implement admin authentication flow

---

## Appendix A: Existing Data Models Summary

Based on codebase analysis, here are the existing schemas that the admin panel will interact with:

### User-Related

- `users` - User accounts with role enum (user/admin)
- `userCredits` - Credit balances
- `creditTransactions` - Credit history
- `subscriptions` - Subscription status

### Content-Related

- `characters` - AI influencer characters
- `images` - Generated images
- `generationJobs` - Job queue
- `templates` - User templates
- `prompts` - Prompt library
- `promptSets` - Profile picture sets
- `outfitPresets` - Outfit configurations
- `loraModels` - Trained LoRA models

### Support-Related

- `bugReports` - Bug reports with screenshots
- `influencerRequests` - Real person requests
- `notifications` - User notifications

### Existing Role System

Current `users.role` enum: `['user', 'admin']`
JWT includes role in payload.

**Note**: Even though an admin role exists, we recommend a separate `admin_users` table for security isolation.

---

## Appendix B: Domain Configuration

### Production Domains

| Domain            | Service         | Purpose               |
| ----------------- | --------------- | --------------------- |
| `admin.ryla.ai`   | Admin Dashboard | New - this initiative |
| `app.ryla.ai`     | Web App         | Existing              |
| `end.ryla.ai`     | API             | Existing              |
| `ryla.ai`         | Landing         | Existing              |
| `goviral.ryla.ai` | Funnel          | Existing              |

### DNS Configuration Required

- A/CNAME record: `admin.ryla.ai` → Vercel/Fly deployment
- SSL: Automatic via provider

---

**Template Version**: 1.0  
**Last Template Update**: 2026-01-19
