# ADR-001: Database Architecture - Custom Postgres vs Supabase

**Status**: Accepted
**Date**: 2025-12-05
**Deciders**: Tech Team

---

## Context

RYLA MVP requires a database solution for:
- User authentication & session management
- Character data persistence
- Generated image metadata & storage references
- Subscription/payment records

We have an existing codebase (MDC) with:
- NestJS backend with TypeORM + PostgreSQL
- ~40+ battle-tested entities
- Custom auth with Passport.js (JWT, OAuth providers)
- AWS S3 for image storage
- Complex payment integrations (Stripe, PayPal, TrustPay, Shift4)

The question: **Should RYLA use Supabase (as originally spec'd) or copy MDC's custom Postgres setup?**

---

## Decision

**Use Custom PostgreSQL with TypeORM (MDC patterns)** instead of Supabase.

Copy and simplify the MDC backend architecture:
- Keep: NestJS + TypeORM + PostgreSQL
- Keep: JWT-based auth (simplify to email/password only)
- Keep: Core entities (User, Character, Image, Session)
- Replace: Payment providers → Finby only
- Simplify: Remove unused modules (chat, video, multi-provider payments)

---

## Consequences

### Positive

- **~60-80% code reuse** from MDC backend
- **1-2 weeks faster** than rebuilding with Supabase patterns
- **Full control** over database schema and queries
- **No vendor lock-in** - standard Postgres
- **Team familiarity** with NestJS/TypeORM patterns
- **Battle-tested code** - MDC is production-proven
- **Migration ready** - TypeORM migrations exist

### Negative

- **More infrastructure** to manage vs Supabase's managed offering
- **Custom auth code** vs Supabase Auth out-of-box
- **No built-in realtime** (not needed for MVP)
- **Manual storage setup** (S3 or similar)
- **Higher ops overhead** in production

### Risks

| Risk | Mitigation |
|------|------------|
| More setup time initially | Copy MDC Docker/config files directly |
| Auth security concerns | Copy proven MDC auth patterns, don't reinvent |
| Database hosting cost | Use managed Postgres (Neon, Railway) for simplicity |
| Team unfamiliar with NestJS | Extensive MDC codebase as reference |

---

## Alternatives Considered

### Option A: Supabase (Full BaaS)

**Approach**: Use Supabase for auth, database, storage, and realtime.

**Pros:**
- Faster initial setup (hours vs days)
- Built-in auth with social providers
- Built-in storage (Supabase Storage)
- Real-time subscriptions
- Admin dashboard included
- Row Level Security (RLS) for authorization

**Cons:**
- Would discard 60-80% reusable MDC code
- Different paradigm (RLS vs middleware guards)
- Vendor lock-in
- Less control over query optimization
- Learning curve for team used to TypeORM

**Why not:** Throwing away proven, battle-tested code. Migration cost outweighs setup convenience.

### Option B: Supabase Hybrid

**Approach**: Use Supabase for auth + storage only, custom Postgres for main database.

**Pros:**
- Get Supabase auth convenience
- Keep custom database control

**Cons:**
- Added complexity (two systems)
- Auth token management between systems
- Still need to rewrite MDC auth patterns

**Why not:** Complexity of managing two paradigms without clear benefit.

---

## Implementation Plan

### What to Copy from MDC

```
MDC/mdc-backend/
├── src/
│   ├── database/entities/           # Copy core entities
│   │   ├── user.entity.ts           ✅ Copy, simplify
│   │   ├── character.entity.ts      ✅ Copy
│   │   ├── image.entity.ts          ✅ Copy
│   │   ├── session.entity.ts        ✅ Copy
│   │   ├── refresh-token.entity.ts  ✅ Copy
│   │   └── payment-*.entity.ts      ⚠️ Adapt for Finby
│   │
│   ├── modules/auth/                # Copy auth module
│   │   ├── auth.service.ts          ✅ Copy, simplify
│   │   ├── token.service.ts         ✅ Copy
│   │   └── guards/*.ts              ✅ Copy JWT guards
│   │
│   ├── modules/character/           # Copy character module
│   │   └── *.ts                     ✅ Copy all
│   │
│   ├── modules/image/               # Copy image module
│   │   └── *.ts                     ✅ Copy, adapt storage
│   │
│   └── modules/user/                # Copy user module
│       └── *.ts                     ✅ Copy, simplify
```

### What to Remove/Simplify

| MDC Module | RYLA Action |
|------------|-------------|
| `auth/strategies/google.strategy.ts` | ❌ Remove (MVP = email only) |
| `auth/strategies/discord.strategy.ts` | ❌ Remove |
| `auth/strategies/twitter.strategy.ts` | ❌ Remove |
| `modules/stripe/` | ❌ Remove (use Finby) |
| `modules/paypal/` | ❌ Remove |
| `modules/trustpay/` | ❌ Remove |
| `modules/shift4/` | ❌ Remove |
| `modules/conversation/` | ❌ Remove (no chat in MVP) |
| `modules/message/` | ❌ Remove |
| `modules/video-generation/` | ❌ Remove |
| `modules/redis/` | ⚠️ Optional (simplify if not needed) |
| `modules/realtime/` | ❌ Remove |

### What to Add

| Module | Description |
|--------|-------------|
| `modules/finby/` | New payment provider integration |

---

## Dependency Comparison

### MDC Backend Stack (Current)

```json
{
  "core": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/typeorm": "^10.0.2",
    "typeorm": "^0.3.20",
    "pg": "^8.13.1"
  },
  "auth": {
    "@nestjs/passport": "^10.0.3",
    "@nestjs/jwt": "^10.2.0",
    "passport-jwt": "^4.0.1",
    "bcrypt": "^5.1.1"
  },
  "storage": {
    "@aws-sdk/client-s3": "^3.721.0"
  },
  "payments (remove)": {
    "stripe": "^17.6.0",
    "@paypal/checkout-server-sdk": "^1.0.3"
  }
}
```

### RYLA Backend Stack (Target)

```json
{
  "core": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/typeorm": "^10.0.2",
    "typeorm": "^0.3.20",
    "pg": "^8.13.1"
  },
  "auth": {
    "@nestjs/passport": "^10.0.3",
    "@nestjs/jwt": "^10.2.0",
    "passport-jwt": "^4.0.1",
    "bcrypt": "^5.1.1"
  },
  "storage": {
    "@aws-sdk/client-s3": "^3.721.0"
  },
  "payments (new)": {
    "finby-sdk": "TBD"
  }
}
```

---

## Entity Mapping

### Core Entities to Copy

| MDC Entity | RYLA Entity | Changes |
|------------|-------------|---------|
| `user.entity.ts` | `user.entity.ts` | Remove social auth fields, simplify |
| `character.entity.ts` | `character.entity.ts` | Map to RYLA 6-step wizard attributes |
| `image.entity.ts` | `image.entity.ts` | Keep as-is |
| `session.entity.ts` | `session.entity.ts` | Keep as-is |
| `refresh-token.entity.ts` | `refresh-token.entity.ts` | Keep as-is |
| `payment-subscription.entity.ts` | `subscription.entity.ts` | Adapt for Finby |

### Character Entity Adaptation

```typescript
// MDC character.entity.ts → RYLA character.entity.ts

// Keep these fields:
- id, userId, name, gender, style
- ethnicity, age, bodyType
- hairStyle, hairColor, eyeColor
- outfit, personality
- nsfwEnabled, createdAt, updatedAt

// Add these fields (RYLA-specific):
- archetype (new for identity)
- personalityTraits (array, pick 3)
- bio (optional text)

// Remove these fields (not in RYLA MVP):
- Complex MDC-specific fields
- Chat/conversation references
```

---

## Infrastructure

### Development

```yaml
# docker-compose.local.yaml (copy from MDC)
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: ryla_dev
      POSTGRES_USER: ryla
      POSTGRES_PASSWORD: ryla_dev_pass
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis: # Optional, for rate limiting
    image: redis:7-alpine
    ports:
      - "6379:6379"
```

### Production Options

| Provider | Cost | Recommendation |
|----------|------|----------------|
| **Neon** (managed Postgres) | Free tier, then $19/mo | ✅ Recommended for MVP |
| **Railway** | $5/mo starting | Good alternative |
| **Supabase DB only** | Free tier | Can use just the DB |
| **AWS RDS** | ~$15/mo | Overkill for MVP |

---

## Migration Timeline

| Phase | Duration | Tasks |
|-------|----------|-------|
| 1. Setup | 1 day | Copy NestJS structure, configure TypeORM |
| 2. Entities | 1 day | Copy & adapt core entities |
| 3. Auth | 1 day | Copy JWT auth, remove OAuth |
| 4. Character | 1 day | Copy character module, adapt for wizard |
| 5. Image | 1 day | Copy image module, configure storage |
| 6. Finby | 2 days | New payment integration |
| **Total** | **~7 days** | Backend foundation ready |

---

## References

- [MDC Backend Source](/Users/admin/Documents/Projects/MDC/mdc-backend)
- [MDC Copy Guide - Frontend](../technical/MDC-COPY-GUIDE.md)
- [MDC Copy Guide - Backend](../technical/MDC-BACKEND-COPY-GUIDE.md)
- [External Dependencies](../specs/EXTERNAL-DEPENDENCIES.md)

