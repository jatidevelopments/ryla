import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { StructuredData } from './StructuredData';

describe('StructuredData', () => {
  it('should render structured data scripts', () => {
    const { container } = render(<StructuredData />);
    const scripts = container.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts.length).toBe(3);
  });

  it('should include organization schema', () => {
    const { container } = render(<StructuredData />);
    const scripts = container.querySelectorAll('script[type="application/ld+json"]');
    const orgScript = Array.from(scripts).find((script) => {
      const content = script.textContent || '';
      return content.includes('"@type":"Organization"');
    });
    expect(orgScript).toBeDefined();
  });

  it('should include website schema', () => {
    const { container } = render(<StructuredData />);
    const scripts = container.querySelectorAll('script[type="application/ld+json"]');
    const websiteScript = Array.from(scripts).find((script) => {
      const content = script.textContent || '';
      return content.includes('"@type":"WebSite"');
    });
    expect(websiteScript).toBeDefined();
  });

  it('should include software application schema', () => {
    const { container } = render(<StructuredData />);
    const scripts = container.querySelectorAll('script[type="application/ld+json"]');
    const appScript = Array.from(scripts).find((script) => {
      const content = script.textContent || '';
      return content.includes('"@type":"SoftwareApplication"');
    });
    expect(appScript).toBeDefined();
  });

  it('should have valid JSON in scripts', () => {
    const { container } = render(<StructuredData />);
    const scripts = container.querySelectorAll('script[type="application/ld+json"]');
    scripts.forEach((script) => {
      expect(() => JSON.parse(script.textContent || '')).not.toThrow();
    });
  });
});
