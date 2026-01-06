'use client';

import { Search } from 'lucide-react';
import { cn } from '@ryla/ui';

interface OutfitPickerSearchProps {
  search: string;
  onSearchChange: (value: string) => void;
  showFavoritesOnly: boolean;
  onToggleFavorites: () => void;
}

export function OutfitPickerSearch({
  search,
  onSearchChange,
  showFavoritesOnly,
  onToggleFavorites,
}: OutfitPickerSearchProps) {
  return (
    <div className="flex-shrink-0 px-6 py-4 border-b border-white/10">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <input
            type="text"
            placeholder="Search pieces..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-10 pl-9 pr-4 bg-[#0d0d0f] border border-white/10 rounded-xl text-sm placeholder:text-white/40 focus:border-white/20 focus:ring-0 text-white"
          />
        </div>
        <button
          onClick={onToggleFavorites}
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
            showFavoritesOnly
              ? 'bg-[var(--purple-500)] text-white shadow-lg shadow-[var(--purple-500)]/25'
              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={cn('h-4 w-4', showFavoritesOnly && 'fill-current')}
          >
            <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
          </svg>
          <span className="hidden sm:inline">Favorites</span>
        </button>
      </div>
    </div>
  );
}

