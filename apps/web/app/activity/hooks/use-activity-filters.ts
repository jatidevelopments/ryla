'use client';

import { useState, useMemo } from 'react';
import type { FilterType, TimeRangeType } from '@ryla/shared';

export function useActivityFilters() {
  const [filter, setFilter] = useState<FilterType>('all');
  const [timeRange, setTimeRange] = useState<TimeRangeType>('all');
  const [customRange, setCustomRange] = useState(() => {
    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    return {
      start: weekAgo.toISOString().split('T')[0],
      end: today.toISOString().split('T')[0],
    };
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Reset to page 1 when filter or time range changes
  const handleFilterChange = (newFilter: FilterType) => {
    setFilter(newFilter);
    setCurrentPage(1);
  };

  const handleTimeRangeChange = (newRange: TimeRangeType) => {
    setTimeRange(newRange);
    setCurrentPage(1);
  };

  const handleCustomRangeChange = (newRange: { start: string; end: string }) => {
    setCustomRange(newRange);
    setCurrentPage(1);
  };

  // Build query params for activity list
  const queryParams = useMemo(() => {
    const params: {
      limit: number;
      page: number;
      filter: FilterType;
      timeRange: TimeRangeType;
      startDate?: string;
      endDate?: string;
    } = {
      limit: itemsPerPage,
      page: currentPage,
      filter,
      timeRange,
    };

    // Add custom date range if selected
    if (timeRange === 'custom') {
      if (customRange.start) {
        params.startDate = new Date(customRange.start).toISOString();
      }
      if (customRange.end) {
        // Set end date to end of day
        const endDate = new Date(customRange.end);
        endDate.setHours(23, 59, 59, 999);
        params.endDate = endDate.toISOString();
      }
    }

    return params;
  }, [itemsPerPage, currentPage, filter, timeRange, customRange]);

  return {
    filter,
    setFilter: handleFilterChange,
    timeRange,
    setTimeRange: handleTimeRangeChange,
    customRange,
    setCustomRange: handleCustomRangeChange,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    queryParams,
  };
}

