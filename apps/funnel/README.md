# Funnel App

<!-- Last updated: 2025-01-11 - Testing auto-deploy workflow -->

Payment and conversion funnel for RYLA - the entry point for new users.

## Purpose

- **User Acquisition**: Landing page with value proposition
- **Character Creation Wizard**: Step-by-step AI influencer creation
- **Payment Processing**: Subscription checkout and payment handling
- **Conversion Optimization**: A/B testing, analytics tracking

## Domain

- **Production**: `goviral.ryla.ai`
- **Purpose**: Payment & conversion funnel

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: XState (funnel state machine)
- **Payments**: Finby (API v3 popup-based) via `@ryla/payments`
- **Analytics**: PostHog
- **Internationalization**: next-intl

## Key Features

### Character Creation Wizard
- Multi-step form with progress tracking
- Dynamic options based on user selections
- Real-time validation and error handling
- Mobile-optimized UI

### Payment Integration
- Finby payment gateway (popup-based)
- Subscription plans and one-time purchases
- Payment status tracking
- Webhook handling for payment notifications

### Analytics
- PostHog event tracking
- Facebook Pixel integration
- Conversion funnel tracking
- UTM parameter capture

## Structure

```
apps/funnel/
├── app/                    # Next.js app router
│   ├── api/               # API routes (payment webhooks)
│   ├── [locale]/          # Internationalized routes
│   └── page.tsx           # Main funnel entry
├── components/            # React components
│   ├── funnel/           # Funnel-specific components
│   ├── ui/                # UI components
│   └── layouts/           # Layout components
├── features/              # Feature modules
│   └── funnel/            # Funnel state machine & logic
├── constants/             # Constants and configuration
├── services/              # Service layer (API clients)
├── hooks/                 # Custom React hooks
├── store/                 # State management
└── i18n/                  # Internationalization config
```

## Commands

```bash
# Development
nx serve funnel          # Start dev server
nx build funnel          # Production build
nx lint funnel           # Lint code

# Deployment
pnpm deploy:funnel       # Deploy to Fly.io
```

## Environment Variables

```bash
# Payment (Finby)
NEXT_PUBLIC_FINBY_PROJECT_ID=...
NEXT_PUBLIC_FINBY_SECRET_KEY=...
FINBY_PROJECT_ID=...
FINBY_SECRET_KEY=...

# Analytics
NEXT_PUBLIC_POSTHOG_KEY=...
NEXT_PUBLIC_POSTHOG_HOST=...

# API
NEXT_PUBLIC_API_BASE_URL=...

# CDN
NEXT_PUBLIC_CDN_URL=...

# Site
NEXT_PUBLIC_SITE_URL=https://goviral.ryla.ai
```

## Payment Flow

1. User completes character creation wizard
2. Redirects to payment selection
3. Finby popup opens for payment
4. Webhook receives payment confirmation
5. User redirected to success page

## Documentation

- [Payment Callback Handling](./docs/PAYMENT_CALLBACK_HANDLING.md)
- [Finby Setup](./docs/FINBY_SETUP.md)
- [Finby Testing](./docs/FINBY_TESTING.md)
- [URL-Based Steps](./docs/URL_BASED_STEPS.md)
- [Supabase Setup](./docs/SUPABASE_SETUP.md)
- [Fly.io Setup](./docs/FLY_IO_SETUP.md)

## Related

- **Payment Library**: [`libs/payments`](../../libs/payments/README.md)
- **Analytics Library**: [`libs/analytics`](../../libs/analytics/README.md)
- **Main Web App**: [`apps/web`](../web/README.md)

 
