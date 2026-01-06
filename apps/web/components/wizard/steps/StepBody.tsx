'use client';

import * as React from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { BODY_TYPE_OPTIONS, BREAST_SIZE_OPTIONS } from '@ryla/shared';
import { WizardOptionCard } from '../WizardOptionCard';
import { WizardImageCard } from '../WizardImageCard';
import {
  INFLUENCER_ASS_SIZES,
  INFLUENCER_BREAST_TYPES,
} from '../../../constants';

/**
 * Step 5: Body Type
 * Combine: Body Type + Ass Size + Breast Size + Breast Type
 */
export function StepBody() {
  const form = useCharacterWizardStore((s) => s.form);
  const setField = useCharacterWizardStore((s) => s.setField);

  const isFemale = form.gender === 'female';

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

      <div className="w-full space-y-8">
        {/* Section 1: Body Type */}
        <section>
          <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
            <p className="text-white/70 text-sm mb-4 font-medium">Body Type</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {filteredBodyTypes.map((option) => (
                <WizardOptionCard
                  key={option.value}
                  label={option.title}
                  selected={form.bodyType === option.value}
                  onSelect={() => setField('bodyType', option.value)}
                  size="md"
                />
              ))}
            </div>
          </div>
        </section>

        {/* Section 2: Ass Size */}
        <section>
          <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
            <p className="text-white/70 text-sm mb-4 font-medium">Ass Size</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {INFLUENCER_ASS_SIZES.map((option) => (
                <WizardImageCard
                  key={option.id}
                  image={option.image}
                  selected={form.assSize === option.value}
                  onSelect={() => setField('assSize', option.value)}
                  aspectRatio="wide"
                />
              ))}
            </div>
          </div>
        </section>

        {/* Section 3: Breast Size (Female only) */}
        {isFemale && (
          <section>
            <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
              <p className="text-white/70 text-sm mb-4 font-medium">Breast Size</p>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
                {BREAST_SIZE_OPTIONS.map((option) => (
                  <WizardOptionCard
                    key={option.value}
                    label={option.title}
                    selected={form.breastSize === option.value}
                    onSelect={() => setField('breastSize', option.value)}
                    size="sm"
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Section 4: Breast Type (Female only) */}
        {isFemale && (
          <section>
            <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
              <p className="text-white/70 text-sm mb-4 font-medium">Breast Type</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {INFLUENCER_BREAST_TYPES.map((option) => (
                  <WizardImageCard
                    key={option.id}
                    image={option.image}
                    selected={form.breastType === option.value}
                    onSelect={() => setField('breastType', option.value)}
                    aspectRatio="wide"
                  />
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
