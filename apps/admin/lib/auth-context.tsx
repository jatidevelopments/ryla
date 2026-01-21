'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin' | 'support' | 'moderator' | 'viewer';
  permissions: string[];
  avatarUrl?: string;
  lastLoginAt?: string;
}

interface AuthContextValue {
  admin: AdminUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: AdminUser['role'] | AdminUser['role'][]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Role hierarchy for permission checking
const ROLE_HIERARCHY: Record<AdminUser['role'], number> = {
  super_admin: 100,
  admin: 80,
  support: 60,
  moderator: 40,
  viewer: 20,
};

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        if (token) {
          // Validate token with API
          const response = await fetch('/api/auth/validate', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (response.ok) {
            const data = await response.json();
            setAdmin(data.admin);
          } else {
            localStorage.removeItem('admin_token');
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
        localStorage.removeItem('admin_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    const data = await response.json();
    localStorage.setItem('admin_token', data.token);
    setAdmin(data.admin);
  }, []);

  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem('admin_token');
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('admin_token');
      setAdmin(null);
    }
  }, []);

  const hasPermission = useCallback(
    (permission: string) => {
      if (!admin) return false;
      if (admin.role === 'super_admin') return true;
      // Check for wildcard permission
      if (admin.permissions.includes('*')) return true;
      return admin.permissions.includes(permission);
    },
    [admin]
  );

  const hasRole = useCallback(
    (role: AdminUser['role'] | AdminUser['role'][]) => {
      if (!admin) return false;
      const roles = Array.isArray(role) ? role : [role];
      const adminLevel = ROLE_HIERARCHY[admin.role];
      return roles.some((r) => adminLevel >= ROLE_HIERARCHY[r]);
    },
    [admin]
  );

  return (
    <AuthContext.Provider
      value={{
        admin,
        isLoading,
        isAuthenticated: !!admin,
        login,
        logout,
        hasPermission,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider');
  }
  return context;
}
