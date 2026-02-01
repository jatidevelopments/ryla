#!/bin/bash
# Upload wizard images to R2 bucket for CDN serving

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_step() { echo -e "\n${YELLOW}▶ $1${NC}"; }
print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }

# Navigate to project root
cd "$(dirname "$0")/../.."

BUCKET="ryla-images"
SOURCE_DIR="apps/web/.vercel/output/static/images/wizard"

# Check if source directory exists
if [ ! -d "$SOURCE_DIR" ]; then
  # Fallback to public directory if vercel output doesn't exist
  SOURCE_DIR="apps/web/public/images/wizard"
  if [ ! -d "$SOURCE_DIR" ]; then
    print_error "Wizard images directory not found!"
    print_error "Run 'pnpm nx build web' first to generate images in .vercel/output/"
    exit 1
  fi
fi

print_step "Uploading Wizard Images to R2 bucket: $BUCKET"
echo "Source: $SOURCE_DIR"

# Count files
TOTAL=$(find "$SOURCE_DIR" -name "*.webp" | wc -l | tr -d ' ')
echo "Total images to upload: $TOTAL"

# Upload each file
COUNT=0
ERRORS=0

find "$SOURCE_DIR" -name "*.webp" | while read -r file; do
  # Get relative path from source dir
  REL_PATH="${file#$SOURCE_DIR/}"
  R2_KEY="images/wizard/$REL_PATH"
  
  COUNT=$((COUNT + 1))
  echo -ne "\rUploading: $COUNT/$TOTAL - $REL_PATH"
  
  # Upload to R2
  if ! npx wrangler r2 object put "$BUCKET/$R2_KEY" --file="$file" --content-type="image/webp" 2>/dev/null; then
    ERRORS=$((ERRORS + 1))
  fi
done

echo ""

if [ $ERRORS -eq 0 ]; then
  print_success "All $TOTAL images uploaded to R2 bucket: $BUCKET"
else
  print_error "$ERRORS errors occurred during upload"
fi

# Verify a sample image
print_step "Verifying upload..."
SAMPLE_URL="https://cdn.ryla.ai/images/wizard/appearance/caucasian/ethnicity/female-portrait.webp"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$SAMPLE_URL")

if [ "$HTTP_CODE" = "200" ]; then
  print_success "Sample image verified: $SAMPLE_URL"
else
  print_error "Sample image returned HTTP $HTTP_CODE: $SAMPLE_URL"
fi

print_success "Done!"
