import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import StepperContent from './StepperContent';
import { StepperContextProvider } from './Stepper.context';

describe('StepperContent', () => {
  it('should render children', () => {
    render(
      <StepperContextProvider
        value={0}
        onChange={vi.fn()}
        max={10}
        nextStep={vi.fn()}
        prevStep={vi.fn()}
      >
        <StepperContent>
          <div>Step Content</div>
        </StepperContent>
      </StepperContextProvider>
    );

    expect(screen.getByText('Step Content')).toBeInTheDocument();
  });

  it('should apply custom className from context', () => {
    const { container } = render(
      <StepperContextProvider
        value={0}
        onChange={vi.fn()}
        max={10}
        nextStep={vi.fn()}
        prevStep={vi.fn()}
        classNames={{ content: 'custom-content-class' }}
      >
        <StepperContent>
          <div>Content</div>
        </StepperContent>
      </StepperContextProvider>
    );

    const content = container.querySelector('div');
    expect(content).toHaveClass('custom-content-class');
  });
});
