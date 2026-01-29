# Clawdbot Resource Requirements

**Issue**: Clawdbot requires more memory than the default 512MB allocation.

---

## Current Configuration

**Before**:
- Memory: 512MB
- CPU: 1 shared CPU
- **Problem**: Memory allocation failures, GC issues

**After**:
- Memory: 1GB
- CPU: 2 shared CPUs
- **Status**: Updated

---

## Recommended Resources

Based on Clawdbot's requirements and the memory errors:

### Minimum (Current)
- **Memory**: 1GB
- **CPU**: 2 shared CPUs
- **Cost**: ~$15-20/month

### Recommended (If Still Issues)
- **Memory**: 2GB
- **CPU**: 2 shared CPUs
- **Cost**: ~$25-30/month

---

## Update Resources

### Option 1: Via fly.toml (Recommended)

```toml
[[vm]]
  memory = "1gb"
  cpu_kind = "shared"
  cpus = 2
```

Then redeploy:
```bash
flyctl deploy --dockerfile apps/workflow-agent/Dockerfile --config apps/workflow-agent/fly.toml -a ryla-workflow-agent
```

### Option 2: Via CLI (Immediate)

```bash
# Update memory
flyctl scale memory 1024 -a ryla-workflow-agent

# Update CPU
flyctl scale vm shared-cpu-2x -a ryla-workflow-agent

# Restart machines
flyctl apps restart ryla-workflow-agent
```

---

## Verify Resources

```bash
# Check current resources
flyctl status -a ryla-workflow-agent

# Check machine details
flyctl machine list -a ryla-workflow-agent
```

---

## Cost Impact

**512MB → 1GB**:
- Additional cost: ~$5-10/month
- Total: ~$15-20/month

**1GB → 2GB** (if needed):
- Additional cost: ~$10/month
- Total: ~$25-30/month

---

## Troubleshooting

### Still Getting Memory Errors

1. **Increase to 2GB**:
   ```bash
   flyctl scale memory 2048 -a ryla-workflow-agent
   ```

2. **Check memory usage**:
   ```bash
   flyctl ssh console -a ryla-workflow-agent -C "free -h"
   ```

3. **Monitor during OAuth**:
   ```bash
   flyctl logs -a ryla-workflow-agent
   ```

### OAuth Still Failing

1. **Wait for machines to restart** (after scaling)
2. **Try OAuth again**:
   ```bash
   flyctl ssh console -a ryla-workflow-agent
   clawdbot models auth login --provider openai-codex
   ```

---

**Status**: Resources updated to 1GB RAM, 2 CPUs. Wait for machines to restart, then try OAuth again.
