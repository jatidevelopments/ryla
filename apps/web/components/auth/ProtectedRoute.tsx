'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../lib/auth-context';
import { trpc } from '../../lib/trpc';
import { routes } from '../../lib/routes';
import { LoadingState } from '../ui/loading-state';
import { AuthModal } from './AuthModal';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  skipOnboardingCheck?: boolean; // Allow onboarding page to skip this check
}

/**
 * Loading skeleton for protected pages
 */
function LoadingSkeleton() {
  return <LoadingState title="Loading..." fullPage />;
}

/**
 * Wrapper component for protected routes
 * Shows loading state while checking auth
 * Redirects to login if not authenticated (handled by AuthProvider)
 * Redirects to onboarding if not completed
 */
export function ProtectedRoute({
  children,
  fallback,
  skipOnboardingCheck = false,
}: ProtectedRouteProps) {
  const { isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Check onboarding completion (only for authenticated users, skip for onboarding page itself)
  const { data: onboardingStatus, isLoading: isLoadingOnboarding } =
    trpc.user.isOnboardingCompleted.useQuery(undefined, {
      enabled:
        isAuthenticated &&
        !skipOnboardingCheck &&
        pathname !== routes.onboarding.root,
      retry: false,
    });

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (
      !isLoading &&
      !isLoadingOnboarding &&
      isAuthenticated &&
      !skipOnboardingCheck &&
      pathname !== routes.onboarding.root &&
      onboardingStatus &&
      !onboardingStatus.completed
    ) {
      router.push(routes.onboarding.root);
    }
  }, [
    isLoading,
    isLoadingOnboarding,
    isAuthenticated,
    skipOnboardingCheck,
    pathname,
    onboardingStatus,
    router,
  ]);

  // Show loading state while checking authentication
  if (isLoading) {
    return fallback ?? <LoadingSkeleton />;
  }

  // If not authenticated, show auth modal overlay on top of the page
  if (!isAuthenticated) {
    return (
      <>
        {children}
        <AuthModal />
      </>
    );
  }

  // Show loading while checking onboarding (unless we're on onboarding page or skipping check)
  if (
    !skipOnboardingCheck &&
    pathname !== routes.onboarding.root &&
    isLoadingOnboarding
  ) {
    return fallback ?? <LoadingSkeleton />;
  }

  // If onboarding not completed and we're not on onboarding page, show loading (redirect will happen)
  if (
    !skipOnboardingCheck &&
    pathname !== routes.onboarding.root &&
    onboardingStatus &&
    !onboardingStatus.completed
  ) {
    return fallback ?? <LoadingSkeleton />;
  }

  return <>{children}</>;
}

/**
 * Higher-order component for protected pages
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>
): React.FC<P> {
  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
