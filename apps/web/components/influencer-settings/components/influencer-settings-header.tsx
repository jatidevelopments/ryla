'use client';

import * as React from 'react';
import { ArrowLeft } from 'lucide-react';

interface InfluencerSettingsHeaderProps {
  onBack: () => void;
}

export function InfluencerSettingsHeader({ onBack }: InfluencerSettingsHeaderProps) {
  return (
    <div className="sticky top-0 z-40 bg-[var(--bg-base)]/95 backdrop-blur-sm border-b border-[var(--border-default)]">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4 lg:px-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] group"
        >
          <div className="w-8 h-8 rounded-lg bg-[var(--bg-subtle)] flex items-center justify-center group-hover:bg-[var(--bg-surface)] transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </div>
          <span className="hidden sm:inline">Back to Profile</span>
        </button>

        <h1 className="text-lg font-semibold text-[var(--text-primary)]">Settings</h1>

        <div className="w-8" /> {/* Spacer for centering */}
      </div>
    </div>
  );
}

