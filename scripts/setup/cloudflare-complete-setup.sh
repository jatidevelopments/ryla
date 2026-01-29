#!/usr/bin/env bash
# Complete Cloudflare Infrastructure Setup (Phases 1-3)
# Automates R2 Storage, CDN Worker, and Pages deployment using Wrangler CLI
# Usage: bash scripts/setup/cloudflare-complete-setup.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
R2_BUCKET_NAME="ryla-images"
R2_BUCKET_LOCATION="wnam"  # Western North America (US West Coast). Options: wnam (West US), enam (East US), weur, eeur, apac, oc
WORKER_NAME="ryla-r2-cdn-proxy"
WORKER_DIR="workers/ryla-r2-cdn-proxy"

# Pages projects (using arrays instead of associative arrays for compatibility)
PAGES_PROJECT_NAMES=("ryla-landing" "ryla-funnel" "ryla-web")
PAGES_APP_NAMES=("landing" "funnel" "web")
PAGES_OUTPUT_DIRS=("dist/apps/landing/.next" "dist/apps/funnel/.next" "dist/apps/web/.next")

# Helper functions
print_step() {
  echo ""
  echo -e "${BLUE}📋 $1${NC}"
  echo ""
}

print_success() {
  echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
  echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
  echo -e "${RED}❌ $1${NC}"
}

check_command() {
  if ! command -v "$1" &> /dev/null; then
    print_error "$1 is not installed"
    echo "Install with: $2"
    exit 1
  fi
}

# ============================================================================
# PHASE 1: R2 Storage Setup
# ============================================================================

phase1_r2_setup() {
  print_step "PHASE 1: R2 Storage Setup"

  # Check if R2 is enabled
  print_step "Checking R2 availability"
  if ! wrangler r2 bucket list &>/dev/null; then
    print_error "R2 is not enabled for your account"
    echo ""
    echo "Please enable R2 through the Cloudflare Dashboard:"
    echo "  1. Go to: https://dash.cloudflare.com → R2"
    echo "  2. Click 'Get Started' or 'Create bucket'"
    echo "  3. This will enable R2 for your account"
    echo ""
    echo "After enabling R2, run this script again."
    exit 1
  fi
  print_success "R2 is enabled"

  # Check if bucket exists
  if wrangler r2 bucket list 2>/dev/null | grep -q "$R2_BUCKET_NAME"; then
    print_warning "R2 bucket '$R2_BUCKET_NAME' already exists (skipping creation)"
  else
    print_step "Creating R2 bucket: $R2_BUCKET_NAME"
    if wrangler r2 bucket create "$R2_BUCKET_NAME" --location="$R2_BUCKET_LOCATION" 2>/dev/null; then
      print_success "R2 bucket '$R2_BUCKET_NAME' created successfully"
    else
      print_error "Failed to create R2 bucket"
      echo "  Location code: $R2_BUCKET_LOCATION"
      echo "  Valid locations: weur (Western Europe), eeur (Eastern Europe), apac (Asia Pacific), wnam (Western North America), enam (Eastern North America), oc (Oceania)"
      exit 1
    fi
  fi

  # List buckets to verify
  print_step "Verifying R2 buckets"
  wrangler r2 bucket list
  print_success "R2 storage setup complete"
}

phase1_worker_setup() {
  print_step "PHASE 1: CDN Worker Setup"

  # Check if worker directory exists
  if [ ! -f "$WORKER_DIR/wrangler.toml" ]; then
    print_error "Worker directory not found: $WORKER_DIR"
    echo "Expected: $WORKER_DIR/wrangler.toml"
    exit 1
  fi

  cd "$WORKER_DIR"

  # Install dependencies if needed
  if [ ! -d "node_modules" ]; then
    print_step "Installing Worker dependencies"
    npm install
  fi

  # Deploy worker
  print_step "Deploying CDN Worker: $WORKER_NAME"
  
  # Try to deploy (non-interactive)
  if echo "yes" | wrangler deploy 2>&1 | tee /tmp/wrangler-deploy.log; then
    print_success "CDN Worker deployed successfully"
  else
    # Check if it's a subdomain registration issue
    if grep -q "workers.dev subdomain" /tmp/wrangler-deploy.log 2>/dev/null; then
      print_warning "Workers.dev subdomain needs to be registered"
      echo ""
      echo "Please register a workers.dev subdomain:"
      echo "  https://dash.cloudflare.com/$ACCOUNT_ID/workers/onboarding"
      echo ""
      echo "Or run manually:"
      echo "  wrangler login"
      echo "  (Answer 'yes' when asked to register subdomain)"
      echo ""
      echo "After registering, the Worker will be deployed automatically."
      echo "You can also deploy manually: cd $WORKER_DIR && wrangler deploy"
    else
      print_error "Failed to deploy CDN Worker"
      cat /tmp/wrangler-deploy.log 2>/dev/null | tail -5
      exit 1
    fi
  fi
  
  # Get worker URL if deployed
  if wrangler deployments list 2>/dev/null | grep -q "$WORKER_NAME"; then
    WORKER_URL=$(wrangler deployments list 2>/dev/null | head -n 2 | tail -n 1 | awk '{print $NF}' || echo "")
    if [ -n "$WORKER_URL" ]; then
      echo "Worker URL: $WORKER_URL"
    fi
  fi

  cd - > /dev/null
  print_success "CDN Worker setup complete"
}

# ============================================================================
# PHASE 2: Pages Deployment
# ============================================================================

phase2_pages_setup() {
  print_step "PHASE 2: Cloudflare Pages Setup"

  for i in "${!PAGES_PROJECT_NAMES[@]}"; do
    project_name="${PAGES_PROJECT_NAMES[$i]}"
    app_name="${PAGES_APP_NAMES[$i]}"
    output_dir="${PAGES_OUTPUT_DIRS[$i]}"
    
    print_step "Setting up Pages project: $project_name ($app_name)"
    
    # Check if project already exists
    if wrangler pages project list 2>/dev/null | grep -q "$project_name"; then
      print_warning "Pages project '$project_name' already exists (skipping creation)"
    else
      # Create Pages project with production branch
      if wrangler pages project create "$project_name" --production-branch=main 2>/dev/null; then
        print_success "Pages project '$project_name' created"
      else
        print_warning "Failed to create Pages project '$project_name' (may need Dashboard setup)"
        echo "  Create manually: https://dash.cloudflare.com → Workers & Pages → Create → Pages project"
        continue
      fi
    fi

    # Note: Build settings and GitHub integration need to be configured via Dashboard
    echo "  App: $app_name"
    echo "  Output directory: $output_dir"
    echo "  Build command: pnpm install && pnpm nx build $app_name --configuration=production"
    echo ""
    print_warning "Configure build settings via Dashboard:"
    echo "  1. Go to: Workers & Pages → $project_name → Settings"
    echo "  2. Set build command: pnpm install && pnpm nx build $app_name --configuration=production"
    echo "  3. Set output directory: $output_dir"
    echo "  4. Connect GitHub repository for auto-deployments"
    echo ""
    echo "  Note: Exclude cache directories in build output (Pages has 25MB file limit)"
    echo "  Add to build command: && rm -rf $output_dir/cache"
    echo ""
  done

  print_success "Pages projects setup complete"
  print_warning "Remember to configure build settings and GitHub integration via Dashboard"
}

# ============================================================================
# PHASE 3: Validation & Optimization
# ============================================================================

phase3_validation() {
  print_step "PHASE 3: Validation & Optimization"

  # Validate R2 bucket
  print_step "Validating R2 bucket"
  if wrangler r2 bucket list | grep -q "$R2_BUCKET_NAME"; then
    print_success "R2 bucket '$R2_BUCKET_NAME' exists"
    
    # List objects (if any)
    echo "Listing objects in bucket..."
    wrangler r2 object list "$R2_BUCKET_NAME" | head -n 5 || echo "  (bucket is empty)"
  else
    print_error "R2 bucket '$R2_BUCKET_NAME' not found"
  fi

  # Validate Worker
  print_step "Validating CDN Worker"
  if wrangler deployments list | grep -q "$WORKER_NAME"; then
    print_success "CDN Worker '$WORKER_NAME' is deployed"
    
    # Get latest deployment
    echo "Latest deployments:"
    wrangler deployments list | head -n 3
  else
    print_warning "CDN Worker '$WORKER_NAME' deployment not found in list"
  fi

  # Validate Pages projects
  print_step "Validating Pages projects"
  for project_name in "${PAGES_PROJECT_NAMES[@]}"; do
    if wrangler pages project list 2>/dev/null | grep -q "$project_name"; then
      print_success "Pages project '$project_name' exists"
    else
      print_warning "Pages project '$project_name' not found"
    fi
  done

  print_success "Validation complete"
}

phase3_monitoring() {
  print_step "PHASE 3: Monitoring Setup"

  echo "Monitoring commands:"
  echo ""
  echo "View Worker logs:"
  echo "  cd $WORKER_DIR && wrangler tail"
  echo ""
  echo "View Worker deployments:"
  echo "  cd $WORKER_DIR && wrangler deployments list"
  echo ""
  echo "View Pages deployments:"
  echo "  wrangler pages deployment list --project-name=ryla-landing"
  echo ""
  echo "For detailed analytics, use Cloudflare Dashboard:"
  echo "  - Workers: https://dash.cloudflare.com → Workers & Pages → $WORKER_NAME"
  echo "  - Pages: https://dash.cloudflare.com → Workers & Pages → [project-name]"
  echo ""
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
  echo "🚀 Cloudflare Complete Infrastructure Setup (Phases 1-3)"
  echo "=================================================="
  echo ""

  # Check prerequisites
  print_step "Checking Prerequisites"
  
  check_command "wrangler" "npm install -g wrangler"
  check_command "npm" "Install Node.js from https://nodejs.org"
  check_command "jq" "brew install jq (macOS) or apt-get install jq (Linux)"
  
  # Check authentication (OAuth or API token)
  WRANGLER_OUTPUT=$(wrangler whoami 2>&1)
  if echo "$WRANGLER_OUTPUT" | grep -q "You are not authenticated"; then
    # Check if API token is provided
    if [ -n "$CLOUDFLARE_API_TOKEN" ]; then
      print_success "Using CLOUDFLARE_API_TOKEN for authentication"
      export CLOUDFLARE_API_TOKEN
    else
      print_warning "Not logged in to Cloudflare"
      echo ""
      echo "Option 1: OAuth Login (Interactive)"
      echo "  Run: wrangler login"
      echo "  This will open a browser window for OAuth authentication."
      echo ""
      echo "Option 2: API Token (Automated)"
      echo "  Set environment variable: export CLOUDFLARE_API_TOKEN=your_token"
      echo "  Get token from: https://dash.cloudflare.com/profile/api-tokens"
      echo "  Required permissions: Account:Read, Workers:Edit, R2:Edit, Pages:Edit"
      echo ""
      read -p "Have you logged in or set CLOUDFLARE_API_TOKEN? (y/N): " -n 1 -r
      echo ""
      if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Please authenticate first, then run this script again."
        exit 1
      fi
      # Verify login again
      if [ -z "$CLOUDFLARE_API_TOKEN" ] && wrangler whoami 2>&1 | grep -q "You are not authenticated"; then
        print_error "Still not authenticated. Please login or set CLOUDFLARE_API_TOKEN."
        exit 1
      fi
    fi
  fi
  
  print_success "Authenticated with Cloudflare"
  wrangler whoami 2>&1 | head -3 || echo "Using API token authentication"

  # Confirm before proceeding
  echo ""
  read -p "Continue with setup? (y/N): " -n 1 -r
  echo ""
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled"
    exit 0
  fi

  # Phase 1: R2 Storage Setup
  phase1_r2_setup
  phase1_worker_setup

  # Phase 2: Pages Deployment
  phase2_pages_setup

  # Phase 3: Validation & Optimization
  phase3_validation
  phase3_monitoring

  # Summary
  echo ""
  echo "=================================================="
  print_success "Setup Complete!"
  echo ""
  echo "Next Steps:"
  echo ""
  echo "1. Generate R2 API Tokens:"
  echo "   https://dash.cloudflare.com → R2 → Manage R2 API Tokens"
  echo "   Create token with 'Object Read & Write' permissions"
  echo ""
  echo "2. Configure Pages Build Settings:"
  echo "   https://dash.cloudflare.com → Workers & Pages → [project-name] → Settings"
  echo "   - Set build commands"
  echo "   - Connect GitHub repository"
  echo "   - Add environment variables"
  echo ""
  echo "3. Set Custom Domains:"
  echo "   - Landing: www.ryla.ai, ryla.ai"
  echo "   - Funnel: goviral.ryla.ai"
  echo "   - Web: app.ryla.ai"
  echo ""
  echo "4. Update Environment Variables:"
  echo "   See: docs/ops/STORAGE-SETUP.md"
  echo ""
  echo "5. Test Deployments:"
  echo "   - Worker: curl https://$WORKER_NAME.<account>.workers.dev/test"
  echo "   - Pages: Check deployment status in Dashboard"
  echo ""
  echo "Documentation:"
  echo "  - Storage Setup: docs/ops/STORAGE-SETUP.md"
  echo "  - Pages Setup: docs/ops/CLOUDFLARE-PAGES-SETUP.md"
  echo "  - CDN Worker: docs/ops/CLOUDFLARE-CDN-WORKER.md"
  echo ""
}

# Run main function
main "$@"
