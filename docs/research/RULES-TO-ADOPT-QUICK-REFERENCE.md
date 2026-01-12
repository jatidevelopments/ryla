# Rules to Adopt - Quick Reference

**Based on research of 4 popular repositories with Cursor rules**

## 🎯 Top 3 Must-Add Rules

### 1. Accessibility (A11y) ⭐⭐⭐

**Why:** Legal compliance, inclusive design, better UX  
**Found in:** jesseoue, blefnk  
**Priority:** HIGH

**Key Patterns:**
- Semantic HTML (header, nav, main, section)
- ARIA attributes (aria-label, aria-expanded, aria-describedby)
- Keyboard navigation (tabIndex, focus management)
- Color contrast (WCAG 4.5:1 minimum)
- Screen reader support

**File:** `.cursor/rules/accessibility.mdc`  
**Globs:** `**/*.tsx`, `**/*.ts`

---

### 2. Performance Optimization ⭐⭐⭐

**Why:** Core Web Vitals, user experience, SEO  
**Found in:** jesseoue  
**Priority:** HIGH

**Key Patterns:**
- React optimization (memo, useMemo, useCallback)
- Code splitting (dynamic imports, lazy loading)
- Image optimization (Next.js Image, WebP, lazy loading)
- Caching strategies (browser, CDN, API)
- Database optimization (indexes, query optimization)
- Bundle optimization

**File:** `.cursor/rules/performance.mdc`  
**Globs:** `**/*.tsx`, `**/*.ts`

---

### 3. Security Best Practices ⭐⭐⭐

**Why:** Protect user data, prevent attacks  
**Found in:** jesseoue  
**Priority:** HIGH

**Key Patterns:**
- Password hashing (bcrypt, 12+ rounds)
- Secure cookies (httpOnly, secure, sameSite)
- Input validation (Zod schemas)
- API security (CORS, rate limiting, security headers)
- Data protection (encryption, secrets management)
- Common vulnerabilities (XSS, CSRF, SQL injection)

**File:** `.cursor/rules/security.mdc`  
**Globs:** `**/*.ts`, `apps/api/**`

---

## 🔧 Medium Priority Rules

### 4. TanStack Query Patterns ⭐⭐

**Why:** RYLA uses TanStack Query extensively  
**Found in:** blefnk, jesseoue  
**Priority:** MEDIUM

**Key Patterns:**
- Query keys (unique, hierarchical)
- Mutations with invalidation
- Optimistic updates
- Error handling
- Loading states

**File:** `.cursor/rules/tanstack-query.mdc`  
**Globs:** `**/*.tsx`, `**/*.ts`

---

### 5. Next.js Server Actions ⭐⭐

**Why:** Next.js App Router uses Server Actions  
**Found in:** blefnk  
**Priority:** MEDIUM (if using Server Actions)

**Key Patterns:**
- "use server" directive
- Form actions
- Revalidation (revalidatePath, revalidateTag)
- Optimistic updates (useOptimistic)
- Error handling

**File:** `.cursor/rules/nextjs-server-actions.mdc`  
**Globs:** `apps/web/**`, `apps/landing/**`

---

### 6. SEO Optimization ⭐

**Why:** Landing page needs SEO  
**Found in:** jesseoue  
**Priority:** LOW-MEDIUM

**Key Patterns:**
- Metadata (title, description, og tags)
- Structured data (JSON-LD)
- Sitemap generation
- robots.txt
- Canonical URLs

**File:** `.cursor/rules/seo.mdc`  
**Globs:** `apps/landing/**`

---

## 📊 Comparison: What We Have vs What We Need

| Category | Status | Action |
|----------|--------|--------|
| **Accessibility** | ❌ Missing | **CREATE** |
| **Performance** | ❌ Missing | **CREATE** |
| **Security** | ❌ Missing | **CREATE** |
| **TanStack Query** | ⚠️ Partial | **ENHANCE** |
| **Server Actions** | ❌ Missing | **CREATE** (if needed) |
| **SEO** | ❌ Missing | **CREATE** |
| **TypeScript** | ✅ Have | Keep |
| **Drizzle** | ✅ Have | Keep |
| **Zustand** | ✅ Have | Keep |
| **Testing** | ✅ Have | Keep |

---

## 🚀 Quick Implementation Plan

### Week 1: Critical Rules
1. Create `accessibility.mdc` - Adapt from jesseoue
2. Create `performance.mdc` - Adapt from jesseoue
3. Create `security.mdc` - Adapt from jesseoue

### Week 2: Framework Rules
4. Create `tanstack-query.mdc` - Adapt from blefnk/jesseoue
5. Create `nextjs-server-actions.mdc` - Adapt from blefnk (if needed)

### Week 3: Enhancement
6. Create `seo.mdc` - Adapt from jesseoue

---

## 📝 Key Patterns to Include

### Accessibility
- Semantic HTML structure
- ARIA attributes
- Keyboard navigation
- Color contrast
- Screen reader support

### Performance
- React optimization hooks
- Code splitting
- Image optimization
- Caching strategies
- Database query optimization

### Security
- Password hashing
- Secure cookies
- Input validation
- API security headers
- Common vulnerability prevention

---

## 🔗 Source Repositories

- **jesseoue/cursor-rules** - Best for accessibility, performance, security
- **blefnk/awesome-cursor-rules** - Best for Next.js, TanStack Query, Server Actions
- **LobeChat** - Best for Zustand, Drizzle (already adopted)
- **mofaizal/ultimate-Cursor-AI-rules** - Single comprehensive file (less useful)

---

**See full research:** `docs/research/CURSOR-RULES-COMPARATIVE-RESEARCH.md`
