import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StatusFilterGroup } from './StatusFilter';

// Mock Tooltip
vi.mock('../../ui/tooltip', () => ({
  Tooltip: ({ children, content }: any) => (
    <div data-testid="tooltip" title={content}>
      {children}
    </div>
  ),
}));

describe('StatusFilterGroup', () => {
  it('should render all status options', () => {
    render(<StatusFilterGroup status="all" onStatusChange={vi.fn()} />);

    expect(screen.getByText('All')).toBeInTheDocument();
    expect(screen.getByText('✓ Done')).toBeInTheDocument();
    expect(screen.getByText('⟳ Gen')).toBeInTheDocument();
    expect(screen.getByText('✕ Failed')).toBeInTheDocument();
  });

  it('should highlight the active status', () => {
    render(<StatusFilterGroup status="completed" onStatusChange={vi.fn()} />);

    // Check active button styles
    const completedBtn = screen.getByText('✓ Done').closest('button');
    expect(completedBtn).toHaveClass('bg-[var(--purple-500)]');
    expect(completedBtn).toHaveClass('text-white');

    // Check inactive button styles
    const allBtn = screen.getByText('All').closest('button');
    expect(allBtn).not.toHaveClass('bg-[var(--purple-500)]');
  });

  it('should call onStatusChange when an option is clicked', () => {
    const onStatusChange = vi.fn();
    render(<StatusFilterGroup status="all" onStatusChange={onStatusChange} />);

    fireEvent.click(screen.getByText('✓ Done'));
    expect(onStatusChange).toHaveBeenCalledWith('completed');

    fireEvent.click(screen.getByText('⟳ Gen'));
    expect(onStatusChange).toHaveBeenCalledWith('generating');
  });
});
