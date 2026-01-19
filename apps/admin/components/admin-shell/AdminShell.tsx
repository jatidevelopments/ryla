'use client';

import { useState, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Home,
  Users,
  CreditCard,
  Bug,
  Image,
  BarChart3,
  FolderOpen,
  Settings,
  LogOut,
  ChevronDown,
  Shield,
} from 'lucide-react';
import { useAdminAuth, AdminUser } from '@/lib/auth-context';
import { routes } from '@/lib/routes';

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  permission?: string;
  children?: { label: string; href: string }[];
}

const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    href: routes.dashboard,
    icon: <Home className="w-5 h-5" />,
  },
  {
    label: 'Users',
    href: routes.users,
    icon: <Users className="w-5 h-5" />,
    permission: 'users:read',
  },
  {
    label: 'Credits & Billing',
    href: routes.billing,
    icon: <CreditCard className="w-5 h-5" />,
    permission: 'billing:read',
  },
  {
    label: 'Bug Reports',
    href: routes.bugs,
    icon: <Bug className="w-5 h-5" />,
    permission: 'bugs:read',
  },
  {
    label: 'Content',
    href: routes.content,
    icon: <Image className="w-5 h-5" />,
    permission: 'content:read',
  },
  {
    label: 'Analytics',
    href: routes.analytics,
    icon: <BarChart3 className="w-5 h-5" />,
    permission: 'analytics:read',
  },
  {
    label: 'Library',
    href: routes.library,
    icon: <FolderOpen className="w-5 h-5" />,
    permission: 'library:read',
  },
  {
    label: 'Settings',
    href: routes.settings,
    icon: <Settings className="w-5 h-5" />,
    permission: 'settings:read',
  },
];

function getRoleBadgeColor(role: AdminUser['role']): string {
  switch (role) {
    case 'super_admin':
      return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'admin':
      return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
    case 'support':
      return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'moderator':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'viewer':
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  }
}

function formatRoleName(role: AdminUser['role']): string {
  return role.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

interface AdminShellProps {
  children: ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const { admin, logout, hasPermission } = useAdminAuth();

  const filteredNavItems = NAV_ITEMS.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile sidebar overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border
          transform transition-transform duration-300 ease-in-out
          lg:relative lg:translate-x-0
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-border">
          <Link href={routes.dashboard} className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            <span className="text-lg font-bold">RYLA Admin</span>
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {filteredNavItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium
                  transition-colors duration-150 min-h-[44px]
                  ${
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }
                `}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User profile section */}
        {admin && (
          <div className="p-4 border-t border-sidebar-border">
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 w-full p-2 rounded-lg hover:bg-secondary transition-colors min-h-[44px]"
              >
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-white font-semibold">
                  {admin.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium truncate">{admin.name}</p>
                  <span
                    className={`inline-block px-2 py-0.5 text-xs rounded-full border ${getRoleBadgeColor(
                      admin.role
                    )}`}
                  >
                    {formatRoleName(admin.role)}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-muted-foreground transition-transform ${
                    isProfileOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {isProfileOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 w-full px-4 py-3 text-sm text-left hover:bg-secondary transition-colors text-red-400 min-h-[44px]"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top header */}
        <header className="flex items-center h-16 px-4 border-b border-border bg-card lg:px-6">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden min-h-[44px] min-w-[44px] flex items-center justify-center mr-4"
            aria-label="Open sidebar"
          >
            <Menu className="w-6 h-6" />
          </button>

          <h1 className="text-lg font-semibold">
            {filteredNavItems.find((item) => pathname.startsWith(item.href))
              ?.label || 'Admin'}
          </h1>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
