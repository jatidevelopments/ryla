'use client';

import * as React from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import {
  HAIR_STYLE_OPTIONS,
  HAIR_COLOR_OPTIONS,
  EYE_COLOR_OPTIONS,
} from '@ryla/shared';
import { WizardOptionCard } from './wizard-option-card';

/**
 * Step 3: Face Design
 * Choose hair style, hair color, and eye color
 */
export function StepFace() {
  const form = useCharacterWizardStore((s) => s.form);
  const setField = useCharacterWizardStore((s) => s.setField);

  // Filter hair styles by gender
  const filteredHairStyles = HAIR_STYLE_OPTIONS.filter(
    (option) => !option.gender || option.gender === form.gender
  );

  return (
    <div className="flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-white/60 text-sm font-medium mb-2">Face Design</p>
        <h1 className="text-white text-2xl font-bold">Hair & Eyes</h1>
      </div>

      {/* Hair Style */}
      <div className="w-full mb-5">
        <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <p className="text-white/70 text-sm mb-4">Hair Style</p>
          <div className="grid grid-cols-3 gap-2.5">
            {filteredHairStyles.map((option) => (
              <WizardOptionCard
                key={option.value}
                label={option.title}
                selected={form.hairStyle === option.value}
                onSelect={() => setField('hairStyle', option.value)}
                size="sm"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Hair Color */}
      <div className="w-full mb-5">
        <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <p className="text-white/70 text-sm mb-4">Hair Color</p>
          <div className="grid grid-cols-4 gap-2.5">
            {HAIR_COLOR_OPTIONS.map((option) => (
              <WizardOptionCard
                key={option.value}
                label={
                  option.value.charAt(0).toUpperCase() + option.value.slice(1)
                }
                selected={form.hairColor === option.value}
                onSelect={() => setField('hairColor', option.value)}
                size="sm"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Eye Color */}
      <div className="w-full">
        <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <p className="text-white/70 text-sm mb-4">Eye Color</p>
          <div className="grid grid-cols-4 gap-2.5">
            {EYE_COLOR_OPTIONS.filter(
              (opt) =>
                !opt.gender ||
                opt.gender === form.gender ||
                opt.gender === 'all'
            ).map((option) => (
              <WizardOptionCard
                key={option.value}
                label={option.title}
                selected={form.eyeColor === option.value}
                onSelect={() => setField('eyeColor', option.value)}
                size="sm"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
