'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import type { AIModel } from '../types';
import { PickerDrawer } from './PickerDrawer';

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
  const [search, setSearch] = React.useState('');

  const filteredModels = models.filter(
    (model) =>
      model.name.toLowerCase().includes(search.toLowerCase()) ||
      model.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <PickerDrawer
      isOpen={true}
      onClose={onClose}
      anchorRef={anchorRef}
      title="Select model"
      className="md:w-80"
    >
      {/* Search Bar */}
      <div className="p-3 border-b border-white/5">
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
            placeholder="Search models..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 md:h-9 pl-10 pr-3 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[var(--purple-500)]"
          />
        </div>
      </div>

      {/* Model List */}
      <div className="max-h-[400px] overflow-y-auto p-2">
        <div className="space-y-1">
          {filteredModels.map((model) => (
            <button
              key={model.id}
              onClick={() => onSelect(model.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3 py-3 md:py-2.5 text-left transition-colors',
                selectedModelId === model.id
                  ? 'bg-[var(--purple-500)] text-white font-medium'
                  : 'text-white/60 hover:bg-white/5 hover:text-white'
              )}
            >
              {/* Icon */}
              <div
                className={cn(
                  'flex h-9 w-9 md:h-8 md:w-8 items-center justify-center rounded-lg transition-colors shrink-0',
                  selectedModelId === model.id
                    ? 'bg-white/20 text-white'
                    : 'bg-white/5 text-[var(--purple-400)]'
                )}
              >
                <ModelIcon model={model} className="h-5 w-5 md:h-4 md:w-4" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium truncate">
                    {model.name}
                  </span>
                  {model.isUnlimited && (
                    <span
                      className={cn(
                        'px-1.5 py-0.5 rounded text-[9px] md:text-[10px] font-bold uppercase tracking-wider',
                        selectedModelId === model.id
                          ? 'bg-white text-[var(--purple-600)]'
                          : 'bg-[var(--purple-500)] text-white'
                      )}
                    >
                      Unlimited
                    </span>
                  )}
                </div>
                {/* Capability badges */}
                <div className="flex items-center gap-1 mt-0.5">
                  {model.capabilities?.supportsLoRA && (
                    <span
                      className={cn(
                        'px-1 py-0.5 rounded text-[8px] font-medium',
                        selectedModelId === model.id
                          ? 'bg-white/20 text-white'
                          : 'bg-emerald-500/20 text-emerald-400'
                      )}
                      title="Supports LoRA for character consistency"
                    >
                      LoRA
                    </span>
                  )}
                  {model.capabilities?.supportsReferenceImage && (
                    <span
                      className={cn(
                        'px-1 py-0.5 rounded text-[8px] font-medium',
                        selectedModelId === model.id
                          ? 'bg-white/20 text-white'
                          : 'bg-blue-500/20 text-blue-400'
                      )}
                      title="Supports reference image for face consistency"
                    >
                      Face
                    </span>
                  )}
                  {model.capabilities?.supportsNSFW && (
                    <span
                      className={cn(
                        'px-1 py-0.5 rounded text-[8px] font-medium',
                        selectedModelId === model.id
                          ? 'bg-white/20 text-white'
                          : 'bg-rose-500/20 text-rose-400'
                      )}
                      title="Supports adult content"
                    >
                      18+
                    </span>
                  )}
                </div>
                <div
                  className={cn(
                    'text-[11px] md:text-xs truncate mt-0.5',
                    selectedModelId === model.id
                      ? 'text-white/80'
                      : 'text-white/40'
                  )}
                >
                  {model.description}
                </div>
              </div>

              {/* Check */}
              {selectedModelId === model.id && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="h-5 w-5 text-white shrink-0"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          ))}
          {filteredModels.length === 0 && (
            <div className="py-8 text-center text-white/40 text-sm">
              No models found
            </div>
          )}
        </div>
      </div>
    </PickerDrawer>
  );
}

function ModelIcon({
  model,
  className,
}: {
  model: AIModel;
  className?: string;
}) {
  const iconClass = cn('shrink-0', className);

  const icons: Record<string, React.ReactNode> = {
    soul: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={iconClass}
      >
        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
      </svg>
    ),
    'face-swap': (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={iconClass}
      >
        <path
          fillRule="evenodd"
          d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z"
          clipRule="evenodd"
        />
      </svg>
    ),
    character: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={iconClass}
      >
        <path d="M7.5 6.5C7.5 8.981 9.519 11 12 11s4.5-2.019 4.5-4.5S14.481 2 12 2 7.5 4.019 7.5 6.5zM20 21h1v-1c0-3.859-3.141-7-7-7h-4c-3.86 0-7 3.141-7 7v1h17z" />
      </svg>
    ),
    flux: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={iconClass}
      >
        <path
          fillRule="evenodd"
          d="M14.615 1.595a.75.75 0 01.359.852L12.982 9.75h7.268a.75.75 0 01.548 1.262l-10.5 11.25a.75.75 0 01-1.272-.71l1.992-7.302H3.75a.75.75 0 01-.548-1.262l10.5-11.25a.75.75 0 01.913-.143z"
          clipRule="evenodd"
        />
      </svg>
    ),
    openai: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={iconClass}
      >
        <path d="M22.2819 10.18a5.98 5.98 0 0 0-.52-4.9c-.93-1.61-2.58-2.67-4.43-2.9a6.05 6.05 0 0 0-6.51 2.9A6.07 6.07 0 0 0 5 4.18a5.98 5.98 0 0 0-4 2.9 6.05 6.05 0 0 0 .74 7.1 5.98 5.98 0 0 0 .51 4.91 6.05 6.05 0 0 0 6.51 2.9 5.98 5.98 0 0 0 4.5 4 6.06 6.06 0 0 0 5.77-4.21 5.99 5.99 0 0 0 4-2.9 6.06 6.06 0 0 0-.75-7.07zm-9.02 12.61a4.48 4.48 0 0 1-2.88-1.04l.14-.08 4.78-2.76c.24-.14.39-.4.39-.68v-6.74l2.02 1.17c.05.03.04.1.04.05v5.58a4.5 4.5 0 0 1-4.49 4.5zm-9.66-4.13a4.47 4.47 0 0 1-.53-3.01l.14.09 4.78 2.76c.24.13.54.13.78 0l5.84-3.37v2.33c0 .05-.03.06-.03.06l-4.83 2.79a4.5 4.5 0 0 1-6.14-1.65zM2.34 7.9a4.49 4.49 0 0 1 2.37-1.97V11.6c0 .27.15.53.39.68l5.81 3.35-2.02 1.17a.08.08 0 0 1-.07 0L4 14.01A4.5 4.5 0 0 1 2.34 7.9zm16.1 3.86L12.6 8.38l2.02-1.16c.05-.03.07-.03.07 0l4.83 2.79a4.49 4.49 0 0 1-.68 8.1v-5.68c0-.28-.15-.54-.41-.68zm2.01-3.02l-.14-.09-4.77-2.78c-.24-.14-.54-.14-.79 0L9.41 9.23V6.9c0-.05.03-.06.03-.06l4.83-2.79a4.5 4.5 0 0 1 6.14 1.65 4.47 4.47 0 0 1 .58 3.03zm-7.53 4.16l-2.02-1.16c-.05-.03-.04-.1-.04-.06V6.07a4.5 4.5 0 0 1 7.38-3.45l-.14.08-4.78 2.76c-.24.14-.39.4-.39.68v6.74zm1.1-2.37l2.6-1.5 2.61 1.5v3.01L14.41 15l-2.6-1.5z" />
      </svg>
    ),
  };

  return (
    icons[model.icon] || (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={iconClass}
      >
        <path d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5z" />
      </svg>
    )
  );
}
