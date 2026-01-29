import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import RootLayout from './layout';

// Mock next/font/google
vi.mock('next/font/google', () => ({
  DM_Sans: vi.fn(() => ({
    variable: '--font-dm-sans',
  })),
  JetBrains_Mono: vi.fn(() => ({
    variable: '--font-mono',
  })),
}));

// Mock components
vi.mock('@/components/seo/StructuredData', () => ({
  StructuredData: () => <script data-testid="structured-data" type="application/ld+json" />,
}));

vi.mock('@/components/AnalyticsProviders', () => ({
  AnalyticsProviders: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="analytics-providers">{children}</div>
  ),
}));

describe('RootLayout', () => {
  it('should render children', () => {
    const { getByText, getByTestId } = render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    );
    expect(getByText('Test Content')).toBeInTheDocument();
    expect(getByTestId('analytics-providers')).toBeInTheDocument();
  });

  it('should render structured data', () => {
    const { getByTestId } = render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );
    expect(getByTestId('structured-data')).toBeInTheDocument();
  });

  it('should have html element with lang', () => {
    const { container } = render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );
    const html = container.querySelector('html');
    expect(html).toBeInTheDocument();
    expect(html?.getAttribute('lang')).toBe('en');
  });

  it('should have body element', () => {
    const { container } = render(
      <RootLayout>
        <div>Test</div>
      </RootLayout>
    );
    expect(container.querySelector('body')).toBeInTheDocument();
  });
});
