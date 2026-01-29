import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './accordion';

// Mock @radix-ui/react-accordion
vi.mock('@radix-ui/react-accordion', () => ({
  Root: ({ children, ...props }: any) => <div data-testid="accordion-root" {...props}>{children}</div>,
  Item: ({ children, ...props }: any) => <div data-testid="accordion-item" {...props}>{children}</div>,
  Header: ({ children }: any) => <div>{children}</div>,
  Trigger: ({ children, ...props }: any) => <button data-testid="accordion-trigger" {...props}>{children}</button>,
  Content: ({ children, ...props }: any) => <div data-testid="accordion-content" {...props}>{children}</div>,
}));

vi.mock('lucide-react', () => ({
  ChevronDownIcon: () => <div data-testid="chevron-icon" />,
}));

describe('Accordion', () => {
  it('should render accordion', () => {
    render(
      <Accordion>
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    expect(screen.getByTestId('accordion-root')).toBeInTheDocument();
  });

  it('should render accordion items', () => {
    render(
      <Accordion>
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    expect(screen.getByTestId('accordion-item')).toBeInTheDocument();
  });

  it('should render trigger and content', () => {
    render(
      <Accordion>
        <AccordionItem value="item-1">
          <AccordionTrigger>Trigger</AccordionTrigger>
          <AccordionContent>Content</AccordionContent>
        </AccordionItem>
      </Accordion>
    );
    expect(screen.getByText('Trigger')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
