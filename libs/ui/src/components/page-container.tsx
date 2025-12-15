"use client";

import * as React from "react";
import { cn } from "../lib/utils";

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Maximum width variant
   */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
  /**
   * Whether to add padding at bottom for bottom nav
   */
  hasBottomNav?: boolean;
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
  full: "max-w-full",
};

const PageContainer = React.forwardRef<HTMLDivElement, PageContainerProps>(
  ({ className, maxWidth = "lg", hasBottomNav = true, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "mx-auto w-full px-4 py-6",
          maxWidthClasses[maxWidth],
          hasBottomNav && "pb-24 md:pb-6",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

PageContainer.displayName = "PageContainer";

export { PageContainer };

