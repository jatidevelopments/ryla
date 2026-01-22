/**
 * Centralized Route Configuration
 *
 * Single source of truth for all application routes.
 * Provides type-safe route building and navigation helpers.
 *
 * Usage:
 *   import { routes, buildRoute } from '@/lib/routes';
 *
 *   // Static routes
 *   <Link href={routes.dashboard}>Dashboard</Link>
 *   router.push(routes.login);
 *
 *   // Dynamic routes
 *   <Link href={buildRoute(routes.influencer.detail, { id: '123' })}>View</Link>
 *   router.push(buildRoute(routes.studio, { influencer: '123', imageId: '456' }));
 */

/**
 * Route definitions organized by feature area
 */
export const routes = {
  // Public routes
  home: '/',
  login: '/login',
  register: '/register',
  auth: '/auth',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',

  // Legal
  legal: '/legal',
  terms: '/terms',
  privacy: '/privacy',

  // Core app routes
  dashboard: '/dashboard',
  pricing: '/pricing',
  buyCredits: '/buy-credits',

  // Wizard routes
  wizard: {
    root: '/wizard',
    step0: '/wizard/step-0',
    step1: '/wizard/step-1',
    step2: '/wizard/step-2',
    step3: '/wizard/step-3',
    step4: '/wizard/step-4',
    step5: '/wizard/step-5',
    step6: '/wizard/step-6',
    step7: '/wizard/step-7',
    step8: '/wizard/step-8',
    step9: '/wizard/step-9',
    step10: '/wizard/step-10',
    step11: '/wizard/step-11',
    step12: '/wizard/step-12',
    step13: '/wizard/step-13',
    step14: '/wizard/step-14',
    step15: '/wizard/step-15',
    step16: '/wizard/step-16',
    step17: '/wizard/step-17',
    step18: '/wizard/step-18',
    step19: '/wizard/step-19',
    step20: '/wizard/step-20',
    step21: '/wizard/step-21',
    step22: '/wizard/step-22',
    baseImage: '/wizard/step-base-image',
    profilePictures: '/wizard/step-profile-pictures',
    /**
     * Build wizard step route dynamically
     */
    step: (stepNumber: number) => `/wizard/step-${stepNumber}`,
  },

  // Studio routes
  studio: '/studio',

  // Templates routes
  templates: '/templates',

  // Activity routes
  activity: '/activity',

  // Influencer routes
  influencer: {
    root: '/influencer',
    /**
     * Build influencer detail route
     * @param id - Influencer/character ID
     */
    detail: (id: string) => `/influencer/${id}`,
  },

  // Settings routes
  settings: '/settings',

  // Onboarding routes
  onboarding: {
    root: '/onboarding',
    step: (stepNumber: number) => `/onboarding/${stepNumber}`,
    complete: '/onboarding/complete',
  },

  // Payment routes
  payment: {
    success: '/payment/success',
    cancel: '/payment/cancel',
    error: '/payment/error',
  },

  // Preview routes (for development/testing)
  preview: {
    root: '/preview',
    outfitPicker: '/preview/outfit-picker',
    outfitCompositionPicker: '/preview/outfit-composition-picker',
  },
} as const;

/**
 * Public routes that don't require authentication
 */
export const publicRoutes: readonly string[] = [
  routes.home,
  routes.login,
  routes.register,
  routes.auth,
  routes.forgotPassword,
  routes.resetPassword,
  routes.legal,
  routes.terms,
  routes.privacy,
] as const;

/**
 * Check if a pathname is a public route
 */
export function isPublicRoute(pathname: string): boolean {
  return publicRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
}

/**
 * Build a route with query parameters
 *
 * @example
 * buildRoute(routes.studio, { influencer: '123', imageId: '456' })
 * // => '/studio?influencer=123&imageId=456'
 */
export function buildRoute(
  basePath: string,
  params?: Record<string, string | number | boolean | undefined>
): string {
  if (!params || Object.keys(params).length === 0) {
    return basePath;
  }

  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  }

  const queryString = searchParams.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

/**
 * Build a route with return URL parameter
 * Useful for auth redirects
 */
export function buildRouteWithReturn(route: string, returnUrl: string): string {
  return buildRoute(route, { returnUrl: encodeURIComponent(returnUrl) });
}

/**
 * Extract route parameters from a pathname
 * Useful for parsing dynamic routes
 */
export function extractRouteParams<T extends Record<string, string>>(
  pathname: string,
  pattern: string
): Partial<T> | null {
  const patternParts = pattern.split('/');
  const pathParts = pathname.split('/');

  if (patternParts.length !== pathParts.length) {
    return null;
  }

  const params: Record<string, string> = {};

  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const pathPart = pathParts[i];

    if (patternPart.startsWith('[') && patternPart.endsWith(']')) {
      const paramName = patternPart.slice(1, -1);
      params[paramName] = pathPart;
    } else if (patternPart !== pathPart) {
      return null;
    }
  }

  return params as Partial<T>;
}

/**
 * Type-safe route matcher
 * Check if a pathname matches a route pattern
 */
export function matchesRoute(
  pathname: string,
  route: string | ((pathname: string) => boolean)
): boolean {
  if (typeof route === 'function') {
    return route(pathname);
  }

  // Exact match
  if (pathname === route) {
    return true;
  }

  // Prefix match (for nested routes)
  if (pathname.startsWith(`${route}/`)) {
    return true;
  }

  return false;
}

/**
 * Get the active route from a pathname
 * Useful for navigation highlighting
 */
export function getActiveRoute(pathname: string): string | null {
  // Get only string routes from the routes object
  const stringRoutes: string[] = [];
  for (const route of Object.values(routes)) {
    if (typeof route === 'string') {
      stringRoutes.push(route);
    }
  }

  // Check exact matches first
  const exactMatch = stringRoutes.find((route) => pathname === route);
  if (exactMatch) {
    return exactMatch;
  }

  // Check prefix matches for nested routes
  const prefixMatch = stringRoutes.find((route) =>
    pathname.startsWith(`${route}/`)
  );

  return prefixMatch ?? null;
}
