'use client';

import * as React from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { WizardImageCard } from '../WizardImageCard';
import { INFLUENCER_SKIN_FEATURES } from '../../../constants';
import { getSkinFeatureImage } from '../../../lib/utils/get-influencer-image';
import { cn } from '@ryla/ui';

/**
 * Step 6: Skin Features
 * Combine: Freckles + Scars + Beauty Marks
 */
export function StepSkinFeatures() {
  const form = useCharacterWizardStore((s) => s.form);
  const setField = useCharacterWizardStore((s) => s.setField);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-white/60 text-sm font-medium mb-2">Skin Details</p>
        <h1 className="text-white text-2xl font-bold">Skin Features</h1>
      </div>

      <div className="w-full space-y-8">
        {/* Section 1: Freckles */}
        <section>
          <div
            className={cn(
              'bg-gradient-to-br from-white/8 to-white/4 border rounded-2xl p-5 shadow-lg backdrop-blur-sm transition-all',
              form.freckles
                ? 'border-purple-400/50'
                : form.scars || form.beautyMarks
                  ? 'border-white/5 opacity-30 pointer-events-none cursor-not-allowed'
                  : 'border-white/10'
            )}
          >
            <p className="text-white/70 text-sm mb-4 font-medium">Freckles</p>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {INFLUENCER_SKIN_FEATURES.freckles.map((option) => {
                const featureImage = form.ethnicity
                  ? getSkinFeatureImage('freckles', option.value, form.ethnicity)
                  : null;
                return (
                  <WizardImageCard
                    key={option.id}
                    image={{
                      ...option.image,
                      src: featureImage || option.image.src,
                    }}
                    selected={form.freckles === option.value}
                    onSelect={() => {
                      setField('freckles', option.value);
                      // Clear other options in this step
                      setField('scars', null);
                      setField('beautyMarks', null);
                    }}
                  />
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 2: Scars */}
        <section>
          <div
            className={cn(
              'bg-gradient-to-br from-white/8 to-white/4 border rounded-2xl p-5 shadow-lg backdrop-blur-sm transition-all',
              form.scars
                ? 'border-purple-400/50'
                : form.freckles || form.beautyMarks
                  ? 'border-white/5 opacity-30 pointer-events-none cursor-not-allowed'
                  : 'border-white/10'
            )}
          >
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
                    onSelect={() => {
                      setField('scars', option.value);
                      // Clear other options in this step
                      setField('freckles', null);
                      setField('beautyMarks', null);
                    }}
                  />
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 3: Beauty Marks */}
        <section>
          <div
            className={cn(
              'bg-gradient-to-br from-white/8 to-white/4 border rounded-2xl p-5 shadow-lg backdrop-blur-sm transition-all',
              form.beautyMarks
                ? 'border-purple-400/50'
                : form.freckles || form.scars
                  ? 'border-white/5 opacity-30 pointer-events-none cursor-not-allowed'
                  : 'border-white/10'
            )}
          >
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
                    onSelect={() => {
                      setField('beautyMarks', option.value);
                      // Clear other options in this step
                      setField('freckles', null);
                      setField('scars', null);
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

