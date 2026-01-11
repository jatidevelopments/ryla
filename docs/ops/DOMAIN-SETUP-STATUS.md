# Domain Setup Status

## ✅ Domains Successfully Added

- ✅ `www.ryla.ai` → `ryla-landing-prod`
- ✅ `end.ryla.ai` → `ryla-api-prod`

## ⚠️ Domains Already Configured (on other apps)

These domains are already configured on different apps (likely the old apps without `-prod` suffix):

- ⚠️ `ryla.ai` - Already exists (may be on old `ryla-landing` app)
- ⚠️ `goviral.ryla.ai` - Already exists (may be on old `funnel-v3-adult` app)
- ⚠️ `app.ryla.ai` - Already exists (may be on old `ryla-web` app)

## Options

### Option 1: Remove from old apps and add to new ones

```bash
# Remove from old apps
flyctl certs remove ryla.ai --app ryla-landing
flyctl certs remove goviral.ryla.ai --app funnel-v3-adult
flyctl certs remove app.ryla.ai --app ryla-web

# Add to new apps
flyctl certs add ryla.ai --app ryla-landing-prod
flyctl certs add goviral.ryla.ai --app ryla-funnel-prod
flyctl certs add app.ryla.ai --app ryla-web-prod
```

### Option 2: Keep old apps and use them

If the old apps (`ryla-landing`, `funnel-v3-adult`, `ryla-web`) are still needed, you can:
- Keep domains on old apps
- Or delete old apps if not needed: `flyctl apps destroy <app-name>`

## Check Current Domain Configuration

```bash
# Check which apps have which domains
flyctl certs list --app ryla-landing-prod
flyctl certs list --app ryla-funnel-prod
flyctl certs list --app ryla-web-prod
flyctl certs list --app ryla-api-prod

# Check old apps (if they exist)
flyctl certs list --app ryla-landing 2>&1
flyctl certs list --app funnel-v3-adult 2>&1
flyctl certs list --app ryla-web 2>&1
```

## DNS Configuration Required

For each domain that was successfully added, you need to configure DNS records at your domain registrar. Fly.io provides instructions:

```bash
# Get DNS instructions
flyctl certs list --app ryla-landing-prod
flyctl certs list --app ryla-api-prod
```

Typically you'll need to add:
- `CNAME _acme-challenge.<domain> => <domain>.xxxxx.flydns.net`

## Next Steps

1. **Decide on domain strategy** - Remove from old apps or keep them
2. **Configure DNS records** - Add CNAME records at your domain registrar
3. **Wait for certificate validation** - Fly.io will automatically validate once DNS is configured
4. **Verify certificates** - `flyctl certs check <domain> --app <app-name>`

