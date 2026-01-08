'use client';

import * as React from 'react';
import Link from 'next/link';
import { cn } from '../../lib/utils';
import { UserPlusIcon, SparklesIcon, XIcon, UsersIcon } from './icons';
import { ChevronRight } from 'lucide-react';

interface AddMenuProps {
  isOpen: boolean;
  onItemClick: () => void;
}

const addMenuItems = [
  { id: 1, title: 'Influencer', url: '/wizard/step-0', icon: UserPlusIcon },
  { id: 2, title: 'Content', url: '/studio', icon: SparklesIcon },
];

export function AddMenu({ isOpen, onItemClick }: AddMenuProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[9998] bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onItemClick}
      />

      {/* Bottom Sheet */}
      <div
        className="fixed inset-x-0 bottom-0 z-[9999] flex flex-col bg-[var(--bg-elevated)] rounded-t-[32px] border-t border-white/10 shadow-2xl animate-in slide-in-from-bottom-full duration-400 ease-out"
        style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1.5 w-12 rounded-full bg-white/20" />
        </div>

        {/* Header */}
        <div className="px-5 py-3 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Create</h3>
          <button
            onClick={onItemClick}
            className="p-2 rounded-full hover:bg-white/5 text-white/40 hover:text-white transition-colors"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          {addMenuItems.map((item) => (
            <Link
              href={item.url}
              key={item.id}
              onClick={onItemClick}
              className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 active:scale-[0.98] transition-all text-left no-underline"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10">
                <item.icon
                  className={cn(
                    'w-6 h-6',
                    item.id === 1 ? 'text-orange-400' : 'text-purple-400'
                  )}
                />
              </div>
              <div className="flex-1">
                <div className="font-bold text-white text-lg leading-tight">
                  {item.title}
                </div>
                <div className="text-sm text-white/50 font-medium">
                  {item.id === 1 ? 'New AI Character' : 'Generate content'}
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-white/20" />
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
