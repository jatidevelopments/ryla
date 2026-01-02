'use client';

import * as React from 'react';
import Image from 'next/image';
import type { AIInfluencer } from '@ryla/shared';
import { cn } from '@ryla/ui';
import { toast } from 'sonner';
import { getProfilePictureSet } from '@ryla/business';
import {
  useProfilePictures,
  useProfilePicturesStore,
} from '@ryla/business';
import { generateProfilePictureSetAndWait } from '../../lib/api/character';

export function ProfilePicturesPanel({ influencer }: { influencer: AIInfluencer }) {
  // Guard against undefined influencer
  if (!influencer) {
    return null;
  }
  
  const state = useProfilePictures(influencer.id);
  const ensure = useProfilePicturesStore((s) => s.ensure);
  const start = useProfilePicturesStore((s) => s.start);
  const upsertImage = useProfilePicturesStore((s) => s.upsertImage);
  const complete = useProfilePicturesStore((s) => s.complete);
  const fail = useProfilePicturesStore((s) => s.fail);

  // Use setId from influencer (set during wizard) or from state, or null to skip
  const setId = influencer.profilePictureSetId ?? state?.setId ?? null;
  const set = setId ? getProfilePictureSet(setId) : null;
  const expected = set
    ? (set.positions.length + (influencer.nsfwEnabled ? 3 : 0))
    : 0;

  React.useEffect(() => {
    if (setId) {
      ensure(influencer.id, setId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ensure, influencer.id, setId]);

  const maybeKickoff = React.useCallback(async () => {
    // Skip if no setId was selected
    if (!setId) return;
    
    // Only kickoff if we have no images yet and we aren't already generating/completed.
    const status = state?.status ?? 'idle';
    const currentCount = state?.images?.length ?? 0;
    if (currentCount > 0) return;
    if (status === 'generating' || status === 'completed') return;

    if (!influencer.avatar) {
      fail(influencer.id, 'Missing base image URL for profile generation');
      return;
    }

    toast.message('Generating profile pictures in the background…');

    const { jobIds } = await generateProfilePictureSetAndWait(
      {
        baseImageUrl: influencer.avatar,
        characterId: influencer.id,
        setId,
        nsfwEnabled: influencer.nsfwEnabled,
        generationMode: 'consistent',
      },
      (jobStatus, error) => {
        if (jobStatus === 'failed') {
          const msg = error || 'Profile picture generation failed';
          fail(influencer.id, msg);
          toast.error(msg);
        }
        if (jobStatus === 'completed') {
          complete(influencer.id);
          toast.success('Profile pictures are ready');
        }
      },
      (image, positionId, positionName) => {
        upsertImage(influencer.id, {
          id: image.id,
          url: image.url,
          thumbnailUrl: image.thumbnailUrl,
          positionId,
          positionName,
          prompt: image.variation,
          isNSFW: (image as any).isNSFW,
        });
      }
    );

    start(influencer.id, { setId, jobIds });
  }, [
    complete,
    expected,
    fail,
    influencer.avatar,
    influencer.id,
    influencer.nsfwEnabled,
    setId,
    start,
    state?.images?.length,
    state?.status,
    upsertImage,
  ]);

  React.useEffect(() => {
    if (setId) {
      maybeKickoff().catch((e) => {
        const msg = e instanceof Error ? e.message : 'Failed to start profile generation';
        fail(influencer.id, msg);
        toast.error(msg);
      });
    }
  }, [fail, influencer.id, maybeKickoff, setId]);

  const status = state?.status ?? 'idle';
  const images = state?.images ?? [];
  const lastError = state?.lastError;

  // Don't render if no setId was selected
  if (!setId) {
    return (
      <section className="mt-6 px-6">
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-subtle)] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-[var(--text-primary)]">
                Profile Pictures
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                No profile picture set selected. You can generate one later from the Studio.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-6 px-6">
      <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-subtle)] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-[var(--text-primary)]">
              Profile Pictures
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              We generate these in the background so you can keep using the app.
            </p>
          </div>

          <div className="text-right">
            <p className="text-xs text-[var(--text-muted)]">
              {images.length}/{expected}
            </p>
            <p
              className={cn(
                'text-xs mt-1',
                status === 'completed'
                  ? 'text-emerald-400'
                  : status === 'failed'
                  ? 'text-red-400'
                  : status === 'generating'
                  ? 'text-[var(--purple-400)]'
                  : 'text-[var(--text-muted)]'
              )}
            >
              {status === 'completed'
                ? 'Complete'
                : status === 'failed'
                ? 'Failed'
                : status === 'generating'
                ? 'Generating…'
                : 'Queued'}
            </p>
          </div>
        </div>

        {status === 'failed' && lastError && (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3">
            <p className="text-xs text-red-200">{lastError}</p>
            <p className="text-[11px] text-red-200/80 mt-1">
              Consistent mode is stricter. We’ll add a “fast fallback” button next.
            </p>
          </div>
        )}

        {/* Grid */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          {images.slice(0, 8).map((img) => (
            <div
              key={`${img.positionId}-${img.isNSFW ? 'nsfw' : 'sfw'}`}
              className="relative aspect-square overflow-hidden rounded-xl border border-white/5 bg-black/20"
              title={img.positionName}
            >
              <Image src={img.url} alt={img.positionName} fill className="object-cover" />
            </div>
          ))}
          {/* placeholders */}
          {images.length < Math.min(expected, 8) &&
            Array.from({ length: Math.min(expected, 8) - images.length }).map((_, idx) => (
              <div
                key={`ph-${idx}`}
                className="relative aspect-square overflow-hidden rounded-xl border border-white/5 bg-white/5 animate-pulse"
              />
            ))}
        </div>
      </div>
    </section>
  );
}


