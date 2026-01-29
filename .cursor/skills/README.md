# Cursor Skills

This directory contains Cursor Skills - task-oriented workflows that guide AI agents through specific operations.

## What are Skills?

**Skills** are reusable, task-oriented instructions that teach the agent how to perform specific workflows. Unlike **Rules** (which provide persistent context and coding standards), **Skills** are discovered by the agent based on task descriptions.

**Rules** = Standards, patterns, context (always-apply or glob-based)  
**Skills** = Workflows, tasks, operations (discovered via description)

## Available Skills

### Development Workflows

- `epic-implementation/` - Implements complete epics following 10-phase pipeline
- `db-migration/` - Creates and applies database migrations
- `test-generation/` - Generates unit, integration, and E2E tests
- `api-endpoint-creation/` - Creates tRPC endpoints
- `component-creation/` - Creates React components
- `ci-cd-workflow/` - Automates CI/CD workflows

### MCP Tool Usage

- `mcp-ryla-api/` - RYLA MCP Server usage
- `mcp-snyk/` - Snyk MCP Server usage
- `mcp-cloudflare/` - Cloudflare MCP servers usage
- `mcp-modal/` - Modal.com deployment
- `modal-ai-endpoints/` - Modal.com AI endpoints (first provider)

### Domain-Specific Workflows

- `character-creation/` - Character wizard implementation
- `image-generation/` - Studio & character image generation
- `comfyui-workflow/` - ComfyUI workflow management

### Infrastructure Setup

- `deployment-fly-io/` - Fly.io deployment workflow
- `infisical-setup/` - Infisical secrets configuration
- `runpod-setup/` - RunPod infrastructure setup
- `analytics-integration/` - PostHog analytics setup
- `testing-setup/` - Test environment configuration

## How Skills Work

Skills are discovered by the agent based on:
1. **Description matching** - Agent matches task description to skill description
2. **Trigger terms** - Keywords in skill description help discovery
3. **Context** - Agent uses skills when working on related tasks

## Using Skills

Skills are automatically discovered by the agent. You can also reference them explicitly:

```
How do I implement an epic?
```

The agent will discover and use the `epic-implementation` skill.

## Creating New Skills

See the action plan: `docs/initiatives/IN-029-MIGRATION-ACTION-PLAN.md`

## Related Documentation

- **Skills Research**: `docs/research/CURSOR-SKILLS-RESEARCH.md`
- **Migration Plan**: `docs/initiatives/IN-029-MIGRATION-ACTION-PLAN.md`
- **Complete Roadmap**: `docs/initiatives/IN-029-COMPLETE-SKILLS-ROADMAP.md`
