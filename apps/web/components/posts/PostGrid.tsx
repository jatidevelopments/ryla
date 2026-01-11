'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import { PostCard } from './PostCard';
import type { Post } from '@ryla/shared';
import { ImageIcon, Plus } from 'lucide-react';
import Link from 'next/link';

export interface PostGridProps {
  posts: Post[];
  onExport?: (post: Post) => void;
  emptyMessage?: string;
  emptyAction?: {
    label: string;
    href: string;
  };
  className?: string;
}

export function PostGrid({
  posts,
  onExport,
  emptyMessage = 'No posts yet',
  emptyAction,
  className,
}: PostGridProps) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        {/* Empty state illustration */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--purple-500)]/20 to-[var(--pink-500)]/20 rounded-full blur-2xl" />
          <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--bg-subtle)] border border-[var(--border-default)]">
            <ImageIcon className="h-8 w-8 text-[var(--text-muted)]" />
          </div>
        </div>

        <p className="text-sm text-[var(--text-secondary)] mb-1">{emptyMessage}</p>
        <p className="text-xs text-[var(--text-muted)] mb-6">
          Start creating to see your content here
        </p>

        {emptyAction && (
          <Link
            href={emptyAction.href}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[var(--purple-500)] to-[var(--pink-500)] px-5 py-2.5 text-sm font-medium text-white shadow-lg shadow-[var(--purple-500)]/25 transition-all hover:shadow-xl hover:shadow-[var(--purple-500)]/30 hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            {emptyAction.label}
          </Link>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6',
        className
      )}
    >
      {posts.map((post, index) => (
        <div
          key={post.id}
          className="animate-in fade-in slide-in-from-bottom-4 duration-300"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <PostCard post={post} onExport={onExport} />
        </div>
      ))}
    </div>
  );
}
