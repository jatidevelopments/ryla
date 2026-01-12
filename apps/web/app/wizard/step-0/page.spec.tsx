import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WizardStep0 from './page';

// Mock dependencies
const mockSetStep = vi.fn();
const mockSetField = vi.fn();
const mockUpdateSteps = vi.fn();
const mockNextStep = vi.fn();

vi.mock('@ryla/business', () => ({
  useCharacterWizardStore: (selector: any) => {
    const store = {
      setStep: mockSetStep,
      form: { creationMethod: 'presets' },
      setField: mockSetField,
      updateSteps: mockUpdateSteps,
      nextStep: mockNextStep,
    };
    return selector(store);
  },
}));

const mockPush = vi.fn();
const mockReplaceState = vi.fn();
const mockSearchParams = vi.fn(() => new URLSearchParams());

// Mock global window history
Object.defineProperty(window, 'history', {
  value: { replaceState: mockReplaceState },
  writable: true,
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
  useSearchParams: () => mockSearchParams(),
}));

// Mock StepCreationMethod if we want to isolate, but let's test integration
// by NOT mocking it completely, or just testing that the page renders it.
// However, StepCreationMethod has imports. Ideally we should test Page + Component integration
// or test them separately. Given `StepCreationMethod` is in the page, let's test the interaction flow.
// But StepCreationMethod imports `cn` and `FEATURE_CREDITS`.
vi.mock('@ryla/ui', () => ({
  cn: (...args: any[]) => args.join(' '),
}));

vi.mock('@ryla/shared', () => ({
  FEATURE_CREDITS: { base_images: { credits: 80 } },
}));

describe('WizardStep0', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchParams.mockReturnValue(new URLSearchParams());
  });

  it('should initialize step on mount', () => {
    render(<WizardStep0 />);
    expect(mockSetStep).toHaveBeenCalledWith(0);
  });

  it('should render creation method options', () => {
    render(<WizardStep0 />);
    expect(screen.getByText('Create with Presets')).toBeInTheDocument();
    expect(screen.getByText('Create with Prompt')).toBeInTheDocument();
    expect(screen.getByText('Create from Existing Person')).toBeInTheDocument();
  });

  it('should show success message if request-submitted param is present', async () => {
    mockSearchParams.mockReturnValue(
      new URLSearchParams('request-submitted=true')
    );

    render(<WizardStep0 />);

    // Message rendering might be async due to setTimeout
    await waitFor(() => {
      expect(
        screen.getByText('Request Submitted Successfully!')
      ).toBeInTheDocument();
    });
  });

  it('should handle method selection', () => {
    mockSearchParams.mockReturnValue(new URLSearchParams());

    render(<WizardStep0 />);

    // Click 'Create with Prompt'
    fireEvent.click(screen.getByText('Create with Prompt'));

    expect(mockSetField).toHaveBeenCalledWith('creationMethod', 'prompt-based');
    expect(mockUpdateSteps).toHaveBeenCalledWith('prompt-based');
    expect(mockNextStep).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith('/wizard/step-1');
  });
});
