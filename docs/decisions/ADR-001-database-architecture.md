# ADR-001: Database Architecture - Custom Postgres with Drizzle ORM

**Status**: Accepted
**Date**: 2025-12-10
**Deciders**: Tech Team
**Supersedes**: Previous decision to use TypeORM (2025-12-05)

---

## Context

RYLA MVP requires a database solution for:
- User authentication & session management
- AI Influencer (character) data persistence
- Generated image metadata & storage references
- Subscription/payment records
- Generation job queue management

**Key Requirements:**
- Strong TypeScript type safety for MVP speed
- High performance for real-time generation status updates
- Complex queries (characters with images, subscriptions, jobs)
- JSONB support for flexible config storage
- Next.js App Router compatibility
- Future-proof architecture

**Current State:**
- NestJS backend API (`apps/api`)
- TypeORM configured but **not yet implemented** (repositories are TODOs)
- No entities or queries written yet
- Clean slate for ORM choice

The question: **Should RYLA use Drizzle ORM or TypeORM for database access?**

---

## Decision

**Use Custom PostgreSQL with Drizzle ORM** instead of TypeORM.

**Architecture:**
- Database: Custom PostgreSQL (managed: Neon/Railway)
- ORM: **Drizzle ORM** (direct integration, no wrapper packages)
- Framework: NestJS with dependency injection
- Auth: JWT-based (email/password only for MVP)
- Storage: AWS S3 for generated images
- Payments: Finby integration

---

## Consequences

### Positive

- **Superior type safety** - Compile-time inference, catches errors early
- **Better performance** - Minimal runtime overhead, near raw SQL speed
- **Modern TypeScript** - Built for modern TS patterns, excellent IDE support
- **Next.js optimized** - Works seamlessly with App Router and server components
- **SQL-first approach** - Predictable queries, easier to optimize
- **Lightweight** - Smaller bundle, faster startup
- **Active development** - Rapidly evolving, modern patterns
- **Full control** - No vendor lock-in, standard Postgres
- **Better JSONB support** - Excellent for flexible config storage
- **Clean migration path** - No existing code to migrate (TypeORM was unused)

### Negative

- **Smaller community** - Less Stack Overflow answers vs TypeORM
- **Less documentation** - Fewer tutorials, but official docs are excellent
- **SQL knowledge helpful** - Team should understand SQL (not a blocker)
- **Manual setup** - Need to create Drizzle module (~30 lines)
- **More infrastructure** - Manage Postgres vs Supabase BaaS

### Risks

| Risk | Mitigation |
|------|------------|
| Team unfamiliar with Drizzle | Official docs are excellent, SQL knowledge transfers |
| Less community support | Active Discord, growing GitHub community |
| Learning curve | SQL-first approach is intuitive, simpler than TypeORM decorators |
| Migration from TypeORM | No migration needed - TypeORM was never implemented |

---

## Alternatives Considered

### Option A: TypeORM

**Approach**: Continue with TypeORM as originally planned.

**Pros:**
- Large community and extensive documentation
- Many Stack Overflow answers
- Class-based, OOP-friendly
- Built-in migrations and seeding
- Mature ecosystem

**Cons:**
- **Weaker type safety** - Runtime reflection, can miss edge cases
- **Performance overhead** - Reflection and proxies add latency
- **Less Next.js optimized** - Heavier, more setup needed
- **Older patterns** - Decorator-based, less modern TypeScript
- **Slower development** - More verbose queries, less predictable
- **Complex JSONB queries** - Less intuitive for flexible schemas

**Why not:** TypeORM was configured but never implemented. Drizzle offers better type safety, performance, and modern patterns for RYLA's needs. No migration cost since nothing was built yet.

### Option B: Supabase (Full BaaS)

**Approach**: Use Supabase for auth, database, storage, and realtime.

**Pros:**
- Faster initial setup (hours vs days)
- Built-in auth with social providers
- Built-in storage (Supabase Storage)
- Real-time subscriptions
- Admin dashboard included
- Row Level Security (RLS) for authorization

**Cons:**
- Vendor lock-in
- Less control over query optimization
- Different paradigm (RLS vs middleware guards)
- Would need to rewrite all database access patterns
- Less flexibility for complex queries

**Why not:** We need full control over database schema and queries. Custom Postgres + Drizzle gives us flexibility without vendor lock-in.

### Option C: Prisma

**Approach**: Use Prisma as the ORM.

**Pros:**
- Excellent developer experience
- Great migrations
- Strong type safety
- Large community

**Cons:**
- Heavier than Drizzle
- Code generation step
- Less SQL control
- More abstraction

**Why not:** Drizzle offers similar type safety with better performance and more SQL control. Prisma's code generation adds complexity we don't need.

---

## Implementation Plan

### 1. Install Dependencies

```bash
pnpm add drizzle-orm drizzle-kit pg
pnpm add -D @types/pg
```

### 2. Remove TypeORM Dependencies

```bash
pnpm remove @nestjs/typeorm typeorm
```

### 3. Create Drizzle Module

**File**: `apps/api/src/modules/drizzle/drizzle.module.ts`

```typescript
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from '../../../database/schemas';

@Global()
@Module({
  providers: [
    {
      provide: 'DRIZZLE_DB',
      useFactory: (configService: ConfigService) => {
        const pool = new Pool({
          host: configService.get('postgres.host'),
          port: configService.get('postgres.port'),
          user: configService.get('postgres.user'),
          password: configService.get('postgres.password'),
          database: configService.get('postgres.dbName'),
          ssl: configService.get('postgres.environment') !== 'local'
            ? { rejectUnauthorized: false }
            : false,
        });
        return drizzle(pool, { schema });
      },
      inject: [ConfigService],
    },
  ],
  exports: ['DRIZZLE_DB'],
})
export class DrizzleModule {}
```

### 4. Define Schemas

**File**: `apps/api/src/database/schemas/index.ts`

```typescript
// Export all schemas
export * from './users.schema';
export * from './characters.schema';
export * from './images.schema';
export * from './subscriptions.schema';
export * from './generation-jobs.schema';
```

**Example Schema** (`characters.schema.ts`):

```typescript
import { pgTable, uuid, text, jsonb, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { users } from './users.schema';
import { images } from './images.schema';

export const characterStatusEnum = pgEnum('character_status', [
  'draft',
  'generating',
  'ready',
  'failed',
]);

export const characters = pgTable('characters', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  config: jsonb('config').notNull().$type<CharacterConfig>(),
  seed: text('seed'),
  status: characterStatusEnum('status').default('draft'),
  generationError: text('generation_error'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const charactersRelations = relations(characters, ({ one, many }) => ({
  user: one(users, { fields: [characters.userId], references: [users.id] }),
  images: many(images),
}));
```

### 5. Use in Services

**Example**: `apps/api/src/modules/character/services/character.service.ts`

```typescript
import { Injectable, Inject } from '@nestjs/common';
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import * as schema from '../../../database/schemas';

@Injectable()
export class CharacterService {
  constructor(
    @Inject('DRIZZLE_DB')
    private readonly db: NodePgDatabase<typeof schema>,
  ) {}

  async findById(id: string) {
    return this.db.query.characters.findFirst({
      where: eq(schema.characters.id, id),
      with: { images: true, user: true },
    });
  }

  async findByUserId(userId: string) {
    return this.db.query.characters.findMany({
      where: eq(schema.characters.userId, userId),
      with: { images: true },
    });
  }
}
```

### 6. Migrations Setup

**File**: `apps/api/drizzle.config.ts`

```typescript
import type { Config } from 'drizzle-kit';

export default {
  schema: './src/database/schemas/*.ts',
  out: './src/database/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.DATABASE_URL!,
  },
} satisfies Config;
```

**Package.json scripts**:

```json
{
  "scripts": {
    "db:generate": "drizzle-kit generate",
    "db:migrate": "drizzle-kit migrate",
    "db:studio": "drizzle-kit studio"
  }
}
```

---

## Dependency Stack

### RYLA Backend Stack (Target)

```json
{
  "core": {
    "@nestjs/common": "^11.1.9",
    "@nestjs/core": "^11.1.9",
    "drizzle-orm": "^0.29.0",
    "drizzle-kit": "^0.20.0",
    "pg": "^8.16.3"
  },
  "auth": {
    "@nestjs/passport": "^11.0.5",
    "@nestjs/jwt": "^11.0.2",
    "passport-jwt": "^4.0.1",
    "bcrypt": "^6.0.0"
  },
  "storage": {
    "@aws-sdk/client-s3": "^3.948.0"
  },
  "payments": {
    "finby-sdk": "TBD"
  }
}
```

### Removed Dependencies

- `@nestjs/typeorm` - Replaced by direct Drizzle integration
- `typeorm` - Replaced by `drizzle-orm`

---

## Schema Design

### Core Schemas

| Schema | File | Description |
|--------|------|-------------|
| `users` | `users.schema.ts` | User accounts, auth data |
| `characters` | `characters.schema.ts` | AI Influencer definitions |
| `images` | `images.schema.ts` | Generated image metadata |
| `subscriptions` | `subscriptions.schema.ts` | Payment subscriptions (Finby) |
| `generation_jobs` | `generation-jobs.schema.ts` | Queue management for image generation |

### Character Schema Structure

```typescript
// characters.schema.ts
{
  id: uuid (PK)
  userId: uuid (FK → users)
  name: text
  config: jsonb { // CharacterConfig
    ethnicity, ageRange, bodyType,
    hairStyle, hairColor, eyeColor,
    outfitStyle, archetype,
    personalityTraits: string[],
    bio?: string,
    nsfwEnabled: boolean
  }
  seed: text (for consistent generation)
  status: enum ('draft' | 'generating' | 'ready' | 'failed')
  generationError?: text
  createdAt: timestamp
  updatedAt: timestamp
}
```

### Relations

- `users` → `characters` (one-to-many)
- `characters` → `images` (one-to-many)
- `users` → `subscriptions` (one-to-many)
- `characters` → `generation_jobs` (one-to-many)

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
| 1. Setup Drizzle | 2 hours | Install deps, create DrizzleModule, remove TypeORM |
| 2. Schemas | 1 day | Define all schemas (users, characters, images, subscriptions, jobs) |
| 3. Migrations | 2 hours | Generate and run initial migrations |
| 4. Repositories | 2 days | Implement repositories using Drizzle queries |
| 5. Services | 2 days | Update services to use Drizzle repositories |
| 6. Testing | 1 day | Test queries, relations, JSONB operations |
| **Total** | **~6 days** | Backend foundation ready |

**Note**: Faster than TypeORM because:
- No entity decorator complexity
- Direct SQL-like queries are more intuitive
- Better type inference catches errors early
- Simpler migration setup

---

## References

- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [Drizzle + NestJS Guide](https://orm.drizzle.team/docs/get-started-postgresql)
- [Drizzle Benchmarks](https://orm.drizzle.team/benchmarks)
- [External Dependencies](../specs/EXTERNAL-DEPENDENCIES.md)
- [Tech Stack](../specs/TECH-STACK.md)

