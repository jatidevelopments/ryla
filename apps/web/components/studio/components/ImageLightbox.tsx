import Image from 'next/image';
import { X } from 'lucide-react';
import type { StudioImage } from '../studio-image-card';

interface ImageLightboxProps {
  image: StudioImage;
  isOpen: boolean;
  onClose: () => void;
}

export function ImageLightbox({ image, isOpen, onClose }: ImageLightboxProps) {
  if (!isOpen || !image.imageUrl) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm lg:z-[60]"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
        aria-label="Close lightbox"
      >
        <X className="h-5 w-5" />
      </button>

      {/* Image */}
      <div
        className="relative max-w-[90vw] max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative aspect-[3/4] h-[80vh]">
          <Image
            src={image.imageUrl}
            alt={image.prompt || 'Generated image'}
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
}

