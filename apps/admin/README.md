# RYLA Admin Panel

Admin back-office application for RYLA platform management.

## Overview

The admin panel provides a secure, mobile-responsive interface for managing:

- **Users**: View, search, and manage user accounts
- **Credits & Billing**: Handle transactions, subscriptions, and refunds
- **Bug Reports**: Track and resolve user-reported issues
- **Content Moderation**: Browse and moderate generated images
- **Analytics**: Monitor platform metrics and performance
- **Content Library**: Manage prompts, templates, poses, and outfits
- **Settings**: Configure admin preferences and system settings

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: TailwindCSS 4 (matching `@ryla/ui` design system)
- **State**: React Context for auth
- **Auth**: Custom JWT with bcrypt
- **Icons**: Lucide React
- **Domain**: `admin.ryla.ai`

## Getting Started

### Prerequisites

1. Build the shared libraries:
   ```bash
   pnpm nx run-many --target=build --projects=shared,business,ui,trpc,analytics,data
   ```

2. Set up environment variables:
   ```bash
   # Create .env.local
   ADMIN_JWT_SECRET=your-secure-secret-key
   ```

### Development

```bash
# Start the admin app (port 3004)
pnpm nx serve admin

# Or with Infisical secrets
infisical run --path=/apps/admin --env=dev -- pnpm nx serve admin
```

### Build

```bash
pnpm nx build admin
```

## Project Structure

```
apps/admin/
├── app/
│   ├── (admin)/              # Protected admin routes
│   │   ├── dashboard/        # Main dashboard
│   │   ├── users/           # User management
│   │   ├── billing/         # Credits & billing
│   │   ├── bugs/            # Bug reports
│   │   ├── content/         # Content moderation
│   │   ├── analytics/       # Analytics dashboard
│   │   ├── library/         # Content library
│   │   ├── settings/        # Admin settings
│   │   └── layout.tsx       # Auth guard & shell
│   ├── api/
│   │   └── auth/            # Auth API routes
│   ├── login/               # Login page
│   ├── layout.tsx           # Root layout
│   └── globals.css          # Styles (RYLA theme)
├── components/
│   └── admin-shell/         # Main navigation shell
├── lib/
│   ├── auth-context.tsx     # Auth state management
│   └── empty-module.js      # Webpack client-side exclusion
├── next.config.js           # Next.js config
├── tsconfig.json            # TypeScript config
└── project.json             # Nx project config
```

## Authentication

The admin panel uses a separate authentication system from the main app:

- **Separate `admin_users` table** for security isolation
- **JWT tokens** with 24-hour expiration
- **Role-based access control (RBAC)** with 5 roles:
  - `super_admin`: Full access
  - `admin`: All operational features
  - `support`: User and billing support
  - `moderator`: Content moderation only
  - `viewer`: Read-only access

### Default Credentials (Development)

```
Email: admin@ryla.ai
Password: admin123
```

## Mobile Responsiveness

The admin panel is designed mobile-first following RYLA's mobile UX guidelines:

- **Touch targets**: Minimum 44x44px for all interactive elements
- **Responsive layouts**: Single column on mobile, multi-column on desktop
- **Mobile navigation**: Hamburger menu with slide-out sidebar
- **Responsive tables**: Card layout on mobile, table on desktop
- **Text sizes**: Minimum 14px, 16px for inputs

## Design System

The admin panel uses the same design system as the web app:

- **Colors**: Purple/pink gradient theme (`#a855f7`, `#ec4899`)
- **Typography**: DM Sans font family
- **Components**: Custom components matching `@ryla/ui` patterns
- **Dark mode**: Always-on dark theme

## Related Documentation

- **Initiative**: `docs/initiatives/IN-014-admin-back-office.md`
- **Epics**: `docs/requirements/epics/admin/`
- **Mobile UX**: `.cursor/rules/mobile-ux.mdc`
- **Styling**: `.cursor/rules/styling.mdc`

## Deployment

The admin app deploys to `admin.ryla.ai` via Fly.io:

```bash
# Build and deploy
pnpm nx build admin
fly deploy --config fly.admin.toml
```

## Security Considerations

1. **Separate auth table**: Admin users are in a separate table from regular users
2. **Strong passwords**: Require complex passwords for admin accounts
3. **Audit logging**: All admin actions are logged
4. **Session management**: JWT tokens can be revoked
5. **IP restrictions**: Consider IP allowlisting for production
6. **2FA**: Planned for Phase 2 (EP-050 AC-4)
