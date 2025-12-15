# Data Access Library

Database operations and data persistence.

## Import
```typescript
import { UserRepository, ... } from '@ryla/data';
```

## Structure
```
libs/data/src/
├── repositories/  # Data repository implementations
├── models/        # Database models/entities (re-exports from apps/api/src/database/schemas)
├── migrations/    # Database migrations
├── queries/       # Complex queries
└── index.ts       # Public exports
```

## Database Schemas

All database schemas are defined in `apps/api/src/database/schemas/` and re-exported from `libs/data`:

```typescript
import {
  users,
  characters,
  posts,
  images,
  generationJobs,
  userCredits,
  creditTransactions,
  loraModels,
  subscriptions,
  // Types
  type User,
  type Character,
  type Post,
  type GenerationJob,
  // Enums
  type CharacterStatus,
  type JobStatus,
  type JobType,
} from '@ryla/data';
```

## Layer Rules
- Abstracts database operations
- Depends on: `@ryla/shared`
- Returns domain models (not raw DB entities)
- Uses repository pattern

## Testing
- Integration tests with test database
- Mock database in unit tests

