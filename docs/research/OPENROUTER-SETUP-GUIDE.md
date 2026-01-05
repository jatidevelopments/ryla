# OpenRouter.ai Setup Guide - Auto-Detection (Option 1)

> **Date**: 2025-12-17  
> **Status**: Ready to Use  
> **Method**: Auto-detection (Option 1)

---

## Quick Setup (5 minutes)

### Step 1: Get OpenRouter API Key

1. Sign up at https://openrouter.ai/
2. Go to https://openrouter.ai/keys
3. Create a new API key
4. Copy the key (starts with `sk-or-v1-...`)

### Step 2: Add to Environment Variables

**For Backend API** (`apps/api/.env.local`):
```bash
# OpenRouter (LLM Prompt Enhancement) - Auto-detection will use this
OPENROUTER_API_KEY=sk-or-v1-your-key-here
OPENROUTER_DEFAULT_MODEL=deepseek/deepseek-chat

# Optional: Keep as fallback
GEMINI_API_KEY=your-gemini-key
OPENAI_API_KEY=your-openai-key
```

**For Frontend** (if needed in `apps/web/.env.local`):
```bash
NEXT_PUBLIC_OPENROUTER_API_KEY=sk-or-v1-your-key-here
```

### Step 3: That's It! ✅

The auto-detection is already implemented. Just add the API key and it will automatically:
1. ✅ Prefer OpenRouter if `OPENROUTER_API_KEY` is set
2. ✅ Fallback to Gemini if OpenRouter unavailable
3. ✅ Fallback to OpenAI if Gemini unavailable
4. ✅ Use Mock provider for testing if no keys set

---

## How It Works

### Auto-Detection Priority

The `createAutoEnhancer()` function checks in this order:

```typescript
1. OpenRouter (if OPENROUTER_API_KEY is set) ⭐ Preferred
2. Gemini (if GEMINI_API_KEY is set)
3. OpenAI (if OPENAI_API_KEY is set)
4. Mock (testing only)
```

### Usage Example

```typescript
import { createAutoEnhancer } from '@ryla/business/prompts';
import { PromptBuilder } from '@ryla/business/prompts';

// Auto-detection: Uses OpenRouter if OPENROUTER_API_KEY is set
const enhancer = createAutoEnhancer();

// Use with PromptBuilder
const builder = new PromptBuilder()
  .withCharacter(characterDNA)
  .withScene('indoor.cafe')
  .withExpression('positive.smile');

// Enhance with AI (automatically uses OpenRouter)
const result = await builder.buildWithAI(enhancer, {
  strength: 0.8,
  focus: ['realism', 'lighting'],
});

console.log(result.enhancement.changes); // What was improved
console.log(result.prompt); // Enhanced prompt
```

---

## Recommended Models

### Cost-Optimized (Recommended for MVP)
```bash
OPENROUTER_DEFAULT_MODEL=deepseek/deepseek-chat
```
- **50-70% cheaper** than OpenAI
- Good quality for prompt enhancement
- Fast response times

### Balanced Quality/Cost
```bash
OPENROUTER_DEFAULT_MODEL=openai/gpt-4o-mini
```
- Current default
- Good balance of quality and cost

### Premium Quality
```bash
OPENROUTER_DEFAULT_MODEL=anthropic/claude-opus-4.5
```
- Best quality
- Higher cost

---

## Testing

### Test Auto-Detection

```typescript
import { createAutoEnhancer } from '@ryla/business/prompts';

const enhancer = createAutoEnhancer();

// Check which provider is being used
console.log('Provider:', enhancer.isAvailable() ? 'Available' : 'Not available');

// Test enhancement
const result = await enhancer.enhance({
  prompt: "A woman in a coffee shop",
  style: "ultraRealistic",
});

console.log('Enhanced:', result.enhancedPrompt);
console.log('Provider used:', result.usage ? 'OpenRouter/Gemini/OpenAI' : 'Mock');
```

### Verify OpenRouter is Being Used

1. Check logs - OpenRouter requests will show in OpenRouter dashboard
2. Check costs - OpenRouter dashboard shows usage
3. Check response - OpenRouter models may have slightly different response format

---

## Troubleshooting

### OpenRouter Not Being Used?

**Check**:
1. ✅ `OPENROUTER_API_KEY` is set in environment
2. ✅ Key is valid (starts with `sk-or-v1-`)
3. ✅ Environment variables are loaded (restart server if needed)

**Debug**:
```typescript
const enhancer = createAutoEnhancer();
console.log('Available:', enhancer.isAvailable());
// Should be true if OPENROUTER_API_KEY is set
```

### Fallback Working?

If OpenRouter fails, it should automatically fallback to:
1. Gemini (if `GEMINI_API_KEY` is set)
2. OpenAI (if `OPENAI_API_KEY` is set)
3. Mock (for testing)

---

## Cost Monitoring

### OpenRouter Dashboard

1. Go to https://openrouter.ai/activity
2. View usage and costs
3. Monitor token usage per model

### Expected Costs

- **DeepSeek**: ~$0.0001-0.0002 per prompt enhancement
- **GPT-4o-mini**: ~$0.0002-0.0003 per prompt enhancement
- **Claude Opus**: ~$0.001-0.002 per prompt enhancement

**Monthly estimate** (1000 enhancements):
- DeepSeek: ~$0.10-0.20
- GPT-4o-mini: ~$0.20-0.30
- Claude Opus: ~$1-2

---

## Next Steps

1. ✅ Add `OPENROUTER_API_KEY` to environment
2. ✅ Set `OPENROUTER_DEFAULT_MODEL` (recommend `deepseek/deepseek-chat`)
3. ✅ Test with `createAutoEnhancer()`
4. ✅ Monitor costs in OpenRouter dashboard
5. ✅ Compare quality vs direct APIs
6. ✅ Optimize model selection based on results

---

## References

- **Implementation**: `libs/business/src/prompts/ai-enhancer.ts`
- **Research**: `docs/research/OPENROUTER-AI-RESEARCH.md`
- **Implementation Summary**: `docs/research/OPENROUTER-IMPLEMENTATION.md`
- **OpenRouter Dashboard**: https://openrouter.ai/

---

**Status**: ✅ Ready to use - Just add API key!

