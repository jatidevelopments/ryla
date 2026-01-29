'use client';

import * as React from 'react';
import { cn } from '../../lib/utils';

/**
 * AI Model option
 */
export interface ModelOption {
  id: string;
  name: string;
  description: string;
  speed: 'fast' | 'medium' | 'slow';
  quality: 'good' | 'better' | 'best';
  recommended?: boolean;
}

/**
 * Default model options
 */
export const defaultModelOptions: ModelOption[] = [
  {
    id: 'qwen-image-2512-fast',
    name: 'Qwen Fast',
    description: 'Fast T2I with NSFW support',
    speed: 'fast',
    quality: 'better',
    recommended: true,
  },
  {
    id: 'qwen-image-2512',
    name: 'Qwen HD',
    description: 'High quality T2I with NSFW support',
    speed: 'medium',
    quality: 'best',
  },
  {
    id: 'flux-dev',
    name: 'Flux Dev',
    description: 'Highest quality, photorealistic (SFW)',
    speed: 'medium',
    quality: 'best',
  },
  {
    id: 'z-image-turbo',
    name: 'Z-Image Turbo',
    description: 'Fast, great realism',
    speed: 'fast',
    quality: 'better',
  },
];

export interface ModelSelectorProps {
  /**
   * Currently selected model ID
   */
  value?: string;
  /**
   * Callback when model changes
   */
  onChange?: (modelId: string) => void;
  /**
   * Available models (defaults to all models)
   */
  models?: ModelOption[];
  /**
   * Layout mode
   */
  layout?: 'cards' | 'dropdown' | 'pills';
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
 * Speed indicator
 */
function SpeedIndicator({ speed }: { speed: 'fast' | 'medium' | 'slow' }) {
  const bars = speed === 'fast' ? 3 : speed === 'medium' ? 2 : 1;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className={cn(
            'h-2 w-1 rounded-sm',
            i <= bars ? 'bg-[#00ed77]' : 'bg-white/20'
          )}
        />
      ))}
    </div>
  );
}

/**
 * Quality indicator
 */
function QualityIndicator({
  quality,
}: {
  quality: 'good' | 'better' | 'best';
}) {
  const stars = quality === 'best' ? 3 : quality === 'better' ? 2 : 1;

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={cn(
            'text-xs',
            i <= stars ? 'text-[#ffdda7]' : 'text-white/20'
          )}
        >
          ★
        </span>
      ))}
    </div>
  );
}

/**
 * Model Selector
 *
 * Allows users to select an AI model for image generation.
 * Shows model characteristics like speed and quality.
 */
export function ModelSelector({
  value,
  onChange,
  models = defaultModelOptions,
  layout = 'cards',
  className,
  disabled = false,
}: ModelSelectorProps) {
  // Dropdown layout
  if (layout === 'dropdown') {
    const _selectedModel = models.find((m) => m.id === value) || models[0];

    return (
      <div className={cn('relative', className)}>
        <select
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className={cn(
            'w-full appearance-none rounded-[10px] border border-white/10 bg-[#1f1f24] px-4 py-2.5 pr-10 text-sm text-white',
            'focus:border-[#b99cff] focus:outline-none focus:ring-1 focus:ring-[#b99cff]/20',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {models.map((model) => (
            <option key={model.id} value={model.id}>
              {model.name} - {model.description}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5 text-white/50"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    );
  }

  // Pills layout
  if (layout === 'pills') {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {models.map((model) => {
          const isSelected = value === model.id;

          return (
            <button
              key={model.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange?.(model.id)}
              className={cn(
                'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all',
                'border',
                isSelected
                  ? 'border-[#b99cff] bg-[#b99cff]/20 text-[#b99cff]'
                  : 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white',
                disabled && 'opacity-50 cursor-not-allowed'
              )}
            >
              {model.name}
              {model.recommended && (
                <span className="rounded bg-[#00ed77]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#00ed77]">
                  REC
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  // Cards layout (default)
  return (
    <div className={cn('grid gap-3', className)}>
      {models.map((model) => {
        const isSelected = value === model.id;

        return (
          <button
            key={model.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange?.(model.id)}
            className={cn(
              'relative flex items-center gap-4 rounded-[10px] p-4 text-left transition-all',
              'border bg-[#1f1f24]',
              isSelected
                ? 'border-2 border-[#b99cff] bg-gradient-to-r from-[#b99cff]/10 to-transparent'
                : 'border-white/10 hover:border-white/30',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {/* Selected indicator */}
            {isSelected && (
              <div className="absolute top-3 right-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#b99cff]">
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

            {/* Model icon */}
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/5">
              <span className="text-2xl">🤖</span>
            </div>

            {/* Model info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-white">{model.name}</h4>
                {model.recommended && (
                  <span className="rounded bg-[#00ed77]/20 px-1.5 py-0.5 text-[10px] font-bold text-[#00ed77]">
                    RECOMMENDED
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-sm text-[#a1a1aa]">
                {model.description}
              </p>

              {/* Indicators */}
              <div className="mt-2 flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-white/50">Speed</span>
                  <SpeedIndicator speed={model.speed} />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-white/50">Quality</span>
                  <QualityIndicator quality={model.quality} />
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

ModelSelector.displayName = 'ModelSelector';
