'use client';

import * as React from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { HAIR_STYLE_OPTIONS, HAIR_COLOR_OPTIONS } from '@ryla/shared';

import { WizardImageCard } from '../WizardImageCard';
import { getInfluencerImage } from '../../../lib/utils/get-influencer-image';

/**
 * Step 4: Hair
 * Combine: Hair Style + Hair Color
 */
export function StepHair() {
  const form = useCharacterWizardStore((s) => s.form);
  const setField = useCharacterWizardStore((s) => s.setField);

  // Filter hair styles by gender
  const filteredHairStyles = HAIR_STYLE_OPTIONS.filter(
    (option) => !option.gender || option.gender === form.gender
  );

  return (
    <div className="flex flex-col items-center w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-white/60 text-sm font-medium mb-2">Hair</p>
        <h1 className="text-white text-2xl font-bold">Hair Style & Color</h1>
      </div>

      <div className="w-full space-y-8">
        {/* Section 1: Hair Style */}
        <section>
          <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
            <p className="text-white/70 text-sm mb-4 font-medium">Hair Style</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {filteredHairStyles.map((option) => {
                const ethnicityAwareImage = form.ethnicity
                  ? getInfluencerImage(
                      'hair-styles',
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
                    selected={form.hairStyle === option.value}
                    onSelect={() => setField('hairStyle', option.value)}
                  />
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 2: Hair Color */}
        <section>
          <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
            <p className="text-white/70 text-sm mb-4 font-medium">Hair Color</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {HAIR_COLOR_OPTIONS.map((option) => {
                const ethnicityAwareImage = form.ethnicity
                  ? getInfluencerImage(
                      'hair-colors',
                      form.ethnicity,
                      option.value
                    )
                  : null;
                return (
                  <WizardImageCard
                    key={option.value}
                    image={{
                      src: ethnicityAwareImage || option.imageSrc || '',
                      alt:
                        option.value.charAt(0).toUpperCase() +
                        option.value.slice(1),
                      name:
                        option.value.charAt(0).toUpperCase() +
                        option.value.slice(1),
                    }}
                    selected={form.hairColor === option.value}
                    onSelect={() => setField('hairColor', option.value)}
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
