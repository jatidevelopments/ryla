import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from './accordion';

vi.mock('@radix-ui/react-accordion', () => ({
  Root: ({ children, ...props }: any) => <div data-testid="accordion-root" {...props}>{children}</div>,
  Item: ({ children, ...props }: any) => <div data-testid="accordion-item" {...props}>{children}</div>,
  Header: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  Trigger: ({ children, ...props }: any) => <button data-testid="accordion-trigger" {...props}>{children}</button>,
  Content: ({ children, ...props }: any) => <div data-testid="accordion-content" {...props}>{children}</div>,
}));

describe('Accordion', () => {
  it('should render Accordion root', () => {
    render(<Accordion />);
    expect(screen.getByTestId('accordion-root')).toBeInTheDocument();
  });

  it('should render AccordionItem', () => {
    render(<AccordionItem value="item-1">Content</AccordionItem>);
    expect(screen.getByTestId('accordion-item')).toBeInTheDocument();
  });

  it('should render AccordionTrigger', () => {
    render(<AccordionTrigger>Trigger</AccordionTrigger>);
    expect(screen.getByTestId('accordion-trigger')).toBeInTheDocument();
    expect(screen.getByText('Trigger')).toBeInTheDocument();
  });

  it('should render AccordionContent', () => {
    render(<AccordionContent>Content</AccordionContent>);
    expect(screen.getByTestId('accordion-content')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should apply custom className to AccordionItem', () => {
    const { container } = render(
      <AccordionItem value="test" className="custom-class" />
    );
    const item = container.querySelector('[data-slot="accordion-item"]');
    expect(item).toHaveClass('custom-class');
  });
});
