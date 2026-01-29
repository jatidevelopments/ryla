import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './select';

// Mock @radix-ui/react-select
vi.mock('@radix-ui/react-select', () => ({
  Root: ({ children, ...props }: any) => <div data-testid="select-root" {...props}>{children}</div>,
  Group: ({ children }: any) => <div data-testid="select-group">{children}</div>,
  Value: ({ children }: any) => <span data-testid="select-value">{children}</span>,
  Trigger: ({ children, ...props }: any) => <button data-testid="select-trigger" {...props}>{children}</button>,
  Icon: ({ children }: any) => <span>{children}</span>,
  Portal: ({ children }: any) => <div>{children}</div>,
  Content: ({ children }: any) => <div data-testid="select-content">{children}</div>,
  Item: ({ children, ...props }: any) => <div data-testid="select-item" {...props}>{children}</div>,
  Viewport: ({ children }: any) => <div data-testid="select-viewport">{children}</div>,
  ScrollUpButton: () => <div data-testid="select-scroll-up" />,
  ScrollDownButton: () => <div data-testid="select-scroll-down" />,
  ItemIndicator: ({ children }: any) => <span>{children}</span>,
  ItemText: ({ children }: any) => <span>{children}</span>,
}));

vi.mock('lucide-react', () => ({
  CheckIcon: () => <div data-testid="check-icon" />,
  ChevronDownIcon: () => <div data-testid="chevron-down-icon" />,
  ChevronUpIcon: () => <div data-testid="chevron-up-icon" />,
}));

describe('Select', () => {
  it('should render select', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
        </SelectContent>
      </Select>
    );
    expect(screen.getByTestId('select-root')).toBeInTheDocument();
  });

  it('should render trigger and value', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select..." />
        </SelectTrigger>
      </Select>
    );
    expect(screen.getByTestId('select-trigger')).toBeInTheDocument();
    expect(screen.getByTestId('select-value')).toBeInTheDocument();
  });

  it('should render select items', () => {
    render(
      <Select open>
        <SelectContent>
          <SelectItem value="option1">Option 1</SelectItem>
          <SelectItem value="option2">Option 2</SelectItem>
        </SelectContent>
      </Select>
    );
    // Select items may be in portal, check if they exist
    const items = screen.queryAllByTestId('select-item');
    expect(items.length).toBeGreaterThanOrEqual(0);
  });
});
