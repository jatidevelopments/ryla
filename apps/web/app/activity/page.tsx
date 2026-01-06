'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageContainer, FadeInUp } from '@ryla/ui';
import { ProtectedRoute } from '../../components/protected-route';
import { trpc } from '../../lib/trpc';
import { capture } from '@ryla/analytics';
import { useActivityFilters } from './hooks';
import {
  ActivityFilters,
  ActivityList,
  ActivitySummaryCards,
} from './components';
import type { ActivityItem } from '@ryla/shared';

function ActivityContent() {
  const router = useRouter();
  const {
    filter,
    setFilter,
    timeRange,
    setTimeRange,
    customRange,
    setCustomRange,
    currentPage,
    setCurrentPage,
    queryParams,
  } = useActivityFilters();

  // Handle click on generation item to navigate to studio
  const handleActivityClick = (item: ActivityItem) => {
    if (item.sourceType === 'generation_job' && item.characterId) {
      capture('activity_item_clicked', {
        type: item.type,
        characterId: item.characterId,
        hasImage: Boolean(item.thumbnailUrl),
      });
      // Navigate to studio with the image pre-selected
      router.push(`/studio?influencer=${item.characterId}`);
    }
  };

  // Track page view
  useEffect(() => {
    capture('activity_viewed');
  }, []);

  // Fetch summary
  const { data: summary } = trpc.activity.summary.useQuery();

  // Fetch activity list with pagination
  const { data, isLoading } = trpc.activity.list.useQuery(queryParams, {
    // Refetch when window regains focus to show latest activity
    refetchOnWindowFocus: true,
    // Keep data fresh - stale after 30 seconds
    staleTime: 30 * 1000,
  });

  const items = data?.items ?? [];
  const totalCount = data?.totalCount ?? 0;
  const itemsPerPage = 5;
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <PageContainer className="relative">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 right-0 h-[500px] w-[500px] opacity-30"
          style={{
            background:
              'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* Header */}
      <FadeInUp>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[var(--text-primary)]">Activity</h1>
          <p className="mt-1 text-[var(--text-secondary)]">
            Your generation history and credit usage
          </p>
        </div>
      </FadeInUp>

      {/* Summary Cards */}
      {summary && (
        <FadeInUp delay={100}>
          <div className="mb-6">
            <ActivitySummaryCards summary={summary} />
          </div>
        </FadeInUp>
      )}

      {/* Filters */}
      <FadeInUp delay={150}>
        <div className="mb-6">
          <ActivityFilters
            filter={filter}
            onFilterChange={setFilter}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
            customRange={customRange}
            onCustomRangeChange={setCustomRange}
          />
        </div>
      </FadeInUp>

      {/* Activity List */}
      <FadeInUp delay={200}>
        <ActivityList
          items={items}
          isLoading={isLoading}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onItemClick={handleActivityClick}
        />
      </FadeInUp>
    </PageContainer>
  );
}

export default function ActivityPage() {
  return (
    <ProtectedRoute>
      <ActivityContent />
    </ProtectedRoute>
  );
}
