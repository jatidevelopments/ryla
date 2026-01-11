#!/bin/bash
# Add domains to Fly.io apps
# Run this after apps are created

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🌐 Adding Domains to RYLA Apps${NC}"
echo ""

# Domains configuration per docs/ops/DOMAIN-REGISTRY.md
# Format: app_name:domain1 domain2
add_domain_to_app() {
    local app=$1
    shift
    local domains="$@"
    
    echo -e "${BLUE}Adding domains to ${app}...${NC}"
    for domain in $domains; do
        echo -e "${YELLOW}  Adding ${domain}${NC}"
        if flyctl certs add "$domain" --app "$app" 2>&1; then
            echo -e "${GREEN}  ✅ Added ${domain}${NC}"
            echo -e "${YELLOW}  📝 Configure DNS as shown above${NC}"
        else
            echo -e "${YELLOW}  ⚠️  ${domain} may already be configured${NC}"
        fi
        echo ""
    done
}

add_domain_to_app "ryla-landing-prod" "www.ryla.ai" "ryla.ai"
add_domain_to_app "ryla-funnel-prod" "goviral.ryla.ai"
add_domain_to_app "ryla-web-prod" "app.ryla.ai"
add_domain_to_app "ryla-api-prod" "end.ryla.ai"

echo -e "${GREEN}✅ Domain setup complete!${NC}"
echo ""
echo -e "${YELLOW}📝 Next: Configure DNS records at your domain registrar${NC}"
echo "Fly.io will provide DNS instructions when you add each certificate."

