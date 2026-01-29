import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { AnalyticsProviders } from './AnalyticsProviders';

// Mock @ryla/analytics
vi.mock('@ryla/analytics', () => ({
  ClientPostHogProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="posthog-provider">{children}</div>,
  PostHogPageView: () => <div data-testid="posthog-pageview" />,
  TikTokProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="tiktok-provider">{children}</div>,
  TikTokPageView: () => <div data-testid="tiktok-pageview" />,
  TwitterProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="twitter-provider">{children}</div>,
  TwitterPageView: () => <div data-testid="twitter-pageview" />,
  FacebookProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="facebook-provider">{children}</div>,
  FacebookPageView: () => <div data-testid="facebook-pageview" />,
}));

describe('AnalyticsProviders', () => {
  it('should render children', () => {
    const { getByText } = render(
      <AnalyticsProviders>
        <div>Test Content</div>
      </AnalyticsProviders>
    );
    expect(getByText('Test Content')).toBeInTheDocument();
  });

  it('should render all analytics providers', () => {
    const { getByTestId } = render(
      <AnalyticsProviders>
        <div>Test</div>
      </AnalyticsProviders>
    );
    expect(getByTestId('posthog-provider')).toBeInTheDocument();
    expect(getByTestId('tiktok-provider')).toBeInTheDocument();
    expect(getByTestId('twitter-provider')).toBeInTheDocument();
    expect(getByTestId('facebook-provider')).toBeInTheDocument();
  });

  it('should render all pageview components', () => {
    const { getByTestId } = render(
      <AnalyticsProviders>
        <div>Test</div>
      </AnalyticsProviders>
    );
    expect(getByTestId('posthog-pageview')).toBeInTheDocument();
    expect(getByTestId('tiktok-pageview')).toBeInTheDocument();
    expect(getByTestId('twitter-pageview')).toBeInTheDocument();
    expect(getByTestId('facebook-pageview')).toBeInTheDocument();
  });
});
