# Cursor Rules Documentation

This document provides an overview of RYLA's Cursor rules, how to use them, and links to community resources.

## Overview

Cursor rules are markdown files (`.mdc`) that guide AI assistants in understanding project context, coding standards, and best practices. They help ensure consistent code generation and maintainability.

## Rule Structure

All Cursor rules are located in `.cursor/rules/` directory at the project root.

### Rule Types

1. **Always Apply** (`alwaysApply: true`) - Rules that are always active, providing foundational context
2. **Glob-based** (`globs: ["**/*.tsx"]`) - Rules that apply to specific file patterns
3. **Agent Requested** - Rules that can be explicitly requested by the AI agent

### Rule Format

Each rule file follows this structure:

```markdown
---
description: Brief description of what this rule covers
globs: ["**/*.tsx", "**/*.ts"]  # Optional: file patterns
alwaysApply: true|false         # Whether rule is always active
---

# Rule Title

## Context
...

## Requirements
...

## Examples
...
```

## Rule Categories

### Core Architecture
- `project-introduce.mdc` - Project overview and technology stack
- `architecture.mdc` - Nx monorepo structure and layered architecture
- `pipeline-enforcement.mdc` - 10-phase MVP development pipeline
- `way-of-work.mdc` - Communication and workflow patterns
- `mvp-principles.mdc` - MVP constraints and decision framework

### Frontend
- `code-style.mdc` - Code style and conventions
- `typescript.mdc` - TypeScript code style and optimization guidelines
- `presentation.mdc` - Presentation layer API and request handling patterns
- `accessibility.mdc` - Accessibility (A11y) guidelines for inclusive UI
- `performance.mdc` - Web performance optimization best practices
- `tanstack-query.mdc` - TanStack Query (React Query) patterns for data fetching
- `seo.mdc` - SEO optimization patterns for Next.js App Router

### Backend
- `business-logic.mdc` - Business logic layer patterns and practices
- `data-access.mdc` - Data access layer patterns and repository implementation
- `drizzle-schema-style-guide.mdc` - Style guide for defining Drizzle ORM schemas
- `db-migrations.mdc` - Database migration patterns and best practices
- `presentation.mdc` - Presentation layer API patterns
- `security.mdc` - Web application security best practices
- `api-design.mdc` - API design patterns for tRPC and REST endpoints

### State Management
- `zustand-action-patterns.mdc` - Recommended patterns for organizing Zustand actions
- `zustand-slice-organization.mdc` - Best practices for structuring Zustand slices

### Testing
- `testing-standards.mdc` - Standards and best practices for unit, integration, and E2E tests
- `test-fixtures.mdc` - Test fixtures and accounts for MCP and development testing
- `test-credentials.mdc` - Test credentials and authentication patterns

### External Integrations
- `dependencies.mdc` - External dependencies and service integrations
- `mcp-ryla-api.mdc` - RYLA MCP Server usage guidelines
- `mcp-snyk.mdc` - Snyk MCP Server usage guidelines for security scanning
- `mcp-cloudflare.mdc` - Cloudflare MCP Server usage guidelines
- `runpod-safety.mdc` - RunPod safety: confirmation-gated, create-only operations

### Features
- `analytics.mdc` - Analytics and metrics tracking guidelines
- `notifications.mdc` - In-app notifications implementation guidelines
- `image-optimization.mdc` - Image compression and optimization rules
- `management.mdc` - Management layer for administration and system operations

### Development Workflows
- `ralph.mdc` - Iterative development pattern (Ralph-style) for complex features
- `refactoring.mdc` - Refactoring guidelines and patterns
- `cursor-rules.mdc` - Guidelines for writing and maintaining Cursor rules
- `error-handling.mdc` - Error handling patterns for React and API routes
- `logging.mdc` - Logging patterns and best practices
- `environment-variables.mdc` - Environment variable management and validation
- `git-workflow.mdc` - Git workflow patterns including branch naming and commits

## Using Cursor Rules

### For Developers

1. **Automatic Application** - Rules with `alwaysApply: true` are automatically active
2. **File-based Application** - Rules with `globs` are applied when working with matching files
3. **Explicit Request** - Ask the AI to apply specific rules: "Follow the TypeScript rules"

### For AI Assistants

1. **Read Rules** - Use `read_file` to read specific rule files
2. **Check Index** - Refer to `rules-index.mdc` for available rules
3. **Apply Patterns** - Follow examples and patterns from rules
4. **Maintain Consistency** - Ensure generated code follows rule guidelines

## Best Practices

### Writing Rules

1. **Be Specific** - Provide concrete examples, not vague guidance
2. **Keep Concise** - Aim for under 500 lines per rule
3. **Include Examples** - Show both good and bad patterns
4. **Update Regularly** - Keep rules in sync with codebase changes
5. **Link Related Rules** - Reference other relevant rules

### Maintaining Rules

1. **Review Periodically** - Audit rules for outdated information
2. **Remove Duplicates** - Ensure no overlapping rules
3. **Update Index** - Keep `rules-index.mdc` current
4. **Version Control** - Commit rule changes with code changes

## Community Resources

### Cursor Rules Collections

1. **Cursor Directory** - https://cursor.directory/
   - Over 113 curated rules across 81 categories
   - Filter by framework, stack, or use case
   - Community-contributed and vetted rules

2. **PRPM Registry** - https://prpm.dev/blog/cursor-rules
   - Over 7,000 Cursor rules covering major frameworks
   - Quality-scored and categorized rules
   - Top 50 rules list available

3. **dotCursor** - https://www.dotcursor.com/rules
   - Extensive library of Cursor rules
   - Framework-specific collections

### Learning Resources

1. **Cursor Documentation** - https://docs.cursor.com/en/context/rules
   - Official Cursor rules documentation
   - Rule types and application patterns
   - Best practices from Cursor team

2. **Cursor Best Practices** - https://github.com/digitalchild/cursor-best-practices
   - GitHub repository with Cursor configuration examples
   - User Rules and Project Rules guidance

3. **Cursor Agents Rulebook** - https://github.com/Wutu91/cursor-agents-rulebook
   - Templates for automated rule generation
   - Custom agent creation patterns

### Community Discussions

1. **Cursor Community** - Engage with other developers using Cursor
2. **GitHub Discussions** - Search for Cursor-related discussions
3. **Discord/Slack** - Join Cursor community channels

## Contributing Rules

### Adding New Rules

1. **Identify Need** - Determine if a new rule is needed or existing rule should be updated
2. **Write Rule** - Follow the rule format and best practices
3. **Add Examples** - Include concrete code examples
4. **Update Index** - Add to `rules-index.mdc`
5. **Test** - Verify rule works as expected with AI assistant

### Updating Existing Rules

1. **Review Current Rule** - Understand existing patterns
2. **Identify Changes** - Determine what needs updating
3. **Maintain Consistency** - Keep style consistent with other rules
4. **Update Examples** - Ensure examples are current
5. **Test Changes** - Verify updates work correctly

## Rule Index

See `.cursor/rules/rules-index.mdc` for a complete catalog of all available rules organized by category.

## Related Documentation

- **Cursor Rules Guide** - `.cursor/rules/cursor-rules.mdc` (guidelines for writing rules)
- **Naming Conventions** - `docs/NAMING_CONVENTIONS.md`
- **Architecture** - `docs/architecture/`
- **Testing Standards** - `docs/testing/BEST-PRACTICES.md`

## Quick Reference

**Most commonly used rules:**
- `project-introduce.mdc` - Project overview
- `architecture.mdc` - Understanding project structure
- `pipeline-enforcement.mdc` - Development workflow
- `typescript.mdc` - TypeScript patterns
- `testing-standards.mdc` - Testing guidelines

**For specific tasks:**
- Database schemas → `drizzle-schema-style-guide.mdc`
- Database migrations → `db-migrations.mdc`
- State management → `zustand-action-patterns.mdc`
- Data fetching → `tanstack-query.mdc`
- Security → `security.mdc`
- Accessibility → `accessibility.mdc`
- Performance → `performance.mdc`
- SEO → `seo.mdc`
- Error handling → `error-handling.mdc`
- Logging → `logging.mdc`
- Environment variables → `environment-variables.mdc`
- Git workflow → `git-workflow.mdc`
- API design → `api-design.mdc`
