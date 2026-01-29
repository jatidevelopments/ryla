# File Watchers Configuration

This guide explains how file watching is configured in the RYLA monorepo and how to avoid the `EMFILE: too many open files` error.

## Problem

When running `pnpm dev:all`, the system starts:

- 5 Next.js apps (web, funnel, landing, admin, api)
- 1 nodemon watcher for libs
- Nx daemon

Each Next.js app runs Watchpack to watch files for hot reload. With 5 apps watching the same monorepo, this can easily exceed macOS's default file descriptor limit (256).

## Solution

### 1. Webpack watchOptions (Applied)

All Next.js apps are configured to ignore heavy directories:

```javascript
// In next.config.js webpack function
if (dev) {
  config.watchOptions = {
    ignored: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/.git/**',
      '**/.nx/**',
    ],
    aggregateTimeout: 300,
    poll: false,
  };
}
```

### 2. Nodemon Configuration (Applied)

The libs watcher ignores test files and build artifacts:

```bash
npx nodemon --watch libs \
  --ext ts,tsx,js,jsx,json \
  --ignore '**/*.spec.ts' \
  --ignore '**/*.test.ts' \
  --ignore '**/__tests__/**' \
  --ignore '**/__mocks__/**' \
  --ignore '**/node_modules/**' \
  --ignore '**/dist/**' \
  --ignore '**/.nx/**' \
  --ignore '**/*.d.ts' \
  --delay 1000ms \
  --exec 'pnpm build:libs:atomic'
```

### 3. Increase OS File Limits (If Still Needed)

**Temporary (current shell only):**

```bash
ulimit -n 4096
```

**Permanent on macOS:**

```bash
# Create or edit /Library/LaunchDaemons/limit.maxfiles.plist
sudo launchctl limit maxfiles 65536 200000

# Or add to your shell profile (~/.zshrc or ~/.bashrc):
ulimit -n 4096
```

**Check current limits:**

```bash
ulimit -n          # soft limit
ulimit -Hn         # hard limit
launchctl limit maxfiles  # system limit
```

### 4. Use Focused Dev Scripts

Instead of `pnpm dev:all`, use focused scripts when possible:

| Script                   | Apps Started          | Use Case                            |
| ------------------------ | --------------------- | ----------------------------------- |
| `pnpm dev:web-api`       | web, api, libs        | Frontend + backend development      |
| `pnpm dev:web-api-admin` | web, api, admin, libs | Admin panel development             |
| `pnpm dev:apps`          | web, landing, libs    | Landing page development            |
| `pnpm dev:web`           | web only              | Frontend only (requires libs built) |

### 5. Polling Mode (Last Resort)

If native watchers still fail, use polling:

```bash
CHOKIDAR_USEPOLLING=true pnpm dev:all
```

**Note:** Polling is slower and uses more CPU. Only use as a last resort.

## Configuration Files

| File                          | Purpose                                    |
| ----------------------------- | ------------------------------------------ |
| `apps/web/next.config.js`     | Web app webpack watchOptions               |
| `apps/funnel/next.config.js`  | Funnel app webpack watchOptions            |
| `apps/landing/next.config.js` | Landing app webpack watchOptions           |
| `apps/admin/next.config.js`   | Admin app webpack watchOptions             |
| `package.json`                | Nodemon configuration in `dev:libs` script |

## Troubleshooting

### Still getting EMFILE errors?

1. **Close other apps** that watch files (IDEs, Docker, etc.)
2. **Increase file limits** (see section 3)
3. **Use focused scripts** (see section 4)
4. **Clear caches:**
   ```bash
   rm -rf apps/*/.next
   rm -rf .nx/cache
   rm -rf dist
   ```

### Watchers not detecting changes?

1. Check that the file is not in an ignored pattern
2. Try restarting the dev server
3. Use polling mode temporarily to debug

## Best Practices

1. **Use focused dev scripts** when not working on all apps
2. **Keep file limits increased** in your shell profile
3. **Don't add new watch patterns** without ignoring build outputs
4. **Close unused terminals** running dev servers
