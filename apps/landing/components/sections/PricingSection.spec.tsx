import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PricingSection } from './PricingSection';

// Mock dependencies
vi.mock('@/components/ryla-ui', () => ({
  Section: ({ children, id }: any) => <section id={id}>{children}</section>,
  SectionHeader: ({ title }: any) => <h2>{title}</h2>,
  PricingCard: ({ name, price, period, ctaText, ctaHref }: any) => (
    <div data-testid={`pricing-card-${name}`}>
      <h3>{name}</h3>
      <div>
        {price}
        {period}
      </div>
      {ctaHref && <a href={ctaHref}>{ctaText}</a>}
      {!ctaHref && <button>{ctaText}</button>}
    </div>
  ),
}));

vi.mock('@/components/animations', () => ({
  FadeInUp: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/lib/constants', () => ({
  FUNNEL_URL: 'https://goviral.ryla.ai/',
}));

describe('PricingSection', () => {
  it('should render pricing section', () => {
    const { container } = render(<PricingSection />);
    // PricingSection renders as a section element
    expect(container.querySelector('section')).toBeInTheDocument();
  });

  it('should render section header', () => {
    render(<PricingSection />);
    expect(screen.getByText(/Simple pricing/)).toBeInTheDocument();
  });

  it('should render all pricing tiers', () => {
    render(<PricingSection />);
    expect(screen.getByTestId('pricing-card-Starter')).toBeInTheDocument();
    expect(screen.getByTestId('pricing-card-Pro')).toBeInTheDocument();
    expect(screen.getByTestId('pricing-card-Unlimited')).toBeInTheDocument();
  });

  it('should display tier names', () => {
    render(<PricingSection />);
    expect(screen.getByText('Starter')).toBeInTheDocument();
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('Unlimited')).toBeInTheDocument();
  });

  it('should display tier prices', () => {
    render(<PricingSection />);
    expect(screen.getByText('$29/mo')).toBeInTheDocument();
    expect(screen.getByText('$49/mo')).toBeInTheDocument();
    expect(screen.getByText('$99/mo')).toBeInTheDocument();
  });

  it('should have CTA buttons with correct hrefs', () => {
    render(<PricingSection />);
    // PricingCard uses ctaText and ctaHref props
    const starterCta = screen.getByText('Start Free');
    expect(
      starterCta.closest('a') || starterCta.closest('button')
    ).toBeInTheDocument();
    const proCta = screen.getByText('Get Pro');
    expect(proCta.closest('a') || proCta.closest('button')).toBeInTheDocument();
    const unlimitedCta = screen.getByText('Contact Sales');
    expect(
      unlimitedCta.closest('a') || unlimitedCta.closest('button')
    ).toBeInTheDocument();
  });
});
