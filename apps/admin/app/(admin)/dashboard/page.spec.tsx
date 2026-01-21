/**
 * Dashboard Page Tests
 * 
 * Tests for the dashboard page component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import DashboardPage from './page';
import { adminTrpc } from '@/lib/trpc/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AdminTRPCProvider } from '@/lib/trpc/client';

// Mock tRPC - use vi.hoisted to define mock before vi.mock
const { mockUseQuery } = vi.hoisted(() => {
  const mockFn = vi.fn();
  return {
    mockUseQuery: mockFn,
  };
});

vi.mock('@/lib/trpc/client', () => {
  return {
    adminTrpc: {
      stats: {
        getDashboardStats: {
          useQuery: () => mockUseQuery(),
        },
      },
    },
    AdminTRPCProvider: ({ children }: { children: React.ReactNode }) => children,
  };
});

// Mock Next.js Link
vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('DashboardPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    );
  };

  describe('data loading', () => {
    it('should show loading state when data is loading', () => {
      mockUseQuery.mockReturnValueOnce({
        data: undefined,
        isLoading: true,
        error: null,
      });

      renderWithProviders(<DashboardPage />);

      // Should show skeleton loaders
      const skeletons = screen.getAllByRole('generic');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should display stats when data is loaded', async () => {
      const mockStats = {
        totalUsers: 1234,
        usersChange: 5.2,
        totalRevenue: '$12,345',
        revenueChange: 12.5,
        openBugs: 8,
        bugsChange: -15.0,
        imagesGenerated: 56789,
        imagesChange: 8.3,
      };

      mockUseQuery.mockReturnValueOnce({
        data: mockStats,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<DashboardPage />);

      // Wait for stats to render
      await waitFor(() => {
        expect(screen.getByText('Total Users')).toBeInTheDocument();
      });

      // Check all stat cards are displayed
      expect(screen.getByText('Total Users')).toBeInTheDocument();
      expect(screen.getByText('1,234')).toBeInTheDocument(); // Formatted number
      expect(screen.getByText('Revenue (MTD)')).toBeInTheDocument();
      expect(screen.getByText('$12,345')).toBeInTheDocument();
      expect(screen.getByText('Open Bugs')).toBeInTheDocument();
      expect(screen.getByText('8')).toBeInTheDocument();
      expect(screen.getByText('Images Generated')).toBeInTheDocument();
      expect(screen.getByText('56,789')).toBeInTheDocument(); // Formatted number
    });

    it('should display percentage changes correctly', async () => {
      const mockStats = {
        totalUsers: 1000,
        usersChange: 5.2,
        totalRevenue: '$10,000',
        revenueChange: -3.5,
        openBugs: 5,
        bugsChange: -15.0,
        imagesGenerated: 50000,
        imagesChange: 8.3,
      };

      mockUseQuery.mockReturnValueOnce({
        data: mockStats,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('Total Users')).toBeInTheDocument();
      });

      // Check positive change (should show +X% from last week)
      expect(screen.getByText(/\+5\.2% from last week/)).toBeInTheDocument();
      
      // Check negative change (should show -X% from last week)
      // The page displays {change}% from last week, so -15.0 becomes "-15.0% from last week"
      expect(screen.getByText(/-3\.5% from last week/)).toBeInTheDocument();
      // For -15.0, check that the text contains both the negative value and the percentage text
      expect(screen.getByText((content) => {
        return content.includes('-15') && content.includes('% from last week');
      })).toBeInTheDocument();
      
      // Check positive change for images
      expect(screen.getByText(/\+8\.3% from last week/)).toBeInTheDocument();
    });

    it('should show error message when data fails to load', async () => {
      mockUseQuery.mockReturnValueOnce({
        data: undefined,
        isLoading: false,
        error: new Error('Failed to load'),
      });

      renderWithProviders(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('Failed to load statistics')).toBeInTheDocument();
      });
    });
  });

  describe('recent activity', () => {
    it('should display recent activity items', async () => {
      const mockStats = {
        totalUsers: 1000,
        usersChange: 0,
        totalRevenue: '$10,000',
        revenueChange: 0,
        openBugs: 5,
        bugsChange: 0,
        imagesGenerated: 50000,
        imagesChange: 0,
      };

      mockUseQuery.mockReturnValueOnce({
        data: mockStats,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      });

      // Check activity items are displayed
      expect(screen.getByText('New user registered: john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Subscription upgraded: Pro plan ($79/mo)')).toBeInTheDocument();
      expect(screen.getByText('Bug #142 marked as resolved')).toBeInTheDocument();
      expect(screen.getByText('50 new images generated by user_a843')).toBeInTheDocument();
      expect(screen.getByText('Credit purchase: 500 credits ($49)')).toBeInTheDocument();
    });

    it('should display activity timestamps', async () => {
      const mockStats = {
        totalUsers: 1000,
        usersChange: 0,
        totalRevenue: '$10,000',
        revenueChange: 0,
        openBugs: 5,
        bugsChange: 0,
        imagesGenerated: 50000,
        imagesChange: 0,
      };

      mockUseQuery.mockReturnValueOnce({
        data: mockStats,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('Recent Activity')).toBeInTheDocument();
      });

      // Check timestamps
      expect(screen.getByText('2 min ago')).toBeInTheDocument();
      expect(screen.getByText('5 min ago')).toBeInTheDocument();
      expect(screen.getByText('12 min ago')).toBeInTheDocument();
      expect(screen.getByText('18 min ago')).toBeInTheDocument();
      expect(screen.getByText('25 min ago')).toBeInTheDocument();
    });
  });

  describe('quick actions', () => {
    it('should display quick action links', async () => {
      const mockStats = {
        totalUsers: 1000,
        usersChange: 0,
        totalRevenue: '$10,000',
        revenueChange: 0,
        openBugs: 5,
        bugsChange: 0,
        imagesGenerated: 50000,
        imagesChange: 0,
      };

      mockUseQuery.mockReturnValueOnce({
        data: mockStats,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      });

      // Check quick action links
      expect(screen.getByText('View Users')).toBeInTheDocument();
      expect(screen.getByText('Billing')).toBeInTheDocument();
      expect(screen.getByText('Bug Reports')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should have correct hrefs for quick action links', async () => {
      const mockStats = {
        totalUsers: 1000,
        usersChange: 0,
        totalRevenue: '$10,000',
        revenueChange: 0,
        openBugs: 5,
        bugsChange: 0,
        imagesGenerated: 50000,
        imagesChange: 0,
      };

      mockUseQuery.mockReturnValueOnce({
        data: mockStats,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('Quick Actions')).toBeInTheDocument();
      });

      // Check links have correct hrefs
      const usersLink = screen.getByText('View Users').closest('a');
      expect(usersLink).toHaveAttribute('href', '/users');

      const billingLink = screen.getByText('Billing').closest('a');
      expect(billingLink).toHaveAttribute('href', '/billing');

      const bugsLink = screen.getByText('Bug Reports').closest('a');
      expect(bugsLink).toHaveAttribute('href', '/bugs');

      const contentLink = screen.getByText('Content').closest('a');
      expect(contentLink).toHaveAttribute('href', '/content');
    });
  });

  describe('page structure', () => {
    it('should render page header', async () => {
      const mockStats = {
        totalUsers: 1000,
        usersChange: 0,
        totalRevenue: '$10,000',
        revenueChange: 0,
        openBugs: 5,
        bugsChange: 0,
        imagesGenerated: 50000,
        imagesChange: 0,
      };

      mockUseQuery.mockReturnValueOnce({
        data: mockStats,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
      });

      expect(screen.getByText('Overview of your platform metrics')).toBeInTheDocument();
    });

    it('should render stats in responsive grid', async () => {
      const mockStats = {
        totalUsers: 1000,
        usersChange: 0,
        totalRevenue: '$10,000',
        revenueChange: 0,
        openBugs: 5,
        bugsChange: 0,
        imagesGenerated: 50000,
        imagesChange: 0,
      };

      mockUseQuery.mockReturnValueOnce({
        data: mockStats,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<DashboardPage />);

      await waitFor(() => {
        expect(screen.getByText('Total Users')).toBeInTheDocument();
      });

      // Should have 4 stat cards
      const statCards = screen.getAllByText(/Total Users|Revenue|Open Bugs|Images Generated/);
      expect(statCards.length).toBeGreaterThanOrEqual(4);
    });
  });
});
