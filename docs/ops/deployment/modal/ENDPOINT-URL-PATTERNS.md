# Modal.com Endpoint URL Patterns

> **Last Updated**: 2026-01-27

---

## Endpoint URL Structure

Modal.com generates endpoint URLs based on:
- Workspace name
- App name
- Class name (for `@modal.asgi_app()`)
- Function type (`fastapi-app` for FastAPI)

### Pattern

```
https://{workspace}--{app-name}-{class-name}-fastapi-app.modal.run
```

### Examples

**RYLA Main App**:
- App: `ryla-comfyui`
- Class: `ComfyUI`
- URL: `https://ryla--ryla-comfyui-comfyui-fastapi-app.modal.run`

**Generated Workflow App**:
- App: `ryla-z_image_danrisi`
- Class: `Z_image_danrisi` (PascalCase from function name)
- URL: `https://ryla--ryla-z-image-danrisi-z_image_danrisi-fastapi-app.modal.run`

---

## How Modal Generates URLs

### App Name
- From `modal.App(name="...")`
- Converted to lowercase
- Special characters replaced with hyphens

### Class Name
- From the class that has `@modal.asgi_app()`
- Converted to lowercase
- Underscores preserved
- Special characters replaced with underscores

### Full Pattern

```python
# App definition
app = modal.App(name="ryla-z-image-danrisi")

# Class with FastAPI
@app.cls(...)
class Z_image_danrisi:  # Class name
    @modal.asgi_app()
    def fastapi_app(self):
        # ...
```

**Result**: `https://ryla--ryla-z-image-danrisi-z_image_danrisi-fastapi-app.modal.run`

---

## Common Endpoints

### Health Check
```
GET /health
```

### Root
```
GET /
```

### Generate (Workflow)
```
POST /generate
Body: { "workflow": {...} }
```

---

## Troubleshooting Endpoint URLs

### Issue: 404 Not Found

**Possible Causes**:
1. App not deployed yet
2. Wrong endpoint URL
3. Cold start in progress

**Solutions**:
1. Check deployment: `modal app list`
2. Verify URL pattern matches Modal's format
3. Wait for cold start (2-5 minutes)
4. Check Modal dashboard for actual URL

### Issue: 400 Bad Request

**Possible Causes**:
1. Missing CORS headers
2. Invalid request format
3. FastAPI app not fully initialized

**Solutions**:
1. Add CORS middleware to FastAPI app
2. Check request format matches expected schema
3. Wait for app initialization
4. Check logs: `pnpm workflow:deploy logs <app-name>`

### Issue: 500 Internal Server Error

**Possible Causes**:
1. Server error in handler
2. Missing dependencies
3. ComfyUI server not ready

**Solutions**:
1. Check logs for error details
2. Verify all dependencies installed
3. Check ComfyUI server health
4. Test with simpler request first

---

## Finding Your Endpoint URL

### Method 1: Modal Dashboard
1. Go to https://modal.com/apps
2. Find your app
3. Click on it
4. View endpoint URL in app details

### Method 2: CLI Status Command
```bash
pnpm workflow:deploy status <app-name>
```

### Method 3: Modal CLI
```bash
# List apps with details
modal app list

# Get app details (if available)
modal app show <app-name>
```

### Method 4: Deploy Output
When deploying, Modal shows the endpoint:
```
✓ Created web endpoint for Z_image_danrisi.fastapi_app => 
  https://ryla--ryla-z-image-danrisi-z-image-danrisi-fastapi-app.modal.run
```

---

## Testing Endpoints

### Health Check
```bash
curl https://{workspace}--{app}-{class}-fastapi-app.modal.run/health
```

### Generate Workflow
```bash
curl -X POST \
  https://{workspace}--{app}-{class}-fastapi-app.modal.run/generate \
  -H "Content-Type: application/json" \
  -d '{"workflow": {...}}'
```

---

## Related Documentation

- [Modal Best Practices](./BEST-PRACTICES.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [Modal Utils](../../../../scripts/workflow-deployer/modal-utils.ts)

---

**Last Updated**: 2026-01-27
