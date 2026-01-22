# [EPIC] EP-028: DNA Foundation & Auto-Generation Engine

**Related Initiative**: [IN-002: Character DNA Enhancement System](../../initiatives/IN-002-character-dna-enhancement.md)  
**Status**: 📝 Defined  
**Priority**: P1  
**Target Metric**: C-Core Value (Character quality and uniqueness)

---

## Overview

Build the foundation of the Character DNA system with enhanced data structures and an intelligent auto-generation engine that fills missing characteristics to create unique, consistent characters without overwhelming users.

This epic establishes the core DNA infrastructure that will power all character generation (base images, studio, profile sets).

---

## Business Impact

**Target Metric**: C-Core Value

**Hypothesis**: When the system automatically generates missing characteristics based on user selections, characters become more unique, consistent, and realistic without requiring users to specify every detail.

**Success Criteria**:
- DNA structure supports all fine-grained physical characteristics
- IdentityDNA structure captures what makes influencers successful
- Auto-generation creates unique characters (variety score >30%)
- Auto-generation maintains consistency (consistency score >90%)
- 70%+ users use auto-generation (default enabled)

---

## Features

### F1: Enhanced DNA Data Structures

**Goal**: Extend CharacterDNA and CharacterConfig to support fine-grained characteristics

- **EnhancedCharacterConfig Interface**
  - Fine-grained facial features (eyes, nose, lips, face structure)
  - Detailed body structure (height, proportions, hands, feet)
  - Detailed modifications (tattoos, piercings as arrays)
  - IdentityDNA structure (signature looks, brand aesthetic, content identity, etc.)

- **EnhancedCharacterDNA Interface**
  - Extends existing CharacterDNA
  - Adds detailed physical characteristics
  - Adds IdentityDNA for brand identity

- **Database Schema**
  - Extend CharacterConfig JSONB structure (no migration needed)
  - Backward compatible with existing characters
  - Support nested objects for detailed characteristics

**Acceptance Criteria**:
- [ ] EnhancedCharacterConfig interface defined with all fields
- [ ] EnhancedCharacterDNA interface defined
- [ ] IdentityDNA interface defined
- [ ] Database schema supports new structure (JSONB)
- [ ] Backward compatibility validated (existing characters work)

### F2: Auto-Generation Engine

**Goal**: Intelligently fill missing characteristics based on compatibility, archetype, and variety rules

- **Compatibility Rules**
  - Generate characteristics compatible with user selections
  - Example: "curvy" body type → likely full lips (70%), defined waist (80%)

- **Archetype Defaults**
  - Different archetypes have different default characteristics
  - Example: "fitness-enthusiast" → athletic body, defined muscles, active lifestyle

- **Ethnicity Defaults**
  - Some characteristics correlate with ethnicity
  - Example: Asian ethnicity → fair skin, almond eyes (higher probability)

- **Variety Injection**
  - Add random characteristics for uniqueness
  - Controlled by variety level (low/medium/high)
  - Low: 10% of missing characteristics
  - Medium: 30% of missing characteristics
  - High: 50% of missing characteristics

- **Identity DNA Auto-Generation**
  - Generate signature look from physical characteristics
  - Generate content niche from archetype
  - Generate communication style from personality traits
  - Generate brand aesthetic from archetype + style

**Acceptance Criteria**:
- [ ] Compatibility rules implemented and tested
- [ ] Archetype defaults defined for all 6 archetypes
- [ ] Ethnicity defaults defined for all 7 ethnicities
- [ ] Variety injection working (low/medium/high levels)
- [ ] Identity DNA auto-generation working
- [ ] Auto-generated characteristics are consistent and realistic
- [ ] Auto-generation respects user selections (never overrides)

### F3: DNA Builder Service

**Goal**: Orchestrate building complete CharacterDNA from user input

- **Service Architecture**
  - Convert CharacterFormData to EnhancedCharacterConfig
  - Apply auto-generation (if enabled)
  - Apply populators (if selected)
  - Convert config to EnhancedCharacterDNA
  - Validate DNA completeness

- **DNA Merging Logic**
  - User selections take priority
  - Auto-generated fills gaps
  - Populators add variety
  - Smart merging (no conflicts)

- **DNA Validation**
  - Ensure required fields present
  - Validate compatibility between characteristics
  - Check for conflicts

**Acceptance Criteria**:
- [ ] DNABuilderService implemented
- [ ] Form data → Config conversion working
- [ ] Config → DNA conversion working
- [ ] Auto-generation integration working
- [ ] Populator integration working
- [ ] DNA validation working
- [ ] Merging logic handles conflicts correctly

---

## Technical Implementation

### Data Structures

```typescript
// EnhancedCharacterConfig (extends CharacterConfig)
interface EnhancedCharacterConfig extends CharacterConfig {
  eyes?: EnhancedEyesConfig;
  nose?: EnhancedNoseConfig;
  lips?: EnhancedLipsConfig;
  faceStructure?: EnhancedFaceStructureConfig;
  hairDetails?: EnhancedHairDetailsConfig;
  bodyStructure?: EnhancedBodyStructureConfig;
  hands?: EnhancedHandsConfig;
  feet?: EnhancedFeetConfig;
  tattoos?: TattooDetail[];
  piercings?: PiercingDetail[];
  scars?: ScarDetail[];
  identity?: IdentityDNA;
}

// IdentityDNA
interface IdentityDNA {
  uniqueFeatures?: {
    signatureLook?: string;
    signatureStyle?: string;
    signaturePose?: string;
    catchphrase?: string;
    distinctiveMark?: string;
  };
  contentTheme?: {
    primaryNiche?: ContentNiche;
    secondaryNiches?: ContentNiche[];
    contentStyle?: string;
    postingFrequency?: string;
    contentFormat?: string[];
  };
  communicationStyle?: {
    tone?: string;
    language?: string;
    emojiUsage?: string;
    captionLength?: string;
    engagementStyle?: string;
  };
  values?: {
    coreValues?: string[];
    causes?: string[];
    beliefs?: string[];
    turnOffs?: string[];
  };
  interests?: {
    hobbies?: string[];
    passions?: string[];
    lifestyle?: string;
    dailyRoutine?: string;
    favoriteActivities?: string[];
  };
  brandAesthetic?: {
    colorPalette?: string[];
    visualStyle?: string;
    photoStyle?: string;
    editingStyle?: string;
    locationPreference?: string;
  };
  audienceConnection?: {
    targetAudience?: string;
    connectionDepth?: string;
    relatability?: string;
    vulnerability?: string;
    communityBuilding?: boolean;
    communityType?: string;
  };
  successFactors?: {
    uniqueAngle?: string;
    expertise?: string[];
    authenticity?: string;
    consistency?: string;
    innovation?: string;
    memorability?: string;
  };
  backstory?: {
    origin?: string;
    background?: string;
    journey?: string;
    keyMoments?: string[];
    aspirations?: string[];
  };
}
```

### Service Implementation

```typescript
@Injectable()
export class AutoGenerationService {
  async generatePhysicalCharacteristics(
    userSelections: Partial<EnhancedCharacterConfig>,
    varietyLevel: 'low' | 'medium' | 'high' = 'medium'
  ): Promise<Partial<EnhancedCharacterConfig>> {
    // Implementation: compatibility rules, archetype defaults, variety injection
  }
  
  async generateIdentityDNA(
    userSelections: Partial<EnhancedCharacterConfig>,
    physicalDNA: EnhancedCharacterDNA
  ): Promise<IdentityDNA> {
    // Implementation: archetype mapping, signature look generation, etc.
  }
}

@Injectable()
export class DNABuilderService {
  constructor(
    private autoGenService: AutoGenerationService,
    private populatorService: PopulatorService,
    private validator: DNAValidator
  ) {}
  
  async buildDNA(
    formData: CharacterFormData,
    options: {
      autoGenerate?: boolean;
      varietyLevel?: 'low' | 'medium' | 'high';
      populators?: string[];
    } = {}
  ): Promise<EnhancedCharacterDNA> {
    // Implementation: orchestrate DNA building
  }
}
```

---

## Dependencies

- **EP-001**: Character Creation Wizard (must understand current wizard structure)
- **EP-005**: Content Studio (will use DNA for generation)
- **Database**: CharacterConfig JSONB structure

---

## Stories

### ST-028-010: Enhanced DNA Data Structures
- Define EnhancedCharacterConfig interface
- Define EnhancedCharacterDNA interface
- Define IdentityDNA interface
- Update TypeScript types
- Update database schema documentation

### ST-028-020: Compatibility Rules Engine
- Design compatibility rule structure
- Implement compatibility rule engine
- Create rule definitions for common combinations
- Test compatibility rule application

### ST-028-030: Archetype Defaults
- Define defaults for all 6 archetypes
- Implement archetype default application
- Test archetype-based generation

### ST-028-040: Ethnicity Defaults
- Define defaults for all 7 ethnicities
- Implement ethnicity default application
- Test ethnicity-based generation

### ST-028-050: Variety Injection System
- Implement variety level logic (low/medium/high)
- Create random characteristic generator
- Test variety injection quality

### ST-028-060: Identity DNA Auto-Generation
- Implement signature look generation
- Implement content niche generation
- Implement communication style generation
- Implement brand aesthetic generation
- Test identity DNA quality

### ST-028-070: DNA Builder Service
- Implement form data → config conversion
- Implement config → DNA conversion
- Integrate auto-generation
- Integrate populators
- Implement DNA validation
- Test end-to-end DNA building

---

## Testing

### Unit Tests
- Auto-generation rules (compatibility, archetype, ethnicity)
- Variety injection logic
- Identity DNA generation
- DNA builder service
- DNA validation

### Integration Tests
- End-to-end DNA building from form data
- Auto-generation quality (consistency, uniqueness)
- Backward compatibility with existing characters

### Quality Metrics
- Auto-generated characteristics are realistic
- Auto-generated characteristics are consistent
- Variety score >30%
- Consistency score >90%

---

## Documentation

- [Human Description System](../../technical/systems/human-description-system.md)
- [DNA Implementation Plan](../../technical/systems/dna-implementation-plan.md)
- [IN-002: Character DNA Enhancement System](../../initiatives/IN-002-character-dna-enhancement.md)

---

**Last Updated**: 2026-01-XX
