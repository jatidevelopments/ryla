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

## Change Log

- 2025-12-16: Ledger created.


