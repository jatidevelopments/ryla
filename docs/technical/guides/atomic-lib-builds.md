# Atomic Library Builds

## Overview

This document describes the atomic build system for RYLA's shared libraries. The system prevents race conditions during development where apps crash because `dist/libs/` is temporarily empty during rebuilds.

## The Problem

When running `pnpm dev:web-api` or `pnpm dev:all`, multiple processes run concurrently:

1. **libs watcher** - Watches `libs/` for changes and rebuilds
2. **web** - Next.js dev server importing from `dist/libs/`
3. **api** - NestJS dev server importing from `dist/libs/`

The standard `nx build` command deletes the output directory before building. This creates a race condition:

```
T0: Change detected in libs/business/
T1: nx build business → deletes dist/libs/business/
T2: API tries to import @ryla/business → CRASH (file not found)
T3: nx build business → writes new files
T4: API already crashed, doesn't auto-recover
```

## The Solution: Atomic Builds

The atomic build script (`scripts/build-libs-atomic.ts`) solves this by:

1. **Build normally** - All libs build to `dist/libs/` (nx handles parallelization & caching)
2. **Copy to staging** - Copy all lib outputs to `tmp/.libs-build-temp/` (cleaner location, already gitignored)
3. **Prepare for swap** - Copy from staging to `dist/.libs-build-temp/` (atomic rename requires same directory)
4. **Atomic swap** - Rename operations:
   - `dist/libs/` → `dist/.libs-backup/`
   - `dist/.libs-build-temp/` → `dist/libs/`
5. **Cleanup** - Delete staging, temp, and backup folders

This ensures `dist/libs/` is never in a partial state - it either has the old complete version or the new complete version.

```
T0: Change detected in libs/business/
T1: nx builds all libs normally
T2: Copy to staging folder tmp/.libs-build-temp (dist/libs still intact)
T3: Copy from staging to dist/.libs-build-temp
T4: Atomic rename swap (~1ms operation)
T5: Apps see new libs instantly, no crash
```

## Scripts

### `pnpm build:libs`

Standard parallel build of all libraries:

```bash
pnpm nx run-many --target=build --projects=shared,data,business,trpc,payments,analytics,ui,email --nx-bail
```

### `pnpm build:libs:atomic`

Atomic build with swap:

```bash
tsx scripts/build-libs-atomic.ts
```

### `pnpm dev:libs`

Watches `libs/` and triggers atomic rebuilds:

```bash
npx nodemon --watch libs --ext ts,tsx,js,jsx,json \
  --ignore '**/*.spec.ts' --ignore '**/*.test.ts' \
  --delay 500ms --exec 'pnpm build:libs:atomic'
```

## Dev Commands

| Command | Description |
|---------|-------------|
| `pnpm dev:web-api` | Runs libs watcher + web + api |
| `pnpm dev:all` | Runs libs watcher + web + api + funnel + landing |
| `pnpm dev:apps` | Runs web + landing (no libs watcher) |

## Libraries Included

The following libraries are built atomically:

| Library | Path | Description |
|---------|------|-------------|
| `shared` | `libs/shared` | Utils, types, constants |
| `data` | `libs/data` | Repositories, Drizzle schemas |
| `business` | `libs/business` | Services, models, rules |
| `trpc` | `libs/trpc` | tRPC routers |
| `payments` | `libs/payments` | Payment integration |
| `analytics` | `libs/analytics` | Event tracking |
| `ui` | `libs/ui` | Shared React components |
| `email` | `libs/email` | Email templates |

## How It Works

### File Structure During Build

```
tmp/
└── .libs-build-temp/        # Staging folder (deleted after, cleaner location)

dist/
├── libs/                    # Current production libs (apps import from here)
├── .libs-build-temp/        # Temp folder for atomic swap (deleted after)
└── .libs-backup/            # Backup during swap (deleted after)
```

### Atomic Swap Mechanism

The key insight is that `rename()` (mv) is an atomic operation on POSIX filesystems. The swap happens in ~1ms:

```typescript
// Step 1: Copy to staging (tmp/)
cpSync('dist/libs', 'tmp/.libs-build-temp', { recursive: true });

// Step 2: Copy from staging to dist/ for atomic swap
cpSync('tmp/.libs-build-temp', 'dist/.libs-build-temp', { recursive: true });

// Step 3: Backup current
renameSync('dist/libs', 'dist/.libs-backup');

// Step 4: Promote new (atomic!)
renameSync('dist/.libs-build-temp', 'dist/libs');

// Step 5: Cleanup
rmSync('tmp/.libs-build-temp', { recursive: true });
rmSync('dist/.libs-backup', { recursive: true });
```

### Error Recovery

If the build fails, the script restores from backup:

```typescript
catch (error) {
  if (existsSync(BACKUP_LIBS) && !existsSync(DIST_LIBS)) {
    renameSync(BACKUP_LIBS, DIST_LIBS);
  }
}
```

## Performance

| Scenario | Time |
|----------|------|
| Cold build (no cache) | ~10-15s |
| Warm build (cached) | ~0.5-1s |
| Atomic swap | ~1ms |

The 500ms nodemon delay batches rapid file changes to avoid excessive rebuilds.

## Troubleshooting

### "Cannot find module '@ryla/xxx'"

1. Check if the lib is in the LIBS array in `scripts/build-libs-atomic.ts`
2. Run `pnpm build:libs:atomic` manually
3. Check `dist/libs/xxx` exists

### Build fails but old libs are gone

The script auto-restores from backup. If that fails:

```bash
pnpm nx reset
pnpm build:libs
```

### Nodemon not detecting changes

Check the watch patterns in `package.json`:

```json
"dev:libs": "npx nodemon --watch libs --ext ts,tsx,js,jsx,json ..."
```

### API/Web not picking up new libs

Next.js and tsx watch mode should auto-reload. If not:

1. Restart the dev server
2. Clear Next.js cache: `rm -rf apps/web/.next`

## Adding a New Library

1. Add to `scripts/build-libs-atomic.ts`:

```typescript
const LIBS = ['shared', 'data', 'business', 'trpc', 'payments', 'analytics', 'ui', 'email', 'NEW_LIB'];
```

2. Add to `package.json`:

```json
"build:libs": "pnpm nx run-many --target=build --projects=shared,data,business,trpc,payments,analytics,ui,email,NEW_LIB --nx-bail"
```

3. Ensure path mapping exists in `tsconfig.base.json`:

```json
"@ryla/NEW_LIB": ["dist/libs/NEW_LIB/src/index"]
```

## Related Documentation

- [Architecture Rules](../../.cursor/rules/architecture.mdc) - Monorepo structure
- [File Organization](../../.cursor/rules/file-organization.mdc) - File patterns
- [Way of Work](../../.cursor/rules/way-of-work.mdc) - Development workflow
