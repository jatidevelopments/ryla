'use client';

import * as React from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { WizardImageCard } from '../WizardImageCard';
import { INFLUENCER_SKIN_FEATURES } from '../../../constants';
import { getSkinFeatureImage } from '../../../lib/utils/get-influencer-image';

/**
 * Step: Scars Selection
 */
export function StepScars() {
  const form = useCharacterWizardStore((s) => s.form);
  const setField = useCharacterWizardStore((s) => s.setField);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-white/60 text-sm font-medium mb-2">Skin Details</p>
        <h1 className="text-white text-2xl font-bold">Scars</h1>
      </div>

      <div className="w-full">
        <section>
          <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
            <p className="text-white/70 text-sm mb-4 font-medium">Scars</p>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {INFLUENCER_SKIN_FEATURES.scars.map((option) => {
                const featureImage = form.ethnicity
                  ? getSkinFeatureImage('scars', option.value, form.ethnicity)
                  : null;
                return (
                  <WizardImageCard
                    key={option.id}
                    image={{
                      ...option.image,
                      src: featureImage || option.image.src,
                    }}
                    selected={form.scars === option.value}
                    onSelect={() => setField('scars', option.value)}
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
