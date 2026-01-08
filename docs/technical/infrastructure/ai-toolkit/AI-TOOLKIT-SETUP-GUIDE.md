# AI Toolkit Setup Guide for LoRA Training

> **Status**: Design Phase  
> **Date**: 2025-01-27  
> **Based on**: [Hyperrealistic Consistent Characters Workflow](../../../research/youtube-videos/PhiPASFYBmk/analysis.md)

## Quick Start

AI Toolkit (by Ostrus AI) is a web-based LoRA training tool that runs on RunPod. It supports training LoRAs for One 2.1/2.2, Flux, and other models.

## RunPod Template Setup

### Step 1: Find AI Toolkit Template

1. Go to RunPod Console: https://www.runpod.io/console
2. Navigate to **Templates** → Search for "AI Toolkit"
3. Look for template by creator **"Ostrus"** or **"ostrus"**
4. Note the **Template ID** (e.g., `ai-toolkit-ostrus`)

### Step 2: Deploy Pod

**Via RunPod Console**:
1. Click **Deploy** on AI Toolkit template
2. Select GPU: **RTX 5090** (recommended) or **RTX 4090** (works)
3. Set **Container Disk**: 50GB+ (for models and training data)
4. Set **Environment Variables**:
   - `PASSWORD`: Set a secure password for AI Toolkit web UI
5. Click **Deploy**

**Via MCP** (once template ID is known):
```bash
# Note: Requires confirmation per RunPod safety rules
Create RunPod pod:
- Name: ryla-ai-toolkit-test
- Template: ai-toolkit-ostrus (template ID)
- GPU: RTX 4090
- Container Disk: 50GB
- Env: PASSWORD=<your-password>
```

### Step 3: Access AI Toolkit

1. Wait for pod to start (2-3 minutes)
2. Click **HTTP Service** link in RunPod console
3. Enter password set in environment variables
4. You should see AI Toolkit web interface

**Note**: Save the HTTP service URL - you'll need it for the API client:
```
https://<pod-id>-<port>.runpod.net
```

## API Discovery

AI Toolkit provides a web UI, but we need to interact with it programmatically. The API endpoints need to be discovered by:

1. **Browser DevTools**: Open Network tab, perform actions in UI, observe API calls
2. **API Documentation**: Check if Ostrus AI has published API docs
3. **Reverse Engineering**: Inspect web UI JavaScript for API endpoints

### Expected Endpoints (Placeholder - Needs Verification)

Based on typical web app patterns:

```
POST   /api/auth/login          # Authenticate with password
GET    /api/datasets            # List datasets
POST   /api/datasets            # Create dataset
GET    /api/datasets/:id        # Get dataset details
POST   /api/jobs                # Create training job
GET    /api/jobs/:id            # Get job status
GET    /api/jobs/:id/loras      # List LoRA versions
GET    /api/jobs/:id/loras/:version/download  # Download LoRA
```

## Configuration

### Environment Variables

Add to `.env`:

```bash
# AI Toolkit Configuration
AI_TOOLKIT_BASE_URL=https://<pod-id>-<port>.runpod.net
AI_TOOLKIT_PASSWORD=<your-password>

# RunPod Configuration (for pod management)
RUNPOD_API_KEY=<your-runpod-api-key>
RUNPOD_AI_TOOLKIT_TEMPLATE_ID=ai-toolkit-ostrus  # Template ID
```

### Training Parameters

Based on video learnings:

**For One 2.1/2.2 Models**:
- Steps: 2000-3000
- Checkpoint Interval: 500 steps
- Resolution: 512x512 (low VRAM mode)
- Learning Rate: 0.0001
- Low VRAM: true

**For Flux Models**:
- Steps: 700-1000
- Checkpoint Interval: 100 steps
- Resolution: 1024x1024
- Learning Rate: 0.0001
- Low VRAM: false (if GPU has enough VRAM)

## Testing

### Manual Test Flow

1. **Deploy Pod**: Use RunPod console or MCP
2. **Access Web UI**: Open HTTP service URL, enter password
3. **Create Dataset**:
   - Click "New Dataset"
   - Upload test images (7-10 character images)
   - Name dataset (e.g., "test-character")
4. **Create Training Job**:
   - Select dataset
   - Choose base model (One 2.1)
   - Set trigger word
   - Configure training parameters
   - Start training
5. **Monitor Progress**:
   - Watch training progress
   - Check sample images
6. **Download LoRA**:
   - When complete, download final LoRA
   - Verify file is `.safetensors` format

### Automated Test

Once API client is implemented:

```typescript
const client = new AIToolkitClient({
  baseUrl: process.env.AI_TOOLKIT_BASE_URL!,
  password: process.env.AI_TOOLKIT_PASSWORD!,
});

// Test health check
const healthy = await client.healthCheck();
console.log('AI Toolkit healthy:', healthy);

// Test dataset creation
const dataset = await client.createDataset({
  name: 'test-dataset',
  imageUrls: ['https://example.com/image1.jpg'],
});

// Test training job
const job = await client.createTrainingJob({
  datasetId: dataset.id,
  name: 'test-job',
  baseModel: 'one-2.1',
  triggerWord: 'testchar',
});

// Poll for completion
let status = await client.getJobStatus(job.id);
while (status.status === 'training') {
  await sleep(30000); // 30 seconds
  status = await client.getJobStatus(job.id);
}

// Download LoRA
const loraFile = await client.downloadLoRA(job.id, 'final');
```

## Cost Estimation

Based on video:
- **Training Time**: ~1.5 hours per LoRA
- **GPU Cost**: 
  - RTX 5090: ~$0.50-1.00/hour
  - RTX 4090: ~$0.30-0.70/hour
- **Total Cost**: ~$0.45-1.50 per LoRA

**Optimization**:
- Use on-demand pods (stop after training)
- Batch multiple training jobs
- Use cheaper GPUs for testing

## Troubleshooting

### Pod Won't Start
- Check RunPod account balance
- Verify template ID is correct
- Check GPU availability in region

### Can't Access Web UI
- Verify HTTP service link is correct
- Check password matches environment variable
- Wait 2-3 minutes after pod starts

### Training Fails
- Check GPU has enough VRAM (use low VRAM mode)
- Verify images are valid (not corrupted)
- Check dataset has enough images (minimum 7-10)
- Review training logs in AI Toolkit UI

### API Calls Fail
- Verify base URL is correct (no trailing slash)
- Check password is correct
- Verify authentication endpoint works
- Check CORS settings (if calling from browser)

## Next Steps

1. **Deploy Test Pod**: Use RunPod console to deploy AI Toolkit pod
2. **Discover API**: Use browser DevTools to find actual API endpoints
3. **Update Client**: Update `AIToolkitClient` with real endpoints
4. **Test Training**: Run a test training job manually
5. **Implement Service**: Create `LoraTrainingService` in backend
6. **Add Automation**: Hook into character sheet completion

## References

- [Video Analysis](../../../research/youtube-videos/PhiPASFYBmk/analysis.md)
- [Integration Spec](../../../specs/integrations/AI-TOOLKIT-LORA-TRAINING.md)
- [AI Toolkit GitHub](https://github.com/ostrus/ai-toolkit) (if available)
- [Ostrus AI YouTube](https://www.youtube.com/@OstrusAI) (for tutorials)

