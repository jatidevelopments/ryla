# Image Optimization Guide

## Overview

Images used in the landing page (especially slider/hero background images) should be optimized for web performance. Large images significantly impact page load times and user experience.

## Compression Script

We have a Python script that automatically compresses images using Pillow (PIL):

**Location:** `scripts/utils/compress-slider-images.py`

### Usage

```bash
# Compress slider images (Python)
python3 scripts/utils/compress-slider-images.py

# OR use npm script
npm run compress:images
```

### What It Does

- Compresses WebP images in `apps/landing/public/images/posts/`
- Resizes images to max 800px width (appropriate for slider display)
- Uses WebP quality 80 (good balance between size and quality)
- Applies method 6 compression (best compression)
- **Overwrites original files** (backup recommended if needed)

### Current Settings

- **Max Width:** 800px
- **Quality:** 80 (0-100 scale)
- **Method:** 6 (0-6, higher = better compression)
- **Format:** WebP (maintains existing format)

### Results

Typical compression results:

- **Before:** ~1.2 MB per image
- **After:** ~30-40 KB per image
- **Reduction:** ~97% file size reduction

## When to Use

Run the compression script when:

- Adding new slider images to `apps/landing/public/images/posts/`
- Images are larger than 100 KB
- Page load performance is slow
- Before deploying to production

## Manual Optimization

If you need to adjust settings, edit `scripts/utils/compress-slider-images.py`:

```python
MAX_WIDTH = 800  # Adjust based on display size
QUALITY = 80     # Lower = smaller files, higher = better quality
METHOD = 6       # Higher = better compression (slower)
```

## Best Practices

1. **Always compress before committing** large images
2. **Use WebP format** for web images (better compression than JPEG/PNG)
3. **Target file sizes:**
   - Slider/background images: < 50 KB
   - Feature images: < 100 KB
   - Hero images: < 200 KB
4. **Test visual quality** after compression to ensure acceptable results
5. **Consider responsive images** for different screen sizes if needed

## Dependencies

The script requires Pillow (PIL):

```bash
pip install Pillow
```

Or via package manager:

```bash
# macOS
brew install pillow

# Ubuntu/Debian
sudo apt-get install python3-pil
```

## Troubleshooting

### Images look pixelated after compression

- Increase `QUALITY` value (try 85-90)
- Increase `MAX_WIDTH` if images are displayed larger

### Compression is too slow

- Decrease `METHOD` value (try 4-5)
- Process images in smaller batches

### Script not found

- Ensure you're running from project root
- Check that `scripts/utils/compress-slider-images.py` exists
- Verify Python 3 is installed: `python3 --version`
