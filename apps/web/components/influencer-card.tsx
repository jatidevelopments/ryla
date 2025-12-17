'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn, MagicCard } from '@ryla/ui';
import type { AIInfluencer } from '@ryla/shared';

export interface InfluencerCardProps {
  influencer: AIInfluencer;
  className?: string;
}

export function InfluencerCard({ influencer, className }: InfluencerCardProps) {
  return (
    <Link
      href={`/influencer/${influencer.id}`}
      className={cn('group block', className)}
    >
      <MagicCard
        gradientFrom="rgba(255, 255, 255, 0.15)"
        gradientTo="rgba(255, 255, 255, 0.08)"
        gradientSize={300}
        gradientOpacity={0.3}
        gradientColor="rgba(255, 255, 255, 0.1)"
        className="rounded-xl overflow-hidden h-full"
      >
        <div className="flex flex-col h-full">
          {/* Avatar */}
          <div className="relative aspect-square overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--purple-600)]/20 to-[var(--pink-500)]/20" />
            {influencer.avatar ? (
              <Image
                src={influencer.avatar}
                alt={influencer.name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-[var(--purple-600)]/30 to-[var(--pink-500)]/30">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-16 w-16 text-[var(--purple-400)]"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
            {/* NSFW badge */}
            {influencer.nsfwEnabled && (
              <div className="absolute right-2 top-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-lg">
                18+
              </div>
            )}
            {/* Gradient overlay */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
          </div>

          {/* Info */}
          <div className="flex flex-1 flex-col p-4">
            <h3 className="font-semibold text-[var(--text-primary)] truncate text-lg">
              {influencer.name}
            </h3>
            <p className="text-sm text-[var(--text-muted)] truncate">
              {influencer.handle}
            </p>

            {/* Stats */}
            <div className="mt-3 flex items-center gap-4 text-sm text-[var(--text-secondary)]">
              <span className="flex items-center gap-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4 text-[var(--purple-400)]"
                >
                  <path
                    fillRule="evenodd"
                    d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="font-medium">{influencer.imageCount}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-4 w-4 text-[var(--pink-400)]"
                >
                  <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
                </svg>
                <span className="font-medium">{influencer.likedCount}</span>
                <span className="text-xs text-white/50">shortlisted</span>
              </span>
            </div>

            {/* Archetype tag */}
            <div className="mt-3">
              <span className="inline-block rounded-full bg-gradient-to-r from-[var(--purple-600)]/20 to-[var(--pink-500)]/20 border border-[var(--purple-500)]/30 px-3 py-1 text-xs font-medium text-[var(--purple-400)] capitalize">
                {influencer.archetype.replace(/-/g, ' ')}
              </span>
            </div>
          </div>
        </div>
      </MagicCard>
    </Link>
  );
}
