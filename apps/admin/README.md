# Admin App

Administrative dashboard for RYLA - internal tooling and management.

## Purpose

- **User Management**: View, edit, ban users
- **System Configuration**: Feature flags, settings
- **Analytics Dashboards**: Business metrics, user behavior
- **Audit Logs**: Track system changes
- **Content Moderation**: Review generated content
- **Support Tools**: Customer support interface

## Access

- **Requires**: Admin role authentication
- **Separate**: From main web app
- **Internal**: Can be restricted to VPN/internal network

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **API**: tRPC (type-safe)
- **Auth**: Supabase Auth (admin role check)

## Structure

```
apps/admin/
├── app/                    # Next.js app router
│   ├── (admin)/           # Admin routes
│   └── api/               # Admin API routes
├── components/            # Admin components
│   ├── users/            # User management
│   ├── analytics/        # Analytics dashboards
│   └── moderation/       # Content moderation
└── lib/                   # Utilities
```

## Commands

```bash
# Development
nx serve admin        # Development server
nx build admin        # Production build
nx test admin         # Run tests
nx lint admin         # Lint code
```

## Environment Variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# API
NEXT_PUBLIC_API_BASE_URL=...

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=...
NEXT_PUBLIC_POSTHOG_HOST=...
```

## Related

- **Backend API**: [`apps/api`](../api/README.md)
- **Business Logic**: [`libs/business`](../../libs/business/README.md)
- **UI Components**: [`libs/ui`](../../libs/ui/README.md)

