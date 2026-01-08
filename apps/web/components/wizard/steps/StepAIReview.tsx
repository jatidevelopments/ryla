'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useCharacterWizardStore } from '@ryla/business';

/**
 * Step 3 (AI Flow): AI Review & Edit
 * Review AI-generated configuration
 */
export function StepAIReview() {
  const router = useRouter();
  const form = useCharacterWizardStore((s) => s.form);
  const setField = useCharacterWizardStore((s) => s.setField);
  const nextStep = useCharacterWizardStore((s) => s.nextStep);

  const aiGeneratedConfig = form.aiGeneratedConfig as any;

  const handleContinue = () => {
    if (!aiGeneratedConfig) return;

    Object.keys(aiGeneratedConfig).forEach((key) => {
      const formKey = key as keyof typeof form;
      if (formKey && aiGeneratedConfig[key] !== undefined) {
        setField(formKey as any, aiGeneratedConfig[key]);
      }
    });

    nextStep();
    router.push('/wizard/step-4');
  };

  if (!aiGeneratedConfig) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-white/70">No configuration generated yet...</p>
      </div>
    );
  }

  const details = [
    { label: 'Name', value: aiGeneratedConfig.name, icon: '👤' },
    { label: 'Age', value: aiGeneratedConfig.age, icon: '🎂' },
    {
      label: 'Ethnicity',
      value: aiGeneratedConfig.ethnicity?.replace(/-/g, ' '),
      icon: '🌍',
    },
    {
      label: 'Hair',
      value: `${aiGeneratedConfig.hairColor} ${aiGeneratedConfig.hairStyle}`,
      icon: '💇',
    },
    { label: 'Eyes', value: aiGeneratedConfig.eyeColor, icon: '👁️' },
    { label: 'Body', value: aiGeneratedConfig.bodyType, icon: '🏋️' },
    {
      label: 'Archetype',
      value: aiGeneratedConfig.archetype?.replace(/_/g, ' '),
      icon: '✨',
    },
  ].filter((d) => d.value);

  return (
    <div className="flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-white">
            <path
              d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <p className="text-white/60 text-sm font-medium mb-2">AI Generated</p>
        <h1 className="text-white text-2xl font-bold">
          {aiGeneratedConfig.name || 'Your Influencer'}
        </h1>
      </div>

      {/* Traits */}
      {aiGeneratedConfig.personalityTraits?.length > 0 && (
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {aiGeneratedConfig.personalityTraits.map((trait: string) => (
            <span
              key={trait}
              className="rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 px-3 py-1 text-xs text-white/80 capitalize"
            >
              {trait}
            </span>
          ))}
        </div>
      )}

      {/* Details Grid */}
      <div className="w-full mb-5">
        <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <p className="text-white/70 text-sm mb-4">Generated Configuration</p>
          <div className="grid grid-cols-2 gap-4">
            {details.map((item) => (
              <div key={item.label} className="flex items-start gap-2">
                <span className="text-lg">{item.icon}</span>
                <div>
                  <p className="text-white/40 text-xs">{item.label}</p>
                  <p className="text-white text-sm font-medium capitalize">
                    {item.value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bio */}
      {aiGeneratedConfig.bio && (
        <div className="w-full mb-5">
          <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
            <p className="text-white/70 text-sm mb-2">Bio</p>
            <p className="text-white/90 text-sm leading-relaxed">
              {aiGeneratedConfig.bio}
            </p>
          </div>
        </div>
      )}

      {/* Tip */}
      <div className="w-full mb-6">
        <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-xl p-4">
          <p className="text-white/70 text-xs text-center">
            💡 You can fine-tune these settings in the final step
          </p>
        </div>
      </div>

      {/* Continue button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#121214]/90 backdrop-blur-md border-t border-white/5 md:relative md:p-0 md:bg-transparent md:border-none md:mt-0 z-30">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={handleContinue}
            className="w-full h-12 md:h-14 rounded-xl font-bold text-base md:text-lg bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all relative overflow-hidden group active:scale-[0.98]"
          >
            <div className="absolute inset-0 w-[200%] -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 pointer-events-none" />
            <span className="relative z-10">Continue to Generation</span>
          </button>
        </div>
      </div>
      {/* Spacer for fixed button on mobile */}
      <div className="h-20 md:hidden" />
    </div>
  );
}
