'use client';

interface ProfilePictureEmptyStateProps {
  hasImages: boolean;
  isGenerating: boolean;
  onGenerate: () => void;
}

export function ProfilePictureEmptyState({
  hasImages,
  isGenerating,
  onGenerate,
}: ProfilePictureEmptyStateProps) {
  if (hasImages || isGenerating) return null;

  return (
    <div className="w-full text-center py-12">
      <p className="text-white/60 text-sm mb-4">No profile pictures generated yet</p>
      <button
        onClick={onGenerate}
        className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white text-sm font-medium hover:from-purple-500 hover:to-pink-500 transition-all"
      >
        Generate Profile Pictures
      </button>
    </div>
  );
}

