import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CustomInput from './CustomInput';

describe('CustomInput', () => {
  it('should render input with value', () => {
    render(
      <CustomInput
        value="test value"
        onChange={vi.fn()}
        type="text"
      />
    );

    const input = screen.getByDisplayValue('test value');
    expect(input).toBeInTheDocument();
  });

  it('should call onChange when input changes', () => {
    const handleChange = vi.fn();
    render(
      <CustomInput
        value=""
        onChange={handleChange}
        type="text"
      />
    );

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'new value' } });

    expect(handleChange).toHaveBeenCalled();
  });

  it('should show error state', () => {
    render(
      <CustomInput
        value=""
        onChange={vi.fn()}
        type="text"
        isError="Error message"
      />
    );

    const container = screen.getByRole('textbox').closest('div');
    expect(container).toHaveClass('border-pink-red');
  });

  it('should show success state', () => {
    render(
      <CustomInput
        value=""
        onChange={vi.fn()}
        type="text"
        isSuccess={true}
      />
    );

    const container = screen.getByRole('textbox').closest('div');
    expect(container).toHaveClass('border-salad-green');
  });

  it('should show reset button when error', () => {
    const handleReset = vi.fn();
    const { container } = render(
      <CustomInput
        value=""
        onChange={vi.fn()}
        type="text"
        isError="Error message"
        resetInput={handleReset}
      />
    );

    // The reset is an X icon (lucide-react X component) inside a clickable div
    // The onClick is on the X component, so we need to find the SVG or its parent
    const resetContainer = container.querySelector('.cursor-pointer');
    expect(resetContainer).toBeInTheDocument();
    
    // The X icon renders as an SVG - find it and click
    const svg = resetContainer?.querySelector('svg');
    if (svg) {
      // Click the SVG or its parent container
      fireEvent.click(svg);
      expect(handleReset).toHaveBeenCalled();
    } else {
      // Fallback: click the container itself
      fireEvent.click(resetContainer!);
      expect(handleReset).toHaveBeenCalled();
    }
  });

  it('should display icon when provided', () => {
    render(
      <CustomInput
        value=""
        onChange={vi.fn()}
        type="text"
        icon={<span data-testid="icon">Icon</span>}
      />
    );

    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('should call invalidateInputState when isSuccess changes', () => {
    const handleInvalidate = vi.fn();
    const { rerender } = render(
      <CustomInput
        value=""
        onChange={vi.fn()}
        type="text"
        isSuccess={false}
        invalidateInputState={handleInvalidate}
      />
    );

    rerender(
      <CustomInput
        value=""
        onChange={vi.fn()}
        type="text"
        isSuccess={true}
        invalidateInputState={handleInvalidate}
      />
    );

    expect(handleInvalidate).toHaveBeenCalledWith(true);
  });
});
