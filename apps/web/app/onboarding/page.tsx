'use client';

import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { useAuth } from '../../lib/auth-context';
import { Input } from '@ryla/ui';
import { REFERRAL_OPTIONS, EXPERIENCE_OPTIONS } from './constants';
import { useOnboardingForm } from './hooks/useOnboardingForm';
import { OptionCard, ProgressDots, SubmitButton } from './components';

export default function OnboardingPage() {
  return (
    <ProtectedRoute skipOnboardingCheck={true}>
      <OnboardingContent />
    </ProtectedRoute>
  );
}

function OnboardingContent() {
  const { user } = useAuth();
  const {
    referralSource,
    setReferralSource,
    referralSourceOther,
    setReferralSourceOther,
    experience,
    setExperience,
    isSubmitting,
    canSubmit,
    handleSubmit,
  } = useOnboardingForm();

  return (
    <div className="flex flex-col min-h-screen bg-[#121214]">
      {/* Wizard-style Header */}
      <div className="sticky top-0 z-40 bg-[#121214]/95 backdrop-blur-sm border-b border-white/5">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-center px-4">
          <span className="text-sm font-medium text-white/90">
            Welcome to RYLA
          </span>
        </div>
      </div>

      {/* Content - Same layout as wizard steps */}
      <div className="flex-1 flex flex-col">
        <div className="mx-auto w-full max-w-2xl flex-1 flex flex-col px-4 py-4">
          {/* Wizard-style content */}
          <div className="flex flex-col items-center">
            {/* Header */}
            <div className="text-center mb-5">
              <p className="text-white/60 text-xs font-medium mb-1">Get Started</p>
              <h1 className="text-white text-3xl font-bold">
                Welcome{user ? `, ${user.name.split(' ')[0]}` : ''}!
              </h1>
              <p className="text-white/50 text-sm mt-1">
                Help us personalize your experience
              </p>
            </div>

            {/* Question 1: Where did you hear about us? */}
            <div className="w-full mb-4">
              <p className="text-white text-base font-semibold mb-3 px-1">Where did you hear about us?</p>
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
                  <Input
                    type="text"
                    value={referralSourceOther}
                    onChange={(e) => setReferralSourceOther(e.target.value)}
                    placeholder="Please specify where you heard about us..."
                    className="w-full h-11 rounded-xl border-2 border-white/10 bg-white/5 placeholder-white/40 focus:border-purple-400/50 focus:bg-white/10"
                    autoFocus
                  />
                  {referralSourceOther.trim().length === 0 && (
                    <p className="text-xs text-red-400 mt-1.5 px-1">
                      This field is required
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Question 2: AI Influencer Experience */}
            <div className="w-full space-y-2">
              <p className="text-white text-base font-semibold mb-3 px-1">Have you created AI influencers before?</p>
              {EXPERIENCE_OPTIONS.map((option) => (
                <OptionCard
                  key={option.value}
                  option={option}
                  selected={experience === option.value}
                  onClick={() => setExperience(option.value)}
                  showDescription
                />
              ))}
            </div>
          </div>

          {/* Continue Button - Same as wizard */}
          <div className="mt-5 pb-4">
            <SubmitButton
              canSubmit={canSubmit}
              isSubmitting={isSubmitting}
              onSubmit={handleSubmit}
            />
            <ProgressDots
              step1Complete={!!referralSource}
              step2Complete={!!experience}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
