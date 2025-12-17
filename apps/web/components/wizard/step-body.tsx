'use client';

import * as React from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { BODY_TYPE_OPTIONS, BREAST_SIZE_OPTIONS } from '@ryla/shared';
import { WizardOptionCard } from './wizard-option-card';

/**
 * Step 4: Body Type
 * Choose body type and breast size (female only)
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
    <div className="flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-white/60 text-sm font-medium mb-2">Body Design</p>
        <h1 className="text-white text-2xl font-bold">Body Type</h1>
      </div>

      {/* Body Type */}
      <div className="w-full mb-5">
        <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <p className="text-white/70 text-sm mb-4">Select Body Type</p>
          <div className="grid grid-cols-2 gap-3">
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
      </div>

      {/* Breast Size (Female only) */}
      {isFemale && (
        <div className="w-full">
          <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
            <p className="text-white/70 text-sm mb-4">Breast Size</p>
            <div className="grid grid-cols-2 gap-2.5">
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
        </div>
      )}
    </div>
  );
}
