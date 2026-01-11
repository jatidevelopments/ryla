# Video Generation for Viral AI Influencer Content - Learnings

**Date**: 2025-01-27
**Source**: YouTube Video - "Best Ways to Create Viral Videos for AI Influencers" (664uByVYBk8)
**Phase**: P3 (Architecture) / P5 (File Plan)
**Relevance**: EP-005 (Content Studio)

---

## Key Learnings

### 1. Three Distinct Video Workflows

**Dancing Videos**:
- Use Clink Motion Control (Clink 2.6 Pro) via Wave Speed AI
- Process: Upload character image + reference TikTok video → get dancing video
- Much simpler than previous methods (no face swap needed)
- Replicates hand gestures and complex motions accurately

**Image-to-Video Edited Content**:
- Most versatile and creative option
- Generate multiple image-to-video clips → edit in CapCut → add text/music
- Use cases: workout videos, "get ready with me", skincare, "day in the life"
- Best models: Clink 2.6, Clink 01, Sora, VO 3.1

**Talking Head Videos**:
- Generate voice with 11 Labs → lip-sync with Clink Avatars 2.0
- 10-second limit per clip (need to combine for longer videos)
- Use cases: stories, controversial topics, daily updates
- Alternative models: One Infinite Talk, One 2.5 Speak (inconsistent)

### 2. Critical Quality Principles

**"Garbage In, Garbage Out"**:
- All videos are image-based
- Input image quality = output video quality
- Must emphasize high-quality base images in our workflow

**Quality Control is Essential**:
- Never post fake-looking videos - can destroy influencer reputation
- Better to post no video than a bad video
- Need preview/validation system before allowing users to post

**Iteration is Required**:
- Expect to generate 4 videos to get 1 good one
- Always edit in post (CapCut) to remove weird movements, add overlays/transitions
- Users need to understand this is not "one-click" generation

### 3. Model & Provider Recommendations

**Best Models**:
- **Clink 2.6 Motion Control**: Dancing videos
- **Clink 2.6 / Clink 01**: Image-to-video
- **Sora**: Image-to-video
- **VO 3.1**: Image-to-video
- **Clink Avatars 2.0**: Talking head/lip-sync (best)

**Provider Recommendation**:
- **Wave Speed AI**: Best prices, good speed (recommended)
- **Hicksfield**: Avoid (described as "scam with credits")
- **Full AAI**: Avoid (too slow)

**Voice Generation**:
- **11 Labs**: Voice generation for talking videos

### 4. Content Strategy > Technical Quality

**Key Insight**: Controversial/emotional content gets more views than perfect technical quality

**Examples**:
- Transformation videos (fat to skinny) with controversial commentary
- Emotional/controversial topics drive engagement
- Basic dancing video with perfect quality = no views
- Controversial content with lower quality = high views (if it summons emotions)

**Implication**: Need to educate users on content strategy, not just technical quality

### 5. Technical Implementation Requirements

**Video Generation Pipeline**:
- Support three distinct workflows (dancing, image-to-video, talking head)
- Batch generation: Generate 4 videos, let user pick best one
- Preview/validation system before posting

**Model Integration**:
- Clink 2.6 Motion Control API
- Clink 2.6 / Clink 01 image-to-video
- Sora image-to-video
- VO 3.1 image-to-video
- Clink Avatars 2.0 lip-sync
- 11 Labs voice generation

**Provider Integration**:
- Wave Speed AI as primary provider
- Cost optimization considerations

**Video Editing**:
- Basic editing capabilities (trim, combine, add text/music)
- Or integration with CapCut API
- Remove weird movements, add overlays/transitions

### 6. User Experience Considerations

**Workflow Guidance**:
- Step-by-step wizards for each video type
- Clear expectations about iteration (4 videos → 1 good one)
- Quality warnings before posting

**Content Templates**:
- Pre-built templates for common formats:
  - "Get ready with me"
  - "Day in the life"
  - Workout videos
  - Skincare routines

**Quality Standards**:
- Enforce minimum quality thresholds
- Preview system to catch fake-looking videos
- Protect influencer reputation

## Action Items

### Technical Implementation

- [ ] Research Wave Speed AI API for video generation
- [ ] Research Clink 2.6 Motion Control API integration
- [ ] Research Clink Avatars 2.0 API for lip-sync
- [ ] Research 11 Labs API for voice generation
- [ ] Design batch generation workflow (4 videos → pick best)
- [ ] Design preview/validation system for video quality
- [ ] Evaluate CapCut API or alternative editing solutions

### Feature Planning

- [ ] **EP-005 ST-XXX**: Dancing video generation with Clink Motion Control
  - Upload character image + reference video → generate dancing video
- [ ] **EP-005 ST-XXX**: Image-to-video studio with batch generation
  - Generate multiple clips → combine → edit → add text/music
- [ ] **EP-005 ST-XXX**: Talking head video generation
  - Voice generation (11 Labs) + lip-sync (Clink Avatars 2.0)
- [ ] **EP-005 ST-XXX**: Video quality validation and preview
  - Preview system, quality checks, warnings before posting
- [ ] **EP-005 ST-XXX**: Content templates for viral formats
  - Pre-built templates for common video types

### User Education

- [ ] Create content strategy guide (controversial/emotional content)
- [ ] Document iteration expectations (4 videos → 1 good one)
- [ ] Emphasize input image quality importance
- [ ] Quality control best practices

### Business Logic

- [ ] Cost analysis: Wave Speed AI pricing for video generation
- [ ] Quality standards: Minimum thresholds for posting
- [ ] Content strategy: Educate users on viral content principles

## Metrics Impact

| Metric | Potential Impact | Notes |
|--------|------------------|-------|
| **Activation** | +High | Video generation is high-value feature that drives signups |
| **Retention** | +High | Video content increases engagement and content variety |
| **Core Value** | +High | Video generation is core differentiator for AI influencers |
| **Conversion** | +Medium | Premium feature for paid tiers |
| **CAC** | Neutral | Feature adds value but doesn't directly reduce acquisition cost |

## Process Improvements

- [ ] Add video generation workflows to heuristics.md
- [ ] Update EP-005 (Content Studio) requirements with video features
- [ ] Document model/provider recommendations in technical specs
- [ ] Share learnings in #mvp-ryla-learnings

## Next Steps

1. **Research Phase**: Deep dive into Wave Speed AI, Clink APIs, 11 Labs integration
2. **Architecture Phase**: Design video generation pipeline architecture
3. **Feature Planning**: Break down video features into stories/tasks
4. **Provider Evaluation**: Test Wave Speed AI vs. alternatives
5. **Prototype**: Build MVP of one video type (likely image-to-video studio)

---

## Heuristics to Add

```
LEARNING area=video-generation source=youtube-664uByVYBk8 text="Input image quality determines video quality - garbage in, garbage out"
LEARNING area=video-generation source=youtube-664uByVYBk8 text="Expect 4 video generations to get 1 good one - iteration is required"
LEARNING area=video-generation source=youtube-664uByVYBk8 text="Content strategy (controversial/emotional) > technical quality for views"
LEARNING area=video-generation source=youtube-664uByVYBk8 text="Never post fake-looking videos - can destroy influencer reputation"
LEARNING area=video-generation source=youtube-664uByVYBk8 text="Wave Speed AI recommended provider for video generation (best prices)"
LEARNING area=video-generation source=youtube-664uByVYBk8 text="Clink Avatars 2.0 best model for talking head/lip-sync videos"
LEARNING area=video-generation source=youtube-664uByVYBk8 text="Three video types: dancing (Clink Motion Control), image-to-video edited (most versatile), talking head (11 Labs + lip-sync)"
```

