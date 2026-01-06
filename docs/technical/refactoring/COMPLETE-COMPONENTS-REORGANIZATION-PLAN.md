# Complete Components Folder Reorganization Plan

> **Status:** Planning  
> **Date:** January 2026  
> **Purpose:** Reorganize ALL files in `apps/web/components/` according to FILE-ORGANIZATION-GUIDE.md

## Overview

The `apps/web/components/` folder has many files at root level that should be organized into feature folders. This plan will reorganize everything to follow consistent patterns.

## Current Issues

### 1. Root Level Files (Should be in feature folders)

**Files that need organization:**
- `app-shell.tsx` → `app-shell/AppShell.tsx`
- `console-log-buffer-init.tsx` → `bug-report/ConsoleLogBufferInit.tsx` (related to bug reporting)
- `desktop-sidebar.tsx` → `sidebar/DesktopSidebar.tsx`
- `influencer-card.tsx` → `influencer/InfluencerCard.tsx`
- `influencer-profile.tsx` → `influencer/InfluencerProfile.tsx`
- `influencer-settings.tsx` → `influencer-settings/InfluencerSettings.tsx` (already has folder)
- `liked-post-row.tsx` → `posts/LikedPostRow.tsx`
- `mobile-blocker.tsx` → `mobile-blocker/MobileBlocker.tsx`
- `password-strength.tsx` → `auth/PasswordStrength.tsx`
- `post-card.tsx` → `posts/PostCard.tsx`
- `post-grid.tsx` → `posts/PostGrid.tsx`
- `profile-picture-generation-indicator.tsx` → `profile-pictures/ProfilePictureGenerationIndicator.tsx`
- `protected-route.tsx` → `auth/ProtectedRoute.tsx`
- `studio-panel.tsx` → `studio/StudioPanel.tsx` (already has studio folder)

### 2. Wizard Folder Structure

**Current Problems:**
- Many step files at root level (`step-*.tsx`)
- `profile-picture-set-selector.tsx` at root (has folder `profile-picture-set-selector/`)
- Missing barrel exports for some sub-folders

**Files to organize:**
```
wizard/
├── steps/                      # NEW: Group all step components
│   ├── StepAdvanced.tsx        # Renamed from step-advanced.tsx
│   ├── StepAIDescription.tsx
│   ├── StepAIGeneration.tsx
│   ├── StepAIReview.tsx
│   ├── StepBaseImageSelection.tsx
│   ├── StepBody.tsx
│   ├── StepBodyModifications.tsx
│   ├── StepCreationMethod.tsx
│   ├── StepCustomPrompts.tsx
│   ├── StepCustomReview.tsx
│   ├── StepFace.tsx
│   ├── StepFinalize.tsx
│   ├── StepGeneral.tsx
│   ├── StepGenerate.tsx
│   ├── StepHair.tsx
│   ├── StepIdentity.tsx
│   ├── StepInfluencerRequest.tsx
│   ├── StepProfilePictures.tsx
│   ├── StepPromptInput.tsx
│   ├── StepSkinFeatures.tsx
│   ├── StepStyle.tsx
│   └── index.ts
├── components/                 # Keep existing
├── finalize/                   # Keep existing
├── hooks/                      # Keep existing
├── profile-picture-set-selector/  # Keep existing (move main file here)
│   ├── ProfilePictureSetSelector.tsx  # Moved from root
│   └── ...
├── utils/                      # Keep existing
├── WizardImageCard.tsx         # Renamed from wizard-image-card.tsx
├── WizardLayout.tsx            # Renamed from wizard-layout.tsx
├── WizardOptionCard.tsx        # Renamed from wizard-option-card.tsx
├── WizardStepContainer.tsx     # Renamed from wizard-step-container.tsx
└── index.ts
```

### 3. Notifications Folder

**Current Problems:**
- Missing barrel export (`index.ts`)
- Files at root level (should stay, but need barrel export)

**Action:**
- Add `notifications/index.ts` barrel export

### 4. Studio Folder

**Current Problems:**
- Some files at root level that could be better organized
- `studio-panel.tsx` at components root (should be in `studio/`)

**Files to move:**
- `studio-panel.tsx` → `studio/StudioPanel.tsx`

### 5. Sidebar Folder

**Current Problems:**
- Missing barrel export
- `desktop-sidebar.tsx` at root (should be in `sidebar/`)

**Action:**
- Move `desktop-sidebar.tsx` → `sidebar/DesktopSidebar.tsx`
- Add `sidebar/index.ts` barrel export

## Target Structure

### Proposed: `apps/web/components/`

```
components/
├── app-shell/
│   ├── AppShell.tsx
│   └── index.ts
│
├── auth/
│   ├── PasswordStrength.tsx
│   ├── ProtectedRoute.tsx
│   └── index.ts
│
├── bug-report/
│   ├── BugReportModal.tsx
│   ├── BrowserInfoDisplay.tsx
│   ├── ConsoleLogBufferInit.tsx  # Moved from root
│   ├── ConsoleLogsPreview.tsx
│   ├── ScreenshotPreview.tsx
│   ├── hooks/
│   ├── index.ts
│   └── ...
│
├── credits/                    # Already well-organized ✅
│   └── ...
│
├── dev/                        # Already well-organized ✅
│   └── ...
│
├── image-gallery/              # Already well-organized ✅
│   └── ...
│
├── influencer/
│   ├── InfluencerCard.tsx      # Moved from root
│   ├── InfluencerProfile.tsx   # Moved from root
│   └── index.ts
│
├── influencer-settings/        # Already has folder ✅
│   ├── InfluencerSettings.tsx  # Move main file here
│   └── ...
│
├── mobile-blocker/
│   ├── MobileBlocker.tsx
│   └── index.ts
│
├── notifications/
│   ├── NotificationsMenu.tsx   # Renamed from notifications-menu.tsx
│   ├── NotificationsDropdown.tsx
│   ├── NotificationsList.tsx
│   ├── NotificationsHeader.tsx
│   ├── NotificationItem.tsx
│   ├── ClockIcon.tsx
│   ├── utils.ts
│   └── index.ts                # NEW: Add barrel export
│
├── posts/
│   ├── PostCard.tsx            # Moved from root
│   ├── PostGrid.tsx            # Moved from root
│   ├── LikedPostRow.tsx        # Moved from root
│   └── index.ts
│
├── pricing/                    # Already well-organized ✅
│   └── ...
│
├── profile-pictures/
│   ├── ProfilePictureGenerationIndicator.tsx  # Moved from root
│   └── index.ts
│
├── seo/                        # Already well-organized ✅
│   └── ...
│
├── sidebar/
│   ├── DesktopSidebar.tsx      # Moved from root
│   ├── SidebarFooter.tsx
│   ├── SidebarHeader.tsx
│   ├── SidebarIcons.tsx
│   ├── SidebarNavigation.tsx
│   └── index.ts                # NEW: Add barrel export
│
├── studio/
│   ├── StudioPanel.tsx         # Moved from root
│   ├── StudioDetailPanel.tsx
│   ├── StudioFilters.tsx
│   ├── StudioGallery.tsx
│   ├── StudioHeader.tsx
│   ├── StudioImageCard.tsx
│   ├── StudioToolbar.tsx
│   ├── InpaintEditModal.tsx
│   ├── components/
│   ├── generation/
│   ├── header/
│   ├── hooks/
│   ├── templates/
│   ├── toolbar/
│   ├── utils/
│   ├── index.ts
│   └── ...
│
├── ui/                         # Already well-organized ✅
│   └── ...
│
└── wizard/
    ├── steps/                  # NEW: Group all step components
    │   ├── StepAdvanced.tsx
    │   ├── StepAIDescription.tsx
    │   ├── ... (all step files)
    │   └── index.ts
    ├── components/
    ├── finalize/
    ├── hooks/
    ├── profile-picture-set-selector/
    │   ├── ProfilePictureSetSelector.tsx  # Moved from root
    │   └── ...
    ├── utils/
    ├── WizardImageCard.tsx     # Renamed from wizard-image-card.tsx
    ├── WizardLayout.tsx        # Renamed from wizard-layout.tsx
    ├── WizardOptionCard.tsx    # Renamed from wizard-option-card.tsx
    ├── WizardStepContainer.tsx # Renamed from wizard-step-container.tsx
    ├── index.ts
    └── ...
```

## Migration Steps

### Phase 1: Create Feature Folders
1. ⏳ Create new folders: `app-shell/`, `auth/`, `influencer/`, `mobile-blocker/`, `posts/`, `profile-pictures/`
2. ⏳ Add barrel exports (`index.ts`) to all folders

### Phase 2: Move Root Level Files
1. ⏳ Move `app-shell.tsx` → `app-shell/AppShell.tsx`
2. ⏳ Move `console-log-buffer-init.tsx` → `bug-report/ConsoleLogBufferInit.tsx`
3. ⏳ Move `desktop-sidebar.tsx` → `sidebar/DesktopSidebar.tsx`
4. ⏳ Move `influencer-card.tsx` → `influencer/InfluencerCard.tsx`
5. ⏳ Move `influencer-profile.tsx` → `influencer/InfluencerProfile.tsx`
6. ⏳ Move `influencer-settings.tsx` → `influencer-settings/InfluencerSettings.tsx`
7. ⏳ Move `liked-post-row.tsx` → `posts/LikedPostRow.tsx`
8. ⏳ Move `mobile-blocker.tsx` → `mobile-blocker/MobileBlocker.tsx`
9. ⏳ Move `password-strength.tsx` → `auth/PasswordStrength.tsx`
10. ⏳ Move `post-card.tsx` → `posts/PostCard.tsx`
11. ⏳ Move `post-grid.tsx` → `posts/PostGrid.tsx`
12. ⏳ Move `profile-picture-generation-indicator.tsx` → `profile-pictures/ProfilePictureGenerationIndicator.tsx`
13. ⏳ Move `protected-route.tsx` → `auth/ProtectedRoute.tsx`
14. ⏳ Move `studio-panel.tsx` → `studio/StudioPanel.tsx`

### Phase 3: Reorganize Wizard Folder
1. ⏳ Create `wizard/steps/` folder
2. ⏳ Move all `step-*.tsx` files to `steps/` and rename to PascalCase
3. ⏳ Move `profile-picture-set-selector.tsx` → `profile-picture-set-selector/ProfilePictureSetSelector.tsx`
4. ⏳ Rename wizard utility files to PascalCase
5. ⏳ Add barrel exports

### Phase 4: Add Missing Barrel Exports
1. ⏳ Add `notifications/index.ts`
2. ⏳ Add `sidebar/index.ts`
3. ⏳ Add `auth/index.ts`
4. ⏳ Add `influencer/index.ts`
5. ⏳ Add `posts/index.ts`
6. ⏳ Add `profile-pictures/index.ts`
7. ⏳ Add `mobile-blocker/index.ts`
8. ⏳ Add `app-shell/index.ts`

### Phase 5: Update Imports
1. ⏳ Find all imports referencing moved files
2. ⏳ Update imports across the codebase
3. ⏳ Update barrel exports in `index.ts` files
4. ⏳ Verify TypeScript compilation

### Phase 6: Cleanup & Verification
1. ⏳ Remove old empty folders (if any)
2. ⏳ Verify all imports resolve correctly
3. ⏳ Run linter: `nx lint web`
4. ⏳ Test manually: Verify app works

## File Naming Changes

### PascalCase for Components
- `app-shell.tsx` → `AppShell.tsx`
- `influencer-card.tsx` → `InfluencerCard.tsx`
- `wizard-image-card.tsx` → `WizardImageCard.tsx`
- `step-advanced.tsx` → `StepAdvanced.tsx`
- etc.

### kebab-case for Utilities/Hooks (keep existing)
- `use-influencer-settings.ts` ✅ (already correct)

## Import Path Updates

### Before:
```typescript
import { InfluencerCard } from '@/components/influencer-card';
import { PostCard } from '@/components/post-card';
import { StepAdvanced } from '@/components/wizard/step-advanced';
```

### After:
```typescript
import { InfluencerCard } from '@/components/influencer/InfluencerCard';
import { PostCard } from '@/components/posts/PostCard';
import { StepAdvanced } from '@/components/wizard/steps/StepAdvanced';
```

### Or via barrel export:
```typescript
import { InfluencerCard } from '@/components/influencer';
import { PostCard } from '@/components/posts';
import { StepAdvanced } from '@/components/wizard/steps';
```

## Risk Assessment

### Low Risk
- Moving files to feature folders
- Adding barrel exports
- Renaming files (with proper import updates)

### Medium Risk
- Updating imports across many files
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
- ✅ App functions correctly
- ✅ Barrel exports used consistently
- ✅ No files at root level (except `index.ts` if needed)

## Estimated Effort

- **Phase 1**: 30 min (create folders, add barrel exports)
- **Phase 2**: 1 hour (move root files)
- **Phase 3**: 1-2 hours (reorganize wizard)
- **Phase 4**: 30 min (add barrel exports)
- **Phase 5**: 2-3 hours (update imports)
- **Phase 6**: 1 hour (cleanup, verification)

**Total**: ~6-8 hours

## Next Steps

1. Review and approve this plan
2. Continue on feature branch `refactor/web-app-folder-structure`
3. Begin Phase 1 execution
4. Execute phases incrementally with testing after each

## Related Documentation

- [File Organization Guide](../FILE-ORGANIZATION-GUIDE.md)
- [Web App Reorganization Plan](./WEB-APP-REORGANIZATION-PLAN.md)
- [Refactoring Guide](./REFACTORING-GUIDE.md)

