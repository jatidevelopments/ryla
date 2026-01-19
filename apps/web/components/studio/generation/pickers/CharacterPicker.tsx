'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@ryla/ui';
import { routes } from '@/lib/routes';
import { PickerDrawer } from './PickerDrawer';

interface Influencer {
  id: string;
  name: string;
  avatar?: string;
}

interface CharacterPickerProps {
  influencers: Influencer[];
  selectedInfluencerId: string | null;
  onSelect: (influencerId: string) => void;
  onClose: () => void;
}

export function CharacterPicker({
  influencers,
  selectedInfluencerId,
  onSelect,
  onClose,
}: CharacterPickerProps) {
  const [search, setSearch] = React.useState('');

  const filteredInfluencers = influencers.filter((inf) =>
    inf.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PickerDrawer
      isOpen={true}
      onClose={onClose}
      title="Characters"
      className="w-full max-w-2xl"
    >
      {/* Search Bar */}
      <div className="p-4 border-b border-white/5">
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
          <input
            type="text"
            placeholder="Search characters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--purple-500)]"
          />
        </div>
      </div>

      {/* Characters Grid */}
      <div className="p-4 overflow-y-auto max-h-[60vh] md:max-h-[500px]">
        <div className="grid grid-cols-2 min-[480px]:grid-cols-3 sm:grid-cols-4 gap-3">
          {/* Create New Card */}
          <Link
            href={routes.wizard.step0}
            onClick={onClose}
            className="group flex flex-col items-center justify-center aspect-[3/4] rounded-xl bg-white/5 border border-dashed border-white/20 hover:border-[var(--purple-500)]/50 hover:bg-[var(--purple-500)]/5 transition-all p-4"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 group-hover:bg-[var(--purple-500)]/20 transition-colors mb-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-6 w-6 text-white/50 group-hover:text-[var(--purple-400)]"
              >
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
            </div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-xs font-medium text-white text-center">
                Create new
              </span>
              <span className="text-[10px] text-white/40 text-center leading-tight">
                Build your own
              </span>
            </div>
          </Link>

          {/* Influencer Cards */}
          {filteredInfluencers.map((influencer) => (
            <button
              key={influencer.id}
              onClick={() => onSelect(influencer.id)}
              className={cn(
                'group relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all',
                selectedInfluencerId === influencer.id
                  ? 'border-[var(--purple-500)] ring-2 ring-[var(--purple-500)]/30'
                  : 'border-transparent hover:border-white/30'
              )}
            >
              {influencer.avatar ? (
                <Image
                  src={influencer.avatar}
                  alt={influencer.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[var(--purple-500)] to-[var(--pink-500)] flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {influencer.name.charAt(0)}
                  </span>
                </div>
              )}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

              {/* Name */}
              <div className="absolute bottom-0 left-0 right-0 p-2.5">
                <span className="text-xs font-bold text-white uppercase truncate block text-left">
                  {influencer.name}
                </span>
              </div>

              {/* Selection indicator */}
              {selectedInfluencerId === influencer.id && (
                <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--purple-500)] shadow-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="h-4 w-4 text-white"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {filteredInfluencers.length === 0 && search && (
          <div className="flex flex-col items-center justify-center py-12 text-center text-white/40">
            <p>No characters found matching "{search}"</p>
          </div>
        )}
      </div>
    </PickerDrawer>
  );
}
