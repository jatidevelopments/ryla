"use client";

import * as React from "react";
import { useCharacterWizardStore } from "@ryla/business";
import { OptionCard } from "@ryla/ui";

/**
 * Step 1: Style Selection
 * Choose gender and style (realistic/anime)
 */
export function StepStyle() {
  const form = useCharacterWizardStore((s) => s.form);
  const setField = useCharacterWizardStore((s) => s.setField);

  return (
    <div className="space-y-8">
      {/* Gender Selection */}
      <div>
        <h2 className="mb-2 text-lg font-semibold text-white">Select Gender</h2>
        <p className="mb-4 text-sm text-white/60">
          Choose your AI influencer&apos;s gender
        </p>
        <div className="grid grid-cols-2 gap-3">
          <OptionCard
            variant="default"
            emoji="👩"
            label="Female"
            selected={form.gender === "female"}
            onSelect={() => setField("gender", "female")}
          />
          <OptionCard
            variant="default"
            emoji="👨"
            label="Male"
            selected={form.gender === "male"}
            onSelect={() => setField("gender", "male")}
          />
        </div>
      </div>

      {/* Style Selection */}
      <div>
        <h2 className="mb-2 text-lg font-semibold text-white">Select Style</h2>
        <p className="mb-4 text-sm text-white/60">
          Choose the visual style for your AI influencer
        </p>
        <div className="grid grid-cols-2 gap-3">
          <OptionCard
            variant="default"
            emoji="📷"
            label="Realistic"
            selected={form.style === "realistic"}
            onSelect={() => setField("style", "realistic")}
          />
          <OptionCard
            variant="default"
            emoji="🎨"
            label="Anime"
            selected={form.style === "anime"}
            onSelect={() => setField("style", "anime")}
          />
        </div>
      </div>
    </div>
  );
}

