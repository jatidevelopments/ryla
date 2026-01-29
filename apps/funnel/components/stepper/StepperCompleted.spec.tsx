import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import StepperCompleted from './StepperCompleted';
import { StepperContextProvider } from './Stepper.context';

describe('StepperCompleted', () => {
  it('should render children', () => {
    render(
      <StepperContextProvider
        value={0}
        onChange={vi.fn()}
        max={10}
        nextStep={vi.fn()}
        prevStep={vi.fn()}
      >
        <StepperCompleted>
          <div>Completed Content</div>
        </StepperCompleted>
      </StepperContextProvider>
    );

    expect(screen.getByText('Completed Content')).toBeInTheDocument();
  });

  it('should apply custom className from context', () => {
    const { container } = render(
      <StepperContextProvider
        value={0}
        onChange={vi.fn()}
        max={10}
        nextStep={vi.fn()}
        prevStep={vi.fn()}
        classNames={{ completed: 'custom-completed-class' }}
      >
        <StepperCompleted>
          <div>Content</div>
        </StepperCompleted>
      </StepperContextProvider>
    );

    const completed = container.querySelector('div');
    expect(completed).toHaveClass('custom-completed-class');
  });
});
