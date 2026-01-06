'use client';

interface PreComposedOutfitPickerFooterProps {
  outfitCount: number;
  onApply: () => void;
}

export function PreComposedOutfitPickerFooter({
  outfitCount,
  onApply,
}: PreComposedOutfitPickerFooterProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-t border-white/10 bg-[#18181b]">
      <div className="text-sm text-white/60">
        {outfitCount} outfit{outfitCount !== 1 ? 's' : ''} available
      </div>
      <button
        onClick={onApply}
        className="px-8 py-2.5 rounded-xl bg-[var(--purple-500)] text-white font-semibold hover:bg-[var(--purple-600)] transition-colors shadow-lg shadow-[var(--purple-500)]/25"
      >
        Apply
      </button>
    </div>
  );
}

