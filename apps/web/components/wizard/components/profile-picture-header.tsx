'use client';

interface ProfilePictureHeaderProps {
  isGenerating: boolean;
  completedCount: number;
  totalExpected: number;
  regularImageCount: number;
  nsfwImageCount: number;
  nsfwEnabled: boolean;
}

export function ProfilePictureHeader({
  isGenerating,
  completedCount,
  totalExpected,
  regularImageCount,
  nsfwImageCount,
  nsfwEnabled,
}: ProfilePictureHeaderProps) {
  return (
    <div className="text-center mb-8 w-full">
      <p className="text-white/60 text-sm font-medium mb-2">Profile Picture Set</p>
      <h1 className="text-white text-2xl font-bold mb-2">Your Character Profile Pictures</h1>
      {isGenerating ? (
        <div className="flex items-center justify-center gap-2 mt-3">
          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
          <p className="text-white/60 text-sm">
            Generating {completedCount}/{totalExpected} images...
          </p>
        </div>
      ) : (
        <p className="text-white/40 text-sm mt-2">
          {regularImageCount} images generated
          {nsfwEnabled && nsfwImageCount > 0 && ` • ${nsfwImageCount} NSFW images`}
        </p>
      )}
    </div>
  );
}

