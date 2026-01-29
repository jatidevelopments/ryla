import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RylaButton } from './RylaButton';

// Mock @radix-ui/react-slot
vi.mock('@radix-ui/react-slot', () => ({
  Slot: ({ children, ...props }: any) => <div {...props}>{children}</div>,
}));

describe('RylaButton', () => {
  it('should render button', () => {
    render(<RylaButton>Click me</RylaButton>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('should apply variant classes', () => {
    const { container } = render(<RylaButton variant="primary">Primary</RylaButton>);
    expect(container.firstChild).toHaveClass('bg-gradient-to-r');
  });

  it('should apply size classes', () => {
    const { container } = render(<RylaButton size="lg">Large</RylaButton>);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should handle click events', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    render(<RylaButton onClick={handleClick}>Click me</RylaButton>);
    
    await user.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('should be disabled when disabled prop is set', () => {
    render(<RylaButton disabled>Disabled</RylaButton>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('should render as child component when asChild is true', () => {
    render(
      <RylaButton asChild>
        <a href="/test">Link Button</a>
      </RylaButton>
    );
    expect(screen.getByRole('link')).toBeInTheDocument();
  });
});
