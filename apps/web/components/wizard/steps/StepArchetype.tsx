'use client';

import * as React from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { ARCHETYPE_OPTIONS } from '@ryla/shared';
import { WizardImageCard } from '../WizardImageCard';
import { getArchetypeImage } from '../../../lib/utils/get-influencer-image';

/**
 * Step: Archetype Selection
 * User selects their influencer's archetype/persona
 * Uses ethnicity-specific images when available
 */
export function StepArchetype() {
  const form = useCharacterWizardStore((s) => s.form);
  const setField = useCharacterWizardStore((s) => s.setField);

  return (
    <div className="flex flex-col items-center w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-white/60 text-sm font-medium mb-2">Personality</p>
        <h1 className="text-white text-2xl font-bold">Archetype</h1>
      </div>

      <div className="w-full">
        <section>
          <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
            <p className="text-white/70 text-sm mb-4 font-medium">
              Choose your influencer&apos;s persona
            </p>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ARCHETYPE_OPTIONS.map((option) => {
                const archetypeImage = form.ethnicity
                  ? getArchetypeImage(option.id, form.ethnicity)
                  : null;
                return (
                  <WizardImageCard
                    key={option.id}
                    image={{
                      src: archetypeImage || '',
                      alt: option.label,
                      name: option.label,
                    }}
                    selected={form.archetype === option.id}
                    onSelect={() => setField('archetype', option.id)}
                    fallbackEmoji={option.emoji}
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
