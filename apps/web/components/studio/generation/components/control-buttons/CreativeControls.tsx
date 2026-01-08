'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import { Tooltip } from '../../../../ui/tooltip';
import type { GenerationSettings } from '../../types';

interface CreativeControlsProps {
  settings: GenerationSettings;
  updateSetting: <K extends keyof GenerationSettings>(
    key: K,
    value: GenerationSettings[K]
  ) => void;
  selectedPose: { id: string; name: string } | null | undefined;
  outfitDisplayText: string;
  hasOutfitComposition: boolean;
  onShowPosePicker: () => void;
  onShowOutfitModeSelector: () => void;
  onShowStylePicker: () => void;
  clearStyles: () => void;
}

export function CreativeControls({
  settings,
  updateSetting,
  selectedPose,
  outfitDisplayText,
  hasOutfitComposition,
  onShowPosePicker,
  onShowOutfitModeSelector,
  onShowStylePicker,
  clearStyles,
}: CreativeControlsProps) {
  return (
    <>
      {/* Divider before creative controls */}
      <div className="h-3.5 w-px bg-white/10" />

      {/* Pose Picker Button */}
      <Tooltip content="Pose: Select a pose to add to your prompt. Different poses available based on content settings.">
        <div className="group">
          <button
            onClick={onShowPosePicker}
            className={cn(
              'flex items-center gap-1.5 min-h-[44px] rounded-2xl text-sm font-medium transition-all px-3 py-2.5',
              selectedPose
                ? 'bg-[var(--purple-500)]/20 text-[var(--text-primary)] border border-[var(--purple-500)]/30'
                : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10'
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-3.5 w-3.5 text-[var(--purple-400)]"
            >
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM3 18a7 7 0 0114 0v1H3v-1zm7-4a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1z" />
            </svg>
            <span className="truncate max-w-[100px]">
              {selectedPose ? selectedPose.name : 'Pose'}
            </span>
            {selectedPose && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateSetting('poseId', null);
                }}
                className="h-4 w-0 max-w-0 flex items-center justify-center rounded overflow-hidden opacity-0 group-hover:w-4 group-hover:max-w-4 group-hover:opacity-100 group-hover:ml-1 transition-all text-white hover:bg-white/10"
                title="Clear pose"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-3 w-3"
                >
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            )}
          </button>
        </div>
      </Tooltip>

      {/* Outfit Composition Picker Button */}
      <Tooltip content="Outfit: Choose from pre-composed outfits or create your own custom composition.">
        <div className="group">
          <button
            onClick={onShowOutfitModeSelector}
            className={cn(
              'flex items-center gap-1.5 min-h-[44px] rounded-2xl text-sm font-medium transition-all px-3 py-2.5',
              hasOutfitComposition ||
                (typeof settings.outfit === 'string' && settings.outfit)
                ? 'bg-[var(--purple-500)]/20 text-[var(--text-primary)] border border-[var(--purple-500)]/30'
                : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10'
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-3.5 w-3.5 text-[var(--purple-400)]"
            >
              <path d="M10.75 16.82A7.462 7.462 0 0115 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0018 15.06v-11a.75.75 0 00-.546-.721A9.006 9.006 0 0015 3a8.963 8.963 0 00-4.25 1.065V16.82zM9.25 4.065A8.963 8.963 0 005 3c-.85 0-1.673.118-2.454.339A.75.75 0 002 4.06v11a.75.75 0 00.954.721A7.506 7.506 0 015 15.5c1.579 0 3.042.487 4.25 1.32V4.065z" />
            </svg>
            <span className="truncate max-w-[100px]">{outfitDisplayText}</span>
            {(hasOutfitComposition ||
              (typeof settings.outfit === 'string' && settings.outfit)) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  updateSetting('outfit', null);
                }}
                className="h-4 w-0 max-w-0 flex items-center justify-center rounded overflow-hidden opacity-0 group-hover:w-4 group-hover:max-w-4 group-hover:opacity-100 group-hover:ml-1 transition-all text-white hover:bg-white/10"
                title="Clear outfit"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-3 w-3"
                >
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            )}
          </button>
        </div>
      </Tooltip>

      {/* Visual Styles Button */}
      <Tooltip content="Styles & Scenes: Apply visual styles, backgrounds, and lighting to customize your generated images.">
        <div className="group">
          <button
            onClick={onShowStylePicker}
            className={cn(
              'flex items-center gap-1.5 min-h-[44px] rounded-2xl text-sm font-medium transition-all px-3 py-2.5',
              settings.styleId || settings.sceneId || settings.lightingId
                ? 'bg-[var(--purple-500)]/20 text-[var(--text-primary)] border border-[var(--purple-500)]/30'
                : 'bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/10'
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-3.5 w-3.5 text-[var(--purple-400)]"
            >
              <path
                fillRule="evenodd"
                d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z"
                clipRule="evenodd"
              />
            </svg>
            <span className="truncate max-w-[120px]">Styles & Scenes</span>
            {(settings.styleId || settings.sceneId || settings.lightingId) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  clearStyles();
                }}
                className="h-4 w-0 max-w-0 flex items-center justify-center rounded overflow-hidden opacity-0 group-hover:w-4 group-hover:max-w-4 group-hover:opacity-100 group-hover:ml-1 transition-all text-white hover:bg-white/10"
                title="Clear styles & scenes"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-3 w-3"
                >
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            )}
          </button>
        </div>
      </Tooltip>
    </>
  );
}
