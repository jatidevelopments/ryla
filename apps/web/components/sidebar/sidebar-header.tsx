'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ChevronLeftIcon } from './sidebar-icons';

interface SidebarHeaderProps {
  isExpanded: boolean;
  isMobile: boolean;
  onLinkClick: () => void;
  onToggleSidebar: () => void;
}

export function SidebarHeader({
  isExpanded,
  isMobile,
  onLinkClick,
  onToggleSidebar,
}: SidebarHeaderProps) {
  return (
    <div className="flex items-center justify-between w-full h-full px-5">
      <Link
        href="/dashboard"
        onClick={onLinkClick}
        className="flex items-center overflow-hidden"
      >
        <Image
          src="/logos/Ryla_Logo_white.png"
          alt="RYLA"
          width={100}
          height={32}
          className="h-8 w-auto shrink-0"
        />
      </Link>

      {/* Collapse toggle - desktop only */}
      {!isMobile && isExpanded && (
        <button
          onClick={onToggleSidebar}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-[var(--text-muted)] hover:text-white hover:bg-white/10 transition-all shrink-0"
        >
          <ChevronLeftIcon />
        </button>
      )}
    </div>
  );
}

