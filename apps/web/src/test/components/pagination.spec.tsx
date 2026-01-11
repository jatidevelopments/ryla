import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
// Import source directly to test logic
import { Pagination as RealPagination } from '../../../../../libs/ui/src/components/pagination';

describe('Pagination', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 10,
    onPageChange: vi.fn(),
  };

  // Helper to resize window
  const resizeWindow = (width: number) => {
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: width,
    });
    act(() => {
      window.dispatchEvent(new Event('resize'));
    });
  };

  beforeEach(() => {
    // Default to desktop
    resizeWindow(1024);
    vi.clearAllMocks();
  });

  it('should render pagination', () => {
    render(<RealPagination {...defaultProps} />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('should render page numbers', () => {
    render(<RealPagination {...defaultProps} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('should handle next page', () => {
    render(<RealPagination {...defaultProps} />);
    const nextButton = screen.getByLabelText('Go to next page');
    fireEvent.click(nextButton);
    expect(defaultProps.onPageChange).toHaveBeenCalledWith(2);
  });

  it('should disable prev button on first page', () => {
    render(<RealPagination {...defaultProps} />);
    const prevButton = screen.getByLabelText('Go to previous page');
    expect(prevButton).toBeDisabled();
  });

  it('should disable next button on last page', () => {
    render(<RealPagination {...defaultProps} currentPage={10} />);
    const nextButton = screen.getByLabelText('Go to next page');
    expect(nextButton).toBeDisabled();
  });

  it('should show fewer pages on mobile', () => {
    // Set to mobile width
    resizeWindow(375);

    render(<RealPagination {...defaultProps} />);

    // Logic: maxVisiblePages=3. total=10. page=1.
    // getVisiblePages should return [1, 2, 3].
    // Page 1, 2, 3 should be visible.
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();

    // Page 10 (last page) is handled separately in the JSX:
    // {visiblePages[visiblePages.length - 1] < totalPages && ( ... button {totalPages} )}
    // visiblePages last is 3. 3 < 10. So '10' button is rendered.
    expect(screen.getByText('10')).toBeInTheDocument();

    // Page 4 should NOT be in the visible pages list [1, 2, 3] and not the last page (10).
    // So 4 is hidden.
    expect(screen.queryByLabelText('Go to page 4')).not.toBeInTheDocument();
  });
});
