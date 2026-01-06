'use client';

interface BaseImageHeaderProps {
  isGenerating: boolean;
  hasSkeletonImages: boolean;
  completedCount: number;
  expectedImageCount: number;
}

export function BaseImageHeader({
  isGenerating,
  hasSkeletonImages,
  completedCount,
  expectedImageCount,
}: BaseImageHeaderProps) {
  return (
    <div className="text-center mb-8 w-full">
      <p className="text-white/60 text-sm font-medium mb-2">Base Image Selection</p>
      <h1 className="text-white text-2xl font-bold mb-2">Choose Your Character Face</h1>
      {isGenerating || hasSkeletonImages ? (
        <div className="flex items-center justify-center gap-2 mt-3">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          <p className="text-white/60 text-sm">
            Generating {completedCount}/{expectedImageCount} images...
          </p>
        </div>
      ) : (
        <p className="text-white/40 text-sm mt-2">Select one image, or fine-tune and regenerate</p>
      )}
    </div>
  );
}

