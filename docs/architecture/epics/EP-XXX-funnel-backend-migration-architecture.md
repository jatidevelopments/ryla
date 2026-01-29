# EP-XXX: Funnel Backend Migration - Architecture

**Initiative**: [IN-032](../../../initiatives/IN-032-funnel-supabase-to-backend-migration.md)  
**Status**: P3 - Architecture  
**Created**: 2026-01-28  
**Last Updated**: 2026-01-28

---

## Functional Architecture

### Current Architecture (Supabase)

```
Funnel App (Client)
    ↓
Supabase Client (@supabase/ssr)
    ↓
Supabase Database (Postgres)
    ├── funnel_sessions
    └── funnel_options
```

### Target Architecture (Backend API)

```
Funnel App (Client)
    ↓
Backend API (tRPC/REST)
    ↓
Business Logic Layer (Services)
    ↓
Data Access Layer (Repositories)
    ↓
Postgres Database (Main DB)
    ├── funnel_sessions
    └── funnel_options
```

### Architecture Principles

1. **Layered Architecture**: Follow Apps → Business → Data → DB pattern
2. **Type Safety**: Maintain TypeScript types throughout
3. **Backward Compatibility**: Support existing session IDs and data structures
4. **Anonymous Sessions**: Support unauthenticated funnel sessions
5. **Performance**: Maintain < 100ms response times

---

## Data Model

### Database Schema

#### `funnel_sessions` Table

```typescript
// libs/data/src/schema/funnel-sessions.schema.ts

import { pgTable, text, integer, boolean, timestamp, uuid, index } from 'drizzle-orm/pg-core';

export const funnelSessions = pgTable(
  'funnel_sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    sessionId: text('session_id').notNull().unique(), // Client-generated session identifier
    email: text('email'), // Payment email from step 34
    onWaitlist: boolean('on_waitlist').default(false), // Waitlist status from step 35
    currentStep: integer('current_step'), // Last step reached
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    sessionIdIdx: index('funnel_sessions_session_id_idx').on(table.sessionId),
  })
);
```

**Fields**:
- `id`: UUID primary key (auto-generated)
- `sessionId`: TEXT, unique, indexed - Client-generated session identifier
- `email`: TEXT, nullable - Payment email from step 34
- `onWaitlist`: BOOLEAN, default false - Waitlist status from step 35
- `currentStep`: INTEGER, nullable - Last step reached
- `createdAt`: TIMESTAMP - Creation timestamp
- `updatedAt`: TIMESTAMP - Last update timestamp

**Constraints**:
- `sessionId` must be unique
- Index on `sessionId` for fast lookups

#### `funnel_options` Table

```typescript
// libs/data/src/schema/funnel-options.schema.ts

import { pgTable, text, jsonb, timestamp, uuid, index, unique } from 'drizzle-orm/pg-core';
import { funnelSessions } from './funnel-sessions.schema';

export const funnelOptions = pgTable(
  'funnel_options',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    sessionId: text('session_id')
      .notNull()
      .references(() => funnelSessions.sessionId, { onDelete: 'cascade' }),
    optionKey: text('option_key').notNull(), // Field name from FunnelSchema
    optionValue: jsonb('option_value').notNull(), // Value (supports strings, numbers, booleans, arrays)
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    sessionIdIdx: index('funnel_options_session_id_idx').on(table.sessionId),
    optionKeyIdx: index('funnel_options_option_key_idx').on(table.optionKey),
    sessionOptionUnique: unique('funnel_options_session_option_unique').on(
      table.sessionId,
      table.optionKey
    ),
  })
);
```

**Fields**:
- `id`: UUID primary key (auto-generated)
- `sessionId`: TEXT, foreign key to `funnel_sessions.session_id`
- `optionKey`: TEXT - Field name from FunnelSchema
- `optionValue`: JSONB - Value (supports strings, numbers, booleans, arrays)
- `createdAt`: TIMESTAMP - Creation timestamp
- `updatedAt`: TIMESTAMP - Last update timestamp

**Constraints**:
- Unique constraint on `(sessionId, optionKey)` - prevents duplicate options per session
- Foreign key to `funnel_sessions` with cascade delete
- Indexes on `sessionId` and `optionKey` for performance

### Data Relationships

```
funnel_sessions (1) ──< (many) funnel_options
```

- One session can have many options
- Options are deleted when session is deleted (cascade)

### Type Definitions

```typescript
// libs/shared/src/types/funnel.ts

export interface FunnelSession {
  id: string;
  sessionId: string;
  email: string | null;
  onWaitlist: boolean;
  currentStep: number | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface FunnelOption {
  id: string;
  sessionId: string;
  optionKey: string;
  optionValue: any; // JSONB can contain any JSON-serializable value
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSessionData {
  sessionId: string;
  currentStep?: number;
}

export interface UpdateSessionData {
  email?: string;
  onWaitlist?: boolean;
  currentStep?: number;
}
```

---

## API Contracts

### tRPC Router: `funnelRouter`

**Location**: `libs/trpc/src/routers/funnel.router.ts`

#### Procedures

##### 1. `createSession`

**Purpose**: Create a new funnel session

**Input**:
```typescript
z.object({
  sessionId: z.string(),
  currentStep: z.number().optional(),
})
```

**Output**:
```typescript
FunnelSession | null
```

**Behavior**:
- Creates new session if `sessionId` doesn't exist
- Returns existing session if `sessionId` already exists (idempotent)
- Supports anonymous sessions (no auth required)

**Errors**:
- Database errors return `null` (matches Supabase behavior)

##### 2. `updateSession`

**Purpose**: Update session with email, waitlist status, or current step

**Input**:
```typescript
z.object({
  sessionId: z.string(),
  email: z.string().email().optional(),
  onWaitlist: z.boolean().optional(),
  currentStep: z.number().optional(),
})
```

**Output**:
```typescript
FunnelSession | null
```

**Behavior**:
- Updates only provided fields
- Returns updated session or `null` if not found
- Supports partial updates

**Errors**:
- Session not found returns `null`
- Database errors return `null`

##### 3. `getSession`

**Purpose**: Get session by session ID

**Input**:
```typescript
z.object({
  sessionId: z.string(),
})
```

**Output**:
```typescript
FunnelSession | null
```

**Behavior**:
- Returns session if found, `null` if not found
- No auth required

##### 4. `saveOption`

**Purpose**: Save a single option for a session

**Input**:
```typescript
z.object({
  sessionId: z.string(),
  optionKey: z.string(),
  optionValue: z.any(), // JSONB value
})
```

**Output**:
```typescript
z.object({
  success: z.boolean(),
})
```

**Behavior**:
- Upserts option (creates if new, updates if exists)
- Uses unique constraint on `(sessionId, optionKey)`
- Returns `{ success: true }` on success, `{ success: false }` on error

##### 5. `saveAllOptions`

**Purpose**: Save multiple options for a session

**Input**:
```typescript
z.object({
  sessionId: z.string(),
  options: z.record(z.string(), z.any()), // Record<optionKey, optionValue>
})
```

**Output**:
```typescript
z.object({
  success: z.boolean(),
})
```

**Behavior**:
- Upserts all options in a single transaction
- Returns `{ success: true }` if all succeed, `{ success: false }` if any fail

##### 6. `getSessionOptions`

**Purpose**: Get all options for a session

**Input**:
```typescript
z.object({
  sessionId: z.string(),
})
```

**Output**:
```typescript
z.array(
  z.object({
    id: z.string(),
    sessionId: z.string(),
    optionKey: z.string(),
    optionValue: z.any(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
)
```

**Behavior**:
- Returns array of options for session
- Returns empty array if session has no options or doesn't exist

### Authentication

**All procedures use `publicProcedure`** - No authentication required for funnel operations (anonymous sessions).

---

## Component Architecture

### Backend Components

#### 1. Data Layer

**Location**: `libs/data/src/schema/`

**Files**:
- `funnel-sessions.schema.ts` - Drizzle schema for `funnel_sessions` table
- `funnel-options.schema.ts` - Drizzle schema for `funnel_options` table

**Responsibilities**:
- Define database schema
- Export schema for use in repositories

#### 2. Business Logic Layer

**Location**: `libs/business/src/services/`

**Files**:
- `funnel-session.service.ts` - Business logic for session operations
- `funnel-option.service.ts` - Business logic for option operations

**Responsibilities**:
- Validate inputs
- Orchestrate data operations
- Handle business rules
- Error handling

**Services**:

```typescript
// FunnelSessionService
class FunnelSessionService {
  async createSession(data: CreateSessionData): Promise<FunnelSession | null>
  async updateSession(sessionId: string, data: UpdateSessionData): Promise<FunnelSession | null>
  async getSession(sessionId: string): Promise<FunnelSession | null>
}

// FunnelOptionService
class FunnelOptionService {
  async saveOption(sessionId: string, key: string, value: any): Promise<boolean>
  async saveAllOptions(sessionId: string, options: Record<string, any>): Promise<boolean>
  async getSessionOptions(sessionId: string): Promise<FunnelOption[]>
}
```

#### 3. Presentation Layer

**Location**: `libs/trpc/src/routers/`

**Files**:
- `funnel.router.ts` - tRPC router with all funnel procedures

**Responsibilities**:
- Define API contracts
- Input validation (Zod)
- Call business services
- Format responses

#### 4. Frontend Components

**Location**: `apps/funnel/services/`

**Files**:
- `session-service.ts` - Updated to use backend API instead of Supabase

**Changes**:
- Replace Supabase client calls with tRPC calls or REST API calls
- Maintain same function signatures
- Maintain same TypeScript types
- Keep session ID generation logic

### Data Flow

```
1. Funnel App calls session-service function
   ↓
2. session-service calls backend API (tRPC/REST)
   ↓
3. tRPC router validates input (Zod)
   ↓
4. tRPC router calls business service
   ↓
5. Business service calls data repository
   ↓
6. Data repository queries/updates database
   ↓
7. Response flows back through layers
```

---

## Migration Strategy

### Phase 1: Backend Infrastructure
1. Create database schema
2. Create migration script
3. Run migration in development
4. Create business services
5. Create tRPC router
6. Test all endpoints

### Phase 2: Frontend Migration
1. Update `session-service.ts` to use backend API
2. Replace Supabase calls with API calls
3. Test in development
4. Verify all functionality works

### Phase 3: Data Migration (if needed)
1. Export data from Supabase
2. Import data to main database
3. Validate data integrity
4. Test with migrated data

### Phase 4: Cleanup
1. Remove Supabase dependencies
2. Remove Supabase code
3. Update documentation
4. Deploy to production

---

## Performance Considerations

### Database Indexes

- `funnel_sessions.session_id` - Indexed for fast lookups
- `funnel_options.session_id` - Indexed for fast session queries
- `funnel_options.option_key` - Indexed for option lookups
- Unique constraint on `(session_id, option_key)` - Prevents duplicates

### Query Optimization

- Use batch operations for `saveAllOptions` (single transaction)
- Use upsert operations to avoid separate insert/update logic
- Cache session data if needed (future optimization)

### Response Time Targets

- Session operations: < 100ms (matches Supabase performance)
- Option operations: < 100ms
- Batch operations: < 200ms

---

## Security Considerations

### Anonymous Sessions

- Funnel sessions don't require authentication
- Session IDs are client-generated (no security risk)
- No PII stored except email (optional, from payment step)

### Input Validation

- All inputs validated with Zod schemas
- Email format validation
- Session ID format validation (if needed)
- Option value validation (JSONB, any type)

### Data Access

- No row-level security needed (anonymous sessions)
- Foreign key constraints ensure data integrity
- Cascade delete prevents orphaned options

---

## Error Handling

### Backend Errors

- Database errors return `null` (matches Supabase behavior)
- Validation errors return tRPC errors
- Network errors handled by frontend

### Frontend Errors

- Maintain current error handling behavior
- Return `null` for failed operations (matches Supabase)
- Log errors for debugging

---

## Testing Strategy

### Unit Tests

- Business services: Test all methods
- tRPC procedures: Test input validation, error handling
- Data repositories: Test CRUD operations

### Integration Tests

- End-to-end API tests: Test all procedures
- Database integration: Test with real database
- Frontend integration: Test session-service functions

### E2E Tests

- Funnel flow: Test complete funnel journey
- Session persistence: Test session data across steps
- Option saving: Test option persistence

---

## File Structure

```
libs/
  data/
    src/
      schema/
        funnel-sessions.schema.ts      # NEW
        funnel-options.schema.ts        # NEW
  business/
    src/
      services/
        funnel-session.service.ts       # NEW
        funnel-option.service.ts        # NEW
  trpc/
    src/
      routers/
        funnel.router.ts                # NEW
        index.ts                        # UPDATE (export funnelRouter)
  shared/
    src/
      types/
        funnel.ts                       # NEW (type definitions)

apps/
  funnel/
    services/
      session-service.ts                # UPDATE (remove Supabase, use API)
    utils/
      supabase/                         # DELETE (remove entire directory)
    package.json                         # UPDATE (remove @supabase/ssr)
```

---

## Next Phase

**P4: UI Skeleton** - N/A (no UI changes required, this is a backend migration)

**P5: Technical Specification** - Create detailed file plan and task breakdown

---

**Status**: ✅ P3 Complete - Ready for P5 (Technical Specification)
