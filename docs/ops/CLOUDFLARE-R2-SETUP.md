# Cloudflare R2 Setup via MCP

Guide for setting up R2 storage using Cloudflare MCP tools.

## Overview

RYLA uses Cloudflare R2 for object storage (images, videos, user uploads) with zero egress fees.

**Bucket Name**: `ryla-images`

## Prerequisites

1. Cloudflare account with R2 enabled
2. Cloudflare API token with R2:Edit permission
3. Cloudflare MCP servers configured (see `.cursor/mcp.json`)
4. `CLOUDFLARE_API_TOKEN` environment variable set

## Setup Methods

### Method 1: Cloudflare MCP (Recommended)

Use Cloudflare MCP tools in Cursor to create and manage R2 buckets.

**Available MCP Tools:**
- `cloudflare-bindings` - Manage R2 buckets and bindings

**Steps:**
1. Open Cursor with Cloudflare MCP configured
2. Use MCP tools to create R2 bucket
3. Configure bucket settings
4. Generate API tokens (may need Dashboard)

### Method 2: Cloudflare Dashboard

1. **Go to R2 Dashboard**
   - Navigate to: R2 → Create bucket

2. **Create Bucket**
   - Name: `ryla-images`
   - Location: `Europe (Warsaw)` or closest to users
   - Click "Create bucket"

3. **Generate API Tokens**
   - Go to: R2 → Manage R2 API Tokens
   - Click "Create API Token"
   - Permissions: Object Read & Write
   - Save: Access Key ID and Secret Access Key

### Method 3: Wrangler CLI

```bash
# Install wrangler
npm install -g wrangler

# Login
wrangler login

# Create bucket
wrangler r2 bucket create ryla-images

# List buckets
wrangler r2 bucket list
```

## Bucket Configuration

### Location

Choose location closest to your users:
- **Europe (Warsaw)**: Good for EU users
- **US East**: Good for US users
- **Asia Pacific**: Good for Asian users

**Recommendation**: `Europe (Warsaw)` (matches Fly.io region: Frankfurt)

### Public Access

**Option A: Public Bucket (Simple)**
- Enable public access in bucket settings
- Public URL: `https://pub-<hash>.r2.dev`
- CDN caching automatic
- No Worker needed

**Option B: Private Bucket + Worker (Recommended)**
- Keep bucket private
- Use CDN Worker for access
- Custom domain support
- Better control

See [CDN Worker Setup](./CLOUDFLARE-CDN-WORKER.md) for Worker configuration.

## API Token Setup

### Generate Tokens

1. **Go to R2 Dashboard**
   - Navigate to: R2 → Manage R2 API Tokens

2. **Create Token**
   - Click "Create API Token"
   - Name: `ryla-api-token`
   - Permissions: Object Read & Write
   - TTL: No expiration (or set expiration)

3. **Save Credentials**
   - Access Key ID: `abc123def456...`
   - Secret Access Key: `xyz789...`
   - **Store securely** (cannot be retrieved later)

### Get Account ID

1. **Cloudflare Dashboard**
   - Right sidebar → Account ID
   - Copy Account ID

2. **Use in Endpoint**
   - Endpoint: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`

## Environment Variables

### For API App (Fly.io)

```bash
flyctl secrets set --app ryla-api-prod \
  AWS_S3_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com \
  AWS_S3_ACCESS_KEY=<r2_access_key_id> \
  AWS_S3_SECRET_KEY=<r2_secret_access_key> \
  AWS_S3_BUCKET_NAME=ryla-images \
  AWS_S3_REGION=auto \
  AWS_S3_FORCE_PATH_STYLE=false
```

### For Local Development

```bash
# .env.local
AWS_S3_ENDPOINT=http://localhost:9000  # MinIO
AWS_S3_ACCESS_KEY=ryla_minio
AWS_S3_SECRET_KEY=ryla_minio_secret
AWS_S3_BUCKET_NAME=ryla-images
AWS_S3_REGION=us-east-1
AWS_S3_FORCE_PATH_STYLE=true
```

## Testing

### Upload Test File

```bash
# Via API (if implemented)
curl -X POST https://end.ryla.ai/api/images/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@test-image.jpg"

# Via AWS SDK (in code)
# See apps/api/src/... for implementation
```

### Access Test File

**Public Bucket:**
```bash
curl https://pub-<hash>.r2.dev/test-image.jpg
```

**Via Worker:**
```bash
curl https://cdn.ryla.ai/test-image.jpg
```

### Verify CDN Headers

```bash
curl -I https://cdn.ryla.ai/test-image.jpg

# Should return:
# HTTP/2 200
# Content-Type: image/jpeg
# Cache-Control: public, max-age=31536000, immutable
# CF-Cache-Status: HIT (if cached)
```

## MCP Usage Examples

### List R2 Buckets

Use `cloudflare-bindings` MCP server:
```
List all R2 buckets in my Cloudflare account
```

### Create R2 Bucket

```
Create an R2 bucket named ryla-images in Europe (Warsaw) location
```

### Configure Bucket

```
Configure ryla-images bucket with public access enabled
```

### Get Bucket Info

```
Get information about the ryla-images R2 bucket
```

## Cost

### R2 Pricing

- **Storage**: $0.015/GB/month
- **Egress**: $0 (zero egress fees) ✅
- **Operations**: $4.50 per million Class A operations
- **Operations**: $0.36 per million Class B operations

### Typical Usage (1,000 users/month)

- **Storage**: ~100GB = $1.50/month
- **Egress**: ~1-4TB = $0 (vs $90-360 on AWS S3)
- **Operations**: ~10M/month = $45/month
- **Total**: ~$46.50/month

**Savings vs AWS S3**: $90-360/month (zero egress fees)

## Monitoring

### Cloudflare Dashboard

- **R2 → ryla-images → Metrics**
  - Storage usage
  - Request count
  - Egress (should be $0)

### Alerts

Set up alerts for:
- Storage usage > threshold
- High operation counts
- Unusual access patterns

## Security

### Best Practices

1. **Keep bucket private** (use Worker for access)
2. **Use presigned URLs** for temporary access
3. **Rotate API tokens** regularly
4. **Monitor access logs**
5. **Set CORS rules** if needed

### CORS Configuration

If needed for direct browser access:
```json
[
  {
    "AllowedOrigins": ["https://app.ryla.ai", "https://www.ryla.ai"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "MaxAgeSeconds": 3600
  }
]
```

## Troubleshooting

### Common Issues

1. **Bucket not found**
   - Verify bucket name: `ryla-images`
   - Check account/region

2. **Access denied**
   - Verify API token permissions
   - Check bucket access settings

3. **Slow uploads**
   - Check network connection
   - Verify endpoint URL
   - Consider using multipart upload for large files

4. **CDN not caching**
   - Check Cache-Control headers
   - Verify Worker configuration
   - Check Cloudflare cache settings

## Related Documentation

- [Storage Setup Guide](./STORAGE-SETUP.md) - Complete storage setup
- [CDN Worker Setup](./CLOUDFLARE-CDN-WORKER.md) - Worker configuration
- [ADR-005: Cloudflare R2 Storage](../decisions/ADR-005-cloudflare-r2-storage.md) - Decision rationale
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
