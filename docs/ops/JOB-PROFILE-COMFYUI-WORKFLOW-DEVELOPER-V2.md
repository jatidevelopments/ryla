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

**Problem Solving**:

- ✅ Ability to debug complex workflow issues
- ✅ Systematic approach to troubleshooting
- ✅ Creative solutions to technical challenges

**Attention to Detail**:

- ✅ Critical for QA and quality standards
- ✅ Thorough testing and validation
- ✅ Careful code review and documentation

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

1. Break down task into manageable steps (structured approach)
2. Research optimal dataset composition (70% upper body/face, 20% portrait, 10% full body)
3. Provide time estimate: 2-3 days for initial implementation, 1 day for testing/optimization
4. Design workflow in ComfyUI UI (visual node editor)
5. Test training parameters (steps, learning rate, trigger words)
6. Convert UI JSON to API prompt JSON format
7. Implement TypeScript workflow factory in `libs/business/src/workflows/`
8. Integrate with backend service (`comfyui-job-runner.ts`)
9. Test end-to-end: Character sheet → LoRA training → Model validation
10. QA: Validate character consistency (>95% face match)
11. Optimize training time and cost (<$5 per character, <45 minutes)
12. Document workflow usage, parameters, and best practices
13. Provide status update and deliver on schedule

**Deliverables**:

- Workflow JSON files (UI and API formats)
- TypeScript workflow factory implementation
- Backend integration code
- QA test results and quality assessment
- Documentation
- Delivered on time with clear communication throughout

**AI Influencer Context**: Understanding that LoRA quality directly impacts character consistency, which is critical for AI influencer success. Poor consistency = users won't trust the character.

### Example 2: Video Generation Workflow Development

**Task**: Create image-to-video workflow for AI influencer content

**Steps**:

1. Break down task and provide estimate: 3-4 days for implementation, 1 day for QA
2. Research video models (Clink 2.6, Sora, VO 3.1, WAN 2.2)
3. Design workflow in ComfyUI UI for image-to-video conversion
4. Test with different character images and prompts
5. Implement quality controls (preview before final generation)
6. Convert UI JSON to API prompt JSON format
7. Integrate with backend service
8. Test end-to-end: Image → Video generation → Quality validation
9. QA: Review videos for quality, natural motion, character consistency
10. Document workflow usage and quality standards
11. Apply AI influencer best practices (what makes videos viral)
12. Regular status updates throughout development
13. Deliver on schedule with comprehensive documentation

**Deliverables**:

- Video generation workflow implementation
- Quality control system
- QA test results
- Documentation
- Delivered on time

**AI Influencer Context**: Understanding that video quality is critical - "garbage in, garbage out". Bad videos can destroy influencer reputation. Need preview/validation system.

### Example 3: Backend Integration with Progress Tracking

**Task**: Implement WebSocket-based real-time progress tracking for LoRA training

**Steps**:

1. Break down task: 2 days for WebSocket implementation, 1 day for Redis integration, 1 day for testing
2. Provide clear estimate and communicate timeline
3. Research ComfyUI WebSocket API
4. Implement WebSocket client in `comfyui-pod-client.ts`
5. Add progress tracking logic (0-100% calculation)
6. Integrate with Redis for job persistence (critical for 1-1.5 hour LoRA training jobs)
7. Add fallback to REST polling if WebSocket fails
8. Test with long-running jobs (LoRA training: 15-45 minutes)
9. QA: Verify progress updates are accurate and timely
10. Ensure job recovery on server restart (critical for LoRA training)
11. Document implementation and usage
12. Regular status updates, deliver on schedule

**Deliverables**:

- WebSocket client implementation
- Redis integration code
- Progress tracking logic
- Test results and performance metrics
- Documentation
- Delivered on time with clear communication

---

## Success Metrics

**Workflow Development**:

- ✅ New workflows delivered on time (image, video, LoRA, face swap)
- ✅ Workflow execution success rate >95%
- ✅ Workflow optimization (cost reduction, speed improvement)
- ✅ LoRA training quality (>95% character consistency)
- ✅ Video generation quality (natural motion, no artifacts)

**Backend Implementation**:

- ✅ API endpoints implemented and tested
- ✅ WebSocket adoption rate >80%
- ✅ Job recovery success rate >95%
- ✅ Error handling and retry logic working
- ✅ Delivered on schedule with reliable estimates

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
- Flexible hours (with structured work and reliable delivery)

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
