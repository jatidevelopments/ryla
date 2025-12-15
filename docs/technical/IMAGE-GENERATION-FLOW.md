# Complete Image Generation Flow for Each Character

> **Date**: 2025-12-10  
> **Status**: Defining Requirements  
> **Purpose**: Map complete flow → Requirements → Model Selection

---

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ PHASE 1: Character Creation (Wizard)                            │
└─────────────────────────────────────────────────────────────────┘

Step 1: Base Image Generation
  Input: Wizard config (appearance + identity)
  Output: 3 base image options
  User Action: Select one
  Time: <30 seconds
  ↓
  
Step 2: Skin Enhancement (NEW)
  Input: Selected base image
  Output: Enhanced base image (skin improvements)
  Time: <10 seconds
  Purpose: Ensure quality carries through
  ↓

┌─────────────────────────────────────────────────────────────────┐
│ PHASE 2: Background Training (Automatic)                        │
└─────────────────────────────────────────────────────────────────┘

Step 3: Character Sheet Generation (Background)
  Input: Enhanced base image
  Output: 7-10 character sheet images
  NSFW: Some images NSFW if user enabled
  Time: <5 minutes
  Purpose: Training data for LoRA
  ↓

Step 4: LoRA Training (Background)
  Input: Character sheet images (7-10)
  Output: Trained LoRA model
  Time: 15-45 minutes
  Purpose: Character consistency model
  ↓

┌─────────────────────────────────────────────────────────────────┐
│ PHASE 3: Content Generation (User-Triggered)                     │
└─────────────────────────────────────────────────────────────────┘

Step 5: Face Swap Generation (IMMEDIATE - While LoRA Trains)
  Input: Base image + User prompt
  Output: Generated images (1-10)
  Availability: Immediate (<15s)
  Consistency: ~80% face match
  Purpose: User can generate while LoRA trains
  ↓
  
  [LoRA Training Completes in Background]
  ↓

Step 6: Final Generation with LoRA (After LoRA Ready)
  Input: User prompt + scene + environment + outfit
  Output: Generated images (1-10)
  Availability: After LoRA ready (15-45 min)
  Consistency: >95% face match
  Modes: 
    - New generation (text-to-image)
    - Upscaling (enhance existing)
    - Editing (modify existing)
  NSFW Routing: Different models for SFW vs NSFW
```

---

## Detailed Step Requirements

### Step 1: Base Image Generation

**When**: Wizard Step 6 (user clicks "Generate Base Image")  
**Input**: Wizard config (appearance + identity)  
**Output**: 3 base image options  
**User Action**: Select preferred image  
**Timing**: <30 seconds for 3 images

| Requirement | Priority | Description | Success Criteria |
|-------------|----------|-------------|------------------|
| **Unique Face** | CRITICAL | Must be unique, not generic | Each of 3 options looks different |
| **Realistic Quality** | CRITICAL | Photorealistic, not cartoon | Looks like real person |
| **High Resolution** | HIGH | 1024x1024 minimum | Clear, detailed |
| **Clean Background** | HIGH | White/clean for focus | Subject clearly visible |
| **Skin Detail** | HIGH | Realistic skin texture | Natural skin appearance |
| **NSFW Support** | MEDIUM | If user enabled NSFW | Uncensored checkpoint available |
| **Speed** | MEDIUM | <30 seconds for 3 images | Fast enough for UX |
| **Cost** | MEDIUM | Reasonable cost | Cost-effective |

---

### Step 2: Skin Enhancement

**When**: After base image selection  
**Input**: Selected base image  
**Output**: Enhanced base image  
**Timing**: <10 seconds  
**Purpose**: Ensure quality carries through to all subsequent generations

| Requirement | Priority | Description | Success Criteria |
|-------------|----------|-------------|------------------|
| **Imperfections** | HIGH | Add natural imperfections | Realistic skin (pimples, blemishes) |
| **Texture Detail** | HIGH | Enhance skin texture | More detailed skin |
| **Quality Preservation** | CRITICAL | Don't degrade image | Same or better quality |
| **Speed** | MEDIUM | <10 seconds | Fast processing |
| **API Available** | HIGH | Can integrate | API/Service available |

---

### Step 3: Character Sheet Generation (Background)

**When**: Automatic after character creation  
**Input**: Enhanced base image  
**Output**: 7-10 character sheet images  
**NSFW**: Some images NSFW if user enabled  
**Timing**: <5 minutes for 10 images (background)  
**Purpose**: Training data for LoRA

**Dataset Composition** (Best Practice):
- **70%**: Upper body and face
- **20%**: Portrait (close-up)
- **10%**: Full body
- **Variety**: Different angles, poses, expressions, lighting

| Requirement | Priority | Description | Success Criteria |
|-------------|----------|-------------|------------------|
| **Face Consistency** | CRITICAL | Maintain same face | All images look like same person |
| **Pose Variety** | CRITICAL | Different angles/poses | Front, side, 3/4, back, sitting, etc. |
| **Quality Match** | CRITICAL | Match base image quality | Same quality level |
| **NSFW Support** | HIGH | Some images NSFW if enabled | NSFW routing works |
| **Unique Variations** | HIGH | Each image unique | Different from each other |
| **Speed** | MEDIUM | <5 minutes for 10 images | Background processing |
| **Cost** | MEDIUM | Reasonable cost | Cost-effective |

---

### Step 4: LoRA Training (Background)

**When**: Automatic after character sheets complete  
**Input**: Character sheet images (7-10)  
**Output**: Trained LoRA model (.safetensors)  
**Timing**: 15-45 minutes (background)  
**Purpose**: Character consistency model

**Training Options**:
- **AI Toolkit**: Supports Flux and Z-Image-Turbo, has UI
- **fal.ai 1.2.2 Trainer**: Simple, fast, supports Qwen and 1.2.2
- **flux-dev-lora-trainer**: Flux only, proven

**Dataset Requirements**:
- **Minimum**: 7-10 images (we generate 7-10)
- **Optimal**: 30 images (70% upper body/face, 20% portrait, 10% full body)
- **Quality**: Best images only (select from generated variations)

| Requirement | Priority | Description | Success Criteria |
|-------------|----------|-------------|------------------|
| **Model Support** | CRITICAL | Works with base model | LoRA training compatible |
| **Training Speed** | HIGH | <45 minutes | Fast enough |
| **Quality Output** | CRITICAL | >95% consistency | High quality LoRA |
| **Cost** | MEDIUM | <$5 per character | Cost-effective |
| **API/Service** | HIGH | Can automate | Cloud training service |

---

### Step 5: Face Swap Generation (IMMEDIATE - While LoRA Trains)

**When**: User requests generation (immediately after character creation)  
**Input**: Base image + User prompt (scene + environment + outfit)  
**Output**: Generated images (1-10)  
**Availability**: Immediate (<15s per image)  
**Consistency**: ~80% face match  
**Purpose**: User can generate while LoRA trains in background

| Requirement | Priority | Description | Success Criteria |
|-------------|----------|-------------|------------------|
| **Face Consistency** | HIGH | ~80% face match | Recognizably same person |
| **Speed** | CRITICAL | <15 seconds per image | Immediate availability |
| **Pose Control** | HIGH | Natural poses | ControlNet support |
| **NSFW Routing** | CRITICAL | Different models SFW/NSFW | NSFW support |
| **Quality** | HIGH | Photorealistic | Good quality |
| **Cost** | MEDIUM | Reasonable per image | Cost-effective |
| **Availability** | CRITICAL | Works immediately | No waiting |

**Technology**: IPAdapter FaceID / PuLID

---

### Step 6: Final Generation with LoRA (After LoRA Ready)

**When**: User requests generation (after LoRA training completes)  
**Input**: User prompt + scene + environment + outfit  
**Output**: Generated images (1-10)  
**Availability**: After LoRA ready (15-45 min)  
**Consistency**: >95% face match  
**Auto-Switch**: System automatically uses LoRA when ready

#### 6a: New Generation (Text-to-Image)

| Requirement | Priority | Description | Success Criteria |
|-------------|----------|-------------|------------------|
| **Character Consistency** | CRITICAL | >95% with LoRA | Very consistent face |
| **Pose Control** | HIGH | Natural poses | ControlNet support |
| **NSFW Routing** | CRITICAL | Different models SFW/NSFW | NSFW support |
| **Speed** | HIGH | <15 seconds per image | Fast generation |
| **Quality** | CRITICAL | Photorealistic | High quality |
| **Cost** | MEDIUM | Reasonable per image | Cost-effective |

#### 6b: Upscaling

| Requirement | Priority | Description | Success Criteria |
|-------------|----------|-------------|------------------|
| **Detail Preservation** | CRITICAL | Maintain details | Quality preserved |
| **Face Preservation** | CRITICAL | Don't change face | Face unchanged |
| **Speed** | MEDIUM | <30 seconds | Fast upscaling |
| **API Available** | HIGH | Can integrate | API/Service available |

#### 6c: Editing

| Requirement | Priority | Description | Success Criteria |
|-------------|----------|-------------|------------------|
| **Precise Editing** | HIGH | Modify specific parts | Can edit parts |
| **Quality Preservation** | CRITICAL | Don't degrade | Quality maintained |
| **Face Preservation** | CRITICAL | Don't change face | Face unchanged |
| **API Available** | HIGH | Can integrate | API/Service available |

---

## Flow Summary

### Timeline

```
T+0s:    User selects base image
T+10s:   Skin enhancement complete
T+10s:   Character sheet generation starts (background)
T+5min:  Character sheets complete (background)
T+5min:  LoRA training starts (background)
T+5min:  User can generate with Face Swap (IMMEDIATE)
T+45min: LoRA training complete (background)
T+45min: System auto-switches to LoRA generation
```

### Key Points

1. **Face Swap is IMMEDIATE** - User doesn't wait for LoRA
2. **LoRA training happens in background** - User can generate while it trains
3. **Auto-switch to LoRA** - System automatically upgrades when ready
4. **NSFW routing at each step** - Different models for SFW vs NSFW

---

## Next: Model Capabilities Matrix

See `MODEL-CAPABILITIES-MATRIX.md` for model mapping to these requirements.

