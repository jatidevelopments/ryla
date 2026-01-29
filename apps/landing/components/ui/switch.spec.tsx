import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Switch } from './switch';

// Mock @radix-ui/react-switch
vi.mock('@radix-ui/react-switch', () => {
  const React = require('react');
  return {
    Root: React.forwardRef(({ children, checked, onCheckedChange, ...props }: any, ref: any) => (
      <button 
        ref={ref} 
        {...props} 
        data-testid="switch" 
        role="switch"
        data-state={checked ? 'checked' : 'unchecked'}
        aria-checked={checked}
        onClick={() => onCheckedChange && onCheckedChange(!checked)}
      >
        {children}
      </button>
    )),
    Thumb: ({ ...props }: any) => <span data-testid="switch-thumb" {...props} />,
  };
});

describe('Switch', () => {
  it('should render switch', () => {
    render(<Switch />);
    expect(screen.getByTestId('switch')).toBeInTheDocument();
  });

  it('should be checked when checked prop is true', () => {
    render(<Switch checked />);
    const switchElement = screen.getByTestId('switch');
    // Switch uses data-state="checked" attribute
    expect(switchElement.getAttribute('data-state')).toBe('checked');
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Switch disabled />);
    expect(screen.getByTestId('switch')).toBeDisabled();
  });

  it('should handle click events', async () => {
    const handleCheckedChange = vi.fn();
    const user = userEvent.setup();
    render(<Switch onCheckedChange={handleCheckedChange} />);
    
    const switchElement = screen.getByTestId('switch');
    await user.click(switchElement);
    // onCheckedChange should be called with the new checked state
    expect(handleCheckedChange).toHaveBeenCalled();
  });

  it('should render thumb', () => {
    render(<Switch />);
    expect(screen.getByTestId('switch-thumb')).toBeInTheDocument();
  });
});
