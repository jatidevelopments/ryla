# AI Toolkit Gradio API Discovery

> **Repository**: https://github.com/ostris/ai-toolkit  
> **Date**: 2025-01-27  
> **Status**: Ready to Execute

## Overview

AI Toolkit uses **Gradio** for its web interface. Gradio automatically exposes REST API endpoints that we can use for programmatic access.

## Gradio API Structure

### Standard Gradio Endpoints

When Gradio is running, it typically exposes:

1. **API Documentation**: `http://<base-url>/docs`
   - OpenAPI/Swagger documentation
   - Lists all available endpoints
   - Shows request/response schemas

2. **API Info**: `http://<base-url>/api/`
   - Lists available API endpoints
   - Shows endpoint details

3. **Prediction Endpoints**: `http://<base-url>/api/predict`
   - Main endpoint for running predictions/training
   - Accepts function name and parameters

4. **Queue Status**: `http://<base-url>/api/queue/status`
   - Check job queue status
   - Get job results

## Discovery Steps

### Step 1: Deploy AI Toolkit Pod

1. Go to RunPod console
2. Search for "AI Toolkit" template (by Ostris)
3. Deploy pod with:
   - GPU: RTX 4090/5090
   - Environment: `PASSWORD=<your-password>`
4. Get HTTP service URL

### Step 2: Access Gradio API Docs

1. Open HTTP service URL in browser
2. Navigate to `/docs`:
   ```
   https://<pod-url>/docs
   ```
3. Review available endpoints
4. Document:
   - Endpoint paths
   - Request schemas
   - Response schemas
   - Authentication requirements

### Step 3: Test API Endpoints

**Using Browser Console**:
```javascript
// Test API info
fetch('https://<pod-url>/api/')
  .then(r => r.json())
  .then(console.log);

// Test prediction endpoint (example)
fetch('https://<pod-url>/api/predict', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fn_index: 0,
    data: [/* parameters */]
  })
})
  .then(r => r.json())
  .then(console.log);
```

**Using curl**:
```bash
# Get API info
curl https://<pod-url>/api/

# Get API docs
curl https://<pod-url>/docs
```

### Step 4: Map UI Functions to API

1. Open Gradio UI
2. Identify functions:
   - Create dataset
   - Start training
   - Check job status
   - Download LoRA
3. Map to API endpoints using `/docs` or `/api/`

## Expected API Endpoints

Based on typical Gradio structure:

### Dataset Management
- `POST /api/predict` with `fn_index` for dataset creation
- Parameters: dataset name, images, etc.

### Training Jobs
- `POST /api/predict` with `fn_index` for training start
- Parameters: dataset ID, model, config, etc.
- `GET /api/queue/status` for job status

### LoRA Download
- `GET /api/predict` or direct file download
- Parameters: job ID, version, etc.

## Authentication

**Gradio Password Protection**:
- Password may only protect UI access
- API endpoints may be unprotected
- Or may require session cookies

**To Verify**:
1. Try accessing `/api/` without authentication
2. If 401/403, check Gradio auth mechanism
3. May need to:
   - Use session cookies from UI login
   - Or API is accessible without auth

## Implementation Strategy

### Option 1: Use Gradio API Directly

```typescript
// Example: Create dataset
const response = await fetch(`${baseUrl}/api/predict`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fn_index: 0, // Dataset creation function index
    data: [
      datasetName,
      imageUrls,
      // ... other parameters
    ],
  }),
});
```

### Option 2: Use Gradio Client Library

Gradio provides a Python client library that can be used:

```python
from gradio_client import Client

client = Client("https://<pod-url>/")
result = client.predict(
    dataset_name="my_dataset",
    images=image_urls,
    fn_index=0
)
```

For TypeScript, we'll need to use the REST API directly.

## Next Steps

1. ✅ **Deploy Pod**: Deploy AI Toolkit pod on RunPod
2. ⏳ **Access /docs**: Check Gradio API documentation
3. ⏳ **Document Endpoints**: Map UI functions to API endpoints
4. ⏳ **Test Authentication**: Verify if API requires auth
5. ⏳ **Update Client**: Update `AIToolkitClient` with real endpoints

## References

- **AI Toolkit GitHub**: https://github.com/ostris/ai-toolkit
- **Gradio API Docs**: https://www.gradio.app/guides/getting-started-with-the-python-client
- **Gradio REST API**: https://www.gradio.app/guides/getting-started-with-the-rest-api
- **Official Docs**: [AI Toolkit Official Documentation](../providers/AI-TOOLKIT-OFFICIAL-DOCS.md)

