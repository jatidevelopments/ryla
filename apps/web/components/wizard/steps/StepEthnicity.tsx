'use client';

import * as React from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { ETHNICITY_OPTIONS } from '@ryla/shared';

import { WizardImageCard } from '../WizardImageCard';
import { getEthnicityImage } from '../../../lib/utils/get-influencer-image';

/**
 * Step: Ethnicity Selection
 */
export function StepEthnicity() {
  const form = useCharacterWizardStore((s) => s.form);
  const setField = useCharacterWizardStore((s) => s.setField);

  // Get ethnicity options filtered by gender
  const ethnicityOptions = ETHNICITY_OPTIONS.filter(
    (opt) => !opt.gender || opt.gender === form.gender || opt.gender === 'all'
  );

  return (
    <div className="flex flex-col items-center w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-white/60 text-sm font-medium mb-2">Appearance</p>
        <h1 className="text-white text-2xl font-bold">Ethnicity</h1>
      </div>

      <div className="w-full">
        <section>
          <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
            <p className="text-white/70 text-sm mb-4 font-medium">Ethnicity</p>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ethnicityOptions.map((option) => {
                const ethnicityImage = form.gender
                  ? getEthnicityImage(option.value, form.gender, 'portrait')
                  : null;
                return (
                  <WizardImageCard
                    key={option.value}
                    image={{
                      src: ethnicityImage || option.imageSrc || '',
                      alt: option.title,
                      name: option.title,
                    }}
                    selected={form.ethnicity === option.value}
                    onSelect={() => setField('ethnicity', option.value)}
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
