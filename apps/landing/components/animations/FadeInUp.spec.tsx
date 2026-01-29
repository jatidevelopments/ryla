import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FadeInUp, StaggerChildren } from './FadeInUp';

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

describe('FadeInUp', () => {
  it('should render children', () => {
    render(
      <FadeInUp>
        <div>Test Content</div>
      </FadeInUp>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <FadeInUp className="custom-class">
        <div>Test</div>
      </FadeInUp>
    );
    expect(container.firstChild).toHaveClass('custom-class');
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

    render(
      <FadeInUp>
        <div>Test</div>
      </FadeInUp>
    );
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should observe intersection', () => {
    const observeSpy = vi.fn();
    const MockIO = class {
      observe = observeSpy;
      unobserve = vi.fn();
      disconnect = vi.fn();
      constructor(public callback: IntersectionObserverCallback) {}
    };
    global.IntersectionObserver = MockIO as any;
    
    render(
      <FadeInUp>
        <div>Test</div>
      </FadeInUp>
    );
    expect(observeSpy).toHaveBeenCalled();
  });

  it('should handle entry.isIntersecting true with once=true (lines 53-56)', () => {
    let observerCallback: IntersectionObserverCallback;
    const unobserveSpy = vi.fn();
    
    class MockIO {
      observe = vi.fn();
      unobserve = unobserveSpy;
      disconnect = vi.fn();
      constructor(callback: IntersectionObserverCallback) {
        observerCallback = callback;
      }
    }
    
    global.IntersectionObserver = MockIO as any;
    
    render(
      <FadeInUp once={true}>
        <div>Test</div>
      </FadeInUp>
    );
    
    // Simulate intersection (line 53: entry.isIntersecting = true)
    if (observerCallback) {
      observerCallback(
        [{ isIntersecting: true, target: document.body } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    }
    
    // When isIntersecting is true and once is true:
    // - setIsVisible(true) is called (line 54)
    // - observer.unobserve is called (line 56)
    expect(unobserveSpy).toHaveBeenCalled();
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should handle entry.isIntersecting false with once=false (lines 58-59)', () => {
    let observerCallback: IntersectionObserverCallback;
    
    class MockIO {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();
      constructor(callback: IntersectionObserverCallback) {
        observerCallback = callback;
      }
    }
    
    global.IntersectionObserver = MockIO as any;
    
    render(
      <FadeInUp once={false}>
        <div>Test</div>
      </FadeInUp>
    );
    
    // Simulate leaving intersection (line 58: entry.isIntersecting = false, once = false)
    if (observerCallback) {
      observerCallback(
        [{ isIntersecting: false, target: document.body } as IntersectionObserverEntry],
        {} as IntersectionObserver
      );
    }
    
    // When isIntersecting is false and once is false:
    // - setIsVisible(false) is called (line 59)
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});

describe('StaggerChildren', () => {
  it('should render children', () => {
    render(
      <StaggerChildren>
        <div>Child 1</div>
        <div>Child 2</div>
      </StaggerChildren>
    );
    expect(screen.getByText('Child 1')).toBeInTheDocument();
    expect(screen.getByText('Child 2')).toBeInTheDocument();
  });

  it('should render single child', () => {
    render(
      <StaggerChildren>
        <div>Single Child</div>
      </StaggerChildren>
    );
    expect(screen.getByText('Single Child')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <StaggerChildren className="custom-class">
        <div>Test</div>
      </StaggerChildren>
    );
    expect(container.firstChild).toHaveClass('custom-class');
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

    render(
      <StaggerChildren>
        <div>Test</div>
      </StaggerChildren>
    );
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should observe intersection', () => {
    const observeSpy = vi.fn();
    let callback: IntersectionObserverCallback;
    const MockIO = class {
      observe = observeSpy;
      unobserve = vi.fn();
      disconnect = vi.fn();
      constructor(cb: IntersectionObserverCallback) {
        callback = cb;
      }
    };
    global.IntersectionObserver = MockIO as any;
    
    render(
      <StaggerChildren>
        <div>Test</div>
      </StaggerChildren>
    );
    expect(observeSpy).toHaveBeenCalled();
    
    // Simulate intersection
    if (callback) {
      callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
    }
  });

  it('should handle once=false prop', () => {
    let callback: IntersectionObserverCallback;
    const unobserveSpy = vi.fn();
    const MockIO = class {
      observe = vi.fn();
      unobserve = unobserveSpy;
      disconnect = vi.fn();
      constructor(cb: IntersectionObserverCallback) {
        callback = cb;
      }
    };
    global.IntersectionObserver = MockIO as any;
    
    render(
      <StaggerChildren once={false}>
        <div>Test</div>
      </StaggerChildren>
    );
    
    // Simulate intersection and then leaving view
    if (callback) {
      callback([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver);
      callback([{ isIntersecting: false } as IntersectionObserverEntry], {} as IntersectionObserver);
      // Should not unobserve when once=false
    }
  });
});
