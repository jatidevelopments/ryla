import type { StudioMode } from '../types';

/**
 * Returns the appropriate placeholder text for the prompt input based on the studio mode
 */
export function getPromptPlaceholder(mode: StudioMode): string {
  switch (mode) {
    case 'upscaling':
      return "Upscaling doesn't require a prompt...";
    case 'editing':
      return 'Add custom details or describe changes...';
    case 'creating':
      return 'Upload image as a prompt or Describe the scene you imagine';
    default:
      return 'Describe what you want to generate...';
  }
}

