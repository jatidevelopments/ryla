import type { CharacterFormData } from '@ryla/business';

interface BuildGenerationInputOptions {
  /** Fine-tune adjustment text to add to prompt */
  fineTuneAdjustment?: string;
  /** Skip credit deduction for deferred billing (wizard flow) */
  skipCreditDeduction?: boolean;
}

/**
 * Builds the generation input from wizard form data
 * Handles both prompt-based and presets-based flows
 */
export function buildGenerationInput(
  form: CharacterFormData,
  fineTuneAdjustmentOrOptions?: string | BuildGenerationInputOptions
): any {
  // Handle both old signature (string) and new signature (options object)
  const options: BuildGenerationInputOptions = typeof fineTuneAdjustmentOrOptions === 'string'
    ? { fineTuneAdjustment: fineTuneAdjustmentOrOptions }
    : fineTuneAdjustmentOrOptions || {};
  
  const { fineTuneAdjustment, skipCreditDeduction } = options;
  const isPromptBased = form.creationMethod === 'prompt-based' && form.promptInput;

  if (isPromptBased) {
    // Prompt-based flow
    let prompt = form.promptInput!.trim();
    if (fineTuneAdjustment?.trim()) {
      prompt = `${prompt}. Additional adjustments: ${fineTuneAdjustment.trim()}`;
    }

    return {
      promptInput: prompt,
      promptEnhance: form.promptEnhance ?? true,
      nsfwEnabled: form.nsfwEnabled || false,
      ...(skipCreditDeduction && { skipCreditDeduction: true }),
    };
  }

  // Traditional presets flow
  // Ensure gender is always a valid value ('female' or 'male'), never null
  const gender = form.gender === 'female' || form.gender === 'male' ? form.gender : 'female';
  
  // Ensure all required fields have valid defaults
  const appearance = {
    gender,
    style: form.style === 'realistic' || form.style === 'anime' ? form.style : 'realistic',
    ethnicity: form.ethnicity || 'caucasian',
    age: form.age || 25, // Default age if not set
    ...(form.ageRange && { ageRange: form.ageRange }),
    ...(form.skinColor && { skinColor: form.skinColor }),
    eyeColor: form.eyeColor || 'brown',
    ...(form.faceShape && { faceShape: form.faceShape }),
    hairStyle: form.hairStyle || 'long-straight',
    hairColor: form.hairColor || 'brown',
    bodyType: form.bodyType || 'slim',
    ...(form.assSize && { assSize: form.assSize }),
    ...(form.breastSize && { breastSize: form.breastSize }),
    ...(form.breastType && { breastType: form.breastType }),
    ...(form.freckles && { freckles: form.freckles }),
    ...(form.scars && { scars: form.scars }),
    ...(form.beautyMarks && { beautyMarks: form.beautyMarks }),
    ...(form.piercings && { piercings: form.piercings }),
    ...(form.tattoos && { tattoos: form.tattoos }),
  };

  return {
    appearance,
    identity: {
      defaultOutfit: form.outfit || 'casual',
      archetype: form.archetype || 'girl-next-door',
      personalityTraits:
        form.personalityTraits.length > 0 ? form.personalityTraits : ['friendly'],
      bio: form.bio || '',
    },
    nsfwEnabled: form.nsfwEnabled || false,
    // Add fine-tune adjustment to bio for presets flow
    ...(fineTuneAdjustment?.trim() && {
      promptInput: fineTuneAdjustment.trim(),
      promptEnhance: false, // Don't double-enhance
    }),
    // Skip credit deduction for wizard flow (deferred billing)
    ...(skipCreditDeduction && { skipCreditDeduction: true }),
  };
}

