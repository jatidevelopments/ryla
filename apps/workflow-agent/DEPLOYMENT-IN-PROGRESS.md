# Clawdbot Installation - Deployment In Progress

**Status**: Deploying new image with Clawdbot installed

---

## What Changed

1. **Updated Dockerfile**:
   - Changed from `node:20-slim` → `node:22-slim` (Clawdbot requires Node.js 22+)
   - Added: `RUN npm install -g clawdbot@latest`

2. **Updated Documentation**:
   - All references changed from `moltbot` → `clawdbot`
   - Command is `clawdbot` (not `moltbot`)

---

## Current Status

**Old Image** (still running):
- Node.js: v20.20.0
- Clawdbot: Not installed
- Image: `deployment-01KG2FFERCCV2HPKKTRTJ4C9S3`

**New Image** (deploying):
- Node.js: v22.x
- Clawdbot: Will be installed globally
- Status: Building/deploying in background

---

## After Deployment Completes

### Step 1: Verify New Image

```bash
# Check status
flyctl status -a ryla-workflow-agent

# Should show new image ID and Node.js 22
```

### Step 2: Verify Clawdbot Installation

```bash
# SSH into container
flyctl ssh console -a ryla-workflow-agent

# Check versions
node --version  # Should be v22.x
clawdbot --version  # Should show version
```

### Step 3: Set Up OAuth

```bash
# Inside container
clawdbot models auth login --provider openai-codex
```

---

## Troubleshooting

### If Clawdbot Still Not Found

1. **Check if new image deployed**:
   ```bash
   flyctl releases -a ryla-workflow-agent
   ```

2. **Check Node.js version**:
   ```bash
   flyctl ssh console -a ryla-workflow-agent -C "node --version"
   ```

3. **If still v20, wait for deployment** or check deployment logs:
   ```bash
   flyctl logs -a ryla-workflow-agent
   ```

### If Deployment Failed

1. **Check build logs**:
   ```bash
   flyctl releases -a ryla-workflow-agent
   ```

2. **Redeploy manually**:
   ```bash
   flyctl deploy --dockerfile apps/workflow-agent/Dockerfile --config apps/workflow-agent/fly.toml -a ryla-workflow-agent
   ```

---

## Expected Timeline

- **Build**: ~2-5 minutes
- **Deploy**: ~1-2 minutes
- **Total**: ~3-7 minutes

---

**Next Step**: Wait for deployment to complete, then verify Clawdbot is installed.
