# Human Description System - Technical Design

**Status**: Proposal  
**Created**: 2026-01-XX  
**Related Initiative**: [IN-002: Character DNA Enhancement System](../initiatives/IN-002-character-dna-enhancement.md)

---

## Executive Summary

This document proposes a comprehensive system for describing human physical characteristics in detail, including data structures, storage architecture, and integration with the existing character system.

**Key Goals:**

- Comprehensive human description taxonomy
- Structured data storage for detailed characteristics
- Backward compatibility with existing CharacterConfig
- Efficient prompt building from detailed DNA

---

## 1. Human Description Taxonomy

### 1.1 Core Identity

| Category  | Fields                                   | Description                      |
| --------- | ---------------------------------------- | -------------------------------- |
| **Basic** | `gender`, `age`, `ageRange`, `ethnicity` | Core identity (already exists)   |
| **Style** | `style` (realistic/anime)                | Rendering style (already exists) |

### 1.2 Facial Features

#### Eyes

- **Shape**: `almond`, `round`, `hooded`, `monolid`, `downturned`, `upturned`, `wide-set`, `close-set`
- **Color**: `brown`, `blue`, `green`, `hazel`, `gray`, `amber`, `heterochromia`
- **Size**: `small`, `medium`, `large`
- **Spacing**: `close-set`, `average`, `wide-set`
- **Eyelashes**: `short`, `medium`, `long`, `thick`, `thin`, `curved`, `straight`
- **Eyebrows**: `shape` (arched, straight, rounded, thick, thin, sparse), `color`, `spacing` (unibrow, separated)

#### Nose

- **Shape**: `straight`, `button`, `aquiline`, `roman`, `snub`, `wide`, `narrow`, `upturned`, `downturned`
- **Size**: `small`, `medium`, `large`
- **Bridge**: `high`, `medium`, `low`, `narrow`, `wide`
- **Nostrils**: `small`, `medium`, `large`, `flared`, `narrow`

#### Mouth & Lips

- **Lip Shape**: `full`, `thin`, `bow-shaped`, `pouty`, `wide`, `narrow`, `asymmetric`
- **Lip Size**: `small`, `medium`, `large`
- **Lip Color**: Natural color (pink, coral, mauve, berry, nude)
- **Cupid's Bow**: `defined`, `subtle`, `flat`
- **Lip Thickness**: `thin`, `medium`, `full`, `very-full`
- **Mouth Width**: `narrow`, `medium`, `wide`

#### Face Structure

- **Face Shape**: `oval`, `round`, `square`, `heart`, `diamond`, `oblong`, `triangle` (already exists)
- **Jawline**: `sharp`, `soft`, `rounded`, `square`, `pointed`, `weak`
- **Cheekbones**: `high`, `medium`, `low`, `prominent`, `subtle`
- **Forehead**: `high`, `medium`, `low`, `wide`, `narrow`
- **Chin**: `pointed`, `round`, `square`, `cleft`, `receding`, `prominent`

#### Skin & Complexion

- **Skin Color**: `light`, `medium`, `tan`, `dark`, `olive` (already exists)
- **Skin Tone**: `cool`, `warm`, `neutral`, `olive`
- **Skin Texture**: `smooth`, `porous`, `oily`, `dry`, `combination`, `matte`, `dewy`
- **Skin Glow**: `matte`, `dewy`, `glowing`, `natural`
- **Freckles**: `none`, `light`, `medium`, `heavy`, `scattered`, `concentrated` (already exists)
- **Moles/Beauty Marks**: `none`, `single`, `multiple`, `location` (already exists as `beautyMarks`)
- **Scars**: `none`, `small`, `medium`, `large`, `location`, `type` (already exists)
- **Acne/Imperfections**: `none`, `minimal`, `moderate`, `severe`

### 1.3 Hair

#### Hair Details (Extends Existing)

- **Style**: `long-straight`, `short`, `braids`, etc. (already exists)
- **Color**: `black`, `brown`, `blonde`, etc. (already exists)
- **Length**: `short`, `medium`, `long`, `very-long`
- **Texture**: `straight`, `wavy`, `curly`, `coily`, `kinky`
- **Volume**: `thin`, `medium`, `thick`, `very-thick`
- **Density**: `sparse`, `medium`, `dense`
- **Hairline**: `straight`, `rounded`, `widow's-peak`, `receding`
- **Part**: `center`, `side`, `no-part`, `zigzag`
- **Highlights**: `none`, `subtle`, `bold`, `color`
- **Hair Accessories**: `none`, `hairband`, `clip`, `headband`, `scarf`

### 1.4 Body Structure

#### Body Type (Extends Existing)

- **Overall**: `slim`, `athletic`, `curvy`, `voluptuous`, `muscular`, `chubby` (already exists)
- **Height**: `petite`, `average`, `tall`, `very-tall`
- **Proportions**: `balanced`, `long-torso`, `short-torso`, `long-legs`, `short-legs`
- **Shoulders**: `narrow`, `medium`, `broad`, `sloping`
- **Waist**: `defined`, `straight`, `curved`, `thick`
- **Hips**: `narrow`, `medium`, `wide`, `curvy`

#### Female-Specific (Extends Existing)

- **Breast Size**: `small`, `medium`, `large`, `very-large` (already exists)
- **Breast Type**: `perky`, `saggy`, `torpedo`, `teardrop`, `round`, `asymmetric` (already exists)
- **Breast Shape**: `round`, `teardrop`, `east-west`, `relaxed`
- **Breast Spacing**: `close-set`, `average`, `wide-set`
- **Nipples**: `small`, `medium`, `large`, `pale`, `dark`, `pierced`

#### Male-Specific

- **Chest**: `flat`, `defined`, `muscular`, `broad`
- **Abs**: `none`, `defined`, `six-pack`, `soft`
- **Shoulders**: `narrow`, `medium`, `broad`, `muscular`

#### Body Modifications (Extends Existing)

- **Tattoos**: Array of detailed objects (see section 2.2)
- **Piercings**: Array of detailed objects (see section 2.2)
- **Scars**: Array of detailed objects (extends existing)

### 1.5 Hands & Feet

#### Hands

- **Size**: `small`, `medium`, `large`
- **Shape**: `slender`, `average`, `broad`, `delicate`, `strong`
- **Finger Length**: `short`, `medium`, `long`
- **Finger Thickness**: `thin`, `medium`, `thick`
- **Nails**: `length` (short, medium, long), `shape` (round, square, almond, stiletto), `color` (natural, painted, color), `style` (natural, manicured, decorated)

#### Feet

- **Size**: `small`, `medium`, `large`
- **Shape**: `narrow`, `medium`, `wide`
- **Toes**: `straight`, `overlapping`, `spread`
- **Nails**: `length`, `shape`, `color`, `style` (similar to hands)

### 1.6 Additional Characteristics

#### Posture & Movement

- **Posture**: `upright`, `slouched`, `confident`, `relaxed`
- **Gait**: `graceful`, `athletic`, `casual`, `confident`

#### Voice (Already Exists)

- **Tone**: `sultry`, `sweet`, `confident`, `soft`, `strong` (already exists)

### 1.7 Identity & Uniqueness DNA

**What makes influencers successful**: Beyond physical appearance, successful influencers have strong, unique identities that make them memorable and relatable. This section captures the DNA of their brand identity.

#### Core Identity (Extends Existing)

- **Archetype**: `girl-next-door`, `fitness-enthusiast`, `luxury-lifestyle`, `mysterious-edgy`, `playful-fun`, `professional-boss` (already exists)
- **Personality Traits**: Array of traits like `confident`, `playful`, `creative`, etc. (already exists)
- **Bio**: Short bio text (already exists)
- **Handle**: @username (already exists)

#### Unique Selling Points (USP)

- **Signature Look**: What they're known for visually (e.g., "always wears red lipstick", "distinctive eyebrow shape")
- **Signature Style**: Their aesthetic signature (e.g., "minimalist aesthetic", "bold color choices")
- **Signature Pose**: Characteristic pose or gesture
- **Catchphrase**: Memorable phrase they use
- **Distinctive Mark**: Unique physical feature that's part of their brand

#### Content Identity

- **Primary Niche**: Main content category (fitness, beauty, lifestyle, travel, etc.)
- **Secondary Niches**: Additional topics they cover
- **Content Style**: `educational`, `entertaining`, `inspirational`, `lifestyle`, `beauty`, `fitness`, `fashion`, `travel`, `food`, `comedy`, `artistic`
- **Posting Frequency**: `daily`, `multiple-daily`, `few-times-week`, `weekly`
- **Content Format**: Photos, videos, stories, reels, carousels

#### Communication Style

- **Tone**: `friendly`, `professional`, `casual`, `sultry`, `energetic`, `calm`, `humorous`, `serious`
- **Language**: `formal`, `casual`, `slang`, `technical`, `poetic`
- **Emoji Usage**: `none`, `minimal`, `moderate`, `heavy`
- **Caption Length**: `short`, `medium`, `long`, `storytelling`
- **Engagement Style**: How they interact with audience
- **Voice**: Tone of voice (already exists)

#### Values & Beliefs

- **Core Values**: What they stand for (authenticity, self-love, sustainability, empowerment, etc.)
- **Causes**: Causes they support (mental-health, environment, body-positivity, etc.)
- **Beliefs**: Personal beliefs (work-life-balance, minimalism, mindfulness, etc.)
- **Turn-offs**: What they don't like or stand against

#### Interests & Lifestyle

- **Hobbies**: Activities they enjoy (yoga, photography, cooking, travel, etc.)
- **Passions**: Deep interests (sustainable-fashion, mental-wellness, art, etc.)
- **Lifestyle**: `minimalist`, `luxury`, `bohemian`, `athletic`, `creative`, `entrepreneurial`, `family-oriented`, `adventurous`
- **Daily Routine**: `morning-person`, `night-owl`, `balanced`, `irregular`
- **Favorite Activities**: Specific activities they love

#### Brand Aesthetic

- **Color Palette**: Visual color preferences (pastels, neutrals, bold-colors, monochrome)
- **Visual Style**: `minimalist`, `maximalist`, `vintage`, `modern`, `bohemian`, `edgy`, `romantic`, `industrial`
- **Photo Style**: `bright`, `moody`, `warm`, `cool`, `high-contrast`, `soft`
- **Editing Style**: `natural`, `filtered`, `highly-edited`, `raw`
- **Location Preference**: `indoor`, `outdoor`, `urban`, `nature`, `studio`, `mixed`

#### Audience Connection

- **Target Audience**: Who they connect with (young-professionals, fitness-enthusiasts, creative-souls, etc.)
- **Connection Depth**: `surface`, `moderate`, `deep`, `intimate`
- **Relatability**: `aspirational`, `relatable`, `authentic`, `curated`
- **Vulnerability**: `private`, `selective-sharing`, `open`, `very-open`
- **Community Building**: Whether they build a community
- **Community Type**: `support-group`, `fan-club`, `learning-community`, `lifestyle-tribe`

#### Success Factors

- **Unique Angle**: What unique perspective they bring
- **Expertise**: Areas of expertise/knowledge
- **Authenticity**: `high`, `medium`, `curated`
- **Consistency**: `very-consistent`, `consistent`, `flexible`
- **Innovation**: `trend-setter`, `trend-follower`, `classic`
- **Memorability**: What makes them memorable

#### Backstory & Origin

- **Origin**: Where they're from (city, region, country)
- **Background**: Their background story
- **Journey**: How they got to where they are
- **Key Moments**: Important life moments that shaped them
- **Aspirations**: What they're working towards

---

## 2. Data Structure Design

### 2.1 Enhanced CharacterConfig

```typescript
/**
 * Enhanced Character Configuration
 * Extends existing CharacterConfig with detailed characteristics
 */
export interface EnhancedCharacterConfig extends CharacterConfig {
  // ============================================
  // FINE-GRAINED FACIAL FEATURES
  // ============================================

  // Eyes (extends existing eyeColor)
  eyes?: {
    shape?:
      | 'almond'
      | 'round'
      | 'hooded'
      | 'monolid'
      | 'downturned'
      | 'upturned'
      | 'wide-set'
      | 'close-set';
    color?: string; // Already exists at top level, keep for compatibility
    size?: 'small' | 'medium' | 'large';
    spacing?: 'close-set' | 'average' | 'wide-set';
    eyelashes?: {
      length?: 'short' | 'medium' | 'long';
      thickness?: 'thin' | 'medium' | 'thick';
      curl?: 'straight' | 'curved';
    };
    eyebrows?: {
      shape?: 'arched' | 'straight' | 'rounded' | 'thick' | 'thin' | 'sparse';
      color?: string;
      spacing?: 'unibrow' | 'separated' | 'average';
    };
  };

  // Nose
  nose?: {
    shape?:
      | 'straight'
      | 'button'
      | 'aquiline'
      | 'roman'
      | 'snub'
      | 'wide'
      | 'narrow'
      | 'upturned'
      | 'downturned';
    size?: 'small' | 'medium' | 'large';
    bridge?: 'high' | 'medium' | 'low' | 'narrow' | 'wide';
    nostrils?: 'small' | 'medium' | 'large' | 'flared' | 'narrow';
  };

  // Mouth & Lips
  lips?: {
    shape?:
      | 'full'
      | 'thin'
      | 'bow-shaped'
      | 'pouty'
      | 'wide'
      | 'narrow'
      | 'asymmetric';
    size?: 'small' | 'medium' | 'large';
    color?: 'pink' | 'coral' | 'mauve' | 'berry' | 'nude' | 'natural';
    cupidsBow?: 'defined' | 'subtle' | 'flat';
    thickness?: 'thin' | 'medium' | 'full' | 'very-full';
    width?: 'narrow' | 'medium' | 'wide';
  };

  // Face Structure (extends existing faceShape)
  faceStructure?: {
    shape?: string; // Already exists at top level
    jawline?: 'sharp' | 'soft' | 'rounded' | 'square' | 'pointed' | 'weak';
    cheekbones?: 'high' | 'medium' | 'low' | 'prominent' | 'subtle';
    forehead?: 'high' | 'medium' | 'low' | 'wide' | 'narrow';
    chin?: 'pointed' | 'round' | 'square' | 'cleft' | 'receding' | 'prominent';
  };

  // Skin & Complexion (extends existing)
  skin?: {
    color?: string; // Already exists at top level
    tone?: 'cool' | 'warm' | 'neutral' | 'olive';
    texture?:
      | 'smooth'
      | 'porous'
      | 'oily'
      | 'dry'
      | 'combination'
      | 'matte'
      | 'dewy';
    glow?: 'matte' | 'dewy' | 'glowing' | 'natural';
    freckles?: string; // Already exists at top level
    beautyMarks?: string; // Already exists at top level
    scars?: string; // Already exists at top level
    imperfections?: 'none' | 'minimal' | 'moderate' | 'severe';
  };

  // ============================================
  // HAIR DETAILS (extends existing)
  // ============================================
  hairDetails?: {
    style?: string; // Already exists at top level
    color?: string; // Already exists at top level
    length?: 'short' | 'medium' | 'long' | 'very-long';
    texture?: 'straight' | 'wavy' | 'curly' | 'coily' | 'kinky';
    volume?: 'thin' | 'medium' | 'thick' | 'very-thick';
    density?: 'sparse' | 'medium' | 'dense';
    hairline?: 'straight' | 'rounded' | 'widows-peak' | 'receding';
    part?: 'center' | 'side' | 'no-part' | 'zigzag';
    highlights?: {
      enabled: boolean;
      intensity?: 'subtle' | 'bold';
      color?: string;
    };
    accessories?: 'none' | 'hairband' | 'clip' | 'headband' | 'scarf';
  };

  // ============================================
  // BODY STRUCTURE (extends existing)
  // ============================================
  bodyStructure?: {
    type?: string; // Already exists at top level
    height?: 'petite' | 'average' | 'tall' | 'very-tall';
    proportions?:
      | 'balanced'
      | 'long-torso'
      | 'short-torso'
      | 'long-legs'
      | 'short-legs';
    shoulders?: 'narrow' | 'medium' | 'broad' | 'sloping';
    waist?: 'defined' | 'straight' | 'curved' | 'thick';
    hips?: 'narrow' | 'medium' | 'wide' | 'curvy';
  };

  // Female-specific (extends existing)
  breasts?: {
    size?: string; // Already exists at top level
    type?: string; // Already exists at top level
    shape?: 'round' | 'teardrop' | 'east-west' | 'relaxed';
    spacing?: 'close-set' | 'average' | 'wide-set';
    nipples?: {
      size?: 'small' | 'medium' | 'large';
      color?: 'pale' | 'medium' | 'dark';
      pierced?: boolean;
    };
  };

  // Male-specific
  maleBody?: {
    chest?: 'flat' | 'defined' | 'muscular' | 'broad';
    abs?: 'none' | 'defined' | 'six-pack' | 'soft';
    shoulders?: 'narrow' | 'medium' | 'broad' | 'muscular';
  };

  // ============================================
  // HANDS & FEET
  // ============================================
  hands?: {
    size?: 'small' | 'medium' | 'large';
    shape?: 'slender' | 'average' | 'broad' | 'delicate' | 'strong';
    fingerLength?: 'short' | 'medium' | 'long';
    fingerThickness?: 'thin' | 'medium' | 'thick';
    nails?: {
      length?: 'short' | 'medium' | 'long';
      shape?: 'round' | 'square' | 'almond' | 'stiletto';
      color?: 'natural' | string; // Natural or specific color
      style?: 'natural' | 'manicured' | 'decorated';
    };
  };

  feet?: {
    size?: 'small' | 'medium' | 'large';
    shape?: 'narrow' | 'medium' | 'wide';
    toes?: 'straight' | 'overlapping' | 'spread';
    nails?: {
      length?: 'short' | 'medium' | 'long';
      shape?: 'round' | 'square' | 'almond';
      color?: 'natural' | string;
      style?: 'natural' | 'manicured' | 'decorated';
    };
  };

  // ============================================
  // DETAILED MODIFICATIONS
  // ============================================

  // Tattoos (replaces simple string)
  tattoos?: TattooDetail[];

  // Piercings (replaces simple string)
  piercings?: PiercingDetail[];

  // Detailed scars (extends existing)
  scars?: ScarDetail[];

  // ============================================
  // ADDITIONAL CHARACTERISTICS
  // ============================================
  posture?: 'upright' | 'slouched' | 'confident' | 'relaxed';
  gait?: 'graceful' | 'athletic' | 'casual' | 'confident';

  // ============================================
  // IDENTITY & UNIQUENESS DNA
  // What makes this influencer successful and unique
  // ============================================
  identity?: IdentityDNA;
}

/**
 * Detailed Tattoo Information
 */
export interface TattooDetail {
  id: string; // Unique ID for this tattoo
  placement: TattooPlacement;
  size: 'small' | 'medium' | 'large' | 'full-sleeve' | 'full-back' | 'full-leg';
  style:
    | 'tribal'
    | 'realistic'
    | 'geometric'
    | 'watercolor'
    | 'minimalist'
    | 'traditional'
    | 'japanese'
    | 'custom';
  design?: string; // Description of design (e.g., "rose with thorns", "geometric mandala")
  color: 'black' | 'color' | 'monochrome' | 'grayscale';
  visibility: 'always-visible' | 'sometimes-visible' | 'hidden';
  age?: 'new' | 'old' | 'faded'; // Age of tattoo
  artist?: string; // Optional: tattoo artist style reference
}

export type TattooPlacement =
  | 'arm-upper'
  | 'arm-lower'
  | 'arm-full'
  | 'back-upper'
  | 'back-lower'
  | 'back-full'
  | 'chest'
  | 'stomach'
  | 'ribs'
  | 'leg-upper'
  | 'leg-lower'
  | 'leg-full'
  | 'neck'
  | 'shoulder'
  | 'wrist'
  | 'ankle'
  | 'hand'
  | 'foot'
  | 'finger';

/**
 * Detailed Piercing Information
 */
export interface PiercingDetail {
  id: string; // Unique ID for this piercing
  location: PiercingLocation;
  type: 'stud' | 'hoop' | 'ring' | 'bar' | 'chain' | 'dangle' | 'captive-bead';
  material?:
    | 'gold'
    | 'silver'
    | 'titanium'
    | 'steel'
    | 'diamond'
    | 'pearl'
    | 'crystal';
  size?: 'small' | 'medium' | 'large';
  count?: number; // Number of piercings in this location (e.g., 3 ear piercings)
  visibility: 'always-visible' | 'sometimes-visible' | 'hidden';
  gauge?: string; // Piercing gauge (e.g., "16g", "14g")
}

export type PiercingLocation =
  | 'ear-lobe'
  | 'ear-helix'
  | 'ear-tragus'
  | 'ear-conch'
  | 'ear-industrial'
  | 'nose-nostril'
  | 'nose-septum'
  | 'nose-bridge'
  | 'lip-center'
  | 'lip-side'
  | 'lip-monroe'
  | 'lip-medusa'
  | 'eyebrow'
  | 'tongue'
  | 'cheek'
  | 'belly-button'
  | 'nipple'
  | 'navel'
  | 'other';

/**
 * Detailed Scar Information
 */
export interface ScarDetail {
  id: string; // Unique ID for this scar
  location: string; // Body location
  size: 'small' | 'medium' | 'large';
  type: 'surgical' | 'trauma' | 'burn' | 'acne' | 'stretch-mark' | 'other';
  visibility: 'always-visible' | 'sometimes-visible' | 'hidden';
  age?: 'new' | 'old' | 'faded';
  description?: string; // Optional description
}

/**
 * Identity & Uniqueness DNA
 * What makes this influencer successful, unique, and memorable
 * This goes beyond physical appearance to capture their brand identity
 */
export interface IdentityDNA {
  // ============================================
  // CORE IDENTITY (extends existing)
  // ============================================
  archetype?: string; // Already exists: 'girl-next-door', 'fitness-enthusiast', etc.
  personalityTraits?: string[]; // Already exists: ['confident', 'playful', 'creative']
  bio?: string; // Already exists: Short bio text
  handle?: string; // Already exists: @username

  // ============================================
  // UNIQUE SELLING POINTS (USP)
  // What makes them stand out
  // ============================================
  uniqueFeatures?: {
    signatureLook?: string; // e.g., "always wears red lipstick", "distinctive eyebrow shape"
    signatureStyle?: string; // e.g., "minimalist aesthetic", "bold color choices"
    signaturePose?: string; // e.g., "hand on hip", "over-shoulder glance"
    catchphrase?: string; // e.g., "Let's glow!", "Stay fierce"
    distinctiveMark?: string; // e.g., "beauty mark above lip", "unique hair color"
  };

  // ============================================
  // CONTENT IDENTITY
  // What they post about, their niche
  // ============================================
  contentTheme?: {
    primaryNiche?: ContentNiche; // Main content category
    secondaryNiches?: ContentNiche[]; // Additional topics
    contentStyle?:
      | 'educational'
      | 'entertaining'
      | 'inspirational'
      | 'lifestyle'
      | 'beauty'
      | 'fitness'
      | 'fashion'
      | 'travel'
      | 'food'
      | 'comedy'
      | 'artistic';
    postingFrequency?: 'daily' | 'multiple-daily' | 'few-times-week' | 'weekly';
    contentFormat?: ('photos' | 'videos' | 'stories' | 'reels' | 'carousels')[];
  };

  // ============================================
  // COMMUNICATION STYLE
  // How they communicate with their audience
  // ============================================
  communicationStyle?: {
    tone?:
      | 'friendly'
      | 'professional'
      | 'casual'
      | 'sultry'
      | 'energetic'
      | 'calm'
      | 'humorous'
      | 'serious';
    language?: 'formal' | 'casual' | 'slang' | 'technical' | 'poetic';
    emojiUsage?: 'none' | 'minimal' | 'moderate' | 'heavy';
    captionLength?: 'short' | 'medium' | 'long' | 'storytelling';
    engagementStyle?:
      | 'responds-to-comments'
      | 'asks-questions'
      | 'shares-stories'
      | 'minimal-interaction';
    voice?: string; // Already exists: 'sultry', 'sweet', 'confident'
  };

  // ============================================
  // VALUES & BELIEFS
  // What they stand for, what matters to them
  // ============================================
  values?: {
    coreValues?: string[]; // e.g., ['authenticity', 'self-love', 'sustainability', 'empowerment']
    causes?: string[]; // e.g., ['mental-health', 'environment', 'body-positivity', 'education']
    beliefs?: string[]; // e.g., ['work-life-balance', 'minimalism', 'mindfulness']
    turnOffs?: string[]; // What they don't like or stand against
  };

  // ============================================
  // INTERESTS & LIFESTYLE
  // What they're passionate about
  // ============================================
  interests?: {
    hobbies?: string[]; // e.g., ['yoga', 'photography', 'cooking', 'travel']
    passions?: string[]; // Deep interests: ['sustainable-fashion', 'mental-wellness', 'art']
    lifestyle?:
      | 'minimalist'
      | 'luxury'
      | 'bohemian'
      | 'athletic'
      | 'creative'
      | 'entrepreneurial'
      | 'family-oriented'
      | 'adventurous';
    dailyRoutine?: 'morning-person' | 'night-owl' | 'balanced' | 'irregular';
    favoriteActivities?: string[]; // e.g., ['brunch', 'hiking', 'reading', 'shopping']
  };

  // ============================================
  // BRAND AESTHETIC
  // Visual and stylistic brand identity
  // ============================================
  brandAesthetic?: {
    colorPalette?: string[]; // e.g., ['pastels', 'neutrals', 'bold-colors', 'monochrome']
    visualStyle?:
      | 'minimalist'
      | 'maximalist'
      | 'vintage'
      | 'modern'
      | 'bohemian'
      | 'edgy'
      | 'romantic'
      | 'industrial';
    photoStyle?:
      | 'bright'
      | 'moody'
      | 'warm'
      | 'cool'
      | 'high-contrast'
      | 'soft';
    editingStyle?: 'natural' | 'filtered' | 'highly-edited' | 'raw';
    locationPreference?:
      | 'indoor'
      | 'outdoor'
      | 'urban'
      | 'nature'
      | 'studio'
      | 'mixed';
  };

  // ============================================
  // AUDIENCE CONNECTION
  // How they connect with their audience
  // ============================================
  audienceConnection?: {
    targetAudience?: string; // e.g., "young-professionals", "fitness-enthusiasts", "creative-souls"
    connectionDepth?: 'surface' | 'moderate' | 'deep' | 'intimate';
    relatability?: 'aspirational' | 'relatable' | 'authentic' | 'curated';
    vulnerability?: 'private' | 'selective-sharing' | 'open' | 'very-open';
    communityBuilding?: boolean; // Do they build a community?
    communityType?:
      | 'support-group'
      | 'fan-club'
      | 'learning-community'
      | 'lifestyle-tribe';
  };

  // ============================================
  // SUCCESS FACTORS
  // What makes them successful as an influencer
  // ============================================
  successFactors?: {
    uniqueAngle?: string; // What unique perspective do they bring?
    expertise?: string[]; // Areas of expertise/knowledge
    authenticity?: 'high' | 'medium' | 'curated'; // How authentic they appear
    consistency?: 'very-consistent' | 'consistent' | 'flexible'; // Brand consistency
    innovation?: 'trend-setter' | 'trend-follower' | 'classic'; // Innovation level
    memorability?: string; // What makes them memorable?
  };

  // ============================================
  // BACKSTORY & ORIGIN
  // Their story, where they come from
  // ============================================
  backstory?: {
    origin?: string; // Where they're from (city, region, country)
    background?: string; // e.g., "fitness trainer turned influencer", "college student"
    journey?: string; // How they got to where they are
    keyMoments?: string[]; // Important life moments that shaped them
    aspirations?: string[]; // What they're working towards
  };
}

export type ContentNiche =
  | 'fitness'
  | 'wellness'
  | 'beauty'
  | 'fashion'
  | 'lifestyle'
  | 'travel'
  | 'food'
  | 'photography'
  | 'art'
  | 'music'
  | 'business'
  | 'tech'
  | 'education'
  | 'parenting'
  | 'pets'
  | 'gaming'
  | 'sports'
  | 'entertainment'
  | 'comedy'
  | 'motivation'
  | 'sustainability'
  | 'mental-health'
  | 'relationships'
  | 'self-improvement';
```

### 2.2 Enhanced CharacterDNA

```typescript
/**
 * Enhanced Character DNA for prompt building
 * Extends existing CharacterDNA with detailed characteristics
 */
export interface EnhancedCharacterDNA extends CharacterDNA {
  // Fine-grained facial features
  eyes?: {
    shape?: string;
    size?: string;
    spacing?: string;
    eyelashes?: string;
    eyebrows?: string;
  };

  nose?: {
    shape?: string;
    size?: string;
    bridge?: string;
  };

  lips?: {
    shape?: string;
    size?: string;
    color?: string;
    thickness?: string;
  };

  faceStructure?: {
    jawline?: string;
    cheekbones?: string;
    forehead?: string;
    chin?: string;
  };

  skin?: {
    texture?: string;
    glow?: string;
    tone?: string;
    imperfections?: string;
  };

  hairDetails?: {
    length?: string;
    texture?: string;
    volume?: string;
    highlights?: string;
  };

  bodyStructure?: {
    height?: string;
    proportions?: string;
    shoulders?: string;
  };

  hands?: {
    size?: string;
    nails?: string;
  };

  // Detailed modifications as arrays
  tattoos?: TattooDetail[];
  piercings?: PiercingDetail[];
  scars?: ScarDetail[];

  // Identity & Uniqueness DNA
  identity?: IdentityDNA;
}
```

---

## 3. Storage Architecture

### 3.1 Database Schema

**Current**: CharacterConfig stored as JSONB in `characters.config` column

**Proposed**: Keep JSONB structure, extend CharacterConfig interface

**Rationale**:

- ✅ JSONB allows flexible schema evolution
- ✅ No migration needed for existing characters (backward compatible)
- ✅ PostgreSQL JSONB supports efficient querying
- ✅ Can add indexes on specific JSONB paths if needed

### 3.2 Storage Strategy

#### Option A: Single JSONB Column (Recommended)

```typescript
// characters table
{
  id: uuid,
  config: jsonb, // EnhancedCharacterConfig
  // ... other fields
}
```

**Pros:**

- Simple, no schema changes
- Backward compatible
- Flexible for future additions

**Cons:**

- Can't easily query nested fields (but JSONB supports this)
- No foreign key constraints on nested data

#### Option B: Separate Tables for Details

```typescript
// characters table (main)
// character_tattoos table
// character_piercings table
// character_facial_features table
```

**Pros:**

- Normalized data
- Easy to query specific characteristics
- Can add constraints

**Cons:**

- Complex joins
- More migration work
- Overkill for this use case

**Recommendation**: **Option A** - Keep JSONB, extend interface

### 3.3 Data Migration

```typescript
/**
 * Migration strategy for existing characters
 */
function migrateCharacterConfig(
  oldConfig: CharacterConfig
): EnhancedCharacterConfig {
  const enhanced: EnhancedCharacterConfig = {
    ...oldConfig,
    // Migrate simple strings to detailed objects
    tattoos:
      oldConfig.tattoos && oldConfig.tattoos !== 'none'
        ? [
            {
              id: generateId(),
              placement: inferPlacement(oldConfig.tattoos),
              size: inferSize(oldConfig.tattoos),
              style: 'realistic',
              color: 'black',
              visibility: 'sometimes-visible',
            },
          ]
        : [],
    piercings:
      oldConfig.piercings && oldConfig.piercings !== 'none'
        ? [
            {
              id: generateId(),
              location: inferLocation(oldConfig.piercings),
              type: 'stud',
              visibility: 'sometimes-visible',
            },
          ]
        : [],
    // Keep existing fields for backward compatibility
  };

  return enhanced;
}
```

### 3.4 Indexing Strategy

```sql
-- Index on commonly queried fields
CREATE INDEX idx_characters_config_gender ON characters USING GIN ((config->>'gender'));
CREATE INDEX idx_characters_config_style ON characters USING GIN ((config->>'style'));

-- Index on array fields (tattoos, piercings)
CREATE INDEX idx_characters_config_tattoos ON characters USING GIN ((config->'tattoos'));
CREATE INDEX idx_characters_config_piercings ON characters USING GIN ((config->'piercings'));
```

---

## 4. Integration Points

### 4.1 Wizard Form Data

```typescript
// Extend CharacterFormData
export interface EnhancedCharacterFormData extends CharacterFormData {
  // Fine-grained facial features
  eyes?: {
    shape?: string;
    size?: string;
    // ... other eye fields
  };

  lips?: {
    shape?: string;
    size?: string;
    // ... other lip fields
  };

  // Detailed modifications
  tattoos?: TattooDetail[];
  piercings?: PiercingDetail[];

  // ... other enhanced fields
}
```

### 4.2 Prompt Building

```typescript
/**
 * Convert EnhancedCharacterConfig to EnhancedCharacterDNA
 */
export function enhancedConfigToDNA(
  config: EnhancedCharacterConfig,
  characterName: string
): EnhancedCharacterDNA {
  const dna: EnhancedCharacterDNA = {
    // Base DNA (existing)
    name: characterName,
    age: config.age ? `${config.age}-year-old` : '24-year-old',
    ethnicity: config.ethnicity,
    hair: buildHairDescription(config),
    eyes: buildEyeDescription(config),
    skin: buildSkinDescription(config),
    bodyType: buildBodyDescription(config),

    // Enhanced DNA
    eyes: {
      shape: config.eyes?.shape,
      size: config.eyes?.size,
      spacing: config.eyes?.spacing,
      eyelashes: buildEyelashDescription(config.eyes?.eyelashes),
      eyebrows: buildEyebrowDescription(config.eyes?.eyebrows),
    },

    lips: {
      shape: config.lips?.shape,
      size: config.lips?.size,
      color: config.lips?.color,
      thickness: config.lips?.thickness,
    },

    // Detailed modifications
    tattoos: config.tattoos,
    piercings: config.piercings,
    scars: config.scars,
  };

  return dna;
}

/**
 * Build prompt segment from enhanced DNA
 */
export function enhancedDNAToPrompt(dna: EnhancedCharacterDNA): string {
  const parts: string[] = [];

  // Core identity
  parts.push(`${dna.age} ${dna.ethnicity || ''} woman`);

  // Eyes (detailed)
  if (dna.eyes?.shape) parts.push(`${dna.eyes.shape} eyes`);
  if (dna.eyes?.size) parts.push(`${dna.eyes.size} eyes`);
  if (dna.eyes?.eyelashes) parts.push(dna.eyes.eyelashes);

  // Lips (detailed)
  if (dna.lips?.shape) parts.push(`${dna.lips.shape} lips`);
  if (dna.lips?.thickness) parts.push(`${dna.lips.thickness} lips`);

  // Nails
  if (dna.hands?.nails) {
    parts.push(`${dna.hands.nails.length} ${dna.hands.nails.shape} nails`);
  }

  // Tattoos (detailed)
  if (dna.tattoos && dna.tattoos.length > 0) {
    const tattooDescs = dna.tattoos.map(
      (t) => `${t.size} ${t.style} tattoo on ${t.placement}`
    );
    parts.push(tattooDescs.join(', '));
  }

  // Piercings (detailed)
  if (dna.piercings && dna.piercings.length > 0) {
    const piercingDescs = dna.piercings.map(
      (p) => `${p.type} piercing in ${p.location}`
    );
    parts.push(piercingDescs.join(', '));
  }

  // Identity & Uniqueness DNA
  if (dna.identity) {
    // Signature look/style
    if (dna.identity.uniqueFeatures?.signatureLook) {
      parts.push(dna.identity.uniqueFeatures.signatureLook);
    }
    if (dna.identity.uniqueFeatures?.signatureStyle) {
      parts.push(dna.identity.uniqueFeatures.signatureStyle);
    }

    // Brand aesthetic
    if (dna.identity.brandAesthetic?.visualStyle) {
      parts.push(`${dna.identity.brandAesthetic.visualStyle} aesthetic`);
    }
    if (dna.identity.brandAesthetic?.colorPalette) {
      parts.push(
        `${dna.identity.brandAesthetic.colorPalette.join(', ')} color palette`
      );
    }
  }

  return parts.join(', ');
}

/**
 * Build identity prompt for content generation
 * Uses IdentityDNA to generate content that matches character's brand
 */
export function identityDNAToContentPrompt(identity: IdentityDNA): string {
  const parts: string[] = [];

  if (identity.archetype) {
    parts.push(`${identity.archetype} archetype`);
  }

  if (identity.contentTheme?.primaryNiche) {
    parts.push(`${identity.contentTheme.primaryNiche} content`);
  }

  if (identity.communicationStyle?.tone) {
    parts.push(`${identity.communicationStyle.tone} tone`);
  }

  if (identity.brandAesthetic?.visualStyle) {
    parts.push(`${identity.brandAesthetic.visualStyle} aesthetic`);
  }

  if (identity.uniqueFeatures?.signatureLook) {
    parts.push(identity.uniqueFeatures.signatureLook);
  }

  return parts.join(', ');
}
```

---

## 5. Implementation Phases

### Phase 1: Data Structure (Week 1-2)

- [ ] Define EnhancedCharacterConfig interface
- [ ] Define TattooDetail, PiercingDetail, ScarDetail interfaces
- [ ] Update CharacterConfig type (backward compatible)
- [ ] Create migration utilities

### Phase 2: Wizard UI (Week 3-4)

- [ ] Add fine-grained facial feature inputs
- [ ] Create tattoo designer UI
- [ ] Create piercing selector UI
- [ ] Add nail/hand detail inputs
- [ ] Update form validation

### Phase 3: Prompt Building (Week 5-6)

- [ ] Update character-config-to-dna converter
- [ ] Enhance prompt builder with detailed DNA
- [ ] Test prompt quality and token usage
- [ ] Optimize prompt generation

### Phase 4: Testing (Week 7)

- [ ] Test character generation with enhanced DNA
- [ ] Validate backward compatibility
- [ ] Performance testing
- [ ] User testing

---

## 6. Example: Complete Character Description

```typescript
const exampleCharacter: EnhancedCharacterConfig = {
  // Basic (existing)
  gender: 'female',
  style: 'realistic',
  ethnicity: 'Latina',
  age: 25,
  skinColor: 'tan',

  // Enhanced facial features
  eyes: {
    shape: 'almond',
    color: 'hazel',
    size: 'medium',
    spacing: 'average',
    eyelashes: {
      length: 'long',
      thickness: 'thick',
      curl: 'curved',
    },
    eyebrows: {
      shape: 'arched',
      color: 'dark brown',
      spacing: 'separated',
    },
  },

  nose: {
    shape: 'straight',
    size: 'medium',
    bridge: 'medium',
    nostrils: 'medium',
  },

  lips: {
    shape: 'full',
    size: 'medium',
    color: 'coral',
    cupidsBow: 'defined',
    thickness: 'full',
    width: 'medium',
  },

  faceStructure: {
    shape: 'oval',
    jawline: 'soft',
    cheekbones: 'high',
    forehead: 'medium',
    chin: 'pointed',
  },

  // Enhanced skin
  skin: {
    color: 'tan',
    tone: 'warm',
    texture: 'smooth',
    glow: 'dewy',
    freckles: 'light',
    beautyMarks: 'single',
    imperfections: 'minimal',
  },

  // Enhanced hair
  hairDetails: {
    style: 'long-straight',
    color: 'dark brown',
    length: 'long',
    texture: 'wavy',
    volume: 'thick',
    highlights: {
      enabled: true,
      intensity: 'subtle',
      color: 'caramel',
    },
  },

  // Enhanced body
  bodyStructure: {
    type: 'curvy',
    height: 'average',
    proportions: 'balanced',
    shoulders: 'medium',
    waist: 'defined',
    hips: 'wide',
  },

  breasts: {
    size: 'large',
    type: 'perky',
    shape: 'round',
    spacing: 'average',
  },

  // Detailed modifications
  tattoos: [
    {
      id: 'tattoo-1',
      placement: 'arm-upper',
      size: 'medium',
      style: 'realistic',
      design: 'rose with thorns',
      color: 'black',
      visibility: 'sometimes-visible',
      age: 'old',
    },
  ],

  piercings: [
    {
      id: 'piercing-1',
      location: 'ear-lobe',
      type: 'hoop',
      material: 'gold',
      size: 'medium',
      count: 2,
      visibility: 'always-visible',
    },
    {
      id: 'piercing-2',
      location: 'nose-nostril',
      type: 'stud',
      material: 'diamond',
      size: 'small',
      visibility: 'always-visible',
    },
  ],

  // Hands
  hands: {
    size: 'medium',
    shape: 'slender',
    fingerLength: 'medium',
    nails: {
      length: 'medium',
      shape: 'almond',
      color: 'natural',
      style: 'manicured',
    },
  },

  // Identity (existing)
  defaultOutfit: 'casual',
  archetype: 'girl-next-door',
  personalityTraits: ['friendly', 'confident', 'playful'],
  bio: 'Loving life and sharing moments',

  // Identity & Uniqueness DNA
  identity: {
    // Core identity (extends existing)
    archetype: 'girl-next-door',
    personalityTraits: ['friendly', 'confident', 'playful'],
    bio: 'Loving life and sharing moments',
    handle: '@luna.dreams',

    // Unique selling points
    uniqueFeatures: {
      signatureLook: 'always wears red lipstick',
      signatureStyle: 'minimalist aesthetic with bold accents',
      signaturePose: 'hand on hip, confident smile',
      catchphrase: "Let's glow!",
      distinctiveMark: 'beauty mark above lip',
    },

    // Content identity
    contentTheme: {
      primaryNiche: 'lifestyle',
      secondaryNiches: ['beauty', 'wellness'],
      contentStyle: 'inspirational',
      postingFrequency: 'daily',
      contentFormat: ['photos', 'stories', 'reels'],
    },

    // Communication style
    communicationStyle: {
      tone: 'friendly',
      language: 'casual',
      emojiUsage: 'moderate',
      captionLength: 'medium',
      engagementStyle: 'responds-to-comments',
      voice: 'sweet',
    },

    // Values & beliefs
    values: {
      coreValues: ['authenticity', 'self-love', 'empowerment'],
      causes: ['mental-health', 'body-positivity'],
      beliefs: ['work-life-balance', 'mindfulness'],
      turnOffs: ['negativity', 'judgment'],
    },

    // Interests & lifestyle
    interests: {
      hobbies: ['yoga', 'photography', 'cooking', 'travel'],
      passions: ['sustainable-fashion', 'mental-wellness'],
      lifestyle: 'balanced',
      dailyRoutine: 'morning-person',
      favoriteActivities: ['brunch', 'hiking', 'reading'],
    },

    // Brand aesthetic
    brandAesthetic: {
      colorPalette: ['pastels', 'neutrals'],
      visualStyle: 'minimalist',
      photoStyle: 'bright',
      editingStyle: 'natural',
      locationPreference: 'mixed',
    },

    // Audience connection
    audienceConnection: {
      targetAudience: 'young-professionals',
      connectionDepth: 'moderate',
      relatability: 'relatable',
      vulnerability: 'selective-sharing',
      communityBuilding: true,
      communityType: 'lifestyle-tribe',
    },

    // Success factors
    successFactors: {
      uniqueAngle: 'authentic wellness without the pretense',
      expertise: ['wellness', 'lifestyle', 'self-care'],
      authenticity: 'high',
      consistency: 'consistent',
      innovation: 'trend-follower',
      memorability: 'red lipstick + genuine smile',
    },

    // Backstory
    backstory: {
      origin: 'Miami, Florida',
      background: 'fitness instructor turned lifestyle influencer',
      journey:
        'Started sharing wellness tips on Instagram, grew organically through authentic content',
      keyMoments: [
        'discovered passion for wellness at 16',
        'built first online following during college',
      ],
      aspirations: ['build wellness brand', 'inspire others to find balance'],
    },
  },
};
```

---

## 7. Considerations

### 7.1 Backward Compatibility

- All new fields are optional
- Existing CharacterConfig remains valid
- Migration utility converts old format to new
- Prompt builder handles both formats

### 7.2 Performance

- JSONB queries are efficient for simple lookups
- Complex queries may need indexes
- Prompt building should cache DNA conversion
- Consider denormalization for frequently accessed fields

### 7.3 User Experience

- Progressive disclosure: show basic first, details optional
- Smart defaults: populate reasonable defaults for unselected fields
- Validation: ensure selected characteristics are compatible
- Preview: show how selections affect character appearance

### 7.4 Prompt Token Limits

- Detailed DNA can create long prompts
- Implement smart truncation for non-essential details
- Prioritize most visible characteristics
- Use token optimization strategies

---

## 8. Next Steps

1. **Review & Approve**: Review this proposal with team
2. **Create Epics**: Break down into implementation epics
3. **Prototype**: Build small prototype of tattoo/piercing UI
4. **Test Prompt Quality**: Generate test characters with detailed DNA
5. **Iterate**: Refine based on testing results

---

## References

- [IN-002: Character DNA Enhancement System](../initiatives/IN-002-character-dna-enhancement.md)
- [CharacterConfig Schema](../../libs/data/src/schema/characters.schema.ts)
- [CharacterDNA Types](../../libs/business/src/prompts/types.ts)
- [Character Config to DNA Converter](../../apps/api/src/modules/image/services/character-config-to-dna.ts)

---

**Last Updated**: 2026-01-XX
