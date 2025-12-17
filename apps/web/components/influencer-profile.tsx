'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@ryla/ui';
import type { AIInfluencer } from '@ryla/shared';

export interface InfluencerProfileProps {
  influencer: AIInfluencer;
}

export function InfluencerProfile({ influencer }: InfluencerProfileProps) {
  return (
    <div className="border-b border-white/5 bg-gradient-to-br from-[#1a1a1d] via-[#16161a] to-[#121214] pb-8 pt-4">
      {/* Back navigation */}
      <div className="px-6 py-4">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
              clipRule="evenodd"
            />
          </svg>
          All Influencers
        </Link>
      </div>

      {/* Profile header */}
      <div className="flex flex-col px-6 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        {/* Left: Avatar and Info */}
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left sm:flex-1">
          {/* Avatar */}
          <div className="relative mb-4 h-24 w-24 overflow-hidden rounded-xl border border-white/10 bg-white/5 sm:mb-0 sm:mr-8">
            {influencer.avatar ? (
              <Image
                src={influencer.avatar}
                alt={influencer.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-[var(--purple-600)]/20 to-[var(--pink-500)]/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-10 w-10 text-white/40"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.5 6a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM3.751 20.105a8.25 8.25 0 0116.498 0 .75.75 0 01-.437.695A18.683 18.683 0 0112 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 01-.437-.695z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-1">
              {influencer.name}
            </h1>
            <p className="text-sm text-white/60 mb-3">{influencer.handle}</p>

            {/* Tags */}
            <div className="flex flex-wrap justify-center gap-2 sm:justify-start mb-4">
              <span className="rounded-lg bg-gradient-to-r from-[var(--purple-600)]/15 to-[var(--pink-500)]/15 border border-[var(--purple-500)]/20 px-3 py-1 text-xs font-medium text-[var(--purple-300)] capitalize">
                {influencer.archetype.replace(/-/g, ' ')}
              </span>
              {influencer.personalityTraits.slice(0, 3).map((trait) => (
                <span
                  key={trait}
                  className="rounded-lg bg-white/5 border border-white/10 px-3 py-1 text-xs text-white/60 capitalize"
                >
                  {trait}
                </span>
              ))}
            </div>

            {/* Bio */}
            <p className="text-sm text-white/70">{influencer.bio}</p>
          </div>
        </div>

        {/* Right: Stats and Actions */}
        <div className="flex flex-col items-center mt-6 sm:mt-0 sm:items-end sm:min-w-[280px]">
          {/* Stats */}
          <div className="flex gap-6 mb-6">
            <div className="text-center">
              <div className="text-lg font-semibold text-white">
                {influencer.postCount}
              </div>
              <div className="text-xs text-white/50 mt-0.5">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-white">
                {influencer.imageCount}
              </div>
              <div className="text-xs text-white/50 mt-0.5">Images</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-white">
                {influencer.likedCount}
              </div>
              <div className="text-xs text-white/50 mt-0.5">Shortlisted</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              asChild
              size="sm"
              className="bg-gradient-to-r from-[var(--purple-500)] to-[var(--pink-500)] hover:from-[var(--purple-400)] hover:to-[var(--pink-400)] rounded-lg px-4 h-9"
            >
              <Link href={`/influencer/${influencer.id}/studio`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="mr-1.5 h-4 w-4"
                >
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
                New Post
              </Link>
            </Button>
            <Button
              asChild
              size="sm"
              variant="outline"
              className="rounded-lg px-4 h-9 border-white/10 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white"
            >
              <Link href={`/influencer/${influencer.id}/studio`}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="mr-1.5 h-4 w-4"
                >
                  <path d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z" />
                </svg>
                Generate More
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
