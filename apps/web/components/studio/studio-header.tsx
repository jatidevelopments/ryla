'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn, Input } from '@ryla/ui';

interface InfluencerTab {
  id: string;
  name: string;
  avatar?: string;
  imageCount: number;
}

interface StudioHeaderProps {
  influencers: InfluencerTab[];
  selectedInfluencerId: string | null;
  onSelectInfluencer: (id: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalCount: number;
  className?: string;
}

export function StudioHeader({
  influencers,
  selectedInfluencerId,
  onSelectInfluencer,
  searchQuery,
  onSearchChange,
  totalCount,
  className,
}: StudioHeaderProps) {
  return (
    <div className={cn('border-b border-white/10 bg-[#0a0a0b]', className)}>
      {/* Top Navigation Tabs - Like Higgsfield */}
      <div className="flex items-center justify-between px-4 py-2">
        {/* Left - Main tabs */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => onSelectInfluencer(null)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all',
              !selectedInfluencerId
                ? 'bg-[var(--purple-500)] text-white'
                : 'text-white/60 hover:bg-white/5 hover:text-white'
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z"
                clipRule="evenodd"
              />
            </svg>
            All Images
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">
              {totalCount}
            </span>
          </button>

          {/* Divider */}
          <div className="mx-2 h-6 w-px bg-white/10" />

          {/* Influencer Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto scroll-hidden">
            {influencers.map((influencer) => (
              <button
                key={influencer.id}
                onClick={() => onSelectInfluencer(influencer.id)}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all whitespace-nowrap',
                  selectedInfluencerId === influencer.id
                    ? 'bg-[var(--purple-500)]/20 text-white border border-[var(--purple-500)]/50'
                    : 'text-white/60 hover:bg-white/5 hover:text-white border border-transparent'
                )}
              >
                {influencer.avatar ? (
                  <div className="relative h-6 w-6 overflow-hidden rounded-full border border-[var(--purple-500)]/30">
                    <Image
                      src={influencer.avatar}
                      alt={influencer.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[var(--purple-500)] to-[var(--pink-500)] text-xs font-bold text-white">
                    {influencer.name.charAt(0)}
                  </div>
                )}
                <span className="max-w-[100px] truncate">{influencer.name}</span>
                <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-xs text-white/50">
                  {influencer.imageCount}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right - Search */}
        <div className="flex items-center gap-3">
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
              placeholder="Search images..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 bg-white/5 border-white/10 pl-10 text-sm placeholder:text-white/40 focus:border-[var(--purple-500)] focus:ring-[var(--purple-500)]/20"
            />
          </div>

        </div>
      </div>
    </div>
  );
}

