'use client';

export function CreatingLoading() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-24 h-24 mb-8">
        <div className="absolute inset-0 rounded-full border-4 border-purple-500/20" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 animate-spin" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2">Creating Your Character</h2>
      <p className="text-white/60 text-sm">This may take a moment...</p>
    </div>
  );
}

