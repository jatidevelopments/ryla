import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEmailCheck } from './use-email-check';
import * as authModule from '../auth';

// Mock auth module
vi.mock('../auth', () => ({
  checkEmailExists: vi.fn(),
}));

describe('useEmailCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useEmailCheck());

    expect(result.current.isChecking).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.checkEmail).toBe('function');
    expect(typeof result.current.clearError).toBe('function');
  });

  it('should return null for invalid email format', async () => {
    const { result } = renderHook(() => useEmailCheck());

    let emailResult: boolean | null = null;
    const promise = act(async () => {
      const res = await result.current.checkEmail('invalid-email');
      emailResult = res;
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await promise;
    
    expect(emailResult).toBeNull();
    expect(result.current.isChecking).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should return null for empty email', async () => {
    const { result } = renderHook(() => useEmailCheck());

    let emailResult: boolean | null = null;
    const promise = act(async () => {
      const res = await result.current.checkEmail('');
      emailResult = res;
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await promise;
    expect(emailResult).toBeNull();
  });

  it('should debounce email checks', async () => {
    vi.mocked(authModule.checkEmailExists).mockResolvedValue(true);

    const { result } = renderHook(() => useEmailCheck());

    act(() => {
      result.current.checkEmail('test@example.com');
    });

    // Advance timer but not enough to trigger
    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(authModule.checkEmailExists).not.toHaveBeenCalled();

    // Advance to trigger debounce
    act(() => {
      vi.advanceTimersByTime(100);
    });

    // Wait for async operation
    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(authModule.checkEmailExists).toHaveBeenCalledTimes(1);
  });

  it('should cancel previous check when new email is entered', async () => {
    vi.mocked(authModule.checkEmailExists).mockResolvedValue(true);

    const { result } = renderHook(() => useEmailCheck());

    act(() => {
      result.current.checkEmail('first@example.com');
    });

    act(() => {
      vi.advanceTimersByTime(200);
    });

    act(() => {
      result.current.checkEmail('second@example.com');
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await act(async () => {
      await vi.runAllTimersAsync();
    });

    expect(authModule.checkEmailExists).toHaveBeenCalledTimes(1);
    expect(authModule.checkEmailExists).toHaveBeenCalledWith('second@example.com');
  });

  it('should set isChecking to true during check', async () => {
    let resolveCheck: (value: boolean) => void;
    const checkPromise = new Promise<boolean>((resolve) => {
      resolveCheck = resolve;
    });

    vi.mocked(authModule.checkEmailExists).mockReturnValue(checkPromise);

    const { result } = renderHook(() => useEmailCheck());

    act(() => {
      result.current.checkEmail('test@example.com');
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    // After debounce, isChecking should be true
    expect(result.current.isChecking).toBe(true);

    await act(async () => {
      resolveCheck!(true);
      await vi.runAllTimersAsync();
    });

    expect(result.current.isChecking).toBe(false);
  });

  it('should return true if email exists', async () => {
    vi.mocked(authModule.checkEmailExists).mockResolvedValue(true);

    const { result } = renderHook(() => useEmailCheck());

    let emailResult: boolean | null = null;
    const promise = act(async () => {
      const res = await result.current.checkEmail('test@example.com');
      emailResult = res;
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await promise;
    
    expect(emailResult).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should return false if email does not exist', async () => {
    vi.mocked(authModule.checkEmailExists).mockResolvedValue(false);

    const { result } = renderHook(() => useEmailCheck());

    let emailResult: boolean | null = null;
    const promise = act(async () => {
      const res = await result.current.checkEmail('test@example.com');
      emailResult = res;
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await promise;
    
    expect(emailResult).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle errors and set error state', async () => {
    const errorMessage = 'Network error';
    vi.mocked(authModule.checkEmailExists).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useEmailCheck());

    let emailResult: boolean | null = null;
    const promise = act(async () => {
      const res = await result.current.checkEmail('test@example.com');
      emailResult = res;
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await promise;
    
    expect(emailResult).toBeNull();
    expect(result.current.error).toBe(errorMessage);
    expect(result.current.isChecking).toBe(false);
  });

  it('should handle non-Error exceptions', async () => {
    vi.mocked(authModule.checkEmailExists).mockRejectedValue('String error');

    const { result } = renderHook(() => useEmailCheck());

    let emailResult: boolean | null = null;
    const promise = act(async () => {
      const res = await result.current.checkEmail('test@example.com');
      emailResult = res;
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await promise;
    
    expect(emailResult).toBeNull();
    expect(result.current.error).toBe('Failed to check email');
  });

  it('should clear error when clearError is called', async () => {
    const errorMessage = 'Network error';
    vi.mocked(authModule.checkEmailExists).mockRejectedValue(new Error(errorMessage));

    const { result } = renderHook(() => useEmailCheck());

    const promise = act(async () => {
      await result.current.checkEmail('test@example.com');
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });

    await promise;
    
    expect(result.current.error).toBe(errorMessage);

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
  });
});
