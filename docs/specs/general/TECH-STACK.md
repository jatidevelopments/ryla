# Tech Stack

## Frontend
- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript (strict mode)
- **UI**: React 18+
- **Styling**: Tailwind CSS
- **State**: React hooks + Context (Zustand if needed)

## Backend
- **API**: Next.js API routes / Route Handlers
- **Runtime**: Node.js 20+
- **Validation**: Zod

## Database
- **Provider**: Supabase
- **Engine**: PostgreSQL
- **ORM**: Supabase client / Drizzle (if needed)
- **Auth**: Supabase Auth

## Infrastructure
- **Hosting**: Vercel (web), Supabase (DB)
- **CI/CD**: GitHub Actions
- **Env Management**: `.env.local` + Vercel env vars

## Testing
- **Unit/Integration**: Vitest
- **E2E**: Playwright
- **Analytics Verification**: Playwright + PostHog

## Analytics
- **Provider**: PostHog
- **Integration**: `@ryla/analytics` library
- **Events**: Typed via `libs/analytics/src/events.ts`

## Monitoring
- **Errors**: PostHog / Sentry (Phase 2)
- **Logs**: Vercel logs

## Compatibility
- **Browsers**: >98% global coverage
- **Mobile**: Mobile-first responsive
- **Accessibility**: WCAG 2.1 AA target

## Dependencies Policy
- Prefer established packages (>1M weekly downloads)
- Avoid bleeding-edge APIs (<95% browser support)
- Pin major versions in package.json

