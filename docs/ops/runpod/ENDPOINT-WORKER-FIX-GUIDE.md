# ComfyUI Serverless Endpoint - Worker Fix Guide

> **Date**: 2026-01-19  
> **Endpoint**: `ryla-prod-guarded-comfyui-serverless` (ID: `pwqwwai0hlhtw9`)  
> **Issue**: Workers not spinning up - jobs stuck in `IN_QUEUE`

---

## 🔍 Diagnostic Results

**Status**: ❌ UNAVAILABLE

- ✅ **Endpoint Accessible**: Yes
- ✅ **Can Accept Jobs**: Yes (job submitted successfully)
- ❌ **Workers Spinning Up**: No (job stuck in `IN_QUEUE` for 1+ minute)
- ❌ **Processing Jobs**: No

**Test Job ID**: `6965f2ab-f85f-4623-8f6e-69634a5f03b2-e2`  
**Test Job Status**: `IN_QUEUE`

---

## 🔧 Fix Steps

### Step 1: Check RunPod Console

1. Go to: https://www.runpod.io/console/serverless
2. Find endpoint: `ryla-prod-guarded-comfyui-serverless` (ID: `pwqwwai0hlhtw9`)
3. Check the **Workers** tab:
   - Are there any workers listed?
   - What is their status? (EXITED, STARTING, RUNNING, ERROR)
   - Are there any error messages?

### Step 2: Check Endpoint Configuration

**Current Configuration** (from docs):
- **Workers**: Min 0, Max 2
- **GPU Types**: RTX 4090, RTX 3090
- **Network Volume**: Should be attached

**Recommended Fix**:

1. **Set Min Workers to 1** (keeps a warm worker):
   - Go to endpoint settings
   - Change **Min Workers** from `0` to `1`
   - This keeps at least one worker running, eliminating cold start delays

2. **Verify GPU Availability**:
   - Check if RTX 4090/3090 GPUs are available in your region
   - If not, consider changing GPU type or region

3. **Check Network Volume**:
   - Verify network volume is attached
   - Check if models are accessible

### Step 3: Verify Endpoint Status

**Via RunPod Console**:
1. Go to endpoint details page
2. Check **Status**: Should be "Active" or "Running"
3. Check **Workers Tab**: Should show at least 1 worker if minWorkers=1
4. Check **Logs Tab**: Look for any error messages

**Via API** (using our diagnostics):
```bash
pnpm test:serverless:diagnostics
```

### Step 4: Test After Fix

Once you've updated the configuration:

1. **Wait 1-2 minutes** for worker to start
2. **Run diagnostics again**:
   ```bash
   pnpm test:serverless:diagnostics
   ```
3. **Expected Result**:
   - ✅ Workers Available: Yes
   - ✅ Can Spin Up: Yes
   - ✅ Processing Jobs: Yes
   - ✅ Overall Status: OPERATIONAL

---

## 🎯 Quick Fix (Recommended)

**Set Min Workers to 1**:

1. Go to: https://www.runpod.io/console/serverless
2. Click on: `ryla-prod-guarded-comfyui-serverless`
3. Click **Edit** or **Settings**
4. Change **Min Workers** from `0` to `1`
5. Save changes
6. Wait 1-2 minutes for worker to start
7. Re-run diagnostics: `pnpm test:serverless:diagnostics`

**Trade-off**:
- ✅ Eliminates cold start delays
- ✅ Jobs process immediately
- ⚠️ Costs ~$0.22/hour even when idle (RTX 3090)
- ⚠️ ~$160/month if kept running 24/7

**Alternative**: Keep Min Workers at 0, but ensure:
- GPU types are available in the region
- Endpoint is not paused
- Network volume is properly attached

---

## 🐛 Common Issues & Solutions

### Issue 1: Workers Not Spinning Up

**Possible Causes**:
- GPU not available in region
- Endpoint paused/inactive
- Insufficient credits/balance
- Network volume not attached

**Solutions**:
1. Check GPU availability in RunPod Console
2. Verify endpoint is active (not paused)
3. Check account balance
4. Verify network volume attachment

### Issue 2: Jobs Stuck in Queue

**Possible Causes**:
- No workers available (minWorkers=0, no workers started)
- All workers busy (maxWorkers reached)
- Worker startup taking too long

**Solutions**:
1. Set minWorkers=1 to keep warm worker
2. Increase maxWorkers if needed
3. Check worker logs for startup errors

### Issue 3: Endpoint Not Accessible

**Possible Causes**:
- Wrong endpoint ID
- API key invalid
- Endpoint deleted

**Solutions**:
1. Verify endpoint ID in RunPod Console
2. Check API key in Infisical
3. Verify endpoint exists

---

## 📊 Monitoring

**After Fix, Monitor**:
- Worker status (should show at least 1 RUNNING worker)
- Job processing time (should be < 30s for warm worker)
- Queue time (should be < 5s with warm worker)
- Error rate (should be 0%)

**Commands**:
```bash
# Check endpoint health
pnpm test:serverless:endpoint

# Run full diagnostics
pnpm test:serverless:diagnostics

# Test actual workflow
pnpm test:serverless:denrisi -- --samples=1
```

---

## ✅ Success Criteria

After applying the fix, you should see:

- ✅ **Workers Available**: Yes
- ✅ **Can Spin Up**: Yes (or already running if minWorkers=1)
- ✅ **Processing Jobs**: Yes
- ✅ **Overall Status**: OPERATIONAL
- ✅ **Test Job Status**: COMPLETED (not IN_QUEUE)
- ✅ **Queue Time**: < 5 seconds (with warm worker)

---

## 📝 Next Steps

1. **Apply Fix**: Set minWorkers=1 or verify GPU availability
2. **Re-run Diagnostics**: `pnpm test:serverless:diagnostics`
3. **Test Workflow**: `pnpm test:serverless:denrisi -- --samples=1`
4. **Monitor**: Check RunPod Console for worker status
5. **Document**: Update this guide with actual fix applied

---

## 🔗 Related Documentation

- [ComfyUI Serverless Setup Guide](../../technical/infrastructure/comfyui/COMFYUI-SERVERLESS-SETUP-GUIDE.md)
- [RunPod Deployment Status](../../technical/infrastructure/runpod/RUNPOD-DEPLOYMENT-STATUS.md)
- [EP-044: Serverless Endpoint Testing](../../requirements/epics/mvp/EP-044-serverless-endpoint-testing.md)
