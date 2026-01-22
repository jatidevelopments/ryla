'use client';

import * as React from 'react';
import { cn } from '@ryla/ui';
import { Image, Video, Mic, AudioLines, ChevronDown, LayoutGrid } from 'lucide-react';
import { PickerDrawer } from '../../../components/studio/generation/pickers/PickerDrawer';

// Note: 'mixed' is used for template sets but not selectable in filter
export type ContentType = 'all' | 'image' | 'video' | 'lip_sync' | 'audio' | 'mixed';

interface ContentTypeFilterProps {
  value: ContentType;
  onChange: (value: ContentType) => void;
  counts?: Partial<Record<ContentType, number>>;
}

const contentTypes: { value: ContentType; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'All Types', icon: <LayoutGrid className="h-4 w-4" /> },
  { value: 'image', label: 'Images', icon: <Image className="h-4 w-4" /> },
  { value: 'video', label: 'Videos', icon: <Video className="h-4 w-4" /> },
  { value: 'lip_sync', label: 'Lip Sync', icon: <Mic className="h-4 w-4" /> },
  { value: 'audio', label: 'Audio', icon: <AudioLines className="h-4 w-4" /> },
];

/**
 * ContentTypeFilter - Dropdown for filtering by content type
 * Desktop: Regular dropdown, Mobile: PickerDrawer bottom sheet
 * Epic: EP-047 (Template Gallery UX Redesign)
 */
export function ContentTypeFilter({ value, onChange, counts }: ContentTypeFilterProps) {
  const [isDesktopOpen, setIsDesktopOpen] = React.useState(false);
  const [isMobilePickerOpen, setIsMobilePickerOpen] = React.useState(false);
  const desktopDropdownRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);

  // Close desktop dropdown on click outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (desktopDropdownRef.current && !desktopDropdownRef.current.contains(event.target as Node)) {
        setIsDesktopOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = contentTypes.find((opt) => opt.value === value) ?? contentTypes[0];

  return (
    <>
      {/* Desktop: Regular dropdown */}
      <div className="hidden md:block relative" ref={desktopDropdownRef}>
        <button
          onClick={() => setIsDesktopOpen(!isDesktopOpen)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all',
            'bg-[var(--bg-subtle)] border border-[var(--border-default)]',
            'text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple-500)]',
            isDesktopOpen && 'ring-2 ring-[var(--purple-500)]'
          )}
        >
          {selectedOption.icon}
          <span>{selectedOption.label}</span>
          {counts?.[value] !== undefined && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-tertiary)]">
              {counts[value]}
            </span>
          )}
          <ChevronDown
            className={cn(
              'h-4 w-4 text-[var(--text-tertiary)] transition-transform',
              isDesktopOpen && 'rotate-180'
            )}
          />
        </button>

        {isDesktopOpen && (
          <div className="absolute top-full left-0 mt-2 min-w-[180px] z-50 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl shadow-xl overflow-hidden">
            {contentTypes.map((option) => {
              const isActive = value === option.value;
              const count = counts?.[option.value];

              return (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsDesktopOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors',
                    'hover:bg-[var(--bg-subtle)]',
                    isActive
                      ? 'text-[var(--purple-400)] bg-[var(--purple-500)]/10'
                      : 'text-[var(--text-secondary)]'
                  )}
                >
                  {option.icon}
                  <span className="flex-1 text-left">{option.label}</span>
                  {count !== undefined && (
                    <span className="text-xs text-[var(--text-tertiary)]">
                      {count > 999 ? '999+' : count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Mobile: Button that opens PickerDrawer */}
      <div className="md:hidden w-full">
        <button
          ref={buttonRef}
          onClick={() => setIsMobilePickerOpen(true)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 min-h-[44px] w-full text-sm font-medium rounded-xl transition-all',
            'bg-[var(--bg-subtle)] border border-[var(--border-default)]',
            'text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple-500)]'
          )}
        >
          {selectedOption.icon}
          <span className="flex-1 text-left">{selectedOption.label}</span>
          {counts?.[value] !== undefined && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-[var(--bg-elevated)] text-[var(--text-tertiary)]">
              {counts[value]}
            </span>
          )}
          <ChevronDown className="h-4 w-4 text-[var(--text-tertiary)]" />
        </button>

        <PickerDrawer
          isOpen={isMobilePickerOpen}
          onClose={() => setIsMobilePickerOpen(false)}
          anchorRef={buttonRef}
          title="Content Type"
          className="md:w-64"
        >
          <div className="p-2 space-y-1">
            {contentTypes.map((option) => {
              const isActive = value === option.value;
              const count = counts?.[option.value];

              return (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsMobilePickerOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-4 py-4 md:py-3 text-left transition-colors',
                    isActive
                      ? 'bg-[var(--purple-500)] text-white font-medium'
                      : 'text-white/60 hover:bg-white/5 hover:text-white'
                  )}
                >
                  {option.icon}
                  <div className="flex-1">
                    <div className="text-sm font-semibold">{option.label}</div>
                    {count !== undefined && (
                      <div className="text-xs text-white/60">{count} items</div>
                    )}
                  </div>
                  {isActive && (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="h-5 w-5 text-white"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </PickerDrawer>
      </div>
    </>
  );
}
