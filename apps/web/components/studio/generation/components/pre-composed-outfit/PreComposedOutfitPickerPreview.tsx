'use client';

interface PreComposedOutfitPickerPreviewProps {
  selectedOutfitLabel: string | null;
  onClear: () => void;
  nsfwEnabled?: boolean;
}

export function PreComposedOutfitPickerPreview({
  selectedOutfitLabel,
  onClear,
  nsfwEnabled = false,
}: PreComposedOutfitPickerPreviewProps) {
  return (
    <div className="mb-4 sm:mb-6">
      <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 border border-white/10">
        <div className="flex-1">
          <div className="text-xs text-white/60 mb-1">Selected Outfit</div>
          {selectedOutfitLabel ? (
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">
                {selectedOutfitLabel}
              </span>
              <button
                onClick={onClear}
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
            <span className="text-white/40 text-sm">
              {nsfwEnabled
                ? 'No outfit (recommended for Adult Content)'
                : 'No outfit selected'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
