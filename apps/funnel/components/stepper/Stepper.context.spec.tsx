import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StepperContextProvider, useStepperContext, StepperContext } from './Stepper.context';

describe('StepperContext', () => {
  it('should provide context values', () => {
    const TestComponent = () => {
      const context = useStepperContext();
      return <div>{context.value}</div>;
    };

    render(
      <StepperContextProvider
        value={2}
        onChange={vi.fn()}
        max={10}
        nextStep={vi.fn()}
        prevStep={vi.fn()}
      >
        <TestComponent />
      </StepperContextProvider>
    );

    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should throw error when used outside provider', () => {
    const TestComponent = () => {
      try {
        useStepperContext();
        return <div>No error</div>;
      } catch (error: any) {
        return <div>{error.message}</div>;
      }
    };

    render(<TestComponent />);
    expect(screen.getByText(/useStepperContext must be used within/i)).toBeInTheDocument();
  });

  it('should provide all context methods', () => {
    const mockOnChange = vi.fn();
    const mockNextStep = vi.fn();
    const mockPrevStep = vi.fn();

    const TestComponent = () => {
      const context = useStepperContext();
      return (
        <div>
          <button onClick={() => context.onChange(5)}>Change</button>
          <button onClick={context.nextStep}>Next</button>
          <button onClick={context.prevStep}>Prev</button>
        </div>
      );
    };

    render(
      <StepperContextProvider
        value={2}
        onChange={mockOnChange}
        max={10}
        nextStep={mockNextStep}
        prevStep={mockPrevStep}
      >
        <TestComponent />
      </StepperContextProvider>
    );

    const changeBtn = screen.getByText('Change');
    const nextBtn = screen.getByText('Next');
    const prevBtn = screen.getByText('Prev');

    changeBtn.click();
    nextBtn.click();
    prevBtn.click();

    expect(mockOnChange).toHaveBeenCalledWith(5);
    expect(mockNextStep).toHaveBeenCalled();
    expect(mockPrevStep).toHaveBeenCalled();
  });
});
