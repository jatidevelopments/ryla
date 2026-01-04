"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

/**
 * Coherence warning severity levels
 */
export type CoherenceSeverity = "low" | "medium" | "high";

/**
 * Coherence warning data
 */
export interface CoherenceWarning {
  type: string;
  message: string;
  severity: CoherenceSeverity;
  elements: string[];
  suggestions?: string[];
}

/**
 * Coherence validation result
 */
export interface CoherenceResult {
  valid: boolean;
  warningCount: number;
  warnings: CoherenceWarning[];
  suggestions: string[];
}

export interface CoherenceWarningsProps {
  /**
   * Coherence validation result
   */
  result: CoherenceResult;
  /**
   * Display variant
   */
  variant?: "inline" | "card" | "banner";
  /**
   * Whether to show suggestions
   */
  showSuggestions?: boolean;
  /**
   * Whether to auto-collapse when valid
   */
  collapseWhenValid?: boolean;
  /**
   * Custom class name
   */
  className?: string;
  /**
   * Callback when a suggestion is clicked
   */
  onSuggestionClick?: (suggestion: string) => void;
}

/**
 * Get styles based on severity
 */
function getSeverityStyles(severity: CoherenceSeverity): {
  bg: string;
  border: string;
  text: string;
  icon: string;
} {
  switch (severity) {
    case "high":
      return {
        bg: "bg-[#fc594c]/10",
        border: "border-[#fc594c]/30",
        text: "text-[#fc594c]",
        icon: "⚠️",
      };
    case "medium":
      return {
        bg: "bg-[#ffdda7]/10",
        border: "border-[#ffdda7]/30",
        text: "text-[#ffdda7]",
        icon: "⚡",
      };
    case "low":
      return {
        bg: "bg-[#b99cff]/10",
        border: "border-[#b99cff]/30",
        text: "text-[#b99cff]",
        icon: "💡",
      };
  }
}

/**
 * Single warning item
 */
function WarningItem({
  warning,
  showSuggestions,
  onSuggestionClick,
}: {
  warning: CoherenceWarning;
  showSuggestions?: boolean;
  onSuggestionClick?: (suggestion: string) => void;
}) {
  const styles = getSeverityStyles(warning.severity);

  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        styles.bg,
        styles.border
      )}
    >
      <div className="flex items-start gap-2">
        <span className="flex-shrink-0">{styles.icon}</span>
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-medium", styles.text)}>
            {warning.message}
          </p>
          
          {/* Involved elements */}
          {warning.elements.length > 0 && (
            <div className="mt-1 flex flex-wrap gap-1">
              {warning.elements.map((el, i) => (
                <span
                  key={i}
                  className="inline-flex rounded bg-white/5 px-1.5 py-0.5 text-xs text-white/60"
                >
                  {el}
                </span>
              ))}
            </div>
          )}

          {/* Suggestions */}
          {showSuggestions && warning.suggestions && warning.suggestions.length > 0 && (
            <div className="mt-2 space-y-1">
              {warning.suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => onSuggestionClick?.(suggestion)}
                  className="block text-xs text-white/50 hover:text-white/80 transition-colors text-left"
                >
                  → {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Coherence Warnings Display
 * 
 * Shows coherence validation warnings with severity levels.
 * Helps users understand and fix incompatible prompt element combinations.
 */
export function CoherenceWarnings({
  result,
  variant = "card",
  showSuggestions = true,
  collapseWhenValid = true,
  className,
  onSuggestionClick,
}: CoherenceWarningsProps) {
  // If valid and collapse enabled, show success or nothing
  if (result.valid && collapseWhenValid) {
    if (result.warningCount === 0) {
      return null; // Completely hide when no warnings
    }
  }

  // Inline variant - compact single line
  if (variant === "inline") {
    if (result.valid) {
      return (
        <div className={cn("flex items-center gap-2 text-sm", className)}>
          <span className="text-[#00ed77]">✓</span>
          <span className="text-white/70">Elements are compatible</span>
        </div>
      );
    }

    const highCount = result.warnings.filter(w => w.severity === "high").length;
    const mediumCount = result.warnings.filter(w => w.severity === "medium").length;

    return (
      <div className={cn("flex items-center gap-2 text-sm", className)}>
        {highCount > 0 && (
          <span className="text-[#fc594c]">
            ⚠️ {highCount} issue{highCount > 1 ? "s" : ""}
          </span>
        )}
        {mediumCount > 0 && (
          <span className="text-[#ffdda7]">
            ⚡ {mediumCount} warning{mediumCount > 1 ? "s" : ""}
          </span>
        )}
      </div>
    );
  }

  // Banner variant - full width alert
  if (variant === "banner") {
    if (result.valid && result.warningCount === 0) {
      return null;
    }

    const severity = result.warnings.some(w => w.severity === "high")
      ? "high"
      : result.warnings.some(w => w.severity === "medium")
        ? "medium"
        : "low";

    const styles = getSeverityStyles(severity);

    return (
      <div
        className={cn(
          "w-full rounded-lg border p-3",
          styles.bg,
          styles.border,
          className
        )}
      >
        <div className="flex items-start gap-3">
          <span className="text-lg">{styles.icon}</span>
          <div className="flex-1">
            <p className={cn("font-medium", styles.text)}>
              {result.warningCount} coherence issue{result.warningCount > 1 ? "s" : ""} detected
            </p>
            {result.suggestions.length > 0 && (
              <p className="mt-1 text-sm text-white/60">
                {result.suggestions[0]}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Card variant - full details
  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-white/90">
          Coherence Check
        </h3>
        {result.valid ? (
          <span className="inline-flex items-center gap-1 text-xs text-[#00ed77]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-4 w-4"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                clipRule="evenodd"
              />
            </svg>
            Valid
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-[#fc594c]">
            {result.warningCount} issue{result.warningCount > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Warnings list */}
      {result.warnings.length > 0 && (
        <div className="space-y-2">
          {result.warnings.map((warning, i) => (
            <WarningItem
              key={i}
              warning={warning}
              showSuggestions={showSuggestions}
              onSuggestionClick={onSuggestionClick}
            />
          ))}
        </div>
      )}

      {/* Success state */}
      {result.valid && result.warningCount === 0 && (
        <div className="rounded-lg border border-[#00ed77]/30 bg-[#00ed77]/10 p-3">
          <div className="flex items-center gap-2">
            <span>✅</span>
            <p className="text-sm text-[#00ed77]">
              All elements are compatible!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

CoherenceWarnings.displayName = "CoherenceWarnings";

