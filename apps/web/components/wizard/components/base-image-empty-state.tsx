'use client';

interface BaseImageEmptyStateProps {
  hasImages: boolean;
  isGenerating: boolean;
  hasImagesInStore: boolean;
  onGenerate: () => void;
}

export function BaseImageEmptyState({
  hasImages,
  isGenerating,
  hasImagesInStore,
  onGenerate,
}: BaseImageEmptyStateProps) {
  if (hasImages || isGenerating || hasImagesInStore) return null;

  return (
    <div className="w-full text-center py-12">
      <p className="text-white/60 text-sm mb-4">No base images generated yet</p>
      <button
        onClick={onGenerate}
        className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-purple-500/80 to-pink-500/80 text-white text-sm font-medium hover:from-purple-500 hover:to-pink-500 transition-all"
      >
        Generate Base Images
      </button>
    </div>
  );
}

