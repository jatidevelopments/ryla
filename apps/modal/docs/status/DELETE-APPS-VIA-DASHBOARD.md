# Delete Apps via Modal Dashboard

**Date**: 2026-01-28  
**Status**: ⚠️ CLI doesn't have delete command - use web dashboard

---

## Issue

Modal CLI doesn't have a `delete` command for apps. We need to use the web dashboard to delete old apps and free up endpoint slots.

---

## Steps to Delete Apps

### 1. Access Modal Dashboard

Visit: https://modal.com/apps

### 2. Find Apps to Delete

Look for these old apps:
- `ryla-comfyui` (multiple old versions from Jan 20-21)
- `ryla-z_image` (old version from Jan 22)

### 3. Delete Each App

1. Click on the app name
2. Look for "Delete" or "Remove" button
3. Confirm deletion
4. Repeat for each old app

### 4. Verify Slots Freed

After deleting, check available slots:
```bash
modal app list | grep "deployed" | wc -l
```

Should show fewer than 8 deployed apps.

---

## Apps to Delete

**Old `ryla-comfyui` versions** (will be replaced by split apps):
- Created: 2026-01-20
- Created: 2026-01-21 (multiple versions)

**Old `ryla-z_image` version**:
- Created: 2026-01-22 (will be replaced by new `ryla-z-image`)

**Keep for now**:
- `ryla-z_image` from 2026-01-28 (keep until new app works)

---

## After Deletion

Once slots are freed:
1. Deploy new split apps: `./apps/modal/deploy.sh flux`
2. Test endpoints
3. Deploy remaining apps

---

## Alternative: Upgrade Plan

If you prefer not to delete apps:
1. Visit: https://modal.com/settings/ryla/plans
2. Upgrade to plan with more endpoints
3. Deploy all new apps

---

**Last Updated**: 2026-01-28
