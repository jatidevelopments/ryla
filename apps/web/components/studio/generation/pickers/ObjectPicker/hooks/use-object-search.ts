'use client';

import * as React from 'react';
import type { StudioImage } from '../../../../studio-image-card';

export function useObjectSearch(availableImages: StudioImage[]) {
  const [search, setSearch] = React.useState('');

  const filteredImages = React.useMemo(() => {
    return availableImages.filter((image) => {
      const matchesSearch =
        image.prompt?.toLowerCase().includes(search.toLowerCase()) ||
        image.influencerName.toLowerCase().includes(search.toLowerCase()) ||
        image.scene?.toLowerCase().includes(search.toLowerCase()) ||
        image.environment?.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [availableImages, search]);

  return {
    search,
    setSearch,
    filteredImages,
  };
}

