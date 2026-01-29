---
name: character-creation
description: Implements character creation wizard flows following RYLA patterns. Use when creating wizard steps, implementing character creation flows, or when the user mentions character wizard or wizard implementation.
---

# Character Creation Wizard

Implements character creation wizard flows following RYLA patterns for both presets and prompt-based creation methods.

## Quick Start

When implementing character wizard:

1. **Choose Flow** - Presets (10 steps) or Prompt-based (4 steps)
2. **Create Routes** - Use wizard flow router helpers
3. **Implement Steps** - Create step components
4. **Manage State** - Use character wizard store
5. **Handle Generation** - Integrate base image generation

## Wizard Flows

### Presets Flow (10 Steps)

```
Step 0: Creation Method Selection
    ↓
Step 1: Style (gender + realistic/anime)
    ↓
Step 2: Basic Appearance (ethnicity, age, skin color)
    ↓
Step 3: Facial Features (eye color, face shape)
    ↓
Step 4: Hair (style, color)
    ↓
Step 5: Body (type, ass size, breast size/type)
    ↓
Step 6: Skin Features (freckles, scars, beauty marks)
    ↓
Step 7: Body Modifications (piercings, tattoos)
    ↓
Step 8: Identity (name, outfit, archetype, personality, bio)
    ↓
Step 9: Base Image (generate 3, select 1)
    ↓
Step 10: Finalize (review, NSFW toggle, create character)
```

### Prompt-Based Flow (4 Steps)

```
Step 0: Creation Method Selection
    ↓
Step 1: Prompt Input (text description + enhancement toggle)
    ↓
Step 2: Identity (name, outfit, archetype, personality, bio)
    ↓
Step 3: Base Image (generation starts, display 3, select 1)
    ↓
Step 4: Finalize (review, NSFW toggle, create character)
```

## Route Mapping

### Step → Route → Component

| Step ID | Route | Presets Component | Prompt-Based Component |
|---------|-------|-------------------|------------------------|
| 0 | `/wizard/step-0` | StepCreationMethod | StepCreationMethod |
| 1 | `/wizard/step-1` | StepStyle | StepPromptInput |
| 2 | `/wizard/step-2` | StepGeneral | StepIdentity |
| 3 | `/wizard/step-3` | StepFace | StepBaseImageSelection |
| 4 | `/wizard/step-4` | StepHair | StepFinalize |
| 5 | `/wizard/step-5` | StepBody | N/A |
| 6 | `/wizard/step-6` | StepSkinFeatures | N/A |
| 7 | `/wizard/step-7` | StepBodyModifications | N/A |
| 8 | `/wizard/step-8` | StepIdentity | N/A |
| 9 | `/wizard/step-9` | StepBaseImageSelection | N/A |
| 10 | `/wizard/step-10` | StepFinalize | N/A |

### Using Flow Router

```typescript
// ✅ Good: Use flow router helpers
import { getWizardRoute } from '@ryla/business/wizard/flow-router';

const nextRoute = getWizardRoute(currentStep + 1, flowType);
router.push(nextRoute);

// ❌ Bad: Hardcoded routes
router.push(`/wizard/step-${currentStep + 1}`);
```

## State Management

### Store Location

- **Store**: `libs/business/src/store/character-wizard.store.ts`
- **Persistence**: Zustand + localStorage (`ryla-character-wizard`)

### State Structure

```typescript
{
  step: number,
  status: 'idle' | 'pending' | 'generating' | 'completed' | 'error',
  form: CharacterFormData,
  characterId: string | null,
  baseImages: GeneratedImage[],
  selectedBaseImageId: string | null,
  flowType: 'presets' | 'prompt',
}
```

### Using Store

```typescript
import { useCharacterWizardStore } from '@ryla/business/store';

function WizardStep() {
  const { 
    currentStep, 
    form, 
    nextStep, 
    prevStep,
    updateForm 
  } = useCharacterWizardStore();
  
  const handleNext = () => {
    updateForm({ ...form, style: selectedStyle });
    nextStep();
  };
}
```

## Step Component Pattern

### Basic Step Template

```tsx
// app/wizard/step-1/page.tsx
'use client';

import { useCharacterWizardStore } from '@ryla/business/store';
import { WizardLayout } from '@/components/wizard/WizardLayout';
import { StepStyleContent } from './components/StepStyleContent';

export default function StepStylePage() {
  const { form, updateForm, nextStep, prevStep } = useCharacterWizardStore();
  
  const handleStyleSelect = (style: StyleOption) => {
    updateForm({ ...form, style });
    nextStep();
  };
  
  return (
    <WizardLayout
      step={1}
      title="Choose Style"
      onNext={handleStyleSelect}
      onPrev={prevStep}
    >
      <StepStyleContent 
        selectedStyle={form.style}
        onSelect={handleStyleSelect}
      />
    </WizardLayout>
  );
}
```

## Base Image Generation

### Triggering Generation

```typescript
import { trpc } from '@/trpc/client';

function StepBaseImageSelection() {
  const { form } = useCharacterWizardStore();
  const generateMutation = trpc.generation.generateBaseImages.useMutation();
  
  const handleGenerate = async () => {
    const result = await generateMutation.mutateAsync({
      config: form,
    });
    
    // Store generated images
    useCharacterWizardStore.setState({ 
      baseImages: result.images 
    });
  };
}
```

### Image Selection

```typescript
function handleImageSelect(imageId: string) {
  useCharacterWizardStore.setState({ 
    selectedBaseImageId: imageId 
  });
  nextStep();
}
```

## Identity Step

### Identity Fields

```typescript
interface IdentityData {
  name: string;
  outfit: string;
  archetype: string;
  personality: string[];
  bio: string;
}
```

### Implementation

```tsx
function StepIdentity() {
  const { form, updateForm } = useCharacterWizardStore();
  
  return (
    <form onSubmit={handleSubmit}>
      <input 
        value={form.identity.name}
        onChange={(e) => updateForm({
          identity: { ...form.identity, name: e.target.value }
        })}
      />
      {/* Other identity fields */}
    </form>
  );
}
```

## Finalize Step

### Review & Create

```typescript
function StepFinalize() {
  const { form, selectedBaseImageId, createCharacter } = useCharacterWizardStore();
  const createMutation = trpc.character.create.useMutation();
  
  const handleCreate = async () => {
    const character = await createMutation.mutateAsync({
      ...form,
      baseImageId: selectedBaseImageId,
    });
    
    // Navigate to character page
    router.push(`/characters/${character.id}`);
  };
  
  return (
    <div>
      <CharacterReview data={form} />
      <NSFWToggle />
      <button onClick={handleCreate}>Create Character</button>
    </div>
  );
}
```

## Best Practices

### 1. Use Flow Router

```typescript
// ✅ Good: Flow-aware routing
import { getWizardRoute } from '@ryla/business/wizard/flow-router';

// ❌ Bad: Hardcoded routes
router.push('/wizard/step-1');
```

### 2. Persist State

```typescript
// ✅ Good: State persists automatically via Zustand + localStorage
const store = useCharacterWizardStore();

// ❌ Bad: Manual localStorage management
localStorage.setItem('wizard', JSON.stringify(state));
```

### 3. Handle Flow Type

```typescript
// ✅ Good: Check flow type
const { flowType } = useCharacterWizardStore();
const isPresetsFlow = flowType === 'presets';

// ❌ Bad: Assume presets flow
if (step === 5) { /* body step */ }
```

### 4. Validate Before Next

```typescript
// ✅ Good: Validate before proceeding
const handleNext = () => {
  if (!form.style) {
    showError('Please select a style');
    return;
  }
  nextStep();
};
```

### 5. Handle Errors

```typescript
// ✅ Good: Error handling
try {
  await generateMutation.mutateAsync(config);
} catch (error) {
  useCharacterWizardStore.setState({ status: 'error' });
  showError('Generation failed');
}
```

## Related Resources

- **Wizard Audit**: `docs/requirements/wizard/WIZARD-AUDIT.md`
- **Wizard Store**: `libs/business/src/store/character-wizard.store.ts`
- **Flow Router**: `libs/business/src/wizard/flow-router.ts`
- **Routes**: `apps/web/lib/routes.ts`
