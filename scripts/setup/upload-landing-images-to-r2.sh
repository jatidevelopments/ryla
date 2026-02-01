#!/bin/bash
# Upload landing app images to R2 bucket for CDN serving

set -e

BUCKET="ryla-images"
SOURCE_DIR="apps/landing/public"

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

print_step "Uploading Landing Page Images to R2"

if [ ! -d "$SOURCE_DIR" ]; then
    print_error "Source directory not found: $SOURCE_DIR"
    exit 1
fi

# Count files
TOTAL_FILES=$(find "$SOURCE_DIR" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.webp" -o -name "*.mp4" \) | wc -l | tr -d ' ')

if [ "$TOTAL_FILES" -eq 0 ]; then
    print_warning "No image/video files found in $SOURCE_DIR"
    exit 0
fi

print_info "Found $TOTAL_FILES files to upload"

UPLOADED=0
FAILED=0
SKIPPED=0

# Upload files
find "$SOURCE_DIR" -type f \( -name "*.jpg" -o -name "*.jpeg" -o -name "*.png" -o -name "*.webp" -o -name "*.mp4" \) | while read -r file; do
    # Get relative path from public directory
    rel_path="${file#$SOURCE_DIR/}"
    
    # R2 object key (preserve directory structure from public/)
    object_key="$rel_path"
    
    # Get file size
    file_size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null || echo "0")
    file_size_mb=$(echo "scale=2; $file_size / 1024 / 1024" | bc)
    
    # Determine content type
    case "$file" in
        *.jpg|*.jpeg) content_type="image/jpeg" ;;
        *.png) content_type="image/png" ;;
        *.webp) content_type="image/webp" ;;
        *.mp4) content_type="video/mp4" ;;
        *) content_type="application/octet-stream" ;;
    esac
    
    # Check if file already exists (optional - can skip if you want to overwrite)
    echo -n "Uploading $rel_path (${file_size_mb}MB)... "
    
    # Upload to R2 (--remote flag ensures upload to remote bucket, not local)
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

print_step "Upload Summary"
echo "Total files: $TOTAL_FILES"
echo -e "${GREEN}Uploaded: $UPLOADED${NC}"
if [ "$FAILED" -gt 0 ]; then
    echo -e "${RED}Failed: $FAILED${NC}"
fi
if [ "$SKIPPED" -gt 0 ]; then
    echo -e "${YELLOW}Skipped: $SKIPPED${NC}"
fi

if [ "$UPLOADED" -gt 0 ]; then
    print_success "Images uploaded to R2 bucket: $BUCKET"
    print_info "CDN URL: https://ryla-r2-cdn-proxy.janistirtey1.workers.dev"
    print_info "Next: Set NEXT_PUBLIC_CDN_URL in Cloudflare Pages environment variables"
fi
