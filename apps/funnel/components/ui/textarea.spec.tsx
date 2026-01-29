import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Textarea } from './textarea';

describe('Textarea', () => {
  it('should render textarea element', () => {
    render(<Textarea />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<Textarea className="custom-class" />);
    const textarea = container.querySelector('textarea');
    expect(textarea).toHaveClass('custom-class');
  });

  it('should handle value changes', () => {
    const handleChange = vi.fn();
    render(<Textarea onChange={handleChange} />);
    
    const textarea = screen.getByRole('textbox');
    fireEvent.change(textarea, { target: { value: 'test text' } });
    
    expect(handleChange).toHaveBeenCalled();
  });

  it('should support placeholder', () => {
    render(<Textarea placeholder="Enter description" />);
    const textarea = screen.getByPlaceholderText('Enter description');
    expect(textarea).toBeInTheDocument();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Textarea disabled />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeDisabled();
  });

  it('should have data-slot attribute', () => {
    const { container } = render(<Textarea />);
    const textarea = container.querySelector('textarea');
    expect(textarea).toHaveAttribute('data-slot', 'textarea');
  });

  it('should support rows attribute', () => {
    render(<Textarea rows={5} />);
    const textarea = screen.getByRole('textbox');
    expect(textarea).toHaveAttribute('rows', '5');
  });
});
