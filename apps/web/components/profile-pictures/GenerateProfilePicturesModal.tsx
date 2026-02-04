'use client';

import * as React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@ryla/ui';
import { ProfilePictureSetSelector } from '../wizard/profile-picture-set-selector/ProfilePictureSetSelector';
import { FEATURE_CREDITS } from '@ryla/shared';
import { RylaButton } from '@ryla/ui';
import { Images, Sparkles } from 'lucide-react';
import { useCredits } from '../../lib/hooks/use-credits';
import { ZeroCreditsModal } from '../credits';
import { useSubscription } from '../../lib/hooks/use-subscription';
import type { AIInfluencer } from '@ryla/shared';

const PROFILE_SET_CREDITS = FEATURE_CREDITS.profile_set_fast.credits; // 120 credits
const NSFW_EXTRA_CREDITS = 50; // Extra credits for NSFW

interface GenerateProfilePicturesModalProps {
  isOpen: boolean;
  onClose: () => void;
  influencer: AIInfluencer;
  onGenerate: (setId: 'classic-influencer' | 'professional-model' | 'natural-beauty', nsfwEnabled: boolean) => Promise<void>;
}

export function GenerateProfilePicturesModal({
  isOpen,
  onClose,
  influencer,
  onGenerate,
}: GenerateProfilePicturesModalProps) {
  const [selectedSetId, setSelectedSetId] = React.useState<'classic-influencer' | 'professional-model' | 'natural-beauty' | null>('classic-influencer');
  const [nsfwEnabled, setNsfwEnabled] = React.useState(influencer.nsfwEnabled || false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [showCreditModal, setShowCreditModal] = React.useState(false);
  const { isPro } = useSubscription();
  const { balance, isLoading: isLoadingCredits, refetch: _refetchCredits } = useCredits();

  // Calculate credit cost
  const profileSetCost = selectedSetId ? PROFILE_SET_CREDITS : 0;
  const nsfwExtraCost = selectedSetId && nsfwEnabled ? NSFW_EXTRA_CREDITS : 0;
  const creditCost = profileSetCost + nsfwExtraCost;
  const hasEnoughCredits = balance >= creditCost;

  const handleGenerate = async () => {
    if (!selectedSetId) {
      return;
    }

    if (!hasEnoughCredits) {
      setShowCreditModal(true);
      return;
    }

    setIsGenerating(true);
    try {
      await onGenerate(selectedSetId, nsfwEnabled);
      // Close the modal after generation starts successfully
      onClose();
    } catch (error) {
      console.error('Failed to generate profile pictures:', error);
      // Show error to user
      alert(error instanceof Error ? error.message : 'Failed to generate profile pictures');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleClose = () => {
    if (!isGenerating) {
      onClose();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-[#121214] border-white/10">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                <Images className="h-4 w-4 text-purple-400" />
              </div>
              Generate Profile Pictures
            </DialogTitle>
            <DialogDescription className="text-white/60">
              Choose a style theme for your character's profile pictures. Each set generates 7-10 unique shots in different scenes.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            {/* Profile Picture Set Selection */}
            <div className="bg-gradient-to-br from-white/[0.06] to-white/[0.02] border border-white/10 rounded-2xl p-5 shadow-lg backdrop-blur-sm">
              <ProfilePictureSetSelector
                selectedSetId={selectedSetId}
                onSelect={setSelectedSetId}
                creditCost={PROFILE_SET_CREDITS}
              />
            </div>

            {/* NSFW Toggle - Only show for Pro users */}
            {isPro && (
              <div className="mt-4 p-4 rounded-xl border-2 border-white/10 bg-white/[0.03] transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white font-medium">Adult Content</span>
                      <span className="px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 text-xs font-medium">
                        +{NSFW_EXTRA_CREDITS} credits
                      </span>
                    </div>
                    <p className="text-white/50 text-sm">
                      Include 3 additional NSFW profile pictures
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNsfwEnabled(!nsfwEnabled)}
                    disabled={isGenerating}
                    className={`
                      w-12 h-6 rounded-full transition-all duration-200 flex items-center flex-shrink-0
                      ${nsfwEnabled ? 'bg-pink-500' : 'bg-white/20'}
                      ${isGenerating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    <div
                      className={`
                        w-5 h-5 rounded-full bg-white transition-transform duration-200 shadow-md
                        ${nsfwEnabled ? 'translate-x-6' : 'translate-x-0.5'}
                      `}
                    />
                  </button>
                </div>
              </div>
            )}

            {/* Credit Summary */}
            <div className="mt-6 p-4 rounded-xl bg-white/[0.03] border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60 text-sm">Profile Set</span>
                <span className="text-white font-medium">
                  {selectedSetId ? `${PROFILE_SET_CREDITS} credits` : '0 credits'}
                </span>
              </div>
              {selectedSetId && nsfwEnabled && (
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white/60 text-sm">NSFW Addon</span>
                  <span className="text-white font-medium">{NSFW_EXTRA_CREDITS} credits</span>
                </div>
              )}
              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <span className="text-white font-semibold">Total Cost</span>
                <span className={`font-bold ${hasEnoughCredits ? 'text-white' : 'text-red-400'}`}>
                  {creditCost} credits
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-white/60 text-sm">Your Balance</span>
                <span className={`text-sm font-medium ${hasEnoughCredits ? 'text-white' : 'text-red-400'}`}>
                  {isLoadingCredits ? 'Loading...' : `${balance} credits`}
                </span>
              </div>
            </div>

            {/* Generate Button */}
            <div className="mt-6">
              <RylaButton
                onClick={handleGenerate}
                disabled={!selectedSetId || isGenerating || isLoadingCredits}
                variant="gradient"
                size="default"
                className="w-full"
              >
                {isGenerating ? (
                  <>
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Profile Pictures
                  </>
                )}
              </RylaButton>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Zero Credits Modal */}
      <ZeroCreditsModal
        isOpen={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        creditsNeeded={creditCost}
        currentBalance={balance}
      />
    </>
  );
}
