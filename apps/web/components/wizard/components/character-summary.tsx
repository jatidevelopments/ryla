'use client';

interface SummaryItem {
  label: string;
  value: string | number | undefined;
}

interface CharacterSummaryProps {
  items: SummaryItem[];
}

export function CharacterSummary({ items }: CharacterSummaryProps) {
  return (
    <div className="w-full mb-5">
      <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
        <p className="text-white/70 text-sm mb-4">Character Summary</p>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {items.map((item) => (
            <div key={item.label} className="flex flex-col">
              <span className="text-white/40 text-xs">{item.label}</span>
              <span className="text-white capitalize">
                {String(item.value).replace(/-/g, ' ')}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

