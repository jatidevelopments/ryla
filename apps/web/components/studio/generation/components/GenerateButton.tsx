'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import { Tooltip } from '../../../ui/tooltip';
import type { StudioMode } from '../types';

interface GenerateButtonProps {
  mode: StudioMode;
  canGenerate: boolean;
  creditsCost: number;
  onGenerate: () => void;
}

export function GenerateButton({
  mode,
  canGenerate,
  creditsCost,
  onGenerate,
}: GenerateButtonProps) {
  const getButtonLabel = () => {
    switch (mode) {
      case 'creating':
        return 'Generate';
      case 'editing':
        return 'Edit';
      case 'upscaling':
        return 'Upscale';
      case 'variations':
        return 'Create Variations';
      default:
        return 'Generate';
    }
  };

  const getTooltipContent = () => {
    if (!canGenerate) {
      return 'Select an influencer and ensure you have enough credits';
    }
    switch (mode) {
      case 'creating':
        return 'Generate new images';
      case 'editing':
        return 'Edit selected image';
      case 'upscaling':
        return 'Upscale selected image';
      default:
        return 'Generate';
    }
  };

  return (
    <Tooltip content={getTooltipContent()}>
      <button
        onClick={onGenerate}
        disabled={!canGenerate}
        data-tutorial-target="generate-button"
        className={cn(
          'h-11 md:h-12 px-5 md:px-8 rounded-full md:rounded-2xl font-bold text-sm flex items-center gap-1.5 md:gap-2.5 transition-all flex-shrink-0',
          canGenerate
            ? 'bg-gradient-to-r from-[var(--purple-500)] to-[var(--purple-600)] text-white hover:from-[var(--purple-400)] hover:to-[var(--purple-500)] shadow-lg shadow-[var(--purple-500)]/25'
            : 'bg-[var(--bg-hover)] text-[var(--text-muted)] cursor-not-allowed'
        )}
      >
        <>
          <span className="hidden md:inline">{getButtonLabel()}</span>
          <span className="md:hidden">Go</span>
          <span className="flex items-center gap-0.5 text-xs md:text-sm opacity-80">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-3.5 w-3.5 md:h-3.5 md:w-3.5"
            >
              <path d="M10.75 10.818v2.614A3.13 3.13 0 0011.888 13c.482-.315.612-.648.612-.875 0-.227-.13-.56-.612-.875a3.13 3.13 0 00-1.138-.432zM8.33 8.62c.053.055.115.11.184.164.208.16.46.284.736.363V6.603a2.45 2.45 0 00-.35.13c-.14.065-.27.143-.386.233-.377.292-.514.627-.514.909 0 .184.058.39.202.592.037.051.08.102.128.152z" />
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-6a.75.75 0 01.75.75v.316a3.78 3.78 0 011.653.713c.426.33.744.74.925 1.2a.75.75 0 01-1.395.55 1.35 1.35 0 00-.447-.563 2.187 2.187 0 00-.736-.363V9.3c.698.093 1.383.32 1.959.696.787.514 1.29 1.27 1.29 2.13 0 .86-.504 1.616-1.29 2.13-.576.377-1.261.603-1.96.696v.299a.75.75 0 11-1.5 0v-.3c-.697-.092-1.382-.318-1.958-.695-.482-.315-.857-.717-1.078-1.188a.75.75 0 111.359-.636c.08.173.245.376.54.569.313.205.706.353 1.138.432v-2.748a3.782 3.782 0 01-1.653-.713C6.9 9.433 6.5 8.681 6.5 7.875c0-.805.4-1.558 1.088-2.046.44-.312.978-.53 1.662-.622V4.75A.75.75 0 0110 4z"
                clipRule="evenodd"
              />
            </svg>
            {creditsCost.toFixed(0)}
          </span>
        </>
      </button>
    </Tooltip>
  );
}
