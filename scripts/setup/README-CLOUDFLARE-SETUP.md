# Cloudflare Infrastructure Setup

Complete setup guide for Cloudflare infrastructure using MCP tools and scripts.

## Quick Start

### 1. Verify Prerequisites

```bash
# Check MCP configuration
bash scripts/setup/verify-cloudflare-mcp.sh
```

### 2. Set Environment Variable

```bash
export CLOUDFLARE_API_TOKEN=your_token_here
```

Get token from: https://dash.cloudflare.com/profile/api-tokens

### 3. Run Setup Script

**Option A: Complete Setup (Recommended - Phases 1-3)**

```bash
bash scripts/setup/cloudflare-complete-setup.sh
```

This automated script handles:
- ✅ Phase 1: R2 Storage Setup (create bucket, deploy CDN Worker)
- ✅ Phase 2: Pages Deployment (create Pages projects)
- ✅ Phase 3: Validation & Monitoring (verify setup, show monitoring commands)

**Option B: API-Based Setup**

```bash
bash scripts/setup/setup-cloudflare-infrastructure.sh
```

This will:
- Verify MCP setup
- Get Cloudflare Account ID
- Create R2 bucket `ryla-images`

### 4. Complete Manual Steps

After running the setup script, complete these manual steps:
- Generating R2 API tokens (Dashboard)
- Configuring Pages build settings (Dashboard)
- Connecting GitHub repositories for auto-deployments
- Setting custom domains

## Detailed Guides

- [Cloudflare Setup Index](../../docs/ops/CLOUDFLARE-SETUP-INDEX.md) - Complete index
- [MCP Usage Guide](../../docs/ops/CLOUDFLARE-MCP-USAGE.md) - Using MCP tools
- [R2 Setup](../../docs/ops/CLOUDFLARE-R2-SETUP.md) - R2 bucket setup
- [CDN Worker Setup](../../docs/ops/CLOUDFLARE-CDN-WORKER.md) - Worker deployment
- [Pages Setup](../../docs/ops/CLOUDFLARE-PAGES-SETUP.md) - Pages projects

## Scripts

| Script | Purpose |
|--------|---------|
| `verify-cloudflare-mcp.sh` | Verify MCP configuration and API token |
| `setup-cloudflare-infrastructure.sh` | Automated infrastructure setup (API-based) |
| `cloudflare-complete-setup.sh` | **Complete setup (Phases 1-3) using Wrangler CLI** |
| `deploy-cdn-worker.sh` | Deploy CDN Worker to Cloudflare |

## MCP Tools

Use Cloudflare MCP tools in Cursor for:
- Creating R2 buckets
- Managing Workers
- Monitoring performance
- Getting documentation

See [MCP Usage Guide](../../docs/ops/CLOUDFLARE-MCP-USAGE.md) for examples.
