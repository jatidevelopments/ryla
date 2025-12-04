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
├── models/        # Database models/entities
├── migrations/    # Database migrations
├── queries/       # Complex queries
└── index.ts       # Public exports
```

## Layer Rules
- Abstracts database operations
- Depends on: `@ryla/shared`
- Returns domain models (not raw DB entities)
- Uses repository pattern

## Testing
- Integration tests with test database
- Mock database in unit tests

