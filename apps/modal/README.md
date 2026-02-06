# RYLA Modal Apps

Serverless ComfyUI on Modal.com for RYLA MVP. **Production uses split apps** (one Modal app per workflow group).

## Quick start

```bash
# Deploy all split apps (recommended)
cd apps/modal
./deploy.sh

# Deploy a single app
./deploy.sh flux

# Test from CLI
python ryla_client.py flux --prompt "A beautiful landscape" --output test.jpg
```

## Deployment

| Command | What it does |
|--------|----------------|
| `./deploy.sh` | Deploy all split apps under `apps/` |
| `./deploy.sh <name>` | Deploy one app (e.g. `flux`, `instantid`, `z-image`, `seedvr2`, `wan26`, `qwen-image`, `qwen-edit`) |

**Canonical deploy**: `apps/modal/deploy.sh`. Do not use `modal deploy app.py` for production; that deploys the legacy single app.

## Structure

```
apps/modal/
├── deploy.sh                 # Production deploy (split apps)
├── app.py                    # Legacy single app (optional)
├── config.py                 # Root config (legacy app)
├── image.py                  # Root image build (legacy)
├── ryla_client.py            # CLI client for testing
├── requirements.txt
├── ENDPOINT-APP-MAPPING.md   # Source of truth: endpoint → app → URL
│
├── apps/                     # Split Modal apps (production)
│   ├── README.md
│   ├── flux/                 # Flux Schnell/Dev, flux-dev-lora
│   ├── instantid/            # SDXL+InstantID, PuLID, IP-Adapter FaceID
│   ├── qwen-image/           # Qwen-Image 2512, video-faceswap
│   ├── qwen-edit/            # Qwen-Image Edit/Inpaint
│   ├── z-image/              # Z-Image-Turbo
│   ├── wan26/                # Wan 2.6 video
│   ├── seedvr2/              # SeedVR2 upscaling
│   ├── lora/                 # LoRA (flux-lora)
│   └── lora-training/        # LoRA training (separate)
│
├── shared/                   # Shared code for split apps
│   ├── config.py
│   ├── image_base.py
│   └── utils/
│
├── handlers/                 # Workflow handlers (used by root app & some split apps)
├── scripts/                  # Deploy, test, benchmark scripts
│   ├── test-all-endpoints.py
│   ├── test-all-endpoints-comprehensive.py
│   ├── benchmark-endpoints.py
│   └── ...
├── tests/                    # Unit and integration tests
│   ├── endpoint_urls.py     # Shared URL helper (split-app)
│   └── ...
└── docs/                     # Documentation
    ├── README.md             # Doc index
    ├── ENDPOINTS-REFERENCE.md
    └── status/               # Test/benchmark results and historical status
```

See **[STRUCTURE.md](./STRUCTURE.md)** for full layout and where to add things.

## Endpoints

Full list and URLs: **[ENDPOINT-APP-MAPPING.md](./ENDPOINT-APP-MAPPING.md)**.  
API request/response details: **docs/ENDPOINTS-REFERENCE.md**.

Summary:

- **Flux**: `/flux`, `/flux-dev`, `/flux-dev-lora` → `ryla-flux`
- **Face**: `/sdxl-instantid`, `/flux-pulid`, `/flux-ipadapter-faceid` → `ryla-instantid`
- **Qwen Image**: `/qwen-image-2512`, `/qwen-image-2512-fast`, `/qwen-image-2512-lora`, `/video-faceswap` → `ryla-qwen-image`
- **Qwen Edit**: `/qwen-image-edit-2511`, `/qwen-image-inpaint-2511` → `ryla-qwen-edit`
- **Z-Image**: `/z-image-simple`, `/z-image-danrisi`, `/z-image-lora` → `ryla-z-image`
- **Video**: `/wan2.6`, `/wan2.6-r2v`, `/wan2.6-lora` → `ryla-wan26`
- **Upscaling**: `/seedvr2` → `ryla-seedvr2`

## Documentation

- **Deployment / ops**: [docs/ops/deployment/modal/](../../docs/ops/deployment/modal/README.md) (quick start, timeouts, audit)
- **Modal audit**: [docs/ops/deployment/modal/MODAL-AUDIT.md](../../docs/ops/deployment/modal/MODAL-AUDIT.md)
- **App docs**: [docs/README.md](./docs/README.md)

## Related

- [EP-059 Modal code organization](../../docs/requirements/epics/mvp/EP-059-modal-code-organization-requirements.md)
- [ENDPOINT-APP-MAPPING.md](./ENDPOINT-APP-MAPPING.md)
