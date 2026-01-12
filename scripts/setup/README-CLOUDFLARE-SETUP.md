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

```bash
bash scripts/setup/setup-cloudflare-infrastructure.sh
```

This will:
- Verify MCP setup
- Get Cloudflare Account ID
- Create R2 bucket `ryla-images`

### 4. Complete Manual Steps

The script will guide you through:
- Generating R2 API tokens (Dashboard)
- Deploying CDN Worker
- Creating Cloudflare Pages projects

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
| `setup-cloudflare-infrastructure.sh` | Automated infrastructure setup |
| `deploy-cdn-worker.sh` | Deploy CDN Worker to Cloudflare |

## MCP Tools

Use Cloudflare MCP tools in Cursor for:
- Creating R2 buckets
- Managing Workers
- Monitoring performance
- Getting documentation

See [MCP Usage Guide](../../docs/ops/CLOUDFLARE-MCP-USAGE.md) for examples.
