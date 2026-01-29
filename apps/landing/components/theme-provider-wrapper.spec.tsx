import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThemeProviderWrapper } from './theme-provider-wrapper';

// Mock theme-provider
vi.mock('./theme-provider', () => ({
  ThemeProvider: ({ children }: any) => <div data-testid="theme-provider">{children}</div>,
}));

describe('ThemeProviderWrapper', () => {
  it('should render children', () => {
    render(
      <ThemeProviderWrapper>
        <div>Test Content</div>
      </ThemeProviderWrapper>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render theme provider after mount', async () => {
    render(
      <ThemeProviderWrapper>
        <div>Test</div>
      </ThemeProviderWrapper>
    );
    // After mount, should render ThemeProvider
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(screen.getByTestId('theme-provider')).toBeInTheDocument();
  });
});
