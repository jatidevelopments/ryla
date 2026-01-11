import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppShell } from './AppShell';
import * as navigation from 'next/navigation';
import * as auth from '../../lib/auth-context';
import { SidebarProvider, useSidebar } from '@ryla/ui';

// Mock UI
vi.mock('@ryla/ui', () => {
  const actual = vi.importActual('@ryla/ui');
  return {
    ...actual,
    SidebarProvider: ({ children }: any) => <div>{children}</div>,
    BottomNav: () => <div data-testid="bottom-nav" />,
    SidebarMobileTrigger: () => <div data-testid="mobile-trigger" />,
    useSidebar: vi.fn(),
    cn: (...inputs: any[]) => inputs.filter(Boolean).join(' '),
  };
});

// Mock Auth
vi.mock('../../lib/auth-context', () => ({
  useAuth: vi.fn(),
}));

// Mock navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(),
}));

// Mock Components
vi.mock('../sidebar/DesktopSidebar', () => ({
  DesktopSidebar: () => <div data-testid="desktop-sidebar" />,
}));

vi.mock('../credits', () => ({
  CreditsBadge: () => <div data-testid="credits-badge" />,
  LowBalanceWarning: () => <div data-testid="low-balance-warning" />,
}));

vi.mock('../notifications/NotificationsMenu', () => ({
  NotificationsMenu: () => <div data-testid="notifications-menu" />,
}));

vi.mock('../bug-report', () => ({
  BugReportModal: () => <div data-testid="bug-report-modal" />,
}));

vi.mock('sonner', () => ({
  Toaster: () => <div data-testid="toaster" />,
}));

describe('AppShell', () => {
  const mockSidebar = {
    open: true,
    isMobile: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (navigation.usePathname as any).mockReturnValue('/dashboard');
    (auth.useAuth as any).mockReturnValue({
      user: { email: 'test@example.com' },
    });
    (useSidebar as any).mockReturnValue(mockSidebar);
  });

  it('should render shell with children for included routes', () => {
    render(<AppShell>Content</AppShell>);

    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.getByTestId('desktop-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('bottom-nav')).toBeInTheDocument();
    // Two of each as they exist in both desktop and mobile headers
    expect(screen.getAllByTestId('notifications-menu')).toHaveLength(2);
    expect(screen.getAllByTestId('credits-badge')).toHaveLength(2);
  });

  it('should NOT render shell for excluded routes', () => {
    (navigation.usePathname as any).mockReturnValue('/login');
    render(<AppShell>Content</AppShell>);

    expect(screen.getByText('Content')).toBeInTheDocument();
    expect(screen.queryByTestId('desktop-sidebar')).not.toBeInTheDocument();
  });

  it('should show mobile trigger and bottom nav on mobile', () => {
    (useSidebar as any).mockReturnValue({ open: false, isMobile: true });
    render(<AppShell>Content</AppShell>);

    expect(screen.getByTestId('mobile-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('bottom-nav')).toBeInTheDocument();
  });

  it('should have multiple headers in DOM (desktop/mobile)', () => {
    (useSidebar as any).mockReturnValue({ open: false, isMobile: true });
    render(<AppShell>Content</AppShell>);

    const headers = screen.getAllByRole('banner', { hidden: true });
    expect(headers.length).toBeGreaterThan(1);
  });
});
