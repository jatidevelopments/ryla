import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HowItWorks } from './how-it-works';

// Mock dependencies
vi.mock('@/components/ui/tabs', () => ({
  Tabs: ({ children }: any) => <div data-testid="tabs">{children}</div>,
  TabsContent: ({ children, value }: any) => <div data-testid={`tabs-content-${value}`}>{children}</div>,
  TabsList: ({ children }: any) => <div data-testid="tabs-list">{children}</div>,
  TabsTrigger: ({ children, value }: any) => <button data-testid={`tabs-trigger-${value}`}>{children}</button>,
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
  CardHeader: ({ children }: any) => <div>{children}</div>,
  CardTitle: ({ children }: any) => <h3>{children}</h3>,
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: any) => <div>{children}</div>,
  },
}));

vi.mock('next/image', () => ({
  default: ({ src, alt }: any) => <img src={src} alt={alt} />,
}));

vi.mock('lucide-react', () => ({
  User: () => <div data-testid="user-icon" />,
  Wand2: () => <div data-testid="wand-icon" />,
  Share2: () => <div data-testid="share-icon" />,
  DollarSign: () => <div data-testid="dollar-icon" />,
  ArrowRight: () => <div data-testid="arrow-icon" />,
}));

describe('HowItWorks', () => {
  it('should render how it works component', () => {
    render(<HowItWorks />);
    expect(screen.getByTestId('tabs')).toBeInTheDocument();
  });

  it('should render default steps', () => {
    render(<HowItWorks />);
    // Steps appear multiple times (in tabs and content), use getAllByText
    const createPersona = screen.getAllByText('Create Persona');
    expect(createPersona.length).toBeGreaterThan(0);
    const generateContent = screen.getAllByText('Generate Content');
    expect(generateContent.length).toBeGreaterThan(0);
  });

  it('should render custom steps from content prop', () => {
    const content = {
      steps: [
        {
          id: 'step1',
          title: 'Custom Step',
          description: 'Custom Description',
        },
      ],
    };
    render(<HowItWorks content={content} />);
    // Custom step might appear multiple times in tabs, use getAllByText
    expect(screen.getAllByText('Custom Step')[0]).toBeInTheDocument();
  });

  it('should render tabs for steps', () => {
    render(<HowItWorks />);
    expect(screen.getByTestId('tabs-list')).toBeInTheDocument();
  });
});
