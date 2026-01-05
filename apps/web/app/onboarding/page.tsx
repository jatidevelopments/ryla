'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ProtectedRoute } from '../../components/protected-route';
import { useAuth } from '../../lib/auth-context';
import { trpc } from '../../lib/trpc';
import { cn, Input } from '@ryla/ui';

type ReferralSource = 'tiktok' | 'reddit' | 'instagram' | 'google' | 'friend' | 'other';
type AiInfluencerExperience = 'never' | 'few' | 'many';

const REFERRAL_OPTIONS: { value: ReferralSource; label: string; gradient: string; icon: React.ReactNode }[] = [
  { 
    value: 'tiktok', 
    label: 'TikTok', 
    gradient: 'from-pink-500 to-rose-500',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z"/>
      </svg>
    ),
  },
  { 
    value: 'reddit', 
    label: 'Reddit', 
    gradient: 'from-orange-500 to-red-500',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
        <path d="M12 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 01-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 01.042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 014.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 01.14-.197.35.35 0 01.238-.042l2.906.617a1.214 1.214 0 011.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 00-.231.094.33.33 0 000 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 00.029-.463.33.33 0 00-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 00-.232-.095z"/>
      </svg>
    ),
  },
  { 
    value: 'instagram', 
    label: 'Instagram', 
    gradient: 'from-purple-500 to-pink-500',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
      </svg>
    ),
  },
  { 
    value: 'google', 
    label: 'Google', 
    gradient: 'from-blue-500 to-cyan-500',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
        <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/>
      </svg>
    ),
  },
  { 
    value: 'friend', 
    label: 'Friend', 
    gradient: 'from-green-500 to-emerald-500',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white">
        <path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  { 
    value: 'other', 
    label: 'Other', 
    gradient: 'from-gray-500 to-slate-600',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white">
        <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

const EXPERIENCE_OPTIONS: { value: AiInfluencerExperience; label: string; description: string; gradient: string; icon: React.ReactNode }[] = [
  { 
    value: 'never', 
    label: "I'm New Here", 
    description: "This is my first time creating AI influencers",
    gradient: 'from-purple-500 to-pink-500',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white">
        <path d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  { 
    value: 'few', 
    label: 'Some Experience', 
    description: "I've created a few AI influencers before",
    gradient: 'from-cyan-500 to-blue-600',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white">
        <path d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  { 
    value: 'many', 
    label: 'Very Experienced', 
    description: "I've created many AI influencers",
    gradient: 'from-amber-500 to-orange-500',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white">
        <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export default function OnboardingPage() {
  return (
    <ProtectedRoute skipOnboardingCheck={true}>
      <OnboardingContent />
    </ProtectedRoute>
  );
}

function OnboardingContent() {
  const router = useRouter();
  const { user } = useAuth();
  const [referralSource, setReferralSource] = useState<ReferralSource | null>(null);
  const [referralSourceOther, setReferralSourceOther] = useState('');
  const [experience, setExperience] = useState<AiInfluencerExperience | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const completeOnboarding = trpc.user.completeOnboarding.useMutation({
    onSuccess: () => {
      router.push('/dashboard');
    },
    onError: (error) => {
      console.error('Failed to complete onboarding:', error);
      setIsSubmitting(false);
    },
  });

  const handleSubmit = async () => {
    if (!referralSource || !experience) {
      return;
    }

    // If "other" is selected, require the text input
    if (referralSource === 'other' && !referralSourceOther.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await completeOnboarding.mutateAsync({
        referralSource,
        aiInfluencerExperience: experience,
        referralSourceOther: referralSource === 'other' ? referralSourceOther.trim() : undefined,
      });
    } catch (error) {
      // Error handled in onError
    }
  };

  const canSubmit = 
    referralSource !== null && 
    experience !== null &&
    (referralSource !== 'other' || referralSourceOther.trim().length > 0);

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
                {REFERRAL_OPTIONS.map((option) => {
                  const isSelected = referralSource === option.value;
                  return (
                    <button
                      key={option.value}
                      onClick={() => setReferralSource(option.value)}
                      className={cn(
                        'w-full p-3 rounded-xl border-2 transition-all duration-200 text-left relative overflow-hidden group',
                        isSelected
                          ? 'border-purple-400/50 bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-lg shadow-purple-500/20'
                          : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                      )}
                    >
                      {/* Shimmer on hover */}
                      <div className="absolute inset-0 w-[200%] -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 pointer-events-none" />

                      <div className="relative z-10 flex items-center gap-3">
                        <div
                          className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md transition-transform duration-200 bg-gradient-to-br',
                            option.gradient,
                            isSelected && 'scale-110'
                          )}
                        >
                          {option.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-bold text-white truncate">
                            {option.label}
                          </h3>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                              <path
                                d="M11.6667 3.5L5.25 9.91667L2.33334 7"
                                stroke="white"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                  })}
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
              {EXPERIENCE_OPTIONS.map((option) => {
                const isSelected = experience === option.value;
                return (
                  <button
                    key={option.value}
                    onClick={() => setExperience(option.value)}
                    className={cn(
                      'w-full p-3 rounded-xl border-2 transition-all duration-200 text-left relative overflow-hidden group',
                      isSelected
                        ? 'border-purple-400/50 bg-gradient-to-br from-purple-500/20 to-pink-500/20 shadow-lg shadow-purple-500/20'
                        : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                    )}
                  >
                    {/* Shimmer on hover */}
                    <div className="absolute inset-0 w-[200%] -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 pointer-events-none" />

                    <div className="relative z-10 flex items-center gap-3">
                      <div
                        className={cn(
                          'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md transition-transform duration-200 bg-gradient-to-br',
                          option.gradient,
                          isSelected && 'scale-110'
                        )}
                      >
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-white">
                          {option.label}
                        </h3>
                        <p className="text-xs text-white/60">
                          {option.description}
                        </p>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                            <path
                              d="M11.6667 3.5L5.25 9.91667L2.33334 7"
                              stroke="white"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Continue Button - Same as wizard */}
          <div className="mt-5 pb-4">
            <button
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              className={cn(
                'w-full h-11 rounded-xl font-bold text-sm transition-all duration-200 relative overflow-hidden',
                canSubmit && !isSubmitting
                  ? 'bg-gradient-to-r from-[#c4b5fd] to-[#7c3aed] text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40'
                  : 'bg-white/10 text-white/40 cursor-not-allowed'
              )}
            >
              {/* Shimmer effect */}
              {canSubmit && !isSubmitting && (
                <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
              )}
              <span className="relative z-10 flex items-center justify-center gap-2">
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4 text-white"
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
                    Getting Started...
                  </>
                ) : (
                  'Continue'
                )}
              </span>
            </button>
            
            {/* Progress dots */}
            <div className="flex justify-center gap-1.5 mt-2">
              <div className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                referralSource ? 'w-1.5 bg-[#7c3aed]' : 'w-6 bg-white'
              )} />
              <div className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                experience ? 'w-1.5 bg-[#7c3aed]' : referralSource ? 'w-6 bg-white' : 'w-1.5 bg-white/20'
              )} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
