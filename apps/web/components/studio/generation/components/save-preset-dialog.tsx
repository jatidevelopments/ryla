'use client';

import { X } from 'lucide-react';
import type { OutfitComposition } from '@ryla/shared';

interface SavePresetDialogProps {
  isOpen: boolean;
  editingPreset: boolean;
  presetName: string;
  presetDescription: string;
  isSaving: boolean;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
}

export function SavePresetDialog({
  isOpen,
  editingPreset,
  presetName,
  presetDescription,
  isSaving,
  onNameChange,
  onDescriptionChange,
  onClose,
  onSave,
}: SavePresetDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm">
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md bg-[#0d0d0f] border border-white/10 rounded-2xl shadow-2xl p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-white">
            {editingPreset ? 'Edit Outfit Preset' : 'Save Outfit Preset'}
          </h3>
          <button
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">Name *</label>
            <input
              type="text"
              value={presetName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="e.g., Casual Streetwear"
              className="w-full h-10 px-3 bg-[#0d0d0f] border border-white/10 rounded-lg text-sm placeholder:text-white/40 focus:border-white/20 focus:ring-0 text-white"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/80 mb-2">
              Description (optional)
            </label>
            <textarea
              value={presetDescription}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="Add a description for this outfit preset..."
              rows={3}
              className="w-full px-3 py-2 bg-[#0d0d0f] border border-white/10 rounded-lg text-sm placeholder:text-white/40 focus:border-white/20 focus:ring-0 text-white resize-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={!presetName.trim() || isSaving}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--purple-500)] text-white font-semibold hover:bg-[var(--purple-600)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving
              ? editingPreset
                ? 'Updating...'
                : 'Saving...'
              : editingPreset
              ? 'Update Preset'
              : 'Save Preset'}
          </button>
        </div>
      </div>
    </div>
  );
}

