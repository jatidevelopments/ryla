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
├── app.py                    # Main entry point
├── config.py                 # Configuration (volumes, secrets, GPU)
├── image.py                  # Modal image build (model downloads)
├── ryla_client.py            # CLI client for testing endpoints
├── requirements.txt          # Python dependencies
├── handlers/                 # Workflow handlers (one per model)
│   ├── flux.py              # Flux Dev/Schnell workflows
│   ├── instantid.py         # InstantID face consistency
│   ├── lora.py              # LoRA character generation
│   ├── wan2.py              # Wan2.1 text-to-video
│   ├── seedvr2.py           # SeedVR2 upscaling
│   └── workflow.py          # Generic workflow handler
├── utils/                    # Shared utilities
│   ├── cost_tracker.py      # GPU cost calculation
│   ├── comfyui.py           # ComfyUI server management
│   └── image_utils.py       # Image encoding/decoding
├── tests/                    # Unit and integration tests
├── scripts/                  # Deployment and testing scripts
├── docs/                     # Documentation
│   ├── status/              # Status and test results
│   └── [other docs]         # Guides and best practices
├── workflows/                # Workflow JSON files (reference)
├── test-outputs/             # Test output files (gitignored)
└── archive/                  # Old/unused files
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
- [Best Practices](./docs/BEST-PRACTICES.md)
- [Status Reports](./docs/status/)
