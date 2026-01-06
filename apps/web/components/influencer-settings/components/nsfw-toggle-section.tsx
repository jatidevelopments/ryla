'use client';

import * as React from 'react';
import { Label, cn } from '@ryla/ui';

interface NSFWToggleSectionProps {
  nsfwEnabled: boolean;
  isSaving: boolean;
  onToggle: (checked: boolean) => void;
}

export function NSFWToggleSection({ nsfwEnabled, isSaving, onToggle }: NSFWToggleSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-[var(--text-primary)]">Content Settings</h2>
      <div className="bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 min-w-0">
            <Label htmlFor="nsfw-toggle" className="text-base font-medium text-[var(--text-primary)] cursor-pointer block mb-2">
              Enable Adult Content
            </Label>
            <p className="text-sm text-[var(--text-muted)]">
              18+ only. When enabled, this allows generation of NSFW content and enables access to
              adult models for this AI Influencer.
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {isSaving && (
              <span className="text-xs text-[var(--text-muted)] whitespace-nowrap">Saving...</span>
            )}
            <button
              type="button"
              role="switch"
              aria-checked={nsfwEnabled}
              onClick={() => !isSaving && onToggle(!nsfwEnabled)}
              disabled={isSaving}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--purple-500)] focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed',
                nsfwEnabled
                  ? 'bg-[var(--purple-500)]'
                  : 'bg-white/20 border border-white/30'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  nsfwEnabled ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

