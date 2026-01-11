# LobeChat Cursor Rules Research

**Research Date:** 2025-01-27  
**Source:** https://github.com/lobehub/lobe-chat  
**Purpose:** Analyze Cursor rules patterns from similar projects to improve RYLA's rule structure

## Executive Summary

LobeChat (70k stars, AI Agent Workspace) has **25+ Cursor rules** organized into clear categories. Key findings:

- **Always-apply rules**: Project intro, rules index
- **Glob-based rules**: React (`.tsx`), TypeScript (`.ts, .tsx, .mts`), Zustand (`src/store/**`)
- **Feature-specific rules**: Desktop, i18n, database, testing
- **Pattern-focused rules**: Zustand actions, Drizzle schemas, microcopy

## Rule Categories & Count

### Core Architecture (3 rules)
1. `project-introduce.mdc` - **alwaysApply: true** - Tech stack overview
2. `project-structure.mdc` - Monorepo structure, data flow
3. `rules-index.mdc` - **alwaysApply: true** - Rule catalog

### Frontend Patterns (4 rules)
4. `react.mdc` - **globs: *.tsx** - Component patterns, routing, Lobe UI
5. `typescript.mdc` - **globs: *.ts,*.tsx,*.mts** - Type safety, async patterns
6. `i18n.mdc` - **globs: *.tsx** - react-i18next, flat keys
7. `microcopy-en.mdc` / `microcopy-cn.mdc` - UI copy guidelines

### State Management (2 rules)
8. `zustand-action-patterns.mdc` - **globs: src/store/**** - Action hierarchy, optimistic updates
9. `zustand-slice-organization.mdc` - Slice structure best practices

### Backend/Database (2 rules)
10. `drizzle-schema-style-guide.mdc` - **globs: src/database/schemas/*** - Schema conventions
11. `db-migrations.mdc` - Migration patterns

### Desktop/Electron (5 rules)
12. `desktop-feature-implementation.mdc` - Electron feature workflow
13. `desktop-controller-tests.mdc` - IPC testing
14. `desktop-local-tools-implement.mdc` - Local tools workflow
15. `desktop-menu-configuration.mdc` - Menu setup
16. `desktop-window-management.mdc` - Window management

### Testing (3 rules in subdirectory)
17. `testing-guide/testing-guide.mdc` - Vitest comprehensive guide
18. `testing-guide/electron-ipc-test.mdc` - IPC testing strategy
19. `testing-guide/db-model-test.mdc` - Database model testing

### Development Workflows (4 rules)
20. `add-provider-doc.mdc` - Adding AI providers
21. `add-setting-env.mdc` - Environment variable setup
22. `hotkey.mdc` - Keyboard shortcuts
23. `recent-data-usage.mdc` - Recent data patterns

### Debugging & Utilities (2 rules)
24. `debug-usage.mdc` - Debug package conventions
25. `cursor-rules.mdc` - **Meta-rule**: How to write rules

## Top Patterns & Best Practices

### 1. **Always-Apply Rules** (Critical Context)

**LobeChat uses:**
- `project-introduce.mdc` - Tech stack, logo, platforms
- `rules-index.mdc` - Rule catalog for discovery

**RYLA equivalent:**
- ✅ Has architecture rules (always-applied)
- ⚠️ Missing project intro rule
- ⚠️ Missing rules index

**Recommendation:** Add `project-introduce.mdc` with RYLA tech stack overview.

### 2. **Glob-Based Targeting** (Precision)

**LobeChat examples:**
```yaml
globs: *.tsx                    # React components
globs: *.ts,*.tsx,*.mts        # TypeScript files
globs: src/store/**             # Zustand stores
globs: src/database/schemas/*   # Database schemas
```

**RYLA current:**
- ✅ Has glob-based rules (e.g., `analytics.mdc`, `business-logic.mdc`)
- ✅ Uses `alwaysApply: false` for targeted rules

**Recommendation:** Continue using globs for precision, add more specific globs where helpful.

### 3. **State Management Patterns** (Deep Detail)

**LobeChat's Zustand patterns:**
- **3-layer action hierarchy**: Public → Internal → Dispatch
- **Optimistic updates**: Detailed patterns for create/update
- **Loading state management**: Array-based patterns
- **SWR integration**: Cache invalidation patterns

**RYLA comparison:**
- ⚠️ No state management rule (uses different patterns?)
- ✅ Has business-logic layer rules

**Recommendation:** If using Zustand/Redux, create similar pattern guide.

### 4. **Database Schema Guidelines** (Comprehensive)

**LobeChat's Drizzle guide:**
- Naming conventions (snake_case, plural tables)
- Helper functions (`timestamps`, `createdAt()`)
- Common patterns (userId + clientId, junction tables)
- Type inference with Zod

**RYLA comparison:**
- ✅ Has `data-access.mdc` (repository patterns)
- ⚠️ No schema-specific guide (uses Drizzle?)

**Recommendation:** If using Drizzle, create schema style guide similar to LobeChat.

### 5. **Testing Organization** (Subdirectory Structure)

**LobeChat structure:**
```
.cursor/rules/
  testing-guide/
    testing-guide.mdc
    electron-ipc-test.mdc
    db-model-test.mdc
```

**RYLA comparison:**
- ✅ Has `testing-standards.mdc`
- ⚠️ Single file vs. organized subdirectory

**Recommendation:** Consider splitting testing rules into subdirectory if they grow.

### 6. **Internationalization** (i18n Patterns)

**LobeChat's i18n rule:**
- Flat keys with dot notation (not nested)
- Naming pattern: `{feature}.{context}.{action|status}`
- Workflow: Edit source → Generate translations
- Key conflict avoidance

**RYLA comparison:**
- ⚠️ No i18n rule (if needed)

**Recommendation:** If adding i18n, create similar guide.

### 7. **Meta-Rule for Writing Rules**

**LobeChat's `cursor-rules.mdc`:**
- Guidelines for writing/optimizing rules
- Code example best practices
- Format consistency
- Review checklist

**RYLA comparison:**
- ⚠️ No meta-rule

**Recommendation:** Create meta-rule for maintaining rule quality.

## Key Differences: LobeChat vs RYLA

| Aspect | LobeChat | RYLA |
|--------|----------|------|
| **Total Rules** | 25+ | 20 |
| **Always-Apply** | 2 (intro, index) | Multiple (architecture, pipeline) |
| **Glob Targeting** | Extensive use | Moderate use |
| **Testing Rules** | Subdirectory (3 files) | Single file |
| **State Management** | Detailed Zustand guide | Business logic layer |
| **Database** | Drizzle schema guide | Repository patterns |
| **Meta-Rules** | Yes (how to write rules) | No |
| **Project Intro** | Yes (tech stack) | No |
| **Rules Index** | Yes (catalog) | No |

## Recommendations for RYLA

### High Priority

1. **Add `project-introduce.mdc`** (always-apply)
   - RYLA tech stack overview
   - Logo/branding
   - Platform support
   - Key dependencies

2. **Add `rules-index.mdc`** (always-apply)
   - Catalog of all rules
   - Organized by category
   - Quick reference for AI agents

3. **Create meta-rule** (`cursor-rules.mdc`)
   - Guidelines for writing rules
   - Code example standards
   - Review checklist

### Medium Priority

4. **Enhance glob targeting**
   - Add more specific globs where helpful
   - Match LobeChat's precision

5. **Consider testing subdirectory**
   - If testing rules grow, organize into `testing-guide/`
   - Split by test type (unit, integration, e2e)

6. **Add schema guide** (if using Drizzle)
   - Similar to LobeChat's comprehensive guide
   - Naming conventions, patterns, helpers

### Low Priority

7. **Feature-specific rules** (as needed)
   - Desktop/Electron (if adding)
   - i18n (if adding)
   - Microcopy guidelines (if needed)

## Rule Writing Best Practices (From LobeChat)

### Code Examples
- ✅ Keep examples minimal, show core concept
- ✅ Remove unnecessary imports/exports
- ✅ Omit try/catch, CSS if not relevant
- ✅ Keep helpful comments, remove noise

### Format
- ✅ Use `-` for unordered lists
- ✅ Avoid excessive formatting (bold, inline code)
- ✅ Maintain language consistency
- ✅ Avoid redundant punctuation

### Structure
- ✅ Use frontmatter: `description`, `globs`, `alwaysApply`
- ✅ Clear headings and sections
- ✅ Examples before/after patterns
- ✅ Link to related rules/files

## Implementation Plan

### Phase 1: Core Rules (Week 1)
- [ ] Create `project-introduce.mdc`
- [ ] Create `rules-index.mdc`
- [ ] Update existing rules to reference index

### Phase 2: Meta & Organization (Week 2)
- [ ] Create `cursor-rules.mdc` (meta-rule)
- [ ] Review and optimize existing rules
- [ ] Add more specific globs where helpful

### Phase 3: Feature-Specific (As Needed)
- [ ] Add schema guide (if using Drizzle)
- [ ] Split testing rules if they grow
- [ ] Add i18n guide if needed

## References

- **LobeChat Repository:** https://github.com/lobehub/lobe-chat
- **LobeChat Rules:** `.cursor/rules/` directory
- **RYLA Rules:** `.cursor/rules/` directory

## Notes

- LobeChat is a mature project (70k stars) with extensive rule coverage
- Their rules are highly specific to their tech stack (Next.js, Zustand, Drizzle)
- RYLA has different architecture (Nx monorepo, different state management)
- Focus on adapting patterns, not copying directly
- RYLA's pipeline enforcement and business logic rules are unique strengths

---

**Next Steps:**
1. Review this research with team
2. Prioritize recommendations
3. Implement Phase 1 rules
4. Iterate based on usage feedback
