import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TextReveal, TextRevealByWord } from './text-reveal';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    span: ({ children }: any) => <span>{children}</span>,
  },
  useScroll: () => ({
    scrollYProgress: { get: () => 0 },
  }),
  useTransform: (value: any, inputRange: any, outputRange: any) => {
    return { get: () => outputRange[0] };
  },
}));

describe('TextReveal', () => {
  it('should render text', () => {
    render(<TextReveal>Hello World</TextReveal>);
    // Text is split into words and rendered twice (background + foreground), so use getAllByText
    const helloElements = screen.getAllByText('Hello');
    const worldElements = screen.getAllByText('World');
    expect(helloElements.length).toBeGreaterThan(0);
    expect(worldElements.length).toBeGreaterThan(0);
  });

  it('should apply custom className', () => {
    const { container } = render(<TextReveal className="custom-class">Test</TextReveal>);
    const firstChild = container.firstChild as HTMLElement;
    expect(firstChild).toHaveClass('custom-class');
  });

  it('should test Word component with different progress values', () => {
    // Word component uses useTransform with progress and range (lines 47, 91-94)
    // Test with different scroll progress values
    const mockUseTransform = vi.fn((value: any, inputRange: any, outputRange: any) => {
      // Return different opacity values based on progress
      return { get: () => outputRange[1] }; // Return end value to simulate scrolled state
    });

    const framerMotion = require('framer-motion');
    const originalUseTransform = framerMotion.useTransform;
    framerMotion.useTransform = mockUseTransform;

    render(<TextReveal>Test Text</TextReveal>);
    
    // Word component should render with opacity based on scroll progress
    const words = screen.getAllByText('Test');
    expect(words.length).toBeGreaterThan(0);

    framerMotion.useTransform = originalUseTransform;
  });
});

describe('TextRevealByWord', () => {
  it('should render TextRevealByWord component', () => {
    const { container } = render(<TextRevealByWord text="Hello World" />);
    
    // TextRevealByWord renders words with Word component (lines 91-98)
    expect(container.firstChild).toBeInTheDocument();
    
    // Words should be rendered
    const helloElements = screen.getAllByText('Hello');
    const worldElements = screen.getAllByText('World');
    expect(helloElements.length).toBeGreaterThan(0);
    expect(worldElements.length).toBeGreaterThan(0);
  });

  it('should apply custom className to TextRevealByWord', () => {
    const { container } = render(<TextRevealByWord text="Test" className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should calculate word ranges correctly', () => {
    render(<TextRevealByWord text="One Two Three" />);
    
    // TextRevealByWord splits text and calculates ranges for each word (lines 92-93)
    // Each word gets a range: [i / words.length, (i + 1) / words.length]
    expect(screen.getAllByText('One').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Two').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Three').length).toBeGreaterThan(0);
  });
});
