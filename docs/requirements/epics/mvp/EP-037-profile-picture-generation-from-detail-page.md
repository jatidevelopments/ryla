# [EPIC] EP-037: Profile Picture Generation from Influencer Detail Page

## Overview

Enable users to generate profile picture sets directly from the influencer detail page when they were skipped during character creation. This fulfills the promise made in the wizard's "Generate Later" option, which states users can "generate profile pictures anytime from your character page."

Currently, users can skip profile picture generation during wizard creation, but there's no way to generate them later from the influencer detail page, despite the UI text promising this functionality.

---

## Business Impact

**Target Metric**: B - Retention, C - Core Value

**Hypothesis**: When users can generate profile pictures after character creation, they have more control over their workflow, can complete their character setup at their own pace, and are more likely to return to use the platform.

**Success Criteria**:
- Profile picture generation from detail page: **>30%** of users who skipped during wizard
- Time to generate after character creation: **<24 hours** (median)
- Generation completion rate: **>85%** (users who start generation complete it)
- User satisfaction: Users can successfully generate profile pictures when needed

---

## Features

### F1: Missing Profile Pictures Detection

- Detect when an influencer has no profile picture set (`profilePictureSetId` is `null` or `undefined`)
- Check if profile pictures exist in the database for the character
- Show appropriate UI state based on detection
- Handle edge cases (partial sets, failed generations)

### F2: Generate Profile Pictures Card/Button

- Display a prominent card or button on the influencer detail page when profile pictures are missing
- Positioned near the profile header or in the content area
- Clear call-to-action: "Generate Profile Pictures" or "Create Profile Picture Set"
- Visual design consistent with existing UI patterns
- Shows available profile picture sets (classic-influencer, professional-model, natural-beauty)
- Allow users to select which set to generate (default: classic-influencer)

### F3: Profile Picture Set Selection

- Show available profile picture sets as options
- Display set descriptions/previews if available
- Default to "classic-influencer" if no preference
- Allow users to change selection before generating
- Store selected set preference (optional, for future use)

### F4: Generation Trigger & API Integration

- Call existing `generateProfilePictureSet` API endpoint
- Pass required parameters:
  - `baseImageUrl` (from character's selected base image)
  - `characterId`
  - `setId` (selected profile picture set)
  - `nsfwEnabled` (from character config)
  - `generationMode` (default: 'fast')
- Handle credit checks and insufficient credits gracefully
- Show credit cost information before generation

### F5: Progress Tracking & UI Updates

- Use existing `ProfilePictureGenerationIndicator` component to show progress
- Track generation status using existing `useProfilePictures` store
- Update UI when generation starts (hide button, show progress)
- Update UI when generation completes (show success, hide progress)
- Handle generation failures with error messages

### F6: Error Handling & Edge Cases

- Handle insufficient credits (show credit modal or message)
- Handle missing base image (show error message)
- Handle API errors (network, server errors)
- Handle generation failures (retry option)
- Handle cases where character doesn't exist
- Handle cases where user doesn't have permission

### F7: Post-Generation Updates

- Update character config with `profilePictureSetId` after successful generation
- Refresh influencer data to show new profile pictures
- Update UI to reflect profile pictures are now available
- Show success message/notification when complete

---

## Acceptance Criteria

### AC-1: Missing Profile Pictures Detection

- [ ] System correctly detects when `profilePictureSetId` is `null` or `undefined`
- [ ] System checks for existing profile pictures in database
- [ ] Detection works for characters created before this feature
- [ ] Detection works for characters created after this feature
- [ ] Edge cases handled (partial sets, failed generations)

### AC-2: Generate Profile Pictures UI

- [ ] Card/button visible on influencer detail page when profile pictures are missing
- [ ] UI element is prominent and clearly indicates action
- [ ] UI element positioned appropriately (near profile header or content area)
- [ ] Design is consistent with existing UI patterns
- [ ] UI element is hidden when profile pictures exist
- [ ] UI element is hidden when generation is in progress
- [ ] Mobile responsive design

### AC-3: Profile Picture Set Selection

- [ ] Available sets are displayed as options
- [ ] Default set is "classic-influencer"
- [ ] Users can change selection before generating
- [ ] Set descriptions/previews shown if available
- [ ] Selection is clear and intuitive

### AC-4: Generation Trigger

- [ ] Clicking generate button triggers API call
- [ ] API call includes all required parameters:
  - [ ] `baseImageUrl` (from character)
  - [ ] `characterId`
  - [ ] `setId` (selected set)
  - [ ] `nsfwEnabled` (from character config)
  - [ ] `generationMode` (default: 'fast')
- [ ] Credit check performed before generation
- [ ] Credit cost displayed to user
- [ ] Generation starts successfully

### AC-5: Progress Tracking

- [ ] `ProfilePictureGenerationIndicator` shows when generation starts
- [ ] Progress updates correctly (X/Y images)
- [ ] Progress indicator is visible and accurate
- [ ] Generation button/card hidden during generation
- [ ] Progress indicator hidden when generation completes

### AC-6: Error Handling

- [ ] Insufficient credits: Shows credit modal or clear error message
- [ ] Missing base image: Shows clear error message
- [ ] API errors: Shows user-friendly error message
- [ ] Generation failures: Shows error with retry option
- [ ] Network errors: Shows retry option
- [ ] All errors are logged for debugging

### AC-7: Post-Generation Updates

- [ ] Character config updated with `profilePictureSetId` after success
- [ ] Influencer data refreshed to show new profile pictures
- [ ] UI updated to reflect profile pictures are available
- [ ] Success message/notification shown when complete
- [ ] Generate button/card hidden after successful generation

### AC-8: Integration with Existing Systems

- [ ] Uses existing `generateProfilePictureSet` API endpoint
- [ ] Uses existing `ProfilePictureGenerationIndicator` component
- [ ] Uses existing `useProfilePictures` store for state management
- [ ] Uses existing credit system and checks
- [ ] Follows existing error handling patterns
- [ ] Follows existing analytics patterns

---

## User Flow

### Happy Path

1. User navigates to influencer detail page (`/influencer/[id]`)
2. System detects profile pictures are missing (`profilePictureSetId` is `null`)
3. User sees "Generate Profile Pictures" card/button
4. User clicks button (optionally selects profile picture set)
5. System checks credits and shows cost
6. User confirms generation
7. System calls API to start generation
8. `ProfilePictureGenerationIndicator` appears showing progress
9. Generation completes successfully
10. Character config updated with `profilePictureSetId`
11. UI refreshes to show profile pictures are available
12. Success message shown
13. Generate button/card hidden

### Error Paths

**Insufficient Credits:**
1. User clicks generate button
2. System checks credits
3. Insufficient credits detected
4. Credit modal shown or error message displayed
5. User can purchase credits or cancel

**Missing Base Image:**
1. User clicks generate button
2. System checks for base image
3. Base image missing
4. Error message shown: "Base image required. Please select a base image first."
5. User can navigate to settings or wizard

**Generation Failure:**
1. Generation starts
2. Error occurs during generation
3. Error message shown with retry option
4. User can retry or cancel

---

## Technical Implementation

### Frontend Components

- **New Component**: `ProfilePictureGenerationCard` or similar
  - Location: `apps/web/components/profile-pictures/ProfilePictureGenerationCard.tsx`
  - Props: `influencerId`, `character`, `onGenerate`
  - Shows when profile pictures are missing
  - Handles set selection
  - Triggers generation

- **Modified Component**: `apps/web/app/influencer/[id]/page.tsx`
  - Add logic to detect missing profile pictures
  - Conditionally render `ProfilePictureGenerationCard`
  - Integrate with existing `ProfilePictureGenerationIndicator`

### API Integration

- **Existing Endpoint**: `POST /characters/generate-profile-picture-set`
- **Function**: `generateProfilePictureSetAndWait` (already exists in `apps/web/lib/api/character.ts`)
- **Store**: `useProfilePictures` (already exists in `@ryla/business`)

### State Management

- Use existing `useProfilePictures` store for generation state
- Use existing `useInfluencerData` hook for character data
- Add detection logic for missing profile pictures

### Data Flow

```
User clicks "Generate Profile Pictures"
  ↓
Check credits (use existing credit system)
  ↓
Call generateProfilePictureSetAndWait()
  ↓
Update useProfilePictures store (start tracking)
  ↓
ProfilePictureGenerationIndicator shows progress
  ↓
On completion: Update character config with profilePictureSetId
  ↓
Refresh influencer data
  ↓
Hide generate button, show success
```

---

## Dependencies

- **EP-001**: Character Creation Wizard (must understand wizard flow and skip option)
- **EP-005**: Content Studio (uses similar generation patterns)
- **EP-009**: Generation Credits & Limits (credit checks)
- **EP-015**: Image Generation Speed-First Flow (generation modes)
- **EP-018**: AI Influencer Settings (character config structure)

---

## Stories

### ST-037-010: Missing Profile Pictures Detection

**Goal**: Detect when profile pictures are missing and show appropriate UI.

**Acceptance Criteria**:
- [ ] Function to detect missing profile pictures (`profilePictureSetId` is null/undefined)
- [ ] Check for existing profile pictures in database
- [ ] Return boolean indicating if generation UI should be shown
- [ ] Handle edge cases (partial sets, failed generations)
- [ ] Unit tests for detection logic

---

### ST-037-020: Generate Profile Pictures Card Component

**Goal**: Create UI component to trigger profile picture generation.

**Acceptance Criteria**:
- [ ] Component shows when profile pictures are missing
- [ ] Component hidden when profile pictures exist
- [ ] Component hidden during generation
- [ ] Clear call-to-action button
- [ ] Profile picture set selection (default: classic-influencer)
- [ ] Shows credit cost before generation
- [ ] Mobile responsive
- [ ] Follows existing design patterns

---

### ST-037-030: Generation Integration on Detail Page

**Goal**: Integrate generation trigger with influencer detail page.

**Acceptance Criteria**:
- [ ] Detection logic integrated into `useInfluencerData` or similar hook
- [ ] `ProfilePictureGenerationCard` conditionally rendered on detail page
- [ ] Generation button triggers API call with correct parameters
- [ ] Progress tracking integrated with `ProfilePictureGenerationIndicator`
- [ ] Error handling integrated
- [ ] Success handling integrated

---

### ST-037-040: Post-Generation Updates

**Goal**: Update character config and UI after successful generation.

**Acceptance Criteria**:
- [ ] Character config updated with `profilePictureSetId` after success
- [ ] Influencer data refreshed
- [ ] UI updated to reflect profile pictures are available
- [ ] Success message/notification shown
- [ ] Generate button/card hidden after success

---

## Analytics (PostHog)

### Events

- `profile_picture_generation_initiated_from_detail_page`
  - props: `{ influencer_id, character_id, set_id, nsfw_enabled, generation_mode }`

- `profile_picture_generation_started_from_detail_page`
  - props: `{ influencer_id, character_id, set_id, credits_used }`

- `profile_picture_generation_completed_from_detail_page`
  - props: `{ influencer_id, character_id, set_id, total_images, duration_ms }`

- `profile_picture_generation_failed_from_detail_page`
  - props: `{ influencer_id, character_id, set_id, error, duration_ms }`

---

## Risks / Notes

- **Credit System**: Must ensure credit checks happen before generation starts
- **Base Image Dependency**: Generation requires a base image; must handle missing base image gracefully
- **State Management**: Must coordinate between multiple stores (influencer, profile pictures, credits)
- **User Experience**: Generation is async; must provide clear feedback during process
- **Backward Compatibility**: Must work for characters created before this feature

---

## Open Questions

- Should we allow users to regenerate profile pictures if they already exist? (Out of scope for this epic)
- Should we show a preview of what profile picture sets look like before selection?
- Should we allow users to select generation mode (fast vs consistent) from the detail page?
- Should we show estimated generation time before starting?

---

## Related Work

- **EP-001**: Character Creation Wizard (skip option promises this functionality)
- **EP-015**: Image Generation Speed-First Flow (generation modes and speed)
- **EP-018**: AI Influencer Settings (character config structure)
- **Skip Option Component**: `apps/web/components/wizard/profile-picture-set-selector/skip-option.tsx` (promises "generate profile pictures anytime from your character page")

---

## Phase Checklist

- [ ] P1: Requirements (this epic)
- [ ] P2: Stories created
- [ ] P3: Architecture & API design
- [ ] P4: UI screens & interactions
- [ ] P5: File plan & task breakdown
- [ ] P6: Implementation
- [ ] P7: Testing
- [ ] P8: Integration
- [ ] P9: Deployment
- [ ] P10: Validation
