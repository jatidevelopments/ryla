'use client';

import * as React from 'react';
import type { GeneratedImage } from '@ryla/business';
import { BaseImageCard } from './base-image-card';

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
  return (
    <div className="w-full mb-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {!missingJobIds && images.length > 0
          ? images.map((image, index) => {
              const isSelected = selectedBaseImageId === image.id;
              const isRegenerating =
                fineTuningImageId === image.id || image.url === 'loading';
              const isSkeleton = image.url === 'skeleton';

              return (
                <BaseImageCard
                  key={image.id}
                  image={image}
                  index={index}
                  isSelected={isSelected}
                  isRegenerating={isRegenerating}
                  isSkeleton={isSkeleton}
                  onSelect={() => !isSkeleton && !isRegenerating && onSelectImage(image.id)}
                  onRegenerate={() => onRegenerateImage(image.id)}
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
  );
}

