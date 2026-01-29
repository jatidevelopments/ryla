import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { useRef } from 'react';
import { AnimatedBeam } from './animated-beam';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    path: ({ ...props }: any) => <path {...props} />,
  },
}));

describe('AnimatedBeam', () => {
  it('should render component', () => {
    const TestComponent = () => {
      const containerRef = useRef<HTMLDivElement>(null);
      const fromRef = useRef<HTMLDivElement>(null);
      const toRef = useRef<HTMLDivElement>(null);
      
      return (
        <div ref={containerRef}>
          <div ref={fromRef}>From</div>
          <div ref={toRef}>To</div>
          <AnimatedBeam
            containerRef={containerRef}
            fromRef={fromRef}
            toRef={toRef}
          />
        </div>
      );
    };
    
    const { container } = render(<TestComponent />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
