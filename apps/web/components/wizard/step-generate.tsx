"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useCharacterWizardStore, useInfluencerStore } from "@ryla/business";
import { Button, Switch, Label } from "@ryla/ui";
import type { AIInfluencer } from "@ryla/shared";

/**
 * Step 6: Generate
 * Preview settings and create the AI influencer
 */
export function StepGenerate() {
  const router = useRouter();
  const form = useCharacterWizardStore((s) => s.form);
  const setField = useCharacterWizardStore((s) => s.setField);
  const setStatus = useCharacterWizardStore((s) => s.setStatus);
  const setCharacterId = useCharacterWizardStore((s) => s.setCharacterId);
  const resetForm = useCharacterWizardStore((s) => s.resetForm);
  const addInfluencer = useInfluencerStore((s) => s.addInfluencer);

  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setStatus("generating");

    // Simulate generation delay
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Create new influencer
    const newId = `influencer-${Date.now()}`;
    const handle = `@${form.name.toLowerCase().replace(/\s+/g, ".")}`;

    const newInfluencer: AIInfluencer = {
      id: newId,
      name: form.name || "Unnamed",
      handle,
      bio: form.bio || "New AI influencer ✨",
      avatar: "", // Would be filled by actual generation
      gender: form.gender || "female",
      style: form.style || "realistic",
      ethnicity: form.ethnicity || "caucasian",
      age: form.age,
      hairStyle: form.hairStyle || "long-straight",
      hairColor: form.hairColor || "brown",
      eyeColor: form.eyeColor || "brown",
      bodyType: form.bodyType || "slim",
      breastSize: form.breastSize || undefined,
      archetype: form.archetype || "girl-next-door",
      personalityTraits: form.personalityTraits.length > 0 ? form.personalityTraits : ["friendly"],
      outfit: form.outfit || "casual",
      nsfwEnabled: form.nsfwEnabled,
      postCount: 0,
      imageCount: 0,
      likedCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    addInfluencer(newInfluencer);
    setCharacterId(newId);
    setStatus("completed");
    resetForm();

    // Navigate to the new influencer's studio
    router.push(`/influencer/${newId}/studio`);
  };

  // Build summary
  const summary = [
    { label: "Gender", value: form.gender },
    { label: "Style", value: form.style },
    { label: "Ethnicity", value: form.ethnicity },
    { label: "Age", value: form.age },
    { label: "Hair", value: `${form.hairColor} ${form.hairStyle}` },
    { label: "Eyes", value: form.eyeColor },
    { label: "Body", value: form.bodyType },
    { label: "Outfit", value: form.outfit },
    { label: "Archetype", value: form.archetype },
  ].filter((item) => item.value);

  return (
    <div className="space-y-6">
      {/* Name display */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">
          {form.name || "Your AI Influencer"}
        </h2>
        {form.bio && <p className="mt-1 text-sm text-white/60">{form.bio}</p>}
        {form.personalityTraits.length > 0 && (
          <div className="mt-2 flex flex-wrap justify-center gap-1">
            {form.personalityTraits.map((trait) => (
              <span
                key={trait}
                className="rounded-full bg-[#b99cff]/20 px-2 py-0.5 text-xs text-[#b99cff] capitalize"
              >
                {trait}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <h3 className="mb-3 text-sm font-medium text-white">Summary</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {summary.map((item) => (
            <div key={item.label}>
              <span className="text-white/40">{item.label}:</span>{" "}
              <span className="text-white capitalize">
                {String(item.value).replace(/-/g, " ")}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Generation Settings */}
      <div className="rounded-lg border border-white/10 bg-white/5 p-4">
        <h3 className="mb-4 text-sm font-medium text-white">Generation Settings</h3>

        <div className="space-y-4">
          {/* Aspect Ratio */}
          <div>
            <Label className="mb-2 block text-xs text-white/60">Aspect Ratio</Label>
            <div className="flex gap-2">
              {(["1:1", "9:16", "2:3"] as const).map((ratio) => (
                <button
                  key={ratio}
                  onClick={() => setField("aspectRatio", ratio)}
                  className={`flex-1 rounded border px-3 py-2 text-center text-sm transition-all ${
                    form.aspectRatio === ratio
                      ? "border-[#b99cff] bg-[#b99cff]/20 text-white"
                      : "border-white/10 bg-white/5 text-white/60"
                  }`}
                >
                  {ratio}
                </button>
              ))}
            </div>
          </div>

          {/* Quality Mode */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">HQ Mode</Label>
              <p className="text-xs text-white/40">Higher quality, uses more credits</p>
            </div>
            <Switch
              checked={form.qualityMode === "hq"}
              onCheckedChange={(checked) =>
                setField("qualityMode", checked ? "hq" : "draft")
              }
            />
          </div>

          {/* NSFW */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">18+ Content</Label>
              <p className="text-xs text-white/40">Enable adult content generation</p>
            </div>
            <Switch
              checked={form.nsfwEnabled}
              onCheckedChange={(checked) => setField("nsfwEnabled", checked)}
            />
          </div>
        </div>
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full bg-gradient-to-r from-[#d5b9ff] to-[#b99cff] py-6 text-lg font-semibold"
      >
        {isGenerating ? (
          <>
            <svg
              className="mr-2 h-5 w-5 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Creating Your AI Influencer...
          </>
        ) : (
          <>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="mr-2 h-5 w-5"
            >
              <path d="M15.98 1.804a1 1 0 00-1.96 0l-.24 1.192a1 1 0 01-.784.785l-1.192.238a1 1 0 000 1.962l1.192.238a1 1 0 01.785.785l.238 1.192a1 1 0 001.962 0l.238-1.192a1 1 0 01.785-.785l1.192-.238a1 1 0 000-1.962l-1.192-.238a1 1 0 01-.785-.785l-.238-1.192zM6.949 5.684a1 1 0 00-1.898 0l-.683 2.051a1 1 0 01-.633.633l-2.051.683a1 1 0 000 1.898l2.051.684a1 1 0 01.633.632l.683 2.051a1 1 0 001.898 0l.683-2.051a1 1 0 01.633-.633l2.051-.683a1 1 0 000-1.898l-2.051-.683a1 1 0 01-.633-.633L6.95 5.684zM13.949 13.684a1 1 0 00-1.898 0l-.184.551a1 1 0 01-.632.633l-.551.183a1 1 0 000 1.898l.551.183a1 1 0 01.633.633l.183.551a1 1 0 001.898 0l.184-.551a1 1 0 01.632-.633l.551-.183a1 1 0 000-1.898l-.551-.184a1 1 0 01-.633-.632l-.183-.551z" />
            </svg>
            Create AI Influencer (5 credits)
          </>
        )}
      </Button>
    </div>
  );
}

