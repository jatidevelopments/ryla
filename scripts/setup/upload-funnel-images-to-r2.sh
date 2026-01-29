#!/bin/bash
# Upload funnel app images to R2 bucket for CDN serving

set -e

BUCKET="ryla-images"
SOURCE_DIRS=("apps/funnel/public/images" "apps/funnel/public/mdc-images")

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_step() {
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}$1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
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

# Check if source directories exist
for dir in "${SOURCE_DIRS[@]}"; do
  if [ ! -d "$dir" ]; then
    print_warning "Source directory not found: $dir (skipping)"
  fi
done

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null; then
  print_error "wrangler CLI not found. Install with: npm install -g wrangler"
  exit 1
fi

# Check if authenticated
if ! wrangler whoami &> /dev/null; then
  print_error "Not authenticated. Run: wrangler login"
  exit 1
fi

print_step "Uploading funnel images to R2 bucket: $BUCKET"

# Count files to upload
TOTAL_FILES=0
for dir in "${SOURCE_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    count=$(find "$dir" -type f | wc -l | tr -d ' ')
    TOTAL_FILES=$((TOTAL_FILES + count))
  fi
done

UPLOADED=0
FAILED=0

# Function to get content type from extension
get_content_type() {
  local file="$1"
  local ext="${file##*.}"
  case "$ext" in
    webp) echo "image/webp" ;;
    png) echo "image/png" ;;
    jpg|jpeg) echo "image/jpeg" ;;
    svg) echo "image/svg+xml" ;;
    gif) echo "image/gif" ;;
    ico) echo "image/x-icon" ;;
    *) echo "application/octet-stream" ;;
  esac
}

# Upload files from each source directory
for SOURCE_DIR in "${SOURCE_DIRS[@]}"; do
  if [ ! -d "$SOURCE_DIR" ]; then
    continue
  fi
  
  print_step "Uploading from: $SOURCE_DIR"
  
  find "$SOURCE_DIR" -type f | while read -r file; do
    # Get relative path from public directory
    rel_path="${file#apps/funnel/public/}"
    
    # R2 object key (preserve directory structure from public/)
    object_key="$rel_path"
  
    # Get content type
    content_type=$(get_content_type "$file")
  
    # Get file size
    file_size=$(ls -lh "$file" | awk '{print $5}')
  
    echo -n "  Uploading: $rel_path ($file_size) ... "
  
    # Upload to R2
    if wrangler r2 object put "$BUCKET/$object_key" \
      --file="$file" \
      --content-type="$content_type" \
      --remote \
      &> /dev/null; then
      echo -e "${GREEN}✅${NC}"
      ((UPLOADED++))
    else
      echo -e "${RED}❌${NC}"
      ((FAILED++))
      print_warning "Failed to upload: $rel_path"
    fi
  done
done

echo ""
print_step "Upload Summary"
echo "  Total files: $TOTAL_FILES"
echo "  Uploaded: $UPLOADED"
echo "  Failed: $FAILED"

if [ $FAILED -eq 0 ]; then
  print_success "All images uploaded successfully!"
  echo ""
  echo "🌐 Test CDN:"
  echo "   curl -I https://ryla-r2-cdn-proxy.janistirtey1.workers.dev/images/company-logos/sprite.webp"
  echo ""
  echo "🔄 Next step: Redeploy funnel app to use CDN"
  echo "   bash scripts/setup/deploy-cloudflare-pages.sh funnel"
else
  print_error "Some images failed to upload"
  exit 1
fi
