'use client';

import * as React from 'react';

interface UseInfluencerDropdownOptions {
  showDropdown: boolean;
  buttonRef: React.RefObject<HTMLButtonElement>;
  onClose: () => void;
}

interface UseInfluencerDropdownReturn {
  position: { top: number; left: number };
  mounted: boolean;
  dropdownRef: React.RefObject<HTMLDivElement>;
}

/**
 * Hook for managing influencer dropdown positioning and click-outside detection.
 */
export function useInfluencerDropdown({
  showDropdown,
  buttonRef,
  onClose,
}: UseInfluencerDropdownOptions): UseInfluencerDropdownReturn {
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const [mounted, setMounted] = React.useState(false);

  // Calculate position based on button element
  React.useEffect(() => {
    setMounted(true);

    const updatePosition = () => {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + 8,
          left: rect.right - 256, // 256 = w-64 (dropdown width)
        });
      }
    };

    if (showDropdown) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);

      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }
  }, [showDropdown, buttonRef]);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showDropdown, buttonRef, onClose]);

  return {
    position,
    mounted,
    dropdownRef,
  };
}

