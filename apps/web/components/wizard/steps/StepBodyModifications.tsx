'use client';

import * as React from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { WizardImageCard } from '../WizardImageCard';
import {
  INFLUENCER_PIERCINGS,
  INFLUENCER_TATTOOS,
} from '../../../constants';
import { getPiercingImage, getTattooImage } from '../../../lib/utils/get-influencer-image';
import { cn } from '@ryla/ui';

/**
 * Step 7: Body Modifications
 * Combine: Piercings + Tattoos
 */
export function StepBodyModifications() {
  const form = useCharacterWizardStore((s) => s.form);
  const setField = useCharacterWizardStore((s) => s.setField);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-white/60 text-sm font-medium mb-2">Body Modifications</p>
        <h1 className="text-white text-2xl font-bold">Piercings & Tattoos</h1>
      </div>

      <div className="w-full space-y-8">
        {/* Section 1: Piercings */}
        <section>
          <div
            className={cn(
              'bg-gradient-to-br from-white/8 to-white/4 border rounded-2xl p-5 shadow-lg backdrop-blur-sm transition-all',
              form.piercings
                ? 'border-purple-400/50'
                : form.tattoos
                  ? 'border-white/5 opacity-30 pointer-events-none cursor-not-allowed'
                  : 'border-white/10'
            )}
          >
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
                    onSelect={() => {
                      setField('piercings', option.value);
                      // Clear other options in this step
                      setField('tattoos', null);
                    }}
                  />
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 2: Tattoos */}
        <section>
          <div
            className={cn(
              'bg-gradient-to-br from-white/8 to-white/4 border rounded-2xl p-5 shadow-lg backdrop-blur-sm transition-all',
              form.tattoos
                ? 'border-purple-400/50'
                : form.piercings
                  ? 'border-white/5 opacity-30 pointer-events-none cursor-not-allowed'
                  : 'border-white/10'
            )}
          >
            <p className="text-white/70 text-sm mb-4 font-medium">Tattoos</p>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {INFLUENCER_TATTOOS.map((option) => {
                const tattooImage = form.ethnicity
                  ? getTattooImage(option.value, form.ethnicity)
                  : null;
                return (
                  <WizardImageCard
                    key={option.id}
                    image={{
                      ...option.image,
                      src: tattooImage || option.image.src,
                    }}
                    selected={form.tattoos === option.value}
                    onSelect={() => {
                      setField('tattoos', option.value);
                      // Clear other options in this step
                      setField('piercings', null);
                    }}
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

