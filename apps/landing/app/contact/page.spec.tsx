import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ContactPage from './page';

// Mock dependencies
vi.mock('@/components/sections', () => ({
  Navigation: () => <nav data-testid="navigation">Navigation</nav>,
  Footer: () => <footer data-testid="footer">Footer</footer>,
}));

vi.mock('lucide-react', () => ({
  Mail: () => <div data-testid="mail-icon" />,
  MessageSquare: () => <div data-testid="message-icon" />,
}));

describe('ContactPage', () => {
  it('should render contact page', () => {
    render(<ContactPage />);
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('should render contact heading', () => {
    render(<ContactPage />);
    // Text might be split, check for parts
    expect(screen.getByText(/Get in/i)).toBeInTheDocument();
    expect(screen.getByText(/Touch/i)).toBeInTheDocument();
  });

  it('should render contact options', () => {
    render(<ContactPage />);
    expect(screen.getByText('Email Us')).toBeInTheDocument();
    expect(screen.getByText('Support')).toBeInTheDocument();
  });

  it('should have email links', () => {
    render(<ContactPage />);
    const emailLinks = screen.getAllByText(/support@ryla\.ai/);
    expect(emailLinks.length).toBeGreaterThan(0);
  });
});
