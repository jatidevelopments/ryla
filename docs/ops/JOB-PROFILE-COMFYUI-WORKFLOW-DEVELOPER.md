# Job Profile: ComfyUI Workflow Developer & QA Engineer

**Role**: ComfyUI Workflow Developer / Backend Engineer / Quality Assurance  
**Department**: Engineering  
**Level**: Mid to Senior  
**Type**: Part-time → Full-time / Contract  
**Location**: Remote

---

## Overview

We're looking for a **ComfyUI Workflow Developer** with strong backend engineering skills and **AI influencer industry experience** to build, manage, and optimize ComfyUI workflows for RYLA's AI influencer platform. This role combines workflow development (image generation, video generation, LoRA training, face swap, etc.), backend implementation, and quality assurance to ensure our AI-generated content meets the highest standards.

**Ideal Candidate**: Someone with hands-on experience in the AI influencer space - building AI characters, creating viral content, understanding what makes AI influencers successful, and working with the tools and techniques used by AI influencer creators.

**Key Responsibilities**:

- Design and build ComfyUI workflows for image generation, video generation, LoRA training, face swap, and more
- Implement and maintain backend integrations with ComfyUI/RunPod
- Test and QA generated content (images, videos) for quality, consistency, and accuracy
- Optimize workflows for performance and cost efficiency
- Apply AI influencer industry best practices and insights
- Manage own work, provide reliable estimates, and deliver on time
- Communicate clearly and proactively with the team

---

## Core Responsibilities

### 1. ComfyUI Workflow Development (40%)

**Build and maintain ComfyUI workflows**:

- **Image Generation**: Character generation, base images, body types, features, inpainting, outpainting
- **Video Generation**: Image-to-video, talking head videos, dancing videos, motion control
- **LoRA Training**: Train character consistency models, optimize training parameters, manage datasets
- **Face Swap**: IPAdapter FaceID, PuLID, face consistency techniques
- **Character Consistency**: Character sheets, multi-reference generation, identity preservation
- Convert UI workflow JSON to API prompt JSON format
- Optimize workflows for performance, quality, and cost
- Document workflow usage and parameters
- Test workflows across different models and configurations

**Technical Requirements**:

- Deep understanding of ComfyUI node system and workflow architecture
- Experience with workflow conversion (UI JSON → API JSON)
- **Image Generation**: Knowledge of models (Flux, SDXL, Z-Image-Turbo, Qwen Image, etc.)
- **Video Generation**: Experience with video models (Clink, Sora, VO 3.1, WAN 2.2, etc.)
- **LoRA Training**: Understanding of LoRA training workflows, dataset composition, training parameters
- **Face Consistency**: Experience with IPAdapter FaceID, PuLID, ControlNet, and face swap techniques
- **Character Consistency**: Knowledge of character sheet generation, multi-reference workflows
- Ability to debug workflow issues and optimize node connections

**Deliverables**:

- New workflows for image generation, video generation, LoRA training, face swap, etc.
- Workflow documentation and usage guides
- Workflow optimization reports
- Conversion scripts and tools
- LoRA training pipelines and optimization
- Video generation workflows and quality controls

### 2. Backend Integration & Implementation (35%)

**Implement and maintain backend services**:

- Integrate ComfyUI workflows with RYLA backend API (NestJS/TypeScript)
- Implement workflow execution via RunPod serverless endpoints
- Build workflow factory patterns for dynamic workflow generation
- Implement WebSocket-based real-time progress tracking
- Add Redis persistence for job recovery
- Create API endpoints for workflow management

**Technical Requirements**:

- Strong TypeScript/Node.js skills
- Experience with NestJS framework
- Understanding of REST APIs and WebSocket connections
- Knowledge of Redis for job persistence
- Experience with cloud infrastructure (RunPod, Fly.io)
- Understanding of async job processing and queue systems

**Code Areas**:

- `libs/business/src/services/comfyui-pod-client.ts` - ComfyUI client
- `libs/business/src/services/comfyui-job-runner.ts` - Job execution
- `libs/business/src/workflows/` - Workflow definitions
- `apps/api/src/` - Backend API endpoints

**Deliverables**:

- Backend services for workflow execution
- API endpoints for workflow management
- WebSocket implementation for real-time progress
- Redis integration for job persistence
- Error handling and retry logic

### 3. Quality Assurance & Testing (25%)

**Test and validate generated content**:

- Review generated images and videos for quality, consistency, and accuracy
- Test workflows across different character configurations
- Validate image and video outputs match expected specifications
- Test LoRA training quality and character consistency (>95% face match)
- Validate face swap accuracy (~80% face match for immediate generation)
- Create QA test cases and acceptance criteria
- Document quality standards and guidelines
- Identify and report workflow issues and bugs
- Apply AI influencer industry quality standards (what makes content viral, appealing, authentic)

**Quality Standards** (CRITICAL - Quality is our top priority):

RYLA requires **professional-grade, hyper-realistic images** that look like authentic photographs. Quality is not negotiable - it's the foundation of our product.

**Visual Quality Requirements**:

- **8K Hyper-Realistic**: Professional photography quality, photorealistic rendering
- **Appealing & Attractive**: Images must be visually appealing and attractive
- **Natural Imperfections**: Visible pores, fine wrinkles, follicles, blemishes, freckles
- **Skin Texture**: Realistic skin texture with visible pores, subtle translucency, subdermal depth
- **Micro-Details**: Individual hair strands, lashes, eyebrows, tear-film reflections, wet mucosa
- **Natural Asymmetries**: Slight natural asymmetries in face and body preserved (not "perfect")
- **Professional Photography**: Editorial fashion photography, studio lighting, DSLR photo quality
- **No AI Artifacts**: Avoid "plastic/waxy" AI look, airbrushed appearance, beauty filter effects

**Quality Checklist** (from `docs/technical/prompts/realism-cheat-sheet.md`):

- ✅ Shot on Fujifilm GFX 100S, 80mm prime lens, f/2.8
- ✅ High-key butterfly lighting with large softboxes
- ✅ Shallow depth of field, sharp focus on eyes and face
- ✅ Individual hair strands, lashes, eyebrows rendered individually
- ✅ Pores, fine wrinkles, follicles, blemishes visible
- ✅ Realistic subsurface scattering, sheen, and texture
- ✅ Natural asymmetries preserved (not "perfect" or "flawless")
- ✅ No artificial glow, bloom, or rim lighting
- ✅ Accurate reflectance on eyes and lips
- ✅ Subtle veins and cartilage translucency

**Consistency Requirements**:

- Character consistency across different generations (>95% face match with LoRA)
- Consistent style and composition across image sets
- Body type differentiation clearly visible
- Feature accuracy (hair, eyes, ethnicity, etc.)

**Performance Requirements**:

- Generation time: <30 seconds for base images (P50)
- First image visible: <10 seconds (P50)
- All 3 base images: <30 seconds (P50)
- Cost: Within acceptable limits (target: <$2 per character creation)

**Reliability Requirements**:

- Workflow execution success rate: >95%
- Error handling and retry logic for transient failures
- Graceful degradation when services unavailable

**Testing Areas**:

- **Image Generation**: Character generation, body types, features, inpainting, outpainting
- **Video Generation**: Image-to-video, talking head, dancing videos, motion control
- **LoRA Training**: Training quality, character consistency, dataset optimization
- **Face Swap**: IPAdapter FaceID, PuLID, face consistency accuracy
- **Character Consistency**: Character sheets, multi-reference generation
- **Model Configurations**: Flux, Z-Image-Turbo, Qwen Image, Clink, Sora, WAN 2.2, etc.

**Deliverables**:

- QA test plans and test cases
- Quality assessment reports
- Bug reports and issue tracking
- Quality standards documentation
- Automated quality checks (where possible)

---

## ComfyUI Workflow Examples

### Core Workflows Used at RYLA

**Location**: `workflows/` directory contains API-format workflow JSON files

#### 1. Base Image Generation Workflows

**Z-Image-Turbo Base Image** (`z-image-turbo-base-image.json`):

- **Purpose**: Generate base character images for wizard (Step 6)
- **Model**: Z-Image-Turbo (Qwen-based)
- **Output**: 3 base image variations
- **Quality Requirements**: 8K hyper-realistic, photorealistic, appealing, attractive
- **Use Case**: Initial character creation in wizard
- **Key Features**: Fast generation (<30s), high quality, unique faces

**Flux Base Image** (`flux-base-image.json`):

- **Purpose**: Alternative base image generation using Flux Dev
- **Model**: Flux Dev (flux1-dev.safetensors)
- **Output**: 3 base image variations
- **Quality Requirements**: Same as Z-Image-Turbo
- **Use Case**: Alternative to Z-Image-Turbo for higher quality (if needed)

#### 2. Character Consistency Workflows

**Character Sheet Generation** (`character-sheet.json`):

- **Purpose**: Generate character sheet with multiple poses/angles for LoRA training
- **Model**: Flux Dev + PuLID + ControlNet
- **Technique**: PuLID for face consistency, ControlNet for pose control
- **Output**: Multiple character images (different poses, angles, environments)
- **Quality Requirements**: Maintain enhanced skin quality from base image
- **Use Case**: Create training data for LoRA model
- **Key Insight**: Enhanced skin from base image carries through to all variations

**Face Swap** (`face-swap.json`):

- **Purpose**: Face swap using IPAdapter FaceID
- **Model**: Flux Schnell + IPAdapter FaceID
- **Output**: Images with swapped face maintaining character identity
- **Quality Requirements**: >80% face match, professional quality
- **Use Case**: Generate images while LoRA trains (immediate availability)
- **Timing**: Available immediately (<15s) while LoRA trains in background

#### 3. Final Generation Workflows

**Final Generation with LoRA** (`final-generation-lora.json`):

- **Purpose**: Generate final images with trained LoRA for character consistency
- **Model**: Flux Dev + LoRA (trained on character sheet)
- **Output**: High-quality images with >95% character consistency
- **Quality Requirements**: Professional photography quality, character consistency
- **Use Case**: Final image generation after LoRA training complete
- **Timing**: Available after LoRA ready (15-45 min)

#### 4. Video Generation Workflows

**WAN 2.2 Video** (`251007_MICKMUMPITZ_WAN-2-2-VID_SMPL.json`):

- **Purpose**: Text-to-video and image-to-video generation
- **Model**: WAN 2.2 (text-to-video model)
- **Output**: Video clips from text prompts or images
- **Use Case**: AI influencer video content generation
- **Quality Requirements**: Natural motion, character consistency, no artifacts
- **Key Insight**: "Garbage in, garbage out" - input image quality = output video quality

**HunyuanVideo** (in `libs/comfyui-workflows/video/HunyuanVideo/`):

- **Purpose**: Image-to-video generation
- **Model**: HunyuanVideo
- **Output**: Video clips from character images
- **Use Case**: AI influencer video content
- **Quality Requirements**: Natural motion, character consistency

**Clink Workflows** (reference from research):

- **Purpose**: Motion control, dancing videos, talking head videos
- **Models**: Clink 2.6, Clink Avatars 2.0
- **Use Cases**: Dancing videos, talking head content, motion control
- **Quality Requirements**: Natural motion, accurate gestures, lip-sync quality

#### 5. LoRA Training Workflows

**LoRA Training Pipeline** (from `docs/technical/systems/IMAGE-GENERATION-FLOW.md`):

- **Purpose**: Train character consistency models
- **Input**: Character sheet images (7-10 images)
- **Output**: Trained LoRA model (.safetensors) + trigger word
- **Training Time**: 15-45 minutes (background)
- **Cost**: <$5 per character
- **Quality Target**: >95% character consistency
- **Training Options**: AI Toolkit, fal.ai 1.2.2 Trainer, flux-dev-lora-trainer
- **Dataset Composition**: 70% upper body/face, 20% portrait, 10% full body (optimal: 30 images)

**Key Workflow Steps**:

1. Generate character sheet (PuLID + ControlNet)
2. Create variations (emotions, lighting, poses)
3. Train LoRA (700 steps for faces, ~45 minutes)
4. Validate character consistency (>95% face match)
5. Use trigger word in prompts for consistency

#### 6. Advanced Workflows (Reference)

**CCC Workflows** (MICKMUMPITZ*CCC*\*.json):

- Complex multi-stage workflows for high-quality generation
- Uses Flux Kontext for multi-reference image generation
- Advanced techniques for character consistency
- Reference for future workflow development

**WAN 2.2 Image** (`251007_MICKMUMPITZ_WAN-2-2-IMG_SMPL.json`):

- Text-to-image workflows using WAN 2.2 model
- Alternative model architecture (WAN 2.2)
- Reference for image generation workflows

### Workflow Development Examples

#### Example 1: Body Type Image Generation Workflow

**Requirement**: Generate 8 body type images (4 female + 4 male) for EP-035

**Workflow Design**:

1. Start with base character image (from EP-033)
2. Use Z-Image-Turbo or Flux Dev model
3. Apply body type-specific prompts
4. Use ControlNet for pose control (full body view)
5. Generate with body type-specific parameters

**Quality Requirements**:

- Clear body type differentiation
- Appealing, attractive appearance
- Professional quality (8K, photorealistic)
- Consistent with base character
- Full body view to showcase body type

**Prompt Engineering** (from `docs/requirements/epics/mvp/EP-035-body-type-image-generation.md`):

```text
A beautiful, attractive woman, 25 years old, caucasian ethnicity,
long brown hair, brown eyes, [body type description] body type,
full body view, wearing form-fitting casual outfit, professional portrait,
8K hyper-realistic, photorealistic, professional photography,
ultra high quality, extremely detailed, sharp focus, clean composition,
studio lighting, editorial fashion photography, masterpiece, best quality
```

**Negative Prompt**:

```text
deformed, blurry, bad anatomy, ugly, low quality, watermark, signature,
multiple people, extra limbs, distorted face, bad hands, missing fingers,
extra fingers, mutated hands, poorly drawn hands, bad proportions,
long neck, duplicate, mutilated, disfigured, bad anatomy, out of frame,
extra limbs, bad body, gross proportions, malformed limbs, missing arms,
missing legs, extra arms, extra legs, mutated, ugly, bad face, bad eyes,
text, watermark, signature, no person, empty scene, no character
```

#### Example 2: Skin Enhancement Workflow (Future)

**Requirement**: Enhance skin quality after base image selection (critical for quality)

**Workflow Design** (from `docs/research/learnings/AI-INFLUENCER-WORKFLOW-LEARNINGS.md`):

1. Base image selection
2. **Skin Enhancement** (CRITICAL STEP - NEW)
3. Character sheet generation (maintains enhanced skin)
4. LoRA training (trained on enhanced images)
5. Image generation (consistent quality)

**Why Critical**:

- Enhanced skin details carry through to all subsequent generations
- Don't need to enhance every variation individually
- Consistent quality across all images
- Better LoRA training data

**Quality Impact**:

- More realistic skin texture
- Professional appearance
- Better character consistency
- Reduced post-processing needs

### Workflow Quality Checklist

When developing or reviewing workflows, ensure:

**Technical Quality**:

- [ ] Workflow executes successfully >95% of the time
- [ ] Error handling for edge cases
- [ ] Proper node connections and data flow
- [ ] Optimized for performance (speed and cost)
- [ ] Compatible with RunPod serverless infrastructure

**Image Quality** (CRITICAL):

- [ ] 8K hyper-realistic, photorealistic quality
- [ ] Appealing, attractive appearance
- [ ] Natural skin texture with visible pores
- [ ] Individual hair strands, lashes, eyebrows
- [ ] Natural asymmetries preserved (not "perfect")
- [ ] Professional photography aesthetic
- [ ] No AI artifacts (plastic/waxy look)
- [ ] Realistic lighting and shadows
- [ ] Sharp focus on eyes and face
- [ ] Clean composition

**Character Consistency**:

- [ ] Face match >95% with LoRA (final generation)
- [ ] Face match >80% with face swap (immediate generation)
- [ ] Consistent style across image sets
- [ ] Body type differentiation clear
- [ ] Feature accuracy (hair, eyes, ethnicity, etc.)

**Documentation**:

- [ ] Workflow purpose and use case documented
- [ ] Required models and custom nodes listed
- [ ] Key parameters and settings documented
- [ ] Quality standards and acceptance criteria
- [ ] Example prompts and outputs

---

## Required Skills & Experience

### AI Influencer Industry Experience (Highly Preferred)

**Ideal Background**:

- ✅ Experience creating AI influencers or AI characters
- ✅ Understanding of what makes AI influencer content successful and viral
- ✅ Knowledge of AI influencer tools and techniques (LoRA training, face consistency, etc.)
- ✅ Experience with AI influencer workflows (character creation, content generation, etc.)
- ✅ Understanding of AI influencer quality standards and best practices
- ✅ Familiarity with AI influencer platforms and communities
- ✅ Experience optimizing content for social media (TikTok, Instagram, etc.)

**Why This Matters**:

- You'll understand the "why" behind our workflows, not just the "how"
- You'll know what quality looks like in the AI influencer space
- You'll bring industry insights and best practices
- You'll understand user needs and pain points
- You'll help us build features that creators actually want

### Technical Skills

**ComfyUI Expertise** (Required):

- ✅ 2+ years experience building ComfyUI workflows
- ✅ Deep understanding of ComfyUI node system
- ✅ Experience with workflow conversion and optimization
- ✅ **Image Generation**: Knowledge of models (Flux, SDXL, Z-Image-Turbo, Qwen Image, etc.)
- ✅ **Video Generation**: Experience with video workflows (Clink, Sora, VO 3.1, WAN 2.2, etc.)
- ✅ **LoRA Training**: Understanding of LoRA training workflows, dataset composition, training parameters
- ✅ **Face Consistency**: Experience with IPAdapter FaceID, PuLID, ControlNet, face swap
- ✅ Understanding of advanced techniques (ControlNet, multi-reference, character consistency)

**Backend Development** (Required):

- ✅ 3+ years TypeScript/Node.js experience
- ✅ Experience with NestJS or similar frameworks
- ✅ REST API design and implementation
- ✅ WebSocket implementation experience
- ✅ Redis or similar caching/persistence systems
- ✅ Async job processing and queue systems

**Cloud Infrastructure** (Preferred):

- ✅ Experience with RunPod or similar GPU cloud platforms
- ✅ Understanding of serverless architectures
- ✅ Docker containerization
- ✅ CI/CD pipelines

**Quality Assurance** (Required):

- ✅ Experience with image quality assessment
- ✅ Experience with video quality assessment
- ✅ Attention to detail and visual quality standards
- ✅ Test case creation and execution
- ✅ Bug tracking and reporting

### Soft Skills (CRITICAL)

**Communication Skills** (Required):

- ✅ **Clear Written Communication**: Ability to document workflows, write clear code comments, create comprehensive reports
- ✅ **Proactive Updates**: Regular status updates, early communication of blockers or delays
- ✅ **Technical Communication**: Ability to explain complex technical concepts to non-technical stakeholders
- ✅ **Collaboration**: Effective communication with team members, product team, and stakeholders
- ✅ **Asynchronous Communication**: Comfortable with async communication (Slack, GitHub, documentation)
- ✅ **Status Reporting**: Regular progress updates, milestone reporting, risk communication

**Project Management & Self-Management** (Required):

- ✅ **Structured Working**: Organized approach to work, clear task breakdown, systematic problem-solving
- ✅ **Reliable Estimations**: Ability to provide accurate time estimates for tasks and projects
- ✅ **On-Time Delivery**: Consistently deliver work on schedule, meet deadlines
- ✅ **Self-Management**: Ability to work independently, manage own time, prioritize tasks effectively
- ✅ **Task Breakdown**: Break complex tasks into manageable steps
- ✅ **Progress Tracking**: Track own progress, identify blockers early, communicate delays proactively
- ✅ **Quality Focus**: Maintain quality standards while meeting deadlines
- ✅ **Risk Management**: Identify risks early, communicate them, propose solutions

### Soft Skills

- **Problem Solving**: Ability to debug complex workflow issues
- **Communication**: Clear documentation and collaboration
- **Attention to Detail**: Critical for QA and quality standards
- **Self-Motivated**: Ability to work independently and proactively
- **Adaptability**: Comfortable with rapidly evolving AI/ML landscape

---

## Nice-to-Have Skills

- **AI Influencer Industry**: Experience creating AI influencers, understanding viral content
- **Video Generation**: Experience with video workflows (Clink, Sora, talking head, dancing videos)
- **LoRA Training**: Advanced LoRA training techniques, dataset optimization, training parameter tuning
- **Character Consistency**: Advanced character consistency techniques, multi-reference workflows
- **Social Media**: Understanding of TikTok, Instagram content optimization
- **Content Creation**: Experience with content creation workflows, editing tools (CapCut, etc.)
- Understanding of NSFW/SFW content filtering
- Experience with Supabase, PostgreSQL
- Knowledge of tRPC or similar API frameworks
- Experience with Nx monorepo structure

---

## Technical Stack

**Primary Technologies**:

- **ComfyUI**: Workflow development and optimization (image, video, LoRA, face swap)
- **Image Models**: Flux, Z-Image-Turbo, Qwen Image, SDXL
- **Video Models**: Clink, Sora, VO 3.1, WAN 2.2, HunyuanVideo
- **LoRA Training**: AI Toolkit, fal.ai trainer, flux-dev-lora-trainer
- **Face Consistency**: IPAdapter FaceID, PuLID, ControlNet
- **TypeScript/Node.js**: Backend implementation
- **NestJS**: Backend framework
- **RunPod**: GPU infrastructure for workflow execution
- **Redis**: Job persistence and caching
- **WebSocket**: Real-time progress tracking

**Supporting Technologies**:

- **Docker**: Containerization
- **PostgreSQL/Supabase**: Database
- **Git/GitHub**: Version control
- **Nx**: Monorepo management

---

## Work Examples

### Example 1: LoRA Training Workflow Development

**Task**: Create and optimize LoRA training workflow for character consistency

**Steps**:

1. Design workflow in ComfyUI UI (visual node editor)
2. Research optimal dataset composition (70% upper body/face, 20% portrait, 10% full body)
3. Test training parameters (steps, learning rate, trigger words)
4. Convert UI JSON to API prompt JSON format
5. Implement TypeScript workflow factory in `libs/business/src/workflows/`
6. Integrate with backend service (`comfyui-job-runner.ts`)
7. Test end-to-end: Character sheet → LoRA training → Model validation
8. QA: Validate character consistency (>95% face match)
9. Optimize training time and cost (<$5 per character, <45 minutes)
10. Document workflow usage, parameters, and best practices

**AI Influencer Context**: Understanding that LoRA quality directly impacts character consistency, which is critical for AI influencer success. Poor consistency = users won't trust the character.

### Example 2: Video Generation Workflow Development

**Task**: Create image-to-video workflow for AI influencer content

**Steps**:

1. Research video models (Clink 2.6, Sora, VO 3.1, WAN 2.2)
2. Design workflow in ComfyUI UI for image-to-video conversion
3. Test with different character images and prompts
4. Implement quality controls (preview before final generation)
5. Convert UI JSON to API prompt JSON format
6. Integrate with backend service
7. Test end-to-end: Image → Video generation → Quality validation
8. QA: Review videos for quality, natural motion, character consistency
9. Document workflow usage and quality standards
10. Apply AI influencer best practices (what makes videos viral)

**AI Influencer Context**: Understanding that video quality is critical - "garbage in, garbage out". Bad videos can destroy influencer reputation. Need preview/validation system.

### Example 3: Body Type Image Generation Workflow

**Task**: Create workflow for body type image generation

**Steps**:

1. Break down task into manageable steps (structured approach)
2. Provide time estimate: 2-3 days for implementation, 1 day for QA
3. Design workflow in ComfyUI UI (visual node editor)
4. Test workflow with various body type configurations
5. Convert UI JSON to API prompt JSON format
6. Implement TypeScript workflow factory in `libs/business/src/workflows/`
7. Integrate with backend service (`comfyui-job-runner.ts`)
8. Test end-to-end: API → RunPod → Image generation
9. QA: Review generated images for quality and accuracy
10. Document workflow usage and parameters
11. Provide status update and deliver on schedule

**Deliverables**:

- Workflow JSON files (UI and API formats)
- TypeScript workflow factory implementation
- Backend integration code
- QA test results and quality assessment
- Documentation

### Example 4: Backend Integration

**Task**: Implement WebSocket-based real-time progress tracking for LoRA training

**Steps**:

1. Research ComfyUI WebSocket API
2. Implement WebSocket client in `comfyui-pod-client.ts`
3. Add progress tracking logic (0-100% calculation)
4. Integrate with Redis for job persistence (critical for 1-1.5 hour LoRA training jobs)
5. Add fallback to REST polling if WebSocket fails
6. Test with long-running jobs (LoRA training: 15-45 minutes)
7. QA: Verify progress updates are accurate and timely
8. Ensure job recovery on server restart (critical for LoRA training)

**Deliverables**:

- WebSocket client implementation
- Redis integration code
- Progress tracking logic
- Test results and performance metrics
- Documentation

### Example 5: Quality Assurance - LoRA Training

**Task**: QA LoRA training quality and character consistency

**Steps**:

1. Review acceptance criteria (character consistency >95% face match)
2. Generate character sheet (7-10 images) using PuLID + ControlNet
3. Train LoRA using optimized parameters (700 steps, ~45 minutes)
4. Generate test images with trained LoRA
5. Assess character consistency (face match, style consistency)
6. Validate training quality (compare with/without LoRA)
7. Test across different prompts and scenes
8. Document findings and optimization recommendations
9. Report any issues or quality concerns

**AI Influencer Context**: Understanding that character consistency is the foundation of AI influencer success. Users need to trust that the character looks the same across all content.

### Example 6: Quality Assurance - Video Generation

**Task**: QA video generation quality for AI influencer content

**Steps**:

1. Review acceptance criteria (natural motion, character consistency, quality)
2. Generate test videos from character images
3. Assess video quality (natural motion, no artifacts, character consistency)
4. Validate "garbage in, garbage out" principle (input image quality = output video quality)
5. Test different video types (image-to-video, talking head, dancing)
6. Apply AI influencer quality standards (what makes videos viral, appealing)
7. Document findings and quality standards
8. Report any issues or quality concerns

**AI Influencer Context**: Understanding that bad videos can destroy influencer reputation. Better to post no video than a bad video. Need preview/validation system.

**Deliverables**:

- QA test plan
- Quality assessment report
- Sample images with annotations
- Bug reports (if any)
- Recommendations for improvements

---

## Success Metrics

**Workflow Development**:

- ✅ New workflows delivered on time (image, video, LoRA, face swap)
- ✅ Workflow execution success rate >95%
- ✅ Workflow optimization (cost reduction, speed improvement)
- ✅ LoRA training quality (>95% character consistency)
- ✅ Video generation quality (natural motion, no artifacts)
- ✅ Reliable time estimates (within 20% accuracy)

**Backend Implementation**:

- ✅ API endpoints implemented and tested
- ✅ WebSocket adoption rate >80%
- ✅ Job recovery success rate >95%
- ✅ Error handling and retry logic working

**Quality Assurance**:

- ✅ Image quality meets standards (>90% pass rate)
- ✅ Video quality meets standards (natural motion, character consistency)
- ✅ LoRA training quality validated (>95% character consistency)
- ✅ Face swap accuracy validated (~80% face match)
- ✅ QA test cases created and executed
- ✅ Bug reports filed and tracked
- ✅ Quality standards documented
- ✅ AI influencer industry best practices applied

**Communication & Project Management**:

- ✅ Clear, regular status updates
- ✅ Reliable time estimates (within 20% accuracy)
- ✅ On-time delivery (>90% of tasks)
- ✅ Proactive communication of blockers and delays
- ✅ Comprehensive documentation
- ✅ Structured approach to work

---

## Reporting Structure

**Reports To**: Engineering Lead / Backend Team Lead  
**Collaborates With**:

- Backend Team: API implementation and integration
- Infrastructure Team: RunPod setup and optimization
- Product Team: Requirements and acceptance criteria
- Design Team: Quality standards and visual guidelines

**Communication Expectations**:

- **Daily Updates**: Brief status update (async, Slack or GitHub)
- **Weekly Sync**: Progress review, blockers, next steps
- **Milestone Updates**: Major milestones, significant progress
- **Blocker Communication**: Immediate communication when blocked
- **Documentation**: Comprehensive documentation for all deliverables

---

## Growth Opportunities

- **Technical Leadership**: Lead workflow architecture decisions
- **Specialization**: Deep expertise in AI/ML image generation
- **Cross-functional**: Work with product and design teams
- **Innovation**: Explore new models and techniques
- **Mentorship**: Guide junior developers on ComfyUI workflows

---

## Application Process

**To Apply**:

1. Submit resume/CV highlighting ComfyUI, backend, and **AI influencer industry experience**
2. Include portfolio/examples of:
   - ComfyUI workflows (image, video, LoRA, face swap)
   - AI influencer projects or characters you've created
   - Examples of AI-generated content (images, videos)
3. Provide code samples (TypeScript/Node.js preferred)
4. Brief description of:
   - Image and video quality assessment experience
   - AI influencer industry experience and insights
   - LoRA training and character consistency experience
   - Examples of structured work, reliable estimates, and on-time delivery
   - Communication and self-management approach

**Interview Process**:

1. **Initial Screening**: Technical background, ComfyUI experience, and **AI influencer industry experience**
2. **Technical Interview**: ComfyUI workflow design challenge (image, video, or LoRA)
3. **Backend Interview**: TypeScript/Node.js coding challenge
4. **QA Interview**: Image/video quality assessment exercise + AI influencer quality standards discussion
5. **Project Management Interview**: Discuss approach to estimates, task breakdown, self-management
6. **AI Influencer Discussion**: Industry insights, best practices, what makes content successful
7. **Final Interview**: Team fit and culture alignment

---

## Compensation & Benefits

**Compensation**: Competitive, based on experience  
**Benefits**:

- Remote work flexibility
- Health insurance (if applicable)
- Professional development opportunities
- Access to GPU infrastructure for testing
- Latest AI/ML tools and resources

---

## Related Documentation

**Quality & Standards** (CRITICAL - Read These First):

- `docs/technical/prompts/realism-cheat-sheet.md` - **Quality standards and realism requirements**
- `docs/research/learnings/AI-INFLUENCER-WORKFLOW-LEARNINGS.md` - **Workflow best practices and quality insights**
- `docs/requirements/epics/mvp/EP-033-base-character-image-generation.md` - Base image quality requirements
- `docs/requirements/epics/mvp/EP-035-body-type-image-generation.md` - Body type image quality requirements
- `libs/business/src/prompts/categories.ts` - Prompt engineering patterns and quality modifiers

**Technical References**:

- `docs/initiatives/IN-007-comfyui-infrastructure-improvements.md` - Infrastructure improvements
- `docs/ops/COMFYUI-WORKFLOW-CONVERSION.md` - Workflow conversion guide
- `docs/ops/runpod/COMFYUI-WORKER-SETUP.md` - RunPod setup
- `libs/comfyui-workflows/RYLA-README.md` - Workflow library
- `workflows/README.md` - Workflow files and usage

**Code References**:

- `libs/business/src/services/comfyui-pod-client.ts` - ComfyUI client
- `libs/business/src/services/comfyui-job-runner.ts` - Job runner
- `libs/business/src/workflows/` - Workflow definitions
- `apps/api/src/` - Backend API
- `workflows/` - Workflow JSON files (API format)

**Workflow Examples**:

- `workflows/z-image-turbo-base-image.json` - Base image generation
- `workflows/flux-base-image.json` - Flux base image generation
- `workflows/character-sheet.json` - Character sheet generation
- `workflows/face-swap.json` - Face swap workflow
- `workflows/final-generation-lora.json` - Final generation with LoRA

---

**Last Updated**: 2026-01-27  
**Status**: Active Hiring
