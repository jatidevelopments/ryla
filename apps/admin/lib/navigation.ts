/**
 * Navigation Utilities for Admin App
 *
 * Type-safe navigation helpers that work with Next.js router
 * and the centralized routes configuration.
 *
 * Usage:
 *   import { useNavigate } from '@/lib/navigation';
 *
 *   const navigate = useNavigate();
 *   navigate.toDashboard();
 *   navigate.toUsers();
 */

'use client';

import { useRouter } from 'next/navigation';
import { routes, buildRoute } from './routes';
import type { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

/**
 * Navigation helper class
 * Provides type-safe navigation methods
 */
class NavigationHelper {
  constructor(private router: AppRouterInstance) {}

  // Auth routes
  toLogin = () => this.router.push(routes.login);

  // Admin routes
  toDashboard = () => this.router.push(routes.dashboard);
  toUsers = (
    params?: Record<string, string | number | boolean | undefined>
  ) => {
    if (params) {
      this.router.push(buildRoute(routes.users, params));
    } else {
      this.router.push(routes.users);
    }
  };
  toBilling = () => this.router.push(routes.billing);
  toBugs = () => this.router.push(routes.bugs);
  toContent = () => this.router.push(routes.content);
  toAnalytics = () => this.router.push(routes.analytics);
  toLibrary = () => this.router.push(routes.library);
  toSettings = () => this.router.push(routes.settings);

  // Generic navigation methods
  push = (path: string) => this.router.push(path);
  replace = (path: string) => this.router.replace(path);
  back = () => this.router.back();
  forward = () => this.router.forward();
  refresh = () => this.router.refresh();
}

/**
 * Hook to get type-safe navigation helper
 *
 * @example
 * const navigate = useNavigate();
 * navigate.toDashboard();
 * navigate.toUsers({ page: '1' });
 */
export function useNavigate(): NavigationHelper {
  const router = useRouter();
  return new NavigationHelper(router);
}
