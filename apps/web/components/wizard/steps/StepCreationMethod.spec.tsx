import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StepCreationMethod } from './StepCreationMethod';
import { useRouter } from 'next/navigation';
import { useCharacterWizardStore } from '@ryla/business';

// Mock Hooks
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@ryla/business', () => ({
  useCharacterWizardStore: vi.fn(),
}));

// Mock UI
vi.mock('@ryla/ui', () => ({
  cn: (...inputs: any[]) => inputs.filter(Boolean).join(' '),
}));

describe('StepCreationMethod', () => {
  const mockRouter = { push: vi.fn() };
  const mockSetField = vi.fn();
  const mockUpdateSteps = vi.fn();
  const mockNextStep = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue(mockRouter);
    (useCharacterWizardStore as any).mockImplementation((selector: any) => {
      const state = {
        form: { creationMethod: 'presets' },
        setField: mockSetField,
        updateSteps: mockUpdateSteps,
        nextStep: mockNextStep,
      };
      return selector(state);
    });
  });

  it('should render all creation methods', () => {
    render(<StepCreationMethod />);

    expect(screen.getByText('Create with Presets')).toBeInTheDocument();
    expect(screen.getByText('Create with Prompt')).toBeInTheDocument();
    expect(screen.getByText('Create from Existing Person')).toBeInTheDocument();
  });

  it('should handle selecting presets method', () => {
    render(<StepCreationMethod />);

    fireEvent.click(screen.getByText('Create with Presets'));

    expect(mockSetField).toHaveBeenCalledWith('creationMethod', 'presets');
    expect(mockUpdateSteps).toHaveBeenCalledWith('presets');
    expect(mockNextStep).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith('/wizard/step-1');
  });

  it('should handle selecting prompt-based method', () => {
    render(<StepCreationMethod />);

    fireEvent.click(screen.getByText('Create with Prompt'));

    expect(mockSetField).toHaveBeenCalledWith('creationMethod', 'prompt-based');
    expect(mockUpdateSteps).toHaveBeenCalledWith('prompt-based');
    expect(mockNextStep).toHaveBeenCalled();
  });

  it('should handle selecting existing-person method', () => {
    render(<StepCreationMethod />);

    fireEvent.click(screen.getByText('Create from Existing Person'));

    expect(mockSetField).toHaveBeenCalledWith(
      'creationMethod',
      'existing-person'
    );
    expect(mockUpdateSteps).toHaveBeenCalledWith('existing-person');
  });
});
