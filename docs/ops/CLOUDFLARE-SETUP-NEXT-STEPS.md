# Cloudflare Setup - Next Steps

## Current Status

✅ **Infrastructure files created** - All scripts, workers, and documentation ready  
⏳ **API Token needed** - Set `CLOUDFLARE_API_TOKEN` to proceed  
⏳ **R2 Bucket** - Ready to create  
⏳ **CDN Worker** - Ready to deploy  
⏳ **Cloudflare Pages** - Ready to create  

## Step-by-Step Setup

### Step 1: Get Cloudflare API Token

1. **Go to Cloudflare Dashboard**
   - Navigate to: https://dash.cloudflare.com/profile/api-tokens

2. **Create API Token**
   - Click "Create Token"
   - Use "Edit Cloudflare Workers" template OR create custom token
   - Required permissions:
     - ✅ Account: Read
     - ✅ Zone: Read
     - ✅ Workers: Edit
     - ✅ R2: Edit
     - ✅ Pages: Edit

3. **Save Token**
   - Copy the token (cannot be retrieved later)
   - Store securely

4. **Set Environment Variable**
   ```bash
   export CLOUDFLARE_API_TOKEN=your_token_here
   ```
   
   Or add to your shell profile (`~/.zshrc` or `~/.bashrc`):
   ```bash
   echo 'export CLOUDFLARE_API_TOKEN=your_token_here' >> ~/.zshrc
   source ~/.zshrc
   ```

### Step 2: Verify MCP Setup

```bash
bash scripts/setup/verify-cloudflare-mcp.sh
```

**Expected Output:**
```
✅ CLOUDFLARE_API_TOKEN is set
✅ MCP config found
✅ cloudflare-bindings MCP server configured
✅ API token is valid
   Account ID: abc123...
```

### Step 3: Create R2 Bucket

**Option A: Using MCP Tools (in Cursor)**

Open Cursor and use the Cloudflare MCP tools:
```
Create an R2 bucket named ryla-images in Europe (Warsaw) location
```

**Option B: Using Setup Script**

```bash
bash scripts/setup/setup-cloudflare-infrastructure.sh
```

**Option C: Using Cloudflare Dashboard**

1. Go to: https://dash.cloudflare.com → R2 → Create bucket
2. Name: `ryla-images`
3. Location: `Europe (Warsaw)` or closest to users
4. Click "Create bucket"

### Step 4: Generate R2 API Tokens

**Must be done via Cloudflare Dashboard:**

1. Go to: R2 → Manage R2 API Tokens
2. Click "Create API Token"
3. Name: `ryla-api-token`
4. Permissions: **Object Read & Write**
5. TTL: No expiration (or set as needed)
6. **Save credentials:**
   - Access Key ID: `abc123def456...`
   - Secret Access Key: `xyz789...`
   - ⚠️ **Cannot be retrieved later - save securely**

### Step 5: Get Cloudflare Account ID

**Via Dashboard:**
1. Go to: Cloudflare Dashboard
2. Right sidebar → Account ID (under your account name)
3. Copy Account ID

**Via API (if token is set):**
```bash
curl -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
  https://api.cloudflare.com/client/v4/accounts | jq -r '.result[0].id'
```

### Step 6: Deploy CDN Worker

```bash
bash scripts/setup/deploy-cdn-worker.sh
```

**Or manually:**
```bash
cd workers/ryla-r2-cdn-proxy
wrangler login
wrangler deploy
```

**Expected Output:**
```
✅ Worker deployed successfully!
Worker URL: https://ryla-r2-cdn-proxy.<account>.workers.dev
```

### Step 7: Create Cloudflare Pages Projects

**For each app (landing, funnel, web):**

1. **Go to Cloudflare Dashboard**
   - Navigate to: Workers & Pages → Create → Pages project

2. **Connect GitHub**
   - Authorize Cloudflare to access GitHub
   - Select repository: `jatidevelopments/ryla`

3. **Configure Project**

   **Landing:**
   - Project name: `ryla-landing`
   - Production branch: `main`
   - Build command: `pnpm install && pnpm nx build landing --configuration=production`
   - Output directory: `dist/apps/landing/.next`
   - Root directory: `/`
   - Node version: `20`
   - Framework preset: `Next.js`

   **Funnel:**
   - Project name: `ryla-funnel`
   - Build command: `pnpm install && pnpm nx build funnel --configuration=production`
   - Output directory: `dist/apps/funnel/.next`
   - (Same other settings as landing)

   **Web:**
   - Project name: `ryla-web`
   - Build command: `pnpm install && pnpm nx build web --configuration=production`
   - Output directory: `dist/apps/web/.next`
   - (Same other settings as landing)

4. **Set Environment Variables**

   See [Pages Setup Guide](./CLOUDFLARE-PAGES-SETUP.md) for complete list.

   **Landing:**
   ```
   NEXT_PUBLIC_SITE_URL=https://www.ryla.ai
   NEXT_PUBLIC_CDN_URL=https://cdn.ryla.ai
   NEXT_PUBLIC_DEBUG_CDN=false
   ```

   **Funnel:**
   ```
   NEXT_PUBLIC_SITE_URL=https://goviral.ryla.ai
   NEXT_PUBLIC_CDN_URL=https://cdn.ryla.ai
   NEXT_PUBLIC_DEBUG_CDN=false
   NEXT_PUBLIC_API_BASE_URL=https://end.ryla.ai
   NEXT_PUBLIC_FINBY_PAYMENT_REDIRECT=/
   ```

   **Web:**
   ```
   NEXT_PUBLIC_SITE_URL=https://app.ryla.ai
   NEXT_PUBLIC_API_URL=https://end.ryla.ai
   NEXT_PUBLIC_CDN_URL=https://cdn.ryla.ai
   NEXT_PUBLIC_POSTHOG_KEY=<your-posthog-key>
   NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
   NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url>
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-supabase-key>
   ```

5. **Configure Custom Domains**

   **Landing:**
   - Add: `www.ryla.ai`
   - Add: `ryla.ai` (redirects to www)

   **Funnel:**
   - Add: `goviral.ryla.ai`

   **Web:**
   - Add: `app.ryla.ai`

   Cloudflare will auto-provision SSL certificates.

### Step 8: Update Fly.io API Secrets

```bash
flyctl secrets set --app ryla-api-prod \
  AWS_S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com \
  AWS_S3_ACCESS_KEY=<r2_access_key_id> \
  AWS_S3_SECRET_KEY=<r2_secret_access_key> \
  AWS_S3_BUCKET_NAME=ryla-images \
  AWS_S3_REGION=auto \
  AWS_S3_FORCE_PATH_STYLE=false
```

**Replace:**
- `<ACCOUNT_ID>` with your Cloudflare Account ID
- `<r2_access_key_id>` with R2 Access Key ID
- `<r2_secret_access_key>` with R2 Secret Access Key

### Step 9: Test Everything

1. **Test R2 Bucket**
   ```bash
   # Upload test file (via API if implemented)
   # Or use Cloudflare Dashboard
   ```

2. **Test CDN Worker**
   ```bash
   curl -I https://ryla-r2-cdn-proxy.<account>.workers.dev/test-image.jpg
   ```

3. **Test Pages Deployment**
   - Check Cloudflare Dashboard → Deployments
   - Verify build succeeded
   - Test custom domains

4. **Test Integration**
   - Verify frontend apps can access R2/CDN
   - Test image loading
   - Test API integration

## Quick Reference

### MCP Commands (in Cursor)

```
Create an R2 bucket named ryla-images in Europe (Warsaw)
List all R2 buckets in my Cloudflare account
Deploy the ryla-r2-cdn-proxy Worker
Show me logs for ryla-r2-cdn-proxy Worker
```

### Scripts

```bash
# Verify setup
bash scripts/setup/verify-cloudflare-mcp.sh

# Setup infrastructure
bash scripts/setup/setup-cloudflare-infrastructure.sh

# Deploy worker
bash scripts/setup/deploy-cdn-worker.sh
```

### Important URLs

- **Cloudflare Dashboard**: https://dash.cloudflare.com
- **API Tokens**: https://dash.cloudflare.com/profile/api-tokens
- **R2 Storage**: https://dash.cloudflare.com → R2
- **Workers & Pages**: https://dash.cloudflare.com → Workers & Pages

## Troubleshooting

### Token Not Working

1. Verify token is set: `echo $CLOUDFLARE_API_TOKEN`
2. Check token permissions in Dashboard
3. Regenerate token if needed

### MCP Not Connecting

1. Check `.cursor/mcp.json` exists
2. Verify Cloudflare servers are configured
3. Restart Cursor
4. Check MCP logs in Cursor

### Build Failures

1. Check build logs in Cloudflare Dashboard
2. Verify build command is correct
3. Check output directory exists
4. Verify environment variables are set

## Support

- **Documentation**: See `docs/ops/CLOUDFLARE-*.md` files
- **MCP Usage**: `docs/ops/CLOUDFLARE-MCP-USAGE.md`
- **Cloudflare Docs**: https://developers.cloudflare.com/
