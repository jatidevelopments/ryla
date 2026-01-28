import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeroSection } from './HeroSection';

// Mock dependencies
vi.mock('@/components/ryla-ui', () => ({
  RylaButton: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
  Container: ({ children, className }: any) => (
    <div className={className}>{children}</div>
  ),
  GradientBackground: () => <div data-testid="gradient-background" />,
}));

vi.mock('@/components/animations', () => ({
  FadeInUp: ({ children }: any) => <div>{children}</div>,
  LogoMarquee: ({ children }: any) => (
    <div data-testid="logo-marquee">{children}</div>
  ),
  PlatformLogo: ({ name }: any) => (
    <div data-testid={`platform-${name}`}>{name}</div>
  ),
}));

vi.mock('@/components/ui/scroll-velocity', () => ({
  VelocityScroll: ({ children }: any) => (
    <div data-testid="velocity-scroll">{children}</div>
  ),
}));

vi.mock('@/components/ui/shiny-button', () => ({
  ShinyButton: ({ href, children }: any) => <a href={href}>{children}</a>,
}));

vi.mock('./HeroBackground', () => ({
  HeroBackground: () => <div data-testid="hero-background" />,
}));

vi.mock('@/lib/constants', () => ({
  FUNNEL_URL: 'https://goviral.ryla.ai/',
}));

describe('HeroSection', () => {
  it('should render hero section', () => {
    const { container } = render(<HeroSection />);
    // HeroSection renders as a section element
    expect(container.querySelector('section')).toBeInTheDocument();
  });

  it('should render headline', () => {
    render(<HeroSection />);
    // Text might be split, check for parts individually
    expect(screen.getByText(/Create/i)).toBeInTheDocument();
    expect(screen.getByText(/AI influencers/i)).toBeInTheDocument();
    expect(screen.getByText(/earn 24\/7/i)).toBeInTheDocument();
  });

  it('should render subheadline', () => {
    render(<HeroSection />);
    // Subheadline text appears multiple times (in main section and velocity scroll), use getAllByText
    const hyperRealistic = screen.getAllByText(/Hyper-realistic/);
    expect(hyperRealistic.length).toBeGreaterThan(0);
    const consistent = screen.getAllByText(/Consistent/);
    expect(consistent.length).toBeGreaterThan(0);
  });

  it('should render CTA buttons', () => {
    render(<HeroSection />);
    expect(screen.getByText('Start Creating')).toBeInTheDocument();
    expect(screen.getByText('See How It Works')).toBeInTheDocument();
  });

  it('should have correct CTA href', () => {
    render(<HeroSection />);
    const cta = screen.getByText('Start Creating');
    expect(cta.closest('a')).toHaveAttribute(
      'href',
      'https://goviral.ryla.ai/'
    );
  });

  it('should render platform logos', () => {
    render(<HeroSection />);
    expect(screen.getByTestId('logo-marquee')).toBeInTheDocument();
  });

  it('should render hero background', () => {
    render(<HeroSection />);
    expect(screen.getByTestId('hero-background')).toBeInTheDocument();
  });
});
