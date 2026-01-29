import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './badge';

// Mock @radix-ui/react-slot
vi.mock('@radix-ui/react-slot', () => ({
  Slot: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

describe('Badge', () => {
  it('should render badge', () => {
    render(<Badge>Badge</Badge>);
    expect(screen.getByText('Badge')).toBeInTheDocument();
  });

  it('should apply variant classes', () => {
    const { container } = render(<Badge variant="secondary">Badge</Badge>);
    expect(container.firstChild).toHaveClass('bg-secondary');
  });

  it('should apply custom className', () => {
    const { container } = render(<Badge className="custom">Badge</Badge>);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('should render as child component when asChild is true', () => {
    render(
      <Badge asChild>
        <a href="/test">Link Badge</a>
      </Badge>
    );
    expect(screen.getByRole('link')).toBeInTheDocument();
  });
});
