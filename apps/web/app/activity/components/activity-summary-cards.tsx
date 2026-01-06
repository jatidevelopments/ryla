'use client';

import { CheckCircle2, XCircle, ArrowDown, ArrowUp } from 'lucide-react';
import type { ActivitySummary } from '@ryla/shared';

interface ActivitySummaryCardsProps {
  summary: ActivitySummary;
}

export function ActivitySummaryCards({ summary }: ActivitySummaryCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      <div className="p-4 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle2 className="text-emerald-400 h-4 w-4" />
          <span className="text-xs text-[var(--text-muted)]">Completed</span>
        </div>
        <span className="text-2xl font-bold text-[var(--text-primary)]">
          {summary.generations.completed}
        </span>
      </div>

      <div className="p-4 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <XCircle className="text-red-400 h-4 w-4" />
          <span className="text-xs text-[var(--text-muted)]">Failed</span>
        </div>
        <span className="text-2xl font-bold text-[var(--text-primary)]">
          {summary.generations.failed}
        </span>
      </div>

      <div className="p-4 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <ArrowDown className="text-orange-400 h-4 w-4" />
          <span className="text-xs text-[var(--text-muted)]">Credits Used</span>
        </div>
        <span className="text-2xl font-bold text-[var(--text-primary)]">
          {summary.credits.spent}
        </span>
      </div>

      <div className="p-4 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl">
        <div className="flex items-center gap-2 mb-2">
          <ArrowUp className="text-emerald-400 h-4 w-4" />
          <span className="text-xs text-[var(--text-muted)]">Credits Added</span>
        </div>
        <span className="text-2xl font-bold text-[var(--text-primary)]">
          {summary.credits.added}
        </span>
      </div>
    </div>
  );
}

