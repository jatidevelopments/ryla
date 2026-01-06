import type { CharacterWizardForm } from '@ryla/business';

/**
 * Builds the generation input from wizard form data
 * Handles both prompt-based and presets-based flows
 */
export function buildGenerationInput(
  form: CharacterWizardForm,
  fineTuneAdjustment?: string
): any {
  const isPromptBased = form.creationMethod === 'prompt-based' && form.promptInput;

  if (isPromptBased) {
    // Prompt-based flow
    let prompt = form.promptInput.trim();
    if (fineTuneAdjustment?.trim()) {
      prompt = `${prompt}. Additional adjustments: ${fineTuneAdjustment.trim()}`;
    }

    return {
      promptInput: prompt,
      promptEnhance: form.promptEnhance ?? true,
      nsfwEnabled: form.nsfwEnabled || false,
    };
  }

  // Traditional presets flow
  return {
    appearance: {
      gender: form.gender || 'female',
      style: form.style || 'realistic',
      ethnicity: form.ethnicity || 'caucasian',
      age: form.age,
      ageRange: form.ageRange || undefined,
      skinColor: form.skinColor || undefined,
      eyeColor: form.eyeColor || 'brown',
      faceShape: form.faceShape || undefined,
      hairStyle: form.hairStyle || 'long-straight',
      hairColor: form.hairColor || 'brown',
      bodyType: form.bodyType || 'slim',
      assSize: form.assSize || undefined,
      breastSize: form.breastSize || undefined,
      breastType: form.breastType || undefined,
      freckles: form.freckles || undefined,
      scars: form.scars || undefined,
      beautyMarks: form.beautyMarks || undefined,
      piercings: form.piercings || undefined,
      tattoos: form.tattoos || undefined,
    },
    identity: {
      defaultOutfit: form.outfit || 'casual',
      archetype: form.archetype || 'girl-next-door',
      personalityTraits:
        form.personalityTraits.length > 0 ? form.personalityTraits : ['friendly'],
      bio: form.bio,
    },
    nsfwEnabled: form.nsfwEnabled,
    // Add fine-tune adjustment to bio for presets flow
    ...(fineTuneAdjustment?.trim() && {
      promptInput: fineTuneAdjustment.trim(),
      promptEnhance: false, // Don't double-enhance
    }),
  };
}

