# Funnel Steps Reference

> Complete reference for all 36 funnel steps with form fields, validation, and analytics events.

## Steps Overview

| # | Name | Type | Form Field | Validation |
|---|------|------|------------|------------|
| 0 | Choose Creation Method | info | - | - |
| 1 | Partnership Proof | social-proof | - | - |
| 2 | AI Influencer Experience | input | `ai_influencer_experience` | Required |
| 3 | Use Case | input | `use_cases` | Min 1 |
| 4 | Choose Ethnicity | input | `influencer_ethnicity` | Required |
| 5 | Hyper Realistic Skin | info | - | - |
| 6 | Choose Age | input | `influencer_age` | 18-50 |
| 7 | Choose Skin Color | input | `influencer_skin_color` | Required |
| 8 | Social Proof | social-proof | - | - |
| 9 | Choose Eye Color | input | `influencer_eye_color` | Required |
| 10 | Hair Style & Color | input | `influencer_hair_style`, `influencer_hair_color` | Both required |
| 11 | Face Shape | input | `influencer_face_shape` | Required |
| 12 | Character Consistency Video | info | - | - |
| 13 | Freckles | input | `influencer_freckles` | Required |
| 14 | Scars | input | `influencer_scars` | Required |
| 15 | Beauty Marks | input | `influencer_beauty_marks` | Required |
| 16 | Perfect Hands | info | - | - |
| 17 | Body Type | input | `influencer_body_type` | Required |
| 18 | Ass Size | input | `influencer_ass_size` | Required |
| 19 | Breast Type | input | `influencer_breast_type` | Required |
| 20 | Customize Outfit | info | - | - |
| 21 | Choose Outfit | input | `influencer_outfit` | Optional |
| 22 | Piercings | input | `influencer_piercings` | Required |
| 23 | Tattoos | input | `influencer_tattoos` | Required |
| 24 | Voice | input | `influencer_voice` | Required |
| 25 | Video Content Intro | info | - | - |
| 26 | Video Content Options | input | `video_content_options` | Optional |
| 27 | NSFW Content | input | `enable_nsfw` | Required |
| 28 | NSFW Content Preview | info | - | - |
| 29 | Lipsync Feature | info | - | - |
| 30 | Character Generation | loader | - | - |
| 31 | Access Influencer | info | - | - |
| 32 | Feature Summary | info | - | - |
| 33 | Subscription | payment | - | - |
| 34 | Payment | payment | `email` | Valid email |
| 35 | All Spots Reserved | info | - | - |

---

## Phase 1: Entry & Engagement (Steps 0-4)

### Step 0: Choose Creation Method
- **Purpose**: Entry point with CTA
- **Options**: "Upload Own Image" or "Create AI Influencer"
- **Component**: `ChooseCreationMethodStep`

### Step 1: Partnership Proof
- **Purpose**: Build trust
- **Content**: Show brand partnerships
- **Component**: `PartnershipProofStep`

### Step 2: AI Influencer Experience
- **Purpose**: Segment users by experience
- **Form Field**: `ai_influencer_experience`
- **Options**:
  - `never_created` - Never created before
  - `recently_launched` - Recently launched
  - `multiple_running` - Multiple running
- **Component**: `AIInfluencerExperienceStep`

### Step 3: Use Case
- **Purpose**: Understand user intent
- **Form Field**: `use_cases` (array)
- **Options**:
  - `ai_onlyfans` - AI OnlyFans
  - `ai_ugc` - AI UGC
  - `ai_courses` - AI Courses
  - `ai_influencer` - AI Influencer
  - `not_sure_yet` - Not Sure Yet
- **Validation**: At least 1 selection required
- **Component**: `UseCaseStep`

### Step 4: Choose Ethnicity
- **Purpose**: Base appearance selection
- **Form Field**: `influencer_ethnicity`
- **Options**:
  - `caucasian`
  - `latina`
  - `asian`
  - `black`
  - `arab`
  - `mixed`
- **Note**: Affects available options in subsequent steps
- **Component**: `InfluencerEthnicityStep`

---

## Phase 2: Basic Appearance (Steps 5-16)

### Step 5: Hyper Realistic Skin (Info)
- **Purpose**: Show quality comparison
- **Content**: AI skin vs real skin comparison
- **Component**: `HyperRealisticSkinStep`

### Step 6: Choose Age
- **Form Field**: `influencer_age`
- **Validation**: Number between 18-50
- **Component**: `InfluencerAgeStep`

### Step 7: Choose Skin Color
- **Form Field**: `influencer_skin_color`
- **Options** (varies by ethnicity):
  - `light`
  - `medium`
  - `tan`
  - `dark`
- **Component**: `InfluencerSkinColorStep`

### Step 8: Social Proof
- **Purpose**: Build trust mid-funnel
- **Content**: User testimonials/reviews
- **Component**: `InfluencerSocialProofStep`

### Step 9: Choose Eye Color
- **Form Field**: `influencer_eye_color`
- **Options** (varies by ethnicity):
  - `blue`
  - `green`
  - `brown`
  - `grey`
- **Component**: `InfluencerEyeColorStep`

### Step 10: Hair Style & Color
- **Form Fields**: `influencer_hair_style`, `influencer_hair_color`
- **Hair Styles**:
  - `bun`
  - `long`
  - `short`
  - `curly-long`
  - `hair-bow`
  - `braids`
- **Hair Colors** (varies by ethnicity):
  - `blonde`
  - `ginger`
  - `brunette`
  - `black`
- **Component**: `InfluencerHairStyleStep`

### Step 11: Face Shape
- **Form Field**: `influencer_face_shape`
- **Options**:
  - `oval`
  - `round`
  - `square`
  - `heart`
  - `diamond`
- **Component**: `InfluencerFaceShapeStep`

### Step 12: Character Consistency Video (Info)
- **Purpose**: Demonstrate consistency feature
- **Content**: Video showing same character in different scenes
- **Component**: `CharacterConsistencyVideoStep`

### Steps 13-15: Skin Details
| Step | Field | Options |
|------|-------|---------|
| 13 | `influencer_freckles` | none, subtle, prominent |
| 14 | `influencer_scars` | none, subtle, prominent |
| 15 | `influencer_beauty_marks` | none, subtle, prominent |

### Step 16: Perfect Hands (Info)
- **Purpose**: Address common AI weakness
- **Content**: Zoomed in hand quality demonstration
- **Component**: `PerfectHandsStep`

---

## Phase 3: Body & Style (Steps 17-24)

### Step 17: Body Type
- **Form Field**: `influencer_body_type`
- **Options**:
  - `athletic`
  - `petite`
  - `thick`
  - `muscular`
- **Component**: `InfluencerBodyTypeStep`

### Step 18: Ass Size
- **Form Field**: `influencer_ass_size`
- **Component**: `InfluencerAssSizeStep`

### Step 19: Breast Type
- **Form Field**: `influencer_breast_type`
- **Component**: `InfluencerBreastTypeStep`

### Step 20: Customize Outfit (Info)
- **Purpose**: Introduce outfit customization feature
- **Component**: `CustomizeOutfitStep`

### Step 21: Choose Outfit
- **Form Field**: `influencer_outfit` (optional)
- **Options**:
  - `summer_chic`
  - `date_night_glam`
  - `y2k_revival`
  - `casual_streetwear`
  - `athleisure_set`
  - `casual_denim`
- **Component**: `ChooseOutfitStep`

### Step 22: Piercings
- **Form Field**: `influencer_piercings`
- **Component**: `InfluencerPiercingsStep`

### Step 23: Tattoos
- **Form Field**: `influencer_tattoos`
- **Component**: `InfluencerTattoosStep`

### Step 24: Voice
- **Form Field**: `influencer_voice`
- **Note**: Can be changed later
- **Component**: `InfluencerVoiceStep`

---

## Phase 4: Content Options (Steps 25-29)

### Step 25: Video Content Intro (Info)
- **Purpose**: Introduce video capabilities
- **Component**: `VideoContentIntroStep`

### Step 26: Video Content Options
- **Form Field**: `video_content_options` (array, optional)
- **Options**:
  - Selfie videos
  - Dance videos
  - Driving car
  - Custom
- **Component**: `VideoContentOptionsStep`

### Step 27: NSFW Content
- **Form Field**: `enable_nsfw` (boolean)
- **Validation**: Required choice
- **Note**: Controls conditional flow to step 28
- **Component**: `NSFWContentStep`

### Step 28: NSFW Content Preview (Info)
- **Purpose**: Preview NSFW capabilities
- **Condition**: Only shown if `enable_nsfw === true`
- **Component**: `NSFWContentPreviewStep`

### Step 29: Lipsync Feature (Info)
- **Purpose**: Highlight lipsync capability
- **Component**: `LipsyncFeatureStep`

---

## Phase 5: Generation & Payment (Steps 30-35)

### Step 30: Character Generation (Loader)
- **Purpose**: Generate character preview
- **Duration**: ~5-30 seconds
- **Component**: `CharacterGenerationStep`

### Step 31: Access Influencer (Info)
- **Purpose**: Show generated character
- **CTA**: "Access your AI Influencer"
- **Component**: `AccessInfluencerStep`

### Step 32: Feature Summary (Info)
- **Purpose**: Value recap before payment
- **Content**: All features user will get
- **Component**: `FeatureSummaryStep`

### Step 33: Subscription
- **Purpose**: Plan selection
- **Pricing**: $29.00/month
- **Component**: `InfluencerSubscriptionStep`

### Step 34: Payment
- **Form Field**: `email`
- **Validation**: Valid email required
- **Integration**: Finby/Shift4
- **Component**: `PaymentFormStep`

### Step 35: All Spots Reserved
- **Purpose**: Scarcity/urgency fallback
- **Component**: `AllSpotsReservedStep`

---

## Form Schema

```typescript
const funnelV3Schema = z.object({
    // Basic Attributes
    influencer_type: z.string().min(1),
    influencer_age: z.coerce.number().min(18).max(50),
    influencer_ethnicity: z.string().min(1),
    influencer_skin_color: z.string().min(1),
    influencer_eye_color: z.string().min(1),
    influencer_hair_style: z.string().min(1),
    influencer_hair_color: z.string().min(1),
    influencer_face_shape: z.string().min(1),
    influencer_body_type: z.string().min(1),
    influencer_outfit: z.string().optional(),
    influencer_voice: z.string().min(1),

    // Advanced Customization
    influencer_ass_size: z.string().min(1),
    influencer_breast_type: z.string().min(1),

    // Skin Features
    influencer_freckles: z.string().min(1),
    influencer_scars: z.string().min(1),
    influencer_beauty_marks: z.string().min(1),

    // Body Modifications
    influencer_tattoos: z.string().min(1),
    influencer_piercings: z.string().min(1),

    // Video Content Options
    video_content_options: z.array(z.string()).optional(),
    enable_selfies: z.boolean(),
    enable_viral_videos: z.boolean(),
    enable_lipsync: z.boolean(),
    enable_faceswap: z.boolean(),

    // NSFW Content
    enable_nsfw: z.boolean(),

    // Creation Method
    creation_method: z.string().min(1),

    // Payment
    email: z.string().email().min(1),
    productId: z.number().nullable(),

    // Experience & Use Cases
    ai_influencer_experience: z.string().min(1),
    use_cases: z.array(z.string()).min(1),
});
```

---

## Ethnicity-Based Option Filtering

Certain options are filtered based on the selected ethnicity:

| Ethnicity | Skin Colors | Eye Colors | Hair Colors |
|-----------|-------------|------------|-------------|
| Caucasian | light, medium, tan | blue, green, grey, brown | blonde, ginger, brunette, black |
| Latina | light, medium, tan, dark | brown, green, grey, blue | black, brunette, blonde |
| Asian | light, medium, tan | brown, grey | black, brunette |
| Black | medium, tan, dark | brown, green, grey | black |
| Arab | light, medium, tan | brown, green, grey | black, brunette |
| Mixed | light, medium, tan, dark | brown, blue, green, grey | black, blonde, ginger, brunette |

