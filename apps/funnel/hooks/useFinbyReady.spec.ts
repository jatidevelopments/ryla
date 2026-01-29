import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useFinbyReady } from './useFinbyReady';

describe('useFinbyReady', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Clean up properties we need to test
    if (global.window) {
      delete (global.window as any).jQuery;
      delete (global.window as any).openPopup;
    }
  });

  afterEach(() => {
    vi.useRealTimers();
    // Clean up after tests
    if (global.window) {
      delete (global.window as any).jQuery;
      delete (global.window as any).openPopup;
    }
  });

  it('should return not ready initially', () => {
    const { result } = renderHook(() => useFinbyReady());
    expect(result.current.isReady).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should become ready when jQuery and finby are loaded', async () => {
    const { result } = renderHook(() => useFinbyReady());

    // Set up window properties BEFORE the first check runs
    (global.window as any).jQuery = {};
    (global.window as any).openPopup = vi.fn();

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

  it('should set error when finby fails to load', async () => {
    const { result } = renderHook(() => useFinbyReady());

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
      expect(result.current.error).toContain('finby failed to load');
    }, { timeout: 10000 });
  });

  it('should check for jQuery', async () => {
    const { result } = renderHook(() => useFinbyReady());

    // Only set openPopup, not jQuery
    (global.window as any).openPopup = vi.fn();

    await act(async () => {
      vi.advanceTimersByTime(100);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(false);
    }, { timeout: 2000 });
  });

  it('should check for openPopup function', async () => {
    const { result } = renderHook(() => useFinbyReady());

    // Only set jQuery, not openPopup
    (global.window as any).jQuery = {};

    await act(async () => {
      vi.advanceTimersByTime(100);
      await Promise.resolve();
    });

    await waitFor(() => {
      expect(result.current.isReady).toBe(false);
    }, { timeout: 2000 });
  });
});
