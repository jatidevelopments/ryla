# Landing Page App

Marketing website for RYLA - the public-facing marketing site.

## Purpose

- **Brand Awareness**: Showcase RYLA's value proposition
- **SEO**: Optimized for search engines
- **Lead Generation**: Capture interest and drive signups
- **Social Proof**: Testimonials, features, pricing

## Domain

- **Production**: `www.ryla.ai` / `ryla.ai`
- **Purpose**: Main marketing site

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Deployment**: Fly.io

## Key Features

- Responsive design (mobile-first)
- SEO optimization
- Fast page loads
- Conversion-optimized layouts
- Social proof sections

## Structure

```
apps/landing/
├── app/                    # Next.js app router
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── landing/          # Landing-specific components
│   └── sections/         # Page sections
├── data/                  # Static data (features, testimonials)
├── lib/                   # Utilities
└── public/                # Static assets
```

## Commands

```bash
# Development
nx serve landing          # Start dev server
nx build landing          # Production build
nx lint landing           # Lint code

# Deployment
pnpm deploy:landing       # Deploy to Fly.io
```

## Environment Variables

```bash
# Site Configuration
NEXT_PUBLIC_SITE_URL=https://www.ryla.ai
NEXT_PUBLIC_CDN_URL=https://rylaai.b-cdn.net
NEXT_PUBLIC_DEBUG_CDN=true
```

## Related

- **Funnel App**: [`apps/funnel`](../funnel/README.md) - Payment & conversion
- **Main Web App**: [`apps/web`](../web/README.md) - Application

