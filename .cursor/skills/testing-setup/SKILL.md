---
name: testing-setup
description: Sets up testing environments and configurations for unit, integration, and E2E tests. Use when configuring test environments, creating test fixtures, setting up test databases, or when the user mentions test setup.
---

# Testing Setup

Sets up testing environments and configurations for unit, integration, and E2E tests.

## Quick Start

When setting up tests:

1. **Choose Framework** - Vitest for unit/integration, Playwright for E2E
2. **Configure Environment** - Set up test database, mocks
3. **Create Fixtures** - Set up test data
4. **Configure MSW** - Set up network mocking (frontend)
5. **Run Tests** - Verify setup works

## Framework Configuration

### Vitest (Unit/Integration)

**Config**: `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/test/setup.ts'],
  },
});
```

### Playwright (E2E)

**Config**: `playwright.config.ts`

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
  },
});
```

## Test Database Setup

### Using PGlite

```typescript
// apps/api/src/test/utils/test-db.ts
import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import * as schema from '@ryla/data/schema';

export async function createTestDb() {
  const client = new PGlite();
  const db = drizzle(client, { schema });

  // Apply migrations
  const migrationsPath = resolve(__dirname, '../../../../../drizzle/migrations');
  await migrate(db, { migrationsFolder: migrationsPath });

  return { db, client };
}
```

### Using Test Database

```typescript
import { createTestDb } from '@/test/utils/test-db';

describe('CharacterService', () => {
  let db: DrizzleDb;
  
  beforeAll(async () => {
    const testDb = await createTestDb();
    db = testDb.db;
  });
  
  it('should create character', async () => {
    const service = new CharacterService(db);
    const character = await service.create({ name: 'Test' });
    expect(character.name).toBe('Test');
  });
});
```

## MSW Setup (Frontend)

### Configure MSW Server

```typescript
// apps/web/src/test/msw-server.ts
import { setupServer } from 'msw/node';
import { rest } from 'msw';

export const server = setupServer(
  rest.get('/api/characters', (req, res, ctx) => {
    return res(ctx.json([{ id: '1', name: 'Test' }]));
  }),
);
```

### Setup in Tests

```typescript
// apps/web/src/test/setup.tsx
import { server } from './msw-server';

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## Test Fixtures

### Creating Fixtures

```typescript
// apps/api/src/test/fixtures/character.fixtures.ts
import { characters } from '@ryla/data/schema';

export const characterFixtures = {
  basic: {
    id: 'char-1',
    name: 'Test Character',
    userId: 'user-1',
  },
  
  withImages: {
    id: 'char-2',
    name: 'Character with Images',
    userId: 'user-1',
    images: ['img-1', 'img-2'],
  },
};
```

### Using Fixtures

```typescript
import { characterFixtures } from '@/test/fixtures/character.fixtures';

it('should create character', async () => {
  const character = await db.insert(characters)
    .values(characterFixtures.basic)
    .returning();
  
  expect(character[0].name).toBe('Test Character');
});
```

## Test Credentials

### Test User Accounts

**Location**: `.cursor/rules/test-credentials.mdc`

**Usage:**
```typescript
import { TEST_USERS } from '@/test/credentials';

const testUser = TEST_USERS.DEVELOPER;
await login(testUser.email, testUser.password);
```

### Test API Tokens

```typescript
import { TEST_TOKENS } from '@/test/credentials';

const headers = {
  Authorization: `Bearer ${TEST_TOKENS.DEVELOPER}`,
};
```

## Environment Variables

### Test Environment Config

```typescript
// .env.test
DATABASE_URL=postgresql://test:test@localhost:5432/test
REDIS_URL=redis://localhost:6379
NODE_ENV=test
```

### Loading in Tests

```typescript
import { loadEnv } from 'vite';

loadEnv('test', process.cwd(), '');
```

## Best Practices

### 1. Isolate Tests

```typescript
// ✅ Good: Each test is independent
beforeEach(async () => {
  await db.delete(characters);
});

// ❌ Bad: Tests depend on each other
let sharedCharacter;
```

### 2. Use Fixtures

```typescript
// ✅ Good: Use fixtures
const character = characterFixtures.basic;

// ❌ Bad: Create data in each test
const character = { id: '1', name: 'Test' };
```

### 3. Clean Up After Tests

```typescript
// ✅ Good: Clean up
afterEach(async () => {
  await db.delete(characters);
});

// ❌ Bad: Leave test data
```

### 4. Mock External Services

```typescript
// ✅ Good: Mock external API
server.use(
  rest.get('/api/external', (req, res, ctx) => {
    return res(ctx.json({ data: 'mocked' }));
  })
);

// ❌ Bad: Call real external API
await fetch('https://api.external.com');
```

### 5. Use Test Database

```typescript
// ✅ Good: Use test database
const { db } = await createTestDb();

// ❌ Bad: Use production database
const db = getProductionDb();
```

## Running Tests

```bash
# Run all tests
pnpm nx run-many --target=test

# Run specific project
pnpm nx test <project-name>

# Run with coverage
pnpm nx test <project-name> --coverage

# Run E2E tests
pnpm nx e2e <project-name>
```

## Related Resources

- **Testing Standards**: `.cursor/rules/testing-standards.mdc`
- **Test Fixtures**: `.cursor/rules/test-fixtures.mdc`
- **Test Credentials**: `.cursor/rules/test-credentials.mdc`
- **Test Generation**: See `test-generation` skill
