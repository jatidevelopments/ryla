'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import type { StudioImage } from '../studio-image-card';
import { UploadConsentDialog } from '../../components/dialogs/UploadConsentDialog';
import { useObjectUpload } from './hooks/use-object-upload';
import { useObjectSearch } from './hooks/use-object-search';
import { ObjectCard } from './components/ObjectCard';
import { ObjectPickerHeader } from './components/ObjectPickerHeader';
import { ObjectPickerFooter } from './components/ObjectPickerFooter';
import { ObjectPickerEmpty } from './components/ObjectPickerEmpty';

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
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const canAddMore = selectedObjectIds.length < maxObjects;

  const { search, setSearch, filteredImages } = useObjectSearch(availableImages);

  const {
    isUploading,
    showConsentDialog,
    fileInputRef,
    handleFileInputChange,
    handleUploadClick,
    handleConsentAccept,
    handleConsentReject,
  } = useObjectUpload({
    onUploadImage,
    hasUploadConsent,
    onConsentAccept,
    canAddMore,
    onObjectSelect,
  });

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
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
        <ObjectPickerHeader
          search={search}
          onSearchChange={setSearch}
          maxObjects={maxObjects}
          isUploading={isUploading}
          canAddMore={canAddMore}
          onUploadClick={handleUploadClick}
          onClose={onClose}
          hasUpload={!!onUploadImage}
        />

        {/* Hidden file input */}
        {onUploadImage && (
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
        )}

        {/* Content - Scrollable area */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {filteredImages.length === 0 ? (
            <ObjectPickerEmpty hasSearch={!!search} />
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
        <ObjectPickerFooter
          selectedCount={selectedObjectIds.length}
          maxObjects={maxObjects}
          canAddMore={canAddMore}
          onClose={onClose}
        />
      </div>

      {/* Upload Consent Dialog */}
      <UploadConsentDialog
        isOpen={showConsentDialog}
        onAccept={handleConsentAccept}
        onReject={handleConsentReject}
      />
    </div>,
    document.body
  );
}


