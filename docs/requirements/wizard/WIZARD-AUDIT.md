# Character Wizard - Complete Audit & Expected Behavior

## Overview
The Character Wizard is a multi-step flow for creating AI influencers with two creation methods:
1. **Presets Flow**: 8 steps with form-based configuration
2. **Prompt-based Flow**: 4 steps with text input

## Architecture

### State Management
- **Store**: Zustand with localStorage persistence (`ryla-character-wizard`)
- **Persistence**: All form data, base images, profile pictures, and navigation state
- **Rehydration**: Steps array restored based on `creationMethod` on page reload

### Navigation
- **Dynamic Steps**: Steps array changes based on `creationMethod`
- **Step IDs**: Numeric IDs (1-8 for presets, 1-4 for prompt-based)
- **Progress**: Calculated from current step / total steps

## Expected Behavior by Step

### Step 0: Creation Method Selection
**File**: `step-creation-method.tsx`

**Expected Behavior:**
- User selects either "Presets" or "Prompt-based"
- Selection updates `form.creationMethod`
- `updateSteps()` called to set appropriate step array
- Navigation moves to step 1

**Edge Cases:**
- ✅ User reloads page → `creationMethod` restored from localStorage
- ✅ User goes back → Can change creation method (should reset form?)
- ⚠️ User changes method mid-flow → Should reset form or warn?

**Current Issues:**
- None identified

---

### Presets Flow: Step 1 - Style
**File**: `step-style.tsx`

**Expected Behavior:**
- User selects gender (female/male)
- User selects style (realistic/anime)
- Data saved to `form.gender` and `form.style`
- Can proceed when both selected

**Edge Cases:**
- ✅ User reloads → Form data restored
- ✅ User goes back → Previous selections visible
- ⚠️ User changes gender → Should reset dependent fields (breastSize)?

**Current Issues:**
- None identified

---

### Presets Flow: Step 2 - General
**File**: `step-general.tsx`

**Expected Behavior:**
- User selects ethnicity
- User sets age (slider/input)
- Data saved to `form.ethnicity` and `form.age`
- Can proceed when ethnicity selected

**Edge Cases:**
- ✅ User reloads → Form data restored
- ✅ User goes back → Previous selections visible

**Current Issues:**
- None identified

---

### Presets Flow: Step 3 - Face
**File**: `step-face.tsx`

**Expected Behavior:**
- User selects hair style
- User selects hair color
- User selects eye color
- Data saved to form
- Can proceed when all selected

**Edge Cases:**
- ✅ User reloads → Form data restored
- ✅ User goes back → Previous selections visible

**Current Issues:**
- None identified

---

### Presets Flow: Step 4 - Body
**File**: `step-body.tsx`

**Expected Behavior:**
- User selects body type
- If female, user selects breast size
- Data saved to form
- Can proceed when body type selected

**Edge Cases:**
- ✅ User reloads → Form data restored
- ✅ User goes back → Previous selections visible
- ⚠️ User changes gender from female to male → breastSize should be cleared?

**Current Issues:**
- None identified

---

### Presets Flow: Step 5 - Identity
**File**: `step-identity.tsx`

**Expected Behavior:**
- User enters name
- User selects outfit
- User selects archetype
- User selects personality traits
- User enters bio
- Data saved to form
- Can proceed when name and outfit selected

**Edge Cases:**
- ✅ User reloads → Form data restored
- ✅ User goes back → Previous selections visible

**Current Issues:**
- None identified

---

### Prompt-based Flow: Step 1 - Prompt Input
**File**: `step-prompt-input.tsx`

**Expected Behavior:**
- User enters character description in textarea
- Data saved to `form.promptInput`
- Voice memo placeholder (future feature)
- Can proceed when prompt entered

**Edge Cases:**
- ✅ User reloads → Prompt text restored
- ✅ User goes back → Prompt text visible
- ⚠️ User changes prompt → Should regenerate base images?

**Current Issues:**
- None identified

---

### Step: Base Image Selection
**File**: `step-base-image-selection.tsx`
**Applies to**: Both flows (Step 6 for presets, Step 2 for prompt-based)

**Expected Behavior:**
1. **On Mount/Enter:**
   - If no valid images exist → Auto-generate 3 base images
   - If images exist → Display them immediately
   - If only skeletons → Regenerate

2. **Generation:**
   - Show 3 skeleton loaders immediately
   - Generate 3 images in parallel
   - Update each skeleton as image completes (progressive)
   - Show progress: "Generating X/3 images..."

3. **After Generation:**
   - User can select one image
   - User can regenerate individual images
   - User can fine-tune selected image with prompt
   - User can regenerate all images

4. **Navigation:**
   - Going back → Images remain visible
   - Going forward → Selected image preserved
   - Reload → Images restored from localStorage

**Edge Cases:**
- ✅ **Page Reload**: Images should be restored from localStorage
- ✅ **Navigate Back**: Images should still be visible
- ✅ **Navigate Forward then Back**: Images should still be visible
- ⚠️ **Generation Interrupted**: If user navigates away during generation, skeletons remain
- ⚠️ **API Error**: Should show error and allow retry
- ⚠️ **Partial Generation**: If only 1-2 images complete, should show them
- ⚠️ **baseImages is undefined**: Should default to empty array (FIXED)

**Current Issues:**
- ✅ **FIXED**: `baseImages.some is not a function` - Added defensive check for array
- ⚠️ **TODO**: Handle generation interruption (cleanup skeletons)
- ⚠️ **TODO**: Handle partial generation (show completed images)

**State Dependencies:**
- `baseImages`: Array of GeneratedImage (should always be array)
- `selectedBaseImageId`: ID of selected image
- `baseImageFineTunePrompt`: Optional fine-tuning text

---

### Step: Profile Pictures
**File**: `step-profile-pictures.tsx`
**Applies to**: Both flows (Step 7 for presets, Step 3 for prompt-based)

**Expected Behavior:**
1. **On Mount/Enter:**
   - If base image selected AND no profile pictures exist → Auto-generate
   - If profile pictures exist → Display them immediately
   - If only skeletons → Regenerate

2. **Generation:**
   - Show skeleton loaders for all expected images (7-10 + 3 NSFW if enabled)
   - Generate all images in parallel
   - Update each skeleton as image completes (progressive)
   - Show progress: "Generating X/Y images..."

3. **After Generation:**
   - User can view images in grid
   - User can delete individual images
   - User can regenerate individual images
   - User can edit prompt for individual images
   - User can regenerate all images
   - NSFW images shown separately if enabled

4. **Navigation:**
   - Going back → Images remain visible
   - Going forward → Images preserved
   - Reload → Images restored from localStorage

**Edge Cases:**
- ✅ **Page Reload**: Images should be restored from localStorage
- ✅ **Navigate Back**: Images should still be visible
- ✅ **Navigate Forward then Back**: Images should still be visible
- ⚠️ **No Base Image Selected**: Should show error message
- ⚠️ **Generation Interrupted**: If user navigates away, skeletons remain
- ⚠️ **API Error**: Should show error and allow retry
- ⚠️ **Partial Generation**: Should show completed images
- ⚠️ **NSFW Toggle Changed**: Should regenerate if images already exist?

**Current Issues:**
- ⚠️ **TODO**: Handle case where base image is deselected
- ⚠️ **TODO**: Handle generation interruption
- ⚠️ **TODO**: Handle NSFW toggle change mid-flow

**State Dependencies:**
- `selectedBaseImageId`: Required for generation
- `profilePictureSet.images`: Array of ProfilePictureImage
- `profilePictureSet.generating`: Boolean flag
- `form.nsfwEnabled`: Controls NSFW image generation

---

### Step: Finalize
**File**: `step-finalize.tsx`
**Applies to**: Both flows (Step 8 for presets, Step 4 for prompt-based)

**Expected Behavior:**
1. **Display:**
   - Show selected base image
   - Show profile picture set preview
   - Show character name input
   - Show all form data summary

2. **Actions:**
   - User enters character name
   - User can review all selections
   - User clicks "Create Character"
   - Character created in database
   - User redirected to character page

**Edge Cases:**
- ✅ **Missing Base Image**: Should show error
- ✅ **Missing Profile Pictures**: Should show error
- ✅ **Missing Name**: Should disable create button
- ⚠️ **Create Fails**: Should show error and allow retry
- ⚠️ **User Navigates Away**: Should preserve state

**Current Issues:**
- ⚠️ **TODO**: Implement actual character creation API call
- ⚠️ **TODO**: Handle creation errors

---

## State Persistence & Rehydration

### localStorage Structure
```typescript
{
  step: number,
  status: 'idle' | 'pending' | 'generating' | 'completed' | 'error',
  form: CharacterFormData,
  characterId: string | null,
  baseImages: GeneratedImage[],
  selectedBaseImageId: string | null,
  baseImageFineTunePrompt: string,
  profilePictureSet: {
    jobId: string | null,
    images: ProfilePictureImage[],
    generating: boolean,
  }
}
```

### Rehydration Behavior
1. **On Page Load:**
   - Store rehydrates from localStorage
   - `onRehydrateStorage` callback executes
   - If `creationMethod` exists but `steps` is empty → Restore steps array
   - Components receive rehydrated state

2. **Expected After Reload:**
   - ✅ All form data visible
   - ✅ Base images visible (if generated)
   - ✅ Profile pictures visible (if generated)
   - ✅ Current step correct
   - ✅ Selected base image preserved
   - ✅ NSFW setting preserved

**Edge Cases:**
- ⚠️ **Corrupted localStorage**: Should reset to defaults
- ⚠️ **Old localStorage format**: Should migrate or reset
- ⚠️ **baseImages is not array**: Should default to [] (FIXED)

---

## Navigation Flow

### Presets Flow
```
Step 0 (Creation Method) 
  → Step 1 (Style)
  → Step 2 (General)
  → Step 3 (Face)
  → Step 4 (Body)
  → Step 5 (Identity)
  → Step 6 (Base Image) ← Can go back to Step 5
  → Step 7 (Profile Pictures) ← Requires base image selected
  → Step 8 (Finalize) ← Requires profile pictures generated
```

### Prompt-based Flow
```
Step 0 (Creation Method)
  → Step 1 (Prompt Input)
  → Step 2 (Base Image) ← Can go back to Step 1
  → Step 3 (Profile Pictures) ← Requires base image selected
  → Step 4 (Finalize) ← Requires profile pictures generated
```

### Navigation Rules
- **Next Button**: Only enabled if current step is valid
- **Back Button**: Always enabled (except step 0)
- **Progress Bar**: Shows current step / total steps
- **Step Validation**: `isStepValid(step)` checks required fields

**Edge Cases:**
- ⚠️ **User skips steps via URL**: Should validate and redirect
- ⚠️ **User goes back multiple steps**: Should preserve all data
- ⚠️ **User changes creation method**: Should reset form or warn?

---

## Image Generation Flow

### Base Image Generation
1. **Trigger**: Auto on mount if no valid images
2. **Input**: Form data (appearance + identity)
3. **Process**: 
   - Create 3 skeleton slots
   - Generate 3 images in parallel (different seeds)
   - Update skeletons progressively as images complete
4. **Output**: 3 GeneratedImage objects
5. **Storage**: Saved to `baseImages` in store + localStorage

**Edge Cases:**
- ✅ **Generation in progress**: Show skeletons + progress
- ✅ **Partial completion**: Show completed images, keep skeletons for pending
- ⚠️ **Generation fails**: Show error, allow retry
- ⚠️ **User navigates away**: Generation continues in background (should cleanup?)

### Profile Picture Generation
1. **Trigger**: Auto on mount if base image selected AND no profile pictures
2. **Input**: Selected base image URL + profile picture set ID
3. **Process**:
   - Create skeleton slots for all positions (7-10 + 3 NSFW if enabled)
   - Generate all images in parallel using PuLID workflow
   - Update skeletons progressively as images complete
4. **Output**: 7-10 ProfilePictureImage objects (+ 3 NSFW if enabled)
5. **Storage**: Saved to `profilePictureSet.images` in store + localStorage

**Edge Cases:**
- ✅ **Generation in progress**: Show skeletons + progress
- ✅ **Partial completion**: Show completed images, keep skeletons for pending
- ⚠️ **Generation fails**: Show error, allow retry
- ⚠️ **User navigates away**: Generation continues in background (should cleanup?)
- ⚠️ **Base image changed**: Should regenerate profile pictures?

---

## Identified Issues & Fixes Needed

### Critical Issues
1. ✅ **FIXED**: `baseImages.some is not a function`
   - **Cause**: `baseImages` could be undefined during rehydration
   - **Fix**: Added defensive check `Array.isArray(baseImages) ? baseImages : []`

2. ⚠️ **TODO**: Handle generation interruption
   - **Issue**: If user navigates away during generation, skeletons remain
   - **Fix Needed**: Cleanup skeletons or show "Generation in progress" state

3. ⚠️ **TODO**: Handle partial generation
   - **Issue**: If only some images complete, should show them
   - **Current**: Works for progressive updates, but needs error handling

### Medium Priority Issues
4. ⚠️ **TODO**: Validate step access via URL
   - **Issue**: User could navigate to step-7 without completing previous steps
   - **Fix Needed**: Add step validation in page components

5. ⚠️ **TODO**: Handle creation method change mid-flow
   - **Issue**: User could change method after starting
   - **Fix Needed**: Warn user or reset form

6. ⚠️ **TODO**: Handle base image deselection
   - **Issue**: What if user deselects base image after profile pictures generated?
   - **Fix Needed**: Regenerate profile pictures or show warning

### Low Priority Issues
7. ⚠️ **TODO**: Improve error messages
   - **Issue**: Generic error messages not helpful
   - **Fix Needed**: More specific error messages per failure type

8. ⚠️ **TODO**: Add loading states for API calls
   - **Issue**: Some operations don't show loading state
   - **Fix Needed**: Add loading indicators for all async operations

---

## Testing Checklist

### Happy Path
- [ ] Complete presets flow end-to-end
- [ ] Complete prompt-based flow end-to-end
- [ ] Select base image and generate profile pictures
- [ ] Create character successfully

### Navigation
- [ ] Navigate forward through all steps
- [ ] Navigate backward through all steps
- [ ] Reload page at each step → State preserved
- [ ] Navigate forward then back → State preserved

### Image Generation
- [ ] Base images generate and display progressively
- [ ] Profile pictures generate and display progressively
- [ ] Regenerate individual base image
- [ ] Regenerate individual profile picture
- [ ] Regenerate all base images
- [ ] Regenerate all profile pictures

### Edge Cases
- [ ] Reload during base image generation
- [ ] Reload during profile picture generation
- [ ] Navigate away during generation
- [ ] Change NSFW setting mid-flow
- [ ] Deselect base image after profile pictures generated
- [ ] API error during generation
- [ ] Network timeout during generation
- [ ] Corrupted localStorage data

### State Persistence
- [ ] Form data persists across reloads
- [ ] Base images persist across reloads
- [ ] Profile pictures persist across reloads
- [ ] Selected base image persists across reloads
- [ ] Steps array restored correctly after reload

---

## Recommended Changes

### Immediate Fixes
1. ✅ **DONE**: Fix `baseImages.some is not a function` error
2. ⚠️ **TODO**: Add step validation in page components
3. ⚠️ **TODO**: Add cleanup for interrupted generations

### Short-term Improvements
4. ⚠️ **TODO**: Add better error handling and messages
5. ⚠️ **TODO**: Add loading states for all async operations
6. ⚠️ **TODO**: Handle creation method change mid-flow

### Long-term Enhancements
7. ⚠️ **TODO**: Add migration for old localStorage formats
8. ⚠️ **TODO**: Add analytics for wizard completion rates
9. ⚠️ **TODO**: Add ability to save draft characters

---

## Notes

- All state is persisted to localStorage for recovery
- Progressive image loading improves perceived performance
- Skeleton loaders provide better UX than blank screens
- Both flows share base image and profile picture steps
- NSFW content is optional and clearly marked

