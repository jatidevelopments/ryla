import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCredits, useAddCredits, useRefundFailedJob } from './use-credits';
// Import dependencies for mocking
import { trpc } from '../trpc';

// Mock TRPC
const mockUseQuery = vi.fn();
const mockUseMutation = vi.fn();
const mockUseUtils = vi.fn();

vi.mock('../trpc', () => ({
  trpc: {
    credits: {
      getBalance: { useQuery: () => mockUseQuery() },
      dismissLowBalanceWarning: {
        useMutation: (opts: any) => mockUseMutation(opts),
      },
      addCredits: { useMutation: (opts: any) => mockUseMutation(opts) },
      refundFailedJob: { useMutation: (opts: any) => mockUseMutation(opts) },
      getTransactions: { useQuery: () => mockUseQuery() },
    },
    useUtils: () => mockUseUtils(),
  },
}));

describe('useCredits', () => {
  const defaultData = {
    balance: 100,
    totalEarned: 500,
    totalSpent: 400,
    isLowBalance: false,
    isZeroBalance: false,
    lowBalanceThreshold: 10,
    lowBalanceWarningShown: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseQuery.mockReturnValue({
      data: defaultData,
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });
    mockUseMutation.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });
    mockUseUtils.mockReturnValue({
      credits: {
        getBalance: { invalidate: vi.fn() },
        getTransactions: { invalidate: vi.fn() },
      },
      activity: {
        list: { invalidate: vi.fn() },
        summary: { invalidate: vi.fn() },
      },
      notifications: {
        list: { invalidate: vi.fn() },
      },
    });
  });

  it('should return credit data', () => {
    const { result } = renderHook(() => useCredits());

    expect(result.current.balance).toBe(100);
    expect(result.current.totalEarned).toBe(500);
    expect(result.current.isLoading).toBe(false);
  });

  it('should handle loading state', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useCredits());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.balance).toBe(0); // Default fallback
  });

  it('should handle low balance warning', () => {
    mockUseQuery.mockReturnValue({
      data: {
        ...defaultData,
        balance: 5,
        isLowBalance: true,
      },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    });

    const { result } = renderHook(() => useCredits());

    expect(result.current.isLowBalance).toBe(true);
    expect(result.current.balance).toBe(5);
  });

  it('should dismiss low balance warning', () => {
    // Access the mocked function directly via the mock setup, or mockImplementation
    // Since we defined the mock factory above, we can assume mockUseMutation is called.
    // But to capture generic arguments passed to useMutation factory, we need to spy on the factory.
    // OR simpler: check if the 'mutate' function returned by the hook calls the backend.

    // Current mock: useMutation returns { mutate: vi.fn() }
    // We need to capture the 'mutate' function.
    const mutateSpy = vi.fn();
    mockUseMutation.mockReturnValue({
      mutate: mutateSpy,
      isPending: false,
    });

    const { result } = renderHook(() => useCredits());

    act(() => {
      result.current.dismissLowBalanceWarning();
    });

    expect(mutateSpy).toHaveBeenCalled();
  });
});

describe('useAddCredits', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMutation.mockReturnValue({
      mutate: vi.fn(),
    });
    mockUseUtils.mockReturnValue({
      credits: {
        getBalance: { invalidate: vi.fn() },
        getTransactions: { invalidate: vi.fn() },
      },
      activity: {
        list: { invalidate: vi.fn() },
        summary: { invalidate: vi.fn() },
      },
      notifications: { list: { invalidate: vi.fn() } },
    });
  });

  it('should invalidate queries on success', () => {
    // Logic:
    // When useAddCredits is called, it calls trpc.credits.addCredits.useMutation({ onSuccess: ... })
    // We want to trigger that onSuccess.
    // We can intercept the call to useMutation and capture the config.

    let capturedConfig: any;
    mockUseMutation.mockImplementation((config) => {
      capturedConfig = config;
      return { mutate: vi.fn() };
    });

    renderHook(() => useAddCredits());

    expect(capturedConfig).toBeDefined();
    expect(capturedConfig.onSuccess).toBeDefined();

    // Trigger it
    capturedConfig.onSuccess();

    const utils = mockUseUtils.mock.results[0].value;
    expect(utils.credits.getBalance.invalidate).toHaveBeenCalled();
    expect(utils.activity.list.invalidate).toHaveBeenCalled();
  });
});

describe('useRefundFailedJob', () => {
  it('should invalidate queries on success', () => {
    let capturedConfig: any;
    mockUseMutation.mockImplementation((config) => {
      capturedConfig = config;
      return { mutate: vi.fn() };
    });

    renderHook(() => useRefundFailedJob());

    expect(capturedConfig).toBeDefined();

    // Trigger it
    capturedConfig.onSuccess();

    const utils = mockUseUtils.mock.results[0].value;
    expect(utils.credits.getBalance.invalidate).toHaveBeenCalled();
  });
});
