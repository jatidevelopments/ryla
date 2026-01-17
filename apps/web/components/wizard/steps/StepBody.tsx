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
import { getBodyTypeImage, getAssSizeImage, getBreastSizeImage, getBreastTypeImage } from '../../../lib/utils/get-influencer-image';
import { cn } from '@ryla/ui';

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
          <div
            className={cn(
              'bg-gradient-to-br from-white/8 to-white/4 border rounded-2xl p-5 shadow-lg backdrop-blur-sm transition-all',
              form.bodyType
                ? 'border-purple-400/50'
                : form.assSize || form.breastSize || form.breastType
                  ? 'border-white/5 opacity-30 pointer-events-none cursor-not-allowed'
                  : 'border-white/10'
            )}
          >
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
                    onSelect={() => {
                      setField('bodyType', option.value);
                      // Clear other options in this step
                      setField('assSize', null);
                      setField('breastSize', null);
                      setField('breastType', null);
                    }}
                    aspectRatio="wide"
                  />
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 2: Ass Size */}
        <section>
          <div
            className={cn(
              'bg-gradient-to-br from-white/8 to-white/4 border rounded-2xl p-5 shadow-lg backdrop-blur-sm transition-all',
              form.assSize
                ? 'border-purple-400/50'
                : form.bodyType || form.breastSize || form.breastType
                  ? 'border-white/5 opacity-30 pointer-events-none cursor-not-allowed'
                  : 'border-white/10'
            )}
          >
            <p className="text-white/70 text-sm mb-4 font-medium">Ass Size</p>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {INFLUENCER_ASS_SIZES.map((option) => {
                const assSizeImage = form.ethnicity
                  ? getAssSizeImage(option.value, form.ethnicity)
                  : null;
                return (
                  <WizardImageCard
                    key={option.id}
                    image={{
                      ...option.image,
                      src: assSizeImage || option.image.src,
                    }}
                    selected={form.assSize === option.value}
                    onSelect={() => {
                      setField('assSize', option.value);
                      // Clear other options in this step
                      setField('bodyType', null);
                      setField('breastSize', null);
                      setField('breastType', null);
                    }}
                    aspectRatio="wide"
                  />
                );
              })}
            </div>
          </div>
        </section>

        {/* Section 3: Breast Size (Female only) */}
        {isFemale && (
          <section>
            <div
              className={cn(
                'bg-gradient-to-br from-white/8 to-white/4 border rounded-2xl p-5 shadow-lg backdrop-blur-sm transition-all',
                form.breastSize
                  ? 'border-purple-400/50'
                  : form.bodyType || form.assSize || form.breastType
                    ? 'border-white/5 opacity-30 pointer-events-none cursor-not-allowed'
                    : 'border-white/10'
              )}
            >
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
                      onSelect={() => {
                        setField('breastSize', option.value);
                        // Clear other options in this step
                        setField('bodyType', null);
                        setField('assSize', null);
                        setField('breastType', null);
                      }}
                      aspectRatio="wide"
                    />
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Section 4: Breast Type (Female only) */}
        {isFemale && (
          <section>
            <div
              className={cn(
                'bg-gradient-to-br from-white/8 to-white/4 border rounded-2xl p-5 shadow-lg backdrop-blur-sm transition-all',
                form.breastType
                  ? 'border-purple-400/50'
                  : form.bodyType || form.assSize || form.breastSize
                    ? 'border-white/5 opacity-30 pointer-events-none cursor-not-allowed'
                    : 'border-white/10'
              )}
            >
              <p className="text-white/70 text-sm mb-4 font-medium">
                Breast Type
              </p>
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {INFLUENCER_BREAST_TYPES.map((option) => {
                  const breastTypeImage = form.ethnicity
                    ? getBreastTypeImage(option.value, form.ethnicity)
                    : null;
                  return (
                    <WizardImageCard
                      key={option.id}
                      image={{
                        ...option.image,
                        src: breastTypeImage || option.image.src,
                      }}
                      selected={form.breastType === option.value}
                      onSelect={() => {
                        setField('breastType', option.value);
                        // Clear other options in this step
                        setField('bodyType', null);
                        setField('assSize', null);
                        setField('breastSize', null);
                      }}
                      aspectRatio="wide"
                    />
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
