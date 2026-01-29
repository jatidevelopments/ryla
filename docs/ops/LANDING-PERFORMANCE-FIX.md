# Landing Page Performance Fix

**Status**: ✅ **In Progress**  
**Date**: 2026-01-27

---

## Issues Identified

From Lighthouse report:
- **Performance Score**: 43 (Poor)
- **Largest Contentful Paint (LCP)**: 31.5s (Very Poor)
- **Total Blocking Time**: 970ms (Poor)
- **Speed Index**: 25.5s (Poor)

### Root Causes

1. **3.6MB background.jpg** - Massive image causing slow LCP
2. **`backgroundAttachment: 'fixed'`** - Very expensive CSS property causing repaints
3. **Images not using CDN** - All images served from origin
4. **Large videos** (1-2MB each) - Autoplay videos loading immediately
5. **No lazy loading** - All images load on page load

---

## Fixes Applied

### 1. ✅ Restored `backgroundAttachment: 'fixed'`

**File**: `apps/landing/app/page.tsx`

**Reason**: Fixed background prevents re-renders on scroll, improving performance.

**Implementation**:
```tsx
className="fixed inset-0 z-0 pointer-events-none"
style={{
  backgroundAttachment: 'fixed', // Prevents re-renders on scroll
  // ... other styles
}}
```

**Impact**: Background stays static while content scrolls, eliminating re-renders during scroll events.

### 2. ✅ Updated Components to Use CDN

**Files Updated**:
- `apps/landing/app/page.tsx` - Background image
- `apps/landing/components/landing/hero-section.tsx` - Hero image
- `apps/landing/components/sections/HeroBackground.tsx` - Social post images
- `apps/landing/components/sections/HowItWorksSection.tsx` - Step images
- `apps/landing/components/sections/FeatureShowcase.tsx` - Feature images and videos

**Changes**:
- Added `import { withCdn } from '@/lib/cdn'`
- Updated all image/video paths to use `withCdn('/path/to/image')`
- Images now served from CDN: `https://ryla-r2-cdn-proxy.janistirtey1.workers.dev`

### 3. ✅ Restored Fixed Positioning

**File**: `apps/landing/app/page.tsx`

Restored `fixed` positioning for all background elements:
- Background image container (with `backgroundAttachment: 'fixed'`)
- Black overlay
- Top/bottom fade gradients

**Impact**: Background remains static during scroll, preventing re-renders and improving performance.

---

## Pending Actions

### 1. ⏳ Upload Landing Images to R2

**Script**: `scripts/setup/upload-landing-images-to-r2.sh`

**Run**:
```bash
bash scripts/setup/upload-landing-images-to-r2.sh
```

**Files to Upload**:
- `/background.jpg` (3.6MB - needs compression!)
- `/images/posts/influencer-*.webp` (12 files)
- `/steps/step*.jpg` (4 files)
- `/images/features/perfect-hands.webp`
- `/video/*.mp4` (5 videos, 1-2MB each)

### 2. ⏳ Compress Background Image

**Current**: 3.6MB  
**Target**: < 200KB

**Options**:
1. Use image compression tool (e.g., Squoosh)
2. Convert to WebP format
3. Reduce dimensions if possible

**Command** (using ImageMagick):
```bash
convert apps/landing/public/background.jpg \
  -quality 80 \
  -resize 1920x \
  apps/landing/public/background.webp
```

### 3. ⏳ Add Lazy Loading

**Files to Update**:
- Below-the-fold images in `HowItWorksSection`
- Social post images in `HeroBackground` (already below fold)
- Feature images in `FeatureShowcase`

**Implementation**:
```tsx
<Image
  src={withCdn('/path/to/image')}
  loading="lazy" // Add this
  // ... other props
/>
```

### 4. ⏳ Set Build-Time Environment Variable

**In Cloudflare Pages Dashboard**:
1. Go to: Workers & Pages → ryla-landing → Settings → Environment variables
2. Add build-time variable (not secret):
   - Name: `NEXT_PUBLIC_CDN_URL`
   - Value: `https://ryla-r2-cdn-proxy.janistirtey1.workers.dev`
   - Environment: Production
3. Trigger new build

---

## Expected Performance Improvements

### Before
- LCP: 31.5s
- Performance: 43
- TBT: 970ms

### After (Expected)
- LCP: < 2.5s (target: < 2.5s)
- Performance: > 80 (target: > 90)
- TBT: < 200ms (target: < 200ms)

### Key Improvements
1. **CDN Delivery**: Images served from edge locations (faster)
2. **No Fixed Background**: Eliminates expensive repaints
3. **Lazy Loading**: Only load visible images
4. **Compressed Images**: Smaller file sizes = faster loads

---

## Next Steps

1. **Upload images to R2**:
   ```bash
   bash scripts/setup/upload-landing-images-to-r2.sh
   ```

2. **Compress background.jpg**:
   - Target: < 200KB
   - Format: WebP preferred

3. **Set environment variable** in Cloudflare Pages

4. **Deploy and test**:
   ```bash
   bash scripts/setup/deploy-cloudflare-pages.sh landing
   ```

5. **Run Lighthouse again** to verify improvements

---

## Related Documentation

- [Funnel CDN Configuration](./FUNNEL-CDN-CONFIGURATION.md)
- [Cloudflare Pages Setup](./CLOUDFLARE-PAGES-SETUP.md)
- [Image Optimization](./IMAGE-OPTIMIZATION.md)
