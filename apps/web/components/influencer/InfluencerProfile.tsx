'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { RylaButton, useIsMobile } from '@ryla/ui';
import type { AIInfluencer } from '@ryla/shared';
import { routes } from '@/lib/routes';
import {
  ArrowLeft,
  Sparkles,
  Heart,
  Images,
  LayoutGrid,
  Settings,
  ZoomIn,
  X,
} from 'lucide-react';
import { GenerateProfilePicturesModal } from '../profile-pictures/GenerateProfilePicturesModal';

export interface InfluencerProfileProps {
  influencer: AIInfluencer;
  onGenerateProfilePictures?: (
    setId: 'classic-influencer' | 'professional-model' | 'natural-beauty',
    nsfwEnabled: boolean
  ) => Promise<void>;
  characterProfilePictureSetId?: string | null; // Fallback to check character directly
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function InfluencerProfile({
  influencer,
  onGenerateProfilePictures,
  characterProfilePictureSetId,
}: InfluencerProfileProps) {
  const [imageError, setImageError] = React.useState(false);
  const [showProfilePicturesModal, setShowProfilePicturesModal] =
    React.useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);
  const isMobile = useIsMobile();

  // Guard against undefined influencer
  if (!influencer) {
    return null;
  }

  const hasValidImage = influencer.avatar && !imageError;
  // Show button if profilePictureSetId is null, undefined, or empty string
  // Check both influencer store and character data as fallback
  // Use nullish coalescing to preserve null values
  const profilePictureSetId =
    influencer.profilePictureSetId ?? characterProfilePictureSetId;
  // Button shows when profilePictureSetId is falsy (null, undefined, empty string, or false)
  // More explicit: check if it's a valid non-empty string
  const hasProfilePictures =
    profilePictureSetId !== null &&
    profilePictureSetId !== undefined &&
    profilePictureSetId !== '' &&
    typeof profilePictureSetId === 'string';

  // Debug logging (remove in production)
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[InfluencerProfile] Profile picture check:', {
        influencerProfilePictureSetId: influencer.profilePictureSetId,
        characterProfilePictureSetId,
        profilePictureSetId,
        hasProfilePictures,
        shouldShowButton: !hasProfilePictures,
        type: typeof profilePictureSetId,
        isNull: profilePictureSetId === null,
        isUndefined: profilePictureSetId === undefined,
        isEmptyString: profilePictureSetId === '',
      });
    }
  }, [
    influencer.profilePictureSetId,
    characterProfilePictureSetId,
    profilePictureSetId,
    hasProfilePictures,
  ]);

  return (
    <div className="relative border-b border-[var(--border-default)] overflow-hidden">
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[var(--purple-500)]/5 via-transparent to-[var(--pink-500)]/5" />

      {/* Back navigation */}
      <div className="relative px-6 py-4">
        <Link
          href={routes.dashboard}
          className="group inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {/* Profile header */}
      <div className="relative flex flex-col px-6 pb-8 sm:flex-row sm:items-start sm:justify-between sm:gap-8">
        {/* Left: Avatar and Info */}
        <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left sm:flex-1">
          {/* Avatar with glow effect */}
          <div className="relative mb-5 sm:mb-0 sm:mr-6 shrink-0 group">
            <div className="absolute -inset-1 bg-gradient-to-br from-[var(--purple-500)] to-[var(--pink-500)] rounded-2xl opacity-20 blur-md" />
            <div className="relative h-28 w-28 overflow-hidden rounded-2xl border border-[var(--border-default)] bg-[var(--bg-subtle)] shadow-xl cursor-pointer">
              {hasValidImage ? (
                <>
                  <Image
                    src={influencer.avatar!}
                    alt={influencer.name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    unoptimized
                    onError={() => setImageError(true)}
                  />

                  {/* Mobile: View Full Button */}
                  {isMobile && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsLightboxOpen(true);
                      }}
                      className="absolute bottom-2 right-2 z-30 flex items-center gap-1.5 rounded-lg bg-purple-500/90 hover:bg-purple-500 px-2 py-1 text-white text-[10px] font-medium shadow-lg transition-all active:scale-95 backdrop-blur-sm border border-purple-400/30"
                      aria-label="View full size"
                    >
                      <ZoomIn className="h-3 w-3" />
                      <span>View</span>
                    </button>
                  )}

                  {/* Desktop: Hover hint overlay */}
                  {!isMobile && (
                    <div
                      className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer z-30"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsLightboxOpen(true);
                      }}
                    >
                      <div className="flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1.5 text-white text-xs font-medium">
                        <ZoomIn className="h-3 w-3" />
                        <span>View Full</span>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex h-full items-center justify-center bg-gradient-to-br from-[var(--purple-600)]/80 via-[var(--purple-500)]/60 to-[var(--pink-500)]/70">
                  <span className="text-3xl font-bold text-white/90 tracking-tight">
                    {getInitials(influencer.name)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-1 truncate">
              {influencer.name}
            </h1>
            <p className="text-sm text-[var(--text-muted)] mb-4">
              {influencer.handle}
            </p>

            {/* Tags */}
            <div className="flex flex-wrap justify-center gap-2 sm:justify-start mb-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-[var(--purple-500)]/10 to-[var(--pink-500)]/10 border border-[var(--purple-500)]/20 px-3 py-1.5 text-xs font-medium text-[var(--purple-400)] capitalize">
                <Sparkles className="h-3 w-3" />
                {influencer.archetype.replace(/-/g, ' ')}
              </span>
              {influencer.personalityTraits.slice(0, 3).map((trait) => (
                <span
                  key={trait}
                  className="rounded-full bg-[var(--bg-subtle)] border border-[var(--border-default)] px-3 py-1.5 text-xs text-[var(--text-secondary)] capitalize transition-colors hover:border-[var(--border-hover)]"
                >
                  {trait}
                </span>
              ))}
            </div>

            {/* Bio */}
            {influencer.bio && (
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed max-w-xl">
                {influencer.bio}
              </p>
            )}
          </div>
        </div>

        {/* Right: Stats and Actions */}
        <div className="flex flex-col items-center mt-6 sm:mt-0 sm:items-end sm:min-w-[280px]">
          {/* Stats Card */}
          <div className="flex gap-1 p-1 mb-6 bg-[var(--bg-subtle)] rounded-xl border border-[var(--border-default)]">
            <div className="flex flex-col items-center px-5 py-3 rounded-lg transition-colors hover:bg-[var(--bg-surface)]">
              <div className="flex items-center gap-1.5 text-lg font-semibold text-[var(--text-primary)]">
                <LayoutGrid className="h-4 w-4 text-[var(--purple-400)]" />
                {influencer.postCount}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mt-0.5">
                Posts
              </div>
            </div>
            <div className="w-px bg-[var(--border-default)]" />
            <div className="flex flex-col items-center px-5 py-3 rounded-lg transition-colors hover:bg-[var(--bg-surface)]">
              <div className="flex items-center gap-1.5 text-lg font-semibold text-[var(--text-primary)]">
                <Images className="h-4 w-4 text-[var(--purple-400)]" />
                {influencer.imageCount}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mt-0.5">
                Images
              </div>
            </div>
            <div className="w-px bg-[var(--border-default)]" />
            <div className="flex flex-col items-center px-5 py-3 rounded-lg transition-colors hover:bg-[var(--bg-surface)]">
              <div className="flex items-center gap-1.5 text-lg font-semibold text-[var(--text-primary)]">
                <Heart className="h-4 w-4 text-[var(--pink-400)] fill-[var(--pink-400)]" />
                {influencer.likedCount}
              </div>
              <div className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] mt-0.5">
                Liked
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <RylaButton asChild variant="glassy-outline" size="sm">
              <Link
                href={`/studio?influencer=${influencer.id}`}
                className="gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Generate
              </Link>
            </RylaButton>
            {/* Always show Profile Pictures button - users can regenerate or add new sets anytime */}
            <RylaButton
              variant="glassy-outline"
              size="sm"
              onClick={() => setShowProfilePicturesModal(true)}
              className="gap-2"
            >
              <Images className="h-4 w-4" />
              {hasProfilePictures ? 'Regenerate Profile' : 'Profile Pictures'}
            </RylaButton>
            <RylaButton asChild variant="glassy-outline" size="sm">
              <Link
                href={`/influencer/${influencer.id}/settings`}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </RylaButton>
          </div>
        </div>
      </div>

      {/* Generate Profile Pictures Modal */}
      {onGenerateProfilePictures && (
        <GenerateProfilePicturesModal
          isOpen={showProfilePicturesModal}
          onClose={() => setShowProfilePicturesModal(false)}
          influencer={influencer}
          onGenerate={onGenerateProfilePictures}
        />
      )}

      {/* Avatar Lightbox Modal */}
      {hasValidImage && isLightboxOpen && (
        <div
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setIsLightboxOpen(false)}
            className="absolute top-6 right-6 z-[110] flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white/80 transition-all hover:bg-white/20 hover:text-white active:scale-95"
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Image Container */}
          <div
            className={`relative flex items-center justify-center transition-all duration-500 ${
              isMobile
                ? 'w-full h-full p-4'
                : 'max-w-[90vw] max-h-[85vh] w-full h-[85vh]'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full">
              <Image
                src={influencer.avatar!}
                alt={influencer.name}
                fill
                className="object-contain animate-in zoom-in-95 duration-300"
                priority
                unoptimized
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
