'use client';

import * as React from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { ETHNICITY_OPTIONS } from '@ryla/shared';

import { WizardImageCard } from '../WizardImageCard';
import {
  INFLUENCER_AGE_RANGES,
  INFLUENCER_SKIN_COLORS,
} from '../../../constants';
import { getInfluencerImage } from '../../../lib/utils/get-influencer-image';
import { cn } from '@ryla/ui';

/**
 * Step 2: Basic Appearance
 * Combine: Ethnicity + Age Range + Skin Color
 */
export function StepGeneral() {
  const form = useCharacterWizardStore((s) => s.form);
  const setField = useCharacterWizardStore((s) => s.setField);

  // Get ethnicity options filtered by gender
  const ethnicityOptions = ETHNICITY_OPTIONS.filter(
    (opt) => !opt.gender || opt.gender === form.gender || opt.gender === 'all'
  );

  // Get selected age range option
  const selectedAgeRange = INFLUENCER_AGE_RANGES.find(
    (range) => range.value === form.ageRange
  );

  const ageBounds = selectedAgeRange
    ? { min: selectedAgeRange.min, max: selectedAgeRange.max }
    : { min: 18, max: 50 };

  // Ensure age is within bounds when range changes
  React.useEffect(() => {
    if (
      selectedAgeRange &&
      (form.age < ageBounds.min || form.age > ageBounds.max)
    ) {
      setField('age', Math.round((ageBounds.min + ageBounds.max) / 2));
    }
  }, [
    form.ageRange,
    ageBounds.min,
    ageBounds.max,
    form.age,
    setField,
    selectedAgeRange,
  ]);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-white/60 text-sm font-medium mb-2">Appearance</p>
        <h1 className="text-white text-2xl font-bold">Basic Appearance</h1>
      </div>

      <div className="w-full space-y-8">
        {/* Section 1: Ethnicity */}
        <section>
          <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
            <p className="text-white/70 text-sm mb-4 font-medium">Ethnicity</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
              {ethnicityOptions.map((option) => (
                <WizardImageCard
                  key={option.value}
                  image={{
                    src: option.imageSrc || '',
                    alt: option.title,
                    name: option.title,
                  }}
                  selected={form.ethnicity === option.value}
                  onSelect={() => setField('ethnicity', option.value)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Section 2: Age Range */}
        <section>
          <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
            <p className="text-white/70 text-sm mb-4 font-medium">Age Range</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {INFLUENCER_AGE_RANGES.map((option) => {
                const ethnicityAwareImage = form.ethnicity
                  ? getInfluencerImage(
                      'age-ranges',
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
                    selected={form.ageRange === option.value}
                    onSelect={() => {
                      setField('ageRange', option.value);
                      // Set default age to middle of range
                      setField(
                        'age',
                        Math.round((option.min + option.max) / 2)
                      );
                    }}
                    aspectRatio="wide"
                  />
                );
              })}
            </div>

            {/* Age Fine-Tuning Slider */}
            {form.ageRange && (
              <div className="mt-6 pt-6 border-t border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-white/70 text-sm font-medium">
                    Fine-tune Age
                  </p>
                  <p className="text-white text-lg font-semibold">
                    {form.age} years
                  </p>
                </div>
                <div className="relative">
                  <input
                    type="range"
                    min={ageBounds.min}
                    max={ageBounds.max}
                    value={form.age}
                    onChange={(e) =>
                      setField('age', parseInt(e.target.value, 10))
                    }
                    className={cn(
                      'w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer',
                      '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5',
                      '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-br',
                      '[&::-webkit-slider-thumb]:from-purple-500 [&::-webkit-slider-thumb]:to-pink-500',
                      '[&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg',
                      '[&::-webkit-slider-thumb]:shadow-purple-500/40 [&::-webkit-slider-thumb]:border-2',
                      '[&::-webkit-slider-thumb]:border-white',
                      '[&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5',
                      '[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-gradient-to-br',
                      '[&::-moz-range-thumb]:from-purple-500 [&::-moz-range-thumb]:to-pink-500',
                      '[&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:shadow-lg',
                      '[&::-moz-range-thumb]:shadow-purple-500/40 [&::-moz-range-thumb]:border-2',
                      '[&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:border-none'
                    )}
                    style={{
                      background: `linear-gradient(to right, rgb(168, 85, 247) 0%, rgb(168, 85, 247) ${
                        ((form.age - ageBounds.min) /
                          (ageBounds.max - ageBounds.min)) *
                        100
                      }%, rgba(255, 255, 255, 0.1) ${
                        ((form.age - ageBounds.min) /
                          (ageBounds.max - ageBounds.min)) *
                        100
                      }%, rgba(255, 255, 255, 0.1) 100%)`,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-white/50">
                  <span>{ageBounds.min}</span>
                  <span>{ageBounds.max}</span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Section 3: Skin Color */}
        <section>
          <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
            <p className="text-white/70 text-sm mb-4 font-medium">Skin Color</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
              {INFLUENCER_SKIN_COLORS.map((option) => {
                const ethnicityAwareImage = form.ethnicity
                  ? getInfluencerImage(
                      'skin-colors',
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
                    selected={form.skinColor === option.value}
                    onSelect={() => setField('skinColor', option.value)}
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
