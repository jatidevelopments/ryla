'use client';

import * as React from 'react';

interface CreditsDisplayProps {
  creditsAvailable: number;
}

export function CreditsDisplay({ creditsAvailable }: CreditsDisplayProps) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-[var(--text-muted)]">Credits:</span>
      <span className="font-bold text-[var(--text-primary)]">
        {creditsAvailable.toLocaleString()}
      </span>
    </div>
  );
}

