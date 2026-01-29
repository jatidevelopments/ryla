import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Badge } from './badge';

describe('Badge', () => {
  it('should render badge with children', () => {
    render(<Badge>New</Badge>);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('should apply default variant', () => {
    const { container } = render(<Badge>Test</Badge>);
    const badge = container.querySelector('span');
    expect(badge).toHaveClass('bg-primary');
  });

  it('should apply custom variant', () => {
    const { container } = render(<Badge variant="destructive">Error</Badge>);
    const badge = container.querySelector('span');
    expect(badge).toHaveClass('bg-destructive');
  });

  it('should apply outline variant', () => {
    const { container } = render(<Badge variant="outline">Outline</Badge>);
    const badge = container.querySelector('span');
    expect(badge).toHaveClass('text-foreground');
  });

  it('should apply custom className', () => {
    const { container } = render(<Badge className="custom-class">Test</Badge>);
    const badge = container.querySelector('span');
    expect(badge).toHaveClass('custom-class');
  });

  it('should have data-slot attribute', () => {
    const { container } = render(<Badge>Test</Badge>);
    const badge = container.querySelector('span');
    expect(badge).toHaveAttribute('data-slot', 'badge');
  });

  it('should render as child component when asChild is true', () => {
    render(
      <Badge asChild>
        <a href="/test">Link Badge</a>
      </Badge>
    );
    expect(screen.getByText('Link Badge').tagName).toBe('A');
  });
});
