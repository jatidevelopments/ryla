# Cursor Rules Verification Guide

This guide explains how to verify that Cursor rules are properly configured and being injected into AI prompts.

## Quick Verification

Run the verification script:

```bash
tsx scripts/verify-cursor-rules.ts
```

This will:
- ✅ Check all rules for valid frontmatter
- ✅ Categorize rules (always-applied vs requestable)
- ✅ Identify glob-based rules
- ✅ Report any invalid configurations

## Understanding Rule Types

### Always Applied Rules (`alwaysApply: true`)

These rules are **automatically injected** into every AI prompt. They provide foundational context that should always be available.

**Current always-applied rules:**
- `rules-index.mdc` - Rule catalog
- `project-introduce.mdc` - Project overview
- `architecture.mdc` - Monorepo structure
- `pipeline-enforcement.mdc` - 10-phase pipeline
- `way-of-work.mdc` - Communication patterns
- `task-execution.mdc` - Task SOP
- `user-intent-validation.mdc` - Intent validation
- `routing.mdc` - Routing patterns
- `infisical.mdc` - Secrets management
- `file-organization.mdc` - File structure
- `git-workflow.mdc` - Git patterns
- `image-optimization.mdc` - Image rules
- `dependencies.mdc` - External services
- `code-style.mdc` - Code conventions
- `mvp-principles.mdc` - MVP constraints

### Requestable Rules (`alwaysApply: false`)

These rules are **only injected when explicitly requested** by the AI agent or when working with matching file patterns (if `globs` are specified).

**Examples:**
- `typescript.mdc` - TypeScript patterns (requestable)
- `react-patterns.mdc` - React patterns (requestable)
- `testing-standards.mdc` - Testing guidelines (requestable)

### Glob-Based Rules

Rules with `globs` patterns are automatically applied when working with matching files:

```yaml
---
globs: ["*.ts", "*.tsx"]
alwaysApply: false
---
```

**Example:** A rule with `globs: ["**/*.tsx"]` will be applied when editing `.tsx` files.

## Testing Rule Injection

### Method 1: Direct Question Test

Ask the AI assistant these questions to verify rule injection:

1. **"What rules are currently applied to this conversation?"**
   - Should mention always-applied rules
   - Should show awareness of project structure

2. **"What does the pipeline-enforcement rule say about phases?"**
   - Should reference the 10-phase pipeline
   - Should mention phase requirements

3. **"What is the project structure according to the architecture rule?"**
   - Should describe Nx monorepo structure
   - Should mention apps/ and libs/ directories

4. **"How should I name branches according to the git-workflow rule?"**
   - Should reference branch naming patterns
   - Should mention issue IDs (EP-XXX, ST-XXX)

### Method 2: Behavior Test

Test if rules affect AI behavior:

1. **Pipeline Test:**
   - Ask: "I want to add a new feature"
   - ✅ Should ask about phase, epic, story
   - ✅ Should reference pipeline-enforcement rule

2. **Architecture Test:**
   - Ask: "Where should I put a new service?"
   - ✅ Should mention business logic layer
   - ✅ Should reference layered architecture

3. **Code Style Test:**
   - Ask: "Create a React component"
   - ✅ Should follow code-style patterns
   - ✅ Should use proper naming conventions

### Method 3: Rule Request Test

Test requestable rules:

1. **"Follow the TypeScript rules"**
   - AI should read `typescript.mdc`
   - Should apply TypeScript patterns

2. **"Use the testing standards"**
   - AI should read `testing-standards.mdc`
   - Should follow testing patterns

3. **"Apply the React patterns rule"**
   - AI should read `react-patterns.mdc`
   - Should use React best practices

### Method 4: Glob Pattern Test

Test glob-based rules:

1. **Edit a `.tsx` file:**
   - Rules with `globs: ["*.tsx"]` should be applied
   - AI should follow React/TypeScript patterns

2. **Edit a schema file:**
   - Rules with `globs: ["**/schemas/**"]` should be applied
   - AI should follow schema patterns

## Expected Behavior

### ✅ Rules Are Working If:

- AI mentions project structure without being asked
- AI references specific rules when relevant
- AI follows patterns from rules (naming, structure, etc.)
- AI asks about phase/epic/story when starting tasks
- AI uses correct import patterns (`@ryla/<lib>`)
- AI follows layered architecture (Apps → Business → Data)

### ❌ Rules May Not Be Working If:

- AI doesn't mention project structure
- AI doesn't follow established patterns
- AI doesn't reference rules when relevant
- AI doesn't ask about pipeline phases
- AI suggests patterns that conflict with rules

## Troubleshooting

### Rules Not Being Applied

1. **Check frontmatter:**
   ```bash
   tsx scripts/verify-cursor-rules.ts
   ```
   - Fix any invalid frontmatter
   - Ensure `alwaysApply` is set correctly

2. **Verify rule location:**
   - Rules must be in `.cursor/rules/` directory
   - Files must have `.mdc` extension

3. **Check Cursor settings:**
   - Ensure Cursor is reading rules directory
   - Restart Cursor if rules were recently added

4. **Test with explicit request:**
   - Ask AI to read a specific rule file
   - Verify rule content is accessible

### Rules Partially Applied

1. **Check glob patterns:**
   - Verify globs match file paths
   - Test with files that should match

2. **Check rule dependencies:**
   - Some rules reference others
   - Ensure referenced rules exist

3. **Check rule size:**
   - Very large rules may be truncated
   - Consider splitting large rules

## Rule Verification Checklist

Before considering rules "working":

- [ ] All rules have valid frontmatter
- [ ] Always-applied rules are configured correctly
- [ ] Requestable rules can be accessed
- [ ] Glob patterns match intended files
- [ ] AI mentions project structure
- [ ] AI follows pipeline enforcement
- [ ] AI uses correct naming conventions
- [ ] AI follows architecture patterns
- [ ] AI references rules when relevant

## Continuous Verification

Run verification regularly:

```bash
# Add to pre-commit hook or CI
tsx scripts/verify-cursor-rules.ts
```

Or add to `package.json`:

```json
{
  "scripts": {
    "verify:rules": "tsx scripts/verify-cursor-rules.ts"
  }
}
```

## Related Documentation

- [Cursor Rules Documentation](./CURSOR-RULES.md)
- [Rules Index](../../.cursor/rules/rules-index.mdc)
- [Cursor Rules Writing Guide](../../.cursor/rules/cursor-rules.mdc)
