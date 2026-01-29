import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BlurFade } from './blur-fade';

// Mock framer-motion
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useInView: () => true,
}));

describe('BlurFade', () => {
  it('should render children', () => {
    render(
      <BlurFade>
        <div>Test Content</div>
      </BlurFade>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <BlurFade className="custom-class">
        <div>Test</div>
      </BlurFade>
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should handle direction prop', () => {
    const { container } = render(
      <BlurFade direction="up">
        <div>Test</div>
      </BlurFade>
    );
    expect(container.firstChild).toBeInTheDocument();
  });
});
