# Web App Folder Structure Reorganization Plan

> **Status:** Planning  
> **Date:** January 2026  
> **Purpose:** Clean up and standardize folder structure in `apps/web/` according to FILE-ORGANIZATION-GUIDE.md

## Overview

The web app currently has inconsistent folder organization, particularly in:
- `components/studio/generation/` - Many files at root level
- Mixed organization patterns across features
- Inconsistent use of barrel exports (`index.ts`)

This plan will reorganize the structure to match the established patterns in `docs/technical/FILE-ORGANIZATION-GUIDE.md`.

## Current Issues

### 1. `components/studio/generation/` Structure

**Current Problems:**
- Many picker components at root level (`character-picker.tsx`, `model-picker.tsx`, `pose-picker.tsx`, etc.)
- Some pickers have sub-folders (`aspect-ratio-picker/`, `mode-selector/`, `object-picker/`, `pose-picker/`)
- Inconsistent organization patterns
- Components mixed with hooks and utils at same level

**Files at root level that should be organized:**
```
components/studio/generation/
├── character-picker.tsx          # Should be in pickers/
├── liked-filter-picker.tsx       # Should be in pickers/
├── model-picker.tsx               # Should be in pickers/
├── object-picker.tsx              # Already has folder, should move main file
├── outfit-composition-picker.tsx  # Should be in pickers/
├── outfit-mode-selector.tsx       # Should be in pickers/
├── pose-picker.tsx                # Already has folder, should move main file
├── pre-composed-outfit-picker.tsx # Should be in pickers/
├── quality-picker.tsx             # Should be in pickers/
├── style-picker.tsx               # Should be in pickers/
├── studio-generation-bar.tsx     # Main component (correct location)
├── types.ts                       # Should be in types.ts or moved to types/
├── upload-consent-dialog.tsx      # Should be in dialogs/
└── ...
```

### 2. Missing Barrel Exports

Several folders lack `index.ts` barrel exports, making imports verbose:
- `components/studio/generation/components/` - Has index.ts ✅
- `components/studio/generation/hooks/` - Has index.ts ✅
- `components/studio/generation/utils/` - Missing index.ts ❌
- `components/studio/generation/icons/` - Has index.ts ✅

### 3. Inconsistent Component Organization

Some components follow the pattern, others don't:
- ✅ `aspect-ratio-picker/` - Well organized with components/, hooks/
- ✅ `mode-selector/` - Well organized with components/, constants.tsx
- ✅ `object-picker/` - Has hooks/ but main file at root
- ✅ `pose-picker/` - Well organized but main file at root
- ❌ `character-picker.tsx` - Single file at root (should be in pickers/)
- ❌ `model-picker.tsx` - Single file at root (should be in pickers/)

## Target Structure

### Proposed: `components/studio/generation/`

```
components/studio/generation/
├── StudioGenerationBar.tsx       # Main component (renamed from studio-generation-bar.tsx)
├── index.ts                       # Barrel export
│
├── pickers/                       # All picker components
│   ├── CharacterPicker.tsx        # Renamed from character-picker.tsx
│   ├── LikedFilterPicker.tsx      # Renamed from liked-filter-picker.tsx
│   ├── ModelPicker.tsx            # Renamed from model-picker.tsx
│   ├── QualityPicker.tsx          # Renamed from quality-picker.tsx
│   ├── StylePicker.tsx            # Renamed from style-picker.tsx
│   ├── OutfitCompositionPicker.tsx # Renamed from outfit-composition-picker.tsx
│   ├── OutfitModeSelector.tsx     # Renamed from outfit-mode-selector.tsx
│   ├── PreComposedOutfitPicker.tsx # Renamed from pre-composed-outfit-picker.tsx
│   │
│   ├── AspectRatioPicker/         # Keep existing structure
│   │   ├── AspectRatioPicker.tsx  # Renamed from index.tsx
│   │   ├── components/
│   │   ├── hooks/
│   │   └── index.ts
│   │
│   ├── ModeSelector/              # Keep existing structure
│   │   ├── ModeSelector.tsx       # Renamed from index.tsx
│   │   ├── components/
│   │   ├── constants.tsx
│   │   └── index.ts
│   │
│   ├── ObjectPicker/              # Move main file here
│   │   ├── ObjectPicker.tsx       # Moved from object-picker.tsx
│   │   ├── components/            # New: extract sub-components
│   │   │   ├── ObjectCard.tsx     # Moved from object-card.tsx
│   │   │   ├── ObjectPickerEmpty.tsx # Moved from object-picker-empty.tsx
│   │   │   ├── ObjectPickerFooter.tsx # Moved from object-picker-footer.tsx
│   │   │   ├── ObjectPickerHeader.tsx # Moved from object-picker-header.tsx
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   ├── use-object-search.ts
│   │   │   ├── use-object-upload.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   └── PosePicker/                # Move main file here
│       ├── PosePicker.tsx         # Moved from pose-picker.tsx
│       ├── components/            # Keep existing
│       ├── hooks/                 # Keep existing
│       └── index.ts
│
├── components/                    # Shared generation components
│   ├── ControlButtonsRow.tsx
│   ├── GenerateButton.tsx
│   ├── InfluencerThumbnails.tsx
│   ├── PromptInputRow.tsx
│   ├── SelectedImageDisplay.tsx
│   ├── PickerModals.tsx
│   │
│   ├── control-buttons/           # Keep existing
│   │   └── ...
│   │
│   ├── picker-modals/            # Keep existing
│   │   └── ...
│   │
│   └── outfit-picker/             # NEW: Group outfit picker components
│       ├── OutfitPickerCategories.tsx # Renamed from outfit-picker-categories.tsx
│       ├── OutfitPickerFooter.tsx     # Moved from components/
│       ├── OutfitPickerHeader.tsx     # Moved from components/
│       ├── OutfitPickerSearch.tsx     # Renamed from outfit-picker-search.tsx
│       ├── OutfitPiecesGrid.tsx       # Renamed from outfit-pieces-grid.tsx
│       ├── OutfitPresetsGrid.tsx      # Renamed from outfit-presets-grid.tsx
│       ├── SelectedPiecesSidebar.tsx  # Renamed from selected-pieces-sidebar.tsx
│       └── index.ts
│   │
│   └── style-picker/              # NEW: Group style picker components
│       ├── StyleCategoryFilters.tsx   # Renamed from style-category-filters.tsx
│       ├── StylePickerFooter.tsx      # Moved from components/
│       ├── StylePickerGrids.tsx      # Renamed from style-picker-grids.tsx
│       ├── StylePickerHeader.tsx     # Moved from components/
│       ├── StylePickerTabs.tsx       # Renamed from style-picker-tabs.tsx
│       └── index.ts
│   │
│   └── pre-composed-outfit/        # NEW: Group pre-composed outfit components
│       ├── PreComposedOutfitCard.tsx      # Renamed from pre-composed-outfit-card.tsx
│       ├── PreComposedOutfitPickerFooter.tsx # Moved from components/
│       ├── PreComposedOutfitPickerHeader.tsx # Moved from components/
│       ├── PreComposedOutfitPickerPreview.tsx # Moved from components/
│       ├── PreComposedOutfitPickerTabs.tsx # Moved from components/
│       └── index.ts
│   │
│   └── dialogs/                    # NEW: Group dialog components
│       ├── SavePresetDialog.tsx    # Renamed from save-preset-dialog.tsx
│       ├── UploadConsentDialog.tsx # Moved from root
│       └── index.ts
│
├── hooks/                         # Generation hooks (keep existing structure)
│   ├── use-control-visibility.ts
│   ├── use-generation-validation.ts
│   ├── use-image-settings-loader.ts
│   ├── use-mode-change-handler.ts
│   ├── use-model-selection.ts
│   ├── use-outfit-composition.ts
│   ├── use-outfit-display.ts
│   ├── use-outfit-picker-state.ts
│   ├── use-outfit-presets.ts
│   ├── use-persisted-settings.ts
│   ├── use-style-picker.ts
│   ├── useGenerationSettings.ts
│   ├── usePickerState.ts
│   ├── usePreComposedOutfitFilter.ts
│   └── index.ts
│
├── utils/                         # Generation utilities
│   ├── get-prompt-placeholder.ts
│   ├── get-selected-pieces.ts
│   └── index.ts                    # NEW: Add barrel export
│
├── icons/                         # Generation icons (keep existing)
│   ├── AspectRatioIcon.tsx
│   ├── ModelIcon.tsx
│   └── index.ts
│
└── types.ts                       # Generation types (keep at root)
```

## Migration Steps

### Phase 1: Preparation
1. ✅ Review FILE-ORGANIZATION-GUIDE.md
2. ✅ Create reorganization plan
3. ⏳ Backup current structure
4. ⏳ Create feature branch: `refactor/web-app-folder-structure`

### Phase 2: Create New Structure
1. ⏳ Create new folder structure (empty folders)
2. ⏳ Add missing `index.ts` barrel exports
3. ⏳ Update `tsconfig.json` paths if needed

### Phase 3: Move and Rename Files
1. ⏳ Move picker components to `pickers/` folder
   - Rename files to PascalCase
   - Update internal imports
2. ⏳ Move dialog components to `components/dialogs/`
3. ⏳ Group outfit picker components in `components/outfit-picker/`
4. ⏳ Group style picker components in `components/style-picker/`
5. ⏳ Group pre-composed outfit components in `components/pre-composed-outfit/`
6. ⏳ Move ObjectPicker main file to `pickers/ObjectPicker/`
7. ⏳ Move PosePicker main file to `pickers/PosePicker/`
8. ⏳ Rename `studio-generation-bar.tsx` to `StudioGenerationBar.tsx`

### Phase 4: Update Imports
1. ⏳ Find all imports referencing moved files
2. ⏳ Update imports in:
   - `app/studio/page.tsx`
   - `app/studio/components/*.tsx`
   - `app/studio/hooks/*.ts`
   - `components/studio/*.tsx`
   - Any other files importing from `components/studio/generation/`
3. ⏳ Update barrel exports in `index.ts` files
4. ⏳ Verify TypeScript compilation: `nx type-check web`

### Phase 5: Cleanup
1. ⏳ Remove old empty folders
2. ⏳ Verify all imports resolve correctly
3. ⏳ Run linter: `nx lint web`
4. ⏳ Test manually: Verify studio page works
5. ⏳ Update documentation if needed

### Phase 6: Verification
1. ⏳ Run full test suite: `nx test web` (if tests exist)
2. ⏳ Manual smoke test of studio features
3. ⏳ Check for any broken imports
4. ⏳ Review file sizes (should be < 150 lines per file)

## File Naming Changes

### PascalCase for Components
- `character-picker.tsx` → `CharacterPicker.tsx`
- `model-picker.tsx` → `ModelPicker.tsx`
- `pose-picker.tsx` → `PosePicker.tsx`
- `studio-generation-bar.tsx` → `StudioGenerationBar.tsx`
- `upload-consent-dialog.tsx` → `UploadConsentDialog.tsx`

### kebab-case for Utilities/Hooks (keep existing)
- `use-generation-validation.ts` ✅ (already correct)
- `get-prompt-placeholder.ts` ✅ (already correct)

## Import Path Updates

### Before:
```typescript
import { CharacterPicker } from '@/components/studio/generation/character-picker';
import { ModelPicker } from '@/components/studio/generation/model-picker';
import { PosePicker } from '@/components/studio/generation/pose-picker';
```

### After:
```typescript
import { CharacterPicker } from '@/components/studio/generation/pickers/CharacterPicker';
import { ModelPicker } from '@/components/studio/generation/pickers/ModelPicker';
import { PosePicker } from '@/components/studio/generation/pickers/PosePicker';
```

### Or via barrel export:
```typescript
import { CharacterPicker, ModelPicker, PosePicker } from '@/components/studio/generation/pickers';
```

## Risk Assessment

### Low Risk
- Moving files within same feature (`generation/`)
- Adding barrel exports
- Renaming files (with proper import updates)

### Medium Risk
- Updating imports across multiple files
- Ensuring TypeScript paths resolve correctly

### Mitigation
- Use TypeScript compiler to catch import errors
- Test incrementally after each phase
- Use git to track changes and allow rollback

## Success Criteria

- ✅ All files follow FILE-ORGANIZATION-GUIDE.md patterns
- ✅ All imports resolve correctly
- ✅ TypeScript compilation passes
- ✅ Linter passes
- ✅ Studio page functions correctly
- ✅ File sizes < 150 lines (where applicable)
- ✅ Barrel exports used consistently

## Estimated Effort

- **Phase 1**: 30 min (planning, branch creation)
- **Phase 2**: 1 hour (create structure, add barrel exports)
- **Phase 3**: 2-3 hours (move/rename files)
- **Phase 4**: 2-3 hours (update imports)
- **Phase 5**: 1 hour (cleanup, verification)
- **Phase 6**: 1 hour (testing)

**Total**: ~8-10 hours

## Next Steps

1. Review and approve this plan
2. Create feature branch
3. Begin Phase 1 execution
4. Execute phases incrementally with testing after each

## Related Documentation

- [File Organization Guide](../FILE-ORGANIZATION-GUIDE.md)
- [Refactoring Guide](./REFACTORING-GUIDE.md)
- [Refactoring Status](./REFACTORING-STATUS.md)

