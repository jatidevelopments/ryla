import { useForm, useFormContext } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { useSignUp } from '@/hooks/queries/useAuth';
import { toastType, triggerToast } from '@/components/AlertToast';
import { useStepperContext } from '@/components/stepper/Stepper.context';
import { useAuthStore } from '@/store/states/auth';
import { useFunnelStore } from '@/store/states/funnel';

import { FunnelSchema } from '@/features/funnel/hooks/useFunnelForm';

// Note: Removed unused imports - getRandomFromRange, appendPersonalityTraits, appendHobbies
// These were used for fields that don't exist in FunnelSchema
import { getRandomSexPosition } from '@/utils/helpers/getRandomSexPosition';
import { passwordRegex } from '@/utils/helpers/password-regex';
import { SignUpPayload } from '@/utils/types/auth';

import { voicesMap } from '@/constants/voices-map';

// import { analyticsService } from '@/services/analytics-service';
import { trackFacebookLead } from '@ryla/analytics';
import { useUtmStore } from '@/store/states/utm';

const signUpSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(
      passwordRegex,
      'Password must include at least one letter and one number'
    ),
  isAdult: z.literal(true, {
    errorMap: () => ({
      message: 'You must confirm that you are 18 years or older.',
    }),
  }),
  acceptedTerms: z.literal(true, {
    errorMap: () => ({
      message: 'You must accept the Terms of Service and Privacy Policy.',
    }),
  }),
});

type SignUpFormValues = z.infer<typeof signUpSchema>;

export function useSignUpForm(posthog?: any) {
  const { mutate: signUp, isPending, error: apiError } = useSignUp();

  const utm = useUtmStore((state) => state.utm);

  const setUserId = useAuthStore((state) => state.setUserId);
  const setToken = useAuthStore((state) => state.setToken);
  const setStep = useFunnelStore((state) => state.setStep);
  const setFormState = useFunnelStore((state) => state.setFormState);

  const { value: activeStep, nextStep } = useStepperContext();
  const funnelForm = useFormContext<FunnelSchema>();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
      isAdult: undefined,
      acceptedTerms: undefined,
    },
  });

  const onValueReset = (field: 'email' | 'password') => {
    form.resetField(field);
    if (apiError) (apiError as any).message = '';
  };

  const onSubmit = form.handleSubmit((values) => {
    const { productId: _productId, ...funnelFormValues } =
      funnelForm.getValues();

    // Note: These fields don't exist in FunnelSchema - they were part of the XState funnel
    // Using defaults or empty strings for now
    let customCharacterPrompt: string = '';
    const customAge = funnelFormValues.influencer_age || 25;
    // Note: personality_traits, interests, turns_of_you, want_to_try don't exist in FunnelSchema
    const customBreast =
      (funnelFormValues.influencer_breast_type || 'medium') +
      '-' +
      (funnelFormValues.influencer_breast_type || 'natural');
    const customKinks: string[] = [];
    const customSexPosition = getRandomSexPosition();

    const url =
      process.env.NODE_ENV === 'development'
        ? 'https://funnel-adult-v3.fly.dev'
        : window.location.href;

    const payload: SignUpPayload = {
      email: values.email,
      password: values.password,
      utmOnRegistration: utm,
      url: url,
      createCharFunnelOptions: {
        funnelOptions: funnelFormValues,
        dtoAdultFannelV3: {
          character_options: {
            funnel: 'cc_funnel_juicy',
            character: {
              age: customAge,
              sex: 'female',
              body: funnelFormValues.influencer_body_type || 'curvy',
              butt: funnelFormValues.influencer_ass_size || 'medium',
              eyes: funnelFormValues.influencer_eye_color || 'brown',
              kinks: customKinks,
              style: funnelFormValues.influencer_type || 'realistic',
              voice:
                (funnelFormValues.influencer_voice &&
                  voicesMap[
                    funnelFormValues.influencer_voice as keyof typeof voicesMap
                  ]) ||
                voicesMap['seducing'],
              breast: customBreast,
              clothes: '', // Not in FunnelSchema - empty string as default
              greeting: '', // Not in FunnelSchema - empty string as default
              scenario: '', // Not in FunnelSchema - empty string as default
              ethnicity: funnelFormValues.influencer_ethnicity || 'white',
              hair_color: funnelFormValues.influencer_hair_color || 'brown',
              hair_style: funnelFormValues.influencer_hair_style || 'long',
              sex_position: customSexPosition,
              characterPrompt: customCharacterPrompt,
            },
            funnel_step: activeStep,
          },
        },
        isCharacterGenerated: false,
      },
    };

    signUp(payload, {
      onSuccess: (response) => {
        // Facebook Pixel - Lead event
        trackFacebookLead();

        // Google Ads conversions (DISABLED)
        // reportSignUp();
        // reportEmailVerified();

        // GTM / dataLayer event
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: 'cd_signup',
          user_id: String(response.userId),
          email_domain: values.email.split('@')[1] || '',
        });

        // Mixpanel identify + sign up tracking (DISABLED - tracking moved to PostHog)
        // try {
        //     analyticsService.identify(String(response.userId));

        //     let utmOnRegistration: Record<string, any> | undefined;
        //     try {
        //         const stored = localStorage.getItem("utm_params");
        //         if (stored) utmOnRegistration = JSON.parse(stored);
        //     } catch {}

        //     analyticsService.trackSignUpEvent(AnalyticsEventTypeEnum.UNVERIFIED_SIGN_UP, {
        //         distinct_id: String(response.userId),
        //         tid: utmOnRegistration?.deal,
        //         utmOnRegistration,
        //     });
        // } catch (e) {
        //     console.warn("Mixpanel sign up tracking failed", e);
        // }

        // PostHog identify + account created tracking
        try {
          if (typeof window !== 'undefined' && posthog) {
            posthog.identify(String(response.userId), {
              email_domain: values.email.split('@')[1] || '',
            });
            posthog.capture('account_created', {
              user_id: String(response.userId),
              email_domain: values.email.split('@')[1] || '',
            });
          }
        } catch (e) {
          console.warn('PostHog sign up tracking failed', e);
        }

        // TikTok — CompleteRegistration + Identify (fire and forget)
        if (typeof window !== 'undefined') {
          (async () => {
            try {
              const {
                trackTikTokCompleteRegistration,
                identifyTikTok,
                hashSHA256,
              } = await import('@ryla/analytics');
              trackTikTokCompleteRegistration();
              const hashedEmail = await hashSHA256(values.email);
              identifyTikTok({ email: hashedEmail });
            } catch (e) {
              console.warn('TikTok sign up tracking failed', e);
            }
          })();
        }

        setUserId(response.userId);
        setToken(response.authToken);
        setFormState(funnelForm.getValues());
        setStep(activeStep + 1);
        nextStep();
      },
      onError: (error: any) => {
        triggerToast({
          title: error.response?.data?.messages?.[0] || 'Sign up failed',
          type: toastType.error,
        });
      },
    });
  });

  return { form, onSubmit, onValueReset, isPending, apiError };
}
