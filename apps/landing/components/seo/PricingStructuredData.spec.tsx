import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PricingStructuredData } from './PricingStructuredData';

describe('PricingStructuredData', () => {
  it('should render pricing structured data script', () => {
    const { container } = render(<PricingStructuredData />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeDefined();
  });

  it('should include Product schema', () => {
    const { container } = render(<PricingStructuredData />);
    const script = container.querySelector('script[type="application/ld+json"]');
    const content = script?.textContent || '';
    expect(content).toContain('"@type":"Product"');
  });

  it('should include multiple offers', () => {
    const { container } = render(<PricingStructuredData />);
    const script = container.querySelector('script[type="application/ld+json"]');
    const content = script?.textContent || '';
    expect(content).toContain('"@type":"Offer"');
    // Should have multiple offers (Starter, Pro, Studio)
    const offerMatches = content.match(/"@type":"Offer"/g);
    expect(offerMatches?.length).toBeGreaterThan(1);
  });

  it('should have valid JSON', () => {
    const { container } = render(<PricingStructuredData />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(() => JSON.parse(script?.textContent || '')).not.toThrow();
  });

  it('should include pricing tiers', () => {
    const { container } = render(<PricingStructuredData />);
    const script = container.querySelector('script[type="application/ld+json"]');
    const content = script?.textContent || '';
    expect(content).toContain('Starter');
    expect(content).toContain('Pro');
    expect(content).toContain('Studio');
  });
});
