# Test RunPod Endpoints - Quick Guide

## Option 1: Add API Key to .env (Recommended)

1. **Get your RunPod API Key**:
   - Go to: https://www.runpod.io/console/user/settings
   - Copy your API key

2. **Add to .env file**:
   ```bash
   echo "RUNPOD_API_KEY=your_key_here" >> .env
   ```

3. **Run test**:
   ```bash
   pnpm test:runpod
   ```

## Option 2: Manual Test with API Key

```bash
# Test with API key as argument
./scripts/test-runpod-endpoints-manual.sh YOUR_API_KEY

# Or set environment variable
export RUNPOD_API_KEY=your_key_here
./scripts/test-runpod-endpoints-manual.sh
```

## Option 3: Test via RunPod Console

1. Go to: https://www.runpod.io/console/serverless
2. Click on: `ryla-prod-guarded-flux-dev-endpoint -fb`
3. Click **"Test Endpoint"** button
4. Paste this input:
   ```json
   {
     "task_type": "base_image",
     "prompt": "A beautiful woman, 25 years old, blonde hair, blue eyes, portrait, high quality",
     "nsfw": false,
     "num_images": 1,
     "seed": 42
   }
   ```
5. Click **"Run"**
6. Wait 30-60s for cold start, then see results

Repeat for `ryla-prod-guarded-z-image-turbo-endpoint -fb`

## Expected Results

- ✅ **Status**: `COMPLETED`
- ✅ **Output**: Contains `images` array with base64-encoded images
- ✅ **Time**: 30-60s (cold start), 10-20s (warm)

## Troubleshooting

If test fails:
1. Check RunPod Console → Endpoints → Logs
2. Verify network volume is attached
3. Verify models exist on network volume
4. Check endpoint status (should be active)

