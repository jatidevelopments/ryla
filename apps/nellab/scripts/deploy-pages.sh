#!/usr/bin/env bash
# Deploy nellab static export to Cloudflare Pages (local).
# Prereqs: wrangler login (once), then run from repo root:
#   pnpm deploy:nellab
# Or: ./apps/nellab/scripts/deploy-pages.sh

set -e
cd "$(dirname "$0")/../../.."

echo "Building nellab (static export)..."
CLOUDFLARE_PAGES=true pnpm nx build nellab --configuration=production

DIR=""
if [ -d "dist/apps/nellab/out" ]; then
  DIR="dist/apps/nellab/out"
elif [ -f "dist/apps/nellab/.next/index.html" ]; then
  DIR="dist/apps/nellab/.next"
elif [ -d "dist/apps/nellab" ]; then
  DIR="dist/apps/nellab"
else
  echo "No static export output found under dist/apps/nellab"
  exit 1
fi

echo "Deploying $DIR to Cloudflare Pages (ryla-nellab)..."
wrangler pages deploy "$DIR" --project-name=ryla-nellab
