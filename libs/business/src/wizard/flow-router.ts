/**
 * Wizard Flow Router
 *
 * Single source of truth for wizard step definitions, routing, and validation.
 * Both flows (presets + prompt-based) are defined here with their requirements.
 *
 * Usage:
 *   import { getStepConfig, getNextRoute, canEnterStep } from '@ryla/business/wizard';
 */

import type { CharacterFormData } from '../store/character-wizard.store';

// =============================================================================
// TYPES
// =============================================================================

export interface WizardStepConfig {
  /** Step ID (matches store step number) */
  id: number;
  /** Route path (e.g., '/wizard/step-1') */
  route: string;
  /** Step title for display */
  title: string;
  /** Step description */
  description: string;
  /** Component name (for documentation/debugging) */
  component: string;
  /** Fields that must have values to enter this step */
  requiredToEnter: string[];
  /** Fields that must have values to proceed from this step */
  requiredToProceed: string[];
  /** Fields/state keys to clear when going back past this step */
  resetOnBack: string[];
}

export type CreationMethod = 'presets' | 'prompt-based' | 'existing-person';

// =============================================================================
// FLOW DEFINITIONS
// =============================================================================

/**
 * Presets Flow: 10-step form-based configuration
 */
export const PRESETS_FLOW: WizardStepConfig[] = [
  {
    id: 1,
    route: '/wizard/step-1',
    title: 'Style',
    description: 'Choose gender and style',
    component: 'StepStyle',
    requiredToEnter: [],
    requiredToProceed: ['gender', 'style'],
    resetOnBack: ['gender', 'style'],
  },
  {
    id: 2,
    route: '/wizard/step-2',
    title: 'Basic Appearance',
    description: 'Ethnicity, age, and skin color',
    component: 'StepGeneral',
    requiredToEnter: ['gender', 'style'],
    requiredToProceed: ['ethnicity'],
    resetOnBack: ['ethnicity', 'ageRange', 'age', 'skinColor'],
  },
  {
    id: 3,
    route: '/wizard/step-3',
    title: 'Facial Features',
    description: 'Eye color and face shape',
    component: 'StepFace',
    requiredToEnter: ['ethnicity'],
    requiredToProceed: ['eyeColor'],
    resetOnBack: ['eyeColor', 'faceShape'],
  },
  {
    id: 4,
    route: '/wizard/step-4',
    title: 'Hair',
    description: 'Hair style and color',
    component: 'StepHair',
    requiredToEnter: ['eyeColor'],
    requiredToProceed: ['hairStyle', 'hairColor'],
    resetOnBack: ['hairStyle', 'hairColor'],
  },
  {
    id: 5,
    route: '/wizard/step-5',
    title: 'Body',
    description: 'Body type and proportions',
    component: 'StepBody',
    requiredToEnter: ['hairStyle'],
    requiredToProceed: ['bodyType'],
    resetOnBack: ['bodyType', 'assSize', 'breastSize', 'breastType'],
  },
  {
    id: 6,
    route: '/wizard/step-6',
    title: 'Skin Features',
    description: 'Freckles, scars, and beauty marks',
    component: 'StepSkinFeatures',
    requiredToEnter: ['bodyType'],
    requiredToProceed: [], // All optional
    resetOnBack: ['freckles', 'scars', 'beautyMarks'],
  },
  {
    id: 7,
    route: '/wizard/step-7',
    title: 'Body Modifications',
    description: 'Piercings and tattoos',
    component: 'StepBodyModifications',
    requiredToEnter: [], // Step 6 is all optional
    requiredToProceed: [], // All optional
    resetOnBack: ['piercings', 'tattoos'],
  },
  {
    id: 8,
    route: '/wizard/step-8',
    title: 'Identity',
    description: 'Name, outfit, and personality',
    component: 'StepIdentity',
    requiredToEnter: [],
    requiredToProceed: ['name', 'outfit', 'archetype'],
    resetOnBack: ['name', 'outfit', 'archetype', 'personalityTraits', 'bio'],
  },
  {
    id: 9,
    route: '/wizard/step-9',
    title: 'Base Image',
    description: 'Generate and select your character face',
    component: 'StepBaseImageSelection',
    requiredToEnter: ['name'],
    requiredToProceed: ['selectedBaseImageId'],
    resetOnBack: ['baseImages', 'selectedBaseImageId', 'baseImageFineTunePrompt'],
  },
  {
    id: 10,
    route: '/wizard/step-10',
    title: 'Finalize',
    description: 'Review and create your character',
    component: 'StepFinalize',
    requiredToEnter: ['selectedBaseImageId'],
    requiredToProceed: [],
    resetOnBack: [], // Nothing to reset after finalize
  },
];

/**
 * Prompt-Based Flow: 4-step text-driven creation
 */
export const PROMPT_BASED_FLOW: WizardStepConfig[] = [
  {
    id: 1,
    route: '/wizard/step-1',
    title: 'Prompt Input',
    description: 'Describe your character',
    component: 'StepPromptInput',
    requiredToEnter: [],
    requiredToProceed: ['promptInput'],
    resetOnBack: ['promptInput', 'promptEnhance'],
  },
  {
    id: 2,
    route: '/wizard/step-2',
    title: 'Identity',
    description: 'Name and personality',
    component: 'StepIdentity',
    requiredToEnter: ['promptInput'],
    requiredToProceed: ['name'],
    resetOnBack: ['name', 'outfit', 'archetype', 'personalityTraits', 'bio'],
  },
  {
    id: 3,
    route: '/wizard/step-3',
    title: 'Base Image',
    description: 'Select your character face',
    component: 'StepBaseImageSelection',
    requiredToEnter: ['name'],
    requiredToProceed: ['selectedBaseImageId'],
    resetOnBack: ['baseImages', 'selectedBaseImageId', 'baseImageFineTunePrompt', 'baseImageJobId', 'baseImageAllJobIds'],
  },
  {
    id: 4,
    route: '/wizard/step-4',
    title: 'Finalize',
    description: 'Review and create your character',
    component: 'StepFinalize',
    requiredToEnter: ['selectedBaseImageId'],
    requiredToProceed: [],
    resetOnBack: [],
  },
];

/**
 * Existing Person Flow: 1-step request submission
 */
export const EXISTING_PERSON_FLOW: WizardStepConfig[] = [
  {
    id: 1,
    route: '/wizard/step-1',
    title: 'Request Influencer',
    description: 'Submit request with consent and details',
    component: 'StepInfluencerRequest',
    requiredToEnter: [],
    requiredToProceed: ['influencerRequestConsent'],
    resetOnBack: ['influencerRequestConsent', 'influencerRequestInstagram', 'influencerRequestTikTok', 'influencerRequestDescription'],
  },
];

/**
 * All flows indexed by creation method
 */
export const WIZARD_FLOWS: Record<CreationMethod, WizardStepConfig[]> = {
  'presets': PRESETS_FLOW,
  'prompt-based': PROMPT_BASED_FLOW,
  'existing-person': EXISTING_PERSON_FLOW,
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get the flow configuration for a creation method
 */
export function getFlow(method: CreationMethod | null): WizardStepConfig[] | null {
  if (!method || !WIZARD_FLOWS[method]) {
    return null;
  }
  return WIZARD_FLOWS[method];
}

/**
 * Get a specific step configuration
 */
export function getStepConfig(
  method: CreationMethod | null,
  stepId: number
): WizardStepConfig | undefined {
  const flow = getFlow(method);
  if (!flow) return undefined;
  return flow.find((s) => s.id === stepId);
}

/**
 * Get step config by route
 */
export function getStepByRoute(
  method: CreationMethod | null,
  route: string
): WizardStepConfig | undefined {
  const flow = getFlow(method);
  if (!flow) return undefined;
  return flow.find((s) => s.route === route);
}

/**
 * Get the route for a specific step ID
 */
export function getRouteByStepId(
  method: CreationMethod | null,
  stepId: number
): string | null {
  const config = getStepConfig(method, stepId);
  return config?.route || null;
}

/**
 * Get the next step route (returns null if at last step)
 */
export function getNextRoute(
  method: CreationMethod | null,
  currentStepId: number
): string | null {
  const flow = getFlow(method);
  if (!flow) return null;
  
  const currentIndex = flow.findIndex((s) => s.id === currentStepId);
  if (currentIndex === -1 || currentIndex >= flow.length - 1) return null;
  
  return flow[currentIndex + 1].route;
}

/**
 * Get the previous step route (returns step-0 if at first step)
 */
export function getPrevRoute(
  method: CreationMethod | null,
  currentStepId: number
): string {
  const flow = getFlow(method);
  if (!flow) return '/wizard/step-0';
  
  const currentIndex = flow.findIndex((s) => s.id === currentStepId);
  if (currentIndex <= 0) return '/wizard/step-0';
  
  return flow[currentIndex - 1].route;
}

/**
 * Check if a step is valid for the given creation method
 */
export function isValidStep(
  method: CreationMethod | null,
  stepId: number
): boolean {
  const config = getStepConfig(method, stepId);
  return config !== undefined;
}

/**
 * Get the total number of steps for a flow
 */
export function getTotalSteps(method: CreationMethod | null): number {
  const flow = getFlow(method);
  return flow?.length || 0;
}

/**
 * Get the last step ID for a flow
 */
export function getLastStepId(method: CreationMethod | null): number {
  const flow = getFlow(method);
  if (!flow || flow.length === 0) return 0;
  return flow[flow.length - 1].id;
}

/**
 * Check if we can enter a step (all required fields from previous steps are present)
 */
export function canEnterStep(
  method: CreationMethod | null,
  stepId: number,
  form: Partial<CharacterFormData>,
  state: { selectedBaseImageId?: string | null; baseImages?: unknown[] }
): boolean {
  const config = getStepConfig(method, stepId);
  if (!config) return false;
  
  // Check all required fields to enter
  for (const field of config.requiredToEnter) {
    if (field === 'selectedBaseImageId') {
      if (!state.selectedBaseImageId) return false;
    } else if (field === 'baseImages') {
      if (!state.baseImages || state.baseImages.length === 0) return false;
    } else {
      const value = (form as Record<string, unknown>)[field];
      if (value === null || value === undefined || value === '') return false;
    }
  }
  
  return true;
}

/**
 * Check if we can proceed from a step (all required fields for this step are filled)
 */
export function canProceedFromStep(
  method: CreationMethod | null,
  stepId: number,
  form: Partial<CharacterFormData>,
  state: { selectedBaseImageId?: string | null; baseImages?: unknown[] }
): boolean {
  const config = getStepConfig(method, stepId);
  if (!config) return false;
  
  // Check all required fields to proceed
  for (const field of config.requiredToProceed) {
    if (field === 'selectedBaseImageId') {
      if (!state.selectedBaseImageId) return false;
    } else if (field === 'baseImages') {
      if (!state.baseImages || state.baseImages.length === 0) return false;
    } else {
      const value = (form as Record<string, unknown>)[field];
      if (value === null || value === undefined || value === '') return false;
      // For arrays (like personalityTraits), check length
      if (Array.isArray(value) && value.length === 0) return false;
    }
  }
  
  return true;
}

/**
 * Get fields to reset when navigating back to a specific step
 */
export function getFieldsToReset(
  method: CreationMethod | null,
  fromStepId: number
): string[] {
  const flow = getFlow(method);
  if (!flow) return [];
  
  const fieldsToReset: string[] = [];
  
  // Collect all fields from steps >= fromStepId
  for (const step of flow) {
    if (step.id >= fromStepId) {
      fieldsToReset.push(...step.resetOnBack);
    }
  }
  
  // Remove duplicates
  return [...new Set(fieldsToReset)];
}

/**
 * Find the first step that the user cannot yet enter
 * (useful for redirecting deep-links to the correct step)
 */
export function getFirstIncompleteStep(
  method: CreationMethod | null,
  form: Partial<CharacterFormData>,
  state: { selectedBaseImageId?: string | null; baseImages?: unknown[] }
): WizardStepConfig | null {
  const flow = getFlow(method);
  if (!flow) return null;
  
  for (const step of flow) {
    if (!canEnterStep(method, step.id, form, state)) {
      // Return the previous step (or first step if this is the first)
      const prevIndex = flow.findIndex((s) => s.id === step.id) - 1;
      return prevIndex >= 0 ? flow[prevIndex] : flow[0];
    }
    if (!canProceedFromStep(method, step.id, form, state)) {
      return step;
    }
  }
  
  // All steps complete
  return flow[flow.length - 1];
}

/**
 * Get the component name for a step (for debugging/logging)
 */
export function getComponentName(
  method: CreationMethod | null,
  stepId: number
): string | null {
  const config = getStepConfig(method, stepId);
  return config?.component || null;
}

