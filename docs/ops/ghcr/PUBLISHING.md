# Publishing RunPod Handler Docker Images (GHCR)

## Security (Read First)

- **Never paste tokens into chat** or commit them to the repo.
- If a token was pasted/leaked, **revoke it immediately** in GitHub → Settings → Developer settings → Personal access tokens.

## What We Publish

Two images used by RunPod serverless templates/endpoints:

- `ghcr.io/<OWNER>/ryla-prod-guarded-flux-dev-handler:latest`
- `ghcr.io/<OWNER>/ryla-prod-guarded-z-image-turbo-handler:latest`

`<OWNER>` is your GitHub org/user that owns the repository.

## Recommended: GitHub Actions (No PAT Needed)

This repo includes a workflow that builds and pushes both images to GHCR on every push to `main`:

- `.github/workflows/publish-runpod-handlers-ghcr.yml`

It uses the repo-provided `GITHUB_TOKEN` with `packages: write`.

## Local Build (Optional)

From repo root:

```bash
docker build -f docker/flux-dev-handler/Dockerfile -t ghcr.io/<OWNER>/ryla-prod-guarded-flux-dev-handler:latest .
docker build -f docker/z-image-turbo-handler/Dockerfile -t ghcr.io/<OWNER>/ryla-prod-guarded-z-image-turbo-handler:latest .
```

Then login + push:

```bash
echo "$GHCR_TOKEN" | docker login ghcr.io -u <USERNAME> --password-stdin
docker push ghcr.io/<OWNER>/ryla-prod-guarded-flux-dev-handler:latest
docker push ghcr.io/<OWNER>/ryla-prod-guarded-z-image-turbo-handler:latest
```


