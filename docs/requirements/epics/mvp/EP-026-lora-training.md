# [EPIC] EP-026: LoRA Training for Character Consistency

**Status**: In Progress
**Phase**: P6
**Created**: 2026-01-21
**Last Updated**: 2026-01-30

> **Initiative**: [IN-006: LoRA Character Consistency System](../../../initiatives/IN-006-lora-character-consistency.md)  
> **Implementation Plan**: [EP-026 Implementation Plan](./EP-026-lora-training/IMPLEMENTATION-PLAN.md)

## Recent Progress

### ✅ Credit Integration (2026-01-27)

Credit system integrated for LoRA training:

- **Cost Calculation**: Uses `calculateLoraTrainingCost('flux', imageCount)`
- **Pricing**: Base 25,000 credits + 1,000 per image
- **Deduction**: Credits deducted upfront when training starts
- **Endpoint**: `GET /characters/lora-training-cost?imageCount=N`

### ✅ Database Persistence (2026-01-27)

Full database tracking for LoRA training jobs:

- **Repository**: `LoraModelsRepository` with CRUD operations
- **Schema**: Uses existing `lora_models` table
- **Tracking**: Status, triggerWord, modelPath, trainingSteps, etc.
- **Endpoints**:
  - `GET /characters/my-loras` - List user's LoRAs
  - `GET /characters/:characterId/lora` - Get character's LoRA

### ✅ API Endpoints (2026-01-27)

Full API integration:

- `POST /characters/train-lora` - Start LoRA training
- `GET /characters/lora-status/:jobId` - Check training status
- `GET /characters/lora-training-cost` - Cost estimation

### ✅ Modal Training Infrastructure (2026-01-30)

Modal.com training app deployed and tested:

- **App**: `ryla-lora-training` (function-only, no web endpoint)
- **GPU**: A100-80GB
- **Training**: Flux LoRA via diffusers `train_dreambooth_lora_flux.py`
- **Storage**: LoRAs saved to `ryla-models` volume at `/root/models/loras/`
- **Cost**: ~$0.50-2.00 per training (3-10 minutes)
- **Test**: Successfully trained 10-step LoRA in 2.8 minutes

See [LORA-WORKFLOW-GUIDE.md](../../../technical/models/LORA-WORKFLOW-GUIDE.md) for usage.

## Overview

Automated LoRA (Low-Rank Adaptation) training system that enables character-specific model fine-tuning for >95% face consistency. Users can enable LoRA training during influencer creation or later via settings, with training running in the background and notifications when complete.

> **Integration**: Uses AI Toolkit (Ostris) on RunPod for training. See [AI Toolkit Integration Spec](../../../specs/integrations/AI-TOOLKIT-LORA-TRAINING.md)

---

## Business Impact

**Target Metric**: C - Core Value (Character Consistency)

**Hypothesis**: When users can train character-specific LoRAs, they will achieve higher consistency (>95% vs ~80%) and generate more content, increasing platform engagement and retention.

**Success Criteria**:

- LoRA training adoption: **>60%** of users with profile sets enable training
- Training completion rate: **>90%** (successful trainings)
- Character consistency improvement: **>95%** face match (vs ~80% without LoRA)
- User satisfaction: **>80%** of users report better consistency

---

## Features

### F1: LoRA Training Toggle in Wizard

- Toggle button/switch in influencer creation wizard
- **Location**: After profile set images are generated (Step 7 or final step)
- **Display**:
  - Shows credit cost prominently
  - Shows estimated training time (~1-1.5 hours)
  - Informational text about benefits
- **State**:
  - Enabled by default (if user has enough credits)
  - Can be toggled off
  - Disabled if insufficient credits
- **Validation**:
  - Requires minimum X images (to be determined)
  - Only available after profile set completion

### F2: Credit Cost Display & Deduction

- **Cost Display**:
  - Show credit cost in toggle UI
  - **Cost Structure**: Base cost + (image count × per-image cost)
  - Show breakdown: "Base: X credits + Y images × Z credits = Total"
  - Cost varies by model (Z-Image vs Flux vs One)
  - Link to credit purchase if insufficient
- **Deduction Timing**:
  - ✅ **Confirmed**: Deduct when training completes successfully (refund if fails)
  - **Reservation**: Credits are reserved (not deducted) when training starts
  - **Deduction**: Credits deducted when training completes successfully
  - **Refund**: Credits refunded if training fails
  - User sees "reserved" status in credit balance
- **Cost Calculation**:
  - Per-model base cost (e.g., Z-Image: 100 credits base)
  - Per-image cost (e.g., 50 credits per image)
  - Total = base + (selectedImageCount × perImageCost)
  - Added to `libs/shared/src/credits/pricing.ts` as source of truth

### F3: Background Training Execution

- **Trigger**:
  - Automatic after profile set completion (if enabled)
  - Or manual trigger from settings (if enabled later)
- **Process**:
  1. Validate minimum image requirements
  2. Select images (prefer liked images, fallback to all)
  3. Create dataset in AI Toolkit
  4. Start training job on RunPod
  5. Poll for status updates
  6. Download LoRA when complete
  7. Store in S3
  8. Update database
  9. Send notification
- **Status Tracking**:
  - `pending` → `training` → `ready` → `failed`
  - Progress updates (steps, estimated time remaining)
  - Error handling and retries

### F4: Notification System

- **When Training Starts**:
  - ✅ **Confirmed**: Yes, notify when training starts
  - Type: `lora.training.started`
  - Title: "LoRA Training Started"
  - Body: "Training your character model... This will take ~1 hour. We'll notify you when it's ready!"
  - Link: `/influencer/[id]/settings` (to view status)
- **When Training Completes**:
  - ✅ **Required**: Notification when training completes
  - Type: `lora.training.completed`
  - Title: "LoRA Training Complete"
  - Body: "Your character LoRA is ready! Generate images with >95% consistency."
  - Link: `/influencer/[id]/studio` (to start generating)
- **When Training Fails**:
  - ✅ **Required**: Notification on failure
  - Type: `lora.training.failed`
  - Title: "LoRA Training Failed"
  - Body: Error message + "Retry for free in settings"
  - Link: Settings page to retry (free)
- **New Liked Images Available**:
  - ✅ **Confirmed**: Notify if new liked images available for retraining
  - Type: `lora.retrain.available`
  - Title: "Improve Your Model"
  - Body: "You have X new liked images. Retrain your LoRA for better results!"
  - Link: Settings page to retrain

### F5: Influencer Settings Integration

- **Location**: `/influencer/[id]/settings` (EP-018)
- **Section**: "LoRA Training" or "Character Consistency"
- **Controls**:
  - Toggle: Enable/Disable LoRA training
  - Status: Current training status (if any)
  - Retrain button: Manually trigger retraining
    - Shows cost (if paid retrain)
    - Shows "Free" if previous training failed
    - Shows "New images available" if new liked images detected
  - Training history: Show past training attempts
  - Image selection: Allow user to select images for retraining
- **Enable Later**:
  - ✅ **Confirmed**: Yes, but requires minimum 5 images
  - Validates image count before enabling
  - Shows message if insufficient images
- **Retrain Logic**:
  - ✅ **Confirmed**:
    - Anytime (paid, costs credits)
    - Free if previous training failed
    - Detects new liked images and suggests retraining
    - Shows notification: "You have X new liked images. Retrain to improve model quality!"

### F6: Image Selection UI

- **Image Picker Component**:
  - Grid view of available images (profile set + liked images)
  - Checkbox selection (minimum 5 required)
  - Visual indicators: liked images, selected images
  - Image count display: "Selected: X/5 minimum"
  - Pre-selection logic:
    - If liked images exist: Pre-select all liked images
    - If no liked images: Pre-select all profile set images
    - User can deselect/reselect as needed
- **Location**:
  - Wizard: After profile set completes, before training starts
  - Settings: When enabling training or retraining
- **Validation**:
  - Minimum 5 images required
  - Disable "Start Training" if <5 selected
  - Show error message if insufficient
- **User Notification**:
  - Show which images are selected
  - Count display: "X images selected for training"
  - Info: "Selected images will be used to train your character model"

### F7: Training Status Display

- **In Wizard**:
  - Show training status after profile set completes
  - Progress indicator (if training in progress)
  - Link to continue wizard (training runs in background)
- **In Settings**:
  - Current LoRA status
  - Training progress (if in progress)
  - Last training date/time
  - Training cost (if applicable)

---

## Acceptance Criteria

### AC-1: Wizard Toggle

- [ ] Toggle visible after profile set images are generated
- [ ] Toggle shows credit cost clearly
- [ ] Toggle shows estimated training time
- [ ] Toggle can be enabled/disabled
- [ ] Toggle disabled if insufficient credits
- [ ] Informational text explains benefits
- [ ] Toggle state persists if user navigates away

### AC-2: Credit Cost & Deduction

- [ ] Credit cost displayed accurately (base + per-image)
- [ ] Cost calculation based on model selection and image count
- [ ] Cost breakdown shown: "Base: X + Images: Y × Z = Total"
- [ ] Credits **reserved** when training starts (not deducted)
- [ ] Credits **deducted** when training completes successfully
- [ ] Credits **refunded** if training fails
- [ ] Reserved credits shown in balance (e.g., "Balance: 1000 (200 reserved)")
- [ ] Insufficient credits handled gracefully
- [ ] Link to credit purchase if needed
- [ ] Cost logged in credit transactions

### AC-3: Background Training

- [ ] Training starts automatically after profile set (if enabled)
- [ ] Training can be triggered manually from settings
- [ ] Minimum image requirement validated
- [ ] Image selection logic works (liked → all)
- [ ] Dataset created in AI Toolkit
- [ ] Training job started on RunPod
- [ ] Status polling works correctly
- [ ] LoRA downloaded and stored in S3
- [ ] Database updated with LoRA path
- [ ] Training completes successfully

### AC-4: Notifications

- [ ] Notification sent when training **starts**:
  - [ ] Type: `lora.training.started`
  - [ ] Shows estimated time (~1 hour)
  - [ ] Link to settings to view status
- [ ] Notification sent when training **completes**:
  - [ ] Type: `lora.training.completed`
  - [ ] Link to studio to start generating
- [ ] Notification sent when training **fails**:
  - [ ] Type: `lora.training.failed`
  - [ ] Shows error message
  - [ ] Link to settings to retry (free)
- [ ] Notification for new liked images:
  - [ ] Type: `lora.retrain.available`
  - [ ] Shows count of new liked images
  - [ ] Suggests retraining for better quality
  - [ ] Link to settings to retrain
- [ ] All notifications show in notification center
- [ ] Notifications can be dismissed

### AC-5: Settings Integration

- [ ] LoRA training section visible in settings
- [ ] Toggle to enable/disable training
- [ ] Current status displayed (pending/training/ready/failed)
- [ ] Retrain button available:
  - [ ] Shows cost if paid retrain
  - [ ] Shows "Free" if previous training failed
  - [ ] Shows "New images available" if new liked images detected
- [ ] Image selection UI in settings (for retraining)
- [ ] Training history shown (if any)
- [ ] New liked images detection:
  - [ ] Compares liked images count to last training
  - [ ] Shows banner/notification if new images available
  - [ ] Suggests retraining for better quality
- [ ] Settings save correctly
- [ ] Changes reflected immediately

### AC-6: Image Selection UI

- [ ] Image picker/grid component displays available images
- [ ] User can select/deselect images (checkbox interface)
- [ ] Minimum 5 images required for training
- [ ] Pre-selection logic works:
  - [ ] Liked images pre-selected if available
  - [ ] All profile set images pre-selected if no liked images
- [ ] Image count display: "Selected: X/5 minimum"
- [ ] Visual indicators for:
  - [ ] Liked images (heart icon)
  - [ ] Selected images (checkmark/checkbox)
- [ ] "Start Training" button disabled if <5 images selected
- [ ] Error message shown if user tries to start with <5 images

### AC-7: Error Handling

- [ ] Insufficient images handled gracefully
- [ ] Training failures handled with retry option
- [ ] Credit deduction errors handled
- [ ] API errors from AI Toolkit handled
- [ ] RunPod errors handled
- [ ] User-friendly error messages

---

## User Stories

### ST-001: Enable LoRA Training in Wizard

**As a** user creating an AI Influencer  
**I want to** enable LoRA training during creation  
**So that** I can get better character consistency automatically

**Acceptance Criteria**: AC-1, AC-2

---

### ST-002: Automatic Background Training

**As a** user  
**I want** LoRA training to run automatically in the background  
**So that** I don't have to wait and can continue using the platform

**Acceptance Criteria**: AC-3

---

### ST-003: Training Completion Notification

**As a** user  
**I want to** receive a notification when LoRA training completes  
**So that** I know when I can start generating high-consistency images

**Acceptance Criteria**: AC-4

---

### ST-004: Manage LoRA Training in Settings

**As a** user  
**I want to** enable/disable and retrain LoRA from settings  
**So that** I have control over character consistency training

**Acceptance Criteria**: AC-5

---

### ST-005: Select Images for Training

**As a** user  
**I want to** select which images to use for LoRA training  
**So that** I can choose the best images for my character model

**Acceptance Criteria**: AC-6

---

### ST-006: Retrain with New Images

**As a** user  
**I want to** retrain my LoRA when I have new liked images  
**So that** my model improves with better training data

**Acceptance Criteria**: AC-5 (retrain section)

---

### ST-007: Free Retry on Failure

**As a** user  
**I want to** retry LoRA training for free if it failed  
**So that** I don't lose credits due to technical issues

**Acceptance Criteria**: AC-5 (free retry), AC-2 (refund)

---

## Technical Notes

### Data Model

**LoRA Models Table** (already exists in `libs/data/src/schema/lora-models.schema.ts`):

```typescript
interface LoraModel {
  id: string;
  characterId: string;
  userId: string;
  type: 'face';
  status: 'pending' | 'training' | 'ready' | 'failed';
  config: LoraTrainingConfig;
  modelPath: string; // S3 path
  modelUrl: string; // Public URL
  triggerWord: string;
  baseModel: 'flux' | 'z-image-turbo' | 'one-2.1' | 'one-2.2';
  externalJobId: string; // AI Toolkit job ID
  externalProvider: 'ai-toolkit';
  trainingSteps: number;
  trainingDurationMs: number;
  trainingCost: number; // Cost in cents
  errorMessage?: string;
  retryCount: number;
  trainingStartedAt: Date;
  trainingCompletedAt?: Date;
  expiresAt?: Date;
}
```

**Character Table** (add LoRA training preference):

```typescript
interface Character {
  // ... existing fields
  config: {
    // ... existing config
    loraTrainingEnabled: boolean; // User preference
    loraTrainingAutoStart: boolean; // Auto-start after profile set
  };
}
```

### Credit Cost Calculation

**Cost Structure** (Per Model + Per Image):

- **Base Cost** (per model - covers GPU training time):
  - Z-Image Turbo: 15,000 credits base (~$15, actual cost ~$3-4)
  - Flux Dev: 25,000 credits base (~$25, actual cost ~$5-6)
  - One 2.1/2.2: 25,000 credits base (~$25, actual cost ~$5-6)
- **Per-Image Cost** (data processing):
  - Z-Image Turbo: 1,000 credits per image (~$1, actual cost ~$0.10-0.15)
  - Flux Dev: 1,000 credits per image (~$1, actual cost ~$0.10-0.15)
  - One 2.1/2.2: 1,000 credits per image (~$1, actual cost ~$0.10-0.15)

**Total Cost Formula**:

```
Total = Base Cost + (Image Count × Per-Image Cost)
```

**Examples**:

- Z-Image, 5 images: 15,000 + (5 × 1,000) = 20,000 credits (~$20)
- Z-Image, 10 images: 15,000 + (10 × 1,000) = 25,000 credits (~$25)
- Flux, 7 images: 25,000 + (7 × 1,000) = 32,000 credits (~$32)

**Credit Value**: ~$0.001 per credit (based on credit packages: $0.00091-$0.0015)
**Margin**: 4-5x on base cost, 7-10x on per-image cost

**Add to `libs/shared/src/credits/pricing.ts`**:

```typescript
export type FeatureId =
  // ... existing
  | 'lora_training_z_image_base' // Base cost
  | 'lora_training_z_image_per_image' // Per image cost
  | 'lora_training_flux_base'
  | 'lora_training_flux_per_image'
  | 'lora_training_one_base'
  | 'lora_training_one_per_image';

// Helper function to calculate LoRA training cost
export function calculateLoraTrainingCost(
  model: 'z-image-turbo' | 'flux' | 'one-2.1' | 'one-2.2',
  imageCount: number
): number {
  const baseCost = model === 'z-image-turbo' ? 100 : 150;
  const perImageCost = model === 'z-image-turbo' ? 50 : 75;
  return baseCost + imageCount * perImageCost;
}
```

### API Endpoints

**Start LoRA Training**:

- `POST /api/influencer/[id]/lora/train`
- Payload:
  ```typescript
  {
    baseModel?: 'z-image-turbo' | 'flux' | 'one-2.1' | 'one-2.2'; // Default: 'z-image-turbo'
    imageIds: string[]; // User-selected image IDs (minimum 5)
    isRetrain?: boolean; // If true, may be free if previous failed
  }
  ```
- Response:
  ```typescript
  {
    loraModelId: string;
    trainingJobId: string;
    status: 'pending' | 'training';
    estimatedTime: number; // minutes
    creditsReserved: number; // Credits reserved (not deducted yet)
    creditsCost: number; // Total cost (will be deducted on completion)
  }
  ```

**Get LoRA Status**:

- `GET /api/influencer/[id]/lora/status`
- Returns current LoRA model status

**Update LoRA Settings**:

- `PATCH /api/influencer/[id]/settings`
- Payload:
  ```typescript
  {
    loraTrainingEnabled?: boolean;
    loraTrainingAutoStart?: boolean;
  }
  ```

**Get Available Images for Training**:

- `GET /api/influencer/[id]/lora/available-images`
- Returns:
  ```typescript
  {
    profileSetImages: Array<{
      id: string;
      url: string;
      thumbnailUrl: string;
      liked: boolean;
    }>;
    likedImages: Array<{ id: string; url: string; thumbnailUrl: string }>;
    totalCount: number;
    canTrain: boolean; // true if >= 5 images
  }
  ```

**Check for New Liked Images**:

- `GET /api/influencer/[id]/lora/new-images-available`
- Returns:
  ```typescript
  {
    hasNewLikedImages: boolean;
    newLikedImageCount: number; // Count of liked images added since last training
    lastTrainingDate?: string; // ISO date of last training
    suggestion: string; // "You have X new liked images. Retrain for better quality!"
  }
  ```

### Background Job Flow

```typescript
// In character-sheet.service.ts or profile-picture-set.service.ts
async onProfileSetComplete(characterId: string) {
  const character = await getCharacter(characterId);

  // Check if LoRA training is enabled
  if (character.config.loraTrainingEnabled && character.config.loraTrainingAutoStart) {
    // Get available images
    const images = await getProfileSetImages(characterId);
    const likedImages = images.filter(img => img.liked);

    // Pre-select images (liked first, then all)
    const preselectedImages = likedImages.length >= MIN_IMAGES
      ? likedImages
      : images;

    if (preselectedImages.length >= MIN_IMAGES) {
      // Reserve credits (not deduct yet)
      const cost = calculateLoraTrainingCost('z-image-turbo', preselectedImages.length);
      await creditService.reserveCredits(character.userId, cost, 'lora_training');

      // Start training in background
      const result = await loraTrainingService.startTraining({
        characterId,
        userId: character.userId,
        imageIds: preselectedImages.map(img => img.id), // User-selected IDs
        baseModel: 'z-image-turbo', // Default, can be changed in settings
        triggerWord: character.name,
      });

      // Send start notification
      await notificationsService.create({
        userId: character.userId,
        type: 'lora.training.started',
        title: 'LoRA Training Started',
        body: 'Training your character model... This will take ~1 hour.',
        href: `/influencer/${characterId}/settings`,
      });
    }
  }
}

// When training completes
async onLoraTrainingComplete(loraModelId: string) {
  const loraModel = await getLoraModel(loraModelId);

  // Deduct credits (was reserved, now deduct)
  await creditService.deductReservedCredits(
    loraModel.userId,
    loraModel.trainingCost,
    loraModelId
  );

  // Send completion notification
  await notificationsService.create({
    userId: loraModel.userId,
    type: 'lora.training.completed',
    title: 'LoRA Training Complete',
    body: 'Your character LoRA is ready! Generate images with >95% consistency.',
    href: `/influencer/${loraModel.characterId}/studio`,
  });
}

// When training fails
async onLoraTrainingFailed(loraModelId: string) {
  const loraModel = await getLoraModel(loraModelId);

  // Refund reserved credits
  await creditService.refundReservedCredits(
    loraModel.userId,
    loraModel.trainingCost,
    loraModelId
  );

  // Send failure notification (with free retry)
  await notificationsService.create({
    userId: loraModel.userId,
    type: 'lora.training.failed',
    title: 'LoRA Training Failed',
    body: 'Training failed. Retry for free in settings.',
    href: `/influencer/${loraModel.characterId}/settings`,
  });
}
```

### Notification Types

**Add to notification types**:

```typescript
type NotificationType =
  // ... existing
  | 'lora.training.started'
  | 'lora.training.completed'
  | 'lora.training.failed'
  | 'lora.training.progress';
```

---

## Product Decisions (Confirmed)

### ✅ Q1: Credit Deduction Timing

**Decision**: **Option C** - Deduct when training completes successfully (refund if fails)

**Implementation**:

- Credits are **reserved** when training starts (not deducted)
- Credits are **deducted** when training completes successfully
- Credits are **refunded** if training fails
- User sees "reserved" status in credit balance

---

### ✅ Q2: Enable Later in Settings

**Decision**: **Option C** - Yes, but requires minimum X images

**Implementation**:

- Users can enable LoRA training later in settings
- Requires minimum 5 images (profile set or liked images)
- Shows validation message if insufficient images
- Allows user to generate more images first

---

### ✅ Q3: Minimum Image Requirement

**Decision**: **Option A** - 5 images minimum

**Implementation**:

- Minimum 5 images required for training
- Validates before allowing training to start
- Shows clear error if insufficient images

---

### ✅ Q4: Retrain Availability

**Decision**: **Anytime but with extra credits, on fail for free, also inform if new liked images are there that it can retrain the model for better image output**

**Implementation**:

- **Retrain Anytime**: User can retrain anytime (paid, costs credits)
- **Retrain on Fail**: Free retry if previous training failed
- **New Liked Images**:
  - Detect if new liked images added since last training
  - Show notification/banner: "You have X new liked images. Retrain to improve model quality!"
  - Link to settings to retrain
- **Retrain Button**: Available in settings, shows cost

---

### ✅ Q5: Training Start Notification

**Decision**: **Both A + B** - Notify when training starts AND when it completes

**Implementation**:

- **Start Notification**: `lora.training.started`
  - Title: "LoRA Training Started"
  - Body: "Training your character model... This will take ~1 hour. We'll notify you when it's ready!"
- **Completion Notification**: `lora.training.completed`
  - Title: "LoRA Training Complete"
  - Body: "Your character model is ready! Generate images with >95% consistency."

---

### ✅ Q6: Model Selection

**Decision**: **Option A** - Z-Image Turbo default, but need to think about multiple models in studio and add info about which models support LoRA, expand in future

**Implementation**:

- **Default**: Z-Image Turbo
- **Model Support Info**:
  - Add `supportsLoRA: boolean` to model registry
  - Show LoRA indicator in studio model picker
  - Display "LoRA Available" badge for supported models
  - Tooltip: "This model supports character LoRA for >95% consistency"
- **Future Expansion**:
  - Support Flux, One 2.1/2.2 LoRA training
  - User can select model in settings
  - Cost varies by model

---

### ✅ Q7: Liked Images Minimum

**Decision**: **Option C** - Minimum 5 images and allow user to select which images to use for training

**Implementation**:

- **Minimum**: 5 images required
- **Image Selection UI**:
  - Show image picker/grid in wizard/settings
  - User can select which images to use (minimum 5)
  - Pre-select liked images (if available)
  - Pre-select all profile set images (if no liked images)
  - Show image count: "Selected: X/5 minimum"
  - Visual feedback for selected images

---

### ✅ Q8: Training Cost Display

**Decision**: **Cost per training image and per model** - need to add this to our credits server/model cost source of truth

**Implementation**:

- **Cost Structure**:
  - Base cost per model (e.g., Z-Image: 100 credits base)
  - Cost per image (e.g., 50 credits per image)
  - Total = base + (imageCount × perImageCost)
- **Add to Credit System**:
  - Add LoRA training features to `libs/shared/src/credits/pricing.ts`
  - Per-model base costs
  - Per-image costs
  - Dynamic calculation based on image count

---

## Dependencies

- **EP-001**: Influencer Wizard (profile set generation)
- **EP-018**: Influencer Settings (settings page)
- **EP-017**: In-App Notifications (notification system)
- **EP-009**: Credits System (credit deduction)
- **AI Toolkit Integration**: RunPod deployment, API client

---

## Out of Scope (MVP)

- Multiple LoRA versions per character
- LoRA version selection in generation
- LoRA sharing between characters
- Advanced training parameters (user-configurable)
- Training progress real-time updates (polling only)
- LoRA quality metrics/analytics

---

## Future Enhancements (Phase 2+)

- Real-time training progress (WebSocket)
- Training quality metrics
- A/B testing different LoRA versions
- LoRA marketplace (share/sell LoRAs)
- Advanced training parameters UI
- Training history analytics
- Auto-retrain on new images (if quality drops)

---

## Testing Requirements

### Unit Tests

- Credit cost calculation
- Image selection logic (liked → all)
- Minimum image validation
- Training config generation

### Integration Tests

- LoRA training service
- AI Toolkit API client
- RunPod integration
- Notification creation
- Credit deduction

### E2E Tests (Playwright)

- Enable LoRA in wizard
- Training starts automatically
- Notification received on completion
- Enable/disable in settings
- Retrain from settings
- Error handling (insufficient images, credits)

---

## Related Epics

- **EP-001**: Influencer Wizard (profile set generation)
- **EP-018**: Influencer Settings (settings page)
- **EP-017**: In-App Notifications (notification system)
- **EP-009**: Credits System (credit management)
- **EP-038**: LoRA Usage in Image Generation (uses trained LoRAs)
- **EP-005**: Content Studio (generation workflows)

---

## Success Metrics

| Metric                   | Target   | Measurement                                      |
| ------------------------ | -------- | ------------------------------------------------ |
| LoRA training adoption   | >60%     | % of users with profile sets who enable training |
| Training completion rate | >90%     | % of trainings that complete successfully        |
| Character consistency    | >95%     | Face match accuracy with LoRA vs without         |
| User satisfaction        | >80%     | % of users reporting better consistency          |
| Training time            | <2 hours | Average training completion time                 |
| Credit cost accuracy     | ±10%     | Actual cost vs estimated cost                    |

---

## Notes

- LoRA training is optional - users can still generate without it
- Training runs in background - doesn't block user workflow
- Failed trainings should be retryable
- Credits should be refunded if training fails (if deducted upfront)
- LoRA models expire after X days (TBD - for storage cleanup)
- Training uses liked images by default for better quality
