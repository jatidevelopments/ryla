'use client';

import * as React from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { Slider, cn } from '@ryla/ui';
import { ETHNICITY_OPTIONS } from '@ryla/shared';
import { WizardOptionCard } from './wizard-option-card';

/**
 * Step 2: General Settings
 * Choose ethnicity and age
 */
export function StepGeneral() {
  const form = useCharacterWizardStore((s) => s.form);
  const setField = useCharacterWizardStore((s) => s.setField);

  return (
    <div className="flex flex-col items-center">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-white/60 text-sm font-medium mb-2">Appearance</p>
        <h1 className="text-white text-2xl font-bold">Ethnicity & Age</h1>
      </div>

      {/* Ethnicity Selection */}
      <div className="w-full mb-6">
        <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <p className="text-white/70 text-sm mb-4">Select Ethnicity</p>
          <div className="grid grid-cols-3 gap-2.5">
            {ETHNICITY_OPTIONS.filter(
              (opt) =>
                !opt.gender ||
                opt.gender === form.gender ||
                opt.gender === 'all'
            ).map((option) => (
              <WizardOptionCard
                key={option.value}
                label={option.title}
                selected={form.ethnicity === option.value}
                onSelect={() => setField('ethnicity', option.value)}
                size="sm"
              />
            ))}
          </div>
        </div>
      </div>

      {/* Age Selection */}
      <div className="w-full">
        <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-white/70 text-sm">Select Age</p>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-white">{form.age}</span>
              <span className="text-white/50 text-sm">years</span>
            </div>
          </div>
          <div className="relative">
            <Slider
              value={[form.age]}
              onValueChange={([value]) => setField('age', value)}
              min={18}
              max={65}
              step={1}
              className="[&_[role=slider]]:bg-gradient-to-r [&_[role=slider]]:from-purple-500 [&_[role=slider]]:to-pink-500 [&_[role=slider]]:border-0 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-purple-500/30 [&_[data-orientation=horizontal]]:bg-white/10 [&_[data-orientation=horizontal]>[data-orientation=horizontal]]:bg-gradient-to-r [&_[data-orientation=horizontal]>[data-orientation=horizontal]]:from-purple-500 [&_[data-orientation=horizontal]>[data-orientation=horizontal]]:to-pink-500"
            />
          </div>
          <div className="mt-3 flex justify-between text-xs text-white/40">
            <span>18</span>
            <span>65</span>
          </div>
        </div>
      </div>
    </div>
  );
}
