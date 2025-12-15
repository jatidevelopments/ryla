"use client";

import { ReactNode } from "react";
import { LandingPageHeader } from "./LandingPageHeader";
import { AnnouncementBar } from "@/components/announcement-bar";

interface LandingPageLayoutProps {
  children: ReactNode;
  header: {
    title: string;
    icon: string;
    gradient: string;
    navigation: Array<{
      label: string;
      href: string;
    }>;
    ctaText: string;
    ctaHref?: string;
    variant?: "default" | "overlay";
  };
  className?: string;
}

export function LandingPageLayout({
  children,
  header,
  className = "min-h-screen bg-background",
}: LandingPageLayoutProps) {
  // For overlay variant (video-flow), show only announcement bar
  // For other variants, show full header (which includes announcement bar)
  const isOverlayVariant = header.variant === "overlay";

  return (
    <div className={className}>
      {isOverlayVariant ? (
        <AnnouncementBar variant="overlay" />
      ) : (
        <LandingPageHeader {...header} />
      )}
      {children}
    </div>
  );
}
