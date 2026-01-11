#!/bin/bash
# Complete Fly.io Setup Script
# Creates apps, services, and configures domains

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

REGION="fra"
ORG="my-dream-companion"

echo -e "${BLUE}🚀 RYLA Complete Fly.io Setup${NC}"
echo -e "${BLUE}Organization: ${ORG}${NC}"
echo ""

# Check login
if ! flyctl auth whoami &> /dev/null; then
    echo -e "${RED}❌ Not logged in. Run: flyctl auth login${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Logged in to Fly.io${NC}"
echo ""

# Function to create app if it doesn't exist
create_app() {
    local app_name=$1
    # Check if app exists in our org
    if flyctl apps list --org "$ORG" 2>/dev/null | grep -q "$app_name"; then
        echo -e "${GREEN}✅ App ${app_name} already exists in ${ORG}${NC}"
        return 0
    else
        echo -e "${YELLOW}Creating app: ${app_name}${NC}"
        # Try to create, capture output
        local output=$(flyctl apps create "$app_name" --org "$ORG" 2>&1)
        local exit_code=$?
        
        if [ $exit_code -eq 0 ]; then
            echo -e "${GREEN}✅ Created app: ${app_name}${NC}"
            return 0
        elif echo "$output" | grep -q "already been taken"; then
            echo -e "${YELLOW}⚠️  App name ${app_name} is already taken globally${NC}"
            echo -e "${YELLOW}   App names are globally unique in Fly.io${NC}"
            echo -e "${YELLOW}   The app may exist in another organization${NC}"
            echo -e "${YELLOW}   You can:${NC}"
            echo -e "${YELLOW}   1. Use a different name (e.g., ${app_name}-mdc)${NC}"
            echo -e "${YELLOW}   2. Delete the existing app if you own it${NC}"
            echo -e "${YELLOW}   3. Transfer the app to ${ORG} if you have access${NC}"
            return 1
        else
            echo -e "${RED}❌ Failed to create app: ${app_name}${NC}"
            echo "$output"
            return 1
        fi
    fi
}

# Function to create PostgreSQL database
create_postgres() {
    local name=$1
    if flyctl postgres list | grep -q "$name"; then
        echo -e "${GREEN}✅ PostgreSQL ${name} already exists${NC}"
        return 0
    else
        echo -e "${YELLOW}Creating PostgreSQL: ${name}${NC}"
        echo "This may take a few minutes..."
        # Use managed postgres (mpg) for non-interactive setup
        flyctl postgres create \
            --name "$name" \
            --region "$REGION" \
            --vm-size shared-cpu-1x \
            --volume-size 10 \
            --org "$ORG" \
            --yes || {
            echo -e "${YELLOW}⚠️  Standard postgres create failed, trying managed postgres (mpg)...${NC}"
            # Try managed postgres as fallback
            flyctl mpg create "$name" --region "$REGION" --org "$ORG" || {
                echo -e "${RED}❌ Failed to create PostgreSQL. You may need to create it manually.${NC}"
                return 1
            }
        }
        echo -e "${GREEN}✅ Created PostgreSQL: ${name}${NC}"
    fi
}

# Function to create Redis
create_redis() {
    local name=$1
    if flyctl redis list | grep -q "$name"; then
        echo -e "${GREEN}✅ Redis ${name} already exists${NC}"
        return 0
    else
        echo -e "${YELLOW}Creating Redis: ${name}${NC}"
        flyctl redis create \
            --name "$name" \
            --region "$REGION" \
            --plan free \
            --org "$ORG"
        echo -e "${GREEN}✅ Created Redis: ${name}${NC}"
    fi
}

# Function to attach database
attach_database() {
    local db_name=$1
    local app_name=$2
    echo -e "${YELLOW}Attaching ${db_name} to ${app_name}${NC}"
    flyctl postgres attach "$db_name" --app "$app_name" || echo -e "${YELLOW}⚠️  May already be attached${NC}"
}

# Function to attach Redis
attach_redis() {
    local redis_name=$1
    local app_name=$2
    echo -e "${YELLOW}Attaching ${redis_name} to ${app_name}${NC}"
    flyctl redis attach "$redis_name" --app "$app_name" || echo -e "${YELLOW}⚠️  May already be attached${NC}"
}

# Function to add domain
add_domain() {
    local domain=$1
    local app_name=$2
    echo -e "${YELLOW}Adding domain ${domain} to ${app_name}${NC}"
    # Use certs add command for domains in Fly.io
    flyctl certs add "$domain" --app "$app_name" || echo -e "${YELLOW}⚠️  Domain may already be configured or needs DNS setup${NC}"
}

echo -e "${BLUE}Step 1: Creating Fly.io Apps${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
create_app "ryla-landing-prod"
create_app "ryla-funnel-prod"
create_app "ryla-web-prod"
create_app "ryla-api-prod"
echo ""

echo -e "${BLUE}Step 2: Creating Managed Services${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
create_postgres "ryla-db-prod"
create_redis "ryla-redis-prod"
echo ""

echo -e "${BLUE}Step 3: Attaching Services to API${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
attach_database "ryla-db-prod" "ryla-api-prod"
attach_redis "ryla-redis-prod" "ryla-api-prod"
echo ""

echo -e "${BLUE}Step 4: Configuring Domains${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
add_domain "www.ryla.ai" "ryla-landing-prod"
add_domain "ryla.ai" "ryla-landing-prod"
add_domain "goviral.ryla.ai" "ryla-funnel-prod"
add_domain "app.ryla.ai" "ryla-web-prod"
add_domain "end.ryla.ai" "ryla-api-prod"
echo ""

echo -e "${GREEN}✅ Setup Complete!${NC}"
echo ""
echo -e "${YELLOW}📝 Next Steps:${NC}"
echo "1. Set environment variables (see docs/ops/FLY-IO-DEPLOYMENT-GUIDE.md)"
echo "2. Deploy applications"
echo "3. Run database migrations"
echo ""
echo -e "${BLUE}View your apps:${NC}"
echo "  flyctl apps list"
echo ""
echo -e "${BLUE}View domains:${NC}"
echo "  flyctl domains list"

