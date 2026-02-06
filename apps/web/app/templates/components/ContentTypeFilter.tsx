'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@ryla/ui';
import { Image, Video, Mic, AudioLines, ChevronDown, LayoutGrid } from 'lucide-react';
import { PickerDrawer } from '../../../components/studio/generation/pickers/PickerDrawer';

// Note: 'mixed' is used for template sets but not selectable in filter
export type ContentType = 'all' | 'image' | 'video' | 'lip_sync' | 'audio' | 'mixed';

interface ContentTypeFilterProps {
  value: ContentType;
  onChange: (value: ContentType) => void;
  counts?: Partial<Record<ContentType, number>>;
  // Add multi-select support
  selectedTypes?: ContentType[];
  onMultiChange?: (types: ContentType[]) => void;
  multiSelect?: boolean;
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
export function ContentTypeFilter({ value, onChange, counts, selectedTypes = [], onMultiChange, multiSelect = true }: ContentTypeFilterProps) {
  const [isDesktopOpen, setIsDesktopOpen] = React.useState(false);
  const [isMobilePickerOpen, setIsMobilePickerOpen] = React.useState(false);
  const [dropdownPosition, setDropdownPosition] = React.useState({ top: 0, left: 0, width: 0 });
  const desktopDropdownRef = React.useRef<HTMLDivElement>(null);
  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const portalRef = React.useRef<HTMLDivElement | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Update dropdown position when opened
  React.useEffect(() => {
    if (isDesktopOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isDesktopOpen]);

  // Close desktop dropdown on click outside (button or portaled dropdown).
  // Use data attribute for portal check so we don't rely on ref timing (portal may not have ref set when mousedown fires).
  const DROPDOWN_DATA_ATTR = 'data-content-type-dropdown';
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (desktopDropdownRef.current?.contains(target)) return;
      if (target.closest?.(`[${DROPDOWN_DATA_ATTR}]`)) return;
      setIsDesktopOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Normalize: empty or ['all'] => show "All Types"
  const selectedTypesNorm = selectedTypes.length === 0 ? ['all'] : selectedTypes;
  const activeTypes = selectedTypesNorm.filter(t => t !== 'all');
  const selectedOption = activeTypes.length === 1 
    ? contentTypes.find((opt) => opt.value === activeTypes[0]) ?? contentTypes[0]
    : contentTypes[0];
  
  const displayLabel = activeTypes.length > 1 
    ? `${activeTypes.length} Types` 
    : activeTypes.length === 1 
      ? (contentTypes.find((opt) => opt.value === activeTypes[0])?.label ?? 'All Types')
      : 'All Types';

  const handleTypeToggle = (type: ContentType) => {
    if (!multiSelect || !onMultiChange) {
      // Single select mode
      onChange(type);
      setIsDesktopOpen(false);
      return;
    }

    // Multi-select mode
    if (type === 'all') {
      onMultiChange(['all']);
      return;
    }

    let newTypes: ContentType[];
    if (activeTypes.includes(type)) {
      // Remove type
      newTypes = activeTypes.filter(t => t !== type);
      if (newTypes.length === 0) {
        newTypes = ['all'];
      }
    } else {
      // Add type
      newTypes = [...activeTypes, type];
    }
    
    onMultiChange(newTypes);
  };

  const isTypeSelected = (type: ContentType) => {
    if (type === 'all') {
      return activeTypes.length === 0 || selectedTypesNorm.includes('all');
    }
    return activeTypes.includes(type);
  };

  return (
    <>
      {/* Desktop: Regular dropdown - no background wrapper button */}
      <div className="hidden md:block relative" ref={desktopDropdownRef}>
        <button
          ref={buttonRef}
          onClick={() => setIsDesktopOpen(!isDesktopOpen)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all',
            'text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple-500)]',
            isDesktopOpen && 'bg-[var(--bg-elevated)]'
          )}
        >
          {selectedOption.icon}
          <span>{displayLabel}</span>
          {activeTypes.length > 0 && activeTypes.length < contentTypes.length - 1 && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-[var(--purple-500)]/10 text-[var(--purple-400)] border border-[var(--purple-500)]/30">
              {activeTypes.length}
            </span>
          )}
          <ChevronDown
            className={cn(
              'h-4 w-4 text-[var(--text-tertiary)] transition-transform',
              isDesktopOpen && 'rotate-180'
            )}
          />
        </button>

        {/* Render dropdown in portal */}
        {mounted && isDesktopOpen && createPortal(
          <div 
            ref={(el) => { portalRef.current = el; }}
            {...{ [DROPDOWN_DATA_ATTR]: true }}
            className="fixed min-w-[180px] z-[9999] bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl shadow-xl overflow-hidden"
            style={{
              top: `${dropdownPosition.top}px`,
              left: `${dropdownPosition.left}px`,
            }}
          >
            {contentTypes.map((option) => {
              const isActive = isTypeSelected(option.value);
              const count = counts?.[option.value];

              return (
                <button
                  key={option.value}
                  onClick={() => handleTypeToggle(option.value)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors',
                    'hover:bg-[var(--bg-subtle)]',
                    isActive
                      ? 'text-[var(--purple-400)] bg-[var(--purple-500)]/10'
                      : 'text-[var(--text-secondary)]'
                  )}
                >
                  {multiSelect && (
                    <div className={cn(
                      'w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0',
                      isActive 
                        ? 'border-[var(--purple-500)] bg-[var(--purple-500)]' 
                        : 'border-[var(--border-default)]'
                    )}>
                      {isActive && (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-white">
                          <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  )}
                  {option.icon}
                  <span className="flex-1 text-left whitespace-nowrap">{option.label}</span>
                  {count !== undefined && (
                    <span className="text-xs text-[var(--text-tertiary)]">
                      {count > 999 ? '999+' : count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>,
          document.body
        )}
      </div>

      {/* Mobile: Button that opens PickerDrawer */}
      <div className="md:hidden w-full">
        <button
          onClick={() => setIsMobilePickerOpen(true)}
          className={cn(
            'flex items-center gap-2 px-4 py-2.5 min-h-[44px] w-full text-sm font-medium rounded-xl transition-all',
            'bg-[var(--bg-subtle)] border border-[var(--border-default)]',
            'text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple-500)]'
          )}
        >
          {selectedOption.icon}
          <span className="flex-1 text-left">{displayLabel}</span>
          {activeTypes.length > 0 && activeTypes.length < contentTypes.length - 1 && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-[var(--purple-500)]/10 text-[var(--purple-400)] border border-[var(--purple-500)]/30">
              {activeTypes.length}
            </span>
          )}
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
          anchorRef={{ current: null }}
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
