---
name: api-endpoint-creation
description: Creates tRPC endpoints following RYLA API patterns. Use when creating API endpoints, adding tRPC procedures, implementing API routes, or when the user mentions tRPC, API endpoints, or backend routes.
---

# API Endpoint Creation

Creates type-safe tRPC endpoints following RYLA API design patterns.

## Quick Start

When creating a tRPC endpoint:

1. **Create Router** - Create router file in `libs/trpc/src/routers/`
2. **Define Procedures** - Use `publicProcedure`, `protectedProcedure`, or `adminProcedure`
3. **Validate Inputs** - Use Zod schemas for validation
4. **Call Business Logic** - Use services from `@ryla/business`
5. **Export Router** - Add to root router in `router.ts`

## Router Structure

### File Location

```
libs/trpc/src/routers/
├── character.router.ts
├── user.router.ts
└── index.ts  # Barrel export
```

### Basic Router Template

```typescript
// libs/trpc/src/routers/feature.router.ts
import { router } from '../trpc';
import { z } from 'zod';
import { protectedProcedure, publicProcedure } from '../trpc';
import { FeatureService } from '@ryla/business';

export const featureRouter = router({
  // Public procedure
  list: publicProcedure
    .input(z.object({
      page: z.number().default(1),
      limit: z.number().default(10),
    }))
    .query(async ({ input, ctx }) => {
      const service = new FeatureService(ctx.db);
      return service.list(input);
    }),

  // Protected procedure (requires auth)
  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1),
      description: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const service = new FeatureService(ctx.db);
      return service.create({
        ...input,
        userId: ctx.user.id,
      });
    }),

  // Admin procedure (requires admin role)
  delete: adminProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const service = new FeatureService(ctx.db);
      return service.delete(input.id);
    }),
});
```

## Procedure Types

### Public Procedure

No authentication required:

```typescript
publicProcedure
  .input(z.object({ id: z.string() }))
  .query(async ({ input, ctx }) => {
    // Accessible without auth
  });
```

### Protected Procedure

Requires authenticated user:

```typescript
protectedProcedure
  .input(z.object({ name: z.string() }))
  .mutation(async ({ input, ctx }) => {
    // ctx.user is available
    const userId = ctx.user.id;
  });
```

### Admin Procedure

Requires admin role:

```typescript
adminProcedure
  .input(z.object({ id: z.string().uuid() }))
  .mutation(async ({ input, ctx }) => {
    // ctx.user is admin
  });
```

## Input Validation

### Zod Schemas

```typescript
import { z } from 'zod';

// Simple schema
.input(z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
}))

// Complex schema
.input(z.object({
  id: z.string().uuid(),
  filters: z.object({
    status: z.enum(['active', 'inactive']).optional(),
    tags: z.array(z.string()).optional(),
  }).optional(),
  pagination: z.object({
    page: z.number().int().positive().default(1),
    limit: z.number().int().positive().max(100).default(10),
  }).optional(),
}))
```

### Common Patterns

```typescript
// UUID validation
id: z.string().uuid()

// Email validation
email: z.string().email()

// Optional fields
description: z.string().optional()

// Default values
page: z.number().default(1)

// Enums
status: z.enum(['active', 'inactive', 'pending'])

// Arrays
tags: z.array(z.string())

// Nested objects
metadata: z.object({
  key: z.string(),
  value: z.string(),
})
```

## Error Handling

### TRPCError

```typescript
import { TRPCError } from '@trpc/server';

// Not found
throw new TRPCError({
  code: 'NOT_FOUND',
  message: 'Character not found',
});

// Unauthorized
throw new TRPCError({
  code: 'UNAUTHORIZED',
  message: 'You must be logged in',
});

// Forbidden
throw new TRPCError({
  code: 'FORBIDDEN',
  message: 'You do not have permission',
});

// Bad request
throw new TRPCError({
  code: 'BAD_REQUEST',
  message: 'Invalid input',
});

// Internal server error
throw new TRPCError({
  code: 'INTERNAL_SERVER_ERROR',
  message: 'Something went wrong',
});
```

## Business Logic Integration

### Using Services

```typescript
import { CharacterService } from '@ryla/business';

protectedProcedure
  .input(z.object({ name: z.string() }))
  .mutation(async ({ input, ctx }) => {
    const service = new CharacterService(ctx.db);
    
    // Call business logic
    const character = await service.create({
      ...input,
      userId: ctx.user.id,
    });
    
    return character;
  });
```

### Direct Database Access (Avoid)

```typescript
// ❌ Bad: Direct database access
protectedProcedure
  .mutation(async ({ ctx }) => {
    return ctx.db.select().from(characters);
  });

// ✅ Good: Use business service
protectedProcedure
  .mutation(async ({ ctx }) => {
    const service = new CharacterService(ctx.db);
    return service.list();
  });
```

## Adding Router to App

### Export from Routers Index

```typescript
// libs/trpc/src/routers/index.ts
export { featureRouter } from './feature.router';
```

### Add to Root Router

```typescript
// libs/trpc/src/router.ts
import { featureRouter } from './routers';

export const appRouter = router({
  user: userRouter,
  character: characterRouter,
  feature: featureRouter,  // Add here
  // ...
});
```

## Query vs Mutation

### Query (Read Operations)

```typescript
// ✅ Good: Use query for read operations
list: publicProcedure
  .input(z.object({ page: z.number() }))
  .query(async ({ input, ctx }) => {
    // Fetch data
    return data;
  });
```

### Mutation (Write Operations)

```typescript
// ✅ Good: Use mutation for write operations
create: protectedProcedure
  .input(z.object({ name: z.string() }))
  .mutation(async ({ input, ctx }) => {
    // Create/update/delete
    return result;
  });
```

## Response Types

### Typed Responses

```typescript
// Return typed objects
.query(async ({ input, ctx }) => {
  return {
    id: '123',
    name: 'Luna',
    createdAt: new Date(),
  };
});

// Return arrays
.query(async ({ input, ctx }) => {
  return [
    { id: '1', name: 'Luna' },
    { id: '2', name: 'Aria' },
  ];
});

// Return paginated results
.query(async ({ input, ctx }) => {
  return {
    data: [...],
    meta: {
      page: 1,
      limit: 10,
      total: 100,
    },
  };
});
```

## Best Practices

### 1. Validate All Inputs

```typescript
// ✅ Good: Validate with Zod
.input(z.object({
  name: z.string().min(1),
  email: z.string().email(),
}))

// ❌ Bad: No validation
.input(z.any())
```

### 2. Use Business Services

```typescript
// ✅ Good: Business logic in services
const service = new CharacterService(ctx.db);
return service.create(input);

// ❌ Bad: Logic in router
return ctx.db.insert(characters).values(input);
```

### 3. Handle Errors Gracefully

```typescript
// ✅ Good: Specific error messages
try {
  return await service.create(input);
} catch (error) {
  if (error instanceof NotFoundError) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Resource not found',
    });
  }
  throw error;
}
```

### 4. Use Appropriate Procedure Types

```typescript
// ✅ Good: Use publicProcedure for public data
publicProcedure.query(...)

// ✅ Good: Use protectedProcedure for user data
protectedProcedure.mutation(...)

// ✅ Good: Use adminProcedure for admin operations
adminProcedure.mutation(...)
```

### 5. Type Safety

```typescript
// ✅ Good: TypeScript types from Zod
const schema = z.object({
  name: z.string(),
});
type Input = z.infer<typeof schema>;
```

## Testing

### Test Procedure

```typescript
import { createCallerFactory } from '@ryla/trpc';
import { appRouter } from '@ryla/trpc';

describe('featureRouter', () => {
  it('should create feature', async () => {
    const createCaller = createCallerFactory(appRouter);
    const caller = createCaller({
      user: { id: 'user-1' },
      db: mockDb,
    });
    
    const result = await caller.feature.create({ name: 'Test' });
    expect(result.name).toBe('Test');
  });
});
```

## Related Resources

- **API Design**: `.cursor/rules/api-design.mdc`
- **tRPC Library**: `libs/trpc/`
- **Business Services**: `libs/business/src/services/`
