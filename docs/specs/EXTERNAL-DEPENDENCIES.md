# External Dependencies

## Overview

All external services, APIs, and third-party integrations used in RYLA.

> **Architecture Decision**: Using **Custom PostgreSQL + TypeORM** (MDC patterns) instead of Supabase BaaS.
> See [ADR-001: Database Architecture](../decisions/ADR-001-database-architecture.md)

---

## Core Infrastructure

### PostgreSQL (Custom)
| | |
|---|---|
| **Purpose** | Primary database |
| **Used For** | User accounts, character data, subscriptions |
| **ORM** | TypeORM |
| **Hosting** | Neon (recommended), Railway, or self-hosted |
| **Docs** | https://typeorm.io |

**Env Vars:**
```
RYLA_DB_HOST=
RYLA_DB_PORT=5432
RYLA_DB_USER=
RYLA_DB_PASSWORD=
RYLA_DB_NAME=ryla
```

### NestJS Backend
| | |
|---|---|
| **Purpose** | API framework |
| **Used For** | REST API, business logic, auth |
| **Source** | Copied from MDC backend |
| **Docs** | https://nestjs.com |

### AWS S3 / Supabase Storage
| | |
|---|---|
| **Purpose** | File/image storage |
| **Used For** | Generated images, user uploads |
| **Options** | AWS S3 (MDC pattern) or Supabase Storage |

**Env Vars (S3):**
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=ryla-images
```

**Env Vars (Supabase Storage alternative):**
```
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
```

### Vercel
| | |
|---|---|
| **Purpose** | Hosting, deployment |
| **Used For** | Web app hosting, serverless functions |
| **Docs** | https://vercel.com/docs |

**Env Vars:**
```
VERCEL_URL=
```

---

## Payments

### Finby
| | |
|---|---|
| **Purpose** | Payment processing |
| **Used For** | Subscriptions, checkout, recurring billing |
| **Docs** | https://finby.eu/docs |
| **Dashboard** | https://finby.eu/dashboard |
| **API** | REST API |

**Env Vars:**
```
FINBY_API_KEY=
FINBY_MERCHANT_ID=
FINBY_WEBHOOK_SECRET=
FINBY_PRODUCT_ID_CREATOR=
FINBY_PRODUCT_ID_PRO=
```

**Webhook Events:**
- `payment.completed`
- `subscription.created`
- `subscription.cancelled`
- `subscription.renewed`
- `payment.failed`

---

## AI Generation

### Replicate
| | |
|---|---|
| **Purpose** | AI model hosting |
| **Used For** | Image generation |
| **Docs** | https://replicate.com/docs |
| **SDK** | `replicate` |

**Env Vars:**
```
REPLICATE_API_TOKEN=
```

**Models Used:**
- `stability-ai/sdxl` - Base image generation
- TBD - Face consistency model

### Fal.ai (Alternative)
| | |
|---|---|
| **Purpose** | Fast AI inference |
| **Used For** | Image generation (alternative to Replicate) |
| **Docs** | https://fal.ai/docs |
| **SDK** | `@fal-ai/serverless-client` |

**Env Vars:**
```
FAL_KEY=
```

---

## Analytics

### PostHog
| | |
|---|---|
| **Purpose** | Product analytics |
| **Used For** | Event tracking, funnels, retention |
| **Docs** | https://posthog.com/docs |
| **Dashboard** | https://us.posthog.com |
| **SDK** | `posthog-js` (client), `posthog-node` (server) |

**Env Vars:**
```
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

---

## Email (Future)

### Resend
| | |
|---|---|
| **Purpose** | Transactional email |
| **Used For** | Password reset, receipts, notifications |
| **Docs** | https://resend.com/docs |
| **SDK** | `resend` |

**Env Vars:**
```
RESEND_API_KEY=
EMAIL_FROM=noreply@ryla.ai
```

---

## CDN / Media

### Supabase Storage
| | |
|---|---|
| **Purpose** | File storage |
| **Used For** | Generated images, user uploads |
| **Buckets** | `characters`, `images` |

**Env Vars:**
- Uses Supabase credentials above

---

## Development Tools

### GitHub
| | |
|---|---|
| **Purpose** | Version control, CI/CD |
| **Used For** | Code hosting, Actions, Issues |

### Cursor
| | |
|---|---|
| **Purpose** | AI-assisted development |
| **Rules** | `.cursor/rules/` |

---

## Dependency Matrix

| Service | Epic | Required For |
|---------|------|--------------|
| PostgreSQL + TypeORM | EP-001, EP-002, EP-004 | User, character, image data |
| JWT Auth (NestJS) | EP-002 | User authentication |
| S3 / Supabase Storage | EP-005 | Image storage |
| Finby | EP-003 | Payment processing |
| Replicate/Fal | EP-005 | Image generation |
| PostHog | All | Analytics tracking |
| Vercel | All | Deployment |

---

## Setup Checklist

### Before Development
- [ ] PostgreSQL database provisioned (Neon/Railway/local Docker)
- [ ] TypeORM migrations created
- [ ] S3 bucket created OR Supabase Storage configured
- [ ] Finby merchant account setup
- [ ] Finby products created
- [ ] Replicate account with credits
- [ ] PostHog project created
- [ ] All env vars in `.env.local`
- [ ] MDC code copied (see [Backend Copy Guide](../technical/MDC-BACKEND-COPY-GUIDE.md))

### Before Production
- [ ] Production PostgreSQL provisioned
- [ ] Finby in live mode
- [ ] Finby webhook configured
- [ ] S3 bucket with proper CORS/permissions
- [ ] Domain verified in all services
- [ ] Production env vars in Vercel

---

## Cost Estimates (MVP)

| Service | Free Tier | Estimated Cost |
|---------|-----------|----------------|
| PostgreSQL (Neon) | 512MB storage | $0-19/mo |
| S3 Storage | 5GB free tier | $0-10/mo |
| Finby | Per transaction fees | Variable |
| Replicate | Pay per use | $0.01-0.05 per image |
| PostHog | 1M events/mo | $0 |
| Vercel | Hobby free | $0-20/mo |

**Estimated MVP monthly cost**: $20-70 + Finby fees

---

## Code Reuse from MDC

See these guides for copying code from MDC:
- [MDC Frontend Copy Guide](../technical/MDC-COPY-GUIDE.md)
- [MDC Backend Copy Guide](../technical/MDC-BACKEND-COPY-GUIDE.md)
- [ADR-001: Database Architecture](../decisions/ADR-001-database-architecture.md)

