import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Stepper from './index';
import { StepperContextProvider } from './Stepper.context';

vi.mock('./Stepper.context', () => ({
  StepperContextProvider: ({ children, ...props }: any) => (
    <div data-testid="stepper-context-provider" {...props}>{children}</div>
  ),
}));

vi.mock('./StepperContent', () => ({
  default: ({ children }: any) => <div data-testid="stepper-content">{children}</div>,
}));

vi.mock('./StepperContents', () => ({
  default: ({ children }: any) => <div data-testid="stepper-contents">{children}</div>,
}));

vi.mock('./StepperCompleted', () => ({
  default: ({ children }: any) => <div data-testid="stepper-completed">{children}</div>,
}));

vi.mock('./StepperProgress', () => ({
  default: () => <div data-testid="stepper-progress" />,
}));

describe('Stepper', () => {
  it('should render Stepper component', () => {
    render(
      <Stepper>
        <div>Content</div>
      </Stepper>
    );
    
    expect(screen.getByTestId('stepper-context-provider')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should render Stepper.Content', () => {
    render(
      <Stepper.Content>
        <div>Step Content</div>
      </Stepper.Content>
    );
    
    expect(screen.getByTestId('stepper-content')).toBeInTheDocument();
  });

  it('should render Stepper.Contents', () => {
    render(
      <Stepper.Contents>
        <div>Step Contents</div>
      </Stepper.Contents>
    );
    
    expect(screen.getByTestId('stepper-contents')).toBeInTheDocument();
  });

  it('should render Stepper.Completed', () => {
    render(
      <Stepper.Completed>
        <div>Completed</div>
      </Stepper.Completed>
    );
    
    expect(screen.getByTestId('stepper-completed')).toBeInTheDocument();
  });

  it('should render Stepper.Progress', () => {
    render(<Stepper.Progress />);
    expect(screen.getByTestId('stepper-progress')).toBeInTheDocument();
  });

  it('should apply custom classNames', () => {
    const { container } = render(
      <Stepper classNames={{ root: 'custom-root' }}>
        <div>Content</div>
      </Stepper>
    );
    
    const root = container.firstChild as HTMLElement;
    expect(root).toHaveClass('custom-root');
  });
});
