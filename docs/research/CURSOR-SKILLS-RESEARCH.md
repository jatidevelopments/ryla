# Cursor Skills Research

**Research Date:** 2025-01-27  
**Purpose:** Understand Cursor Skills feature and how to leverage it for RYLA development

## Executive Summary

Cursor **Skills** are a new feature that allows you to create reusable, task-oriented instructions for the AI agent. Unlike **Rules** (which provide persistent context and coding standards), **Skills** teach the agent how to perform specific workflows or tasks.

### Key Differences: Skills vs Rules

| Aspect | Rules | Skills |
|--------|-------|--------|
| **Purpose** | Coding standards, patterns, context | Task workflows, specialized operations |
| **Location** | `.cursor/rules/*.mdc` | `.cursor/skills/*/SKILL.md` |
| **Structure** | Single markdown file | Directory with SKILL.md + supporting files |
| **Activation** | Always apply or glob-based | Discovered via description matching |
| **Content** | Standards, patterns, examples | Step-by-step workflows, scripts |
| **Scope** | Project-wide or file-specific | Task-specific operations |

## Skills Architecture

### Directory Structure

Skills are stored as directories containing a `SKILL.md` file:

```
skill-name/
├── SKILL.md              # Required - main instructions
├── reference.md          # Optional - detailed documentation
├── examples.md           # Optional - usage examples
└── scripts/              # Optional - utility scripts
    ├── validate.py
    └── helper.sh
```

### Storage Locations

| Type | Path | Scope |
|------|------|-------|
| **Personal** | `~/.cursor/skills/skill-name/` | Available across all your projects |
| **Project** | `.cursor/skills/skill-name/` | Shared with anyone using the repository |

**⚠️ IMPORTANT**: Never create skills in `~/.cursor/skills-cursor/`. This directory is reserved for Cursor's internal built-in skills.

## SKILL.md Format

### Required Structure

Every skill requires a `SKILL.md` file with YAML frontmatter:

```markdown
---
name: your-skill-name
description: Brief description of what this skill does and when to use it
---

# Your Skill Name

## Instructions
Clear, step-by-step guidance for the agent.

## Examples
Concrete examples of using this skill.
```

### Frontmatter Fields

| Field | Requirements | Purpose |
|-------|--------------|---------|
| `name` | Max 64 chars, lowercase letters/numbers/hyphens only | Unique identifier |
| `description` | Max 1024 chars, non-empty | **Critical** - helps agent discover when to use skill |

### Description Best Practices

The description is **critical** for skill discovery. The agent uses it to decide when to apply your skill.

1. **Write in third person** (injected into system prompt):
   - ✅ Good: "Processes Excel files and generates reports"
   - ❌ Bad: "I can help you process Excel files"

2. **Be specific and include trigger terms**:
   - ✅ Good: "Extract text and tables from PDF files, fill forms, merge documents. Use when working with PDF files or when the user mentions PDFs, forms, or document extraction."
   - ❌ Vague: "Helps with documents"

3. **Include both WHAT and WHEN**:
   - WHAT: What the skill does (specific capabilities)
   - WHEN: When the agent should use it (trigger scenarios)

## Authoring Principles

### 1. Concise is Key

The context window is shared with conversation history, other skills, and requests. Every token competes for space.

**Default assumption**: The agent is already very smart. Only add context it doesn't already have.

**Good (concise)**:
```markdown
## Extract PDF text

Use pdfplumber for text extraction:

```python
import pdfplumber

with pdfplumber.open("file.pdf") as pdf:
    text = pdf.pages[0].extract_text()
```
```

**Bad (verbose)**:
```markdown
## Extract PDF text

PDF (Portable Document Format) files are a common file format that contains
text, images, and other content. To extract text from a PDF, you'll need to
use a library. There are many libraries available for PDF processing, but we
recommend pdfplumber because it's easy to use and handles most cases well...
```

### 2. Keep SKILL.md Under 500 Lines

For optimal performance, the main SKILL.md file should be concise. Use progressive disclosure for detailed content.

### 3. Progressive Disclosure

Put essential information in SKILL.md; detailed reference material in separate files:

```markdown
# PDF Processing

## Quick start
[Essential instructions here]

## Additional resources
- For complete API details, see [reference.md](reference.md)
- For usage examples, see [examples.md](examples.md)
```

**Keep references one level deep** - link directly from SKILL.md to reference files.

### 4. Set Appropriate Degrees of Freedom

Match specificity to the task's fragility:

| Freedom Level | When to Use | Example |
|---------------|-------------|---------|
| **High** (text instructions) | Multiple valid approaches, context-dependent | Code review guidelines |
| **Medium** (pseudocode/templates) | Preferred pattern with acceptable variation | Report generation |
| **Low** (specific scripts) | Fragile operations, consistency critical | Database migrations |

## Common Patterns

### Template Pattern

Provide output format templates:

```markdown
## Report structure

Use this template:

```markdown
# [Analysis Title]

## Executive summary
[One-paragraph overview of key findings]

## Key findings
- Finding 1 with supporting data
- Finding 2 with supporting data

## Recommendations
1. Specific actionable recommendation
2. Specific actionable recommendation
```
```

### Examples Pattern

For skills where output quality depends on seeing examples:

```markdown
## Commit message format

**Example 1:**
Input: Added user authentication with JWT tokens
Output:
```
feat(auth): implement JWT-based authentication

Add login endpoint and token validation middleware
```

**Example 2:**
Input: Fixed bug where dates displayed incorrectly
Output:
```
fix(reports): correct date formatting in timezone conversion

Use UTC timestamps consistently across report generation
```
```

### Workflow Pattern

Break complex operations into clear steps with checklists:

```markdown
## Form filling workflow

Copy this checklist and track progress:

```
Task Progress:
- [ ] Step 1: Analyze the form
- [ ] Step 2: Create field mapping
- [ ] Step 3: Validate mapping
- [ ] Step 4: Fill the form
- [ ] Step 5: Verify output
```

**Step 1: Analyze the form**
Run: `python scripts/analyze_form.py input.pdf`
...
```

### Utility Scripts Pattern

Pre-made scripts offer advantages over generated code:
- More reliable than generated code
- Save tokens (no code in context)
- Save time (no code generation)
- Ensure consistency across uses

```markdown
## Utility scripts

**analyze_form.py**: Extract all form fields from PDF
```bash
python scripts/analyze_form.py input.pdf > fields.json
```

**validate.py**: Check for errors
```bash
python scripts/validate.py fields.json
# Returns: "OK" or lists conflicts
```
```

Make clear whether the agent should **execute** the script (most common) or **read** it as reference.

## Anti-Patterns to Avoid

### 1. Windows-Style Paths
- ✅ Use: `scripts/helper.py`
- ❌ Avoid: `scripts\helper.py`

### 2. Too Many Options
```markdown
# Bad - confusing
"You can use pypdf, or pdfplumber, or PyMuPDF, or..."

# Good - provide a default with escape hatch
"Use pdfplumber for text extraction.
For scanned PDFs requiring OCR, use pdf2image with pytesseract instead."
```

### 3. Time-Sensitive Information
```markdown
# Bad - will become outdated
"If you're doing this before August 2025, use the old API."

# Good - use an "old patterns" section
## Current method
Use the v2 API endpoint.

## Old patterns (deprecated)
<details>
<summary>Legacy v1 API</summary>
...
</details>
```

### 4. Inconsistent Terminology
Choose one term and use it throughout:
- ✅ Always "API endpoint" (not mixing "URL", "route", "path")
- ✅ Always "field" (not mixing "box", "element", "control")

### 5. Vague Skill Names
- ✅ Good: `processing-pdfs`, `analyzing-spreadsheets`
- ❌ Avoid: `helper`, `utils`, `tools`

## Complete Example

Here's a complete example of a well-structured skill:

**Directory structure:**
```
code-review/
├── SKILL.md
├── STANDARDS.md
└── examples.md
```

**SKILL.md:**
```markdown
---
name: code-review
description: Review code for quality, security, and maintainability following team standards. Use when reviewing pull requests, examining code changes, or when the user asks for a code review.
---

# Code Review

## Quick Start

When reviewing code:

1. Check for correctness and potential bugs
2. Verify security best practices
3. Assess code readability and maintainability
4. Ensure tests are adequate

## Review Checklist

- [ ] Logic is correct and handles edge cases
- [ ] No security vulnerabilities (SQL injection, XSS, etc.)
- [ ] Code follows project style conventions
- [ ] Functions are appropriately sized and focused
- [ ] Error handling is comprehensive
- [ ] Tests cover the changes

## Providing Feedback

Format feedback as:
- 🔴 **Critical**: Must fix before merge
- 🟡 **Suggestion**: Consider improving
- 🟢 **Nice to have**: Optional enhancement

## Additional Resources

- For detailed coding standards, see [STANDARDS.md](STANDARDS.md)
- For example reviews, see [examples.md](examples.md)
```

## Potential Skills for RYLA

Based on RYLA's architecture and workflows, here are potential skills we could create:

### 1. Epic Implementation Skill
**Purpose**: Guide agent through implementing a complete epic following the 10-phase pipeline
**Location**: `.cursor/skills/epic-implementation/`
**Description**: "Implements complete epics following RYLA's 10-phase pipeline. Use when starting work on EP-XXX epics, implementing features, or when the user mentions epic implementation."

### 2. Database Migration Skill
**Purpose**: Create and apply Drizzle migrations following RYLA patterns
**Location**: `.cursor/skills/db-migration/`
**Description**: "Creates and applies database migrations using Drizzle ORM following RYLA schema patterns. Use when modifying database schemas, creating migrations, or when the user mentions database changes."

### 3. Test Generation Skill
**Purpose**: Generate comprehensive tests following RYLA testing standards
**Location**: `.cursor/skills/test-generation/`
**Description**: "Generates unit, integration, and E2E tests following RYLA testing standards. Use when writing tests, implementing test coverage, or when the user asks for test generation."

### 4. API Endpoint Skill
**Purpose**: Create tRPC endpoints following RYLA API design patterns
**Location**: `.cursor/skills/api-endpoint/`
**Description**: "Creates tRPC endpoints following RYLA API design patterns and layered architecture. Use when adding new API endpoints, creating routers, or when the user mentions API development."

### 5. Component Creation Skill
**Purpose**: Create React components following RYLA patterns and file organization
**Location**: `.cursor/skills/component-creation/`
**Description**: "Creates React components following RYLA patterns, file organization, and accessibility standards. Use when creating new components, building UI features, or when the user mentions component development."

### 6. Analytics Integration Skill
**Purpose**: Add PostHog analytics tracking following RYLA analytics patterns
**Location**: `.cursor/skills/analytics-integration/`
**Description**: "Adds PostHog analytics tracking following RYLA analytics patterns and tracking plan. Use when adding analytics events, tracking user actions, or when the user mentions analytics."

## Implementation Plan

### Phase 1: Research & Setup
- [x] Research Skills feature documentation
- [ ] Create `.cursor/skills/` directory structure
- [ ] Document Skills vs Rules differences
- [ ] Identify high-value skills for RYLA

### Phase 2: Create First Skill
- [ ] Choose highest-value skill (recommend: Epic Implementation)
- [ ] Create skill directory and SKILL.md
- [ ] Add supporting files (reference.md, examples.md if needed)
- [ ] Test skill discovery and usage

### Phase 3: Expand Skills Library
- [ ] Create additional skills based on common workflows
- [ ] Document skill usage patterns
- [ ] Update project documentation

### Phase 4: Integration
- [ ] Add Skills section to project documentation
- [ ] Create skill creation workflow
- [ ] Document when to use Skills vs Rules

## Key Takeaways

1. **Skills are task-oriented** - Use for workflows and specific operations
2. **Rules are context-oriented** - Use for standards and patterns
3. **Description is critical** - Must include WHAT and WHEN for discovery
4. **Keep it concise** - Under 500 lines, use progressive disclosure
5. **Use scripts** - Pre-made scripts are more reliable than generated code
6. **Project vs Personal** - Project skills in `.cursor/skills/`, personal in `~/.cursor/skills/`

## Related Documentation

- Cursor Rules: `.cursor/rules/` (existing rules)
- Rules Documentation: `docs/technical/guides/cursor-rules/`
- Create Skill Skill: `~/.cursor/skills-cursor/create-skill/SKILL.md` (built-in)
- Create Rule Skill: `~/.cursor/skills-cursor/create-rule/SKILL.md` (built-in)

## Next Steps

1. **Create `.cursor/skills/` directory** in project root
2. **Start with Epic Implementation Skill** - Most valuable for RYLA workflow
3. **Test skill discovery** - Verify agent can find and use the skill
4. **Iterate based on usage** - Refine skills based on actual usage patterns

---

**Research Status**: ✅ Complete  
**Next Action**: Create first skill (Epic Implementation)  
**Last Updated**: 2025-01-27
