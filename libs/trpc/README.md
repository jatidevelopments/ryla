# @ryla/trpc

Type-safe API layer using tRPC for end-to-end type safety between client and server.

## Overview

This library provides:

- **Type-safe API calls** - No manual type synchronization
- **Automatic error handling** - Consistent error responses
- **Authentication middleware** - Protected procedures with user context
- **React Query integration** - Caching, mutations, optimistic updates

## Usage

### Server-side (Next.js API Route)

```typescript
// apps/web/app/api/trpc/[trpc]/route.ts
import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import { appRouter, createContext } from '@ryla/trpc';

const handler = (req: Request) =>
  fetchRequestHandler({
    endpoint: '/api/trpc',
    req,
    router: appRouter,
    createContext,
  });

export { handler as GET, handler as POST };
```

### Client-side (React Component)

```typescript
// Use the trpc hooks
import { trpc } from '@/trpc/client';

function MyComponent() {
  const { data: user } = trpc.user.me.useQuery();
  const createCharacter = trpc.character.create.useMutation();

  return (
    <button onClick={() => createCharacter.mutate({ name: 'Luna' })}>
      Create Character
    </button>
  );
}
```

## Architecture

```
libs/trpc/src/
├── index.ts           # Public exports
├── trpc.ts            # tRPC initialization
├── router.ts          # Root router combining all routers
├── context/
│   └── context.ts     # Request context creation
├── middleware/
│   ├── auth.ts        # Authentication middleware
│   └── logging.ts     # Request logging
├── routers/
│   ├── user.router.ts
│   ├── character.router.ts
│   ├── generation.router.ts
│   └── index.ts
└── client/
    └── client.ts      # Client-side setup helpers
```

## Procedures

- `publicProcedure` - No auth required
- `protectedProcedure` - Requires authenticated user
- `adminProcedure` - Requires admin role

## Integration with Supabase Auth

The context automatically extracts and validates Supabase session tokens,
providing the user object to protected procedures.
