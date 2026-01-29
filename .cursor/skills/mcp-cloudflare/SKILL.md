---
name: mcp-cloudflare
description: Uses Cloudflare MCP servers for infrastructure management, R2 storage, Workers, and monitoring. Use when managing Cloudflare resources, debugging Workers, managing R2 buckets, configuring CDN, or when the user mentions Cloudflare operations.
---

# Cloudflare MCP Servers Usage

Complete guide for using Cloudflare MCP servers to manage RYLA infrastructure.

## Quick Start

When using Cloudflare MCP tools:

1. **Identify Server** - Choose the appropriate Cloudflare MCP server (15 available)
2. **Check Auth** - Verify `CLOUDFLARE_API_TOKEN` is set (for authenticated servers)
3. **Use Tools** - Call appropriate tools via natural language
4. **Monitor Results** - Use observability server for debugging

## When to Use

Use Cloudflare MCP tools when you need to:
- Debug and monitor Cloudflare Workers applications
- Manage R2 storage buckets and objects
- Build Workers applications with bindings (R2, KV, D1, etc.)
- Access Cloudflare documentation and reference materials
- Render web pages and take screenshots for testing
- Monitor application performance and logs
- Manage DNS configurations and analytics

## Available Servers (15 Total)

### 1. Observability Server (`cloudflare-observability`)
**URL**: `https://observability.mcp.cloudflare.com/mcp`

Debug and get insight into your application's logs and analytics.

**Use cases:**
- Monitor Workers performance
- Debug application issues
- Analyze log data
- Track request metrics

**Required:** `CLOUDFLARE_API_TOKEN`

### 2. Workers Bindings Server (`cloudflare-bindings`)
**URL**: `https://bindings.mcp.cloudflare.com/mcp`

Build Workers applications with storage, AI, and compute primitives.

**Use cases:**
- Manage R2 buckets and objects
- Configure KV namespaces
- Set up D1 databases
- Manage Workers bindings

**Required:** `CLOUDFLARE_API_TOKEN`

**Relevant for RYLA:**
- R2 storage management
- CDN proxy Workers configuration
- Storage bucket operations

### 3. Documentation Server (`cloudflare-docs`)
**URL**: `https://docs.mcp.cloudflare.com/mcp`

Get up-to-date reference information on Cloudflare services.

**Use cases:**
- Look up API documentation
- Find configuration examples
- Get best practices
- Reference service capabilities

**No authentication required**

### 4. Browser Rendering Server (`cloudflare-browser`)
**URL**: `https://browser.mcp.cloudflare.com/mcp`

Fetch web pages, convert them to markdown, and take screenshots.

**Use cases:**
- Web scraping for testing
- Screenshot generation
- Page content extraction
- E2E testing support

**No authentication required**

### 5. Workers Builds Server (`cloudflare-builds`)
**URL**: `https://builds.mcp.cloudflare.com/mcp`

Get insights and manage your Cloudflare Workers builds.

**Use Cases:**
- Monitor build status
- View build history
- Debug build failures
- Track deployment progress

**Required:** `CLOUDFLARE_API_TOKEN`

### 6-15. Additional Servers

- **Radar** (`cloudflare-radar`) - Internet traffic insights (no auth)
- **Container** (`cloudflare-container`) - Sandbox environments (no auth)
- **Logpush** (`cloudflare-logpush`) - Logpush job health (auth required)
- **AI Gateway** (`cloudflare-ai-gateway`) - AI Gateway logs (auth required)
- **AutoRAG** (`cloudflare-autorag`) - AutoRAG documents (auth required)
- **Audit Logs** (`cloudflare-auditlogs`) - Audit log queries (auth required)
- **DNS Analytics** (`cloudflare-dns-analytics`) - DNS performance (auth required)
- **DEX** (`cloudflare-dex`) - Digital Experience Monitoring (auth required)
- **CASB** (`cloudflare-casb`) - Security misconfigurations (auth required)
- **GraphQL** (`cloudflare-graphql`) - Analytics data (auth required)

## Configuration

### Environment Variables

- `CLOUDFLARE_API_TOKEN` - **Required** for authenticated servers (11 of 15 servers)
  - Get from: [Cloudflare Dashboard → My Profile → API Tokens](https://dash.cloudflare.com/profile/api-tokens)
  - Recommended scopes:
    - `Account:Read`
    - `Zone:Read`
    - `Workers:Read`, `Workers:Edit`
    - `R2:Edit`
    - `Analytics:Read`
    - `Audit Logs:Read`

### Getting a Cloudflare API Token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Click **Create Token**
3. Use **Edit Cloudflare Workers** template or create custom token
4. Add required permissions
5. Save the token securely

## Common Workflows

### Create R2 Bucket

**Using MCP in Cursor:**
```
Create an R2 bucket named ryla-images in Europe (Warsaw) location
```

**Expected Response:**
- Bucket created with name `ryla-images`
- Location set to `waw` (Warsaw)
- Bucket accessible via API

### List R2 Buckets

```
List all R2 buckets in my Cloudflare account
```

### Configure R2 Bucket

```
Configure the ryla-images bucket with public access enabled
```

### Create Worker

```
Create a Cloudflare Worker named ryla-r2-cdn-proxy
```

### Deploy Worker

```
Deploy the ryla-r2-cdn-proxy Worker
```

### View Worker Logs

**Using cloudflare-observability:**
```
Show me the recent logs for ryla-r2-cdn-proxy Worker
```

### Monitor Performance

**Using cloudflare-observability:**
```
Show me performance metrics for ryla-r2-cdn-proxy Worker
```

### Debug R2 Storage Issues

```
1. Use cloudflare-observability to check logs
2. Use cloudflare-bindings to inspect R2 bucket
3. Use cloudflare-docs to verify API usage
```

### Set Up CDN Worker for R2

```
1. Use cloudflare-docs to get Worker template
2. Use cloudflare-bindings to create Worker
3. Use cloudflare-observability to monitor performance
```

## RYLA-Specific Use Cases

### R2 Storage Management

RYLA uses Cloudflare R2 for:
- AI-generated images (base images, character sheets, profile pictures)
- User-generated videos (10-30s HD/4K videos)
- User uploads (base images, reference photos)

**Use bindings server to:**
- Verify bucket configuration
- Check object access
- Monitor storage usage
- Configure CDN settings

### CDN Worker Setup

RYLA may use Workers for:
- R2 CDN proxy
- Custom domain routing
- Advanced caching rules

**Use bindings server to:**
- Deploy CDN Worker
- Configure R2 bindings
- Set up custom domains

## Best Practices

### 1. Use Observability for Debugging

When troubleshooting Workers or R2 issues:
- Check logs via observability server
- Monitor request patterns
- Analyze error rates
- Track performance metrics

### 2. Use Bindings for R2 Management

For R2 storage operations:
- List buckets
- Manage objects
- Configure bucket settings
- Set up CDN Workers

### 3. Use Docs for Reference

Before implementing Cloudflare features:
- Look up API documentation
- Check configuration examples
- Verify best practices
- Understand service limits

### 4. Use Browser for Testing

For web scraping and testing:
- Take screenshots of pages
- Extract page content
- Test CDN delivery
- Verify public URLs

## Error Handling

Common errors:
- "Invalid API token" - Check `CLOUDFLARE_API_TOKEN` is set correctly
- "Insufficient permissions" - Verify token has required scopes
- "Account not found" - Verify account ID is correct
- "Rate limit exceeded" - Wait before retrying

## Security Notes

- Never commit `CLOUDFLARE_API_TOKEN` to version control
- Use environment variables for all sensitive tokens
- Rotate API tokens regularly
- Use least-privilege tokens (only required permissions)
- Store tokens securely (use Infisical)

## Related Resources

- **Cloudflare MCP Server Repository**: https://github.com/cloudflare/mcp-server-cloudflare
- **Cloudflare API Documentation**: https://developers.cloudflare.com/api/
- **Cloudflare Workers Documentation**: https://developers.cloudflare.com/workers/
- **Cloudflare R2 Documentation**: https://developers.cloudflare.com/r2/
- **RYLA Storage Setup**: `docs/ops/STORAGE-SETUP.md`
- **ADR-005**: Cloudflare R2 Storage decision
