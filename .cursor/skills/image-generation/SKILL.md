---
name: image-generation
description: Implements image generation workflows for studio, character sheets, and base images. Use when implementing image generation, creating generation services, or when the user mentions image generation, studio generation, or character sheets.
---

# Image Generation

Implements image generation workflows for studio, character sheets, and base images following RYLA patterns.

## Quick Start

When implementing image generation:

1. **Choose Type** - Studio, character-sheet, base-image, or profile-picture
2. **Build Prompt** - Use PromptBuilder service
3. **Select Provider** - Modal/ComfyUI/Fal based on type
4. **Submit Job** - Call generation service
5. **Poll Status** - Check job status until complete

## Generation Types

### Base Image Generation

**When**: Character wizard Step 9  
**Input**: Wizard config (appearance + identity)  
**Output**: 3 base image options  
**Timing**: <30 seconds for 3 images

```typescript
import { BaseImageGenerationService } from '@ryla/business';

const service = new BaseImageGenerationService(db);
const result = await service.generate({
  config: wizardConfig,
  count: 3,
});
```

### Character Sheet Generation

**When**: After base image selection (background)  
**Input**: Selected base image  
**Output**: 7-10 character sheet images  
**Timing**: <5 minutes  
**Purpose**: Training data for LoRA

```typescript
import { CharacterSheetService } from '@ryla/business';

const service = new CharacterSheetService(db);
const result = await service.generate({
  baseImageId: selectedImageId,
  count: 7,
  includeNSFW: userSettings.nsfwEnabled,
});
```

### Studio Generation

**When**: User-triggered content generation  
**Input**: User prompt + character + scene  
**Output**: 1-10 generated images  
**Timing**: <15 seconds (face swap) or after LoRA ready

```typescript
import { StudioGenerationService } from '@ryla/business';

const service = new StudioGenerationService(db);
const result = await service.generate({
  characterId: 'char-123',
  prompt: 'beach scene, sunset',
  scene: 'beach',
  outfit: 'swimsuit',
  count: 4,
});
```

### Profile Picture Generation

**When**: User requests profile picture set  
**Input**: Character ID + set ID  
**Output**: Profile picture set  
**Timing**: <2 minutes

```typescript
import { ProfilePictureSetService } from '@ryla/business';

const service = new ProfilePictureSetService(db);
const result = await service.generate({
  characterId: 'char-123',
  setId: 'set-1',
});
```

## Prompt Building

### Using PromptBuilder

```typescript
import { PromptBuilder } from '@ryla/business/services/prompt-builder';

const builder = new PromptBuilder();

const prompt = builder
  .addCharacter(wizardConfig)
  .addScene('beach')
  .addOutfit('swimsuit')
  .addStyle('photorealistic')
  .build();
```

### Prompt Structure

```typescript
interface PromptConfig {
  character: CharacterConfig;
  scene?: string;
  outfit?: string;
  style?: string;
  quality?: string;
  nsfw?: boolean;
}
```

## Provider Selection

### Modal/ComfyUI (Default)

**Use for:**
- Studio generation
- Character sheets
- Base images

```typescript
const provider = 'modal'; // or 'comfyui'
const result = await service.generate({
  provider,
  workflow: workflowJson,
});
```

### Fal (Alternative)

**Use for:**
- Quick face swap
- Simple generations

```typescript
const provider = 'fal';
const result = await service.generate({
  provider,
  model: 'fal-ai/flux',
});
```

## Job Polling Pattern

### Async Generation

```typescript
// 1. Submit job
const job = await service.submitGeneration(config);

// 2. Poll status
let status = 'pending';
while (status !== 'completed' && status !== 'failed') {
  await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
  status = await service.getJobStatus(job.id);
}

// 3. Get results
if (status === 'completed') {
  const results = await service.getJobResults(job.id);
}
```

### Using tRPC Mutation

```typescript
import { trpc } from '@/trpc/client';

function useImageGeneration() {
  const generateMutation = trpc.generation.studio.useMutation();
  const statusQuery = trpc.generation.jobStatus.useQuery(
    { jobId: jobId },
    { enabled: !!jobId, refetchInterval: 2000 }
  );
  
  const handleGenerate = async () => {
    const result = await generateMutation.mutateAsync({
      characterId: 'char-123',
      prompt: 'beach scene',
    });
    
    // Job ID stored, status query will poll
    setJobId(result.jobId);
  };
}
```

## Service Implementation

### Base Service Pattern

```typescript
// libs/business/src/services/image-generation.service.ts
export class ImageGenerationService {
  constructor(
    private db: DrizzleDb,
    private storage: StorageService,
  ) {}
  
  async generate(config: GenerationConfig): Promise<GenerationResult> {
    // 1. Build prompt
    const prompt = this.buildPrompt(config);
    
    // 2. Select provider
    const provider = this.selectProvider(config);
    
    // 3. Submit job
    const job = await this.submitJob(provider, prompt);
    
    // 4. Store job in database
    await this.storeJob(job);
    
    return { jobId: job.id, status: 'pending' };
  }
  
  async getJobStatus(jobId: string): Promise<JobStatus> {
    // Poll provider for status
    const status = await this.provider.getStatus(jobId);
    
    // Update database
    await this.updateJobStatus(jobId, status);
    
    return status;
  }
}
```

## Error Handling

### Retry Logic

```typescript
async function generateWithRetry(
  config: GenerationConfig,
  maxRetries = 3
): Promise<GenerationResult> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await service.generate(config);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### Timeout Handling

```typescript
async function generateWithTimeout(
  config: GenerationConfig,
  timeout = 300000 // 5 minutes
): Promise<GenerationResult> {
  return Promise.race([
    service.generate(config),
    new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), timeout)
    ),
  ]);
}
```

## Best Practices

### 1. Use Appropriate Provider

```typescript
// ✅ Good: Select provider based on type
const provider = type === 'studio' ? 'modal' : 'fal';

// ❌ Bad: Always use same provider
const provider = 'modal';
```

### 2. Handle Async Operations

```typescript
// ✅ Good: Poll status properly
const status = await pollJobStatus(jobId);

// ❌ Bad: Assume immediate completion
const result = await service.generate(config);
```

### 3. Store Job State

```typescript
// ✅ Good: Store job in database
await db.insert(jobs).values({ id: jobId, status: 'pending' });

// ❌ Bad: Only store in memory
jobs.set(jobId, { status: 'pending' });
```

### 4. Handle Errors Gracefully

```typescript
// ✅ Good: Error handling
try {
  const result = await service.generate(config);
} catch (error) {
  logger.error('Generation failed', { error, config });
  notifyUser('Generation failed, please try again');
}
```

### 5. Optimize Prompt Building

```typescript
// ✅ Good: Reuse prompt builder
const builder = new PromptBuilder();
const prompt = builder.addCharacter(config).build();

// ❌ Bad: Build prompt manually each time
const prompt = `${config.name}, ${config.style}, ...`;
```

## Related Resources

- **Image Generation Flow**: `docs/technical/systems/IMAGE-GENERATION-FLOW.md`
- **Studio Service**: `apps/api/src/modules/image/services/studio-generation.service.ts`
- **Character Sheet Service**: `apps/api/src/modules/image/services/character-sheet.service.ts`
- **Base Image Service**: `apps/api/src/modules/image/services/base-image-generation.service.ts`
