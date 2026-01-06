'use client';

import { cn } from '@ryla/ui';

interface DetailPanelEmptyStateProps {
  className?: string;
}

export function DetailPanelEmptyState({ className }: DetailPanelEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center border-l border-[var(--border-default)] bg-[var(--bg-elevated)] p-8 text-center',
        className
      )}
    >
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--purple-500)]/10 to-[var(--pink-500)]/10 border border-[var(--border-default)]">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1}
          stroke="currentColor"
          className="h-12 w-12 text-[var(--text-muted)]"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
          />
        </svg>
      </div>
      <p className="text-lg font-semibold text-[var(--text-primary)] mb-2">
        Select an image
      </p>
      <p className="text-sm text-[var(--text-muted)] max-w-[200px]">
        Click on any image to view details and edit options
      </p>
    </div>
  );
}

