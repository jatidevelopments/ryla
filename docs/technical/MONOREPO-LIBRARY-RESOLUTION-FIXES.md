# Monorepo Library Resolution Fixes

## Problem

After agents make changes to libraries or apps, Next.js apps fail with:
```
Module not found: Can't resolve '@ryla/ui'
```

This happens because:
1. TypeScript path mappings point to `dist/libs/*` (built output)
2. Libraries must be built before apps can resolve them
3. Next.js dev server starts before libs are built
4. Agents don't always rebuild libs after changes

## Root Cause

- **Path mappings** in `tsconfig.base.json` point to `dist/libs/*`
- **Webpack aliases** in `next.config.js` point to `dist/libs/*`
- **No explicit build dependency** for Next.js serve target
- **No pre-serve hook** to ensure libs are built

## Solutions

### Option 1: Add Build Dependencies to Serve Targets (RECOMMENDED)

**Pros:**
- ✅ Nx automatically builds dependencies before serving
- ✅ Works with caching and parallelization
- ✅ No manual steps needed
- ✅ Consistent across all apps

**Cons:**
- ⚠️ Slightly slower initial serve (but cached after first run)

**Implementation:**

Update `apps/web/project.json` serve target:

```json
{
  "serve": {
    "executor": "@nx/next:server",
    "defaultConfiguration": "development",
    "options": {
      "buildTarget": "web:build",
      "dev": true,
      "port": 3000
    },
    "dependsOn": ["^build"],
    "configurations": {
      "development": {
        "buildTarget": "web:build:development",
        "dev": true
      },
      "production": {
        "buildTarget": "web:build:production",
        "dev": false
      }
    }
  }
}
```

Do the same for `apps/funnel`, `apps/landing`, `apps/admin`.

### Option 2: Pre-Serve Script (Alternative)

**Pros:**
- ✅ Explicit control
- ✅ Can show helpful messages
- ✅ Works even if Nx dependencies fail

**Cons:**
- ⚠️ Manual maintenance
- ⚠️ Doesn't leverage Nx caching
- ⚠️ Slower (always builds, no cache)

**Implementation:**

Add to `apps/web/project.json`:

```json
{
  "serve": {
    "executor": "nx:run-commands",
    "options": {
      "commands": [
        "pnpm build:libs",
        "pnpm nx serve web"
      ],
      "parallel": false
    }
  }
}
```

### Option 3: Explicit Implicit Dependencies (Most Robust)

**Pros:**
- ✅ Nx knows exact dependencies
- ✅ Better graph visualization
- ✅ Optimal build ordering
- ✅ Works with all Nx features

**Cons:**
- ⚠️ Need to maintain dependency list
- ⚠️ More verbose config

**Implementation:**

Add to each app's `project.json`:

```json
{
  "implicitDependencies": {
    "shared": "*",
    "data": "*",
    "business": "*",
    "trpc": "*",
    "payments": "*",
    "analytics": "*",
    "ui": "*",
    "email": "*"
  },
  "targets": {
    "serve": {
      "dependsOn": ["^build"]
    }
  }
}
```

### Option 4: Agent Helper Script (Quick Fix)

**Pros:**
- ✅ Immediate fix
- ✅ Can be run manually after changes
- ✅ No config changes needed

**Cons:**
- ⚠️ Requires agents to remember to run it
- ⚠️ Doesn't prevent the issue, only fixes it

**Implementation:**

Create `scripts/fix-libs.sh`:

```bash
#!/bin/bash
echo "Building libraries..."
pnpm build:libs
echo "✓ Libraries built successfully"
```

Add to `package.json`:

```json
{
  "scripts": {
    "fix:libs": "pnpm build:libs"
  }
}
```

### Option 5: Use Source Paths (Not Recommended)

**Pros:**
- ✅ No build step needed
- ✅ Instant changes

**Cons:**
- ❌ Breaks Next.js transpilation
- ❌ TypeScript compilation issues
- ❌ Doesn't work with webpack aliases
- ❌ Requires major refactoring

**Why not:** Next.js needs transpiled code, and webpack aliases are already configured for `dist/`.

## Recommended Approach

**Use Option 1 + Option 3 combined:**

1. Add `dependsOn: ["^build"]` to all serve targets
2. Add `implicitDependencies` to all apps
3. Keep `dev:libs` watcher for faster iteration

This ensures:
- ✅ Libs are always built before serving
- ✅ Nx knows the dependency graph
- ✅ Caching works optimally
- ✅ Agents don't need to remember manual steps

## Implementation Checklist

- [ ] Update `apps/web/project.json` - add `dependsOn` to serve
- [ ] Update `apps/funnel/project.json` - add `dependsOn` to serve
- [ ] Update `apps/landing/project.json` - add `dependsOn` to serve
- [ ] Update `apps/admin/project.json` - add `dependsOn` to serve
- [ ] Add `implicitDependencies` to all apps (optional but recommended)
- [ ] Test: `pnpm nx serve web` should build libs automatically
- [ ] Update agent instructions to mention this works automatically

## Testing

After implementation:

```bash
# Clean dist to simulate fresh start
rm -rf dist/libs

# Serve should build libs automatically
pnpm nx serve web

# Should see:
# - Building libraries first
# - Then starting Next.js dev server
# - No "Module not found" errors
```

## Related Documentation

- Nx Dependencies: https://nx.dev/concepts/more-concepts/configuration#dependson
- Nx Implicit Dependencies: https://nx.dev/concepts/more-concepts/configuration#implicitdependencies
- Next.js Monorepo: https://nextjs.org/docs/advanced-features/compiler#monorepo
