/**
 * Character Wizard Store
 * Zustand store with localStorage persistence for the 6-step character creation wizard
 *
 * Source: MDC mdc-next-frontend/store/persist/character-presets-form.ts
 * Adapted for RYLA MVP
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

/** Wizard step definition */
export interface WizardStep {
  id: number;
  title: string;
  description?: string;
}

/** Character form data matching the 6-step wizard */
export interface CharacterFormData {
  // Step 0: Creation Method
  creationMethod: 'presets' | 'ai' | 'custom' | null;

  // AI Flow Fields
  aiDescription?: string;
  aiReferenceImage?: string;
  aiGeneratedConfig?: any;

  // Custom Flow Fields
  customAppearancePrompt?: string;
  customIdentityPrompt?: string;
  customImagePrompt?: string;

  // Step 1: Style
  gender: 'female' | 'male' | null;
  style: 'realistic' | 'anime' | null;

  // Step 2: General
  ethnicity: string | null;
  age: number;

  // Step 3: Face
  hairStyle: string | null;
  hairColor: string | null;
  eyeColor: string | null;

  // Step 4: Body
  bodyType: string | null;
  breastSize: string | null; // Female only

  // Step 5: Identity
  name: string;
  outfit: string | null;
  archetype: string | null;
  personalityTraits: string[];
  bio: string;

  // Generation settings
  nsfwEnabled: boolean;
  aspectRatio: '1:1' | '9:16' | '2:3';
  qualityMode: 'draft' | 'hq';
}

/** Store state interface */
export interface CharacterWizardState {
  // Navigation
  step: number;
  steps: WizardStep[];
  status: 'idle' | 'pending' | 'generating' | 'completed' | 'error';

  // Form data
  form: CharacterFormData;

  // Generated character ID (after creation)
  characterId: string | null;

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setStatus: (status: CharacterWizardState['status']) => void;
  setCharacterId: (id: string | null) => void;
  updateSteps: (method: 'presets' | 'ai' | 'custom') => void;

  // Form actions
  setField: <K extends keyof CharacterFormData>(field: K, value: CharacterFormData[K]) => void;
  setFormData: (data: Partial<CharacterFormData>) => void;
  resetForm: () => void;

  // Validation
  isStepValid: (step: number) => boolean;
  canProceed: () => boolean;
}

/** Default wizard steps - will be dynamically built based on creation method */
const PRESETS_STEPS: WizardStep[] = [
  { id: 1, title: 'Style', description: 'Choose gender and style' },
  { id: 2, title: 'General', description: 'Set ethnicity and age' },
  { id: 3, title: 'Face', description: 'Design hair and eyes' },
  { id: 4, title: 'Body', description: 'Define body type' },
  { id: 5, title: 'Identity', description: 'Add personality and outfit' },
  { id: 6, title: 'Generate', description: 'Preview and create' },
];

const AI_STEPS: WizardStep[] = [
  { id: 1, title: 'AI Description', description: 'Describe your influencer' },
  { id: 2, title: 'AI Generation', description: 'AI is creating...' },
  { id: 3, title: 'Review & Edit', description: 'Review AI-generated config' },
  { id: 4, title: 'Generate', description: 'Preview and create' },
];

const CUSTOM_STEPS: WizardStep[] = [
  { id: 1, title: 'Custom Prompts', description: 'Enter custom prompts' },
  { id: 2, title: 'Review', description: 'Review your prompts' },
  { id: 3, title: 'Generate', description: 'Preview and create' },
];

/** Default form values */
const DEFAULT_FORM: CharacterFormData = {
  // Step 0
  creationMethod: null,
  aiDescription: undefined,
  aiReferenceImage: undefined,
  aiGeneratedConfig: undefined,
  customAppearancePrompt: undefined,
  customIdentityPrompt: undefined,
  customImagePrompt: undefined,
  // Step 1
  gender: null,
  style: null,
  // Step 2
  ethnicity: null,
  age: 25,
  // Step 3
  hairStyle: null,
  hairColor: null,
  eyeColor: null,
  // Step 4
  bodyType: null,
  breastSize: null,
  // Step 5
  name: '',
  outfit: null,
  archetype: null,
  personalityTraits: [],
  bio: '',
  // Generation
  nsfwEnabled: false,
  aspectRatio: '9:16',
  qualityMode: 'draft',
};

/** Create the store with persistence */
export const useCharacterWizardStore = create<CharacterWizardState>()(
  persist(
    immer((set, get) => ({
      // Initial state
      step: 0, // Start at step 0 (creation method selection)
      steps: [], // Will be set when creation method is selected
      status: 'idle',
      form: { ...DEFAULT_FORM },
      characterId: null,

      // Navigation actions
      setStep: (step) =>
        set((state) => {
          state.step = step;
        }),

      nextStep: () =>
        set((state) => {
          if (state.step < state.steps.length) {
            state.step += 1;
          }
        }),

      prevStep: () =>
        set((state) => {
          if (state.step > 0) {
            state.step -= 1;
          }
        }),

      setStatus: (status) =>
        set((state) => {
          state.status = status;
        }),

      setCharacterId: (id) =>
        set((state) => {
          state.characterId = id;
        }),

      updateSteps: (method: 'presets' | 'ai' | 'custom') =>
        set((state) => {
          if (method === 'ai') {
            state.steps = AI_STEPS;
          } else if (method === 'custom') {
            state.steps = CUSTOM_STEPS;
          } else {
            state.steps = PRESETS_STEPS;
          }
          // Reset to step 1 of the selected flow
          state.step = 1;
        }),

      // Form actions
      setField: (field, value) =>
        set((state) => {
          state.form[field] = value;

          // Auto-clear gender-specific fields when gender changes
          if (field === 'gender') {
            state.form.breastSize = null;
            state.form.bodyType = null;
            state.form.hairStyle = null;
          }
        }),

      setFormData: (data) =>
        set((state) => {
          Object.assign(state.form, data);
        }),

      resetForm: () =>
        set((state) => {
          state.step = 0;
          state.steps = [];
          state.status = 'idle';
          state.form = { ...DEFAULT_FORM };
          state.characterId = null;
        }),

      // Validation
      isStepValid: (step) => {
        const { form, steps } = get();
        const currentStep = steps.find((s) => s.id === step);

        if (!currentStep) return false;

        // Step 0: Creation Method (if no method selected yet)
        if (step === 0 || !form.creationMethod) {
          return !!form.creationMethod;
        }

        // Validation based on creation method
        if (form.creationMethod === 'ai') {
          switch (step) {
            case 1: // AI Description
              return !!form.aiDescription?.trim();
            case 2: // AI Generation (loader, always valid)
              return true;
            case 3: // AI Review (always valid if reached)
              return true;
            case 4: // Generate
              return true;
            default:
              return false;
          }
        } else if (form.creationMethod === 'custom') {
          switch (step) {
            case 1: // Custom Prompts
              return !!form.customAppearancePrompt?.trim() && !!form.customIdentityPrompt?.trim();
            case 2: // Custom Review (always valid if reached)
              return true;
            case 3: // Generate
              return true;
            default:
              return false;
          }
        } else {
          // Presets flow
          switch (step) {
            case 1: // Style
              return !!form.gender && !!form.style;
            case 2: // General
              return !!form.ethnicity && form.age >= 18 && form.age <= 65;
            case 3: // Face
              return !!form.hairStyle && !!form.hairColor && !!form.eyeColor;
            case 4: // Body
              return !!form.bodyType;
            case 5: // Identity
              return !!form.outfit; // Other identity fields optional
            case 6: // Generate (always valid if reached)
              return true;
            default:
              return false;
          }
        }
      },

      canProceed: () => {
        const { step, isStepValid } = get();
        return isStepValid(step);
      },
    })),
    {
      name: 'ryla-character-wizard',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        step: state.step,
        status: state.status,
        form: state.form,
        characterId: state.characterId,
      }),
    }
  )
);

/** Helper: Get current step info */
export const useCurrentStep = () => {
  const step = useCharacterWizardStore((s) => s.step);
  const steps = useCharacterWizardStore((s) => s.steps);
  return steps.find((s) => s.id === step) || steps[0];
};

/** Helper: Get progress percentage */
export const useWizardProgress = () => {
  const step = useCharacterWizardStore((s) => s.step);
  const steps = useCharacterWizardStore((s) => s.steps);
  return Math.round((step / steps.length) * 100);
};

