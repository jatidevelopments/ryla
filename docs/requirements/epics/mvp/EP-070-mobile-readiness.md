# [EPIC] EP-070: Mobile Web App Readiness

**Status**: Completed
**Phase**: P10
**Created**: 2026-01-21
**Last Updated**: 2026-01-21


## Overview

Make the RYLA web app fully functional and optimized for mobile devices (phones and tablets). Currently, the app displays a "desktop only" message on mobile devices. This epic covers responsive design, touch interactions, mobile-optimized UI components, and performance optimizations for mobile browsers.

> **Status**: Planned for Phase 2
> 
> **Current State**: Mobile users see a blocker message indicating desktop-only access.

---

## Business Impact

**Target Metric**: A - Activation, B - Retention

**Hypothesis**: When users can access RYLA on mobile devices, we will:
- Increase activation by removing device barriers
- Improve retention through mobile convenience
- Capture mobile-first user segments
- Enable on-the-go content creation

**Success Criteria**:
- Mobile activation rate: **>40% of total activations**
- Mobile D7 retention: **>12%** (vs desktop baseline)
- Mobile page load time: **<3 seconds** (3G connection)
- Mobile task completion rate: **>60%** (wizard, generation, etc.)

---

## Current Mobile Blocker

**Implementation**: `apps/web/components/mobile-blocker.tsx`

- Detects mobile via viewport width (<768px) and user agent
- Shows friendly message: "Currently, RYLA is only available on desktop"
- Includes link to landing page
- Prevents app shell from rendering on mobile

---

## Features

### F1: Responsive Layout System

- Mobile-first breakpoints (sm, md, lg, xl)
- Flexible grid layouts that adapt to screen size
- Collapsible sidebar for mobile (drawer/overlay)
- Bottom navigation for mobile (already implemented)
- Touch-friendly spacing and sizing

**Breakpoints**:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### F2: Mobile-Optimized Navigation

- Bottom navigation bar (already exists in `@ryla/ui`)
- Hamburger menu for sidebar
- Touch-friendly tap targets (min 44x44px)
- Swipe gestures for navigation where appropriate
- Back button handling

### F3: Wizard Mobile Experience

- Vertical step layout for mobile
- Larger form inputs and buttons
- Touch-friendly option cards
- Simplified preview on mobile
- Progress indicator optimized for small screens
- Keyboard handling (virtual keyboard)

**Wizard Steps to Optimize**:
- Step 1: Style selection
- Step 2: General attributes (ethnicity, age)
- Step 3: Face details (hair, eyes)
- Step 4: Body configuration
- Step 5: Identity (outfit, archetype, bio)
- Step 6: Preview and generation

### F4: Dashboard Mobile View

- Single-column character grid on mobile
- Swipeable character cards
- Pull-to-refresh
- Simplified character detail view
- Mobile-optimized image gallery

### F5: Content Studio Mobile

- Touch-friendly generation controls
- Simplified toolbar
- Mobile-optimized image picker
- Swipeable image gallery
- Touch gestures for zoom/pan
- Simplified filter UI

### F6: Mobile Performance

- Image optimization (WebP, responsive sizes)
- Lazy loading for images and components
- Code splitting for mobile routes
- Reduced bundle size
- Fast 3G performance targets
- Battery-efficient rendering

### F7: Touch Interactions

- Touch-friendly buttons (min 44x44px)
- Swipe gestures for navigation
- Pull-to-refresh where appropriate
- Long-press for context menus
- Pinch-to-zoom for images
- Smooth scrolling and momentum

### F8: Mobile-Specific Features

- Share functionality (native share API)
- Save to device (download images)
- Camera integration (for base image upload)
- Push notifications (if implemented)
- Mobile browser compatibility

---

## Acceptance Criteria

### AC-1: Mobile Detection & Blocker Removal

- [ ] Remove mobile blocker component
- [ ] App renders fully on mobile devices
- [ ] Mobile detection still works for responsive behavior
- [ ] No console errors on mobile browsers

### AC-2: Responsive Layout

- [ ] All pages adapt to mobile viewport
- [ ] Sidebar converts to drawer on mobile
- [ ] Bottom navigation visible on mobile
- [ ] No horizontal scrolling
- [ ] Content readable without zooming

### AC-3: Wizard Mobile Experience

- [ ] All wizard steps work on mobile
- [ ] Form inputs are touch-friendly
- [ ] Option cards are easily tappable
- [ ] Preview images display correctly
- [ ] Progress indicator visible
- [ ] Keyboard doesn't cover inputs

### AC-4: Dashboard Mobile

- [ ] Character grid displays in single column
- [ ] Character cards are swipeable
- [ ] Character detail view is mobile-optimized
- [ ] Actions are touch-friendly
- [ ] Empty state displays correctly

### AC-5: Content Studio Mobile

- [ ] Generation controls are accessible
- [ ] Image gallery is swipeable
- [ ] Filters are mobile-friendly
- [ ] Image preview works on mobile
- [ ] Download/share works on mobile

### AC-6: Performance

- [ ] Page load < 3s on 3G
- [ ] Images load progressively
- [ ] Smooth scrolling (60fps)
- [ ] No layout shifts (CLS < 0.1)
- [ ] Bundle size optimized

### AC-7: Touch Interactions

- [ ] All buttons meet 44x44px minimum
- [ ] Swipe gestures work smoothly
- [ ] No accidental taps
- [ ] Long-press works for context
- [ ] Pinch-to-zoom works for images

### AC-8: Browser Compatibility

- [ ] Works on iOS Safari (latest 2 versions)
- [ ] Works on Chrome Mobile (latest 2 versions)
- [ ] Works on Samsung Internet
- [ ] Works on Firefox Mobile
- [ ] Graceful degradation for older browsers

---

## Technical Considerations

### Components to Update

1. **Layout & Navigation**
   - `apps/web/components/app-shell.tsx` - Already has mobile support
   - `apps/web/components/desktop-sidebar.tsx` - May need mobile drawer
   - `@ryla/ui` sidebar components - Verify mobile behavior

2. **Wizard Components**
   - `apps/web/components/wizard/*` - All wizard steps
   - `apps/web/components/wizard/wizard-layout.tsx` - Mobile layout
   - `apps/web/components/wizard/wizard-option-card.tsx` - Touch targets

3. **Dashboard**
   - `apps/web/app/dashboard/page.tsx` - Mobile grid
   - `apps/web/components/influencer-card.tsx` - Mobile card design

4. **Content Studio**
   - `apps/web/app/studio/page.tsx` - Mobile layout
   - `apps/web/components/studio/*` - All studio components

### Performance Optimizations

- Use Next.js Image component with responsive sizes
- Implement lazy loading for below-fold content
- Code split by route
- Optimize bundle size (tree shaking)
- Use CSS containment for better rendering
- Implement virtual scrolling for long lists

### Testing Requirements

- Test on real devices (iOS, Android)
- Test on various screen sizes
- Test on slow 3G connections
- Test touch interactions
- Test keyboard behavior
- Test orientation changes
- Test browser compatibility

---

## Dependencies

- **EP-001**: Influencer Wizard (must be mobile-ready)
- **EP-004**: Dashboard (must be mobile-ready)
- **EP-005**: Content Studio (must be mobile-ready)
- **EP-008**: Gallery (must be mobile-ready)

---

## Out of Scope (Phase 2+)

- Native mobile apps (iOS/Android)
- Mobile-specific features (camera, GPS, etc.)
- Progressive Web App (PWA) features
- Offline functionality
- Mobile push notifications
- Advanced touch gestures beyond basic navigation

---

## Implementation Notes

### Phase 1: Foundation
1. Remove mobile blocker
2. Fix critical layout issues
3. Ensure basic functionality works

### Phase 2: Optimization
1. Optimize wizard for mobile
2. Optimize dashboard for mobile
3. Optimize studio for mobile

### Phase 3: Polish
1. Performance optimization
2. Touch interaction refinement
3. Browser compatibility fixes

---

## Related Documentation

- `docs/technical/MOBILE-OPTIMIZATION.md` (to be created)
- `apps/web/components/mobile-blocker.tsx` (current implementation)
- `libs/ui/src/components/sidebar.tsx` (mobile detection logic)

---

## Status

**Current**: Mobile blocker active, epic planned for Phase 2

**Next Steps**:
1. User research on mobile usage patterns
2. Mobile analytics setup
3. Design mobile mockups
4. Prioritize features for mobile MVP

