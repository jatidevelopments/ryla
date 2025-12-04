# External Dependencies

## Overview

All external services, APIs, and third-party integrations used in RYLA.

---

## Core Infrastructure

### Supabase
| | |
|---|---|
| **Purpose** | Database, Auth, Storage |
| **Used For** | User accounts, character data, image storage |
| **Docs** | https://supabase.com/docs |
| **Dashboard** | https://supabase.com/dashboard |
| **SDK** | `@supabase/supabase-js` |

**Env Vars:**
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
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
| Supabase Auth | EP-002 | User authentication |
| Supabase DB | EP-001, EP-004 | Character persistence |
| Supabase Storage | EP-005 | Image storage |
| Finby | EP-003 | Payment processing |
| Replicate/Fal | EP-005 | Image generation |
| PostHog | All | Analytics tracking |
| Vercel | All | Deployment |

---

## Setup Checklist

### Before Development
- [ ] Supabase project created
- [ ] Supabase tables migrated
- [ ] Finby merchant account setup
- [ ] Finby products created
- [ ] Replicate account with credits
- [ ] PostHog project created
- [ ] All env vars in `.env.local`

### Before Production
- [ ] Supabase on paid plan (if needed)
- [ ] Finby in live mode
- [ ] Finby webhook configured
- [ ] Domain verified in all services
- [ ] Production env vars in Vercel

---

## Cost Estimates (MVP)

| Service | Free Tier | Estimated Cost |
|---------|-----------|----------------|
| Supabase | 500MB DB, 1GB storage | $0-25/mo |
| Finby | Per transaction fees | Variable |
| Replicate | Pay per use | $0.01-0.05 per image |
| PostHog | 1M events/mo | $0 |
| Vercel | Hobby free | $0-20/mo |

**Estimated MVP monthly cost**: $25-100 + Finby fees

