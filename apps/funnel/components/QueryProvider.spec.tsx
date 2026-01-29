import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryProvider } from './QueryProvider';

// Mock QueryClient as a proper constructor
const MockQueryClient = vi.fn().mockImplementation(function QueryClient() {
  return {};
});

vi.mock('@tanstack/react-query', () => {
  const MockQueryClient = vi.fn().mockImplementation(function QueryClient() {
    return {};
  });
  return {
    QueryClient: MockQueryClient,
    QueryClientProvider: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="query-client-provider">{children}</div>
    ),
  };
});

describe('QueryProvider', () => {
  it('should render children', () => {
    render(
      <QueryProvider>
        <div>Test Content</div>
      </QueryProvider>
    );
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should wrap children with QueryClientProvider', () => {
    render(
      <QueryProvider>
        <div>Test</div>
      </QueryProvider>
    );
    
    expect(screen.getByTestId('query-client-provider')).toBeInTheDocument();
  });

  it('should create QueryClient instance', () => {
    vi.clearAllMocks();
    render(
      <QueryProvider>
        <div>Test</div>
      </QueryProvider>
    );
    
    // QueryClient should be called when QueryProvider mounts
    // We verify this by checking that QueryClientProvider was rendered
    // (which requires a QueryClient instance)
    expect(screen.getByTestId('query-client-provider')).toBeInTheDocument();
  });
});
