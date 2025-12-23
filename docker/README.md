# Docker for RYLA

## Local Development Services

Start all local services (PostgreSQL, Redis, MinIO):

```bash
docker compose up -d
```

### MinIO (S3-Compatible Storage)

MinIO provides local S3-compatible storage for image files.

**Ports:**
- `9000` - S3 API endpoint
- `9001` - Web console (http://localhost:9001)

**Credentials:**
- User: `ryla_minio`
- Password: `ryla_minio_secret`

**Bucket:** `ryla-images` (auto-created)

**Environment Variables for API:**
```bash
AWS_S3_ENDPOINT=http://localhost:9000
AWS_S3_ACCESS_KEY=ryla_minio
AWS_S3_SECRET_KEY=ryla_minio_secret
AWS_S3_BUCKET_NAME=ryla-images
AWS_S3_REGION=us-east-1
AWS_S3_FORCE_PATH_STYLE=true
```

---

## Docker Images

### comfyui-worker ✅ (Recommended)

Universal ComfyUI serverless worker - runs any ComfyUI workflow via API.

```bash
# Build
docker build -t ghcr.io/jatidevelopments/ryla-comfyui-worker:latest \
  -f docker/comfyui-worker/Dockerfile .

# Push
docker push ghcr.io/jatidevelopments/ryla-comfyui-worker:latest
```

**Features:**
- Runs any ComfyUI workflow (Z-Image, FLUX, etc.)
- Pre-installed custom nodes: res4lyf, controlaltai-nodes
- Models loaded from network volume at `/runpod-volume/models/`
- Scales to zero when idle

**Usage:**
1. Build and push the image
2. Create RunPod serverless endpoint with this image
3. Attach network volume with models
4. Send workflow JSON via API → get images back

---

## Deprecated Images

These Python handlers are no longer needed since we use ComfyUI worker:

### flux-dev-handler ❌ (Deprecated)

```bash
# Old - do not use
docker build -f docker/flux-dev-handler/Dockerfile -t ryla-flux-dev-handler:latest .
```

### z-image-turbo-handler ❌ (Deprecated)

```bash
# Old - do not use
docker build -f docker/z-image-turbo-handler/Dockerfile -t ryla-z-image-turbo-handler:latest .
```

---

## Build Notes

- Build from project root to ensure correct context
- ComfyUI worker is based on `runpod/worker-comfyui:5.6.0-base`
- Models are NOT baked into images - loaded from network volume
