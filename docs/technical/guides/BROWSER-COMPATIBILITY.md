# Browser Compatibility Setup

## Overview

RYLA targets **>98% global browser coverage** as per MVP principles. This document outlines the browser compatibility setup, tools, and best practices.

## Browser Support Targets

### Current Targets (browserslist)

Defined in `package.json`:

```json
"browserslist": [
  "> 0.5%",
  "last 2 versions",
  "not dead",
  "cover 98%",
  "Safari >= 15",
  "iOS >= 15",
  "Chrome >= 110",
  "Firefox >= latest 2 versions",
  "Edge >= latest 2 versions"
]
```

### Coverage Breakdown

- **Chrome**: >= 110 (covers ~70% global usage)
- **Safari**: >= 15 (covers ~15% global usage, critical for iOS)
- **Firefox**: Latest 2 versions (~2-3% global usage)
- **Edge**: Latest 2 versions (~4-6% global usage)
- **Mobile**: iOS >= 15, Android Chrome (latest)

**Total Coverage**: >98% global browser usage

### Check Current Coverage

```bash
# See which browsers are targeted
npx browserslist

# Check coverage percentage
npx browserslist --coverage="> 0.5%, last 2 versions, not dead, cover 98%"
```

## Tools & Configuration

### 1. Browserslist

**Location**: `package.json`

Browserslist is the central configuration that drives:

- **Autoprefixer** (CSS vendor prefixes)
- **Next.js SWC** (JavaScript transpilation)
- **ESLint compat plugin** (API compatibility checks)
- **Stylelint** (CSS compatibility checks)

### 2. ESLint Compatibility Plugin

**Location**: `eslint.config.mjs`

`eslint-plugin-compat` flags unsupported browser APIs using `@eslint/compat` for ESLint 9 compatibility:

```javascript
import { fixupPluginRules } from '@eslint/compat';
import compatPlugin from 'eslint-plugin-compat';

// In plugins:
compat: fixupPluginRules(compatPlugin),

// In rules:
'compat/compat': 'warn',
```

**Usage**:

```bash
pnpm nx run-many --target=lint --all  # Will show compatibility warnings
```

**Note**: Uses `@eslint/compat` to make `eslint-plugin-compat` work with ESLint 9's flat config.

### 3. Polyfills

**Location**: `apps/web/lib/polyfills.ts`

Critical polyfills for Safari and older browsers:

- **IntersectionObserver** (Safari < 12.1)
- **ResizeObserver** (Safari < 13.1)

**Note**: Most other polyfills are handled by Next.js SWC transpilation.

### 4. Next.js SWC Transpilation

Next.js 14 uses SWC which automatically:

- Reads `browserslist` from `package.json`
- Transpiles modern JS syntax (optional chaining, nullish coalescing, etc.)
- Generates code compatible with target browsers

**No additional config needed** - SWC automatically respects browserslist.

### 5. Autoprefixer

**Location**: `postcss.config.js`

Autoprefixer automatically adds CSS vendor prefixes based on browserslist:

```css
/* Input */
.example {
  display: grid;
  backdrop-filter: blur(10px);
}

/* Output (for older browsers) */
.example {
  display: -ms-grid;
  display: grid;
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);
}
```

## Safari-Specific Considerations

### Known Safari Issues

1. **`100vh` on Mobile Safari**

   - **Issue**: Address bar causes viewport height issues
   - **Solution**: Use `svh`, `dvh`, or `lvh` units (Safari 15.4+)
   - **Fallback**: JavaScript viewport height calculation

2. **`backdrop-filter`**

   - **Issue**: Partial support, performance issues
   - **Solution**: Provide fallback background color
   - **Support**: Safari 9+ (with `-webkit-` prefix)

3. **`:has()` Selector**

   - **Issue**: Safari 15.4+ only
   - **Solution**: Use JavaScript feature detection
   - **Fallback**: Use alternative CSS patterns

4. **`position: sticky` inside `overflow`**

   - **Issue**: Doesn't work in Safari < 13
   - **Solution**: Avoid nesting or use JavaScript

5. **IntersectionObserver**
   - **Issue**: Safari < 12.1 doesn't support
   - **Solution**: Polyfill included in `apps/web/lib/polyfills.ts`

### Safari Performance

Safari has different performance characteristics than Chrome:

- **Layout Thrashing**: More sensitive to layout/paint operations
- **JavaScript Execution**: Different JIT behavior
- **Memory Management**: More aggressive garbage collection

**Testing**: Always test in Safari Web Inspector (macOS and iOS).

## Testing Strategy

### 1. Automated Testing

```bash
# Run ESLint compatibility checks
pnpm lint

# Check browserslist coverage
npx browserslist --coverage
```

### 2. Manual Testing

**Required Browsers**:

- ✅ Safari 15+ (macOS)
- ✅ Safari iOS 15+ (iPhone/iPad)
- ✅ Chrome 110+ (Desktop)
- ✅ Chrome Mobile (Android)
- ✅ Firefox Latest (Desktop)
- ✅ Edge Latest (Desktop)

### 3. Performance Profiling

**Safari Web Inspector**:

1. Open Safari → Develop → Web Inspector
2. Timeline tab → Record
3. Check for:
   - Layout thrashing
   - Paint operations
   - JavaScript execution time
   - Memory usage

**Key Metrics**:

- First Paint: < 1.5s
- Time to Interactive: < 3s
- Layout shifts: < 0.1
- FPS: > 60fps

## Best Practices

### 1. Feature Detection

Always use feature detection before using new APIs:

```typescript
// ✅ Good
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(callback);
} else {
  // Fallback
  // Polyfill should handle this, but have a fallback
}

// ❌ Bad
const observer = new IntersectionObserver(callback); // May fail in Safari < 12.1
```

### 2. CSS Fallbacks

Provide fallbacks for CSS features:

```css
/* ✅ Good */
.modal {
  background-color: rgba(0, 0, 0, 0.8); /* Fallback */
  backdrop-filter: blur(10px); /* Modern browsers */
  -webkit-backdrop-filter: blur(10px); /* Safari */
}

/* ❌ Bad */
.modal {
  backdrop-filter: blur(10px); /* No fallback */
}
```

### 3. Avoid Bleeding-Edge APIs

Per MVP principles, avoid APIs with < 95% support:

- ❌ `CSS Container Queries` (Safari 16+ only)
- ❌ `:has()` without fallback (Safari 15.4+)
- ❌ `ResizeObserver` without polyfill (Safari 13.1+)

### 4. Test in Real Safari

**Never assume Chrome = Safari**:

- Different rendering engine
- Different JavaScript engine
- Different performance characteristics
- Different CSS support

## Troubleshooting

### Issue: ESLint compat warnings

**Solution**: Check if API is in browserslist targets:

```bash
npx browserslist
```

If API isn't supported, add polyfill or use feature detection.

### Issue: CSS not working in Safari

**Solution**:

1. Check Can I Use: https://caniuse.com
2. Add vendor prefixes (Autoprefixer should handle)
3. Provide fallback styles
4. Test in Safari Web Inspector

### Issue: JavaScript errors in Safari

**Solution**:

1. Check ESLint compat warnings
2. Verify transpilation (check build output)
3. Add polyfill if needed
4. Use feature detection

### Issue: Performance issues in Safari

**Solution**:

1. Profile in Safari Web Inspector
2. Check for layout thrashing
3. Optimize CSS (avoid complex selectors)
4. Reduce paint operations
5. Use `will-change` sparingly

## Resources

- **Can I Use**: https://caniuse.com
- **Browserslist**: https://github.com/browserslist/browserslist
- **ESLint Compat**: https://github.com/amilajack/eslint-plugin-compat
- **Safari Web Inspector**: https://webkit.org/web-inspector/
- **Next.js Browser Support**: https://nextjs.org/docs/advanced-features/customizing-babel-config

## Related Documentation

- MVP Principles: `.cursor/rules/mvp-principles.mdc`
- Performance: `.cursor/rules/performance.mdc`
- Mobile UX: `.cursor/rules/mobile-ux.mdc`
