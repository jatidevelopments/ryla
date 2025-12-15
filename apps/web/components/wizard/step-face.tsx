"use client";

import * as React from "react";
import { useCharacterWizardStore } from "@ryla/business";
import { OptionCard } from "@ryla/ui";
import { HAIR_STYLE_OPTIONS, HAIR_COLOR_OPTIONS, EYE_COLOR_OPTIONS } from "@ryla/shared";

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
    <div className="space-y-8">
      {/* Hair Style */}
      <div>
        <h2 className="mb-2 text-lg font-semibold text-white">Hair Style</h2>
        <p className="mb-4 text-sm text-white/60">
          Choose your AI influencer&apos;s hairstyle
        </p>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {filteredHairStyles.map((option) => (
            <OptionCard
              key={option.value}
              variant="default"
              emoji={option.emoji}
              label={option.label}
              selected={form.hairStyle === option.value}
              onSelect={() => setField("hairStyle", option.value)}
              size="sm"
            />
          ))}
        </div>
      </div>

      {/* Hair Color */}
      <div>
        <h2 className="mb-2 text-lg font-semibold text-white">Hair Color</h2>
        <p className="mb-4 text-sm text-white/60">
          Select hair color
        </p>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {HAIR_COLOR_OPTIONS.map((option) => (
            <OptionCard
              key={option.value}
              variant="default"
              emoji={option.emoji}
              label={option.label}
              selected={form.hairColor === option.value}
              onSelect={() => setField("hairColor", option.value)}
              size="sm"
            />
          ))}
        </div>
      </div>

      {/* Eye Color */}
      <div>
        <h2 className="mb-2 text-lg font-semibold text-white">Eye Color</h2>
        <p className="mb-4 text-sm text-white/60">
          Select eye color
        </p>
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {EYE_COLOR_OPTIONS.map((option) => (
            <OptionCard
              key={option.value}
              variant="default"
              emoji={option.emoji}
              label={option.label}
              selected={form.eyeColor === option.value}
              onSelect={() => setField("eyeColor", option.value)}
              size="sm"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

