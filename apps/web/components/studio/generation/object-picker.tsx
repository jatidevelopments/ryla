'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { cn, Input } from '@ryla/ui';
import type { StudioImage } from '../studio-image-card';
import { UploadConsentDialog } from './upload-consent-dialog';

interface ObjectPickerProps {
  availableImages: StudioImage[];
  selectedObjectIds: string[];
  onObjectSelect: (image: StudioImage) => void;
  onObjectRemove: (imageId: string) => void;
  onClose: () => void;
  maxObjects?: number;
  onUploadImage?: (file: File) => Promise<StudioImage | null>;
  hasUploadConsent?: boolean;
  onConsentAccept?: () => Promise<void>;
}

export function ObjectPicker({
  availableImages,
  selectedObjectIds,
  onObjectSelect,
  onObjectRemove,
  onClose,
  maxObjects = 3,
  onUploadImage,
  hasUploadConsent = false,
  onConsentAccept,
}: ObjectPickerProps) {
  const [search, setSearch] = React.useState('');
  const [showConsentDialog, setShowConsentDialog] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const overlayRef = React.useRef<HTMLDivElement>(null);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  // Filter images based on search
  const filteredImages = React.useMemo(() => {
    return availableImages.filter(image => {
      const matchesSearch = 
        image.prompt?.toLowerCase().includes(search.toLowerCase()) ||
        image.influencerName.toLowerCase().includes(search.toLowerCase()) ||
        image.scene?.toLowerCase().includes(search.toLowerCase()) ||
        image.environment?.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [availableImages, search]);

  const canAddMore = selectedObjectIds.length < maxObjects;

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadImage) return;

    // Check if consent is needed
    if (!hasUploadConsent) {
      setShowConsentDialog(true);
      // Store file for later upload after consent
      const storedFile = file;
      const handleConsentAccept = async () => {
        if (onConsentAccept) {
          await onConsentAccept();
        }
        setShowConsentDialog(false);
        // Now upload the file
        setIsUploading(true);
        try {
          const uploadedImage = await onUploadImage(storedFile);
          if (uploadedImage && canAddMore) {
            onObjectSelect(uploadedImage);
          }
        } catch (error) {
          console.error('Failed to upload image:', error);
        } finally {
          setIsUploading(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }
      };
      // We'll handle this in the consent dialog
      return;
    }

    // Upload directly if consent already given
    setIsUploading(true);
    try {
      const uploadedImage = await onUploadImage(file);
      if (uploadedImage && canAddMore) {
        onObjectSelect(uploadedImage);
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUploadClick = () => {
    if (!hasUploadConsent) {
      setShowConsentDialog(true);
      return;
    }
    fileInputRef.current?.click();
  };

  const [pendingFile, setPendingFile] = React.useState<File | null>(null);
  const handleConsentAccept = async () => {
    if (onConsentAccept) {
      await onConsentAccept();
    }
    setShowConsentDialog(false);
    // Upload pending file if exists
    if (pendingFile && onUploadImage) {
      setIsUploading(true);
      try {
        const uploadedImage = await onUploadImage(pendingFile);
        if (uploadedImage && canAddMore) {
          onObjectSelect(uploadedImage);
        }
      } catch (error) {
        console.error('Failed to upload image:', error);
      } finally {
        setIsUploading(false);
        setPendingFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadImage) return;

    if (!hasUploadConsent) {
      setPendingFile(file);
      setShowConsentDialog(true);
      return;
    }

    // Upload directly
    setIsUploading(true);
    onUploadImage(file)
      .then((uploadedImage) => {
        if (uploadedImage && canAddMore) {
          onObjectSelect(uploadedImage);
        }
      })
      .catch((error) => {
        console.error('Failed to upload image:', error);
      })
      .finally(() => {
        setIsUploading(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      });
  };

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 md:p-8"
    >
      <div 
        className="flex flex-col w-full max-w-7xl max-h-[85vh] bg-[#18181b] rounded-2xl border border-white/15 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--purple-500)]/20 to-[var(--pink-500)]/20 border border-[var(--purple-500)]/20">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-[var(--purple-400)]">
                <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
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
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
              </svg>
              <Input
                type="text"
                placeholder="Search images..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-44 h-10 pl-9 pr-4 bg-[#0d0d0f] border-white/10 rounded-xl text-sm placeholder:text-white/40 focus:border-white/20 focus:ring-0"
              />
            </div>
            {onUploadImage && (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <button
                  onClick={handleUploadClick}
                  disabled={isUploading || !canAddMore}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                    isUploading || !canAddMore
                      ? 'bg-white/5 text-white/40 cursor-not-allowed'
                      : 'bg-[var(--purple-500)]/20 text-[var(--purple-400)] hover:bg-[var(--purple-500)]/30 border border-[var(--purple-500)]/30'
                  )}
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
              </>
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

        {/* Content - Scrollable area */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {filteredImages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--purple-500)]/20 to-[var(--pink-500)]/20 border border-[var(--purple-500)]/20">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-10 w-10 text-[var(--purple-400)]">
                  <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">No images found</h3>
              <p className="text-white/50 max-w-sm">
                {search ? 'Try a different search term' : 'No images available to use as objects'}
              </p>
            </div>
          ) : (
            <div className="columns-2 sm:columns-3 md:columns-4 gap-3">
              {filteredImages.map((image) => {
                const isSelected = selectedObjectIds.includes(image.id);
                const isDisabled = !isSelected && !canAddMore;
                
                return (
                  <ObjectCard
                    key={image.id}
                    image={image}
                    isSelected={isSelected}
                    isDisabled={isDisabled}
                    onSelect={() => {
                      if (isSelected) {
                        onObjectRemove(image.id);
                      } else if (canAddMore) {
                        onObjectSelect(image);
                      }
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-t border-white/10 bg-[#0d0d0f]">
          <div className="flex items-center gap-3">
            {selectedObjectIds.length > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-white/50 text-sm">Selected:</span>
                <span className="text-white font-medium text-sm">
                  {selectedObjectIds.length} / {maxObjects}
                </span>
              </div>
            ) : (
              <span className="text-white/40 text-sm">No objects selected</span>
            )}
            {!canAddMore && (
              <span className="text-xs text-white/40">(Maximum {maxObjects} objects)</span>
            )}
          </div>

          <button
            onClick={onClose}
            className="px-8 py-2.5 rounded-xl bg-[var(--purple-500)] text-white font-semibold hover:bg-[var(--purple-600)] transition-colors shadow-lg shadow-[var(--purple-500)]/25"
          >
            Apply
          </button>
        </div>
      </div>

      {/* Upload Consent Dialog */}
      <UploadConsentDialog
        isOpen={showConsentDialog}
        onAccept={handleConsentAccept}
        onReject={() => {
          setShowConsentDialog(false);
          setPendingFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        }}
      />
    </div>,
    document.body
  );
}

// Object Card Component
function ObjectCard({
  image,
  isSelected,
  isDisabled,
  onSelect,
}: {
  image: StudioImage;
  isSelected: boolean;
  isDisabled: boolean;
  onSelect: () => void;
}) {
  const aspectClass =
    image.aspectRatio === '9:16'
      ? 'aspect-[9/16]'
      : image.aspectRatio === '2:3'
      ? 'aspect-[2/3]'
      : 'aspect-square';

  return (
    <div className="break-inside-avoid mb-3">
      <button
        onClick={onSelect}
        disabled={isDisabled}
        className={cn(
          'group relative w-full rounded-xl overflow-hidden border-2 transition-all',
          isSelected
            ? 'border-[var(--purple-500)] ring-2 ring-[var(--purple-500)]/30'
            : isDisabled
            ? 'border-transparent opacity-30 cursor-not-allowed'
            : 'border-transparent hover:border-white/30'
        )}
      >
        {/* Image */}
        <div className={cn('relative w-full bg-white/5 overflow-hidden', aspectClass)}>
          {image.imageUrl ? (
            <>
              <Image
                src={image.thumbnailUrl || image.imageUrl}
                alt={image.prompt || 'Object image'}
                fill
                className="object-cover"
                unoptimized
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--purple-500)]/20 to-[var(--pink-500)]/20">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-8 w-8 text-white/20">
                <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
          
          {/* Name overlay */}
          {image.prompt && (
            <div className="absolute bottom-0 left-0 right-0 p-2">
              <div className="text-xs font-medium text-white line-clamp-1">{image.prompt}</div>
            </div>
          )}
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--purple-500)]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-white">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </button>
    </div>
  );
}

