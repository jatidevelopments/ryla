# Drizzle Schemas Created ✅

## Summary

Created all core Drizzle schemas per [ADR-001](../decisions/ADR-001-database-architecture.md).

## Schemas Created

### ✅ Core Schemas (5 total)

1. **`users.schema.ts`** - User accounts and authentication
   - Fields: id, email, password (hashed), name, publicName, role, email verification
   - Relations: one-to-many with characters

2. **`characters.schema.ts`** - AI Influencer definitions
   - Fields: id, userId, name, config (JSONB), seed, status, generationError
   - Relations: belongs to user, has many images
   - Status enum: draft, generating, ready, failed

3. **`images.schema.ts`** - Generated image metadata
   - Fields: id, characterId, userId, s3Key, s3Url, prompt, seed, status, dimensions
   - Relations: belongs to character
   - Status enum: pending, generating, completed, failed

4. **`subscriptions.schema.ts`** - Payment subscriptions (Finby)
   - Fields: id, userId, finbySubscriptionId, tier, status, period dates
   - Relations: belongs to user
   - Tier enum: free, creator, pro
   - Status enum: active, cancelled, expired, past_due

5. **`generation-jobs.schema.ts`** - Queue management for image generation
   - Fields: id, userId, characterId, type, status, input/output (JSONB), externalJobId
   - Relations: belongs to user and character
   - Type enum: image_generation, character_generation, image_upscale
   - Status enum: queued, processing, completed, failed, cancelled

## Schema Features

- ✅ **Type-safe JSONB** - Character config and job input/output use typed JSONB
- ✅ **Relations** - Proper foreign keys and Drizzle relations
- ✅ **Enums** - PostgreSQL enums for status, tier, role, etc.
- ✅ **Timestamps** - createdAt, updatedAt on all tables
- ✅ **Cascade deletes** - Proper cleanup when users/characters are deleted

## Next Steps

### 1. Generate Migrations
```bash
pnpm db:generate
```

This will create migration files in `apps/api/src/database/migrations/`

### 2. Run Migrations
```bash
pnpm db:migrate
```

Or use `db:push` for development (auto-syncs schema):
```bash
pnpm db:push
```

### 3. Update Services
Update services to use Drizzle queries:

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
}
```

## Database Scripts

Added to `package.json`:
- `pnpm db:generate` - Generate migration files
- `pnpm db:migrate` - Run migrations
- `pnpm db:studio` - Open Drizzle Studio (visual DB browser)
- `pnpm db:push` - Push schema changes (dev only)

## Build Status

✅ **Build successful** - All schemas compile correctly

## References

- [ADR-001: Database Architecture](../decisions/ADR-001-database-architecture.md)
- [Drizzle ORM Docs](https://orm.drizzle.team/)
- [Drizzle Relations](https://orm.drizzle.team/docs/relations)

