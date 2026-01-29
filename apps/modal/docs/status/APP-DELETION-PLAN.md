# App Deletion Plan - Free Up Endpoint Slots

**Date**: 2026-01-28  
**Purpose**: Delete old/unused apps to free up Modal endpoint slots for new split apps

---

## ✅ Safe to Delete

**Old `ryla-comfyui` versions** (monolithic app - will be replaced by split apps):
- `ap-CqgwosdrXz8U6SYhcdjR3b` - ryla-comfyui (2026-01-20)
- `ap-LzmeZgAvXqdgbYxRYK6v6B` - ryla-comfyui (2026-01-21)
- `ap-nL4Y3N4WTfpqcokdBTviXE` - ryla-comfyui (2026-01-21)
- `ap-Xh6hJoOfRbLKcDB5SG6Pvc` - ryla-comfyui (2026-01-21)

**Old `ryla-z_image` versions** (will be replaced by new `ryla-z-image` split app):
- `ap-xSXBhtorzBsgy6lG1B6TQF` - ryla-z_image (2026-01-22)

**Total slots to free**: 5 endpoints

---

## ⚠️ Keep for Now

**Recent apps** (may still be in use):
- `ap-tziGQkuOIY7gLGsoa8d0XX` - ryla-z_image (2026-01-28) - Keep until new z-image app works

---

## Deletion Commands

```bash
# Delete old ryla-comfyui versions
modal app delete ap-CqgwosdrXz8U6SYhcdjR3b
modal app delete ap-LzmeZgAvXqdgbYxRYK6v6B
modal app delete ap-nL4Y3N4WTfpqcokdBTviXE
modal app delete ap-Xh6hJoOfRbLKcDB5SG6Pvc

# Delete old z_image version
modal app delete ap-xSXBhtorzBsgy6lG1B6TQF
```

---

## After Deletion

**Available slots**: 5 endpoints (enough for all 5 new split apps)

**New apps to deploy**:
1. `ryla-flux` - 1 endpoint
2. `ryla-wan2` - 1 endpoint
3. `ryla-seedvr2` - 1 endpoint
4. `ryla-instantid` - 1 endpoint
5. `ryla-z-image` - 1 endpoint

---

## Redeployment

**Yes, we can redeploy deleted apps later**:
- Old `ryla-comfyui` code is still in `apps/modal/app.py`
- Can redeploy anytime: `modal deploy apps/modal/app.py`
- Old `ryla-z_image` code is in archive or can be regenerated

**No data loss**:
- Models are in Modal volumes (persistent)
- Code is in git repository
- Only the deployed app instance is deleted

---

**Last Updated**: 2026-01-28
