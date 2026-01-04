"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

/**
 * Quality score breakdown by category
 */
export interface QualityBreakdown {
  subjectClarity: number;
  specificity: number;
  realismPotential: number;
  tokenOrdering: number;
  negativePromptQuality: number;
  sceneContext: number;
  coherence: number;
  noConflicts: number;
}

/**
 * Quality score data
 */
export interface QualityScoreData {
  overall: number;
  grade: "A" | "B" | "C" | "D" | "F";
  breakdown: QualityBreakdown;
  suggestions: string[];
  strengths: string[];
}

export interface QualityScoreDisplayProps {
  /**
   * The quality score data to display
   */
  score: QualityScoreData;
  /**
   * Display mode
   */
  variant?: "compact" | "detailed" | "minimal";
  /**
   * Whether to show suggestions
   */
  showSuggestions?: boolean;
  /**
   * Whether to show strengths
   */
  showStrengths?: boolean;
  /**
   * Custom class name
   */
  className?: string;
}

/**
 * Get color class based on score/grade
 */
function getScoreColor(score: number): string {
  if (score >= 85) return "text-[#00ed77]"; // Green
  if (score >= 70) return "text-[#b99cff]"; // Purple
  if (score >= 55) return "text-[#ffdda7]"; // Yellow
  if (score >= 40) return "text-[#fb6731]"; // Orange
  return "text-[#fc594c]"; // Red
}

function getGradeColor(grade: string): string {
  switch (grade) {
    case "A": return "bg-[#00ed77]/20 text-[#00ed77] border-[#00ed77]/30";
    case "B": return "bg-[#b99cff]/20 text-[#b99cff] border-[#b99cff]/30";
    case "C": return "bg-[#ffdda7]/20 text-[#ffdda7] border-[#ffdda7]/30";
    case "D": return "bg-[#fb6731]/20 text-[#fb6731] border-[#fb6731]/30";
    default: return "bg-[#fc594c]/20 text-[#fc594c] border-[#fc594c]/30";
  }
}

function getProgressColor(percent: number): string {
  if (percent >= 80) return "bg-[#00ed77]";
  if (percent >= 60) return "bg-[#b99cff]";
  if (percent >= 40) return "bg-[#ffdda7]";
  return "bg-[#fc594c]";
}

/**
 * Score category configuration
 */
const scoreCategories: Array<{
  key: keyof QualityBreakdown;
  label: string;
  maxScore: number;
}> = [
  { key: "subjectClarity", label: "Subject Clarity", maxScore: 20 },
  { key: "specificity", label: "Specificity", maxScore: 15 },
  { key: "realismPotential", label: "Realism", maxScore: 15 },
  { key: "tokenOrdering", label: "Token Order", maxScore: 15 },
  { key: "negativePromptQuality", label: "Negative Prompt", maxScore: 10 },
  { key: "sceneContext", label: "Scene Context", maxScore: 10 },
  { key: "coherence", label: "Coherence", maxScore: 10 },
  { key: "noConflicts", label: "No Conflicts", maxScore: 5 },
];

/**
 * Quality Score Display
 * 
 * Displays the prompt quality score with visual breakdown.
 * Shows grade, overall score, category breakdown, and suggestions.
 */
export function QualityScoreDisplay({
  score,
  variant = "detailed",
  showSuggestions = true,
  showStrengths = true,
  className,
}: QualityScoreDisplayProps) {
  // Minimal view - just grade badge
  if (variant === "minimal") {
    return (
      <div className={cn("inline-flex items-center gap-2", className)}>
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-md px-2 py-0.5 text-xs font-bold border",
            getGradeColor(score.grade)
          )}
        >
          {score.grade}
        </span>
        <span className={cn("text-sm font-medium", getScoreColor(score.overall))}>
          {score.overall}/100
        </span>
      </div>
    );
  }

  // Compact view - grade + score + progress bar
  if (variant === "compact") {
    return (
      <div className={cn("w-full", className)}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center justify-center rounded-md px-2 py-0.5 text-sm font-bold border",
                getGradeColor(score.grade)
              )}
            >
              Grade {score.grade}
            </span>
            <span className={cn("text-lg font-semibold", getScoreColor(score.overall))}>
              {score.overall}/100
            </span>
          </div>
        </div>

        {/* Overall progress bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
          <div
            className={cn(
              "h-full transition-all duration-500 ease-out rounded-full",
              getProgressColor(score.overall)
            )}
            style={{ width: `${score.overall}%` }}
          />
        </div>

        {/* Quick suggestions */}
        {showSuggestions && score.suggestions.length > 0 && (
          <p className="mt-2 text-xs text-[#a1a1aa]">
            💡 {score.suggestions[0]}
          </p>
        )}
      </div>
    );
  }

  // Detailed view - full breakdown
  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span
            className={cn(
              "inline-flex h-12 w-12 items-center justify-center rounded-lg text-xl font-bold border",
              getGradeColor(score.grade)
            )}
          >
            {score.grade}
          </span>
          <div>
            <p className={cn("text-2xl font-bold", getScoreColor(score.overall))}>
              {score.overall}/100
            </p>
            <p className="text-xs text-[#a1a1aa]">Quality Score</p>
          </div>
        </div>
      </div>

      {/* Overall progress */}
      <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
        <div
          className={cn(
            "h-full transition-all duration-500 ease-out rounded-full",
            getProgressColor(score.overall)
          )}
          style={{ width: `${score.overall}%` }}
        />
      </div>

      {/* Category breakdown */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-[#a1a1aa] uppercase tracking-wider">
          Breakdown
        </p>
        <div className="grid gap-2">
          {scoreCategories.map(({ key, label, maxScore }) => {
            const value = score.breakdown[key];
            const percent = (value / maxScore) * 100;

            return (
              <div key={key} className="flex items-center gap-3">
                <span className="w-28 text-xs text-white/70 truncate">
                  {label}
                </span>
                <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={cn(
                      "h-full transition-all duration-300 rounded-full",
                      getProgressColor(percent)
                    )}
                    style={{ width: `${percent}%` }}
                  />
                </div>
                <span className="w-12 text-xs text-right text-white/50">
                  {value}/{maxScore}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Strengths */}
      {showStrengths && score.strengths.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-[#00ed77] uppercase tracking-wider">
            ✓ Strengths
          </p>
          <ul className="space-y-1">
            {score.strengths.map((strength, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/80">
                <span className="text-[#00ed77]">•</span>
                {strength}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Suggestions */}
      {showSuggestions && score.suggestions.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-[#ffdda7] uppercase tracking-wider">
            💡 Suggestions
          </p>
          <ul className="space-y-1">
            {score.suggestions.map((suggestion, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                <span className="text-[#ffdda7]">•</span>
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

QualityScoreDisplay.displayName = "QualityScoreDisplay";

