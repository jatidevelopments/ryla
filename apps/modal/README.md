# RYLA ComfyUI Modal App

Unified serverless ComfyUI implementation on Modal.com for RYLA MVP models.

## Quick Start

```bash
# Deploy
modal deploy apps/modal/app.py

# Test
python apps/modal/ryla_client.py flux --prompt "A beautiful landscape" --output test.jpg
```

## Structure

```
apps/modal/
├── app.py              # Main entry point (~100 lines)
├── config.py           # Configuration (~50 lines)
├── image.py            # Image build (~400 lines)
├── handlers/           # Workflow handlers
│   ├── flux.py        # Flux workflows
│   ├── instantid.py   # InstantID workflows
│   ├── lora.py        # LoRA workflows
│   ├── wan2.py        # Wan2.1 workflows
│   ├── seedvr2.py     # SeedVR2 workflows
│   └── workflow.py    # Custom workflows
├── utils/              # Utilities
│   ├── cost_tracker.py
│   ├── comfyui.py
│   └── image_utils.py
├── tests/              # Test files
├── scripts/            # Utility scripts
├── docs/               # Documentation
└── archive/            # Old files
```

## Endpoints

- `POST /flux` - Flux Schnell text-to-image
- `POST /flux-dev` - Flux Dev text-to-image (MVP primary)
- `POST /flux-instantid` - Flux Dev + InstantID face consistency
- `POST /flux-lora` - Flux Dev + LoRA character generation
- `POST /wan2` - Wan2.1 text-to-video
- `POST /seedvr2` - SeedVR2 realistic upscaling
- `POST /workflow` - Custom workflow JSON

## Documentation

See `docs/` directory for:
- Deployment guide
- Model documentation
- Workflow documentation
- Best practices
- Troubleshooting

## Related

- [EP-059 Requirements](../../docs/requirements/epics/mvp/EP-059-modal-code-organization-requirements.md)
- [GPU Requirements](../../docs/specs/modal/GPU-REQUIREMENTS.md)
- [Best Practices](./BEST-PRACTICES.md)
