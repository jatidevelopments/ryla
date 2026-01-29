import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDynamicOptions, useEthnicityFilteredOptions } from './useDynamicOptions';
import { useFormContext } from 'react-hook-form';
import { OPTION_RULES } from '@/constants/option-rules';

vi.mock('react-hook-form', () => ({
  useFormContext: vi.fn(),
}));

vi.mock('@/constants/option-rules', () => ({
  OPTION_RULES: [
    {
      id: 'test-rule',
      targetField: 'influencer_skin_color',
      dependsOn: 'influencer_ethnicity',
      type: 'filter',
      condition: (values: any) => !!values.influencer_ethnicity,
      action: (values: any, allOptions: any[]) => {
        if (values.influencer_ethnicity === 'caucasian') {
          return allOptions.filter((opt) => opt.value === 'light' || opt.value === 'medium');
        }
        return allOptions;
      },
    },
  ],
}));

describe('useDynamicOptions', () => {
  const mockWatch = vi.fn();
  const mockForm = {
    watch: mockWatch,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useFormContext as any).mockReturnValue(mockForm);
  });

  it('should return all options when no rules apply', () => {
    mockWatch.mockReturnValue({});
    const allOptions = [
      { value: 'light' },
      { value: 'medium' },
      { value: 'dark' },
    ];

    const { result } = renderHook(() =>
      useDynamicOptions('influencer_hair_color', allOptions)
    );

    expect(result.current).toHaveLength(3);
    expect(result.current[0].option).toEqual({ value: 'light' });
  });

  it('should filter options based on rule when dependency is satisfied', () => {
    mockWatch.mockReturnValue({ influencer_ethnicity: 'caucasian' });
    const allOptions = [
      { value: 'light' },
      { value: 'medium' },
      { value: 'dark' },
    ];

    const { result } = renderHook(() =>
      useDynamicOptions('influencer_skin_color', allOptions)
    );

    expect(result.current).toHaveLength(2);
    expect(result.current.map((opt) => opt.option.value)).toEqual(['light', 'medium']);
  });

  it('should not filter when dependency is not satisfied', () => {
    mockWatch.mockReturnValue({ influencer_ethnicity: '' });
    const allOptions = [
      { value: 'light' },
      { value: 'medium' },
      { value: 'dark' },
    ];

    const { result } = renderHook(() =>
      useDynamicOptions('influencer_skin_color', allOptions)
    );

    expect(result.current).toHaveLength(3);
  });

  it('should wrap options in FilteredOption format', () => {
    mockWatch.mockReturnValue({});
    const allOptions = [{ value: 'test' }];

    const { result } = renderHook(() =>
      useDynamicOptions('influencer_hair_color', allOptions)
    );

    expect(result.current[0]).toHaveProperty('option');
    expect(result.current[0].option).toEqual({ value: 'test' });
  });

  it('should preserve disabled/highlighted properties', () => {
    mockWatch.mockReturnValue({});
    const allOptions = [
      { value: 'test', disabled: true, highlighted: false },
    ];

    const { result } = renderHook(() =>
      useDynamicOptions('influencer_hair_color', allOptions)
    );

    expect(result.current[0].disabled).toBe(true);
    expect(result.current[0].highlighted).toBe(false);
  });

  it('should react to form value changes', () => {
    mockWatch.mockReturnValue({ influencer_ethnicity: 'caucasian' });
    const allOptions = [
      { value: 'light' },
      { value: 'medium' },
      { value: 'dark' },
    ];

    const { result, rerender } = renderHook(() =>
      useDynamicOptions('influencer_skin_color', allOptions)
    );

    expect(result.current).toHaveLength(2);

    mockWatch.mockReturnValue({ influencer_ethnicity: 'black' });
    rerender();

    expect(result.current).toHaveLength(3);
  });
});

describe('useEthnicityFilteredOptions', () => {
  const mockWatch = vi.fn();
  const mockForm = {
    watch: mockWatch,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useFormContext as any).mockReturnValue(mockForm);
  });

  it('should use useDynamicOptions internally', () => {
    mockWatch.mockReturnValue({});
    const allOptions = [{ value: 'test' }];

    const { result } = renderHook(() =>
      useEthnicityFilteredOptions(allOptions, 'influencer_skin_color')
    );

    expect(result.current).toHaveLength(1);
    expect(result.current[0].option).toEqual({ value: 'test' });
  });
});
