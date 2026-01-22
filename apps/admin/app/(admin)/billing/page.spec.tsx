/**
 * Billing Page Tests
 * 
 * Tests for the billing page component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BillingPage from './page';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Mock tRPC
const {
  mockSearchQuery,
  mockGetStatsQuery,
  mockGetUserCreditsQuery,
  mockGetTransactionsQuery,
  mockGetUserSubscriptionQuery,
  mockAddCreditsMutation,
  mockRefundCreditsMutation,
} = vi.hoisted(() => {
  const searchQuery = vi.fn();
  const getStatsQuery = vi.fn();
  const getUserCreditsQuery = vi.fn();
  const getTransactionsQuery = vi.fn();
  const getUserSubscriptionQuery = vi.fn();
  const addCreditsMutation = vi.fn();
  const refundCreditsMutation = vi.fn();
  return {
    mockSearchQuery: searchQuery,
    mockGetStatsQuery: getStatsQuery,
    mockGetUserCreditsQuery: getUserCreditsQuery,
    mockGetTransactionsQuery: getTransactionsQuery,
    mockGetUserSubscriptionQuery: getUserSubscriptionQuery,
    mockAddCreditsMutation: addCreditsMutation,
    mockRefundCreditsMutation: refundCreditsMutation,
  };
});

vi.mock('@/lib/trpc/client', () => {
  return {
    adminTrpc: {
      users: {
        search: {
          useQuery: () => mockSearchQuery(),
        },
      },
      billing: {
        getStats: {
          useQuery: () => mockGetStatsQuery(),
        },
        getUserCredits: {
          useQuery: () => mockGetUserCreditsQuery(),
        },
        getTransactions: {
          useQuery: () => mockGetTransactionsQuery(),
        },
        getUserSubscription: {
          useQuery: () => mockGetUserSubscriptionQuery(),
        },
        addCredits: {
          useMutation: (options?: any) => ({
            mutateAsync: mockAddCreditsMutation,
            isPending: false,
            ...options,
          }),
        },
        refundCredits: {
          useMutation: (options?: any) => ({
            mutateAsync: mockRefundCreditsMutation,
            isPending: false,
            ...options,
          }),
        },
      },
    },
  };
});

// Mock Next.js router
let mockSearchParamsValue = new URLSearchParams();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  usePathname: () => '/billing',
  useSearchParams: () => ({
    get: (key: string) => mockSearchParamsValue.get(key),
  }),
}));

// Mock toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock browser APIs
global.prompt = vi.fn();
global.window.location.reload = vi.fn();

describe('BillingPage', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParamsValue = new URLSearchParams();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    
    // Set default return values
    mockGetStatsQuery.mockReturnValue({
      data: {
        creditsAdded: 1000,
        refunds: 50,
        creditsSpent: 500,
      },
      isLoading: false,
      error: null,
    });
    
    mockSearchQuery.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });
    
    mockGetUserCreditsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });
    
    mockGetTransactionsQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });
    
    mockGetUserSubscriptionQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: null,
    });
  });

  const renderWithProviders = (ui: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    );
  };

  describe('page structure', () => {
    it('should render page header', () => {
      renderWithProviders(<BillingPage />);

      expect(screen.getByText('Credits & Billing')).toBeInTheDocument();
      expect(screen.getByText('Manage transactions, subscriptions, and credit operations')).toBeInTheDocument();
    });

    it('should display billing stats', async () => {
      renderWithProviders(<BillingPage />);

      await waitFor(() => {
        expect(screen.getByText('Credits Added (This Month)')).toBeInTheDocument();
      });

      expect(screen.getByText('1,000')).toBeInTheDocument(); // Formatted number
      expect(screen.getByText('Refunds (This Month)')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('Credits Spent (This Month)')).toBeInTheDocument();
      expect(screen.getByText('500')).toBeInTheDocument();
    });
  });

  describe('user search', () => {
    it('should render user search input', () => {
      renderWithProviders(<BillingPage />);

      expect(screen.getByPlaceholderText('Search user by email or name...')).toBeInTheDocument();
    });

    it('should update search input', async () => {
      const user = userEvent.setup();
      renderWithProviders(<BillingPage />);

      const searchInput = screen.getByPlaceholderText('Search user by email or name...');
      await user.type(searchInput, 'john');

      expect(searchInput).toHaveValue('john');
    });

    it('should display search results when available', async () => {
      const user = userEvent.setup();
      
      mockSearchQuery.mockReturnValue({
        data: [
          {
            id: 'user-1',
            name: 'John Doe',
            email: 'john@example.com',
          },
          {
            id: 'user-2',
            name: 'Jane Smith',
            email: 'jane@example.com',
          },
        ],
        isLoading: false,
        error: null,
      });

      renderWithProviders(<BillingPage />);

      const searchInput = screen.getByPlaceholderText('Search user by email or name...');
      await user.type(searchInput, 'john');

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      expect(screen.getByText('john@example.com')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    it('should select user from search results', async () => {
      const user = userEvent.setup();
      
      mockSearchQuery.mockReturnValue({
        data: [
          {
            id: 'user-1',
            name: 'John Doe',
            email: 'john@example.com',
          },
        ],
        isLoading: false,
        error: null,
      });

      mockGetUserCreditsQuery.mockReturnValue({
        data: {
          balance: 1000,
          totalEarned: 5000,
          totalSpent: 4000,
        },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<BillingPage />);

      const searchInput = screen.getByPlaceholderText('Search user by email or name...');
      await user.type(searchInput, 'john');

      await waitFor(() => {
        expect(screen.getByText('John Doe')).toBeInTheDocument();
      });

      const userButton = screen.getByText('John Doe').closest('button');
      if (userButton) {
        await user.click(userButton);

        await waitFor(() => {
          expect(screen.getByText('Credit Balance')).toBeInTheDocument();
        });
      }
    });
  });

  describe('user billing info', () => {
    it('should display credit balance when user is selected', async () => {
      mockSearchParamsValue.set('userId', 'user-1');
      
      mockGetUserCreditsQuery.mockReturnValue({
        data: {
          balance: 1500,
          totalEarned: 6000,
          totalSpent: 4500,
        },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<BillingPage />);

      await waitFor(() => {
        expect(screen.getByText('Credit Balance')).toBeInTheDocument();
      });

      expect(screen.getByText('1,500')).toBeInTheDocument();
      expect(screen.getByText(/Total Earned: 6,000/)).toBeInTheDocument();
      expect(screen.getByText(/Total Spent: 4,500/)).toBeInTheDocument();
    });

    it('should display add credits and refund buttons', async () => {
      mockSearchParamsValue.set('userId', 'user-1');
      
      mockGetUserCreditsQuery.mockReturnValue({
        data: {
          balance: 1000,
          totalEarned: 5000,
          totalSpent: 4000,
        },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<BillingPage />);

      await waitFor(() => {
        expect(screen.getByText('Add Credits')).toBeInTheDocument();
      });

      expect(screen.getByText('Refund Credits')).toBeInTheDocument();
    });
  });

  describe('transactions', () => {
    it('should display transactions when user is selected', async () => {
      mockSearchParamsValue.set('userId', 'user-1');
      
      mockGetUserCreditsQuery.mockReturnValue({
        data: {
          balance: 1000,
          totalEarned: 5000,
          totalSpent: 4000,
        },
        isLoading: false,
        error: null,
      });

      mockGetTransactionsQuery.mockReturnValue({
        data: {
          transactions: [
            {
              id: 'tx-1',
              type: 'purchase',
              amount: 100,
              balance: 1000,
              description: 'Credit purchase',
              createdAt: new Date('2024-01-01').toISOString(),
            },
            {
              id: 'tx-2',
              type: 'generation',
              amount: -50,
              balance: 950,
              description: 'Image generation',
              createdAt: new Date('2024-01-02').toISOString(),
            },
          ],
          pagination: {
            total: 2,
            limit: 50,
            offset: 0,
            hasMore: false,
          },
        },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<BillingPage />);

      await waitFor(() => {
        expect(screen.getByText('Credit purchase')).toBeInTheDocument();
      });

      expect(screen.getByText('Image generation')).toBeInTheDocument();
    });

    it('should show empty state when no transactions', async () => {
      mockSearchParamsValue.set('userId', 'user-1');
      
      mockGetUserCreditsQuery.mockReturnValue({
        data: {
          balance: 1000,
          totalEarned: 5000,
          totalSpent: 4000,
        },
        isLoading: false,
        error: null,
      });

      mockGetTransactionsQuery.mockReturnValue({
        data: {
          transactions: [],
          pagination: {
            total: 0,
            limit: 50,
            offset: 0,
            hasMore: false,
          },
        },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<BillingPage />);

      await waitFor(() => {
        expect(screen.getByText(/No transactions found/i)).toBeInTheDocument();
      });
    });
  });

  describe('type filter', () => {
    it('should display type filter options', async () => {
      mockSearchParamsValue.set('userId', 'user-1');
      
      mockGetUserCreditsQuery.mockReturnValue({
        data: {
          balance: 1000,
          totalEarned: 5000,
          totalSpent: 4000,
        },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<BillingPage />);

      await waitFor(() => {
        const typeFilter = screen.getByRole('combobox');
        expect(typeFilter).toBeInTheDocument();
      });
    });

    it('should update type filter', async () => {
      const user = userEvent.setup();
      
      mockSearchParamsValue.set('userId', 'user-1');
      
      mockGetUserCreditsQuery.mockReturnValue({
        data: {
          balance: 1000,
          totalEarned: 5000,
          totalSpent: 4000,
        },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<BillingPage />);

      await waitFor(() => {
        const typeFilter = screen.getByRole('combobox');
        expect(typeFilter).toBeInTheDocument();
      });

      const typeFilter = screen.getByRole('combobox');
      await user.selectOptions(typeFilter, 'purchase');

      expect(typeFilter).toHaveValue('purchase');
    });
  });

  describe('pagination', () => {
    it('should display pagination info', async () => {
      mockSearchParamsValue.set('userId', 'user-1');
      
      mockGetUserCreditsQuery.mockReturnValue({
        data: {
          balance: 1000,
          totalEarned: 5000,
          totalSpent: 4000,
        },
        isLoading: false,
        error: null,
      });

      mockGetTransactionsQuery.mockReturnValue({
        data: {
          transactions: [],
          pagination: {
            total: 100,
            limit: 50,
            offset: 0,
            hasMore: true,
          },
        },
        isLoading: false,
        error: null,
      });

      renderWithProviders(<BillingPage />);

      await waitFor(() => {
        expect(screen.getByText(/Showing 1-50 of 100/i)).toBeInTheDocument();
      });
    });
  });
});
