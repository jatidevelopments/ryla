'use client';

import { Input } from '@ryla/ui';

interface ObjectPickerHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  maxObjects: number;
  isUploading: boolean;
  canAddMore: boolean;
  onUploadClick: () => void;
  onClose: () => void;
  hasUpload: boolean;
}

export function ObjectPickerHeader({
  search,
  onSearchChange,
  maxObjects,
  isUploading,
  canAddMore,
  onUploadClick,
  onClose,
  hasUpload,
}: ObjectPickerHeaderProps) {
  return (
    <div className="flex items-center gap-4 px-6 py-4 border-b border-white/10">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--purple-500)]/20 to-[var(--pink-500)]/20 border border-[var(--purple-500)]/20">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-[var(--purple-400)]">
            <path
              fillRule="evenodd"
              d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">Add Objects to Image</h2>
          <p className="text-sm text-white/50">Select up to {maxObjects} objects to add to your image</p>
        </div>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search, Upload & Close */}
      <div className="flex items-center gap-3">
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
          <Input
            type="text"
            placeholder="Search images..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-44 h-10 pl-9 pr-4 bg-[#0d0d0f] border-white/10 rounded-xl text-sm placeholder:text-white/40 focus:border-white/20 focus:ring-0"
          />
        </div>
        {hasUpload && (
          <button
            onClick={onUploadClick}
            disabled={isUploading || !canAddMore}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all bg-[var(--purple-500)]/20 text-[var(--purple-400)] hover:bg-[var(--purple-500)]/30 border border-[var(--purple-500)]/30 disabled:bg-white/5 disabled:text-white/40 disabled:cursor-not-allowed"
          >
            {isUploading ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                  <path d="M9.25 13.25a.75.75 0 001.5 0V4.636l2.955 2.955a.75.75 0 101.06-1.06l-4.25-4.25a.75.75 0 00-1.06 0l-4.25 4.25a.75.75 0 001.06 1.06l2.955-2.955V13.25zM3.75 15.5a.75.75 0 000 1.5h12.5a.75.75 0 000-1.5H3.75z" />
                </svg>
                <span>Upload</span>
              </>
            )}
          </button>
        )}
        <button
          onClick={onClose}
          className="flex items-center justify-center h-10 w-10 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
          </svg>
        </button>
      </div>
    </div>
  );
}

