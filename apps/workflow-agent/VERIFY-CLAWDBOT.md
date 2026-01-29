# Verify Clawdbot Installation

**Quick guide to verify Clawdbot is installed and working.**

---

## Step 1: Check Node.js Version

The container must be running Node.js 22+ for Clawdbot to work:

```bash
flyctl ssh console -a ryla-workflow-agent -C "node --version"
```

**Expected**: `v22.x.x` (not v20.x.x)

---

## Step 2: Check Clawdbot Installation

```bash
flyctl ssh console -a ryla-workflow-agent -C "clawdbot --version"
```

**Expected**: Clawdbot version number (e.g., `2026.1.24-3`)

**If not found**: The new deployment hasn't completed yet.

---

## Step 3: Verify in Container

SSH into the container and check:

```bash
flyctl ssh console -a ryla-workflow-agent

# Check Node.js
node --version

# Check Clawdbot
clawdbot --version

# Check if it's in PATH
which clawdbot

# Check global npm packages
npm list -g | grep clawdbot
```

---

## Troubleshooting

### Still Node.js v20

**Problem**: Container is still running old image.

**Solution**: Wait for deployment to complete, or check deployment status:

```bash
flyctl releases -a ryla-workflow-agent
flyctl status -a ryla-workflow-agent
```

### Clawdbot Not Found

**Possible causes**:
1. Deployment still in progress
2. Build failed
3. Clawdbot installation failed

**Check**:
```bash
# Check deployment logs
flyctl logs -a ryla-workflow-agent

# Check if npm install succeeded
flyctl ssh console -a ryla-workflow-agent -C "npm list -g clawdbot"
```

### Build Taking Too Long

**Normal**: 5-10 minutes for full rebuild with `--no-cache`

**Check progress**:
```bash
flyctl releases -a ryla-workflow-agent
```

Wait for new `v3` release to appear with status "complete".

---

## After Verification

Once Clawdbot is installed:

1. **Set up OAuth**:
   ```bash
   flyctl ssh console -a ryla-workflow-agent
   clawdbot models auth login --provider openai-codex
   ```

2. **Verify OAuth**:
   ```bash
   clawdbot models status
   ```

---

**Current Status**: Deployment in progress. Wait for `v3` release to complete.
