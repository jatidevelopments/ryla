'use client';

interface BaseImageErrorProps {
  error: string | null;
}

export function BaseImageError({ error }: BaseImageErrorProps) {
  if (!error) return null;

  return (
    <div className="w-full mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
      <p className="text-red-400 text-sm">{error}</p>
    </div>
  );
}

