'use client';

import * as React from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { WizardImageCard } from '../WizardImageCard';
import { INFLUENCER_SKIN_FEATURES } from '../../../constants';
import { getSkinFeatureImage } from '../../../lib/utils/get-influencer-image';

/**
 * Step: Beauty Marks Selection
 */
export function StepBeautyMarks() {
  const form = useCharacterWizardStore((s) => s.form);
  const setField = useCharacterWizardStore((s) => s.setField);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-white/60 text-sm font-medium mb-2">Skin Details</p>
        <h1 className="text-white text-2xl font-bold">Beauty Marks</h1>
      </div>

      <div className="w-full">
        <section>
          <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
            <p className="text-white/70 text-sm mb-4 font-medium">Beauty Marks</p>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {INFLUENCER_SKIN_FEATURES.beautyMarks.map((option) => {
                const featureImage = form.ethnicity
                  ? getSkinFeatureImage('beauty-marks', option.value, form.ethnicity)
                  : null;
                return (
                  <WizardImageCard
                    key={option.id}
                    image={{
                      ...option.image,
                      src: featureImage || option.image.src,
                    }}
                    selected={form.beautyMarks === option.value}
                    onSelect={() => setField('beautyMarks', option.value)}
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
