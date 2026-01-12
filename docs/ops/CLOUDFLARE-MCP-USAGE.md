# Cloudflare MCP Usage Guide

Complete guide for using Cloudflare MCP tools to manage RYLA infrastructure.

## Overview

Cloudflare MCP servers provide programmatic access to Cloudflare services through Cursor IDE, allowing you to manage infrastructure using natural language.

## Available MCP Servers

### 1. cloudflare-bindings
**Purpose**: Manage R2 buckets, Workers, KV, D1, and bindings

**Use Cases:**
- Create and manage R2 buckets
- Configure Workers and bindings
- Set up KV namespaces
- Manage D1 databases

### 2. cloudflare-observability
**Purpose**: Debug and monitor Workers, view logs and analytics

**Use Cases:**
- View Worker logs
- Monitor performance metrics
- Debug application issues
- Analyze request patterns

### 3. cloudflare-docs
**Purpose**: Access Cloudflare documentation and reference materials

**Use Cases:**
- Look up API documentation
- Find configuration examples
- Get best practices
- Reference service capabilities

### 4. cloudflare-builds
**Purpose**: Manage Workers builds and get insights

**Use Cases:**
- Monitor build status
- View build history
- Debug build failures

## Prerequisites

1. **Cloudflare Account**
   - Sign up: https://dash.cloudflare.com
   - Add payment method (for R2)

2. **API Token**
   - Get from: https://dash.cloudflare.com/profile/api-tokens
   - Required permissions:
     - Account: Read
     - Zone: Read
     - Workers: Edit
     - R2: Edit
     - Pages: Edit

3. **MCP Configuration**
   - Verify `.cursor/mcp.json` has Cloudflare servers configured
   - Set `CLOUDFLARE_API_TOKEN` environment variable

## Common Tasks

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

```
Show me the recent logs for ryla-r2-cdn-proxy Worker
```

### Monitor Performance

```
Show me performance metrics for ryla-r2-cdn-proxy Worker
```

## R2 Management

### Create Bucket

**MCP Command:**
```
Create an R2 bucket named ryla-images in Europe (Warsaw)
```

**Alternative (CLI):**
```bash
wrangler r2 bucket create ryla-images
```

### List Buckets

**MCP Command:**
```
List all my R2 buckets
```

### Upload Object

**MCP Command:**
```
Upload a file to the ryla-images bucket with key test-image.jpg
```

**Note**: May need to use API or CLI for file uploads

### Get Object

**MCP Command:**
```
Get the object with key test-image.jpg from ryla-images bucket
```

### Delete Object

**MCP Command:**
```
Delete the object with key test-image.jpg from ryla-images bucket
```

## Worker Management

### Create Worker

**MCP Command:**
```
Create a new Cloudflare Worker named ryla-r2-cdn-proxy
```

### Configure Worker Bindings

**MCP Command:**
```
Bind the ryla-images R2 bucket to the ryla-r2-cdn-proxy Worker
```

### Deploy Worker

**MCP Command:**
```
Deploy the ryla-r2-cdn-proxy Worker
```

**Alternative (CLI):**
```bash
cd workers/ryla-r2-cdn-proxy
wrangler deploy
```

### View Worker Logs

**MCP Command:**
```
Show me the last 100 log entries for ryla-r2-cdn-proxy Worker
```

### Monitor Worker

**MCP Command:**
```
Show me performance metrics for ryla-r2-cdn-proxy Worker
```

## Pages Management

**Note**: Cloudflare Pages projects may need to be created via Dashboard or CLI, as MCP support may be limited.

### Create Pages Project

**Via Dashboard (Recommended):**
1. Go to: Workers & Pages → Create → Pages project
2. Connect GitHub repository
3. Configure build settings

**Via CLI:**
```bash
wrangler pages project create ryla-landing
```

### Deploy to Pages

**Via CLI:**
```bash
wrangler pages deploy dist/apps/landing/.next --project-name=ryla-landing
```

## Monitoring & Debugging

### View Logs

**Using cloudflare-observability MCP:**
```
Show me the logs for ryla-r2-cdn-proxy Worker from the last hour
```

### Check Performance

**Using cloudflare-observability MCP:**
```
Show me performance metrics for ryla-r2-cdn-proxy Worker
```

### Debug Issues

**Using cloudflare-observability MCP:**
```
Show me error logs for ryla-r2-cdn-proxy Worker
```

## Documentation Lookup

### Get API Documentation

**Using cloudflare-docs MCP:**
```
Show me the R2 API documentation
```

### Find Examples

**Using cloudflare-docs MCP:**
```
Show me examples of R2 bucket configuration
```

### Best Practices

**Using cloudflare-docs MCP:**
```
What are the best practices for R2 storage?
```

## Troubleshooting

### MCP Not Working

1. **Check MCP Configuration**
   - Verify `.cursor/mcp.json` exists
   - Check Cloudflare servers are configured
   - Verify `CLOUDFLARE_API_TOKEN` is set

2. **Test API Token**
   ```bash
   bash scripts/setup/verify-cloudflare-mcp.sh
   ```

3. **Check Permissions**
   - Verify token has required permissions
   - Regenerate token if needed

### API Errors

1. **Invalid Token**
   - Regenerate API token
   - Verify token is set correctly

2. **Permission Denied**
   - Check token permissions
   - Verify account access

3. **Rate Limits**
   - Wait before retrying
   - Check Cloudflare dashboard for limits

## Best Practices

### 1. Use MCP for Common Tasks

- Creating resources
- Querying status
- Getting documentation
- Monitoring performance

### 2. Use CLI for Complex Operations

- File uploads
- Complex deployments
- Bulk operations

### 3. Use Dashboard for Setup

- Initial configuration
- Domain setup
- Token generation
- Visual verification

### 4. Combine Methods

- MCP for quick queries
- CLI for automation
- Dashboard for verification

## Example Workflows

### Complete R2 Setup

1. **Create Bucket (MCP)**
   ```
   Create an R2 bucket named ryla-images in Europe (Warsaw)
   ```

2. **Generate Tokens (Dashboard)**
   - Go to R2 → Manage R2 API Tokens
   - Create token with Read & Write permissions

3. **Configure Bucket (MCP)**
   ```
   Configure ryla-images bucket settings
   ```

4. **Verify Setup (MCP)**
   ```
   Show me information about the ryla-images bucket
   ```

### Deploy CDN Worker

1. **Create Worker (MCP or CLI)**
   ```
   Create a Cloudflare Worker named ryla-r2-cdn-proxy
   ```

2. **Deploy Worker (CLI)**
   ```bash
   bash scripts/setup/deploy-cdn-worker.sh
   ```

3. **Monitor Deployment (MCP)**
   ```
   Show me the deployment status for ryla-r2-cdn-proxy Worker
   ```

4. **View Logs (MCP)**
   ```
   Show me recent logs for ryla-r2-cdn-proxy Worker
   ```

## Related Documentation

- [Cloudflare MCP Rules](../../.cursor/rules/mcp-cloudflare.mdc)
- [R2 Setup Guide](./CLOUDFLARE-R2-SETUP.md)
- [CDN Worker Setup](./CLOUDFLARE-CDN-WORKER.md)
- [Pages Setup Guide](./CLOUDFLARE-PAGES-SETUP.md)
- [Storage Setup Guide](./STORAGE-SETUP.md)
