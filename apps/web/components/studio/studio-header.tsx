'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
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

const MAX_VISIBLE_INFLUENCERS = 5;

export function StudioHeader({
  influencers,
  selectedInfluencerId,
  onSelectInfluencer,
  searchQuery,
  onSearchChange,
  totalCount,
  className,
}: StudioHeaderProps) {
  const [showMoreDropdown, setShowMoreDropdown] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const [mounted, setMounted] = React.useState(false);

  // Calculate visible and hidden influencers
  // Always show the most recently used influencer (first in sorted list)
  // and up to MAX_VISIBLE_INFLUENCERS total
  const visibleInfluencers = React.useMemo(() => {
    if (influencers.length <= MAX_VISIBLE_INFLUENCERS) {
      return influencers;
    }
    return influencers.slice(0, MAX_VISIBLE_INFLUENCERS);
  }, [influencers]);

  const hiddenInfluencers = React.useMemo(() => {
    if (influencers.length <= MAX_VISIBLE_INFLUENCERS) {
      return [];
    }
    return influencers.slice(MAX_VISIBLE_INFLUENCERS);
  }, [influencers]);

  // Calculate position based on button element
  React.useEffect(() => {
    setMounted(true);
    
    const updatePosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 8,
          left: rect.right - 256, // 256 = w-64 (dropdown width)
        });
      }
    };
    
    if (showMoreDropdown) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }
  }, [showMoreDropdown]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowMoreDropdown(false);
      }
    }

    if (showMoreDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showMoreDropdown]);

  return (
    <div className={cn('border-b border-[var(--border-default)] bg-[var(--bg-elevated)]', className)}>
      {/* Top Navigation Tabs - Like Higgsfield */}
      <div className="flex items-center gap-4 px-4 py-3">
        {/* Left - Main tabs */}
        <div className="flex items-center gap-1 min-w-0" style={{ maxWidth: 'calc(100% - 300px)' }}>
          <button
            onClick={() => onSelectInfluencer(null)}
            className={cn(
              'flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all flex-shrink-0',
              !selectedInfluencerId
                ? 'bg-[var(--purple-500)] text-white shadow-lg shadow-[var(--purple-500)]/20'
                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
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
            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-medium">
              {totalCount}
            </span>
          </button>

          {/* Divider */}
          <div className="mx-3 h-6 w-px bg-[var(--border-default)] flex-shrink-0" />

          {/* Influencer Tabs - Limited Width with Overflow */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-2 min-w-0 overflow-hidden">
              {visibleInfluencers.map((influencer) => (
                <button
                  key={influencer.id}
                  onClick={() => onSelectInfluencer(influencer.id)}
                  className={cn(
                    'flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all whitespace-nowrap flex-shrink-0',
                    selectedInfluencerId === influencer.id
                      ? 'bg-[var(--purple-500)]/20 text-[var(--text-primary)] border border-[var(--purple-500)]/50'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] border border-transparent'
                  )}
                >
                  {influencer.avatar ? (
                    <div className="relative h-6 w-6 overflow-hidden rounded-full border border-[var(--purple-500)]/30 flex-shrink-0">
                      <Image
                        src={influencer.avatar}
                        alt={influencer.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-[var(--purple-500)] to-[var(--pink-500)] text-xs font-bold text-white flex-shrink-0">
                      {influencer.name.charAt(0)}
                    </div>
                  )}
                  <span className="max-w-[100px] truncate">{influencer.name}</span>
                  <span className="rounded-full bg-[var(--bg-hover)] px-1.5 py-0.5 text-xs text-[var(--text-muted)] flex-shrink-0">
                    {influencer.imageCount}
                  </span>
                </button>
              ))}
            </div>

            {/* More Influencers Button (Ellipsis) - Always visible when there are hidden influencers */}
            {hiddenInfluencers.length > 0 && (
              <div className="relative flex-shrink-0">
                <button
                  ref={buttonRef}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMoreDropdown(!showMoreDropdown);
                  }}
                  className={cn(
                    'flex items-center justify-center rounded-xl px-3 py-2 text-sm font-medium transition-all h-[36px] w-[36px]',
                    showMoreDropdown
                      ? 'bg-[var(--purple-500)]/20 text-[var(--text-primary)] border border-[var(--purple-500)]/50'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] border border-transparent'
                  )}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path d="M3 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
                    <path d="M8.5 10a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z" />
                    <path d="M15.5 8.5a1.5 1.5 0 100 3 1.5 1.5 0 000-3z" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right - Search - Always visible */}
        <div className="flex items-center gap-3 flex-shrink-0 ml-auto">
          <div className="relative w-64">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
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
              className="h-10 bg-[var(--bg-base)] border-[var(--border-default)] pl-10 text-sm placeholder:text-[var(--text-muted)] focus:border-[var(--purple-500)] focus:ring-[var(--purple-500)]/20 rounded-xl"
            />
          </div>

        </div>
      </div>

      {/* Dropdown Menu - Rendered via Portal */}
      {showMoreDropdown && mounted && hiddenInfluencers.length > 0 && (
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: 'fixed',
              top: position.top,
              left: position.left,
            }}
            className="w-64 max-h-96 overflow-y-auto rounded-xl border border-white/10 bg-[#1a1a1d] shadow-xl z-[9999]"
          >
            <div className="p-2">
              {hiddenInfluencers.map((influencer) => (
                <button
                  key={influencer.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectInfluencer(influencer.id);
                    setShowMoreDropdown(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                    selectedInfluencerId === influencer.id
                      ? 'bg-[var(--purple-500)]/20 text-white'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  )}
                >
                  {influencer.avatar ? (
                    <div className="relative h-8 w-8 overflow-hidden rounded-full border border-[var(--purple-500)]/30 flex-shrink-0">
                      <Image
                        src={influencer.avatar}
                        alt={influencer.name}
                        fill
                        unoptimized
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[var(--purple-500)] to-[var(--pink-500)] text-sm font-bold text-white flex-shrink-0">
                      {influencer.name.charAt(0)}
                    </div>
                  )}
                  <span className="font-medium truncate flex-1">{influencer.name}</span>
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/40 flex-shrink-0">
                    {influencer.imageCount}
                  </span>
                </button>
              ))}
            </div>
          </div>,
          document.body
        )
      )}
    </div>
  );
}

