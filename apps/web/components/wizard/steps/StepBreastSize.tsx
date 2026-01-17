'use client';

import * as React from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { BREAST_SIZE_OPTIONS } from '@ryla/shared';
import { WizardImageCard } from '../WizardImageCard';
import { getBreastSizeImage } from '../../../lib/utils/get-influencer-image';

/**
 * Step: Breast Size Selection (Female only)
 */
export function StepBreastSize() {
  const form = useCharacterWizardStore((s) => s.form);
  const setField = useCharacterWizardStore((s) => s.setField);

  const isFemale = form.gender === 'female';

  if (!isFemale) {
    return null;
  }

  return (
    <div className="flex flex-col items-center w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-white/60 text-sm font-medium mb-2">Body Design</p>
        <h1 className="text-white text-2xl font-bold">Breast Size</h1>
      </div>

      <div className="w-full">
        <section>
          <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
            <p className="text-white/70 text-sm mb-4 font-medium">
              Breast Size
            </p>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {BREAST_SIZE_OPTIONS.map((option) => {
                const breastSizeImage = form.ethnicity
                  ? getBreastSizeImage(option.value, form.ethnicity)
                  : null;
                return (
                  <WizardImageCard
                    key={option.value}
                    image={{
                      src: breastSizeImage || option.imageSrc || '',
                      alt: option.title,
                      name: option.title,
                    }}
                    selected={form.breastSize === option.value}
                    onSelect={() => setField('breastSize', option.value)}
                    aspectRatio="wide"
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
