import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Separator } from './separator';

// Mock @radix-ui/react-separator
vi.mock('@radix-ui/react-separator', () => ({
  Root: ({ ...props }: any) => <hr data-testid="separator" {...props} />,
}));

describe('Separator', () => {
  it('should render separator', () => {
    const { container } = render(<Separator />);
    expect(container.querySelector('[data-testid="separator"]')).toBeInTheDocument();
  });

  it('should have horizontal orientation by default', () => {
    const { container } = render(<Separator />);
    const separator = container.querySelector('[data-testid="separator"]');
    expect(separator).toHaveAttribute('orientation', 'horizontal');
  });

  it('should have vertical orientation when specified', () => {
    const { container } = render(<Separator orientation="vertical" />);
    const separator = container.querySelector('[data-testid="separator"]');
    expect(separator).toHaveAttribute('orientation', 'vertical');
  });

  it('should apply custom className', () => {
    const { container } = render(<Separator className="custom-class" />);
    expect(container.querySelector('[data-testid="separator"]')).toHaveClass('custom-class');
  });
});
