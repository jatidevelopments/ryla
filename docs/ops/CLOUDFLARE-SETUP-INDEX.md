# Cloudflare Infrastructure Setup Index

Complete index of Cloudflare setup guides and documentation for RYLA.

## Quick Start

1. **Get API Token**
   - Go to: https://dash.cloudflare.com/profile/api-tokens
   - Create token with required permissions
   - Set: `export CLOUDFLARE_API_TOKEN=your_token`

2. **Verify MCP Setup**
   ```bash
   bash scripts/setup/verify-cloudflare-mcp.sh
   ```

3. **Run Infrastructure Setup**
   ```bash
   bash scripts/setup/setup-cloudflare-infrastructure.sh
   ```

4. **Follow Detailed Guides**
   - See [Setup Checklist](./CLOUDFLARE-SETUP-CHECKLIST.md) for step-by-step
   - See guides below for each component

## Setup Guides

### Getting Started

| Guide | Purpose | Status |
|-------|---------|--------|
| [Setup Checklist](./CLOUDFLARE-SETUP-CHECKLIST.md) | Step-by-step setup checklist | ✅ Complete |
| [Next Steps](./CLOUDFLARE-SETUP-NEXT-STEPS.md) | Immediate next steps guide | ✅ Complete |
| [Setup Summary](./CLOUDFLARE-SETUP-SUMMARY.md) | Implementation summary | ✅ Complete |

### Core Infrastructure

| Guide | Purpose | Status |
|-------|---------|--------|
| [Cloudflare MCP Usage](./CLOUDFLARE-MCP-USAGE.md) | Using MCP tools for Cloudflare management | ✅ Complete |
| [R2 Setup via MCP](./CLOUDFLARE-R2-SETUP.md) | R2 bucket creation and configuration | ✅ Complete |
| [CDN Worker Setup](./CLOUDFLARE-CDN-WORKER.md) | CDN Worker for R2 proxy | ✅ Complete |
| [Pages Setup](./CLOUDFLARE-PAGES-SETUP.md) | Cloudflare Pages projects | ✅ Complete |

### Storage & CDN

| Guide | Purpose | Status |
|-------|---------|--------|
| [Storage Setup](./STORAGE-SETUP.md) | Complete R2 storage guide | ✅ Updated |
| [ADR-005: R2 Decision](../decisions/ADR-005-cloudflare-r2-storage.md) | Architecture decision | ✅ Complete |

### Comparison & Analysis

| Guide | Purpose | Status |
|-------|---------|--------|
| [Cloudflare vs Fly.io](./CLOUDFLARE-VS-FLY-COMPARISON.md) | Hosting comparison | ✅ Complete |
| [Performance Analysis](./CLOUDFLARE-PAGES-PERFORMANCE-ANALYSIS.md) | Performance & UX analysis | ✅ Complete |

## Setup Scripts

| Script | Purpose | Location |
|--------|---------|----------|
| `verify-cloudflare-mcp.sh` | Verify MCP configuration | `scripts/setup/` |
| `setup-cloudflare-infrastructure.sh` | Automated infrastructure setup | `scripts/setup/` |
| `deploy-cdn-worker.sh` | Deploy CDN Worker | `scripts/setup/` |

## Infrastructure Components

### 1. R2 Storage

**Bucket**: `ryla-images`  
**Location**: Europe (Warsaw)  
**Purpose**: Images, videos, user uploads

**Setup:**
- [R2 Setup Guide](./CLOUDFLARE-R2-SETUP.md)
- [Storage Setup Guide](./STORAGE-SETUP.md)

### 2. CDN Worker

**Worker**: `ryla-r2-cdn-proxy`  
**Domain**: `cdn.ryla.ai` (optional)  
**Purpose**: Proxy R2 with custom domain and caching

**Setup:**
- [CDN Worker Setup](./CLOUDFLARE-CDN-WORKER.md)
- Worker code: `workers/ryla-r2-cdn-proxy/`

### 3. Cloudflare Pages

**Projects:**
- `ryla-landing` → `www.ryla.ai` / `ryla.ai`
- `ryla-funnel` → `goviral.ryla.ai`
- `ryla-web` → `app.ryla.ai`

**Setup:**
- [Pages Setup Guide](./CLOUDFLARE-PAGES-SETUP.md)
- GitHub Actions: `.github/workflows/deploy-cloudflare-pages.yml`

## Setup Checklist

### Phase 1: Prerequisites
- [ ] Cloudflare account created
- [ ] API token generated with required permissions
- [ ] MCP servers configured in `.cursor/mcp.json`
- [ ] `CLOUDFLARE_API_TOKEN` environment variable set

### Phase 2: R2 Storage
- [ ] R2 bucket `ryla-images` created
- [ ] R2 API tokens generated
- [ ] Bucket configured (public or private)
- [ ] Environment variables set for API app

### Phase 3: CDN Worker
- [ ] Worker code created (`workers/ryla-r2-cdn-proxy/`)
- [ ] Worker deployed to Cloudflare
- [ ] R2 bucket bound to Worker
- [ ] Custom domain configured (optional)

### Phase 4: Cloudflare Pages
- [ ] Pages project created for landing
- [ ] Pages project created for funnel
- [ ] Pages project created for web
- [ ] Custom domains configured
- [ ] Environment variables set
- [ ] Build settings configured

### Phase 5: Testing
- [ ] R2 bucket accessible
- [ ] CDN Worker working
- [ ] Pages projects deploying
- [ ] Custom domains resolving
- [ ] Integration tested

## MCP Usage

### Quick Commands

**R2 Management:**
```
Create an R2 bucket named ryla-images in Europe (Warsaw)
List all R2 buckets in my Cloudflare account
Configure ryla-images bucket with public access
```

**Worker Management:**
```
Create a Cloudflare Worker named ryla-r2-cdn-proxy
Deploy the ryla-r2-cdn-proxy Worker
Show me logs for ryla-r2-cdn-proxy Worker
```

**Monitoring:**
```
Show me performance metrics for ryla-r2-cdn-proxy Worker
Show me error logs for ryla-r2-cdn-proxy Worker
```

See [Cloudflare MCP Usage Guide](./CLOUDFLARE-MCP-USAGE.md) for complete reference.

## Cost Summary

| Component | Monthly Cost | Notes |
|-----------|--------------|-------|
| **R2 Storage** | $1.50 | 100GB storage |
| **R2 Egress** | $0 | Zero egress fees ✅ |
| **CDN Worker** | $5-8 | 10-30M requests/month |
| **Cloudflare Pages** | $0 | Free tier (unlimited) |
| **Total** | **$6.50-9.50/mo** | vs $44-70/mo on Fly.io |

**Savings**: 67-85% cost reduction

## Next Steps

1. **Complete Setup**
   - Run setup scripts
   - Follow detailed guides
   - Test each component

2. **Migrate Frontend Apps**
   - Move landing, funnel, web to Cloudflare Pages
   - Update CI/CD workflows
   - Monitor performance

3. **Optimize**
   - Tune CDN caching
   - Optimize images
   - Monitor costs

## Support

- **Cloudflare Docs**: https://developers.cloudflare.com/
- **MCP Documentation**: `.cursor/rules/mcp-cloudflare.mdc`
- **Setup Issues**: Check troubleshooting sections in each guide
