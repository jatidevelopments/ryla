'use client';

import { cn } from '@ryla/ui';

interface RegenerateAllButtonProps {
  onRegenerateAll: () => void;
  isGenerating: boolean;
  isRegeneratingAll: boolean;
}

export function RegenerateAllButton({
  onRegenerateAll,
  isGenerating,
  isRegeneratingAll,
}: RegenerateAllButtonProps) {
  return (
    <div className="w-full">
      <button
        onClick={onRegenerateAll}
        disabled={isGenerating || isRegeneratingAll}
        className={cn(
          'w-full min-h-[44px] px-4 py-3 rounded-xl text-sm font-semibold transition-all',
          isGenerating || isRegeneratingAll
            ? 'bg-white/5 text-white/40 cursor-not-allowed'
            : 'bg-white/10 text-white hover:bg-white/20 active:scale-[0.98]'
        )}
      >
        {isRegeneratingAll ? (
          <span className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Regenerating All...
          </span>
        ) : (
          'Regenerate All'
        )}
      </button>
    </div>
  );
}
