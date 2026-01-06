# Mobile Modals Responsiveness Plan

**Date**: 2024-12-19  
**Status**: 🚧 In Progress

## Overview

Making all modals, dialogs, and detail panels responsive for mobile devices. The Studio page has several modals that need mobile optimization, especially the detail panel and model picker.

## Components to Make Responsive

### 1. StudioDetailPanel ⚠️ IN PROGRESS
- **Current**: Fixed width 380px side panel, hidden on mobile (`hidden lg:flex`)
- **Issue**: On mobile, selecting an image does nothing because panel is hidden
- **Solution**: 
  - Desktop: Keep as side panel (380px)
  - Mobile: Convert to bottom sheet modal
  - Add `variant` prop: `'panel' | 'modal'`
  - Extract content rendering to shared function

### 2. ModelPicker
- **Current**: Fixed width 320px (`w-80`), positioned absolutely
- **Issue**: May overflow on mobile, positioning may be off-screen
- **Solution**:
  - Mobile: Full-screen or bottom sheet
  - Desktop: Keep current positioning
  - Add responsive width classes
  - Better positioning logic for mobile

### 3. ObjectPicker
- **Current**: Already uses portal, has some responsive padding
- **Issue**: May need mobile optimization for grid layout
- **Solution**:
  - Mobile: Single column grid
  - Desktop: Multi-column masonry
  - Ensure touch targets are ≥44px

### 4. OutfitModeSelector
- **Current**: Uses portal, responsive padding
- **Issue**: Grid may need mobile optimization
- **Solution**:
  - Mobile: Stack vertically
  - Desktop: 2-column grid
  - Ensure touch targets are ≥44px

### 5. Base Dialog Component (`libs/ui/src/components/dialog.tsx`)
- **Current**: `max-w-lg` may be too wide on mobile
- **Issue**: Not optimized for mobile viewports
- **Solution**:
  - Mobile: Full-width bottom sheet or centered with padding
  - Desktop: Keep current behavior
  - Add mobile-specific classes

### 6. Other Modals
- BugReportModal
- ZeroCreditsModal
- TemplateDetailModal
- UploadConsentDialog
- SaveTemplateDialog

## Implementation Strategy

### Phase 1: StudioDetailPanel (Current)
1. ✅ Add `variant` prop
2. ⏳ Extract content to shared render function
3. ⏳ Implement mobile bottom sheet variant
4. ⏳ Update Studio page to use both variants
5. ⏳ Test on mobile viewport

### Phase 2: ModelPicker
1. Add mobile detection
2. Implement full-screen/bottom sheet on mobile
3. Update positioning logic
4. Test on mobile viewport

### Phase 3: Base Dialog Component
1. Add mobile-responsive classes
2. Support bottom sheet variant
3. Update all dialogs to use responsive base

### Phase 4: Other Modals
1. Update each modal individually
2. Ensure touch targets ≥44px
3. Test on mobile viewport

## Mobile Patterns

### Bottom Sheet Pattern
```tsx
<div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm">
  <div className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] rounded-t-3xl">
    {/* Content */}
  </div>
</div>
```

### Full-Screen Modal Pattern
```tsx
<div className="fixed inset-0 z-50 bg-[var(--bg-elevated)]">
  {/* Content */}
</div>
```

### Responsive Dialog Pattern
```tsx
<div className={cn(
  "w-full max-w-lg", // Desktop
  "md:max-w-lg",     // Tablet
  "max-w-full"        // Mobile (full width with padding)
)}>
```

## Touch Target Requirements

- All interactive elements: **≥44x44px**
- Buttons: **≥44px height**
- Icons: **≥44px touch area** (use padding)
- Links: **≥44px height**

## Testing Checklist

- [ ] StudioDetailPanel works on mobile
- [ ] ModelPicker works on mobile
- [ ] ObjectPicker works on mobile
- [ ] OutfitModeSelector works on mobile
- [ ] All dialogs work on mobile
- [ ] Touch targets are ≥44px
- [ ] No horizontal scrolling
- [ ] Proper animations/transitions
- [ ] Backdrop dismiss works
- [ ] Keyboard navigation works

---

**Next Steps**: Complete StudioDetailPanel refactoring, then move to ModelPicker.

