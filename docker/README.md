# Docker Build Instructions

## Building Docker Images

### From Project Root

```bash
# Build Flux Dev handler
docker build -f docker/flux-dev-handler/Dockerfile -t ryla-flux-dev-handler:latest .

# Build Z-Image-Turbo handler
docker build -f docker/z-image-turbo-handler/Dockerfile -t ryla-z-image-turbo-handler:latest .
```

### Push to Registry

```bash
# Tag for your registry (replace with your registry)
docker tag ryla-flux-dev-handler:latest your-registry/ryla-flux-dev-handler:latest
docker push your-registry/ryla-flux-dev-handler:latest

docker tag ryla-z-image-turbo-handler:latest your-registry/ryla-z-image-turbo-handler:latest
docker push your-registry/ryla-z-image-turbo-handler:latest
```

## Notes

- Build from project root to ensure handlers/ directory is accessible
- Dockerfiles use `COPY ../../handlers/` to reference handlers from root
- Images include all necessary dependencies for Flux Dev and Z-Image-Turbo

