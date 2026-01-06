'use client';

interface GenerateLoadingStateProps {
  status: string;
}

export function GenerateLoadingState({ status }: GenerateLoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      {/* Animated loader */}
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" />
        <div className="absolute inset-3 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-8 h-8 text-purple-400"
          >
            <path
              d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Creating Your Influencer</h2>
      <p className="text-white/60 text-sm">{status || 'This may take a minute...'}</p>
    </div>
  );
}

