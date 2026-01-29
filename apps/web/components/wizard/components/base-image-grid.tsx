'use client';

import * as React from 'react';
import type { GeneratedImage } from '@ryla/business';
import { BaseImageCard } from './base-image-card';
import { BaseImageLightbox } from './base-image-lightbox';

interface BaseImageGridProps {
  images: GeneratedImage[];
  expectedImageCount: number;
  selectedBaseImageId: string | null;
  fineTuningImageId: string | null;
  missingJobIds: boolean;
  onSelectImage: (imageId: string) => void;
  onRegenerateImage: (imageId: string) => void;
}

export function BaseImageGrid({
  images,
  expectedImageCount,
  selectedBaseImageId,
  fineTuningImageId,
  missingJobIds,
  onSelectImage,
  onRegenerateImage,
}: BaseImageGridProps) {
  const [lightboxImage, setLightboxImage] = React.useState<GeneratedImage | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);

  const handleViewFull = React.useCallback((image: GeneratedImage) => {
    setLightboxImage(image);
    setIsLightboxOpen(true);
  }, []);

  const handleCloseLightbox = React.useCallback(() => {
    setIsLightboxOpen(false);
    // Clear image after animation
    setTimeout(() => setLightboxImage(null), 300);
  }, []);

  return (
    <>
      <div className="w-full mb-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {!missingJobIds && images.length > 0
            ? images.map((image, index) => {
                const isSelected = selectedBaseImageId === image.id;
                const isRegenerating =
                  fineTuningImageId === image.id || image.url === 'loading';
                const isSkeleton = image.url === 'skeleton';
                const isFailed = image.url === 'failed' || image.url === 'error';
                const isSelectable = !isSkeleton && !isRegenerating && !isFailed;

                return (
                  <BaseImageCard
                    key={image.id}
                    image={image}
                    index={index}
                    isSelected={isSelected}
                    isRegenerating={isRegenerating}
                    isSkeleton={isSkeleton}
                    onSelect={() => isSelectable && onSelectImage(image.id)}
                    onRegenerate={() => onRegenerateImage(image.id)}
                    onViewFull={
                      isSelectable
                        ? () => handleViewFull(image)
                        : undefined
                    }
                  />
                );
              })
            : !missingJobIds
            ? Array.from({ length: expectedImageCount }).map((_, index) => (
                <BaseImageCard
                  key={`placeholder-${index}`}
                  image={{
                    id: `placeholder-${index}`,
                    url: 'skeleton',
                    thumbnailUrl: 'skeleton',
                  }}
                  index={index}
                  isSelected={false}
                  isRegenerating={false}
                  isSkeleton={true}
                  onSelect={() => {}}
                  onRegenerate={() => {}}
                />
              ))
            : null}
        </div>
      </div>

      {/* Lightbox Modal */}
      <BaseImageLightbox
        image={lightboxImage}
        isOpen={isLightboxOpen}
        onClose={handleCloseLightbox}
      />
    </>
  );
}

