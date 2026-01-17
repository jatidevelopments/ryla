'use client';

import * as React from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { BODY_TYPE_OPTIONS } from '@ryla/shared';
import { WizardImageCard } from '../WizardImageCard';
import { getBodyTypeImage } from '../../../lib/utils/get-influencer-image';

/**
 * Step: Body Type Selection
 */
export function StepBodyType() {
  const form = useCharacterWizardStore((s) => s.form);
  const setField = useCharacterWizardStore((s) => s.setField);

  // Filter body types by gender
  const filteredBodyTypes = BODY_TYPE_OPTIONS.filter(
    (option) => !option.gender || option.gender === form.gender
  );

  return (
    <div className="flex flex-col items-center w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-white/60 text-sm font-medium mb-2">Body Design</p>
        <h1 className="text-white text-2xl font-bold">Body Type</h1>
      </div>

      <div className="w-full">
        <section>
          <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
            <p className="text-white/70 text-sm mb-4 font-medium">Body Type</p>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBodyTypes.map((option) => {
                const bodyTypeImage = form.ethnicity && form.gender
                  ? getBodyTypeImage(option.value, form.gender, form.ethnicity)
                  : null;
                return (
                  <WizardImageCard
                    key={option.value}
                    image={{
                      src: bodyTypeImage || option.imageSrc || '',
                      alt: option.title,
                      name: option.title,
                    }}
                    selected={form.bodyType === option.value}
                    onSelect={() => setField('bodyType', option.value)}
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
