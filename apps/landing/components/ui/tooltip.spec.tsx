import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './tooltip';

// Mock @radix-ui/react-tooltip
vi.mock('@radix-ui/react-tooltip', () => ({
  Provider: ({ children, ...props }: any) => <div data-testid="tooltip-provider" {...props}>{children}</div>,
  Root: ({ children, ...props }: any) => <div data-testid="tooltip-root" {...props}>{children}</div>,
  Trigger: ({ children, ...props }: any) => <button data-testid="tooltip-trigger" {...props}>{children}</button>,
  Portal: ({ children }: any) => <div data-testid="tooltip-portal">{children}</div>,
  Content: ({ children, ...props }: any) => <div data-testid="tooltip-content" {...props}>{children}</div>,
  Arrow: () => <div data-testid="tooltip-arrow" />,
}));

describe('Tooltip', () => {
  it('should render tooltip', () => {
    render(
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent>Tooltip text</TooltipContent>
      </Tooltip>
    );
    // Tooltip wraps Root in Provider, so provider should exist
    expect(screen.getByTestId('tooltip-provider')).toBeInTheDocument();
    // Root should also exist inside provider
    expect(screen.getByTestId('tooltip-root')).toBeInTheDocument();
  });

  it('should render tooltip trigger', () => {
    render(
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
      </Tooltip>
    );
    expect(screen.getByTestId('tooltip-trigger')).toBeInTheDocument();
    expect(screen.getByText('Hover me')).toBeInTheDocument();
  });

  it('should render tooltip content when open', () => {
    render(
      <Tooltip open>
        <TooltipTrigger>Trigger</TooltipTrigger>
        <TooltipContent>Tooltip text</TooltipContent>
      </Tooltip>
    );
    // Tooltip content is in portal, should be accessible
    const content = screen.queryByTestId('tooltip-content');
    // Content should exist when open
    expect(content).toBeInTheDocument();
    expect(screen.getByText('Tooltip text')).toBeInTheDocument();
  });

  it('should render tooltip provider', () => {
    render(
      <TooltipProvider>
        <div>Test</div>
      </TooltipProvider>
    );
    expect(screen.getByTestId('tooltip-provider')).toBeInTheDocument();
  });
});
