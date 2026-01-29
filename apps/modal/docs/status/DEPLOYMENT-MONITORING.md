# Modal Apps - Deployment Monitoring

**Date**: 2026-01-28  
**Status**: ⏳ All 5 Apps Deploying

---

## Quick Status Check

```bash
# Run status check script
./apps/modal/scripts/check-deployment-status.sh

# Or manually
modal app list | grep -E "ryla-flux|ryla-wan2|ryla-seedvr2|ryla-instantid|ryla-z-image"
```

---

## Deployment Commands Executed

All 5 apps are deploying in parallel:

```bash
# Flux (deploying)
modal deploy apps/modal/apps/flux/app.py

# Wan2 (deploying)
modal deploy apps/modal/apps/wan2/app.py

# SeedVR2 (deploying)
modal deploy apps/modal/apps/seedvr2/app.py

# InstantID (deploying)
modal deploy apps/modal/apps/instantid/app.py

# Z-Image (deploying)
modal deploy apps/modal/apps/z-image/app.py
```

---

## Expected Timeline

**First-time deployments**: 10-20 minutes per app
- Base image build: 2-3 min
- ComfyUI installation: 3-5 min
- Custom nodes: 2-3 min
- Model downloads: 5-10 min
- Server startup: 1-2 min

**Parallel deployment**: All apps building simultaneously
- Total time: ~20 minutes (instead of 100 minutes sequentially)

---

## Testing Checklist

Once all apps show "deployed" status:

- [ ] Test Flux health endpoint
- [ ] Test Flux `/flux` endpoint
- [ ] Test Flux `/flux-dev` endpoint
- [ ] Test Wan2 health endpoint
- [ ] Test Wan2 `/wan2` endpoint
- [ ] Test SeedVR2 health endpoint
- [ ] Test SeedVR2 `/seedvr2` endpoint
- [ ] Test InstantID health endpoint
- [ ] Test Z-Image health endpoint
- [ ] Run comprehensive test script
- [ ] Verify all endpoints return HTTP 200
- [ ] Check cost headers present
- [ ] Verify no regressions

---

## Next Actions

1. ⏳ **Monitor deployments** - Check status every 5-10 minutes
2. ⏳ **Test once deployed** - Use test script or manual curl
3. ⏳ **Fix any issues** - Debug failing endpoints
4. ⏳ **Update client script** - Point to new app URLs
5. ⏳ **Document results** - Update status docs

---

**Last Updated**: 2026-01-28
