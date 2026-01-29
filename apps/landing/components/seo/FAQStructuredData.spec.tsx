import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { FAQStructuredData } from './FAQStructuredData';

describe('FAQStructuredData', () => {
  it('should render FAQ structured data script', () => {
    const faqs = [
      { question: 'Test Question?', answer: 'Test Answer' },
    ];
    const { container } = render(<FAQStructuredData faqs={faqs} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).toBeDefined();
  });

  it('should return null for empty faqs array', () => {
    const { container } = render(<FAQStructuredData faqs={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('should return null for null faqs', () => {
    const { container } = render(<FAQStructuredData faqs={null as any} />);
    expect(container.firstChild).toBeNull();
  });

  it('should include FAQPage schema', () => {
    const faqs = [
      { question: 'Test Question?', answer: 'Test Answer' },
    ];
    const { container } = render(<FAQStructuredData faqs={faqs} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    const content = script?.textContent || '';
    expect(content).toContain('"@type":"FAQPage"');
  });

  it('should include all FAQs in schema', () => {
    const faqs = [
      { question: 'Question 1?', answer: 'Answer 1' },
      { question: 'Question 2?', answer: 'Answer 2' },
    ];
    const { container } = render(<FAQStructuredData faqs={faqs} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    const content = script?.textContent || '';
    expect(content).toContain('Question 1?');
    expect(content).toContain('Question 2?');
  });

  it('should have valid JSON', () => {
    const faqs = [
      { question: 'Test Question?', answer: 'Test Answer' },
    ];
    const { container } = render(<FAQStructuredData faqs={faqs} />);
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(() => JSON.parse(script?.textContent || '')).not.toThrow();
  });
});
