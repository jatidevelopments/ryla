'use client';

import * as React from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { EYE_COLOR_OPTIONS } from '@ryla/shared';
import { WizardImageCard } from '../WizardImageCard';
import { INFLUENCER_FACE_SHAPES } from '../../../constants';
import { getInfluencerImage } from '../../../lib/utils/get-influencer-image';
import { cn } from '@ryla/ui';

/**
 * Step 3: Facial Features
 * Combine: Eye Color + Face Shape
 */
export function StepFace() {
  const form = useCharacterWizardStore((s) => s.form);
  const setField = useCharacterWizardStore((s) => s.setField);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-white/60 text-sm font-medium mb-2">
          Facial Features
        </p>
        <h1 className="text-white text-2xl font-bold">Eyes & Face Shape</h1>
      </div>

      <div className="w-full space-y-8">
        {/* Section 1: Eye Color */}
        <section>
          <div
            className={cn(
              'bg-gradient-to-br from-white/8 to-white/4 border rounded-2xl p-5 shadow-lg backdrop-blur-sm transition-all',
              form.eyeColor
                ? 'border-purple-400/50'
                : form.faceShape
                  ? 'border-white/5 opacity-30 pointer-events-none cursor-not-allowed'
                  : 'border-white/10'
            )}
          >
            <p className="text-white/70 text-sm mb-4 font-medium">Eye Color</p>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {EYE_COLOR_OPTIONS.filter(
                (opt) =>
                  !opt.gender ||
                  opt.gender === form.gender ||
                  opt.gender === 'all'
              ).map((option) => {
                const ethnicityAwareImage = form.ethnicity
                  ? getInfluencerImage(
                      'eye-colors',
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
                    selected={form.eyeColor === option.value}
                    onSelect={() => {
                      setField('eyeColor', option.value);
                      // Clear other options in this step
                      setField('faceShape', null);
                    }}
                  />
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 2: Face Shape */}
        <section>
          <div
            className={cn(
              'bg-gradient-to-br from-white/8 to-white/4 border rounded-2xl p-5 shadow-lg backdrop-blur-sm transition-all',
              form.faceShape
                ? 'border-purple-400/50'
                : form.eyeColor
                  ? 'border-white/5 opacity-30 pointer-events-none cursor-not-allowed'
                  : 'border-white/10'
            )}
          >
            <p className="text-white/70 text-sm mb-4 font-medium">Face Shape</p>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {INFLUENCER_FACE_SHAPES.map((option) => {
                const ethnicityAwareImage = form.ethnicity
                  ? getInfluencerImage(
                      'face-shapes',
                      form.ethnicity,
                      option.value
                    )
                  : null;
                return (
                  <WizardImageCard
                    key={option.id}
                    image={{
                      ...option.image,
                      src: ethnicityAwareImage || option.image.src,
                    }}
                    selected={form.faceShape === option.value}
                    onSelect={() => {
                      setField('faceShape', option.value);
                      // Clear other options in this step
                      setField('eyeColor', null);
                    }}
                    aspectRatio="square"
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
