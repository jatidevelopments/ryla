'use client';

import * as React from 'react';
import { cn, Button, Switch, Label } from '@ryla/ui';
import {
  SCENE_OPTIONS,
  ENVIRONMENT_OPTIONS,
  OUTFIT_OPTIONS,
  DEFAULT_SCENE,
  DEFAULT_ENVIRONMENT,
} from '@ryla/shared';

export interface StudioSettings {
  scene: string;
  environment: string;
  outfit: string | null;
  aspectRatio: '1:1' | '9:16' | '2:3';
  qualityMode: 'draft' | 'hq';
  nsfwEnabled: boolean;
}

export interface StudioPanelProps {
  settings: StudioSettings;
  onSettingsChange: (settings: Partial<StudioSettings>) => void;
  onGenerate: () => void;
  isGenerating?: boolean;
  creditCost?: number;
  className?: string;
}

const ASPECT_RATIO_OPTIONS = [
  { value: '1:1', label: '1:1', description: 'Square' },
  { value: '9:16', label: '9:16', description: 'Portrait' },
  { value: '2:3', label: '2:3', description: 'Tall' },
];

export function StudioPanel({
  settings,
  onSettingsChange,
  onGenerate,
  isGenerating = false,
  creditCost = 5,
  className,
}: StudioPanelProps) {
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Scene Selection */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-white">Scene</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {SCENE_OPTIONS.map((scene) => (
            <button
              key={scene.value}
              onClick={() => onSettingsChange({ scene: scene.value })}
              className={cn(
                'flex flex-col items-center rounded-lg border p-3 text-center transition-all',
                settings.scene === scene.value
                  ? 'border-[#b99cff] bg-[#b99cff]/20 text-white'
                  : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30 hover:bg-white/10'
              )}
            >
              <span className="mb-1 text-xl">{scene.emoji}</span>
              <span className="text-xs font-medium">{scene.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Environment Selection */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-white">Environment</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {ENVIRONMENT_OPTIONS.map((env) => (
            <button
              key={env.value}
              onClick={() => onSettingsChange({ environment: env.value })}
              className={cn(
                'flex flex-col items-center rounded-lg border p-3 text-center transition-all',
                settings.environment === env.value
                  ? 'border-[#b99cff] bg-[#b99cff]/20 text-white'
                  : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30 hover:bg-white/10'
              )}
            >
              <span className="mb-1 text-xl">{env.emoji}</span>
              <span className="text-xs font-medium">{env.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Outfit Change */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-white">Outfit</h3>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onSettingsChange({ outfit: null })}
            className={cn(
              'rounded-lg border px-3 py-2 text-xs font-medium transition-all',
              settings.outfit === null
                ? 'border-[#b99cff] bg-[#b99cff]/20 text-white'
                : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30'
            )}
          >
            Keep Current
          </button>
          {OUTFIT_OPTIONS.slice(0, 6).map((outfit) => {
            const outfitValue = outfit.label.toLowerCase().replace(/\s+/g, '-');
            return (
              <button
                key={outfitValue}
                onClick={() => onSettingsChange({ outfit: outfitValue })}
                className={cn(
                  'rounded-lg border px-3 py-2 text-xs font-medium transition-all',
                  settings.outfit === outfitValue
                    ? 'border-[#b99cff] bg-[#b99cff]/20 text-white'
                    : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30'
                )}
              >
                {outfit.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Aspect Ratio */}
      <div>
        <h3 className="mb-3 text-sm font-medium text-white">Aspect Ratio</h3>
        <div className="flex gap-2">
          {ASPECT_RATIO_OPTIONS.map((ratio) => (
            <button
              key={ratio.value}
              onClick={() =>
                onSettingsChange({
                  aspectRatio: ratio.value as '1:1' | '9:16' | '2:3',
                })
              }
              className={cn(
                'flex-1 rounded-lg border px-3 py-2 text-center transition-all',
                settings.aspectRatio === ratio.value
                  ? 'border-[#b99cff] bg-[#b99cff]/20 text-white'
                  : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30'
              )}
            >
              <div className="text-sm font-medium">{ratio.label}</div>
              <div className="text-xs text-white/40">{ratio.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Settings Row */}
      <div className="flex items-center justify-between gap-4">
        {/* Quality Mode */}
        <div className="flex items-center gap-3">
          <Label htmlFor="quality-mode" className="text-sm text-white/60">
            HQ Mode
          </Label>
          <Switch
            id="quality-mode"
            checked={settings.qualityMode === 'hq'}
            onCheckedChange={(checked) =>
              onSettingsChange({ qualityMode: checked ? 'hq' : 'draft' })
            }
          />
        </div>

        {/* NSFW Toggle */}
        <div className="flex items-center gap-3">
          <Label htmlFor="nsfw-mode" className="text-sm text-white/60">
            18+ Content
          </Label>
          <Switch
            id="nsfw-mode"
            checked={settings.nsfwEnabled}
            onCheckedChange={(checked) =>
              onSettingsChange({ nsfwEnabled: checked })
            }
          />
        </div>
      </div>

      {/* Generate Button */}
      <div className="mt-2">
        <Button
          onClick={onGenerate}
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-[#d5b9ff] to-[#b99cff] py-6 text-lg font-semibold"
        >
          {isGenerating ? (
            <>
              <svg
                className="mr-2 h-5 w-5 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="mr-2 h-5 w-5"
              >
                <path d="M15.98 1.804a1 1 0 00-1.96 0l-.24 1.192a1 1 0 01-.784.785l-1.192.238a1 1 0 000 1.962l1.192.238a1 1 0 01.785.785l.238 1.192a1 1 0 001.962 0l.238-1.192a1 1 0 01.785-.785l1.192-.238a1 1 0 000-1.962l-1.192-.238a1 1 0 01-.785-.785l-.238-1.192zM6.949 5.684a1 1 0 00-1.898 0l-.683 2.051a1 1 0 01-.633.633l-2.051.683a1 1 0 000 1.898l2.051.684a1 1 0 01.633.632l.683 2.051a1 1 0 001.898 0l.683-2.051a1 1 0 01.633-.633l2.051-.683a1 1 0 000-1.898l-2.051-.683a1 1 0 01-.633-.633L6.95 5.684zM13.949 13.684a1 1 0 00-1.898 0l-.184.551a1 1 0 01-.632.633l-.551.183a1 1 0 000 1.898l.551.183a1 1 0 01.633.633l.183.551a1 1 0 001.898 0l.184-.551a1 1 0 01.632-.633l.551-.183a1 1 0 000-1.898l-.551-.184a1 1 0 01-.633-.632l-.183-.551z" />
              </svg>
              Generate Content ({creditCost} credits)
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

// Default settings
export const DEFAULT_STUDIO_SETTINGS: StudioSettings = {
  scene: DEFAULT_SCENE,
  environment: DEFAULT_ENVIRONMENT,
  outfit: null,
  aspectRatio: '1:1',
  qualityMode: 'draft',
  nsfwEnabled: false,
};
