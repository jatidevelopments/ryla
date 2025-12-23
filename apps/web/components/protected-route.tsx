'use client';

import { useAuth } from '../lib/auth-context';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
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
 */
export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isLoading, isAuthenticated } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return fallback ?? <LoadingSkeleton />;
  }

  // If not authenticated, AuthProvider will handle redirect
  // Show nothing while redirecting to prevent flash
  if (!isAuthenticated) {
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

