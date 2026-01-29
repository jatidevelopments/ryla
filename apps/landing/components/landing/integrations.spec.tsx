import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Integrations } from './integrations';

// Mock dependencies
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: any) => <div>{children}</div>,
  },
}));

describe('Integrations', () => {
  it('should render component', () => {
    const { container } = render(<Integrations />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
