import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useInitUtm } from './useInitUtm';
import { useSearchParams } from 'next/navigation';
import { useUtmStore } from '@/store/states/utm';

vi.mock('next/navigation', () => ({
  useSearchParams: vi.fn(),
}));

vi.mock('@/store/states/utm', () => ({
  useUtmStore: vi.fn(),
}));

describe('useInitUtm', () => {
  const mockMerge = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useUtmStore as any).mockReturnValue(mockMerge);
  });

  it('should merge UTM params from search params', async () => {
    const mockSearchParams = new URLSearchParams('utm_source=test&utm_medium=email');
    (useSearchParams as any).mockReturnValue(mockSearchParams);

    renderHook(() => useInitUtm());

    await waitFor(() => {
      expect(mockMerge).toHaveBeenCalledWith({
        utm_source: 'test',
        utm_medium: 'email',
      });
    });
  });

  it('should not merge when search params are empty', async () => {
    const mockSearchParams = new URLSearchParams();
    (useSearchParams as any).mockReturnValue(mockSearchParams);

    renderHook(() => useInitUtm());

    await waitFor(() => {
      expect(mockMerge).not.toHaveBeenCalled();
    });
  });

  it('should handle null search params', () => {
    (useSearchParams as any).mockReturnValue(null);

    renderHook(() => useInitUtm());

    expect(mockMerge).not.toHaveBeenCalled();
  });
});
