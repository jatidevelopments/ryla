# Modal scripts

| Script | Purpose |
|--------|--------|
| **Deploy** | |
| `../deploy.sh` | **Use this.** Deploy all or one split app (run from `apps/modal/`). |
| `deploy.sh` | Legacy: deploys root `app.py` (single app) only. |
| **Test** | |
| `test-endpoints-via-ryla-api.py` | **Use for CI/playground parity.** Test all endpoints via RYLA API (`POST /playground/modal/call`) in parallel; auto-generates ref image, retries on timeout/5xx, writes JSON report. `RYLA_API_URL` or `--api-url`. |
| `test-all-endpoints.py` | POST to all endpoints (split-app URLs). |
| `test-all-endpoints-comprehensive.py` | Full generation tests, chained (split-app). |
| `test-split-apps.py` | Split-app health/generation checks. |
| `test-sdxl-endpoints.py` | SDXL/InstantID only. |
| `quality-test-matrix.py` | Quality test matrix for ref-image and LoRA endpoints; writes JSON summary. See `docs/research/infrastructure/MODAL-ENDPOINT-QUALITY-TEST-RESULTS.md`. |
| `fetch-app-logs.sh` | Fetch recent logs from all split apps (for error review). See `docs/ops/deployment/modal/MODAL-LOGS-REVIEW.md`. |
| **Benchmark** | |
| `benchmark-endpoints.py` | Cold/warm timing, writes `docs/status/BENCHMARK-RESULTS.md`. |
| **Operate** | |
| `check-deployment-status.sh` | Check deployment status. |
| `monitor-deployments.sh` / `monitor-deployments-continuous.sh` | Monitor apps. |
| `trigger-lora-training.py` | Trigger LoRA training. |
| `upload_models.py` / `upload_z_image_models.py` / `download_z_image.py` | Model upload/download. |

All test/benchmark scripts use the **split-app** URL layout. See `../ENDPOINT-APP-MAPPING.md`.
