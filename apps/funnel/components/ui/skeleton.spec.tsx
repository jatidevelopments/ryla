import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Skeleton } from './skeleton';

describe('Skeleton', () => {
  it('should render skeleton element', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector('[data-slot="skeleton"]');
    expect(skeleton).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<Skeleton className="custom-class" />);
    const skeleton = container.querySelector('[data-slot="skeleton"]');
    expect(skeleton).toHaveClass('custom-class');
  });

  it('should have animate-pulse class', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector('[data-slot="skeleton"]');
    expect(skeleton).toHaveClass('animate-pulse');
  });

  it('should render children', () => {
    render(<Skeleton>Loading...</Skeleton>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should have data-slot attribute', () => {
    const { container } = render(<Skeleton />);
    const skeleton = container.querySelector('[data-slot="skeleton"]');
    expect(skeleton).toHaveAttribute('data-slot', 'skeleton');
  });
});
