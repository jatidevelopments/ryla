import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FAQSection } from './FAQSection';

// Mock dependencies
vi.mock('@/components/ryla-ui', () => ({
  SectionHeader: ({ title }: any) => <h2>{title}</h2>,
}));

vi.mock('@/components/animations', () => ({
  FadeInUp: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('@/data/faqs', () => ({
  faqs: [
    { question: 'Test Question 1?', answer: 'Test Answer 1' },
    { question: 'Test Question 2?', answer: 'Test Answer 2' },
  ],
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('FAQSection', () => {
  it('should render FAQ section', () => {
    const { container } = render(<FAQSection />);
    // FAQ section renders as a section element, check for it
    expect(container.querySelector('section')).toBeInTheDocument();
  });

  it('should render FAQ items', () => {
    render(<FAQSection />);
    expect(screen.getByText('Test Question 1?')).toBeInTheDocument();
    expect(screen.getByText('Test Question 2?')).toBeInTheDocument();
  });

  it('should toggle FAQ item on click', async () => {
    const user = userEvent.setup();
    render(<FAQSection />);

    const question1 = screen.getByText('Test Question 1?');
    expect(screen.queryByText('Test Answer 1')).not.toBeInTheDocument();

    await user.click(question1);
    expect(screen.getByText('Test Answer 1')).toBeInTheDocument();

    await user.click(question1);
    expect(screen.queryByText('Test Answer 1')).not.toBeInTheDocument();
  });

  it('should only have one FAQ open at a time', async () => {
    const user = userEvent.setup();
    render(<FAQSection />);

    const question1 = screen.getByText('Test Question 1?');
    const question2 = screen.getByText('Test Question 2?');

    await user.click(question1);
    expect(screen.getByText('Test Answer 1')).toBeInTheDocument();
    expect(screen.queryByText('Test Answer 2')).not.toBeInTheDocument();

    await user.click(question2);
    expect(screen.queryByText('Test Answer 1')).not.toBeInTheDocument();
    expect(screen.getByText('Test Answer 2')).toBeInTheDocument();
  });
});
