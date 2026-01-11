'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '../../lib/utils';
import { TutorialStep } from './tutorial-step';
import { TutorialPointer } from './tutorial-pointer';
import type { TutorialOverlayProps } from './types';

/**
 * TutorialOverlay - Main overlay component for contextual tutorials
 * Features a semi-transparent overlay (no blur) with pointer and content card
 */
export function TutorialOverlay({
  steps,
  currentStep,
  onNext,
  onSkip,
  onComplete,
  isVisible,
}: TutorialOverlayProps) {
  const [mounted, setMounted] = React.useState(false);
  const [cardPosition, setCardPosition] = React.useState<{
    x: number;
    y: number;
    placement: 'top' | 'bottom' | 'left' | 'right';
  } | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const currentStepData = steps[currentStep];

  // Calculate card position based on target element
  React.useEffect(() => {
    if (!isVisible || !currentStepData) return;

    const updateCardPosition = () => {
      try {
        const targetElement = document.querySelector(currentStepData.target);
        if (!targetElement) {
          // Fallback to center position
          const isMobile = window.innerWidth < 768;
          const cardWidth = isMobile ? 320 : 380;
          const cardHeight = isMobile ? 200 : 180;
          setCardPosition({
            x: window.innerWidth / 2 - cardWidth / 2,
            y: window.innerHeight / 2 - cardHeight / 2,
            placement: 'bottom',
          });
          return;
        }

        const rect = targetElement.getBoundingClientRect();
        // Mobile: ~320px width, Desktop: 380px width
        const isMobile = window.innerWidth < 768;
        const cardWidth = isMobile ? 320 : 380;
        const cardHeight = isMobile ? 200 : 180;
        const offset = isMobile ? 60 : 80; // Distance from pointer

        // Determine best placement based on available space
        const spaceTop = rect.top;
        const spaceBottom = window.innerHeight - rect.bottom;
        const spaceLeft = rect.left;
        const spaceRight = window.innerWidth - rect.right;

        let x = 0;
        let y = 0;
        let placement: 'top' | 'bottom' | 'left' | 'right' = 'bottom';

        // Prefer bottom, then top, then right, then left
        if (spaceBottom > cardHeight + offset) {
          // Position below the element
          x = rect.left + rect.width / 2;
          y = rect.bottom + offset;
          placement = 'bottom';
        } else if (spaceTop > cardHeight + offset) {
          // Position above the element
          x = rect.left + rect.width / 2;
          y = rect.top - offset - cardHeight;
          placement = 'top';
        } else if (spaceRight > cardWidth + offset) {
          // Position to the right
          x = rect.right + offset;
          y = rect.top + rect.height / 2 - cardHeight / 2;
          placement = 'right';
        } else if (spaceLeft > cardWidth + offset) {
          // Position to the left
          x = rect.left - offset - cardWidth;
          y = rect.top + rect.height / 2 - cardHeight / 2;
          placement = 'left';
        } else {
          // Fallback: center of screen
          x = window.innerWidth / 2;
          y = window.innerHeight / 2;
          placement = 'bottom';
        }

        // Ensure card stays within viewport
        x = Math.max(20, Math.min(x, window.innerWidth - cardWidth - 20));
        y = Math.max(20, Math.min(y, window.innerHeight - cardHeight - 20));

        setCardPosition({ x, y, placement });
      } catch (error) {
        console.warn('Tutorial overlay: Could not position card');
        const isMobile = window.innerWidth < 768;
        const cardWidth = isMobile ? 320 : 380;
        const cardHeight = isMobile ? 200 : 180;
        setCardPosition({
          x: window.innerWidth / 2 - cardWidth / 2,
          y: window.innerHeight / 2 - cardHeight / 2,
          placement: 'bottom',
        });
      }
    };

    updateCardPosition();

    window.addEventListener('resize', updateCardPosition);
    window.addEventListener('scroll', updateCardPosition, true);

    return () => {
      window.removeEventListener('resize', updateCardPosition);
      window.removeEventListener('scroll', updateCardPosition, true);
    };
  }, [isVisible, currentStepData, currentStep]);

  // Handle keyboard navigation
  React.useEffect(() => {
    if (!isVisible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (currentStep === steps.length - 1) {
          onComplete();
        } else {
          onNext();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onSkip();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, currentStep, steps.length, onNext, onSkip, onComplete]);

  if (!mounted || !isVisible || currentStep >= steps.length || !currentStepData) {
    return null;
  }

  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      onNext();
    }
  };

  // Determine pointer direction based on card placement
  const getPointerDirection = () => {
    if (!cardPosition) return 'down';
    switch (cardPosition.placement) {
      case 'top':
        return 'down'; // Point down to element
      case 'bottom':
        return 'up'; // Point up to element
      case 'left':
        return 'right'; // Point right to element
      case 'right':
        return 'left'; // Point left to element
      default:
        return 'up';
    }
  };

  const overlayContent = (
    <>
      {/* Semi-transparent overlay - NO BLUR */}
      <div
        className={cn(
          'fixed inset-0 z-[55]',
          'transition-opacity duration-300',
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        style={{
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
        }}
        onClick={(e) => {
          // Close on backdrop click
          if (e.target === e.currentTarget) {
            onSkip();
          }
        }}
      />

      {/* Pointer */}
      <TutorialPointer
        target={currentStepData.target}
        direction={currentStepData.pointerDirection || getPointerDirection()}
        position={currentStepData.position || 'bottom'}
      />

      {/* Tutorial Card */}
      <div
        className={cn(
          'fixed z-[60]',
          'bg-[#18181b]/95 border border-white/10',
          'rounded-2xl shadow-2xl',
          // Mobile: smaller width and padding
          'p-4 w-[calc(100vw-32px)] max-w-[320px]',
          // Desktop: original size
          'md:p-6 md:w-[380px] md:max-w-[380px]',
          'transition-all duration-250 ease-out',
          'animate-in fade-in-0 slide-in-from-bottom-4'
        )}
        style={{
          left: cardPosition ? `${cardPosition.x}px` : '50%',
          top: cardPosition ? `${cardPosition.y}px` : '50%',
          transform: cardPosition ? 'none' : 'translate(-50%, -50%)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <TutorialStep
          step={currentStepData}
          stepNumber={currentStep + 1}
          totalSteps={steps.length}
          onNext={handleNext}
          onSkip={onSkip}
          isLastStep={isLastStep}
        />
      </div>
    </>
  );

  // Use portal to render at root level
  return mounted ? createPortal(overlayContent, document.body) : null;
}
