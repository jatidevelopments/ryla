# MDC → RYLA Copy Guide

## Overview

This document outlines what components, patterns, and code can be copied from the MDC project (`mdc-next-frontend`) to accelerate RYLA MVP development.

**Source**: `/Users/admin/Documents/Projects/MDC/mdc-next-frontend`
**Target**: `/Users/admin/Documents/Projects/RYLA`

**Estimated Time Savings**: 5-7 weeks → 1-2 weeks

---

## Copy Priority

| Priority | Category | Time Saved |
|----------|----------|------------|
| P0 | Character Creation Wizard | 2-3 weeks |
| P0 | Character Option Constants | 1 week |
| P0 | UI Components (shadcn) | 1-2 weeks |
| P1 | State Management Pattern | 3-5 days |
| P1 | Image Generation UI | 1 week |
| P2 | Form Validation Hooks | 2-3 days |

---

## P0: Character Creation Wizard

### Source Files

```
MDC/mdc-next-frontend/components/create-character/
├── CreateFromPresetsView.tsx    # Main wizard container
├── StyleScreen.tsx              # Step 1: Gender + Style
├── GeneralScreen.tsx            # Step 2: Ethnicity + Age
├── FaceScreen.tsx               # Step 3: Hair + Eyes
├── BodyScreen.tsx               # Step 4: Body type
├── DetailsScreen.tsx            # Step 5: Outfit + Personality
├── ImageScreen.tsx              # Step 6: Generate
└── index.ts
```

### What to Copy

1. **Wizard container logic** (`CreateFromPresetsView.tsx`)
   - Step navigation
   - Progress indicator
   - Form state management
   - Back/Next buttons

2. **Step components** (all `*Screen.tsx` files)
   - Layout structure
   - Option grid pattern
   - Image-based selection UI
   - Gender-filtered options

### Adaptation Required

| MDC | RYLA | Changes |
|-----|------|---------|
| `CreateFromPresetsView` | `CharacterWizard` | Rename, adjust imports |
| MDC API calls | RYLA API calls | Update endpoints |
| MDC store | RYLA store | Update Zustand store |
| MDC types | RYLA types | Update TypeScript interfaces |

### Copy Steps

```bash
# 1. Copy wizard components
cp -r MDC/mdc-next-frontend/components/create-character/* \
      RYLA/apps/web/components/character-wizard/

# 2. Update imports
# - Change @/store to @ryla/business
# - Change @/constants to @ryla/shared
# - Change @/components/ui to @ryla/ui
```

---

## P0: Character Option Constants

### Source Files

```
MDC/mdc-next-frontend/constants/
├── body-type-options.ts      # Slim, Athletic, Curvy, Voluptuous
├── ethnicity-options.ts      # Asian, Black, White, Latina, etc.
├── hair-style-options.ts     # Long, Short, Braids, Ponytail, etc.
├── hair-color-options.ts     # Black, Brown, Blonde, Red, etc.
├── eye-color-options.ts      # Brown, Blue, Green, Hazel, etc.
├── clothes-options.ts        # 74 outfit options
├── skin-tones-options.ts     # Light, Medium, Tan, Dark
├── breast-size-options.ts    # For female characters
├── personality-options.ts    # Personality traits
└── voices.ts                 # Voice options
```

### What to Copy (Direct Copy)

| File | Options | MVP Scope |
|------|---------|-----------|
| `body-type-options.ts` | 5 types | Use 4 (skip Pregnant) |
| `ethnicity-options.ts` | 11 types | Use 7 (skip Fantasy) |
| `hair-style-options.ts` | 14 styles | Use all |
| `hair-color-options.ts` | 7 colors | Use all |
| `eye-color-options.ts` | 6 colors | Use all |
| `clothes-options.ts` | 74 outfits | Use top 20 |
| `skin-tones-options.ts` | 4 tones | Use all |
| `breast-size-options.ts` | 5 sizes | Use all |
| `personality-options.ts` | Multiple | Use 5 basic |
| `voices.ts` | 6 voices | Use 3-5 |

### Copy Steps

```bash
# 1. Copy all constants
cp MDC/mdc-next-frontend/constants/*.ts \
   RYLA/libs/shared/src/constants/character/

# 2. Create index.ts for exports
echo "export * from './body-type-options';
export * from './ethnicity-options';
export * from './hair-style-options';
export * from './hair-color-options';
export * from './eye-color-options';
export * from './clothes-options';
export * from './skin-tones-options';
export * from './breast-size-options';
export * from './personality-options';
export * from './voices';" > RYLA/libs/shared/src/constants/character/index.ts
```

### Option Data Structure (MDC Pattern)

```typescript
// Example from body-type-options.ts
export interface BodyTypeOption {
  id: string;
  label: string;
  value: string;
  image?: string;
  gender?: 'male' | 'female' | 'all';
}

export const BODY_TYPE_OPTIONS: BodyTypeOption[] = [
  { id: 'slim', label: 'Slim', value: 'slim', gender: 'all' },
  { id: 'athletic', label: 'Athletic', value: 'athletic', gender: 'all' },
  { id: 'curvy', label: 'Curvy', value: 'curvy', gender: 'female' },
  { id: 'voluptuous', label: 'Voluptuous', value: 'voluptuous', gender: 'female' },
];
```

---

## P0: UI Components (shadcn)

### Source Files

```
MDC/mdc-next-frontend/components/ui/
├── button.tsx
├── card.tsx
├── dialog.tsx
├── input.tsx
├── label.tsx
├── select.tsx
├── slider.tsx
├── switch.tsx
├── tabs.tsx
├── toast.tsx
├── tooltip.tsx
└── ... (30+ components)
```

### What to Copy (Direct Copy)

All shadcn/ui components can be copied directly. They are:
- Framework-agnostic (just React + Tailwind)
- No MDC-specific dependencies
- Well-documented

### Copy Steps

```bash
# 1. Copy entire ui folder
cp -r MDC/mdc-next-frontend/components/ui/* \
      RYLA/libs/ui/src/components/

# 2. Copy utils
cp MDC/mdc-next-frontend/lib/utils.ts \
   RYLA/libs/ui/src/lib/utils.ts

# 3. Ensure cn() utility is available
```

### Key Components for MVP

| Component | Use Case |
|-----------|----------|
| `Button` | All actions |
| `Card` | Character cards, option cards |
| `Dialog` | Modals, confirmations |
| `Select` | Dropdowns |
| `Slider` | Age selection |
| `Switch` | NSFW toggle |
| `Tabs` | Dashboard views |
| `Toast` | Notifications |

---

## P1: State Management Pattern

### Source Files

```
MDC/mdc-next-frontend/store/persist/
└── character-presets-form.ts    # Zustand store with localStorage
```

### What to Copy

**Pattern**: Zustand store with persistence

```typescript
// character-presets-form.ts pattern
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CharacterFormState {
  currentStep: number;
  gender: string | null;
  style: string | null;
  ethnicity: string | null;
  // ... all character attributes
  
  setStep: (step: number) => void;
  setGender: (gender: string) => void;
  // ... all setters
  reset: () => void;
}

export const useCharacterFormStore = create<CharacterFormState>()(
  persist(
    (set) => ({
      currentStep: 0,
      gender: null,
      style: null,
      // ... initial state
      
      setStep: (step) => set({ currentStep: step }),
      setGender: (gender) => set({ gender }),
      // ... setters
      reset: () => set({ /* initial state */ }),
    }),
    {
      name: 'character-form-storage',
    }
  )
);
```

### Adaptation for RYLA

```typescript
// RYLA: libs/business/src/store/character-wizard.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CharacterWizardState {
  // Step tracking
  currentStep: number;
  completedSteps: number[];
  
  // Character attributes
  gender: 'male' | 'female' | null;
  style: 'realistic' | 'anime' | null;
  ethnicity: string | null;
  age: number;
  bodyType: string | null;
  hairStyle: string | null;
  hairColor: string | null;
  eyeColor: string | null;
  outfit: string | null;
  personality: string | null;
  
  // NSFW
  nsfwEnabled: boolean;
  
  // Generation options
  aspectRatio: '1:1' | '9:16' | '2:3';
  qualityMode: 'draft' | 'hq';
  
  // Actions
  setStep: (step: number) => void;
  updateAttribute: (key: string, value: any) => void;
  reset: () => void;
}
```

---

## P1: Image Generation UI

### Source Files

```
MDC/mdc-next-frontend/components/content-generation/
├── ImageGeneration.tsx       # Main generation UI
├── PromptArea.tsx            # Prompt input
├── ModelItem.tsx             # Model selector (P2)
├── LoraItem.tsx              # LoRA selector (P2)
└── index.ts
```

### What to Copy for MVP

| Component | MVP | P2 |
|-----------|-----|-----|
| `ImageGeneration.tsx` | ✅ Aspect ratio, quality toggle | - |
| `PromptArea.tsx` | ✅ Basic prompt input | - |
| `ModelItem.tsx` | ❌ | ✅ |
| `LoraItem.tsx` | ❌ | ✅ |

### Key Features to Extract

```typescript
// From ImageGeneration.tsx
// 1. Aspect ratio selector
const ASPECT_RATIOS = [
  { label: '1:1', value: '1:1', width: 1024, height: 1024 },
  { label: '9:16', value: '9:16', width: 768, height: 1365 },
  { label: '2:3', value: '2:3', width: 819, height: 1228 },
];

// 2. Quality mode
const QUALITY_MODES = [
  { label: 'Draft', value: 'draft', steps: 20 },
  { label: 'High Quality', value: 'hq', steps: 40 },
];

// 3. Safe mode toggle (NSFW)
const [safeMode, setSafeMode] = useState(true);
```

---

## P2: Form Validation Hooks

### Source Files

```
MDC/mdc-next-frontend/hooks/forms/
└── use-character-form-validation.ts
```

### What to Copy

```typescript
// Validation pattern
export function useCharacterFormValidation(step: number, state: CharacterFormState) {
  const isStepValid = useMemo(() => {
    switch (step) {
      case 0: // Style
        return !!state.gender && !!state.style;
      case 1: // General
        return !!state.ethnicity && state.age >= 18;
      case 2: // Face
        return !!state.hairStyle && !!state.hairColor && !!state.eyeColor;
      case 3: // Body
        return !!state.bodyType;
      case 4: // Details
        return !!state.outfit;
      default:
        return true;
    }
  }, [step, state]);

  return { isStepValid };
}
```

---

## File Copy Checklist

### Phase 1: Foundation (Day 1-2)

- [ ] Copy `components/ui/*` → `libs/ui/src/components/`
- [ ] Copy `lib/utils.ts` → `libs/ui/src/lib/`
- [ ] Copy `constants/*` → `libs/shared/src/constants/character/`
- [ ] Create index exports

### Phase 2: Wizard (Day 3-5)

- [ ] Copy `components/create-character/*` → `apps/web/components/character-wizard/`
- [ ] Adapt imports to RYLA structure
- [ ] Create Zustand store with persistence
- [ ] Connect to RYLA API

### Phase 3: Generation UI (Day 6-7)

- [ ] Copy aspect ratio selector pattern
- [ ] Copy quality mode toggle pattern
- [ ] Copy safe mode toggle pattern
- [ ] Integrate with generation API

### Phase 4: Polish (Day 8-10)

- [ ] Add form validation hooks
- [ ] Test all steps
- [ ] Fix any styling issues
- [ ] Mobile responsive check

---

## Import Mapping

| MDC Import | RYLA Import |
|------------|-------------|
| `@/components/ui` | `@ryla/ui` |
| `@/constants` | `@ryla/shared/constants` |
| `@/store` | `@ryla/business/store` |
| `@/hooks` | `@ryla/business/hooks` |
| `@/lib/utils` | `@ryla/ui/lib/utils` |
| `@/services` | `@ryla/data/services` |

---

## Not Copying (Out of MVP Scope)

| MDC Feature | Reason |
|-------------|--------|
| `components/chat/` | Chat features are P3 |
| `components/lipsync/` | Video features are P2 |
| `components/faceswap/` | Video features are P2 |
| Model selector UI | Auto-select for MVP |
| LoRA selector UI | Pro feature, P2 |
| Advanced NSFW controls | Simple toggle for MVP |
| Fantasy ethnicities | Real-world only for MVP |
| Pregnant body type | Not MVP |

---

## Notes

1. **Keep MDC patterns** - The wizard flow is validated, don't reinvent
2. **Simplify where possible** - MVP needs less options than MDC
3. **Focus on US preferences** - Thick body types, date night glam outfits
4. **NSFW is default** - 72% enable, make it prominent
5. **localStorage is critical** - Users expect to resume

---

## Change Log

| Date | Change |
|------|--------|
| 2025-12-05 | Initial guide created from MDC analysis |

