'use client';

import Image from 'next/image';
import { Tooltip } from '../../../ui/tooltip';
import type { StudioImage } from '../../studio-image-card';
import type { SelectedObject } from '../types';
import type { StudioMode } from '../types';

interface SelectedImageDisplayProps {
  selectedImage: StudioImage | null;
  selectedObjects: SelectedObject[];
  mode: StudioMode;
  onClearImage?: () => void;
  onRemoveObject: (objectId: string) => void;
  onAddObject: () => void;
  maxObjects?: number;
}

export function SelectedImageDisplay({
  selectedImage,
  selectedObjects,
  mode,
  onClearImage,
  onRemoveObject,
  onAddObject,
  maxObjects = 3,
}: SelectedImageDisplayProps) {
  if (!selectedImage) {
    return (
      <Tooltip content="Upload image as prompt or for editing">
        <button className="flex items-center justify-center h-11 w-11 rounded-xl bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/10 transition-all">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
        </button>
      </Tooltip>
    );
  }

  return (
    <div className="flex flex-row items-center gap-2 flex-nowrap">
      {/* Main Selected Image */}
      <div className="relative group flex items-center justify-center h-11">
        <div className="relative h-11 w-11 rounded-xl overflow-hidden border-2 border-[var(--purple-500)] ring-1 ring-[var(--purple-500)]/50 flex-shrink-0">
          <Image
            src={selectedImage.thumbnailUrl || selectedImage.imageUrl}
            alt="Selected image"
            fill
            className="object-cover"
            unoptimized
          />
          {/* Editing mode indicator */}
          <div className="absolute inset-0 bg-[var(--purple-500)]/20 flex items-center justify-center">
            <div className="absolute top-0.5 right-0.5 h-2.5 w-2.5 rounded-full bg-[var(--purple-500)] ring-1 ring-white/50" />
          </div>
        </div>
        {/* Clear button on hover */}
        {onClearImage && (
          <Tooltip content="Clear selected image">
            <button
              onClick={onClearImage}
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg hover:bg-red-600 z-10"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </Tooltip>
        )}
      </div>

      {/* Selected Objects (up to 3) */}
      {mode === 'editing' && (
        <div className="flex flex-row items-center gap-1.5 flex-nowrap">
          {selectedObjects.slice(0, maxObjects).map((obj, index) => (
            <div key={obj.id} className="relative group flex items-center justify-center h-11 flex-shrink-0">
              <div className="relative h-11 w-11 rounded-xl overflow-hidden border-2 border-[var(--purple-400)]/50 flex-shrink-0">
                <Image
                  src={obj.thumbnailUrl || obj.imageUrl}
                  alt={obj.name || `Object ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              {/* Remove button on hover */}
              <Tooltip content="Remove this object">
                <button
                  onClick={() => onRemoveObject(obj.id)}
                  className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center shadow-lg hover:bg-red-600 z-10"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-2.5 w-2.5">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </Tooltip>
            </div>
          ))}

          {/* Add Object Button */}
          {selectedObjects.length < maxObjects && (
            <Tooltip content="Add object to edit">
              <button
                onClick={onAddObject}
                className="flex items-center justify-center h-11 w-11 rounded-xl bg-white/5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/10 transition-all border-2 border-dashed border-white/20 flex-shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                  <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
                </svg>
              </button>
            </Tooltip>
          )}
        </div>
      )}
    </div>
  );
}

