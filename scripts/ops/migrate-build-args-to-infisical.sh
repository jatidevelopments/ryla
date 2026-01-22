#!/bin/bash
# Migrate NEXT_PUBLIC_* build args from GitHub Secrets to Infisical
# Usage: ./scripts/ops/migrate-build-args-to-infisical.sh [env]
#   env: prod, staging, or dev (default: prod)

set -e

ENV=${1:-prod}

echo "🔄 Migrating build args to Infisical ($ENV environment)"
echo "=================================================="
echo ""

# Check if Infisical CLI is installed
if ! command -v infisical &> /dev/null; then
  echo "❌ Infisical CLI is not installed"
  echo "Install: curl -1sLf 'https://dl.cloudsmith.io/public/infisical/infisical-cli/setup.deb.sh' | sudo -E bash && sudo apt-get install infisical"
  exit 1
fi

# Check if logged in
if ! infisical whoami &> /dev/null; then
  echo "❌ Not logged in to Infisical"
  echo "Run: infisical login"
  exit 1
fi

echo "✅ Infisical CLI ready"
echo ""

# Production values (from docs/ops/GITHUB-SECRETS-TO-SET.md)
if [ "$ENV" == "prod" ]; then
  echo "📦 Adding Web App build args (production)..."
  infisical secrets set NEXT_PUBLIC_API_URL=https://end.ryla.ai --path=/apps/web --env=prod
  infisical secrets set NEXT_PUBLIC_SITE_URL=https://app.ryla.ai --path=/apps/web --env=prod
  echo "  ✅ Web app secrets added"
  
  echo ""
  echo "📦 Adding shared build args (production)..."
  infisical secrets set NEXT_PUBLIC_POSTHOG_KEY=phc_z3f9QIPUEEiNCGvf2JUH1A73ucx43IG8Ru9qfdfkkGU --path=/shared --env=prod
  infisical secrets set NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com --path=/shared --env=prod
  infisical secrets set NEXT_PUBLIC_SUPABASE_URL=https://wkmhcjjphidaaxsulhrw.supabase.co --path=/shared --env=prod
  infisical secrets set NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbWhjampwaGlkYWF4c3VsaHJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0OTAzOTMsImV4cCI6MjA4MDA2NjM5M30.Ktt35-wkIFmJepj85VWopFG1_M89DXsSU8ic5vO1orA --path=/shared --env=prod
  echo "  ✅ Shared secrets added"
  
  echo ""
  echo "📦 Adding Funnel App build args (production)..."
  infisical secrets set NEXT_PUBLIC_CDN_URL=https://rylaai.b-cdn.net --path=/apps/funnel --env=prod
  infisical secrets set NEXT_PUBLIC_DEBUG_CDN=true --path=/apps/funnel --env=prod
  infisical secrets set NEXT_PUBLIC_SITE_URL_FUNNEL=https://goviral.ryla.ai --path=/apps/funnel --env=prod
  infisical secrets set NEXT_PUBLIC_API_BASE_URL=https://end.ryla.ai --path=/apps/funnel --env=prod
  infisical secrets set NEXT_PUBLIC_FINBY_PAYMENT_REDIRECT=/ --path=/apps/funnel --env=prod
  echo "  ✅ Funnel app secrets added"
  
  echo ""
  echo "📦 Adding Landing App build args (production)..."
  infisical secrets set NEXT_PUBLIC_SITE_URL_LANDING=https://www.ryla.ai --path=/apps/landing --env=prod
  # CDN_URL and DEBUG_CDN can be shared from funnel or set separately
  infisical secrets set NEXT_PUBLIC_CDN_URL=https://rylaai.b-cdn.net --path=/apps/landing --env=prod
  infisical secrets set NEXT_PUBLIC_DEBUG_CDN=true --path=/apps/landing --env=prod
  echo "  ✅ Landing app secrets added"

# Staging values (adjust as needed)
elif [ "$ENV" == "staging" ]; then
  echo "📦 Adding Web App build args (staging)..."
  infisical secrets set NEXT_PUBLIC_API_URL=https://end-staging.ryla.ai --path=/apps/web --env=staging
  infisical secrets set NEXT_PUBLIC_SITE_URL=https://app-staging.ryla.ai --path=/apps/web --env=staging
  echo "  ✅ Web app secrets added"
  
  echo ""
  echo "📦 Adding shared build args (staging)..."
  # Use same PostHog/Supabase for staging (or adjust if different)
  infisical secrets set NEXT_PUBLIC_POSTHOG_KEY=phc_z3f9QIPUEEiNCGvf2JUH1A73ucx43IG8Ru9qfdfkkGU --path=/shared --env=staging
  infisical secrets set NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com --path=/shared --env=staging
  infisical secrets set NEXT_PUBLIC_SUPABASE_URL=https://wkmhcjjphidaaxsulhrw.supabase.co --path=/shared --env=staging
  infisical secrets set NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbWhjampwaGlkYWF4c3VsaHJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0OTAzOTMsImV4cCI6MjA4MDA2NjM5M30.Ktt35-wkIFmJepj85VWopFG1_M89DXsSU8ic5vO1orA --path=/shared --env=staging
  echo "  ✅ Shared secrets added"
  
  echo ""
  echo "📦 Adding Funnel App build args (staging)..."
  infisical secrets set NEXT_PUBLIC_CDN_URL=https://rylaai.b-cdn.net --path=/apps/funnel --env=staging
  infisical secrets set NEXT_PUBLIC_DEBUG_CDN=true --path=/apps/funnel --env=staging
  infisical secrets set NEXT_PUBLIC_SITE_URL_FUNNEL=https://goviral-staging.ryla.ai --path=/apps/funnel --env=staging
  infisical secrets set NEXT_PUBLIC_API_BASE_URL=https://end-staging.ryla.ai --path=/apps/funnel --env=staging
  infisical secrets set NEXT_PUBLIC_FINBY_PAYMENT_REDIRECT=/ --path=/apps/funnel --env=staging
  echo "  ✅ Funnel app secrets added"
  
  echo ""
  echo "📦 Adding Landing App build args (staging)..."
  infisical secrets set NEXT_PUBLIC_SITE_URL_LANDING=https://staging.ryla.ai --path=/apps/landing --env=staging
  infisical secrets set NEXT_PUBLIC_CDN_URL=https://rylaai.b-cdn.net --path=/apps/landing --env=staging
  infisical secrets set NEXT_PUBLIC_DEBUG_CDN=true --path=/apps/landing --env=staging
  echo "  ✅ Landing app secrets added"

# Development values
else
  echo "📦 Adding Web App build args (development)..."
  infisical secrets set NEXT_PUBLIC_API_URL=http://localhost:3001 --path=/apps/web --env=dev
  infisical secrets set NEXT_PUBLIC_SITE_URL=http://localhost:3000 --path=/apps/web --env=dev
  echo "  ✅ Web app secrets added"
  
  echo ""
  echo "📦 Adding shared build args (development)..."
  # Use same PostHog/Supabase for dev (or adjust if different)
  infisical secrets set NEXT_PUBLIC_POSTHOG_KEY=phc_z3f9QIPUEEiNCGvf2JUH1A73ucx43IG8Ru9qfdfkkGU --path=/shared --env=dev
  infisical secrets set NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com --path=/shared --env=dev
  infisical secrets set NEXT_PUBLIC_SUPABASE_URL=https://wkmhcjjphidaaxsulhrw.supabase.co --path=/shared --env=dev
  infisical secrets set NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndrbWhjampwaGlkYWF4c3VsaHJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ0OTAzOTMsImV4cCI6MjA4MDA2NjM5M30.Ktt35-wkIFmJepj85VWopFG1_M89DXsSU8ic5vO1orA --path=/shared --env=dev
  echo "  ✅ Shared secrets added"
  
  echo ""
  echo "📦 Adding Funnel App build args (development)..."
  infisical secrets set NEXT_PUBLIC_CDN_URL=http://localhost:3002 --path=/apps/funnel --env=dev
  infisical secrets set NEXT_PUBLIC_DEBUG_CDN=true --path=/apps/funnel --env=dev
  infisical secrets set NEXT_PUBLIC_SITE_URL_FUNNEL=http://localhost:3002 --path=/apps/funnel --env=dev
  infisical secrets set NEXT_PUBLIC_API_BASE_URL=http://localhost:3001 --path=/apps/funnel --env=dev
  infisical secrets set NEXT_PUBLIC_FINBY_PAYMENT_REDIRECT=/ --path=/apps/funnel --env=dev
  echo "  ✅ Funnel app secrets added"
  
  echo ""
  echo "📦 Adding Landing App build args (development)..."
  infisical secrets set NEXT_PUBLIC_SITE_URL_LANDING=http://localhost:3003 --path=/apps/landing --env=dev
  infisical secrets set NEXT_PUBLIC_CDN_URL=http://localhost:3002 --path=/apps/landing --env=dev
  infisical secrets set NEXT_PUBLIC_DEBUG_CDN=true --path=/apps/landing --env=dev
  echo "  ✅ Landing app secrets added"
fi

echo ""
echo "✅ Migration complete for $ENV environment!"
echo ""
echo "Next steps:"
echo "1. Verify secrets: infisical secrets --path=/apps/web --env=$ENV | grep NEXT_PUBLIC"
echo "2. Test workflow deployment"
echo "3. After verification, remove secrets from GitHub"
echo ""
echo "To migrate other environments:"
echo "  ./scripts/ops/migrate-build-args-to-infisical.sh prod"
echo "  ./scripts/ops/migrate-build-args-to-infisical.sh staging"
echo "  ./scripts/ops/migrate-build-args-to-infisical.sh dev"
