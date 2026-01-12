# Rules to Adopt from LobeChat - Implementation Plan

**Date:** 2025-01-27  
**Status:** Ready to implement

## Summary

Based on analysis of LobeChat's Cursor rules and RYLA's current setup, here are the **specific rules we can copy/adapt**:

## ✅ High Priority - Copy Directly

### 1. `project-introduce.mdc` (Always-Apply)

**Why:** Provides critical context about tech stack, logo, platforms. LobeChat uses this as `alwaysApply: true`.

**What to adapt:**
- Replace LobeChat tech stack with RYLA's
- Update logo/branding
- List RYLA's platforms (web, funnel, landing, api)

**RYLA Tech Stack:**
- Next.js 14
- React 18
- TypeScript 5.9
- Nx Monorepo
- Drizzle ORM
- Zustand
- NestJS (API)
- Supabase (Auth)
- PostHog (Analytics)
- Vitest + Playwright (Testing)

**Implementation:** Create new file, mark as `alwaysApply: true`

---

### 2. `rules-index.mdc` (Always-Apply)

**Why:** Helps AI agents discover available rules. LobeChat uses this as `alwaysApply: true`.

**What to adapt:**
- List all RYLA's current rules organized by category
- Match RYLA's rule structure (architecture, business-logic, data-access, etc.)

**RYLA Categories:**
- Core Architecture
- Frontend (React, TypeScript)
- Backend (NestJS, Drizzle)
- State Management (Zustand)
- Testing
- Business Logic
- Data Access
- Analytics
- MCP Integration

**Implementation:** Create new file, mark as `alwaysApply: true`

---

### 3. `cursor-rules.mdc` (Meta-Rule)

**Why:** Guidelines for writing/maintaining rules. Helps maintain quality.

**What to copy:**
- Code example best practices
- Format consistency guidelines
- Review checklist

**Implementation:** Copy structure, adapt language if needed (LobeChat uses Chinese, RYLA uses English)

---

## 🔄 Medium Priority - Adapt for RYLA

### 4. `typescript.mdc` (Glob: `*.ts,*.tsx,*.mts`)

**Why:** RYLA has `code-style.mdc` but no dedicated TypeScript rule. LobeChat's is comprehensive.

**What to adapt:**
- Copy TypeScript-specific patterns
- Remove LobeChat-specific references (e.g., `@lobehub/ui`)
- Add RYLA-specific patterns (e.g., Nx monorepo imports)
- Keep: type safety, async patterns, code structure

**Key patterns to include:**
- Prefer type inference
- Avoid `any`, use `Record<PropertyKey, unknown>`
- Prefer `interface` over `type` for object shapes
- Prefer `async/await` over callbacks
- Use `Promise.all` for concurrent operations
- Prefer `for…of` loops

**Implementation:** Create new file, adapt from LobeChat's version

---

### 5. `drizzle-schema-style-guide.mdc` (Glob: `libs/data/src/schemas/**`)

**Why:** RYLA uses Drizzle ORM extensively but has no schema style guide. LobeChat's is very detailed.

**What to adapt:**
- Copy naming conventions (snake_case, plural tables)
- Adapt helper functions to RYLA's structure
- Update file paths (LobeChat: `src/database/schemas/`, RYLA: `libs/data/src/schemas/`)
- Keep: PK patterns, FK patterns, timestamps, indexes, Zod schemas

**RYLA-specific adaptations:**
- Update schema location: `libs/data/src/schemas/`
- Update import paths: `@ryla/data`
- Keep RYLA's existing patterns (if any)

**Implementation:** Create new file, adapt paths and structure

---

### 6. `zustand-action-patterns.mdc` (Glob: `**/store/**` or `libs/business/src/store/**`)

**Why:** RYLA uses Zustand (confirmed in codebase) but has no patterns guide. LobeChat's is excellent.

**What to adapt:**
- Copy action hierarchy pattern (Public → Internal → Dispatch)
- Adapt to RYLA's store structure
- Update file paths (LobeChat: `src/store/`, RYLA: `libs/business/src/store/`)
- Keep: optimistic updates, loading state, SWR integration (if RYLA uses SWR)

**RYLA-specific adaptations:**
- Update store location: `libs/business/src/store/`
- Check if RYLA uses SWR (if not, remove SWR section)
- Adapt to RYLA's existing Zustand patterns

**Implementation:** Create new file, adapt paths and patterns

---

## ⚠️ Low Priority - Consider Later

### 7. `i18n.mdc` (If adding i18n)

**Why:** Only needed if RYLA adds internationalization.

**What to adapt:**
- Flat keys pattern
- Naming conventions
- Workflow

**Implementation:** Create when i18n is added

---

### 8. `db-migrations.mdc` (If needed)

**Why:** RYLA has migration commands but no migration guide.

**What to adapt:**
- Drizzle migration patterns
- Naming conventions
- Workflow

**Implementation:** Create if migration patterns need documentation

---

## 📋 Implementation Checklist

### Phase 1: Core Rules (Do First)

- [ ] **Create `project-introduce.mdc`**
  - [ ] Add RYLA tech stack
  - [ ] Add logo/branding
  - [ ] List platforms
  - [ ] Mark as `alwaysApply: true`

- [ ] **Create `rules-index.mdc`**
  - [ ] List all current RYLA rules
  - [ ] Organize by category
  - [ ] Mark as `alwaysApply: true`

- [ ] **Create `cursor-rules.mdc`**
  - [ ] Copy meta-rule structure
  - [ ] Adapt to English
  - [ ] Add RYLA-specific guidelines

### Phase 2: Language & Patterns (Do Next)

- [ ] **Create `typescript.mdc`**
  - [ ] Copy TypeScript patterns
  - [ ] Remove LobeChat-specific references
  - [ ] Add RYLA-specific patterns
  - [ ] Set glob: `*.ts,*.tsx,*.mts`

- [ ] **Create `drizzle-schema-style-guide.mdc`**
  - [ ] Copy schema patterns
  - [ ] Update paths to `libs/data/src/schemas/`
  - [ ] Update imports to `@ryla/data`
  - [ ] Set glob: `libs/data/src/schemas/**`

- [ ] **Create `zustand-action-patterns.mdc`**
  - [ ] Copy action hierarchy
  - [ ] Update paths to `libs/business/src/store/`
  - [ ] Check SWR usage (remove if not used)
  - [ ] Set glob: `libs/business/src/store/**`

### Phase 3: Review & Refine

- [ ] Review all new rules for consistency
- [ ] Update `rules-index.mdc` with new rules
- [ ] Test rules with AI agent
- [ ] Get team feedback

---

## 🔍 Comparison: What RYLA Already Has

| Rule Type | LobeChat | RYLA | Action |
|-----------|----------|------|--------|
| **Project Intro** | ✅ | ❌ | **Create** |
| **Rules Index** | ✅ | ❌ | **Create** |
| **Meta-Rule** | ✅ | ❌ | **Create** |
| **TypeScript** | ✅ | ⚠️ (code-style only) | **Enhance** |
| **React** | ✅ | ⚠️ (in architecture) | Keep as-is |
| **Drizzle Schema** | ✅ | ❌ | **Create** |
| **Zustand Patterns** | ✅ | ❌ | **Create** |
| **Testing** | ✅ | ✅ | Keep as-is |
| **Architecture** | ✅ | ✅ | Keep as-is |
| **Business Logic** | ⚠️ | ✅ | Keep as-is |
| **Data Access** | ⚠️ | ✅ | Keep as-is |

---

## 📝 File Structure After Implementation

```
.cursor/rules/
├── project-introduce.mdc          # NEW - alwaysApply: true
├── rules-index.mdc                # NEW - alwaysApply: true
├── cursor-rules.mdc               # NEW - meta-rule
├── typescript.mdc                  # NEW - glob: *.ts,*.tsx,*.mts
├── drizzle-schema-style-guide.mdc  # NEW - glob: libs/data/src/schemas/**
├── zustand-action-patterns.mdc     # NEW - glob: libs/business/src/store/**
├── architecture.mdc                # EXISTING
├── code-style.mdc                 # EXISTING (may merge with typescript.mdc)
├── business-logic.mdc            # EXISTING
├── data-access.mdc               # EXISTING
├── testing-standards.mdc          # EXISTING
└── ... (other existing rules)
```

---

## 🎯 Quick Start

**To implement immediately:**

1. Copy LobeChat's `project-introduce.mdc` → adapt for RYLA
2. Copy LobeChat's `rules-index.mdc` → list RYLA's rules
3. Copy LobeChat's `cursor-rules.mdc` → adapt to English

**Then:**

4. Copy LobeChat's `typescript.mdc` → adapt for RYLA
5. Copy LobeChat's `drizzle-schema-style-guide.mdc` → update paths
6. Copy LobeChat's `zustand-action-patterns.mdc` → update paths

---

## 📚 References

- **LobeChat Rules:** https://github.com/lobehub/lobe-chat/tree/next/.cursor/rules
- **Full Research:** `docs/research/LOBE-CHAT-CURSOR-RULES-RESEARCH.md`
- **Top Patterns:** `docs/research/LOBE-CHAT-TOP-PATTERNS.md`

---

**Next Step:** Start with Phase 1 (Core Rules) - these provide the most immediate value.
