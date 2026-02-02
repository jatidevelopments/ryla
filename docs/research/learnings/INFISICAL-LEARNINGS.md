# Infisical Learnings

## 2026-02-02: Multiple --path Flag Behavior

### Issue

When running apps locally using `pnpm dev:all`, the web app was failing JWT token verification with error:

```
[tRPC Context] JWT_ACCESS_SECRET not set - using default "secret"
[tRPC Context] Token verification failed: invalid signature
```

### Root Cause

**Infisical CLI with multiple `--path` flags only uses the LAST path, not all paths combined.**

The `dev:web` script was using:

```bash
infisical run --path=/apps/web --path=/shared --env=dev -- pnpm nx serve web
```

This means only `/shared` secrets were loaded, ignoring `/apps/web` entirely.

### Discovery Process

1. Verified `JWT_ACCESS_SECRET` exists in Infisical at `/apps/web`
2. Tested single path - works: `infisical run --path=/apps/web -- sh -c 'echo $JWT_ACCESS_SECRET'`
3. Tested multiple paths - fails: `infisical run --path=/apps/web --path=/shared -- sh -c 'echo $JWT_ACCESS_SECRET'` (empty output)
4. Confirmed with export: `infisical export --path=/apps/web --path=/shared` only shows `/shared` secrets

### Solution

Move shared secrets (like `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`) to `/shared` path:

```bash
infisical secrets set JWT_ACCESS_SECRET='value' --path=/shared --env=dev
infisical secrets set JWT_REFRESH_SECRET='value' --path=/shared --env=dev
```

### Prevention

1. **Always put shared secrets in `/shared`** - Any secret needed by multiple apps or used with multi-path commands
2. **Test secret injection** - Verify with `infisical run --path=... -- sh -c 'echo $SECRET_NAME'`
3. **Document path dependencies** - Clear documentation about which secrets must be in which paths

### Documentation Updated

- `.cursor/rules/infisical.mdc` - Added critical warning and troubleshooting section
- `.cursor/skills/infisical-setup/SKILL.md` - Added critical section and troubleshooting

### Related

- Issue appeared because `JWT_ACCESS_SECRET` was in `/apps/web` but command used `/shared` as last path
- Same fix needed for `JWT_REFRESH_SECRET`
- This behavior may be a bug or undocumented feature in Infisical CLI
