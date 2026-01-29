# Modal.com Best Practices for RYLA

> **Last Updated**: 2026-01-27  
> **Status**: Active Guidelines

---

## Overview

RYLA uses Modal.com for serverless ComfyUI deployments. This document covers best practices, common patterns, troubleshooting, and performance optimization.

---

## Table of Contents

1. [Core Principles](#core-principles)
2. [Modal CLI Commands](#modal-cli-commands)
3. [Image Building](#image-building)
4. [Function Patterns](#function-patterns)
5. [Error Handling](#error-handling)
6. [Cold Start Handling](#cold-start-handling)
7. [Logging](#logging)
8. [Common Issues](#common-issues)
9. [Performance Optimization](#performance-optimization)
10. [Security](#security)

---

## Core Principles

### Stateless Functions
- Functions should be stateless and idempotent
- Don't rely on container state between requests
- Use volumes for persistent data

### Cold Starts
- First request can take 2-5 minutes
- Plan for cold start delays
- Use keep-alive windows for frequently used functions

### Image Building
- Build images incrementally
- Cache dependencies in separate layers
- Test builds locally before deploying

### Error Handling
- Always handle timeouts gracefully
- Retry with exponential backoff
- Log errors for debugging

---

## Modal CLI Commands

### Common Commands

```bash
# Deploy app
modal deploy apps/modal/app.py

# View logs (ALWAYS use timeout)
timeout 30 modal app logs <app-name> || echo "Timeout after 30s"

# List apps
modal app list

# Run function locally
modal run apps/modal/app.py::function_name
```

### ⚠️ IMPORTANT: Timeout Handling

**Modal CLI commands (especially `modal app logs`) can hang indefinitely.**

**Always use timeouts:**

```bash
# ❌ Bad: No timeout (can hang forever)
modal app logs my-app

# ✅ Good: With timeout
timeout 30 modal app logs my-app || echo "Logs timeout after 30s"

# ✅ Good: In scripts with retry
for i in {1..3}; do
  timeout 30 modal app logs my-app && break || sleep 5
done
```

### In TypeScript/Node.js Scripts

```typescript
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function getModalLogs(
  appName: string, 
  timeoutSeconds = 30
): Promise<string> {
  try {
    const { stdout, stderr } = await Promise.race([
      execAsync(`modal app logs ${appName}`, {
        timeout: timeoutSeconds * 1000,
        maxBuffer: 10 * 1024 * 1024, // 10MB
      }),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout')), timeoutSeconds * 1000)
      )
    ]);
    
    return (stdout || '') + (stderr || '');
  } catch (error: any) {
    if (error.message === 'Timeout' || error.code === 'ETIMEDOUT') {
      return `⚠️  Logs request timed out after ${timeoutSeconds}s. Try again or check Modal dashboard.`;
    }
    throw error;
  }
}
```

---

## Image Building

### 1. Incremental Builds

**✅ Good**: Build incrementally, cache layers

```python
image = (
    modal.Image.debian_slim()
    .pip_install(["torch", "transformers"])  # Base deps first (cached)
    .run_commands(["git clone ComfyUI"])      # Then ComfyUI
    .run_commands(["install custom nodes"])   # Then custom nodes
)
```

**❌ Bad**: Everything in one layer

```python
image = modal.Image.debian_slim().run_commands([
    "pip install torch transformers && git clone ComfyUI && install nodes"
])
```

### 2. Copy Local Files

**✅ Good**: Copy files explicitly

```python
image = image.copy_local_file(
    "apps/modal/utils/comfyui.py",
    "/root/utils/comfyui.py"
)
```

**❌ Bad**: Assume files are available

```python
# Files won't be in image unless explicitly copied
from utils.comfyui import launch_server  # Will fail!
```

### 3. Handle Missing Files

**✅ Good**: Try/catch for optional files

```python
try:
    image = image.copy_local_file(
        "apps/modal/utils/comfyui.py",
        "/root/utils/comfyui.py"
    )
except FileNotFoundError:
    print("⚠️  Utils file not found, using fallback")
    # Fallback implementation
```

---

## Function Patterns

### Class-Based Functions (Recommended)

```python
@app.cls(
    scaledown_window=300,  # Keep container alive 5 min
    gpu="A100",
    volumes={"/root/models": volume},
    timeout=1800,
)
@modal.concurrent(max_inputs=5)
class ComfyUI:
    port: int = 8000
    
    @modal.enter()
    def launch_comfy_background(self):
        """Launch once when container starts."""
        from utils.comfyui import launch_comfy_server
        launch_comfy_server(self.port)
    
    @modal.method()
    def generate(self, workflow_json: dict):
        """Execute workflow."""
        from utils.comfyui import poll_server_health, execute_workflow_via_api
        poll_server_health(self.port)
        return execute_workflow_via_api(workflow_json, port=self.port)
```

### FastAPI Endpoints

```python
@app.asgi_app()
def fastapi_app(self):
    """FastAPI endpoint."""
    from fastapi import FastAPI, HTTPException
    from pydantic import BaseModel
    
    app = FastAPI(title="ComfyUI API")
    
    class WorkflowRequest(BaseModel):
        workflow: dict
    
    @app.post("/generate")
    async def generate(request: WorkflowRequest):
        try:
            result = self.generate.remote(request.workflow)
            return result
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.get("/health")
    async def health():
        return {"status": "healthy"}
    
    return app
```

---

## Error Handling

### Timeout Handling

```python
# Set appropriate timeouts
@app.function(timeout=1800)  # 30 minutes
def long_running_task():
    # ...

# Handle timeouts in code
try:
    result = execute_workflow(workflow, timeout=1200)
except TimeoutError:
    raise Exception("Workflow execution timeout after 20 minutes")
```

### Connection Errors with Retry

```python
import time
import requests

def poll_with_retry(url, max_retries=5, delay=2):
    for i in range(max_retries):
        try:
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                return response.json()
        except requests.exceptions.RequestException as e:
            if i < max_retries - 1:
                time.sleep(delay * (i + 1))  # Exponential backoff
            else:
                raise Exception(f"Max retries exceeded: {e}")
    raise Exception("Max retries exceeded")
```

### Health Checks

```python
def execute_workflow(workflow_json: dict):
    # Always check health first
    poll_server_health(port=8000)
    
    # Then execute
    return execute_workflow_via_api(workflow_json, port=8000)
```

---

## Cold Start Handling

### Problem

First request to a Modal function can take 2-5 minutes:
- Container startup: ~30s
- ComfyUI installation: ~1-2 min
- Model loading: ~1-2 min
- Server startup: ~30s

### Solutions

#### 1. Keep-Alive Window

```python
@app.cls(scaledown_window=300)  # Keep alive 5 minutes
```

#### 2. Warm-Up Functions

```python
@app.function(schedule=modal.Cron("*/5 * * * *"))  # Every 5 minutes
def keep_warm():
    return {"status": "warm"}
```

#### 3. Client-Side Timeout

```typescript
// Set longer timeout for first request
const response = await fetch(url, {
  signal: AbortSignal.timeout(300000)  // 5 minutes
});
```

---

## Logging

### Structured Logging

```python
import logging

logger = logging.getLogger(__name__)

def execute_workflow(workflow_json: dict):
    logger.info("Starting workflow execution", extra={
        "workflow_id": workflow_json.get("id"),
        "node_count": len(workflow_json)
    })
    
    try:
        result = execute_workflow_via_api(workflow_json)
        logger.info("Workflow completed", extra={"result": "success"})
        return result
    except Exception as e:
        logger.error("Workflow failed", extra={"error": str(e)})
        raise
```

### Accessing Logs

```bash
# View recent logs (with timeout)
timeout 30 modal app logs <app-name> | tail -100

# Follow logs (with timeout)
timeout 60 modal app logs <app-name> -f || true

# Filter logs
timeout 30 modal app logs <app-name> | grep "ERROR" || true
```

---

## Common Issues & Solutions

### Issue 1: "Image build failed"

**Cause**: Missing dependencies or invalid commands

**Solution**:
- Check image build logs: `modal deploy --verbose`
- Test commands locally first
- Use incremental builds

### Issue 2: "Function timeout"

**Cause**: Workflow takes longer than timeout

**Solution**:
- Increase timeout: `@app.function(timeout=3600)`
- Optimize workflow
- Use async execution

### Issue 3: "Module not found"

**Cause**: Files not copied to image

**Solution**:
- Use `.copy_local_file()` or `.add_local_dir()`
- Check file paths are correct
- Verify files exist before building

### Issue 4: "Logs command hangs"

**Cause**: Modal CLI can hang on network issues or when app has no recent activity

**Solution**:
- **Always use timeout**: `timeout 30 modal app logs <app>`
- Use the utility function: `pnpm workflow:deploy logs <app-name>`
- Retry with exponential backoff (utility handles this automatically)
- Check Modal dashboard instead: https://modal.com/apps
- **Note**: If logs timeout, it may mean the app hasn't been used recently (no logs to show)

### Issue 5: "Cold start too slow"

**Cause**: First request needs to start container

**Solution**:
- Increase `scaledown_window`
- Use warm-up functions
- Set longer client timeouts

### Issue 6: "Endpoint timeout"

**Cause**: Cold start or long execution

**Solution**:
- Wait for cold start (2-5 minutes)
- Check Modal dashboard for container status
- Increase client timeout

---

## Performance Optimization

### Image Size

```python
# ✅ Good: Use slim base images
image = modal.Image.debian_slim()

# ❌ Bad: Use full images
image = modal.Image.debian()
```

### Dependency Caching

```python
# ✅ Good: Install dependencies in separate layer
image = (
    modal.Image.debian_slim()
    .pip_install(["torch", "transformers"])  # Cached layer
    .run_commands(["git clone repo"])        # Separate layer
)
```

### Volume Usage

```python
# ✅ Good: Use volumes for large files
volume = modal.Volume.from_name("models", create_if_missing=True)

@app.function(volumes={"/root/models": volume})
def load_model():
    # Models loaded from volume
    pass
```

---

## Security

### Secrets Management

```python
# ✅ Good: Use Modal secrets
secret = modal.Secret.from_name("huggingface")

@app.function(secrets=[secret])
def download_model():
    token = os.getenv("HF_TOKEN")  # From secret
    # ...
```

### Input Validation

```python
# ✅ Good: Validate inputs
from pydantic import BaseModel, validator

class WorkflowRequest(BaseModel):
    workflow: dict
    
    @validator('workflow')
    def validate_workflow(cls, v):
        if not isinstance(v, dict):
            raise ValueError("Workflow must be a dictionary")
        return v
```

---

## Testing Patterns

### Local Testing

```bash
# Test function locally
modal run apps/modal/app.py::test_function

# Test with specific input
modal run apps/modal/app.py::generate --workflow-json '{"1": {...}}'
```

### Integration Testing

```python
# Test deployed endpoint
import requests

def test_deployed_endpoint():
    url = "https://workspace--app-fastapi-app.modal.run/health"
    response = requests.get(url, timeout=30)
    assert response.status_code == 200
```

### Debugging

```python
# Add debug logging
import logging
logging.basicConfig(level=logging.DEBUG)

# Use Modal shell for debugging
# modal shell apps/modal/app.py
```

---

## Quick Reference

### Deployment Checklist

- [ ] Image builds successfully
- [ ] All files copied to image
- [ ] Timeouts set appropriately
- [ ] Error handling implemented
- [ ] Health checks added
- [ ] Logs accessible (with timeout)
- [ ] Secrets configured
- [ ] Volumes mounted

### Common Commands

```bash
# Deploy
modal deploy apps/modal/app.py

# View logs (with timeout)
timeout 30 modal app logs <app-name> || echo "Timeout"

# List apps
modal app list

# Run locally
modal run apps/modal/app.py::function_name
```

---

## Related Documentation

- [Modal.com Docs](https://modal.com/docs)
- [RYLA Modal App](../apps/modal/app.py)
- [Modal Utils](../apps/modal/utils/comfyui.py)
- [Cursor Rule](../../../../.cursor/rules/mcp-modal.mdc)

---

**Last Updated**: 2026-01-27
