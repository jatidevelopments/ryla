'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../lib/auth-context';
import { trpc } from '../lib/trpc';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  skipOnboardingCheck?: boolean; // Allow onboarding page to skip this check
}

/**
 * Loading skeleton for protected pages
 */
function LoadingSkeleton() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="relative h-12 w-12">
          <div className="absolute inset-0 rounded-full border-4 border-[var(--border-default)]" />
          <div className="absolute inset-0 rounded-full border-4 border-t-[var(--purple-500)] animate-spin" />
        </div>
        <p className="text-[var(--text-secondary)] text-sm">Loading...</p>
      </div>
    </div>
  );
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
  const { data: onboardingStatus, isLoading: isLoadingOnboarding } = trpc.user.isOnboardingCompleted.useQuery(
    undefined,
    {
      enabled: isAuthenticated && !skipOnboardingCheck && pathname !== '/onboarding',
      retry: false,
    }
  );

  // Redirect to onboarding if not completed
  useEffect(() => {
    if (
      !isLoading &&
      !isLoadingOnboarding &&
      isAuthenticated &&
      !skipOnboardingCheck &&
      pathname !== '/onboarding' &&
      onboardingStatus &&
      !onboardingStatus.completed
    ) {
      router.push('/onboarding');
    }
  }, [isLoading, isLoadingOnboarding, isAuthenticated, skipOnboardingCheck, pathname, onboardingStatus, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return fallback ?? <LoadingSkeleton />;
  }

  // If not authenticated, AuthProvider will handle redirect
  // Show nothing while redirecting to prevent flash
  if (!isAuthenticated) {
    return fallback ?? <LoadingSkeleton />;
  }

  // Show loading while checking onboarding (unless we're on onboarding page or skipping check)
  if (!skipOnboardingCheck && pathname !== '/onboarding' && isLoadingOnboarding) {
    return fallback ?? <LoadingSkeleton />;
  }

  // If onboarding not completed and we're not on onboarding page, show loading (redirect will happen)
  if (
    !skipOnboardingCheck &&
    pathname !== '/onboarding' &&
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

