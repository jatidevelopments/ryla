import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SortDropdown } from './SortDropdown';
import * as React from 'react';

// Mock Tooltip component since it might rely on specific providers or styles
vi.mock('../../ui/tooltip', () => ({
  Tooltip: ({ children, content }: any) => (
    <div data-testid="tooltip" title={content}>
      {children}
    </div>
  ),
}));

describe('SortDropdown', () => {
  it('should render correctly with default props', () => {
    const onSortByChange = vi.fn();
    render(<SortDropdown sortBy="newest" onSortByChange={onSortByChange} />);

    // Check if the select element is rendered
    const select = screen.getByRole('combobox');
    expect(select).toBeInTheDocument();
    expect(select).toHaveValue('newest');

    // Check if label is present (less strict selection)
    expect(screen.getByText('Sort:')).toBeInTheDocument();
  });

  it('should call onSortByChange when value changes', () => {
    const onSortByChange = vi.fn();
    render(<SortDropdown sortBy="newest" onSortByChange={onSortByChange} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'oldest' } });

    expect(onSortByChange).toHaveBeenCalledTimes(1);
    expect(onSortByChange).toHaveBeenCalledWith('oldest');
  });

  it('should reflect the current sortBy value', () => {
    const onSortByChange = vi.fn();
    render(<SortDropdown sortBy="oldest" onSortByChange={onSortByChange} />);

    const select = screen.getByRole('combobox');
    expect(select).toHaveValue('oldest');
  });
});
