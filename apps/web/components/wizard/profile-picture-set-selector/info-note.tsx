'use client';

export function InfoNote() {
  return (
    <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-white/[0.02] border border-white/5">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className="w-4 h-4 text-purple-400/60 shrink-0 mt-0.5"
      >
        <path
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <p className="text-white/40 text-xs leading-relaxed">
        Profile pictures are generated in the background after character creation. You'll see them appear on your character's profile within a few minutes.
      </p>
    </div>
  );
}

