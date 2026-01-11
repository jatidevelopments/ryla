import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PricingPage from './page';
import * as navigation from 'next/navigation';
import * as auth from '../../lib/auth';

// Mock Hooks
vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
  useRouter: vi.fn(),
}));

vi.mock('../../lib/auth', () => ({
  getAccessToken: vi.fn(),
}));

// Mock TRPC
const mockSubscriptionQuery = vi.fn();
const mockCreditsQuery = vi.fn();
vi.mock('../../lib/trpc', () => ({
  trpc: {
    subscription: {
      getCurrent: { useQuery: () => mockSubscriptionQuery() },
    },
    credits: {
      getBalance: { useQuery: () => mockCreditsQuery() },
    },
  },
}));

// Mock UI
vi.mock('@ryla/ui', () => ({
  cn: (...inputs: any[]) => inputs.filter(Boolean).join(' '),
}));

// Mock PlanCard
vi.mock('../../components/pricing', () => ({
  PlanCard: ({ plan, onSubscribe }: any) => (
    <div data-testid={`plan-card-${plan.id}`}>
      <button onClick={() => onSubscribe(plan.id, true)}>Subscribe</button>
    </div>
  ),
}));

// Mock Fetch
global.fetch = vi.fn();

describe('PricingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (navigation.useSearchParams as any).mockReturnValue(new URLSearchParams());
    (auth.getAccessToken as any).mockReturnValue('fake-token');
    mockSubscriptionQuery.mockReturnValue({
      data: { tier: 'free' },
      refetch: vi.fn(),
    });
    mockCreditsQuery.mockReturnValue({
      refetch: vi.fn(),
    });
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ paymentUrl: 'https://payment.com' }),
    });
  });

  it('should render page content', () => {
    render(<PricingPage />);

    expect(screen.getByText('Choose Your Plan')).toBeInTheDocument();
    expect(screen.getByTestId('plan-card-starter')).toBeInTheDocument();
  });

  it('should toggle yearly/monthly', () => {
    render(<PricingPage />);

    const yearlyBtn = screen.getByText(/Yearly/i);
    const monthlyBtn = screen.getByText(/Monthly/i);

    fireEvent.click(monthlyBtn);
    expect(monthlyBtn).toHaveClass('bg-white/10');

    fireEvent.click(yearlyBtn);
    expect(yearlyBtn).toHaveClass('bg-white/10');
  });

  it('should handle subscription click and redirect', async () => {
    delete (window as any).location;
    (window as any).location = { href: '' };

    render(<PricingPage />);

    fireEvent.click(screen.getAllByText('Subscribe')[0]);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
      expect(window.location.href).toBe('https://payment.com');
    });
  });

  it('should handle success param', () => {
    (navigation.useSearchParams as any).mockReturnValue(
      new URLSearchParams('success=true')
    );
    render(<PricingPage />);

    expect(screen.getByText(/Subscription activated/i)).toBeInTheDocument();
  });
});
