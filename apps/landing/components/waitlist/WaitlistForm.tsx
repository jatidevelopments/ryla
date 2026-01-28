'use client';

import { REFERRAL_OPTIONS, EXPERIENCE_OPTIONS } from './constants';
import { OptionCard, SubmitButton, ProgressDots } from './index';
import { useWaitlistForm } from './useWaitlistForm';

export function WaitlistForm() {
  const {
    step,
    email,
    setEmail,
    referralSource,
    setReferralSource,
    referralSourceOther,
    setReferralSourceOther,
    experience,
    setExperience,
    customMessage,
    setCustomMessage,
    isSubmitting,
    isSuccess,
    error,
    canProceed,
    handleNext,
    handleSubmit,
  } = useWaitlistForm();

  if (isSuccess) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 6L9 17l-5-5"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            You're on the list! 🎉
          </h2>
          <p className="text-white/60 text-sm">
            We'll notify you as soon as RYLA is ready. Thanks for your interest!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-white/60 text-xs font-medium mb-1">
          Join the Waitlist
        </p>
        <h1 className="text-white text-3xl font-bold mb-2">Get Early Access</h1>
        <p className="text-white/50 text-sm">
          Be among the first to create your AI influencer
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Step 1: Email */}
      {step === 1 && (
        <div className="w-full mb-4">
          <p className="text-white text-base font-semibold mb-3 px-1">
            What's your email?
          </p>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) {
                // Clear error when user starts typing
                // Note: We can't directly set error here, but the validation will handle it
              }
            }}
            placeholder="you@example.com"
            className="w-full h-11 rounded-xl border-2 border-white/10 bg-white/5 placeholder-white/40 focus:border-purple-400/50 focus:bg-white/10 text-white px-4 text-sm transition-all"
            autoFocus
          />
        </div>
      )}

      {/* Step 2: Where did you hear about us? */}
      {step === 2 && (
        <div className="w-full mb-4">
          <p className="text-white text-base font-semibold mb-3 px-1">
            Where did you hear about us?
          </p>
          <div className="grid grid-cols-2 gap-2">
            {REFERRAL_OPTIONS.map((option) => (
              <OptionCard
                key={option.value}
                option={option}
                selected={referralSource === option.value}
                onClick={() => setReferralSource(option.value)}
              />
            ))}
          </div>

          {/* Other text input - shown when "other" is selected */}
          {referralSource === 'other' && (
            <div className="mt-3">
              <input
                type="text"
                value={referralSourceOther}
                onChange={(e) => setReferralSourceOther(e.target.value)}
                placeholder="Please specify where you heard about us..."
                className="w-full h-11 rounded-xl border-2 border-white/10 bg-white/5 placeholder-white/40 focus:border-purple-400/50 focus:bg-white/10 text-white px-4 text-sm transition-all"
                autoFocus
              />
            </div>
          )}
        </div>
      )}

      {/* Step 3: Experience and custom message */}
      {step === 3 && (
        <div className="w-full space-y-4">
          <div>
            <p className="text-white text-base font-semibold mb-3 px-1">
              Have you created AI influencers before?
            </p>
            {EXPERIENCE_OPTIONS.map((option) => (
              <div key={option.value} className="mb-2">
                <OptionCard
                  option={option}
                  selected={experience === option.value}
                  onClick={() => setExperience(option.value)}
                  showDescription
                />
              </div>
            ))}
          </div>

          <div>
            <p className="text-white text-base font-semibold mb-3 px-1">
              Anything else you'd like to tell us? (Optional)
            </p>
            <textarea
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              placeholder="Share your thoughts, questions, or what you're most excited about..."
              rows={4}
              className="w-full rounded-xl border-2 border-white/10 bg-white/5 placeholder-white/40 focus:border-purple-400/50 focus:bg-white/10 text-white px-4 py-3 text-sm transition-all resize-none"
            />
          </div>
        </div>
      )}

      {/* Continue/Submit Button */}
      <div className="mt-5 pb-4">
        <SubmitButton
          canSubmit={canProceed}
          isSubmitting={isSubmitting}
          onSubmit={step === 3 ? handleSubmit : handleNext}
          label={step === 3 ? 'Join Waitlist' : 'Continue'}
          submittingLabel={step === 3 ? 'Joining Waitlist...' : 'Loading...'}
        />
        <ProgressDots
          currentStep={step}
          step1Complete={step > 1}
          step2Complete={step > 2}
          step3Complete={isSuccess}
        />
      </div>
    </div>
  );
}
