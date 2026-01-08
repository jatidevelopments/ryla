# AI Toolkit API Discovery - Execution Plan

> **Status**: Ready to Execute  
> **Date**: 2025-01-27

## Quick Start

We need to discover AI Toolkit's API endpoints to integrate it programmatically. This plan covers both **manual** (browser DevTools) and **automated** (Playwright) approaches.

## Prerequisites

- ✅ RunPod account with API key
- ✅ Browser (Chrome/Edge) with DevTools
- ✅ Node.js and pnpm installed
- ⚠️ **AI Toolkit pod deployed** (see Step 1)

## Step 1: Deploy AI Toolkit Pod

### Find Template in RunPod Console

1. Go to https://www.runpod.io/console
2. Navigate to **Templates** (left sidebar)
3. **Search** for:
   - "AI Toolkit"
   - "Ostrus"
   - "LoRA training"
   - "LoRA trainer"
4. Look for template by creator **"Ostrus"** or similar

### Deploy Pod

**If template found**:
1. Click **Deploy** on AI Toolkit template
2. Configure:
   - **GPU**: RTX 4090 (recommended) or RTX 5090
   - **Container Disk**: 50GB+
   - **Environment Variables**:
     - `PASSWORD`: Set a secure password (save this!)
3. Click **Deploy** and wait 2-3 minutes

**If template NOT found**:
- Check Ostrus AI's GitHub/YouTube for template name
- Or search RunPod community templates
- May need to create custom template from Docker image

### Get HTTP Service URL

1. Once pod is running, click **HTTP Service** link
2. **Save the URL** - you'll need it:
   ```
   https://<pod-id>-<port>.runpod.net
   ```

## Step 2: Choose Discovery Method

### Option A: Manual Discovery (Recommended for First Time)

**Best for**: Understanding the API structure, seeing actual requests/responses

**Steps**:
1. Open AI Toolkit web UI in browser
2. Open DevTools (`F12`)
3. Go to **Network** tab
4. Enable **Preserve log**
5. Filter by **XHR** or **Fetch**
6. Perform actions (login, create dataset, start training)
7. Document each API call

**See**: [API Discovery Guide](./API-DISCOVERY-GUIDE.md) for detailed steps

### Option B: Automated Discovery (Playwright)

**Best for**: Quick discovery, capturing all endpoints at once

**Steps**:
1. Set environment variables:
   ```bash
   export AI_TOOLKIT_BASE_URL="https://<pod-id>-<port>.runpod.net"
   export AI_TOOLKIT_PASSWORD="<your-password>"
   ```
2. Run discovery script:
   ```bash
   pnpm tsx scripts/discover-ai-toolkit-api-browser.ts
   ```
3. Review discovered endpoints in:
   ```
   docs/technical/infrastructure/ai-toolkit/discovered-endpoints.json
   ```

## Step 3: Document Endpoints

### Manual Documentation

As you discover endpoints, add them to `scripts/discover-ai-toolkit-api.ts`:

```typescript
addEndpoint({
  method: 'POST',
  path: '/api/auth/login',
  description: 'Authenticate with password',
  requestBody: { password: 'string' },
  responseExample: { token: 'string' },
});
```

Then run:
```bash
pnpm tsx scripts/discover-ai-toolkit-api.ts
```

This will generate:
- `docs/technical/infrastructure/ai-toolkit/discovered-endpoints.json`
- `libs/business/src/services/ai-toolkit-client.generated.ts`

### Automated Documentation

If using Playwright script, endpoints are automatically saved to:
```
docs/technical/infrastructure/ai-toolkit/discovered-endpoints.json
```

## Step 4: Test API Calls

### Using Browser Console

1. Open AI Toolkit web UI
2. Open DevTools Console
3. Test authentication:
   ```javascript
   fetch('https://<pod-url>/api/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ password: 'your-password' })
   })
   .then(r => r.json())
   .then(console.log);
   ```

### Using curl/Postman

Test each discovered endpoint to verify:
- Authentication works
- Request format is correct
- Response structure matches expectations

## Step 5: Update Client Implementation

Once endpoints are discovered:

1. **Update** `libs/business/src/services/ai-toolkit-client.ts`
2. **Replace placeholder endpoints** with discovered ones
3. **Update authentication flow** based on actual API
4. **Test** with real AI Toolkit pod

### Example Update

**Before** (placeholder):
```typescript
async createDataset(input: CreateDatasetInput): Promise<AIToolkitDataset> {
  await this.authenticate();
  const response = await fetch(`${this.baseUrl}/api/datasets`, {
    // ...
  });
}
```

**After** (discovered):
```typescript
async createDataset(input: CreateDatasetInput): Promise<AIToolkitDataset> {
  await this.authenticate();
  const response = await fetch(`${this.baseUrl}/api/v1/datasets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.sessionToken}`,
    },
    body: JSON.stringify({
      name: input.name,
      images: input.imageUrls,
    }),
  });
  // ...
}
```

## Expected Endpoints

Based on typical web app patterns, expect:

### Authentication
- `POST /api/auth/login` - Login with password
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current session

### Datasets
- `GET /api/datasets` - List all datasets
- `POST /api/datasets` - Create dataset
- `GET /api/datasets/:id` - Get dataset details
- `DELETE /api/datasets/:id` - Delete dataset

### Training Jobs
- `GET /api/jobs` - List all jobs
- `POST /api/jobs` - Create training job
- `GET /api/jobs/:id` - Get job status
- `DELETE /api/jobs/:id` - Cancel job
- `GET /api/jobs/:id/status` - Poll job status

### LoRA Downloads
- `GET /api/jobs/:id/loras` - List LoRA versions
- `GET /api/jobs/:id/loras/:version` - Get LoRA info
- `GET /api/jobs/:id/loras/:version/download` - Download file

## Troubleshooting

### Template Not Found
- Search RunPod community templates
- Check Ostrus AI's GitHub/YouTube for template name
- May need to create custom template from Docker image

### Can't Access Web UI
- Verify HTTP service URL is correct
- Check password matches environment variable
- Wait 2-3 minutes after pod starts

### No API Calls Visible
- Check if uses WebSockets (look for WS connections)
- Try filtering by "All" instead of "XHR"
- Check if API calls are to different domain

### Authentication Issues
- Check if uses cookies instead of tokens
- Look for `Set-Cookie` headers in responses
- May need session-based auth

## Success Criteria

✅ All endpoints discovered and documented  
✅ Authentication flow working  
✅ Dataset creation tested  
✅ Training job creation tested  
✅ LoRA download tested  
✅ Client implementation updated  
✅ Integration tests passing  

## Next Steps After Discovery

1. ✅ Update `AIToolkitClient` with real endpoints
2. ✅ Create `LoraTrainingService` in backend
3. ✅ Add API endpoints for starting/checking training
4. ✅ Hook into character sheet completion
5. ✅ Add background job for status polling

## Files Created

- `scripts/discover-ai-toolkit-api.ts` - Manual endpoint documentation
- `scripts/discover-ai-toolkit-api-browser.ts` - Automated discovery (Playwright)
- `docs/technical/infrastructure/ai-toolkit/API-DISCOVERY-GUIDE.md` - Detailed manual guide
- `docs/technical/infrastructure/ai-toolkit/DISCOVERY-EXECUTION-PLAN.md` - This file

## References

- [Setup Guide](./AI-TOOLKIT-SETUP-GUIDE.md)
- [API Discovery Guide](./API-DISCOVERY-GUIDE.md)
- [Integration Spec](../../../specs/integrations/AI-TOOLKIT-LORA-TRAINING.md)

