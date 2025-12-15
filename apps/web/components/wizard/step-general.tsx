"use client";

import * as React from "react";
import { useCharacterWizardStore } from "@ryla/business";
import { OptionCard, Slider, Label } from "@ryla/ui";
import { ETHNICITY_OPTIONS } from "@ryla/shared";

/**
 * Step 2: General Settings
 * Choose ethnicity and age
 */
export function StepGeneral() {
  const form = useCharacterWizardStore((s) => s.form);
  const setField = useCharacterWizardStore((s) => s.setField);

  return (
    <div className="space-y-8">
      {/* Ethnicity Selection */}
      <div>
        <h2 className="mb-2 text-lg font-semibold text-white">Select Ethnicity</h2>
        <p className="mb-4 text-sm text-white/60">
          Choose your AI influencer&apos;s appearance
        </p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {ETHNICITY_OPTIONS.map((option) => (
            <OptionCard
              key={option.value}
              variant="default"
              emoji={option.emoji}
              label={option.label}
              selected={form.ethnicity === option.value}
              onSelect={() => setField("ethnicity", option.value)}
              size="sm"
            />
          ))}
        </div>
      </div>

      {/* Age Selection */}
      <div>
        <h2 className="mb-2 text-lg font-semibold text-white">Select Age</h2>
        <p className="mb-4 text-sm text-white/60">
          Set your AI influencer&apos;s age (18-65)
        </p>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="mb-3 flex items-center justify-between">
            <Label className="text-white/60">Age</Label>
            <span className="text-2xl font-bold text-white">{form.age}</span>
          </div>
          <Slider
            value={[form.age]}
            onValueChange={([value]) => setField("age", value)}
            min={18}
            max={65}
            step={1}
            className="[&_[role=slider]]:bg-[#b99cff] [&_[role=slider]]:border-[#b99cff]"
          />
          <div className="mt-2 flex justify-between text-xs text-white/40">
            <span>18</span>
            <span>65</span>
          </div>
        </div>
      </div>
    </div>
  );
}

