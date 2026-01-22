# [EPIC] EP-008: Image Gallery & Downloads

**Status**: Completed
**Phase**: P10
**Created**: 2026-01-21
**Last Updated**: 2026-01-21


## Overview

Image gallery for viewing, downloading, and regenerating character images. Core content access feature - this is what users create and use.

---

## Business Impact

**Target Metric**: C - Core Value

**Hypothesis**: When users can easily view and download their generated images, they will use them on platforms and return for more.

**Success Criteria**:
- Image downloads per character: **>3**
- Regeneration rate: **>20%** of users regenerate
- Gallery load time: **<2 seconds**

---

## Features

### F1: Image Gallery Grid

- Grid of all generated images for character
- Thumbnail view (lazy loaded)
- Image count indicator
- Responsive grid (2-6 columns)
- Loading skeleton while fetching

### F2: Full-Size Image View

- Click thumbnail to view full-size
- Modal/lightbox overlay
- Previous/Next navigation
- Close button (X or click outside)
- Keyboard navigation (arrows, Esc)

### F3: Individual Image Download

- Download button on each image
- Downloads original quality image
- Sensible filename: `{character_name}_{index}.png`
- Works on mobile

### F4: ZIP Download (All Images)

- "Download All" button
- Generates ZIP of all images
- Progress indicator during generation
- ZIP filename: `{character_name}_images.zip`

### F5: Regenerate Images

- "Generate More" button
- Opens generation options (aspect ratio, quality)
- Triggers EP-005 generation
- New images added to gallery
- Progress indicator during generation

---

## Acceptance Criteria

### AC-1: Gallery Grid

- [ ] All generated images shown in grid
- [ ] Thumbnails load with lazy loading
- [ ] Image count displayed (e.g., "12 images")
- [ ] Grid is responsive (2-6 columns)
- [ ] Empty state if no images yet

### AC-2: Full-Size View

- [ ] Click thumbnail opens full-size modal
- [ ] Modal shows image at full resolution
- [ ] Can navigate prev/next in modal
- [ ] Can close with X, Esc, or click outside
- [ ] Keyboard navigation works

### AC-3: Individual Download

- [ ] Download button on each thumbnail
- [ ] Download button in full-size view
- [ ] Downloads original quality image
- [ ] Filename includes character name
- [ ] Works on mobile browsers

### AC-4: ZIP Download

- [ ] "Download All" button visible
- [ ] Progress indicator during ZIP generation
- [ ] ZIP contains all character images
- [ ] ZIP filename is sensible
- [ ] Download starts automatically when ready

### AC-5: Regenerate

- [ ] "Generate More" button visible
- [ ] Opens options modal (aspect ratio, quality)
- [ ] Triggers generation via EP-005
- [ ] Progress shown during generation
- [ ] New images appear in gallery when done

---

## Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `gallery_viewed` | Gallery page opened | `character_id`, `image_count` |
| `image_viewed_fullsize` | Modal opened | `character_id`, `image_id` |
| `image_downloaded` | Single image downloaded | `character_id`, `image_id` |
| `images_downloaded_zip` | ZIP downloaded | `character_id`, `image_count` |
| `regenerate_started` | Generate More clicked | `character_id`, `aspect_ratio`, `quality` |
| `regenerate_completed` | New images ready | `character_id`, `new_image_count` |

### Key Metrics

1. **Downloads per Character**: Average downloads per character
2. **ZIP vs Individual**: Ratio of bulk to individual downloads
3. **Regeneration Rate**: % of users who generate more images
4. **Gallery Return Rate**: Users who return to gallery within 7 days

---

## User Stories

### ST-015: View All Images

**As a** user with generated images  
**I want to** see all images for my character  
**So that** I can review my content

**AC**: AC-1

### ST-016: View Full-Size Image

**As a** user reviewing images  
**I want to** see images at full resolution  
**So that** I can check quality before downloading

**AC**: AC-2

### ST-017: Download Single Image

**As a** user who wants specific images  
**I want to** download individual images  
**So that** I can use them on platforms

**AC**: AC-3

### ST-018: Download All Images

**As a** user who wants all content  
**I want to** download all images at once  
**So that** I save time

**AC**: AC-4

### ST-019: Generate More Images

**As a** user who needs more content  
**I want to** generate additional images  
**So that** I have varied content to post

**AC**: AC-5

---

## UI Wireframes

### Gallery View

```
┌─────────────────────────────────────────────────────┐
│  ← Back to Luna                                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Luna's Images (12)     [Generate More] [Download All]│
│                                                      │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐         │
│  │img1│ │img2│ │img3│ │img4│ │img5│ │img6│         │
│  │ ⬇️ │ │ ⬇️ │ │ ⬇️ │ │ ⬇️ │ │ ⬇️ │ │ ⬇️ │         │
│  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘         │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐         │
│  │img7│ │img8│ │img9│ │i10 │ │i11 │ │i12 │         │
│  │ ⬇️ │ │ ⬇️ │ │ ⬇️ │ │ ⬇️ │ │ ⬇️ │ │ ⬇️ │         │
│  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘         │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Full-Size Modal

```
┌─────────────────────────────────────────────────────┐
│                                              [X]    │
│                                                      │
│  [←]     ┌────────────────────────────┐      [→]    │
│          │                            │             │
│          │                            │             │
│          │      [Full-Size Image]     │             │
│          │                            │             │
│          │                            │             │
│          └────────────────────────────┘             │
│                                                      │
│                    [⬇️ Download]                     │
│                                                      │
│                    3 of 12                           │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Generate More Modal

```
┌─────────────────────────────────────────────────────┐
│  Generate More Images                        [X]    │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Aspect Ratio                                        │
│  ┌──────┐  ┌──────┐  ┌──────┐                       │
│  │ 1:1  │  │ 9:16 │  │ 2:3  │                       │
│  │Square│  │Portrait│ │ Tall │                       │
│  └──────┘  └──────┘  └──────┘                       │
│                                                      │
│  Quality                                             │
│  ┌──────────┐  ┌──────────┐                         │
│  │  Draft   │  │   High   │                         │
│  │  ~10s    │  │  ~30s    │                         │
│  └──────────┘  └──────────┘                         │
│                                                      │
│  Number of Images: [5] ────●──── [10]               │
│                                                      │
│              [Generate 5 Images]                     │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## Technical Notes

### API Endpoints

```
GET  /api/characters/:id/images    - List character images
GET  /api/images/:id/download      - Download single image
GET  /api/characters/:id/download  - Download ZIP of all images
POST /api/characters/:id/generate  - Generate more images (→ EP-005)
```

### Data Model

```typescript
interface CharacterImage {
  id: string;
  characterId: string;
  url: string;
  thumbnailUrl: string;
  width: number;
  height: number;
  aspectRatio: string;
  createdAt: Date;
}

interface GalleryState {
  images: CharacterImage[];
  selectedImageIndex: number | null;
  isLoading: boolean;
  isDownloading: boolean;
  isGenerating: boolean;
  generationProgress: { completed: number; total: number } | null;
}
```

### ZIP Generation

```typescript
// Server-side ZIP generation
import JSZip from 'jszip';

async function generateZip(characterId: string): Promise<Buffer> {
  const images = await getCharacterImages(characterId);
  const character = await getCharacter(characterId);
  
  const zip = new JSZip();
  
  for (let i = 0; i < images.length; i++) {
    const imageBuffer = await downloadImage(images[i].url);
    zip.file(`${character.name}_${i + 1}.png`, imageBuffer);
  }
  
  return zip.generateAsync({ type: 'nodebuffer' });
}
```

### Lazy Loading

```typescript
// Use Intersection Observer for lazy loading
const LazyImage = ({ src, alt }: Props) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsLoaded(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    
    if (imgRef.current) observer.observe(imgRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <img 
      ref={imgRef}
      src={isLoaded ? src : placeholder}
      alt={alt}
    />
  );
};
```

---

## Non-Goals (Phase 2+)

- Platform-specific export (OnlyFans, Fanvue sizes)
- Image editing/cropping
- Watermark options
- Batch selection for download
- Share to social media
- Image metadata viewer
- Favorite/star images

---

## Dependencies

- Character management (EP-004)
- Image generation (EP-005)
- Supabase Storage
- User authentication (EP-002)

---

## Phase Checklist

- [x] P1: Requirements (this epic)
- [ ] P2: Stories created
- [ ] P3: Architecture design
- [ ] P4: UI skeleton
- [ ] P5: Tech spec
- [ ] P6: Implementation
- [ ] P7: Testing
- [ ] P8: Integration
- [ ] P9: Deployment
- [ ] P10: Validation

