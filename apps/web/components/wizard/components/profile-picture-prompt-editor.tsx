'use client';

import type { ProfilePictureImage } from '@ryla/business';

interface ProfilePicturePromptEditorProps {
  image: ProfilePictureImage;
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onSave: () => void;
  onCancel: () => void;
}

export function ProfilePicturePromptEditor({
  image,
  prompt,
  onPromptChange,
  onSave,
  onCancel,
}: ProfilePicturePromptEditorProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 rounded-2xl p-6 max-w-2xl w-full mx-4 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white text-lg font-bold">Edit Prompt</h3>
          <button
            onClick={onCancel}
            className="text-white/60 hover:text-white transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path
                d="M6 18L18 6M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <p className="text-white/60 text-sm mb-2">Position: {image.positionName}</p>
          <textarea
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            className="w-full min-h-[200px] bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-white/40 resize-none focus:border-purple-500/50 focus:ring-purple-500/20"
            placeholder="Enter prompt adjustments..."
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 rounded-lg bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white text-sm font-medium hover:from-purple-500 hover:to-pink-500 transition-all"
          >
            Regenerate with New Prompt
          </button>
        </div>
      </div>
    </div>
  );
}

