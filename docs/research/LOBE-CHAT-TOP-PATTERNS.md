# LobeChat Top Cursor Rule Patterns - Quick Reference

**Quick reference for the most commonly used patterns from LobeChat's Cursor rules.**

## 🎯 Top 10 Most Useful Patterns

### 1. Always-Apply Project Intro
```yaml
---
alwaysApply: true
---

## Project Description
You are developing [project name]

## Tech Stack
- Framework: Next.js 16
- State: Zustand
- Database: Drizzle ORM
- Testing: Vitest
```

### 2. Glob-Based Targeting
```yaml
---
description: React component patterns
globs: *.tsx
alwaysApply: false
---
```

### 3. Rules Index (Always-Apply)
```yaml
---
alwaysApply: true
---

# Available Rules Index

## Frontend
- `react.mdc` - React patterns
- `typescript.mdc` - TS style guide

## Backend
- `drizzle-schema-style-guide.mdc` - Schema conventions
```

### 4. State Management Action Hierarchy
```typescript
// Public Actions (UI calls these)
createTopic: async () => { ... }

// Internal Actions (business logic)
internal_createTopic: async (params) => {
  // Optimistic update
  // Service call
  // Refresh data
}

// Dispatch Methods (state updates)
internal_dispatchTopic: (payload) => { ... }
```

### 5. Optimistic Update Pattern
```typescript
internal_updateMessage: async (id, content) => {
  // 1. Immediate UI update
  internal_dispatchMessage({ id, type: 'update', value: { content } });
  
  // 2. Backend call
  await messageService.update(id, { content });
  
  // 3. Refresh for consistency
  await refreshMessages();
}
```

### 6. Database Schema Conventions
```typescript
// Naming: snake_case, plural tables
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => idGenerator('users')),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  ...timestamps, // Helper from _helpers.ts
});
```

### 7. i18n Flat Keys Pattern
```typescript
// ✅ Good: Flat dot notation
'alert.cloud.action': '立即体验',
'clientDB.error.desc': '数据库初始化遇到问题',

// ❌ Bad: Nested objects
alert: { cloud: { action: '...' } }
```

### 8. TypeScript Best Practices
```typescript
// Prefer inference
const user = getUser(); // ✅ Type inferred

// Avoid explicit any
let data: any; // ❌
let data: Record<string, unknown>; // ✅

// Prefer interface for objects
interface UserProps { ... } // ✅
type UserProps = { ... } // ⚠️ (use for unions/intersections)
```

### 9. Testing Organization (Subdirectory)
```
.cursor/rules/
  testing-guide/
    testing-guide.mdc      # Main guide
    electron-ipc-test.mdc # Specific patterns
    db-model-test.mdc     # Database tests
```

### 10. Meta-Rule for Writing Rules
```markdown
# Cursor Rules Writing Guide

## Code Examples
- Keep minimal, show core concept
- Remove unnecessary imports
- Omit try/catch if not relevant

## Format
- Use `-` for lists
- Avoid excessive formatting
- Maintain language consistency
```

## 📊 Rule Categories Breakdown

| Category | Count | Examples |
|----------|-------|----------|
| **Core** | 3 | project-introduce, project-structure, rules-index |
| **Frontend** | 4 | react, typescript, i18n, microcopy |
| **State** | 2 | zustand-action-patterns, zustand-slice-organization |
| **Backend** | 2 | drizzle-schema, db-migrations |
| **Desktop** | 5 | desktop-feature, desktop-controller-tests, etc. |
| **Testing** | 3 | testing-guide/* |
| **Workflows** | 4 | add-provider, add-setting-env, hotkey, etc. |
| **Utilities** | 2 | debug-usage, cursor-rules (meta) |

## 🔑 Key Takeaways

1. **Always-apply rules** provide critical context (project intro, rules index)
2. **Glob targeting** ensures rules apply only where relevant
3. **Detailed patterns** for complex areas (state management, database)
4. **Subdirectories** organize related rules (testing-guide/)
5. **Meta-rules** help maintain rule quality
6. **Flat i18n keys** prevent conflicts and simplify usage
7. **Optimistic updates** pattern for smooth UX
8. **Action hierarchy** separates public/internal/dispatch layers

## 🚀 Quick Wins for RYLA

1. Add `project-introduce.mdc` (always-apply)
2. Add `rules-index.mdc` (always-apply)
3. Create `cursor-rules.mdc` (meta-rule)
4. Enhance glob targeting in existing rules
5. Consider testing subdirectory if rules grow

---

**See full research:** `docs/research/LOBE-CHAT-CURSOR-RULES-RESEARCH.md`
