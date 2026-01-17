'use client';

import * as React from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { WizardImageCard } from '../WizardImageCard';
import { INFLUENCER_FACE_SHAPES } from '../../../constants';
import { getInfluencerImage } from '../../../lib/utils/get-influencer-image';

/**
 * Step: Face Shape Selection
 */
export function StepFaceShape() {
  const form = useCharacterWizardStore((s) => s.form);
  const setField = useCharacterWizardStore((s) => s.setField);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-white/60 text-sm font-medium mb-2">Facial Features</p>
        <h1 className="text-white text-2xl font-bold">Face Shape</h1>
      </div>

      <div className="w-full">
        <section>
          <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
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
                    onSelect={() => setField('faceShape', option.value)}
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
