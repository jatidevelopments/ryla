import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnalyticsProviders } from './AnalyticsProviders';

vi.mock('@ryla/analytics', () => ({
  ClientPostHogProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="posthog-provider">{children}</div>
  ),
  PostHogPageView: () => <div data-testid="posthog-pageview" />,
  TikTokProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tiktok-provider">{children}</div>
  ),
  TikTokPageView: () => <div data-testid="tiktok-pageview" />,
  TwitterProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="twitter-provider">{children}</div>
  ),
  TwitterPageView: () => <div data-testid="twitter-pageview" />,
  FacebookProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="facebook-provider">{children}</div>
  ),
  FacebookPageView: () => <div data-testid="facebook-pageview" />,
}));

vi.mock('./FbPixelDebug', () => ({
  FbPixelDebug: () => <div data-testid="fb-pixel-debug" />,
}));

describe('AnalyticsProviders', () => {
  it('should render children', () => {
    render(
      <AnalyticsProviders>
        <div>Test Content</div>
      </AnalyticsProviders>
    );
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should wrap children with all analytics providers', () => {
    render(
      <AnalyticsProviders>
        <div>Test</div>
      </AnalyticsProviders>
    );
    
    expect(screen.getByTestId('posthog-provider')).toBeInTheDocument();
    expect(screen.getByTestId('tiktok-provider')).toBeInTheDocument();
    expect(screen.getByTestId('twitter-provider')).toBeInTheDocument();
    expect(screen.getByTestId('facebook-provider')).toBeInTheDocument();
  });

  it('should render page view components', () => {
    render(
      <AnalyticsProviders>
        <div>Test</div>
      </AnalyticsProviders>
    );
    
    expect(screen.getByTestId('posthog-pageview')).toBeInTheDocument();
    expect(screen.getByTestId('tiktok-pageview')).toBeInTheDocument();
    expect(screen.getByTestId('twitter-pageview')).toBeInTheDocument();
    expect(screen.getByTestId('facebook-pageview')).toBeInTheDocument();
  });

  it('should render FbPixelDebug', () => {
    render(
      <AnalyticsProviders>
        <div>Test</div>
      </AnalyticsProviders>
    );
    
    expect(screen.getByTestId('fb-pixel-debug')).toBeInTheDocument();
  });
});
