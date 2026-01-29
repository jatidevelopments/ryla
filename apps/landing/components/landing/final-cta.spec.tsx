import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FinalCTA } from './final-cta';

// Mock dependencies
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

vi.mock('@/components/ui/meteors', () => ({
  Meteors: () => <div data-testid="meteors" />,
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: any) => <div>{children}</div>,
  },
}));

vi.mock('next/image', () => ({
  default: ({ src, alt }: any) => <img src={src} alt={alt} />,
}));

vi.mock('lucide-react', () => ({
  Sparkles: () => <div data-testid="sparkles-icon" />,
  ArrowRight: () => <div data-testid="arrow-icon" />,
  Star: () => <div data-testid="star-icon" />,
  Zap: () => <div data-testid="zap-icon" />,
}));

describe('FinalCTA', () => {
  it('should render final CTA', () => {
    render(<FinalCTA />);
    // Text might be split across elements, check for parts individually
    expect(screen.getByText(/Create/i)).toBeInTheDocument();
    // AI Influencer might be split, use getAllByText since "AI" appears multiple times
    const aiElements = screen.getAllByText(/AI/i);
    expect(aiElements.length).toBeGreaterThan(0);
  });

  it('should render default headline', () => {
    render(<FinalCTA />);
    // Check for parts of headline individually
    expect(screen.getByText(/Create/i)).toBeInTheDocument();
    const minutes = screen.queryByText(/Minutes/i) || screen.queryByText(/minutes/i);
    expect(minutes).toBeTruthy();
  });

  it('should render CTAs', () => {
    render(<FinalCTA />);
    expect(screen.getByText('Start Free Trial')).toBeInTheDocument();
  });

  it('should render stats', () => {
    render(<FinalCTA />);
    // Stats might be in separate elements, check for each
    expect(screen.getByText(/4\.9\/5/)).toBeInTheDocument();
    expect(screen.getByText(/2\.3M\+/)).toBeInTheDocument();
    expect(screen.getByText(/\$2M\+/)).toBeInTheDocument();
  });
});
