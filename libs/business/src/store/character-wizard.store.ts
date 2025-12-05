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

  // Form actions
  setField: <K extends keyof CharacterFormData>(field: K, value: CharacterFormData[K]) => void;
  setFormData: (data: Partial<CharacterFormData>) => void;
  resetForm: () => void;

  // Validation
  isStepValid: (step: number) => boolean;
  canProceed: () => boolean;
}

/** Default wizard steps */
const WIZARD_STEPS: WizardStep[] = [
  { id: 1, title: 'Style', description: 'Choose gender and style' },
  { id: 2, title: 'General', description: 'Set ethnicity and age' },
  { id: 3, title: 'Face', description: 'Design hair and eyes' },
  { id: 4, title: 'Body', description: 'Define body type' },
  { id: 5, title: 'Identity', description: 'Add personality and outfit' },
  { id: 6, title: 'Generate', description: 'Preview and create' },
];

/** Default form values */
const DEFAULT_FORM: CharacterFormData = {
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
      step: 1,
      steps: WIZARD_STEPS,
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
          if (state.step > 1) {
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
          state.step = 1;
          state.status = 'idle';
          state.form = { ...DEFAULT_FORM };
          state.characterId = null;
        }),

      // Validation
      isStepValid: (step) => {
        const { form } = get();

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

