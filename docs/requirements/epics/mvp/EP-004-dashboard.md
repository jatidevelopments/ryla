# [EPIC] EP-004: Character Management

## Overview

Dashboard for viewing and managing AI character records. Core retention driver - users return here to access their characters.

> **Note**: Image gallery & downloads are handled in EP-008.

---

## Business Impact

**Target Metric**: B - Retention

**Hypothesis**: When users can easily access and manage their characters, they will return to create more.

**Success Criteria**:
- D7 return rate: **>15%**
- Characters per user: **>2**
- Dashboard load time: **<2 seconds**

---

## Features

### F1: Character List View

- Grid layout of user's characters
- Character thumbnail (first generated image)
- Character name and creation date
- Character count indicator
- Responsive grid (1-4 columns)

### F2: Empty State

- Shown when user has no characters
- Clear CTA: "Create your first character"
- Link to wizard (EP-001)
- Friendly illustration/icon

### F3: Character Detail View

- Full character preview image
- Character name (editable)
- Creation date
- Character configuration summary
- Link to image gallery (EP-008)

### F4: Character Actions

- **Rename**: Edit character name inline
- **Delete**: Remove character with confirmation
- **View Images**: Navigate to gallery (EP-008)
- **Create New**: Link to wizard (EP-001)

### F5: Navigation

- Back to list from detail view
- Loading states for all views
- Error states with retry
- Mobile responsive layout

---

## Acceptance Criteria

### AC-1: Character List

- [ ] User sees all their characters in grid
- [ ] Characters show thumbnail preview
- [ ] Characters sorted by most recent first
- [ ] Grid is responsive (1-4 columns)
- [ ] Loading state while fetching

### AC-2: Empty State

- [ ] Shown when user has 0 characters
- [ ] Clear "Create your first character" CTA
- [ ] CTA links to wizard
- [ ] Friendly design

### AC-3: Character Detail

- [ ] User can view character details
- [ ] Character name is displayed
- [ ] Creation date is shown
- [ ] Configuration summary visible
- [ ] Link to image gallery

### AC-4: Rename Character

- [ ] User can edit character name
- [ ] Name updates in database
- [ ] UI reflects change immediately
- [ ] Validation (not empty, max length)

### AC-5: Delete Character

- [ ] Delete button shows confirmation dialog
- [ ] Confirmation states consequences
- [ ] Delete removes character and all images
- [ ] User returned to list after delete

### AC-6: Navigation

- [ ] Can navigate list → detail → list
- [ ] Loading states for async operations
- [ ] Error states with retry option
- [ ] Mobile responsive

---

## Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `dashboard_viewed` | Dashboard loaded | `character_count` |
| `character_list_viewed` | List rendered | `character_count` |
| `character_detail_viewed` | Detail page opened | `character_id` |
| `character_renamed` | Name changed | `character_id` |
| `character_delete_started` | Delete clicked | `character_id` |
| `character_deleted` | Delete confirmed | `character_id` |
| `create_character_clicked` | New character CTA | `source` (empty_state/header) |

---

## User Stories

### ST-010: View My Characters

**As a** returning user  
**I want to** see all my created characters  
**So that** I can access my AI influencers

**AC**: AC-1, AC-6

### ST-011: View Character Details

**As a** user with characters  
**I want to** see a character's details  
**So that** I can review its configuration

**AC**: AC-3

### ST-012: Rename Character

**As a** user  
**I want to** rename my character  
**So that** I can organize my characters better

**AC**: AC-4

### ST-013: Delete Character

**As a** user who no longer needs a character  
**I want to** delete it  
**So that** my dashboard stays organized

**AC**: AC-5

### ST-014: Create First Character

**As a** new user with no characters  
**I want to** see a clear CTA to create one  
**So that** I know how to get started

**AC**: AC-2

---

## UI Wireframes

### Character List (Grid)

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
│  │ Dec 1   │  │ Dec 2   │  │ Dec 3   │              │
│  └─────────┘  └─────────┘  └─────────┘              │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Empty State

```
┌─────────────────────────────────────────────────────┐
│  RYLA Dashboard                                      │
├─────────────────────────────────────────────────────┤
│                                                      │
│                                                      │
│           🎨 No characters yet                       │
│                                                      │
│           Create your first AI influencer           │
│           and start generating content.             │
│                                                      │
│              [+ Create Character]                    │
│                                                      │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Character Detail

```
┌─────────────────────────────────────────────────────┐
│  ← Back to Dashboard                                 │
├─────────────────────────────────────────────────────┤
│                                                      │
│  Luna ✏️                              [Delete]       │
│  Created: Dec 1, 2025                                │
│                                                      │
│  ┌──────────────────────────────────────────────┐   │
│  │                                              │   │
│  │              [Main Image]                    │   │
│  │                                              │   │
│  └──────────────────────────────────────────────┘   │
│                                                      │
│  Configuration                                       │
│  ─────────────                                       │
│  Gender: Female        Style: Realistic              │
│  Ethnicity: Latina     Age: 25                       │
│  Body: Curvy           Hair: Brown, Long             │
│  Outfit: Date night glam                             │
│                                                      │
│  [View Images (12)] → EP-008                         │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## Technical Notes

### API Endpoints

```
GET  /api/characters           - List user's characters
GET  /api/characters/:id       - Get character detail
PUT  /api/characters/:id       - Update character (rename)
DELETE /api/characters/:id     - Delete character + images
```

### Data Model

```typescript
interface CharacterListItem {
  id: string;
  name: string;
  thumbnailUrl: string;
  createdAt: Date;
}

interface CharacterDetail {
  id: string;
  name: string;
  config: CharacterConfig;
  thumbnailUrl: string;
  imageCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### State Management

```typescript
interface DashboardState {
  characters: CharacterListItem[];
  selectedCharacter: CharacterDetail | null;
  isLoading: boolean;
  error: string | null;
  
  fetchCharacters: () => Promise<void>;
  fetchCharacterDetail: (id: string) => Promise<void>;
  deleteCharacter: (id: string) => Promise<void>;
  renameCharacter: (id: string, name: string) => Promise<void>;
}
```

---

## Non-Goals (Phase 2+ or EP-008)

- Image gallery (EP-008)
- Image downloads (EP-008)
- Regenerate images (EP-008)
- Character editing (change attributes)
- Character duplication
- Search/filter characters
- Folders/organization
- Batch operations

---

## Dependencies

- User authentication (EP-002)
- Character persistence (EP-001)
- Image gallery for viewing images (EP-008)

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
