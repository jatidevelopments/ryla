# Cloudflare Setup - Quick Start

Fastest path to get Cloudflare infrastructure running.

## ⚡ 5-Minute Setup

### 1. Get API Token (2 minutes)

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click "Create Token"
3. Use "Edit Cloudflare Workers" template
4. Copy token
5. Set: `export CLOUDFLARE_API_TOKEN=your_token`

### 2. Verify Setup (30 seconds)

```bash
bash scripts/setup/verify-cloudflare-mcp.sh
```

### 3. Create R2 Bucket (1 minute)

**In Cursor (using MCP):**
```
Create an R2 bucket named ryla-images in Europe (Warsaw) location
```

**Or via script:**
```bash
bash scripts/setup/setup-cloudflare-infrastructure.sh
```

### 4. Generate R2 Tokens (1 minute)

1. Go to: R2 → Manage R2 API Tokens
2. Create token with "Object Read & Write"
3. Save Access Key ID and Secret Access Key

### 5. Deploy Worker (30 seconds)

```bash
bash scripts/setup/deploy-cdn-worker.sh
```

## 📋 What's Next?

After quick setup, complete:
- [ ] Create Cloudflare Pages projects (see [Pages Setup](./CLOUDFLARE-PAGES-SETUP.md))
- [ ] Configure custom domains
- [ ] Set environment variables
- [ ] Update Fly.io secrets

See [Setup Checklist](./CLOUDFLARE-SETUP-CHECKLIST.md) for complete steps.

## 🆘 Need Help?

- **Token issues**: See [Next Steps](./CLOUDFLARE-SETUP-NEXT-STEPS.md)
- **MCP not working**: Check `.cursor/mcp.json` exists
- **Build failures**: See [Pages Setup](./CLOUDFLARE-PAGES-SETUP.md) troubleshooting
