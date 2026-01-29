#!/bin/bash
set -e

# Deploy Next.js apps to Cloudflare Pages
# Supports both static export (landing) and Cloudflare adapter (funnel, web)

APP_NAME="${1:-landing}"
PROJECT_NAME="ryla-${APP_NAME}"

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
  print_error "wrangler is not installed. Install with: npm install -g wrangler"
  exit 1
fi

# Check if authenticated
if ! wrangler whoami &> /dev/null; then
  print_error "Not authenticated. Run: wrangler login"
  exit 1
fi

print_step "Deploying $APP_NAME to Cloudflare Pages"
echo "   Project: $PROJECT_NAME"
echo ""

# Determine deployment strategy based on app
case "$APP_NAME" in
  landing)
    print_step "Preparing landing app for Cloudflare build"
    bash scripts/setup/prepare-cloudflare-build.sh landing
    
    print_step "Building landing app (static export)"
    export CLOUDFLARE_PAGES=true
    pnpm nx build landing --configuration=production --skip-nx-cache || {
      print_error "Build failed"
      bash scripts/setup/restore-cloudflare-build.sh landing
      exit 1
    }
    
    # Check multiple possible output locations
    # Next.js static export with Nx puts files in dist/apps/[app]/.next
    if [ -d "dist/apps/landing/.next" ] && [ -f "dist/apps/landing/.next/index.html" ]; then
      OUTPUT_DIR="dist/apps/landing/.next"
      print_success "Found static export in dist/apps/landing/.next"
    elif [ -d "apps/landing/out" ]; then
      OUTPUT_DIR="apps/landing/out"
    elif [ -d "dist/apps/landing/out" ]; then
      OUTPUT_DIR="dist/apps/landing/out"
    elif [ -d "apps/landing/.next" ] && [ -f "apps/landing/.next/index.html" ]; then
      OUTPUT_DIR="apps/landing/.next"
      print_warning "Using .next directory (expected out directory)"
    else
      print_error "Build output not found. Checked: dist/apps/landing/.next, apps/landing/out, dist/apps/landing/out"
      bash scripts/setup/restore-cloudflare-build.sh landing
      exit 1
    fi
    
    print_success "Build complete. Output: $OUTPUT_DIR"
    
    # Deploy immediately (before restoring files)
    # Note: Restore happens after deployment to preserve build output
    ;;
    
  funnel)
    print_step "Preparing funnel app for Cloudflare build"
    bash scripts/setup/prepare-funnel-cloudflare-build.sh
    
    print_step "Building funnel app (static export)"
    export CLOUDFLARE_PAGES=true
    pnpm nx build funnel --configuration=production --skip-nx-cache || {
      print_error "Build failed"
      bash scripts/setup/restore-funnel-cloudflare-build.sh
      exit 1
    }
    
    # Check multiple possible output locations
    if [ -d "dist/apps/funnel/.next" ] && [ -f "dist/apps/funnel/.next/index.html" ]; then
      OUTPUT_DIR="dist/apps/funnel/.next"
      print_success "Found static export in dist/apps/funnel/.next"
    elif [ -d "apps/funnel/out" ]; then
      OUTPUT_DIR="apps/funnel/out"
    elif [ -d "dist/apps/funnel/out" ]; then
      OUTPUT_DIR="dist/apps/funnel/out"
    elif [ -d "apps/funnel/.next" ] && [ -f "apps/funnel/.next/index.html" ]; then
      OUTPUT_DIR="apps/funnel/.next"
      print_warning "Using .next directory (expected out directory)"
    else
      print_error "Build output not found. Checked: dist/apps/funnel/.next, apps/funnel/out, dist/apps/funnel/out"
      bash scripts/setup/restore-funnel-cloudflare-build.sh
      exit 1
    fi
    
    print_success "Build complete. Output: $OUTPUT_DIR"
    ;;
    
  web)
    print_step "Building $APP_NAME app (Cloudflare adapter)"
    print_warning "Using Cloudflare Next.js adapter for API routes support"
    
    # Build with standalone mode first (required for adapter)
    unset CLOUDFLARE_PAGES
    pnpm nx build "$APP_NAME" --configuration=production --skip-nx-cache || {
      print_error "Build failed"
      exit 1
    }
    
    # Check build output location (Nx may put it in dist/)
    BUILD_OUTPUT="apps/${APP_NAME}/.next"
    if [ ! -d "$BUILD_OUTPUT" ] && [ -d "dist/apps/${APP_NAME}/.next" ]; then
      BUILD_OUTPUT="dist/apps/${APP_NAME}/.next"
    fi
    
    if [ ! -d "$BUILD_OUTPUT" ]; then
      print_error "Build output not found at apps/${APP_NAME}/.next or dist/apps/${APP_NAME}/.next"
      exit 1
    fi
    
    # For now, deploy the standalone build directly
    # The adapter has path issues with Nx monorepo structure and is deprecated
    print_step "Deploying standalone build"
    print_warning "API routes require Cloudflare Workers, not Pages"
    print_warning "Consider keeping $APP_NAME on Fly.io for full API route support"
    print_warning "Or use Cloudflare Workers with OpenNext adapter for full Next.js support"
    
    OUTPUT_DIR="$BUILD_OUTPUT"
    
    print_success "Build complete. Output: $OUTPUT_DIR"
    ;;
    
  *)
    print_error "Unknown app: $APP_NAME"
    echo "Supported apps: landing, funnel, web"
    exit 1
    ;;
esac

# Remove cache directories and large files (Pages has 25MB file size limit)
# Note: Don't remove .next if OUTPUT_DIR is .next itself
print_step "Cleaning cache directories and large files"
if [[ "$OUTPUT_DIR" != *".next" ]] || [[ "$OUTPUT_DIR" == *"/.next" ]]; then
  find "$OUTPUT_DIR" -type d -name "cache" -exec rm -rf {} + 2>/dev/null || true
  # Only remove nested .next directories, not the output directory itself
  find "$OUTPUT_DIR" -type d -name ".next" ! -path "$OUTPUT_DIR" -exec rm -rf {} + 2>/dev/null || true
else
  # For .next output directories, only remove cache subdirectories
  find "$OUTPUT_DIR" -type d -name "cache" -exec rm -rf {} + 2>/dev/null || true
fi

# Remove large PNG files that exceed Cloudflare Pages 25MB limit
# The app uses sprite.webp (1.9MB), not sprite.png (26MB)
find "$OUTPUT_DIR" -type f -name "sprite.png" -size +25M -delete 2>/dev/null || true
# Also remove any other files over 25MB
find "$OUTPUT_DIR" -type f -size +25M -exec ls -lh {} \; 2>/dev/null | while read -r line; do
  file=$(echo "$line" | awk '{print $9}')
  if [ -f "$file" ]; then
    echo "  ⚠️  Removing large file: $file ($(echo "$line" | awk '{print $5}'))"
    rm -f "$file"
  fi
done

print_success "Cache and large files removed"

# Deploy
print_step "Deploying to Cloudflare Pages"
wrangler pages deploy "$OUTPUT_DIR" --project-name="$PROJECT_NAME" --commit-dirty=true || {
  print_error "Deployment failed"
  # Restore files even on failure
  if [ "$APP_NAME" = "landing" ]; then
    bash scripts/setup/restore-cloudflare-build.sh landing
  elif [ "$APP_NAME" = "funnel" ]; then
    bash scripts/setup/restore-funnel-cloudflare-build.sh
  fi
  exit 1
}

print_success "Deployment complete!"

# Restore files after successful deployment
if [ "$APP_NAME" = "landing" ]; then
  bash scripts/setup/restore-cloudflare-build.sh landing
elif [ "$APP_NAME" = "funnel" ]; then
  bash scripts/setup/restore-funnel-cloudflare-build.sh
fi

echo ""
echo "🌐 View deployment: https://${PROJECT_NAME}.pages.dev"
echo "📊 Dashboard: https://dash.cloudflare.com/c1a4d3b64f078c62acf977cb19667f33/pages/view/${PROJECT_NAME}"
