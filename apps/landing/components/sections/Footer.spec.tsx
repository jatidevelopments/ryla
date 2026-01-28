import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Footer } from './Footer';

// Mock ryla-ui
vi.mock('@/components/ryla-ui', () => ({
  Divider: () => <hr data-testid="divider" />,
}));

describe('Footer', () => {
  it('should render footer', () => {
    render(<Footer />);
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('should render footer links', () => {
    render(<Footer />);
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Pricing')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
    // Privacy Policy appears multiple times (in links and bottom bar), use getAllByText
    expect(screen.getAllByText('Privacy Policy')[0]).toBeInTheDocument();
    expect(screen.getAllByText('Terms of Service')[0]).toBeInTheDocument();
  });

  it('should have correct link hrefs', () => {
    render(<Footer />);
    expect(screen.getByText('Features').closest('a')).toHaveAttribute(
      'href',
      '#features'
    );
    expect(screen.getByText('Pricing').closest('a')).toHaveAttribute(
      'href',
      '#pricing'
    );
    expect(screen.getByText('Contact').closest('a')).toHaveAttribute(
      'href',
      '/contact'
    );
  });

  it('should render social links', () => {
    render(<Footer />);
    // Social links use aria-label, not text
    expect(screen.getByLabelText('Twitter')).toBeInTheDocument();
    expect(screen.getByLabelText('Instagram')).toBeInTheDocument();
    expect(screen.getByLabelText('Discord')).toBeInTheDocument();
  });

  it('should have correct social link hrefs', () => {
    render(<Footer />);
    const twitterLink = screen.getByLabelText('Twitter');
    expect(twitterLink).toHaveAttribute('href', 'https://twitter.com/ryla_ai');
    const instagramLink = screen.getByLabelText('Instagram');
    expect(instagramLink).toHaveAttribute(
      'href',
      'https://instagram.com/ryla_ai'
    );
    const discordLink = screen.getByLabelText('Discord');
    expect(discordLink).toHaveAttribute('href', 'https://discord.gg/ryla');
  });
});
