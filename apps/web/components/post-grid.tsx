"use client";

import * as React from "react";
import { cn } from "@ryla/ui";
import { PostCard } from "./post-card";
import type { Post } from "@ryla/shared";

export interface PostGridProps {
  posts: Post[];
  onExport?: (post: Post) => void;
  emptyMessage?: string;
  className?: string;
}

export function PostGrid({
  posts,
  onExport,
  emptyMessage = "No posts yet",
  className,
}: PostGridProps) {
  if (posts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1}
          stroke="currentColor"
          className="mb-3 h-12 w-12 text-white/20"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
          />
        </svg>
        <p className="text-sm text-white/40">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",
        className
      )}
    >
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onExport={onExport} />
      ))}
    </div>
  );
}

