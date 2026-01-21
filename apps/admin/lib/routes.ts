/**
 * Centralized Route Configuration for Admin App
 *
 * Single source of truth for all admin application routes.
 * Provides type-safe route building and navigation helpers.
 *
 * Usage:
 *   import { routes } from '@/lib/routes';
 *
 *   // Static routes
 *   <Link href={routes.dashboard}>Dashboard</Link>
 *   router.push(routes.login);
 */

/**
 * Route definitions organized by feature area
 */
export const routes = {
  // Auth routes
  login: '/login',

  // Admin routes
  dashboard: '/dashboard',
  users: '/users',
  billing: '/billing',
  bugs: '/bugs',
  content: '/content',
  jobs: '/jobs',
  analytics: '/analytics',
  library: '/library',
  audit: '/audit',
  lora: '/lora',
  admins: '/admins',
  flags: '/flags',
  config: '/config',
  notifications: '/notifications',
  settings: '/settings',
  
  // Dynamic routes
  user: {
    detail: (id: string) => `/users/${id}`,
  },
  bug: {
    detail: (id: string) => `/bugs/${id}`,
  },
  lora: {
    detail: (id: string) => `/lora/${id}`,
  },
  admin: {
    detail: (id: string) => `/admins/${id}`,
  },
} as const;

/**
 * Public routes that don't require authentication
 */
export const publicRoutes: readonly string[] = [routes.login] as const;

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
 * buildRoute(routes.users, { page: '1', search: 'john' })
 * // => '/users?page=1&search=john'
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
 * Type-safe route matcher
 * Check if a pathname matches a route pattern
 */
export function matchesRoute(pathname: string, route: string): boolean {
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
