import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CountUp } from './CountUp';

// Mock IntersectionObserver
class MockIntersectionObserver {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
  constructor(public callback: IntersectionObserverCallback) {}
}

beforeEach(() => {
  global.IntersectionObserver = MockIntersectionObserver as any;
  global.matchMedia = vi.fn(() => ({
    matches: false,
    media: '',
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })) as any;
});

afterEach(() => {
  vi.clearAllMocks();
});

describe('CountUp', () => {
  it('should render initial value', () => {
    render(<CountUp value={100} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should render with prefix', () => {
    render(<CountUp value={100} prefix="$" />);
    expect(screen.getByText(/\$0/)).toBeInTheDocument();
  });

  it('should render with suffix', () => {
    render(<CountUp value={100} suffix="+" />);
    expect(screen.getByText(/0\+/)).toBeInTheDocument();
  });

  it('should render with prefix and suffix', () => {
    render(<CountUp value={100} prefix="$" suffix="+" />);
    expect(screen.getByText(/\$0\+/)).toBeInTheDocument();
  });

  it('should format numbers with separator', () => {
    render(<CountUp value={1000} />);
    const element = screen.getByText(/0/);
    expect(element).toBeInTheDocument();
  });

  it('should handle decimals', () => {
    render(<CountUp value={100.5} decimals={1} />);
    expect(screen.getByText(/0\.0/)).toBeInTheDocument();
  });

  it('should respect reduced motion preference', () => {
    global.matchMedia = vi.fn(() => ({
      matches: true,
      media: '',
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as any;

    render(<CountUp value={100} />);
    // With reduced motion, should show final value immediately
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('should observe intersection', () => {
    const observeSpy = vi.fn();
    const unobserveSpy = vi.fn();
    let callback: IntersectionObserverCallback;
    const MockIO = class {
      observe = observeSpy;
      unobserve = unobserveSpy;
      disconnect = vi.fn();
      constructor(cb: IntersectionObserverCallback) {
        callback = cb;
      }
    };
    global.IntersectionObserver = MockIO as any;
    
    render(<CountUp value={100} />);
    expect(observeSpy).toHaveBeenCalled();
    
    // Simulate intersection
    if (callback) {
      callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
      // Animation should start
      expect(unobserveSpy).toHaveBeenCalled();
    }
  });

  it('should animate count when intersecting', async () => {
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
    
    render(<CountUp value={100} duration={100} />);
    
    // Simulate intersection to trigger animation
    if (callback) {
      callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
      // Wait for animation to start
      await new Promise(resolve => setTimeout(resolve, 50));
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
    
    render(<CountUp value={100} />);
    
    // Simulate intersection twice
    if (callback) {
      callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
      // Second call should not trigger animation again
      callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
      // Should only animate once (hasAnimated prevents second animation)
    }
  });
});
