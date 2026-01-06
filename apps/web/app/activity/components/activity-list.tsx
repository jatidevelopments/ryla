'use client';

import { Sparkles } from 'lucide-react';
import { Pagination } from '@ryla/ui';
import type { ActivityItem } from '@ryla/shared';
import { ActivityItem as ActivityItemComponent } from './activity-item';

interface ActivityListProps {
  items: ActivityItem[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onItemClick?: (item: ActivityItem) => void;
}

export function ActivityList({
  items,
  isLoading,
  currentPage,
  totalPages,
  onPageChange,
  onItemClick,
}: ActivityListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="relative h-8 w-8">
          <div className="absolute inset-0 rounded-full border-4 border-[var(--border-default)]" />
          <div className="absolute inset-0 rounded-full border-4 border-t-[var(--purple-500)] animate-spin" />
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
          <Sparkles className="h-8 w-8 text-[var(--text-muted)]" />
        </div>
        <h3 className="text-lg font-medium text-[var(--text-primary)] mb-1">
          No activity yet
        </h3>
        <p className="text-[var(--text-secondary)] max-w-sm">
          Start creating AI influencers to see your generation history and credit usage here.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {items.map((item) => (
          <ActivityItemComponent
            key={item.id}
            item={item}
            onClick={onItemClick ? () => onItemClick(item) : undefined}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center pt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </>
  );
}

