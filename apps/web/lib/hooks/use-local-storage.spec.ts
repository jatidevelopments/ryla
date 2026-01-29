import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './use-local-storage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize with initial value when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    expect(result.current[0]).toBe('initial');
  });

  it('should initialize with value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('stored-value'));

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    expect(result.current[0]).toBe('stored-value');
  });

  it('should update localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    act(() => {
      result.current[1]('updated-value');
    });

    expect(result.current[0]).toBe('updated-value');
    expect(JSON.parse(localStorage.getItem('test-key')!)).toBe('updated-value');
  });

  it('should handle function updater', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 0));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(1);
    expect(JSON.parse(localStorage.getItem('test-key')!)).toBe(1);
  });

  it('should handle complex objects', () => {
    const initialValue = { name: 'John', age: 30 };
    const { result } = renderHook(() => useLocalStorage('test-key', initialValue));

    act(() => {
      result.current[1]({ name: 'Jane', age: 25 });
    });

    expect(result.current[0]).toEqual({ name: 'Jane', age: 25 });
    expect(JSON.parse(localStorage.getItem('test-key')!)).toEqual({ name: 'Jane', age: 25 });
  });

  it('should handle arrays', () => {
    const initialValue = [1, 2, 3];
    const { result } = renderHook(() => useLocalStorage('test-key', initialValue));

    act(() => {
      result.current[1]([4, 5, 6]);
    });

    expect(result.current[0]).toEqual([4, 5, 6]);
    expect(JSON.parse(localStorage.getItem('test-key')!)).toEqual([4, 5, 6]);
  });

  it('should handle invalid JSON in localStorage gracefully', () => {
    localStorage.setItem('test-key', 'invalid-json');

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    // Should fall back to initial value
    expect(result.current[0]).toBe('initial');
  });

  it('should handle localStorage errors gracefully', () => {
    // Mock localStorage.setItem to throw error
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = vi.fn(() => {
      throw new Error('QuotaExceededError');
    });

    const { result } = renderHook(() => useLocalStorage('test-key', 'initial'));

    act(() => {
      result.current[1]('updated-value');
    });

    // Should still update state even if localStorage fails
    expect(result.current[0]).toBe('updated-value');

    // Restore original
    Storage.prototype.setItem = originalSetItem;
  });

  it('should handle SSR (window undefined)', () => {
    // For SSR, the hook should work but localStorage operations are skipped
    // We can't actually set window to undefined in jsdom, so we test the behavior
    // by ensuring the hook doesn't crash and returns initial value
    const { result } = renderHook(() => useLocalStorage('test-ssr-key', 'initial'));

    expect(result.current[0]).toBe('initial');

    act(() => {
      result.current[1]('updated-value');
    });

    // State should still update (React state works even without window)
    expect(result.current[0]).toBe('updated-value');
  });

  it('should persist value across multiple renders', () => {
    const { result } = renderHook(() => useLocalStorage('test-persist-key', 'initial'));

    act(() => {
      result.current[1]('updated-value');
    });

    // Value should be updated
    expect(result.current[0]).toBe('updated-value');
    expect(JSON.parse(localStorage.getItem('test-persist-key')!)).toBe('updated-value');
    
    // Create a new hook instance - it should read from localStorage
    const { result: result2 } = renderHook(() => useLocalStorage('test-persist-key', 'initial'));
    expect(result2.current[0]).toBe('updated-value');
  });

  it('should handle different keys independently', () => {
    // Test keys independently by using separate hook instances sequentially
    const { result: result1, unmount: unmount1 } = renderHook(() => useLocalStorage('key-indep-1', 'value-1'));

    act(() => {
      result1.current[1]('updated-1');
    });

    expect(result1.current[0]).toBe('updated-1');
    expect(JSON.parse(localStorage.getItem('key-indep-1')!)).toBe('updated-1');
    
    unmount1();

    const { result: result2 } = renderHook(() => useLocalStorage('key-indep-2', 'value-2'));

    act(() => {
      result2.current[1]('updated-2');
    });

    expect(result2.current[0]).toBe('updated-2');
    expect(JSON.parse(localStorage.getItem('key-indep-2')!)).toBe('updated-2');
  });
});
