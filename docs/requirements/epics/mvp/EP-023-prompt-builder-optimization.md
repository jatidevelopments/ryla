# [EPIC] EP-023: Prompt Builder Optimization

## Overview

The Prompt Builder is the core engine that transforms user selections (character, scene, outfit, pose) into AI model prompts. This epic focuses on optimizing prompt generation to produce higher-quality, more realistic images.

> ⚠️ **Scope**: This epic enhances the existing prompt system in `libs/business/src/prompts/`. It does not change the Content Studio UI (EP-005) but improves the prompts it generates.
>
> **Research Basis**: Based on extensive research from AI influencer courses, YouTube tutorials, and industry best practices documented in `docs/research/`.

---

## Terminology

| Term | Definition |
|------|------------|
| **Prompt Builder** | The fluent API class that constructs prompts from components |
| **Character DNA** | Physical description of the AI influencer (age, hair, eyes, skin, etc.) |
| **Realism Modifiers** | Keywords that make AI images look more authentic/less "AI" |
| **Negative Prompt** | Words that tell the AI what to avoid generating |
| **Token Ordering** | The sequence of words in a prompt (AI prioritizes earlier tokens) |
| **Style Preset** | Pre-configured combination of modifiers for specific aesthetics |

---

## Business Impact

**Target Metric**: C - Core Value

**Hypothesis**: When prompts are optimized for realism and consistency, generated images will look more authentic, leading to higher user satisfaction, more generations, and better retention.

**Success Criteria**:
- User-rated image quality: **>4.0/5** (via feedback)
- "Looks realistic" rate: **>80%** (user perception)
- Image regeneration rate: **<20%** (users satisfied with first results)
- Face consistency score: **>90%** (same character across generations)
- Generation-to-save ratio: **>70%** (users keep most generated images)

---

## Problem Statement

### Current Issues (From Research)

1. **Generic Quality Modifiers**: Using "8k quality, masterpiece" produces AI-looking images
2. **Wrong Token Ordering**: Important elements not prioritized first
3. **Missing Realism Keywords**: Lack of "amateur photo", "natural skin texture"
4. **Incomplete Negative Prompts**: Missing "plastic skin", "airbrushed", "uncanny valley"
5. **No Model-Specific Optimization**: Same prompts for all models
6. **Static Templates**: No context-aware prompt enhancement

### Key Insights (From Research)

> *"Prompt = 50% of image quality"* - Filip AI Influencer Expert

> *"Garbage in, garbage out"* - Multiple sources

> *"Use 'amateur photo camera style' NOT 'iPhone' (adds phone in image)"* - AI Influencer Course

---

## Features

### F1: Realism Modifiers Library

New category of modifiers optimized for realistic output:

| Category | Modifiers |
|----------|-----------|
| **Smartphone** | "amateur photo camera style", "candid selfie aesthetic", "natural smartphone photography", "authentic moment captured" |
| **Skin Texture** | "natural skin texture with pores", "subtle skin imperfections", "authentic skin blemishes", "realistic skin lighting" |
| **Photography** | "shallow depth of field", "slight motion blur", "natural lens distortion", "soft focus background" |
| **Anti-AI** | "raw unedited look", "not airbrushed", "natural imperfections", "authentic lighting" |

### F2: Enhanced Negative Prompts

Model-specific negative prompt categories:

| Category | Negative Terms |
|----------|----------------|
| **AI Artifacts** | "airbrushed skin", "plastic texture", "waxy appearance", "perfect symmetry", "uncanny valley", "oversaturated colors", "stock photo look" |
| **Flux-Specific** | "cartoon", "illustration", "CGI", "render", "3D", "anime", "painted", "digital art" |
| **Face Issues** | "asymmetric eyes", "misaligned pupils", "unnatural smile", "wrong proportions", "smooth mannequin face" |
| **Skin Issues** | "plastic skin", "porcelain doll", "waxy texture", "airbrushed perfection", "unnaturally smooth" |

### F3: Token Ordering Optimization

Restructure all templates to prioritize important elements:

**Current Order**:
```
"Close-up selfie of {{character}}, natural makeup, amateur photography..."
```

**Optimized Order**:
```
"{{character}}, close-up selfie, {{expression}}, {{lighting}}, amateur photo camera style..."
```

**Priority Rules**:
1. Subject (character) - FIRST
2. Shot type/framing
3. Key action/expression
4. Lighting condition
5. Style modifiers
6. Quality enhancers

### F4: Style Presets

One-click preset configurations:

| Preset | Description | Key Modifiers |
|--------|-------------|---------------|
| **Ultra Realistic** | Maximum realism, smartphone aesthetic | "amateur photo camera style", "natural skin texture", "candid moment", "raw unedited" |
| **Instagram Ready** | Polished but authentic look | "Instagram aesthetic", "lifestyle photography", "natural lighting", "authentic moment" |
| **Editorial Fashion** | Magazine-quality dramatic | "fashion editorial", "dramatic lighting", "high fashion", "magazine quality" |
| **Casual Selfie** | Everyday selfie vibe | "selfie aesthetic", "natural expression", "casual moment", "smartphone quality" |
| **Professional Portrait** | Headshot quality | "professional headshot", "studio lighting", "confident pose", "corporate style" |

### F5: Context-Aware Prompt Enhancement

Scene-specific automatic additions:

| Scene | Auto-Added | Auto-Avoided |
|-------|------------|--------------|
| **Indoor Café** | "warm ambient lighting", "coffee shop atmosphere", "cozy environment" | "harsh lighting", "empty space" |
| **Beach** | "ocean breeze in hair", "golden hour glow", "sand texture visible" | "crowded beach", "harsh shadows" |
| **Gym** | "motivated expression", "athletic pose", "gym equipment context" | "lazy posture", "casual clothing" |
| **Home Bedroom** | "soft natural lighting", "intimate cozy atmosphere", "comfortable setting" | "sterile look", "harsh flash" |

### F6: Expression-Pose Coherence Validation

Ensure expressions match poses logically:

| Expression | Compatible Poses | Avoid With |
|------------|------------------|------------|
| **Laughing** | Dancing, playing, casual | Mysterious, intense, dramatic |
| **Mysterious** | Leaning, contemplative, side profile | Jumping, exercising, playing |
| **Confident** | Standing power, walking, professional | Lounging, shy poses |
| **Relaxed** | Sitting, lounging, lying | Running, intense workout |

### F7: Prompt Quality Scoring

Pre-generation quality check:

```typescript
interface PromptQualityScore {
  overall: number;          // 0-100
  specificity: number;      // Detail level
  realismPotential: number; // Likely to look real
  consistency: number;      // Character will be recognizable
  suggestions: string[];    // Improvement tips
}
```

**Scoring Factors**:
- Contains realism keywords: +20
- Proper token ordering: +15
- Enhanced negative prompt: +15
- Scene-context additions: +10
- Expression-pose coherence: +10
- Model-specific optimization: +10
- Quality modifiers present: +10
- No conflicting terms: +10

### F8: Model-Specific Prompt Formats

Optimize prompts per model:

| Model | Optimization |
|-------|--------------|
| **Flux Dev** | Natural language, descriptive, 150-200 tokens optimal |
| **Z-Image-Turbo** | Concise, action-oriented, 80-120 tokens optimal |
| **SDXL** | Keyword-heavy, weighted syntax, parentheses for emphasis |

### F9: AI-Assisted Prompt Enhancement (Phase 2)

LLM integration for prompt improvement:

- Input: Basic user prompt + character DNA
- Output: Enhanced, detailed, optimized prompt
- Method: Gemini/GPT API call with prompt engineering template
- Caching: Cache enhanced prompts for repeated scenarios

### F10: Prompt Learning System (Phase 3)

Track and learn from successful generations:

- Log prompts + user satisfaction ratings
- Identify high-performing prompt patterns
- Surface suggestions based on similar successful prompts
- A/B test prompt variations

---

## Acceptance Criteria

### AC-1: Realism Modifiers

- [ ] New `realismModifiers` category added to `categories.ts`
- [ ] At least 4 subcategories: smartphone, skin, photography, anti-ai
- [ ] `withStylePreset('ultraRealistic')` applies realism modifiers
- [ ] Realism modifiers produce visibly more realistic images

### AC-2: Enhanced Negative Prompts

- [ ] New negative prompt categories added: aiArtifacts, flux, faceIssues, skinIssues
- [ ] `buildNegativePrompt()` accepts model type parameter
- [ ] Model-specific negatives auto-applied based on workflow
- [ ] Negative prompts reduce AI artifacts in generated images

### AC-3: Token Ordering

- [ ] All templates reordered with subject first
- [ ] Template structure documented
- [ ] Character DNA appears before scene/lighting
- [ ] Action/expression prioritized before style modifiers

### AC-4: Style Presets

- [ ] At least 5 style presets available
- [ ] `withStylePreset()` method supports all presets
- [ ] Each preset has documented use case
- [ ] Presets produce distinct visual styles

### AC-5: Context-Aware Enhancement

- [ ] Scene-specific additions auto-applied
- [ ] Environment influences prompt automatically
- [ ] Conflicting terms auto-removed
- [ ] Context additions are subtle, not overwhelming

### AC-6: Coherence Validation

- [ ] Expression-pose combinations validated
- [ ] Warning returned for incompatible combinations
- [ ] Suggestions provided for better combinations
- [ ] Validation can be bypassed if user insists

### AC-7: Quality Scoring

- [ ] `scorePrompt()` function returns quality metrics
- [ ] Scores 0-100 with breakdown by category
- [ ] Suggestions array provides improvement tips
- [ ] UI can display score before generation

### AC-8: Model-Specific Optimization

- [ ] Prompt format varies by target model
- [ ] Token count optimized per model
- [ ] Model-specific keywords applied
- [ ] Workflow selection influences prompt structure

---

## Analytics Events

| Event | Trigger | Properties |
|-------|---------|------------|
| `prompt_style_preset_applied` | User applies preset | `preset`, `influencer_id` |
| `prompt_realism_mode_enabled` | Ultra-realistic mode used | `influencer_id`, `scene` |
| `prompt_quality_score_calculated` | Score shown to user | `score`, `suggestions_count` |
| `prompt_coherence_warning_shown` | Expression-pose conflict | `expression`, `pose` |
| `prompt_enhanced` | AI enhancement applied | `original_length`, `enhanced_length` |
| `image_quality_feedback` | User rates image | `rating`, `prompt_hash` |

### Key Metrics

1. **Prompt Quality Score Distribution**: Average scores across generations
2. **Preset Usage Rate**: Which presets are most popular
3. **Coherence Warning Rate**: How often conflicts occur
4. **Regeneration Rate**: Drops indicate better prompts
5. **User Satisfaction**: Ratings on generated images

---

## User Stories

### ST-100: Apply Realism Style Preset

**As a** user generating content  
**I want to** apply an "Ultra Realistic" style preset  
**So that** my images look more authentic and less AI-generated

**AC**: AC-1, AC-4

### ST-101: See Prompt Quality Score

**As a** user before generating  
**I want to** see a quality score and suggestions  
**So that** I can improve my settings before using credits

**AC**: AC-7

### ST-102: Receive Coherence Warnings

**As a** user selecting expressions and poses  
**I want to** be warned about incompatible combinations  
**So that** I avoid generating awkward images

**AC**: AC-6

### ST-103: Automatic Scene Context

**As a** user selecting a beach scene  
**I want to** have beach-appropriate prompt additions auto-applied  
**So that** the image has correct atmosphere without manual prompting

**AC**: AC-5

### ST-104: Model-Optimized Prompts

**As a** user generating with different models  
**I want to** have prompts automatically optimized for each model  
**So that** I get the best results regardless of model choice

**AC**: AC-8

---

## Technical Architecture

### File Structure

```
libs/business/src/prompts/
├── builder.ts              # PromptBuilder class (MODIFY)
├── categories.ts           # Scene/outfit/lighting options (MODIFY)
├── realism-modifiers.ts    # NEW: Realism keywords
├── negative-prompts.ts     # NEW: Enhanced negative prompts
├── style-presets.ts        # NEW: One-click presets
├── context-enhancer.ts     # NEW: Scene-aware additions
├── coherence-validator.ts  # NEW: Expression-pose validation
├── quality-scorer.ts       # NEW: Prompt scoring
├── model-optimizer.ts      # NEW: Model-specific formatting
├── character-dna.ts        # Character DNA conversion (MINOR MODIFY)
├── templates.ts            # Prompt templates (MODIFY - reorder)
├── profile-picture-sets.ts # Profile sets (MINOR MODIFY)
├── types.ts                # Type definitions (MODIFY)
└── index.ts                # Exports (MODIFY)
```

### PromptBuilder Changes

```typescript
// Enhanced PromptBuilder API
const prompt = new PromptBuilder()
  .withCharacter(characterDNA)
  .withTemplate('portrait-selfie-casual')
  .withScene('indoor.cafe')
  .withOutfit('casual.sundress')
  .withLighting('natural.goldenHour')
  .withExpression('positive.smile')
  .withPose('sitting.relaxed')
  // NEW METHODS:
  .withStylePreset('ultraRealistic')      // F4: Style presets
  .withRealismMode(true)                   // F1: Realism modifiers
  .forModel('flux-dev')                    // F8: Model optimization
  .validate()                              // F6: Coherence check
  .build();

// Returns enhanced result
interface BuiltPrompt {
  prompt: string;
  negativePrompt: string;
  recommended: {
    workflow: string;
    aspectRatio: string;
  };
  // NEW:
  qualityScore: PromptQualityScore;
  warnings: CoherenceWarning[];
  appliedEnhancements: string[];
}
```

### Data Flow

```
1. User selects generation options in UI
2. StudioGenerationService builds prompt config
3. PromptBuilder.build() called with config
4. Builder applies:
   a. Character DNA → prompt segment
   b. Template with placeholders
   c. Style preset modifiers
   d. Realism modifiers (if enabled)
   e. Context enhancements (scene-aware)
   f. Token reordering
   g. Model-specific optimization
   h. Coherence validation
   i. Quality scoring
5. Returns BuiltPrompt with warnings/score
6. UI shows score/warnings (optional)
7. Prompt sent to image generation service
```

---

## Implementation Phases

### Phase 1: Foundation (Quick Wins) — 3-5 days

**Stories**: ST-100 (partial)

| Task | Description | Effort |
|------|-------------|--------|
| TSK-100 | Add `realismModifiers` to categories.ts | 2h |
| TSK-101 | Add enhanced negative prompts (aiArtifacts, flux) | 2h |
| TSK-102 | Reorder all templates (subject first) | 4h |
| TSK-103 | Update `dnaToPromptSegment()` for better ordering | 2h |
| TSK-104 | Add `withRealismMode()` to PromptBuilder | 2h |
| TSK-105 | Unit tests for new modifiers | 2h |
| TSK-106 | Integration test with image generation | 2h |

**Deliverables**:
- Realism modifiers available
- Enhanced negative prompts
- Reordered templates
- Basic realism mode toggle

### Phase 2: Presets & Context — 4-6 days

**Stories**: ST-100, ST-103

| Task | Description | Effort |
|------|-------------|--------|
| TSK-110 | Create `style-presets.ts` with 5 presets | 3h |
| TSK-111 | Add `withStylePreset()` to PromptBuilder | 2h |
| TSK-112 | Create `context-enhancer.ts` | 4h |
| TSK-113 | Implement scene-aware auto-additions | 4h |
| TSK-114 | Update all scene options with context | 4h |
| TSK-115 | Unit tests for presets and context | 3h |
| TSK-116 | Visual testing (generate sample images) | 4h |

**Deliverables**:
- 5 style presets working
- Context-aware scene enhancements
- Automatic prompt enrichment

### Phase 3: Validation & Scoring — 3-4 days

**Stories**: ST-101, ST-102

| Task | Description | Effort |
|------|-------------|--------|
| TSK-120 | Create `coherence-validator.ts` | 4h |
| TSK-121 | Define expression-pose compatibility matrix | 2h |
| TSK-122 | Add `.validate()` method to PromptBuilder | 2h |
| TSK-123 | Create `quality-scorer.ts` | 4h |
| TSK-124 | Define scoring rules and weights | 2h |
| TSK-125 | Return score/warnings in BuiltPrompt | 2h |
| TSK-126 | Unit tests for validation/scoring | 3h |

**Deliverables**:
- Coherence validation with warnings
- Quality scoring with suggestions
- Enhanced BuiltPrompt return type

### Phase 4: Model Optimization — 2-3 days

**Stories**: ST-104

| Task | Description | Effort |
|------|-------------|--------|
| TSK-130 | Create `model-optimizer.ts` | 3h |
| TSK-131 | Define model-specific formats (Flux, Z-Image, SDXL) | 3h |
| TSK-132 | Add `.forModel()` method to PromptBuilder | 2h |
| TSK-133 | Auto-detect model from workflow selection | 2h |
| TSK-134 | Unit tests for model optimization | 2h |

**Deliverables**:
- Model-specific prompt formatting
- Automatic token count optimization
- Model-aware keyword selection

### Phase 5: UI Integration — 2-3 days

| Task | Description | Effort |
|------|-------------|--------|
| TSK-140 | Add style preset selector to Studio UI | 4h |
| TSK-141 | Show quality score before generation | 3h |
| TSK-142 | Display coherence warnings | 2h |
| TSK-143 | Add realism toggle to advanced options | 2h |
| TSK-144 | Update generation preview | 2h |

**Deliverables**:
- Preset selector in UI
- Quality score display
- Warning indicators
- Realism mode toggle

### Phase 6: AI Enhancement (Future) — 5-7 days

**Stories**: Related to F9

| Task | Description | Effort |
|------|-------------|--------|
| TSK-150 | Integrate Gemini/GPT API for prompt enhancement | 6h |
| TSK-151 | Create enhancement prompt template | 3h |
| TSK-152 | Implement caching for enhanced prompts | 3h |
| TSK-153 | A/B test enhanced vs standard prompts | 4h |
| TSK-154 | Cost monitoring for LLM calls | 2h |

---

## API Changes

### PromptBuilder API (Internal)

```typescript
// NEW methods added to PromptBuilder class
class PromptBuilder {
  // Existing methods...
  
  // NEW: Apply style preset
  withStylePreset(preset: StylePreset): this;
  
  // NEW: Enable realism mode
  withRealismMode(enabled: boolean): this;
  
  // NEW: Target specific model
  forModel(model: 'flux-dev' | 'z-image-turbo' | 'sdxl'): this;
  
  // NEW: Validate before build
  validate(): ValidationResult;
  
  // MODIFIED: Returns enhanced result
  build(): BuiltPrompt;
}

type StylePreset = 
  | 'ultraRealistic'
  | 'instagramReady'
  | 'editorialFashion'
  | 'casualSelfie'
  | 'professionalPortrait';

interface ValidationResult {
  valid: boolean;
  warnings: CoherenceWarning[];
  suggestions: string[];
}

interface CoherenceWarning {
  type: 'expression_pose_conflict' | 'scene_outfit_conflict';
  message: string;
  severity: 'low' | 'medium' | 'high';
}
```

---

## Non-Goals (Phase 2+)

- **Prompt marketplace**: User-shared prompt templates
- **Prompt versioning**: A/B test different prompt strategies
- **Custom modifier creation**: Users define their own modifiers
- **Prompt translation**: Multi-language prompt support
- **Real-time preview**: Show expected output before generation
- **Prompt history**: Track and reuse successful prompts
- **AI prompt chat**: Conversational prompt building

---

## Dependencies

- EP-005: Content Studio (integrates with prompt builder)
- EP-001: AI Influencer (provides character DNA)
- RunPod workflows (target models for optimization)
- `libs/business/src/prompts/` existing codebase

---

## Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Realism modifiers don't improve quality | Medium | High | A/B test before full rollout, visual QA |
| Token reordering breaks existing prompts | Low | Medium | Gradual rollout, keep old templates as fallback |
| Model-specific optimization incorrect | Medium | Medium | Test with each model, gather metrics |
| AI enhancement adds latency | Medium | Low | Cache results, make optional |
| Quality scoring is inaccurate | Medium | Medium | Correlate with user satisfaction, iterate |

---

## Success Metrics

### Phase 1 Success (Week 1-2)

- [ ] Realism mode produces visibly better images
- [ ] AI artifact rate reduced by >30%
- [ ] Template reordering does not break existing flows

### Phase 2 Success (Week 3-4)

- [ ] >50% of generations use style presets
- [ ] Context enhancement improves scene accuracy
- [ ] User satisfaction rating >4.0

### Phase 3 Success (Week 5-6)

- [ ] <10% of generations have coherence warnings
- [ ] Quality score correlates with user satisfaction (r>0.6)
- [ ] Regeneration rate drops by >15%

### Overall Success

- [ ] Image quality rating improves from baseline
- [ ] User retention increases (users generate more)
- [ ] Support tickets about "AI-looking images" decrease

---

## Research References

- `docs/research/ai-influencer-course/Creating_an_AI_Influencer_Character_Guide.md`
- `docs/research/ai-influencer-course/Creating_Consistent_AI_Characters.md`
- `docs/research/AI-INFLUENCER-WORKFLOW-LEARNINGS.md`
- `docs/research/youtube-videos/pQIvxHyuzOE/metadata.md` (Prompt Engineering for Realism)
- `docs/research/youtube-videos/8xke9Cj7rGU/metadata.md` (Why Looks Fake/Plastic)
- `docs/research/youtube-videos/RESEARCH-SUMMARY.md`
- `docs/research/youtube-videos/PAINS-QUICK-REFERENCE.md`

---

## Phase Checklist

- [x] P1: Requirements (this epic)
- [ ] P2: Stories created
- [ ] P3: Architecture design
- [ ] P4: UI skeleton (Phase 5)
- [ ] P5: Tech spec
- [ ] P6: Implementation
- [ ] P7: Testing
- [ ] P8: Integration
- [ ] P9: Deployment
- [ ] P10: Validation

