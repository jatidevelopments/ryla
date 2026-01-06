'use client';

import * as React from 'react';

interface UsePickerPositionOptions {
  anchorRef?: React.RefObject<HTMLElement | null>;
  placement?: 'top' | 'bottom';
}

/**
 * Hook for managing picker positioning relative to anchor element
 */
export function usePickerPosition({
  anchorRef,
  placement = 'bottom',
}: UsePickerPositionOptions) {
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    
    const updatePosition = () => {
      if (anchorRef?.current) {
        const rect = anchorRef.current.getBoundingClientRect();
        setPosition({
          top: placement === 'top' ? rect.top - 8 : rect.bottom + 8,
          left: rect.left,
        });
      }
    };
    
    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [anchorRef, placement]);

  return { position, mounted };
}

