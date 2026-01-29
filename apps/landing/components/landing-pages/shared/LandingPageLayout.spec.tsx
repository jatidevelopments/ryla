import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LandingPageLayout } from './LandingPageLayout';

// Mock dependencies
vi.mock('./LandingPageHeader', () => ({
  LandingPageHeader: () => <header data-testid="header">Header</header>,
}));

vi.mock('@/components/announcement-bar', () => ({
  AnnouncementBar: () => <div data-testid="announcement-bar">Announcement</div>,
}));

describe('LandingPageLayout', () => {
  const mockHeader = {
    title: 'Test Title',
    icon: 'test-icon',
    gradient: 'from-purple-600 to-pink-600',
    navigation: [],
    ctaText: 'CTA',
    ctaHref: '/test',
  };

  it('should render layout', () => {
    render(
      <LandingPageLayout header={mockHeader}>
        <div>Content</div>
      </LandingPageLayout>
    );
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should render announcement bar for overlay variant', () => {
    render(
      <LandingPageLayout header={{ ...mockHeader, variant: 'overlay' }}>
        <div>Content</div>
      </LandingPageLayout>
    );
    expect(screen.getByTestId('announcement-bar')).toBeInTheDocument();
  });
});
