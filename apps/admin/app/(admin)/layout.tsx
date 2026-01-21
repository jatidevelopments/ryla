'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AdminAuthProvider, useAdminAuth } from '@/lib/auth-context';
import { AdminShell } from '@/components/admin-shell';
import { routes, buildRoute } from '@/lib/routes';
import { Loader2 } from 'lucide-react';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Preserve current path as returnUrl for redirect after login
      const returnUrl = pathname !== routes.login ? pathname : undefined;
      const loginRoute = returnUrl
        ? buildRoute(routes.login, { returnUrl })
        : routes.login;
      router.push(loginRoute);
    }
  }, [isAuthenticated, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <AdminShell>{children}</AdminShell>;
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthProvider>
      <AuthGuard>{children}</AuthGuard>
    </AdminAuthProvider>
  );
}
