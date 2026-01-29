import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShinyButton } from './shiny-button';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
    a: ({ children, ...props }: any) => <a {...props}>{children}</a>,
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children }: any) => <span>{children}</span>,
  },
}));

describe('ShinyButton', () => {
  it('should render button', () => {
    render(<ShinyButton>Click me</ShinyButton>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should render as link when href is provided', () => {
    render(<ShinyButton href="/test">Link Button</ShinyButton>);
    // ShinyButton with href wraps anchor in motion.div, so find the anchor
    const link = screen.getByText('Link Button').closest('a');
    // Link should exist and have href
    expect(link).toBeTruthy();
    if (link) {
      expect(link).toHaveAttribute('href', '/test');
    }
  });

  it('should handle click events', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<ShinyButton onClick={handleClick}>Click me</ShinyButton>);
    
    await user.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ShinyButton className="custom-class">Button</ShinyButton>
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
