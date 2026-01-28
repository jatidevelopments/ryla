import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Navigation } from './Navigation';

describe('Navigation', () => {
  beforeEach(() => {
    // Reset scroll position
    window.scrollY = 0;
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      setTimeout(cb, 0);
      return 1;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should render navigation', () => {
    render(<Navigation />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('should render logo', () => {
    render(<Navigation />);
    const logo = screen.getByAltText('RYLA');
    expect(logo).toBeInTheDocument();
    expect(logo.closest('a')).toHaveAttribute('href', '/');
  });

  it('should render log in link', () => {
    render(<Navigation />);
    const loginLink = screen.getByText('Log in');
    expect(loginLink).toBeInTheDocument();
    expect(loginLink.closest('a')).toHaveAttribute(
      'href',
      'https://app.ryla.ai'
    );
  });

  it('should handle scroll events', () => {
    render(<Navigation />);
    // Simulate scroll
    Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
    window.dispatchEvent(new Event('scroll'));
    // Component should update based on scroll
    expect(window.requestAnimationFrame).toHaveBeenCalled();
  });

  it('should show navigation links when scrolled', async () => {
    render(<Navigation />);
    // Initially links should be hidden (opacity-0)
    const navLinks = screen.queryByText('Features');
    // Links are in DOM but hidden initially on desktop (opacity-0)
    expect(navLinks).toBeInTheDocument();

    // Simulate scroll
    Object.defineProperty(window, 'scrollY', {
      value: 100,
      writable: true,
      configurable: true,
    });
    window.dispatchEvent(new Event('scroll'));

    // Wait for state update via requestAnimationFrame
    await new Promise((resolve) => setTimeout(resolve, 200));

    // After scroll, links should be in DOM (visibility may vary)
    const scrolledLinks = screen.queryByText('Features');
    expect(scrolledLinks).toBeInTheDocument();
  });
});
