# [EPIC] EP-021: Multi-Piece Outfit Gallery

## Overview

Transform the outfit selection system from single-preset outfits to a granular multi-piece composition system. Users can select individual clothing items from different categories (top, bottom, shoes, headwear, outerwear, accessories) to create custom outfit combinations.

> ⚠️ **Scope**: This epic covers the **outfit selection and composition system** within the Content Studio. It replaces the current single-outfit selection with a piece-by-piece system.

> **MVP constraint**: Outfit presets (quick-select combinations) are **Phase 2+**, not MVP. Focus on piece-by-piece selection.

---

## Terminology

| Term | Definition |
|------|------------|
| **Outfit Composition** | A collection of selected clothing pieces (top, bottom, shoes, etc.) |
| **Outfit Piece** | A single clothing item (e.g., "Tank Top", "Jeans", "Sneakers") |
| **Piece Category** | A grouping of similar pieces (Top, Bottom, Shoes, Headwear, Outerwear, Accessories) |
| **Single Selection Category** | Categories where only one piece can be selected (Top, Bottom, Shoes, Headwear, Outerwear) |
| **Multiple Selection Category** | Categories where multiple pieces can be selected (Accessories) |

---

## Business Impact

**Target Metric**: C - Core Value

**Hypothesis**: When users can compose outfits piece-by-piece, they will create more varied and personalized content, increasing generation diversity and user satisfaction.

**Success Criteria**:
- Outfit composition usage: **>60%** of generations use custom compositions
- Average pieces per outfit: **>3 pieces** selected
- Time to compose outfit: **<30 seconds**
- Outfit variety: **>80%** of users try different combinations
- Generation success rate with custom outfits: **>95%**

---

## P1: Requirements

### Problem Statement

Currently, users can only select from preset outfits (e.g., "Casual Streetwear", "Lingerie"). This limits creativity and doesn't allow mixing pieces (e.g., a specific top with different bottoms). Users need granular control to select individual clothing items from different categories to create unique outfit combinations.

### MVP Objective

Users can compose custom outfits by selecting individual pieces from 6 categories (Top, Bottom, Shoes, Headwear, Outerwear, Accessories) within the Content Studio, with each category enforcing single-selection rules except Accessories (multiple allowed). The composed outfit is used in image generation prompts.

### Non-Goals (Phase 2+)

- **Outfit Presets**: Quick-select pre-composed outfits
- **Outfit Templates**: Saved outfit combinations
- **Outfit Library/Collection**: Owned items, unlocking clothes
- **Compatibility Validation**: Automatic checks for incompatible pieces
- **Outfit History**: Previously used combinations
- **Outfit Sharing**: Sharing compositions with other users
- **3D Preview**: Visual preview of composed outfit
- **Outfit Recommendations**: AI-suggested combinations

### Business Metric Target

**C - Core Value**: Increase generation diversity and user engagement through personalized outfit compositions.

---

## P2: Scoping

### Features

### F1: Outfit Piece Data Structure

- Define 6 piece categories: Top, Bottom, Shoes, Headwear, Outerwear, Accessories
- Create outfit piece definitions with metadata (id, label, emoji, category, isAdult)
- Organize existing outfits into piece categories
- Add new pieces to fill out categories (100+ total pieces)
- Support SFW and Adult Content pieces

### F2: Outfit Composition Data Model

- Define `OutfitComposition` interface
- Support single-selection categories (Top, Bottom, Shoes, Headwear, Outerwear)
- Support multiple-selection category (Accessories array)
- Handle null/empty selections (optional pieces)
- Store composition in generation settings

### F3: Outfit Composition Picker UI

- Tabbed interface with 6 category tabs
- Grid view for each category showing available pieces
- Visual preview of selected pieces
- Individual clear buttons for each selected piece
- "Clear All" functionality
- Search functionality within categories
- Category filtering (SFW vs Adult Content)
- "None" option for optional categories

### F4: Prompt Building Integration

- Convert `OutfitComposition` to prompt string
- Combine all selected pieces into coherent description
- Handle missing pieces gracefully
- Maintain backward compatibility with old string outfits

### F5: Backward Compatibility

- Migration helper: convert old string outfits to compositions
- Support both formats during transition
- Auto-migrate existing outfit selections

### F6: API Integration

- Update generation API to accept `OutfitComposition`
- Validate composition structure
- Convert to prompt string for generation

### Acceptance Criteria

### AC-1: Outfit Piece Data Structure

- [ ] 6 categories defined: Top, Bottom, Shoes, Headwear, Outerwear, Accessories
- [ ] Minimum 15 pieces per category (90+ total pieces)
- [ ] Each piece has: id, label, emoji, category, isAdult flag
- [ ] Pieces organized by category in data structure
- [ ] Adult Content pieces properly flagged

### AC-2: Outfit Composition Data Model

- [ ] `OutfitComposition` interface defined with all 6 categories
- [ ] Single-selection categories are optional strings
- [ ] Accessories is optional string array
- [ ] Composition can be null (no outfit selected)
- [ ] Type-safe throughout codebase

### AC-3: Outfit Composition Picker UI

- [ ] Modal opens from "Outfit" button in Content Studio
- [ ] 6 category tabs visible and functional
- [ ] Grid view shows pieces for selected category
- [ ] Selecting a piece replaces previous selection in that category
- [ ] Selected pieces shown in preview section
- [ ] Individual clear buttons work for each piece
- [ ] "Clear All" resets entire composition
- [ ] "None" option available for optional categories
- [ ] Search filters pieces within category
- [ ] Adult Content pieces hidden when Adult Content disabled
- [ ] Visual indicators (18+ badges) on Adult Content pieces

### AC-4: Prompt Building

- [ ] `OutfitComposition` converts to prompt string
- [ ] All selected pieces included in prompt
- [ ] Missing pieces handled gracefully (not included)
- [ ] Prompt format: "wearing [top], [bottom], [shoes], with [accessories]"
- [ ] Headwear and outerwear included when selected
- [ ] "None" selections excluded from prompt

### AC-5: Backward Compatibility

- [ ] Old string outfits auto-converted to compositions
- [ ] Migration function handles all existing outfit strings
- [ ] System supports both formats during transition
- [ ] No data loss during migration

### AC-6: API Integration

- [ ] Generation API accepts `OutfitComposition` in request
- [ ] Composition validated before generation
- [ ] Composition converted to prompt string
- [ ] Error handling for invalid compositions

### Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `outfit_picker_opened` | User opens outfit picker | `influencer_id`, `has_existing_composition` |
| `outfit_category_selected` | User switches category tab | `influencer_id`, `category` |
| `outfit_piece_selected` | User selects a piece | `influencer_id`, `category`, `piece_id`, `piece_label` |
| `outfit_piece_cleared` | User clears a piece | `influencer_id`, `category`, `piece_id` |
| `outfit_composition_cleared` | User clicks "Clear All" | `influencer_id`, `pieces_count` |
| `outfit_composition_applied` | User applies composition | `influencer_id`, `composition` (all selected pieces), `pieces_count` |
| `outfit_search_used` | User searches for pieces | `influencer_id`, `category`, `search_query` |

### Key Metrics

1. **Outfit Composition Usage**: % of generations using custom compositions
2. **Average Pieces per Outfit**: Mean number of pieces selected
3. **Category Distribution**: Which categories are most used
4. **Time to Compose**: Average time to create an outfit
5. **Outfit Variety**: Number of unique combinations per user

---

## P3: Architecture

### Data Model

```typescript
// Outfit Piece Definition
interface OutfitPiece {
  id: string;                    // e.g., "tank-top", "jeans", "sneakers"
  label: string;                 // e.g., "Tank Top", "Jeans", "Sneakers"
  emoji: string;                  // e.g., "👕", "👖", "👟"
  category: OutfitPieceCategory;
  isAdult?: boolean;              // NSFW/Adult Content flag
  compatibleWith?: string[];     // Phase 2+: IDs of compatible pieces
}

type OutfitPieceCategory = 
  | 'top'
  | 'bottom'
  | 'shoes'
  | 'headwear'
  | 'outerwear'
  | 'accessory';

// Outfit Composition
interface OutfitComposition {
  top?: string;                  // Single selection: piece ID
  bottom?: string;                // Single selection: piece ID
  shoes?: string;                 // Single selection: piece ID
  headwear?: string;              // Single selection: piece ID (optional)
  outerwear?: string;             // Single selection: piece ID (optional)
  accessories?: string[];         // Multiple selection: array of piece IDs
}

// In GenerationSettings
interface GenerationSettings {
  // ... other fields
  outfit: OutfitComposition | null;  // Replaces: outfit: string | null
}
```

### Database Schema

```sql
-- No schema changes needed for MVP
-- Outfit composition stored as JSON in generation_jobs.config
-- Migration: Convert existing string outfits to JSON compositions

-- Example stored format:
-- {
--   "outfit": {
--     "top": "tank-top",
--     "bottom": "jeans",
--     "shoes": "sneakers",
--     "accessories": ["necklace", "earrings"]
--   }
-- }
```

### Component Architecture

```
apps/web/components/studio/generation/
  ├── outfit-composition-picker.tsx      # Main picker component
  ├── outfit-piece-grid.tsx              # Grid view for pieces
  ├── outfit-composition-preview.tsx     # Preview of selected pieces
  └── outfit-category-tabs.tsx           # Category tab navigation

libs/shared/src/constants/character/
  ├── outfit-pieces.ts                   # All outfit pieces data
  └── types.ts                           # OutfitComposition interface

libs/business/src/prompts/
  └── builder.ts                         # buildOutfitPrompt() function
```

### API Contracts

```typescript
// No new endpoints needed
// Update existing generation endpoint to accept OutfitComposition

POST /api/generate
  Body: {
    // ... existing fields
    outfit: OutfitComposition | string  // Support both during migration
  }
  
  // Backend converts to prompt string before generation
```

### Prompt Building Logic

```typescript
function buildOutfitPrompt(composition: OutfitComposition | null): string {
  if (!composition) return '';
  
  const parts: string[] = [];
  
  // Required pieces
  if (composition.top) parts.push(composition.top);
  if (composition.bottom) parts.push(composition.bottom);
  if (composition.shoes) parts.push(composition.shoes);
  
  // Optional pieces (only if not "none")
  if (composition.headwear && composition.headwear !== 'none') {
    parts.push(`wearing ${composition.headwear}`);
  }
  if (composition.outerwear && composition.outerwear !== 'none') {
    parts.push(`wearing ${composition.outerwear}`);
  }
  
  // Accessories (multiple)
  if (composition.accessories && composition.accessories.length > 0) {
    const accessoryLabels = composition.accessories
      .map(id => getPieceLabel(id))
      .join(', ');
    parts.push(`with ${accessoryLabels}`);
  }
  
  return parts.length > 0 ? `wearing ${parts.join(', ')}` : '';
}
```

---

## P4: UI Skeleton

### Screen: Outfit Composition Picker Modal

**Location**: Opens from "Outfit" button in Content Studio toolbar

**Components**:
1. **Modal Container** (`outfit-composition-picker.tsx`)
   - Full-screen overlay with backdrop
   - Centered modal (max-w-5xl)
   - Header with title and close button
   - Footer with "Clear All" and "Apply" buttons

2. **Category Tabs** (`outfit-category-tabs.tsx`)
   - Horizontal tab bar: [All] [Top] [Bottom] [Shoes] [Headwear] [Outerwear] [Accessories]
   - Active tab highlighted
   - Scrollable on mobile

3. **Search Bar**
   - Input field with search icon
   - Filters pieces within selected category
   - Clears on category change

4. **Composition Preview** (`outfit-composition-preview.tsx`)
   - Shows all selected pieces
   - Each piece has emoji, label, and clear button
   - Organized by category
   - "None selected" state when empty

5. **Piece Grid** (`outfit-piece-grid.tsx`)
   - Responsive grid (2-5 columns based on screen size)
   - Each piece card shows: emoji, label, category
   - Selected pieces highlighted
   - 18+ badge for Adult Content pieces
   - Click to select (replaces previous in category)

**Interactions**:
- Click category tab → Filter grid to that category
- Click piece → Select it (replace previous in category)
- Click clear on preview → Remove that piece
- Click "Clear All" → Reset entire composition
- Type in search → Filter visible pieces
- Click "Apply" → Save composition and close
- Click "X" or backdrop → Close without saving

**Events**:
- `outfit_picker_opened` → On modal open
- `outfit_category_selected` → On tab click
- `outfit_piece_selected` → On piece selection
- `outfit_piece_cleared` → On individual clear
- `outfit_composition_cleared` → On "Clear All"
- `outfit_composition_applied` → On "Apply"

---

## P5: Technical Spec

### File Plan

#### New Files

1. **`libs/shared/src/constants/character/outfit-pieces.ts`**
   - All outfit pieces organized by category
   - Helper functions: `getPiecesByCategory()`, `getPieceById()`
   - Export: `OUTFIT_PIECES`, `OUTFIT_PIECE_CATEGORIES`

2. **`apps/web/components/studio/generation/outfit-composition-picker.tsx`**
   - Main picker component
   - Manages composition state
   - Handles category switching
   - Renders tabs, preview, grid

3. **`apps/web/components/studio/generation/outfit-piece-grid.tsx`**
   - Grid view component
   - Renders piece cards
   - Handles selection

4. **`apps/web/components/studio/generation/outfit-composition-preview.tsx`**
   - Preview section component
   - Shows selected pieces
   - Individual clear buttons

5. **`apps/web/components/studio/generation/outfit-category-tabs.tsx`**
   - Tab navigation component
   - Category switching logic

#### Modified Files

1. **`libs/shared/src/constants/character/types.ts`**
   - Add `OutfitPiece` interface
   - Add `OutfitComposition` interface
   - Add `OutfitPieceCategory` type

2. **`libs/shared/src/constants/character/outfit-options.ts`**
   - Keep for backward compatibility
   - Add migration helper function

3. **`apps/web/components/studio/generation/types.ts`**
   - Update `GenerationSettings.outfit` to `OutfitComposition | null`

4. **`apps/web/components/studio/generation/studio-generation-bar.tsx`**
   - Replace `OutfitPicker` with `OutfitCompositionPicker`
   - Update state management
   - Update display logic

5. **`apps/web/app/influencer/[id]/studio/page.tsx`**
   - Replace `OutfitPicker` with `OutfitCompositionPicker`
   - Update state management

6. **`libs/business/src/prompts/builder.ts`**
   - Add `buildOutfitPrompt()` function
   - Update `withOutfit()` to accept `OutfitComposition`

7. **`apps/api/src/modules/image/services/studio-generation.service.ts`**
   - Update to accept `OutfitComposition`
   - Convert to prompt string

8. **`apps/web/lib/api/studio.ts`**
   - Update `GenerateStudioImagesInput` interface
   - Add composition conversion logic

### Task Breakdown

#### ST-050: Create Outfit Pieces Data Structure
- **TSK-050-1**: Define `OutfitPiece` and `OutfitComposition` interfaces
- **TSK-050-2**: Create `outfit-pieces.ts` with all pieces organized by category
- **TSK-050-3**: Add helper functions for piece lookup and filtering
- **AC**: AC-1

#### ST-051: Build Outfit Composition Picker UI
- **TSK-051-1**: Create main `OutfitCompositionPicker` component
- **TSK-051-2**: Implement category tabs navigation
- **TSK-051-3**: Build piece grid component with selection logic
- **TSK-051-4**: Create composition preview component
- **TSK-051-5**: Add search functionality
- **TSK-051-6**: Implement "Clear All" and individual clear
- **AC**: AC-3

#### ST-052: Integrate Composition into Generation Settings
- **TSK-052-1**: Update `GenerationSettings` type
- **TSK-052-2**: Update `StudioGenerationBar` to use composition picker
- **TSK-052-3**: Update influencer studio page to use composition picker
- **TSK-052-4**: Handle composition state persistence
- **AC**: AC-2

#### ST-053: Implement Prompt Building
- **TSK-053-1**: Create `buildOutfitPrompt()` function
- **TSK-053-2**: Update `PromptBuilder.withOutfit()` method
- **TSK-053-3**: Test prompt generation with various compositions
- **AC**: AC-4

#### ST-054: Add Backward Compatibility
- **TSK-054-1**: Create migration function: string → composition
- **TSK-054-2**: Auto-migrate existing outfit selections
- **TSK-054-3**: Support both formats in API during transition
- **AC**: AC-5

#### ST-055: Update API and Backend
- **TSK-055-1**: Update generation DTO to accept `OutfitComposition`
- **TSK-055-2**: Add validation for composition structure
- **TSK-055-3**: Convert composition to prompt string in service
- **TSK-055-4**: Update database schema if needed (JSON storage)
- **AC**: AC-6

#### ST-056: Add Analytics Integration
- **TSK-056-1**: Add analytics events to picker interactions
- **TSK-056-2**: Track composition usage metrics
- **TSK-056-3**: Verify events in PostHog

### Dependencies

- Content Studio (EP-005) - Must be implemented first
- Analytics system (PostHog) - For event tracking
- Generation API - Must support composition format

---

## P6: Implementation

**Status**: Pending

**Implementation Order**:
1. Data structure and types (ST-050)
2. Prompt building logic (ST-053)
3. UI components (ST-051)
4. Integration into studio (ST-052)
5. API updates (ST-055)
6. Backward compatibility (ST-054)
7. Analytics (ST-056)

---

## P7: Testing & QA

### Unit Tests

- [ ] `buildOutfitPrompt()` handles all composition variations
- [ ] Migration function converts all existing outfits correctly
- [ ] Piece lookup functions work correctly
- [ ] Category filtering works

### Integration Tests

- [ ] Composition picker opens and closes correctly
- [ ] Category switching works
- [ ] Piece selection updates composition
- [ ] Clear functions work
- [ ] Search filters pieces

### E2E Tests (Playwright)

- [ ] User can open outfit picker from Content Studio
- [ ] User can select pieces from different categories
- [ ] User can clear individual pieces
- [ ] User can clear all pieces
- [ ] Composition is saved and used in generation
- [ ] Adult Content pieces hidden when disabled

### Analytics Verification

- [ ] All events fire correctly
- [ ] Event properties are correct
- [ ] Metrics calculated correctly in PostHog

---

## P8: Integration

**Status**: Pending

**Integration Checklist**:
- [ ] Composition picker works in Content Studio
- [ ] Composition picker works in Influencer Studio
- [ ] Generation uses composed outfits correctly
- [ ] Backward compatibility maintained
- [ ] No breaking changes to existing flows

---

## P9: Deployment Prep

**Status**: Pending

**Deployment Checklist**:
- [ ] All environment variables documented
- [ ] Database migrations ready (if needed)
- [ ] API changes backward compatible
- [ ] Analytics events configured in PostHog
- [ ] Smoke test plan ready

---

## P10: Production Validation

**Status**: Pending

**Validation Checklist**:
- [ ] Smoke tests pass
- [ ] Outfit composition usage tracked
- [ ] Generation success rate maintained
- [ ] No performance regressions
- [ ] User feedback collected

---

## User Stories

### ST-050: Create Outfit Pieces Data Structure

**As a** developer  
**I want to** have a structured data model for outfit pieces  
**So that** the system can support piece-by-piece selection

**AC**: AC-1

### ST-051: Compose Custom Outfit

**As a** user in the Content Studio  
**I want to** select individual clothing pieces from different categories  
**So that** I can create unique outfit combinations

**AC**: AC-3

### ST-052: Apply Outfit Composition

**As a** user composing an outfit  
**I want to** apply my composition to the generation  
**So that** the generated image uses my custom outfit

**AC**: AC-3, AC-4

### ST-053: Clear Outfit Pieces

**As a** user composing an outfit  
**I want to** clear individual pieces or all pieces  
**So that** I can easily modify my composition

**AC**: AC-3

### ST-054: Search Outfit Pieces

**As a** user browsing outfit pieces  
**I want to** search for specific pieces  
**So that** I can quickly find what I'm looking for

**AC**: AC-3

---

## Non-Goals (Phase 2+)

- **Outfit Presets**: Quick-select pre-composed outfits
- **Outfit Templates**: Save and reuse compositions
- **Compatibility Validation**: Automatic checks for incompatible pieces
- **Outfit Recommendations**: AI-suggested combinations
- **3D Preview**: Visual preview of composed outfit
- **Outfit History**: Previously used combinations
- **Outfit Sharing**: Sharing compositions
- **Piece Unlocking**: Owned items, unlocking clothes
- **Outfit Library**: Collection of saved outfits

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Too many pieces overwhelm users | Medium | Medium | Good categorization, search, and visual design |
| Prompt quality degrades with custom pieces | Medium | High | Test prompt building with various combinations |
| Performance issues with large piece lists | Low | Medium | Pagination or virtualization if needed |
| Migration breaks existing outfits | Low | High | Thorough testing, backward compatibility |
| Users prefer presets over custom | Medium | Low | Can add presets in Phase 2 if needed |

---

## Phase Checklist

- [ ] P1: Requirements (this epic)
- [ ] P2: Scoping (this epic)
- [ ] P3: Architecture (this epic)
- [ ] P4: UI Skeleton (this epic)
- [ ] P5: Technical Spec (this epic)
- [ ] P6: Implementation
- [ ] P7: Testing
- [ ] P8: Integration
- [ ] P9: Deployment
- [ ] P10: Validation

