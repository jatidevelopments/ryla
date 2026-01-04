"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

/**
 * Style preset option
 */
export interface StylePresetOption {
  id: string;
  name: string;
  description: string;
  emoji?: string;
  icon?: React.ReactNode;
}

/**
 * Default style presets matching the prompt builder
 */
export const defaultStylePresets: StylePresetOption[] = [
  {
    id: "ultraRealistic",
    name: "Ultra Realistic",
    description: "Maximum realism, smartphone aesthetic",
    emoji: "📱",
  },
  {
    id: "instagramReady",
    name: "Instagram Ready",
    description: "Polished but authentic look",
    emoji: "✨",
  },
  {
    id: "editorialFashion",
    name: "Editorial Fashion",
    description: "Magazine-quality editorial",
    emoji: "📸",
  },
  {
    id: "casualSelfie",
    name: "Casual Selfie",
    description: "Everyday casual vibe",
    emoji: "🤳",
  },
  {
    id: "professionalPortrait",
    name: "Professional Portrait",
    description: "Business headshot quality",
    emoji: "💼",
  },
  {
    id: "quality",
    name: "Standard Quality",
    description: "Basic quality enhancement",
    emoji: "⚡",
  },
];

export interface StylePresetSelectorProps {
  /**
   * Currently selected preset ID
   */
  value?: string;
  /**
   * Callback when preset changes
   */
  onChange?: (presetId: string) => void;
  /**
   * Available presets (defaults to all presets)
   */
  presets?: StylePresetOption[];
  /**
   * Layout mode
   */
  layout?: "grid" | "horizontal" | "compact";
  /**
   * Custom class name
   */
  className?: string;
  /**
   * Whether the selector is disabled
   */
  disabled?: boolean;
}

/**
 * Style Preset Selector
 * 
 * Allows users to select a style preset for prompt generation.
 * Displays presets as selectable cards with descriptions.
 */
export function StylePresetSelector({
  value,
  onChange,
  presets = defaultStylePresets,
  layout = "grid",
  className,
  disabled = false,
}: StylePresetSelectorProps) {
  const layoutClasses = {
    grid: "grid grid-cols-2 sm:grid-cols-3 gap-2",
    horizontal: "flex flex-wrap gap-2",
    compact: "flex flex-wrap gap-1.5",
  };

  return (
    <div className={cn("w-full", className)}>
      <div className={layoutClasses[layout]}>
        {presets.map((preset) => {
          const isSelected = value === preset.id;

          return (
            <button
              key={preset.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange?.(preset.id)}
              className={cn(
                "relative flex flex-col items-start rounded-[10px] p-3 text-left transition-all duration-200",
                "border bg-[#1f1f24] hover:border-white/30",
                layout === "compact" && "flex-row items-center gap-2 p-2",
                isSelected
                  ? "border-2 border-[#b99cff] bg-gradient-to-br from-[#b99cff]/10 to-transparent"
                  : "border-white/10",
                disabled && "opacity-50 cursor-not-allowed"
              )}
            >
              {/* Selected indicator */}
              {isSelected && (
                <div className="absolute top-2 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-[#b99cff]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-2.5 w-2.5 text-white"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}

              {/* Emoji */}
              {preset.emoji && (
                <span className={cn(
                  "text-xl",
                  layout === "compact" ? "text-base" : "mb-1"
                )}>
                  {preset.emoji}
                </span>
              )}

              {/* Content */}
              <div className={cn(layout === "compact" && "flex-1")}>
                <span className={cn(
                  "block font-medium text-white/90",
                  layout === "compact" ? "text-xs" : "text-sm"
                )}>
                  {preset.name}
                </span>
                {layout !== "compact" && (
                  <span className="mt-0.5 block text-xs text-[#a1a1aa]">
                    {preset.description}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

StylePresetSelector.displayName = "StylePresetSelector";

