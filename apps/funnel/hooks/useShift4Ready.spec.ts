import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useShift4Ready } from './useShift4Ready';

describe('useShift4Ready', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Clean up properties we need to test
    if (global.window) {
      delete (global.window as any).Shift4;
    }
  });

  afterEach(() => {
    vi.useRealTimers();
    // Clean up after tests
    if (global.window) {
      delete (global.window as any).Shift4;
    }
  });

  it('should return not ready initially', () => {
    const { result } = renderHook(() => useShift4Ready());
    expect(result.current.isReady).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should become ready when Shift4 is loaded', async () => {
    const { result } = renderHook(() => useShift4Ready());

    // Set up window property BEFORE the first check runs
    (global.window as any).Shift4 = vi.fn();

    // Advance timers to trigger the check
    await act(async () => {
      vi.advanceTimersByTime(100);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(true);
      expect(result.current.error).toBeNull();
    }, { timeout: 2000 });
  });

  it('should set error when Shift4 fails to load', async () => {
    const { result } = renderHook(() => useShift4Ready());

    // Wait for initial render and first check
    await act(async () => {
      await Promise.resolve();
      vi.advanceTimersByTime(0);
    });

    // Advance past max attempts (50 * 100ms = 5 seconds)
    // Advance all at once, then wait for React to process
    act(() => {
      vi.advanceTimersByTime(5100); // 50 attempts * 100ms + 100ms buffer
    });

    // Wait for React to process all state updates
    await waitFor(() => {
      expect(result.current.isReady).toBe(false);
      expect(result.current.error).toContain('Shift4 failed to load');
    }, { timeout: 10000 });
  });
});
