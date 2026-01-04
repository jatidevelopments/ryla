# Multi-Piece Outfit System Design

## Overview
Transform the outfit system from single-selection to a multi-piece composition system where users can select individual clothing items from different categories.

## Current State
- **Single Selection**: `outfit: string | null` (e.g., "casual-streetwear", "lingerie")
- **Usage**: Directly inserted into prompts as `wearing ${outfit}`
- **Storage**: Simple string in database and generation settings

## Proposed Architecture

### 1. Data Model

#### TypeScript Interface
```typescript
interface OutfitComposition {
  top?: string;           // Single selection: "tank-top", "crop-top", "bra", "nude-top"
  bottom?: string;        // Single selection: "jeans", "mini-skirt", "thong", "nude-bottom"
  shoes?: string;         // Single selection: "sneakers", "high-heels", "boots", "barefoot"
  headwear?: string;      // Single selection: "sunglasses", "hat", "cap", "none"
  outerwear?: string;     // Single selection: "jacket", "coat", "hoodie", "none"
  accessories?: string[]; // Multiple selection: ["necklace", "earrings", "bracelet"]
}

// In GenerationSettings
outfit: OutfitComposition | null;
```

#### Database Storage
- **Option A**: JSON column (flexible, easy to query)
- **Option B**: Separate columns (better for filtering, but less flexible)
- **Recommendation**: JSON column for MVP, migrate to separate columns if needed

### 2. Outfit Pieces Structure

#### Categories & Constraints
1. **Top** (single selection)
   - T-shirts, tank tops, crop tops
   - Blouses, shirts
   - Bras, lingerie tops
   - Nude/topless (NSFW)

2. **Bottom** (single selection)
   - Jeans, trousers, pants
   - Skirts, shorts
   - Underwear, thongs
   - Nude/bottomless (NSFW)

3. **Shoes** (single selection)
   - Sneakers, boots, heels
   - Sandals, flats
   - Barefoot (NSFW)

4. **Headwear** (single selection, optional)
   - Hats, caps, beanies
   - Sunglasses, glasses
   - Headbands, hair accessories
   - None (default)

5. **Outerwear** (single selection, optional)
   - Jackets, coats
   - Hoodies, sweaters
   - Cardigans, blazers
   - None (default)

6. **Accessories** (multiple selection)
   - Jewelry: necklaces, earrings, bracelets, rings
   - Bags: handbags, backpacks
   - Belts, watches
   - NSFW: collars, harnesses, etc.

### 3. UI/UX Design

#### Outfit Picker Modal Structure
```
┌─────────────────────────────────────────┐
│  Outfit Selection              [X]     │
├─────────────────────────────────────────┤
│  [All] [Top] [Bottom] [Shoes] [Head]   │
│  [Outer] [Accessories]                  │
├─────────────────────────────────────────┤
│                                         │
│  [Selected Items Preview]               │
│  Top: Tank Top        [×]               │
│  Bottom: Jeans        [×]               │
│  Shoes: Sneakers      [×]               │
│                                         │
│  [Grid of available items]              │
│                                         │
├─────────────────────────────────────────┤
│  [Clear All]              [Apply]       │
└─────────────────────────────────────────┘
```

#### Interaction Flow
1. User clicks "Outfit" button
2. Modal opens showing current selection (if any)
3. User selects category tab (Top, Bottom, etc.)
4. Grid shows items for that category
5. Selecting an item replaces previous selection in that category
6. Accessories allow multiple selections (checkboxes)
7. Preview shows all selected pieces
8. "Clear All" resets entire outfit
9. Individual items can be cleared with [×] button

### 4. Prompt Building

#### Current
```typescript
`wearing ${outfit}` // e.g., "wearing casual-streetwear"
```

#### Proposed
```typescript
function buildOutfitPrompt(composition: OutfitComposition | null): string {
  if (!composition) return '';
  
  const parts: string[] = [];
  
  if (composition.top) parts.push(composition.top);
  if (composition.bottom) parts.push(composition.bottom);
  if (composition.shoes) parts.push(composition.shoes);
  if (composition.headwear && composition.headwear !== 'none') {
    parts.push(`wearing ${composition.headwear}`);
  }
  if (composition.outerwear && composition.outerwear !== 'none') {
    parts.push(`wearing ${composition.outerwear}`);
  }
  if (composition.accessories && composition.accessories.length > 0) {
    parts.push(`with ${composition.accessories.join(', ')}`);
  }
  
  return parts.length > 0 ? `wearing ${parts.join(', ')}` : '';
}
```

### 5. Migration Strategy

#### Phase 1: Data Structure
1. Create new `OutfitComposition` type
2. Add migration helper to convert old string → new structure
3. Update `GenerationSettings` interface

#### Phase 2: UI Components
1. Create new `OutfitCompositionPicker` component
2. Reorganize outfit options into piece categories
3. Update outfit picker modal with tabs

#### Phase 3: Backend Integration
1. Update API to accept `OutfitComposition`
2. Update prompt building logic
3. Handle backward compatibility (old string outfits)

#### Phase 4: Database
1. Update schema to store JSON
2. Migrate existing outfit strings to compositions
3. Add validation

### 6. Outfit Pieces Data Structure

```typescript
interface OutfitPiece {
  id: string;
  label: string;
  emoji: string;
  category: 'top' | 'bottom' | 'shoes' | 'headwear' | 'outerwear' | 'accessory';
  isAdult?: boolean;
  compatibleWith?: string[]; // IDs of pieces that work well together
}

// Example
const OUTFIT_PIECES: OutfitPiece[] = [
  // Tops
  { id: 'tank-top', label: 'Tank Top', emoji: '👕', category: 'top' },
  { id: 'crop-top', label: 'Crop Top', emoji: '👚', category: 'top' },
  { id: 'bra', label: 'Bra', emoji: '💋', category: 'top', isAdult: true },
  { id: 'nude-top', label: 'Topless', emoji: '🔥', category: 'top', isAdult: true },
  
  // Bottoms
  { id: 'jeans', label: 'Jeans', emoji: '👖', category: 'bottom' },
  { id: 'mini-skirt', label: 'Mini Skirt', emoji: '🩳', category: 'bottom' },
  { id: 'thong', label: 'Thong', emoji: '🔥', category: 'bottom', isAdult: true },
  { id: 'nude-bottom', label: 'Bottomless', emoji: '🔥', category: 'bottom', isAdult: true },
  
  // Shoes
  { id: 'sneakers', label: 'Sneakers', emoji: '👟', category: 'shoes' },
  { id: 'high-heels', label: 'High Heels', emoji: '👠', category: 'shoes' },
  { id: 'barefoot', label: 'Barefoot', emoji: '🦶', category: 'shoes', isAdult: true },
  
  // Headwear
  { id: 'sunglasses', label: 'Sunglasses', emoji: '🕶️', category: 'headwear' },
  { id: 'hat', label: 'Hat', emoji: '🧢', category: 'headwear' },
  { id: 'none-headwear', label: 'None', emoji: '✕', category: 'headwear' },
  
  // Outerwear
  { id: 'jacket', label: 'Jacket', emoji: '🧥', category: 'outerwear' },
  { id: 'hoodie', label: 'Hoodie', emoji: '🧥', category: 'outerwear' },
  { id: 'none-outerwear', label: 'None', emoji: '✕', category: 'outerwear' },
  
  // Accessories (multiple allowed)
  { id: 'necklace', label: 'Necklace', emoji: '💎', category: 'accessory' },
  { id: 'earrings', label: 'Earrings', emoji: '💍', category: 'accessory' },
  { id: 'collar', label: 'Collar', emoji: '🔗', category: 'accessory', isAdult: true },
];
```

### 7. Implementation Steps

1. **Create Outfit Pieces Data** (`libs/shared/src/constants/character/outfit-pieces.ts`)
   - Define all outfit pieces organized by category
   - Include SFW and NSFW options

2. **Update Types** (`libs/shared/src/constants/character/types.ts`)
   - Add `OutfitComposition` interface
   - Add `OutfitPiece` interface

3. **Create Outfit Composition Picker** (`apps/web/components/studio/generation/outfit-composition-picker.tsx`)
   - Tabbed interface for categories
   - Grid view for each category
   - Preview of selected items
   - Clear individual items

4. **Update Generation Settings** (`apps/web/components/studio/generation/types.ts`)
   - Change `outfit: string | null` to `outfit: OutfitComposition | null`

5. **Update Prompt Building** (`libs/business/src/prompts/builder.ts`)
   - Add `buildOutfitPrompt()` function
   - Update `withOutfit()` to accept `OutfitComposition`

6. **Update API** (`apps/api/src/modules/image/services/studio-generation.service.ts`)
   - Accept `OutfitComposition` in DTO
   - Convert to prompt string

7. **Backward Compatibility**
   - Migration function: `string → OutfitComposition`
   - Support both formats during transition

### 8. Benefits

- **More Control**: Users can mix and match pieces
- **Better Prompts**: More specific outfit descriptions
- **Flexibility**: Can create unique combinations
- **Scalability**: Easy to add new pieces
- **User Experience**: More intuitive than preset outfits

### 9. Considerations

- **Validation**: Ensure compatible pieces (e.g., don't allow "nude-top" + "bra")
- **Defaults**: What happens when user clears all? Use character's default outfit?
- **Presets**: Could still offer "Quick Outfits" that pre-fill multiple pieces
- **Performance**: Large grid of items - need pagination or search
- **Mobile**: Tabbed interface needs to work on small screens

