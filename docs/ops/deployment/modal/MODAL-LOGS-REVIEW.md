# Modal Logs Review (2026-02-04)

Summary of checking Modal container logs for all split apps. Use the commands below to re-run.

## How to check logs

From project root (or `apps/modal`). On macOS `timeout` is not always available; use a subshell with `sleep` + `kill` or run without timeout and Ctrl+C after a few seconds.

```bash
# List deployed apps
modal app list

# Logs for one app (streaming; stop with Ctrl+C after ~15s)
modal app logs ryla-flux
modal app logs ryla-instantid
modal app logs ryla-z-image
modal app logs ryla-qwen-image
modal app logs ryla-wan26
modal app logs ryla-seedvr2

# With timeout on Linux
timeout 20 modal app logs ryla-flux || true
```

## Findings

| App | Status | Errors / notes |
|-----|--------|----------------|
| **ryla-flux** | ✅ OK | Health 200, POST /flux and /flux-dev 200. ComfyUI started, LoRAs symlinked. No errors. |
| **ryla-instantid** | ✅ OK | POST /sdxl-instantid 200, cost tracked. No errors in tail. |
| **ryla-z-image** | ✅ Fixed | Was failing with `ModuleNotFoundError: No module named 'handler'`. Redeployed 2026-02-04; now healthy. |
| **ryla-qwen-image** | ✅ OK | Health 200. Now includes edit/inpaint endpoints (merged from ryla-qwen-edit). Occasional 408 on `/qwen-image-2512-fast` addressed by 10 min client timeout. |
| **ryla-qwen-edit** | — Merged | Endpoints merged into `ryla-qwen-image` to stay within 8-endpoint limit. No separate app. |
| **ryla-wan26** | ✅ No errors in tail | Empty or minimal log tail; no exceptions seen. |
| **ryla-seedvr2** | ✅ OK | POST /seedvr2 200, cost tracked. No errors. |

## Resolved (2026-02-04)

1. ✅ **ryla-z-image** redeployed — `ModuleNotFoundError` fixed.
2. ✅ **ryla-qwen-edit** merged into **ryla-qwen-image** — avoids 8-endpoint limit.
3. ✅ **qwen-image-2512-fast 408** — addressed by per-endpoint 10 min timeout in `modal-client.ts`.

---

*Generated from Modal logs fetched 2026-02-04.*
