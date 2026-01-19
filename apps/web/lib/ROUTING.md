# Centralized Routing System

## Overview

RYLA uses a centralized routing system that provides a **single source of truth** for all application routes. This eliminates hardcoded route strings scattered throughout the codebase and ensures type-safe navigation.

## Features

- ✅ **Single source of truth** - All routes defined in one place
- ✅ **Type-safe** - TypeScript ensures route correctness
- ✅ **Query parameter helpers** - Easy building of routes with query params
- ✅ **Next.js compatible** - Works seamlessly with Next.js App Router
- ✅ **Navigation helpers** - Type-safe navigation hooks

## Quick Start

### Basic Usage

```tsx
import { routes } from '@/lib/routes';
import Link from 'next/link';

// Static routes
<Link href={routes.dashboard}>Dashboard</Link>
<Link href={routes.studio}>Studio</Link>
```

### With Query Parameters

```tsx
import { routes, buildRoute } from '@/lib/routes';

// Build route with query params
const url = buildRoute(routes.studio, {
  influencer: '123',
  imageId: '456',
});
// => '/studio?influencer=123&imageId=456'

<Link href={url}>View in Studio</Link>;
```

### Programmatic Navigation

```tsx
import { useRouter } from 'next/navigation';
import { routes, buildRoute } from '@/lib/routes';

function MyComponent() {
  const router = useRouter();

  // Simple navigation
  router.push(routes.dashboard);

  // With query params
  router.push(buildRoute(routes.studio, { influencer: '123' }));
}
```

### Using Navigation Helper Hook

```tsx
import { useNavigate } from '@/lib/navigation';

function MyComponent() {
  const navigate = useNavigate();

  // Type-safe navigation methods
  navigate.toDashboard();
  navigate.toStudio({ influencer: '123', imageId: '456' });
  navigate.toInfluencer.detail('123');
  navigate.toWizard.step(5);
}
```

## Route Definitions

All routes are defined in `apps/web/lib/routes.ts`:

```typescript
export const routes = {
  // Public routes
  home: '/',
  login: '/login',
  register: '/register',

  // Core app routes
  dashboard: '/dashboard',
  studio: '/studio',
  templates: '/templates',
  activity: '/activity',

  // Wizard routes
  wizard: {
    root: '/wizard',
    step0: '/wizard/step-0',
    step: (stepNumber: number) => `/wizard/step-${stepNumber}`,
  },

  // Dynamic routes
  influencer: {
    detail: (id: string) => `/influencer/${id}`,
  },

  // ... more routes
};
```

## Common Patterns

### Checking if Route is Public

```tsx
import { isPublicRoute } from '@/lib/routes';

if (isPublicRoute(pathname)) {
  // Route doesn't require authentication
}
```

### Matching Routes

```tsx
import { matchesRoute } from '@/lib/routes';

// Check if pathname matches a route
if (matchesRoute(pathname, routes.studio)) {
  // Active route
}
```

### Building Routes with Return URL

```tsx
import { buildRouteWithReturn, routes } from '@/lib/routes';

// For auth redirects
const loginUrl = buildRouteWithReturn(routes.login, currentPath);
// => '/login?returnUrl=%2Fdashboard'
```

## Migration Guide

### Before (Hardcoded Routes)

```tsx
// ❌ Bad: Hardcoded route
<Link href="/dashboard">Dashboard</Link>;
router.push('/studio?influencer=123');

// ❌ Bad: Hardcoded in array
const PUBLIC_ROUTES = ['/login', '/register'];
```

### After (Centralized Routes)

```tsx
// ✅ Good: Using centralized routes
import { routes, buildRoute } from '@/lib/routes';

<Link href={routes.dashboard}>Dashboard</Link>;
router.push(buildRoute(routes.studio, { influencer: '123' }));

// ✅ Good: Using public routes constant
import { publicRoutes } from '@/lib/routes';
```

## Adding New Routes

1. **Add route to `routes.ts`**:

   ```typescript
   export const routes = {
     // ... existing routes
     myNewFeature: '/my-new-feature',
   };
   ```

2. **Update public routes if needed**:

   ```typescript
   export const publicRoutes = [
     // ... existing routes
     routes.myNewFeature,
   ];
   ```

3. **Add navigation helper** (optional):
   ```typescript
   // In navigation.ts
   toMyNewFeature = () => this.router.push(routes.myNewFeature);
   ```

## Best Practices

1. **Always use routes object** - Never hardcode route strings
2. **Use buildRoute for query params** - Keeps query building consistent
3. **Use navigation helpers** - Provides better autocomplete and type safety
4. **Update publicRoutes** - When adding new public routes
5. **Document complex routes** - Add JSDoc comments for dynamic routes

## Examples

### Sidebar Navigation

```tsx
import { routes, matchesRoute } from '@/lib/routes';

export const menuItems = [
  {
    title: 'Dashboard',
    url: routes.dashboard,
    isActive: (pathname: string) => matchesRoute(pathname, routes.dashboard),
  },
  {
    title: 'Studio',
    url: routes.studio,
    isActive: (pathname: string) => matchesRoute(pathname, routes.studio),
  },
];
```

### Auth Redirect

```tsx
import { routes, buildRoute } from '@/lib/routes';

// Redirect to login with return URL
const returnUrl = encodeURIComponent(pathname);
router.push(buildRoute(routes.login, { returnUrl }));
```

### Dynamic Routes

```tsx
import { routes } from '@/lib/routes';

// Navigate to influencer detail
router.push(routes.influencer.detail('123'));

// Navigate to wizard step
router.push(routes.wizard.step(5));
```

## Related Files

- `apps/web/lib/routes.ts` - Route definitions
- `apps/web/lib/navigation.ts` - Navigation helpers
- `apps/web/lib/auth-context.tsx` - Uses routes for auth checks
