'use client';

import { Input } from '@ryla/ui';

interface PosePickerHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  showFavoritesOnly: boolean;
  onToggleFavorites: () => void;
  onClose: () => void;
}

export function PosePickerHeader({
  search,
  onSearchChange,
  showFavoritesOnly,
  onToggleFavorites,
  onClose,
}: PosePickerHeaderProps) {
  return (
    <div className="flex items-center gap-4 px-6 py-4 border-b border-white/10">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--purple-500)]/20 to-[var(--pink-500)]/20 border border-[var(--purple-500)]/20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5 text-[var(--purple-400)]"
          >
            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zM3 18a7 7 0 0114 0v1H3v-1zm7-4a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1z" />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Pose Selection</h2>
          <p className="text-sm text-white/50">Choose a pose to add to your prompt</p>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search, Favorites Filter & Close */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleFavorites}
          className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
            showFavoritesOnly
              ? 'bg-[var(--purple-500)] text-white shadow-lg shadow-[var(--purple-500)]/25'
              : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className={`h-4 w-4 ${showFavoritesOnly && 'fill-current'}`}
          >
            <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
          </svg>
          <span className="hidden sm:inline">Favorites</span>
        </button>
        <div className="relative">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40"
          >
            <path
              fillRule="evenodd"
              d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z"
              clipRule="evenodd"
            />
          </svg>
          <Input
            type="text"
            placeholder="Search poses..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-44 h-10 pl-9 pr-4 bg-[#0d0d0f] border-white/10 rounded-xl text-sm placeholder:text-white/40 focus:border-white/20 focus:ring-0"
          />
        </div>
        <button
          onClick={onClose}
          className="flex items-center justify-center h-10 w-10 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

