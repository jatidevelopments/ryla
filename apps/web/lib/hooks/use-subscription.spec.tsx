import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSubscription } from './use-subscription';
import { trpc } from '../trpc';

// Mock TRPC
const mockUseQuery = vi.fn();

vi.mock('../trpc', () => ({
  trpc: {
    subscription: {
      getCurrent: { useQuery: () => mockUseQuery() },
    },
  },
}));

describe('useSubscription', () => {
  const defaultData = {
    tier: 'free',
    status: 'active',
    currentPeriodStart: new Date(),
    currentPeriodEnd: new Date(),
    cancelAtPeriodEnd: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseQuery.mockReturnValue({
      data: defaultData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('should return subscription data', () => {
    const { result } = renderHook(() => useSubscription());

    expect(result.current.tier).toBe('free');
    expect(result.current.status).toBe('active');
    expect(result.current.isFree).toBe(true);
    expect(result.current.isPaid).toBe(false);
  });

  it('should handle pro tier', () => {
    mockUseQuery.mockReturnValue({
      data: { ...defaultData, tier: 'pro' },
      isLoading: false,
    });

    const { result } = renderHook(() => useSubscription());

    expect(result.current.tier).toBe('pro');
    expect(result.current.isPro).toBe(true);
    expect(result.current.isPaid).toBe(true);
  });

  it('should handle unlimited tier', () => {
    mockUseQuery.mockReturnValue({
      data: { ...defaultData, tier: 'unlimited' },
      isLoading: false,
    });

    const { result } = renderHook(() => useSubscription());

    expect(result.current.tier).toBe('unlimited');
    expect(result.current.isPro).toBe(true); // Unlimited counts as pro features usually? Check logic: isPro: tier === 'pro' || tier === 'unlimited'
  });

  it('should handle loading state', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const { result } = renderHook(() => useSubscription());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.tier).toBe('free'); // Default check
  });
});
