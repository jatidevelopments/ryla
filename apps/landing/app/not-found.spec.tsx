import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import NotFound from './not-found';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('NotFound', () => {
  it('should render 404 message', () => {
    render(<NotFound />);
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Page not found')).toBeInTheDocument();
    expect(screen.getByText(/The page you're looking for doesn't exist or has been moved/)).toBeInTheDocument();
  });

  it('should have Go home link', () => {
    render(<NotFound />);
    const goHomeLink = screen.getByText('Go home');
    expect(goHomeLink).toBeInTheDocument();
    expect(goHomeLink.closest('a')).toHaveAttribute('href', '/');
  });

  it('should have correct styling classes', () => {
    const { container } = render(<NotFound />);
    const mainDiv = container.firstChild as HTMLElement;
    expect(mainDiv).toHaveClass('min-h-screen');
  });
});
