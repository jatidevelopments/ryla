# Web App

<!-- Last updated: 2025-01-11 - Testing auto-deploy workflow -->

Main web application for RYLA - the authenticated user experience.

## Purpose

- **User Dashboard**: Manage AI influencers, view gallery
- **Character Creation**: Wizard for creating AI influencers
- **Content Studio**: Generate images, create posts
- **Profile Management**: Settings, subscription, credits

## Domain

- **Production**: `app.ryla.ai`
- **Purpose**: Main application interface

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Forms**: React Hook Form
- **API**: tRPC (type-safe)
- **Auth**: Supabase Auth
- **Analytics**: PostHog

## Key Features

### Character Wizard
- Multi-step character creation
- Base image selection
- Profile picture generation
- Character DNA persistence

### Content Studio
- Image generation workflows
- Scene and environment selection
- Post creation and management
- Export to platforms

### User Management
- Profile settings
- Subscription management
- Credit system
- Generation history

## Structure

```
apps/web/
├── app/                    # Next.js app router
│   ├── (auth)/            # Auth routes
│   ├── (dashboard)/       # Dashboard routes
│   └── api/               # API routes
├── components/            # React components
│   ├── wizard/            # Character wizard components
│   └── dashboard/         # Dashboard components
├── lib/                   # Utilities
│   ├── api/              # API clients
│   └── utils/            # Helper functions
└── public/                # Static assets
```

## Commands

```bash
# Development
nx serve web          # Development server
nx build web          # Production build
nx test web           # Run tests
nx lint web           # Lint code
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

# CDN
NEXT_PUBLIC_CDN_URL=...
```

## Related

- **Backend API**: [`apps/api`](../api/README.md)
- **Business Logic**: [`libs/business`](../../libs/business/README.md)
- **UI Components**: [`libs/ui`](../../libs/ui/README.md)
- **Analytics**: [`libs/analytics`](../../libs/analytics/README.md)

