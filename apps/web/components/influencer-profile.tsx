"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@ryla/ui";
import type { AIInfluencer } from "@ryla/shared";

export interface InfluencerProfileProps {
  influencer: AIInfluencer;
}

export function InfluencerProfile({ influencer }: InfluencerProfileProps) {
  return (
    <div className="border-b border-white/10 bg-[#1a1a1f] pb-6">
      {/* Back navigation */}
      <div className="px-4 py-3">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-white"
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
      <div className="flex flex-col items-center px-4 text-center sm:flex-row sm:items-start sm:text-left">
        {/* Avatar */}
        <div className="relative mb-4 h-24 w-24 overflow-hidden rounded-full border-2 border-[#b99cff] sm:mb-0 sm:mr-6">
          {influencer.avatar ? (
            <Image
              src={influencer.avatar}
              alt={influencer.name}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#d5b9ff] to-[#b99cff] text-4xl">
              👤
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">{influencer.name}</h1>
          <p className="text-sm text-white/50">{influencer.handle}</p>

          {/* Tags */}
          <div className="mt-2 flex flex-wrap justify-center gap-1.5 sm:justify-start">
            <span className="rounded-full bg-[#b99cff]/20 px-2 py-0.5 text-xs font-medium text-[#b99cff] capitalize">
              {influencer.archetype.replace(/-/g, " ")}
            </span>
            {influencer.personalityTraits.slice(0, 3).map((trait) => (
              <span
                key={trait}
                className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-white/60 capitalize"
              >
                {trait}
              </span>
            ))}
          </div>

          {/* Bio */}
          <p className="mt-3 text-sm text-white/70">{influencer.bio}</p>

          {/* Stats */}
          <div className="mt-4 flex justify-center gap-6 sm:justify-start">
            <div className="text-center">
              <div className="text-lg font-bold text-white">
                {influencer.postCount}
              </div>
              <div className="text-xs text-white/50">Posts</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">
                {influencer.imageCount}
              </div>
              <div className="text-xs text-white/50">Images</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-white">
                {influencer.likedCount}
              </div>
              <div className="text-xs text-white/50">Liked</div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-4 flex justify-center gap-3 px-4 sm:justify-start sm:pl-[120px]">
        <Button asChild size="sm" className="bg-gradient-to-r from-[#d5b9ff] to-[#b99cff]">
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
        <Button asChild size="sm" variant="outline">
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
  );
}

