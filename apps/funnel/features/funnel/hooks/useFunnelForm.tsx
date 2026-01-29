import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useDebouncedCallback } from 'use-debounce';

import { getFunnelStore } from '@/store/states/funnel';

import { funnelV3Schema } from '@/features/funnel/validation';
import { subscriptions } from '@/constants/subscriptions';
import { FUNNEL_STEPS } from '@/features/funnel/config/steps';
import { safePostHogCapture } from '@/lib/analytics/posthog-utils';
import {
  getOrCreateSessionId,
  createSession,
  updateSessionStep,
  saveAllOptions,
} from '@/services/session-service';

export type FunnelSchema = z.infer<typeof funnelV3Schema>;

// Triggers for validation at each step (0-based indices)
// IMPORTANT: Info, social-proof, loader, and payment steps should NEVER have validation triggers
// Only "input" type steps should have validation triggers
// Step 0: Choose Creation Method (info) - NO VALIDATION
// Step 1: Partnership Proof (social-proof) - NO VALIDATION
// Step 2: AI Influencer Experience (input) - validate ai_influencer_experience
// Step 3: Use Case (input) - validate use_cases
// Step 4: Choose Ethnicity (input) - validate influencer_ethnicity
// Step 5: Hyper Realistic Skin (info) - NO VALIDATION
// Step 6: Choose Age (input) - validate influencer_age
// Step 7: Choose Skin Color (input) - validate influencer_skin_color
// Step 8: Social Proof (social-proof) - NO VALIDATION
// Step 9: Choose Eye Color (input) - validate influencer_eye_color
// Step 10: Hair Style & Color (input) - validate influencer_hair_style and influencer_hair_color
// Step 11: Face Shape (input) - validate influencer_face_shape
// Step 12: Character Consistency (info) - NO VALIDATION
// Step 13: Freckles (input) - validate influencer_freckles
// Step 14: Scars (input) - validate influencer_scars
// Step 15: Beauty Marks (input) - validate influencer_beauty_marks
// Step 16: Perfect Hands (info) - NO VALIDATION
// Step 17: Body Type (input) - validate influencer_body_type
// Step 18: Choose Outfit (input) - no validation (outfit is optional, can customize later)
// Step 19: Customize Outfit (info) - NO VALIDATION
// Step 20: Piercings (input) - validate influencer_piercings
// Step 21: Tattoos (input) - validate influencer_tattoos
// Step 22: Ass Size (input) - validate influencer_ass_size
// Step 23: Breast Type (input) - validate influencer_breast_type
// Step 24: Voice (input) - validate influencer_voice
// Step 25: Video Content Intro (info) - NO VALIDATION
// Step 26: Video Content Options (input) - validate video_content_options
// Step 27: NSFW Content (input) - validate enable_nsfw
// Step 28: NSFW Content Preview (info) - NO VALIDATION
// Step 29: Lipsync Feature (info) - NO VALIDATION
// Step 30: Character Generation (loader) - NO VALIDATION
// Step 31: Access Influencer (info) - NO VALIDATION
// Step 32: Feature Summary (info) - NO VALIDATION
// Step 33: Subscription (payment) - NO VALIDATION
// Step 34: Payment (payment) - validate email
const _triggers: Record<
  number,
  keyof FunnelSchema | Array<keyof FunnelSchema>
> = {
  2: 'ai_influencer_experience',
  3: 'use_cases',
  4: 'influencer_ethnicity',
  6: 'influencer_age',
  7: 'influencer_skin_color',
  9: 'influencer_eye_color', // Step 9: Choose Eye Color
  10: ['influencer_hair_style', 'influencer_hair_color'], // Step 10: Hair Style & Color
  11: 'influencer_face_shape', // Step 11: Face Shape
  13: 'influencer_freckles', // Step 13: Freckles
  14: 'influencer_scars', // Step 14: Scars
  15: 'influencer_beauty_marks', // Step 15: Beauty Marks
  17: 'influencer_body_type', // Step 17: Body Type
  20: 'influencer_piercings', // Step 20: Piercings
  21: 'influencer_tattoos', // Step 21: Tattoos
  22: 'influencer_ass_size', // Step 22: Ass Size
  23: 'influencer_breast_type', // Step 23: Breast Type
  24: 'influencer_voice', // Step 24: Voice
  26: 'video_content_options', // Step 26: Video Content Options
  27: 'enable_nsfw', // Step 27: NSFW Content
  34: 'email', // Step 34: Payment
};

export const defaultValues = {
  // Basic Attributes
  influencer_type: '',
  influencer_age: 0,
  influencer_ethnicity: '',
  influencer_skin_color: '',
  influencer_eye_color: '',
  influencer_hair_style: '',
  influencer_hair_color: '',
  influencer_face_shape: '',
  influencer_body_type: '',
  influencer_outfit: '',
  influencer_voice: '',

  // Advanced Customization
  influencer_ass_size: '',
  influencer_breast_type: '',

  // Skin Features
  influencer_freckles: '',
  influencer_scars: '',
  influencer_beauty_marks: '',

  // Body Modifications
  influencer_tattoos: '',
  influencer_piercings: '',

  // Video Content Options
  video_content_options: [],
  enable_selfies: false,
  enable_viral_videos: false,
  enable_lipsync: false,
  enable_faceswap: false,

  // NSFW Content
  enable_nsfw: undefined,

  // Creation Method
  creation_method: undefined as 'presets' | 'ai' | 'custom' | undefined,
  upload_own_image: undefined,
  uploaded_image: undefined,

  // AI Flow Fields
  ai_description: '',
  ai_reference_image: undefined,
  ai_generated_config: undefined,

  // Custom Prompts Flow Fields
  custom_appearance_prompt: '',
  custom_identity_prompt: '',
  custom_image_prompt: '',
  custom_advanced_settings: undefined,

  // Email for payment
  email: '',

  // Payment
  productId:
    subscriptions.find((subscription) => subscription.isBestChoice)
      ?.productId || null,

  // AI Influencer Experience
  ai_influencer_experience: '',

  // Use Cases
  use_cases: [],
};

// Use dynamic step count from config
// Steps are defined in features/funnel/config/steps.ts
const STEPS_COUNT = FUNNEL_STEPS.length;
const STEPS_INDICATOR_COUNT = FUNNEL_STEPS.length;
const NSFW_CONTENT_STEP_INDEX = FUNNEL_STEPS.findIndex(
  (step) => step.name === 'NSFW Content'
);
const LIPSYNC_STEP_INDEX = FUNNEL_STEPS.findIndex(
  (step) => step.name === 'Lipsync Feature'
);

export function useFunnelForm() {
  const [active, setActive] = useState(0);
  const [isReady, setIsReady] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const isInitializing = useRef(true);
  const activeStepRef = useRef(0); // Track current step for race condition checks
  const sessionIdRef = useRef<string | null>(null);
  const sessionInitializedRef = useRef(false);

  const form = useForm<FunnelSchema>({
    resolver: zodResolver(funnelV3Schema),
    defaultValues,
    mode: 'onSubmit', // Only validate on submit/trigger, not on change
    reValidateMode: 'onSubmit', // Only re-validate on submit/trigger
    shouldFocusError: false, // Don't auto-focus on validation errors
  });

  // Initialize session on mount
  useEffect(() => {
    if (typeof window === 'undefined' || sessionInitializedRef.current) return;

    const initializeSession = async () => {
      try {
        const sessionId = getOrCreateSessionId();
        sessionIdRef.current = sessionId;

        // Create session in backend API
        await createSession({
          session_id: sessionId,
          current_step: active,
        });

        sessionInitializedRef.current = true;
      } catch (error) {
        console.error('Failed to initialize session:', error);
        // Don't block funnel flow if session creation fails
      }
    };

    initializeSession();
  }, []);

  useEffect(() => {
    try {
      const savedData = getFunnelStore().form;
      const savedStep = getFunnelStore().step;

      if (savedData) form.reset(savedData);
      if (savedStep !== null && savedStep !== undefined) {
        setActive(savedStep);
      }
    } catch {
      form.reset();
      setActive(0);
    } finally {
      setIsReady(true);
      isInitializing.current = false;
    }
  }, [form]);

  // Reset isNavigating when step changes (navigation completed)
  // Update ref for race condition checks
  useEffect(() => {
    if (!isReady || isInitializing.current) return;
    // Reset navigation flag after step change completes
    // When active changes, navigation has completed
    setIsNavigating(false);
    // Update ref for race condition checks
    activeStepRef.current = active;
  }, [active, isReady]);

  // Persist step to store and update session whenever it changes
  useEffect(() => {
    if (!isReady || isInitializing.current) return;

    try {
      const store = getFunnelStore();
      if (store.step !== active) {
        store.setStep(active);
      }

      // Update session step in backend API
      if (sessionIdRef.current) {
        updateSessionStep(sessionIdRef.current, active).catch((error) => {
          console.error('Failed to update session step:', error);
        });
      }
    } catch (error) {
      console.error('Failed to save step to store:', error);
    }
  }, [active, isReady]);

  // Debounced function to save options to backend API
  const debouncedSaveOptions = useDebouncedCallback(
    async (formData: Partial<FunnelSchema>) => {
      if (!sessionIdRef.current) return;

      try {
        // Filter out empty values
        const nonEmptyData: Partial<FunnelSchema> = {};
        Object.entries(formData).forEach(([key, value]) => {
          if (
            value !== null &&
            value !== undefined &&
            value !== '' &&
            !(Array.isArray(value) && value.length === 0) &&
            value !== 0
          ) {
            // Type assertion needed because Object.entries loses type information
            (nonEmptyData as Record<string, unknown>)[key] = value;
          }
        });

        if (Object.keys(nonEmptyData).length > 0) {
          await saveAllOptions(sessionIdRef.current, nonEmptyData);
        }
      } catch (error) {
        console.error('Failed to save options to backend API:', error);
      }
    },
    2500 // 2.5 second debounce
  );

  // Track form field changes and persist to store
  useEffect(() => {
    if (!isReady || isInitializing.current) return;

    try {
      const formData = form.getValues();
      const store = getFunnelStore();
      store.setFormState(formData);

      // Save to backend API (debounced)
      debouncedSaveOptions(formData);

      // Track all form data entries in PostHog
      // Only track non-empty values to reduce noise
      const nonEmptyFields: Record<string, any> = {};
      Object.entries(formData).forEach(([key, value]) => {
        // Only track fields that have meaningful values
        if (
          value !== null &&
          value !== undefined &&
          value !== '' &&
          !(Array.isArray(value) && value.length === 0) &&
          value !== 0
        ) {
          nonEmptyFields[key] = value;
        }
      });

      // Track form data update (debounced to avoid too many events)
      if (Object.keys(nonEmptyFields).length > 0) {
        safePostHogCapture('funnel_form_data_updated', {
          step_index: active,
          step_name: FUNNEL_STEPS[active]?.name || `Step ${active}`,
          form_fields: nonEmptyFields,
          total_fields_filled: Object.keys(nonEmptyFields).length,
        });
      }
    } catch (error) {
      console.error('Failed to save form data to store:', error);
    }
  }, [active, form, isReady, debouncedSaveOptions]);

  const nextStep = () => {
    // Prevent rapid clicks, but add a safety timeout to prevent getting stuck
    if (isNavigating) {
      console.warn('Navigation already in progress, ignoring click');
      // Safety: Reset after 3 seconds if stuck
      setTimeout(() => {
        if (isNavigating) {
          console.warn('Navigation was stuck, resetting isNavigating flag');
          setIsNavigating(false);
        }
      }, 3000);
      return;
    }

    const currentStep = FUNNEL_STEPS[active];
    const currentStepName = currentStep?.name || `Step ${active}`;
    const currentStepType = currentStep?.type || 'unknown';
    const currentStepFormField = currentStep?.formField;

    // Get the field(s) to validate from the step's formField, not from triggers map
    // This ensures each step only validates its own field(s)
    const fieldsToValidate = currentStepFormField
      ? Array.isArray(currentStepFormField)
        ? currentStepFormField
        : [currentStepFormField]
      : [];

    console.log(
      `nextStep called for step ${active} (${currentStepName}), type: ${currentStepType}, formField: ${JSON.stringify(
        fieldsToValidate
      )}`
    );

    // Info steps should NEVER have validation - skip validation entirely
    if (
      currentStepType === 'info' ||
      currentStepType === 'social-proof' ||
      currentStepType === 'loader'
    ) {
      console.log(
        `Skipping validation for ${currentStepType} step: ${currentStepName}`
      );
      setIsNavigating(true); // Set to true to prevent double-clicks
      form.clearErrors();
      setActive((current) => {
        const next = current + 1;
        if (next >= STEPS_COUNT) {
          console.warn(
            `Attempted to go beyond step ${
              STEPS_COUNT - 1
            }, staying at step ${current}`
          );
          setIsNavigating(false); // Reset if can't advance
          return current;
        }
        console.log(
          `Step progression (info step, no validation): ${current} -> ${next}`
        );

        // PostHog tracking - Step completed (with form data)
        const nextStepInfo = FUNNEL_STEPS[next];
        const formData = form.getValues();
        const formDataForTracking: Record<string, any> = {};
        Object.entries(formData).forEach(([key, value]) => {
          if (
            value !== null &&
            value !== undefined &&
            value !== '' &&
            !(Array.isArray(value) && value.length === 0) &&
            value !== 0
          ) {
            formDataForTracking[key] = value;
          }
        });

        safePostHogCapture('funnel_step_completed', {
          step_index: current,
          step_name: currentStepName,
          step_type: currentStepType,
          next_step_index: next,
          next_step_name: nextStepInfo?.name || `Step ${next}`,
          form_data: formDataForTracking,
          total_fields_filled: Object.keys(formDataForTracking).length,
        });

        // PostHog tracking - Step viewed
        safePostHogCapture('funnel_step_viewed', {
          step_index: next,
          step_name: nextStepInfo?.name || `Step ${next}`,
          step_type: nextStepInfo?.type || 'unknown',
          form_data: formDataForTracking,
          total_fields_filled: Object.keys(formDataForTracking).length,
        });

        return next;
      });
      return;
    }

    // Only validate if the step has a formField (input or payment steps)
    if (fieldsToValidate.length > 0) {
      setIsNavigating(true);
      // Only validate the specific field(s) for the current step
      // This ensures we don't re-validate previous steps' fields

      // Double-check: Only validate if we're on an input step (not info/social-proof/loader)
      if (currentStepType !== 'input' && currentStepType !== 'payment') {
        console.warn(
          `Attempted to validate non-input step ${active} (${currentStepName}), type: ${currentStepType}. Skipping validation.`
        );
        // Keep isNavigating true - will be reset by useEffect when step changes
        form.clearErrors();
        setActive((current) => {
          const next = current + 1;
          if (next >= STEPS_COUNT) {
            console.warn(
              `Attempted to go beyond step ${
                STEPS_COUNT - 1
              }, staying at step ${current}`
            );
            setIsNavigating(false); // Reset if can't advance
            return current;
          }
          return next;
        });
        return;
      }

      // CRITICAL: Ensure we only validate the current step's own field(s)
      // fieldsToValidate is already derived from currentStep.formField, so it should match
      // But we add an extra safety check to prevent any cross-step validation
      if (fieldsToValidate.length === 0) {
        console.warn(
          `Step ${active} (${currentStepName}) has no formField to validate. Skipping validation.`
        );
        setIsNavigating(true);
        form.clearErrors();
        setActive((current) => {
          const next = current + 1;
          if (next >= STEPS_COUNT) {
            setIsNavigating(false);
            return current;
          }
          return next;
        });
        return;
      }

      // Clear errors ONLY for the fields we're about to validate
      // This prevents clearing errors from other steps
      fieldsToValidate.forEach((field) => {
        form.clearErrors(field);
      });

      // Store the current step index and fields to prevent race conditions
      const validationStepIndex = active;
      const validationStepName = currentStepName;
      const validationStepType = currentStepType;
      const validationFields = fieldsToValidate; // Store for error tracking

      // Update ref for race condition checks
      activeStepRef.current = active;

      // Only trigger validation for the current step's field(s)
      // form.trigger() with a specific field should only validate that field
      const validationPromise =
        fieldsToValidate.length > 1
          ? Promise.all(
              fieldsToValidate.map((field) => {
                // Validate only this specific field
                return form.trigger(field as any, { shouldFocus: false });
              })
            ).then((results) => results.every((r) => r === true))
          : form.trigger(fieldsToValidate[0] as any, { shouldFocus: false });

      validationPromise
        .then((result) => {
          // Verify we're still on the same step (prevent race conditions)
          // Use ref value instead of closure value to get current state
          if (activeStepRef.current !== validationStepIndex) {
            console.warn(
              `Step changed during validation (was ${validationStepIndex}, now ${activeStepRef.current}), aborting`
            );
            setIsNavigating(false);
            return;
          }

          if (result) {
            // Only clear errors for the fields we just validated
            fieldsToValidate.forEach((field) => {
              form.clearErrors(field);
            });
            setActive((current) => {
              const next = current + 1;
              if (next >= STEPS_COUNT) {
                console.warn(
                  `Attempted to go beyond step ${
                    STEPS_COUNT - 1
                  }, staying at step ${current}`
                );
                setIsNavigating(false); // Reset if can't advance
                return current;
              }
              console.log(`Step progression: ${current} -> ${next}`);

              // PostHog tracking - Step completed (with form data)
              const nextStepInfo = FUNNEL_STEPS[next];
              const formData = form.getValues();
              const formDataForTracking: Record<string, any> = {};
              Object.entries(formData).forEach(([key, value]) => {
                if (
                  value !== null &&
                  value !== undefined &&
                  value !== '' &&
                  !(Array.isArray(value) && value.length === 0) &&
                  value !== 0
                ) {
                  formDataForTracking[key] = value;
                }
              });

              safePostHogCapture('funnel_step_completed', {
                step_index: current,
                step_name: validationStepName,
                step_type: validationStepType,
                next_step_index: next,
                next_step_name: nextStepInfo?.name || `Step ${next}`,
                form_data: formDataForTracking,
                total_fields_filled: Object.keys(formDataForTracking).length,
              });

              // PostHog tracking - Step viewed
              safePostHogCapture('funnel_step_viewed', {
                step_index: next,
                step_name: nextStepInfo?.name || `Step ${next}`,
                step_type: nextStepInfo?.type || 'unknown',
                form_data: formDataForTracking,
                total_fields_filled: Object.keys(formDataForTracking).length,
              });

              return next;
            });
          } else {
            // Use the stored step info to ensure accuracy
            const failedStep = FUNNEL_STEPS[validationStepIndex];
            console.warn(
              `Validation failed for step ${validationStepIndex} (${validationStepName}), type: ${validationStepType}, fields:`,
              validationFields
            );

            // PostHog tracking - Step validation failed
            // Use the stored step info to ensure we log the correct step
            safePostHogCapture('funnel_step_validation_failed', {
              step_index: validationStepIndex,
              step_name:
                failedStep?.name ||
                validationStepName ||
                `Step ${validationStepIndex}`,
              step_type: failedStep?.type || validationStepType || 'unknown',
              trigger_field: Array.isArray(validationFields)
                ? validationFields.join(',')
                : validationFields[0] || '',
            });
            // Show validation errors - they should be visible via formState.errors
            // Reset navigation flag - validation failed, user can try again
            setIsNavigating(false);
          }
        })
        .catch((error) => {
          console.error('Validation error in nextStep:', error);
          setIsNavigating(false);
          // PostHog tracking - Step error
          safePostHogCapture('funnel_step_error', {
            step_index: active,
            step_name: currentStepName,
            step_type: currentStep?.type || 'unknown',
            error_message: error.message || 'Unknown error',
          });
          // Still allow navigation even if validation fails
          // The form will show errors via formState.errors
        });
    } else {
      // No validation required for this step
      setIsNavigating(true); // Set to true to prevent double-clicks
      form.clearErrors();
      setActive((current) => {
        const next = current + 1;
        if (next >= STEPS_COUNT) {
          console.warn(
            `Attempted to go beyond step ${
              STEPS_COUNT - 1
            }, staying at step ${current}`
          );
          setIsNavigating(false); // Reset if can't advance
          return current;
        }
        console.log(`Step progression (no validation): ${current} -> ${next}`);

        // PostHog tracking - Step completed (with form data)
        const nextStepInfo = FUNNEL_STEPS[next];
        const formData = form.getValues();
        const formDataForTracking: Record<string, any> = {};
        Object.entries(formData).forEach(([key, value]) => {
          if (
            value !== null &&
            value !== undefined &&
            value !== '' &&
            !(Array.isArray(value) && value.length === 0) &&
            value !== 0
          ) {
            formDataForTracking[key] = value;
          }
        });

        safePostHogCapture('funnel_step_completed', {
          step_index: current,
          step_name: currentStepName,
          step_type: currentStep?.type || 'unknown',
          next_step_index: next,
          next_step_name: nextStepInfo?.name || `Step ${next}`,
          form_data: formDataForTracking,
          total_fields_filled: Object.keys(formDataForTracking).length,
        });

        // PostHog tracking - Step viewed
        safePostHogCapture('funnel_step_viewed', {
          step_index: next,
          step_name: nextStepInfo?.name || `Step ${next}`,
          step_type: nextStepInfo?.type || 'unknown',
          form_data: formDataForTracking,
          total_fields_filled: Object.keys(formDataForTracking).length,
        });

        return next;
      });
    }
  };

  const prevStep = () => {
    // Reset navigation flag when going back to allow navigation on the previous step
    setIsNavigating(false);

    setActive((current) => {
      if (current <= 0) return current;

      // Default behaviour: go to previous numeric step
      let previous = current - 1;

      // Special routing: If user is on Lipsync step after skipping NSFW preview,
      // take them back to the NSFW decision step directly.
      if (
        current === LIPSYNC_STEP_INDEX &&
        form.getValues('enable_nsfw') === false &&
        NSFW_CONTENT_STEP_INDEX >= 0
      ) {
        previous = NSFW_CONTENT_STEP_INDEX;
      }

      return previous;
    });
  };

  return {
    form,
    stepper: {
      value: active,
      onChange: setActive,
      max: STEPS_INDICATOR_COUNT,
      nextStep,
      prevStep,
    },
    isReady,
  };
}
