"use client";

import * as React from "react";
import Image from "next/image";
import { cn, Button, Checkbox } from "@ryla/ui";
import { useInfluencerStore } from "@ryla/business";
import type { Post } from "@ryla/shared";

export interface LikedPostRowProps {
  post: Post;
  selected?: boolean;
  onSelect?: (selected: boolean) => void;
  className?: string;
}

export function LikedPostRow({
  post,
  selected = false,
  onSelect,
  className,
}: LikedPostRowProps) {
  const toggleLike = useInfluencerStore((state) => state.toggleLike);
  const [copied, setCopied] = React.useState(false);

  const handleCopyCaption = async () => {
    try {
      await navigator.clipboard.writeText(post.caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy caption:", err);
    }
  };

  const handleDownload = () => {
    // Simulate download - in production would trigger actual file download
    alert(`Downloading: ${post.imageUrl || "image.jpg"}`);
  };

  const handleUnlike = () => {
    toggleLike(post.id);
  };

  return (
    <div
      className={cn(
        "flex items-start gap-4 rounded-lg border border-white/10 bg-white/5 p-3 transition-colors",
        selected && "border-[#b99cff]/50 bg-[#b99cff]/10",
        className
      )}
    >
      {/* Checkbox */}
      {onSelect && (
        <div className="flex items-center pt-1">
          <Checkbox
            checked={selected}
            onCheckedChange={onSelect}
            className="border-white/30 data-[state=checked]:bg-[#b99cff] data-[state=checked]:border-[#b99cff]"
          />
        </div>
      )}

      {/* Thumbnail */}
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg">
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
            📷
          </div>
        )}
      </div>

      {/* Caption */}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-2 text-sm text-white/80">{post.caption}</p>
        <p className="mt-1 text-xs text-white/40">
          {new Date(post.createdAt).toLocaleDateString()}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-shrink-0 items-center gap-1">
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
          onClick={handleDownload}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-white/60 transition-colors hover:bg-white/20 hover:text-white"
          title="Download image"
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

        <button
          onClick={handleUnlike}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-red-400/80 transition-colors hover:bg-red-500/20 hover:text-red-400"
          title="Remove from liked"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

