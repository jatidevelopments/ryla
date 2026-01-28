import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FinalCTASection } from './FinalCTASection';

// Mock dependencies
vi.mock('@/components/ryla-ui', () => ({
  GradientBackground: () => <div data-testid="gradient-background" />,
}));

vi.mock('@/components/animations', () => ({
  FadeInUp: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/components/ui/shiny-button', () => ({
  ShinyButton: ({ href, children }: any) => <a href={href}>{children}</a>,
}));

vi.mock('@/lib/constants', () => ({
  FUNNEL_URL: 'https://goviral.ryla.ai/',
}));

describe('FinalCTASection', () => {
  it('should render final CTA section', () => {
    const { container } = render(<FinalCTASection />);
    // FinalCTASection renders as a section element
    expect(container.querySelector('section')).toBeInTheDocument();
  });

  it('should render headline', () => {
    render(<FinalCTASection />);
    // Text might be split, check for parts
    expect(screen.getByText(/Your/i)).toBeInTheDocument();
    expect(screen.getByText(/AI influencer/i)).toBeInTheDocument();
  });

  it('should render subheadline', () => {
    render(<FinalCTASection />);
    expect(
      screen.getByText(/Join thousands earning passive income/)
    ).toBeInTheDocument();
  });

  it('should render CTA button', () => {
    render(<FinalCTASection />);
    expect(screen.getByText('Start Creating Now')).toBeInTheDocument();
  });

  it('should have correct CTA href', () => {
    render(<FinalCTASection />);
    const cta = screen.getByText('Start Creating Now');
    expect(cta.closest('a')).toHaveAttribute(
      'href',
      'https://goviral.ryla.ai/'
    );
  });

  it('should render gradient background', () => {
    render(<FinalCTASection />);
    expect(screen.getByTestId('gradient-background')).toBeInTheDocument();
  });
});
