import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import BuyCreditsPage from './page';
import * as navigation from 'next/navigation';
import { useCreditPurchase } from './hooks';

// Mock Hooks
vi.mock('./hooks', () => ({
  useCreditPurchase: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
}));

// Mock TRPC
const mockUseQuery = vi.fn();
vi.mock('../../lib/trpc', () => ({
  trpc: {
    credits: {
      getBalance: { useQuery: () => mockUseQuery() },
    },
  },
}));

// Mock UI
vi.mock('@ryla/ui', () => ({
  PageContainer: ({ children }: any) => (
    <div data-testid="page-container">{children}</div>
  ),
  FadeInUp: ({ children }: any) => <div>{children}</div>,
}));

// Mock Auth
vi.mock('../../components/auth/ProtectedRoute', () => ({
  ProtectedRoute: ({ children }: any) => <div>{children}</div>,
}));

// Mock local components
vi.mock('./components', () => ({
  CreditPackagesGrid: ({ onPurchase }: any) => (
    <div data-testid="packages-grid">
      <button onClick={() => onPurchase('credits_pack_2000')}>Buy Basic</button>
    </div>
  ),
  PurchaseConfirmationModal: ({ onConfirm, onCancel }: any) => (
    <div data-testid="confirm-modal">
      <button onClick={onConfirm}>Confirm</button>
      <button onClick={onCancel}>Cancel</button>
    </div>
  ),
  SubscriptionUpsell: () => <div data-testid="subscription-upsell" />,
}));

describe('BuyCreditsPage', () => {
  const mockPurchase = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (navigation.useSearchParams as any).mockReturnValue(new URLSearchParams());
    (useCreditPurchase as any).mockReturnValue({
      purchase: mockPurchase,
      isProcessing: false,
    });
    mockUseQuery.mockReturnValue({
      data: { balance: 100 },
      isLoading: false,
    });
  });

  it('should render page content', () => {
    render(<BuyCreditsPage />);

    expect(screen.getByText('Buy Credits')).toBeInTheDocument();
    expect(screen.getByText('100 credits')).toBeInTheDocument();
    expect(screen.getByTestId('packages-grid')).toBeInTheDocument();
    expect(screen.getByTestId('subscription-upsell')).toBeInTheDocument();
  });

  it('should handle success param', async () => {
    (navigation.useSearchParams as any).mockReturnValue(
      new URLSearchParams('success=true')
    );
    render(<BuyCreditsPage />);

    await waitFor(() => {
      expect(screen.getByText(/Payment successful/i)).toBeInTheDocument();
    });
  });

  it('should open confirmation modal on purchase click', () => {
    render(<BuyCreditsPage />);

    fireEvent.click(screen.getByText('Buy Basic'));
    expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();
  });

  it('should call purchase handler when confirmed', async () => {
    render(<BuyCreditsPage />);

    fireEvent.click(screen.getByText('Buy Basic'));
    fireEvent.click(screen.getByText('Confirm'));

    expect(mockPurchase).toHaveBeenCalledWith('credits_pack_2000');
  });

  it('should close modal on cancel', () => {
    render(<BuyCreditsPage />);

    fireEvent.click(screen.getByText('Buy Basic'));
    expect(screen.getByTestId('confirm-modal')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByTestId('confirm-modal')).not.toBeInTheDocument();
  });
});
