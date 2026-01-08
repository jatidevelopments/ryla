'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import { Tooltip } from '../../ui/tooltip';
import type { AdultFilter } from '../studio-toolbar';

interface AdultFilterProps {
  adult: AdultFilter;
  onAdultChange: (adult: AdultFilter) => void;
}

const ADULT_OPTIONS = ['all', 'adult', 'not-adult'] as const;

const TOOLTIPS: Record<AdultFilter, string> = {
  all: 'Show all images',
  adult: 'Show only adult content images',
  'not-adult': 'Show only safe content images',
};

export function AdultFilter({ adult, onAdultChange }: AdultFilterProps) {
  return (
    <div className="flex rounded-lg md:rounded-lg border border-[var(--border-default)] bg-[var(--bg-base)] p-0.5">
      {ADULT_OPTIONS.map((a) => (
        <Tooltip key={a} content={TOOLTIPS[a]}>
          <button
            onClick={() => onAdultChange(a)}
            className={cn(
              'rounded-md md:rounded-md px-2 md:px-3 min-h-[44px] md:min-h-0 min-w-[44px] md:min-w-0 py-2 md:py-1.5 text-xs font-medium transition-all flex items-center gap-1',
              adult === a
                ? 'bg-[var(--purple-500)] text-white shadow-sm'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
            )}
          >
            {a === 'all' ? (
              'All'
            ) : a === 'adult' ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-3 w-3"
                >
                  <path
                    fillRule="evenodd"
                    d="M13.5 2.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15.5 4.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM13.5 6.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15.5 8.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM9.5 2.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM11.5 4.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM9.5 6.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM11.5 8.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM4.394 4.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.394 6.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM4.394 8.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM16.5 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM12 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6z"
                    clipRule="evenodd"
                  />
                </svg>
                Adult
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-3 w-3"
                >
                  <path
                    fillRule="evenodd"
                    d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Safe
              </>
            )}
          </button>
        </Tooltip>
      ))}
    </div>
  );
}
