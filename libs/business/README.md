# Business Logic Library

Core business rules, services, and domain logic.

## Import
```typescript
import { UserService, ... } from '@ryla/business';
```

## Structure
```
libs/business/src/
├── services/      # Business service implementations
├── models/        # Domain models
├── rules/         # Business rules
├── processes/     # Business processes
└── index.ts       # Public exports
```

## Layer Rules
- Contains all business logic
- Depends on: `@ryla/data`, `@ryla/shared`
- Never access database directly (use data layer)
- Never handle HTTP concerns (presentation handles that)

## Testing
- Unit tests for all services
- Mock data layer in tests

