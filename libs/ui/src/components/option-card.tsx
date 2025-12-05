"use client";

import * as React from "react";
import { cn } from "../lib/utils";
import { optionCardVariants, type OptionCardVariants } from "../design-system";

export interface OptionCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    OptionCardVariants {
  /**
   * Image URL to display
   */
  image?: string;
  /**
   * Label text
   */
  label: string;
  /**
   * Optional emoji to display
   */
  emoji?: string;
  /**
   * Whether the option is selected
   */
  selected?: boolean;
  /**
   * Callback when option is clicked
   */
  onSelect?: () => void;
}

const OptionCard = React.forwardRef<HTMLDivElement, OptionCardProps>(
  (
    {
      className,
      variant = "default",
      selected = false,
      size,
      image,
      label,
      emoji,
      onSelect,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        role="button"
        tabIndex={0}
        aria-pressed={selected}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect?.();
          }
        }}
        className={cn(
          optionCardVariants({ variant, selected, size }),
          className
        )}
        {...props}
      >
        {/* Selected indicator */}
        {selected && (
          <div className="absolute top-2 right-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[#b99cff]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-3 w-3 text-white"
            >
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clipRule="evenodd"
              />
            </svg>
          </div>
        )}

        {/* Image variant */}
        {variant === "image" && image && (
          <div className="relative aspect-square w-full overflow-hidden rounded-lg">
            <img
              src={image}
              alt={label}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <span className="text-sm font-medium text-white">{label}</span>
            </div>
          </div>
        )}

        {/* Default variant with emoji */}
        {variant === "default" && (
          <div className="flex flex-col items-center gap-2 py-2">
            {emoji && <span className="text-2xl">{emoji}</span>}
            <span className="text-sm font-medium text-white/90">{label}</span>
          </div>
        )}

        {/* Horizontal variant */}
        {variant === "horizontal" && (
          <div className="flex items-center gap-3">
            {image && (
              <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg">
                <img
                  src={image}
                  alt={label}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            {emoji && !image && (
              <span className="flex-shrink-0 text-2xl">{emoji}</span>
            )}
            <span className="text-sm font-medium text-white/90">{label}</span>
          </div>
        )}
      </div>
    );
  }
);

OptionCard.displayName = "OptionCard";

export { OptionCard };

