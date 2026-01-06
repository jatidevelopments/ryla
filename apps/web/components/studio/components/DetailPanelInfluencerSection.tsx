'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Tooltip } from '../../ui/tooltip';
import type { StudioImage } from '../studio-image-card';

interface DetailPanelInfluencerSectionProps {
  image: StudioImage;
}

export function DetailPanelInfluencerSection({
  image,
}: DetailPanelInfluencerSectionProps) {
  return (
    <div className="p-4 border-b border-[var(--border-default)]">
      <div className="flex items-center gap-2 mb-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="h-4 w-4 text-[var(--purple-400)]"
        >
          <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
        </svg>
        <h4 className="text-xs font-medium uppercase tracking-wider text-[var(--text-muted)]">
          AI Influencer
        </h4>
      </div>
      <Tooltip content="View influencer profile">
        <Link
          href={`/influencer/${image.influencerId}`}
          className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-gradient-to-r from-[var(--purple-500)]/5 to-[var(--pink-500)]/5 p-4 transition-all hover:border-[var(--purple-500)]/50 hover:from-[var(--purple-500)]/10 hover:to-[var(--pink-500)]/10"
        >
          {/* Avatar with glow */}
          <div className="relative">
            {image.influencerAvatar ? (
              <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-[var(--purple-500)]/50 group-hover:border-[var(--purple-500)]">
                <Image
                  src={image.influencerAvatar}
                  alt={image.influencerName}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[var(--purple-500)] to-[var(--pink-500)] text-xl font-bold text-white">
                {image.influencerName.charAt(0)}
              </div>
            )}
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-green-500 border-2 border-[#0d0d0f]" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-[var(--text-primary)] truncate">
              {image.influencerName}
            </p>
            <p className="text-sm text-[var(--text-muted)] flex items-center gap-1">
              <span>View profile</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all"
              >
                <path
                  fillRule="evenodd"
                  d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                  clipRule="evenodd"
                />
              </svg>
            </p>
          </div>

          {/* Arrow */}
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--bg-hover)] text-[var(--text-muted)] group-hover:bg-[var(--purple-500)]/20 group-hover:text-[var(--purple-400)] transition-all">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        </Link>
      </Tooltip>
    </div>
  );
}

