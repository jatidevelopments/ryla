'use client';

interface GenerateErrorStateProps {
  error: string;
  onRetry: () => void;
}

export function GenerateErrorState({ error, onRetry }: GenerateErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="w-16 h-16 mb-6 rounded-full bg-red-500/20 flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-red-400">
          <path
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Generation Failed</h2>
      <p className="text-white/60 text-sm mb-6 text-center max-w-xs">{error}</p>
      <button
        onClick={onRetry}
        className="px-6 py-2.5 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}

