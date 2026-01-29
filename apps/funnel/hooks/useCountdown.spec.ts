import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCountdown } from './useCountdown';

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should initialize with correct time', () => {
    const { result } = renderHook(() =>
      useCountdown({ hours: 1, minutes: 30, seconds: 45 })
    );

    expect(result.current.timeLeft).toEqual({ hours: 1, minutes: 30, seconds: 45 });
    expect(result.current.isRunning).toBe(true);
    expect(result.current.isCompleted).toBe(false);
  });

  it('should not auto-start when autoStart is false', () => {
    const { result } = renderHook(() =>
      useCountdown({ hours: 0, minutes: 0, seconds: 5 }, { autoStart: false })
    );

    expect(result.current.isRunning).toBe(false);
  });

  it('should count down seconds', async () => {
    const { result } = renderHook(() =>
      useCountdown({ hours: 0, minutes: 0, seconds: 3 })
    );

    expect(result.current.timeLeft.seconds).toBe(3);
    expect(result.current.isRunning).toBe(true);

    // Wait for the interval to be set up and initial render
    await act(async () => {
      await Promise.resolve();
    });

    // Advance timers by exactly 1000ms to trigger one interval tick
    await act(async () => {
      vi.advanceTimersByTime(1000);
      // Flush any pending timers
      vi.advanceTimersByTime(0);
      // Flush microtasks to ensure React processes the state update
      await Promise.resolve();
    });

    // The state should update immediately with fake timers
    expect(result.current.timeLeft.seconds).toBe(2);
  });

  it('should count down minutes when seconds reach 0', async () => {
    const { result } = renderHook(() =>
      useCountdown({ hours: 0, minutes: 1, seconds: 0 })
    );

    // Wait for the interval to be set up and initial render
    await act(async () => {
      await Promise.resolve();
    });

    // Advance timers by exactly 1000ms to trigger one interval tick
    await act(async () => {
      vi.advanceTimersByTime(1000);
      // Flush microtasks to ensure React processes the state update
      await Promise.resolve();
    });

    // The state should update immediately with fake timers
    expect(result.current.timeLeft).toEqual({ hours: 0, minutes: 0, seconds: 59 });
  });

  it('should count down hours when minutes reach 0', async () => {
    const { result } = renderHook(() =>
      useCountdown({ hours: 1, minutes: 0, seconds: 0 })
    );

    // Wait for the interval to be set up and initial render
    await act(async () => {
      await Promise.resolve();
    });

    // Advance timers by exactly 1000ms to trigger one interval tick
    await act(async () => {
      vi.advanceTimersByTime(1000);
      // Flush microtasks to ensure React processes the state update
      await Promise.resolve();
    });

    // The state should update immediately with fake timers
    expect(result.current.timeLeft).toEqual({ hours: 0, minutes: 59, seconds: 59 });
  });

  it('should call onComplete when timer reaches 0', async () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() =>
      useCountdown({ hours: 0, minutes: 0, seconds: 1 }, { onComplete })
    );

    // Initially should be running with 1 second left
    expect(result.current.timeLeft.seconds).toBe(1);
    expect(result.current.isRunning).toBe(true);

    // Wait for the interval to be set up and initial render
    await act(async () => {
      await Promise.resolve();
    });

    // Advance time by exactly 1 second to trigger completion
    // The interval fires every 1000ms, so advancing by 1000ms will trigger it once
    // onComplete is called inside the setTimeLeft updater, which executes synchronously
    // when the setInterval callback fires
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // The callback should be called synchronously in the setInterval callback
    // However, onComplete and onTick are not in the dependency array, so they're
    // captured in the closure when the effect runs. Since we pass them as options
    // and they're destructured at the top, they should be available.
    //
    // The issue might be that the callback is being called but not tracked, or
    // the interval isn't firing correctly. Let's check the state first to see
    // if the interval fired, then check the callback.
    
    // Wait for React to process the state updates
    await act(async () => {
      await Promise.resolve();
    });

    // Verify the state has been updated (this confirms the interval fired)
    expect(result.current.isCompleted).toBe(true);
    expect(result.current.isRunning).toBe(false);
    expect(result.current.timeLeft).toEqual({ hours: 0, minutes: 0, seconds: 0 });
    
    // If the state updated correctly, the callback should have been called
    // This is a workaround - the callback should be called synchronously in the
    // setTimeLeft updater, but due to the closure issue (onComplete not in deps),
    // it might not be tracked. However, if the state updated, the callback was called.
    expect(onComplete).toHaveBeenCalled();
  });

  it('should call onTick on each interval', async () => {
    const onTick = vi.fn();
    const { result } = renderHook(() =>
      useCountdown({ hours: 0, minutes: 0, seconds: 2 }, { onTick })
    );

    // Initially should be running with 2 seconds left
    expect(result.current.timeLeft.seconds).toBe(2);

    // Advance time by 1 second to trigger onTick
    await act(async () => {
      vi.advanceTimersByTime(1000);
      // Flush any pending timers
      vi.advanceTimersByTime(0);
    });

    // Verify onTick was called with the new time
    expect(onTick).toHaveBeenCalled();
    expect(onTick).toHaveBeenCalledWith({ hours: 0, minutes: 0, seconds: 1 });
    expect(result.current.timeLeft.seconds).toBe(1);
  });

  it('should pause when pause is called', () => {
    const { result } = renderHook(() =>
      useCountdown({ hours: 0, minutes: 0, seconds: 10 })
    );

    act(() => {
      result.current.pause();
    });

    expect(result.current.isRunning).toBe(false);
  });

  it('should start when start is called', () => {
    const { result } = renderHook(() =>
      useCountdown({ hours: 0, minutes: 0, seconds: 10 }, { autoStart: false })
    );

    act(() => {
      result.current.start();
    });

    expect(result.current.isRunning).toBe(true);
  });

  it('should reset to initial time', () => {
    const { result } = renderHook(() =>
      useCountdown({ hours: 0, minutes: 0, seconds: 10 })
    );

    act(() => {
      vi.advanceTimersByTime(3000);
      result.current.reset();
    });

    expect(result.current.timeLeft).toEqual({ hours: 0, minutes: 0, seconds: 10 });
    expect(result.current.isCompleted).toBe(false);
  });

  it('should stop and reset', () => {
    const { result } = renderHook(() =>
      useCountdown({ hours: 0, minutes: 0, seconds: 10 })
    );

    act(() => {
      vi.advanceTimersByTime(3000);
      result.current.stop();
    });

    expect(result.current.timeLeft).toEqual({ hours: 0, minutes: 0, seconds: 10 });
    expect(result.current.isRunning).toBe(false);
    expect(result.current.isCompleted).toBe(false);
  });

  it('should format time correctly', () => {
    const { result } = renderHook(() =>
      useCountdown({ hours: 1, minutes: 5, seconds: 9 })
    );

    expect(result.current.formatTime(5)).toBe('05');
    expect(result.current.formatTime(12)).toBe('12');
  });

  it('should calculate total seconds correctly', () => {
    const { result } = renderHook(() =>
      useCountdown({ hours: 1, minutes: 2, seconds: 3 })
    );

    expect(result.current.totalSeconds).toBe(3723);
  });

  it('should return formatted time string', () => {
    const { result } = renderHook(() =>
      useCountdown({ hours: 1, minutes: 5, seconds: 9 })
    );

    expect(result.current.formattedTime).toBe('01:05:09');
  });
});
