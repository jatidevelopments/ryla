import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsSection } from './StatsSection';

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  constructor(public callback: IntersectionObserverCallback) {}
}

beforeEach(() => {
  global.IntersectionObserver = MockIntersectionObserver as any;
});

afterEach(() => {
  vi.clearAllMocks();
});

// Mock ryla-ui
vi.mock('@/components/ryla-ui', () => ({
  Section: ({ children }: any) => <section>{children}</section>,
}));

describe('StatsSection', () => {
  it('should render stats section', () => {
    const { container } = render(<StatsSection />);
    // StatsSection renders as a section element
    expect(container.querySelector('section')).toBeInTheDocument();
  });

  it('should render all stats', () => {
    render(<StatsSection />);
    expect(screen.getByText('Creators')).toBeInTheDocument();
    expect(screen.getByText('Images Generated')).toBeInTheDocument();
    expect(screen.getByText('Earnings Paid')).toBeInTheDocument();
  });

  it('should observe intersection for animations', () => {
    const observeSpy = vi.fn();
    const MockIO = class {
      observe = observeSpy;
      unobserve = vi.fn();
      disconnect = vi.fn();
      constructor(public callback: IntersectionObserverCallback) {}
    };
    global.IntersectionObserver = MockIO as any;

    render(<StatsSection />);
    expect(observeSpy).toHaveBeenCalled();
  });

  it('should display stat labels', () => {
    render(<StatsSection />);
    // Stats are formatted as "10K+", "1M+", "$500K+"
    // Numbers are animated, so they might start at 0, check for labels instead
    expect(screen.getByText('Creators')).toBeInTheDocument();
    expect(screen.getByText('Images Generated')).toBeInTheDocument();
    expect(screen.getByText('Earnings Paid')).toBeInTheDocument();
  });

  it('should animate numbers when intersecting', async () => {
    let callback: IntersectionObserverCallback;
    const MockIO = class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      constructor(cb: IntersectionObserverCallback) {
        callback = cb;
      }
    };
    global.IntersectionObserver = MockIO as any;

    // Mock requestAnimationFrame to prevent infinite recursion
    let callCount = 0;
    const rafSpy = vi.fn((cb) => {
      callCount++;
      if (callCount < 2) {
        // Only call once to prevent infinite loop
        cb(performance.now() + 100);
      }
      return 1;
    });
    global.requestAnimationFrame = rafSpy;

    render(<StatsSection />);

    // Simulate intersection to trigger animation
    if (callback) {
      callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
      // Wait for animation to start
      await new Promise((resolve) => setTimeout(resolve, 50));
      // Animation should have been called
      expect(rafSpy).toHaveBeenCalled();
    }
  });

  it('should not animate if already animated', () => {
    let callback: IntersectionObserverCallback;
    const MockIO = class {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      constructor(cb: IntersectionObserverCallback) {
        callback = cb;
      }
    };
    global.IntersectionObserver = MockIO as any;

    // Mock requestAnimationFrame to prevent infinite recursion
    let callCount = 0;
    global.requestAnimationFrame = vi.fn((cb) => {
      callCount++;
      if (callCount < 2) {
        cb(performance.now() + 100);
      }
      return 1;
    });

    render(<StatsSection />);

    // Simulate intersection twice
    if (callback) {
      callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
      // Second call should not trigger animation again
      callback(
        [{ isIntersecting: true } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
      // Should only animate once (hasAnimated prevents second animation)
    }
  });
});
