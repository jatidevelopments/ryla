# Cursor Rules Comparative Research

**Research Date:** 2025-01-27  
**Purpose:** Analyze Cursor rules from multiple popular repositories to identify best practices and missing patterns

## Repositories Analyzed

1. **LobeChat** (lobehub/lobe-chat) - 70k stars, AI Agent Workspace
2. **awesome-cursor-rules** (blefnk/awesome-cursor-rules) - Next.js 15, React 19, Drizzle, TanStack Query
3. **cursor-rules** (jesseoue/cursor-rules) - Comprehensive modern web dev rules
4. **ultimate-Cursor-AI-rules** (mofaizal/ultimate-Cursor-AI-rules) - Next.js + Supabase + Tailwind

---

## Key Findings

### 1. File Organization Patterns

#### Pattern A: Numbered Markdown Files (blefnk)
```
000-cursor-rules.md          # Meta-rule
001-general-rules.md
002-tech-stack.md
003-file-structure.md
004-accessibility.md
100-package-manager.md
300-testing-vitest.md
800-server-actions.md
1000-typescript.md
2000-react.md
2001-nextjs.md
2004-drizzle-orm.md
2007-tanstack-query.md
```

**Pros:**
- Clear ordering/priority
- Easy to find rules by category
- Numbering indicates importance

**Cons:**
- Harder to reorganize
- Numbers can become arbitrary

#### Pattern B: Descriptive .mdc Files (LobeChat, jesseoue)
```
.cursor/rules/
  project-introduce.mdc
  typescript.mdc
  react.mdc
  drizzle-schema-style-guide.mdc
  accessibility.mdc
  performance.mdc
  security.mdc
```

**Pros:**
- Self-documenting names
- Easy to reorganize
- Standard Cursor format

**Cons:**
- No implicit ordering
- Need index file for discovery

#### Pattern C: Single Comprehensive File (mofaizal)
```
.cursor/nextjs.rules.mdc  # One large always-apply rule
```

**Pros:**
- Simple setup
- All context in one place

**Cons:**
- Hard to maintain
- No selective application
- Large context window usage

**RYLA Recommendation:** ✅ Use Pattern B (descriptive .mdc files) - matches current approach

---

### 2. Rule Format Patterns

#### Pattern A: XML-Based (jesseoue)
```xml
<accessibility-guidelines>
  <semantic-html>
    <rules>
      - Use semantic HTML elements
      - Use proper heading hierarchy
    </rules>
    <examples>
      <example type="good">...</example>
    </examples>
  </semantic-html>
</accessibility-guidelines>
```

**Pros:**
- Unambiguous parsing
- Explicit hierarchy
- LLM-friendly structure

**Cons:**
- More verbose
- Less human-readable

#### Pattern B: Markdown with Frontmatter (LobeChat, blefnk)
```markdown
---
description: TypeScript code style guide
globs: *.ts,*.tsx
alwaysApply: false
---

# TypeScript Code Style Guide

## Types and Type Safety
- Prefer type inference
- Avoid `any`
...
```

**Pros:**
- Human-readable
- Standard Markdown
- Easy to write/maintain

**Cons:**
- Less structured for LLMs
- More ambiguous parsing

**RYLA Recommendation:** ✅ Use Pattern B (Markdown) - more maintainable, already using it

---

### 3. Unique Rules We're Missing

#### High Priority

1. **Accessibility (A11y) Rules** ⭐⭐⭐
   - **Found in:** jesseoue, blefnk
   - **Why important:** Legal compliance, inclusive design, better UX
   - **Coverage:** Semantic HTML, ARIA, keyboard navigation, color contrast, screen readers

2. **Performance Optimization** ⭐⭐⭐
   - **Found in:** jesseoue
   - **Why important:** Core Web Vitals, user experience, SEO
   - **Coverage:** Bundle optimization, React optimization, image optimization, caching, database optimization

3. **Security Best Practices** ⭐⭐⭐
   - **Found in:** jesseoue
   - **Why important:** Protect user data, prevent attacks
   - **Coverage:** Authentication, input validation, API security, data protection, common vulnerabilities

#### Medium Priority

4. **Server Actions (Next.js)** ⭐⭐
   - **Found in:** blefnk
   - **Why important:** RYLA uses Next.js App Router
   - **Coverage:** "use server" directive, form actions, optimistic updates, revalidation

5. **TanStack Query Patterns** ⭐⭐
   - **Found in:** blefnk, jesseoue
   - **Why important:** RYLA uses TanStack Query
   - **Coverage:** Query keys, mutations, invalidation, optimistic updates

6. **SEO Optimization** ⭐
   - **Found in:** jesseoue
   - **Why important:** Landing page needs SEO
   - **Coverage:** Metadata, structured data, sitemaps, robots.txt

#### Low Priority

7. **Import Ordering** ⭐
   - **Found in:** jesseoue
   - **Why important:** Code consistency
   - **Coverage:** Import grouping, sorting

8. **Error Messages** ⭐
   - **Found in:** jesseoue
   - **Why important:** Better UX
   - **Coverage:** User-friendly error messages

---

## Detailed Rule Analysis

### Accessibility Rules (jesseoue)

**Structure:**
- Semantic HTML requirements
- ARIA attributes patterns
- Keyboard navigation
- Color contrast
- Images/media
- Forms accessibility
- Testing tools

**Key Patterns:**
```tsx
// Semantic structure
<main>
  <header>
    <h1>Page Title</h1>
    <nav aria-label="Main navigation">...</nav>
  </header>
</main>

// ARIA best practices
<button 
  aria-expanded={isOpen}
  aria-controls="menu"
  aria-label="Toggle navigation"
>
  ☰
</button>

// Keyboard accessible
<div
  role="dialog"
  aria-modal="true"
  tabIndex={-1}
  onKeyDown={handleKeyDown}
>
```

**RYLA Action:** Create `accessibility.mdc` rule

---

### Performance Rules (jesseoue)

**Structure:**
- Bundle optimization
- React optimization (memo, useMemo, useCallback)
- Image optimization
- Caching strategies
- Database optimization
- Loading performance
- Runtime optimization
- Monitoring tools

**Key Patterns:**
```typescript
// Code splitting
const LazyComponent = lazy(() => import('./HeavyComponent'));

// React optimization
const ExpensiveComponent = memo(({ data }) => {
  const processed = useMemo(() => process(data), [data]);
  const handleClick = useCallback((id) => {...}, []);
});

// Next.js Image
<Image
  src="/hero.jpg"
  width={1200}
  height={600}
  priority={true}
  placeholder="blur"
/>

// Caching
res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=59');
```

**RYLA Action:** Create `performance.mdc` rule

---

### Security Rules (jesseoue)

**Structure:**
- Authentication security
- Input validation
- API security
- Data protection
- Common vulnerabilities

**Key Patterns:**
```typescript
// Password hashing
const hashPassword = async (password: string) => {
  return bcrypt.hash(password, 12);
};

// Secure cookies
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 900000,
};

// Input validation
const UserSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
});

// Security headers
const securityHeaders = {
  'Strict-Transport-Security': 'max-age=31536000',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
};
```

**RYLA Action:** Create `security.mdc` rule

---

### Server Actions (blefnk)

**Key Patterns:**
```typescript
// Inline server action
async function createPost(formData: FormData) {
  "use server";
  // mutate data, revalidate
}

// Module-level
"use server";
export async function createUser(formData: FormData) {
  // ...
}

// Form usage
<form action={createPost}>...</form>

// Revalidation
revalidatePath("/posts");
revalidateTag("posts");
```

**RYLA Action:** Consider if using Next.js Server Actions

---

### TanStack Query (blefnk, jesseoue)

**Key Patterns:**
```typescript
// Query setup
const query = useQuery({
  queryKey: ['todos'],
  queryFn: getTodos,
});

// Mutation with invalidation
const mutation = useMutation({
  mutationFn: postTodo,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['todos'] });
  },
});

// Optimistic updates
const mutation = useMutation({
  mutationFn: updateTodo,
  onMutate: async (newTodo) => {
    await queryClient.cancelQueries({ queryKey: ['todos'] });
    const previous = queryClient.getQueryData(['todos']);
    queryClient.setQueryData(['todos'], (old) => [...old, newTodo]);
    return { previous };
  },
  onError: (err, newTodo, context) => {
    queryClient.setQueryData(['todos'], context.previous);
  },
});
```

**RYLA Action:** Create `tanstack-query.mdc` rule (if not already covered)

---

## Meta-Rule Patterns

### jesseoue's Meta-Guide

**Key Principles:**
- Start with simplest structure
- Optimize for LLM parsing
- Use XML tags for structure
- One rule per file
- Clear frontmatter

**Template:**
```yaml
---
description: Brief description
globs: []
alwaysApply: false
---
```

**RYLA Note:** Similar to our `cursor-rules.mdc`, but jesseoue emphasizes XML structure more

---

### blefnk's Meta-Rule

**Key Principles:**
- ACTION when TRIGGER to OUTCOME format
- Use numbered prefixes for organization
- Include version tags
- Use `<example>` and `<example type="invalid">` tags

**Template:**
```markdown
---
description: ACTION when TRIGGER to OUTCOME
globs: src/**/*.{ts,tsx}
alwaysApply: false
---

<version>1.0.0</version>

## Context
- When to apply

## Requirements
- Actionable items

## Examples
<example>...</example>
<example type="invalid">...</example>
```

**RYLA Note:** Good pattern for description format

---

## Comparison Matrix

| Rule Category | LobeChat | blefnk | jesseoue | mofaizal | RYLA |
|--------------|----------|--------|----------|----------|------|
| **Project Intro** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Rules Index** | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Meta-Rule** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **TypeScript** | ✅ | ✅ | ✅ | ✅ | ✅ |
| **React** | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| **Next.js** | ⚠️ | ✅ | ✅ | ✅ | ⚠️ |
| **Drizzle** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Zustand** | ✅ | ❌ | ❌ | ❌ | ✅ |
| **Accessibility** | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Performance** | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Security** | ❌ | ❌ | ✅ | ❌ | ❌ |
| **Server Actions** | ❌ | ✅ | ❌ | ❌ | ❌ |
| **TanStack Query** | ❌ | ✅ | ✅ | ❌ | ❌ |
| **Testing** | ✅ | ✅ | ✅ | ❌ | ✅ |
| **Migrations** | ✅ | ❌ | ❌ | ❌ | ✅ |
| **SEO** | ❌ | ❌ | ✅ | ❌ | ❌ |

---

## Recommendations for RYLA

### Must Add (High Priority)

1. **`accessibility.mdc`** (glob: `**/*.tsx`, `**/*.ts`)
   - Semantic HTML
   - ARIA attributes
   - Keyboard navigation
   - Color contrast
   - Screen reader support

2. **`performance.mdc`** (glob: `**/*.tsx`, `**/*.ts`)
   - React optimization
   - Image optimization
   - Caching strategies
   - Bundle optimization
   - Database optimization

3. **`security.mdc`** (glob: `**/*.ts`, `apps/api/**`)
   - Authentication security
   - Input validation
   - API security
   - Data protection
   - Security headers

### Should Add (Medium Priority)

4. **`tanstack-query.mdc`** (glob: `**/*.tsx`, `**/*.ts`)
   - Query patterns
   - Mutation patterns
   - Invalidation strategies
   - Optimistic updates

5. **`nextjs-server-actions.mdc`** (glob: `apps/web/**`, `apps/landing/**`)
   - Server Actions patterns
   - Form actions
   - Revalidation
   - Optimistic updates

6. **`seo.mdc`** (glob: `apps/landing/**`)
   - Metadata patterns
   - Structured data
   - Sitemap generation

### Nice to Have (Low Priority)

7. **`import-ordering.mdc`** (glob: `**/*.ts`, `**/*.tsx`)
   - Import grouping
   - Import sorting

8. **`error-messages.mdc`** (glob: `**/*.ts`, `**/*.tsx`)
   - User-friendly errors
   - Error formatting

---

## Implementation Priority

### Phase 1: Critical Rules (Week 1)
- [ ] `accessibility.mdc`
- [ ] `performance.mdc`
- [ ] `security.mdc`

### Phase 2: Framework-Specific (Week 2)
- [ ] `tanstack-query.mdc`
- [ ] `nextjs-server-actions.mdc` (if using Server Actions)

### Phase 3: Enhancement (Week 3)
- [ ] `seo.mdc`
- [ ] `import-ordering.mdc`

---

## Key Learnings

1. **Accessibility is critical** - Multiple repos have dedicated rules
2. **Performance matters** - Comprehensive optimization patterns
3. **Security is essential** - Best practices prevent vulnerabilities
4. **Format consistency** - Markdown with frontmatter is standard
5. **Glob targeting** - Precise file targeting improves relevance
6. **Meta-rules help** - Guidelines for writing rules improve quality

---

## References

- **LobeChat:** https://github.com/lobehub/lobe-chat/tree/next/.cursor/rules
- **awesome-cursor-rules:** https://github.com/blefnk/awesome-cursor-rules
- **cursor-rules:** https://github.com/jesseoue/cursor-rules/tree/main/.cursor/rules
- **ultimate-Cursor-AI-rules:** https://github.com/mofaizal/ultimate-Cursor-AI-rules

---

**Next Steps:**
1. Review this research with team
2. Prioritize missing rules
3. Implement Phase 1 rules (accessibility, performance, security)
4. Iterate based on usage feedback
