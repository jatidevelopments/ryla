#!/bin/bash
# Fly.io Setup Script
# This script helps set up Fly.io managed services and apps for RYLA deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
REGION="fra"
DB_NAME_PROD="ryla-db-prod"
DB_NAME_STAGING="ryla-db-staging"
REDIS_NAME_PROD="ryla-redis-prod"
REDIS_NAME_STAGING="ryla-redis-staging"

echo -e "${GREEN}🚀 RYLA Fly.io Setup Script${NC}"
echo ""

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo -e "${RED}❌ flyctl is not installed${NC}"
    echo "Install it with: brew install flyctl"
    exit 1
fi

echo -e "${GREEN}✅ flyctl is installed${NC}"

# Check if logged in
if ! flyctl auth whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Fly.io${NC}"
    echo "Logging in..."
    flyctl auth login
fi

echo -e "${GREEN}✅ Logged in to Fly.io${NC}"
echo ""

# Function to create PostgreSQL database
create_postgres() {
    local name=$1
    local env=$2
    
    echo -e "${YELLOW}Creating PostgreSQL database: ${name}${NC}"
    
    if flyctl postgres list | grep -q "$name"; then
        echo -e "${GREEN}✅ Database ${name} already exists${NC}"
    else
        echo "Creating database (this may take a few minutes)..."
        flyctl postgres create \
            --name "$name" \
            --region "$REGION" \
            --vm-size shared-cpu-1x \
            --volume-size 10
        
        echo -e "${GREEN}✅ Database ${name} created${NC}"
    fi
}

# Function to create Redis instance
create_redis() {
    local name=$1
    local env=$2
    
    echo -e "${YELLOW}Creating Redis instance: ${name}${NC}"
    
    if flyctl redis list | grep -q "$name"; then
        echo -e "${GREEN}✅ Redis ${name} already exists${NC}"
    else
        echo "Creating Redis instance..."
        flyctl redis create \
            --name "$name" \
            --region "$REGION" \
            --plan free
        
        echo -e "${GREEN}✅ Redis ${name} created${NC}"
    fi
}

# Function to create Fly.io app
create_app() {
    local app_name=$1
    
    echo -e "${YELLOW}Creating Fly.io app: ${app_name}${NC}"
    
    if flyctl apps list | grep -q "$app_name"; then
        echo -e "${GREEN}✅ App ${app_name} already exists${NC}"
    else
        flyctl apps create "$app_name"
        echo -e "${GREEN}✅ App ${app_name} created${NC}"
    fi
}

# Function to attach database to app
attach_database() {
    local db_name=$1
    local app_name=$2
    
    echo -e "${YELLOW}Attaching database ${db_name} to ${app_name}${NC}"
    
    # Check if already attached
    if flyctl postgres list | grep -q "$db_name"; then
        flyctl postgres attach "$db_name" --app "$app_name" || echo -e "${YELLOW}⚠️  Database may already be attached${NC}"
    else
        echo -e "${RED}❌ Database ${db_name} does not exist${NC}"
    fi
}

# Function to attach Redis to app
attach_redis() {
    local redis_name=$1
    local app_name=$2
    
    echo -e "${YELLOW}Attaching Redis ${redis_name} to ${app_name}${NC}"
    
    # Check if already attached
    if flyctl redis list | grep -q "$redis_name"; then
        flyctl redis attach "$redis_name" --app "$app_name" || echo -e "${YELLOW}⚠️  Redis may already be attached${NC}"
    else
        echo -e "${RED}❌ Redis ${redis_name} does not exist${NC}"
    fi
}

# Main setup
echo "Select setup option:"
echo "1) Production setup (creates production services and apps)"
echo "2) Staging setup (creates staging services and apps)"
echo "3) Both (production and staging)"
echo "4) Only create apps (skip services)"
read -p "Enter choice [1-4]: " choice

case $choice in
    1)
        echo -e "${GREEN}Setting up PRODUCTION environment...${NC}"
        
        # Create services
        create_postgres "$DB_NAME_PROD" "production"
        create_redis "$REDIS_NAME_PROD" "production"
        
        # Create apps
        create_app "ryla-landing"
        create_app "funnel-v3-adult"
        create_app "ryla-web"
        create_app "ryla-api"
        
        # Attach services to API
        attach_database "$DB_NAME_PROD" "ryla-api"
        attach_redis "$REDIS_NAME_PROD" "ryla-api"
        
        echo ""
        echo -e "${GREEN}✅ Production setup complete!${NC}"
        ;;
    2)
        echo -e "${GREEN}Setting up STAGING environment...${NC}"
        
        # Create services
        create_postgres "$DB_NAME_STAGING" "staging"
        create_redis "$REDIS_NAME_STAGING" "staging"
        
        # Create apps
        create_app "ryla-landing-staging"
        create_app "funnel-v3-adult-staging"
        create_app "ryla-web-staging"
        create_app "ryla-api-staging"
        
        # Attach services to API
        attach_database "$DB_NAME_STAGING" "ryla-api-staging"
        attach_redis "$REDIS_NAME_STAGING" "ryla-api-staging"
        
        echo ""
        echo -e "${GREEN}✅ Staging setup complete!${NC}"
        ;;
    3)
        echo -e "${GREEN}Setting up BOTH environments...${NC}"
        
        # Production
        create_postgres "$DB_NAME_PROD" "production"
        create_redis "$REDIS_NAME_PROD" "production"
        create_app "ryla-landing"
        create_app "funnel-v3-adult"
        create_app "ryla-web"
        create_app "ryla-api"
        attach_database "$DB_NAME_PROD" "ryla-api"
        attach_redis "$REDIS_NAME_PROD" "ryla-api"
        
        # Staging
        create_postgres "$DB_NAME_STAGING" "staging"
        create_redis "$REDIS_NAME_STAGING" "staging"
        create_app "ryla-landing-staging"
        create_app "funnel-v3-adult-staging"
        create_app "ryla-web-staging"
        create_app "ryla-api-staging"
        attach_database "$DB_NAME_STAGING" "ryla-api-staging"
        attach_redis "$REDIS_NAME_STAGING" "ryla-api-staging"
        
        echo ""
        echo -e "${GREEN}✅ Both environments setup complete!${NC}"
        ;;
    4)
        echo -e "${GREEN}Creating apps only...${NC}"
        
        # Production apps
        create_app "ryla-landing"
        create_app "funnel-v3-adult"
        create_app "ryla-web"
        create_app "ryla-api"
        
        # Staging apps
        create_app "ryla-landing-staging"
        create_app "funnel-v3-adult-staging"
        create_app "ryla-web-staging"
        create_app "ryla-api-staging"
        
        echo ""
        echo -e "${GREEN}✅ Apps created!${NC}"
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${YELLOW}📝 Next steps:${NC}"
echo "1. Configure domains (see docs/ops/FLY-IO-DEPLOYMENT-GUIDE.md)"
echo "2. Set environment variables (see docs/ops/FLY-IO-DEPLOYMENT-GUIDE.md)"
echo "3. Deploy applications"
echo ""
echo -e "${GREEN}✅ Setup script complete!${NC}"

