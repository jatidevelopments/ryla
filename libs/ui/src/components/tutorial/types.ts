/**
 * Tutorial component types
 * 
 * Types for the contextual page tutorial system.
 */

export interface TutorialStep {
  /** Unique identifier for this step */
  id: string;
  /** CSS selector or data attribute to target element */
  target: string;
  /** Instructional message displayed to user */
  message: string;
  /** Optional step title */
  title?: string;
  /** Position of tutorial card relative to target */
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  /** Direction of pointer arrow */
  pointerDirection?: 'up' | 'down' | 'left' | 'right';
  /** Whether to show skip link on this step */
  showSkip?: boolean;
}

export interface TutorialConfig {
  /** Tutorial identifier (e.g., 'studio') */
  id: string;
  /** Array of tutorial steps */
  steps: TutorialStep[];
  /** Auto-start tutorial on mount (default: true) */
  autoStart?: boolean;
  /** Custom storage key (default: tutorial_{id}_completed) */
  storageKey?: string;
  /** Callback when tutorial completes */
  onComplete?: () => void;
  /** Callback when tutorial is skipped */
  onSkip?: () => void;
}

export interface TutorialOverlayProps {
  /** Array of tutorial steps */
  steps: TutorialStep[];
  /** Current step index (0-based) */
  currentStep: number;
  /** Callback when user clicks "Got it" */
  onNext: () => void;
  /** Callback when user clicks "Skip tutorial" */
  onSkip: () => void;
  /** Callback when tutorial completes */
  onComplete: () => void;
  /** Whether overlay is visible */
  isVisible: boolean;
}

export interface TutorialPointerProps {
  /** CSS selector or data attribute for target element */
  target: string;
  /** Direction of pointer */
  direction?: 'up' | 'down' | 'left' | 'right';
  /** Position of tutorial card */
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

export interface UseTutorialReturn {
  /** Current step index (0-based) */
  currentStep: number;
  /** Whether tutorial is currently active */
  isActive: boolean;
  /** Start the tutorial */
  start: () => void;
  /** Move to next step */
  next: () => void;
  /** Skip the tutorial */
  skip: () => void;
  /** Complete the tutorial */
  complete: () => void;
  /** Reset tutorial state (clear localStorage) */
  reset: () => void;
}

