"use client";

import * as React from "react";
import { useCharacterWizardStore } from "@ryla/business";
import { OptionCard, Input, Textarea, Label } from "@ryla/ui";
import { OUTFIT_OPTIONS, ARCHETYPE_OPTIONS, PERSONALITY_TRAIT_OPTIONS } from "@ryla/shared";

/**
 * Step 5: Identity
 * Set name, outfit, archetype, personality traits, and bio
 */
export function StepIdentity() {
  const form = useCharacterWizardStore((s) => s.form);
  const setField = useCharacterWizardStore((s) => s.setField);

  const toggleTrait = (trait: string) => {
    const current = form.personalityTraits;
    if (current.includes(trait)) {
      setField(
        "personalityTraits",
        current.filter((t) => t !== trait)
      );
    } else if (current.length < 3) {
      setField("personalityTraits", [...current, trait]);
    }
  };

  return (
    <div className="space-y-8">
      {/* Name */}
      <div>
        <Label htmlFor="name" className="mb-2 block text-lg font-semibold text-white">
          Name
        </Label>
        <p className="mb-3 text-sm text-white/60">
          Give your AI influencer a name
        </p>
        <Input
          id="name"
          value={form.name}
          onChange={(e) => setField("name", e.target.value)}
          placeholder="e.g., Luna Martinez"
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
        />
      </div>

      {/* Outfit */}
      <div>
        <h2 className="mb-2 text-lg font-semibold text-white">Outfit</h2>
        <p className="mb-4 text-sm text-white/60">
          Choose a default outfit style
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {OUTFIT_OPTIONS.slice(0, 6).map((option) => (
            <OptionCard
              key={option.value}
              variant="default"
              emoji={option.emoji}
              label={option.label}
              selected={form.outfit === option.value}
              onSelect={() => setField("outfit", option.value)}
              size="sm"
            />
          ))}
        </div>
      </div>

      {/* Archetype */}
      <div>
        <h2 className="mb-2 text-lg font-semibold text-white">Archetype</h2>
        <p className="mb-4 text-sm text-white/60">
          Select a persona archetype (optional)
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {ARCHETYPE_OPTIONS.slice(0, 6).map((option) => (
            <OptionCard
              key={option.value}
              variant="default"
              emoji={option.emoji}
              label={option.label}
              selected={form.archetype === option.value}
              onSelect={() => setField("archetype", option.value)}
              size="sm"
            />
          ))}
        </div>
      </div>

      {/* Personality Traits */}
      <div>
        <h2 className="mb-2 text-lg font-semibold text-white">
          Personality Traits
          <span className="ml-2 text-sm font-normal text-white/40">
            (Select up to 3)
          </span>
        </h2>
        <p className="mb-4 text-sm text-white/60">
          Define your AI influencer&apos;s personality
        </p>
        <div className="flex flex-wrap gap-2">
          {PERSONALITY_TRAIT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => toggleTrait(option.value)}
              className={`rounded-full border px-3 py-1.5 text-sm transition-all ${
                form.personalityTraits.includes(option.value)
                  ? "border-[#b99cff] bg-[#b99cff]/20 text-white"
                  : "border-white/10 bg-white/5 text-white/60 hover:border-white/30"
              }`}
            >
              {option.emoji} {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bio */}
      <div>
        <Label htmlFor="bio" className="mb-2 block text-lg font-semibold text-white">
          Bio
          <span className="ml-2 text-sm font-normal text-white/40">(optional)</span>
        </Label>
        <p className="mb-3 text-sm text-white/60">
          Write a short bio for your AI influencer
        </p>
        <Textarea
          id="bio"
          value={form.bio}
          onChange={(e) => setField("bio", e.target.value)}
          placeholder="e.g., Just a small-town girl with big dreams ✨"
          className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[80px]"
        />
      </div>
    </div>
  );
}

