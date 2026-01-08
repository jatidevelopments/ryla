'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import {
  Calendar,
  Filter,
  Clock,
  Settings2,
  Check,
  X,
  ChevronRight,
} from 'lucide-react';
import { cn, useIsMobile } from '@ryla/ui';
import type { FilterType, TimeRangeType } from '@ryla/shared';

interface ActivityFiltersProps {
  filter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  timeRange: TimeRangeType;
  onTimeRangeChange: (range: TimeRangeType) => void;
  customRange: { start: string; end: string };
  onCustomRangeChange: (range: { start: string; end: string }) => void;
}

export function ActivityFilters({
  filter,
  onFilterChange,
  timeRange,
  onTimeRangeChange,
  customRange,
  onCustomRangeChange,
}: ActivityFiltersProps) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showFiltersModal, setShowFiltersModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const isMobile = useIsMobile();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock scroll when modal is open
  useEffect(() => {
    if (showFiltersModal) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [showFiltersModal]);

  // Calculate position when dropdown opens (Desktop only)
  useEffect(() => {
    if (!isMobile && showDatePicker && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 260;
      let left = rect.right - dropdownWidth;

      if (left < 8) left = 8;
      if (left + dropdownWidth > window.innerWidth - 8) {
        left = window.innerWidth - dropdownWidth - 8;
      }

      setPosition({
        top: rect.bottom + 8,
        left,
      });
    }
  }, [showDatePicker, isMobile]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showDatePicker || isMobile) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowDatePicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDatePicker, isMobile]);

  const filterTabs: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'generations', label: 'Generations' },
    { value: 'credits', label: 'Credits' },
  ];

  const presetOptions: {
    value: Exclude<TimeRangeType, 'custom'>;
    label: string;
  }[] = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
  ];

  // Format date for display
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const customLabel =
    timeRange === 'custom' && customRange.start && customRange.end
      ? `${formatDate(customRange.start)} – ${formatDate(customRange.end)}`
      : 'Custom';

  const activeTimeRangeLabel =
    timeRange === 'custom'
      ? customLabel
      : presetOptions.find((o) => o.value === timeRange)?.label || 'All Time';

  return (
    <div className="space-y-4">
      {/* Mobile Filter Trigger */}
      <div className="flex lg:hidden flex-col gap-2">
        <button
          onClick={() => setShowFiltersModal(true)}
          className="flex items-center justify-between px-4 py-3.5 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl shadow-sm active:scale-[0.98] transition-all"
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400 shrink-0">
              <Filter className="h-4.5 w-4.5" />
            </div>
            <div className="flex flex-col items-start min-w-0">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[var(--text-muted)]">
                Active filters
              </span>
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="text-sm font-semibold text-[var(--text-primary)]">
                  {filterTabs.find((t) => t.value === filter)?.label}
                </span>
                <span className="h-1 w-1 rounded-full bg-white/20" />
                <span className="text-sm font-medium text-[var(--text-secondary)] truncate">
                  {activeTimeRangeLabel}
                </span>
              </div>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-[var(--text-muted)]" />
        </button>
      </div>

      {/* Desktop Filter Bar */}
      <div className="hidden lg:flex flex-row lg:items-center lg:justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex gap-2 p-1 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-default)]">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onFilterChange(tab.value)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md transition-all',
                filter === tab.value
                  ? 'bg-[var(--purple-600)] text-white shadow-lg shadow-purple-900/20'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Time Range Filter */}
        <div className="flex gap-1 p-1 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-default)]">
          {presetOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onTimeRangeChange(option.value);
                setShowDatePicker(false);
              }}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                timeRange === option.value
                  ? 'bg-purple-500/20 text-purple-300'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
              )}
            >
              {option.label}
            </button>
          ))}

          {/* Custom date range with dropdown */}
          <button
            ref={buttonRef}
            onClick={() => {
              if (timeRange !== 'custom') {
                onTimeRangeChange('custom');
              }
              setShowDatePicker(!showDatePicker);
            }}
            className={cn(
              'px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5',
              timeRange === 'custom'
                ? 'bg-purple-500/20 text-purple-300'
                : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5'
            )}
          >
            <Calendar className="h-3 w-3" />
            <span className="max-w-[120px] truncate">{customLabel}</span>
          </button>

          {/* Dropdown for date selection - rendered via portal (Desktop) */}
          {mounted &&
            !isMobile &&
            showDatePicker &&
            position &&
            createPortal(
              <div
                ref={dropdownRef}
                style={{
                  position: 'fixed',
                  top: position.top,
                  left: position.left,
                }}
                className="z-[9999] p-4 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl shadow-xl min-w-[260px] animate-in fade-in zoom-in-95 duration-200"
              >
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                      From
                    </label>
                    <input
                      type="date"
                      value={customRange.start}
                      onChange={(e) =>
                        onCustomRangeChange({
                          ...customRange,
                          start: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-sm bg-[var(--bg-default)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-[var(--text-muted)] mb-1.5">
                      To
                    </label>
                    <input
                      type="date"
                      value={customRange.end}
                      onChange={(e) =>
                        onCustomRangeChange({
                          ...customRange,
                          end: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 text-sm bg-[var(--bg-default)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                    />
                  </div>
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="w-full px-3 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors shadow-lg shadow-purple-900/20"
                  >
                    Apply
                  </button>
                </div>
              </div>,
              document.body
            )}
        </div>
      </div>

      {/* Mobile Filters Modal */}
      {mounted &&
        isMobile &&
        showFiltersModal &&
        createPortal(
          <div className="fixed inset-0 z-[100] flex flex-col justify-end">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
              onClick={() => setShowFiltersModal(false)}
            />

            {/* Bottom Sheet */}
            <div className="relative w-full bg-[#0d0d0f] rounded-t-[32px] border-t border-white/10 shadow-2xl animate-in slide-in-from-bottom-full duration-300 ease-out">
              {/* Drag Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="h-1.5 w-12 rounded-full bg-white/10" />
              </div>

              <div className="px-6 py-4 flex items-center justify-between border-b border-white/5">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Settings2 className="h-5 w-5 text-purple-400" />
                  Filters
                </h3>
                <button
                  onClick={() => setShowFiltersModal(false)}
                  className="p-2 rounded-full bg-white/5 text-white/60 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="px-6 py-6 pb-12 overflow-y-auto max-h-[70vh] space-y-8">
                {/* Filter Categories */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">
                    Category
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    {filterTabs.map((tab) => (
                      <button
                        key={tab.value}
                        onClick={() => onFilterChange(tab.value)}
                        className={cn(
                          'flex items-center justify-between px-4 py-4 rounded-2xl transition-all border',
                          filter === tab.value
                            ? 'bg-purple-600/10 border-purple-500/50 text-white'
                            : 'bg-white/5 border-transparent text-[var(--text-secondary)]'
                        )}
                      >
                        <span className="font-semibold text-sm">
                          {tab.label}
                        </span>
                        {filter === tab.value && (
                          <Check className="h-5 w-5 text-purple-400" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Range */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest pl-1">
                    Time Range
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    {presetOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          onTimeRangeChange(option.value);
                        }}
                        className={cn(
                          'flex items-center justify-between px-4 py-4 rounded-2xl transition-all border text-left',
                          timeRange === option.value
                            ? 'bg-purple-600/10 border-purple-500/50 text-white'
                            : 'bg-white/5 border-transparent text-[var(--text-secondary)]'
                        )}
                      >
                        <span className="font-semibold text-sm">
                          {option.label}
                        </span>
                      </button>
                    ))}

                    {/* Custom Option Toggle */}
                    <button
                      onClick={() => {
                        onTimeRangeChange('custom');
                      }}
                      className={cn(
                        'col-span-2 flex items-center justify-between px-4 py-4 rounded-2xl transition-all border',
                        timeRange === 'custom'
                          ? 'bg-purple-600/10 border-purple-500/50 text-white'
                          : 'bg-white/5 border-transparent text-[var(--text-secondary)]'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="font-semibold text-sm">
                          Custom Range
                        </span>
                      </div>
                      {timeRange === 'custom' && (
                        <Check className="h-5 w-5 text-purple-400" />
                      )}
                    </button>
                  </div>

                  {/* Custom Date Inputs (only when custom is selected) */}
                  {timeRange === 'custom' && (
                    <div className="grid grid-cols-2 gap-3 mt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider ml-1">
                          From
                        </label>
                        <input
                          type="date"
                          value={customRange.start}
                          onChange={(e) =>
                            onCustomRangeChange({
                              ...customRange,
                              start: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-[var(--bg-default)] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider ml-1">
                          To
                        </label>
                        <input
                          type="date"
                          value={customRange.end}
                          onChange={(e) =>
                            onCustomRangeChange({
                              ...customRange,
                              end: e.target.value,
                            })
                          }
                          className="w-full px-4 py-3 bg-[var(--bg-default)] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Apply Button */}
                <button
                  onClick={() => setShowFiltersModal(false)}
                  className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-2xl shadow-xl shadow-purple-900/20 active:scale-[0.98] transition-all"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
