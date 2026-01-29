import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import ErrorComponent from './error';

// Mock next/link
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

describe('Error', () => {
  const mockError = new Error('Test error');
  const mockReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render error message', () => {
    render(<ErrorComponent error={mockError} reset={mockReset} />);
    expect(screen.getByText('Error')).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/An error occurred while loading this page/)).toBeInTheDocument();
  });

  it('should log error to console', () => {
    render(<ErrorComponent error={mockError} reset={mockReset} />);
    expect(console.error).toHaveBeenCalledWith(mockError);
  });

  it('should call reset when Try again button is clicked', async () => {
    const user = userEvent.setup();
    render(<ErrorComponent error={mockError} reset={mockReset} />);
    
    const tryAgainButton = screen.getByText('Try again');
    await user.click(tryAgainButton);
    
    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it('should have Go home link', () => {
    render(<ErrorComponent error={mockError} reset={mockReset} />);
    const goHomeLink = screen.getByText('Go home');
    expect(goHomeLink).toBeInTheDocument();
    expect(goHomeLink.closest('a')).toHaveAttribute('href', '/');
  });

  it('should handle error with digest', () => {
    const errorWithDigest = { ...mockError, digest: 'test-digest' };
    render(<ErrorComponent error={errorWithDigest} reset={mockReset} />);
    expect(screen.getByText('Error')).toBeInTheDocument();
  });
});
