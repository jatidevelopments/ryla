# RunPod Resources Ledger (Create-Only)

This file is the **single source of truth** for RunPod resources created for RYLA.

## Rules

- **If it’s not in this ledger, it’s considered pre-existing → do not touch it.**
- **Never delete/terminate/stop/cleanup** RunPod resources via MCP/CLI/API.
- **Confirm with the user before any RunPod action** (even read/list).

## Naming Convention

- Prefix all created resources with: `ryla-prod-guarded-`

## Resource Table

| created_at (UTC) | name | type | runpod_id | region | purpose | created_by | notes |
|---|---|---|---|---|---|---|---|
| (empty) | (empty) | (endpoint/pod/volume) | (empty) | (empty) | (empty) | (mcp/cli/manual) | (empty) |
| 2025-12-16 | ryla-prod-guarded-flux-dev-handler | template | jx2h981xwv | (n/a) | Serverless template for FLUX.1-schnell handler | runpod mcp `create-template` | Image: `ghcr.io/jatidevelopments/ryla-prod-guarded-flux-dev-handler:latest` |
| 2025-12-16 | ryla-prod-guarded-z-image-turbo-handler | template | x1ua87uhrs | (n/a) | Serverless template for Z-Image-Turbo handler | runpod mcp `create-template` | Image: `ghcr.io/jatidevelopments/ryla-prod-guarded-z-image-turbo-handler:latest` |
| 2025-12-16 | ryla-prod-guarded-flux-dev-endpoint | endpoint | jpcxjab2zpro19 | EU-RO-1 | Serverless endpoint (FLUX.1-schnell handler) | runpod mcp `create-endpoint` | GPU: 4090/3090, workersMax=1, note: network volume not attached via MCP |
| 2025-12-16 | ryla-prod-guarded-z-image-turbo-endpoint | endpoint | xqs8k7yhabwh0k | EU-RO-1 | Serverless endpoint (Z-Image-Turbo handler) | runpod mcp `create-endpoint` | GPU: 4090/3090, workersMax=1, note: network volume not attached via MCP |

## Change Log

- 2025-12-16: Ledger created.


