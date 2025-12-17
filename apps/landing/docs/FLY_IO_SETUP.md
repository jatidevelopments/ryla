# Fly.io Setup for ryla.ai Landing Page

## Domain Configuration

The application is configured to use `www.ryla.ai` and `ryla.ai` as the primary domains.

## Setting Up the Domain on Fly.io

### 1. Add the Domain

```bash
fly domains add www.ryla.ai
fly domains add ryla.ai
```

This will:

- Create DNS records that you need to add to your domain registrar
- Configure SSL/TLS certificates automatically

### 2. Set Environment Variables

Set the required environment variables as Fly secrets:

```bash
fly secrets set NEXT_PUBLIC_SITE_URL=https://www.ryla.ai
fly secrets set NEXT_PUBLIC_CDN_URL=https://rylaai.b-cdn.net
```

### 3. Verify Domain Configuration

Check that the domains are properly configured:

```bash
fly domains list
```

### 4. DNS Configuration

After running `fly domains add`, you'll receive DNS records to add to your domain registrar. These typically include:

- A record pointing to Fly.io IP addresses
- CNAME record (if using subdomain)

Add these records to your DNS provider for `ryla.ai` domain.

### 5. Deploy

After setting up the domain and environment variables, deploy the application with build-time arguments:

```bash
fly deploy \
  --config apps/landing/fly.toml \
  --dockerfile apps/landing/Dockerfile \
  --build-arg NEXT_PUBLIC_SITE_URL=https://www.ryla.ai \
  --build-arg NEXT_PUBLIC_CDN_URL=https://rylaai.b-cdn.net \
  --build-arg NEXT_PUBLIC_DEBUG_CDN=false
```

## Environment Variables

The following environment variables should be set in Fly.io:

### Build-Time Variables (Required)

**Important**: `NEXT_PUBLIC_*` environment variables need to be available at build time (not just runtime) because Next.js embeds them in the JavaScript bundle.

- `NEXT_PUBLIC_SITE_URL`: `https://www.ryla.ai` (used for metadata/SEO)
- `NEXT_PUBLIC_CDN_URL`: Bunny CDN hostname (e.g., `https://rylaai.b-cdn.net`)
- `NEXT_PUBLIC_DEBUG_CDN`: `true` or `false` (optional, for debugging CDN issues)

### Setting Secrets

To set secrets (for runtime use, though most are build-time):

```bash
fly secrets set NEXT_PUBLIC_SITE_URL=https://www.ryla.ai
fly secrets set NEXT_PUBLIC_CDN_URL=https://rylaai.b-cdn.net
```

To view current secrets:

```bash
fly secrets list
```

## Deployment with Build-Time Variables

**Important**: `NEXT_PUBLIC_*` environment variables need to be available at build time (not just runtime) because Next.js embeds them in the JavaScript bundle.

When deploying, you must pass these as build arguments:

```bash
fly deploy \
  --config apps/landing/fly.toml \
  --dockerfile apps/landing/Dockerfile \
  --build-arg NEXT_PUBLIC_SITE_URL=https://www.ryla.ai \
  --build-arg NEXT_PUBLIC_CDN_URL=https://rylaai.b-cdn.net \
  --build-arg NEXT_PUBLIC_DEBUG_CDN=false
```

Or create a deployment script to automate this.

## Quick Deploy Command

From the project root:

```bash
fly deploy \
  --config apps/landing/fly.toml \
  --dockerfile apps/landing/Dockerfile \
  --build-arg NEXT_PUBLIC_SITE_URL=https://www.ryla.ai \
  --build-arg NEXT_PUBLIC_CDN_URL=https://rylaai.b-cdn.net \
  --build-arg NEXT_PUBLIC_DEBUG_CDN=false
```

## Package.json Deploy Script

To automate deployments, you can add a deploy script to your `package.json`. This ensures all required build arguments are passed correctly:

```json
{
  "scripts": {
    "deploy:landing": "flyctl deploy --config apps/landing/fly.toml --dockerfile apps/landing/Dockerfile --build-arg NEXT_PUBLIC_SITE_URL=\"https://www.ryla.ai\" --build-arg NEXT_PUBLIC_CDN_URL=\"https://rylaai.b-cdn.net\" --build-arg NEXT_PUBLIC_DEBUG_CDN=\"false\""
  }
}
```

Then deploy with:

```bash
npm run deploy:landing
```

### Full Example with All Variables

If you need additional environment variables (e.g., for analytics, API endpoints, etc.), you can extend the deploy script:

```json
{
  "scripts": {
    "deploy:landing": "flyctl deploy --config apps/landing/fly.toml --dockerfile apps/landing/Dockerfile --build-arg NEXT_PUBLIC_SITE_URL=\"https://www.ryla.ai\" --build-arg NEXT_PUBLIC_CDN_URL=\"https://rylaai.b-cdn.net\" --build-arg NEXT_PUBLIC_DEBUG_CDN=\"false\" --build-arg NEXT_PUBLIC_POSTHOG_HOST=\"https://us.i.posthog.com\" --build-arg NEXT_PUBLIC_POSTHOG_KEY=\"your-posthog-key\""
  }
}
```

**Important**: All `NEXT_PUBLIC_*` variables must be passed as `--build-arg` flags because Next.js embeds them into the JavaScript bundle at build time. They cannot be set as runtime environment variables.

## Troubleshooting

### Domain Not Resolving

1. Verify DNS records are correctly set at your domain registrar
2. Wait for DNS propagation (can take up to 48 hours)
3. Check DNS propagation: `dig www.ryla.ai`

### SSL Certificate Issues

Fly.io automatically provisions SSL certificates via Let's Encrypt. If you encounter issues:

```bash
fly certs show www.ryla.ai
```

### Environment Variables Not Working

Ensure variables are passed as `--build-arg` during deployment for build-time variables:

```bash
fly deploy --build-arg NEXT_PUBLIC_SITE_URL=https://www.ryla.ai ...
```

For runtime-only variables, set them as secrets:

```bash
fly secrets set VARIABLE_NAME=value
```

### Build Fails with Missing Environment Variables

If the build fails because environment variables are missing, ensure all `NEXT_PUBLIC_*` variables are passed as `--build-arg` flags during `fly deploy`.
