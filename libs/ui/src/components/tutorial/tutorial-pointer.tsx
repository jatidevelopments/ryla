'use client';

import * as React from 'react';
import type { TutorialPointerProps } from './types';

/**
 * TutorialPointer - Modern cursor-style pointer that points to target elements
 */
export function TutorialPointer({
  target,
  direction = 'down',
  position = 'bottom',
}: TutorialPointerProps) {
  const [pointerPosition, setPointerPosition] = React.useState<{
    x: number;
    y: number;
    visible: boolean;
  }>({ x: 0, y: 0, visible: false });

  // Calculate pointer position based on target element
  React.useEffect(() => {
    const updatePosition = () => {
      try {
        const targetElement = document.querySelector(target);
        if (!targetElement) {
          setPointerPosition({ x: 0, y: 0, visible: false });
          return;
        }

        const rect = targetElement.getBoundingClientRect();

        // Calculate position based on target element and direction
        let x = 0;
        let y = 0;
        const offset = 16;

        switch (position) {
          case 'top':
            x = rect.left + rect.width / 2;
            y = rect.top - offset;
            break;
          case 'bottom':
            x = rect.left + rect.width / 2;
            y = rect.bottom + offset;
            break;
          case 'left':
            x = rect.left - offset;
            y = rect.top + rect.height / 2;
            break;
          case 'right':
            x = rect.right + offset;
            y = rect.top + rect.height / 2;
            break;
          case 'center':
            x = rect.left + rect.width / 2;
            y = rect.top + rect.height / 2;
            break;
        }

        setPointerPosition({ x, y, visible: true });
      } catch (error) {
        console.warn('Tutorial pointer: Could not find target element', target);
        setPointerPosition({ x: 0, y: 0, visible: false });
      }
    };

    updatePosition();

    // Update on resize and scroll
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [target, position]);

  if (!pointerPosition.visible) {
    return null;
  }

  // Get rotation based on direction
  const getRotation = () => {
    switch (direction) {
      case 'up':
        return 0;
      case 'down':
        return 180;
      case 'left':
        return -90;
      case 'right':
        return 90;
      default:
        return 180;
    }
  };

  return (
    <div
      className="fixed z-[60] pointer-events-none"
      style={{
        left: `${pointerPosition.x}px`,
        top: `${pointerPosition.y}px`,
        transform: `translate(-50%, -50%) rotate(${getRotation()}deg)`,
      }}
    >
      {/* Modern cursor-style pointer with gradient */}
      <svg
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          filter: 'drop-shadow(0 4px 16px rgba(168, 85, 247, 0.5))',
          animation: 'tutorial-pointer-float 1.5s ease-in-out infinite',
        }}
      >
        <style>
          {`
            @keyframes tutorial-pointer-float {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-6px); }
            }
          `}
        </style>
        <defs>
          <linearGradient id="pointer-gradient" x1="24" y1="0" x2="24" y2="48" gradientUnits="userSpaceOnUse">
            <stop stopColor="#a855f7" />
            <stop offset="1" stopColor="#ec4899" />
          </linearGradient>
        </defs>
        {/* Modern cursor/pointer shape */}
        <path
          d="M24 4L8 44L24 36L40 44L24 4Z"
          fill="url(#pointer-gradient)"
        />
        {/* Inner highlight for depth */}
        <path
          d="M24 10L13 38L24 32L35 38L24 10Z"
          fill="white"
          fillOpacity="0.15"
        />
      </svg>
    </div>
  );
}
