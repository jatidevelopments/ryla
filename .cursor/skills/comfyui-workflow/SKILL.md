---
name: comfyui-workflow
description: Creates and manages ComfyUI workflows for image generation. Use when creating ComfyUI workflows, converting workflow formats, deploying ComfyUI handlers, or when the user mentions ComfyUI workflows.
---

# ComfyUI Workflow Management

Creates and manages ComfyUI workflows for image generation following RYLA patterns.

## Quick Start

When working with ComfyUI workflows:

1. **Create Workflow** - Use ComfyUI UI to design workflow
2. **Export JSON** - Export workflow as JSON
3. **Convert Format** - Convert UI JSON to API JSON
4. **Test Workflow** - Test with ComfyUI API
5. **Deploy Handler** - Deploy to Modal if needed

## Workflow Creation

### Using ComfyUI UI

1. Open ComfyUI interface
2. Design workflow with nodes
3. Connect nodes (inputs/outputs)
4. Configure node parameters
5. Export as JSON

### Workflow Structure

```json
{
  "1": {
    "inputs": {
      "seed": 12345,
      "steps": 20,
      "cfg": 7.0,
      "sampler_name": "euler",
      "scheduler": "normal",
      "denoise": 1.0,
      "model": ["4", 0],
      "positive": ["6", 0],
      "negative": ["7", 0],
      "latent_image": ["5", 0]
    },
    "class_type": "KSampler",
    "_meta": {
      "title": "KSampler"
    }
  }
}
```

## Workflow Conversion

### UI JSON → API JSON

ComfyUI exports two formats:
- **UI JSON**: Includes UI metadata, node positions
- **API JSON**: Clean format for API calls

### Conversion Process

```typescript
import { convertWorkflow } from '@ryla/business/services/comfyui-workflow-builder';

// Convert UI JSON to API JSON
const apiJson = convertWorkflow(uiJson);

// Use API JSON for generation
await comfyuiClient.queuePrompt(apiJson);
```

### Conversion Function

```typescript
function convertWorkflow(uiJson: ComfyUIWorkflow): ComfyUIAPIWorkflow {
  const apiJson: ComfyUIAPIWorkflow = {};
  
  // Extract only workflow data, remove UI metadata
  for (const [nodeId, node] of Object.entries(uiJson)) {
    if (node.class_type) {
      apiJson[nodeId] = {
        inputs: node.inputs,
        class_type: node.class_type,
      };
    }
  }
  
  return apiJson;
}
```

## Workflow Testing

### Test with ComfyUI API

```typescript
import { ComfyUIClient } from '@ryla/business/services/comfyui-client';

const client = new ComfyUIClient('http://localhost:8188');

// Queue workflow
const promptId = await client.queuePrompt(workflowJson);

// Poll for completion
let status = 'pending';
while (status !== 'completed') {
  await new Promise(resolve => setTimeout(resolve, 2000));
  status = await client.getStatus(promptId);
}

// Get results
const results = await client.getResults(promptId);
```

## Workflow Builder Service

### Using WorkflowBuilder

```typescript
import { ComfyUIWorkflowBuilder } from '@ryla/business/services/comfyui-workflow-builder';

const builder = new ComfyUIWorkflowBuilder();

const workflow = builder
  .addCheckpointLoader('model.safetensors')
  .addCLIPTextEncode('positive prompt', 'positive')
  .addCLIPTextEncode('negative prompt', 'negative')
  .addEmptyLatentImage(1024, 1024)
  .addKSampler({
    seed: 12345,
    steps: 20,
    cfg: 7.0,
  })
  .addVAEDecode()
  .addSaveImage('output')
  .build();
```

## Deploying Workflows

### Store Workflow Files

```
workflows/
├── character-sheet.json
├── base-image.json
├── studio.json
└── profile-picture.json
```

### Load Workflow

```typescript
import fs from 'fs';
import path from 'path';

const workflowPath = path.join(process.cwd(), 'workflows', 'character-sheet.json');
const workflowJson = JSON.parse(fs.readFileSync(workflowPath, 'utf-8'));
```

## Modal Integration

### Deploy ComfyUI Handler

```python
# apps/modal/handlers/comfyui.py
import modal

@modal.function(
    image=comfyui_image,
    gpu="A100",
    timeout=1800,
)
def generate_with_workflow(workflow_json: dict):
    from utils.comfyui import execute_workflow
    
    return execute_workflow(workflow_json)
```

### Use in Service

```typescript
import { ModalComfyUIAdapter } from '@ryla/business/services/modal-comfyui-adapter';

const adapter = new ModalComfyUIAdapter();
const result = await adapter.generate(workflowJson);
```

## Best Practices

### 1. Version Control Workflows

```bash
# ✅ Good: Store workflows in git
git add workflows/character-sheet.json

# ❌ Bad: Hardcode workflows in code
const workflow = { /* ... */ };
```

### 2. Test Before Deploying

```typescript
// ✅ Good: Test locally first
const result = await testWorkflow(workflowJson);
if (result.success) {
  await deployWorkflow(workflowJson);
}

// ❌ Bad: Deploy untested workflows
await deployWorkflow(workflowJson);
```

### 3. Use Workflow Builder

```typescript
// ✅ Good: Use builder for consistency
const workflow = builder.addCheckpointLoader(model).build();

// ❌ Bad: Manual JSON construction
const workflow = { "1": { /* ... */ } };
```

### 4. Document Workflow Purpose

```json
{
  "_meta": {
    "title": "Character Sheet Generation",
    "description": "Generates 7-10 character sheet images",
    "version": "1.0.0"
  },
  "1": { /* ... */ }
}
```

### 5. Handle Errors

```typescript
// ✅ Good: Error handling
try {
  const result = await executeWorkflow(workflowJson);
} catch (error) {
  logger.error('Workflow execution failed', { error, workflowJson });
  throw new WorkflowExecutionError('Failed to execute workflow');
}
```

## Related Resources

- **Workflow Conversion**: `docs/ops/COMFYUI-WORKFLOW-CONVERSION.md`
- **Workflow Builder**: `libs/business/src/services/comfyui-workflow-builder.ts`
- **Workflow Files**: `workflows/`
- **Modal Handlers**: `apps/modal/handlers/comfyui.py`
