# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records documenting significant technical decisions made during RYLA development.

## What is an ADR?

An Architecture Decision Record captures the context, decision, and consequences of a significant architectural choice. ADRs provide historical context for why certain decisions were made.

## Decision Records

| ID | Decision | Status |
|----|----------|--------|
| [ADR-001](./ADR-001-database-architecture.md) | Database Architecture | Accepted |
| [ADR-003](./ADR-003-comfyui-pod-over-serverless.md) | ComfyUI Pod Over Serverless | Superseded |
| [ADR-004](./ADR-004-fly-io-deployment-platform.md) | Fly.io Deployment Platform | Accepted |
| [ADR-005](./ADR-005-cloudflare-r2-storage.md) | Cloudflare R2 Storage | Accepted |
| [ADR-006](./ADR-006-runpod-serverless-over-dedicated-pods.md) | RunPod Serverless Over Dedicated Pods | Superseded |
| [ADR-007](./ADR-007-modal-over-runpod.md) | Modal Over RunPod | Accepted |

## Creating a New ADR

1. Copy `ADR-TEMPLATE.md` to `ADR-XXX-[short-description].md`
2. Use the next available number
3. Fill out all sections
4. Update this index

## ADR States

- **Proposed** - Under discussion
- **Accepted** - Decision made, in effect
- **Superseded** - Replaced by a newer decision
- **Deprecated** - Being phased out
- **Rejected** - Considered but not adopted
