import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { AURAAIPlatform } from './aura-ai-platform';

// Mock LandingPageFactory since aura-ai-influencer is disabled
vi.mock('./LandingPageFactory', () => ({
  LandingPageFactory: () => <div data-testid="landing-page-factory">Landing Page</div>,
}));

describe('AURAAIPlatform', () => {
  it('should render component', () => {
    const { container } = render(<AURAAIPlatform />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
