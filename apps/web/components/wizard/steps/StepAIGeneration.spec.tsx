import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { StepAIGeneration } from './StepAIGeneration';
import { useRouter } from 'next/navigation';
import { useCharacterWizardStore } from '@ryla/business';

// Mock hooks
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@ryla/business', () => ({
  useCharacterWizardStore: vi.fn(),
}));

describe('StepAIGeneration', () => {
  const mockRouter = { push: vi.fn() };
  const mockSetField = vi.fn();
  const mockNextStep = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock setup
    (useRouter as any).mockReturnValue(mockRouter);
    (useCharacterWizardStore as any).mockImplementation((selector: any) => {
      const state = {
        setField: mockSetField,
        nextStep: mockNextStep,
      };
      return selector(state);
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('should render loading state initially', () => {
    render(<StepAIGeneration />);
    expect(
      screen.getByText(/AI is Creating Your Influencer/i)
    ).toBeInTheDocument();
  });

  it('should progress and complete generation immediately', async () => {
    // Stub setInterval to execute 20 times immediately to reach 100%
    // Mock random to be high enough
    vi.spyOn(Math, 'random').mockReturnValue(0.9);

    vi.stubGlobal(
      'setInterval',
      vi.fn((cb) => {
        // Call it multiple times inside act or separate acts?
        // Let's try many calls to be sure
        for (let i = 0; i < 30; i++) {
          act(() => {
            cb();
          });
        }
        return 123;
      })
    );

    render(<StepAIGeneration />);

    // It should be complete immediately
    expect(
      await screen.findByText(/Generation Complete!/i)
    ).toBeInTheDocument();
    expect(mockSetField).toHaveBeenCalledWith(
      'aiGeneratedConfig',
      expect.any(Object)
    );
  });

  it('should handle continue after completion', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9);
    vi.stubGlobal(
      'setInterval',
      vi.fn((cb) => {
        for (let i = 0; i < 30; i++) {
          act(() => {
            cb();
          });
        }
        return 123;
      })
    );

    render(<StepAIGeneration />);

    const btn = await screen.findByText(/Review & Continue/i);
    fireEvent.click(btn);

    expect(mockNextStep).toHaveBeenCalled();
    expect(mockRouter.push).toHaveBeenCalledWith('/wizard/step-3');
  });
});
