'use client';

export function MissingJobIdsWarning() {
  return (
    <div className="w-full mb-6">
      <div className="bg-gradient-to-br from-orange-500/10 to-amber-500/10 border border-orange-500/20 rounded-2xl p-5">
        <div className="flex items-start gap-3">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-6 h-6 text-orange-400 flex-shrink-0 mt-0.5"
          >
            <path
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div>
            <p className="text-orange-300 font-medium mb-1">Generation not started</p>
            <p className="text-white/60 text-sm mb-3">
              Please go back to the prompt input step and click Continue to start generating your
              character images.
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 rounded-lg bg-orange-500/20 text-orange-300 text-sm font-medium hover:bg-orange-500/30 transition-colors"
            >
              ← Go Back to Prompt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

