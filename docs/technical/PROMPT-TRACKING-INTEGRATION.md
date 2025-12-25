# Prompt Tracking Integration Guide

## Overview

The prompt tracking system automatically records analytics when posts are generated using prompts from the database. This enables:

- **Usage Statistics**: Track which prompts are most popular
- **Success Rates**: Monitor which prompts generate successful images
- **Performance Metrics**: Average generation times per prompt
- **User Analytics**: Understand prompt preferences

## Architecture

### Database Tables

1. **`prompts`** - Stores prompt templates
2. **`prompt_usage`** - Tracks every usage with context
3. **`prompt_favorites`** - User favorites
4. **`posts`** - Extended with `promptId` field

### Integration Points

When creating a post, include the `promptId` and call the tracking service:

```typescript
import { PostPromptTrackingService } from '@ryla/business/services/post-prompt-tracking.service';

// After creating a post
const trackingService = new PostPromptTrackingService(db);

await trackingService.trackPostCreation({
  postId: post.id,
  userId: post.userId,
  characterId: post.characterId,
  jobId: post.jobId,
  promptId: promptId, // ID from prompts table
  scene: post.scene,
  environment: post.environment,
  outfit: post.outfit,
  prompt: post.prompt,
  negativePrompt: post.negativePrompt,
  success: true, // or false if generation failed
  generationTimeMs: 5000, // optional
  errorMessage: undefined, // optional
});
```

## Usage Examples

### Example 1: Creating a Post with Prompt Tracking

```typescript
// 1. Get prompt ID (from user selection or default)
const promptId = 'portrait-selfie-casual'; // or UUID from prompts table

// 2. Create post with promptId
const [post] = await db.insert(posts).values({
  characterId,
  userId,
  jobId,
  promptId, // Link to prompt template
  scene: 'candid_lifestyle',
  environment: 'studio',
  outfit: 'casual-jeans',
  imageUrl: '...',
  prompt: builtPrompt.prompt,
  negativePrompt: builtPrompt.negativePrompt,
  // ... other fields
}).returning();

// 3. Track usage
const trackingService = new PostPromptTrackingService(db);
await trackingService.trackPostCreation({
  postId: post.id,
  userId: post.userId,
  characterId: post.characterId,
  jobId: post.jobId,
  promptId: post.promptId!,
  scene: post.scene,
  environment: post.environment,
  outfit: post.outfit,
  prompt: post.prompt,
  negativePrompt: post.negativePrompt,
  success: true,
  generationTimeMs: Date.now() - startTime,
});
```

### Example 2: Tracking Failed Generations

```typescript
try {
  const post = await createPost(...);
  await trackingService.trackPostCreation({
    ...data,
    success: true,
  });
} catch (error) {
  // Track failure
  await trackingService.trackPostCreation({
    ...data,
    success: false,
    errorMessage: error.message,
  });
}
```

## API Endpoints

### Get Prompt Stats

```typescript
GET /prompts/:id/stats

Response: {
  promptId: string;
  totalUsage: number;
  successCount: number;
  failureCount: number;
  successRate: number; // percentage
  avgGenerationTimeMs: number | null;
  lastUsedAt: Date | null;
}
```

### Get Top Used Prompts

```typescript
GET /prompts/top/used?limit=10

Response: Prompt[]
```

## Migration Steps

1. **Generate migration** for new schema:
   ```bash
   pnpm db:generate
   ```

2. **Run migration**:
   ```bash
   pnpm db:push  # or db:migrate for production
   ```

3. **Seed prompts** from templates:
   ```bash
   pnpm tsx apps/api/src/database/seed-prompts.ts
   ```

4. **Update post creation code** to include `promptId` and tracking

## Best Practices

1. **Always include promptId** when creating posts from prompt templates
2. **Track both successes and failures** for accurate analytics
3. **Include generation time** when available for performance metrics
4. **Don't fail post creation** if tracking fails (log error instead)

## Analytics Queries

### Most Popular Prompts

```sql
SELECT 
  p.id,
  p.name,
  p.usage_count,
  p.success_count,
  (p.success_count::float / NULLIF(p.usage_count, 0) * 100) as success_rate
FROM prompts p
WHERE p.is_active = true
ORDER BY p.usage_count DESC
LIMIT 10;
```

### Prompt Performance by Scene

```sql
SELECT 
  pu.scene,
  COUNT(*) as usage_count,
  AVG(pu.generation_time_ms) as avg_time_ms,
  SUM(CASE WHEN pu.success THEN 1 ELSE 0 END)::float / COUNT(*) * 100 as success_rate
FROM prompt_usage pu
WHERE pu.prompt_id = $1
GROUP BY pu.scene
ORDER BY usage_count DESC;
```

