'use client';

interface ObjectPickerFooterProps {
  selectedCount: number;
  maxObjects: number;
  canAddMore: boolean;
  onClose: () => void;
}

export function ObjectPickerFooter({ selectedCount, maxObjects, canAddMore, onClose }: ObjectPickerFooterProps) {
  return (
    <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-t border-white/10 bg-[#0d0d0f]">
      <div className="flex items-center gap-3">
        {selectedCount > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-white/50 text-sm">Selected:</span>
            <span className="text-white font-medium text-sm">
              {selectedCount} / {maxObjects}
            </span>
          </div>
        ) : (
          <span className="text-white/40 text-sm">No objects selected</span>
        )}
        {!canAddMore && <span className="text-xs text-white/40">(Maximum {maxObjects} objects)</span>}
      </div>

      <button
        onClick={onClose}
        className="px-8 py-2.5 rounded-xl bg-[var(--purple-500)] text-white font-semibold hover:bg-[var(--purple-600)] transition-colors shadow-lg shadow-[var(--purple-500)]/25"
      >
        Apply
      </button>
    </div>
  );
}

