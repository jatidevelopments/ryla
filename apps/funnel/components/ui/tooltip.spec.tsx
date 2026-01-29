import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './tooltip';

vi.mock('@radix-ui/react-tooltip', () => ({
  Provider: ({ children, ...props }: any) => <div data-testid="tooltip-provider" {...props}>{children}</div>,
  Root: ({ children, ...props }: any) => <div data-testid="tooltip-root" {...props}>{children}</div>,
  Trigger: ({ children, ...props }: any) => <button data-testid="tooltip-trigger" {...props}>{children}</button>,
  Content: ({ children, ...props }: any) => <div data-testid="tooltip-content" {...props}>{children}</div>,
  Portal: ({ children }: any) => <>{children}</>,
  Arrow: (props: any) => <div data-testid="tooltip-arrow" {...props} />,
}));

describe('Tooltip', () => {
  it('should render TooltipProvider', () => {
    render(<TooltipProvider />);
    expect(screen.getByTestId('tooltip-provider')).toBeInTheDocument();
  });

  it('should render Tooltip with provider', () => {
    render(
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent>Tooltip content</TooltipContent>
      </Tooltip>
    );
    expect(screen.getByTestId('tooltip-provider')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip-root')).toBeInTheDocument();
  });

  it('should render TooltipTrigger', () => {
    render(<TooltipTrigger>Trigger</TooltipTrigger>);
    expect(screen.getByTestId('tooltip-trigger')).toBeInTheDocument();
    expect(screen.getByText('Trigger')).toBeInTheDocument();
  });

  it('should render TooltipContent', () => {
    render(<TooltipContent>Tooltip text</TooltipContent>);
    expect(screen.getByTestId('tooltip-content')).toBeInTheDocument();
    expect(screen.getByText('Tooltip text')).toBeInTheDocument();
  });

  it('should apply custom className to TooltipContent', () => {
    const { container } = render(
      <TooltipContent className="custom-class">Content</TooltipContent>
    );
    const content = container.querySelector('[data-slot="tooltip-content"]');
    expect(content).toHaveClass('custom-class');
  });
});
