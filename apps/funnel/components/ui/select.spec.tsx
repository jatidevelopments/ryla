import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectGroup,
  SelectSeparator,
} from './select';

vi.mock('@radix-ui/react-select', () => ({
  Root: ({ children, ...props }: any) => <div data-testid="select-root" {...props}>{children}</div>,
  Trigger: ({ children, ...props }: any) => <button data-testid="select-trigger" {...props}>{children}</button>,
  Value: (props: any) => <span data-testid="select-value" {...props} />,
  Content: ({ children, ...props }: any) => <div data-testid="select-content" {...props}>{children}</div>,
  Item: ({ children, ...props }: any) => <div data-testid="select-item" {...props}>{children}</div>,
  Label: (props: any) => <div data-testid="select-label" {...props} />,
  Group: ({ children, ...props }: any) => <div data-testid="select-group" {...props}>{children}</div>,
  Separator: (props: any) => <div data-testid="select-separator" {...props} />,
  Icon: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  Portal: ({ children }: any) => <>{children}</>,
  Viewport: ({ children, ...props }: any) => <div data-testid="select-viewport" {...props}>{children}</div>,
  ScrollUpButton: (props: any) => <div data-testid="select-scroll-up" {...props} />,
  ScrollDownButton: (props: any) => <div data-testid="select-scroll-down" {...props} />,
  ItemIndicator: ({ children }: any) => <span>{children}</span>,
  ItemText: ({ children }: any) => <span>{children}</span>,
}));

describe('Select', () => {
  it('should render Select root', () => {
    render(<Select />);
    expect(screen.getByTestId('select-root')).toBeInTheDocument();
  });

  it('should render SelectTrigger with size', () => {
    const { container } = render(
      <SelectTrigger size="sm">
        <SelectValue />
      </SelectTrigger>
    );
    const trigger = container.querySelector('[data-slot="select-trigger"]');
    expect(trigger).toHaveAttribute('data-size', 'sm');
  });

  it('should render SelectValue', () => {
    render(<SelectValue placeholder="Select..." />);
    expect(screen.getByTestId('select-value')).toBeInTheDocument();
  });

  it('should render SelectContent', () => {
    render(
      <SelectContent>
        <SelectItem value="test">Test</SelectItem>
      </SelectContent>
    );
    expect(screen.getByTestId('select-content')).toBeInTheDocument();
  });

  it('should render SelectItem', () => {
    render(<SelectItem value="test">Test Item</SelectItem>);
    expect(screen.getByTestId('select-item')).toBeInTheDocument();
    expect(screen.getByText('Test Item')).toBeInTheDocument();
  });

  it('should render SelectLabel', () => {
    render(<SelectLabel>Label</SelectLabel>);
    expect(screen.getByTestId('select-label')).toBeInTheDocument();
    expect(screen.getByText('Label')).toBeInTheDocument();
  });

  it('should render SelectGroup', () => {
    render(
      <SelectGroup>
        <SelectItem value="test">Test</SelectItem>
      </SelectGroup>
    );
    expect(screen.getByTestId('select-group')).toBeInTheDocument();
  });

  it('should render SelectSeparator', () => {
    render(<SelectSeparator />);
    expect(screen.getByTestId('select-separator')).toBeInTheDocument();
  });
});
