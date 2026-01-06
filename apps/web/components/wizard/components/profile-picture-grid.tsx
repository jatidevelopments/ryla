'use client';

import * as React from 'react';
import type { ProfilePictureImage } from '@ryla/business';
import { ProfilePictureCard } from './profile-picture-card';

interface ProfilePictureGridProps {
  images: ProfilePictureImage[];
  selectedImageId: string | null;
  nsfwEnabled: boolean;
  onSelectImage: (imageId: string) => void;
  onDeleteImage: (imageId: string) => void;
  onRegenerateImage: (imageId: string) => void;
  onEditPrompt: (image: ProfilePictureImage) => void;
}

export function ProfilePictureGrid({
  images,
  selectedImageId,
  nsfwEnabled,
  onSelectImage,
  onDeleteImage,
  onRegenerateImage,
  onEditPrompt,
}: ProfilePictureGridProps) {
  return (
    <div className="w-full mb-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images
          .filter((img) => !img.isNSFW || nsfwEnabled)
          .map((image) => (
            <ProfilePictureCard
              key={image.id}
              image={image}
              isSelected={selectedImageId === image.id}
              onSelect={() =>
                image.url !== 'skeleton' && image.url !== 'loading' && onSelectImage(image.id)
              }
              onDelete={() => onDeleteImage(image.id)}
              onRegenerate={() => onRegenerateImage(image.id)}
              onEditPrompt={() => onEditPrompt(image)}
              isSkeleton={image.url === 'skeleton'}
              isLoading={image.url === 'loading'}
            />
          ))}
      </div>
    </div>
  );
}

