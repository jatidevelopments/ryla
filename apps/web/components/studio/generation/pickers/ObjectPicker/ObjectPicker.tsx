'use client';

import * as React from 'react';
import type { StudioImage } from '../../../studio-image-card';
import { UploadConsentDialog } from '../../components/dialogs/UploadConsentDialog';
import { useObjectUpload } from './hooks/use-object-upload';
import { useObjectSearch } from './hooks/use-object-search';
import { ObjectCard } from './components/ObjectCard';
import { ObjectPickerHeader } from './components/ObjectPickerHeader';
import { ObjectPickerFooter } from './components/ObjectPickerFooter';
import { ObjectPickerEmpty } from './components/ObjectPickerEmpty';
import { PickerDrawer } from '../PickerDrawer';

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
  const canAddMore = selectedObjectIds.length < maxObjects;

  const { search, setSearch, filteredImages } =
    useObjectSearch(availableImages);

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

  return (
    <PickerDrawer
      isOpen={true}
      onClose={onClose}
      title="Objects"
      className="w-full max-w-7xl h-full md:h-auto"
    >
      <div className="flex flex-col h-full md:max-h-[85vh]">
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
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 min-h-0">
          {filteredImages.length === 0 ? (
            <ObjectPickerEmpty hasSearch={!!search} />
          ) : (
            <div className="columns-2 sm:columns-3 md:columns-4 lg:columns-5 gap-2 sm:gap-3">
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
    </PickerDrawer>
  );
}
