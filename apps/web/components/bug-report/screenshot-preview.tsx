'use client';

import * as React from 'react';
import { Camera, RefreshCw } from 'lucide-react';
import { cn } from '@ryla/ui';

export interface ScreenshotPreviewProps {
  screenshot: string | null;
  isCapturing: boolean;
  onRetake?: () => void;
}

export function ScreenshotPreview({
  screenshot,
  isCapturing,
  onRetake,
}: ScreenshotPreviewProps) {
  if (isCapturing) {
    return (
      <div className="flex items-center justify-center h-32 rounded-lg border border-white/10 bg-white/5">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-6 w-6 border-2 border-[var(--purple-500)] border-t-transparent" />
          <span className="text-xs text-white/60">Capturing screenshot...</span>
        </div>
      </div>
    );
  }

  if (!screenshot) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3">
        <Camera className="h-4 w-4 text-yellow-400" />
        <div className="flex-1">
          <p className="text-xs font-medium text-yellow-400">Screenshot capture failed</p>
          <p className="text-xs text-yellow-400/70">You can still submit without a screenshot</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative group">
      <img
        src={screenshot}
        alt="Screenshot preview"
        className="w-full max-w-[200px] rounded-lg border border-white/10 object-contain"
      />
      {onRetake && (
        <button
          onClick={onRetake}
          className="absolute -top-2 -right-2 flex items-center gap-1 rounded-lg bg-[#1a1a1c] border border-white/10 px-2 py-1 text-xs text-white/70 hover:text-white hover:bg-white/10 transition-colors"
        >
          <RefreshCw className="h-3 w-3" />
          Retake
        </button>
      )}
    </div>
  );
}

