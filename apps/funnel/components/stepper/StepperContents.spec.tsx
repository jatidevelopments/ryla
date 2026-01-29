import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import StepperContents from './StepperContents';
import StepperContent from './StepperContent';
import StepperCompleted from './StepperCompleted';
import { StepperContextProvider } from './Stepper.context';

describe('StepperContents', () => {
  it('should render current step content', () => {
    render(
      <StepperContextProvider
        value={0}
        onChange={vi.fn()}
        max={10}
        nextStep={vi.fn()}
        prevStep={vi.fn()}
      >
        <StepperContents>
          <StepperContent>Step 0</StepperContent>
          <StepperContent>Step 1</StepperContent>
        </StepperContents>
      </StepperContextProvider>
    );

    expect(screen.getByText('Step 0')).toBeInTheDocument();
    expect(screen.queryByText('Step 1')).not.toBeInTheDocument();
  });

  it('should render correct step when value changes', () => {
    const { rerender } = render(
      <StepperContextProvider
        value={0}
        onChange={vi.fn()}
        max={10}
        nextStep={vi.fn()}
        prevStep={vi.fn()}
      >
        <StepperContents>
          <StepperContent>Step 0</StepperContent>
          <StepperContent>Step 1</StepperContent>
        </StepperContents>
      </StepperContextProvider>
    );

    expect(screen.getByText('Step 0')).toBeInTheDocument();

    rerender(
      <StepperContextProvider
        value={1}
        onChange={vi.fn()}
        max={10}
        nextStep={vi.fn()}
        prevStep={vi.fn()}
      >
        <StepperContents>
          <StepperContent>Step 0</StepperContent>
          <StepperContent>Step 1</StepperContent>
        </StepperContents>
      </StepperContextProvider>
    );

    expect(screen.getByText('Step 1')).toBeInTheDocument();
  });

  it('should render completed content when value exceeds steps', () => {
    render(
      <StepperContextProvider
        value={5}
        onChange={vi.fn()}
        max={10}
        nextStep={vi.fn()}
        prevStep={vi.fn()}
      >
        <StepperContents>
          <StepperContent>Step 0</StepperContent>
          <StepperContent>Step 1</StepperContent>
          <StepperCompleted>All Done!</StepperCompleted>
        </StepperContents>
      </StepperContextProvider>
    );

    expect(screen.getByText('All Done!')).toBeInTheDocument();
  });

  it('should apply custom className from context', () => {
    const { container } = render(
      <StepperContextProvider
        value={0}
        onChange={vi.fn()}
        max={10}
        nextStep={vi.fn()}
        prevStep={vi.fn()}
        classNames={{ contents: 'custom-contents-class' }}
      >
        <StepperContents>
          <StepperContent>Content</StepperContent>
        </StepperContents>
      </StepperContextProvider>
    );

    const contents = container.querySelector('div');
    expect(contents).toHaveClass('custom-contents-class');
  });
});
