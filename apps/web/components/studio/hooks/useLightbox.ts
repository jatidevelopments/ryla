'use client';

import * as React from 'react';

/**
 * Hook for managing lightbox state and effects
 */
export function useLightbox() {
  const [showLightbox, setShowLightbox] = React.useState(false);

  // Handle keyboard navigation
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showLightbox && e.key === 'Escape') {
        setShowLightbox(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showLightbox]);

  // Handle body overflow when lightbox is open
  React.useEffect(() => {
    if (showLightbox) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [showLightbox]);

  return {
    showLightbox,
    setShowLightbox,
  };
}

