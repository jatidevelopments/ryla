# Shared Library

Common utilities, types, and constants shared across all apps and libs.

## Import
```typescript
import { ... } from '@ryla/shared';
```

## Structure
```
libs/shared/src/
├── utils/         # Utility functions
├── types/         # Type definitions
├── constants/     # Application constants
├── validators/    # Validation utilities
├── errors/        # Custom error classes
└── index.ts       # Public exports
```

## Rules
- No app-specific logic
- No external API dependencies
- Pure functions preferred
- Well-typed exports

