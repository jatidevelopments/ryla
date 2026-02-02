# Modal Endpoint Benchmark Report

**Generated:** 2026-02-02 12:22:58 UTC  
**Workspace:** ryla  
**Test Resources:** Image=✅, Video=❌, LoRA=❌

## Summary

| Metric               | Value   |
| -------------------- | ------- |
| Total Endpoints      | 21      |
| Successful           | 6       |
| Failed               | 7       |
| Skipped              | 8       |
| Total Benchmark Cost | $0.0000 |

## Results by Category

### Flux

| Endpoint      | Path             | Cold (s) | Warm (s) | Δ Savings | Cost ($) | Status                |
| ------------- | ---------------- | -------- | -------- | --------- | -------- | --------------------- |
| Flux          | `/flux`          | 44.4     | 2.1      | 95%       | -        | ✅                    |
| Flux Dev      | `/flux-dev`      | -        | 29.7     | -         | -        | ✅                    |
| Flux Dev Lora | `/flux-dev-lora` | -        | -        | -         | -        | ⏭️ Missing: LoRA file |
| Flux Lora     | `/flux-lora`     | -        | -        | -         | -        | ⏭️ Missing: LoRA file |

### Face Consistency

| Endpoint              | Path                     | Cold (s) | Warm (s) | Δ Savings | Cost ($) | Status                    |
| --------------------- | ------------------------ | -------- | -------- | --------- | -------- | ------------------------- |
| Sdxl Instantid        | `/sdxl-instantid`        | -        | -        | -         | -        | ❌ Exceeded 30 redirects. |
| Flux Pulid            | `/flux-pulid`            | -        | -        | -         | -        | ❌ Timeout                |
| Flux Ipadapter Faceid | `/flux-ipadapter-faceid` | -        | -        | -         | -        | ❌ Timeout                |

### Qwen Image

| Endpoint             | Path                    | Cold (s) | Warm (s) | Δ Savings | Cost ($) | Status                 |
| -------------------- | ----------------------- | -------- | -------- | --------- | -------- | ---------------------- |
| Qwen Image 2512      | `/qwen-image-2512`      | 15.0     | 10.3     | 32%       | -        | ✅                     |
| Qwen Image 2512 Fast | `/qwen-image-2512-fast` | -        | 12.4     | -         | -        | ✅                     |
| Qwen Image 2512 Lora | `/qwen-image-2512-lora` | -        | -        | -         | -        | ⏭️ Missing: LoRA file  |
| Video Faceswap       | `/video-faceswap`       | -        | -        | -         | -        | ⏭️ Missing: test video |

### Qwen Edit

| Endpoint                | Path                       | Cold (s) | Warm (s) | Δ Savings | Cost ($) | Status                               |
| ----------------------- | -------------------------- | -------- | -------- | --------- | -------- | ------------------------------------ |
| Qwen Image Edit 2511    | `/qwen-image-edit-2511`    | -        | -        | -         | -        | ❌ HTTPSConnectionPool(host='ryla... |
| Qwen Image Inpaint 2511 | `/qwen-image-inpaint-2511` | -        | -        | -         | -        | ❌ HTTPSConnectionPool(host='ryla... |

### Z-Image

| Endpoint        | Path               | Cold (s) | Warm (s) | Δ Savings | Cost ($) | Status                |
| --------------- | ------------------ | -------- | -------- | --------- | -------- | --------------------- |
| Z Image Simple  | `/z-image-simple`  | 13.0     | 2.2      | 83%       | -        | ✅                    |
| Z Image Danrisi | `/z-image-danrisi` | -        | 2.3      | -         | -        | ✅                    |
| Z Image Lora    | `/z-image-lora`    | -        | -        | -         | -        | ⏭️ Missing: LoRA file |

### Video

| Endpoint    | Path           | Cold (s) | Warm (s) | Δ Savings | Cost ($) | Status                               |
| ----------- | -------------- | -------- | -------- | --------- | -------- | ------------------------------------ |
| Wan2        | `/wan2`        | -        | -        | -         | -        | ❌ HTTP 500: modal-http: internal... |
| Wan2.6      | `/wan2.6`      | -        | -        | -         | -        | ❌ HTTP 408: Missing request, pos... |
| Wan2.6 R2V  | `/wan2.6-r2v`  | -        | -        | -         | -        | ⏭️ Missing: test video               |
| Wan2.6 Lora | `/wan2.6-lora` | -        | -        | -         | -        | ⏭️ Missing: LoRA file                |

### Upscaling

| Endpoint | Path       | Cold (s) | Warm (s) | Δ Savings | Cost ($) | Status                 |
| -------- | ---------- | -------- | -------- | --------- | -------- | ---------------------- |
| Seedvr2  | `/seedvr2` | -        | -        | -         | -        | ⏭️ Missing: test video |

## Key Findings

- **Average Cold Start:** 24.2s
- **Average Warm Time:** 9.8s
- **Warm vs Cold Improvement:** 59% faster
- **Total Benchmark Cost:** $0.0000

## Recommendations

1. **Keep containers warm** for production - warm containers are significantly faster
2. **Use Z-Image Danrisi** for fastest image generation (minimal cold start overhead)
3. **Batch video requests** - video endpoints have the longest cold starts
4. **Pre-warm before peak hours** - schedule periodic pings to keep containers warm

## Failed Endpoints

- `/sdxl-instantid`: Exceeded 30 redirects.
- `/flux-pulid`: Timeout
- `/flux-ipadapter-faceid`: Timeout
- `/qwen-image-edit-2511`: HTTPSConnectionPool(host='ryla--ryla-qwen-edit-comfyui-fastapi-app.modal.run', port=443): Max retries exceeded with url: /qwen-image-edit-2511 (Caused by SSLError(SSLError(5, '[SYS] unknown error (\_ss
- `/qwen-image-inpaint-2511`: HTTPSConnectionPool(host='ryla--ryla-qwen-edit-comfyui-fastapi-app.modal.run', port=443): Max retries exceeded with url: /qwen-image-inpaint-2511 (Caused by SSLError(SSLError(5, '[SYS] unknown error (
- `/wan2`: HTTP 500: modal-http: internal error: function was terminated by signal

- `/wan2.6`: HTTP 408: Missing request, possibly due to expiry or cancellation

## Skipped Endpoints

- `/flux-dev-lora`: Missing: LoRA file
- `/flux-lora`: Missing: LoRA file
- `/qwen-image-2512-lora`: Missing: LoRA file
- `/video-faceswap`: Missing: test video
- `/z-image-lora`: Missing: LoRA file
- `/wan2.6-r2v`: Missing: test video
- `/wan2.6-lora`: Missing: LoRA file
- `/seedvr2`: Missing: test video

## How to Run This Benchmark

```bash
# Full benchmark (cold + warm)
python apps/modal/scripts/benchmark-endpoints.py

# Quick benchmark (warm only)
python apps/modal/scripts/benchmark-endpoints.py --quick

# Generate test resources only
python apps/modal/scripts/benchmark-endpoints.py --generate

# To enable LoRA endpoints, train a test LoRA first:
modal run apps/modal/apps/lora-training/app.py --character-id=test-benchmark --steps=100
```

---

_Report generated by `benchmark-endpoints.py`_
