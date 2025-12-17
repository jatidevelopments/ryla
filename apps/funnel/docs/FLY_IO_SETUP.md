# Fly.io Setup for goviral.ryla.ai

## Domain Configuration

The application is configured to use `goviral.ryla.ai` as the primary domain.

## Setting Up the Domain on Fly.io

### 1. Add the Domain

```bash
fly domains add goviral.ryla.ai
```

This will:

- Create DNS records that you need to add to your domain registrar
- Configure SSL/TLS certificates automatically

### 2. Set Environment Variables

Set the site URL environment variable:

```bash
fly secrets set NEXT_PUBLIC_SITE_URL=https://goviral.ryla.ai
fly secrets set NEXT_PUBLIC_CDN_URL=https://rylaai.b-cdn.net
```

### 3. Verify Domain Configuration

Check that the domain is properly configured:

```bash
fly domains list
```

### 4. DNS Configuration

After running `fly domains add`, you'll receive DNS records to add to your domain registrar. These typically include:

- A record pointing to Fly.io IP addresses
- CNAME record (if using subdomain)

Add these records to your DNS provider for `ryla.ai` domain.

### 5. Deploy

After setting up the domain and environment variables, deploy the application:

```bash
fly deploy
```

## Environment Variables

The following environment variables should be set in Fly.io:

- `NEXT_PUBLIC_SITE_URL`: `https://goviral.ryla.ai`
- `NEXT_PUBLIC_CDN_URL`: Bunny CDN hostname (e.g., `https://rylaai.b-cdn.net`)
- `NEXT_PUBLIC_API_BASE_URL`: Your API base URL (if different from default)

To set secrets:

```bash
fly secrets set NEXT_PUBLIC_SITE_URL=https://goviral.ryla.ai
fly secrets set NEXT_PUBLIC_CDN_URL=https://rylaai.b-cdn.net
fly secrets set NEXT_PUBLIC_API_BASE_URL=https://your-api-url.com
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
  --build-arg NEXT_PUBLIC_CDN_URL=https://rylaai.b-cdn.net \
  --build-arg NEXT_PUBLIC_DEBUG_CDN=true \
  --build-arg NEXT_PUBLIC_SITE_URL=https://goviral.ryla.ai \
  --build-arg NEXT_PUBLIC_API_BASE_URL=<your-api-url> \
  --build-arg NEXT_PUBLIC_FINBY_PAYMENT_REDIRECT=/ \
  --build-arg NEXT_PUBLIC_POSTHOG_HOST=<your-posthog-host> \
  --build-arg NEXT_PUBLIC_POSTHOG_KEY=<your-posthog-key>
```

Or create a deployment script to automate this.

## Package.json Deploy Script

To automate deployments, you can add a deploy script to your `package.json`. This ensures all required build arguments are passed correctly:

```json
{
  "scripts": {
    "deploy:funnel": "npm run predeploy && flyctl deploy --config apps/funnel/fly.toml --dockerfile apps/funnel/Dockerfile --build-arg NEXT_PUBLIC_CDN_URL=\"https://rylaai.b-cdn.net\" --build-arg NEXT_PUBLIC_DEBUG_CDN=\"true\" --build-arg NEXT_PUBLIC_SITE_URL=\"https://goviral.ryla.ai\" --build-arg NEXT_PUBLIC_API_BASE_URL=\"https://devapi.mydreamcompanion.com\" --build-arg NEXT_PUBLIC_FINBY_PAYMENT_REDIRECT=\"/\" --build-arg NEXT_PUBLIC_POSTHOG_HOST=\"https://us.i.posthog.com\" --build-arg NEXT_PUBLIC_POSTHOG_KEY=\"phc_z3f9QIPUEEiNCGvf2JUH1A73ucx43IG8Ru9qfdfkkGU\" --build-arg NEXT_PUBLIC_SUPABASE_URL=\"https://wkmhcjjphidaaxsulhrw.supabase.co\" --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=\"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbWhjampwaGlkYWF4c3VsaHJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0OTAzOTMsImV4cCI6MjA4MDA2NjM5M30.Ktt35-wkIFmJepj85VWopFG1_M89DXsSU8ic5vO1orA\""
  }
}
```

Then deploy with:

```bash
npm run deploy:funnel
```

**Note**: The script includes `npm run predeploy &&` which runs any pre-deployment tasks. If you don't have a `predeploy` script, you can remove that part or create one for validation/checks.

**Important**: All `NEXT_PUBLIC_*` variables must be passed as `--build-arg` flags because Next.js embeds them into the JavaScript bundle at build time. They cannot be set as runtime environment variables.

## Troubleshooting

### Domain Not Resolving

1. Verify DNS records are correctly set at your domain registrar
2. Wait for DNS propagation (can take up to 48 hours)
3. Check DNS propagation: `dig goviral.ryla.ai`

### SSL Certificate Issues

Fly.io automatically provisions SSL certificates via Let's Encrypt. If you encounter issues:

```bash
fly certs show goviral.ryla.ai
```

### Environment Variables Not Working

Ensure variables are set as secrets (not in fly.toml):

```bash
fly secrets list
```

If missing, set them:

```bash
fly secrets set VARIABLE_NAME=value
```
