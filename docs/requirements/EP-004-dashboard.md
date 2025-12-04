# [EPIC] EP-004: Character Dashboard

## Overview

User dashboard for viewing, managing, and downloading AI characters and their image packs.

---

## Business Impact

**Target Metric**: [x] B - Retention

**Hypothesis**: When users can easily access and manage their characters, they will return to generate more content.

**Success Criteria**:
- D7 return rate: **>15%**
- Characters per user: **>2**
- Image downloads per character: **>3**

---

## Features

### F1: Character List
- Grid/list view of user's characters
- Character thumbnail preview
- Character name and creation date
- Quick actions (view, delete)

### F2: Character Detail View
- Full character preview
- Character configuration summary
- Image gallery
- Regenerate button
- Delete button

### F3: Image Gallery
- View all generated images
- Thumbnail grid
- Full-size preview
- Download individual images

### F4: Image Pack Download
- Generate new image pack
- Download as ZIP
- Download progress indicator
- History of downloads

### F5: Character Management
- Rename character
- Delete character (with confirmation)
- Duplicate character config
- Create new character (→ wizard)

---

## Acceptance Criteria

### AC-1: Character List
- [ ] User sees all their characters
- [ ] Characters show thumbnail preview
- [ ] Characters are sorted by recent
- [ ] Empty state shows CTA to create

### AC-2: Character Detail
- [ ] User can view character details
- [ ] All configuration is displayed
- [ ] Images are shown in gallery
- [ ] Actions are accessible

### AC-3: Image Gallery
- [ ] All generated images are shown
- [ ] Images can be viewed full-size
- [ ] Images can be downloaded individually
- [ ] Gallery handles many images

### AC-4: Download Pack
- [ ] User can request new image pack
- [ ] Generation progress is shown
- [ ] ZIP download works
- [ ] Download history is visible

### AC-5: Character Actions
- [ ] User can rename character
- [ ] User can delete character
- [ ] Delete requires confirmation
- [ ] New character links to wizard

---

## Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `dashboard_viewed` | Dashboard loaded | `character_count` |
| `character_viewed` | Character detail opened | `character_id` |
| `character_deleted` | Character deleted | `character_id` |
| `character_renamed` | Character renamed | `character_id` |
| `image_downloaded` | Single image downloaded | `character_id`, `image_id` |
| `image_pack_requested` | Pack generation started | `character_id`, `image_count` |
| `image_pack_downloaded` | ZIP downloaded | `character_id`, `image_count` |
| `create_character_clicked` | New character CTA | `source` |

---

## User Stories

### ST-013: View My Characters
**As a** returning user  
**I want to** see all my created characters  
**So that** I can manage my AI influencers

### ST-014: Download Images
**As a** user with a character  
**I want to** download images of my character  
**So that** I can use them on social platforms

### ST-015: Generate More Images
**As a** user who needs more content  
**I want to** generate additional images  
**So that** I have varied content to post

### ST-016: Delete Character
**As a** user who no longer needs a character  
**I want to** delete it  
**So that** my dashboard stays organized

---

## UI Wireframe (Conceptual)

```
┌─────────────────────────────────────────────────────┐
│  RYLA Dashboard                    [+ New Character] │
├─────────────────────────────────────────────────────┤
│                                                      │
│  My Characters (3)                                   │
│                                                      │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐              │
│  │  [img]  │  │  [img]  │  │  [img]  │              │
│  │ Luna    │  │ Sofia   │  │ Maya    │              │
│  │ 12 imgs │  │ 5 imgs  │  │ 8 imgs  │              │
│  └─────────┘  └─────────┘  └─────────┘              │
│                                                      │
└─────────────────────────────────────────────────────┘

Character Detail:
┌─────────────────────────────────────────────────────┐
│  ← Back to Dashboard                                 │
├─────────────────────────────────────────────────────┤
│  Luna                          [Regenerate] [Delete] │
│  Created: Dec 1, 2025                                │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │                                              │   │
│  │              [Main Image]                    │   │
│  │                                              │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  Images (12)                    [Download All (.zip)]│
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐         │
│  │img1│ │img2│ │img3│ │img4│ │img5│ │img6│         │
│  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘         │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## Technical Notes

### API Endpoints
```
GET  /api/characters          - List user's characters
GET  /api/characters/:id      - Get character detail
PUT  /api/characters/:id      - Update character (rename)
DELETE /api/characters/:id    - Delete character
GET  /api/characters/:id/images - List character images
POST /api/characters/:id/generate - Generate new images
GET  /api/characters/:id/download - Download ZIP
```

---

## Non-Goals (Phase 2+)

- Character editing (change attributes)
- Sharing characters publicly
- Character templates marketplace
- Batch operations
- Search/filter characters
- Folders/organization

---

## Dependencies

- User authentication (EP-002)
- Character persistence (EP-001)
- Image generation (EP-005)

