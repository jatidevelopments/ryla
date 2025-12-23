'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@ryla/ui';
import type { Quality, QualityOption } from './types';

interface QualityPickerProps {
  options: QualityOption[];
  selectedQuality: Quality;
  onSelect: (quality: Quality) => void;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLElement | null>;
}

export function QualityPicker({
  options,
  selectedQuality,
  onSelect,
  onClose,
  anchorRef,
}: QualityPickerProps) {
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
      className="w-56 rounded-xl border border-white/10 bg-[#1a1a1d] p-2 shadow-xl z-[9999]"
    >
      <div className="mb-2 px-2 text-xs font-medium text-white/50 uppercase tracking-wider">
        Select quality
      </div>
      <div className="space-y-0.5">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onSelect(option.value)}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors',
              selectedQuality === option.value
                ? 'bg-[var(--purple-500)]/20 text-white'
                : 'text-white/60 hover:bg-white/5 hover:text-white'
            )}
          >
            <div className="flex-1">
              <div className="text-sm font-medium">{option.label}</div>
              <div className="text-xs text-white/40">{option.description}</div>
            </div>
            {selectedQuality === option.value && (
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
