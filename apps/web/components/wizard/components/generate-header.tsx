'use client';

interface GenerateHeaderProps {
  name: string;
  personalityTraits: string[];
}

export function GenerateHeader({ name, personalityTraits }: GenerateHeaderProps) {
  return (
    <div className="text-center mb-6">
      <p className="text-white/60 text-sm font-medium mb-2">Final Step</p>
      <h1 className="text-white text-2xl font-bold">{name || 'Your AI Influencer'}</h1>
      {personalityTraits.length > 0 && (
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          {personalityTraits.map((trait) => (
            <span
              key={trait}
              className="rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 px-3 py-1 text-xs text-white/80 capitalize"
            >
              {trait}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

