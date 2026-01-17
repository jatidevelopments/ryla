'use client';

import * as React from 'react';
import { useCharacterWizardStore } from '@ryla/business';
import { OUTFIT_OPTIONS } from '@ryla/shared';
import { WizardImageCard } from '../WizardImageCard';

/**
 * Curated outfit selection for wizard - best 6 outfits
 * These are the most popular/fitting for influencer characters
 */
const CURATED_OUTFIT_LABELS = [
  'Casual Streetwear',
  'Athleisure',
  'Bikini',
  'Cocktail Dress',
  'Date Night Glam',
  'Lingerie',
];

/**
 * Step: Default Outfit Selection
 * User selects from 6 curated preset outfits with images
 */
export function StepOutfit() {
  const form = useCharacterWizardStore((s) => s.form);
  const setField = useCharacterWizardStore((s) => s.setField);

  // Get curated outfits from the outfit library
  const curatedOutfits = OUTFIT_OPTIONS.filter((opt) =>
    CURATED_OUTFIT_LABELS.includes(opt.label)
  );

  return (
    <div className="flex flex-col items-center w-full">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-white/60 text-sm font-medium mb-2">Style</p>
        <h1 className="text-white text-2xl font-bold">Default Outfit</h1>
      </div>

      <div className="w-full">
        <section>
          <div className="bg-gradient-to-br from-white/8 to-white/4 border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
            <p className="text-white/70 text-sm mb-4 font-medium">
              Choose the default outfit for your influencer
            </p>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {curatedOutfits.map((option) => {
                const optionValue = option.label
                  .toLowerCase()
                  .replace(/\s+/g, '-');
                return (
                  <WizardImageCard
                    key={optionValue}
                    image={{
                      src: option.thumbnail || '',
                      alt: option.label,
                      name: option.label,
                    }}
                    selected={form.outfit === optionValue}
                    onSelect={() => setField('outfit', optionValue)}
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
