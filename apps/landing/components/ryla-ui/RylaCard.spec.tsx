import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RylaCard, FeatureCard, TestimonialCard, StepCard, StatCard, PricingCard } from './RylaCard';

describe('RylaCard', () => {
  it('should render card', () => {
    render(<RylaCard>Card content</RylaCard>);
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<RylaCard className="custom-class">Content</RylaCard>);
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should apply hover effects when hover prop is true', () => {
    const { container } = render(<RylaCard hover>Content</RylaCard>);
    expect(container.firstChild).toHaveClass('transition-all');
  });

  it('should apply gradient when gradient prop is true', () => {
    const { container } = render(<RylaCard gradient>Content</RylaCard>);
    expect(container.firstChild).toHaveClass('gradient-border');
  });
});

describe('FeatureCard', () => {
  it('should render feature card', () => {
    render(
      <FeatureCard
        title="Feature Title"
        description="Feature Description"
      />
    );
    expect(screen.getByText('Feature Title')).toBeInTheDocument();
    expect(screen.getByText('Feature Description')).toBeInTheDocument();
  });

  it('should render with icon', () => {
    render(
      <FeatureCard
        title="Feature"
        description="Desc"
        icon={<div data-testid="icon">Icon</div>}
      />
    );
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('should render with image', () => {
    render(
      <FeatureCard
        title="Feature"
        description="Desc"
        image="/test.jpg"
      />
    );
    const img = screen.getByAltText('Feature');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/test.jpg');
  });
});

describe('TestimonialCard', () => {
  it('should render testimonial card', () => {
    render(
      <TestimonialCard
        name="John Doe"
        role="Creator"
        quote="Great product!"
      />
    );
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Creator')).toBeInTheDocument();
    expect(screen.getByText('"Great product!"')).toBeInTheDocument();
  });

  it('should render with avatar', () => {
    render(
      <TestimonialCard
        name="John Doe"
        role="Creator"
        quote="Test"
        avatar="/avatar.jpg"
      />
    );
    const img = screen.getByAltText('John Doe');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/avatar.jpg');
  });

  it('should render without avatar (show initial)', () => {
    render(
      <TestimonialCard
        name="John Doe"
        role="Creator"
        quote="Test"
      />
    );
    expect(screen.getByText('J')).toBeInTheDocument();
  });
});

describe('StepCard', () => {
  it('should render step card', () => {
    render(
      <StepCard
        number={1}
        title="Step Title"
        description="Step Description"
      />
    );
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('Step Title')).toBeInTheDocument();
    expect(screen.getByText('Step Description')).toBeInTheDocument();
  });
});

describe('StatCard', () => {
  it('should render stat card', () => {
    render(
      <StatCard label="Total Users">
        1000
      </StatCard>
    );
    expect(screen.getByText('1000')).toBeInTheDocument();
    expect(screen.getByText('Total Users')).toBeInTheDocument();
  });
});

describe('PricingCard', () => {
  it('should render pricing card', () => {
    render(
      <PricingCard
        name="Pro"
        price="$29"
        features={['Feature 1', 'Feature 2']}
      />
    );
    expect(screen.getByText('Pro')).toBeInTheDocument();
    expect(screen.getByText('$29')).toBeInTheDocument();
    expect(screen.getByText('Feature 1')).toBeInTheDocument();
    expect(screen.getByText('Feature 2')).toBeInTheDocument();
  });

  it('should render with highlighted prop', () => {
    render(
      <PricingCard
        name="Pro"
        price="$29"
        features={['Feature 1']}
        highlighted
      />
    );
    expect(screen.getByText('Most Popular')).toBeInTheDocument();
  });

  it('should render with description', () => {
    render(
      <PricingCard
        name="Pro"
        price="$29"
        description="Pro plan description"
        features={['Feature 1']}
      />
    );
    expect(screen.getByText('Pro plan description')).toBeInTheDocument();
  });

  it('should render with ctaHref', () => {
    render(
      <PricingCard
        name="Pro"
        price="$29"
        features={['Feature 1']}
        ctaHref="/signup"
        ctaText="Get Started"
      />
    );
    const link = screen.getByText('Get Started');
    expect(link.closest('a')).toHaveAttribute('href', '/signup');
  });

  it('should render with onCtaClick', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(
      <PricingCard
        name="Pro"
        price="$29"
        features={['Feature 1']}
        onCtaClick={handleClick}
        ctaText="Get Started"
      />
    );
    const button = screen.getByText('Get Started');
    await user.click(button);
    expect(handleClick).toHaveBeenCalled();
  });
});
