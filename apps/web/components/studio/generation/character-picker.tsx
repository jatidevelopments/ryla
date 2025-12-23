'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn, Input } from '@ryla/ui';

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
  const overlayRef = React.useRef<HTMLDivElement>(null);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const filteredInfluencers = influencers.filter(inf =>
    inf.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div className="w-full max-w-2xl max-h-[80vh] bg-[#1a1a1d] rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Characters</h2>
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
              </svg>
              <Input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 pl-9 bg-white/5 border-white/10 text-sm placeholder:text-white/40"
              />
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(80vh-80px)]">
          <div className="grid grid-cols-4 gap-3">
            {/* Create New Card */}
            <Link
              href="/wizard/step-0"
              onClick={onClose}
              className="group flex flex-col items-center justify-center aspect-[3/4] rounded-xl bg-white/5 border border-dashed border-white/20 hover:border-[var(--purple-500)]/50 hover:bg-[var(--purple-500)]/5 transition-all"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10 group-hover:bg-[var(--purple-500)]/20 transition-colors mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-7 w-7 text-white/50 group-hover:text-[var(--purple-400)]">
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-white">Create new</span>
              <span className="text-xs text-white/40">Build your own AI character</span>
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
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[var(--purple-500)] to-[var(--pink-500)] flex items-center justify-center">
                    <span className="text-4xl font-bold text-white">
                      {influencer.name.charAt(0)}
                    </span>
                  </div>
                )}
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                
                {/* Name */}
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <span className="text-sm font-bold text-white uppercase">
                    {influencer.name}
                  </span>
                </div>

                {/* Selection indicator */}
                {selectedInfluencerId === influencer.id && (
                  <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--purple-500)]">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-white">
                      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>

          {filteredInfluencers.length === 0 && search && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-8 w-8 text-white/30">
                  <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-white/50">No characters found matching &quot;{search}&quot;</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

