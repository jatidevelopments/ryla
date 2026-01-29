import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Progress } from './progress';

describe('Progress', () => {
  it('should render progress element', () => {
    render(<Progress value={50} />);
    const progress = screen.getByRole('progressbar');
    expect(progress).toBeInTheDocument();
  });

  it('should set value attribute', () => {
    render(<Progress value={75} />);
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuenow', '75');
  });

  it('should apply custom className', () => {
    const { container } = render(<Progress value={50} className="custom-class" />);
    const progress = container.querySelector('[role="progressbar"]');
    expect(progress).toHaveClass('custom-class');
  });

  it('should handle max value', () => {
    render(<Progress value={50} max={100} />);
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuemax', '100');
  });

  it('should default to 100 max', () => {
    render(<Progress value={50} />);
    const progress = screen.getByRole('progressbar');
    expect(progress).toHaveAttribute('aria-valuemax', '100');
  });
});
