'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@ryla/ui';
import type { AIModel } from './types';

interface ModelPickerProps {
  models: AIModel[];
  selectedModelId: string;
  onSelect: (modelId: string) => void;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLElement | null>;
}

export function ModelPicker({
  models,
  selectedModelId,
  onSelect,
  onClose,
  anchorRef,
}: ModelPickerProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [search, setSearch] = React.useState('');
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const [mounted, setMounted] = React.useState(false);

  // Calculate position based on anchor element
  React.useEffect(() => {
    setMounted(true);
    
    const updatePosition = () => {
      if (anchorRef?.current) {
        const rect = anchorRef.current.getBoundingClientRect();
        setPosition({
          top: rect.top - 8, // Position above with margin
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

  const filteredModels = models.filter(model =>
    model.name.toLowerCase().includes(search.toLowerCase()) ||
    model.description.toLowerCase().includes(search.toLowerCase())
  );

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
      className="w-80 rounded-xl border border-white/10 bg-[#1a1a1d] shadow-xl z-[9999] max-h-[400px] flex flex-col overflow-hidden"
    >
      {/* Header */}
      <div className="p-3 border-b border-white/10">
        <div className="text-sm font-medium text-white mb-2">Select model</div>
        <div className="relative">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40">
            <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
          </svg>
          <input
            type="text"
            placeholder="Search models..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--purple-500)]"
          />
        </div>
      </div>

      {/* Model List */}
      <div className="flex-1 overflow-y-auto p-2">
        <div className="space-y-0.5">
          {filteredModels.map((model) => (
            <button
              key={model.id}
              onClick={() => onSelect(model.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors',
                selectedModelId === model.id
                  ? 'bg-[var(--purple-500)]/20 text-white'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              )}
            >
              {/* Icon */}
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-[var(--purple-400)]">
                <ModelIcon model={model} className="h-4 w-4" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">{model.name}</span>
                  {model.isUnlimited && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[var(--purple-500)] text-white">
                      Unlimited
                    </span>
                  )}
                  {model.isNew && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[var(--purple-500)] text-white">
                      New
                    </span>
                  )}
                </div>
                <div className="text-xs text-white/40 truncate">{model.description}</div>
              </div>

              {/* Check */}
              {selectedModelId === model.id && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-[var(--purple-400)] shrink-0">
                  <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}

function ModelIcon({ model, className }: { model: AIModel; className?: string }) {
  const iconClass = cn('shrink-0', className);
  
  switch (model.icon) {
    case 'soul':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={iconClass}>
          <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
        </svg>
      );
    case 'face-swap':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={iconClass}>
          <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" />
        </svg>
      );
    case 'character':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={iconClass}>
          <path d="M7.5 6.5C7.5 8.981 9.519 11 12 11s4.5-2.019 4.5-4.5S14.481 2 12 2 7.5 4.019 7.5 6.5zM20 21h1v-1c0-3.859-3.141-7-7-7h-4c-3.86 0-7 3.141-7 7v1h17z" />
        </svg>
      );
    case 'flux':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={iconClass}>
          <path fillRule="evenodd" d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z" clipRule="evenodd" />
        </svg>
      );
    case 'openai':
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={iconClass}>
          <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.8956zm16.0993 3.8558L12.6 8.3829l2.02-1.1638a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.4068-.6813zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.1408 1.6465 4.4708 4.4708 0 0 1 .5765 3.0285zm-7.5338 4.1559l-2.0202-1.1638a.071.071 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805-4.7782 2.7582a.7948.7948 0 0 0-.3927.6813v6.7369zm1.0974-2.3657l2.602-1.5039 2.6069 1.5039v3.0078l-2.6069 1.5039-2.602-1.5039z" />
        </svg>
      );
    default:
      return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={iconClass}>
          <path d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5z" />
        </svg>
      );
  }
}

