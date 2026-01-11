'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn, Input } from '@ryla/ui';

export interface StudioFilters {
  influencerId: string | null;
  status: 'all' | 'completed' | 'generating' | 'failed';
  sortBy: 'newest' | 'oldest';
  search: string;
}

interface InfluencerOption {
  id: string;
  name: string;
  avatar?: string;
}

interface StudioFiltersProps {
  filters: StudioFilters;
  onFiltersChange: (filters: Partial<StudioFilters>) => void;
  influencers: InfluencerOption[];
  totalCount: number;
  className?: string;
}

export function StudioFiltersBar({
  filters,
  onFiltersChange,
  influencers,
  totalCount,
  className,
}: StudioFiltersProps) {
  const [showInfluencerDropdown, setShowInfluencerDropdown] =
    React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowInfluencerDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedInfluencer = influencers.find(
    (i) => i.id === filters.influencerId
  );

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Top Row - Search & Count */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-white">Studio</h1>
          <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/60">
            {totalCount} images
          </span>
        </div>

        {/* Search */}
        <div className="relative w-64">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
            />
          </svg>
          <Input
            type="text"
            placeholder="Search by prompt..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="h-10 bg-white/5 border-white/10 pl-10 text-sm placeholder:text-white/40 focus:border-[var(--purple-500)] focus:ring-[var(--purple-500)]/20"
          />
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Influencer Filter */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowInfluencerDropdown(!showInfluencerDropdown)}
            className={cn(
              'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-all',
              filters.influencerId
                ? 'border-[var(--purple-500)] bg-[var(--purple-500)]/20 text-white'
                : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white'
            )}
          >
            {selectedInfluencer ? (
              <>
                {selectedInfluencer.avatar ? (
                  <div className="relative h-5 w-5 overflow-hidden rounded-full">
                    <Image
                      src={selectedInfluencer.avatar}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-br from-[var(--purple-500)] to-[var(--pink-500)] text-xs font-bold">
                    {selectedInfluencer.name.charAt(0)}
                  </div>
                )}
                <span>{selectedInfluencer.name}</span>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                  />
                </svg>
                <span>All Influencers</span>
              </>
            )}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className={cn(
                'h-4 w-4 transition-transform',
                showInfluencerDropdown && 'rotate-180'
              )}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
              />
            </svg>
          </button>

          {/* Dropdown */}
          {showInfluencerDropdown && (
            <div className="absolute left-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-xl border border-white/10 bg-[#1a1a1d] shadow-xl">
              <div className="max-h-64 overflow-y-auto p-2">
                {/* All option */}
                <button
                  onClick={() => {
                    onFiltersChange({ influencerId: null });
                    setShowInfluencerDropdown(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                    !filters.influencerId
                      ? 'bg-[var(--purple-500)]/20 text-white'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="h-4 w-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                      />
                    </svg>
                  </div>
                  <span className="font-medium">All Influencers</span>
                </button>

                {/* Influencer list */}
                {influencers.map((influencer) => (
                  <button
                    key={influencer.id}
                    onClick={() => {
                      onFiltersChange({ influencerId: influencer.id });
                      setShowInfluencerDropdown(false);
                    }}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                      filters.influencerId === influencer.id
                        ? 'bg-[var(--purple-500)]/20 text-white'
                        : 'text-white/60 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    {influencer.avatar ? (
                      <div className="relative h-8 w-8 overflow-hidden rounded-full border border-[var(--purple-500)]/30">
                        <Image
                          src={influencer.avatar}
                          alt=""
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--purple-500)] to-[var(--pink-500)] text-sm font-bold text-white">
                        {influencer.name.charAt(0)}
                      </div>
                    )}
                    <span className="font-medium">{influencer.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Status Filter */}
        <div className="flex rounded-full border border-white/10 bg-white/5 p-1">
          {(['all', 'completed', 'generating', 'failed'] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => onFiltersChange({ status })}
                className={cn(
                  'rounded-full px-4 py-1.5 text-sm font-medium transition-all',
                  filters.status === status
                    ? 'bg-[var(--purple-500)] text-white'
                    : 'text-white/50 hover:text-white'
                )}
              >
                {status === 'all'
                  ? 'All'
                  : status === 'completed'
                  ? 'Completed'
                  : status === 'generating'
                  ? 'Generating'
                  : 'Failed'}
              </button>
            )
          )}
        </div>

        {/* Sort */}
        <div className="ml-auto flex items-center gap-2">
          <span className="text-sm text-white/40">Sort by:</span>
          <select
            value={filters.sortBy}
            onChange={(e) =>
              onFiltersChange({ sortBy: e.target.value as 'newest' | 'oldest' })
            }
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:border-[var(--purple-500)] focus:outline-none focus:ring-1 focus:ring-[var(--purple-500)]"
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </div>
    </div>
  );
}
