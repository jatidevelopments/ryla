"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter, notFound } from "next/navigation";
import { useInfluencer, useInfluencerStore } from "@ryla/business";
import { PageContainer, Button } from "@ryla/ui";
import { StudioPanel, DEFAULT_STUDIO_SETTINGS, StudioSettings } from "../../../../components/studio-panel";
import type { Post } from "@ryla/shared";

// Simulated generation delay (ms)
const GENERATION_DELAY = 3000;

export default function StudioPage() {
  const params = useParams();
  const router = useRouter();
  const influencerId = params.id as string;
  
  const influencer = useInfluencer(influencerId);
  const addPost = useInfluencerStore((state) => state.addPost);
  
  const [settings, setSettings] = React.useState<StudioSettings>(DEFAULT_STUDIO_SETTINGS);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [generatedPost, setGeneratedPost] = React.useState<Post | null>(null);
  const [showCaptionPicker, setShowCaptionPicker] = React.useState(false);
  const [caption, setCaption] = React.useState("");

  if (!influencer) {
    notFound();
  }

  const handleSettingsChange = (newSettings: Partial<StudioSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedPost(null);

    // Simulate generation
    await new Promise((resolve) => setTimeout(resolve, GENERATION_DELAY));

    // Create mock post
    const newPost: Post = {
      id: `post-${Date.now()}`,
      influencerId,
      imageUrl: "", // Would be filled by actual generation
      caption: "",
      isLiked: false,
      scene: settings.scene,
      environment: settings.environment,
      outfit: settings.outfit || influencer.outfit,
      aspectRatio: settings.aspectRatio,
      createdAt: new Date().toISOString(),
    };

    // Generate mock caption
    const mockCaptions = [
      `${settings.scene === 'morning-vibes' ? 'Good morning! ☀️' : ''} Feeling amazing today ✨`,
      `Just another day being fabulous 💋`,
      `Who needs a filter when you have this lighting? 📸`,
      `Living my best life 🌟`,
      `Confidence is my best accessory 💅`,
    ];
    const generatedCaption = mockCaptions[Math.floor(Math.random() * mockCaptions.length)];

    setGeneratedPost(newPost);
    setCaption(generatedCaption);
    setIsGenerating(false);
    setShowCaptionPicker(true);
  };

  const handleSavePost = () => {
    if (generatedPost) {
      const postWithCaption: Post = {
        ...generatedPost,
        caption,
      };
      addPost(postWithCaption);
      router.push(`/influencer/${influencerId}`);
    }
  };

  const handleDiscard = () => {
    setGeneratedPost(null);
    setShowCaptionPicker(false);
    setCaption("");
  };

  // Credit cost calculation
  const creditCost = settings.qualityMode === 'hq' ? 10 : 5;

  return (
    <PageContainer maxWidth="md">
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/influencer/${influencerId}`}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
              clipRule="evenodd"
            />
          </svg>
          Back to {influencer.name}
        </Link>

        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative h-12 w-12 overflow-hidden rounded-full border border-[#b99cff]">
            {influencer.avatar ? (
              <Image
                src={influencer.avatar}
                alt={influencer.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#d5b9ff] to-[#b99cff] text-xl">
                👤
              </div>
            )}
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Content Studio</h1>
            <p className="text-sm text-white/60">Creating for {influencer.name}</p>
          </div>
        </div>
      </div>

      {/* Caption Picker Modal */}
      {showCaptionPicker && generatedPost && (
        <div className="mb-6 rounded-xl border border-[#b99cff]/50 bg-[#1a1a1f] p-4">
          <h3 className="mb-3 text-sm font-medium text-white">
            ✨ Content Generated! Review your caption:
          </h3>
          
          {/* Preview */}
          <div className="mb-4 flex gap-4">
            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#d5b9ff]/20 to-[#b99cff]/20 text-white/30">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="currentColor"
                  className="h-8 w-8"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
                  />
                </svg>
              </div>
            </div>
            
            <div className="flex-1">
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="h-full w-full resize-none rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white placeholder-white/40 focus:border-[#b99cff] focus:outline-none"
                placeholder="Edit your caption..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              onClick={handleSavePost}
              className="flex-1 bg-gradient-to-r from-[#d5b9ff] to-[#b99cff]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="mr-1.5 h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                  clipRule="evenodd"
                />
              </svg>
              Save Post
            </Button>
            <Button onClick={handleDiscard} variant="outline">
              Discard
            </Button>
          </div>
        </div>
      )}

      {/* Generating State */}
      {isGenerating && (
        <div className="mb-6 flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 py-12">
          <div className="mb-4 h-16 w-16 animate-pulse rounded-full bg-gradient-to-br from-[#d5b9ff] to-[#b99cff]" />
          <p className="text-lg font-medium text-white">Generating content...</p>
          <p className="text-sm text-white/60">This may take a few seconds</p>
        </div>
      )}

      {/* Studio Panel */}
      {!showCaptionPicker && !isGenerating && (
        <StudioPanel
          settings={settings}
          onSettingsChange={handleSettingsChange}
          onGenerate={handleGenerate}
          isGenerating={isGenerating}
          creditCost={creditCost}
        />
      )}
    </PageContainer>
  );
}

