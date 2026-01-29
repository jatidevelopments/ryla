import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ScrollProgress } from './scroll-progress';

// Mock framer-motion
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  useScroll: () => ({ scrollYProgress: { value: 0 } }),
}));

describe('ScrollProgress', () => {
  it('should render scroll progress', () => {
    const { container } = render(<ScrollProgress />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<ScrollProgress className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should have fixed positioning', () => {
    const { container } = render(<ScrollProgress />);
    expect(container.firstChild).toHaveClass('fixed');
  });
});
