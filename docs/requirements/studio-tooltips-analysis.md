# Studio Tooltips Analysis

## Overview
This document lists all interactive elements in the Studio that need tooltips to provide user feedback and guidance.

## Components Analysis

### 1. StudioHeader (`studio-header.tsx`)
- ✅ **All Images tab** - "View all images from all influencers"
- ✅ **Influencer tabs** - "View images from [Influencer Name]"
- ✅ **More influencers button (ellipsis)** - "View more influencers"
- ✅ **Search input** - "Search images by prompt, scene, or influencer name"

### 2. StudioToolbar (`studio-toolbar.tsx`)
- ✅ **Status filters**:
  - "All" - "Show all images"
  - "✓ Done" - "Show only completed images"
  - "⟳ Gen" - "Show images currently generating"
  - "✕ Failed" - "Show failed generations"
- ✅ **Aspect Ratio filter** - "Filter by image dimensions (1:1, 9:16, 2:3)"
- ✅ **Liked filter**:
  - "All" - "Show all images"
  - "Liked" - "Show only liked images"
  - "Not Liked" - "Show images you haven't liked"
- ✅ **Adult Content filter**:
  - "All" - "Show all images"
  - "Adult" - "Show only adult content images"
  - "Safe" - "Show only safe content images"
- ✅ **Sort dropdown** - "Sort images by date"
- ✅ **View Mode buttons**:
  - Grid - "Grid view: Compact layout"
  - Masonry - "Masonry view: Pinterest-style layout"
  - Large - "Large view: Bigger thumbnails"

### 3. StudioDetailPanel (`studio-detail-panel.tsx`)
- ✅ **Zoom button** - "View image in full width"
- ✅ **Close button** - "Close detail panel"
- ✅ **Image preview (clickable)** - "Click to view full width"
- ✅ **Like button** - "Like this image"
- ✅ **Download button** - "Download image"
- ✅ **Delete button** - "Delete this image"
- ✅ **Retry button** (for failed images) - "Retry generation (free)"
- ✅ **Copy prompt button** - "Copy prompt to clipboard"
- ✅ **Copy ID button** - "Copy image ID to clipboard"
- ✅ **AI Influencer link** - "View influencer profile"

### 4. StudioGenerationBar (`studio-generation-bar.tsx`)
Already has tooltips for:
- ✅ Model selector
- ✅ Aspect Ratio
- ✅ Quality
- ✅ Prompt Enhance toggle
- ✅ Batch Size
- ✅ Pose picker
- ✅ Outfit picker
- ✅ Styles & Scenes
- ✅ Adult Content toggle
- ✅ No influencer selected indicator

Missing tooltips:
- ✅ **Generate/Edit/Upscale button** - "Generate new images" / "Edit selected image" / "Upscale selected image"
- ✅ **Influencer thumbnails** - "Select [Influencer Name] for generation"
- ✅ **More influencers button** - "Select from more influencers"
- ✅ **Upload button** (when no image selected) - "Upload image as prompt or for editing"
- ✅ **Selected image clear button** - "Clear selected image"
- ✅ **Add object button** (editing mode) - "Add object to edit"
- ✅ **Remove object button** (editing mode) - "Remove this object"
- ✅ **Mode selector buttons** - "Creating mode" / "Editing mode" / "Upscaling mode"
- ✅ **Content type buttons** - "Image generation" / "Video generation (coming soon)"

### 5. StudioImageCard (`studio-image-card.tsx`)
- ✅ **Image card (clickable)** - "Click to view details"
- ✅ **Like button** (hover) - "Like this image"
- ✅ **Download button** (hover) - "Download image"
- ✅ **Edit button** (hover) - "Edit in Studio"

### 6. StudioGallery (`studio-gallery.tsx`)
- No specific tooltips needed (uses StudioImageCard)

## Implementation Priority

1. **High Priority** (Core functionality):
   - StudioToolbar filters and view modes
   - StudioDetailPanel action buttons
   - StudioGenerationBar missing tooltips
   - StudioImageCard hover actions

2. **Medium Priority** (Navigation):
   - StudioHeader tabs and search

3. **Low Priority** (Already clear):
   - Some self-explanatory elements

## Notes
- Use existing Tooltip component from `apps/web/components/ui/tooltip.tsx`
- Tooltips should be concise but informative
- Delay should be 300ms (default) for most, 500ms for complex actions
- Tooltips should explain "what" and optionally "why"

