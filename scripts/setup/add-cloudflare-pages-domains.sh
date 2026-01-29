#!/bin/bash
# Add custom domains to Cloudflare Pages projects
# Note: Custom domains must be added via Cloudflare Dashboard or API
# This script provides instructions and checks current status

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Projects and their domains (using arrays for bash compatibility)
PROJECTS=("ryla-landing" "ryla-funnel")
LANDING_DOMAINS=("www.ryla.ai" "ryla.ai")
FUNNEL_DOMAINS=("goviral.ryla.ai")

print_step() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
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

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
    print_error "Wrangler CLI is not installed"
    echo "Install it with: npm install -g wrangler"
    exit 1
fi

# Check if logged in
if ! wrangler whoami &> /dev/null; then
    print_error "Not logged in to Cloudflare"
    echo "Run: wrangler login"
    exit 1
fi

print_step "Cloudflare Pages Custom Domain Setup"

echo "Custom domains for Cloudflare Pages must be added via the Dashboard."
echo "Wrangler CLI does not support adding custom domains directly."
echo ""
echo "However, you can use the Cloudflare API to add domains programmatically."
echo ""

# Check if API token is set
if [ -z "$CLOUDFLARE_API_TOKEN" ]; then
    print_warning "CLOUDFLARE_API_TOKEN not set"
    echo "To use the API method, set: export CLOUDFLARE_API_TOKEN=your_token"
    echo ""
    echo "Alternatively, add domains via Dashboard:"
    echo ""
    
    # Landing domains
    echo "📦 Project: ryla-landing"
    echo "   Domains: ${LANDING_DOMAINS[*]}"
    echo "   Dashboard: https://dash.cloudflare.com/?to=/:account/pages/view/ryla-landing"
    echo "   Steps:"
    echo "   1. Go to: Workers & Pages → ryla-landing → Custom domains"
    echo "   2. Click 'Set up a custom domain'"
    for domain in "${LANDING_DOMAINS[@]}"; do
        echo "   3. Add domain: $domain"
    done
    echo "   4. Cloudflare will auto-provision SSL"
    echo ""
    
    # Funnel domains
    echo "📦 Project: ryla-funnel"
    echo "   Domains: ${FUNNEL_DOMAINS[*]}"
    echo "   Dashboard: https://dash.cloudflare.com/?to=/:account/pages/view/ryla-funnel"
    echo "   Steps:"
    echo "   1. Go to: Workers & Pages → ryla-funnel → Custom domains"
    echo "   2. Click 'Set up a custom domain'"
    for domain in "${FUNNEL_DOMAINS[@]}"; do
        echo "   3. Add domain: $domain"
    done
    echo "   4. Cloudflare will auto-provision SSL"
    echo ""
else
    print_info "CLOUDFLARE_API_TOKEN is set - attempting API method"
    
    # Get account ID
    ACCOUNT_ID=$(wrangler whoami | grep -oP 'Account ID: \K[^\s]+' || echo "")
    
    if [ -z "$ACCOUNT_ID" ]; then
        print_error "Could not get Account ID"
        exit 1
    fi
    
    print_info "Account ID: $ACCOUNT_ID"
    
    # Add domains via API
    # Landing domains
    print_step "Adding domains to ryla-landing"
    for domain in "${LANDING_DOMAINS[@]}"; do
        echo "Adding domain: $domain"
        
        # Cloudflare Pages API endpoint
        response=$(curl -s -X POST \
            "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/ryla-landing/domains" \
            -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{\"domain\":\"$domain\"}")
        
        # Check response
        if echo "$response" | grep -q '"success":true'; then
            print_success "Added domain: $domain"
        elif echo "$response" | grep -q "already exists\|already configured"; then
            print_warning "Domain already exists: $domain"
        else
            print_error "Failed to add domain: $domain"
            echo "Response: $response"
        fi
    done
    
    # Funnel domains
    print_step "Adding domains to ryla-funnel"
    for domain in "${FUNNEL_DOMAINS[@]}"; do
        echo "Adding domain: $domain"
        
        # Cloudflare Pages API endpoint
        response=$(curl -s -X POST \
            "https://api.cloudflare.com/client/v4/accounts/$ACCOUNT_ID/pages/projects/ryla-funnel/domains" \
            -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
            -H "Content-Type: application/json" \
            -d "{\"domain\":\"$domain\"}")
        
        # Check response
        if echo "$response" | grep -q '"success":true'; then
            print_success "Added domain: $domain"
        elif echo "$response" | grep -q "already exists\|already configured"; then
            print_warning "Domain already exists: $domain"
        else
            print_error "Failed to add domain: $domain"
            echo "Response: $response"
        fi
    done
fi

print_step "DNS Configuration Required"

echo "After adding domains in Cloudflare, configure DNS:"
echo ""
echo "If domain is on Cloudflare:"
echo "  - DNS is automatically configured"
echo ""
echo "If domain is elsewhere:"
echo "  - Add CNAME record for each domain:"
for domain in "${LANDING_DOMAINS[@]}"; do
    echo "    $domain → ryla-landing.pages.dev"
done
for domain in "${FUNNEL_DOMAINS[@]}"; do
    echo "    $domain → ryla-funnel.pages.dev"
done
echo ""

print_step "Verification"

echo "After DNS propagates (can take up to 24 hours), verify:"
echo ""
for domain in "${LANDING_DOMAINS[@]}"; do
    echo "  curl -I https://$domain"
done
for domain in "${FUNNEL_DOMAINS[@]}"; do
    echo "  curl -I https://$domain"
done
echo ""

print_success "Setup instructions complete"
print_info "Add domains via Dashboard or set CLOUDFLARE_API_TOKEN for API method"
