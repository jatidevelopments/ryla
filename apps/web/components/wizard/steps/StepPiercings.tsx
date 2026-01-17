'use client';

import * as React from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { WizardImageCard } from '../WizardImageCard';
import { INFLUENCER_PIERCINGS } from '../../../constants';
import { getPiercingImage } from '../../../lib/utils/get-influencer-image';

/**
 * Step: Piercings Selection
 */
export function StepPiercings() {
  const form = useCharacterWizardStore((s) => s.form);
  const setField = useCharacterWizardStore((s) => s.setField);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-white/60 text-sm font-medium mb-2">Body Modifications</p>
        <h1 className="text-white text-2xl font-bold">Piercings</h1>
      </div>

      <div className="w-full">
        <section>
          <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
            <p className="text-white/70 text-sm mb-4 font-medium">Piercings</p>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {INFLUENCER_PIERCINGS.map((option) => {
                const piercingImage = form.ethnicity
                  ? getPiercingImage(option.value, form.ethnicity)
                  : null;
                return (
                  <WizardImageCard
                    key={option.id}
                    image={{
                      ...option.image,
                      src: piercingImage || option.image.src,
                    }}
                    selected={form.piercings === option.value}
                    onSelect={() => setField('piercings', option.value)}
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
