# MDC Backend → RYLA Backend: Module Copy Plan

Based on MVP requirements analysis, here are the modules that should be copied from MDC backend to RYLA backend.

## Priority P0 (Critical for MVP Launch)

### 1. **Auth Module** (`auth/`)
**Epic**: EP-002 (Authentication)
**Why**: Email/password auth, JWT tokens, session management, age verification
**Files to Copy**:
- `auth.module.ts`
- `auth.controller.ts`
- `auth.service.ts`
- `token.service.ts`
- `auth-cache.service.ts`
- Guards: `jwt-access.guard.ts`, `jwt-refresh.guard.ts`, `jwt-action.guard.ts`
- Decorators: `current-user.decorator.ts`, `skip-auth.decorator.ts`
- DTOs: All request/response DTOs
- Strategies: JWT strategies (OAuth optional for MVP)

**Dependencies**: `@nestjs/jwt`, `@nestjs/passport`, `passport-jwt`, `bcrypt`

### 2. **User Module** (`user/`)
**Epic**: EP-002, EP-010 (User Management, Settings)
**Why**: User CRUD, profile management, account settings, subscription status
**Files to Copy**:
- `user.module.ts`
- `user.controller.ts`
- `user.service.ts`
- DTOs: User profile, update DTOs
- Entity: User entity (if exists)

**Dependencies**: AuthModule, StripeModule (for subscription status)

### 3. **Character Module** (`character/`)
**Epic**: EP-001 (AI Influencer Creation Wizard)
**Why**: 6-step wizard, character creation, persistence, regeneration
**Files to Copy**:
- `character.module.ts`
- `character.controller.ts`
- `character.service.ts`
- DTOs: Character creation, update DTOs
- Entity: Character entity
- Constants: Character options (ethnicity, body types, etc.)

**Note**: May need adaptation from "Character" to "AI Influencer" terminology

### 4. **Image Module** (`image/`)
**Epic**: EP-005 (Content Studio & Generation)
**Why**: Image generation, AI model integration, face consistency, queue management
**Files to Copy**:
- `image.module.ts`
- `image.controller.ts`
- `image.service.ts`
- Processors: Image generation processors (Bull queues)
- DTOs: Generation request/response DTOs
- Constants: Model configs, prompt templates

**Dependencies**: `@nestjs/bull`, Replicate/Fal integration, AWS S3

### 5. **Image Gallery Module** (`image-gallery/`)
**Epic**: EP-008 (Posts Gallery & Export)
**Why**: Image storage, gallery management, like/favorite, export
**Files to Copy**:
- `image-gallery.module.ts`
- `image-gallery.controller.ts`
- `image-gallery.service.ts`
- DTOs: Gallery operations

**Dependencies**: ImageModule, AWS S3

### 6. **Stripe Module** (`stripe/`)
**Epic**: EP-003, EP-010 (Payment & Subscription)
**Why**: Payment processing, subscription management, webhooks
**Files to Copy**:
- `stripe.module.ts`
- `stripe.controller.ts` (webhooks)
- `stripe.service.ts`
- DTOs: Payment, subscription DTOs
- Interfaces: Webhook event types

**Dependencies**: `stripe` package, webhook secret handling

### 7. **Mail Module** (`mail/`)
**Epic**: EP-007 (Emails & Notifications)
**Why**: Welcome emails, password reset, payment receipts
**Files to Copy**:
- `mail.module.ts`
- `mail.service.ts`
- Constants: Email templates

**Dependencies**: Brevo/SendGrid API, `@nestjs/axios`

## Priority P1 (Infrastructure - Required for Production)

### 8. **Redis Module** (`redis/`)
**Why**: Caching, session storage, rate limiting, queue storage
**Files to Copy**:
- `redis.module.ts`
- `redis.service.ts`
- `redis-loc.service.ts` (locks)
- `redis-leader-electron.service.ts` (leader election)
- `redis.constants.ts`

**Dependencies**: `ioredis`

### 9. **AWS S3 Module** (`aws-s3/`)
**Why**: Image storage, signed URLs, NSFW-compliant storage
**Files to Copy**:
- `aws-s3.module.ts`
- S3 service files
- Enums: Bucket types, etc.

**Dependencies**: `@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`

### 10. **Throttler Module** (`throttler/`)
**Why**: Rate limiting, API protection, abuse prevention
**Files to Copy**:
- `throttler.module.ts`
- Constants: Default throttle configs
- Guards: Custom throttler guards (if any)

**Dependencies**: `@nestjs/throttler`, `@nest-lab/throttler-storage-redis`

### 11. **Health Module** (`health/`)
**Why**: Health checks, monitoring, uptime tracking
**Files to Copy**:
- `health.module.ts`
- `health.controller.ts`
- `health.service.ts`

**Dependencies**: RedisModule (for DB health checks)

### 12. **Notification Module** (`notification/`)
**Epic**: EP-007 (Notifications)
**Why**: Real-time notifications, WebSocket support
**Files to Copy**:
- `notification.module.ts`
- `notification.controller.ts`
- `notification.gateway.ts` (WebSocket)
- `notification.service.ts`

**Dependencies**: `@nestjs/websockets`, `socket.io`

## Optional (Phase 2+)

### 13. **Analytics Module** (`analytics/`)
**Why**: Backend event tracking (PostHog integration)
**Note**: May use PostHog directly from frontend, but backend tracking useful

### 14. **Repository Module** (`repository/`)
**Why**: Generic repository pattern (if used extensively)
**Note**: May not be needed if using TypeORM directly

## Common/Shared Files to Copy

### HTTP Layer
- `common/http/global-exception.filter.ts` - Global error handling
- `common/interceptors/logger.interceptor.ts` - Already copied ✅

### Helpers
- `common/helpers/swagger.helper.ts` - Already copied ✅

### Decorators
- `decorators/role.decorator.ts` - Role-based access (if needed)

### Guards
- `guards/premium-user.guard.ts` - Subscription gating
- `guards/roles.guard.ts` - Role-based access

## Database Entities to Create/Port

Based on MVP requirements:

1. **User Entity** - Email, password hash, age verification, subscription status
2. **AI Influencer Entity** (Character) - All wizard attributes, seed, NSFW flag
3. **Image Entity** - URL, caption, generation params, liked status
4. **Post Entity** - Image + caption combination, export status
5. **Credit Transaction Entity** - Credit balance, consumption logs
6. **Subscription Entity** - Plan, status, billing dates

## Dependencies to Install

```bash
# Auth
pnpm add -w @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
pnpm add -w -D @types/passport-jwt @types/bcrypt

# Queue Processing
pnpm add -w @nestjs/bull bull ioredis
pnpm add -w -D @types/bull

# Storage
pnpm add -w @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# Rate Limiting
pnpm add -w @nestjs/throttler @nest-lab/throttler-storage-redis

# WebSockets
pnpm add -w @nestjs/websockets @nestjs/platform-socket.io socket.io

# Payments
pnpm add -w stripe

# Email
pnpm add -w @nestjs/axios axios
```

## Copy Order (Recommended)

1. **Infrastructure First**: Redis → Throttler → Health
2. **Core Services**: Auth → User → Mail
3. **Product Features**: Character → Image → Image Gallery
4. **Monetization**: Stripe → (Credit system - may need new)
5. **Real-time**: Notification (WebSocket)

## Notes

- **Terminology**: MDC uses "Character", RYLA uses "AI Influencer" - update throughout
- **NSFW**: Ensure all modules handle NSFW flag appropriately
- **Supabase**: RYLA uses Supabase Auth - may need to adapt Auth module
- **Finby vs Stripe**: MVP mentions Finby, but MDC has Stripe - decide which to use
- **Queue System**: MDC uses Bull/Redis for async image generation - critical for MVP

## Next Steps

1. Start with infrastructure modules (Redis, Throttler, Health)
2. Copy Auth module and adapt for Supabase if needed
3. Copy User module
4. Copy Character module (rename to Influencer)
5. Copy Image generation module (most complex)
6. Copy remaining modules in priority order

