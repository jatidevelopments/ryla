import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import LandingPage from './page';

// Mock all section components
vi.mock('@/components/sections', () => ({
  Navigation: () => <nav data-testid="navigation">Navigation</nav>,
  HeroSection: () => <section data-testid="hero-section">Hero Section</section>,
  StatsSection: () => <section data-testid="stats-section">Stats Section</section>,
  FeatureShowcase: () => <section data-testid="feature-showcase">Feature Showcase</section>,
  HowItWorksSection: () => <section data-testid="how-it-works">How It Works</section>,
  TestimonialsSection: () => <section data-testid="testimonials">Testimonials</section>,
  PricingSection: () => <section data-testid="pricing">Pricing</section>,
  FAQSection: () => <section data-testid="faq">FAQ</section>,
  FinalCTASection: () => <section data-testid="final-cta">Final CTA</section>,
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));

// Mock SEO components
vi.mock('@/components/seo/FAQStructuredData', () => ({
  FAQStructuredData: () => <script data-testid="faq-structured-data" type="application/ld+json" />,
}));

vi.mock('@/components/seo/PricingStructuredData', () => ({
  PricingStructuredData: () => <script data-testid="pricing-structured-data" type="application/ld+json" />,
}));

// Mock faqs data
vi.mock('@/data/faqs', () => ({
  faqs: [
    { question: 'Test?', answer: 'Test answer' },
  ],
}));

describe('LandingPage', () => {
  it('should render all sections', () => {
    render(<LandingPage />);
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    expect(screen.getByTestId('stats-section')).toBeInTheDocument();
    expect(screen.getByTestId('feature-showcase')).toBeInTheDocument();
    expect(screen.getByTestId('how-it-works')).toBeInTheDocument();
    expect(screen.getByTestId('testimonials')).toBeInTheDocument();
    expect(screen.getByTestId('pricing')).toBeInTheDocument();
    expect(screen.getByTestId('final-cta')).toBeInTheDocument();
    expect(screen.getByTestId('faq')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('should render structured data', () => {
    render(<LandingPage />);
    expect(screen.getByTestId('faq-structured-data')).toBeInTheDocument();
    expect(screen.getByTestId('pricing-structured-data')).toBeInTheDocument();
  });

  it('should have main element', () => {
    const { container } = render(<LandingPage />);
    expect(container.querySelector('main')).toBeInTheDocument();
  });

  it('should have article element with schema', () => {
    const { container } = render(<LandingPage />);
    const article = container.querySelector('article[itemScope]');
    expect(article).toBeInTheDocument();
    expect(article?.getAttribute('itemType')).toBe('https://schema.org/Article');
  });
});
