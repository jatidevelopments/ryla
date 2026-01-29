import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FAQ } from './faq';

// Mock dependencies
vi.mock('@/components/ui/accordion', () => ({
  Accordion: ({ children }: any) => <div data-testid="accordion">{children}</div>,
  AccordionItem: ({ children, value }: any) => (
    <div data-testid={`accordion-item-${value}`}>{children}</div>
  ),
  AccordionTrigger: ({ children }: any) => <button>{children}</button>,
  AccordionContent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: any) => <div>{children}</div>,
  },
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe('FAQ', () => {
  it('should render FAQ component', () => {
    render(<FAQ />);
    expect(screen.getByTestId('accordion')).toBeInTheDocument();
  });

  it('should render default FAQs', () => {
    render(<FAQ />);
    expect(screen.getByText(/How does AURA's AI create content/)).toBeInTheDocument();
  });

  it('should render custom FAQs from content prop', () => {
    const customContent = {
      faqs: [
        { question: 'Custom Question?', answer: 'Custom Answer' },
      ],
    };
    render(<FAQ content={customContent} />);
    expect(screen.getByText('Custom Question?')).toBeInTheDocument();
  });

  it('should render support CTA if provided', () => {
    const content = {
      supportCTA: {
        title: 'Need Help?',
        description: 'Contact us',
        ctas: [{ text: 'Contact', href: '/contact' }],
      },
    };
    render(<FAQ content={content} />);
    expect(screen.getByText('Need Help?')).toBeInTheDocument();
  });
});
