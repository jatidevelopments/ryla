import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import StepperProgress from './StepperProgress';
import { StepperContextProvider } from './Stepper.context';

describe('StepperProgress', () => {
  it('should render progress bar', () => {
    render(
      <StepperContextProvider
        value={5}
        onChange={vi.fn()}
        max={10}
        nextStep={vi.fn()}
        prevStep={vi.fn()}
      >
        <StepperProgress />
      </StepperContextProvider>
    );

    const progress = screen.getByRole('progressbar');
    expect(progress).toBeInTheDocument();
  });

  it('should calculate progress percentage correctly', () => {
    render(
      <StepperContextProvider
        value={5}
        onChange={vi.fn()}
        max={10}
        nextStep={vi.fn()}
        prevStep={vi.fn()}
      >
        <StepperProgress />
      </StepperContextProvider>
    );

    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuenow', '50');
  });

  it('should call prevStep when back button clicked', () => {
    const mockPrevStep = vi.fn();
    render(
      <StepperContextProvider
        value={5}
        onChange={vi.fn()}
        max={10}
        nextStep={vi.fn()}
        prevStep={mockPrevStep}
      >
        <StepperProgress />
      </StepperContextProvider>
    );

    const backButton = screen.getByRole('button');
    fireEvent.click(backButton);

    expect(mockPrevStep).toHaveBeenCalled();
  });

  it('should display progress text', () => {
    render(
      <StepperContextProvider
        value={5}
        onChange={vi.fn()}
        max={10}
        nextStep={vi.fn()}
        prevStep={vi.fn()}
      >
        <StepperProgress />
      </StepperContextProvider>
    );

    expect(screen.getByText(/Create your AI influencer/i)).toBeInTheDocument();
  });

  it('should show 0% when value is 0', () => {
    render(
      <StepperContextProvider
        value={0}
        onChange={vi.fn()}
        max={10}
        nextStep={vi.fn()}
        prevStep={vi.fn()}
      >
        <StepperProgress />
      </StepperContextProvider>
    );

    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuenow', '0');
  });

  it('should show 100% when value equals max', () => {
    render(
      <StepperContextProvider
        value={10}
        onChange={vi.fn()}
        max={10}
        nextStep={vi.fn()}
        prevStep={vi.fn()}
      >
        <StepperProgress />
      </StepperContextProvider>
    );

    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuenow', '100');
  });
});
