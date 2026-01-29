import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useOrderedSteps } from './useOrderedSteps';
import { useFormContext } from 'react-hook-form';
import { buildFunnelSteps } from '@/features/funnel/config/steps';

vi.mock('react-hook-form', () => ({
  useFormContext: vi.fn(),
}));

vi.mock('@/features/funnel/config/steps', () => ({
  buildFunnelSteps: vi.fn((method) => {
    if (method === 'presets') {
      return [
        { name: 'Step 1', id: 'step-1' },
        { name: 'Step 2', id: 'step-2' },
      ];
    }
    if (method === 'ai') {
      return [
        { name: 'AI Step 1', id: 'ai-step-1' },
        { name: 'AI Step 2', id: 'ai-step-2' },
      ];
    }
    return [
      { name: 'Custom Step 1', id: 'custom-step-1' },
      { name: 'Custom Step 2', id: 'custom-step-2' },
    ];
  }),
}));

describe('useOrderedSteps', () => {
  const mockWatch = vi.fn();
  const mockForm = {
    watch: mockWatch,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return presets steps when form context is not available', () => {
    (useFormContext as any).mockImplementation(() => {
      throw new Error('No form context');
    });

    const { result } = renderHook(() => useOrderedSteps());

    expect(result.current.orderedSteps).toHaveLength(2);
    expect(result.current.orderedSteps[0].name).toBe('Step 1');
    expect(result.current.isLoading).toBe(false);
    expect(typeof result.current.refresh).toBe('function');
  });

  it('should return presets steps when creation_method is presets', () => {
    mockWatch.mockReturnValue('presets');
    (useFormContext as any).mockReturnValue(mockForm);

    const { result } = renderHook(() => useOrderedSteps());

    expect(result.current.orderedSteps).toHaveLength(2);
    expect(result.current.orderedSteps[0].name).toBe('Step 1');
    expect(buildFunnelSteps).toHaveBeenCalledWith('presets');
  });

  it('should return AI steps when creation_method is ai', () => {
    mockWatch.mockReturnValue('ai');
    (useFormContext as any).mockReturnValue(mockForm);

    const { result } = renderHook(() => useOrderedSteps());

    expect(result.current.orderedSteps).toHaveLength(2);
    expect(result.current.orderedSteps[0].name).toBe('AI Step 1');
    expect(buildFunnelSteps).toHaveBeenCalledWith('ai');
  });

  it('should return custom steps when creation_method is custom', () => {
    mockWatch.mockReturnValue('custom');
    (useFormContext as any).mockReturnValue(mockForm);

    const { result } = renderHook(() => useOrderedSteps());

    expect(result.current.orderedSteps).toHaveLength(2);
    expect(result.current.orderedSteps[0].name).toBe('Custom Step 1');
    expect(buildFunnelSteps).toHaveBeenCalledWith('custom');
  });

  it('should add index to each step', () => {
    mockWatch.mockReturnValue('presets');
    (useFormContext as any).mockReturnValue(mockForm);

    const { result } = renderHook(() => useOrderedSteps());

    expect(result.current.orderedSteps[0].index).toBe(0);
    expect(result.current.orderedSteps[1].index).toBe(1);
  });

  it('should return isLoading as false', () => {
    mockWatch.mockReturnValue('presets');
    (useFormContext as any).mockReturnValue(mockForm);

    const { result } = renderHook(() => useOrderedSteps());

    expect(result.current.isLoading).toBe(false);
  });

  it('should provide refresh function', () => {
    mockWatch.mockReturnValue('presets');
    (useFormContext as any).mockReturnValue(mockForm);

    const { result } = renderHook(() => useOrderedSteps());

    expect(typeof result.current.refresh).toBe('function');
    // Should not throw when called
    expect(() => result.current.refresh()).not.toThrow();
  });

  it('should update steps when creation_method changes', () => {
    mockWatch.mockReturnValue('presets');
    (useFormContext as any).mockReturnValue(mockForm);

    const { result, rerender } = renderHook(() => useOrderedSteps());

    expect(result.current.orderedSteps[0].name).toBe('Step 1');

    mockWatch.mockReturnValue('ai');
    rerender();

    expect(result.current.orderedSteps[0].name).toBe('AI Step 1');
  });
});
