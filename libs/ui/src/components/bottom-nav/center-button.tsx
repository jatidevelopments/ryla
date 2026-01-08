'use client';

import * as React from 'react';
import { PlusIcon, XIcon } from './icons';

interface CenterButtonProps {
  isOpen: boolean;
  onClick: () => void;
}

export function CenterButton({ isOpen, onClick }: CenterButtonProps) {
  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        zIndex: 60,
      }}
    >
      {isOpen ? (
        <button
          onClick={onClick}
          className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center border border-white/10 active:scale-90 transition-all duration-300 backdrop-blur-md"
        >
          <XIcon className="w-6 h-6 text-white" />
        </button>
      ) : (
        <button
          onClick={onClick}
          className="absolute -top-11 w-16 h-16 flex items-center justify-center active:scale-95 transition-all duration-300 group"
        >
          <div
            className="relative w-full h-full flex items-center justify-center shadow-2xl transition-transform duration-500 group-hover:rotate-12"
            style={{
              background:
                'linear-gradient(135deg, #7C3AED 0%, #A855F7 50%, #EC4899 100%)',
              borderRadius: '24px 12px 24px 12px',
              boxShadow: '0 8px 30px rgba(168,85,247,0.5)',
              border: '2px solid rgba(255,255,255,0.1)',
            }}
          >
            <PlusIcon className="w-9 h-9 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" />
          </div>
        </button>
      )}
    </div>
  );
}
