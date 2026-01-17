'use client';

import * as React from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { HAIR_STYLE_OPTIONS } from '@ryla/shared';
import { WizardImageCard } from '../WizardImageCard';
import { getInfluencerImage } from '../../../lib/utils/get-influencer-image';

/**
 * Step: Hair Style Selection
 */
export function StepHairStyle() {
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
        <h1 className="text-white text-2xl font-bold">Hair Style</h1>
      </div>

      <div className="w-full">
        <section>
          <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
            <p className="text-white/70 text-sm mb-4 font-medium">Hair Style</p>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
      </div>
    </div>
  );
}
