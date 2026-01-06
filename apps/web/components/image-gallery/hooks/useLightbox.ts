import { useState, useEffect, useCallback } from 'react';

interface UseLightboxOptions {
  totalImages: number;
}

interface UseLightboxReturn {
  selectedIndex: number | null;
  openLightbox: (index: number) => void;
  closeLightbox: () => void;
  goToPrevious: () => void;
  goToNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

export function useLightbox({ totalImages }: UseLightboxOptions): UseLightboxReturn {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const openLightbox = useCallback((index: number) => {
    setSelectedIndex(index);
  }, []);

  const closeLightbox = useCallback(() => {
    setSelectedIndex(null);
  }, []);

  const goToPrevious = useCallback(() => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  }, [selectedIndex]);

  const goToNext = useCallback(() => {
    if (selectedIndex !== null && selectedIndex < totalImages - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  }, [selectedIndex, totalImages]);

  // Handle body overflow when lightbox is open
  useEffect(() => {
    if (selectedIndex !== null) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [selectedIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, goToPrevious, goToNext, closeLightbox]);

  return {
    selectedIndex,
    openLightbox,
    closeLightbox,
    goToPrevious,
    goToNext,
    canGoPrevious: selectedIndex !== null && selectedIndex > 0,
    canGoNext: selectedIndex !== null && selectedIndex < totalImages - 1,
  };
}

