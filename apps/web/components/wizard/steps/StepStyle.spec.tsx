import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StepStyle } from './StepStyle';
import { useCharacterWizardStore } from '@ryla/business';

// Mock business store
vi.mock('@ryla/business', () => ({
  useCharacterWizardStore: vi.fn(),
}));

// Mock UI
vi.mock('@ryla/ui', () => ({
  cn: (...inputs: any[]) => inputs.filter(Boolean).join(' '),
}));

describe('StepStyle', () => {
  const mockSetField = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useCharacterWizardStore as any).mockImplementation((selector: any) => {
      const state = {
        form: { gender: 'female', style: 'realistic' },
        setField: mockSetField,
      };
      return selector(state);
    });
  });

  it('should render gender and style options', () => {
    render(<StepStyle />);

    expect(screen.getAllByText('Female').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Male').length).toBeGreaterThan(0);
    expect(screen.getByText('Realistic')).toBeInTheDocument();
    expect(screen.getByText('Anime')).toBeInTheDocument();
  });

  it('should handle gender selection', () => {
    // Changing gender should call setField if not disabled
    (useCharacterWizardStore as any).mockImplementation((selector: any) => {
      const state = {
        form: { gender: undefined, style: 'realistic' },
        setField: mockSetField,
      };
      return selector(state);
    });

    render(<StepStyle />);
    fireEvent.click(screen.getAllByText('Female')[0]);
    expect(mockSetField).toHaveBeenCalledWith('gender', 'female');
  });

  it('should handle style selection', () => {
    // Style selection
    (useCharacterWizardStore as any).mockImplementation((selector: any) => {
      const state = {
        form: { gender: 'female', style: undefined },
        setField: mockSetField,
      };
      return selector(state);
    });

    render(<StepStyle />);
    fireEvent.click(screen.getByText('Realistic'));
    expect(mockSetField).toHaveBeenCalledWith('style', 'realistic');
  });
});
