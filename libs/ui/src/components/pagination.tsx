'use client';

import * as React from 'react';
import { cn } from '../lib/utils';

export interface PaginationProps {
  /** Current active page (1-indexed) */
  currentPage: number;
  /** Total number of pages */
  totalPages: number;
  /** Callback when page changes */
  onPageChange: (page: number) => void;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show page numbers */
  showPageNumbers?: boolean;
  /** Maximum number of page buttons to show */
  maxVisiblePages?: number;
  /** Size variant */
  size?: 'sm' | 'default' | 'lg';
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-4 w-4', className)}
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('h-4 w-4', className)}
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

/**
 * Pagination Component
 *
 * A clean, minimal pagination component matching the RYLA design system.
 * Features subtle glass-morphism effects and smooth transitions.
 *
 * @example
 * <Pagination
 *   currentPage={1}
 *   totalPages={10}
 *   onPageChange={(page) => setPage(page)}
 * />
 *
 * @example
 * // Compact variant
 * <Pagination
 *   currentPage={1}
 *   totalPages={5}
 *   onPageChange={setPage}
 *   size="sm"
 * />
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  showPageNumbers = true,
  maxVisiblePages = 5,
  size = 'default',
}: PaginationProps) {
  // Calculate which page numbers to show
  const getVisiblePages = () => {
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const half = Math.floor(maxVisiblePages / 2);
    let start = Math.max(1, currentPage - half);
    const end = Math.min(totalPages, start + maxVisiblePages - 1);

    // Adjust start if we're near the end
    if (end - start < maxVisiblePages - 1) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const visiblePages = getVisiblePages();
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  if (totalPages <= 1) {
    return null;
  }

  // Size-based styling
  const sizeStyles = {
    sm: {
      button: 'h-8 w-8 text-xs',
      nav: 'h-8 px-3 text-xs',
      gap: 'gap-1',
    },
    default: {
      button: 'h-9 w-9 text-sm',
      nav: 'h-9 px-4 text-sm',
      gap: 'gap-1.5',
    },
    lg: {
      button: 'h-10 w-10 text-base',
      nav: 'h-10 px-5 text-base',
      gap: 'gap-2',
    },
  };

  const styles = sizeStyles[size];

  // Base button styles
  const baseButtonStyles = cn(
    'inline-flex items-center justify-center rounded-lg font-medium',
    'transition-all duration-200 ease-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple-500)]/50',
    'disabled:pointer-events-none disabled:opacity-40'
  );

  // Inactive page/nav button
  const inactiveStyles = cn(
    baseButtonStyles,
    'bg-white/5 border border-white/10',
    'text-[var(--text-secondary)]',
    'hover:bg-white/10 hover:border-white/20 hover:text-[var(--text-primary)]'
  );

  // Active page button
  const activeStyles = cn(
    baseButtonStyles,
    'bg-[var(--purple-600)] border border-[var(--purple-500)]',
    'text-white shadow-lg shadow-purple-500/20'
  );

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn('flex items-center justify-center', styles.gap, className)}
    >
      {/* Previous Button */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevious}
        aria-label="Go to previous page"
        className={cn(inactiveStyles, styles.nav)}
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </button>

      {/* Page Numbers */}
      {showPageNumbers && (
        <div className={cn('flex items-center', styles.gap)}>
          {/* First page with ellipsis */}
          {visiblePages[0] > 1 && (
            <>
              <button
                type="button"
                onClick={() => onPageChange(1)}
                aria-label="Go to page 1"
                aria-current={currentPage === 1 ? 'page' : undefined}
                className={cn(
                  currentPage === 1 ? activeStyles : inactiveStyles,
                  styles.button
                )}
              >
                1
              </button>
              {visiblePages[0] > 2 && (
                <span className="text-[var(--text-muted)] px-1 select-none">
                  •••
                </span>
              )}
            </>
          )}

          {/* Visible page numbers */}
          {visiblePages.map((page) => (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              aria-label={`Go to page ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
              className={cn(
                currentPage === page ? activeStyles : inactiveStyles,
                styles.button
              )}
            >
              {page}
            </button>
          ))}

          {/* Last page with ellipsis */}
          {visiblePages[visiblePages.length - 1] < totalPages && (
            <>
              {visiblePages[visiblePages.length - 1] < totalPages - 1 && (
                <span className="text-[var(--text-muted)] px-1 select-none">
                  •••
                </span>
              )}
              <button
                type="button"
                onClick={() => onPageChange(totalPages)}
                aria-label={`Go to page ${totalPages}`}
                aria-current={currentPage === totalPages ? 'page' : undefined}
                className={cn(
                  currentPage === totalPages ? activeStyles : inactiveStyles,
                  styles.button
                )}
              >
                {totalPages}
              </button>
            </>
          )}
        </div>
      )}

      {/* Next Button */}
      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext}
        aria-label="Go to next page"
        className={cn(inactiveStyles, styles.nav)}
      >
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    </nav>
  );
}

/**
 * SimplePagination - A minimal pagination showing just prev/next and current position
 *
 * @example
 * <SimplePagination
 *   currentPage={3}
 *   totalPages={10}
 *   onPageChange={setPage}
 * />
 */
export function SimplePagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: Omit<PaginationProps, 'showPageNumbers' | 'maxVisiblePages' | 'size'>) {
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  if (totalPages <= 1) {
    return null;
  }

  const buttonStyles = cn(
    'inline-flex items-center justify-center h-9 px-3 rounded-lg',
    'text-sm font-medium transition-all duration-200',
    'bg-white/5 border border-white/10 text-[var(--text-secondary)]',
    'hover:bg-white/10 hover:border-white/20 hover:text-[var(--text-primary)]',
    'disabled:opacity-40 disabled:pointer-events-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple-500)]/50'
  );

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn('flex items-center justify-center gap-3', className)}
    >
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!hasPrevious}
        aria-label="Go to previous page"
        className={buttonStyles}
      >
        <ChevronLeftIcon className="h-4 w-4" />
      </button>

      <span className="text-sm text-[var(--text-secondary)] tabular-nums">
        <span className="text-[var(--text-primary)] font-medium">{currentPage}</span>
        <span className="mx-1.5 text-[var(--text-muted)]">/</span>
        <span>{totalPages}</span>
      </span>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!hasNext}
        aria-label="Go to next page"
        className={buttonStyles}
      >
        <ChevronRightIcon className="h-4 w-4" />
      </button>
    </nav>
  );
}
