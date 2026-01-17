'use client';

import * as React from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { EYE_COLOR_OPTIONS } from '@ryla/shared';
import { WizardImageCard } from '../WizardImageCard';
import { getInfluencerImage } from '../../../lib/utils/get-influencer-image';

/**
 * Step: Eye Color Selection
 */
export function StepEyeColor() {
  const form = useCharacterWizardStore((s) => s.form);
  const setField = useCharacterWizardStore((s) => s.setField);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-white/60 text-sm font-medium mb-2">Facial Features</p>
        <h1 className="text-white text-2xl font-bold">Eye Color</h1>
      </div>

      <div className="w-full">
        <section>
          <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
            <p className="text-white/70 text-sm mb-4 font-medium">Eye Color</p>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {EYE_COLOR_OPTIONS.filter(
                (opt) =>
                  !opt.gender ||
                  opt.gender === form.gender ||
                  opt.gender === 'all'
              ).map((option) => {
                const ethnicityAwareImage = form.ethnicity
                  ? getInfluencerImage(
                      'eye-colors',
                      form.ethnicity,
                      option.value
                    )
                  : null;
                return (
                  <WizardImageCard
                    key={option.value}
                    image={{
                      src: ethnicityAwareImage || option.imageSrc || '',
                      alt: option.title,
                      name: option.title,
                    }}
                    selected={form.eyeColor === option.value}
                    onSelect={() => setField('eyeColor', option.value)}
                  />
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
