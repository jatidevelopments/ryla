'use client';

import * as React from 'react';
import { Textarea, cn } from '@ryla/ui';

interface FineTuneSectionProps {
  selectedImageId: string | null;
  fineTunePrompt: string;
  onFineTunePromptChange: (value: string) => void;
  onRegenerate: () => void;
  isGenerating: boolean;
  fineTuningImageId: string | null;
}

export function FineTuneSection({
  selectedImageId,
  fineTunePrompt,
  onFineTunePromptChange,
  onRegenerate,
  isGenerating,
  fineTuningImageId,
}: FineTuneSectionProps) {
  if (!selectedImageId) return null;

  return (
    <div className="w-full mb-4">
      <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
        <div className="flex items-center gap-2 mb-3">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-purple-400">
            <path
              d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
            <path
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
          <p className="text-white/70 text-sm font-medium">Fine-tune Selected Image</p>
        </div>
        <Textarea
          value={fineTunePrompt}
          onChange={(e) => onFineTunePromptChange(e.target.value)}
          placeholder="Describe adjustments, e.g., 'make eyes brighter', 'softer expression', 'warmer lighting', 'add subtle smile'..."
          className="min-h-[80px] bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl resize-none focus:border-purple-500/50 focus:ring-purple-500/20 text-sm"
          maxLength={500}
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-white/30 text-xs">{fineTunePrompt.length}/500</span>
        </div>
        <button
          onClick={onRegenerate}
          disabled={isGenerating || fineTuningImageId !== null || !fineTunePrompt.trim()}
          className={cn(
            'mt-3 w-full px-4 py-2.5 rounded-xl text-sm font-medium transition-all relative overflow-hidden',
            fineTunePrompt.trim() && !isGenerating && fineTuningImageId === null
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40'
              : 'bg-white/10 text-white/40 cursor-not-allowed'
          )}
        >
          {fineTuningImageId === selectedImageId ? (
            <span className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Regenerating...
            </span>
          ) : (
            'Regenerate with Adjustments'
          )}
        </button>
      </div>
    </div>
  );
}

