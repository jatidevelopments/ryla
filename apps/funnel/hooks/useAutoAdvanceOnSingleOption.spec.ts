import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutoAdvanceOnSingleOption } from './useAutoAdvanceOnSingleOption';
import { useStepperContext } from '@/components/stepper/Stepper.context';
import { useFormContext } from 'react-hook-form';

vi.mock('@/components/stepper/Stepper.context', () => ({
  useStepperContext: vi.fn(),
}));

vi.mock('react-hook-form', () => ({
  useFormContext: vi.fn(),
}));

describe('useAutoAdvanceOnSingleOption', () => {
  const mockNextStep = vi.fn();
  const mockGetValues = vi.fn(() => ({}));
  const mockForm = {
    getValues: mockGetValues,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    (useStepperContext as any).mockReturnValue({ nextStep: mockNextStep });
    (useFormContext as any).mockReturnValue(mockForm);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should return a handler function', () => {
    const { result } = renderHook(() =>
      useAutoAdvanceOnSingleOption([{ value: 'test' }], vi.fn())
    );

    expect(typeof result.current).toBe('function');
  });

  it('should call onSelect when handler is called', () => {
    const mockOnSelect = vi.fn();
    const { result } = renderHook(() =>
      useAutoAdvanceOnSingleOption([{ value: 'test' }], mockOnSelect)
    );

    act(() => {
      result.current('test');
    });

    expect(mockOnSelect).toHaveBeenCalledWith('test');
  });

  it('should not advance when multiple enabled options exist', () => {
    const mockOnSelect = vi.fn();
    const { result } = renderHook(() =>
      useAutoAdvanceOnSingleOption(
        [{ value: 'test1' }, { value: 'test2' }],
        mockOnSelect
      )
    );

    act(() => {
      result.current('test1');
      vi.advanceTimersByTime(300);
    });

    expect(mockNextStep).not.toHaveBeenCalled();
  });

  it('should advance when only one enabled option exists', () => {
    const mockOnSelect = vi.fn();
    const { result } = renderHook(() =>
      useAutoAdvanceOnSingleOption([{ value: 'test' }], mockOnSelect)
    );

    act(() => {
      result.current('test');
      vi.advanceTimersByTime(300);
    });

    expect(mockNextStep).toHaveBeenCalled();
  });

  it('should not advance when option is disabled', () => {
    const mockOnSelect = vi.fn();
    const { result } = renderHook(() =>
      useAutoAdvanceOnSingleOption(
        [{ value: 'test1', disabled: true }, { value: 'test2', disabled: true }],
        mockOnSelect
      )
    );

    act(() => {
      result.current('test1');
      vi.advanceTimersByTime(300);
    });

    expect(mockNextStep).not.toHaveBeenCalled();
  });

  it('should advance when only one enabled option among mixed options', () => {
    const mockOnSelect = vi.fn();
    const { result } = renderHook(() =>
      useAutoAdvanceOnSingleOption(
        [{ value: 'test1', disabled: true }, { value: 'test2' }],
        mockOnSelect
      )
    );

    act(() => {
      result.current('test2');
      vi.advanceTimersByTime(300);
    });

    expect(mockNextStep).toHaveBeenCalled();
  });

  it('should wait for form state update before advancing', () => {
    const mockOnSelect = vi.fn();
    const { result } = renderHook(() =>
      useAutoAdvanceOnSingleOption([{ value: 'test' }], mockOnSelect)
    );

    act(() => {
      result.current('test');
      // Should not advance immediately
      expect(mockNextStep).not.toHaveBeenCalled();
      
      // Advance timers to trigger the delayed nextStep
      vi.advanceTimersByTime(300);
    });

    expect(mockNextStep).toHaveBeenCalled();
  });
});
