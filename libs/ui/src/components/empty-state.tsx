"use client";

import * as React from "react";
import { cn } from "../lib/utils";
import { Button } from "./button";

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Icon to display
   */
  icon?: React.ReactNode;
  /**
   * Title text
   */
  title: string;
  /**
   * Description text
   */
  description?: string;
  /**
   * Primary action button text
   */
  actionLabel?: string;
  /**
   * Primary action callback
   */
  onAction?: () => void;
  /**
   * Action href (if link instead of button)
   */
  actionHref?: string;
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    {
      className,
      icon,
      title,
      description,
      actionLabel,
      onAction,
      actionHref,
      ...props
    },
    ref
  ) => {
    const ActionWrapper = actionHref ? "a" : "button";
    
    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/5 p-8 text-center",
          className
        )}
        {...props}
      >
        {icon && (
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-white/60">
            {icon}
          </div>
        )}
        <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
        {description && (
          <p className="mb-6 max-w-sm text-sm text-white/60">{description}</p>
        )}
        {actionLabel && (
          <Button
            asChild={!!actionHref}
            onClick={onAction}
            className="bg-gradient-to-r from-[#d5b9ff] to-[#b99cff]"
          >
            {actionHref ? (
              <a href={actionHref}>{actionLabel}</a>
            ) : (
              actionLabel
            )}
          </Button>
        )}
      </div>
    );
  }
);

EmptyState.displayName = "EmptyState";

export { EmptyState };

