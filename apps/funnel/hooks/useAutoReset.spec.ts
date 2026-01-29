import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useAutoReset } from './useAutoReset';
import { useFormContext } from 'react-hook-form';
import { OPTION_RULES } from '@/constants/option-rules';

vi.mock('react-hook-form', () => ({
  useFormContext: vi.fn(),
}));

vi.mock('@/constants/option-rules', () => ({
  OPTION_RULES: [
    {
      id: 'test-reset-rule',
      targetField: 'influencer_skin_color',
      dependsOn: 'influencer_ethnicity',
      type: 'filter',
      condition: () => true,
      action: (values: any, allOptions: any[]) => {
        if (values.influencer_ethnicity === 'caucasian') {
          return allOptions.filter((opt) => opt.value === 'light' || opt.value === 'medium');
        }
        return allOptions;
      },
      resetOnChange: true,
    },
    {
      id: 'test-no-reset-rule',
      targetField: 'influencer_hair_color',
      dependsOn: 'influencer_ethnicity',
      type: 'filter',
      condition: () => true,
      action: () => [],
      resetOnChange: false,
    },
  ],
}));

describe('useAutoReset', () => {
  const mockSetValue = vi.fn();
  const mockGetValues = vi.fn();
  const mockWatch = vi.fn();

  const mockForm = {
    watch: mockWatch,
    getValues: mockGetValues,
    setValue: mockSetValue,
  };

  let currentValues: any = {};

  beforeEach(() => {
    vi.clearAllMocks();
    currentValues = {};
    mockWatch.mockImplementation(() => ({ ...currentValues }));
    // getValues can be called with a field name or without args
    mockGetValues.mockImplementation((field?: string) => {
      if (field) {
        return currentValues[field];
      }
      return { ...currentValues };
    });
    (useFormContext as any).mockReturnValue(mockForm);
  });

  it('should not reset when no dependency changes', async () => {
    currentValues = { influencer_ethnicity: 'caucasian' };

    renderHook(() => useAutoReset());

    await waitFor(() => {
      expect(mockWatch).toHaveBeenCalled();
    });
    
    // Should not reset when no dependency changes
    expect(mockSetValue).not.toHaveBeenCalled();
  });

  it('should reset field when dependency changes and value becomes invalid', async () => {
    // Initial state: caucasian ethnicity, light skin color (valid)
    currentValues = { influencer_ethnicity: 'caucasian', influencer_skin_color: 'light' };

    const { rerender } = renderHook(() => useAutoReset());

    // Wait for initial render and effect
    await waitFor(() => {
      expect(mockWatch).toHaveBeenCalled();
    });

    // Clear any initial calls
    mockSetValue.mockClear();
    mockWatch.mockClear();

    // Change to black ethnicity - light skin color is no longer valid
    // The rule action filters options based on ethnicity, and 'light' is only valid for 'caucasian'
    await act(async () => {
      currentValues = { influencer_ethnicity: 'black', influencer_skin_color: 'light' };
      // Force a re-render by changing the watched values
      rerender();
      // Give React time to process the change
      await Promise.resolve();
    });

    // Wait for the effect to run and detect the dependency change
    await waitFor(() => {
      // Should reset influencer_skin_color because light is not valid for black ethnicity
      expect(mockSetValue).toHaveBeenCalledWith('influencer_skin_color', '', {
        shouldValidate: false,
      });
    }, { timeout: 3000 });
  });

  it('should not reset when value is still valid after dependency change', async () => {
    // Initial: caucasian, light (valid)
    currentValues = { influencer_ethnicity: 'caucasian', influencer_skin_color: 'light' };
    
    const { rerender } = renderHook(() => useAutoReset());
    
    await waitFor(() => {
      expect(mockWatch).toHaveBeenCalled();
    });
    
    // Change to: caucasian, medium (still valid - no dependency change, just value change)
    await act(async () => {
      currentValues = { influencer_ethnicity: 'caucasian', influencer_skin_color: 'medium' };
      rerender();
    });
    
    await waitFor(() => {
      // Should not reset because medium is still valid for caucasian and dependency didn't change
      expect(mockSetValue).not.toHaveBeenCalled();
    }, { timeout: 1000 });
  });

  it('should not reset when field is empty', async () => {
    // First render: caucasian, empty skin color
    currentValues = { influencer_ethnicity: 'caucasian', influencer_skin_color: '' };
    
    const { rerender } = renderHook(() => useAutoReset());
    
    // Wait for initial effect to run
    await waitFor(() => {
      expect(mockWatch).toHaveBeenCalled();
    });
    
    // Clear previous calls
    mockSetValue.mockClear();
    
    // Change to black, still empty skin color
    // The hook checks: if (currentValue && currentValue !== "")
    // Since skin_color is empty, it should not reset
    await act(async () => {
      currentValues = { influencer_ethnicity: 'black', influencer_skin_color: '' };
      // Force a re-render by changing the watched values
      rerender();
    });
    
    // Give React time to process the change
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Should not reset empty fields - the hook checks if currentValue exists before resetting
    expect(mockSetValue).not.toHaveBeenCalled();
  });

  it('should only process rules with resetOnChange flag', () => {
    mockWatch
      .mockReturnValueOnce({ influencer_ethnicity: 'caucasian' })
      .mockReturnValue({ influencer_ethnicity: 'black' });
    mockGetValues.mockReturnValue({ influencer_hair_color: 'blonde' });

    renderHook(() => useAutoReset());

    // Should not reset influencer_hair_color because its rule doesn't have resetOnChange
    expect(mockSetValue).not.toHaveBeenCalledWith('influencer_hair_color', expect.any(String), expect.any(Object));
  });

  it('should handle multiple dependencies', () => {
    // Mock rule with multiple dependencies
    vi.mocked(OPTION_RULES).push({
      id: 'multi-dep-rule',
      targetField: 'influencer_eye_color',
      dependsOn: ['influencer_ethnicity', 'influencer_skin_color'],
      type: 'filter',
      condition: () => true,
      action: () => [],
      resetOnChange: true,
    });

    mockWatch
      .mockReturnValueOnce({
        influencer_ethnicity: 'caucasian',
        influencer_skin_color: 'light',
        influencer_eye_color: 'blue',
      })
      .mockReturnValue({
        influencer_ethnicity: 'black',
        influencer_skin_color: 'light',
        influencer_eye_color: 'blue',
      });
    mockGetValues.mockReturnValue({ influencer_eye_color: 'blue' });

    renderHook(() => useAutoReset());

    // Should detect dependency change and potentially reset
    expect(mockSetValue).toHaveBeenCalled();
  });
});
