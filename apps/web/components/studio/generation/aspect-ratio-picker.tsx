'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@ryla/ui';
import type { AspectRatio } from './types';

interface AspectRatioOption {
  value: AspectRatio;
  label: string;
  icon: 'square' | 'portrait' | 'landscape';
}

interface AspectRatioPickerProps {
  ratios: AspectRatioOption[];
  selectedRatio: AspectRatio;
  onSelect: (ratio: AspectRatio) => void;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLElement | null>;
}

export function AspectRatioPicker({
  ratios,
  selectedRatio,
  onSelect,
  onClose,
  anchorRef,
}: AspectRatioPickerProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const [mounted, setMounted] = React.useState(false);

  // Calculate position based on anchor element
  React.useEffect(() => {
    setMounted(true);
    
    const updatePosition = () => {
      if (anchorRef?.current) {
        const rect = anchorRef.current.getBoundingClientRect();
        setPosition({
          top: rect.top - 8,
          left: rect.left,
        });
      }
    };
    
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [anchorRef]);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (!mounted) return null;

  const content = (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        top: position.top,
        left: position.left,
        transform: 'translateY(-100%)',
      }}
      className="w-48 rounded-xl border border-white/10 bg-[#1a1a1d] p-2 shadow-xl z-[9999]"
    >
      <div className="mb-2 px-2 text-xs font-medium text-white/50 uppercase tracking-wider">
        Aspect ratio
      </div>
      <div className="space-y-0.5">
        {ratios.map((ratio) => (
          <button
            key={ratio.value}
            onClick={() => onSelect(ratio.value)}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
              selectedRatio === ratio.value
                ? 'bg-[var(--purple-500)]/20 text-white'
                : 'text-white/60 hover:bg-white/5 hover:text-white'
            )}
          >
            <div className="flex h-5 w-5 items-center justify-center">
              {ratio.icon === 'portrait' && (
                <div className="h-5 w-3 border border-current rounded-sm" />
              )}
              {ratio.icon === 'landscape' && (
                <div className="h-3 w-5 border border-current rounded-sm" />
              )}
              {ratio.icon === 'square' && (
                <div className="h-4 w-4 border border-current rounded-sm" />
              )}
            </div>
            <span className="flex-1 text-left">{ratio.label}</span>
            {selectedRatio === ratio.value && (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-[var(--purple-400)]">
                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
