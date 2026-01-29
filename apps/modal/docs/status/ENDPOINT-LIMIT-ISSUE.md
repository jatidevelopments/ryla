# Modal Endpoint Limit Issue

**Date**: 2026-01-28  
**Status**: ⚠️ **BLOCKER** - Modal workspace has 8 endpoint limit, all slots used

---

## Issue

**Error**: `Deployment failed: reached limit of 8 web endpoints (# already deployed => 8, # in this app => 1)`

**Root Cause**: Modal workspace plan has a limit of 8 web endpoints. We're trying to deploy 5 new split apps, but all 8 slots are already used by existing apps.

---

## Current Endpoint Usage

**Deployed Apps** (using endpoint slots):
- `ryla-comfyui` (old monolithic app) - Multiple endpoints
- Other existing apps

**New Apps** (need endpoint slots):
- `ryla-flux` - 1 endpoint
- `ryla-wan2` - 1 endpoint
- `ryla-seedvr2` - 1 endpoint
- `ryla-instantid` - 1 endpoint
- `ryla-z-image` - 1 endpoint

**Total Needed**: 5 new endpoints (but only 0 slots available)

---

## Solutions

### Option 1: Upgrade Modal Plan (Recommended)

**Action**: Upgrade workspace plan to get more endpoint slots

**Steps**:
1. Visit: https://modal.com/settings/ryla/plans
2. Upgrade to plan with more endpoints
3. Redeploy all apps

**Pros**:
- ✅ No code changes needed
- ✅ Can keep all apps separate
- ✅ Future-proof for more apps

**Cons**:
- ❌ Additional cost

---

### Option 2: Delete Old Apps (Quick Fix)

**Action**: Delete old/unused apps to free up endpoint slots

**Steps**:
1. List all deployed apps: `modal app list`
2. Identify old/unused apps (e.g., old `ryla-comfyui` versions)
3. Delete them: `modal app delete <app-id>`
4. Redeploy new split apps

**Apps to Consider Deleting**:
- Old `ryla-comfyui` versions (if new split apps replace them)
- Test/debug apps that are no longer needed
- Apps with duplicate functionality

**Pros**:
- ✅ No cost increase
- ✅ Quick solution
- ✅ Clean up unused apps

**Cons**:
- ❌ Need to identify which apps are safe to delete
- ❌ May need to keep old app until new ones are tested

---

### Option 3: Consolidate Apps (Alternative)

**Action**: Combine some apps to reduce endpoint count

**Example**: Combine InstantID and Z-Image into one app (they're related)

**Pros**:
- ✅ No cost increase
- ✅ No plan upgrade needed

**Cons**:
- ❌ Reduces agent isolation benefits
- ❌ Goes against splitting strategy
- ❌ More complex app structure

---

## Recommended Approach

**Phase 1: Quick Fix (Now)**
1. Delete old/unused `ryla-comfyui` app versions
2. Deploy critical apps first (Flux, Wan2)
3. Test to ensure they work

**Phase 2: Plan Upgrade (Soon)**
1. Upgrade Modal plan for more endpoints
2. Deploy remaining apps (SeedVR2, InstantID, Z-Image)
3. Keep old monolithic app until all new apps tested

**Phase 3: Cleanup (After Testing)**
1. Verify all new apps work correctly
2. Delete old monolithic app
3. Document endpoint usage

---

## Next Steps

1. ⏳ **Identify deletable apps** - List all apps and identify which can be removed
2. ⏳ **Delete old apps** - Free up endpoint slots
3. ⏳ **Deploy critical apps** - Flux and Wan2 first
4. ⏳ **Test deployed apps** - Verify they work
5. ⏳ **Upgrade plan** - For remaining apps
6. ⏳ **Deploy remaining apps** - SeedVR2, InstantID, Z-Image

---

## Endpoint Count

**Current**: 8/8 endpoints used  
**Needed**: 5 more endpoints  
**After Upgrade**: Need plan with 13+ endpoints

---

**Last Updated**: 2026-01-28  
**Status**: Blocked on endpoint limit
