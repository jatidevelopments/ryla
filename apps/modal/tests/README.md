# Modal Tests

Test suite for the Modal split-app codebase.

## Shared helpers

- **`endpoint_urls.py`** – Single source of truth for Modal endpoint URLs in tests. Uses split-app layout; keep in sync with `../ENDPOINT-APP-MAPPING.md`.

## Unit tests (no Modal required)

- `test_imports.py` – Module imports
- `test_workflow_builders.py` – Workflow JSON builders
- `test_image_utils.py` – Image processing utilities
- `test_cost_tracker.py` – Cost tracking

## Integration tests (hit deployed Modal apps)

These use split-app URLs via `endpoint_urls.py`. Run after deploying (e.g. `../deploy.sh`).

- `test_seedvr2.py` – SeedVR2 upscaling (`ryla-seedvr2`)
- `test_flux_dev_success_rate.py` – Flux Dev success rate (`ryla-flux`)
- `test_performance.py` – Flux Schnell benchmark (`ryla-flux`)
- `test_instantid_consistency.py` – SDXL+InstantID face consistency (`ryla-instantid`)

## Running tests

```bash
# From repo root
python apps/modal/tests/test_imports.py
python apps/modal/tests/test_seedvr2.py ryla path/to/image.jpg

# From apps/modal
python tests/test_flux_dev_success_rate.py
python tests/test_seedvr2.py ryla test_image.jpg
```
