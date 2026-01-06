'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Calendar } from 'lucide-react';
import { cn } from '@ryla/ui';
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
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle mounting
  useEffect(() => {
    setMounted(true);
  }, []);

  // Calculate position when dropdown opens
  useEffect(() => {
    if (showDatePicker && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const dropdownWidth = 260;
      let left = rect.right - dropdownWidth;

      // Ensure dropdown doesn't go off-screen to the left
      if (left < 8) {
        left = 8;
      }

      // Ensure dropdown doesn't go off-screen to the right
      if (left + dropdownWidth > window.innerWidth - 8) {
        left = window.innerWidth - dropdownWidth - 8;
      }

      setPosition({
        top: rect.bottom + 8,
        left,
      });
    }
  }, [showDatePicker]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!showDatePicker) return;

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
  }, [showDatePicker]);

  const filterTabs: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'generations', label: 'Generations' },
    { value: 'credits', label: 'Credits' },
  ];

  const presetOptions: { value: Exclude<TimeRangeType, 'custom'>; label: string }[] = [
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Filter Tabs */}
        <div className="flex gap-2 p-1 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-default)]">
          {filterTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onFilterChange(tab.value)}
              className={cn(
                'px-4 py-2 text-sm font-medium rounded-md transition-all',
                filter === tab.value
                  ? 'bg-[var(--purple-600)] text-white'
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

          {/* Dropdown for date selection - rendered via portal */}
          {mounted && showDatePicker && position && createPortal(
            <div
              ref={dropdownRef}
              style={{
                position: 'fixed',
                top: position.top,
                left: position.left,
              }}
              className="z-[9999] p-4 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-xl shadow-xl min-w-[260px]"
            >
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1.5">From</label>
                  <input
                    type="date"
                    value={customRange.start}
                    onChange={(e) =>
                      onCustomRangeChange({ ...customRange, start: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-[var(--bg-default)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[var(--text-muted)] mb-1.5">To</label>
                  <input
                    type="date"
                    value={customRange.end}
                    onChange={(e) =>
                      onCustomRangeChange({ ...customRange, end: e.target.value })
                    }
                    className="w-full px-3 py-2 text-sm bg-[var(--bg-default)] border border-[var(--border-default)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50"
                  />
                </div>
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="w-full px-3 py-2 text-sm font-medium bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors"
                >
                  Apply
                </button>
              </div>
            </div>,
            document.body
          )}
        </div>
      </div>
    </div>
  );
}

