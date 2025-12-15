"use client";

import * as React from "react";
import { useCharacterWizardStore } from "@ryla/business";
import { OptionCard } from "@ryla/ui";
import { BODY_TYPE_OPTIONS, BREAST_SIZE_OPTIONS } from "@ryla/shared";

/**
 * Step 4: Body Type
 * Choose body type and breast size (female only)
 */
export function StepBody() {
  const form = useCharacterWizardStore((s) => s.form);
  const setField = useCharacterWizardStore((s) => s.setField);

  const isFemale = form.gender === "female";

  // Filter body types by gender
  const filteredBodyTypes = BODY_TYPE_OPTIONS.filter(
    (option) => !option.gender || option.gender === form.gender
  );

  return (
    <div className="space-y-8">
      {/* Body Type */}
      <div>
        <h2 className="mb-2 text-lg font-semibold text-white">Body Type</h2>
        <p className="mb-4 text-sm text-white/60">
          Choose your AI influencer&apos;s body type
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filteredBodyTypes.map((option) => (
            <OptionCard
              key={option.value}
              variant="default"
              emoji={option.emoji}
              label={option.label}
              selected={form.bodyType === option.value}
              onSelect={() => setField("bodyType", option.value)}
            />
          ))}
        </div>
      </div>

      {/* Breast Size (Female only) */}
      {isFemale && (
        <div>
          <h2 className="mb-2 text-lg font-semibold text-white">Breast Size</h2>
          <p className="mb-4 text-sm text-white/60">
            Select breast size
          </p>
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
            {BREAST_SIZE_OPTIONS.map((option) => (
              <OptionCard
                key={option.value}
                variant="default"
                emoji={option.emoji}
                label={option.label}
                selected={form.breastSize === option.value}
                onSelect={() => setField("breastSize", option.value)}
                size="sm"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

