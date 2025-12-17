# Website Performance Optimization - McMaster-Carr Case Study

**Video**: https://www.youtube.com/watch?v=-Ln-8QM8KhQ  
**Date**: 2025-01-27  
**Duration**: 13:26

## Summary

Analysis of McMaster-Carr's website optimization techniques that make it one of the fastest websites on the internet, despite using older technology (ASP.NET, jQuery, YUI from 2008).

## Key Techniques Identified

### 1. Server-Side Rendering (SSR)

- **What**: Server returns complete HTML, no client-side framework overhead
- **Benefit**: Browser can render immediately without waiting for JavaScript
- **Status for RYLA**: ✅ Already using Next.js SSR

### 2. HTML Prefetching on Hover

- **What**: When user hovers over a link, prefetch the HTML for that page
- **Implementation**: Network requests fire on hover, HTML ready before click
- **Benefit**: Instant navigation when clicked
- **Status for RYLA**: ❌ Not implemented

### 3. Push State Navigation

- **What**: Swap HTML content without full page reload
- **Implementation**: Replace only the changing parts (content), keep nav/cart
- **Benefit**: Feels like SPA but with SSR benefits
- **Status for RYLA**: ⚠️ Next.js does this, but could be optimized

### 4. Aggressive Caching

- **What**: CDN + Service Worker for offline/instant loads
- **Implementation**:
  - CDN (Squid Cache) for pre-rendered HTML
  - Service Worker intercepts requests, serves cached HTML
- **Benefit**: 7ms load times on repeat visits
- **Status for RYLA**: ⚠️ CDN configured, but no Service Worker

### 5. Critical CSS Inlined

- **What**: Critical CSS loaded in `<style>` tag in `<head>`
- **Benefit**: No render blocking, CSS ready before HTML parsing
- **Implementation**: Extract critical CSS, inline it, lazy load rest
- **Status for RYLA**: ❌ CSS likely loaded via external files

### 6. Resource Preloading

- **What**: `<link rel="preload">` for fonts, images, DNS prefetch
- **Implementation**:
  - Preload logo, web fonts
  - DNS prefetch for image domains
  - Preload critical images
- **Benefit**: Eliminates waterfall requests
- **Status for RYLA**: ⚠️ Fonts optimized, but no explicit preloads

### 7. Fixed Image Dimensions

- **What**: Explicit width/height on all images
- **Benefit**: Prevents Cumulative Layout Shift (CLS)
- **Implementation**: Set dimensions in HTML/CSS before image loads
- **Status for RYLA**: ⚠️ Some images may lack dimensions

### 8. Image Sprites

- **What**: Combine multiple small images into one file
- **Benefit**: Reduces HTTP requests (93KB for all page images)
- **Implementation**: Single sprite image, CSS background-position
- **Status for RYLA**: ❌ Not implemented (may not be needed)

### 9. Page-Specific JavaScript

- **What**: Only load JavaScript needed for current page
- **Implementation**: Server knows which JS each page needs, includes only that
- **Benefit**: Smaller bundles, faster initial load
- **Status for RYLA**: ✅ Next.js automatic code splitting

### 10. Performance Monitoring

- **What**: `window.performance` marks and measures
- **Benefit**: Track LCP, FID, CLS in real-time
- **Status for RYLA**: ⚠️ PostHog analytics, but no performance marks

## Performance Metrics

- **Largest Contentful Paint (LCP)**: 174ms
- **Repeat Visit Load Time**: 7ms (from Service Worker cache)
- **First Visit Load Time**: 65ms (from CDN)

## Key Insight

> "A wicked fast website does not matter what framework or whatever you're using. You can be using 15-year-old Tech and it's still loading a fair amount (800KB of JavaScript) but it feels fast because they're doing it in such a way that it's not getting in the way of the actual important stuff."

## Applicability to RYLA

### High Priority (Quick Wins)

1. ✅ Resource preloading in layout
2. ✅ Fixed image dimensions
3. ✅ Critical CSS inlining

### Medium Priority (Performance Boost)

4. ✅ HTML prefetching on hover
5. ✅ Service Worker for caching
6. ✅ Performance monitoring

### Low Priority (Optimization)

7. ⚠️ Image sprites (may not be needed)
8. ✅ Further bundle optimization

## MVP Alignment

These techniques align with RYLA MVP principles:

- ✅ Mobile first
- ✅ Page load < 3s
- ✅ >98% browser compatibility
- ✅ Functionality > animations

## References

- Video: https://www.youtube.com/watch?v=-Ln-8QM8KhQ
- McMaster-Carr: https://www.mcmaster.com
