import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SocialProof } from './social-proof';

// Mock dependencies
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/ui/avatar', () => ({
  Avatar: ({ children }: any) => <div data-testid="avatar">{children}</div>,
  AvatarImage: ({ src, alt }: any) => <img src={src} alt={alt} />,
  AvatarFallback: ({ children }: any) => <div data-testid="avatar-fallback">{children}</div>,
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/ui/marquee', () => ({
  default: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: any) => <div>{children}</div>,
  },
}));

vi.mock('lucide-react', () => ({
  Star: () => <div data-testid="star-icon" />,
  TrendingUp: () => <div data-testid="trending-icon" />,
  Users: () => <div data-testid="users-icon" />,
  DollarSign: () => <div data-testid="dollar-icon" />,
}));

describe('SocialProof', () => {
  it('should render component', () => {
    const { container } = render(<SocialProof />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should handle testimonial with multiple word name (line 203)', () => {
    // Test name initials mapping: "John Doe" -> "JD"
    // Line 203: .map((n) => n[0]) - maps each word to its first character
    const content = {
      testimonial: {
        name: 'John Doe',
        role: '@johndoe',
        content: 'Great product!',
        avatar: '/test.jpg',
      },
    };
    render(<SocialProof content={content} />);
    
    // The name should be split and mapped to initials
    // "John Doe".split(" ") -> ["John", "Doe"]
    // .map((n) => n[0]) -> ["J", "D"]
    // .join("") -> "JD"
    // There may be multiple fallbacks (from default creators), so get all and find the one with "JD"
    const fallbacks = screen.getAllByTestId('avatar-fallback');
    const jdFallback = fallbacks.find(fb => fb.textContent === 'JD');
    expect(jdFallback).toBeDefined();
    expect(jdFallback?.textContent).toBe('JD');
  });

  it('should handle testimonial with single word name (line 203)', () => {
    // Test single word name: "John" -> "J"
    const content = {
      testimonial: {
        name: 'John',
        role: '@john',
        content: 'Test',
        avatar: '/test.jpg',
      },
    };
    render(<SocialProof content={content} />);
    
    // Single word should map to first character
    // There may be multiple fallbacks, so get all and find the one with "J"
    const fallbacks = screen.getAllByTestId('avatar-fallback');
    const jFallback = fallbacks.find(fb => fb.textContent === 'J');
    expect(jFallback).toBeDefined();
    expect(jFallback?.textContent).toBe('J');
  });

  it('should handle testimonial with three word name (line 203)', () => {
    // Test three word name: "John Michael Doe" -> "JMD"
    const content = {
      testimonial: {
        name: 'John Michael Doe',
        role: '@johndoe',
        content: 'Test',
        avatar: '/test.jpg',
      },
    };
    render(<SocialProof content={content} />);
    
    // Three words should map to three initials
    // There may be multiple fallbacks, so get all and find the one with "JMD"
    const fallbacks = screen.getAllByTestId('avatar-fallback');
    const jmdFallback = fallbacks.find(fb => fb.textContent === 'JMD');
    expect(jmdFallback).toBeDefined();
    expect(jmdFallback?.textContent).toBe('JMD');
  });
});
