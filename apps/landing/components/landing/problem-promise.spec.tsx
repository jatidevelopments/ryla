import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ProblemPromise } from './problem-promise';

// Mock dependencies
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/ui/bento-grid', () => ({
  BentoGrid: ({ children }: any) => <div>{children}</div>,
  BentoCard: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children }: any) => <span>{children}</span>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children }: any) => <button>{children}</button>,
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: any) => <div>{children}</div>,
  },
}));

vi.mock('lucide-react', () => ({
  CheckCircle: () => <div data-testid="check-icon" />,
  XCircle: () => <div data-testid="x-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  DollarSign: () => <div data-testid="dollar-icon" />,
  Zap: () => <div data-testid="zap-icon" />,
  Shield: () => <div data-testid="shield-icon" />,
  Sparkles: () => <div data-testid="sparkles-icon" />,
  TrendingUp: () => <div data-testid="trending-icon" />,
}));

describe('ProblemPromise', () => {
  it('should render component', () => {
    const { container } = render(<ProblemPromise />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
