# External Dependencies

## Overview

All external services, APIs, and third-party integrations used in RYLA.

> **Architecture Decision**: Using **Custom PostgreSQL + Drizzle ORM** instead of TypeORM or Supabase BaaS.
> See [ADR-001: Database Architecture](../decisions/ADR-001-database-architecture.md)

---

## Core Infrastructure

### PostgreSQL (Custom)
| | |
|---|---|
| **Purpose** | Primary database |
| **Used For** | User accounts, character data, subscriptions |
| **ORM** | Drizzle ORM |
| **Hosting** | Neon (recommended), Railway, or self-hosted |
| **Docs** | https://orm.drizzle.team |

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

### RunPod
| | |
|---|---|
| **Purpose** | GPU infrastructure management |
| **Used For** | Pod management, serverless endpoints, templates (via MCP) |
| **Docs** | https://docs.runpod.io |
| **MCP Server** | `@runpod/mcp-server` |
| **Dashboard** | https://www.runpod.io/console |

**Env Vars:**
```
RUNPOD_API_KEY=
```

**MCP Configuration:**
Configured in `.cursor/mcp.json` for Cursor IDE integration. Allows managing RunPod resources through natural language commands.

**Capabilities:**
- Pods: Create, list, get details, update, start, stop, delete
- Serverless Endpoints: Create, list, get details, update, delete
- Templates: Create, list, get details, update, delete
- Network Volumes: Create, list, get details, update, delete
- Container Registry: Create, list, get details, delete authentications

---

### OpenRouter (LLM Prompt Enhancement)
| | |
|---|---|
| **Purpose** | Unified LLM API for prompt enhancement |
| **Used For** | AI prompt enhancement (alternative to direct OpenAI/Gemini) |
| **Docs** | https://openrouter.ai/docs |
| **Dashboard** | https://openrouter.ai/ |
| **API** | OpenAI-compatible API |

**Env Vars:**
```
OPENROUTER_API_KEY=
OPENROUTER_DEFAULT_MODEL=openai/gpt-4o-mini
```

**Benefits:**
- ✅ Access to 500+ models across 60+ providers
- ✅ Better prices (20-40% savings vs direct APIs)
- ✅ Automatic fallback between providers
- ✅ Better uptime/reliability
- ✅ Single API key instead of multiple

**Recommended Models:**
- `openai/gpt-4o-mini` - Balanced quality/cost (default)
- `deepseek/deepseek-chat` - Cost-optimized (50-70% cheaper)
- `qwen/qwen-2.5-72b-instruct` - Cost-optimized (40-60% cheaper)
- `anthropic/claude-opus-4.5` - Premium quality
- `google/gemini-3-pro-preview` - High quality

**Fallback:**
- Direct OpenAI API (`OPENAI_API_KEY`)
- Direct Gemini API (`GEMINI_API_KEY`)

**Implementation:**
- Location: `libs/business/src/prompts/ai-enhancer.ts`
- Provider: `OpenRouterProvider`
- Factory: `createOpenRouterEnhancer()`
- Auto-detection: `createAutoEnhancer()` prefers OpenRouter if available

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
| **MCP Servers** | Configured in `.cursor/mcp.json` |

#### Package Docs MCP Server
| | |
|---|---|
| **Purpose** | Package documentation access for AI assistants |
| **Used For** | Looking up latest package versions, API usage, examples |
| **Package** | `@jankowtf/mcp-package-docs` |
| **Docs** | See [MCP Package Docs Guide](../technical/MCP-PACKAGE-DOCS.md) |
| **Languages** | NPM, Python, Go |

**MCP Configuration:**
Configured in `.cursor/mcp.json` for Cursor IDE integration. Provides real-time access to package documentation to ensure correct usage patterns and latest version information.

**Capabilities:**
- NPM packages: Lookup docs from public/private registries
- Python libraries: Access built-in help() documentation
- Go packages: Fetch via go doc
- Search: Fuzzy search within package documentation
- Version checking: Verify latest versions and breaking changes

---

## Dependency Matrix

| Service | Epic | Required For |
|---------|------|--------------|
| PostgreSQL + TypeORM | EP-001, EP-002, EP-004 | User, character, image data |
| JWT Auth (NestJS) | EP-002 | User authentication |
| S3 / Supabase Storage | EP-005 | Image storage |
| Finby | EP-003 | Payment processing |
| Replicate/Fal | EP-005 | Image generation |
| RunPod | Future | GPU infrastructure (MCP managed) |
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
- [ ] RunPod account created and API key obtained
- [ ] RunPod MCP server configured in `.cursor/mcp.json`
- [ ] Package Docs MCP server configured in `.cursor/mcp.json` (automatic via npx)
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

