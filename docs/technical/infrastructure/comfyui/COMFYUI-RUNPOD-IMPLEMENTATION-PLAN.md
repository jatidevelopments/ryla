# ComfyUI + RunPod Implementation Plan

> **Created**: 2025-12-10  
> **Updated**: 2025-12-10 (Added Face Swap step)  
> **Status**: In Progress  
> **Goal**: Implement image generation pipeline using ComfyUI for visualization and RunPod for execution

> **See Also**:
> - `IMAGE-GENERATION-FLOW.md` - Complete flow with all steps
> - `MODEL-CAPABILITIES-MATRIX.md` - Model selection matrix

---

## Overview

This plan implements the hybrid approach: **ComfyUI for visualization/debugging** + **Python code for production execution** on RunPod.

### Architecture

```
Development/Visualization:
┌─────────────────┐
│ ComfyUI on      │ ← Visual workflow building
│ RunPod Pod      │ ← Debugging & understanding
└─────────────────┘
        │
        │ Export workflow.json
        │ Understand node connections
        ▼
┌─────────────────┐
│ Your Codebase   │ ← Implement same logic in Python
│ Python Scripts  │ ← Production execution
└─────────────────┘
        │
        │ Execute on RunPod
        ▼
┌─────────────────┐
│ RunPod          │ ← Serverless endpoints
│ Serverless      │ ← Automated execution
└─────────────────┘
```

---

## Phase 1: Infrastructure Setup (Week 1)

### 1.1 RunPod Setup
- [ ] Create RunPod account, get API key
- [ ] Deploy ComfyUI Pod (for visualization/debugging)
  - Template: "ComfyFlow ComfyUI"
  - GPU: RTX 3090 or 4090
  - Create Network Volume for model persistence
- [ ] Deploy RunPod Serverless Endpoint (for production)
  - Create Docker image with Python + dependencies
  - Configure handler for image generation
  - Test endpoint connectivity

### 1.2 Model Management
- [ ] Download required models to Network Volume:
  - Flux Dev (uncensored for NSFW)
  - PuLID model
  - ControlNet models
  - IPAdapter FaceID
- [ ] Use Model Manager or manual download
- [ ] Verify models accessible from both ComfyUI Pod and Serverless

### 1.3 Codebase Structure
```
libs/
  business/
    src/
      services/
        comfyui-workflow-builder.ts  # Build workflows programmatically
        runpod-service.ts            # RunPod API integration
        image-generation.service.ts  # Production image gen
        character-sheet.service.ts   # Character sheet generation
        lora-training.service.ts      # LoRA training orchestration
workflows/
  base-image-generation.json        # ComfyUI workflow (visual)
  character-sheet.json              # ComfyUI workflow (visual)
  face-swap.json                    # ComfyUI workflow (visual)
  lora-generation.json               # ComfyUI workflow (visual)
```

---

## Phase 2: Base Image Generation (Week 1-2)

### 2.1 ComfyUI Workflow (Visual Development)
- [ ] Build base image generation workflow in ComfyUI
  - Input: Wizard config (prompt)
  - Model: Flux Dev
  - Output: 3 variations
- [ ] Test with sample configs
- [ ] Export workflow JSON → `workflows/base-image-generation.json`

### 2.2 Codebase Implementation
- [ ] Create `ComfyUIWorkflowBuilder` class
- [ ] Implement base image workflow generator
- [ ] Create `BaseImageGenerationService`
  - Build workflow JSON programmatically
  - Execute on RunPod Serverless
  - Return 3 image options
- [ ] Test against ComfyUI results (match outputs)

### 2.3 API Integration (EP-001)
- [ ] Add endpoint: `POST /api/influencers/generate-base-images`
- [ ] Integrate with wizard Step 6
- [ ] Display 3 options, allow selection/regeneration
- [ ] Save selected base image to database

---

## Phase 3: Character Sheet Generation (Week 2-3)

### 3.1 ComfyUI Workflow (Visual Development)
- [ ] Build character sheet workflow in ComfyUI
  - Input: Base image
  - PuLID for face consistency
  - ControlNet for pose/angle control
  - Generate 7-10 variations (angles, poses, lighting)
- [ ] Test with sample base images
- [ ] Export workflow JSON → `workflows/character-sheet.json`

### 3.2 Codebase Implementation
- [ ] Create `CharacterSheetService`
  - Build workflow JSON programmatically
  - Execute on RunPod Serverless
  - Generate 7-10 images
- [ ] Implement background job queue
  - Trigger after character creation
  - Track progress in `character_sheet_jobs` table
- [ ] Save images to Supabase Storage
- [ ] Test against ComfyUI results

### 3.3 Integration
- [ ] Auto-trigger after base image selection
- [ ] Update `lora_status = 'generating_sheets'`
- [ ] Notify when complete (optional)

---

## Phase 4: LoRA Training (Week 3-4)

### 4.1 RunPod Template Setup
- [ ] **Option 1 (Recommended)**: Use **AI Toolkit** template (supports both Flux and Z-Image-Turbo)
  - Official RunPod template available
  - Built-in Z-Image-Turbo training adapter
  - UI available for easier training
  - See: https://github.com/ostris/ai-toolkit
- [ ] **Option 2 (Fallback)**: Use `flux-dev-lora-trainer` template (Flux only)
- [ ] Configure Network Volume for model storage
- [ ] Test training with sample images
- [ ] Verify webhook callbacks

### 4.2 Codebase Implementation
- [ ] Create `LoraTrainingService`
  - Upload character sheet images to RunPod
  - Start training job
  - Track progress
  - Handle webhooks
- [ ] Implement background job
  - Trigger after character sheets complete
  - Update `lora_status = 'training'`
- [ ] Save trained LoRA to Supabase Storage
- [ ] Store trigger word in database

### 4.3 Integration
- [ ] Auto-trigger after character sheets ready
- [ ] Update status: `training` → `ready`
- [ ] Optional notification when ready

---

## Phase 5: Image Generation (Week 4-5)

### 5.1 Face Swap Workflow (While LoRA Trains)
- [ ] Build Face Swap workflow in ComfyUI
  - Input: Base image + prompt
  - IPAdapter FaceID for consistency
  - Flux Dev model
- [ ] Export workflow JSON → `workflows/face-swap.json`
- [ ] Implement in codebase
  - `ImageGenerationService.generateWithFaceSwap()`
  - Execute on RunPod Serverless
  - ~80% consistency

### 5.2 LoRA Generation (When Ready)
- [ ] Build LoRA workflow in ComfyUI
  - Input: Prompt + LoRA model
  - Flux Dev + Custom LoRA
- [ ] Export workflow JSON → `workflows/lora-generation.json`
- [ ] Implement in codebase
  - `ImageGenerationService.generateWithLoRA()`
  - Execute on RunPod Serverless
  - >95% consistency

### 5.3 Smart Routing
- [ ] Check LoRA status before generation
- [ ] Route to Face Swap if LoRA not ready
- [ ] Route to LoRA if ready
- [ ] Seamless switch (no user action)

### 5.4 Content Studio Integration (EP-005)
- [ ] Integrate with scene/environment presets
- [ ] Build prompts from config
- [ ] Handle NSFW routing (uncensored models)
- [ ] Queue management & progress tracking

---

## Phase 6: Testing & Validation (Week 5-6)

### 6.1 Workflow Validation
- [ ] Compare ComfyUI visual results vs code results
- [ ] Ensure parameter matching
- [ ] Test all edge cases

### 6.2 Integration Testing
- [ ] End-to-end: Wizard → Base Image → Character Sheets → LoRA → Generation
- [ ] Test Face Swap fallback
- [ ] Test LoRA auto-switch
- [ ] Test NSFW routing

### 6.3 Performance Testing
- [ ] Base image generation: <30s
- [ ] Character sheets: <5 min
- [ ] LoRA training: ~45 min
- [ ] Image generation: <15s per image

---

## Phase 7: Production Deployment (Week 6)

### 7.1 Optimization
- [ ] Optimize RunPod serverless endpoints
- [ ] Implement caching where possible
- [ ] Monitor costs

### 7.2 Monitoring
- [ ] Add logging for all workflows
- [ ] Track generation times
- [ ] Monitor RunPod costs
- [ ] Error alerting

### 7.3 Documentation
- [ ] Document workflow JSON structure
- [ ] Document model requirements
- [ ] Document RunPod setup
- [ ] Create runbook for troubleshooting

---

## File Structure

```
apps/
  api/
    src/
      modules/
        image/
          services/
            base-image-generation.service.ts
            character-sheet.service.ts
            image-generation.service.ts
            lora-training.service.ts
        runpod/
          services/
            runpod.service.ts
            comfyui-workflow-builder.service.ts

libs/
  business/
    src/
      services/
        comfyui-workflow-builder.ts  # Reusable workflow builder
        runpod-client.ts              # RunPod API client

workflows/
  base-image-generation.json          # ComfyUI workflow (visual reference)
  character-sheet.json                # ComfyUI workflow (visual reference)
  face-swap.json                      # ComfyUI workflow (visual reference)
  lora-generation.json                 # ComfyUI workflow (visual reference)

docs/
  technical/
    COMFYUI-WORKFLOWS.md              # Workflow documentation
    RUNPOD-SETUP.md                   # RunPod configuration guide
    MODEL-MANAGEMENT.md               # Model download/management
```

---

## Dependencies & Prerequisites

**RunPod:**
- Account with API key
- ComfyUI Pod deployed
- Serverless Endpoint configured
- Network Volume for models

**Models Required:**
- Flux Dev (uncensored)
- PuLID model
- ControlNet models
- IPAdapter FaceID
- (LoRA models generated per character)

**Codebase:**
- Background job queue (Bull/BullMQ)
- Supabase Storage configured
- Database schemas updated (from EP-001, EP-005)

---

## Success Criteria

- [ ] Base images generate 3 options in <30s
- [ ] Character sheets generate 7-10 images in <5 min
- [ ] LoRA training completes in ~45 min
- [ ] Image generation works immediately (Face Swap)
- [ ] Auto-switch to LoRA when ready
- [ ] All workflows match ComfyUI visual results
- [ ] NSFW routing works correctly

---

## Current Status

**Phase 1: Infrastructure Setup** - In Progress

### Completed ✅
- [x] Plan document created
- [x] Codebase structure created:
  - `libs/business/src/services/comfyui-workflow-builder.ts` - Workflow builder class (complete)
  - `libs/business/src/services/runpod-client.ts` - RunPod API client
  - `workflows/` directory for ComfyUI workflow JSON files
  - `docs/technical/RUNPOD-SETUP.md` - Setup guide
- [x] Base Image Generation Service:
  - `apps/api/src/modules/image/services/base-image-generation.service.ts`
  - `apps/api/src/modules/runpod/` - RunPod module and service
  - API endpoints: `POST /characters/generate-base-images`, `GET /characters/base-images/:jobId`
  - Database schema updated: Added `baseImageId`, `baseImageUrl` to characters table
  - Job types updated: Added `base_image_generation` and `character_sheet_generation`

### In Progress 🔄
- [ ] Network Volume creation (requires $5 minimum balance in RunPod account)
- [ ] ComfyUI Pod deployment
- [ ] Model downloads

### Blockers ⚠️
- **Network Volume**: Requires minimum $5 balance in RunPod account
  - Action: Add funds to RunPod account, then create volume
  - Can proceed with codebase work in parallel
- **ComfyUI Pod**: Requires sufficient credits for GPU rental
  - Action: Add funds to RunPod account (minimum $10 recommended)
  - Pod: `ryla-comfyui-dream-companion` (pending deployment)

### Deployment Status
- **Team**: Dream Companion (ID: `cm03tl0ve0002l408rxwspxk7`) ✅ Verified Access
- **Network Volume**: `ryla-models-dream-companion` (pending - needs $5+ balance)
- **ComfyUI Pod**: `ryla-comfyui-dream-companion` (pending - needs credits)
- **Serverless Endpoint**: `ryla-image-generation` (pending - needs template first)

---

## Notes

- ComfyUI is used for visualization/debugging only
- Production execution is via Python scripts on RunPod Serverless
- Workflows are built programmatically in codebase
- ComfyUI Pod is for R&D/testing purposes

