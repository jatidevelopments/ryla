import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Checkbox } from './checkbox';

// Mock @radix-ui/react-checkbox
vi.mock('@radix-ui/react-checkbox', () => {
  const React = require('react');
  return {
    Root: React.forwardRef(({ children, ...props }: any, ref: any) => (
      <input type="checkbox" ref={ref} {...props} data-testid="checkbox" />
    )),
    Indicator: ({ children }: any) => <span data-testid="checkbox-indicator">{children}</span>,
  };
});

vi.mock('lucide-react', () => ({
  Check: () => <div data-testid="check-icon" />,
}));

describe('Checkbox', () => {
  it('should render checkbox', () => {
    render(<Checkbox />);
    expect(screen.getByTestId('checkbox')).toBeInTheDocument();
  });

  it('should be checked when checked prop is true', () => {
    render(<Checkbox checked />);
    expect(screen.getByTestId('checkbox')).toBeChecked();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Checkbox disabled />);
    expect(screen.getByTestId('checkbox')).toBeDisabled();
  });

  it('should handle click events', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<Checkbox onChange={handleChange} />);
    
    await user.click(screen.getByTestId('checkbox'));
    expect(handleChange).toHaveBeenCalled();
  });
});
