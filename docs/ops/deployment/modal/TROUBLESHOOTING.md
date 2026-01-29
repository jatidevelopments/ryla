# Modal.com Troubleshooting Guide

> **Last Updated**: 2026-01-27

---

## Common Issues

### 1. "Logs command hangs"

**Symptoms**:
- `modal app logs <app-name>` command hangs indefinitely
- No response after several minutes

**Cause**:
- Modal CLI can hang on network issues
- App may have no recent activity (no logs to show)
- Modal API may be slow or unresponsive

**Solutions**:

1. **Always use timeout**:
   ```bash
   timeout 30 modal app logs <app-name> || echo "Timeout"
   ```

2. **Use the utility function** (recommended):
   ```bash
   pnpm workflow:deploy logs <app-name> --timeout=30
   ```
   This automatically handles timeouts and retries.

3. **Check Modal dashboard**:
   - Go to https://modal.com/apps
   - Find your app
   - View logs in the dashboard UI

4. **If logs timeout, it may be normal**:
   - App hasn't been used recently (no logs)
   - Network issues (retry later)
   - Modal API temporarily slow

### 2. "App not found in deployed apps"

**Symptoms**:
- Status check says app not found
- But app appears in `modal app list`

**Cause**:
- Modal truncates app names in list output
- Name matching is too strict

**Solutions**:

1. **Check manually**:
   ```bash
   modal app list | grep <partial-name>
   ```

2. **Use Modal dashboard**:
   - Go to https://modal.com/apps
   - Find app visually

3. **The utility now handles truncation**:
   - Updated to check for partial matches
   - Handles truncated names in list output

### 3. "Endpoint timeout"

**Symptoms**:
- Health check times out
- First request takes 2-5 minutes

**Cause**:
- Cold start (container needs to start)
- ComfyUI server needs to launch
- Models need to load

**Solutions**:

1. **Wait for cold start** (2-5 minutes):
   - First request always takes time
   - Subsequent requests are faster

2. **Check container status**:
   - Modal dashboard shows container state
   - Wait for "ready" status

3. **Increase client timeout**:
   ```typescript
   const response = await fetch(url, {
     signal: AbortSignal.timeout(300000)  // 5 minutes
   });
   ```

### 4. "Image build failed"

**Symptoms**:
- `modal deploy` fails during image build
- Error about missing files or commands

**Solutions**:

1. **Check build logs**:
   ```bash
   modal deploy --verbose apps/modal/app.py
   ```

2. **Test commands locally**:
   - Run commands in a local container first
   - Verify all dependencies exist

3. **Use incremental builds**:
   - Build in layers
   - Cache dependencies separately

### 5. "Module not found"

**Symptoms**:
- Runtime error: `ModuleNotFoundError`
- File not found errors

**Cause**:
- Files not copied to image
- Wrong paths in code

**Solutions**:

1. **Use `.copy_local_file()`**:
   ```python
   image = image.copy_local_file(
       "apps/modal/utils/comfyui.py",
       "/root/utils/comfyui.py"
   )
   ```

2. **Check file paths**:
   - Verify files exist before building
   - Use absolute paths in image

3. **Add fallback**:
   ```python
   try:
       from utils.comfyui import launch_server
   except ImportError:
       # Fallback implementation
       pass
   ```

---

## Debugging Workflow

### Step 1: Check Deployment

```bash
# List all apps
modal app list

# Check specific app
pnpm workflow:deploy status <app-name>
```

### Step 2: Check Logs

```bash
# With timeout (recommended)
pnpm workflow:deploy logs <app-name> --timeout=30

# Or manually
timeout 30 modal app logs <app-name> || echo "Timeout"
```

### Step 3: Test Endpoint

```bash
# Health check
curl https://workspace--app-fastapi-app.modal.run/health

# With timeout
curl --max-time 30 https://workspace--app-fastapi-app.modal.run/health
```

### Step 4: Check Modal Dashboard

- Go to https://modal.com/apps
- Find your app
- Check:
  - Deployment status
  - Recent logs
  - Container state
  - Error messages

---

## Quick Reference

### Commands with Timeouts

```bash
# Logs (always use timeout)
timeout 30 modal app logs <app> || echo "Timeout"

# Or use utility
pnpm workflow:deploy logs <app> --timeout=30

# Status check
pnpm workflow:deploy status <app>

# Health check
curl --max-time 30 <endpoint>/health
```

### When Things Go Wrong

1. **Check Modal dashboard** first
2. **Use timeouts** for all CLI commands
3. **Retry** with exponential backoff
4. **Check logs** (with timeout)
5. **Verify deployment** status

---

## Related Documentation

- [Modal Best Practices](./BEST-PRACTICES.md)
- [Cursor Rule](../../../../.cursor/rules/mcp-modal.mdc)
- [Modal Utils](../../../../scripts/workflow-deployer/modal-utils.ts)

---

**Last Updated**: 2026-01-27
