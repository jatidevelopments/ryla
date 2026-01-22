'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  AuthUser,
  getAccessToken,
  getCurrentUser,
  logout as authLogout,
  clearTokens,
} from './auth';
import {
  routes,
  buildRoute,
} from './routes';

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const refreshUser = useCallback(async () => {
    try {
      const token = getAccessToken();
      if (!token) {
        setUser(null);
        return;
      }

      const currentUser = await getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
      clearTokens();
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authLogout();
    } finally {
      setUser(null);
      router.push(routes.login);
    }
  }, [router]);

  // Check authentication on mount and token change
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      await refreshUser();
      setIsLoading(false);
    };

    checkAuth();
  }, [refreshUser]);

  // Note: Redirect logic removed - ProtectedRoute now shows AuthModal overlay instead
  // This allows the studio page to be visible in the background with the auth modal on top

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: !!user,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to access auth context
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Hook that ensures user is authenticated
 * Redirects to login if not
 */
export function useRequireAuth(): AuthContextValue & { user: AuthUser } {
  const auth = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!auth.isLoading && !auth.user) {
      router.push(
        buildRoute(routes.login, { returnUrl: encodeURIComponent(pathname) })
      );
    }
  }, [auth.isLoading, auth.user, pathname, router]);

  return auth as AuthContextValue & { user: AuthUser };
}
