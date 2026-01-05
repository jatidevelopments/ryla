'use client';

import * as React from 'react';
// Note: Import from @ryla/analytics package
// This will be resolved at build time via workspace aliases
import { capture } from '@ryla/analytics';
import type { TutorialConfig, UseTutorialReturn } from '../components/tutorial/types';

/**
 * useTutorial - Hook for managing tutorial state and navigation
 * 
 * @param tutorialId - Unique identifier for this tutorial (e.g., 'studio')
 * @param steps - Array of tutorial steps
 * @param options - Configuration options
 * @returns Tutorial state and control methods
 */
export function useTutorial(
  tutorialId: string,
  steps: TutorialConfig['steps'],
  options: {
    autoStart?: boolean;
    storageKey?: string;
    onComplete?: () => void;
    onSkip?: () => void;
  } = {}
): UseTutorialReturn {
  const {
    autoStart = true,
    storageKey,
    onComplete: onCompleteCallback,
    onSkip: onSkipCallback,
  } = options;

  // Generate storage key
  const storageKeyValue = React.useMemo(
    () => storageKey || `tutorial_${tutorialId}_completed`,
    [storageKey, tutorialId]
  );

  // State
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isActive, setIsActive] = React.useState(false);
  const [startTime, setStartTime] = React.useState<number | null>(null);

  // Check if tutorial is completed
  const isCompleted = React.useMemo(() => {
    if (typeof window === 'undefined') return false;
    try {
      return localStorage.getItem(storageKeyValue) === 'true';
    } catch {
      return false;
    }
  }, [storageKeyValue]);

  // Auto-start on mount if enabled and not completed
  React.useEffect(() => {
    if (autoStart && !isCompleted && !isActive) {
      start();
    }
  }, [autoStart, isCompleted]); // Only run on mount/initial render

  // Start tutorial
  const start = React.useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
    setStartTime(Date.now());

    // Track analytics
    capture('tutorial.started', {
      tutorial_id: tutorialId,
      page: typeof window !== 'undefined' ? window.location.pathname : '',
      total_steps: steps.length,
    });
  }, [tutorialId, steps.length]);

  // Move to next step
  const next = React.useCallback(() => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);

      // Track analytics
      capture('tutorial.step_viewed', {
        tutorial_id: tutorialId,
        step_number: nextStep + 1, // 1-based for analytics
        step_id: steps[nextStep].id,
        page: typeof window !== 'undefined' ? window.location.pathname : '',
      });
    }
  }, [currentStep, steps, tutorialId]);

  // Complete tutorial
  const complete = React.useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKeyValue, 'true');
      } catch (error) {
        console.warn('Failed to save tutorial completion to localStorage', error);
      }
    }

    // Calculate time to complete
    const timeToComplete = startTime ? Date.now() - startTime : 0;

    // Track analytics
    capture('tutorial.completed', {
      tutorial_id: tutorialId,
      page: typeof window !== 'undefined' ? window.location.pathname : '',
      steps_viewed: steps.length,
      time_to_complete: timeToComplete,
    });

    // Call callback
    onCompleteCallback?.();
  }, [tutorialId, steps.length, startTime, storageKeyValue, onCompleteCallback]);

  // Skip tutorial
  const skip = React.useCallback(() => {
    setIsActive(false);

    // Save to localStorage (mark as completed/skipped)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKeyValue, 'true');
      } catch (error) {
        console.warn('Failed to save tutorial skip to localStorage', error);
      }
    }

    // Track analytics
    capture('tutorial.skipped', {
      tutorial_id: tutorialId,
      page: typeof window !== 'undefined' ? window.location.pathname : '',
      skipped_at_step: currentStep + 1, // 1-based for analytics
      steps_viewed: currentStep + 1,
    });

    // Call callback
    onSkipCallback?.();
  }, [tutorialId, currentStep, storageKeyValue, onSkipCallback]);

  // Reset tutorial (clear localStorage)
  const reset = React.useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(storageKeyValue);
      } catch (error) {
        console.warn('Failed to reset tutorial state in localStorage', error);
      }
    }

    setCurrentStep(0);
    setIsActive(false);
    setStartTime(null);

    // Track analytics
    const wasCompleted = isCompleted;
    capture('tutorial.restarted', {
      tutorial_id: tutorialId,
      page: typeof window !== 'undefined' ? window.location.pathname : '',
      previous_completion: wasCompleted,
    });
  }, [tutorialId, storageKeyValue, isCompleted]);

  return {
    currentStep,
    isActive,
    start,
    next,
    skip,
    complete,
    reset,
  };
}

