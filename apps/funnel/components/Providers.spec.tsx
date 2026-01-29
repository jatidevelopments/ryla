import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Providers from './Providers';

vi.mock('@/components/QueryProvider', () => ({
  QueryProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="query-provider">{children}</div>
  ),
}));

describe('Providers', () => {
  it('should render children', () => {
    render(
      <Providers>
        <div>Test Content</div>
      </Providers>
    );
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should wrap children with QueryProvider', () => {
    render(
      <Providers>
        <div>Test</div>
      </Providers>
    );
    
    expect(screen.getByTestId('query-provider')).toBeInTheDocument();
  });
});
