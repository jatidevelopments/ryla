"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@ryla/ui";
import type { AIInfluencer } from "@ryla/shared";

export interface InfluencerCardProps {
  influencer: AIInfluencer;
  className?: string;
}

export function InfluencerCard({ influencer, className }: InfluencerCardProps) {
  return (
    <Link
      href={`/influencer/${influencer.id}`}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all hover:border-[#b99cff]/50 hover:bg-white/10",
        className
      )}
    >
      {/* Avatar */}
      <div className="relative aspect-square overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#d5b9ff]/20 to-[#b99cff]/20" />
        {influencer.avatar ? (
          <Image
            src={influencer.avatar}
            alt={influencer.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">
            👤
          </div>
        )}
        {/* NSFW badge */}
        {influencer.nsfwEnabled && (
          <div className="absolute right-2 top-2 rounded bg-red-500/80 px-1.5 py-0.5 text-[10px] font-bold text-white">
            18+
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col p-3">
        <h3 className="font-semibold text-white truncate">{influencer.name}</h3>
        <p className="text-xs text-white/50 truncate">{influencer.handle}</p>
        
        {/* Stats */}
        <div className="mt-2 flex items-center gap-3 text-xs text-white/40">
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
              <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
            </svg>
            {influencer.imageCount}
          </span>
          <span className="flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
              <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
            </svg>
            {influencer.likedCount}
          </span>
        </div>

        {/* Archetype tag */}
        <div className="mt-2">
          <span className="inline-block rounded-full bg-[#b99cff]/20 px-2 py-0.5 text-[10px] font-medium text-[#b99cff] capitalize">
            {influencer.archetype.replace(/-/g, ' ')}
          </span>
        </div>
      </div>
    </Link>
  );
}

