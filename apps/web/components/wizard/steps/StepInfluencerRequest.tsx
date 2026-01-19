'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCharacterWizardStore } from '@ryla/business';
import { Textarea, cn } from '@ryla/ui';
import { trpc } from '../../../lib/trpc';
import { routes, buildRoute } from '@/lib/routes';

/**
 * Step 1 (Existing Person Flow): Influencer Request
 * User submits a request to create an AI influencer from an existing person
 * with consent, social media links, and description
 */
export function StepInfluencerRequest() {
  const router = useRouter();
  const form = useCharacterWizardStore((s) => s.form);
  const setField = useCharacterWizardStore((s) => s.setField);
  const resetForm = useCharacterWizardStore((s) => s.resetForm);
  const [error, setError] = React.useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const submitRequestMutation =
    trpc.character.submitInfluencerRequest.useMutation({
      onSuccess: () => {
        // Reset form and redirect back to step-0 with success message
        resetForm();
        router.push(
          buildRoute(routes.wizard.step0, { 'request-submitted': 'true' })
        );
      },
      onError: (err) => {
        setError(err.message || 'Failed to submit request. Please try again.');
        setIsSubmitting(false);
      },
    });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate consent
    if (!form.influencerRequestConsent) {
      setError('You must provide consent to proceed.');
      return;
    }

    setIsSubmitting(true);

    try {
      await submitRequestMutation.mutateAsync({
        consent: form.influencerRequestConsent,
        instagram: form.influencerRequestInstagram || undefined,
        tiktok: form.influencerRequestTikTok || undefined,
        description: form.influencerRequestDescription || undefined,
      });
    } catch (_err) {
      // Error handled in onError
    }
  };

  const canSubmit = form.influencerRequestConsent === true;

  return (
    <div className="flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white">
            <path
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="text-white/60 text-sm font-medium mb-2">
          Influencer Request
        </p>
        <h1 className="text-white text-2xl font-bold">
          Request to Create from Existing Person
        </h1>
        <p className="text-white/50 text-sm mt-2 max-w-md">
          Submit a request to create an AI influencer based on an existing
          person. We'll review your request and get back to you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full space-y-6">
        {/* Consent Section */}
        <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
          <h3 className="text-white font-semibold mb-4">Consent & Rights</h3>
          <p className="text-white/60 text-sm mb-4">
            To comply with our terms and legal requirements, you must confirm
            that you have the necessary rights and consent to create an AI
            influencer based on this person.
          </p>

          <label
            htmlFor="consent"
            className="flex items-start gap-3 cursor-pointer group"
          >
            <div className="relative mt-0.5 flex-shrink-0">
              <input
                id="consent"
                type="checkbox"
                checked={form.influencerRequestConsent === true}
                onChange={(e) =>
                  setField('influencerRequestConsent', e.target.checked)
                }
                className="sr-only"
              />
              <div
                className={cn(
                  'w-5 h-5 rounded-md border-2 transition-all duration-200',
                  'flex items-center justify-center',
                  form.influencerRequestConsent === true
                    ? 'bg-purple-500 border-purple-500'
                    : 'border-white/20 group-hover:border-white/40'
                )}
              >
                {form.influencerRequestConsent === true && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="w-3.5 h-3.5 text-white"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-sm text-white/70 leading-relaxed flex-1">
              I confirm that I have obtained the necessary consent and rights
              from the person (or their legal representative) to create an AI
              influencer based on their likeness. I understand that this request
              must comply with our{' '}
              <Link
                href="/terms"
                target="_blank"
                className="text-purple-400 hover:text-purple-300 transition-colors underline"
              >
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link
                href="/privacy"
                target="_blank"
                className="text-purple-400 hover:text-purple-300 transition-colors underline"
              >
                Privacy Policy
              </Link>
              . <span className="text-pink-400">*</span>
            </span>
          </label>
        </div>

        {/* Social Media Links */}
        <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
          <h3 className="text-white font-semibold mb-4">
            Social Media Links (Optional)
          </h3>
          <p className="text-white/50 text-sm mb-4">
            Provide social media accounts to help us identify the person you're
            requesting.
          </p>

          <div className="space-y-4">
            {/* Instagram */}
            <div>
              <label
                htmlFor="instagram"
                className="block text-white/70 text-sm mb-2"
              >
                Instagram Handle
              </label>
              <input
                id="instagram"
                type="text"
                value={form.influencerRequestInstagram || ''}
                onChange={(e) =>
                  setField('influencerRequestInstagram', e.target.value)
                }
                placeholder="@username"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
              />
            </div>

            {/* TikTok */}
            <div>
              <label
                htmlFor="tiktok"
                className="block text-white/70 text-sm mb-2"
              >
                TikTok Handle
              </label>
              <input
                id="tiktok"
                type="text"
                value={form.influencerRequestTikTok || ''}
                onChange={(e) =>
                  setField('influencerRequestTikTok', e.target.value)
                }
                placeholder="@username"
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-6 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between mb-3">
            <label
              htmlFor="description"
              className="text-white/70 text-sm font-medium"
            >
              Description (Optional)
            </label>
            <span className="text-xs text-white/40 bg-white/5 px-2 py-1 rounded-full">
              {(form.influencerRequestDescription || '').length}/500
            </span>
          </div>
          <Textarea
            id="description"
            value={form.influencerRequestDescription || ''}
            onChange={(e) =>
              setField('influencerRequestDescription', e.target.value)
            }
            placeholder="Provide any additional details about the person you'd like to create an AI influencer from..."
            className="min-h-[120px] bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl resize-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20"
            maxLength={500}
          />
          <p className="text-white/40 text-xs mt-3">
            💡 Include any relevant information that would help us process your
            request.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#121214]/90 backdrop-blur-md border-t border-white/5 md:relative md:p-0 md:bg-transparent md:border-none z-30">
          <div className="max-w-2xl mx-auto">
            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className={cn(
                'w-full h-12 md:h-14 rounded-xl font-bold text-base md:text-lg transition-all duration-200',
                'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/30',
                'disabled:bg-white/10 disabled:text-white/40 disabled:cursor-not-allowed disabled:shadow-none',
                'flex items-center justify-center gap-2 active:scale-[0.98]'
              )}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Submitting Request...</span>
                </>
              ) : (
                <span>Submit Request</span>
              )}
            </button>
          </div>
        </div>
        {/* Spacer for fixed button on mobile */}
        <div className="h-20 md:hidden" />

        {/* Helper Text */}
        <p className="text-white/40 text-xs text-center">
          We'll review your request and contact you via email once it's been
          processed.
        </p>
      </form>
    </div>
  );
}
