'use client';

import { RefreshCw } from 'lucide-react';

interface BaseImageErrorProps {
  error: string | null;
  connectionError?: boolean;
  onRetry?: () => void;
}

export function BaseImageError({ error, connectionError, onRetry }: BaseImageErrorProps) {
  if (!error) return null;

  return (
    <div className="w-full mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
      <div className="flex items-start justify-between gap-4">
        <p className="text-red-400 text-sm flex-1">{error}</p>
        {connectionError && onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 text-sm font-medium transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        )}
      </div>
    </div>
  );
}

