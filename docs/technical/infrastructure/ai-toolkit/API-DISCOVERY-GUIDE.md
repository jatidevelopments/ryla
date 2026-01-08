# AI Toolkit API Discovery Guide

> **Status**: Ready to Execute  
> **Date**: 2025-01-27

## Overview

AI Toolkit provides a web-based interface, but we need to discover its HTTP API endpoints to integrate it programmatically. This guide walks through the discovery process.

## Prerequisites

1. **RunPod Account**: With API key configured
2. **Browser**: Chrome/Edge with DevTools
3. **AI Toolkit Pod**: Deployed on RunPod (see [Setup Guide](./AI-TOOLKIT-SETUP-GUIDE.md))

## Step 1: Deploy AI Toolkit Pod

### Option A: Via RunPod Console (Recommended)

1. Go to https://www.runpod.io/console
2. Navigate to **Templates**
3. Search for "AI Toolkit" or "Ostrus"
4. Click **Deploy** on the AI Toolkit template
5. Configure:
   - **GPU**: RTX 4090 or RTX 5090
   - **Container Disk**: 50GB+
   - **Environment Variables**:
     - `PASSWORD`: Set a secure password
6. Click **Deploy** and wait 2-3 minutes

### Option B: Via MCP (If Template Found)

Once we find the template ID, we can deploy via MCP:

```bash
# Note: Requires user confirmation per RunPod safety rules
Create RunPod pod:
- Name: ryla-ai-toolkit-discovery
- Template: <template-id>
- GPU: RTX 4090
- Container Disk: 50GB
- Env: PASSWORD=<your-password>
```

## Step 2: Access Web Interface

1. Once pod is running, click **HTTP Service** link in RunPod console
2. You should see AI Toolkit login page
3. Enter the password you set
4. You should see the AI Toolkit dashboard

**Save the HTTP service URL** - we'll need it for the API client:
```
https://<pod-id>-<port>.runpod.net
```

## Step 3: Discover API Endpoints

### Setup Browser DevTools

1. **Open DevTools**: Press `F12` or `Cmd+Option+I` (Mac) / `Ctrl+Shift+I` (Windows)
2. **Go to Network Tab**: Click "Network" in DevTools
3. **Enable Preserve Log**: Check "Preserve log" checkbox
4. **Filter XHR/Fetch**: Click "XHR" or "Fetch" filter to see only API calls
5. **Clear Network Log**: Click clear button (🚫) to start fresh

### Discover Authentication Endpoint

1. **Logout** (if logged in) or refresh page
2. **Enter password** in login form
3. **Click Login**
4. **Observe Network Tab**: Look for POST request to login endpoint
5. **Document**:
   - Method: `POST`
   - URL: e.g., `/api/auth/login` or `/login`
   - Request Body: `{ "password": "..." }`
   - Response: `{ "token": "..." }` or `{ "sessionId": "..." }`

### Discover Dataset Endpoints

1. **Create New Dataset**:
   - Click "New Dataset" or "Datasets" → "Create"
   - Enter dataset name
   - Upload images (or provide URLs)
   - Click "Create" or "Save"
2. **Observe Network Tab**: Look for POST request
3. **Document**:
   - Method: `POST`
   - URL: e.g., `/api/datasets` or `/datasets`
   - Request Body: `{ "name": "...", "images": [...] }`
   - Response: `{ "id": "...", "name": "..." }`

4. **List Datasets**:
   - Navigate to datasets list
   - Observe GET request
   - Document: Method, URL, Response

5. **Get Dataset Details**:
   - Click on a dataset
   - Observe GET request with dataset ID
   - Document: Method, URL pattern (e.g., `/api/datasets/:id`)

### Discover Training Job Endpoints

1. **Create Training Job**:
   - Select a dataset
   - Click "New Job" or "Train"
   - Fill in training parameters:
     - Base model (One 2.1, One 2.2, Flux)
     - Trigger word
     - Steps, learning rate, etc.
   - Click "Start Training" or "Create Job"
2. **Observe Network Tab**: Look for POST request
3. **Document**:
   - Method: `POST`
   - URL: e.g., `/api/jobs` or `/jobs`
   - Request Body: Full training configuration
   - Response: `{ "id": "...", "status": "..." }`

4. **Check Job Status**:
   - Navigate to jobs list or job details
   - Observe GET request
   - Document: Method, URL pattern (e.g., `/api/jobs/:id`)

5. **Monitor Progress**:
   - Watch for polling requests (if auto-refresh)
   - Document polling interval and endpoint

### Discover LoRA Download Endpoints

1. **View Completed Job**:
   - Navigate to completed training job
   - Look for "Download" or "LoRA" section
2. **List LoRA Versions**:
   - If multiple versions shown, observe GET request
   - Document: Method, URL (e.g., `/api/jobs/:id/loras`)
3. **Download LoRA**:
   - Click download button
   - Observe GET request (may be direct file download)
   - Document: Method, URL pattern (e.g., `/api/jobs/:id/loras/:version/download`)

## Step 4: Document Endpoints

### Manual Documentation

Create a file: `docs/technical/infrastructure/ai-toolkit/discovered-endpoints.json`

```json
[
  {
    "method": "POST",
    "path": "/api/auth/login",
    "description": "Authenticate with password",
    "requestBody": {
      "password": "string"
    },
    "responseExample": {
      "token": "string"
    },
    "headers": {
      "Content-Type": "application/json"
    }
  },
  {
    "method": "GET",
    "path": "/api/datasets",
    "description": "List all datasets"
  }
]
```

### Using Discovery Script

1. **Edit** `scripts/discover-ai-toolkit-api.ts`
2. **Add endpoints** using `addEndpoint()` function:
   ```typescript
   addEndpoint({
     method: 'POST',
     path: '/api/auth/login',
     description: 'Authenticate with password',
     requestBody: { password: 'string' },
     responseExample: { token: 'string' },
   });
   ```
3. **Run script**:
   ```bash
   pnpm tsx scripts/discover-ai-toolkit-api.ts
   ```
4. **Review generated files**:
   - `docs/technical/infrastructure/ai-toolkit/discovered-endpoints.json`
   - `libs/business/src/services/ai-toolkit-client.generated.ts`

## Step 5: Test API Calls

### Using Browser Console

1. **Open DevTools Console** (not Network tab)
2. **Test authentication**:
   ```javascript
   fetch('https://<pod-url>/api/auth/login', {
     method: 'POST',
     headers: { 'Content-Type': 'application/json' },
     body: JSON.stringify({ password: 'your-password' })
   })
   .then(r => r.json())
   .then(console.log);
   ```
3. **Test other endpoints** with discovered URLs

### Using Postman/Insomnia

1. **Import endpoints** from discovered JSON
2. **Set base URL** to AI Toolkit pod URL
3. **Test each endpoint** manually
4. **Document** request/response formats

## Step 6: Update Client Implementation

Once endpoints are discovered:

1. **Update** `libs/business/src/services/ai-toolkit-client.ts`
2. **Replace placeholder endpoints** with discovered ones
3. **Update authentication flow** based on actual API
4. **Test** with real AI Toolkit pod

## Common API Patterns

Based on typical web app patterns, AI Toolkit likely uses:

### REST API
- `GET /api/datasets` - List datasets
- `POST /api/datasets` - Create dataset
- `GET /api/datasets/:id` - Get dataset
- `DELETE /api/datasets/:id` - Delete dataset

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Training Jobs
- `GET /api/jobs` - List jobs
- `POST /api/jobs` - Create job
- `GET /api/jobs/:id` - Get job status
- `DELETE /api/jobs/:id` - Cancel job

### LoRA Downloads
- `GET /api/jobs/:id/loras` - List LoRA versions
- `GET /api/jobs/:id/loras/:version` - Get LoRA info
- `GET /api/jobs/:id/loras/:version/download` - Download file

## Troubleshooting

### No API Calls Visible
- Check if app uses WebSockets (look for WS connections)
- Check if API calls are to different domain (CORS)
- Try filtering by "All" instead of "XHR"

### Authentication Issues
- Check if uses cookies instead of tokens
- Look for `Set-Cookie` headers in responses
- Check if uses session-based auth

### CORS Errors
- API may not allow cross-origin requests
- May need to use server-side proxy
- Or make requests from RunPod pod itself

## Next Steps

After discovering endpoints:

1. ✅ Document all endpoints in JSON
2. ✅ Update `AIToolkitClient` with real endpoints
3. ✅ Test authentication flow
4. ✅ Test dataset creation
5. ✅ Test training job creation
6. ✅ Test LoRA download
7. ✅ Integrate into `LoraTrainingService`

## References

- [Setup Guide](./AI-TOOLKIT-SETUP-GUIDE.md)
- [Integration Spec](../../../specs/integrations/AI-TOOLKIT-LORA-TRAINING.md)
- [Discovery Script](../../../../scripts/discover-ai-toolkit-api.ts)

