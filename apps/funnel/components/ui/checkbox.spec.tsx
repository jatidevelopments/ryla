import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Checkbox } from './checkbox';

describe('Checkbox', () => {
  it('should render checkbox element', () => {
    render(<Checkbox />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<Checkbox className="custom-class" />);
    const checkbox = container.querySelector('[role="checkbox"]');
    expect(checkbox).toHaveClass('custom-class');
  });

  it('should handle checked state', () => {
    render(<Checkbox checked={true} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('data-state', 'checked');
  });

  it('should handle unchecked state', () => {
    render(<Checkbox checked={false} />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toHaveAttribute('data-state', 'unchecked');
  });

  it('should call onCheckedChange when clicked', () => {
    const handleChange = vi.fn();
    render(<Checkbox onCheckedChange={handleChange} />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Checkbox disabled />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
  });

  it('should have data-slot attribute', () => {
    const { container } = render(<Checkbox />);
    const checkbox = container.querySelector('[role="checkbox"]');
    expect(checkbox).toHaveAttribute('data-slot', 'checkbox');
  });
});
