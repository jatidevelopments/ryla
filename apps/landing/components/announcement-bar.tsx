"use client";

import { Badge } from "@/components/ui/badge";
import Marquee from "@/components/ui/marquee";
import { ArrowRight } from "lucide-react";

interface AnnouncementBarProps {
  variant?: "default" | "overlay";
}

export function AnnouncementBar({ variant = "default" }: AnnouncementBarProps) {
  const bgClasses =
    variant === "overlay"
      ? "bg-linear-to-r from-purple-600/90 to-pink-600/90 backdrop-blur-md"
      : "bg-linear-to-r from-purple-600 to-pink-600 dark:from-purple-500 dark:to-pink-500";

  return (
    <div className={`overflow-hidden ${bgClasses} text-white`}>
      <Marquee className="py-2" pauseOnHover>
        <div className="flex items-center space-x-8">
          <div className="flex items-center space-x-2">
            <Badge
              variant="secondary"
              className="bg-white/20 text-white border-white/30"
            >
              🚀 New
            </Badge>
            <span className="text-sm font-medium">
              Auto-post to Instagram & TikTok — Try free →
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              variant="secondary"
              className="bg-white/20 text-white border-white/30"
            >
              🎉 2.3M+ Posts Generated
            </Badge>
            <span className="text-sm font-medium">
              Join thousands of creators earning with AI
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              variant="secondary"
              className="bg-white/20 text-white border-white/30"
            >
              ⚡ Live Demo
            </Badge>
            <span className="text-sm font-medium">
              See AURA in action — Watch now
            </span>
          </div>
        </div>
      </Marquee>
    </div>
  );
}
