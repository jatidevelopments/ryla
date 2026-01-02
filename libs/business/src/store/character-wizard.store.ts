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

/** Generated image for base image selection */
export interface GeneratedImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  s3Key?: string;
  prompt?: string;
  negativePrompt?: string;
  seed?: string;
}

/** Profile picture with position info */
export interface ProfilePictureImage extends GeneratedImage {
  positionId: string;
  positionName: string;
  isNSFW?: boolean;
}

/** Character form data matching the wizard */
export interface CharacterFormData {
  // Step 0: Creation Method
  creationMethod: 'presets' | 'prompt-based' | null;

  // Prompt-based Flow Fields
  promptInput?: string; // Single prompt for character description
  voiceMemoUrl?: string; // URL to uploaded voice memo (future)

  // Legacy fields (for migration)
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
  
  // Profile picture set selection (null = skip)
  selectedProfilePictureSetId: 'classic-influencer' | 'professional-model' | 'natural-beauty' | null;
}

/** Store state interface */
export interface CharacterWizardState {
  // Navigation
  step: number;
  steps: WizardStep[];
  status: 'idle' | 'pending' | 'generating' | 'completed' | 'error';

  // Form data
  form: CharacterFormData;

  // Base image selection
  baseImages: GeneratedImage[]; // 3 generated base images
  selectedBaseImageId: string | null;
  baseImageFineTunePrompt: string; // For fine-tuning selected image

  // Profile picture set
  profilePictureSet: {
    jobId: string | null;
    images: ProfilePictureImage[];
    generating: boolean;
    setId?: 'classic-influencer' | 'professional-model' | 'natural-beauty';
  };

  // Generated character ID (after creation)
  characterId: string | null;

  // Actions
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setStatus: (status: CharacterWizardState['status']) => void;
  setCharacterId: (id: string | null) => void;
  updateSteps: (method: 'presets' | 'prompt-based') => void;

  // Form actions
  setField: <K extends keyof CharacterFormData>(field: K, value: CharacterFormData[K]) => void;
  setFormData: (data: Partial<CharacterFormData>) => void;
  resetForm: () => void;

  // Base image actions
  setBaseImages: (images: GeneratedImage[]) => void;
  selectBaseImage: (imageId: string) => void;
  setBaseImageFineTunePrompt: (prompt: string) => void;
  replaceBaseImage: (imageId: string, newImage: GeneratedImage) => void;

  // Profile picture set actions
  setProfilePictureSetGenerating: (generating: boolean) => void;
  setProfilePictureSetJobId: (jobId: string | null) => void;
  setProfilePictureSetImages: (images: ProfilePictureImage[]) => void;
  addProfilePicture: (image: ProfilePictureImage) => void;
  removeProfilePicture: (imageId: string) => void;
  updateProfilePicture: (imageId: string, updates: Partial<ProfilePictureImage>) => void;

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
  { id: 6, title: 'Base Image', description: 'Select your character face' },
  { id: 7, title: 'Finalize', description: 'Review and create' },
];

const PROMPT_BASED_STEPS: WizardStep[] = [
  { id: 1, title: 'Prompt Input', description: 'Describe your character' },
  { id: 2, title: 'Base Image', description: 'Select your character face' },
  { id: 3, title: 'Finalize', description: 'Review and create' },
];

/**
 * Reset form fields and state for steps from a given step onwards
 * This is called when going back in the wizard to clear invalidated data
 */
function resetStepsFrom(
  state: CharacterWizardState,
  fromStep: number
): void {
  const { form, creationMethod } = state;

  if (creationMethod === 'prompt-based') {
    // Prompt-based flow
    if (fromStep <= 1) {
      // Reset prompt input
      form.promptInput = undefined;
    }
    if (fromStep <= 2) {
      // Reset base image selection
      state.baseImages = [];
      state.selectedBaseImageId = null;
      state.baseImageFineTunePrompt = '';
    }
    // Profile pictures are generated after creation on the profile page.
  } else if (creationMethod === 'presets') {
    // Presets flow
    if (fromStep <= 1) {
      // Reset style
      form.gender = null;
      form.style = null;
    }
    if (fromStep <= 2) {
      // Reset general
      form.ethnicity = null;
      form.age = 25; // Reset to default
    }
    if (fromStep <= 3) {
      // Reset face
      form.hairStyle = null;
      form.hairColor = null;
      form.eyeColor = null;
    }
    if (fromStep <= 4) {
      // Reset body
      form.bodyType = null;
      form.breastSize = null;
    }
    if (fromStep <= 5) {
      // Reset identity
      form.name = '';
      form.outfit = null;
      form.archetype = null;
      form.personalityTraits = [];
      form.bio = '';
    }
    if (fromStep <= 6) {
      // Reset base image selection
      state.baseImages = [];
      state.selectedBaseImageId = null;
      state.baseImageFineTunePrompt = '';
    }
    // Profile pictures are generated after creation on the profile page.
  }
}

/** Default form values */
const DEFAULT_FORM: CharacterFormData = {
  // Step 0
  creationMethod: null,
  promptInput: undefined,
  voiceMemoUrl: undefined,
  // Legacy fields
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
  // Profile picture set (null = skip by default)
  selectedProfilePictureSetId: null,
};

/** Create the store with persistence */
export const useCharacterWizardStore = create<CharacterWizardState>()(
  persist(
    immer((set, get) => ({
      // Initial state
      step: 0, // Start at step 0 (creation method selection)
      steps: [], // Will be set when creation method is selected (or restored on rehydration)
      status: 'idle',
      form: { ...DEFAULT_FORM },
      characterId: null,
      baseImages: [],
      selectedBaseImageId: null,
      baseImageFineTunePrompt: '',
      profilePictureSet: {
        jobId: null,
        images: [],
        generating: false,
      },

      // Navigation actions
      setStep: (step) =>
        set((state) => {
          // If going to an earlier step, reset all steps from that step onwards
          if (step < state.step) {
            resetStepsFrom(state, step);
          }
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
            const targetStep = state.step - 1;
            // Reset all steps from targetStep onwards (including targetStep)
            resetStepsFrom(state, targetStep);
            state.step = targetStep;
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

      updateSteps: (method: 'presets' | 'prompt-based') =>
        set((state) => {
          if (method === 'prompt-based') {
            state.steps = PROMPT_BASED_STEPS;
          } else {
            state.steps = PRESETS_STEPS;
          }
          // Reset to step 1 of the selected flow
          state.step = 1;
        }),

      // Base image actions
      setBaseImages: (images) =>
        set((state) => {
          state.baseImages = images;
        }),

      selectBaseImage: (imageId) =>
        set((state) => {
          state.selectedBaseImageId = imageId;
        }),

      setBaseImageFineTunePrompt: (prompt) =>
        set((state) => {
          state.baseImageFineTunePrompt = prompt;
        }),

      replaceBaseImage: (imageId, newImage) =>
        set((state) => {
          const index = state.baseImages.findIndex((img) => img.id === imageId);
          if (index !== -1) {
            state.baseImages[index] = newImage;
          }
          // If this was the selected image, update selection
          if (state.selectedBaseImageId === imageId) {
            state.selectedBaseImageId = newImage.id;
          }
        }),

      // Profile picture set actions
      setProfilePictureSetGenerating: (generating) =>
        set((state) => {
          state.profilePictureSet.generating = generating;
        }),

      setProfilePictureSetJobId: (jobId) =>
        set((state) => {
          state.profilePictureSet.jobId = jobId;
        }),

      setProfilePictureSetImages: (images) =>
        set((state) => {
          state.profilePictureSet.images = images;
        }),

      addProfilePicture: (image) =>
        set((state) => {
          state.profilePictureSet.images.push(image);
        }),

      removeProfilePicture: (imageId) =>
        set((state) => {
          state.profilePictureSet.images = state.profilePictureSet.images.filter(
            (img) => img.id !== imageId
          );
        }),

      updateProfilePicture: (imageId, updates) =>
        set((state) => {
          const index = state.profilePictureSet.images.findIndex((img) => img.id === imageId);
          if (index !== -1) {
            Object.assign(state.profilePictureSet.images[index], updates);
          }
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
          state.baseImages = [];
          state.selectedBaseImageId = null;
          state.baseImageFineTunePrompt = '';
          state.profilePictureSet = {
            jobId: null,
            images: [],
            generating: false,
          };
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
        if (form.creationMethod === 'prompt-based') {
          switch (step) {
            case 1: // Prompt Input
              return !!form.promptInput?.trim();
            case 2: // Base Image Selection
              return !!get().selectedBaseImageId;
            case 3: // Finalize
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
            case 6: // Base Image Selection
              return !!get().selectedBaseImageId;
            case 7: // Finalize
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
        baseImages: state.baseImages,
        selectedBaseImageId: state.selectedBaseImageId,
        baseImageFineTunePrompt: state.baseImageFineTunePrompt,
        profilePictureSet: state.profilePictureSet,
      }),
      onRehydrateStorage: () => (state) => {
        // Restore steps array based on creationMethod when rehydrating from localStorage
        if (state && state.form.creationMethod && state.steps.length === 0) {
          if (state.form.creationMethod === 'prompt-based') {
            state.steps = PROMPT_BASED_STEPS;
          } else if (state.form.creationMethod === 'presets') {
            state.steps = PRESETS_STEPS;
          }
        }
      },
    }
  )
);

/** Helper: Get current step info */
export const useCurrentStep = () => {
  const step = useCharacterWizardStore((s) => s.step);
  const steps = useCharacterWizardStore((s) => s.steps);
  if (steps.length === 0) return null; // Return null if steps not initialized
  return steps.find((s) => s.id === step) || steps[0] || null;
};

/** Helper: Get progress percentage */
export const useWizardProgress = () => {
  const step = useCharacterWizardStore((s) => s.step);
  const steps = useCharacterWizardStore((s) => s.steps);
  if (steps.length === 0) return 0; // Return 0 if steps not initialized yet
  return Math.round((step / steps.length) * 100);
};

/**
 * Helper: Check if current step is valid and can proceed
 * This hook subscribes to form data changes so it re-renders when validation state changes
 */
export const useCanProceed = () => {
  const step = useCharacterWizardStore((s) => s.step);
  const form = useCharacterWizardStore((s) => s.form);
  const steps = useCharacterWizardStore((s) => s.steps);
  const selectedBaseImageId = useCharacterWizardStore((s) => s.selectedBaseImageId);

  // Find current step definition
  const currentStep = steps.find((s) => s.id === step);

  // If no step definition, check step 0 (creation method selection)
  if (!currentStep) {
    return step === 0 ? !!form.creationMethod : false;
  }

  // Step 0: Creation Method (if no method selected yet)
  if (step === 0 || !form.creationMethod) {
    return !!form.creationMethod;
  }

  // Validation based on creation method
  if (form.creationMethod === 'prompt-based') {
    switch (step) {
      case 1: // Prompt Input
        return !!form.promptInput?.trim();
      case 2: // Base Image Selection
        return !!selectedBaseImageId;
      case 3: // Finalize
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
      case 6: // Base Image Selection
        return !!selectedBaseImageId;
      case 7: // Finalize
        return true;
      default:
        return false;
    }
  }
};

