import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ThemeProvider } from './theme-provider';

// Mock next-themes
vi.mock('next-themes', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="next-themes-provider">{children}</div>
  ),
}));

describe('ThemeProvider', () => {
  it('should render children', () => {
    const { getByText, getByTestId } = render(
      <ThemeProvider>
        <div>Test Content</div>
      </ThemeProvider>
    );
    expect(getByText('Test Content')).toBeInTheDocument();
    expect(getByTestId('next-themes-provider')).toBeInTheDocument();
  });

  it('should pass props to NextThemesProvider', () => {
    const { getByTestId } = render(
      <ThemeProvider attribute="class" defaultTheme="dark">
        <div>Test</div>
      </ThemeProvider>
    );
    expect(getByTestId('next-themes-provider')).toBeInTheDocument();
  });
});
