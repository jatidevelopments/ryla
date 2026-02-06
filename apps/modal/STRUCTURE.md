# Modal App Structure

How `apps/modal/` is organized and where to add or change things.

---

## Layout

```
apps/modal/
├── deploy.sh                 # Production: deploy split apps (use this)
├── app.py                    # Legacy single app (optional)
├── config.py, image.py       # Legacy app config/image
├── ryla_client.py            # CLI test client
├── requirements.txt
├── ENDPOINT-APP-MAPPING.md   # Single source of truth: endpoint → app → URL
├── README.md                 # Quick start and deploy
├── STRUCTURE.md              # This file
│
├── apps/                     # Split Modal apps (production)
│   ├── README.md
│   ├── flux/
│   ├── instantid/
│   ├── qwen-image/
│   ├── qwen-edit/
│   ├── z-image/
│   ├── wan26/
│   ├── seedvr2/
│   ├── lora/
│   ├── lora-training/
│   ├── qwen-lora-training/
│   └── wan-lora-training/
│
├── shared/                   # Shared code for split apps (read-only for agents)
│   ├── config.py
│   ├── image_base.py
│   └── utils/
│
├── handlers/                 # Workflow handlers (used by root app and some split apps)
├── utils/                    # Legacy app utilities (root app only)
│
├── scripts/                  # Operational scripts
│   ├── deploy.sh             # Legacy: deploys root app.py only
│   ├── test-all-endpoints.py
│   ├── test-all-endpoints-comprehensive.py
│   ├── benchmark-endpoints.py
│   └── ...
│
├── tests/
│   ├── endpoint_urls.py      # Shared URL helper (keep in sync with ENDPOINT-APP-MAPPING)
│   ├── test_*.py             # Unit and integration tests
│   └── README.md
│
├── docs/                     # Documentation
│   ├── README.md             # Doc index and status/ explanation
│   ├── ENDPOINTS-REFERENCE.md
│   ├── status/               # Benchmark and test results; historical status
│   └── ...
│
└── archive/                  # Old/unused code (do not use)
```

---

## Where to put things

| Task | Location |
|------|----------|
| Add a new endpoint (new model/workflow) | New or existing app under `apps/<name>/`; add to `ENDPOINT-APP-MAPPING.md` |
| Change endpoint → app mapping | `ENDPOINT-APP-MAPPING.md` and `libs/business/.../modal-client.ts`; sync `tests/endpoint_urls.py` and scripts that build URLs |
| Deploy all / one app | `./deploy.sh` or `./deploy.sh <app-name>` |
| Add a test that calls Modal | `tests/`; use `tests/endpoint_urls.py` for URLs |
| Add a script (test/benchmark/deploy) | `scripts/`; use split-app URLs (see `ENDPOINT-APP-MAPPING.md` or benchmark script) |
| Document a new endpoint | `docs/ENDPOINTS-REFERENCE.md`; keep `ENDPOINT-APP-MAPPING.md` updated |
| One-off or historical status | `docs/status/` (or `docs/status/archive/` if purely historical) |

---

## Single source of truth

- **Endpoint list and app mapping**: `ENDPOINT-APP-MAPPING.md`
- **Request/response details**: `docs/ENDPOINTS-REFERENCE.md`
- **URLs in tests**: `tests/endpoint_urls.py` (must match mapping)
- **URLs in API**: `libs/business/src/services/modal-client.ts` (`ENDPOINT_APP_MAP`)

When adding or removing an endpoint, update the mapping first, then client and tests.
