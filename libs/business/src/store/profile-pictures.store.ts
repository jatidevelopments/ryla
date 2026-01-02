import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { useShallow } from 'zustand/react/shallow';

export type ProfilePicturesStatus = 'idle' | 'generating' | 'completed' | 'failed';

export interface ProfilePictureImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  positionId: string;
  positionName: string;
  prompt?: string;
  negativePrompt?: string;
  isNSFW?: boolean;
}

export interface ProfilePicturesState {
  byInfluencerId: Record<
    string,
    {
      status: ProfilePicturesStatus;
      setId: 'classic-influencer' | 'professional-model' | 'natural-beauty';
      images: ProfilePictureImage[];
      jobIds?: string[];
      lastError?: string;
      startedAt?: string;
      completedAt?: string;
    }
  >;

  ensure: (
    influencerId: string,
    setId?: 'classic-influencer' | 'professional-model' | 'natural-beauty'
  ) => void;
  start: (
    influencerId: string,
    data: {
      setId: 'classic-influencer' | 'professional-model' | 'natural-beauty';
      jobIds: string[];
    }
  ) => void;
  upsertImage: (influencerId: string, image: ProfilePictureImage) => void;
  complete: (influencerId: string) => void;
  fail: (influencerId: string, error: string) => void;
  reset: (influencerId: string) => void;
}

/**
 * Profile pictures store (per influencer).
 * Persisted so users can navigate away while generation completes.
 */
export const useProfilePicturesStore = create<ProfilePicturesState>()(
  persist(
    immer((set, get) => ({
      byInfluencerId: {},

      ensure: (influencerId, setId = 'classic-influencer') => {
        set((state) => {
          if (!state.byInfluencerId[influencerId]) {
            state.byInfluencerId[influencerId] = {
              status: 'idle',
              setId,
              images: [],
            };
          }
        });
      },

      start: (influencerId, data) => {
        set((state) => {
          state.byInfluencerId[influencerId] = {
            status: 'generating',
            setId: data.setId,
            images: state.byInfluencerId[influencerId]?.images ?? [],
            jobIds: data.jobIds,
            lastError: undefined,
            startedAt: new Date().toISOString(),
            completedAt: undefined,
          };
        });
      },

      upsertImage: (influencerId, image) => {
        set((state) => {
          if (!state.byInfluencerId[influencerId]) {
            state.byInfluencerId[influencerId] = {
              status: 'idle',
              setId: 'classic-influencer',
              images: [],
            };
          }

          const images = state.byInfluencerId[influencerId].images;
          const idx = images.findIndex(
            (i) => i.positionId === image.positionId && i.isNSFW === image.isNSFW
          );

          if (idx === -1) {
            images.push(image);
          } else {
            images[idx] = { ...images[idx], ...image };
          }
        });
      },

      complete: (influencerId) => {
        set((state) => {
          const existing = state.byInfluencerId[influencerId];
          if (!existing) return;
          existing.status = 'completed';
          existing.completedAt = new Date().toISOString();
          existing.lastError = undefined;
        });
      },

      fail: (influencerId, error) => {
        set((state) => {
          const existing = state.byInfluencerId[influencerId];
          if (!existing) return;
          existing.status = 'failed';
          existing.lastError = error;
        });
      },

      reset: (influencerId) => {
        set((state) => {
          delete state.byInfluencerId[influencerId];
        });
      },
    })),
    {
      name: 'ryla-profile-pictures-store',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const useProfilePictures = (influencerId: string) => {
  return useProfilePicturesStore(
    useShallow((s) => s.byInfluencerId[influencerId])
  );
};


