'use client';

import { cn } from '@ryla/ui';
import type { Post } from '@ryla/shared';
import { useLightbox } from './hooks/useLightbox';
import { useImageActions } from './hooks/useImageActions';
import { GalleryEmptyState } from './components/GalleryEmptyState';
import { GalleryImage } from './components/GalleryImage';
import { LightboxModal } from './components/LightboxModal';

export interface ImageGalleryProps {
  images: Post[];
  influencerId: string;
  emptyMessage?: string;
  emptyAction?: {
    label: string;
    href: string;
  };
  className?: string;
  onLike?: (imageId: string) => void | Promise<void>;
}

export function ImageGallery({
  images,
  influencerId,
  emptyMessage = 'No images yet',
  emptyAction,
  className,
  onLike,
}: ImageGalleryProps) {
  const lightbox = useLightbox({ totalImages: images.length });
  const actions = useImageActions({ influencerId, onLike });

  if (images.length === 0) {
    return <GalleryEmptyState message={emptyMessage} action={emptyAction} />;
  }

  return (
    <>
      {/* Gallery Grid */}
      <div
        className={cn(
          'grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3',
          className
        )}
      >
        {images.map((image, index) => (
          <GalleryImage
            key={image.id}
            image={image}
            onClick={() => lightbox.openLightbox(index)}
            onLike={(e) => actions.handleLike(e, image.id)}
            onDownload={(e) => actions.handleDownload(e, image)}
            onEdit={(e) => actions.handleEditInStudio(e, image.id)}
          />
        ))}
      </div>

      {/* Lightbox */}
      {lightbox.selectedIndex !== null && (
        <LightboxModal
          images={images}
          selectedIndex={lightbox.selectedIndex}
          onClose={lightbox.closeLightbox}
          onPrevious={lightbox.goToPrevious}
          onNext={lightbox.goToNext}
          canGoPrevious={lightbox.canGoPrevious}
          canGoNext={lightbox.canGoNext}
          onLike={actions.handleLike}
          onDownload={actions.handleDownload}
          onEdit={actions.handleEditInStudio}
        />
      )}
    </>
  );
}

