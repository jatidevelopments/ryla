import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RylaBadge } from './RylaBadge';

describe('RylaBadge', () => {
  it('should render badge with Ryla.ai text', () => {
    render(<RylaBadge />);
    expect(screen.getByText('Ryla.ai')).toBeInTheDocument();
  });

  it('should position at top-right by default', () => {
    const { container } = render(<RylaBadge />);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('top-2', 'right-2');
  });

  it('should position at top-left when specified', () => {
    const { container } = render(<RylaBadge position="top-left" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('top-2', 'left-2');
  });

  it('should position at bottom-right when specified', () => {
    const { container } = render(<RylaBadge position="bottom-right" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('bottom-2', 'right-2');
  });

  it('should position at bottom-left when specified', () => {
    const { container } = render(<RylaBadge position="bottom-left" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('bottom-2', 'left-2');
  });

  it('should apply custom className', () => {
    const { container } = render(<RylaBadge className="custom-class" />);
    const badge = container.firstChild as HTMLElement;
    expect(badge).toHaveClass('custom-class');
  });
});
