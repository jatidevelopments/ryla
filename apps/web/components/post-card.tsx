"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@ryla/ui";
import { useInfluencerStore } from "@ryla/business";
import type { Post } from "@ryla/shared";

export interface PostCardProps {
  post: Post;
  onExport?: (post: Post) => void;
  className?: string;
}

export function PostCard({ post, onExport, className }: PostCardProps) {
  const toggleLike = useInfluencerStore((state) => state.toggleLike);
  const [copied, setCopied] = React.useState(false);

  const handleLike = () => {
    toggleLike(post.id);
  };

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(post.caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy caption:", err);
    }
  };

  const handleExport = () => {
    onExport?.(post);
  };

  // Get aspect ratio class
  const aspectClass =
    post.aspectRatio === "9:16"
      ? "aspect-[9/16]"
      : post.aspectRatio === "2:3"
      ? "aspect-[2/3]"
      : "aspect-square";

  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border border-white/10 bg-white/5",
        className
      )}
    >
      {/* Image */}
      <div className={cn("relative w-full", aspectClass)}>
        <div className="absolute inset-0 bg-gradient-to-br from-[#d5b9ff]/10 to-[#b99cff]/10" />
        {post.imageUrl ? (
          <Image
            src={post.imageUrl}
            alt=""
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-white/30">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1}
              stroke="currentColor"
              className="h-12 w-12"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
              />
            </svg>
          </div>
        )}

        {/* Like indicator overlay */}
        {post.isLiked && (
          <div className="absolute right-2 top-2 rounded-full bg-red-500/90 p-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-3 w-3 text-white"
            >
              <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
            </svg>
          </div>
        )}
      </div>

      {/* Caption + Actions */}
      <div className="p-3">
        <p className="mb-3 line-clamp-2 text-sm text-white/80">{post.caption}</p>
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleLike}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
              post.isLiked
                ? "bg-red-500/20 text-red-400"
                : "bg-white/10 text-white/60 hover:bg-white/20 hover:text-white"
            )}
            title={post.isLiked ? "Unlike" : "Like"}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
            </svg>
          </button>
          
          <button
            onClick={handleCopyCaption}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/60 transition-colors hover:bg-white/20 hover:text-white"
            title={copied ? "Copied!" : "Copy caption"}
          >
            {copied ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4 text-green-400"
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12A1.5 1.5 0 0117 6.622V12.5a1.5 1.5 0 01-1.5 1.5h-1v-3.379a3 3 0 00-.879-2.121L10.5 5.379A3 3 0 008.379 4.5H7v-1z" />
                <path d="M4.5 6A1.5 1.5 0 003 7.5v9A1.5 1.5 0 004.5 18h7a1.5 1.5 0 001.5-1.5v-5.879a1.5 1.5 0 00-.44-1.06L9.44 6.439A1.5 1.5 0 008.378 6H4.5z" />
              </svg>
            )}
          </button>
          
          <button
            onClick={handleExport}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/60 transition-colors hover:bg-white/20 hover:text-white"
            title="Export"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
              <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

