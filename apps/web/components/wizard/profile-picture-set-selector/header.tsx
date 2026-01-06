'use client';

export function ProfilePictureSetSelectorHeader() {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-purple-400">
            <path
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h3 className="text-white text-lg font-semibold">Profile Picture Set</h3>
      </div>
      <p className="text-white/50 text-sm">
        Choose a style theme for your character's profile pictures. Each set generates 7-10 unique shots in different scenes.
      </p>
    </div>
  );
}

