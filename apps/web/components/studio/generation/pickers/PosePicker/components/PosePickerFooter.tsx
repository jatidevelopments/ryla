'use client';

import { ALL_POSES } from '../../types';

interface PosePickerFooterProps {
  selectedPoseId: string | null;
  onPoseSelect: (id: string | null) => void;
  onClose: () => void;
}

export function PosePickerFooter({
  selectedPoseId,
  onPoseSelect,
  onClose,
}: PosePickerFooterProps) {
  return (
    <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-t border-white/10 bg-[#0d0d0f]">
      <div className="flex items-center gap-3">
        {selectedPoseId ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
            <span className="text-white/50 text-sm">Pose:</span>
            <span className="text-white font-medium text-sm">
              {ALL_POSES.find((p) => p.id === selectedPoseId)?.name}
            </span>
            <button
              onClick={() => onPoseSelect(null)}
              className="ml-1 text-white/40 hover:text-white transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        ) : (
          <span className="text-white/40 text-sm">No pose selected</span>
        )}
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

