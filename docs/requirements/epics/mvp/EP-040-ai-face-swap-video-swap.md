# [EPIC] EP-040: AI Face Swap & Complete Video Swap

**Status**: In Progress
**Phase**: P3
**Created**: 2026-01-21
**Last Updated**: 2026-01-21


> **Initiative**: [IN-016: AI Face Swap & Video Swap with Parasite SEO Strategy](../../../initiatives/IN-016-ai-face-swap-parasite-seo.md)

## Overview

Enable users to upload viral videos and transform them with their AI characters through complete video swap (face + background + transformations). This feature targets high-volume SEO keywords (93K+ monthly searches) and enables viral content creation.

> ⚠️ **Scope**: This epic covers **face swap for images** and **complete video swap** (face + background + transformations). This is a post-MVP feature that launches after Video Gen (EP-005) and all basic features are complete.
>
> **Dependencies**: Requires EP-005 (Video Generation) to be launched first.

---

## Terminology

| Term | Definition |
|------|------------|
| **Face Swap** | Replacing a face in an image or video with another face (AI character) |
| **Video Swap** | Complete video transformation including face swap, background replacement, and other effects |
| **Source Face** | The AI character's face to be swapped into the target |
| **Target Media** | The image or video that receives the face swap |
| **Face Detection** | Automatic identification of faces in target media |
| **Face Tracking** | Following a face across video frames for consistent swap |
| **Background Replacement** | Changing the background in videos while maintaining foreground |
| **Frame Interpolation** | Smoothing transitions between frames in video processing |

---

## Business Impact

**Target Metric**: A-Activation, C-Core Value, E-CAC

**Hypothesis**: When users can transform viral videos with their AI characters (complete video swap), they will create more shareable content, drive organic traffic through SEO, and find increased value in the product.

**Success Criteria**:
- Face swap success rate: **>90%** (faces detected and swapped correctly)
- Video swap processing time: **<5 minutes** for 1-minute video
- Quality score: **>85%** (realistic, no artifacts)
- Feature adoption: **30%+** of active users try feature within 30 days
- Organic traffic: **10K+ monthly visitors** from face swap keywords
- Page 1 rankings: Achieve top 10 for "ai face swap" and related keywords

---

## Features

### F1: Image Face Swap

**Purpose**: Swap faces in static images using AI character faces.

**Input**:
- Source face image (AI character)
- Target image (image to receive face swap)
- Optional: Face selection (if multiple faces detected)

**Process**:
1. Face detection in target image
2. Face extraction from source image
3. Face alignment and matching
4. Face swap using IPAdapter FaceID or ReActor
5. Color matching and blending
6. Quality validation

**Output**:
- Swapped image with AI character's face
- Quality score
- Preview before final processing

**Quality Requirements**:
- Face match: >80% similarity
- No visible artifacts
- Natural skin tone blending
- Maintains original image quality

### F2: Video Face Swap

**Purpose**: Swap faces in videos frame-by-frame with face tracking.

**Input**:
- Source face image (AI character)
- Target video (video to receive face swap)
- Optional: Face selection (if multiple faces detected)
- Optional: Time range (specific segment to process)

**Process**:
1. Video frame extraction
2. Face detection in first frame
3. Face tracking across all frames
4. Face swap for each frame
5. Frame interpolation for smooth transitions
6. Video reconstruction
7. Quality validation

**Output**:
- Swapped video with AI character's face
- Quality score per frame
- Preview before final processing

**Quality Requirements**:
- Face consistency across frames: >85%
- Smooth transitions (no flickering)
- Maintains original video quality and framerate
- Audio preserved (no audio processing)

### F3: Complete Video Swap

**Purpose**: Transform videos with face swap + background replacement + effects.

**Input**:
- Source face image (AI character)
- Target video (viral video to transform)
- Background replacement option (optional)
- Effects/transformations (optional)

**Process**:
1. Face detection and tracking
2. Face swap (F2)
3. Background detection and removal (if enabled)
4. Background replacement (if enabled)
5. Additional transformations (if enabled)
6. Frame interpolation and smoothing
7. Video reconstruction
8. Quality validation

**Output**:
- Transformed video with:
  - Swapped face (AI character)
  - New background (if enabled)
  - Applied effects (if enabled)
- Quality score
- Preview before final processing

**Quality Requirements**:
- Face swap quality: >85%
- Background blending: >80% (seamless)
- No artifacts or glitches
- Maintains original video quality

### F4: Face Detection & Selection

**Purpose**: Automatically detect faces and allow user selection.

**Features**:
- Automatic face detection in images/videos
- Multiple face detection support
- Face selection UI (if multiple faces)
- Face confidence scoring
- Face bounding box preview

**UI**:
- Highlight detected faces in preview
- Click to select which face to swap
- Show confidence score for each face
- Auto-select highest confidence face (default)

### F5: Quality Controls & Preview

**Purpose**: Ensure quality before final processing.

**Features**:
- Preview generation (low-res, fast)
- Quality scoring (face match, artifacts, blending)
- User approval before final processing
- Quality warnings (if score < threshold)
- Option to regenerate if quality low

**Quality Thresholds**:
- Face match: >80% (warning if <80%)
- Artifacts: <5% (warning if >5%)
- Blending: >75% (warning if <75%)

### F6: ComfyUI Workflow Integration

**Purpose**: Execute face swap and video swap using ComfyUI workflows on RunPod.

**Workflow Types**:

1. **Image Face Swap Workflow** (`face-swap-image.json`):
   - Uses IPAdapter FaceID or ReActor
   - Model: Flux Schnell or Flux Dev
   - Face detection: InsightFace or similar
   - Face alignment and matching
   - Color matching and blending
   - Upscaling (optional)

2. **Video Face Swap Workflow** (`face-swap-video.json`):
   - Frame extraction
   - Face detection and tracking
   - Per-frame face swap
   - Frame interpolation (RIFE or similar)
   - Video reconstruction
   - Quality validation

3. **Complete Video Swap Workflow** (`video-swap-complete.json`):
   - Face swap (from workflow 2)
   - Background removal (SAM or BiseNet)
   - Background replacement (if enabled)
   - Additional transformations
   - Frame interpolation
   - Video reconstruction

**Implementation**:
- Workflow JSON files in `workflows/` directory
- TypeScript workflow factories in `libs/business/src/workflows/`
- RunPod serverless endpoint execution
- Progress tracking and status updates

### F7: Background Replacement (Video)

**Purpose**: Replace backgrounds in videos while maintaining foreground.

**Process**:
1. Background detection (SAM or BiseNet)
2. Background removal (masking)
3. New background application
4. Edge refinement and blending
5. Frame consistency across video

**Options**:
- Solid color background
- Image background
- AI-generated background
- Blur original background

**Quality Requirements**:
- Seamless edge blending: >80%
- Consistent across frames: >85%
- No artifacts at edges

### F8: Processing Queue & Status

**Purpose**: Manage face swap and video swap jobs.

**Features**:
- Job queue for processing requests
- Real-time status updates
- Progress tracking (0-100%)
- Estimated time remaining
- Email notification on completion
- Retry failed jobs (3 attempts)
- Rate limiting per user

**Status States**:
- Queued
- Processing (with progress %)
- Completed
- Failed (with error message)
- Cancelled

### F9: Storage & Asset Management

**Purpose**: Store processed videos and images.

**Features**:
- Upload source media to Supabase Storage
- Store processed results
- Generate thumbnails for videos
- Organize by user/influencer
- Return accessible URLs
- Track storage usage

**Storage Structure**:
```
storage/
├── face-swap/
│   ├── images/
│   │   └── {userId}/{influencerId}/{jobId}.jpg
│   └── videos/
│       └── {userId}/{influencerId}/{jobId}.mp4
└── previews/
    └── {jobId}_preview.jpg
```

### F10: Credit System Integration

**Purpose**: Charge credits for face swap and video swap operations.

**Credit Costs**:
- Image face swap: **5 credits**
- Video face swap (per minute): **20 credits/minute**
- Complete video swap (per minute): **30 credits/minute**
- Preview generation: **Free** (no charge)

**Credit Validation**:
- Check user credits before processing
- Show credit cost before starting
- Refund credits if job fails (after retries)
- Track credit usage per operation

---

## Technical Architecture

### ComfyUI Workflow Structure

#### Image Face Swap Workflow

**Nodes Required**:
- `LoadImage` - Load source face and target image
- `FaceDetector` - Detect faces (InsightFace or similar)
- `IPAdapterFaceID` or `ReActor` - Face swap model
- `CheckpointLoaderSimple` - Load base model (Flux Schnell/Dev)
- `KSampler` - Image generation
- `VAEDecode` - Decode latent to image
- `ColorMatch` - Match skin tones
- `Blend` - Blend swapped face
- `Upscale` - Optional upscaling
- `SaveImage` - Save result

**Workflow JSON**: `workflows/face-swap-image.json`

#### Video Face Swap Workflow

**Nodes Required**:
- `LoadVideo` - Load target video
- `ExtractFrames` - Extract frames from video
- `FaceDetector` - Detect faces in frames
- `FaceTracker` - Track face across frames
- `IPAdapterFaceID` or `ReActor` - Face swap per frame
- `FrameInterpolation` - Smooth transitions (RIFE)
- `ReconstructVideo` - Combine frames into video
- `SaveVideo` - Save result

**Workflow JSON**: `workflows/face-swap-video.json`

#### Complete Video Swap Workflow

**Nodes Required**:
- All nodes from Video Face Swap
- `BackgroundRemover` - Remove background (SAM/BiseNet)
- `BackgroundReplacer` - Apply new background
- `EffectNodes` - Additional transformations
- `FrameInterpolation` - Smooth all changes
- `ReconstructVideo` - Final video assembly

**Workflow JSON**: `workflows/video-swap-complete.json`

### Model Selection

**Face Swap Models**:
- **IPAdapter FaceID**: Good quality, fast, works with Flux
- **ReActor**: Higher quality, better for difficult angles
- **InsightFace**: Face detection and recognition
- **Recommendation**: Start with IPAdapter FaceID, add ReActor as premium option

**Video Processing**:
- **RIFE**: Frame interpolation for smooth transitions
- **SAM (Segment Anything)**: Background detection and removal
- **BiseNet**: Alternative background segmentation

**Base Models**:
- **Flux Schnell**: Fast generation (for previews)
- **Flux Dev**: High quality (for final processing)

### Infrastructure

**RunPod Serverless**:
- Endpoint: ComfyUI serverless worker
- GPU: RTX 4090 or RTX 3090 (24GB+ VRAM)
- Network Volume: Models and workflows
- Min Workers: 0 (scale to zero)
- Max Workers: 2-5 (based on load)

**Processing Pipeline**:
```
User Upload → Supabase Storage → API Endpoint → 
RunPod Serverless → ComfyUI Workflow → 
Process → Supabase Storage → User Notification
```

### API Endpoints

**Image Face Swap**:
```
POST /api/v1/face-swap/image
Body: {
  sourceFaceImageUrl: string;
  targetImageUrl: string;
  influencerId?: string;
  faceIndex?: number; // If multiple faces
  quality?: 'draft' | 'hq';
}
Response: {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  resultUrl?: string;
  previewUrl?: string;
  qualityScore?: number;
}
```

**Video Face Swap**:
```
POST /api/v1/face-swap/video
Body: {
  sourceFaceImageUrl: string;
  targetVideoUrl: string;
  influencerId?: string;
  faceIndex?: number;
  timeRange?: { start: number; end: number }; // seconds
  quality?: 'draft' | 'hq';
}
Response: {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress?: number; // 0-100
  resultUrl?: string;
  previewUrl?: string;
  qualityScore?: number;
}
```

**Complete Video Swap**:
```
POST /api/v1/video-swap/complete
Body: {
  sourceFaceImageUrl: string;
  targetVideoUrl: string;
  influencerId?: string;
  backgroundReplacement?: {
    enabled: boolean;
    type: 'solid' | 'image' | 'ai-generated' | 'blur';
    value?: string; // color/image URL/prompt
  };
  effects?: string[]; // Additional transformations
  quality?: 'draft' | 'hq';
}
Response: {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress?: number;
  resultUrl?: string;
  previewUrl?: string;
  qualityScore?: number;
}
```

**Job Status**:
```
GET /api/v1/face-swap/jobs/:jobId
Response: {
  jobId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress?: number;
  resultUrl?: string;
  previewUrl?: string;
  qualityScore?: number;
  error?: string;
}
```

---

## User Flow

### Image Face Swap Flow

1. **User navigates to Face Swap feature**
   - From Influencer profile → "Face Swap" button
   - Or from Studio → "Face Swap" tab

2. **User uploads source face**
   - Select AI character (auto-loads character face)
   - Or upload custom face image

3. **User uploads target image**
   - Upload image or select from gallery
   - Image preview shown

4. **Face detection**
   - Automatic face detection
   - If multiple faces: show selection UI
   - Highlight detected face(s)

5. **Preview generation**
   - Generate low-res preview (free)
   - Show quality score
   - User can approve or regenerate

6. **Final processing**
   - User clicks "Process" (charges credits)
   - Job queued
   - Status updates in real-time
   - Notification on completion

7. **Result delivery**
   - Processed image available
   - Download option
   - Share option
   - Save to gallery

### Video Face Swap Flow

1. **User navigates to Video Swap feature**
   - From Influencer profile → "Video Swap" button
   - Or from Studio → "Video Swap" tab

2. **User uploads source face**
   - Select AI character (auto-loads character face)
   - Or upload custom face image

3. **User uploads target video**
   - Upload video (max 5 minutes for MVP)
   - Video preview shown
   - Optional: Select time range

4. **Face detection**
   - Automatic face detection in first frame
   - If multiple faces: show selection UI
   - Face tracking preview

5. **Options selection**
   - Background replacement (optional)
   - Effects (optional)
   - Quality mode (draft/HQ)

6. **Preview generation**
   - Generate low-res preview (first 5 seconds, free)
   - Show quality score
   - User can approve or adjust settings

7. **Final processing**
   - User clicks "Process" (charges credits)
   - Job queued
   - Progress tracking (0-100%)
   - Estimated time shown
   - Email notification on completion

8. **Result delivery**
   - Processed video available
   - Download option
   - Share option
   - Save to gallery

---

## ComfyUI Workflow Research

### Existing Solutions

**Image Face Swap**:
- ✅ **IPAdapter FaceID**: Already in use (see `workflows/face-swap.json`)
- ✅ **ReActor**: Higher quality alternative
- ✅ **InsightFace**: Face detection and recognition

**Video Face Swap**:
- ✅ **Roop**: Video face swap library (CPU/GPU support)
- ✅ **Facefusion_comfyui**: Advanced video face swap node
- ✅ **wan2.2 Video Face Swap**: Workflow template available

**Limitations Found**:
- Many solutions are CPU-only or low resolution
- GPU support varies by implementation
- Video workflows require frame interpolation for quality
- Background replacement adds complexity

### Recommended Approach

**Phase 1: Image Face Swap (MVP)**
- Use existing IPAdapter FaceID workflow
- Enhance with better face detection
- Add quality controls and preview

**Phase 2: Video Face Swap**
- Implement frame-by-frame processing
- Add face tracking (InsightFace or similar)
- Integrate RIFE for frame interpolation
- Test with short videos first (30 seconds)

**Phase 3: Complete Video Swap**
- Add background removal (SAM or BiseNet)
- Implement background replacement
- Add effects pipeline
- Optimize for longer videos (up to 5 minutes)

### Workflow Dependencies

**Required Custom Nodes**:
- `IPAdapterFaceID` - Face swap
- `ReActor` - Alternative face swap
- `InsightFace` - Face detection
- `RIFE` - Frame interpolation
- `SAM` or `BiseNet` - Background segmentation
- `VideoLoader` - Load videos
- `VideoSaver` - Save videos
- `FrameExtractor` - Extract frames
- `FrameReconstructor` - Reconstruct video

**Model Files Required**:
- `ip-adapter-faceid.safetensors`
- `reactor-model.onnx` (if using ReActor)
- `insightface-model.onnx`
- `rife-model.pth`
- `sam-model.pth` or `bisenet-model.pth`

---

## Acceptance Criteria

### Image Face Swap

- [ ] User can upload source face image (AI character or custom)
- [ ] User can upload target image
- [ ] System automatically detects faces in target image
- [ ] If multiple faces, user can select which face to swap
- [ ] System generates preview (free, no credits)
- [ ] Preview shows quality score
- [ ] User can approve or regenerate preview
- [ ] Final processing charges 5 credits
- [ ] Processing completes in <30 seconds
- [ ] Face match quality >80%
- [ ] No visible artifacts in result
- [ ] Result saved to user's gallery
- [ ] User can download result

### Video Face Swap

- [ ] User can upload source face image (AI character or custom)
- [ ] User can upload target video (max 5 minutes)
- [ ] System automatically detects faces in first frame
- [ ] System tracks face across all frames
- [ ] If multiple faces, user can select which face to swap
- [ ] User can optionally select time range
- [ ] System generates preview (first 5 seconds, free)
- [ ] Preview shows quality score
- [ ] User can approve or adjust settings
- [ ] Final processing charges 20 credits/minute
- [ ] Processing shows progress (0-100%)
- [ ] Processing completes in <5 minutes for 1-minute video
- [ ] Face consistency across frames >85%
- [ ] No flickering or artifacts
- [ ] Audio preserved (no audio processing)
- [ ] Result saved to user's gallery
- [ ] User can download result

### Complete Video Swap

- [ ] All video face swap features work
- [ ] User can enable background replacement
- [ ] Background replacement options: solid color, image, AI-generated, blur
- [ ] Background blending seamless (>80%)
- [ ] Additional effects can be applied
- [ ] Final processing charges 30 credits/minute
- [ ] Processing shows progress
- [ ] Quality score includes background blending
- [ ] Result saved to user's gallery

### Quality & Performance

- [ ] Face swap success rate >90%
- [ ] Image processing <30 seconds
- [ ] Video processing <5 minutes per minute of video
- [ ] Quality score calculation accurate
- [ ] Preview generation <10 seconds
- [ ] No crashes or errors during processing
- [ ] Failed jobs retry automatically (3 attempts)
- [ ] Error messages clear and helpful

### Infrastructure

- [ ] ComfyUI workflows created and tested
- [ ] RunPod serverless endpoint configured
- [ ] Models downloaded to network volume
- [ ] Custom nodes installed
- [ ] Workflow JSON files in `workflows/` directory
- [ ] TypeScript workflow factories implemented
- [ ] API endpoints created and tested
- [ ] Storage integration working
- [ ] Credit system integration working
- [ ] Job queue and status tracking working
- [ ] Email notifications on completion

---

## Dependencies

### Technical Dependencies

- **EP-005 (Video Generation)**: Must be launched first
- **RunPod Infrastructure**: ComfyUI serverless endpoint
- **Custom Nodes**: IPAdapter FaceID, ReActor, RIFE, SAM/BiseNet
- **Models**: Face swap models, face detection models, frame interpolation models
- **Storage**: Supabase Storage for media files
- **Credit System**: EP-009 (Credits) must be working

### External Dependencies

- **ComfyUI Workflow Development**: Create and test workflows
- **Model Research**: Evaluate face swap models (IPAdapter vs ReActor)
- **Performance Testing**: Test processing times and quality
- **Infrastructure Setup**: RunPod serverless endpoint configuration

---

## Risks & Mitigation

| Risk | Probability | Impact | Mitigation Strategy |
|------|------------|--------|-------------------|
| Face swap quality issues | Medium | High | Start with proven IPAdapter FaceID, add ReActor as fallback, extensive testing |
| Video processing too slow | Medium | Medium | Optimize workflows, use efficient models, consider cloud processing |
| High credit costs | Medium | Medium | Optimize processing, use efficient models, consider tiered pricing |
| ComfyUI workflow complexity | High | Medium | Start simple (image), iterate to video, use existing workflows as base |
| Model compatibility issues | Medium | Medium | Test all models before production, have fallback options |
| Storage costs | Low | Low | Optimize video compression, set size limits, monitor usage |

---

## Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Face swap success rate | >90% | Track successful vs failed jobs |
| Image processing time | <30 seconds | Average processing time |
| Video processing time | <5 minutes per minute | Average processing time per video minute |
| Quality score | >85% | Average quality score across all jobs |
| Feature adoption | 30%+ users in 30 days | % of active users who try feature |
| Organic traffic | 10K+ monthly visitors | Google Analytics from face swap keywords |
| Page 1 rankings | Top 10 for "ai face swap" | Google Search Console, SERP tracking |
| Credit revenue | Track credit usage | Credit system analytics |

---

## Related Work

### Epics

- **EP-005**: Content Studio & Generation (Video Generation) - Must be launched first
- **EP-009**: Generation Credits & Limits - Credit system integration
- **EP-008**: Image Gallery & Downloads - Storage and gallery integration

### Initiatives

- **IN-016**: AI Face Swap & Video Swap with Parasite SEO Strategy - Parent initiative

### Documentation

- Face Swap Workflow: `workflows/face-swap.json`
- ComfyUI Workflow Guide: `docs/ops/JOB-PROFILE-COMFYUI-WORKFLOW-DEVELOPER.md`
- RunPod Setup: `docs/technical/infrastructure/runpod/RUNPOD-SETUP.md`
- Video Generation Learnings: `docs/learnings/VIDEO-GENERATION-VIRAL-CONTENT.md`

---

## Next Steps

1. **Research Phase** (Week 1):
   - Evaluate face swap models (IPAdapter FaceID vs ReActor)
   - Test existing workflows
   - Research video face swap solutions
   - Identify required custom nodes

2. **Workflow Development** (Week 2-3):
   - Create image face swap workflow
   - Test with various images
   - Create video face swap workflow
   - Test with short videos (30 seconds)

3. **Infrastructure Setup** (Week 2):
   - Configure RunPod serverless endpoint
   - Install custom nodes
   - Download required models
   - Test workflow execution

4. **API Development** (Week 3-4):
   - Create API endpoints
   - Implement workflow factories
   - Integrate with storage
   - Integrate with credit system

5. **UI Development** (Week 4-5):
   - Create face swap UI
   - Implement preview system
   - Add progress tracking
   - Add quality controls

6. **Testing & QA** (Week 5-6):
   - Test all features
   - Performance testing
   - Quality validation
   - User acceptance testing

7. **Launch Preparation** (Week 6):
   - Parasite SEO content creation (IN-016)
   - Documentation
   - Marketing materials
   - Launch coordination

---

**Status**: 📝 Defined  
**Priority**: P1 (Post-MVP)  
**Estimated Timeline**: 6-8 weeks after EP-005 launch  
**Last Updated**: 2026-01-26
