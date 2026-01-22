'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@ryla/ui';
import type { AIInfluencer } from '@ryla/shared';
import { Heart, Sparkles, LayoutGrid, Images } from 'lucide-react';

export interface InfluencerCardProps {
  influencer: AIInfluencer;
  className?: string;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function InfluencerCard({ influencer, className }: InfluencerCardProps) {
  const [imageError, setImageError] = React.useState(false);
  const hasValidImage = influencer.avatar && !imageError;

  return (
    <Link
      href={`/influencer/${influencer.id}`}
      className={cn('group block focus-visible:outline-none', className)}
    >
      <div className="relative overflow-hidden rounded-2xl bg-[var(--bg-elevated)] border border-[var(--border-default)] transition-all duration-300 ease-out group-hover:border-[var(--purple-500)]/40 group-hover:shadow-[0_0_40px_rgba(168,85,247,0.15)] group-hover:scale-[1.02] group-active:scale-[0.98] group-focus-visible:ring-2 group-focus-visible:ring-[var(--purple-500)] group-focus-visible:ring-offset-2 group-focus-visible:ring-offset-[var(--bg-primary)]">
        {/* Image Container */}
        <div className="relative aspect-[4/5] overflow-hidden">
          {hasValidImage ? (
            <>
              <Image
                src={influencer.avatar!}
                alt={influencer.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                onError={() => setImageError(true)}
              />
              {/* Subtle overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-70" />
            </>
          ) : (
            /* Beautiful placeholder with initials */
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--purple-600)]/80 via-[var(--purple-500)]/60 to-[var(--pink-500)]/70">
              {/* Decorative pattern */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-[15%] left-[10%] h-32 w-32 rounded-full bg-white/10 blur-3xl" />
                <div className="absolute bottom-[20%] right-[15%] h-40 w-40 rounded-full bg-[var(--pink-500)]/30 blur-3xl" />
              </div>
              {/* Initials */}
              <div className="relative flex h-full items-center justify-center">
                <span className="text-5xl font-bold text-white/90 tracking-tight drop-shadow-lg">
                  {getInitials(influencer.name)}
                </span>
              </div>
              {/* Bottom gradient for text */}
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent" />
            </div>
          )}

          {/* NSFW badge */}
          {influencer.nsfwEnabled && (
            <div className="absolute right-3 top-3 rounded-md bg-red-500/90 backdrop-blur-sm px-2 py-0.5 text-[10px] font-bold text-white shadow-lg">
              18+
            </div>
          )}

          {/* Floating Stats - positioned at bottom of image */}
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-center opacity-0 translate-y-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0">
            <div className="flex items-center gap-2 rounded-xl bg-black/60 backdrop-blur-sm px-3 py-1.5">
              {/* Posts */}
              <div className="flex items-center gap-1" title="Posts">
                <LayoutGrid className="h-3 w-3 text-[var(--purple-400)]" />
                <span className="text-[11px] font-medium text-white">
                  {influencer.postCount}
                </span>
              </div>
              <div className="w-px h-3 bg-white/20" />
              {/* Images */}
              <div className="flex items-center gap-1" title="Images">
                <Images className="h-3 w-3 text-[var(--purple-400)]" />
                <span className="text-[11px] font-medium text-white">
                  {influencer.imageCount}
                </span>
              </div>
              {influencer.likedCount > 0 && (
                <>
                  <div className="w-px h-3 bg-white/20" />
                  {/* Liked */}
                  <div className="flex items-center gap-1" title="Liked">
                    <Heart className="h-3 w-3 text-[var(--pink-400)] fill-[var(--pink-400)]" />
                    <span className="text-[11px] font-medium text-white">
                      {influencer.likedCount}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Info Section */}
        <div className="p-4">
          {/* Name & Handle */}
          <div className="mb-3">
            <h3 className="font-semibold text-[var(--text-primary)] truncate text-base leading-snug">
              {influencer.name}
            </h3>
            <p className="text-sm text-[var(--text-muted)] truncate mt-0.5">
              {influencer.handle}
            </p>
          </div>

          {/* Archetype Badge */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--purple-500)]/10 px-3 py-1.5 text-xs font-medium text-[var(--purple-400)] border border-[var(--purple-500)]/20 transition-colors duration-200 group-hover:bg-[var(--purple-500)]/15 group-hover:border-[var(--purple-500)]/30">
              <Sparkles className="h-3 w-3" />
              <span className="capitalize">
                {influencer.archetype.replace(/-/g, ' ')}
              </span>
            </span>
          </div>
        </div>

        {/* Subtle glow effect on hover */}
        <div className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none">
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-[var(--purple-500)]/20 via-transparent to-[var(--pink-500)]/20" />
        </div>
      </div>
    </Link>
  );
}
