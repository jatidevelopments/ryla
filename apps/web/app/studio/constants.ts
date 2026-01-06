import type { TutorialStepType } from '@ryla/ui';

/** UUID regex pattern for validation */
export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** Studio tutorial steps definition */
export const studioTutorialSteps: TutorialStepType[] = [
  {
    id: 'character-selection',
    target: '[data-tutorial-target="character-selector"]',
    message: 'Select an AI Influencer to generate images for',
    position: 'bottom',
    pointerDirection: 'up',
  },
  {
    id: 'mode-tabs',
    target: '[data-tutorial-target="mode-tabs"]',
    message:
      'Switch between Creating new images, Editing existing ones, or Upscaling for higher resolution',
    position: 'bottom',
    pointerDirection: 'up',
  },
  {
    id: 'content-type',
    target: '[data-tutorial-target="content-type-selector"]',
    message: 'Choose to generate Images or Videos (Video coming soon!)',
    position: 'bottom',
    pointerDirection: 'up',
  },
  {
    id: 'generation-controls',
    target: '[data-tutorial-target="generation-controls"]',
    message: 'Choose a scene, environment, and outfit for your images',
    position: 'top',
    pointerDirection: 'down',
  },
  {
    id: 'generation-settings',
    target: '[data-tutorial-target="generation-settings"]',
    message: 'Adjust settings: aspect ratio, quality, and batch size',
    position: 'top',
    pointerDirection: 'down',
  },
  {
    id: 'generate-button',
    target: '[data-tutorial-target="generate-button"]',
    message: 'Click Generate to create your images. Each image costs credits.',
    position: 'top',
    pointerDirection: 'down',
  },
  {
    id: 'gallery',
    target: '[data-tutorial-target="gallery"]',
    message: 'View your generated images here. Like, download, or delete them.',
    position: 'top',
    pointerDirection: 'down',
  },
];

/** Supported aspect ratios for generation */
export const SUPPORTED_ASPECT_RATIOS = new Set(['1:1', '9:16', '2:3']);

/** Default aspect ratio */
export const DEFAULT_ASPECT_RATIO = '9:16' as const;

/** Polling timeout for generation results (3 minutes) */
export const POLLING_TIMEOUT_MS = 3 * 60 * 1000;

/** Polling interval for generation results (2 seconds) */
export const POLLING_INTERVAL_MS = 2000;

