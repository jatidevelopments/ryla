# Web App Performance Optimization Plan

**Based on**: McMaster-Carr case study analysis  
**Target**: `apps/web`  
**Goal**: Achieve < 3s page load, improve perceived performance

## Current State

### ✅ Already Implemented

- Next.js SSR (server-side rendering)
- Font optimization (`next/font/google` with `display: 'swap'`)
- Code splitting (Next.js automatic)
- Basic CDN support (via env vars)

### ❌ Missing Optimizations

- Resource preloading
- Critical CSS inlining
- HTML prefetching on hover
- Service Worker caching
- Fixed image dimensions
- Performance monitoring

## Implementation Plan

### Phase 1: Quick Wins (High Priority)

#### 1.1 Resource Preloading

**File**: `apps/web/app/layout.tsx`

**Changes**:

- Add `<link rel="preload">` for critical assets:
  - Logo image
  - Critical fonts (already optimized, but add explicit preload)
  - Critical images (hero, above-fold)
- Add DNS prefetch for external domains:
  - Supabase
  - PostHog
  - CDN domains

**Estimated Impact**: 100-200ms faster initial render

#### 1.2 Fixed Image Dimensions

**Files**: All components using `<img>` or Next.js `Image`

**Changes**:

- Ensure all images have explicit `width` and `height`
- Use Next.js `Image` component with dimensions
- For background images, set container dimensions

**Estimated Impact**: Eliminates CLS, improves LCP

#### 1.3 Critical CSS Inlining

**File**: `apps/web/next.config.js`

**Changes**:

- Add `critters` package (already in dependencies)
- Configure Next.js to inline critical CSS
- Extract and inline above-fold CSS

**Estimated Impact**: 50-100ms faster FCP

### Phase 2: Performance Boost (Medium Priority)

#### 2.1 HTML Prefetching on Hover

**File**: Create `apps/web/lib/prefetch.ts`

**Changes**:

- Create utility to prefetch on link hover
- Apply to internal navigation links
- Use Next.js router prefetching

**Implementation**:

```typescript
// lib/prefetch.ts
export function useLinkPrefetch() {
  const handleMouseEnter = (href: string) => {
    // Prefetch page HTML
    router.prefetch(href);
  };
  return { handleMouseEnter };
}
```

**Estimated Impact**: Instant navigation feel

#### 2.2 Service Worker for Caching

**File**: `apps/web/public/sw.js` + `apps/web/app/layout.tsx`

**Changes**:

- Create service worker for HTML caching
- Register in layout
- Cache strategy: NetworkFirst with fallback to cache

**Estimated Impact**: 7ms repeat visit loads

#### 2.3 Performance Monitoring

**File**: `apps/web/lib/performance.ts`

**Changes**:

- Add `window.performance` marks
- Track LCP, FID, CLS
- Send to PostHog analytics

**Estimated Impact**: Better visibility into performance issues

### Phase 3: Optimization (Low Priority)

#### 3.1 Next.js Config Optimization

**File**: `apps/web/next.config.js`

**Changes**:

- Add `optimizePackageImports` for heavy packages
- Enable compression
- Configure image optimization (if not already)
- Add bundle analyzer

#### 3.2 Image Optimization

**Files**: All image usage

**Changes**:

- Use WebP/AVIF formats
- Lazy load below-fold images
- Consider image sprites for icons (if many small images)

## Implementation Order

1. **Week 1**: Phase 1 (Quick Wins)

   - Resource preloading
   - Fixed image dimensions
   - Critical CSS inlining

2. **Week 2**: Phase 2 (Performance Boost)

   - HTML prefetching
   - Service Worker
   - Performance monitoring

3. **Week 3**: Phase 3 (Optimization)
   - Next.js config tuning
   - Image optimization audit

## Success Metrics

- **LCP**: < 2.5s (target: < 1.5s)
- **FID**: < 100ms
- **CLS**: < 0.1
- **TTFB**: < 200ms
- **Repeat Visit Load**: < 100ms

## Testing

- Use Lighthouse for metrics
- Test on slow 3G connection
- Test on mobile devices
- Monitor PostHog performance events

## Dependencies

- `critters` (already in package.json)
- Next.js built-in features (no new deps needed for most)

## Notes

- All optimizations should maintain >98% browser compatibility
- Mobile-first approach
- No breaking changes to existing functionality
- Follow MVP principles: speed > perfection
