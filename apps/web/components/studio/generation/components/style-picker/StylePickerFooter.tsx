'use client';

import * as React from 'react';
import { VISUAL_STYLES, SCENES, LIGHTING_SETTINGS } from '../../types';

interface StylePickerFooterProps {
  selectedStyleId: string | null;
  selectedSceneId: string | null;
  selectedLightingId: string | null;
  onStyleSelect: (id: string | null) => void;
  onSceneSelect: (id: string | null) => void;
  onLightingSelect: (id: string | null) => void;
  onClose: () => void;
}

export function StylePickerFooter({
  selectedStyleId,
  selectedSceneId,
  selectedLightingId,
  onStyleSelect,
  onSceneSelect,
  onLightingSelect,
  onClose,
}: StylePickerFooterProps) {
  return (
    <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-t border-white/10 bg-[#0d0d0f] gap-4">
      {/* Selected items as chips */}
      <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto scroll-hidden">
        {selectedStyleId && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <span className="text-white/50 text-sm">Style:</span>
            <span className="text-white font-medium text-sm">
              {VISUAL_STYLES.find((s) => s.id === selectedStyleId)?.name}
            </span>
            <button
              onClick={() => onStyleSelect(null)}
              className="ml-1 text-white/40 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        )}
        {selectedSceneId && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <span className="text-white/50 text-sm">Scene:</span>
            <span className="text-white font-medium text-sm">
              {SCENES.find((s) => s.id === selectedSceneId)?.name}
            </span>
            <button
              onClick={() => onSceneSelect(null)}
              className="ml-1 text-white/40 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        )}
        {selectedLightingId && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <span className="text-white/50 text-sm">Lighting:</span>
            <span className="text-white font-medium text-sm">
              {LIGHTING_SETTINGS.find((l) => l.id === selectedLightingId)?.name}
            </span>
            <button
              onClick={() => onLightingSelect(null)}
              className="ml-1 text-white/40 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        )}
        {!selectedStyleId && !selectedSceneId && !selectedLightingId && (
          <span className="text-white/40 text-sm">No options selected</span>
        )}
      </div>

      {/* Apply button */}
      <button
        onClick={onClose}
        className="px-8 py-2.5 rounded-xl bg-[var(--purple-500)] text-white font-semibold hover:bg-[var(--purple-600)] transition-colors shadow-lg shadow-[var(--purple-500)]/25"
      >
        Apply
      </button>
    </div>
  );
}
